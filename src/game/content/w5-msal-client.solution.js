function createMsalApiClient(msal, { baseUrl, scopes }) {
  async function getToken(forceRefresh = false) {
    const account = msal.getActiveAccount() || msal.getAllAccounts()[0];
    if (!account) throw new Error('No signed-in account');
    const request = { scopes, account };
    try {
      const result = await msal.acquireTokenSilent({ ...request, forceRefresh });
      return result.accessToken;
    } catch (err) {
      if (err && err.name === 'InteractionRequiredAuthError') {
        const result = await msal.acquireTokenPopup(request);
        return result.accessToken;
      }
      throw err;
    }
  }

  function send(path, options, token) {
    return fetch(baseUrl + path, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${token}` },
    });
  }

  return {
    async request(path, options = {}) {
      const res = await send(path, options, await getToken());
      if (res.status !== 401) return res;
      return send(path, options, await getToken(true));
    },
  };
}
