// Main-thread side: a fresh Worker per run (clean state; terminate() kills infinite loops).
export function runLevelTests(level, code, { onResult, timeoutMs = 7000 } = {}) {
  return new Promise((resolve) => {
    const worker = new Worker(new URL('./runner.worker.js', import.meta.url), { type: 'module' });
    const partial = [];
    const finish = (summary) => { clearTimeout(timer); worker.terminate(); resolve(summary); };
    const timer = setTimeout(
      () => finish({ ok: false, timedOut: true, results: partial, logs: [], compileError: 'Your code ran for too long (7s) and was stopped — is there an infinite loop?' }),
      timeoutMs,
    );
    worker.onmessage = ({ data }) => {
      if (data.type === 'result') { partial.push(data.result); if (onResult) onResult(data.result); } else finish(data.summary);
    };
    worker.onerror = (event) => finish({ ok: false, results: partial, logs: [], compileError: event.message || 'The test runner crashed.' });
    worker.postMessage({ code, exports: level.exports, tests: level.tests });
  });
}
