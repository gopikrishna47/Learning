// Goal: give up on a request that takes too long.
async function fetchWithTimeout(url, ms, options = {}) {
  // 1. create an AbortController and pass its signal to fetch
  // 2. abort it after `ms` milliseconds
  // 3. when aborted, throw new Error(`Request timed out after ${ms}ms`)
  // 4. always clear the timer when the request finishes
}
