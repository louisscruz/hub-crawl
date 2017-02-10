import rl from 'readline-sync';

export const ask = (msg, options) => {
  return rl.question(msg, options)
};
