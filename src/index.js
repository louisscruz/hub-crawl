import HubCrawl from './hub-crawl';

const crawl = new HubCrawl(20, 'https://github.com/appacademy/curriculum');

crawl.traverseLinks();
