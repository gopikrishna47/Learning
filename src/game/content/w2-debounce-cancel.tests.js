const { debounceWithCancel } = exports;

test('debounces: one call, `wait` ms after the last, with the latest args', async () => {
  const fn = spy();
  const run = debounceWithCancel(fn, 200);
  run('a'); run('b');
  await clock.tick(199);
  expect(fn.callCount).toBe(0);
  await clock.tick(1);
  expect(fn.calls).toEqual([['b']]);
});

test('cancel() throws the pending call away', async () => {
  const fn = spy();
  const run = debounceWithCancel(fn, 200);
  run();
  run.cancel();
  await clock.tick(1000);
  expect(fn.callCount).toBe(0);
});

test('flush() runs the pending call immediately with the latest args', async () => {
  const fn = spy();
  const run = debounceWithCancel(fn, 200);
  run(1); run(2);
  run.flush();
  expect(fn.calls).toEqual([[2]]);
});

test('after flush() the call does not fire a second time', async () => {
  const fn = spy();
  const run = debounceWithCancel(fn, 200);
  run();
  run.flush();
  await clock.tick(1000);
  expect(fn.callCount).toBe(1);
});

test('flush() with nothing pending does nothing', () => {
  const fn = spy();
  const run = debounceWithCancel(fn, 200);
  run.flush();
  expect(fn.callCount).toBe(0);
});

test('works again after cancel()', async () => {
  const fn = spy();
  const run = debounceWithCancel(fn, 100);
  run('x');
  run.cancel();
  run('y');
  await clock.tick(100);
  expect(fn.calls).toEqual([['y']]);
});
