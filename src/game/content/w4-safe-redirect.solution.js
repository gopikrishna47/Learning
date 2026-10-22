function isSafeRedirect(url) {
  if (typeof url !== 'string') return false;
  if (!url.startsWith('/') || url.startsWith('//')) return false;
  if (/[\x00-\x1f\x7f\s\\]/.test(url)) return false;
  return true;
}
