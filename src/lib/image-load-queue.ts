const MAX_CONCURRENT = 4;

let activeLoads = 0;
const waitQueue: Array<() => void> = [];

export function acquireImageLoadSlot() {
  if (activeLoads < MAX_CONCURRENT) {
    activeLoads += 1;
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    waitQueue.push(() => {
      activeLoads += 1;
      resolve();
    });
  });
}

export function releaseImageLoadSlot() {
  activeLoads = Math.max(0, activeLoads - 1);
  const next = waitQueue.shift();
  if (next) next();
}
