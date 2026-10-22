const { fetchJson } = exports;

test('returns the parsed JSON body of a 200 response', async () => {
  mockFetch([{ status: 200, body: { id: 1, name: 'Ada' } }]);
  expect(await fetchJson('/api/users/1')).toEqual({ id: 1, name: 'Ada' });
});

test('passes the url and options through to fetch', async () => {
  const calls = mockFetch([{ body: {} }]);
  await fetchJson('/api/items', { method: 'POST' });
  expect(calls[0].url).toBe('/api/items');
  expect(calls[0].options.method).toBe('POST');
});

test('throws "HTTP 404" when the server answers 404', async () => {
  mockFetch([{ status: 404, body: { message: 'nope' } }]);
  const error = await rejects(fetchJson('/api/missing'));
  expect(error.message).toBe('HTTP 404');
});

test('throws "HTTP 500" on server errors', async () => {
  mockFetch([{ status: 500 }]);
  const error = await rejects(fetchJson('/api/boom'));
  expect(error.message).toBe('HTTP 500');
});

test('lets network failures bubble up unchanged', async () => {
  mockFetch([{ reject: 'Failed to fetch' }]);
  const error = await rejects(fetchJson('/api/offline'));
  expect(error.message).toBe('Failed to fetch');
});
