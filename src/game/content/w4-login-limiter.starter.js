// BOSS: stop password brute-forcing.
//
// const limiter = createLoginLimiter({ maxAttempts: 5, windowMs: 60000, lockMs: 300000 })
//
// limiter.check(key)   → { allowed: true }
//                        or { allowed: false, retryAfterMs }   while the key is locked
// limiter.fail(key)    → record a failed login
// limiter.success(key) → forget everything about that key
//
// Rules
//   • `maxAttempts` failures within `windowMs` lock the key for `lockMs`
//     (counted from the last failure)
//   • failures older than `windowMs` are forgotten
//   • once the lock has expired, check() allows again and the key starts clean
//   • every key (email / IP) is tracked separately
function createLoginLimiter({ maxAttempts = 5, windowMs = 60000, lockMs = 300000 } = {}) {

}
