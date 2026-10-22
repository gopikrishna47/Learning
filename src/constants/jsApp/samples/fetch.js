export async function request(url, { method = 'GET', body, timeoutMs = 8000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    // fetch only rejects on network failure, so check HTTP status yourself
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

const user = await request('/api/login', {
  method: 'POST',
  body: { email: 'asha@example.com', password: 'secret123' },
});
