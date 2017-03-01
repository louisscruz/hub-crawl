#!/usr/bin/env node

import HubCrawl from './hub-crawl';
import { ask } from './util';

const entry = ask('Enter an entry point: ');
const scope = ask(`Enter a scope url: (${entry}) `);

const crawler = new HubCrawl(12, entry, scope);

crawler.traverseAndLogOutput();
