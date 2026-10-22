import { code, quiz } from './helpers.js';

export default {
  id: 'w6',
  title: 'Code Crossroads',
  icon: '🧭',
  color: '#fb923c',
  blurb: 'The everyday interview classics: the event loop, closures, hooks, memoization, promises and caches.',
  levels: [
    quiz('w6-quiz-js', {
      title: 'Predict the Output',
      difficulty: 'Medium',
      xp: 80,
      story: 'No running code here — read it, think, answer.',
      questions: [
        {
          q: 'What is the order of the console output?',
          code: "console.log('A');\nsetTimeout(() => console.log('B'), 0);\nPromise.resolve().then(() => console.log('C'));\nconsole.log('D');",
          options: ['A B C D', 'A D B C', 'A D C B', 'A C D B'],
          answer: 2,
          explain: 'Synchronous code first (A, D). Then the microtask queue (promise callbacks → C) is drained before the next macrotask (timers → B).',
        },
        {
          q: 'What does this print?',
          code: 'for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}',
          options: ['0 1 2', '3 3 3', 'undefined ×3', '0 0 0'],
          answer: 1,
          explain: '`var` is function-scoped: all callbacks share one `i`, which is 3 when they finally run. Use `let` (a new binding per iteration) or a closure.',
        },
        {
          q: 'What does `["1", "2", "3"].map(parseInt)` return?',
          options: ['[1, 2, 3]', '[1, NaN, NaN]', '[NaN, NaN, NaN]', '[1, 2, NaN]'],
          answer: 1,
          explain: '`map` passes (value, index) and `parseInt` reads the second argument as the radix: `parseInt("2", 1)` and `parseInt("3", 2)` are NaN.',
        },
      ],
      learn: 'The event-loop answer in one sentence: "Run the call stack to empty, drain all microtasks, then take one macrotask — repeat."',
    }),
    code('w6-memoize', {
      title: 'The Remembering Function',
      difficulty: 'Medium',
      xp: 100,
      exports: ['memoize'],
      story: 'An expensive pure function is called with the same arguments again and again.',
      goal: 'Write `memoize(fn, resolver)`: cache results per key, cache `undefined` too, never cache errors, keep `this`.',
      hints: [
        'Use a `Map` keyed by `resolver(...args)` (default: `JSON.stringify(args)`). Check with `cache.has(key)`, not with `if (cache.get(key))`.',
        '1) `const cache = new Map()`\n2) `return function (...args) { const key = resolver(...args)`\n3) `if (cache.has(key)) return cache.get(key)`\n4) `const value = fn.apply(this, args)` (a throw skips the next line) → `cache.set(key, value)` → return',
      ],
      learn: 'Why `has` and not a truthiness check? Because `0`, `""`, `false` and `undefined` are legitimate cached results. In React, the same idea is `useMemo` / `useCallback` / `React.memo`.',
    }),
    code('w6-promise-all', {
      title: 'The Promise Keeper',
      difficulty: 'Hard',
      xp: 150,
      exports: ['promiseAll'],
      story: 'The interviewer smiles: "Implement Promise.all. No cheating."',
      goal: 'Write `promiseAll(items)`: resolve with results in the original order, reject on the first rejection, handle plain values and an empty array.',
      hints: [
        'Wrap each item in `Promise.resolve(item)` so plain values work. Store each result at its own index and count how many are left.',
        '1) `return new Promise((resolve, reject) => {`\n2) empty array → `resolve([])`\n3) `items.forEach((item, index) => Promise.resolve(item).then(value => { results[index] = value; if (--remaining === 0) resolve(results) }, reject))`',
      ],
      learn: 'Know the family: `all` (fail fast), `allSettled` (never rejects), `race` (first to settle), `any` (first to fulfil). Sequential vs parallel `await` is the usual follow-up.',
    }),
    quiz('w6-quiz-react', {
      title: 'Hooks & Effects',
      difficulty: 'Medium',
      xp: 90,
      story: 'React interviews love effects. Spot the bug.',
      questions: [
        {
          q: 'The counter stops at 1. Why?',
          code: 'useEffect(() => {\n  const id = setInterval(() => setCount(count + 1), 1000);\n  return () => clearInterval(id);\n}, []);',
          options: ['`setInterval` is not allowed in effects', 'The callback captured `count` from the first render (a stale closure) — use `setCount(c => c + 1)`', 'The cleanup runs too early', '`setCount` is asynchronous'],
          answer: 1,
          explain: 'With `[]` the effect runs once and closes over `count = 0`, so it keeps setting 1. A functional update reads the latest state without re-subscribing.',
        },
        {
          q: 'What is wrong with `useEffect(async () => { await load(); }, [])`?',
          options: ['Nothing — it is the recommended style', 'The effect callback returns a Promise, but React expects nothing or a cleanup function', 'Effects cannot call APIs', '`await` is not allowed in components'],
          answer: 1,
          explain: 'An `async` function always returns a Promise. Define an async function INSIDE the effect and call it (and return a real cleanup if needed).',
        },
        {
          q: 'In development with StrictMode your fetch effect runs twice. What is the right reaction?',
          options: ['Remove StrictMode', 'Expected: it surfaces missing cleanup — abort the request in the cleanup / make the effect idempotent', 'Add a `useRef` flag to skip the second run forever', 'Move the fetch into render'],
          answer: 1,
          explain: 'StrictMode intentionally mounts → unmounts → mounts to reveal effects that are not resilient. An AbortController cleanup (or a data library) handles it correctly.',
        },
      ],
      learn: 'Mental model: every render has its own props/state "snapshot"; effects see the snapshot of the render that created them.',
    }),
    code('w6-lru-cache', {
      title: 'Boss: The Cache Dragon',
      difficulty: 'Boss',
      xp: 300,
      exports: ['LRUCache'],
      boss: { name: 'The Cache Dragon', emoji: '🐲', taunt: 'I devour your oldest entries first!' },
      story: 'Memory is limited. Keep what was used recently — feed the dragon the rest.',
      goal: 'Implement `class LRUCache` with `get`, `put`, `has` and `keys`. Evict the least recently used key when over capacity; `get` and `put` refresh recency, `has` does not.',
      hints: [
        'A JavaScript `Map` remembers insertion order. To "refresh" a key: delete it and set it again — it moves to the end.',
        '1) constructor: `this.capacity`, `this.map = new Map()`\n2) `get`: missing → undefined; else delete + set again, return value\n3) `put`: delete if present, set, and while `size > capacity` delete `this.map.keys().next().value`\n4) `has` = `map.has`, `keys` = `[...map.keys()]`',
      ],
      learn: 'Both operations are O(1) with a Map (or hash map + doubly linked list in languages without ordered maps). Follow-ups: LFU, TTL expiry, memory-bounded caches.',
    }),
  ],
};
