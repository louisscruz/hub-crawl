import HubCrawl from './hub-crawl';

const crawl = new HubCrawl(8, 'https://github.com/appacademy/curriculum');

crawl.traverseLinks();
