import HubCrawl from './hub-crawl';
import { ask } from './util';

const entry = ask('Enter an entry point: ');
const scope = ask(`Enter a scope url: (${entry}) `);

const crawl = new HubCrawl(12, entry, scope);

crawl.traverseAndLogOutput();
