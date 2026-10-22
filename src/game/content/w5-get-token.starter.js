// Goal: the classic MSAL pattern — try silently, fall back to interaction.
async function getAccessToken(msal, request) {
  // 1. account = msal.getActiveAccount() || msal.getAllAccounts()[0]
  //    nobody signed in → throw new Error('No signed-in account')
  // 2. try  msal.acquireTokenSilent({ ...request, account })  → return result.accessToken
  // 3. if the error's name is 'InteractionRequiredAuthError'
  //      → msal.acquireTokenPopup({ ...request, account })  → return its accessToken
  // 4. any other error → rethrow it unchanged
}
