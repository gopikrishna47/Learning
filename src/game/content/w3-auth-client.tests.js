const { createAuthClient } = exports;
const BASE = 'https://api.test';

// A tiny fake server: t2 is the only token the API accepts after a refresh.
const server = (o = {}) => (url, options) => {
  if (url === `${BASE}/auth/login`) return o.login || { body: { accessToken: 't1' } };
  if (url === `${BASE}/auth/refresh`) return o.refresh || { body: { accessToken: 't2' }, delay: 50 };
  const auth = options.headers && options.headers.Authorization;
  return (o.api && o.api(auth, url)) || (auth === 'Bearer t2' ? { status: 200, body: { id: 1 } } : { status: 401 });
};
const refreshCalls = (calls) => calls.filter((c) => c.url.endsWith('/auth/refresh')).length;

test('login() POSTs the credentials as JSON', async () => {
  const calls = mockFetch(server());
  await createAuthClient({ baseUrl: BASE }).login('ada@x.com', 'pw');
  expect(calls[0].url).toBe(`${BASE}/auth/login`);
  expect(calls[0].options.method).toBe('POST');
  expect(calls[0].options.headers['Content-Type']).toBe('application/json');
  expect(JSON.parse(calls[0].options.body)).toEqual({ email: 'ada@x.com', password: 'pw' });
});

test('login() throws "Login failed" for bad credentials', async () => {
  mockFetch(server({ login: { status: 401 } }));
  const error = await rejects(createAuthClient({ baseUrl: BASE }).login('a@x.com', 'bad'));
  expect(error.message).toBe('Login failed');
});

test('request() before logging in throws "Not authenticated"', async () => {
  mockFetch(server());
  const error = await rejects(createAuthClient({ baseUrl: BASE }).request('/me'));
  expect(error.message).toBe('Not authenticated');
});

test('request() sends the token as a Bearer header and keeps other options', async () => {
  const calls = mockFetch(server({ api: (auth) => (auth === 'Bearer t1' ? { status: 200, body: {} } : null) }));
  const client = createAuthClient({ baseUrl: BASE });
  await client.login('a@x.com', 'pw');
  await client.request('/me', { method: 'PATCH', headers: { Accept: 'application/json' } });
  expect(calls[1].url).toBe(`${BASE}/me`);
  expect(calls[1].options.method).toBe('PATCH');
  expect(calls[1].options.headers.Accept).toBe('application/json');
  expect(calls[1].options.headers.Authorization).toBe('Bearer t1');
});

test('on 401 it refreshes the token once and retries the request', async () => {
  const calls = mockFetch(server());
  const client = createAuthClient({ baseUrl: BASE });
  await client.login('a@x.com', 'pw');
  const promise = client.request('/me');
  await clock.tick(100);
  const res = await promise;
  expect(res.status).toBe(200);
  expect(calls.map((c) => c.url.replace(BASE, ''))).toEqual(['/auth/login', '/me', '/auth/refresh', '/me']);
  expect(calls[2].options.credentials).toBe('include');
  expect(calls[3].options.headers.Authorization).toBe('Bearer t2');
});

test('simultaneous 401s share ONE refresh call', async () => {
  const calls = mockFetch(server());
  const client = createAuthClient({ baseUrl: BASE });
  await client.login('a@x.com', 'pw');
  const all = Promise.all([client.request('/a'), client.request('/b'), client.request('/c')]);
  await clock.tick(100);
  const results = await all;
  expect(results.map((r) => r.status)).toEqual([200, 200, 200]);
  expect(refreshCalls(calls)).toBe(1);
});

test('a failed refresh throws "Session expired" and forgets the token', async () => {
  mockFetch(server({ refresh: { status: 401 } }));
  const client = createAuthClient({ baseUrl: BASE });
  await client.login('a@x.com', 'pw');
  const error = await rejects(client.request('/me'));
  expect(error.message).toBe('Session expired');
  const again = await rejects(client.request('/me'));
  expect(again.message).toBe('Not authenticated');
});

test('never loops: if the retry is also 401 that response is returned', async () => {
  const calls = mockFetch(server({ refresh: { body: { accessToken: 't3' } }, api: () => ({ status: 401 }) }));
  const client = createAuthClient({ baseUrl: BASE });
  await client.login('a@x.com', 'pw');
  const res = await client.request('/me');
  expect(res.status).toBe(401);
  expect(refreshCalls(calls)).toBe(1);
});

test('logout() forgets the token', async () => {
  mockFetch(server());
  const client = createAuthClient({ baseUrl: BASE });
  await client.login('a@x.com', 'pw');
  client.logout();
  const error = await rejects(client.request('/me'));
  expect(error.message).toBe('Not authenticated');
});
