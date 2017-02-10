import { ask } from './utils.js';

class TargetUrl {
  constructor() {
    const defaultUrl = 'https://github.com/appacademy/curriculum'
    let url = ask(`Enter the URL of the target repo: (${defaultUrl})`);
    if (url.length === 0) {
      url = defaultUrl;
    }
    this.url = url;
  }
}

export default TargetUrl;
