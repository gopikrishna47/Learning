const { debounce } = exports;

test('does not call the function immediately', () => {
  const fn = spy();
  debounce(fn, 300)();
  expect(fn.callCount).toBe(0);
});

test('calls it once, `wait` ms after the call', async () => {
  const fn = spy();
  const run = debounce(fn, 300);
  run();
  await clock.tick(299);
  expect(fn.callCount).toBe(0);
  await clock.tick(1);
  expect(fn.callCount).toBe(1);
});

test('restarts the timer on every call', async () => {
  const fn = spy();
  const run = debounce(fn, 300);
  run();
  await clock.tick(200);
  run();
  await clock.tick(200);
  expect(fn.callCount).toBe(0);
  await clock.tick(100);
  expect(fn.callCount).toBe(1);
});

test('uses the arguments of the latest call', async () => {
  const fn = spy();
  const run = debounce(fn, 100);
  run(1);
  run(2);
  run(3);
  await clock.tick(100);
  expect(fn.calls).toEqual([[3]]);
});

test('keeps the `this` of the call', async () => {
  const fn = spy();
  const obj = { run: debounce(fn, 50) };
  obj.run();
  await clock.tick(50);
  expect(fn.thisValues[0]).toBe(obj);
});

test('each debounced function has its own timer', async () => {
  const fn = spy();
  const a = debounce(fn, 100);
  const b = debounce(fn, 100);
  a('a');
  b('b');
  await clock.tick(100);
  expect(fn.callCount).toBe(2);
});
