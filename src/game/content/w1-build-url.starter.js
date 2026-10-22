// Goal: build a query string safely — never by hand-concatenating.
function buildUrl(base, params = {}) {
  // - skip params whose value is undefined or null (but keep 0 and false!)
  // - arrays repeat the key:  { tag: ['a', 'b'] }  →  ?tag=a&tag=b
  // - encode special characters
  // - if `base` already contains "?", continue with "&"
  // - no params at all → return base untouched
}
