import Nightmare from 'nightmare';

import Link from './link';
import LinkedList from './linked-list';

const linkQueue = new LinkedList();
const entry = 'https://github.com/appacademy/curriculum';
const rootLink = new Link(entry, entry, 'root');
linkQueue.enqueue(rootLink);

const visitedLinks = {};
const brokenLinks = {};
let visitedLinkCount = 0;
let brokenLinkCount = 0;

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
}

const isOutOfScope = (url) => {
  const scope = entry;
  const urlSlice = url.slice(0, scope.length);
  return urlSlice !== scope;
}

const alreadyVisited = (url) => {
  !!visitedLinks[url];
}

const addToVisited = (url) => {
  visitedLinks[url] = true;
  visitedLinkCount += 1;
}

const addBrokenLink = (link) => {
  currentLinkValue = brokenLinks[link.href];
  if (!currentLinkValue instanceof LinkedList) {
    currentLinkValue = new LinkedList();
  }
  currentLinkValue.enqueue(link);
  brokenLinkCount += 1;
}

const averageLinksPerMinute = (startTime) => {
  const now = new Date();
  const timeDiff = (now - startTime) / (1000 * 60);

  return visitedLinkCount / timeDiff;
}

const visitAndScrapeLinks = async (link) => {
  try {
    const nightmare = Nightmare({
      // show: true,
      webPreferences: {
        partition: 'persist: testing'
      }
    });

    if (alreadyVisited(link.href)) {
      return await Promise.reject('Already visited link')
    }

    return await nightmare
      .goto(link.href)
      .then(async (status) => {
        addToVisited(link.href);
        if (status.code >= 400) {
          addBrokenLink(link);
          return await Promise.reject('Broken link found');
        }
        // Check to see if the link href is in scope!
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
      .then(links => {
        return nightmare.end().then(() => {
          const newLinks = links.map(link => (
            new Link(link.href, link.location, link.text)
          ));
          return newLinks;
        });
      })
      .catch(e => {
        return nightmare.end().then(() => {
          console.log('current url', link.href);
          console.log('come at me', e);
          console.log(linkQueue);
        });
      })
  } catch(e) {
    console.log('made it here', e);
  }
}

login()
  .then(async () => {
    // let traversing = true;
    // while (traversing) {
    const startTime = new Date();
    let traversing = true;
    let workers = 0;
    const handleWorkers = setInterval(() => {
      if (workers < 8 && linkQueue.length > 0) {
        workers += 1;
        process.stdout.write('\u001B[2J\u001B[0;0f');
        console.log(`Visited ${visitedLinkCount} links.`);
        console.log(`(averaging ${averageLinksPerMinute(startTime)} per minute)`)
        console.log((`there are currently ${brokenLinkCount} broken links`));
        console.log(`there are currently ${workers} workers`);
        const currentLink = linkQueue.dequeue();
        visitAndScrapeLinks(currentLink)
        .then((links) => {
          if (!links) {
            workers -= 1;
            return;
          };
          links.forEach((link) => {
            linkQueue.enqueue(link);
          });
          console.log(`Added ${links.length} links`);
          console.log(`There are currently ${linkQueue.length} links in the queue.`);
          workers -= 1;
        })
        .catch(() => {
          workers -= 1;
          return;
        });
      }
      if (linkQueue.length > 0 && workers === 0) {
        clearInterval(handleWorkers);
      }
    }, 50);
  })
