// Managed Identity (MSI): code running in Azure asks the local metadata endpoint
// for a token — no client secret anywhere in your code or config.
//
// createManagedIdentityTokenProvider(resource) → async getToken()
//   GET http://169.254.169.254/metadata/identity/oauth2/token
//       ?api-version=2018-02-01&resource=<encoded resource>
//   header:  Metadata: 'true'
//   response JSON: { access_token, expires_on }   (expires_on = epoch SECONDS, as a string)
//
//   • cache the token; fetch a new one when less than 60 s of life remain
//   • callers that arrive while a request is in flight share it (one request)
//   • not ok → throw new Error(`IMDS ${status}`) — and don't cache failures
function createManagedIdentityTokenProvider(resource) {

}
