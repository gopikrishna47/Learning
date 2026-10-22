import { useEffect, useState } from 'react';

/**
 * Runs `loader()` whenever `key` changes and reports { loading, value, error }.
 * `key === null` keeps the hook idle (nothing is loaded). The loader should be
 * a cached function from src/data, so repeated keys resolve instantly.
 */
export default function useLoaded(key, loader) {
  const [state, setState] = useState({ key: null, value: null, error: null });

  useEffect(() => {
    if (key === null) return undefined;
    let alive = true;
    loader().then(
      (value) => { if (alive) setState({ key, value, error: null }); },
      (error) => { if (alive) setState({ key, value: null, error }); },
    );
    return () => { alive = false; };
    // `loader` is always derived from `key`, so `key` alone is the dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (key === null || state.key !== key) return { loading: key !== null, value: null, error: null };
  return { loading: false, value: state.value, error: state.error };
}
