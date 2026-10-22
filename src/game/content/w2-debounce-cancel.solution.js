function debounceWithCancel(fn, wait) {
  let timer = null;
  let lastArgs = null;
  let lastThis;

  function run() {
    timer = null;
    const args = lastArgs;
    lastArgs = null;
    fn.apply(lastThis, args);
  }

  function debounced(...args) {
    lastArgs = args;
    lastThis = this;
    clearTimeout(timer);
    timer = setTimeout(run, wait);
  }

  debounced.cancel = () => {
    clearTimeout(timer);
    timer = null;
    lastArgs = null;
  };

  debounced.flush = () => {
    if (timer === null) return;
    clearTimeout(timer);
    run();
  };

  return debounced;
}
