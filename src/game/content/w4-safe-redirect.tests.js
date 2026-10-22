const { isSafeRedirect } = exports;

test('allows normal in-site paths', () => {
  for (const url of ['/', '/dashboard', '/a/b/c', '/profile?tab=security#top']) {
    expect(isSafeRedirect(url)).toBe(true);
  }
});

test('blocks absolute URLs to other sites', () => {
  expect(isSafeRedirect('https://evil.com')).toBe(false);
  expect(isSafeRedirect('http://localhost:3000/admin')).toBe(false);
});

test('blocks protocol-relative URLs (//evil.com)', () => {
  expect(isSafeRedirect('//evil.com')).toBe(false);
});

test('blocks backslash tricks (/\\evil.com)', () => {
  expect(isSafeRedirect('/\\evil.com')).toBe(false);
});

test('blocks javascript: and data: URLs', () => {
  expect(isSafeRedirect('javascript:alert(1)')).toBe(false);
  expect(isSafeRedirect('data:text/html,<script>alert(1)</script>')).toBe(false);
});

test('blocks paths without a leading slash', () => {
  expect(isSafeRedirect('dashboard')).toBe(false);
  expect(isSafeRedirect('')).toBe(false);
});

test('blocks tabs/newlines that browsers strip (/\t/evil.com becomes //evil.com)', () => {
  expect(isSafeRedirect('/\t/evil.com')).toBe(false);
  expect(isSafeRedirect('/\n/evil.com')).toBe(false);
});

test('blocks non-strings', () => {
  expect(isSafeRedirect(null)).toBe(false);
  expect(isSafeRedirect(undefined)).toBe(false);
  expect(isSafeRedirect(123)).toBe(false);
});
