const { createManagedIdentityTokenProvider } = exports;
const nowSec = () => Math.floor(clock.now() / 1000);
const tokenStep = (token, ttlSeconds, extra = {}) => ({
  body: { access_token: token, expires_on: String(nowSec() + ttlSeconds), resource: 'x' },
  ...extra,
});

test('calls the metadata endpoint with an encoded resource and the Metadata header', async () => {
  const calls = mockFetch(() => tokenStep('tok', 3600));
  const getToken = createManagedIdentityTokenProvider('https://vault.azure.net');
  expect(await getToken()).toBe('tok');
  expect(calls[0].url).toBe('http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https%3A%2F%2Fvault.azure.net');
  expect(calls[0].options.headers.Metadata).toBe('true');
});

test('reuses the cached token (one request for two calls)', async () => {
  const calls = mockFetch(() => tokenStep('tok', 3600));
  const getToken = createManagedIdentityTokenProvider('r');
  await getToken();
  await getToken();
  expect(calls.length).toBe(1);
});

test('fetches a new token once less than 60 seconds remain', async () => {
  const calls = mockFetch(() => tokenStep('tok', 3600));
  const getToken = createManagedIdentityTokenProvider('r');
  await getToken();
  await clock.tick(3539 * 1000);
  await getToken();
  expect(calls.length).toBe(1);
  await clock.tick(2 * 1000);
  await getToken();
  expect(calls.length).toBe(2);
});

test('concurrent callers share a single request', async () => {
  const calls = mockFetch(() => tokenStep('tok', 3600, { delay: 50 }));
  const getToken = createManagedIdentityTokenProvider('r');
  const all = Promise.all([getToken(), getToken(), getToken()]);
  await clock.tick(50);
  expect(await all).toEqual(['tok', 'tok', 'tok']);
  expect(calls.length).toBe(1);
});

test('throws "IMDS 400" on failure and does not cache the failure', async () => {
  const calls = mockFetch((url, options, i) => (i === 0 ? { status: 400 } : tokenStep('ok', 3600)));
  const getToken = createManagedIdentityTokenProvider('r');
  const error = await rejects(getToken());
  expect(error.message).toBe('IMDS 400');
  expect(await getToken()).toBe('ok');
  expect(calls.length).toBe(2);
});
