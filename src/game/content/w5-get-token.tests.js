const { getAccessToken } = exports;
const account = { username: 'ada@contoso.com' };
const interaction = () => Object.assign(new Error('interaction_required'), { name: 'InteractionRequiredAuthError' });
const makeMsal = (overrides = {}) => ({
  getActiveAccount: () => null,
  getAllAccounts: () => [],
  acquireTokenSilent: spy(async () => ({ accessToken: 'silent-token' })),
  acquireTokenPopup: spy(async () => ({ accessToken: 'popup-token' })),
  ...overrides,
});

test('asks acquireTokenSilent for the active account and returns the token', async () => {
  const msal = makeMsal({ getActiveAccount: () => account });
  const token = await getAccessToken(msal, { scopes: ['User.Read'] });
  expect(token).toBe('silent-token');
  expect(msal.acquireTokenSilent.calls[0][0]).toEqual({ scopes: ['User.Read'], account });
});

test('falls back to the first cached account when none is active', async () => {
  const msal = makeMsal({ getAllAccounts: () => [account, { username: 'other@contoso.com' }] });
  await getAccessToken(msal, { scopes: ['User.Read'] });
  expect(msal.acquireTokenSilent.calls[0][0].account).toBe(account);
});

test('throws "No signed-in account" when nobody is signed in', async () => {
  const msal = makeMsal();
  const error = await rejects(getAccessToken(msal, { scopes: ['User.Read'] }));
  expect(error.message).toBe('No signed-in account');
  expect(msal.acquireTokenSilent.callCount).toBe(0);
});

test('opens a popup when silent acquisition needs interaction', async () => {
  const msal = makeMsal({
    getActiveAccount: () => account,
    acquireTokenSilent: spy(async () => { throw interaction(); }),
  });
  const token = await getAccessToken(msal, { scopes: ['api://x/read'] });
  expect(token).toBe('popup-token');
  expect(msal.acquireTokenPopup.calls[0][0].scopes).toEqual(['api://x/read']);
});

test('does NOT open a popup for other errors — it rethrows them', async () => {
  const msal = makeMsal({
    getActiveAccount: () => account,
    acquireTokenSilent: spy(async () => { throw new Error('network down'); }),
  });
  const error = await rejects(getAccessToken(msal, { scopes: ['x'] }));
  expect(error.message).toBe('network down');
  expect(msal.acquireTokenPopup.callCount).toBe(0);
});

test('does NOT open a popup when silent acquisition works', async () => {
  const msal = makeMsal({ getActiveAccount: () => account });
  await getAccessToken(msal, { scopes: ['x'] });
  expect(msal.acquireTokenPopup.callCount).toBe(0);
});
