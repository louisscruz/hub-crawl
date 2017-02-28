import HubCrawl from './hub-crawl';

const crawl = new HubCrawl(8, 'https://github.com/appacademy/curriculum/blob/master/javascript/README.md');

crawl.traverseAndLogOutput();
