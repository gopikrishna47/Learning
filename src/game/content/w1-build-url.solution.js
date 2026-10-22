function buildUrl(base, params = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) value.forEach((item) => query.append(key, item));
    else query.append(key, value);
  }
  const qs = query.toString();
  if (!qs) return base;
  return base + (base.includes('?') ? '&' : '?') + qs;
}
