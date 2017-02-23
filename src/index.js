import Nightmare from 'nightmare';

import Link from './link';
import LinkedList from './linked-list';

let nightmare = Nightmare({
  show: true,
  pollInterval: 50,
  webPreferences: {
    partition: 'persist: testing'
  }
});

const login = async () => {
  try {
    return await nightmare
      .goto('https://github.com/login')
      .wait(function () {
        const url = document.URL;
        return url === 'https://github.com/';
      })
      .end()
  } catch(e) {
    console.log(e);
  }
}

const linkQueue = new LinkedList();
const entry = 'http://github.com/appacademy/curriculum';
const rootLink = new Link(entry, entry, 'root');
linkQueue.enqueue(rootLink);

console.log(linkQueue);

login()
  .then(async () => {
    const currentLink = linkQueue.dequeue();
    const nightmare = Nightmare({
      show: true,
      webPreferences: {
        partition: 'persist: testing'
      }
    });

    nightmare
      .goto(currentLink.href)
      .then(async (status) => {
        if (status.code >= 400) {
          return await Promise.reject('Broken Link');
        }
        return await nightmare
          .wait('body')
          .evaluate(function () {
            return document.title;
          });
      })
      .then(res => console.log(res))
      .catch(e => {
        console.log(e);
      })
      .then(() => nightmare.end());
  })
