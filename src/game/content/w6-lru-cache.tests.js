const { LRUCache } = exports;

test('stores and returns values', () => {
  const cache = new LRUCache(2);
  cache.put('a', 1);
  expect(cache.get('a')).toBe(1);
});

test('returns undefined for missing keys', () => {
  expect(new LRUCache(2).get('nope')).toBeUndefined();
});

test('evicts the least recently used key when full', () => {
  const cache = new LRUCache(2);
  cache.put('a', 1); cache.put('b', 2); cache.put('c', 3);
  expect(cache.has('a')).toBe(false);
  expect(cache.keys()).toEqual(['b', 'c']);
});

test('get() refreshes recency', () => {
  const cache = new LRUCache(2);
  cache.put('a', 1); cache.put('b', 2);
  cache.get('a');
  cache.put('c', 3);
  expect(cache.keys()).toEqual(['a', 'c']);
});

test('updating an existing key refreshes it and does not grow the cache', () => {
  const cache = new LRUCache(2);
  cache.put('a', 1); cache.put('b', 2);
  cache.put('a', 10);
  expect(cache.keys()).toEqual(['b', 'a']);
  expect(cache.get('a')).toBe(10);
});

test('has() does not change the order', () => {
  const cache = new LRUCache(2);
  cache.put('a', 1); cache.put('b', 2);
  cache.has('a');
  cache.put('c', 3);
  expect(cache.keys()).toEqual(['b', 'c']);
});

test('falsy values are still values', () => {
  const cache = new LRUCache(3);
  cache.put('zero', 0); cache.put('nil', null); cache.put('no', false);
  expect(cache.get('zero')).toBe(0);
  expect(cache.get('nil')).toBeNull();
  expect(cache.get('no')).toBe(false);
});

test('works with a capacity of 1', () => {
  const cache = new LRUCache(1);
  cache.put('a', 1); cache.put('b', 2);
  expect(cache.keys()).toEqual(['b']);
});
