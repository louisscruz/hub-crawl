import Spooky from 'spooky';
import rl from 'readline-sync';

const globals = {
  targetUrl: new TargetUrl,
}

const spooky = new Spooky({
  child: {
    transport: 'http'
  },
  casper: {
    logLevel: 'debug',
    verbose: false
  }
}, (err) => {
  if (err) {
    let e = new Error('Failed to initialize SpookyJS');
    e.details = err;
    throw e;
  }

  // Visit Github
  spooky.start('https://github.com/login');
  spooky.then(function (res) {
    this.emit('clearscreen');
    this.emit('hello', 'About to attempt login at: ' + this.evaluate(() => {
      return document.title;
    }));
  });

  // Fill in form and submit it
  spooky.then([
    {
      user: new User,
    },
    function () {
      this.fill(
        'form',
        {
          'login': user.username,
          'password': user.password
        },
        true
      );
    }
  ]);

  // Wait for page to be something other than /login or /session
  spooky.waitFor([{ patterns: ['/login', 'session'] }, function () {
    const currentUrl = this.getCurrentUrl().toLowerCase();
    for (let i = 0; i < patterns.length; i++) {
      if (currentUrl.indexOf(patterns[i]) !== -1) return false;
    }
    return true;
  }]);

  // Log information to the user
  spooky.then([
    {
      targetUrl: globals.targetUrl,
    }, function () {
      this.emit('console', 'Successully logged in!')
      this.emit('console', `About to perform crawl on: ${targetUrl.url}`);
  }]);

  // Visit the target URL
  spooky.thenOpen(globals.targetUrl.url);

  // Log the current location and add initial links
  spooky.then(function (res) {
    const currentUrl = this.getCurrentUrl();
    this.emit('console', `Currently located at: ${currentUrl}`);
    const rootLink = {
      url: currentUrl,
      text: '(N/A: Root Link)',
      currentUrl: currentUrl
    };
    window.linkQueue = [rootLink];
    window.count = 1;
    window.visitedLinks = {};
    window.brokenLinks = [];
  });

  // Start the traversal
  spooky.then([{ globals }, runScan]);

  // Spit out the final result
  spooky.then(function () {
    this.emit('console', 'The broken links are as follows:');
    this.emit('console', window.brokenLinks);
  });

  spooky.run();
});

spooky.on('error', function (e, stack) {
  console.error(e);
  if (stack) {
    console.log(stack);
  }
});

spooky.on('console', line => {
  console.log(line);
});

spooky.on('clearscreen', () => {
  process.stdout.write('\u001B[2J\u001B[0;0f');
});

function runScan() {
  this.repeat(window.linkQueue.length, function () {
    let currentLink = window.linkQueue.shift();
    let currentUrl = currentLink.url;
    this.emit('console', `About to open ${currentUrl}, which is linked from ${currentLink.currentUrl}`);
    this.thenOpen(currentUrl, function (res) {
      const previouslyVisited = !!window.visitedLinks[currentUrl];
      const inScope = currentUrl.indexOf(globals.targetUrl.url) !== -1;
      // Some websites always respond with the "I'm a teapot" status code
      if (res.status >= 400 && res.status !== 418) {
        window.brokenLinks.push(currentLink);
      }

      if (!previouslyVisited && inScope) {
        const links = this.evaluate((currentUrl) => {
          const readme = document.getElementById('readme');
          let newLinks = Array.from(readme.querySelectorAll('a:not(.anchor)'));
          newLinks = newLinks.map(function (link) {
            let url = link.getAttribute('href');
            if (url[0] === '/') {
              url = `https://github.com${url}`;
            }
            const text = link.innerHTML;
            const linkItem = { url, currentUrl, text };

            return linkItem;
          });
          return newLinks;
        }, { currentUrl });

        if (links) {
          links.forEach(link => {
            window.linkQueue.push(link);
          });
          this.emit('console', `${links.length} links added to queue.`)
        }
        window.visitedLinks[currentUrl] = true;
      }
      this.emit('clearscreen');
      this.emit('console', `${window.count} links traversed.`);
      this.emit('console', `${window.linkQueue.length} links are remaining.`);
      this.emit('console', `${window.brokenLinks.length} broken links found.`);
      window.brokenLinks.forEach(function(link, i) {
        this.emit('console', `Broken Link #${i + 1}:`);
        this.emit('console', `href points to: ${link.url}`);
        this.emit('console', `Appears on page: ${link.currentUrl}`);
        this.emit('console', `Has the following clickable text: ${link.text}`);
      });
      window.count += 1;
    });
  });
  this.then(function (res) {
    runScan.call(this);
  });
}

function ask(msg, options) {
  return rl.question(msg, options)
}

function User() {
  return {
    username: ask("Enter your Github username: "),
    password: ask("Enter your Github password: ", { noEchoBack: true })
  }
}

function TargetUrl() {
  const defaultUrl = 'https://github.com/appacademy/curriculum'
  let url = ask(`Enter the URL of the target repo: (${defaultUrl})`);
  if (url.length === 0) {
    url = defaultUrl;
  }
  return { url };
}
