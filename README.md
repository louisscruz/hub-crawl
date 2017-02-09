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

You will be asked to provide your target URL, as well as your Github
credentials.

## Warnings

The crawler can give false positives. If a website happens to be
unavailable during the crawl, it will still show that URL as being
unavailable.


## Future Improvements

- [ ] Set the scope through user input, rather than relying on the target.
- [ ] Run the queries in parallel, rather than synchonously.
- [ ] Make the output look better.
