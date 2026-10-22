// decodeJwt is provided — you wrote it in the last level.
function decodeJwt(token) {
  const parts = typeof token === 'string' ? token.split('.') : [];
  if (parts.length !== 3) throw new Error('Invalid token');
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    throw new Error('Invalid token');
  }
}

// Goal: should we refresh this token before using it?
function isTokenExpired(token, skewSeconds = 30) {
  // - `exp` is in SECONDS since epoch, Date.now() is in MILLISECONDS
  // - count the token as expired `skewSeconds` EARLY (clock drift + request time)
  // - no exp claim, or a malformed token → expired (fail closed!)
}
