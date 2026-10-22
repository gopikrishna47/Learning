import { code, quiz } from './helpers.js';

export default {
  id: 'w2',
  title: 'Timing Temple',
  icon: '⏱️',
  color: '#fbbf24',
  blurb: 'Debouncing, throttling and race conditions — the performance topics every UI interview asks about.',
  levels: [
    quiz('w2-quiz-timing', {
      title: 'Debounce vs Throttle',
      difficulty: 'Easy',
      xp: 60,
      story: 'Two tools, two jobs. Pick the right one.',
      questions: [
        {
          q: 'A search box should call the API once, after the user pauses typing. Which technique fits?',
          options: ['Throttle at one call per second', 'Debounce (~300 ms)', 'Memoization', '`setInterval` polling'],
          answer: 1,
          explain: 'Debounce waits until activity stops. Perfect for typeahead, autosave and resize-end handlers.',
        },
        {
          q: 'A scroll handler updates a reading-progress bar while the user keeps scrolling. Which technique fits?',
          options: ['Debounce — update when scrolling stops', 'Throttle — update at a steady rate', 'Neither — attach it to every event', 'Debounce with a 5 s delay'],
          answer: 1,
          explain: 'Throttle guarantees a steady maximum rate DURING continuous activity. A debounced handler would not update at all until the user stops scrolling.',
        },
        {
          q: '`debounce(save, 300)` is called every 100 ms for two straight seconds. How often does `save` run?',
          options: ['Every 300 ms', 'Every 100 ms', 'Once — 300 ms after the final call', 'Never'],
          answer: 2,
          explain: 'Every call resets the timer, so nothing fires until the calls stop. That is exactly why debounce is the wrong tool for steady feedback.',
        },
      ],
      learn: 'One-liner for interviews: "Debounce = wait for quiet. Throttle = at most once per interval."',
    }),
    code('w2-debounce', {
      title: 'The Patient Function',
      difficulty: 'Medium',
      xp: 100,
      exports: ['debounce'],
      story: 'Every keystroke fires an API call and the backend is on fire.',
      goal: 'Write `debounce(fn, wait)`: call `fn` only after `wait` ms without new calls, using the latest arguments and the right `this`.',
      hints: [
        'Keep a `timer` variable in the closure. Each call cancels the old timer and starts a new one.',
        '1) `let timer`\n2) `return function (...args) {`\n3)   `clearTimeout(timer)`\n4)   `timer = setTimeout(() => fn.apply(this, args), wait)`\n5) `}` — use a regular function (not an arrow) so `this` is the caller\'s',
      ],
      learn: 'Classic gotcha: arrow function wrappers lose the caller\'s `this`. In React, create the debounced function once (`useMemo` / `useRef`) — otherwise every render makes a new timer.',
    }),
    code('w2-throttle', {
      title: 'The Metronome',
      difficulty: 'Medium',
      xp: 120,
      exports: ['throttle'],
      story: 'A scroll handler runs 200 times a second and the page stutters.',
      goal: 'Write `throttle(fn, wait)`: run immediately on the first call, then at most once per `wait` ms — with one trailing call using the latest arguments.',
      hints: [
        'Remember when `fn` last ran (`Date.now()`). If at least `wait` ms have passed, run now. Otherwise store the latest args and schedule ONE timer for the remaining time.',
        '1) `remaining = wait - (Date.now() - lastCall)`\n2) `remaining <= 0` → clear any timer, `lastCall = now`, call fn\n3) otherwise save `pendingArgs`; if no timer yet → `setTimeout(…, remaining)`\n4) in the timer: `lastCall = Date.now()`, clear the timer, call fn with the latest saved args',
      ],
      learn: 'Leading + trailing edges is what lodash does by default. The trailing call matters: without it the final scroll position is never processed.',
    }),
    code('w2-debounce-cancel', {
      title: 'Cancel & Flush',
      difficulty: 'Medium',
      xp: 120,
      exports: ['debounceWithCancel'],
      story: 'The user navigated away, but your debounced save fired afterwards — on an unmounted component.',
      goal: 'Extend debounce with `.cancel()` (drop the pending call) and `.flush()` (run the pending call right now).',
      hints: [
        'Store the latest args and `this` in variables so `flush` can run the call later. `cancel` just clears the timer and the saved args.',
        '1) `run()` → resets state and calls `fn.apply(lastThis, args)`\n2) `debounced(...args)` saves args/this, clears the timer, sets `timer = setTimeout(run, wait)`\n3) `debounced.cancel` → `clearTimeout`, `timer = null`, `lastArgs = null`\n4) `debounced.flush` → if a timer is pending: `clearTimeout` and `run()`',
      ],
      learn: 'In React, call `.cancel()` in the effect cleanup and `.flush()` on blur / beforeunload so the last edit is never lost.',
    }),
    code('w2-typeahead', {
      title: 'Boss: The Race Condition',
      difficulty: 'Boss',
      xp: 250,
      exports: ['createSearch'],
      boss: { name: 'The Race Condition', emoji: '🏁', taunt: 'Slow responses arrive last — and overwrite the truth!' },
      story: 'The user typed "slow", then "fast". The slow response came back last and overwrote the right results. Classic.',
      goal: 'Write `createSearch(fetchResults, delay)`: debounced search that never calls the API for superseded queries and ignores stale responses (resolving `null`).',
      hints: [
        'Give every call an id (`++latestId`). When a response arrives, only the call whose id is still the latest may resolve with data; older ones resolve `null`.',
        '1) `search(query)`: `id = ++latestId`, clear the timer, resolve the previous waiting promise with `null`\n2) return a `new Promise` and start `setTimeout(async () => { … }, delay)`\n3) in the timer: mark "nothing waiting", `await fetchResults(query)`\n4) `resolve(id === latestId ? results : null)`; on error reject only if the call is still the latest',
      ],
      learn: 'This is the "typeahead race" — the real-world answer is AbortController (cancel the old request) plus an id/ref check. React Query and SWR do this for you.',
    }),
  ],
};
