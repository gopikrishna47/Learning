function throttle(fn, wait) {
  let lastCall = 0;
  let timer = null;
  let pendingArgs = null;
  return function (...args) {
    const now = Date.now();
    const remaining = wait - (now - lastCall);
    if (remaining <= 0) {
      if (timer) { clearTimeout(timer); timer = null; }
      pendingArgs = null;
      lastCall = now;
      fn.apply(this, args);
    } else {
      pendingArgs = args;
      if (!timer) {
        timer = setTimeout(() => {
          timer = null;
          lastCall = Date.now();
          const latest = pendingArgs;
          pendingArgs = null;
          fn.apply(this, latest);
        }, remaining);
      }
    }
  };
}
