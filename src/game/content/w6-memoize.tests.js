const { memoize } = exports;

test('computes once per distinct set of arguments', () => {
  const fn = spy((a, b) => a + b);
  const add = memoize(fn);
  expect(add(1, 2)).toBe(3);
  expect(add(1, 2)).toBe(3);
  expect(fn.callCount).toBe(1);
});

test('different arguments are cached separately', () => {
  const fn = spy((a, b) => a - b);
  const sub = memoize(fn);
  expect(sub(5, 2)).toBe(3);
  expect(sub(2, 5)).toBe(-3);
  expect(fn.callCount).toBe(2);
});

test('works with no arguments', () => {
  const fn = spy(() => 'value');
  const get = memoize(fn);
  get(); get();
  expect(fn.callCount).toBe(1);
});

test('caches `undefined` results too', () => {
  const fn = spy(() => undefined);
  const run = memoize(fn);
  run('x'); run('x');
  expect(fn.callCount).toBe(1);
});

test('accepts a custom key resolver', () => {
  const fn = spy((user) => user.name.toUpperCase());
  const shout = memoize(fn, (user) => user.id);
  shout({ id: 1, name: 'ada' });
  expect(shout({ id: 1, name: 'changed' })).toBe('ADA');
  expect(fn.callCount).toBe(1);
});

test('does not cache errors', () => {
  let calls = 0;
  const flaky = memoize(() => { calls++; if (calls === 1) throw new Error('flaky'); return 'ok'; });
  expect(() => flaky()).toThrow(/flaky/);
  expect(flaky()).toBe('ok');
  expect(flaky()).toBe('ok');
  expect(calls).toBe(2);
});

test('keeps `this`', () => {
  const obj = { factor: 2, scale: memoize(function (n) { return n * this.factor; }) };
  expect(obj.scale(5)).toBe(10);
});
