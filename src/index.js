#!/usr/bin/env node --harmony
import program from 'commander';
import path from 'path';

import HubCrawl from './hub-crawl';
import { ask } from './util';

program
  .arguments('[entry] [scope]')
  .option('-V --V', 'Return the current version')
  .option('-l --login', 'Speficies that there should be an initial log in')
  .option('-w --workers <n>', 'Specifies the number of workers', parseInt)
  .parse(process.argv);

if (program.version) {
  console.log(require(path.join(__dirname, '..', 'package.json')).version);
}

const workers = program.workers || 8;
const entry = program.args[0] || ask('Enter an entry point: ');
const scope = program.args[1] || ask(`Enter a scope url: (${entry})`);
const login = program.login;

const crawler = new HubCrawl(workers, entry, scope);

crawler.traverseAndLogOutput(login);
