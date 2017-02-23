import Nightmare from 'nightmare';
import Async from 'async';

let nightmare = Nightmare({
  show: true,
  pollInterval: 50,
});

const login = async () => {
  try {
    await nightmare
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

login()
  .then(async () => {
    const nightmare = Nightmare({
      show: true,
      webPreferences: {
        partition: 'persist: testing'
      }
    });
    try {
      return await nightmare
      .goto('https://github.com/appacademy/curriculum')
      .wait('body')
      .evaluate(function () {
        const targetDiv = document.getElementById('readme');
        return targetDiv.querySelectorAll('a:not(.anchor)')
      })
      .end()
    } catch(e) {
      console.log(e);
    }
  })
  .then((res) => {
    console.log(res);
  })
