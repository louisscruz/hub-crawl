# Curriculum Crawler

Curriculum Crawler finds broken links in large Github repositories. It
finds links in the `readme` portions of the documents, scrapes the links
of those sections, and continues the crawl on those links.

## Instructions

To begin using Curriculum Crawler, clone the repository.

```
git clone https://github.com/louisscruz/curriculum-crawler.git
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

You will be asked to provide your target URL, your scope URL, and your
Github credentials.

The target URL is the link at which the whole search begins.

The scope URL defines the limits of the locations that will be scraped.
Any URL that is linked to that is outside of this scope will be visited.
However, links outside the designated scope will not be scraped for
links. The scope URL is the boundary that prevents us from potentially
scouring the entire internet.

## Warnings

The crawler can give false positives. If a website happens to be
unavailable during the crawl, it will still show that URL as being
unavailable.


## Future Improvements

- [x] Set the scope through user input, rather than relying on the target.
- [ ] Allow the user to set the DOM selector for link scraping.
- [ ] Run the queries in parallel, rather than synchonously.
- [ ] Make the output look better.
