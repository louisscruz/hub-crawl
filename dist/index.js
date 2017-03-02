#!/usr/bin/env node --harmony
'use strict';

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _hubCrawl = require('./hub-crawl');

var _hubCrawl2 = _interopRequireDefault(_hubCrawl);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander2.default.version('2.1.0').arguments('[entry] [scope]').option('-l --login', 'Speficies that there should be an initial log in').option('-w --workers <n>', 'Specifies the number of workers', parseInt).parse(process.argv);

var workers = _commander2.default.workers || 8;
var entry = _commander2.default.args[0] || (0, _util.ask)('Enter an entry point: ');
var scope = _commander2.default.args[1] || (0, _util.ask)('Enter a scope url: (' + entry + ')');
var login = _commander2.default.login;

var crawler = new _hubCrawl2.default(workers, entry, scope);

crawler.traverseAndLogOutput(login);