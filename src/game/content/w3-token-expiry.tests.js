const toB64Url = (value) => {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const makeToken = (payload) => `${toB64Url({ alg: 'HS256', typ: 'JWT' })}.${toB64Url(payload)}.signature`;
const { isTokenExpired } = exports;
const nowSec = () => Math.floor(clock.now() / 1000);

test('a token that expires in an hour is still valid', () => {
  expect(isTokenExpired(makeToken({ exp: nowSec() + 3600 }))).toBe(false);
});

test('a token that expired a second ago is expired', () => {
  expect(isTokenExpired(makeToken({ exp: nowSec() - 1 }))).toBe(true);
});

test('counts a token as expired 30 seconds early by default', () => {
  expect(isTokenExpired(makeToken({ exp: nowSec() + 10 }))).toBe(true);
  expect(isTokenExpired(makeToken({ exp: nowSec() + 31 }))).toBe(false);
});

test('the skew can be changed (0 = exact)', () => {
  expect(isTokenExpired(makeToken({ exp: nowSec() + 10 }), 0)).toBe(false);
  expect(isTokenExpired(makeToken({ exp: nowSec() + 10 }), 60)).toBe(true);
});

test('time moves on: a valid token expires later (uses Date.now())', async () => {
  const token = makeToken({ exp: nowSec() + 60 });
  expect(isTokenExpired(token, 0)).toBe(false);
  await clock.tick(61000);
  expect(isTokenExpired(token, 0)).toBe(true);
});

test('fails closed: no exp claim means expired', () => {
  expect(isTokenExpired(makeToken({ sub: '1' }))).toBe(true);
});

test('fails closed: garbage is expired, not a crash', () => {
  expect(isTokenExpired('not-a-jwt')).toBe(true);
  expect(isTokenExpired(undefined)).toBe(true);
});
