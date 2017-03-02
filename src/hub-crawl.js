import Link from './link';
import LinkedList from './linked-list';
import {
  generateNightmareInstance,
  averageLinksPerMinute,
  clearScreen,
  properElementId,
  properSelector,
  notAnchor,
} from './util';

class HubCrawl {
  constructor(maxWorkers, entry, scope) {
    this.maxWorkers = maxWorkers;
    this.workers = {};
    this.generateWorkers();
    this.availableWorkers = new LinkedList();
    this.generateAvailableWorkers();
    this.entry = entry;
    this.scope = scope || entry;
    this.linkQueue = this.generateLinkQueue();
    this.visitedLinks = {};
    this.brokenLinks = {};
    this.visitedLinkCount = 0;
    this.brokenLinkCount = 0;
    this.averageResponseTime = 0;
    this.generateNightmareInstance = generateNightmareInstance;
    this.averageLinksPerMinute = averageLinksPerMinute;
  }

  generateLinkQueue() {
    const linkQueue = new LinkedList();
    const rootLink = new Link(this.entry, this.entry, 'root');
    linkQueue.enqueue(rootLink);
    return linkQueue;
  }

  generateWorker(number) {
    this.workers[number] = generateNightmareInstance(false);
  }

  generateWorkers() {
    for (let i = 0; i < this.maxWorkers; i += 1) {
      this.generateWorker(i);
    }
  }

  generateAvailableWorkers() {
    for (let i = 0; i < this.maxWorkers; i += 1) {
      this.availableWorkers.enqueue(i);
    }
  }

  tearDownWorkers(...numbers) {
    if (numbers.length === 0) {
      for (let i = 0; i < this.maxWorkers; i += 1) {
        numbers.push(i);
      }
    }
    numbers.forEach((number) => {
      const nightmare = this.workers[number];
      nightmare.end();
      this.workers[number] = null;
    });
  }

  isOutOfScope(url) {
    const urlSlice = url.slice(0, this.scope.length);
    return urlSlice !== this.scope;
  }

  alreadyVisited(url) {
    return !!this.visitedLinks[url];
  }

  addToVisited(url) {
    this.visitedLinks[url] = true;
    this.visitedLinkCount += 1;
  }

  addBrokenLink(link) {
    if (!(this.brokenLinks[link.href] instanceof LinkedList)) {
      this.brokenLinks[link.href] = new LinkedList();
    }
    const currentLinkValue = this.brokenLinks[link.href];
    currentLinkValue.enqueue(link);
    this.brokenLinkCount += 1;
  }

  addToResponseTime(startTime) {
    const now = new Date();
    const newTime = (now - startTime) / 1000;
    const oldResponseSum = this.averageResponseTime * this.visitedLinkCount;
    const newSum = oldResponseSum + newTime;
    const newAverage = newSum / (this.visitedLinkCount + 1);
    this.averageResponseTime = Math.round(newAverage * 100) / 100;
  }

  displayLinkData(startTime) {
    clearScreen();
    console.log(`Hub Crawl has visited ${this.visitedLinkCount} links.`);
    console.log(`${this.linkQueue.length} links remaining.`);
    console.log(`(currently averaging ${this.averageLinksPerMinute(startTime, this.visitedLinkCount)} links per minute)`);
    console.log(`(currently averaging ${this.averageResponseTime} seconds per request)`);
    console.log((`There are currently ${this.brokenLinkCount} broken links.`));
    console.log(`There are currently ${this.maxWorkers - this.availableWorkers.length} workers.`);
  }

  displayErrors() {
    clearScreen();
    if (this.brokenLinkCount <= 1) {
      console.log(`${this.brokenLinkCount} broken link found:`);
    } else {
      console.log(`${this.brokenLinkCount} broken links found:`);
    }
    if (this.brokenLinkCount === 0) return;
    let counter = 1;
    console.log('===== BROKEN LINKS =====');
    Object.keys(this.brokenLinks).forEach((key) => {
      this.brokenLinks[key].forEach((link) => {
        console.log(`------Broken link #${counter}------`);
        console.log('The broken link is a reference to:');
        console.log(link.href);
        console.log('The broken link is referenced at:');
        console.log(link.location);
        console.log('The broken link is referenced with the text:');
        console.log(link.text);
        console.log('--------------------------');
        counter += 1;
      });
    });
    console.log('========================');
  }

  async login(shouldLogin) {
    try {
      if (!shouldLogin) return;
      const nightmare = this.generateNightmareInstance(true);
      return await nightmare
        .goto('https://github.com/login')
        .wait(function () {
          const url = document.URL;
          return url === 'https://github.com/';
        })
        .end();
    } catch (e) {
      return e;
    }
  }

  visitLink(nightmare, link) {
    try {
      const startResponse = new Date();
      // Handle the case where a concurrent process has already visited
      // a link.
      if (this.alreadyVisited(link.href)) {
        return Promise.reject('Already visited link');
      }
      return nightmare
        .goto(link.href)
        .then((res) => {
          this.addToResponseTime(startResponse);
          this.addToVisited(link.href);
          if (res.code >= 400) {
            this.addBrokenLink(link);
          }
          return res;
        });
    } catch (e) {
      return e;
    }
  }

  async scrapeLinks(nightmare, link) {
    try {
      const elementId = properElementId(link.href);
      const selector = properSelector(link.href);
      return await nightmare
        .wait('body')
        .evaluate(async (currentLink, targetId, targetSelector) => {
          const target = document.getElementById(targetId);
          const links = target.querySelectorAll(targetSelector);
          return Array.from(links).map((el) => {
            const href = el.href;
            const location = currentLink.href;
            const text = el.innerHTML;
            const hash = el.hash;
            return { href, location, text, hash };
          });
        }, link, elementId, selector);
    } catch (e) {
      return e;
    }
  }

  async visitAndScrapeLinks(link, workerNumber) {
    try {
      const nightmare = this.workers[workerNumber];
      return await this.visitLink(nightmare, link)
        .then(() => {
          if (!this.isOutOfScope(link.href)) {
            return this.scrapeLinks(nightmare, link)
            .then((links) => {
              const unvisitedLinks = new LinkedList();
              links.forEach((el) => {
                if (!this.visitedLinks[el.href] && notAnchor(el)) {
                  const newLink = new Link(el.href, el.location, el.text);
                  unvisitedLinks.enqueue(newLink);
                }
              });
              return unvisitedLinks;
            })
            .catch(e => Promise.reject(e));
          }
        })
        .catch(e => Promise.reject(e));
    } catch (e) {
      return e;
    }
  }

  async traverseLinks(login) {
    return this.login(login)
      .then(() => (
        new Promise((resolve) => {
          const startTime = new Date();
          const handleWorkers = setInterval(() => {
            if (this.availableWorkers.length > 0 &&
              this.linkQueue.length > 0) {
              const freeWorker = this.availableWorkers.dequeue();
              this.displayLinkData(startTime, freeWorker);
              const currentLink = this.linkQueue.dequeue();
              this.visitAndScrapeLinks(currentLink, freeWorker)
                .then((links) => {
                  this.displayLinkData(startTime, freeWorker);
                  if (!links) {
                    this.availableWorkers.enqueue(freeWorker);
                    return;
                  }
                  links.forEach((link) => {
                    if (!this.alreadyVisited(link.href)) {
                      this.linkQueue.enqueue(link);
                    }
                  });
                  this.availableWorkers.enqueue(freeWorker);
                })
                .catch(() => {
                  this.availableWorkers.enqueue(freeWorker);
                });
            } else if (this.availableWorkers.length === this.maxWorkers &&
              this.linkQueue.length === 0) {
              clearInterval(handleWorkers);
              return resolve();
            }
          }, 50);
        })
      ));
  }

  async traverseAndLogOutput(login) {
    this.traverseLinks(login).then(() => {
      this.displayErrors();
      this.tearDownWorkers();
    });
  }
}

export default HubCrawl;
