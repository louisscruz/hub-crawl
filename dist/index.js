#!/usr/bin/env node
'use strict';

var _hubCrawl = require('./hub-crawl');

var _hubCrawl2 = _interopRequireDefault(_hubCrawl);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var entry = (0, _util.ask)('Enter an entry point: ');
var scope = (0, _util.ask)('Enter a scope url: (' + entry + ') ');

var crawl = new _hubCrawl2.default(12, entry, scope);

crawl.traverseAndLogOutput();