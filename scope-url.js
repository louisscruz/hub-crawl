import { ask } from './utils.js';

class ScopeUrl {
  constructor(defaultUrl) {
    let url = ask(`Enter the URL of the scope repo: (${defaultUrl})`);
    if (url.length === 0) {
      url = defaultUrl;
    }
    this.url = url;
  }
}

export default ScopeUrl;
