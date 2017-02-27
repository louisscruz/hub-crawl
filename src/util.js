import Nightmare from 'nightmare';

export const averageLinksPerMinute = (startTime, visitedLinkCount) => {
  const now = new Date();
  const oneMinute = 1000 * 60;
  let timeDiff = (now - startTime) / oneMinute;
  if (timeDiff > oneMinute) {
    timeDiff = oneMinute;
  }
  const linksPerMinute = visitedLinkCount / timeDiff;
  return Math.round(linksPerMinute * 100) / 100;
};

export const generateNightmareInstance = show => (
  Nightmare({
    pollInterval: 50,
    webPreferences: {
      partition: 'persist: authenticated',
    },
    show,
  })
);
