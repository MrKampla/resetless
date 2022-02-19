export const sleep = (x: number) => new Promise(res => setTimeout(res, x));

// eslint-disable-next-line @typescript-eslint/ban-types
export const waitFor = async (predicate: Function, howLongToWait: number) => {
  const startTime = new Date().valueOf();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      predicate();
      return true;
    } catch {
      // no-op
    }

    await sleep(1);

    if (new Date().valueOf() > startTime + howLongToWait) {
      throw new Error('Desired action did not happened in specified time');
    }
  }
};
