// Goal: cache the results of a pure function.
function memoize(fn, resolver = (...args) => JSON.stringify(args)) {
  // return a function that remembers results per key (resolver(...args))
  // - cache hit → return the stored value without calling fn
  // - a result of `undefined` is a valid result and must be cached too
  // - if fn throws, don't cache anything
  // - keep `this`
}
