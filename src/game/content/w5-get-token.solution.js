async function getAccessToken(msal, request) {
  const account = msal.getActiveAccount() || msal.getAllAccounts()[0];
  if (!account) throw new Error('No signed-in account');
  try {
    const result = await msal.acquireTokenSilent({ ...request, account });
    return result.accessToken;
  } catch (err) {
    if (err && err.name === 'InteractionRequiredAuthError') {
      const result = await msal.acquireTokenPopup({ ...request, account });
      return result.accessToken;
    }
    throw err;
  }
}
