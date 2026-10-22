// Web Worker entry: runs a code level's tests off the main thread, so an
// infinite loop in player code can never freeze the page (the host terminates us).
import { runChallenge } from './runnerCore.js';

self.addEventListener('unhandledrejection', (event) => event.preventDefault());

self.onmessage = async ({ data }) => {
  const { code, exports, tests } = data;
  try {
    const summary = await runChallenge({
      code,
      exports,
      tests,
      onResult: (result) => self.postMessage({ type: 'result', result }),
    });
    self.postMessage({ type: 'done', summary });
  } catch (error) {
    self.postMessage({ type: 'done', summary: { ok: false, compileError: String(error && error.message ? error.message : error), results: [], logs: [] } });
  }
};
