#!/usr/bin/env node --harmony
'use strict';

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _hubCrawl = require('./hub-crawl');

var _hubCrawl2 = _interopRequireDefault(_hubCrawl);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander2.default.arguments('[entry] [scope]').option('-V --V', 'Return the current version').option('-l --login', 'Speficies that there should be an initial log in').option('-w --workers <n>', 'Specifies the number of workers', parseInt).parse(process.argv);

// if (program.V) {
//   (function printVersion() {
//     var path = require('path');
//     console.log(require(path.join(__dirname, '..', 'package.json')).version);
//   }());
//   process.exit();
// }
console.log(_commander2.default);
if (_commander2.default.version) {
  console.log('TRYING');
  console.log(require(_path2.default.join(__dirname, '..', 'package.json')).version);
}

var workers = _commander2.default.workers || 8;
var entry = _commander2.default.args[0] || (0, _util.ask)('Enter an entry point: ');
var scope = _commander2.default.args[1] || (0, _util.ask)('Enter a scope url: (' + entry + ')');
var login = _commander2.default.login;

var crawler = new _hubCrawl2.default(workers, entry, scope);

crawler.traverseAndLogOutput(login);