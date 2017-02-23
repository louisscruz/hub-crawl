import Nightmare from 'nightmare';

let nightmare = Nightmare({ show: true });

const login = async () => {
  try {
    await nightmare
      .goto('https://github.com/login')
      .wait(function () {
        const url = document.URL;
        return url === 'https://github.com/';
      })
  } catch(e) {
    console.log(e);
  }
}

const scrapeLinks = async () => {
  console.log('attempting scrape');
  try {
    return await nightmare
      .goto('https://github.com/appacademy/curriculum')
      .wait(3000)
      .evaluate(() => {
        const as = document.querySelectorAll('a');
        return Array.from(as).map(el => el.href);
      })
  } catch(e) {
    console.log(e);
  }
}

login()
  .then(async () => {
    const links = await scrapeLinks();
    links.forEach(el => console.log(el))
  })
  // .then(res => console.log(res))
