const { fetchWithRetry } = exports;
const opts = { retries: 3, baseDelay: 100 };

test('returns the first successful response without retrying', async () => {
  const calls = mockFetch([{ status: 200, body: { ok: true } }]);
  const res = await fetchWithRetry('/api/x', {}, opts);
  expect(res.status).toBe(200);
  expect(calls.length).toBe(1);
});

test('retries a 503 and succeeds on the next attempt', async () => {
  const calls = mockFetch([{ status: 503 }, { status: 200 }]);
  const promise = fetchWithRetry('/api/x', {}, opts);
  await clock.tick(100);
  const res = await promise;
  expect(res.status).toBe(200);
  expect(calls.length).toBe(2);
});

test('waits baseDelay before the first retry (not sooner)', async () => {
  const calls = mockFetch([{ status: 500 }, { status: 200 }]);
  fetchWithRetry('/api/x', {}, opts);
  await clock.tick(99);
  expect(calls.length).toBe(1);
  await clock.tick(1);
  expect(calls.length).toBe(2);
});

test('doubles the wait each time: 100ms, 200ms, 400ms', async () => {
  const calls = mockFetch([{ status: 500 }]);
  const assertion = rejects(fetchWithRetry('/api/x', {}, opts));
  await clock.tick(100);
  expect(calls.length).toBe(2);
  await clock.tick(199);
  expect(calls.length).toBe(2);
  await clock.tick(1);
  expect(calls.length).toBe(3);
  await clock.tick(399);
  expect(calls.length).toBe(3);
  await clock.tick(1);
  expect(calls.length).toBe(4);
  await assertion;
});

test('gives up after `retries` retries and throws the last error', async () => {
  const calls = mockFetch([{ status: 502 }]);
  const assertion = rejects(fetchWithRetry('/api/x', {}, { retries: 2, baseDelay: 100 }));
  await clock.tick(100);
  await clock.tick(200);
  const error = await assertion;
  expect(calls.length).toBe(3);
  expect(error.message).toBe('HTTP 502');
});

test('does not retry client errors like 404', async () => {
  const calls = mockFetch([{ status: 404 }]);
  const error = await rejects(fetchWithRetry('/api/x', {}, opts));
  expect(error.message).toBe('HTTP 404');
  expect(calls.length).toBe(1);
});

test('does retry 429 Too Many Requests', async () => {
  const calls = mockFetch([{ status: 429 }, { status: 200 }]);
  const promise = fetchWithRetry('/api/x', {}, opts);
  await clock.tick(100);
  expect((await promise).status).toBe(200);
  expect(calls.length).toBe(2);
});

test('retries network failures too', async () => {
  const calls = mockFetch([{ reject: true }, { status: 200 }]);
  const promise = fetchWithRetry('/api/x', {}, opts);
  await clock.tick(100);
  expect((await promise).status).toBe(200);
  expect(calls.length).toBe(2);
});

test('defaults to 3 retries (4 attempts) with a 100ms base delay', async () => {
  const calls = mockFetch([{ status: 500 }]);
  const assertion = rejects(fetchWithRetry('/api/x'));
  await clock.tick(100 + 200 + 400);
  await assertion;
  expect(calls.length).toBe(4);
});
