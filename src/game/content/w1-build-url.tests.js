const { buildUrl } = exports;

test('adds params as a query string (spaces become +)', () => {
  expect(buildUrl('/api/users', { page: 2, q: 'ada lovelace' })).toBe('/api/users?page=2&q=ada+lovelace');
});

test('skips undefined and null values', () => {
  expect(buildUrl('/x', { a: 1, b: undefined, c: null })).toBe('/x?a=1');
});

test('keeps 0 and false (they are real values!)', () => {
  expect(buildUrl('/x', { page: 0, active: false })).toBe('/x?page=0&active=false');
});

test('repeats the key for arrays', () => {
  expect(buildUrl('/x', { tag: ['a', 'b'] })).toBe('/x?tag=a&tag=b');
});

test('encodes reserved characters like & and =', () => {
  expect(buildUrl('/x', { q: 'a&b=c' })).toBe('/x?q=a%26b%3Dc');
});

test('returns the base url when there is nothing to add', () => {
  expect(buildUrl('/x')).toBe('/x');
  expect(buildUrl('/x', {})).toBe('/x');
  expect(buildUrl('/x', { only: undefined })).toBe('/x');
});

test('continues an existing query string with &', () => {
  expect(buildUrl('/x?lang=en', { page: 1 })).toBe('/x?lang=en&page=1');
});
