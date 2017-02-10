import { ask } from './utils.js';

class User = {
  constructor() {
    this.username = ask("Enter your Github username: ");
    this.password = ask("Enter your Github password: ", { noEchoBack: true });
  }
}

export default User;
