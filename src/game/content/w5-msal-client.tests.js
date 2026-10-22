const { createMsalApiClient } = exports;
const account = { username: 'ada@contoso.com' };
const SCOPES = ['api://orders/access_as_user'];
const interaction = () => Object.assign(new Error('interaction_required'), { name: 'InteractionRequiredAuthError' });
const makeMsal = (overrides = {}) => ({
  getActiveAccount: () => account,
  getAllAccounts: () => [account],
  acquireTokenSilent: spy(async (req) => ({ accessToken: req.forceRefresh ? 'fresh-token' : 'cached-token' })),
  acquireTokenPopup: spy(async () => ({ accessToken: 'popup-token' })),
  ...overrides,
});
const make = (msal) => createMsalApiClient(msal, { baseUrl: 'https://api.test', scopes: SCOPES });

test('calls the API with the cached access token as a Bearer header', async () => {
  const msal = makeMsal();
  const calls = mockFetch([{ status: 200, body: {} }]);
  await make(msal).request('/orders');
  expect(calls[0].url).toBe('https://api.test/orders');
  expect(calls[0].options.headers.Authorization).toBe('Bearer cached-token');
  expect(msal.acquireTokenSilent.calls[0][0].scopes).toEqual(SCOPES);
  expect(msal.acquireTokenSilent.calls[0][0].account).toBe(account);
});

test('keeps the method, body and headers of the original request', async () => {
  const calls = mockFetch([{ status: 201, body: {} }]);
  await make(makeMsal()).request('/orders', { method: 'POST', body: '{"a":1}', headers: { 'Content-Type': 'application/json' } });
  expect(calls[0].options.method).toBe('POST');
  expect(calls[0].options.body).toBe('{"a":1}');
  expect(calls[0].options.headers['Content-Type']).toBe('application/json');
});

test('throws "No signed-in account" and never calls the API', async () => {
  const calls = mockFetch([{ status: 200 }]);
  const msal = makeMsal({ getActiveAccount: () => null, getAllAccounts: () => [] });
  const error = await rejects(make(msal).request('/orders'));
  expect(error.message).toBe('No signed-in account');
  expect(calls.length).toBe(0);
});

test('on 401 it requests a fresh token (forceRefresh) and retries once', async () => {
  const msal = makeMsal();
  const calls = mockFetch((url, options) => (options.headers.Authorization === 'Bearer fresh-token' ? { status: 200, body: { ok: true } } : { status: 401 }));
  const res = await make(msal).request('/orders');
  expect(res.status).toBe(200);
  expect(msal.acquireTokenSilent.callCount).toBe(2);
  expect(msal.acquireTokenSilent.calls[0][0].forceRefresh).toBeFalsy();
  expect(msal.acquireTokenSilent.calls[1][0].forceRefresh).toBe(true);
  expect(calls.length).toBe(2);
});

test('never loops: a second 401 is simply returned', async () => {
  const msal = makeMsal();
  const calls = mockFetch([{ status: 401 }]);
  const res = await make(msal).request('/orders');
  expect(res.status).toBe(401);
  expect(msal.acquireTokenSilent.callCount).toBe(2);
  expect(calls.length).toBe(2);
});

test('other statuses (500) are returned without refreshing', async () => {
  const msal = makeMsal();
  mockFetch([{ status: 500 }]);
  const res = await make(msal).request('/orders');
  expect(res.status).toBe(500);
  expect(msal.acquireTokenSilent.callCount).toBe(1);
});

test('uses a popup when silent acquisition needs interaction', async () => {
  const msal = makeMsal({ acquireTokenSilent: spy(async () => { throw interaction(); }) });
  const calls = mockFetch([{ status: 200, body: {} }]);
  await make(msal).request('/orders');
  expect(msal.acquireTokenPopup.callCount).toBe(1);
  expect(calls[0].options.headers.Authorization).toBe('Bearer popup-token');
});

test('other token errors are rethrown — no popup, no API call', async () => {
  const msal = makeMsal({ acquireTokenSilent: spy(async () => { throw new Error('network down'); }) });
  const calls = mockFetch([{ status: 200, body: {} }]);
  const error = await rejects(make(msal).request('/orders'));
  expect(error.message).toBe('network down');
  expect(msal.acquireTokenPopup.callCount).toBe(0);
  expect(calls.length).toBe(0);
});

test('does not open a popup when silent acquisition works', async () => {
  const msal = makeMsal();
  mockFetch([{ status: 200, body: {} }]);
  await make(msal).request('/orders');
  expect(msal.acquireTokenPopup.callCount).toBe(0);
});
