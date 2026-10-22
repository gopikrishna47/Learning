// BOSS: an API client powered by MSAL.
//
// const api = createMsalApiClient(msal, { baseUrl, scopes })
// api.request(path, options = {})
//
//   • token: the active (or first cached) account → acquireTokenSilent({ scopes, account, forceRefresh })
//            no account → throw new Error('No signed-in account') — and never call the API
//            silent says InteractionRequiredAuthError → acquireTokenPopup({ scopes, account })
//   • call fetch(baseUrl + path) with  Authorization: `Bearer ${token}`  (keep method/body/headers)
//   • 401 → the cached token may be revoked: get a token again with forceRefresh: true
//           and retry ONCE; if that is also 401 just return it (no loops)
//   • any other status → return the response as it is
function createMsalApiClient(msal, { baseUrl, scopes }) {

}
