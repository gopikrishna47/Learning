const toB64Url = (value) => {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const makeToken = (payload) => `${toB64Url({ alg: 'HS256', typ: 'JWT' })}.${toB64Url(payload)}.signature`;
const { decodeJwt } = exports;

test('returns the payload of a valid token', () => {
  const token = makeToken({ sub: '42', name: 'Ada', admin: true });
  expect(decodeJwt(token)).toEqual({ sub: '42', name: 'Ada', admin: true });
});

test('understands URL-safe base64 (- and _ instead of + and /)', () => {
  const token = makeToken({ q: '>>>???~~~' });
  expect(/[-_]/.test(token.split('.')[1])).toBe(true);   // sanity check of the test itself
  expect(decodeJwt(token)).toEqual({ q: '>>>???~~~' });
});

test('copes with missing "=" padding (any length)', () => {
  expect(decodeJwt(makeToken({ a: 'x' }))).toEqual({ a: 'x' });
  expect(decodeJwt(makeToken({ a: 'xx' }))).toEqual({ a: 'xx' });
  expect(decodeJwt(makeToken({ a: 'xxx' }))).toEqual({ a: 'xxx' });
});

test('decodes unicode correctly', () => {
  expect(decodeJwt(makeToken({ name: 'Zoë 🚀 José' }))).toEqual({ name: 'Zoë 🚀 José' });
});

test('throws "Invalid token" when there are not exactly 3 parts', () => {
  expect(() => decodeJwt('abc')).toThrow(/Invalid token/);
  expect(() => decodeJwt('a.b')).toThrow(/Invalid token/);
  expect(() => decodeJwt('a.b.c.d')).toThrow(/Invalid token/);
});

test('throws "Invalid token" when the payload is not valid JSON / base64', () => {
  expect(() => decodeJwt('a.b.c')).toThrow(/Invalid token/);
  expect(() => decodeJwt(`x.${btoa('not json')}.y`)).toThrow(/Invalid token/);
});

test('throws "Invalid token" for non-strings', () => {
  expect(() => decodeJwt(undefined)).toThrow(/Invalid token/);
  expect(() => decodeJwt(12345)).toThrow(/Invalid token/);
});
