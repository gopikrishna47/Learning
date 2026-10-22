function createManagedIdentityTokenProvider(resource) {
  let cached = null;
  let inFlight = null;
  const url =
    'http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=' +
    encodeURIComponent(resource);

  async function fetchToken() {
    const res = await fetch(url, { headers: { Metadata: 'true' } });
    if (!res.ok) throw new Error(`IMDS ${res.status}`);
    const body = await res.json();
    cached = { token: body.access_token, expiresAt: Number(body.expires_on) * 1000 };
    return cached.token;
  }

  return async function getToken() {
    if (cached && Date.now() < cached.expiresAt - 60000) return cached.token;
    if (!inFlight) inFlight = fetchToken().finally(() => { inFlight = null; });
    return inFlight;
  };
}
