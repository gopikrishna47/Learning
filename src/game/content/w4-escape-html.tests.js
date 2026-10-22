const { escapeHtml } = exports;

test('defuses a <script> tag', () => {
  expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
});

test('stops attribute injection with double quotes', () => {
  expect(escapeHtml('" onmouseover="alert(1)')).toBe('&quot; onmouseover=&quot;alert(1)');
});

test('escapes single quotes too', () => {
  expect(escapeHtml("it's")).toBe('it&#39;s');
});

test('escapes & first, so nothing gets double-escaped wrongly', () => {
  expect(escapeHtml('a & b < c')).toBe('a &amp; b &lt; c');
  expect(escapeHtml('&lt;')).toBe('&amp;lt;');
});

test('null and undefined become an empty string', () => {
  expect(escapeHtml(null)).toBe('');
  expect(escapeHtml(undefined)).toBe('');
});

test('numbers and other values are converted to strings', () => {
  expect(escapeHtml(42)).toBe('42');
  expect(escapeHtml(false)).toBe('false');
});

test('leaves safe text alone', () => {
  expect(escapeHtml('Hello, Ada! 1 + 1 = 2')).toBe('Hello, Ada! 1 + 1 = 2');
});
