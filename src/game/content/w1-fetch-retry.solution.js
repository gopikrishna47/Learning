async function fetchWithRetry(url, options = {}, { retries = 3, baseDelay = 100 } = {}) {
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) await sleep(baseDelay * 2 ** (attempt - 1));
    let res;
    try {
      res = await fetch(url, options);
    } catch (err) {
      lastError = err;
      continue;
    }
    if (res.ok) return res;
    lastError = new Error(`HTTP ${res.status}`);
    if (res.status !== 429 && res.status < 500) throw lastError;
  }
  throw lastError;
}
