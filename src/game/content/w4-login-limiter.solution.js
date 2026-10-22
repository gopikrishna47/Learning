function createLoginLimiter({ maxAttempts = 5, windowMs = 60000, lockMs = 300000 } = {}) {
  const entries = new Map();

  function entry(key) {
    if (!entries.has(key)) entries.set(key, { failures: [], lockedUntil: 0 });
    return entries.get(key);
  }

  return {
    check(key) {
      const e = entry(key);
      const now = Date.now();
      if (e.lockedUntil > now) return { allowed: false, retryAfterMs: e.lockedUntil - now };
      if (e.lockedUntil) {
        e.lockedUntil = 0;
        e.failures = [];
      }
      return { allowed: true };
    },
    fail(key) {
      const e = entry(key);
      const now = Date.now();
      e.failures = e.failures.filter((t) => now - t < windowMs);
      e.failures.push(now);
      if (e.failures.length >= maxAttempts) e.lockedUntil = now + lockMs;
    },
    success(key) {
      entries.delete(key);
    },
  };
}
