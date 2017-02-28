# Hub Crawl

Hub Crawl finds broken links in large Github repositories. It
finds links in the `readme` portions of the documents (or the
`wiki-content` for wiki pages), scrapes the links of those sections, and
continues the crawl beginning with those newfound links. It essentially
performs a concurrent breadth-first graph traversal and logs broken
links as it goes.

## Instructions

To begin using Hub Crawl, clone the repository.

```
git clone https://github.com/louisscruz/hub-crawl.git
```

Then, run:

```
yarn install
```

Or, if you don't have `yarn`, run:

```
npm install
```

Then, run:

```
npm start
```

You will be asked to provide your entry URL, your scope URL.

The target URL is the link at which the whole search begins.

The scope URL defines the limits of the locations that will be scraped.
Any URL that lies outside of this scope will be visited, but not scraped.
The scope URL is the boundary that prevents us from potentially scouring
the entire internet.

## Warnings

The crawler can give false positives. If a website happens to be
unavailable during the crawl, it will still show that URL as being
unavailable.

## Future Improvements

- [x] Set the scope through user input, rather than relying on the target.
- [x] Allow the user to set the DOM selector for link scraping.
- [x] Run the queries in parallel, rather than synchonously.
- [ ] Perform a second check on all broken links to minimize false positives.
- [ ] Make the output look better.
- [ ] Allow for the crawler to be easily distributed.
