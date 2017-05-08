import Nightmare from 'nightmare';
import rl from 'readline-sync';
import DownloadManager from 'nightmare-download-manager';
import Table from 'cli-table';

DownloadManager(Nightmare);

export const ask = (msg, options) => (
  rl.question(msg, options)
);

export const clearScreen = () => {
  process.stdout.write('\u001B[2J\u001B[0;0f');
};

export const displayDataTable = (info) => {
  const table = new Table();
  table.push({
    'Current Visited Links': info.visitedLinkCount,
  }, {
    'Current Remaining Links': info.linkQueueLength,
  }, {
    'Current Links Per Minute': info.averageLinksPerMinute,
  }, {
    'Current Average Response Time': info.averageResponseTime,
  }, {
    'Current # of Broken Links': info.brokenLinkCount,
  }, {
    'Current # of Workers': info.currentWorkerCount,
  });
  clearScreen();
  console.log(table.toString());
};

export const isWiki = url => (
  url.indexOf('/wiki') !== -1
);

export const properElementId = (url) => {
  if (isWiki(url)) {
    return 'wiki-content';
  }
  return 'readme';
};

export const properSelector = (url) => {
  if (isWiki(url)) {
    return 'a';
  }
  return 'a:not(.anchor)';
};

export const notAnchor = link => (
  !link.hash || link.hash.length === 0
);

export const averageLinksPerMinute = (startTime, visitedLinkCount) => {
  const now = new Date();
  const oneMinute = 1000 * 60;
  let timeDiff = (now - startTime) / oneMinute;
  if (timeDiff > oneMinute) {
    timeDiff = oneMinute;
  }
  const linksPerMinute = visitedLinkCount / timeDiff;
  return Math.round(linksPerMinute * 100) / 100;
};

export const generateNightmareInstance = show => (
  Nightmare({
    pollInterval: 50,
    gotoTimeout: 10000,
    webPreferences: {
      partition: 'persist: authenticated',
      images: false,
    },
    ignoreDownloads: true,
    show,
  })
);
