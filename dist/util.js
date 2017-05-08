'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateNightmareInstance = exports.averageLinksPerMinute = exports.filteredUrl = exports.hashAtEnd = exports.properSelector = exports.properElementId = exports.isWiki = exports.displayDataTable = exports.clearScreen = exports.ask = undefined;

var _nightmare = require('nightmare');

var _nightmare2 = _interopRequireDefault(_nightmare);

var _readlineSync = require('readline-sync');

var _readlineSync2 = _interopRequireDefault(_readlineSync);

var _nightmareDownloadManager = require('nightmare-download-manager');

var _nightmareDownloadManager2 = _interopRequireDefault(_nightmareDownloadManager);

var _cliTable = require('cli-table');

var _cliTable2 = _interopRequireDefault(_cliTable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _nightmareDownloadManager2.default)(_nightmare2.default);

var ask = exports.ask = function ask(msg, options) {
  return _readlineSync2.default.question(msg, options);
};

var clearScreen = exports.clearScreen = function clearScreen() {
  process.stdout.write('\x1B[2J\x1B[0;0f');
};

var displayDataTable = exports.displayDataTable = function displayDataTable(info) {
  var table = new _cliTable2.default();
  table.push({
    'Current Visited Links': info.visitedLinkCount
  }, {
    'Current Remaining Links': info.linkQueueLength
  }, {
    'Current Links Per Minute': info.averageLinksPerMinute
  }, {
    'Current Average Response Time': info.averageResponseTime
  }, {
    'Current # of Broken Links': info.brokenLinkCount
  }, {
    'Current # of Workers': info.currentWorkerCount
  });
  clearScreen();
  console.log(table.toString());
};

var isWiki = exports.isWiki = function isWiki(url) {
  return url.indexOf('/wiki') !== -1;
};

var properElementId = exports.properElementId = function properElementId(url) {
  if (isWiki(url)) {
    return 'wiki-content';
  }
  return 'readme';
};

var properSelector = exports.properSelector = function properSelector(url) {
  if (isWiki(url)) {
    return 'a';
  }
  return 'a:not(.anchor)';
};

var hashAtEnd = exports.hashAtEnd = function hashAtEnd(link) {
  var hash = link.hash,
      href = link.href;

  return href.slice(href.length - hash.length);
};

var filteredUrl = exports.filteredUrl = function filteredUrl(link) {
  if (hashAtEnd(link)) {
    var hash = link.hash,
        href = link.href;

    return href.slice(0, href.length - hash.length);
  }
  return link.href;
};

var averageLinksPerMinute = exports.averageLinksPerMinute = function averageLinksPerMinute(startTime, visitedLinkCount) {
  var now = new Date();
  var oneMinute = 1000 * 60;
  var timeDiff = (now - startTime) / oneMinute;
  if (timeDiff > oneMinute) {
    timeDiff = oneMinute;
  }
  var linksPerMinute = visitedLinkCount / timeDiff;
  return Math.round(linksPerMinute * 100) / 100;
};

var generateNightmareInstance = exports.generateNightmareInstance = function generateNightmareInstance(show) {
  return (0, _nightmare2.default)({
    pollInterval: 50,
    gotoTimeout: 10000,
    webPreferences: {
      partition: 'persist: authenticated',
      images: false
    },
    ignoreDownloads: true,
    show: show
  });
};