const { throttle } = exports;

test('runs immediately on the first call', () => {
  const fn = spy();
  throttle(fn, 100)('a');
  expect(fn.calls).toEqual([['a']]);
});

test('ignores extra calls inside the window (they do not run immediately)', () => {
  const fn = spy();
  const run = throttle(fn, 100);
  run(1); run(2); run(3);
  expect(fn.callCount).toBe(1);
});

test('fires one trailing call with the latest arguments', async () => {
  const fn = spy();
  const run = throttle(fn, 100);
  run(1); run(2); run(3);
  await clock.tick(100);
  expect(fn.calls).toEqual([[1], [3]]);
});

test('does not fire a trailing call when nothing else was called', async () => {
  const fn = spy();
  const run = throttle(fn, 100);
  run('a');
  await clock.tick(500);
  expect(fn.callCount).toBe(1);
});

test('allows a new immediate call once the window has passed', async () => {
  const fn = spy();
  const run = throttle(fn, 100);
  run('a');
  await clock.tick(100);
  run('b');
  expect(fn.calls).toEqual([['a'], ['b']]);
});

test('under constant calling it runs about once per window', async () => {
  const fn = spy();
  const run = throttle(fn, 100);
  for (let i = 0; i < 100; i++) { run(i); await clock.tick(10); }
  expect(fn.callCount).toBeGreaterThan(8);
  expect(fn.callCount).toBeLessThan(13);
});
