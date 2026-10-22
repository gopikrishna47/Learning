const { promiseAll } = exports;
const real = { all: Promise.all, allSettled: Promise.allSettled };
// Every test runs with Promise.all switched off.
const check = (name, fn) => test(name, async () => {
  Promise.all = () => { throw new Error('No cheating: implement it without Promise.all'); };
  Promise.allSettled = Promise.all;
  try { await fn(); } finally { Promise.all = real.all; Promise.allSettled = real.allSettled; }
});

check('returns a real Promise', () => {
  expect(promiseAll([]) instanceof Promise).toBe(true);
});

check('resolves with the results in the original order, even if they finish out of order', async () => {
  const promise = promiseAll([sleep(300).then(() => 'slow'), sleep(100).then(() => 'fast'), 'plain']);
  await clock.tick(300);
  expect(await promise).toEqual(['slow', 'fast', 'plain']);
});

check('accepts plain values and promises mixed together', async () => {
  expect(await promiseAll([1, Promise.resolve(2), 3])).toEqual([1, 2, 3]);
});

check('an empty array resolves to []', async () => {
  expect(await promiseAll([])).toEqual([]);
});

check('waits until EVERY promise has finished', async () => {
  const state = track(promiseAll([sleep(100), sleep(200)]));
  await clock.tick(100);
  expect(state.state).toBe('pending');
  await clock.tick(100);
  expect(state.state).toBe('resolved');
});

check('rejects with the first rejection', async () => {
  const first = sleep(100).then(() => { throw new Error('first'); });
  const second = sleep(200).then(() => { throw new Error('second'); });
  const assertion = rejects(promiseAll([first, second]));
  await clock.tick(200);
  const error = await assertion;
  expect(error.message).toBe('first');
});
