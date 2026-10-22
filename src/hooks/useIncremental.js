import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Progressive rendering for long lists: show `step` items first and add more
 * as the sentinel scrolls near the viewport. Resets when `resetKey` changes.
 * Returns { count, sentinelRef, hasMore }.
 */
export default function useIncremental(total, resetKey, step = 40) {
  const [count, setCount] = useState(step);
  const observerRef = useRef(null);

  useEffect(() => { setCount(step); }, [resetKey, step]);

  const sentinelRef = useCallback((node) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) setCount((c) => c + step);
    }, { rootMargin: '600px 0px' });
    observerRef.current.observe(node);
  }, [step]);

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return { count: Math.min(count, total), sentinelRef, hasMore: count < total };
}
