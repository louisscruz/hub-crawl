import { ask } from './utils.js';

class UrlGlobals {
  constructor() {
    const defaultUrl = 'https://github.com/appacademy/curriculum'
    let targetUrl = ask(`Enter the URL of the target repo: (${defaultUrl})`);
    if (targetUrl.length === 0) {
      targetUrl = defaultUrl;
    }
    this.targetUrl = targetUrl;
    let scopeUrl = ask(`Enter the URL of the scope repo: (${targetUrl})`);
    if (scopeUrl.length === 0) {
      scopeUrl = targetUrl;
    }
    this.scopeUrl = scopeUrl;
  }
}

export default UrlGlobals;
