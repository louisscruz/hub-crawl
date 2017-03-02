[![npm version](https://badge.fury.io/js/hub-crawl.svg)](https://badge.fury.io/js/hub-crawl)
[![Dependency Status](https://david-dm.org/louisscruz/hub-crawl.svg)](https://david-dm.org/louisscruz/hub-crawl.svg)
[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)

# Hub Crawl

Hub Crawl finds broken links in large Github repositories. It finds links in the
`readme` portions of the documents (or the `wiki-content` for wiki pages),
scrapes the links of those sections, and continues the crawl beginning with
those newfound links. It essentially performs a concurrent breadth-first graph
traversal and logs broken links as it goes.

## Installation

To begin using Hub Crawl, install it globally with `npm`.

```
npm install -g hub-crawl
```

Or, if you use `yarn`:

```
yarn global hub-crawl
```

## Terminology

Regardless of how you choose to implement Hub Crawl, the following are important
terms:

### `entry`

The `entry` is the url that is first visited and scraped.

### `scope`

The `scope` is a url that defines the limit of link scraping. For instance,
assume the `scope` is set to `https://something.com/test`. If
`https://something.com/test/somethingelse` is in the queue, it will be both
visited and scraped. However, if `https://google.com` is in the queue, it will
be visited, but not scraped. This keeps Hub Crawl from scouring the entire
internet. If you do not provide a scope, Hub Crawl defaults to using the
`entry`.

### `workers`

The number of workers determines the maximum number of parallel requests to be
open at any given time. The optimal number of workers depends on your hardware
and internet speed.

## Usage

There are two ways to use Hub Crawl. For common usage, it is likely preferable
to use the command line. If you are integrating Hub Crawl into a bigger project,
it is probably worth importing or requiring the Hub Crawl class.

### Command Line

After Hub Crawl is installed globally, you can run `hub-crawl` in the command
line. It accepts the following arguments and options in the following format:

```
hub-crawl [entry] [scope] -l -w 12
```

#### Arguments

##### `[entry]`

If not provided, the program will prompt you for this.

##### `[scope]`

If not provided, the program will prompt you for this.

#### Options

##### `-l`

If this option is provided, then an initial log in window will appear so that
the crawl is authenticated while running. This is useful for private repos.

##### `-w`

If this option is provided, it will set the maximum number of workers. For
instance, `-w 24` would set a maximum of 24 workers.

### Importing

If you would like to use Hub Crawl in a project, feel free to import it as
such:

```javascript
import HubCrawl from 'hub-crawl';
```

Or, if you're still not using `import`:

```javascript
var HubCrawl = require('hub-crawl');
```

Create an instance:

```javascript
const crawler = new HubCrawl(12, 'https://google.com')
```

`HubCrawl` takes the following as arguments at instantiation:

```javascript
HubCrawl(workers, entry[, scope]);
```

The methods available on `HubCrawl` instances can be seen
[here](./src/hub-crawl.js). However, the most important methods follow below.

#### `traverseAndLogOutput(login)`

This method performs the traversal and logs the broken links. The `login`
argument determines whether or not an initial window will pop up to log in.

#### `traverse(login)`

This method performs the traversal. The `login` argument determines whether or
not an initial window will pop up to log in. The `traverse` method returns the
broken links. *Note that the workers are left alive afterwards.*

## False Positives

As it currently stands, the crawler only makes a single, breadth-first,
concurrent graph traversal. If it happens to be the case that a server was only
temporarily down during the traversal, it will still count as a broken link. In
the future, a second check will be made on each of the broken links to ensure
that they are indeed broken.

## Future Improvements

- [x] Set the scope through user input, rather than defaulting to the entry
- [x] Run the queries in parallel, rather than synchronously
- [x] Make into NPM package
  - [x] Allow for CLI usage
  - [x] Also allow for fallback prompts
- [ ] Perform a second check on all broken links to minimize false positives
- [ ] Make the output look better
- [ ] Allow for the crawler to be easily distributed
