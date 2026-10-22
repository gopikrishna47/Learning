const { createLoginLimiter } = exports;
const make = () => createLoginLimiter({ maxAttempts: 3, windowMs: 60000, lockMs: 300000 });
const failTimes = (limiter, key, n) => { for (let i = 0; i < n; i++) limiter.fail(key); };

test('allows a first attempt', () => {
  expect(make().check('ada')).toEqual({ allowed: true });
});

test('still allows attempts below the limit', () => {
  const limiter = make();
  failTimes(limiter, 'ada', 2);
  expect(limiter.check('ada')).toEqual({ allowed: true });
});

test('locks after maxAttempts failures', () => {
  const limiter = make();
  failTimes(limiter, 'ada', 3);
  expect(limiter.check('ada')).toEqual({ allowed: false, retryAfterMs: 300000 });
});

test('retryAfterMs counts down as time passes', async () => {
  const limiter = make();
  failTimes(limiter, 'ada', 3);
  await clock.tick(100000);
  expect(limiter.check('ada')).toEqual({ allowed: false, retryAfterMs: 200000 });
});

test('unlocks after lockMs', async () => {
  const limiter = make();
  failTimes(limiter, 'ada', 3);
  await clock.tick(299999);
  expect(limiter.check('ada').allowed).toBe(false);
  await clock.tick(1);
  expect(limiter.check('ada')).toEqual({ allowed: true });
});

test('after unlocking the key starts clean (old failures do not count again)', async () => {
  // the window (10 min) is longer than the lock (1 min): the 3 old failures are still "recent"
  const limiter = createLoginLimiter({ maxAttempts: 3, windowMs: 600000, lockMs: 60000 });
  failTimes(limiter, 'ada', 3);
  await clock.tick(60000);
  expect(limiter.check('ada')).toEqual({ allowed: true });
  limiter.fail('ada');
  expect(limiter.check('ada')).toEqual({ allowed: true });
});

test('forgets failures older than the window', async () => {
  const limiter = make();
  failTimes(limiter, 'ada', 2);
  await clock.tick(61000);
  limiter.fail('ada');
  expect(limiter.check('ada')).toEqual({ allowed: true });
});

test('tracks each key separately', () => {
  const limiter = make();
  failTimes(limiter, 'ada', 3);
  expect(limiter.check('ada').allowed).toBe(false);
  expect(limiter.check('grace').allowed).toBe(true);
});

test('a successful login clears the failures', () => {
  const limiter = make();
  failTimes(limiter, 'ada', 2);
  limiter.success('ada');
  failTimes(limiter, 'ada', 2);
  expect(limiter.check('ada')).toEqual({ allowed: true });
});
