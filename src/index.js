import Nightmare from 'nightmare';

import Link from './link';
import LinkedList from './linked-list';

const linkQueue = new LinkedList();
const entry = 'https://github.com/appacademy/curriculum';
const rootLink = new Link(entry, entry, 'root');
linkQueue.enqueue(rootLink);

const generateWorkers = (number) => {
  const workers = {};
  for (let i = 0; i < number; i += 1) {
    const nightmare = Nightmare({
      show: false,
      pollInterval: 50,
      webPreferences: {
        partition: `persist: testing`
      }
    });
    workers[i] = nightmare;
  }
  return workers;
}

const workers = generateWorkers(8);

const availableWorkers = new LinkedList();
for (let i = 0; i < 8; i += 1) {
  availableWorkers.enqueue(i);
}

const visitedLinks = {};
const brokenLinks = {};
let visitedLinkCount = 0;
let brokenLinkCount = 0;
let averageResponseTime = 0;

let nightmare = Nightmare({
  show: true,
  pollInterval: 50,
  webPreferences: {
    partition: 'persist: testing'
  }
});

const login = async () => {
  try {
    return await nightmare
      .goto('https://github.com/login')
      .wait(function () {
        const url = document.URL;
        return url === 'https://github.com/';
      })
      .end()
  } catch(e) {
    console.log(e);
  }
};

const isOutOfScope = (url) => {
  const scope = entry;
  const urlSlice = url.slice(0, scope.length);
  return urlSlice !== scope;
};

const alreadyVisited = (url) => {
  !!visitedLinks[url];
};

const addToVisited = (url) => {
  visitedLinks[url] = true;
  visitedLinkCount += 1;
};

const addBrokenLink = (link) => {
  currentLinkValue = brokenLinks[link.href];
  if (!currentLinkValue instanceof LinkedList) {
    currentLinkValue = new LinkedList();
  }
  currentLinkValue.enqueue(link);
  brokenLinkCount += 1;
};

const averageLinksPerMinute = (startTime) => {
  const now = new Date();
  const timeDiff = (now - startTime) / (1000 * 60);
  const linksPerMinute = visitedLinkCount / timeDiff;
  return Math.round(linksPerMinute * 100) / 100;
};

const addToResponseTime = (startTime) => {
  const now = new Date();
  const newTime = (now - startTime) / 1000;
  const oldResponseSum = averageResponseTime * visitedLinkCount;
  const newAverage = (oldResponseSum + newTime) / (visitedLinkCount + 1);
  averageResponseTime = Math.round(newAverage * 100) / 100;
};

const visitAndScrapeLinks = async (link, workerNumber) => {
  try {
    const startResponse = new Date();
    const nightmare = workers[workerNumber]

    if (alreadyVisited(link.href)) {
      return await Promise.reject('Already visited link')
    }

    return await nightmare
      .goto(link.href)
      .then(async (status) => {
        addToResponseTime(startResponse);
        addToVisited(link.href);
        if (status.code >= 400) {
          addBrokenLink(link);
          return await Promise.reject('Broken link found');
        }
        if (isOutOfScope(link.href)) {
          return await Promise.reject('Link out of bounds');
        }
        return await nightmare
          .wait('body')
          .evaluate(function (link) {
            const targetContainer = document.getElementById('readme');
            const links = targetContainer.querySelectorAll('a:not(.anchor)')
            const formattedLinks = Array.from(links).map((el) => {
              const href = el.href;
              const location = link.href;
              const text = 'something';
              return { href, location, text };
            });
            return formattedLinks;
          }, link);
      })
      .then(async links => {
        const newLinks = links.map(link => (
          new Link(link.href, link.location, link.text)
        ));
        return await newLinks;
      })
      .catch(e => {
        console.log(e);
      })
  } catch(e) {
    console.log(e);
  }
};

const displayLinkData = (startTime, workers) => {
  process.stdout.write('\u001B[2J\u001B[0;0f');
  console.log(`Visited ${visitedLinkCount} links.`);
  console.log(`${linkQueue.length} links remaining.`);
  console.log(`(averaging ${averageLinksPerMinute(startTime)} per minute)`)
  console.log(`(averaging ${averageResponseTime} seconds per request)`);
  console.log((`there are currently ${brokenLinkCount} broken links`));
  console.log(`there are currently ${8 - availableWorkers.length} workers`);
};

login()
  .then(() => {
    const startTime = new Date();
    const handleWorkers = setInterval(() => {
      if (availableWorkers.length > 0 && linkQueue.length > 0) {
        const freeWorker = availableWorkers.dequeue();
        displayLinkData(startTime, freeWorker);
        const currentLink = linkQueue.dequeue();
        visitAndScrapeLinks(currentLink, freeWorker)
          .then((links) => {
            if (!links) {
              availableWorkers.enqueue(freeWorker);
              return;
            }
            links.forEach((link) => {
              linkQueue.enqueue(link);
            });
            availableWorkers.enqueue(freeWorker);
          })
          .catch(() => {
            availableWorkers.enqueue(freeWorker);
            return;
          });
      }
      if (linkQueue.length > 0 && availableWorkers.length === 8) {
        clearInterval(handleWorkers);
      }
    }, 50);
  });
