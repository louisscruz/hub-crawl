import Link from './link';
import LinkedList from './linked-list';
import {
  generateNightmareInstance,
  averageLinksPerMinute,
} from './util';

class HubCrawl {
  constructor(maxWorkers, entry) {
    this.maxWorkers = maxWorkers;
    this.workers = this.generateWorkers();
    this.availableWorkers = this.generateAvailableWorkers();
    this.entry = entry;
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

  generateWorkers() {
    const workers = {};
    for (let i = 0; i < this.maxWorkers; i += 1) {
      workers[i] = generateNightmareInstance(false);
    }
    return workers;
  }

  generateAvailableWorkers() {
    const availableWorkers = new LinkedList();
    for (let i = 0; i < this.maxWorkers; i += 1) {
      availableWorkers.enqueue(i);
    }
    return availableWorkers;
  }

  isOutOfScope(url) {
    const scope = this.entry;
    const urlSlice = url.slice(0, scope.length);
    return urlSlice !== scope;
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
    process.stdout.write('\u001B[2J\u001B[0;0f');
    console.log(`Visited ${this.visitedLinkCount} links.`);
    console.log(`${this.linkQueue.length} links remaining.`);
    console.log(`(averaging ${this.averageLinksPerMinute(startTime, this.visitedLinkCount)} per minute)`);
    console.log(`(averaging ${this.averageResponseTime} seconds per request)`);
    console.log((`there are currently ${this.brokenLinkCount} broken links`));
    console.log(`there are currently ${this.maxWorkers - this.availableWorkers.length} workers`);
  }

  async login() {
    try {
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

  async visitLink(nightmare, link) {
    try {
      const startResponse = new Date();
      // Handle the case where a concurrent process has already visited
      // a link.
      if (this.alreadyVisited(link.href)) {
        return await Promise.reject('Already visited link');
      }
      return await nightmare
        .goto(link.href)
        .then(async (res) => {
          this.addToResponseTime(startResponse);
          this.addToVisited(link.href);
          if (res.code >= 400) {
            this.addBrokenLink(link);
            return Promise.reject('Broken link found');
          }
          if (this.isOutOfScope(link.href)) {
            return Promise.reject('Link out of bounds');
          }
          return res;
        });
    } catch (e) {
      return e;
    }
  }

  async scrapeLinks(nightmare, link) {
    try {
      return await nightmare
        .wait('body')
        .evaluate(async (currentLink, visitedLinks) => {
          const target = document.getElementById('readme');
          const links = target.querySelectorAll('a:not(.anchor)');
          const unvisitedLinks = [];
          Array.from(links).forEach((el) => {
            const href = el.href;
            if (visitedLinks[href]) return;
            const location = currentLink.href;
            const text = 'something';
            const unvisitedLink = { href, location, text };
            unvisitedLinks.push(unvisitedLink);
          });
          return unvisitedLinks;
        }, link, this.visitedLinks);
    } catch (e) {
      return e;
    }
  }

  async visitAndScrapeLinks(link, workerNumber) {
    try {
      const nightmare = this.workers[workerNumber];
      return this.visitLink(nightmare, link)
        .then(() => (
          this.scrapeLinks(nightmare, link)
            .then(links => (
              links.map(el => (
                new Link(el.href, el.location, el.text)
              ))
            ))
            .catch(e => Promise.reject(e))
        ))
        .catch(e => Promise.reject(e));
    } catch (e) {
      return e;
    }
  }

  async traverseLinks() {
    return this.login()
      .then(() => {
        const startTime = new Date();
        const handleWorkers = setInterval(() => {
          if (this.availableWorkers.length > 0 &&
              this.linkQueue.length > 0) {
            const freeWorker = this.availableWorkers.dequeue();
            this.displayLinkData(startTime, freeWorker);
            const currentLink = this.linkQueue.dequeue();
            this.visitAndScrapeLinks(currentLink, freeWorker)
              .then((links) => {
                if (!links) {
                  this.availableWorkers.enqueue(freeWorker);
                  return;
                }
                links.forEach((link) => {
                  this.linkQueue.enqueue(link);
                });

                this.availableWorkers.enqueue(freeWorker);
              })
              .catch(() => {
                this.availableWorkers.enqueue(freeWorker);
              });
          } else if (this.availableWorkers.length === this.maxWorkers &&
              this.linkQueue.length > 0) {
            clearInterval(handleWorkers);
          }
        }, 50);
      });
  }
}

export default HubCrawl;
