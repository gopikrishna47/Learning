// BOSS: a resilient fetch.
//
// fetchWithRetry(url, options, { retries = 3, baseDelay = 100 })
//   • returns the response as soon as it is ok
//   • retry on network errors, HTTP 429 and HTTP 5xx
//   • do NOT retry other 4xx → throw new Error(`HTTP ${status}` ) immediately
//   • wait baseDelay * 2^(n-1) ms before retry n  (100, 200, 400 …)
//   • 1 first try + `retries` retries; then throw the last error
async function fetchWithRetry(url, options = {}, { retries = 3, baseDelay = 100 } = {}) {
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

}
