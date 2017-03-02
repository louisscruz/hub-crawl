'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _link = require('./link');

var _link2 = _interopRequireDefault(_link);

var _linkedList = require('./linked-list');

var _linkedList2 = _interopRequireDefault(_linkedList);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HubCrawl = function () {
  function HubCrawl(maxWorkers, entry, scope) {
    _classCallCheck(this, HubCrawl);

    this.maxWorkers = maxWorkers;
    this.workers = {};
    this.generateWorkers();
    this.availableWorkers = new _linkedList2.default();
    this.generateAvailableWorkers();
    this.entry = entry;
    this.scope = scope || entry;
    this.linkQueue = this.generateLinkQueue();
    this.visitedLinks = {};
    this.brokenLinks = {};
    this.visitedLinkCount = 0;
    this.brokenLinkCount = 0;
    this.averageResponseTime = 0;
    this.generateNightmareInstance = _util.generateNightmareInstance;
    this.averageLinksPerMinute = _util.averageLinksPerMinute;
  }

  _createClass(HubCrawl, [{
    key: 'generateLinkQueue',
    value: function generateLinkQueue() {
      var linkQueue = new _linkedList2.default();
      var rootLink = new _link2.default(this.entry, this.entry, 'root');
      linkQueue.enqueue(rootLink);
      return linkQueue;
    }
  }, {
    key: 'generateWorker',
    value: function generateWorker(number) {
      this.workers[number] = (0, _util.generateNightmareInstance)(false);
    }
  }, {
    key: 'generateWorkers',
    value: function generateWorkers() {
      for (var i = 0; i < this.maxWorkers; i += 1) {
        this.generateWorker(i);
      }
    }
  }, {
    key: 'generateAvailableWorkers',
    value: function generateAvailableWorkers() {
      for (var i = 0; i < this.maxWorkers; i += 1) {
        this.availableWorkers.enqueue(i);
      }
    }
  }, {
    key: 'tearDownWorkers',
    value: function tearDownWorkers() {
      var _this = this;

      for (var _len = arguments.length, numbers = Array(_len), _key = 0; _key < _len; _key++) {
        numbers[_key] = arguments[_key];
      }

      if (numbers.length === 0) {
        for (var i = 0; i < this.maxWorkers; i += 1) {
          numbers.push(i);
        }
      }
      numbers.forEach(function (number) {
        var nightmare = _this.workers[number];
        nightmare.end();
        _this.workers[number] = null;
      });
    }
  }, {
    key: 'isOutOfScope',
    value: function isOutOfScope(url) {
      var urlSlice = url.slice(0, this.scope.length);
      return urlSlice !== this.scope;
    }
  }, {
    key: 'alreadyVisited',
    value: function alreadyVisited(url) {
      return !!this.visitedLinks[url];
    }
  }, {
    key: 'addToVisited',
    value: function addToVisited(url) {
      this.visitedLinks[url] = true;
      this.visitedLinkCount += 1;
    }
  }, {
    key: 'addBrokenLink',
    value: function addBrokenLink(link) {
      if (!(this.brokenLinks[link.href] instanceof _linkedList2.default)) {
        this.brokenLinks[link.href] = new _linkedList2.default();
      }
      var currentLinkValue = this.brokenLinks[link.href];
      currentLinkValue.enqueue(link);
      this.brokenLinkCount += 1;
    }
  }, {
    key: 'addToResponseTime',
    value: function addToResponseTime(startTime) {
      var now = new Date();
      var newTime = (now - startTime) / 1000;
      var oldResponseSum = this.averageResponseTime * this.visitedLinkCount;
      var newSum = oldResponseSum + newTime;
      var newAverage = newSum / (this.visitedLinkCount + 1);
      this.averageResponseTime = Math.round(newAverage * 100) / 100;
    }
  }, {
    key: 'displayLinkData',
    value: function displayLinkData(startTime) {
      (0, _util.clearScreen)();
      console.log('Visited ' + this.visitedLinkCount + ' links.');
      console.log(this.linkQueue.length + ' links remaining.');
      console.log('(averaging ' + this.averageLinksPerMinute(startTime, this.visitedLinkCount) + ' links per minute)');
      console.log('(averaging ' + this.averageResponseTime + ' seconds per request)');
      console.log('there are currently ' + this.brokenLinkCount + ' broken links');
      console.log('there are currently ' + (this.maxWorkers - this.availableWorkers.length) + ' workers');
    }
  }, {
    key: 'displayErrors',
    value: function displayErrors() {
      var _this2 = this;

      (0, _util.clearScreen)();
      if (this.brokenLinkCount <= 1) {
        console.log(this.brokenLinkCount + ' broken link found:');
      } else {
        console.log(this.brokenLinkCount + ' broken links found:');
      }
      if (this.brokenLinkCount === 0) return;
      var counter = 1;
      console.log('===== BROKEN LINKS =====');
      Object.keys(this.brokenLinks).forEach(function (key) {
        _this2.brokenLinks[key].forEach(function (link) {
          console.log('------Broken link #' + counter + '------');
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
  }, {
    key: 'login',
    value: async function login(shouldLogin) {
      try {
        if (!shouldLogin) return;
        var nightmare = this.generateNightmareInstance(true);
        return await nightmare.goto('https://github.com/login').wait(function () {
          var url = document.URL;
          return url === 'https://github.com/';
        }).end();
      } catch (e) {
        return e;
      }
    }
  }, {
    key: 'visitLink',
    value: function visitLink(nightmare, link) {
      var _this3 = this;

      try {
        var _ret = function () {
          var startResponse = new Date();
          // Handle the case where a concurrent process has already visited
          // a link.
          if (_this3.alreadyVisited(link.href)) {
            return {
              v: Promise.reject('Already visited link')
            };
          }
          return {
            v: nightmare.goto(link.href).then(function (res) {
              _this3.addToResponseTime(startResponse);
              _this3.addToVisited(link.href);
              if (res.code >= 400) {
                _this3.addBrokenLink(link);
              }
              return res;
            })
          };
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
      } catch (e) {
        return e;
      }
    }
  }, {
    key: 'scrapeLinks',
    value: async function scrapeLinks(nightmare, link) {
      try {
        var elementId = (0, _util.properElementId)(link.href);
        var selector = (0, _util.properSelector)(link.href);
        return await nightmare.wait('body').evaluate(async function (currentLink, targetId, targetSelector) {
          var target = document.getElementById(targetId);
          var links = target.querySelectorAll(targetSelector);
          return Array.from(links).map(function (el) {
            var href = el.href;
            var location = currentLink.href;
            var text = el.innerHTML;
            var hash = el.hash;
            return { href: href, location: location, text: text, hash: hash };
          });
        }, link, elementId, selector);
      } catch (e) {
        return e;
      }
    }
  }, {
    key: 'visitAndScrapeLinks',
    value: async function visitAndScrapeLinks(link, workerNumber) {
      var _this4 = this;

      try {
        var _ret2 = await async function () {
          var nightmare = _this4.workers[workerNumber];
          return {
            v: await _this4.visitLink(nightmare, link).then(function () {
              if (!_this4.isOutOfScope(link.href)) {
                return _this4.scrapeLinks(nightmare, link).then(function (links) {
                  var unvisitedLinks = new _linkedList2.default();
                  links.forEach(function (el) {
                    if (!_this4.visitedLinks[el.href] && (0, _util.notAnchor)(el)) {
                      var newLink = new _link2.default(el.href, el.location, el.text);
                      unvisitedLinks.enqueue(newLink);
                    }
                  });
                  return unvisitedLinks;
                }).catch(function (e) {
                  return Promise.reject(e);
                });
              }
            }).catch(function (e) {
              return Promise.reject(e);
            })
          };
        }();

        if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
      } catch (e) {
        return e;
      }
    }
  }, {
    key: 'traverseLinks',
    value: async function traverseLinks(login) {
      var _this5 = this;

      return this.login(login).then(function () {
        return new Promise(function (resolve) {
          var startTime = new Date();
          var handleWorkers = setInterval(function () {
            if (_this5.availableWorkers.length > 0 && _this5.linkQueue.length > 0) {
              (function () {
                var freeWorker = _this5.availableWorkers.dequeue();
                _this5.displayLinkData(startTime, freeWorker);
                var currentLink = _this5.linkQueue.dequeue();
                _this5.visitAndScrapeLinks(currentLink, freeWorker).then(function (links) {
                  _this5.displayLinkData(startTime, freeWorker);
                  if (!links) {
                    _this5.availableWorkers.enqueue(freeWorker);
                    return;
                  }
                  links.forEach(function (link) {
                    if (!_this5.alreadyVisited(link.href)) {
                      _this5.linkQueue.enqueue(link);
                    }
                  });
                  _this5.availableWorkers.enqueue(freeWorker);
                }).catch(function () {
                  _this5.availableWorkers.enqueue(freeWorker);
                });
              })();
            } else if (_this5.availableWorkers.length === _this5.maxWorkers && _this5.linkQueue.length === 0) {
              clearInterval(handleWorkers);
              return resolve();
            }
          }, 50);
        });
      });
    }
  }, {
    key: 'traverseAndLogOutput',
    value: async function traverseAndLogOutput(login) {
      var _this6 = this;

      this.traverseLinks(login).then(function () {
        _this6.displayErrors();
        _this6.tearDownWorkers();
      });
    }
  }]);

  return HubCrawl;
}();

exports.default = HubCrawl;