function memoize(fn, resolver = (...args) => JSON.stringify(args)) {
  const cache = new Map();
  return function (...args) {
    const key = resolver(...args);
    if (cache.has(key)) return cache.get(key);
    const value = fn.apply(this, args);
    cache.set(key, value);
    return value;
  };
}
