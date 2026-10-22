// BOSS: an API client that handles login, bearer tokens and silent refresh.
//
// const client = createAuthClient({ baseUrl })
//
// client.login(email, password)
//    POST {baseUrl}/auth/login  (JSON body + Content-Type header)
//    → { accessToken }  keep it IN MEMORY (a variable) — not localStorage!
//    not ok → throw new Error('Login failed')
//
// client.request(path, options = {})
//    no token yet → throw new Error('Not authenticated')
//    fetch({baseUrl}{path}) with header  Authorization: `Bearer ${token}`  (keep other headers)
//    on 401 → refresh ONCE:  POST {baseUrl}/auth/refresh  (credentials: 'include')
//             → { accessToken }, then retry the request once with the new token
//             refresh fails → forget the token, throw new Error('Session expired')
//    several requests hitting 401 at the same time must share ONE refresh call
//    if the retry is also 401, just return that response (no endless loop)
//
// client.logout()  → forget the token
function createAuthClient({ baseUrl }) {

}
