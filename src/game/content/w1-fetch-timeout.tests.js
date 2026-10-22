const { fetchWithTimeout } = exports;

test('resolves with the response when the server is fast enough', async () => {
  mockFetch([{ status: 200, body: { ok: true }, delay: 100 }]);
  const promise = fetchWithTimeout('/api/fast', 1000);
  await clock.tick(100);
  const res = await promise;
  expect(res.status).toBe(200);
});

test('rejects with "Request timed out after 1000ms" when the server is too slow', async () => {
  mockFetch([{ status: 200, delay: 5000 }]);
  const assertion = rejects(fetchWithTimeout('/api/slow', 1000));
  await clock.tick(1000);
  const error = await assertion;
  expect(error.message).toBe('Request timed out after 1000ms');
});

test('hands an AbortSignal to fetch and keeps the other options', async () => {
  const calls = mockFetch([{ body: {} }]);
  await fetchWithTimeout('/api/x', 1000, { method: 'PUT' });
  expect(typeof calls[0].options.signal.aborted).toBe('boolean');
  expect(calls[0].options.method).toBe('PUT');
});

test('clears its timer after a successful request', async () => {
  mockFetch([{ status: 200, delay: 50 }]);
  const promise = fetchWithTimeout('/api/x', 1000);
  await clock.tick(50);
  await promise;
  expect(clock.pending()).toBe(0);
});

test('does not disguise other failures as timeouts', async () => {
  mockFetch([{ reject: 'Failed to fetch' }]);
  const error = await rejects(fetchWithTimeout('/api/x', 1000));
  expect(error.message).toBe('Failed to fetch');
});
