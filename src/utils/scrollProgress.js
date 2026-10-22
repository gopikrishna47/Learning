// One shared, rAF-throttled scroll listener for the whole app.
// Scroll position is NOT kept in Redux/React state: re-rendering the page tree
// on every scroll tick is the single most expensive thing a scroll handler can do.
const listeners = new Set();
let progress = 0;
let frame = 0;
let attached = false;

function compute() {
  frame = 0;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const next = max > 0 ? Math.round((window.scrollY / max) * 1000) / 10 : 0;
  if (next === progress) return;
  progress = next;
  listeners.forEach((fn) => fn(progress));
}

const onScroll = () => { if (!frame) frame = requestAnimationFrame(compute); };

function attach() {
  if (attached) return;
  attached = true;
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  compute();
}

function detach() {
  if (!attached || listeners.size) return;
  attached = false;
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('resize', onScroll);
  if (frame) { cancelAnimationFrame(frame); frame = 0; }
}

export function subscribeScrollProgress(fn) {
  listeners.add(fn);
  attach();
  fn(progress);
  return () => { listeners.delete(fn); detach(); };
}

export const getScrollProgress = () => progress;
