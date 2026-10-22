function createAuthClient({ baseUrl }) {
  let token = null;
  let refreshing = null;

  async function login(email, password) {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    ({ accessToken: token } = await res.json());
  }

  function refresh() {
    if (!refreshing) {
      refreshing = fetch(`${baseUrl}/auth/refresh`, { method: 'POST', credentials: 'include' })
        .then(async (res) => {
          if (!res.ok) throw new Error('Session expired');
          ({ accessToken: token } = await res.json());
        })
        .catch((err) => {
          token = null;
          throw err;
        })
        .finally(() => {
          refreshing = null;
        });
    }
    return refreshing;
  }

  function send(path, options) {
    return fetch(`${baseUrl}${path}`, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${token}` },
    });
  }

  async function request(path, options = {}) {
    if (!token) throw new Error('Not authenticated');
    const res = await send(path, options);
    if (res.status !== 401) return res;
    await refresh();
    return send(path, options);
  }

  function logout() {
    token = null;
  }

  return { login, request, logout };
}
