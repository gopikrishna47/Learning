// Goal: read the claims inside a JWT (without verifying — that's the server's job!).
function decodeJwt(token) {
  // 1. split on "."  → exactly 3 parts, otherwise throw new Error('Invalid token')
  // 2. the payload is the middle part, encoded as base64URL:
  //      replace "-" with "+" and "_" with "/", then pad with "=" to a multiple of 4
  // 3. atob() gives binary text — turn it into proper UTF-8, then JSON.parse it
  // 4. if anything goes wrong → throw new Error('Invalid token')
}
