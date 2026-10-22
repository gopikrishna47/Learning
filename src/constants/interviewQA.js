import { JS_APP_QA } from './jsApp/qa.js';
import { GUIDE_QA } from './guides/guideQA.js';

const BASE_INTERVIEW_QA = [
  // ─── JAVASCRIPT ───────────────────────────────────────────
  {
    id: 1, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is the output order of a Promise + setTimeout example? Explain the event loop.',
    answer: `This is the #1 JavaScript output question in interviews. The answer reveals whether you understand the event loop deeply.

JavaScript runs on a single thread with a structured execution model:

1. Synchronous code — runs immediately, top to bottom. Nothing else can run while this is executing.
2. Microtask queue (HIGH priority) — Promises (.then/.catch/.finally), queueMicrotask(), async/await continuations. After EVERY synchronous task completes, the event loop drains the ENTIRE microtask queue before moving on.
3. Macrotask queue (LOWER priority) — setTimeout, setInterval, I/O callbacks. Only ONE macrotask runs per event loop tick, then microtasks drain again.

Key insight: Even setTimeout(fn, 0) is a macrotask — it goes to the back of the queue after all microtasks have run.

Why does this matter in production? If you chain many Promises recursively, you can starve the macrotask queue — timers and UI rendering never get a turn. This is why requestAnimationFrame exists for visual work.`,
    code: `console.log('1 - sync');

setTimeout(() => console.log('4 - macrotask'), 0);

Promise.resolve()
  .then(() => console.log('2 - microtask 1'))
  .then(() => console.log('3 - microtask 2'));

console.log('still sync - runs before both');

// Output:
// 1 - sync
// still sync - runs before both
// 2 - microtask 1   ← microtask queue drains fully
// 3 - microtask 2   ← chained .then is also a microtask
// 4 - macrotask     ← only NOW does setTimeout run

// Trickier example interviewers love:
async function asyncFn() {
  console.log('A - sync inside async fn');
  await Promise.resolve();               // pause — resume as microtask
  console.log('C - after await (microtask)');
}
console.log('before asyncFn');
asyncFn();
console.log('B - sync after asyncFn call');
// Output: before asyncFn → A → B → C`,
    highlights: ['Sync runs first — nothing interrupts it', 'Microtask queue drains COMPLETELY before any macrotask', 'setTimeout(fn, 0) is still a macrotask — Promises beat it every time'],
  },
  {
    id: 2, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is the difference between var, let, and const?',
    answer: 'var is function-scoped and hoisted with undefined. let and const are block-scoped. const cannot be reassigned after initialization, but its object properties can still be mutated.',
    code: `if (true) {
  var a = 1;   // accessible outside block
  let b = 2;   // block-scoped
  const c = 3; // block-scoped, no reassign
}
console.log(a); // 1
console.log(b); // ReferenceError`,
    highlights: ['var is function-scoped', 'let/const are block-scoped', 'const prevents reassignment'],
  },
  {
    id: 3, category: 'JavaScript', difficulty: 'Mid',
    question: 'How do closures work in JavaScript?',
    answer: 'A closure is a function that retains access to its outer scope even after the outer function has returned. This makes closures useful for data encapsulation, factory functions, and maintaining state without global variables.',
    code: `function makeCounter() {
  let count = 0;
  return () => ++count;
}
const counter = makeCounter();
console.log(counter()); // 1
console.log(counter()); // 2`,
    highlights: ['Retains outer scope', 'Useful for privacy', 'Enables stateful helpers'],
  },
  {
    id: 4, category: 'JavaScript', difficulty: 'Mid',
    question: 'Explain all Promise combinators: Promise.all, Promise.allSettled, Promise.race, Promise.any — differences, real use cases, and when to use which.',
    answer: `There are 4 Promise combinators. Interviewers expect you to know not just what they do, but WHEN to use each in production.

Promise.all(promises) — "Every promise must succeed"
Resolves when ALL resolve (with array of results in input order). Rejects immediately if ANY rejects (fail-fast). Use when all results are required and one failure means the whole operation should abort.
→ WHEN TO USE: Loading all data needed to render a page — user profile + their orders + their preferences. If any fails, show error. No partial data makes sense.

Promise.allSettled(promises) — "Wait for all, collect every outcome"
Always waits for all promises. Never rejects. Returns array of {status: 'fulfilled', value} or {status: 'rejected', reason}. Use when you want results from whatever succeeded even if some failed.
→ WHEN TO USE: Sending bulk notifications, batch API calls where you want a success/failure report for each item. Partial success is acceptable.

Promise.race(promises) — "First one wins — success OR failure"
Settles (resolve or reject) as soon as the FIRST promise settles. Ignores the rest.
→ WHEN TO USE: Implementing a timeout — race the real fetch against a timeout promise. Whichever completes first wins. If the timeout wins, you reject with "Request timed out."

Promise.any(promises) — "First success wins, ignore failures"
Resolves with the FIRST fulfilled promise. Only rejects if ALL promises reject (throws AggregateError with all rejection reasons). Ignores individual rejections.
→ WHEN TO USE: Trying multiple CDN URLs for the same resource — if CDN1 fails, CDN2 might work. You only care about getting one success.

Memory trick: all=strict AND | allSettled=report ALL | race=fastest ANY | any=first SUCCESS`,
    code: `// Promise.all — all-or-nothing, parallel fetching
async function loadDashboard(userId) {
  const [profile, orders, notifications] = await Promise.all([
    fetchProfile(userId),       // all 3 fire IN PARALLEL (not sequential!)
    fetchOrders(userId),
    fetchNotifications(userId),
  ]);
  return { profile, orders, notifications };
  // If ANY rejects → whole thing rejects. Show error page.
}

// Promise.allSettled — partial results acceptable
async function sendBulkEmails(users) {
  const results = await Promise.allSettled(
    users.map(user => sendEmail(user.email))
  );
  const succeeded = results.filter(r => r.status === 'fulfilled').length;
  const failed    = results.filter(r => r.status === 'rejected');
  console.log('Sent: ' + succeeded + ', Failed: ' + failed.length);
}

// Promise.race — timeout pattern (real production use)
function fetchWithTimeout(url, ms = 5000) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timed out after ' + ms + 'ms')), ms)
  );
  return Promise.race([fetch(url), timeout]);
}

// Promise.any — try multiple sources, use first success
async function loadImage(imageId) {
  return Promise.any([
    fetch('https://cdn1.example.com/' + imageId),
    fetch('https://cdn2.example.com/' + imageId),
    fetch('https://cdn3.example.com/' + imageId),
  ]);
  // Returns first CDN that responds. Throws AggregateError only if ALL fail.
}`,
    highlights: [
      'Promise.all: parallel fetching when ALL results are required — fails fast on any rejection',
      'Promise.allSettled: bulk ops where partial success is ok — never rejects, always resolves',
      'Promise.race: timeout pattern — first settler (win or lose) determines outcome',
      'Promise.any: fallback sources — first SUCCESS wins, ignores individual failures',
    ],
  },
  {
    id: 5, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is hoisting in JavaScript?',
    answer: 'Hoisting moves declarations to the top of their scope during compilation. var is hoisted and initialized to undefined. Function declarations are fully hoisted. let and const are hoisted but stay in the temporal dead zone until their line runs.',
    code: `console.log(name); // undefined (var hoisted)
var name = 'Alice';

console.log(age);  // ReferenceError (TDZ)
let age = 25;`,
    highlights: ['var hoisted with undefined', 'let/const in TDZ', 'Functions fully hoisted'],
  },
  {
    id: 6, category: 'JavaScript', difficulty: 'Mid',
    question: 'What is debouncing and throttling?',
    answer: 'Debouncing delays execution until after a quiet period — great for search inputs. Throttling limits execution to once per time window — great for scroll and resize handlers. Both reduce unnecessary function calls.',
    code: `function debounce(fn, delay) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}`,
    highlights: ['Debounce waits for calm', 'Throttle caps frequency', 'Both improve performance'],
  },
  {
    id: 7, category: 'JavaScript', difficulty: 'Mid',
    question: 'What is prototypal inheritance in JavaScript?',
    answer: 'Every JavaScript object has a prototype chain. When you access a property, the engine walks up the chain until it finds it or reaches null. ES6 classes are syntactic sugar over this prototype mechanism.',
    code: `const animal = { speak() { return 'Sound'; } };
const dog = Object.create(animal);
dog.bark = () => 'Woof';
console.log(dog.speak()); // inherited`,
    highlights: ['Chain of prototypes', 'Classes are sugar', 'Object.create sets prototype'],
  },
  {
    id: 8, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is the difference between null, undefined, and NaN?',
    answer: 'undefined means a variable was declared but never assigned. null is an intentional empty value set by the programmer. NaN is the result of invalid numeric operations like dividing a string by a number.',
    code: `let x;               // undefined
let user = null;     // intentional empty
console.log('a' * 2); // NaN
console.log(typeof NaN); // 'number' (quirk)`,
    highlights: ['undefined = uninitialized', 'null = deliberate empty', 'NaN = bad math'],
  },
  {
    id: 9, category: 'JavaScript', difficulty: 'Mid',
    question: 'What is event delegation in the DOM?',
    answer: 'Event delegation attaches a single listener to a parent element and uses event.target to identify which child was clicked. It handles dynamically added items automatically and reduces the total number of listeners.',
    code: `document.getElementById('list').addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    console.log('clicked:', e.target.textContent);
  }
});`,
    highlights: ['One listener on parent', 'Works for dynamic children', 'Reduces listener count'],
  },
  {
    id: 10, category: 'JavaScript', difficulty: 'Mid',
    question: 'What are Map and Set in JavaScript?',
    answer: 'Set stores unique values and is ideal for deduplication. Map stores key-value pairs where keys can be any type including objects, unlike plain objects which only allow string/symbol keys, and it preserves insertion order. WeakMap and WeakSet are the "weak" counterparts — they only accept object keys/values, held weakly so the garbage collector can reclaim them once nothing else references the object, and they are not enumerable. This makes them ideal for attaching private metadata to an object without causing a memory leak.',
    code: `const nums = new Set([1, 2, 2, 3]);
console.log([...nums]); // [1, 2, 3]

const cache = new Map();
cache.set({ id: 1 }, 'data');

// WeakMap: entry is garbage-collected once the key object has no other references
const privateData = new WeakMap();
privateData.set(someInstance, { secret: 'value' });`,
    highlights: ['Set = unique values', 'Map = any key type', 'Both are iterable'],
  },

  // ─── REACT ────────────────────────────────────────────────
  {
    id: 101, category: 'React', difficulty: 'Junior',
    question: 'Why do we need keys in a React list?',
    answer: `Keys give React a stable identity for each list item so it can figure out what changed, moved, or was removed — without re-rendering everything.

Think of it like name tags at a conference. When people leave and new ones arrive, the organiser checks the name tags to know who changed seats — without name tags, they'd have to guess by position and likely get it wrong.

React's reconciliation algorithm (the diffing process) uses keys to match old elements to new ones. Without keys, React assumes elements at the same index are the same element — so inserting at the top shifts every item and React re-renders ALL of them. With stable keys, React knows exactly which item was added, moved, or removed.

Why NOT use array index as key?
• If you insert at the top, all indexes shift → React thinks EVERYTHING changed
• Causes bugs with animated lists, forms with focus state, and optimistic UI
• Use index only for static, never-reordered lists

What makes a good key? A stable, unique ID from your data — like a database ID, UUID, or slug.`,
    code: `// ✅ Good: stable ID from data
{todos.map(todo => (
  <li key={todo.id}>{todo.text}</li>
))}

// ❌ Bad: index as key — breaks on insert/delete/reorder
{todos.map((todo, index) => (
  <li key={index}>{todo.text}</li>  // bugs: wrong items re-rendered
))}

// Why index keys break — example:
// List: [A, B, C] → insert D at top → [D, A, B, C]
// With index keys: React sees key=0 changed from A to D, key=1 from B to A...
// So it "updates" every single item — unnecessary and causes state bugs

// With ID keys: React sees new key="D" → creates D; A, B, C unchanged → fast ✅

// Keys must be unique among SIBLINGS only (not globally)
function NestedList({ sections }) {
  return sections.map(section => (
    <div key={section.id}>
      {section.items.map(item => (
        <span key={item.id}>{item.name}</span>  // same IDs OK in different sections
      ))}
    </div>
  ));
}`,
    highlights: ['Keys give React stable identity for reconciliation — wrong keys = wrong diffs', 'Array index as key breaks on insert/delete/reorder — causes subtle state bugs', 'Use stable unique IDs (database IDs, UUIDs) — never use Math.random() as key'],
  },
  {
    id: 102, category: 'React', difficulty: 'Junior',
    question: 'What is the difference between props and state?',
    answer: `Props and state are both ways to store data in React, but they serve completely different purposes.

Props (short for "properties") are like function arguments — a PARENT passes them to a child. The child cannot change props directly. They flow DOWN the component tree. If you want a child to update something in the parent, the parent passes a CALLBACK FUNCTION as a prop.

State is data that lives INSIDE a component. It belongs to that component. The component can read and update its own state using setState or the useState hook. Changing state triggers a re-render of that component and its children.

Simple analogy:
• Props = the inputs you receive from outside (you can read them, not change them)
• State = your own notebook (you own it and can write to it)

When to use which:
• Use props when a parent needs to control or configure a child
• Use state when a component needs to remember something between renders (count, form values, open/closed status)
• Lift state UP when multiple siblings need the same data`,
    code: `// Props flow DOWN from parent to child
function Parent() {
  const [name, setName] = useState('Gopi'); // parent owns this state

  return (
    <Child
      label={name}              // pass state as prop to child
      onRename={setName}        // pass callback so child can update parent's state
    />
  );
}

function Child({ label, onRename }) {
  // label is a prop — Child cannot change it directly
  // label: 'Gopi'

  return (
    <div>
      <p>Hello, {label}!</p>
      <button onClick={() => onRename('Alice')}>
        Rename {/* triggers parent's setState → re-renders both */}
      </button>
    </div>
  );
}

// State lives INSIDE a component
function Counter({ initialValue = 0 }) { // initialValue = prop (from parent)
  const [count, setCount] = useState(initialValue); // count = state (owned here)

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}`,
    highlights: ['Props come FROM parent — read-only inside child; use callbacks to send data back up', 'State is OWNED by the component — only that component can change it', 'Changing either props or state triggers a re-render of the component'],
  },
  {
    id: 103, category: 'React', difficulty: 'Mid',
    question: 'How does useEffect behave with its dependency array?',
    answer: `useEffect lets you run side effects (data fetching, subscriptions, timers, DOM changes) AFTER the browser finishes painting the screen. The dependency array controls WHEN it runs.

Three modes:
1. No array → runs after EVERY render (mount + every update). Rarely what you want.
2. Empty array [] → runs ONCE on mount, then the cleanup runs on unmount. Use for subscriptions and data fetching that should happen once.
3. Array with values [a, b] → runs when the component mounts AND whenever a or b changes. Compare previous value with next; if different, re-runs.

The cleanup function (the function you return) runs:
• Before the effect runs again (on next dependency change)
• When the component UNMOUNTS

Common bug — missing dependency: If you use count inside the effect but don't list it in deps, the effect closes over the INITIAL value of count and never sees updates. This is a stale closure bug. ESLint's exhaustive-deps rule catches this.

Run order: render → browser paints → useEffect runs. This means effects never block the browser from showing something.`,
    code: `// 1. No array — runs after EVERY render (use sparingly)
useEffect(() => {
  console.log('runs every time anything changes');
});

// 2. Empty array — runs ONCE on mount
useEffect(() => {
  const sub = eventBus.subscribe(handler);
  return () => sub.unsubscribe(); // cleanup on unmount
}, []);

// 3. Dependency array — runs when count changes
useEffect(() => {
  document.title = \`You clicked \${count} times\`;
}, [count]); // re-runs whenever count changes

// 4. Data fetching pattern with cleanup
useEffect(() => {
  let cancelled = false;

  async function loadData() {
    const data = await fetchUser(userId);
    if (!cancelled) setUser(data); // prevent stale update
  }

  loadData();
  return () => { cancelled = true; }; // cleanup on userId change or unmount
}, [userId]); // re-fetches when userId changes

// ❌ Stale closure bug — missing dependency
const [count, setCount] = useState(0);
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1); // count is stale! always 0 + 1 = 1
  }, 1000);
  return () => clearInterval(id);
}, []); // count is missing from deps

// ✅ Fix: functional update avoids stale closure
setCount(prev => prev + 1); // doesn't need count in deps`,
    highlights: ['[] = mount once | [deps] = on change | no array = every render', 'Return a cleanup function to cancel subscriptions, timers, fetch requests', 'Missing dependency = stale closure bug — value inside effect never updates'],
  },
  {
    id: 104, category: 'React', difficulty: 'Mid',
    question: 'When should you use useMemo and useCallback?',
    answer: `useMemo and useCallback are both about CACHING — preventing React from re-doing work that hasn't changed.

useMemo caches the RESULT of a computation. If the inputs haven't changed, it returns the cached result without running the function again. Use it for expensive calculations (sorting 10,000 items, filtering a huge list, complex math).

useCallback caches a FUNCTION REFERENCE. Without it, every time a component re-renders, a new function object is created (even if the logic is identical). This matters when you pass functions as props to child components wrapped in React.memo — a new function reference would break memoization and cause unnecessary re-renders.

The golden rule: DON'T add these by default. Every hook has a cost — extra memory, extra comparison work. Add useMemo/useCallback ONLY when you can measure the benefit (React DevTools Profiler).

When useMemo helps:
• Expensive computation (sorting, filtering large arrays, complex math)
• Derived data used by multiple children
• As a dependency for another hook (prevents infinite re-render loops)

When useCallback helps:
• Passing a function to a React.memo child — stable ref prevents needless re-renders
• Function is a dependency in a useEffect`,
    code: `// useMemo — cache expensive computation
const sortedUsers = useMemo(
  () => [...users].sort((a, b) => a.name.localeCompare(b.name)),
  [users] // only re-sorts when users array changes
);

// Without useMemo: sorts on EVERY render even if users didn't change
// With useMemo: sorts only when users changes — huge win with large arrays

// useCallback — stable function reference for memoized children
const handleDelete = useCallback(
  (id) => dispatch({ type: 'DELETE', id }),
  [dispatch] // dispatch from useReducer is already stable, so this is very stable
);

// Why useCallback matters here:
const UserList = React.memo(({ onDelete }) => { // React.memo skips re-render if props same
  return <ul>{users.map(u => <li key={u.id} onClick={() => onDelete(u.id)}>{u.name}</li>)}</ul>;
});

// Without useCallback: onDelete is a new function every render → React.memo always re-renders
// With useCallback: same reference → React.memo skips unnecessary re-renders ✅

// ❌ DON'T memoize trivial things — adds overhead for no gain:
const double = useMemo(() => count * 2, [count]); // pointless — just write count * 2
const handleClick = useCallback(() => setOpen(true), []); // only useful if passed to React.memo child`,
    highlights: ['useMemo = cache expensive computed VALUE (sorting, filtering)', 'useCallback = cache FUNCTION REFERENCE (prevents breaking React.memo children)', 'Profile first — both hooks have memory and comparison cost; only add when measured'],
  },
  {
    id: 105, category: 'React', difficulty: 'Mid',
    question: 'What is prop drilling and how do you avoid it?',
    answer: 'Prop drilling is passing data through many component layers that don\'t need it themselves, just to reach a deeply nested child. It can be solved with the Context API for globally needed data like theme or auth, a state management library (Redux, Zustand) for larger cross-cutting state, or composition patterns — passing components as children/props so intermediate layers don\'t need to know about the data at all.',
    code: `const ThemeCtx = createContext('light');

function App() {
  return (
    <ThemeCtx.Provider value="dark">
      <DeepChild />
    </ThemeCtx.Provider>
  );
}
const theme = useContext(ThemeCtx);`,
    highlights: ['Context avoids drilling', 'Good for theme/auth', 'Composition also helps'],
  },
  {
    id: 106, category: 'React', difficulty: 'Mid',
    question: 'What is the difference between useState and useReducer?',
    answer: `Both manage state in React, but they suit different complexity levels.

useState is simple and direct — you call setState with the new value. Great for a single value or a few independent pieces of data.

useReducer thinks in ACTIONS and TRANSITIONS. Instead of "set count to 5", you dispatch an action like { type: 'INCREMENT' } and a pure reducer function decides what the new state should be. This is exactly how Redux works at its core.

When to prefer useReducer:
1. Multiple related pieces of state that update together (a form with many fields)
2. The next state depends on the previous state in complex ways
3. The same action affects multiple fields (a 'RESET' that clears everything)
4. You want the state logic easily unit-testable (reducers are just pure functions)

useReducer + useContext = lightweight global state without Redux. Dispatch actions from any component via context, reducer handles all transitions centrally.

Think of it this way: useState is a light switch. useReducer is a traffic light controller — it has defined states and defined transitions between them.`,
    code: `// useState — simple, direct
const [count, setCount] = useState(0);
const [isOpen, setIsOpen] = useState(false);
// But when these interact (e.g. reset both), you call setCount + setIsOpen separately

// useReducer — actions and transitions, all state in one place
const initialState = { count: 0, isOpen: false, loading: false, error: null };

function reducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 };
    case 'TOGGLE':
      return { ...state, isOpen: !state.isOpen };
    case 'LOAD_START':
      return { ...state, loading: true, error: null };
    case 'LOAD_SUCCESS':
      return { ...state, loading: false, data: action.payload };
    case 'RESET':
      return initialState; // ← one action resets ALL fields — clean!
    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <button onClick={() => dispatch({ type: 'INCREMENT' })}>
      {state.count}
    </button>
  );
}

// useReducer + useContext = mini Redux
const StoreContext = createContext();

function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

// Any child component can now dispatch actions:
function DeepChild() {
  const { state, dispatch } = useContext(StoreContext);
  return <button onClick={() => dispatch({ type: 'RESET' })}>Reset</button>;
}`,
    highlights: ['useState for simple/independent values; useReducer for related state with complex transitions', 'Reducer is a pure function — easy to unit test without rendering anything', 'useReducer + useContext = lightweight global state management without Redux'],
  },
  {
    id: 107, category: 'React', difficulty: 'Senior',
    question: 'How do you fix race conditions in useEffect data fetching?',
    answer: 'Use AbortController to cancel in-flight requests when the component unmounts or the dependency changes. This prevents older responses from overwriting newer ones. If the request can\'t be cancelled (e.g. a library with no abort support), a simpler alternative is a boolean "ignore" flag set in the effect\'s cleanup function — check the flag before applying the response so a stale result from an outdated request is silently discarded.',
    code: `useEffect(() => {
  const ctrl = new AbortController();
  fetch(url, { signal: ctrl.signal })
    .then(r => r.json()).then(setData);
  return () => ctrl.abort();
}, [url]);

// Alternative when abort isn't available:
useEffect(() => {
  let ignore = false;
  fetchData(url).then(data => { if (!ignore) setData(data); });
  return () => { ignore = true; }; // stale response is ignored
}, [url]);`,
    highlights: ['Abort on cleanup', 'Prevents stale responses', 'Signal passed to fetch'],
  },
  {
    id: 108, category: 'React', difficulty: 'Senior',
    question: 'What are React Server Components?',
    answer: 'Server Components render on the server and stream serialized UI to the client without sending the component JavaScript. They reduce bundle size and let you fetch data directly without useEffect.',
    code: `// app/Page.jsx (Next.js 13+ RSC)
async function Page() {
  const data = await db.query('SELECT * FROM posts');
  return <PostList posts={data} />;
}`,
    highlights: ['No client JS bundle', 'Direct data access', 'Stream to client'],
  },
  {
    id: 109, category: 'React', difficulty: 'Junior',
    question: 'What is the difference between controlled and uncontrolled components?',
    answer: `A controlled component means React is the SINGLE SOURCE OF TRUTH for the input's value. The value always comes from state, and every keystroke calls onChange to update that state. React controls what the user sees.

An uncontrolled component lets the DOM manage its own value. You use a ref to read the value only when you need it (e.g. on form submit). The browser handles the typing internally — React doesn't know the current value until you ask.

Think of it like:
• Controlled = a whiteboard where React writes every letter the user types
• Uncontrolled = a notebook — the user writes freely, you read it only when they hand it in

When to use each:
• Controlled: almost always — you get instant validation, can enable/disable submit button, can reset fields programmatically, can set default values from server
• Uncontrolled: large forms where real-time validation is not needed, integrating with non-React libraries that need direct DOM access, file inputs (always uncontrolled — React cannot set their value)`,
    code: `// Controlled
const [val, setVal] = useState('');
<input value={val} onChange={e => setVal(e.target.value)} />;

// Uncontrolled
const ref = useRef();
<input ref={ref} defaultValue="hello" />;`,
    highlights: ['Controlled = React manages', 'Uncontrolled = DOM manages', 'Controlled preferred'],
  },
  {
    id: 110, category: 'React', difficulty: 'Junior',
    question: 'What is React and what are its main features?',
    answer: 'React is a JavaScript library for building user interfaces with reusable components. Key features: declarative syntax (describe what UI should look like), component-based architecture for reusability, Virtual DOM for efficient updates, one-way data binding, and a large ecosystem.',
    code: `// React component example
function App() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <h1>Hello React!</h1>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    </div>
  );
}`,
    highlights: ['Declarative UI', 'Component-based', 'Virtual DOM', 'Unidirectional data flow'],
  },
  {
    id: 111, category: 'React', difficulty: 'Mid',
    question: 'What is the Virtual DOM and how is it different from the real DOM?',
    answer: 'The Virtual DOM is an in-memory representation of the real DOM. React updates the Virtual DOM first (which is fast), then uses a diffing algorithm to calculate minimal changes, and finally updates only the changed parts of the real DOM. This is faster than direct DOM manipulation. It\'s worth distinguishing this from the Shadow DOM, which is unrelated: Shadow DOM is a browser-native encapsulation mechanism for scoping styles and markup, used by Web Components — not a React concept at all, despite the similar-sounding name.',
    code: `// Real DOM manipulation (slow)
document.getElementById('app').innerHTML = '<h1>Hello</h1>';

// React Virtual DOM (optimized)
function App() {
  return <h1>Hello</h1>; // React batches updates
}
// Only necessary DOM nodes are updated`,
    highlights: ['Virtual DOM is in-memory copy', 'Diffing algorithm finds changes', 'Batch updates reduce reflows'],
  },
  {
    id: 112, category: 'React', difficulty: 'Junior',
    question: 'What are React Hooks and why were they introduced?',
    answer: 'Hooks are functions that let you use state and lifecycle features in function components. They were introduced in React 16.8 to replace class component logic. Common hooks: useState (state), useEffect (lifecycle), useContext (context), useReducer (complex state), useMemo (memoization), useCallback (stable functions).',
    code: `// Hooks allow function components to have state
function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    console.log('Component mounted or count changed');
  }, [count]);
  
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}`,
    highlights: ['Hooks enable state in functions', 'Replaced class complexity', 'Improved code reuse'],
  },
  {
    id: 113, category: 'React', difficulty: 'Mid',
    question: 'What are JSX, Babel, and Webpack in the React ecosystem?',
    answer: 'JSX is a syntax extension allowing you to write HTML-like code in JavaScript. Babel is a transpiler that converts JSX (and modern JS/TSX syntax) into plain, browser-compatible JavaScript function calls (React.createElement). Webpack is a module bundler that packs your code and dependencies into optimized bundles, handling code splitting and minification. Vite has become a popular modern alternative to Webpack — it serves modules natively over ESM during development for near-instant hot reloads, and uses Rollup for optimized production builds.',
    code: `// JSX (written by developer)
const element = <h1 className="title">Hello</h1>;

// Babel transpiles to
const element = React.createElement('h1', { className: 'title' }, 'Hello');

// Webpack bundles all modules into optimized output`,
    highlights: ['JSX = syntactic sugar', 'Babel = transpiler', 'Webpack = bundler'],
  },
  {
    id: 114, category: 'React', difficulty: 'Mid',
    question: 'What is Redux and why do you need it?',
    answer: 'Redux is a state management library that helps manage complex application state. It provides a single source of truth (store), making it easier to debug, test, and understand data flow. Useful when prop drilling becomes unwieldy or when multiple components need the same state.',
    code: `// Redux pattern: state stored in a single store
import { createStore } from 'redux';

const store = createStore(reducer);
store.subscribe(() => console.log(store.getState()));
store.dispatch({ type: 'INCREMENT' });`,
    highlights: ['Single source of truth', 'Predictable state changes', 'DevTools for debugging'],
  },
  {
    id: 115, category: 'React', difficulty: 'Mid',
    question: 'What are Actions, Reducers, and Store in Redux?',
    answer: 'Action is a plain object describing what happened (e.g., { type: "ADD_TODO", payload: data }). Reducer is a pure function that takes current state and an action, and returns the new state. Store holds the entire app state and provides dispatch, subscribe, and getState methods.',
    code: `// Action
const action = { type: 'ADD_TODO', payload: 'Learn Redux' };

// Reducer (pure function)
function todoReducer(state = [], action) {
  switch(action.type) {
    case 'ADD_TODO': return [...state, action.payload];
    default: return state;
  }
}

// Store
const store = createStore(todoReducer);
store.dispatch(action);`,
    highlights: ['Action = event descriptor', 'Reducer = state updater', 'Store = single source of truth'],
  },
  {
    id: 116, category: 'React', difficulty: 'Mid',
    question: 'What is Redux Middleware and what does it do?',
    answer: 'Middleware intercepts dispatched actions before they reach the reducer. It lets you log actions, handle side effects, conditionally dispatch actions, or transform actions. Common middleware: redux-thunk (async actions), redux-logger (logging), redux-saga (side effects).',
    code: `// Custom logging middleware
const loggerMiddleware = store => next => action => {
  console.log('Dispatching:', action);
  const result = next(action);
  console.log('New state:', store.getState());
  return result;
};

const store = createStore(reducer, applyMiddleware(loggerMiddleware));`,
    highlights: ['Intercepts actions', 'Enables side effects', 'Chain-able middleware'],
  },
  {
    id: 117, category: 'React', difficulty: 'Mid',
    question: 'Explain Redux data flow (Unidirectional Data Flow)',
    answer: 'Redux follows a strict unidirectional cycle: (1) User interacts with UI → (2) Component dispatches an Action → (3) Middleware processes (optional) → (4) Reducer processes action and returns new state → (5) Store notifies subscribers → (6) Components re-render with new state. This cycle ensures predictable state management.',
    code: `// Redux Data Flow
User clicks button
  ↓
dispatch({ type: 'INCREMENT' })
  ↓
Middleware (logger, thunk, etc.)
  ↓
Reducer updates state
  ↓
Store notifies subscribers
  ↓
React re-renders component with new state`,
    highlights: ['Unidirectional', 'Predictable', 'Prevents circular dependencies'],
  },
  {
    id: 118, category: 'React', difficulty: 'Mid',
    question: 'What is Redux-Thunk and how does it enable async actions?',
    answer: 'Redux-Thunk is middleware that lets action creators return functions instead of plain actions. This function receives dispatch and getState, enabling you to dispatch multiple actions, handle async operations (API calls), and access current state.',
    code: `// Without thunk (won't work with API calls)
dispatch({ type: 'FETCH_USER' });

// With thunk (async action creator)
const fetchUser = (id) => async (dispatch) => {
  dispatch({ type: 'FETCH_USER_START' });
  try {
    const user = await fetch(\`/api/users/\${id}\`).then(r => r.json());
    dispatch({ type: 'FETCH_USER_SUCCESS', payload: user });
  } catch (err) {
    dispatch({ type: 'FETCH_USER_ERROR', payload: err });
  }
};`,
    highlights: ['Allows async operations', 'Action creators return functions', 'Access to dispatch and getState'],
  },
  {
    id: 119, category: 'React', difficulty: 'Senior',
    question: 'What is Redux-Saga and how is it different from Redux-Thunk?',
    answer: 'Redux-Saga is advanced middleware using generator functions to handle side effects. It provides more control: take (listen for actions), put (dispatch), call (execute functions), fork (parallel tasks) — and built-in support for cancellation, debouncing, and race conditions between async flows. Redux-Thunk is much simpler: action creators just return a function (instead of a plain action object) and use plain async/await inside it to perform async logic imperatively. Thunk is enough for simple async operations; Saga earns its steeper learning curve on complex, cancellable, or concurrent workflows.',
    code: `// Redux-Saga with generators
function* fetchUserSaga() {
  try {
    const user = yield call(fetchUserAPI, userId);
    yield put({ type: 'FETCH_USER_SUCCESS', payload: user });
  } catch (error) {
    yield put({ type: 'FETCH_USER_ERROR', payload: error });
  }
}

// Thunk is simpler but less powerful:
// Good for: simple async operations
// Saga is better for: complex workflows, cancellation, parallel tasks`,
    highlights: ['Saga uses generators', 'More control than Thunk', 'Better for complex workflows'],
  },
  {
    id: 120, category: 'React', difficulty: 'Mid',
    question: 'What is the difference between Class Components and Function Components?',
    answer: 'Class Components are ES6 classes extending React.Component with lifecycle methods (componentDidMount, componentWillUnmount). Function Components are plain functions returning JSX. Before hooks, classes had advantages; now functions are preferred due to hooks being simpler and promoting better code organization.',
    code: `// Class Component
class Counter extends React.Component {
  state = { count: 0 };
  componentDidMount() { console.log('mounted'); }
  render() { return <div>{this.state.count}</div>; }
}

// Function Component (modern preferred)
function Counter() {
  const [count, setCount] = useState(0);
  useEffect(() => console.log('mounted'), []);
  return <div>{count}</div>;
}`,
    highlights: ['Class = lifecycle methods', 'Function = hooks', 'Functions are now preferred'],
  },
  {
    id: 121, category: 'React', difficulty: 'Mid',
    question: 'How do you implement componentWillUnmount cleanup in function components?',
    answer: 'Use useEffect with a cleanup function. The function returned from useEffect runs when the component unmounts or dependencies change. Use this to cancel subscriptions, timers, or API requests.',
    code: `function Timer() {
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('tick');
    }, 1000);
    
    // Cleanup function runs on unmount
    return () => clearInterval(interval);
  }, []);
  
  return <div>Timer</div>;
}`,
    highlights: ['Return function from useEffect', 'Called on unmount or dependency change', 'Prevents memory leaks'],
  },
  {
    id: 122, category: 'React', difficulty: 'Mid',
    question: 'What are React lifecycle methods (in class components)?',
    answer: 'Lifecycle methods run at specific component stages: Mounting (constructor, render, componentDidMount), Updating (shouldComponentUpdate, render, componentDidUpdate), and Unmounting (componentWillUnmount). There\'s also an error-handling stage: componentDidCatch and the static getDerivedStateFromError, which only a class component can implement — this is how error boundaries work under the hood, since hooks have no equivalent. With hooks, useEffect covers most of the rest: [] (mount), [deps] (update), return cleanup (unmount).',
    code: `class Component extends React.Component {
  constructor(props) { super(props); } // init
  render() { return <div/>; }
  componentDidMount() { /* after mount */ }
  shouldComponentUpdate(nextProps, nextState) { return true; } // optional bail-out
  componentDidUpdate(prevProps, prevState) { /* after update */ }
  componentWillUnmount() { /* before unmount */ }
  static getDerivedStateFromError(error) { return { hasError: true }; } // error boundary
  componentDidCatch(error, info) { logErrorToService(error, info); }    // error boundary
}

// Modern hook equivalent (no hook covers error boundaries):
useEffect(() => {
  // componentDidMount
  return () => { /* componentWillUnmount */ };
}, []); // empty deps

useEffect(() => {
  // componentDidUpdate
}, [deps]);`,
    highlights: ['Mount → Update → Unmount', 'hooks replace most methods', 'Simpler mental model'],
  },
  {
    id: 123, category: 'React', difficulty: 'Junior',
    question: 'What is the difference between export default and export in React?',
    answer: 'export default exports one unnamed export per module — import it with any name. export (named export) requires exact name matching on import but allows multiple exports per module.',
    code: `// export default
export default function Counter() { ... }
import Counter from './Counter'; // any name works

// Named export
export function Counter() { ... }
import { Counter } from './Counter'; // exact name required

// Multiple named exports
export const utils = { ... };
export const config = { ... };
import { utils, config } from './module';`,
    highlights: ['default = one per file', 'named = multiple allowed', 'default needs no braces on import'],
  },
  {
    id: 124, category: 'React', difficulty: 'Mid',
    question: 'What are React Portals and when do you use them?',
    answer: 'Portals let you render a component outside the parent DOM hierarchy. Created with ReactDOM.createPortal(component, targetNode). Useful for modals, tooltips, and dropdowns to avoid CSS stacking context issues.',
    code: `// Portal for Modal
import { createPortal } from 'react-dom';

function Modal() {
  return createPortal(
    <div className="modal-overlay">
      <div className="modal">Modal content</div>
    </div>,
    document.getElementById('modal-root') // render outside DOM tree
  );
}`,
    highlights: ['Renders outside parent', 'Avoids stacking issues', 'Good for modals/popups'],
  },
  {
    id: 125, category: 'React', difficulty: 'Mid',
    question: 'What is useRef and when should you use it?',
    answer: 'useRef returns a mutable ref object that persists across renders. Unlike state, updating a ref does not cause re-render. Use for: DOM access (focus, play video), storing mutable values, timers, or reading uncontrolled component values.',
    code: `function Timer() {
  const intervalRef = useRef(null);
  
  const start = () => {
    intervalRef.current = setInterval(() => console.log('tick'), 1000);
  };
  
  const stop = () => clearInterval(intervalRef.current);
  
  return (
    <>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </>
  );
}`,
    highlights: ['Persists across renders', 'No re-render on change', 'Mutable container'],
  },
  {
    id: 126, category: 'React', difficulty: 'Mid',
    question: 'What is React.StrictMode and why should you use it?',
    answer: 'StrictMode is a development tool that checks for potential problems in a React app. It does not render anything to the DOM but enables extra development checks: warnings about legacy APIs, side effects in pure functions, unsafe lifecycle methods, and runs effects twice to detect issues.',
    code: `// Wrap app with StrictMode
import { StrictMode } from 'react';

function App() {
  return (
    <StrictMode>
      <Router>
        <YourApp />
      </Router>
    </StrictMode>
  );
}`,
    highlights: ['Development-only tool', 'Runs effects twice to detect issues', 'Helps find bugs early'],
  },
  {
    id: 127, category: 'React', difficulty: 'Junior',
    question: 'What are React Fragments and why are they useful?',
    answer: 'Fragments let you group multiple elements without adding a wrapper node to the DOM. Use <></> or <Fragment>. Useful for avoiding extra divs that cause styling issues or invalid HTML (lists, tables) and improve performance.',
    code: `// Without fragments (creates extra div)
function List() {
  return (
    <div>
      <Item />
      <Item />
    </div>
  );
}

// With fragments (cleaner DOM)
function List() {
  return (
    <>
      <Item />
      <Item />
    </>
  );
}`,
    highlights: ['Avoid wrapper divs', 'Cleaner DOM tree', 'No performance overhead'],
  },
  {
    id: 128, category: 'React', difficulty: 'Mid',
    question: 'What is React Router and how do you use it?',
    answer: 'React Router is a library for client-side routing. It allows you to map URL paths to React components, enabling single-page app navigation. Key components: BrowserRouter (wrapper), Routes, Route, Link, useNavigate, useParams.',
    code: `import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <nav><Link to="/">Home</Link></nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/user/:id" element={<User />} />
      </Routes>
    </BrowserRouter>
  );
}`,
    highlights: ['Client-side routing', 'URL path to component mapping', 'Single-page app navigation'],
  },
  {
    id: 129, category: 'React', difficulty: 'Senior',
    question: 'What is a Higher-Order Component (HOC) and how do you create one?',
    answer: 'A HOC is a pattern (not a built-in feature) for reusing component logic by wrapping a component in a function. The function takes a component and returns a new, enhanced component — commonly used for cross-cutting concerns like authentication guards, logging, or theme injection that many otherwise-unrelated components need. Useful for code reuse, but a custom hook is usually the more modern, simpler alternative when the shared logic doesn\'t need to inject markup around the wrapped component.',
    code: `// HOC that adds theme
function withTheme(Component) {
  return (props) => {
    const theme = useContext(ThemeContext);
    return <Component {...props} theme={theme} />;
  };
}

// Usage
const ThemedButton = withTheme(Button);

// Alternative with hooks (modern):
function useTheme() {
  return useContext(ThemeContext);
}`,
    highlights: ['Wraps component in function', 'Returns enhanced component', 'Hooks are modern alternative'],
  },
  {
    id: 130, category: 'React', difficulty: 'Mid',
    question: 'What is a Pure Component and how does it differ from a regular component?',
    answer: 'A Pure Component (React.PureComponent in classes or React.memo in functions) automatically does shallow prop/state comparison and skips re-render if nothing changed. For function components, wrap with React.memo. Use when re-renders are expensive, but profile first.',
    code: `// Class Pure Component
class UserCard extends React.PureComponent {
  render() { return <div>{this.props.name}</div>; }
}

// Function component with memo
const UserCard = React.memo(function UserCard({ name }) {
  return <div>{name}</div>;
});

// Custom comparison
const UserCard = React.memo(UserCard, (prevProps, nextProps) => {
  return prevProps.id === nextProps.id; // true = skip render
});`,
    highlights: ['Shallow comparison', 'Skips re-render if props same', 'Profile before using'],
  },
  {
    id: 131, category: 'React', difficulty: 'Senior',
    question: 'What are the best practices for optimizing React applications?',
    answer: 'Key optimization strategies: (1) Code splitting with React.lazy and Suspense, (2) Memoize with useMemo/useCallback and React.memo, (3) Virtual scrolling for long lists, (4) Image optimization and lazy loading, (5) Remove unused dependencies, (6) Use devtools to profile, (7) Avoid inline object/function creation in render.',
    code: `// Code splitting
const HeavyComponent = React.lazy(() => import('./Heavy'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}

// Avoid: inline objects re-create on every render
<Child style={{ color: 'red' }} /> // BAD

// Good: define outside or memoize
const style = { color: 'red' };
<Child style={style} />`,
    highlights: ['Code splitting', 'Memoization', 'Profile with devtools', 'Lazy load images'],
  },
  {
    id: 132, category: 'React', difficulty: 'Senior',
    question: 'What are the main differences between React and Angular?',
    answer: 'React: library for UI, flexible, uses JSX, larger ecosystem, gentler learning curve, component-based. Angular: full framework, opinionated, uses TypeScript by default, built-in routing/forms, steeper learning curve, better for large enterprise apps.',
    code: `// React
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// Angular (TypeScript class)
@Component({
  selector: 'app-counter',
  template: '<button (click)="increment()">{{count}}</button>'
})
export class CounterComponent {
  count = 0;
  increment() { this.count++; }
}`,
    highlights: ['React = library, Angular = framework', 'React = flexible, Angular = opinionated', 'React easier to learn'],
  },
  {
    id: 133, category: 'React', difficulty: 'Senior',
    question: 'What is Server-Side Rendering (SSR) in React and what are its benefits?',
    answer: 'SSR renders React components on the server first, sending HTML to the browser instead of an empty shell. Benefits: better SEO (search engines see full content), faster initial page load (content visible sooner), better performance for slow networks, improved accessibility. Trade-offs: more server load, complexity.',
    code: `// Server-side (Node.js with Express)
import { renderToString } from 'react-dom/server';
app.get('/', (req, res) => {
  const html = renderToString(<App />);
  res.send(\`<!DOCTYPE html><html><body>\${html}</body></html>\`);
});

// Client-side hydration
import { hydrateRoot } from 'react-dom/client';
hydrateRoot(document.getElementById('root'), <App />);`,
    highlights: ['Render on server', 'Better SEO', 'Faster initial load', 'More complex setup'],
  },

  // ─── JAVA ─────────────────────────────────────────────────
  // ─── JAVA (CORE) ─────────────────────────────────────────────────────────
  {
    id: 201, category: 'Java', difficulty: 'Junior',
    question: 'What is Encapsulation in Java? Explain with a real-world example.',
    answer: `Encapsulation means wrapping data (fields) and the methods that operate on that data inside a class, while controlling how that data can be accessed or modified from outside.

In simple words: Keep the data protected. Allow access only through controlled methods.

━━━ The Problem Without Encapsulation ━━━

Imagine a BankAccount class where the balance field is public:

  account.balance = -1000000;  // anyone can set ANY value — no protection!

There is zero control. Anyone can corrupt the object's state.

━━━ The Solution With Encapsulation ━━━

Make the field private. Expose controlled public methods that enforce business rules:

  account.deposit(50000);    // must be positive
  account.withdraw(10000);   // cannot exceed balance
  account.getBalance();      // read-only access

Now the BankAccount object controls its own state. No one can set balance directly.

━━━ Real Spring Boot Example: Policy Object ━━━

Instead of allowing anyone to do:
  policy.setStatus("APPROVED");

Design the Policy so it controls its own transitions:
  policy.approve();  // enforces: only PENDING policies can be approved
  policy.reject();   // enforces: only PENDING policies can be rejected

This protects your business rules. The object says: "I manage my own state — you call my methods."

━━━ Why Not Just Generate Getters and Setters? ━━━

Generating a public setBalance(double b) defeats encapsulation. Anyone can call setBalance(-50000). 

Real encapsulation = private data + controlled methods with VALIDATION and BUSINESS RULES.

━━━ 4 Benefits ━━━

1. Data Protection   — prevents direct corruption of internal state
2. Validation        — enforce rules in one place (amount > 0)
3. Maintainability   — change internal impl without breaking callers
4. Business Rules    — the object owns its own logic

━━━ Interview Answer ━━━

"Encapsulation is bundling data and its controlling methods inside a class, and restricting direct access via private fields and public controlled methods. It protects state, enforces validation, and embeds business rules. For example, a BankAccount with a private balance field exposes deposit() and withdraw() methods that validate inputs — no external code can directly corrupt the balance."`,
    code: `// ── Without Encapsulation ❌ ──────────────────────────
class BankAccount {
    public double balance;  // dangerous — anyone can modify!
}
account.balance = -1000000; // no protection

// ── With Encapsulation ✅ ──────────────────────────────
class BankAccount {
    private double balance;  // hidden state

    public double getBalance() { return balance; }

    public void deposit(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Must be positive");
        balance += amount;
    }

    public void withdraw(double amount) {
        if (amount <= 0 || amount > balance)
            throw new IllegalArgumentException("Invalid amount");
        balance -= amount;
    }
}

// ── Real Spring Boot: Policy domain object ─────────────
public class Policy {
    private String policyNumber;
    private double premium;
    private String status; // PENDING, APPROVED, REJECTED

    public Policy(String number, double premium) {
        this.policyNumber = number;
        this.premium = premium;
        this.status = "PENDING"; // always starts PENDING
    }

    public void approve() {
        if (!"PENDING".equals(status))
            throw new IllegalStateException("Only PENDING can be approved");
        status = "APPROVED"; // self-controlled state transition
    }

    public void reject() {
        if (!"PENDING".equals(status))
            throw new IllegalStateException("Only PENDING can be rejected");
        status = "REJECTED";
    }

    public String getStatus() { return status; }
    // No setStatus() — the object controls its own transitions!
}

// Usage — clean, safe, business-rule enforced:
Policy policy = new Policy("POL123", 25000);
policy.approve();  // ✅  (not policy.setStatus("APPROVED"))`,
    highlights: ['private fields + controlled public methods = encapsulation', 'Expose behaviour (deposit/approve), not raw data (setBalance)', 'Validation and business rules live inside the object'],
  },
  {
    id: 202, category: 'Java', difficulty: 'Junior',
    question: 'What is Abstraction in Java? How is it different from Encapsulation?',
    answer: `Abstraction means hiding unnecessary implementation details and exposing only the essential functionality to the caller.

In simple words: Show WHAT to do — hide HOW it is done.

━━━ Real-World Analogy — The ATM ━━━

When you use an ATM, you see:
  → Enter PIN
  → Select Withdraw
  → Enter Amount
  → Receive Money

You don't see (and don't need to know):
  → Bank server communication
  → Authentication protocol
  → Database transaction
  → Ledger update logic

You simply call: withdraw(5000). That's abstraction.

━━━ Java Implementation ━━━

You define a contract (interface or abstract class) that declares WHAT must happen:

  interface Payment { void pay(double amount); }

The interface says: "Every payment method must support pay()."
It does NOT say how. Each implementation decides that independently.

━━━ Real Spring Boot Example ━━━

In your insurance or e-commerce app, you have:

  public interface NotificationService {
      void sendNotification(String message);
  }

EmailNotificationService implements it one way.
SmsNotificationService implements it another way.

Your business logic only knows NotificationService — not email or SMS internals.
Tomorrow you switch SMS providers. Your business logic changes ZERO lines.

━━━ Abstraction vs Encapsulation — Most Asked Follow-Up ━━━

ENCAPSULATION:
  "Don't directly touch my internal data."
  → Focuses on protecting state
  → Achieved with private fields + controlled methods
  → Example: private balance with deposit()/withdraw()

ABSTRACTION:
  "You don't need to know how I work internally."
  → Focuses on hiding implementation complexity
  → Achieved with interfaces and abstract classes
  → Example: Payment.pay() — caller doesn't know if it's UPI or credit card

━━━ Think of a Car 🚗 ━━━

You use: steering wheel, accelerator, brake.
You don't know: engine combustion, fuel injection, ECU processing.
That hidden complexity = abstraction.
The car protecting its engine parts = encapsulation.

━━━ Interview Answer ━━━

"Abstraction hides implementation details and exposes only essential functionality. In Java it's achieved via interfaces and abstract classes. For example, a NotificationService interface exposes sendNotification() while email and SMS implementations handle the actual sending logic. The business layer doesn't know or care which implementation runs — it's loosely coupled and easily swappable."`,
    code: `// ── Interface: defines WHAT, not HOW ─────────────────
public interface Payment {
    void pay(double amount);        // the contract
    // no implementation details
}

// ── Implementations: define HOW ───────────────────────
class CreditCardPayment implements Payment {
    @Override
    public void pay(double amount) {
        System.out.println("Processing credit card: ₹" + amount);
        // auth flow, bank API calls, retry logic — all hidden from caller
    }
}

class UpiPayment implements Payment {
    @Override
    public void pay(double amount) {
        System.out.println("Processing UPI: ₹" + amount);
        // VPA lookup, PSP communication — all hidden from caller
    }
}

// ── Caller doesn't know the implementation ────────────
Payment payment = new UpiPayment();
payment.pay(5000); // caller only knows "pay" — not UPI internals

// ── Spring Boot: swap impl without changing business logic ──
@Service
public interface NotificationService {
    void sendNotification(String message);
}

@Service("emailNotifier")
public class EmailNotificationService implements NotificationService {
    public void sendNotification(String message) {
        // JavaMail, templates, SMTP — all hidden
        System.out.println("Email: " + message);
    }
}

@Service("smsNotifier")
public class SmsNotificationService implements NotificationService {
    public void sendNotification(String message) {
        // Twilio API, phone lookup — all hidden
        System.out.println("SMS: " + message);
    }
}

// Business logic depends on interface — never on implementation:
@Service
public class PolicyService {
    private final NotificationService notifier; // injected — could be email or SMS
    // change provider? Zero changes here.
}`,
    highlights: ['Interface = contract (WHAT), Implementation = detail (HOW)', 'Caller is loosely coupled — can swap implementations freely', 'Encapsulation protects state; Abstraction hides complexity'],
  },
  {
    id: 203, category: 'Java', difficulty: 'Mid',
    question: 'What are the four pillars of OOP in Java? Explain each with an example.',
    answer: `The four OOP pillars are Encapsulation, Abstraction, Inheritance, and Polymorphism. Every Java interview expects you to explain all four clearly with examples.

━━━ 1. Encapsulation ━━━

Hide internal state. Expose controlled methods with validation and business rules.
  → private balance; public deposit()/withdraw()
  → The object protects its own data.

━━━ 2. Abstraction ━━━

Hide implementation complexity. Show only what the caller needs.
  → interface Payment { void pay(double amount); }
  → Caller says pay() — doesn't know if it's UPI, credit card, or PayPal.

━━━ 3. Inheritance ━━━

A child class reuses behaviour from a parent class. Java supports single class inheritance (extends) but multiple interface implementation (implements).
  → Dog extends Animal — Dog gets eat(), sleep() for free, overrides speak()
  → Promotes code reuse. Follow "IS-A" relationship: Dog IS-A Animal ✅

━━━ 4. Polymorphism ━━━

One interface, many behaviours. Two types:
  
  Compile-time (Overloading): same method name, different parameters.
    → add(int a, int b) vs add(double a, double b)
    → The compiler picks the right version at compile time.

  Runtime (Overriding): subclass redefines a parent method. JVM picks the right version at runtime based on the actual object type.
    → Animal a = new Dog(); a.speak(); // calls Dog.speak() — not Animal.speak()
    → This is dynamic dispatch — the power of polymorphism.

━━━ Why Interviewers Ask This ━━━

They want to see if you understand WHY each pillar exists, not just its definition. Link each to a real benefit:
  → Encapsulation → data protection + business rules
  → Abstraction → loose coupling + easy to swap implementations
  → Inheritance → code reuse
  → Polymorphism → one interface drives different behaviours (pluggable design)

━━━ Common Follow-Up ━━━

"Favour Composition over Inheritance" — if you say this you'll impress them.
Inheritance creates tight coupling. Composition (HAS-A) is more flexible.
  → A Car HAS-A Engine is better than Car extends Engine.`,
    code: `// ── 1. Encapsulation — protected internal state ────────
class BankAccount {
    private double balance;
    public void deposit(double a) { if (a > 0) balance += a; }
}

// ── 2. Abstraction — contract, hide details ─────────────
abstract class Shape {
    public abstract double area();   // what — not how
    public void print() { System.out.println("Area: " + area()); }
}

// ── 3. Inheritance — reuse parent behaviour ─────────────
class Circle extends Shape {
    private double r;
    Circle(double r) { this.r = r; }
    @Override public double area() { return Math.PI * r * r; }
}

class Rectangle extends Shape {
    private double w, h;
    Rectangle(double w, double h) { this.w = w; this.h = h; }
    @Override public double area() { return w * h; }
}

// ── 4. Polymorphism — one type, many behaviours ─────────
Shape s1 = new Circle(5);       // Shape ref, Circle object
Shape s2 = new Rectangle(4, 6); // Shape ref, Rectangle object

s1.print(); // Area: 78.54  ← JVM calls Circle.area() at runtime
s2.print(); // Area: 24.0   ← JVM calls Rectangle.area() at runtime

// All shapes in one list — polymorphic iteration:
List<Shape> shapes = List.of(new Circle(3), new Rectangle(2, 5));
shapes.forEach(Shape::print); // each calls its own area()

// ── Compile-time Polymorphism (Overloading) ────────────
class Calculator {
    int add(int a, int b)          { return a + b; }
    double add(double a, double b) { return a + b; } // different param types
    int add(int a, int b, int c)   { return a + b + c; } // different param count
}`,
    highlights: ['Encapsulation: protect state; Abstraction: hide complexity', 'Inheritance: IS-A code reuse; Polymorphism: one interface, many behaviours', 'Runtime polymorphism = dynamic dispatch based on actual object type'],
  },
  {
    id: 204, category: 'Java', difficulty: 'Mid',
    question: 'What is the difference between ArrayList and LinkedList? When to use which?',
    answer: `Both implement the List interface, but they use completely different internal data structures, giving them very different performance characteristics.

━━━ ArrayList — Backed by a Dynamic Array ━━━

Internally, ArrayList uses a plain array that doubles in size when full.
  → get(index) → O(1) — direct array access, instant
  → add(element) at the end → O(1) amortized (occasional resize)
  → add(index, element) in the middle → O(n) — must shift all elements right
  → remove(index) in the middle → O(n) — must shift all elements left
  → Memory: compact — just an array

Best for: random access, iteration, mostly-read scenarios.

━━━ LinkedList — Backed by a Doubly-Linked Chain ━━━

Internally, each element (node) holds data + pointer to previous + pointer to next node.
  → get(index) → O(n) — must traverse from head/tail
  → addFirst() / addLast() → O(1) — just rewire pointers
  → removeFirst() / removeLast() → O(1) — just rewire pointers
  → add(index) in the middle → O(n) to find position, then O(1) to insert
  → Memory: heavier — each node stores two extra pointers

Best for: queue/deque operations (add at head, remove at tail), frequent insertions/deletions at ends.

━━━ Which to Use in Practice? ━━━

Use ArrayList 95% of the time. It has better cache performance (contiguous memory), less memory overhead, and is faster for the most common operations (get, iterate, add at end).

Use LinkedList when you specifically need: O(1) addFirst()/removeFirst() (as a Queue or Deque), or when you're doing frequent insertions/deletions at both ends of the list.

━━━ Interview Tip ━━━

If they ask "what does Array.get(0) cost?" → O(1).
If they ask "what does LinkedList.get(500)?" → O(n) — it walks 500 nodes.`,
    code: `// ── ArrayList: backed by array ────────────────────────
List<String> arr = new ArrayList<>();
arr.add("a");         // O(1) amortized — append to end
arr.get(0);           // O(1) — direct array index access
arr.add(0, "z");      // O(n) — shifts all elements right → slow
arr.remove(0);        // O(n) — shifts all elements left  → slow

// ── LinkedList: backed by doubly-linked nodes ──────────
LinkedList<String> ll = new LinkedList<>();
ll.addFirst("a");     // O(1) — just rewire head pointer
ll.addLast("z");      // O(1) — just rewire tail pointer
ll.removeFirst();     // O(1) — just rewire head
ll.get(100);          // O(n) — must traverse 100 nodes → slow!

// ── Use LinkedList as a Queue (FIFO) ──────────────────
Queue<String> queue = new LinkedList<>();
queue.offer("task1"); // enqueue at tail — O(1)
queue.offer("task2");
queue.poll();         // dequeue from head — O(1)

// ── Use LinkedList as a Deque (Double-ended queue) ────
Deque<String> deque = new ArrayDeque<>(); // prefer ArrayDeque over LinkedList for Deque
deque.addFirst("front");
deque.addLast("back");

// ── Comparison Summary ────────────────────────────────
// Operation       ArrayList   LinkedList
// get(i)          O(1)        O(n)
// add (end)       O(1)*       O(1)
// add (middle)    O(n)        O(n) find + O(1) insert
// remove (end)    O(1)        O(1)
// remove (middle) O(n)        O(n) find + O(1) remove
// Memory          Compact     Per-node overhead (2 pointers)`,
    highlights: ['ArrayList O(1) random access; LinkedList O(n) — never use get(i) on LinkedList', 'LinkedList O(1) addFirst/removeFirst — ideal as queue or deque', 'ArrayList is the default choice 95% of the time'],
  },
  {
    id: 205, category: 'Java', difficulty: 'Mid',
    question: 'What is the difference between interface and abstract class in Java?',
    answer: `This is one of the most frequently asked Java OOP interview questions. Knowing the WHEN to use each is more important than just listing the differences.

━━━ Abstract Class ━━━

An abstract class is a partially-implemented class. It can have:
  → Instance variables (fields with state)
  → Constructors
  → Concrete methods (with implementation)
  → Abstract methods (no implementation — subclasses must override)
  → All access modifiers (private, protected, public)

A class can extend ONLY ONE abstract class.

Use when: You have related classes that share common state or code, and you want to provide a base implementation while forcing subclasses to fill in specific parts.

Example: Vehicle is an abstract class. All vehicles have a brand, can accelerate(). But fuelType() differs per vehicle.

━━━ Interface ━━━

Before Java 8: only abstract methods. No state, no implementation.
Java 8+: can have default methods (with body) and static methods.
Java 9+: can have private methods.

A class can implement MULTIPLE interfaces.

Use when: You want to define a contract that unrelated classes can share. Flyable can apply to Bird, Plane, Drone — they're unrelated classes.

━━━ The Decision Rule ━━━

IS-A with shared state/code? → Abstract class (Vehicle, Animal)
CAN-DO contract across unrelated types? → Interface (Flyable, Serializable, Comparable)

━━━ Favourite Interview Trick Question ━━━

"Can an interface have a constructor?" → No.
"Can an abstract class be instantiated?" → No — only via a concrete subclass.
"Can an interface extend another interface?" → Yes, with extends.
"Can a class implement an interface and extend an abstract class?" → Yes, both together.

━━━ Modern Java Note ━━━

Since Java 8, interfaces with default methods can share implementation. This blurs the line somewhat. The key remaining difference: abstract classes can have instance variables (state). Interfaces cannot hold mutable state.`,
    code: `// ── Abstract Class: shared state + partial implementation ──
public abstract class Vehicle {
    protected String brand;    // shared state
    protected int speed = 0;

    public Vehicle(String brand) { this.brand = brand; }  // constructor

    public void accelerate(int delta) { speed += delta; } // concrete — shared

    public abstract void fuelType(); // abstract — subclass decides
}

class ElectricCar extends Vehicle {
    public ElectricCar(String brand) { super(brand); }
    @Override public void fuelType() { System.out.println("Electric"); }
}

// ── Interface: contract across unrelated classes ────────
public interface Flyable {
    void fly();                          // abstract (implicitly)
    default void land() {                // Java 8 default method
        System.out.println("Landing...");
    }
    static String protocol() { return "IFR"; } // Java 8 static
}

public interface Chargeable {
    void charge();
}

// ElectricCar: extends one abstract class, implements multiple interfaces
class ElectricPlane extends Vehicle implements Flyable, Chargeable {
    public ElectricPlane(String b) { super(b); }
    @Override public void fuelType() { System.out.println("Electric"); }
    @Override public void fly()      { System.out.println("Flying!"); }
    @Override public void charge()   { System.out.println("Charging!"); }
}

// ── The key difference in memory ───────────────────────
// Abstract class can hold state:
abstract class Counter { private int count = 0; }  // ✅ field

// Interface cannot hold mutable instance state:
interface ICounter {
    int MAX = 100; // implicitly public static final — compile-time constant
    // int count = 0; // NOT instance state — it's a static constant
}`,
    highlights: ['Abstract class: one per class, can have state + constructors', 'Interface: multiple per class, contract only (default methods since Java 8)', 'Rule: shared code/state → abstract class; shared contract across unrelated types → interface'],
  },
  {
    id: 206, category: 'Java', difficulty: 'Mid',
    question: 'What are Lambda expressions and the Stream API in Java 8? Explain with practical examples.',
    answer: `Java 8 introduced two of its most transformative features: lambdas and Streams. Together they enable functional-style programming — expressing what you want, not how to loop through it.

━━━ Lambda Expressions ━━━

A lambda is an anonymous function: (parameters) -> body.
It implements a Functional Interface — an interface with exactly ONE abstract method.

  Collections.sort(list, (a, b) -> a.compareTo(b));
  // Instead of new Comparator<String>() { public int compare(...){...} }

Key built-in functional interfaces (java.util.function):
  → Predicate<T>      — takes T, returns boolean   (test)
  → Function<T,R>     — takes T, returns R          (apply)
  → Consumer<T>       — takes T, returns void       (accept)
  → Supplier<T>       — takes nothing, returns T    (get)
  → BiFunction<T,U,R> — takes T and U, returns R   (apply)

━━━ Stream API ━━━

A Stream is a pipeline of operations over a data source. Three parts:
  1. Source: collection.stream() or Stream.of(...)
  2. Intermediate ops (lazy — build the pipeline): filter(), map(), sorted(), distinct(), limit()
  3. Terminal op (triggers execution): collect(), forEach(), count(), reduce(), findFirst()

LAZY means: calling .filter().map() does NOTHING until you add a terminal op.

━━━ Common Stream Patterns in Interviews ━━━

  → filter + map + collect: most common pipeline
  → groupingBy: group elements into a Map<K, List<V>>
  → flatMap: flatten nested lists
  → reduce: fold a sequence into a single value

━━━ Method References (shorthand for lambdas) ━━━

  .map(s -> s.toUpperCase())  →  .map(String::toUpperCase)
  .forEach(s -> print(s))     →  .forEach(System.out::println)

━━━ Interview Key Point ━━━

"Streams are lazy — intermediate operations don't execute until a terminal op is called. A Stream can only be consumed ONCE — calling a terminal op twice throws IllegalStateException."`,
    code: `// ── Lambda basics ────────────────────────────────────
Runnable r       = () -> System.out.println("Hello");
Predicate<String> nonEmpty = s -> !s.isEmpty();
Function<String, Integer> len = String::length; // method ref

// ── Stream pipeline: filter + map + collect ────────────
List<Employee> employees = getEmployees();

List<String> seniorNames = employees.stream()
    .filter(e -> e.getYears() > 5)              // keep senior
    .sorted(Comparator.comparing(Employee::getSalary).reversed())
    .map(Employee::getName)                     // extract name
    .collect(Collectors.toList());              // terminal — triggers all

// ── GroupingBy (very common interview question) ────────
Map<String, List<Employee>> byDept = employees.stream()
    .collect(Collectors.groupingBy(Employee::getDept));

Map<String, Double> avgSalByDept = employees.stream()
    .collect(Collectors.groupingBy(
        Employee::getDept,
        Collectors.averagingDouble(Employee::getSalary)
    ));

// ── flatMap: flatten nested structure ─────────────────
List<List<Integer>> nested = List.of(List.of(1,2), List.of(3,4));
List<Integer> flat = nested.stream()
    .flatMap(Collection::stream)
    .collect(Collectors.toList()); // [1, 2, 3, 4]

// ── reduce: sum, find max ──────────────────────────────
int sum = IntStream.rangeClosed(1, 10).reduce(0, Integer::sum); // 55
Optional<Integer> max = List.of(3,1,4,1,5).stream().reduce(Integer::max);

// ── Short-circuit terminals ────────────────────────────
boolean anyPassing = scores.stream().anyMatch(s -> s >= 60);
boolean allPassing = scores.stream().allMatch(s -> s >= 60);
Optional<Employee> first = employees.stream()
    .filter(e -> e.getDept().equals("Engineering"))
    .findFirst();`,
    highlights: ['Lambdas = anonymous functions for functional interfaces (Predicate, Function, Consumer, Supplier)', 'Streams are lazy: intermediate ops build pipeline; terminal op triggers execution', 'Streams can only be consumed ONCE — second terminal op throws IllegalStateException'],
  },
  {
    id: 207, category: 'Java', difficulty: 'Senior',
    question: 'What is the Java Memory Model? Explain Stack vs Heap, Garbage Collection, and memory leaks.',
    answer: `Understanding Java memory is essential for senior roles. Interviewers want to know you can reason about performance and memory issues in production.

━━━ Stack Memory (per thread) ━━━

Every thread has its own private stack. The stack stores:
  → Method frames: local variables, parameters, return address
  → Primitive values (int, double, boolean) stored directly
  → Object references (the address/pointer to heap objects)

Characteristics:
  → Extremely fast — just moves a stack pointer
  → Automatically cleaned when a method returns
  → Fixed size (default ~512KB-1MB) — StackOverflowError on overflow (infinite recursion)
  → Thread-private — no sharing between threads

━━━ Heap Memory (shared) ━━━

All object instances and arrays live on the heap. Shared across all threads.
  → new Dog() → object allocated on heap, reference stored on stack
  → Much larger than stack (set with -Xmx, e.g. -Xmx4g)
  → Garbage collected — JVM reclaims memory for unreachable objects
  → Thread-shared — requires synchronization for concurrent access

━━━ Garbage Collection ━━━

GC reclaims heap objects with no live references (unreachable objects).
Modern JVMs use Generational GC:
  → Young Generation (Eden + Survivor): most objects die young. Minor GC is fast.
  → Old Generation (Tenured): long-lived objects promoted here. Major/Full GC is slow.
  → Metaspace (Java 8+): class metadata, method bytecode — NOT on heap

Common GCs: G1GC (default Java 9+, balanced pause/throughput), ZGC (ultra-low latency), Shenandoah.

━━━ Memory Leaks in Java ━━━

Java has GC but memory leaks still happen — when objects are referenced but never used:
  → Static collections that grow forever: static Map<K,V> cache that never evicts
  → Listeners not removed: EventBus subscribers held after component destroyed
  → ThreadLocal not cleaned: ThreadLocal variables not removed cause leaks in thread pools
  → Unclosed resources: Connections, Streams not closed (even with GC — they hold OS resources)

Tools: VisualVM, JProfiler, Eclipse MAT for heap dumps.`,
    code: `// ── Stack vs Heap ──────────────────────────────────────
public static void main(String[] args) {
    int x = 42;               // x (primitive) stored on STACK
    String name = "Alice";    // name (reference) on STACK → "Alice" object on HEAP
    Dog dog = new Dog("Rex"); // dog (reference) on STACK → Dog object on HEAP

    compute(x, dog);          // new stack frame created
}                             // frame popped → x, name, dog refs gone from stack

// ── GC: unreachable objects are collected ──────────────
Dog d = new Dog("Max"); // Dog object on heap, d points to it
d = new Dog("Buddy");   // Now "Max" object has no reference → eligible for GC
d = null;               // "Buddy" object now also eligible for GC

// ── Memory Leak #1: Static collection that grows forever
private static Map<String, byte[]> cache = new HashMap<>();
void addToCache(String key, byte[] data) {
    cache.put(key, data); // NEVER removed → heap grows until OOM!
}
// Fix: use WeakHashMap, or Caffeine/Guava cache with eviction

// ── Memory Leak #2: ThreadLocal not cleaned ─────────────
ThreadLocal<UserContext> userContext = new ThreadLocal<>();
// In a Servlet filter or Spring interceptor:
userContext.set(new UserContext(request));
// ... handle request ...
// Without cleanup → object lives until thread dies (never in thread pools!)
// Fix:
try {
    userContext.set(ctx);
    chain.doFilter(request, response);
} finally {
    userContext.remove(); // ALWAYS clean up in finally
}

// ── Resource Leak: always use try-with-resources ────────
try (Connection conn = dataSource.getConnection();
     PreparedStatement ps = conn.prepareStatement(sql)) {
    // auto-closed when block exits — no leak
}`,
    highlights: ['Stack: fast, per-thread, auto-cleaned on method return; Heap: shared, GC-managed, all objects live here', 'GC collects unreachable objects — not all memory issues are leaks; leaks = referenced but unused objects', 'Common leaks: growing static caches, uncleaned ThreadLocal, listeners not removed, unclosed resources'],
  },
  {
    id: 208, category: 'Java', difficulty: 'Mid',
    question: 'What is the difference between checked and unchecked exceptions in Java? When to use custom exceptions?',
    answer: `Exception handling design is a common interview topic. Interviewers want to know you understand the WHY behind checked vs unchecked, not just the definition.

━━━ Exception Hierarchy ━━━

  Throwable
    ├── Error         → JVM failures. Never catch: OutOfMemoryError, StackOverflowError
    └── Exception
          ├── Checked  → extend Exception directly (not RuntimeException)
          └── Unchecked (RuntimeException)

━━━ Checked Exceptions ━━━

Compiler enforces the "handle or declare" rule.
  → Must either: catch it in a try/catch, OR declare it with throws in method signature
  → Examples: IOException, SQLException, ClassNotFoundException
  → Philosophy: these are RECOVERABLE conditions the caller SHOULD handle (file not found — maybe retry, prompt for path)

Downside: "Exception tunneling" — checked exceptions must be declared through every layer, creating boilerplate and coupling your API to implementation details.

━━━ Unchecked Exceptions (RuntimeException) ━━━

No compiler enforcement. They propagate automatically up the call stack.
  → Examples: NullPointerException, IllegalArgumentException, ClassCastException
  → Philosophy: PROGRAMMING ERRORS — the code is wrong (null passed where non-null expected). Callers can't reasonably recover from these.
  → Modern Spring Boot style: prefer unchecked to avoid tunneling boilerplate.

━━━ Custom Exceptions — Best Practice ━━━

Create custom exceptions to make your domain model explicit:
  → ResourceNotFoundException (not generic RuntimeException("not found"))
  → DuplicateEmailException, InsufficientBalanceException
  → Add domain fields: errorCode, resourceId

ALWAYS chain exceptions (preserve the cause):
  catch (SQLException e) { throw new DataAccessException("Query failed", e); }
Never swallow the cause — it destroys the stack trace.

━━━ Spring Boot Pattern ━━━

Throw custom unchecked exceptions in your service layer.
Catch them globally in @RestControllerAdvice with @ExceptionHandler.
Map to appropriate HTTP status: 404 for ResourceNotFoundException, 400 for ValidationException.`,
    code: `// ── Checked — must handle or declare ──────────────────
public String readConfig(String path) throws IOException { // declare
    return Files.readString(Path.of(path));
}

try {
    String config = readConfig("app.json");
} catch (IOException e) {
    log.error("Config read failed", e); // must catch
}

// ── Unchecked — no declaration needed ─────────────────
public User findUser(Long id) {
    return repo.findById(id)
        .orElseThrow(() -> new UserNotFoundException(id)); // no throws needed
}

// ── Custom Exception — domain-specific, with context ──
public class ResourceNotFoundException extends RuntimeException {
    private final String resourceType;
    private final Object resourceId;

    public ResourceNotFoundException(String type, Object id) {
        super(String.format("%s not found with id: %s", type, id));
        this.resourceType = type;
        this.resourceId   = id;
    }

    public String getResourceType() { return resourceType; }
    public Object getResourceId()   { return resourceId; }
}

// Usage — clear and expressive:
throw new ResourceNotFoundException("User", userId);
throw new ResourceNotFoundException("Policy", policyNumber);

// ── Multi-catch (Java 7+) ─────────────────────────────
try {
    processPayment(amount);
} catch (InsufficientBalanceException | PaymentGatewayException e) {
    log.warn("Payment failed: {}", e.getMessage());
    notifyUser(e.getMessage());
} finally {
    auditLog.record("PAYMENT_ATTEMPT"); // always runs
}

// ── try-with-resources — auto-close, no finally needed
try (InputStream in  = new FileInputStream("input.txt");
     OutputStream out = new FileOutputStream("output.txt")) {
    in.transferTo(out); // closed automatically in reverse order
}

// ── Global handler in Spring Boot ─────────────────────
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiError handleNotFound(ResourceNotFoundException ex) {
        return new ApiError("NOT_FOUND", ex.getMessage());
    }
}`,
    highlights: ['Checked: compiler-enforced "handle or declare" — for recoverable conditions', 'Unchecked (RuntimeException): programming errors — prefer in modern Spring apps', 'Custom exceptions: extend RuntimeException, add domain fields, ALWAYS chain the cause'],
  },
  {
    id: 209, category: 'Java', difficulty: 'Junior',
    question: 'What is the difference between String, StringBuilder, and StringBuffer in Java?',
    answer: `String manipulation performance is a surprisingly deep topic. Interviewers often ask about this because poor String handling in loops is one of the most common Java performance mistakes.

━━━ String — Immutable ━━━

String objects in Java are IMMUTABLE. Once created, they cannot be changed.
Every "modification" creates a NEW String object on the heap.

  String s = "Hello";
  s = s + " World"; // s now points to a NEW String — "Hello" is discarded

This matters in loops:
  String result = "";
  for (int i = 0; i < 1000; i++) {
      result += i; // creates 1000 new String objects — very slow!
  }

String objects are cached in the String Pool (intern pool) in the heap.
  String a = "hello"; // goes in String Pool
  String b = "hello"; // reuses same pool object
  a == b → true (same reference from pool)

  String c = new String("hello"); // forces new heap object (avoid this)
  a == c → false

━━━ StringBuilder — Mutable, Not Thread-Safe ━━━

StringBuilder is a mutable character buffer. Appends modify the SAME object — no new objects created.
  → Backed by a resizable char[] array
  → Not synchronized — NOT thread-safe
  → Fast — perfect for single-threaded string building (loops, formatting)

━━━ StringBuffer — Mutable, Thread-Safe ━━━

Identical to StringBuilder but every method is synchronized.
  → Thread-safe — multiple threads can use the same instance
  → Slower than StringBuilder due to synchronization overhead
  → Use only when actually sharing across threads (rare in modern code)

━━━ When to Use What ━━━

  String → for fixed, immutable text values; method parameters; keys
  StringBuilder → building strings in loops or algorithms (ALWAYS prefer over +=)
  StringBuffer → genuinely multi-threaded string building (rare — usually StringBuilder + external sync is better)

━━━ Java Compiler Optimization ━━━

The compiler optimises simple concatenation at compile time:
  "Hello" + " " + "World" → "Hello World" (compile-time constant)
But in loops, + creates new objects each iteration — use StringBuilder.`,
    code: `// ── String: immutable — every "change" is a new object ──
String s1 = "Hello";
String s2 = s1 + " World"; // s1 is untouched; s2 is a new object
System.out.println(s1); // "Hello" — original unchanged

// ── String Pool: literals reuse the same object ────────
String a = "hello";
String b = "hello";
System.out.println(a == b);      // true  — same pool reference
System.out.println(a.equals(b)); // true  — same content
String c = new String("hello");  // new heap object (avoid!)
System.out.println(a == c);      // false — different reference
System.out.println(a.equals(c)); // true  — same content

// ── Bad: String += in a loop ─────────────────────────
String result = "";
for (int i = 0; i < 10000; i++) {
    result += i; // creates 10000 new String objects → very slow!
}

// ── Good: StringBuilder in a loop ─────────────────────
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 10000; i++) {
    sb.append(i); // same char[] buffer, no new objects
}
String result2 = sb.toString(); // one final String

// ── StringBuilder useful methods ──────────────────────
StringBuilder sb2 = new StringBuilder("Hello");
sb2.append(" World");          // Hello World
sb2.insert(5, ",");            // Hello, World
sb2.delete(5, 6);              // Hello World
sb2.reverse();                 // dlroW olleH
sb2.replace(0, 5, "Goodbye"); // Goodbye olleH
String built = sb2.toString();

// ── StringBuffer: thread-safe (synchronized) ──────────
StringBuffer sbf = new StringBuffer();
// safe for multiple threads to call sbf.append() concurrently
// but StringBuffer is rarely needed — use StringBuilder + your own lock instead`,
    highlights: ['String is immutable — every modification creates a new object; use equals(), never == for content comparison', 'StringBuilder: mutable, fast, NOT thread-safe — always use in single-threaded string-building loops', 'StringBuffer: thread-safe version of StringBuilder — slower due to synchronization; rarely needed'],
  },
  {
    id: 210, category: 'Java', difficulty: 'Senior',
    question: 'What are Generics in Java? Explain type erasure, wildcards (? extends vs ? super), and PECS.',
    answer: `Generics are a common senior Java interview topic. Most candidates know the basics — interviewers push to wildcards and PECS to filter for depth.

━━━ Why Generics? ━━━

Before Java 5, collections held Object — you had to cast everything:
  List list = new ArrayList();
  list.add("hello");
  String s = (String) list.get(0); // runtime ClassCastException risk

Generics move type checking to COMPILE TIME:
  List<String> safe = new ArrayList<>();
  safe.add(42); // COMPILE ERROR — caught early, not at runtime

━━━ Type Erasure ━━━

Here's the crucial part many miss: generic type information is ERASED at runtime by the compiler.
  List<String> and List<Integer> are both just List at runtime.

Consequences:
  → Cannot: new T[], instanceof List<String>, overload with List<String> vs List<Integer>
  → The compiler adds casts internally and removes the type parameter
  → This is why generic exceptions cannot be caught by type

━━━ Wildcards — ? extends T and ? super T ━━━

Plain generics are INVARIANT: List<Dog> is NOT a List<Animal>.
  void process(List<Animal> animals) { ... }
  process(new ArrayList<Dog>()); // COMPILE ERROR — not assignable!

Fix: use wildcards.

? extends T (upper bound) — "a List of T or any subtype of T":
  → You can READ from it as T
  → You CANNOT add to it (compiler doesn't know the exact subtype)
  → Use when the list is a PRODUCER (you read from it)

? super T (lower bound) — "a List of T or any supertype of T":
  → You can WRITE T to it safely
  → You can only read as Object
  → Use when the list is a CONSUMER (you write to it)

━━━ PECS: Producer Extends, Consumer Super ━━━

The mnemonic for remembering which wildcard to use:
  → If a parameter PRODUCES data you read: use ? extends T
  → If a parameter CONSUMES data you write: use ? super T

Example: Collections.copy(destination, source)
  → source is a Producer (you read from it): List<? extends T>
  → destination is a Consumer (you write to it): List<? super T>`,
    code: `// ── Generic class ────────────────────────────────────
public class Pair<A, B> {
    private final A first;
    private final B second;
    public Pair(A a, B b) { this.first = a; this.second = b; }
    public A getFirst()  { return first; }
    public B getSecond() { return second; }
}
Pair<String, Integer> p = new Pair<>("age", 30); // type-safe

// ── Generic method with bounded type parameter ─────────
public static <T extends Comparable<T>> T max(T a, T b) {
    return a.compareTo(b) > 0 ? a : b;
}
max("Apple", "Banana"); // "Banana" — T inferred as String
max(10, 20);            // 20    — T inferred as Integer

// ── Type Erasure: same type at runtime ────────────────
List<String>  strList  = new ArrayList<>();
List<Integer> intList  = new ArrayList<>();
System.out.println(strList.getClass() == intList.getClass()); // true — both List.class
// Cannot do: new T[], if (obj instanceof List<String>)

// ── Wildcards: solve invariance problem ───────────────
// PROBLEM: List<Dog> is NOT a List<Animal>
void feedAnimals(List<Animal> list) { ... }
// feedAnimals(new ArrayList<Dog>()); // COMPILE ERROR!

// ── ? extends T (Producer Extends) — for READING ──────
public static double sumAll(List<? extends Number> list) {
    // Can READ as Number — works with List<Integer>, List<Double>, List<Long>
    return list.stream().mapToDouble(Number::doubleValue).sum();
    // Cannot: list.add(1.5); // COMPILE ERROR — unknown exact subtype
}
sumAll(List.of(1, 2, 3));     // Integer
sumAll(List.of(1.1, 2.2));   // Double

// ── ? super T (Consumer Super) — for WRITING ──────────
public static void fillWithDefaults(List<? super Integer> list) {
    list.add(0); list.add(1); list.add(2); // safe to write Integer
    // Can only READ as Object: Object o = list.get(0); // no Integer guarantee
}
List<Number> nums = new ArrayList<>();
fillWithDefaults(nums); // works — Number is a supertype of Integer

// ── PECS in Collections.copy ─────────────────────────
// public static <T> void copy(List<? super T> dest, List<? extends T> src)
List<Integer> source = List.of(1, 2, 3);   // Producer: ? extends T
List<Number>  dest   = new ArrayList<>();  // Consumer: ? super T
Collections.copy(dest, source);            // safe and type-checked`,
    highlights: ['Generics: compile-time type safety, no runtime ClassCastException; type info erased at runtime', '? extends T: read-only (Producer Extends); ? super T: write-safe (Consumer Super)', 'PECS: Producer Extends, Consumer Super — the rule for choosing wildcards'],
  },

  // ─── JAVA (continued) ─────────────────────────────────────────
  {
    id: 717, category: 'Java', difficulty: 'Junior',
    question: 'What is the difference between final, finally, and finalize in Java?',
    answer: `This is a classic "confusion trio" question. Interviewers ask it to confirm you understand that these three keywords/methods have nothing to do with each other despite similar names.

━━━ final — Keyword (3 uses) ━━━

1. final variable: can be assigned ONCE — after that it's a constant.
     final int MAX = 100;
     MAX = 200; // COMPILE ERROR

   For object references, final means the REFERENCE can't change — the object itself can still be mutated.
     final List<String> list = new ArrayList<>();
     list.add("hello"); // ✅ fine — object mutated
     list = new ArrayList<>(); // ❌ COMPILE ERROR — reference can't change

2. final method: cannot be overridden by a subclass.
     Useful when you want to lock down specific behaviour in inheritance.

3. final class: cannot be subclassed at all.
     String, Integer, all wrapper classes are final.
     Ensures immutability — no one can extend and add mutable state.

━━━ finally — try/catch block ━━━

The finally block ALWAYS runs after a try/catch — whether an exception occurred or not.
Used to release resources: close files, connections, unlock resources.

Exception: finally won't run if JVM exits (System.exit()) or the JVM crashes.

Modern preference: use try-with-resources instead — it auto-closes AutoCloseable resources more safely.

━━━ finalize — Deprecated ━━━

finalize() is a method on Object, called by the GC before reclaiming an object.
  → Non-deterministic: no guarantee of WHEN or IF it runs
  → Can delay GC — objects with finalize() require an extra GC cycle
  → Deprecated since Java 9, removed-in-practice for production use
  → Use Cleaner API or try-with-resources instead

━━━ Interview Answer ━━━

"final is a keyword for constants, non-overridable methods, and non-extendable classes. finally is a block in try/catch that always executes — used for cleanup. finalize() is a deprecated Object method called before garbage collection — avoid it completely in production."`,
    code: `// ── final variable ─────────────────────────────────────
final int MAX_RETRIES = 3;
// MAX_RETRIES = 5; // COMPILE ERROR

final List<String> list = new ArrayList<>();
list.add("hello");       // ✅ object can still be mutated
// list = new ArrayList<>(); // ❌ reference can't be reassigned

// ── final method — cannot be overridden ───────────────
class PaymentGateway {
    public final void logTransaction(String id) { // locked down
        auditLog.write(id);  // subclass cannot change audit behaviour
    }
}

// ── final class — cannot be subclassed ────────────────
public final class Money {  // immutable value object
    private final double amount;
    private final String currency;
    public Money(double amount, String currency) {
        this.amount = amount; this.currency = currency;
    }
    // No subclass can add mutable state or override behaviour
}

// ── finally — always runs ──────────────────────────────
Connection conn = null;
try {
    conn = dataSource.getConnection();
    conn.execute(sql);
} catch (SQLException e) {
    log.error("Query failed", e);
} finally {
    if (conn != null) conn.close(); // always runs — even if exception thrown
}

// ── try-with-resources (modern — prefer over finally) ──
try (Connection conn2 = dataSource.getConnection()) {
    conn2.execute(sql);
} // conn2 auto-closed here — cleaner than finally

// ── finalize — AVOID (deprecated, non-deterministic) ───
// @Override
// protected void finalize() throws Throwable {
//     // DON'T do this — GC may never call it, or call it at wrong time
//     super.finalize();
// }`,
    highlights: ['final: constant variable, non-overridable method, non-extendable class — 3 distinct uses', 'finally: always executes after try/catch; prefer try-with-resources for resource cleanup', 'finalize(): deprecated GC hook — unpredictable, avoid in all modern code'],
  },
  {
    id: 718, category: 'Java', difficulty: 'Mid',
    question: 'What is the difference between HashMap, LinkedHashMap, TreeMap, and Hashtable?',
    answer: `All four implement Map, but they differ fundamentally in ordering, performance, and thread safety. Choosing the wrong one is a common mistake.

━━━ HashMap ━━━

The default, general-purpose Map. Backed by a hash table.
  → No order guarantee — iteration order is unpredictable
  → O(1) average for get, put, remove (O(n) worst case with hash collisions)
  → Allows one null key and multiple null values
  → NOT thread-safe
  → Java 8+: buckets with 8+ entries convert to a red-black tree → O(log n) worst case (better than before)

Use when: you need fast key-value lookup and don't care about order.

━━━ LinkedHashMap ━━━

Extends HashMap + adds a doubly-linked list maintaining insertion order.
  → Iteration in insertion order (or access order if constructed with accessOrder=true for LRU cache)
  → Slightly slower than HashMap (maintains linked list)
  → Allows null keys/values
  → NOT thread-safe

Use when: you need insertion-order iteration (e.g. JSON building, ordered config, simple LRU cache).

━━━ TreeMap ━━━

A Red-Black Tree backed Map.
  → Keys always sorted by natural order (Comparable) or a supplied Comparator
  → O(log n) for get, put, remove — no O(1) operations
  → Does NOT allow null keys (throws NullPointerException) — must compare keys
  → NOT thread-safe
  → Extra methods: firstKey(), lastKey(), headMap(), tailMap(), subMap()

Use when: you need keys in sorted order, or need range queries (headMap, tailMap).

━━━ Hashtable (Legacy — Avoid) ━━━

Old, synchronized Map from Java 1.
  → Thread-safe but very slow (entire map locked for every operation)
  → Does NOT allow null keys or null values
  → Extends Dictionary (legacy class)
  → Replaced by: ConcurrentHashMap (thread-safe, efficient lock striping)

Use: Never use Hashtable in new code. Use ConcurrentHashMap for thread-safe maps.

━━━ Thread-Safe Modern Alternatives ━━━

  ConcurrentHashMap → thread-safe HashMap, lock striping per segment
  Collections.synchronizedMap(new HashMap<>()) → wraps any map, simpler but locks whole map`,
    code: `// ── HashMap: fast, unordered, allows null ─────────────
Map<String, Integer> hashMap = new HashMap<>();
hashMap.put("banana", 2);
hashMap.put("apple", 1);
hashMap.put("cherry", 3);
hashMap.put(null, 0);       // null key allowed
System.out.println(hashMap); // order NOT guaranteed

// ── LinkedHashMap: insertion-order ────────────────────
Map<String, Integer> linked = new LinkedHashMap<>();
linked.put("banana", 2);
linked.put("apple", 1);
linked.put("cherry", 3);
System.out.println(linked); // {banana=2, apple=1, cherry=3} — insertion order

// ── LinkedHashMap as simple LRU cache ─────────────────
Map<String, String> lruCache = new LinkedHashMap<>(16, 0.75f, true) {
    @Override protected boolean removeEldestEntry(Map.Entry<String,String> e) {
        return size() > 100; // keep at most 100 entries
    }
};

// ── TreeMap: sorted by key ─────────────────────────────
Map<String, Integer> tree = new TreeMap<>();
tree.put("banana", 2);
tree.put("apple", 1);
tree.put("cherry", 3);
System.out.println(tree); // {apple=1, banana=2, cherry=3} — sorted!

TreeMap<String, Integer> t = new TreeMap<>();
String firstKey = t.firstKey();                       // smallest key
String lastKey  = t.lastKey();                        // largest key
SortedMap<String,Integer> sub = t.subMap("a", "m");  // range: a to m (exclusive)

// ── Hashtable: legacy, avoid ──────────────────────────
Hashtable<String, String> table = new Hashtable<>();
// table.put(null, "val"); // NullPointerException!

// ── Thread-safe modern alternative ────────────────────
Map<String, Integer> concurrent = new ConcurrentHashMap<>();
concurrent.put("key", 1);          // lock striping — segment-level locks
concurrent.computeIfAbsent("key2", k -> computeExpensiveValue(k)); // atomic`,
    highlights: ['HashMap: fastest O(1), unordered, allows null key — use by default', 'LinkedHashMap: insertion-order iteration; TreeMap: sorted keys, O(log n)', 'Never use Hashtable — use ConcurrentHashMap for thread-safe maps'],
  },
  {
    id: 719, category: 'Java', difficulty: 'Mid',
    question: 'What is the difference between Comparable and Comparator in Java?',
    answer: `This pair is asked frequently in Java interviews, especially around Collections.sort(), TreeSet, and stream sorting. The key is knowing when to use each and why.

━━━ Comparable — Natural Ordering (inside the class) ━━━

Implement java.lang.Comparable<T> inside your class itself.
Override compareTo(T other) to define the NATURAL (default) ordering.
  → Negative: this comes before other
  → Zero: equal
  → Positive: this comes after other

This natural order is used by: Collections.sort(list), Arrays.sort(), TreeSet, TreeMap.

A class can have only ONE natural order.

━━━ Comparator — Custom Ordering (outside the class) ━━━

java.util.Comparator<T> is defined OUTSIDE the class.
  → Use when you need multiple different sort orders for the same class
  → Use when you can't modify the class (third-party code)
  → Java 8+: Comparator.comparing(), thenComparing(), reversed() factory methods make it very clean

━━━ compareTo contract ━━━

ALWAYS use Integer.compare(a, b) or Double.compare(a, b) — NEVER subtract:
  return this.age - other.age;  // ❌ WRONG! Can overflow with negative numbers
  return Integer.compare(this.age, other.age); // ✅ CORRECT

━━━ Interview Tip ━━━

"When should you use Comparable vs Comparator?"
  → Comparable: when there's an obvious, universal natural order (alphabetical for String, by salary for Employee as the primary sort)
  → Comparator: when you need multiple sort strategies, or can't modify the class

Java 8 Comparator chains are extremely clean and interviewers love seeing them:
  Comparator.comparing(Employee::getDept)
             .thenComparing(Employee::getSalary, Comparator.reverseOrder())`,
    code: `// ── Comparable: natural order inside the class ────────
public class Employee implements Comparable<Employee> {
    private String name;
    private double salary;
    private String dept;

    @Override
    public int compareTo(Employee other) {
        // Natural order: by salary ascending
        return Double.compare(this.salary, other.salary); // ✅ safe, no overflow
        // NEVER: return (int)(this.salary - other.salary); // ❌ can overflow
    }
}

List<Employee> employees = getEmployees();
Collections.sort(employees);    // uses compareTo — sorts by salary
employees.sort(null);           // same — null uses natural order

TreeSet<Employee> set = new TreeSet<>(); // also uses compareTo for ordering

// ── Comparator: custom order, outside the class ────────
// Multiple comparators for same class:
Comparator<Employee> byName      = Comparator.comparing(Employee::getName);
Comparator<Employee> bySalaryDesc= Comparator.comparing(Employee::getSalary).reversed();
Comparator<Employee> byDeptThenSalary = Comparator
    .comparing(Employee::getDept)
    .thenComparing(Employee::getSalary)         // if dept equal, sort by salary
    .thenComparing(Employee::getName);           // if salary equal, sort by name

employees.sort(byDeptThenSalary);

// Sort with lambda (one-liner):
employees.sort((a, b) -> b.getSalary() - a.getSalary() > 0 ? 1 : -1);
// Better:
employees.sort(Comparator.comparingDouble(Employee::getSalary).reversed());

// ── TreeMap with custom Comparator ────────────────────
Map<String, Integer> descMap = new TreeMap<>(Comparator.reverseOrder());
descMap.put("apple", 1);
descMap.put("banana", 2);
System.out.println(descMap); // {banana=2, apple=1} — reverse alphabetical

// ── Comparable vs Comparator summary ──────────────────
// String:   implements Comparable — alphabetical is natural order
// Integer:  implements Comparable — numeric is natural order
// Employee: you define — salary? name? depends on domain

// Stream sorting:
employees.stream()
    .sorted(Comparator.comparing(Employee::getDept)
                      .thenComparing(Employee::getSalary))
    .collect(Collectors.toList());`,
    highlights: ['Comparable: defined inside the class, one natural order, used by default sort', 'Comparator: external, multiple strategies, Java 8 chains (comparing + thenComparing + reversed)', 'NEVER subtract in compareTo — use Integer.compare() or Double.compare() to avoid overflow'],
  },
  {
    id: 720, category: 'Java', difficulty: 'Senior',
    question: 'Explain synchronized, volatile, AtomicInteger, and ReentrantLock in Java concurrency.',
    answer: `Concurrency is a senior-level interview topic. Candidates who can explain thread safety mechanisms correctly — and their trade-offs — stand out immediately.

━━━ The Core Problem: Race Condition ━━━

When two threads simultaneously read-modify-write a shared variable, the result is unpredictable.

  Thread 1: reads count (0), increments to 1, will write 1
  Thread 2: reads count (0), increments to 1, will write 1
  Both write 1 → result is 1, but should be 2!

This is a race condition.

━━━ synchronized — Mutual Exclusion ━━━

synchronized acquires an intrinsic lock (monitor) on an object. Only ONE thread can hold it at a time.
  → synchronized instance method: locks on "this"
  → synchronized static method: locks on the Class object
  → synchronized block: locks on a specific object you specify

Guarantees: ATOMICITY (one thread at a time) + VISIBILITY (changes flushed to main memory).
Cost: thread blocking, context switching, contention.

━━━ volatile — Visibility Only ━━━

volatile ensures that reads/writes to a variable go directly to main memory, not thread-local caches.
Guarantees: VISIBILITY only.
Does NOT guarantee: ATOMICITY. count++ is still a race (read-increment-write are three steps).

Use volatile for: a single boolean flag shared between threads (running = false to stop a thread).

━━━ Atomic Classes — Lock-Free ━━━

AtomicInteger, AtomicLong, AtomicReference — use CPU-level CAS (Compare-And-Swap) instructions.
  → compare-and-set: "set to new value only if current value matches expected"
  → No lock acquisition, no thread blocking → faster than synchronized for single-variable updates
  → All operations are atomic: incrementAndGet(), compareAndSet(), getAndUpdate()

━━━ ReentrantLock — Explicit, Flexible Lock ━━━

ReentrantLock gives you everything synchronized does + more:
  → tryLock(timeout): don't block forever — give up after a timeout
  → lockInterruptibly(): thread can be interrupted while waiting
  → Condition variables: fine-grained wait/notify
  → Fairness: FIFO ordering of waiting threads (prevents starvation)

ALWAYS unlock in finally — if an exception occurs, you must still release the lock.

━━━ When to Use Which ━━━

  volatile     → single flag/reference, visibility only, no compound operations
  AtomicInteger → single counter/value, high contention, lock-free performance
  synchronized → critical section covering multiple statements or multiple variables
  ReentrantLock → need tryLock timeout, interruptibility, or fairness guarantees`,
    code: `// ── Race condition: broken counter ────────────────────
class BrokenCounter {
    int count = 0;
    void increment() { count++; } // NOT atomic: read + increment + write
}
// 2 threads each calling increment() 1000 times → result < 2000!

// ── synchronized: mutual exclusion ────────────────────
class SafeCounter {
    private int count = 0;
    public synchronized void increment()  { count++; }  // one thread at a time
    public synchronized int  getCount()   { return count; }

    // Finer-grained: synchronized block
    private final Object lock = new Object();
    public void incrementFine() {
        synchronized(lock) { count++; }
    }
}

// ── volatile: visibility flag (NOT for counters) ───────
class Worker {
    private volatile boolean running = true; // visible to all threads immediately

    public void run() {
        while (running) {       // reads from main memory each time
            processTask();
        }
    }
    public void stop() { running = false; } // visible to run() thread immediately
}

// ── AtomicInteger: lock-free counter ──────────────────
AtomicInteger atomicCount = new AtomicInteger(0);
atomicCount.incrementAndGet();            // atomic ++ , returns new value
atomicCount.getAndIncrement();            // atomic ++, returns old value
atomicCount.compareAndSet(5, 10);         // set to 10 only if currently 5 (CAS)
atomicCount.getAndUpdate(x -> x * 2);    // lock-free custom update

// ── ReentrantLock: explicit lock with more control ─────
class BankAccount {
    private final Lock lock = new ReentrantLock(true); // true = fair FIFO ordering
    private double balance;

    public void transfer(double amount) {
        lock.lock(); // always pair with try/finally!
        try {
            balance -= amount;
        } finally {
            lock.unlock(); // ALWAYS unlock even if exception thrown
        }
    }

    public boolean tryTransfer(double amount) {
        try {
            if (lock.tryLock(2, TimeUnit.SECONDS)) { // don't wait forever
                try {
                    balance -= amount;
                    return true;
                } finally { lock.unlock(); }
            }
        } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        return false; // couldn't acquire lock in 2 seconds
    }
}`,
    highlights: ['volatile: visibility only (flag); synchronized: atomicity + visibility for compound operations', 'AtomicInteger: lock-free CAS operations — faster than synchronized for single-variable counters', 'ReentrantLock: use when you need tryLock timeout, interruptibility, or FIFO fairness'],
  },

  // ─── PYTHON ───────────────────────────────────────────────
  {
    id: 301, category: 'Python', difficulty: 'Junior',
    question: 'What is the difference between a list, tuple, and set in Python?',
    answer: 'Lists are ordered and mutable. Tuples are ordered and immutable — good for fixed data and dictionary keys. Sets are unordered, store only unique values, and support fast membership checks.',
    code: `lst = [1, 2, 2, 3]    # ordered, mutable, allows dups
tup = (1, 2, 3)        # ordered, immutable
st  = {1, 2, 2, 3}    # unordered, unique only -> {1,2,3}

print(2 in st)  # O(1) lookup`,
    highlights: ['List = ordered mutable', 'Tuple = immutable', 'Set = unique + fast lookup'],
  },
  {
    id: 302, category: 'Python', difficulty: 'Junior',
    question: 'What are list comprehensions and generator expressions?',
    answer: 'List comprehensions build an entire list in memory in one expression. Generator expressions yield items one at a time — they are memory-efficient for large data because they do not build the list upfront.',
    code: `# List comprehension - all in memory
squares = [x**2 for x in range(10)]

# Generator - lazy, one at a time
gen = (x**2 for x in range(10_000_000))
print(next(gen))  # 0 — no memory spike`,
    highlights: ['Comprehension = eager', 'Generator = lazy', 'Generators save memory'],
  },
  {
    id: 303, category: 'Python', difficulty: 'Mid',
    question: 'What are decorators in Python?',
    answer: 'A decorator is a function that wraps another function to add behaviour before or after it runs, without modifying the original. The @syntax is shorthand for passing the function to the decorator.',
    code: `def timer(fn):
    def wrapper(*args, **kwargs):
        import time
        start = time.time()
        result = fn(*args, **kwargs)
        print(f"Took {time.time()-start:.2f}s")
        return result
    return wrapper

@timer
def slow(): import time; time.sleep(1)
slow()`,
    highlights: ['Wraps a function', '@syntax = sugar', 'No original change needed'],
  },
  {
    id: 304, category: 'Python', difficulty: 'Mid',
    question: 'What is the difference between *args and **kwargs?',
    answer: '*args collects extra positional arguments into a tuple. **kwargs collects extra keyword arguments into a dictionary. Together they let you write functions that accept any combination of arguments.',
    code: `def log(*args, **kwargs):
    for a in args:
        print(a)
    for k, v in kwargs.items():
        print(f"{k}={v}")

log("hello", 42, user="alice", role="admin")`,
    highlights: ['*args = positional tuple', '**kwargs = keyword dict', 'Flexible function signatures'],
  },
  {
    id: 305, category: 'Python', difficulty: 'Mid',
    question: 'What is the GIL in Python and how does it affect concurrency?',
    answer: 'The Global Interpreter Lock (GIL) allows only one thread to execute Python bytecode at a time, even on multi-core CPUs. This limits CPU-bound threads but does not affect I/O-bound code (use asyncio or threads for I/O, multiprocessing for CPU).',
    code: `import multiprocessing, threading

# CPU-bound: use multiprocessing to bypass GIL
p = multiprocessing.Process(target=heavy_task)

# I/O-bound: threads/asyncio are fine
t = threading.Thread(target=fetch_data)`,
    highlights: ['GIL limits CPU threads', 'I/O is fine with threads', 'Multiprocessing for CPU tasks'],
  },
  {
    id: 306, category: 'Python', difficulty: 'Mid',
    question: 'What are Python context managers and the with statement?',
    answer: 'Context managers handle setup and teardown automatically. The with statement calls __enter__ before the block and __exit__ after, even if an exception occurs. This is perfect for files, DB connections, and locks.',
    code: `with open("data.txt", "r") as f:
    content = f.read()
# file closed automatically

from contextlib import contextmanager

@contextmanager
def managed():
    print("setup")
    yield
    print("teardown")`,
    highlights: ['Auto cleanup', '__enter__/__exit__', 'Handles exceptions cleanly'],
  },
  {
    id: 307, category: 'Python', difficulty: 'Senior',
    question: 'What is the difference between shallow copy and deep copy in Python?',
    answer: 'A shallow copy (copy.copy) creates a new container but the nested objects are still shared references. A deep copy (copy.deepcopy) recursively copies all nested objects, so changes to the copy never affect the original.',
    code: `import copy
original = [[1, 2], [3, 4]]

shallow = copy.copy(original)
shallow[0].append(99)
print(original[0])  # [1, 2, 99] — affected!

deep = copy.deepcopy(original)
deep[0].append(99)
print(original[0])  # [1, 2] — safe`,
    highlights: ['Shallow shares nested refs', 'Deep clones everything', 'Use deepcopy for nested data'],
  },
  {
    id: 308, category: 'Python', difficulty: 'Senior',
    question: 'What are Python dataclasses and when should you use them?',
    answer: 'Dataclasses auto-generate __init__, __repr__, and __eq__ from field annotations. Use them instead of plain classes when your class is mainly a container for data. They reduce boilerplate significantly.',
    code: `from dataclasses import dataclass, field

@dataclass
class User:
    name: str
    age: int
    roles: list = field(default_factory=list)

u = User("Alice", 30)
print(u)  # User(name='Alice', age=30, roles=[])`,
    highlights: ['Auto __init__/__repr__', 'Less boilerplate', 'Good for data containers'],
  },
  {
    id: 309, category: 'Python', difficulty: 'Junior',
    question: 'What is the difference between is and == in Python?',
    answer: '== checks value equality — do these objects have the same content? is checks identity — are these the exact same object in memory? Use == for value checks; is only for None checks.',
    code: `a = [1, 2]
b = [1, 2]
print(a == b)    # True — same content
print(a is b)    # False — different objects

print(None is None)  # True — only one None`,
    highlights: ['== checks value', 'is checks identity', 'Use is only for None'],
  },
  {
    id: 310, category: 'Python', difficulty: 'Mid',
    question: 'How does Python handle multiple inheritance and what is MRO?',
    answer: 'Python allows multiple inheritance. The Method Resolution Order (MRO) determines which class method is called when there is ambiguity. Python uses C3 linearization so the order is deterministic and consistent.',
    code: `class A: def greet(self): return "A"
class B(A): def greet(self): return "B"
class C(A): def greet(self): return "C"
class D(B, C): pass

print(D().greet())    # "B"
print(D.__mro__)      # D -> B -> C -> A`,
    highlights: ['MRO = resolution order', 'C3 linearization', 'Left-to-right depth-first'],
  },

  // ─── DATABASE ─────────────────────────────────────────────
  {
    id: 401, category: 'Database', difficulty: 'Junior',
    question: 'What is the difference between SQL and NoSQL databases?',
    answer: 'SQL databases use fixed schemas, tables, and relations — great for structured data and complex queries with JOINs. NoSQL databases (document, key-value, graph, column) are schema-flexible and scale horizontally — great for unstructured or rapidly changing data.',
    code: `-- SQL: structured, joins
SELECT u.name, o.total
FROM users u JOIN orders o ON u.id = o.user_id;

// NoSQL MongoDB: flexible documents
db.users.findOne({ _id: userId })`,
    highlights: ['SQL = structured + relations', 'NoSQL = flexible + scale-out', 'Choose based on data shape'],
  },
  {
    id: 402, category: 'Database', difficulty: 'Junior',
    question: 'What are ACID properties in databases?',
    answer: 'ACID guarantees that transactions are reliable. Atomicity means all-or-nothing. Consistency ensures the database moves from one valid state to another. Isolation means concurrent transactions do not interfere. Durability means committed data survives crashes.',
    code: `BEGIN TRANSACTION;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
-- Either both rows update, or neither does (Atomicity)`,
    highlights: ['Atomic = all or nothing', 'Consistent = valid state', 'Isolated + Durable'],
  },
  {
    id: 403, category: 'Database', difficulty: 'Mid',
    question: 'What is database indexing and when should you use it?',
    answer: 'An index is a data structure (usually a B-tree) that speeds up read queries by letting the database locate rows without scanning the whole table. Indexes slow down writes and use storage. Add them on columns used in WHERE, JOIN, and ORDER BY clauses.',
    code: `-- Without index: full table scan O(n)
SELECT * FROM orders WHERE user_id = 42;

-- Create index
CREATE INDEX idx_orders_user ON orders(user_id);

-- Now query uses index: O(log n)`,
    highlights: ['B-tree structure', 'Speeds reads, slows writes', 'Index WHERE/JOIN columns'],
  },
  {
    id: 404, category: 'Database', difficulty: 'Mid',
    question: 'What is the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN?',
    answer: 'INNER JOIN returns only rows with matches in both tables. LEFT JOIN returns all rows from the left table and matching rows from the right (nulls for no match). FULL OUTER JOIN returns all rows from both tables, filling nulls where there is no match.',
    code: `-- INNER: only matching rows
SELECT * FROM orders o INNER JOIN users u ON o.user_id = u.id;

-- LEFT: all orders, user may be null
SELECT * FROM orders o LEFT JOIN users u ON o.user_id = u.id;

-- FULL OUTER: all from both
SELECT * FROM orders o FULL OUTER JOIN users u ON o.user_id = u.id;`,
    highlights: ['INNER = intersection', 'LEFT = all left rows', 'FULL OUTER = all rows'],
  },
  {
    id: 405, category: 'Database', difficulty: 'Mid',
    question: 'What is database normalization and what are the normal forms?',
    answer: 'Normalization reduces data redundancy by organizing data into related tables. 1NF: atomic values, no repeating groups. 2NF: no partial dependencies on composite keys. 3NF: no transitive dependencies (non-key columns depending on other non-key columns).',
    code: `-- Unnormalized (city repeats with zip)
users: id | name | city | zip

-- 3NF: separate zip->city dependency
users: id | name | zip_id
zips:  zip_id | city | state`,
    highlights: ['1NF = atomic values', '2NF = no partial deps', '3NF = no transitive deps'],
  },
  {
    id: 406, category: 'Database', difficulty: 'Senior',
    question: 'What is the N+1 query problem and how do you fix it?',
    answer: 'The N+1 problem occurs when fetching a list of N records and then making one extra query per record to fetch related data — a total of N+1 queries. Fix it with JOIN, eager loading (ORM includes), or batch fetching.',
    code: `// N+1 problem (BAD)
const posts = await Post.findAll(); // 1 query
for (const post of posts) {
  post.user = await User.findById(post.userId); // N queries
}

// Fixed with JOIN / eager load
const posts = await Post.findAll({ include: [User] }); // 1 query`,
    highlights: ['N+1 = slow hidden queries', 'Fix with JOIN/includes', 'Profile queries in ORM'],
  },
  {
    id: 407, category: 'Database', difficulty: 'Senior',
    question: 'What is database sharding and when do you need it?',
    answer: 'Sharding splits a large database table horizontally across multiple servers (shards) by a shard key. It is needed when a single server cannot handle the data volume or write throughput. It adds operational complexity and makes cross-shard joins difficult.',
    code: `// Shard by user_id range
Shard 1: user_id 0–1M       -> Server A
Shard 2: user_id 1M–2M      -> Server B
Shard 3: user_id 2M+        -> Server C

// Queries route to the right shard
SELECT * FROM orders WHERE user_id = 500000; // → Server A`,
    highlights: ['Horizontal partition', 'By shard key', 'Adds cross-shard complexity'],
  },
  {
    id: 408, category: 'Database', difficulty: 'Mid',
    question: 'What are database transactions and isolation levels?',
    answer: 'Transactions group operations so they all succeed or all fail. Isolation levels control what one transaction can see from others. Read Uncommitted is fastest but dirty. Read Committed prevents dirty reads. Repeatable Read prevents non-repeatable reads. Serializable is the safest but slowest.',
    code: `-- Read Committed (default in PostgreSQL)
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;

BEGIN;
  SELECT balance FROM accounts WHERE id = 1; -- sees committed only
  UPDATE accounts SET balance = balance - 50 WHERE id = 1;
COMMIT;`,
    highlights: ['4 isolation levels', 'Higher = safer, slower', 'Postgres default = Read Committed'],
  },

  // ─── HTML / CSS ───────────────────────────────────────────
  {
    id: 501, category: 'HTML/CSS', difficulty: 'Junior',
    question: 'What is the difference between block, inline, and inline-block elements?',
    answer: 'Block elements take the full width and start on a new line (div, p, h1). Inline elements sit in the text flow and cannot have width/height (span, a). Inline-block flows like inline but accepts width and height like a block.',
    code: `/* Block */
div { display: block; }   /* full width, new line */

/* Inline */
span { display: inline; } /* flows in text, no w/h */

/* Inline-block */
.btn { display: inline-block; width: 120px; }`,
    highlights: ['Block = full width', 'Inline = text flow', 'Inline-block = both'],
  },
  {
    id: 502, category: 'HTML/CSS', difficulty: 'Junior',
    question: 'What is the difference between Flexbox and CSS Grid?',
    answer: 'Flexbox is one-dimensional — great for rows or columns of items. Grid is two-dimensional — great for full page layouts where items need to align in both axes. Use Flexbox inside components, Grid for the overall page structure.',
    code: `/* Flexbox: 1D row of items */
.nav { display: flex; gap: 16px; align-items: center; }

/* Grid: 2D layout */
.page {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: auto 1fr auto;
}`,
    highlights: ['Flexbox = 1D (row/col)', 'Grid = 2D layout', 'Often used together'],
  },
  {
    id: 503, category: 'HTML/CSS', difficulty: 'Mid',
    question: 'What is the CSS box model?',
    answer: 'Every element is a box with four layers: content, padding, border, and margin. By default, width applies only to content. With box-sizing: border-box, width includes padding and border — which is almost always what you want.',
    code: `* { box-sizing: border-box; } /* always add this */

.card {
  width: 300px;     /* includes padding + border */
  padding: 20px;
  border: 1px solid #ccc;
  margin: 16px;     /* outside the box */
}`,
    highlights: ['Content → padding → border → margin', 'border-box = intuitive sizing', 'Reset with * {}'],
  },
  {
    id: 504, category: 'HTML/CSS', difficulty: 'Mid',
    question: 'What are CSS specificity and the cascade?',
    answer: 'When multiple rules target the same element, specificity determines which wins. Inline styles beat IDs, IDs beat classes, classes beat elements. The cascade also considers source order — later rules override earlier ones at equal specificity.',
    code: `/* Specificity: (inline, IDs, classes, elements) */
p           { color: black; }   /* 0,0,0,1 */
.text       { color: blue; }    /* 0,0,1,0 */
#main .text { color: green; }   /* 0,1,1,0 = wins */

/* !important overrides all — avoid */`,
    highlights: ['ID > class > element', 'Later rules win at tie', 'Avoid !important'],
  },
  {
    id: 505, category: 'HTML/CSS', difficulty: 'Junior',
    question: 'What is semantic HTML and why does it matter?',
    answer: 'Semantic HTML uses elements that convey meaning: header, nav, main, article, section, aside, footer. This improves accessibility (screen readers navigate by landmarks), SEO (search engines understand structure), and maintainability.',
    code: `<!-- Non-semantic -->
<div class="nav"><div class="item">Home</div></div>

<!-- Semantic -->
<header>
  <nav>
    <a href="/">Home</a>
  </nav>
</header>
<main>
  <article>...</article>
</main>`,
    highlights: ['Meaningful tags', 'Better accessibility', 'Helps SEO'],
  },
  {
    id: 506, category: 'HTML/CSS', difficulty: 'Mid',
    question: 'What is CSS positioning — static, relative, absolute, fixed, sticky?',
    answer: 'Static is the default flow. Relative offsets from its own position. Absolute is removed from flow and positioned relative to the nearest positioned ancestor. Fixed stays at a viewport position. Sticky is like relative until it hits a scroll threshold, then acts fixed.',
    code: `.parent { position: relative; }

.tooltip {
  position: absolute; /* relative to .parent */
  top: 100%; left: 0;
}

.header { position: sticky; top: 0; } /* stays at top */
.modal  { position: fixed; inset: 0; } /* viewport */`,
    highlights: ['Absolute = nearest positioned parent', 'Fixed = viewport', 'Sticky = scroll threshold'],
  },
  {
    id: 507, category: 'HTML/CSS', difficulty: 'Senior',
    question: 'What are CSS custom properties (variables) and how do they enable theming?',
    answer: 'CSS custom properties (--name: value) are inherited, live in the cascade, and can be overridden per-selector. They enable theming by defining a root token set and overriding it inside a [data-theme="dark"] selector without any JavaScript.',
    code: `:root {
  --color-bg:   #ffffff;
  --color-text: #111111;
}
[data-theme="dark"] {
  --color-bg:   #111111;
  --color-text: #f0f0f0;
}
body { background: var(--color-bg); color: var(--color-text); }`,
    highlights: ['Inherited through DOM', 'Override per-selector', 'No JS needed for themes'],
  },

  // ─── JWT / AUTH ───────────────────────────────────────────
  {
    id: 601, category: 'JWT', difficulty: 'Junior',
    question: 'What is a JWT and what are its three parts?',
    answer: 'A JSON Web Token is a compact, self-contained string for transmitting verified claims. It has three Base64url-encoded parts separated by dots: the Header (algorithm), the Payload (claims/data), and the Signature (proves it was not tampered with).',
    code: `// Structure: header.payload.signature
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9   // header
.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiJ9  // payload
.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV    // signature

// Verify on server
const decoded = jwt.verify(token, process.env.JWT_SECRET);`,
    highlights: ['Header.Payload.Signature', 'Base64url encoded', 'Server verifies signature'],
  },
  {
    id: 602, category: 'JWT', difficulty: 'Mid',
    question: 'What is the difference between authentication and authorization?',
    answer: 'Authentication verifies who you are — proving your identity with a password or token. Authorization determines what you are allowed to do — checking roles and permissions. JWT is typically used for authentication; the payload carries roles for authorization checks.',
    code: `// Authentication: verify identity, issue JWT
const token = jwt.sign({ userId: 1 }, SECRET, { expiresIn: '1h' });

// Authorization: check role in middleware
const { role } = jwt.verify(token, SECRET);
if (role !== 'admin') throw new Error('Forbidden');`,
    highlights: ['AuthN = who are you', 'AuthZ = what can you do', 'JWT carries both'],
  },
  {
    id: 603, category: 'JWT', difficulty: 'Mid',
    question: 'What is the difference between access tokens and refresh tokens?',
    answer: 'Access tokens are short-lived (minutes to hours) and sent on every request to authenticate the user. Refresh tokens are long-lived (days to weeks) and stored securely to request new access tokens. This limits exposure when an access token is leaked.',
    code: `// On login
const access  = jwt.sign(payload, SECRET, { expiresIn: '15m' });
const refresh = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });

// Refresh endpoint
app.post('/refresh', (req, res) => {
  const { userId } = jwt.verify(req.body.refresh, REFRESH_SECRET);
  const newAccess = jwt.sign({ userId }, SECRET, { expiresIn: '15m' });
  res.json({ access: newAccess });
});`,
    highlights: ['Access = short-lived', 'Refresh = long-lived', 'Minimizes leaked-token damage'],
  },
  {
    id: 604, category: 'JWT', difficulty: 'Mid',
    question: 'Where should you store JWTs on the client?',
    answer: 'HttpOnly cookies protect against XSS attacks because JavaScript cannot read them. localStorage is easy to use but vulnerable to XSS. Memory (JavaScript variable) is the safest but lost on page refresh. For most apps, HttpOnly cookies with CSRF protection is the recommended approach.',
    code: `// Secure: HttpOnly cookie (server sets it)
res.cookie('token', jwt, {
  httpOnly: true,  // JS cannot read
  secure: true,    // HTTPS only
  sameSite: 'strict', // CSRF protection
});

// Risky: localStorage (XSS can read)
localStorage.setItem('token', jwt);`,
    highlights: ['HttpOnly = XSS safe', 'localStorage = XSS risk', 'sameSite = CSRF protection'],
  },
  {
    id: 605, category: 'JWT', difficulty: 'Senior',
    question: 'How do you invalidate a JWT before it expires?',
    answer: 'JWTs are stateless — the server cannot revoke them once issued unless it tracks state. Common approaches: maintain a token blacklist in Redis and check each request, use a short expiry and rotate often, or use a unique jti (JWT ID) per token and mark revoked IDs in a database.',
    code: `// Option 1: Redis blacklist
const isRevoked = await redis.get(\`blacklist:\${token.jti}\`);
if (isRevoked) throw new Error('Token revoked');

// Option 2: jti-based revocation
const tokenId = crypto.randomUUID();
const jwt = sign({ userId, jti: tokenId }, SECRET);
// On logout: store tokenId in revoked_tokens table`,
    highlights: ['JWTs are stateless by default', 'Redis blacklist = fast check', 'jti tracks individual tokens'],
  },
  {
    id: 606, category: 'JWT', difficulty: 'Mid',
    question: 'What is OAuth 2.0 and how does it relate to JWT?',
    answer: 'OAuth 2.0 is an authorization framework that lets users grant third-party apps access to their data without sharing passwords. The authorization server issues access tokens (often JWTs) that the client uses to call resource servers on behalf of the user.',
    code: `// OAuth 2.0 Authorization Code Flow
// 1. User clicks "Login with Google"
// 2. Google shows consent screen
// 3. Google redirects with ?code=AUTH_CODE
// 4. Your server exchanges code for tokens
const { access_token } = await exchangeCode(code);
// access_token is typically a JWT`,
    highlights: ['OAuth = delegation framework', 'JWT = token format', 'Code flow = most secure'],
  },

  // ─── MASTERPACK ADDITIONS ───────────────────────────────
  {
    id: 701, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is the difference between map, filter, and reduce?',
    answer: 'map transforms each item and returns a new array of the same length. filter keeps only the items that pass a condition, returning a new (possibly shorter) array. reduce folds the array into one accumulated value over time using a callback(accumulator, current) — it\'s the most general of the three and can implement map or filter itself. A related method, find, returns the first matching element itself (not wrapped in an array), or undefined if none match — useful when you want one item, not a filtered list.',
    code: `const nums = [1, 2, 3, 4];
const doubled = nums.map(n => n * 2);
const evens = nums.filter(n => n % 2 === 0);
const sum = nums.reduce((acc, n) => acc + n, 0);
const firstEven = nums.find(n => n % 2 === 0); // 2 — the element, not an array`,
    highlights: ['map transforms', 'filter narrows', 'reduce aggregates'],
  },
  {
    id: 702, category: 'JavaScript', difficulty: 'Mid',
    question: 'What is the difference between call, apply, and bind?',
    answer: 'call and apply invoke a function immediately with a given this value; apply accepts an array of arguments, while call accepts them individually. bind returns a new function that will use the provided this value later.',
    code: `function greet(city, country) { console.log(this.name, city, country); }
const person = { name: 'Ada' };
greet.call(person, 'London', 'UK');
greet.apply(person, ['London', 'UK']);
const bound = greet.bind(person, 'London');`,
    highlights: ['call = immediate, comma-separated', 'apply = immediate, array', 'bind = new function'],
  },
  {
    id: 703, category: 'JavaScript', difficulty: 'Junior',
    question: 'How does async/await help with asynchronous code?',
    answer: 'async/await makes promises easier to read by letting you write asynchronous logic in a more linear style. It avoids deeply nested callbacks and makes error handling with try/catch much simpler.',
    code: `async function loadUser() {
  try {
    const user = await fetchUser();
    console.log(user.name);
  } catch (e) {
    console.error(e);
  }
}`,
    highlights: ['Readable async flows', 'try/catch friendly', 'Built on promises'],
  },
  {
    id: 704, category: 'JavaScript', difficulty: 'Mid',
    question: 'What happens when a promise rejects inside a chain? How does error propagation work and what are common pitfalls?',
    answer: `Understanding Promise error propagation is critical — silent failures are one of the most common production bugs in JavaScript.

When a rejection occurs:
1. The rejection skips ALL subsequent .then() handlers in the chain
2. It falls through to the nearest .catch() handler
3. After .catch() handles it, the chain CONTINUES as fulfilled (unless you re-throw)
4. If NO .catch() exists anywhere — UnhandledPromiseRejection — in modern Node.js this crashes the process

Key pitfalls interviewers love to probe:
- Swallowing errors: .catch() that doesn't re-throw silently resumes the chain as fulfilled
- Missing return inside .then(): undefined flows to the next step — looks fine, fails silently
- try/catch does NOT catch async errors unless the function is awaited
- .finally() always runs but does NOT receive the value/reason — it's for cleanup only

Best practice: always terminate every promise chain with .catch(), or use async/await with try/catch which is structurally harder to miss.`,
    code: `// How rejection propagates — skips .then(), hits .catch()
fetchData()
  .then(data => process(data))     // SKIPPED if fetchData() rejects
  .then(result => save(result))    // SKIPPED if any above rejects
  .catch(err => {
    console.error('Caught:', err); // catches rejection from ANY step above
    // Does NOT re-throw → chain continues as fulfilled from here
  })
  .then(() => console.log('This STILL runs after catch!')); // always runs

// Re-throw to keep the rejection propagating
.catch(err => {
  logToSentry(err); // do something with it
  throw err;        // re-throw so the caller knows it failed
})

// .finally() — cleanup regardless of outcome
fetch(url)
  .then(res => res.json())
  .catch(err => handleError(err))
  .finally(() => hideLoadingSpinner()); // runs whether success or failure

// PITFALL 1: Swallowing errors — chain resumes as if nothing happened
fetchData()
  .catch(err => { console.log(err); }) // logs but doesn't re-throw
  .then(() => doImportantWork());       // runs even after failure! Silent bug.

// PITFALL 2: Missing return breaks the chain silently
fetchUser()
  .then(user => {
    fetchOrders(user.id); // forgot 'return'! Promise is LOST
  })
  .then(orders => render(orders)); // orders is undefined here

// CORRECT
fetchUser()
  .then(user => fetchOrders(user.id)) // return the promise
  .then(orders => render(orders));    // now receives real orders`,
    highlights: [
      'Rejection skips all .then() until the nearest .catch()',
      '.catch() that does not re-throw silently resumes the chain as fulfilled',
      'Missing return inside .then() silently passes undefined downstream',
      '.finally() runs on both success and failure — perfect for hiding spinners',
    ],
  },
  {
    id: 705, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is the difference between slice and splice?',
    answer: 'slice copies a portion of an array without changing the original. splice changes the original array by adding or removing items.',
    code: `const arr = [1, 2, 3, 4];
const copy = arr.slice(1, 3); // [2, 3]
arr.splice(1, 1); // arr becomes [1, 3, 4]`,
    highlights: ['slice = copy', 'splice = mutate', 'Original array changes'],
  },
  {
    id: 706, category: 'JavaScript', difficulty: 'Mid',
    question: 'What is the difference between Object.assign and the spread operator?',
    answer: 'Both can copy enumerable properties from one object into another. The spread operator is more concise and often easier to read, while Object.assign is useful when you want to work with older code or use a method-style API.',
    code: `const base = { a: 1, b: 2 };
const copy = { ...base };
const merged = Object.assign({}, base, { c: 3 });`,
    highlights: ['Both copy properties', 'Spread is concise', 'Object.assign is explicit'],
  },
  {
    id: 707, category: 'React', difficulty: 'Mid',
    question: 'What is the difference between useEffect and useLayoutEffect?',
    answer: 'useEffect runs after the browser paints, so it is better for non-blocking work like fetching data. useLayoutEffect runs synchronously after DOM mutations but before the browser paints, so it is useful for measuring layout or avoiding flicker.',
    code: `useEffect(() => {
  console.log('after paint');
}, []);

useLayoutEffect(() => {
  console.log('before paint');
}, []);`,
    highlights: ['useEffect = post-paint', 'useLayoutEffect = pre-paint', 'Good for layout measurement'],
  },
  {
    id: 708, category: 'React', difficulty: 'Mid',
    question: 'What is Suspense in React?',
    answer: 'Suspense lets a component display a fallback UI while async work such as lazy-loaded components or data fetching is still pending. It improves perceived performance and makes loading states easier to manage.',
    code: `const Dashboard = React.lazy(() => import('./Dashboard'));

<Suspense fallback={<Spinner />}>
  <Dashboard />
</Suspense>`,
    highlights: ['Fallback UI', 'Handles async rendering', 'Great for code splitting'],
  },
  {
    id: 709, category: 'React', difficulty: 'Mid',
    question: 'What is the purpose of forwardRef?',
    answer: 'forwardRef lets a component receive a ref from its parent and pass it to a child DOM node or custom component. It is especially useful for form fields, charts, and other reusable controls that need imperative access.',
    code: `const Input = React.forwardRef((props, ref) => (
  <input ref={ref} {...props} />
));`,
    highlights: ['Pass refs through components', 'Useful for imperative control', 'Common in form libraries'],
  },
  {
    id: 710, category: 'React', difficulty: 'Senior',
    question: 'What is the purpose of useId?',
    answer: 'useId generates stable unique IDs for accessibility and client/server consistency in React. It is most commonly used for form labels, ARIA relationships, and server-rendered components.',
    code: `function Field() {
  const id = useId();
  return <><label htmlFor={id}>Name</label><input id={id} /></>;
}`,
    highlights: ['Stable unique IDs', 'Good for accessibility', 'Useful in SSR'],
  },
  {
    id: 711, category: 'React', difficulty: 'Mid',
    question: 'What is the difference between controlled and uncontrolled forms in React?',
    answer: 'Controlled forms keep the value in React state and update through event handlers. Uncontrolled forms let the DOM hold the value and rely on refs. Controlled forms are easier to validate and sync with the UI.',
    code: `const [value, setValue] = useState('');
<input value={value} onChange={e => setValue(e.target.value)} />`,
    highlights: ['Controlled = React state', 'Uncontrolled = DOM state', 'Validation easier with controlled'],
  },
  {
    id: 712, category: 'React', difficulty: 'Mid',
    question: 'Why should you avoid mutating state directly in React?',
    answer: 'Mutating state directly can cause React to miss changes because it relies on new references to detect updates. Always create new objects or arrays when updating state so the component re-renders correctly.',
    code: `setTodos(prev => [...prev, newTodo]);
setUser({ ...user, name: 'Ada' });`,
    highlights: ['Avoid direct mutation', 'Create new references', 'Ensures re-renders'],
  },
  {
    id: 713, category: 'Node.js', difficulty: 'Junior',
    question: 'What is the difference between blocking and non-blocking I/O in Node.js?',
    answer: 'Blocking I/O pauses execution until the operation completes. Non-blocking I/O lets Node continue handling other work while the operation is pending, which is one reason Node scales well for I/O-heavy apps.',
    code: `const fs = require('fs');
fs.readFile('data.txt', 'utf8', callback);`,
    highlights: ['Blocking pauses execution', 'Non-blocking stays responsive', 'Core Node strength'],
  },
  {
    id: 714, category: 'Node.js', difficulty: 'Mid',
    question: 'What is middleware in Express?',
    answer: 'Middleware are functions that run between receiving a request and sending a response. They can inspect, transform, log, validate, or terminate requests before the route handler runs.',
    code: `app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});`,
    highlights: ['Runs in request lifecycle', 'Can log/validate/transform', 'Chained before handler'],
  },
  {
    id: 715, category: 'Node.js', difficulty: 'Mid',
    question: 'How do you handle errors in Express?',
    answer: 'Errors should be passed to the next middleware or handled in a centralized error handler. This keeps route code simple and makes failure responses consistent.',
    code: `app.get('/user', async (req, res, next) => {
  try {
    const data = await getUser();
    res.json(data);
  } catch (err) {
    next(err);
  }
});`,
    highlights: ['Use next(err)', 'Centralize error handling', 'Keeps routes clean'],
  },
  {
    id: 716, category: 'Node.js', difficulty: 'Senior',
    question: 'What is the difference between process.nextTick and setImmediate?',
    answer: 'process.nextTick queues work to run before the event loop continues to the next phase — it actually runs before Promise microtasks too, making it the highest-priority way to schedule a callback. setImmediate schedules work for the check phase, running after the current poll phase\'s I/O callbacks complete. nextTick is usually reserved for very high-priority callbacks, and overusing it can starve I/O since the queue is fully drained before the loop moves on.',
    code: `process.nextTick(() => console.log('nextTick'));
setImmediate(() => console.log('setImmediate'));`,
    highlights: ['nextTick = higher priority', 'setImmediate = next phase', 'Event loop scheduling'],
  },
  {
    id: 721, category: 'Python', difficulty: 'Junior',
    question: 'What is the difference between a list and a tuple in Python?',
    answer: 'Lists are mutable and commonly used when you need to change contents. Tuples are immutable and are a good fit for fixed records or values that should not change.',
    code: `numbers = [1, 2, 3]      # mutable
point = (10, 20)          # immutable`,
    highlights: ['List = mutable', 'Tuple = immutable', 'Good for fixed records'],
  },
  {
    id: 722, category: 'Python', difficulty: 'Mid',
    question: 'What is the purpose of virtual environments in Python?',
    answer: 'Virtual environments keep project dependencies isolated so packages installed for one project do not affect another. They make dependency management and deployment more reliable.',
    code: `python -m venv .venv
source .venv/bin/activate`,
    highlights: ['Isolated dependencies', 'Avoid version conflicts', 'Better project hygiene'],
  },
  {
    id: 723, category: 'Python', difficulty: 'Mid',
    question: 'What is the difference between __init__ and __new__ in Python?',
    answer: '__new__ creates the object instance, while __init__ initializes the instance after creation. In most cases you only need __init__, but __new__ is useful when you need full control over object creation.',
    code: `class Example:
    def __new__(cls, *args, **kwargs):
        print('creating instance')
        return super().__new__(cls)

    def __init__(self):
        print('initializing instance')`,
    highlights: ['__new__ creates object', '__init__ initializes', 'Less common but powerful'],
  },
  {
    id: 724, category: 'Database', difficulty: 'Junior',
    question: 'What is the difference between WHERE and HAVING in SQL?',
    answer: 'WHERE filters rows before grouping, while HAVING filters grouped results after aggregation. Use WHERE for individual rows and HAVING for aggregate conditions.',
    code: `SELECT department, COUNT(*)
FROM employees
WHERE salary > 50000
GROUP BY department
HAVING COUNT(*) > 3;`,
    highlights: ['WHERE = pre-group', 'HAVING = post-group', 'Use with aggregates'],
  },
  {
    id: 725, category: 'Database', difficulty: 'Junior',
    question: 'What is the difference between DELETE, TRUNCATE, and DROP?',
    answer: 'DELETE removes rows from a table and can be filtered. TRUNCATE removes all rows more quickly but is less flexible and usually cannot be rolled back in some systems. DROP removes the table structure itself.',
    code: `DELETE FROM users WHERE active = false;
TRUNCATE TABLE logs;
DROP TABLE old_table;`,
    highlights: ['DELETE = rows', 'TRUNCATE = all rows fast', 'DROP = remove table'],
  },
  {
    id: 726, category: 'Database', difficulty: 'Mid',
    question: 'What is the difference between a primary key and a foreign key?',
    answer: 'A primary key uniquely identifies a row in a table. A foreign key references the primary key of another table and creates a relationship between records.',
    code: `CREATE TABLE users (
  id INT PRIMARY KEY,
  name VARCHAR(100)
);

CREATE TABLE orders (
  id INT PRIMARY KEY,
  user_id INT REFERENCES users(id)
);`,
    highlights: ['Primary = unique identity', 'Foreign = relation to another table', 'Enforces integrity'],
  },
  {
    id: 727, category: 'HTML/CSS', difficulty: 'Junior',
    question: 'What is the difference between margin and padding?',
    answer: 'Padding is space inside an element between the content and its border. Margin is space outside the element, separating it from neighboring elements.',
    code: `.card { padding: 16px; margin: 12px; }`,
    highlights: ['Padding = inside', 'Margin = outside', 'Affects spacing around box'],
  },
  {
    id: 728, category: 'HTML/CSS', difficulty: 'Junior',
    question: 'What is responsive web design?',
    answer: 'Responsive web design makes layouts adapt to different screen sizes by using flexible grids, fluid content, and media queries. The goal is to provide a good experience on mobile, tablet, and desktop.',
    code: `@media (max-width: 768px) {
  .layout { grid-template-columns: 1fr; }
}`,
    highlights: ['Adapts to screen size', 'Uses media queries', 'Improves mobile UX'],
  },
  {
    id: 729, category: 'HTML/CSS', difficulty: 'Mid',
    question: 'What does z-index control in CSS?',
    answer: 'z-index controls the vertical stacking order of positioned elements. Higher values appear on top of lower values, provided the elements are in the same stacking context.',
    code: `.modal { position: fixed; z-index: 1000; }`,
    highlights: ['Stacking order', 'Works with positioned elements', 'Higher value on top'],
  },
  {
    id: 730, category: 'JWT', difficulty: 'Mid',
    question: 'What is CSRF and how do you prevent it?',
    answer: 'CSRF tricks a browser into making a state-changing request on behalf of a logged-in user. Prevention usually involves SameSite cookies, CSRF tokens, or custom headers on state-changing requests.',
    code: `res.cookie('session', token, { sameSite: 'strict', httpOnly: true });`,
    highlights: ['Cross-site request forgery', 'SameSite helps', 'CSRF tokens add protection'],
  },
  {
    id: 731, category: 'JWT', difficulty: 'Mid',
    question: 'What is XSS and how do you prevent it?',
    answer: 'XSS lets an attacker inject scripts into a page so they can steal data or impersonate users. Prevention steps include escaping user input, using CSP headers, and avoiding unsafe DOM insertion.',
    code: `const safe = escapeHtml(userInput);`,
    highlights: ['Script injection', 'Escape output', 'Content Security Policy'],
  },
  {
    id: 732, category: 'JWT', difficulty: 'Mid',
    question: 'What is the difference between session-based and token-based authentication?',
    answer: 'Session-based auth stores user state on the server and uses a session ID cookie. Token-based auth issues signed tokens that the client sends on each request, making it easier to scale to APIs and mobile apps.',
    code: `// Session cookie
res.cookie('sessionId', sessionId);

// JWT token
Authorization: Bearer <token>`,
    highlights: ['Session = server-side state', 'Token = stateless-ish', 'Good for APIs'],
  },
  {
    id: 733, category: 'System Design', difficulty: 'Mid',
    question: 'How does caching improve application performance?',
    answer: 'Caching stores frequently requested data closer to the user or the application so repeated reads avoid expensive database or network calls. It reduces latency and lowers backend load, but cache invalidation must be carefully handled.',
    code: `const user = cache.get('user:42') || db.getUser(42);`,
    highlights: ['Reduces latency', 'Lowers backend load', 'Needs invalidation strategy'],
  },
  {
    id: 734, category: 'System Design', difficulty: 'Senior',
    question: 'What are the trade-offs between monoliths and microservices?',
    answer: 'Monoliths are simpler to build and deploy but can become difficult to scale and maintain as they grow. Microservices improve isolation and independent scaling, but they add operational complexity, network latency, and distributed debugging challenges.',
    code: `// Monolith: one deployable unit
// Microservices: many independently deployable services`,
    highlights: ['Monolith = simpler', 'Microservices = scalable', 'More operational complexity'],
  },
  {
    id: 736, category: 'Python', difficulty: 'Junior',
    question: 'How does Python manage memory and garbage collection?',
    answer: 'CPython primarily uses reference counting — every object tracks how many references point to it, and is freed once the count hits zero. A supplementary cyclic garbage collector periodically detects and cleans up reference cycles (e.g. two objects referencing each other) that reference counting alone cannot free.',
    code: `import sys\na = []\nprint(sys.getrefcount(a))  # reference count\ndel a  # decrements count; object freed at 0`,
    highlights: ['Reference counting is primary', 'Cyclic GC handles reference cycles', 'del just removes a reference'],
  },
  {
    id: 738, category: 'Python', difficulty: 'Mid',
    question: 'What is the difference between a generator and a normal function that returns a list?',
    answer: 'A normal function computes and returns the entire list at once, holding every item in memory. A generator function uses yield to produce items lazily, one at a time, pausing its execution state between values — which is far more memory-efficient for large or infinite sequences.',
    code: `def all_squares(n):\n    return [i * i for i in range(n)]      # eager, all in memory\n\ndef gen_squares(n):\n    for i in range(n):\n        yield i * i                        # lazy, one at a time`,
    highlights: ['Generators are lazy', 'Lower memory footprint', 'yield pauses/resumes state'],
  },
  {
    id: 742, category: 'Python', difficulty: 'Senior',
    question: 'When would you choose asyncio over threading or multiprocessing?',
    answer: 'Choose asyncio for many concurrent I/O-bound tasks (network calls, API requests) where you want low overhead and cooperative single-threaded concurrency. Choose threading when using blocking I/O libraries that are not async-aware. Choose multiprocessing when the work is CPU-bound and needs true parallelism across cores, bypassing the GIL entirely.',
    code: `import asyncio\n\nasync def fetch_all(urls):\n    async def fetch(u):\n        await asyncio.sleep(0.1)  # simulate I/O\n        return u\n    return await asyncio.gather(*(fetch(u) for u in urls))`,
    highlights: ['asyncio: many concurrent I/O tasks', 'threading: blocking, non-async I/O libs', 'multiprocessing: CPU-bound parallelism'],
  },  // ─── REACT (additions from resume roadmap, deduped against existing) ──
  {
    id: 800, category: 'React', difficulty: 'Senior',
    question: 'What is Fiber and what problem did it solve over the old stack reconciler?',
    answer: 'Fiber is React\'s reconciliation engine, rewritten to support incremental, interruptible rendering. The old "stack reconciler" rendered the whole tree synchronously and could not pause — long updates blocked the main thread and caused jank. Fiber breaks rendering into units of work that can be paused, resumed, or abandoned, enabling concurrent rendering and Suspense.',
    code: `// Fiber lets React pause a big render if something more urgent comes in
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}`,
    highlights: ['Incremental, interruptible rendering', 'Replaces synchronous stack reconciler', 'Enables Suspense & concurrent features'],
  },
  {
    id: 801, category: 'React', difficulty: 'Mid',
    question: 'Explain automatic batching in React 18. How does it differ from React 17?',
    answer: 'In React 17, only updates inside React event handlers were batched into a single re-render. In React 18, updates inside promises, setTimeout, and native event handlers are also batched automatically — reducing unnecessary re-renders across the board.',
    code: `// React 17: causes 2 re-renders. React 18: causes 1 re-render (batched).
function handleClick() {
  setTimeout(() => {
    setCount(c => c + 1);
    setFlag(f => !f);
  }, 0);
}`,
    highlights: ['17: only event handlers batched', '18: promises/setTimeout/native events too', 'Fewer redundant re-renders'],
  },
  {
    id: 802, category: 'React', difficulty: 'Mid',
    question: 'What is useTransition used for? Give a real scenario.',
    answer: 'useTransition marks a state update as non-urgent so the UI stays responsive while it resolves. A classic case is typing into a search box while filtering a large list — the input update stays urgent (instant feedback) while the expensive filtered-list update is deferred and can be interrupted by further typing.',
    code: `function SearchableList({ items }) {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const [filtered, setFiltered] = useState(items);

  function handleChange(e) {
    setQuery(e.target.value); // urgent: keep input responsive
    startTransition(() => {
      setFiltered(items.filter(i => i.includes(e.target.value))); // non-urgent
    });
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <span>Updating…</span>}
      <ul>{filtered.map(i => <li key={i}>{i}</li>)}</ul>
    </>
  );
}`,
    highlights: ['Marks updates as non-urgent', 'Keeps input typing responsive', 'Deferred update can be interrupted'],
  },
  {
    id: 803, category: 'React', difficulty: 'Mid',
    question: 'Why can\'t you call hooks conditionally?',
    answer: 'React tracks hooks by call order in a linked list per component instance, not by name. If a hook is skipped conditionally, the order shifts on the next render and React attaches the wrong state or effect to the wrong hook slot — silently corrupting state instead of throwing an obvious error.',
    code: `// ❌ Breaks hook order between renders
if (condition) {
  useEffect(() => { /* ... */ }, []);
}

// ✅ Keep the hook call unconditional, branch inside it
useEffect(() => {
  if (condition) { /* ... */ }
}, [condition]);`,
    highlights: ['Hooks tracked by call order, not name', 'Conditional hooks shift the order', 'Corrupts state silently, not a thrown error'],
  },
  {
    id: 804, category: 'React', difficulty: 'Senior',
    question: 'When does useMemo actually hurt performance instead of helping?',
    answer: 'When the computation being memoized is cheap, the overhead of storing dependencies and diffing them on every render can cost more than just recalculating the value. It also hurts when the dependencies change on nearly every render, since you pay for both the comparison and the recomputation with none of the caching benefit.',
    code: `// Memoizing a trivial calculation adds overhead for no benefit
const total = useMemo(() => a + b, [a, b]); // just do: const total = a + b;`,
    highlights: ['Cheap computations don\'t need memoization', 'Overhead: storing + comparing deps', 'Useless if deps change almost every render'],
  },
  {
    id: 805, category: 'React', difficulty: 'Senior',
    question: 'How do you fix Context re-render storms caused by a single large Provider value?',
    answer: 'Split one large context into multiple smaller contexts by concern (e.g. user, theme, cart) so a consumer only re-renders when the specific slice it reads changes. Additionally, memoize the value object passed to the Provider with useMemo — otherwise a new object is created every render, forcing every consumer to re-render regardless of whether the actual data changed.',
    code: `// Bad: every consumer re-renders whenever ANY value changes
const AppContext = createContext();
<AppContext.Provider value={{ user, theme, cart }}>

// Better: split contexts by concern + memoize the value
const value = useMemo(() => ({ user, theme }), [user, theme]);
<UserContext.Provider value={value}>`,
    highlights: ['Split contexts by concern', 'Memoize the Provider value object', 'Prevents unrelated consumers re-rendering'],
  },
  {
    id: 806, category: 'React', difficulty: 'Mid',
    question: 'What happens if you use array index as a key in a reorderable list?',
    answer: 'If items are reordered, inserted, or deleted, index-based keys cause React to match the wrong DOM node to the wrong item on the next render — leading to stale state (e.g. an input keeping the wrong value) or broken animations, since React thinks the item at that index is "the same" even though its data changed.',
    code: `// ❌ Breaks when items are reordered/removed
{items.map((item, i) => <Row key={i} data={item} />)}

// ✅ Use a stable, unique identifier
{items.map(item => <Row key={item.id} data={item} />)}`,
    highlights: ['Index keys break on reorder/insert/delete', 'Causes stale state or broken animations', 'Always use a stable unique id'],
  },
  {
    id: 807, category: 'React', difficulty: 'Mid',
    question: 'Why can\'t error boundaries catch errors thrown inside event handlers?',
    answer: 'Error boundaries only catch errors during rendering, in lifecycle methods, and in constructors of the tree below them — not inside event handlers, asynchronous code, or server-side rendering, because those execute outside of React\'s render call stack. Use a regular try/catch inside the event handler instead.',
    code: `function Button() {
  const handleClick = () => {
    try {
      riskyOperation();
    } catch (err) {
      console.error(err); // error boundaries won't catch this
    }
  };
  return <button onClick={handleClick}>Click</button>;
}`,
    highlights: ['Boundaries catch render/lifecycle errors only', 'Event handler errors happen outside render', 'Use try/catch inside the handler'],
  },
  {
    id: 808, category: 'React', difficulty: 'Senior',
    question: 'How do you bridge React state with Web Components using Shadow DOM?',
    answer: 'Wrap a React root inside a Custom Element, mounting it into the element\'s shadow root inside connectedCallback so React renders into an encapsulated DOM tree, and unmount it in disconnectedCallback to avoid memory leaks. Shadow DOM gives style encapsulation — the component\'s CSS never leaks into (or gets polluted by) the host application, which matters when embedding the component in other teams\' apps.',
    code: `class DocumentViewerElement extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.root = ReactDOM.createRoot(this.shadowRoot);
    this.root.render(<DocumentViewer docId={this.getAttribute('doc-id')} />);
  }
  disconnectedCallback() {
    this.root.unmount(); // critical: prevents memory leaks
  }
}
customElements.define('doc-viewer', DocumentViewerElement);`,
    highlights: ['Mount React into a Shadow root', 'connectedCallback / disconnectedCallback pairing', 'Shadow DOM = CSS encapsulation'],
  },
  {
    id: 809, category: 'React', difficulty: 'Senior',
    question: 'How would you virtualize a list of 10,000 rows in React?',
    answer: 'Only render the DOM nodes visible in the viewport (plus a small buffer), and fake the full scroll height with a spacer so the scrollbar behaves correctly. Libraries like react-window or react-virtual implement this "windowing" technique so the DOM node count stays constant regardless of list size, keeping render and layout cost flat.',
    code: `import { FixedSizeList } from 'react-window';

<FixedSizeList height={600} itemCount={10000} itemSize={40} width="100%">
  {({ index, style }) => <div style={style}>Row {index}</div>}
</FixedSizeList>`,
    highlights: ['Only render visible rows + buffer', 'Spacer div fakes full scroll height', 'Constant DOM node count regardless of list size'],
  },

  // ─── TYPESCRIPT (new category) ──────────────────────────────────────
  {
    id: 810, category: 'TypeScript', difficulty: 'Junior',
    question: 'What is the difference between interface and type, and when must you use one over the other?',
    answer: 'Interfaces support declaration merging (re-opening the same interface to add more members) and are the conventional choice for public object/class shapes. type is more flexible — it can express unions, tuples, and mapped types — but once declared it cannot be re-opened. Rule of thumb: use interface for object and class shapes, type for unions and utility compositions.',
    code: `interface User { name: string; }
interface User { age: number; } // merges — User now has name AND age

type Status = 'loading' | 'success' | 'error'; // unions need type, not interface`,
    highlights: ['interface supports declaration merging', 'type handles unions/tuples/mapped types', 'interface for shapes, type for unions'],
  },
  {
    id: 811, category: 'TypeScript', difficulty: 'Mid',
    question: 'Explain Partial<T>, Pick<T, K>, Omit<T, K>, and Record<K, V> with practical use cases.',
    answer: 'Pick selects a subset of a type\'s properties — useful for preview/summary shapes. Omit removes specific properties — useful for "everything except the id" update payloads. Partial makes every property optional — useful for patch-style updates. Record builds an object type mapping a set of keys to a value type — useful for lookup tables keyed by id.',
    code: `interface Document {
  id: string;
  title: string;
  status: 'draft' | 'published';
  content: string;
}

type DocumentPreview = Pick<Document, 'id' | 'title' | 'status'>;
type DocumentUpdate = Partial<Omit<Document, 'id'>>;
type DocumentsById = Record<string, Document>;`,
    highlights: ['Pick: subset of properties', 'Omit: everything except some properties', 'Partial: all optional; Record: keyed lookup table'],
  },
  {
    id: 812, category: 'TypeScript', difficulty: 'Mid',
    question: 'What are discriminated unions and how do you model API request state with them?',
    answer: 'A discriminated union is a union of object types that share a common literal "tag" property (like status), which TypeScript uses to narrow the type inside a switch or if-check. Modeling API state this way ({status: "loading"} | {status: "success", data} | {status: "error", error}) guarantees you only access data when it actually exists, catching a whole class of bugs at compile time.',
    code: `type RequestState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

function render(state: RequestState<Document[]>) {
  switch (state.status) {
    case 'loading': return <Spinner />;
    case 'success': return <DocList docs={state.data} />; // data is narrowed & known
    case 'error': return <ErrorBanner message={state.error} />;
  }
}`,
    highlights: ['Shared literal "tag" property', 'Enables type narrowing in switch/if', 'Prevents accessing data before it exists'],
  },
  {
    id: 813, category: 'TypeScript', difficulty: 'Senior',
    question: 'How do you type an RTK Query endpoint end-to-end, including response and argument types?',
    answer: 'createApi and builder.query/mutation accept generic type parameters for the response type and the argument type: builder.query<ResponseType, ArgsType>. This gives you full type safety on the query function\'s arguments, the returned data shape, and any tags used for cache invalidation, so mistakes surface at compile time rather than at runtime.',
    code: `interface Document { id: string; title: string; }
interface GetDocsArgs { folderId: string; page: number; }

export const docsApi = createApi({
  reducerPath: 'docsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Document'],
  endpoints: (builder) => ({
    getDocuments: builder.query<Document[], GetDocsArgs>({
      query: ({ folderId, page }) => \`/folders/\${folderId}/documents?page=\${page}\`,
      providesTags: (result) =>
        result ? result.map(d => ({ type: 'Document' as const, id: d.id })) : [],
    }),
  }),
});`,
    highlights: ['builder.query<ResponseType, ArgsType>', 'Full compile-time safety on args & response', 'Tags typed too, for safe cache invalidation'],
  },
  {
    id: 814, category: 'TypeScript', difficulty: 'Senior',
    question: 'What does the satisfies operator do and how does it improve on a plain type annotation?',
    answer: 'satisfies checks that a value matches a type without widening the value\'s inferred type the way an explicit annotation would. This means you get type-checking against the target type and keep the most specific (literal) inferred type for later use — the best of both validation and precise inference.',
    code: `const config = {
  timeout: 3000,
  retries: 3,
} satisfies { timeout: number; retries: number };
// config.timeout is inferred as \`number\` (literal preserved) AND type-checked`,
    highlights: ['Validates shape without widening the type', 'Keeps literal/precise inference', 'Better than a plain : Type annotation'],
  },

  // ─── REDUX TOOLKIT (new category, distinct from classic Redux basics) ─
  {
    id: 820, category: 'Redux Toolkit', difficulty: 'Mid',
    question: 'What does createSlice generate, and how does Immer let you "mutate" state safely?',
    answer: 'createSlice generates action creators and a reducer function automatically from a map of reducer functions, removing the boilerplate of writing switch statements and action type constants by hand. Under the hood, RTK wraps each reducer with Immer, which lets you write code that looks like direct mutation (state.selectedId = id) while Immer actually produces a new, immutable state object behind the scenes via a structural-sharing proxy.',
    code: `const documentsSlice = createSlice({
  name: 'documents',
  initialState: { items: [] as Document[], selectedId: null as string | null },
  reducers: {
    selectDocument(state, action: PayloadAction<string>) {
      state.selectedId = action.payload; // looks like mutation, Immer produces a new immutable state
    },
    documentDeleted(state, action: PayloadAction<string>) {
      state.items = state.items.filter(d => d.id !== action.payload);
    },
  },
});`,
    highlights: ['Auto-generates actions + reducer', 'Immer lets you write "mutating" code safely', 'Produces a real new immutable state under the hood'],
  },
  {
    id: 821, category: 'Redux Toolkit', difficulty: 'Mid',
    question: 'What is createAsyncThunk, and what are its three lifecycle action types?',
    answer: 'createAsyncThunk wraps an async function and automatically dispatches pending, fulfilled, and rejected actions as it runs — pending when the request starts, fulfilled with the resolved value on success, and rejected with the error on failure. You handle each in extraReducers to drive loading/success/error UI state without writing that dispatch logic by hand.',
    code: `export const fetchDocument = createAsyncThunk(
  'documents/fetchOne',
  async (id: string) => {
    const res = await fetch(\`/api/documents/\${id}\`);
    if (!res.ok) throw new Error('Failed to load document');
    return res.json();
  }
);

// in extraReducers:
builder
  .addCase(fetchDocument.pending, (state) => { state.status = 'loading'; })
  .addCase(fetchDocument.fulfilled, (state, action) => { state.status = 'success'; state.doc = action.payload; })
  .addCase(fetchDocument.rejected, (state, action) => { state.status = 'error'; state.error = action.error.message; });`,
    highlights: ['pending / fulfilled / rejected lifecycle', 'Auto-dispatched around the async function', 'Handled in extraReducers'],
  },
  {
    id: 822, category: 'Redux Toolkit', difficulty: 'Senior',
    question: 'How would you implement an optimistic update with RTK Query?',
    answer: 'Use the mutation\'s onQueryStarted lifecycle to immediately patch the cached query data before the network request resolves (via updateQueryData), giving the user instant feedback. If the request ultimately fails, undo the patch by calling patch.undo() inside a catch block, rolling the UI back to its previous state.',
    code: `updateDocumentTitle: builder.mutation<Document, { id: string; title: string }>({
  query: ({ id, title }) => ({ url: \`/documents/\${id}\`, method: 'PATCH', body: { title } }),
  invalidatesTags: (result, error, { id }) => [{ type: 'Document', id }],
  async onQueryStarted({ id, title }, { dispatch, queryFulfilled }) {
    const patch = dispatch(
      docsApi.util.updateQueryData('getDocument', id, (draft) => {
        draft.title = title; // optimistic: update UI immediately
      })
    );
    try { await queryFulfilled; }
    catch { patch.undo(); } // roll back on failure
  },
}),`,
    highlights: ['onQueryStarted patches cache immediately', 'updateQueryData for the optimistic patch', 'patch.undo() rolls back on failure'],
  },
  {
    id: 823, category: 'Redux Toolkit', difficulty: 'Mid',
    question: 'Redux Toolkit vs Zustand — how do you decide which to use?',
    answer: 'Redux Toolkit gives time-travel devtools, middleware, and a strict unidirectional data flow — valuable for large teams and complex, cross-cutting state that needs traceability, such as a regulated or compliance-heavy domain. Zustand has far less boilerplate and needs no providers, making it a better fit for smaller apps, solo/small-team projects, or local-ish global state where deep devtools tooling matters less.',
    code: `// Zustand: no boilerplate, no Provider
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// Usage anywhere, no <Provider> wrapping needed
const count = useStore((state) => state.count);`,
    highlights: ['RTK: devtools, middleware, strict data flow', 'Zustand: minimal boilerplate, no Provider', 'Choose based on team size & traceability needs'],
  },

  // ─── NODE.JS (addition, deduped against existing 4 entries) ────────────
  {
    id: 830, category: 'Node.js', difficulty: 'Mid',
    question: 'Walk through the phases of the Node.js event loop.',
    answer: 'Each loop iteration passes through: timers (due setTimeout/setInterval callbacks), pending callbacks (deferred I/O callbacks), idle/prepare (internal, used by Node itself), poll (retrieves new I/O events, executes their callbacks), check (setImmediate callbacks), and close callbacks (e.g. socket.on("close")). Microtasks — Promise callbacks and process.nextTick — are drained between every one of these phases, not just at the very end of the loop.',
    code: `console.log('start');
setTimeout(() => console.log('timer'), 0);
setImmediate(() => console.log('immediate'));
process.nextTick(() => console.log('nextTick'));
Promise.resolve().then(() => console.log('promise'));
console.log('end');
// start, end, nextTick, promise, timer, immediate (order can vary for timer/immediate)`,
    highlights: ['timers → pending → poll → check → close', 'Microtasks drain between every phase', 'nextTick has highest priority'],
  },

  // ─── API DESIGN (new category — REST & GraphQL) ────────────────────────
  {
    id: 840, category: 'API Design', difficulty: 'Mid',
    question: 'Why is cursor-based pagination preferred over offset-based pagination for large, frequently-changing datasets?',
    answer: 'Offset pagination (LIMIT 20 OFFSET 40) recalculates its position from scratch on every request, so if rows are inserted or deleted between page requests, results can skip or duplicate rows. Cursor-based pagination anchors each page to a stable pointer — typically the last row\'s id or timestamp — so pages stay consistent even under concurrent writes, which matters for something like a document list that changes in real time.',
    code: `// Offset — breaks under concurrent writes
SELECT * FROM documents ORDER BY created_at LIMIT 20 OFFSET 40;

// Cursor — stable even if rows are added/removed
SELECT * FROM documents
WHERE created_at < $lastSeenCreatedAt
ORDER BY created_at DESC LIMIT 20;`,
    highlights: ['Offset recalculates position each request', 'Cursor anchors to a stable pointer', 'Cursor avoids skipped/duplicated rows'],
  },

  // ─── NEXT.JS (new category) ────────────────────────────────────────────
  {
    id: 850, category: 'Next.js', difficulty: 'Mid',
    question: 'Explain SSR, SSG, and ISR — give a scenario where you would use each.',
    answer: 'SSG (Static Site Generation) builds pages once at build time — best for content that rarely changes, like a marketing page. SSR (Server-Side Rendering) renders on every request — best for personalized or frequently-changing data, like a logged-in dashboard. ISR (Incremental Static Regeneration) is SSG with a revalidation window, regenerating a page in the background after a set time — best for content like a product catalog that changes occasionally but doesn\'t need to be real-time.',
    code: `// ISR: rebuild this page in the background at most once per 60s
export const revalidate = 60;

export default async function ProductPage({ params }) {
  const product = await getProduct(params.id);
  return <ProductDetails product={product} />;
}`,
    highlights: ['SSG: build once, for rarely-changing content', 'SSR: render per-request, for personalized data', 'ISR: SSG + timed background revalidation'],
  },

  // ─── TESTING (new category) ────────────────────────────────────────────
  {
    id: 860, category: 'Testing', difficulty: 'Junior',
    question: 'What is the core philosophy behind React Testing Library — "test behavior, not implementation"?',
    answer: 'RTL encourages writing tests the way a user would interact with the app — finding elements by their visible role or text and interacting via clicks/typing — rather than reaching into a component\'s internal state or instance methods. This makes tests resilient to refactors: as long as the user-facing behavior stays the same, the test keeps passing even if the implementation underneath changes completely.',
    code: `// Bad: tests implementation detail (internal state name)
expect(wrapper.state('isOpen')).toBe(true);

// Good: tests what the user actually sees/does
render(<Dropdown />);
await userEvent.click(screen.getByRole('button', { name: /open menu/i }));
expect(screen.getByRole('menu')).toBeVisible();`,
    highlights: ['Query by role/text, not internal state', 'Resilient to implementation refactors', 'Tests what the user actually experiences'],
  },
  {
    id: 861, category: 'Testing', difficulty: 'Mid',
    question: 'How do you test a component that fetches data through an RTK Query hook?',
    answer: 'Render the component wrapped in a real (or test) Redux store and Provider, using a helper like renderWithProviders, so the RTK Query hook has a real cache to work against. Assert the initial loading state first, then use an async query like findByText to wait for the fetch to resolve and the final UI to appear.',
    code: `import { renderWithProviders } from '../test-utils'; // wraps in real Redux store + Provider

test('shows documents after fetch', async () => {
  renderWithProviders(<DocumentList folderId="123" />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  expect(await screen.findByText('Q3 Report.pdf')).toBeInTheDocument();
});`,
    highlights: ['Wrap component in a real store + Provider', 'Assert loading state first', 'findByText awaits the resolved fetch'],
  },
  {
    id: 862, category: 'Testing', difficulty: 'Mid',
    question: 'What is the Page Object Model in Playwright/Selenium, and why does it reduce test maintenance cost?',
    answer: 'The Page Object Model wraps a page\'s selectors and interactions behind a class with descriptive methods (e.g. clickDelete(), open()), so tests read like plain user steps instead of raw selector calls. When the UI changes, you only update the selector in one place (the page object) instead of hunting through every test file that touches that element.',
    code: `// pages/DocumentViewerPage.ts
export class DocumentViewerPage {
  constructor(private page: Page) {}
  async open(docId: string) { await this.page.goto(\`/documents/\${docId}\`); }
  async clickDelete() { await this.page.getByRole('button', { name: 'Delete' }).click(); }
  get confirmDialog() { return this.page.getByRole('dialog'); }
}

// test file
test('deleting a document shows confirmation', async ({ page }) => {
  const viewer = new DocumentViewerPage(page);
  await viewer.open('doc-123');
  await viewer.clickDelete();
  await expect(viewer.confirmDialog).toBeVisible();
});`,
    highlights: ['Selectors live behind descriptive methods', 'Tests read like plain user steps', 'One place to update when UI changes'],
  },
  {
    id: 863, category: 'Testing', difficulty: 'Mid',
    question: 'How do you handle a stale element reference exception in Selenium, and what causes it?',
    answer: 'A stale element reference happens when the DOM node behind a previously-located WebElement has been removed or replaced (e.g. after a re-render or page navigation), so the driver\'s cached reference no longer points to a live element. The fix is to re-locate the element right before interacting with it rather than reusing an old reference, and to use explicit waits (ExpectedConditions) so the test waits for the new element to be ready instead of racing the re-render.',
    code: `public class DocumentPage {
  private WebDriver driver;
  private By deleteButton = By.id("delete-btn");

  public DocumentPage(WebDriver driver) { this.driver = driver; }

  public void clickDelete() {
    WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    // Re-locates the element fresh each call — avoids stale references
    wait.until(ExpectedConditions.elementToBeClickable(deleteButton)).click();
  }
}`,
    highlights: ['Caused by a re-render replacing the DOM node', 'Re-locate the element instead of reusing a reference', 'Explicit waits avoid racing the re-render'],
  },

  // ─── ACCESSIBILITY (new category) ──────────────────────────────────────
  {
    id: 870, category: 'Accessibility', difficulty: 'Mid',
    question: 'What are ARIA roles, and when do you need them versus relying on semantic HTML alone?',
    answer: 'ARIA roles and attributes (role, aria-expanded, aria-selected, etc.) tell assistive technologies what a custom widget is and what state it\'s in, when the native HTML element doesn\'t already convey that. Prefer semantic HTML first (a real <button>, <nav>, <ul>) since it gets correct behavior and accessibility for free; reach for ARIA only when you must build a custom widget — like a listbox-style dropdown — that has no native HTML equivalent.',
    code: `<button aria-haspopup="listbox" aria-expanded={isOpen} onClick={toggle}>
  {selected ?? 'Choose a document'}
</button>
{isOpen && (
  <ul role="listbox" aria-label="Documents">
    {docs.map(d => (
      <li key={d.id} role="option" aria-selected={d.id === selected} tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && select(d.id)}>
        {d.title}
      </li>
    ))}
  </ul>
)}`,
    highlights: ['ARIA conveys role/state for custom widgets', 'Prefer real semantic elements first', 'Use ARIA only when no native equivalent exists'],
  },

  // ─── CI/CD (new category) ───────────────────────────────────────────────
  {
    id: 880, category: 'CI/CD', difficulty: 'Mid',
    question: 'Walk through the structure of a .gitlab-ci.yml pipeline that runs tests and gates a merge.',
    answer: 'A pipeline is organized into stages (e.g. install, test, build, deploy) that run in order, with jobs inside each stage that can run in parallel. cache persists files (like node_modules) between pipeline runs to speed things up, while artifacts pass files (like coverage reports or a JUnit report) between stages and out to the UI. Making the test stage a required job before deploy effectively gates the merge on tests passing.',
    code: `stages: [install, test, build, deploy]

install:
  stage: install
  script: [npm ci]
  cache:
    key: \${CI_COMMIT_REF_SLUG}
    paths: [node_modules/]

test:
  stage: test
  script:
    - npm run test:unit -- --coverage
    - npx playwright test
  artifacts:
    when: always
    reports:
      junit: playwright-report/results.xml
    paths: [coverage/]

deploy_canary:
  stage: deploy
  script: [./scripts/deploy-canary.sh 10]  # 10% traffic
  environment: production
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'`,
    highlights: ['Stages run in order, jobs within a stage in parallel', 'cache speeds up repeat installs', 'artifacts pass reports/files between stages'],
  },
  {
    id: 881, category: 'CI/CD', difficulty: 'Senior',
    question: 'How do you decide the rollback criteria for a canary deployment?',
    answer: 'Route a small percentage of traffic (typically 5-10%) to the new version and watch error rate, latency (p95/p99), and key business metrics for a fixed observation window (e.g. 15-30 minutes). Trigger an automatic rollback if error rate exceeds a defined threshold relative to baseline (e.g. 2x) or if a specific alert fires — the rollback trigger should be automated, not dependent on someone manually watching a dashboard.',
    code: `# Conceptual rollback rule
if error_rate_canary > (2 * error_rate_baseline) or p99_latency_canary > slo_threshold:
    trigger_automatic_rollback()`,
    highlights: ['Route a small % of traffic first', 'Compare error rate & p95/p99 latency to baseline', 'Rollback trigger must be automated, not manual'],
  },
  {
    id: 882, category: 'CI/CD', difficulty: 'Mid',
    question: 'What is a multi-stage Docker build and why does it reduce the final image size?',
    answer: 'A multi-stage build uses multiple FROM statements in one Dockerfile — an early stage installs dependencies and compiles/builds the app, and a later, leaner stage copies only the built output (and required runtime files) from the earlier stage. This means build tools, dev dependencies, and source files never end up in the final image, keeping it small and reducing the attack surface.',
    code: `FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-slim
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
CMD ["node", "dist/server.js"]`,
    highlights: ['Multiple FROM stages in one Dockerfile', 'Only built output copied to final stage', 'Keeps dev deps/build tools out of final image'],
  },

  // ─── AI TOOLING (new category) ──────────────────────────────────────────
  {
    id: 890, category: 'AI Tooling', difficulty: 'Senior',
    question: 'What does an MCP tool definition consist of, and why does the description matter as much as the code?',
    answer: 'A tool definition has a name, a description, and an input schema (typically JSON Schema) describing its parameters. The description is what the model reads to decide when and how to call the tool — a vague or generic description leads to the model calling it at the wrong time or with the wrong arguments, so precise, example-driven descriptions meaningfully reduce misuse, independent of how correct the underlying implementation is.',
    code: `// Minimal MCP tool definition (conceptual)
server.tool(
  'scaffold_component',
  'Generates a new React component with filter, search, and unit test boilerplate',
  {
    type: 'object',
    properties: {
      componentName: { type: 'string' },
      features: { type: 'array', items: { enum: ['filter', 'search', 'kebabMenu'] } },
    },
    required: ['componentName'],
  },
  async ({ componentName, features }) => {
    const files = generateScaffold(componentName, features);
    return { content: [{ type: 'text', text: \`Created \${files.length} files for \${componentName}\` }] };
  }
);`,
    highlights: ['name + description + input schema', 'Description drives when/how the model calls it', 'Vague descriptions cause misuse regardless of code quality'],
  },
  {
    id: 891, category: 'AI Tooling', difficulty: 'Mid',
    question: 'Explain a RAG (Retrieval-Augmented Generation) pipeline end-to-end.',
    answer: 'A document is split into chunks, and each chunk is embedded into a vector and stored in a vector database. When a user asks a question, the query is embedded the same way, and a nearest-neighbor search retrieves the top-k most relevant chunks. Those chunks are optionally re-ranked for relevance, then passed as context into the LLM prompt so the model generates an answer grounded in the retrieved material instead of relying purely on its training data.',
    code: `// Conceptual flow, not a specific library's API
const chunks = chunkDocument(document);
const vectors = chunks.map(embed);
vectorStore.upsert(vectors);

const queryVector = embed(userQuestion);
const topChunks = vectorStore.similaritySearch(queryVector, { k: 5 });
const answer = await llm.generate({ context: topChunks, question: userQuestion });`,
    highlights: ['Chunk → embed → store in a vector DB', 'Query embedded the same way, nearest-neighbor search', 'Retrieved chunks ground the LLM\'s generation'],
  },

  // ─── Rescued from false-positive dedup matches (genuinely new topics) ───
  {
    id: 1500, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is the difference between Java and JavaScript?',
    answer: 'Despite the similar name (a 1995 marketing decision, not a technical relationship), they are unrelated languages. Java is statically-typed, compiled to bytecode, and runs on the JVM using class-based OOP. JavaScript is dynamically-typed, interpreted/JIT-compiled, prototype-based, and runs natively in browsers and (via Node.js) on servers.',
    code: `// Java: statically typed, compiled, class-based
// int x = 5;  // type declared, checked at compile time

// JavaScript: dynamically typed, interpreted, prototype-based
let x = 5;       // type inferred, checked at runtime
x = "now a string"; // perfectly legal — no compiler to stop you`,
    highlights: ['Name similarity is historical marketing, not technical', 'Java: static types, JVM bytecode, classes', 'JS: dynamic types, interpreted/JIT, prototypes'],
  },
  {
    id: 1501, category: 'JavaScript', difficulty: 'Mid',
    question: 'What is deep copy vs shallow copy in JavaScript?',
    answer: 'A shallow copy (via the spread operator or Object.assign) copies only the top-level properties — any nested object or array is still shared by reference between the original and the copy, so mutating a nested value affects both. A deep copy recursively clones every nested level so no references are shared at all, using structuredClone, JSON.parse(JSON.stringify(x)) (loses functions/undefined/dates), or a custom recursive function.',
    code: `const original = { user: { name: 'Ada' } };

// Shallow copy — nested object is still shared
const shallow = { ...original };
shallow.user.name = 'Grace';
console.log(original.user.name); // 'Grace' — the original changed too!

// Deep copy — fully independent
const deep = structuredClone(original);
deep.user.name = 'Linus';
console.log(original.user.name); // still 'Grace' — untouched`,
    highlights: ['Shallow: nested refs still shared', 'Deep: every level fully cloned', 'structuredClone() is the modern deep-clone tool'],
  },
  {
    id: 1502, category: 'React', difficulty: 'Mid',
    question: 'What is React Portal? When would you use it?',
    answer: 'ReactDOM.createPortal(children, domNode) renders children into a DOM node outside the parent component\'s normal DOM hierarchy, while keeping it in the same place in the React tree — so context and event bubbling still work as if it were nested normally. It\'s used for modals, tooltips, and dropdowns that need to visually escape a parent\'s overflow:hidden or z-index stacking context.',
    code: `function Modal({ children, onClose }) {
  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.getElementById('modal-root') // rendered here in the DOM…
  );                                      // …but still nested in the React tree above
}`,
    highlights: ['Renders into a different DOM node', 'Stays in the same place in the React tree', 'Used for modals/tooltips escaping overflow/z-index'],
  },
  {
    id: 1503, category: 'React', difficulty: 'Junior',
    question: 'What is defaultProps in React? How and when do you use it?',
    answer: 'defaultProps specifies fallback values for props that weren\'t explicitly passed by the parent. In modern functional components, this is more commonly handled with default parameter values in the function signature instead, since defaultProps on function components is deprecated as of React 18.3 and will be removed in a future major version.',
    code: `// Older pattern (deprecated for function components)
function Greeting({ name }) { return <p>Hello, {name}</p>; }
Greeting.defaultProps = { name: 'Guest' };

// Modern pattern — default parameter value
function Greeting({ name = 'Guest' }) {
  return <p>Hello, {name}</p>;
}`,
    highlights: ['Provides fallback values for missing props', 'Deprecated on function components', 'Use a default parameter value instead'],
  },
  {
    id: 1504, category: 'React', difficulty: 'Senior',
    question: 'What are React Server Actions (React 19)?',
    answer: 'Server Actions are async functions marked with the \'use server\' directive that can be called directly from a Client Component — for example, as a form\'s action — and execute entirely on the server. This eliminates the need to hand-write an API route just to handle a simple mutation like a form submission, since the framework handles the network round-trip for you.',
    code: `// actions.js
'use server';
export async function createComment(formData) {
  const text = formData.get('text');
  await db.comments.insert({ text });
}

// CommentForm.jsx (Client Component)
import { createComment } from './actions.js';

export default function CommentForm() {
  return (
    <form action={createComment}>
      <input name="text" />
      <button type="submit">Post</button>
    </form>
  );
}`,
    highlights: ['Async function marked \'use server\'', 'Called directly from a Client Component', 'No hand-written API route needed for the mutation'],
  },
  {
    id: 1505, category: 'React', difficulty: 'Mid',
    question: 'What is hydration in SSR (Server-Side Rendering)?',
    answer: 'Hydration is the process where React attaches event listeners and internal state to the static HTML markup that was already rendered by the server, "reviving" it into a fully interactive app — without re-rendering or replacing the markup from scratch. If the client-rendered output doesn\'t match the server-rendered HTML exactly, React logs a hydration mismatch warning and falls back to re-rendering the mismatched portion on the client.',
    code: `// Server: renders static HTML (renderToString / renderToPipeableStream)
// <div id="root"><button>Clicked 0 times</button></div>

// Client: hydrateRoot attaches behavior to that existing markup
import { hydrateRoot } from 'react-dom/client';
hydrateRoot(document.getElementById('root'), <App />);
// The button is now interactive — no full client re-render happened`,
    highlights: ['Attaches interactivity to server-rendered HTML', 'Does not re-render markup from scratch', 'Mismatches trigger a hydration warning + client re-render'],
  },

  {
    id: 900, category: 'Python', difficulty: 'Mid',
    question: 'How would you write a Pytest fixture with setup and teardown for a database connection?',
    answer: 'A fixture function decorated with @pytest.fixture provides setup code before a yield statement, and the code after yield runs as teardown once the test using the fixture finishes — even if the test fails or raises an exception. Tests that want the fixture simply declare it as a parameter, and Pytest handles creating and cleaning it up automatically.',
    code: `import pytest

@pytest.fixture
def db_connection():
    conn = create_connection()
    yield conn
    conn.close()  # teardown runs after the test, even on failure

def test_document_insert(db_connection):
    result = db_connection.execute("INSERT INTO documents ...")
    assert result.rowcount == 1`,
    highlights: ['Code before yield = setup', 'Code after yield = teardown, always runs', 'Tests just declare the fixture as a parameter'],
  },


  // ─── HTML/CSS (from Interview Masterpack) ───

  {
    id: 1000, category: 'HTML/CSS', difficulty: 'Junior',
    question: 'What is new in HTML5?',
    answer: 'HTML5 added semantic tags (header, nav, section, article, footer), native audio/video/canvas/SVG support, form input types (email, date, range), offline storage (localStorage, IndexedDB), Web Workers, WebSockets, and the Geolocation API — reducing the need for plugins like Flash.',
    highlights: ['HTML5 added semantic tags (header, nav, section,…', 'reducing the need for plugins like Flash'],
  },
  {
    id: 1001, category: 'HTML/CSS', difficulty: 'Junior',
    question: 'What is the difference between <section> and <div>?',
    answer: '<section> is semantic — it groups thematically related content and shows up in the accessibility tree/outline. <div> is a generic, meaningless container used only for styling or layout hooks.',
    highlights: ['<section> is semantic', 'it groups thematically related content and shows up…', '<div> is a generic, meaningless container used only…'],
  },
  {
    id: 1002, category: 'HTML/CSS', difficulty: 'Junior',
    question: 'What is the difference between <b> and <strong> in HTML?',
    answer: '<b> is purely visual bold styling with no semantic weight. <strong> conveys strong importance/urgency and is read with emphasis by screen readers — always prefer <strong> for meaningful emphasis.',
    highlights: ['<b> is purely visual bold styling with no semantic…', '<strong> conveys strong importance/urgency and is…', 'always prefer <strong> for meaningful emphasis'],
  },
  {
    id: 1003, category: 'HTML/CSS', difficulty: 'Junior',
    question: 'Why should you use semantic tags in HTML? (Accessibility, SEO)',
    answer: 'Semantic tags improve accessibility (screen readers can navigate landmarks), boost SEO (search engines weigh <h1>/<article> content higher), and make code more maintainable and self-documenting for other developers.',
    highlights: ['Semantic tags improve accessibility (screen readers…'],
  },
  {
    id: 1004, category: 'HTML/CSS', difficulty: 'Junior',
    question: 'What is an attribute in HTML? Give examples (class, id, alt, href, target).',
    answer: 'Attributes provide additional configuration/metadata on an element, written as name="value" in the opening tag. Examples: class (styling hook), id (unique identifier), alt (image fallback text), href (link destination), target (where to open a link).',
    highlights: ['Attributes provide additional…', 'Examples: class (styling hook), id (unique…'],
  },
  {
    id: 1005, category: 'HTML/CSS', difficulty: 'Junior',
    question: 'What is the purpose of the alt attribute in images?',
    answer: 'alt provides a text alternative for an image — read aloud by screen readers, shown if the image fails to load, and indexed by search engines. It\'s mandatory for accessibility compliance (WCAG).',
    highlights: ['alt provides a text alternative for an image', 'read aloud by screen readers, shown if the image…', 'It\'s mandatory for accessibility compliance (WCAG)'],
  },
  {
    id: 1006, category: 'HTML/CSS', difficulty: 'Mid',
    question: 'How do you create a hyperlink in HTML? How does the target attribute work?',
    answer: 'Use <a href="url">text</a>. target controls where it opens: _self (same tab, default), _blank (new tab), _parent/_top (frame contexts). Combine target="_blank" with rel="noopener noreferrer" to prevent security issues.',
    highlights: ['Use <a href="url">text</a>', 'target controls where it opens: _self (same tab,…', 'Combine target="_blank" with rel="noopener…'],
  },
  {
    id: 1007, category: 'HTML/CSS', difficulty: 'Mid',
    question: 'What are void elements in HTML? (e.g., img, br, input)',
    answer: 'Void elements have no closing tag and cannot contain children — e.g. <img>, <br>, <hr>, <input>, <meta>, <link>. They are self-closing by nature since they represent a single unit of content.',
    highlights: ['Void elements have no closing tag and cannot…', '<img>, <br>, <hr>, <input>, <meta>, <link>', 'They are self-closing by nature since they…'],
  },
  {
    id: 1008, category: 'HTML/CSS', difficulty: 'Junior',
    question: 'What is the purpose of the <meta> tag?',
    answer: '<meta> supplies metadata about the document that isn\'t displayed — character encoding, viewport settings, SEO description/keywords, social-share (Open Graph) tags, and caching directives — placed inside <head>.',
    highlights: ['<meta> supplies metadata about the document that…', 'character encoding, viewport settings, SEO…', 'placed inside <head>'],
  },
  {
    id: 1009, category: 'HTML/CSS', difficulty: 'Junior',
    question: 'What is the viewport attribute in HTML?',
    answer: '<meta name="viewport" content="width=device-width, initial-scale=1"> tells mobile browsers to render the page at the device\'s actual width instead of a default desktop-width canvas, which is essential for responsive design.',
    highlights: ['<meta name="viewport" content="width=device-width,…'],
  },
  {
    id: 1010, category: 'HTML/CSS', difficulty: 'Mid',
    question: 'How do you create a form in HTML? Explain the method attribute (GET/POST).',
    answer: '<form action="/submit" method="post"> wraps input elements. GET appends data to the URL (visible, cacheable, size-limited — used for reads/searches). POST sends data in the request body (hidden, larger payloads — used for creating/updating data).',
    highlights: ['<form action="/submit" method="post"> wraps input…', 'GET appends data to the URL (visible, cacheable,…', 'used for reads/searches)'],
  },
  {
    id: 1011, category: 'HTML/CSS', difficulty: 'Mid',
    question: 'How do you create checkbox, radio, and other input types in HTML?',
    answer: '<input type="checkbox">, <input type="radio" name="group">, plus text, email, password, date, range, file, number, color, etc. Radios sharing the same name attribute form a mutually-exclusive group.',
    highlights: ['<input type="checkbox">, <input type="radio"…', 'Radios sharing the same name attribute form a…'],
  },
  {
    id: 1012, category: 'HTML/CSS', difficulty: 'Mid',
    question: 'How do you associate a label with a form element?',
    answer: 'Wrap the input inside a <label>, or use <label for="id"> matching the input\'s id attribute. This links the label to the control so clicking the text focuses/toggles the input — improving accessibility.',
    highlights: ['Wrap the input inside a <label>, or use <label…', 'This links the label to the control so clicking the…', 'improving accessibility'],
  },
  {
    id: 1013, category: 'HTML/CSS', difficulty: 'Mid',
    question: 'How do you embed an image, video, and audio in HTML?',
    answer: '<img src="..." alt="...">, <video controls src="..."></video> (or multiple <source> tags for format fallback), and <audio controls src="..."></audio>. All support native browser controls without plugins.',
    highlights: ['<img src="..." alt="...">, <video controls…', 'All support native browser controls without plugins'],
  },
  {
    id: 1014, category: 'HTML/CSS', difficulty: 'Junior',
    question: 'What is the <iframe> tag in HTML5 and how do you embed a YouTube video?',
    answer: '<iframe> embeds another HTML document within the current page, sandboxed in its own browsing context. YouTube: <iframe src="https://www.youtube.com/embed/VIDEO_ID" allowfullscreen></iframe>.',
    highlights: ['<iframe> embeds another HTML document within the…', 'YouTube: <iframe…'],
  },
  {
    id: 1015, category: 'HTML/CSS', difficulty: 'Mid',
    question: 'What are the formatting tags in HTML? (e.g., b, i, u, strong, em)',
    answer: 'b (bold, no semantic weight), i (italic, no semantic weight), u (underline), strong (semantic importance), em (semantic emphasis), mark (highlight), small, sub/sup. Prefer semantic tags over purely visual ones.',
    highlights: ['b (bold, no semantic weight), i (italic, no…', 'Prefer semantic tags over purely visual ones'],
  },
  {
    id: 1016, category: 'HTML/CSS', difficulty: 'Junior',
    question: 'What is the difference between HTML and HTML5? List new features in HTML5.',
    answer: 'HTML5 is the current living-standard version, adding semantic elements, native multimedia (audio/video/canvas), offline storage APIs, new form input types, and dropping the need for external plugins that older HTML relied on.',
    highlights: ['HTML5 is the current living-standard version,…'],
  },
  {
    id: 1017, category: 'HTML/CSS', difficulty: 'Mid',
    question: 'How do you create ordered and unordered lists in HTML?',
    answer: '<ol><li>...</li></ol> creates a numbered list; <ul><li>...</li></ul> creates a bulleted list. Nesting a list inside an <li> creates sub-lists.',
    highlights: ['<ol><li>...</li></ol> creates a numbered list;…', 'Nesting a list inside an <li> creates sub-lists'],
  },
  {
    id: 1018, category: 'HTML/CSS', difficulty: 'Junior',
    question: 'What is the <article> tag and when should you use it?',
    answer: '<article> represents a self-contained piece of content that could be distributed/reused independently — a blog post, forum post, or news story — distinct from <section> which groups related but non-standalone content.',
    highlights: ['<article> represents a self-contained piece of…', 'a blog post, forum post, or news story', 'distinct from <section> which groups related but…'],
  },
  {
    id: 1019, category: 'HTML/CSS', difficulty: 'Junior',
    question: 'What is the difference between <div> and <span> in HTML?',
    answer: 'div is block-level and used for larger structural grouping; span is inline and used for styling small runs of text without breaking the flow of a line.',
    highlights: ['div is block-level and used for larger structural…'],
  },
  {
    id: 1020, category: 'HTML/CSS', difficulty: 'Junior',
    question: 'What is the difference between <script>, <script async> and <script defer>? When would you use each?',
    answer: 'Plain <script> blocks HTML parsing until it downloads and executes. async downloads in parallel but executes immediately when ready (order not guaranteed) — good for independent scripts like analytics. defer downloads in parallel but executes only after parsing completes, in order — best for scripts that touch the DOM.',
    highlights: ['Plain <script> blocks HTML parsing until it…', 'async downloads in parallel but executes…', 'good for independent scripts like analytics'],
  },
  {
    id: 1021, category: 'HTML/CSS', difficulty: 'Mid',
    question: 'What are ARIA roles and attributes in HTML? How do they improve accessibility?',
    answer: 'ARIA (Accessible Rich Internet Applications) attributes like role, aria-label, aria-hidden, and aria-expanded describe custom widget behavior to assistive technology when native semantics aren\'t enough — e.g. a div acting as a button needs role="button" and tabindex.',
    highlights: ['ARIA (Accessible Rich Internet Applications)…', 'a div acting as a button needs role="button" and…'],
  },
  {
    id: 1022, category: 'HTML/CSS', difficulty: 'Junior',
    question: 'What is the difference between <input type=\'submit\'> and <button type=\'submit\'>?',
    answer: 'Both submit a form, but <button> can contain rich HTML content (icons, nested markup) while <input type="submit"> can only display plain text via its value attribute.',
    highlights: ['Both submit a form, but <button> can contain rich…'],
  },
  {
    id: 1023, category: 'HTML/CSS', difficulty: 'Junior',
    question: 'What is the difference between <picture> and <img> elements?',
    answer: '<picture> lets you specify multiple <source> candidates (different formats/resolutions/breakpoints) with a fallback <img>, letting the browser pick the best match for art direction and responsive images — plain <img> only supports one source.',
    highlights: ['<picture> lets you specify multiple <source>…', 'plain <img> only supports one source'],
  },
  {
    id: 1024, category: 'HTML/CSS', difficulty: 'Junior',
    question: 'What is the purpose of <datalist> in HTML forms?',
    answer: '<datalist> provides a predefined list of autocomplete suggestions for an <input>, linked via the list attribute — giving a native, lightweight autocomplete without JavaScript.',
    highlights: ['<datalist> provides a predefined list of…', 'giving a native, lightweight autocomplete without…'],
  },
  {
    id: 1025, category: 'HTML/CSS', difficulty: 'Junior',
    question: 'What is the difference between localStorage, sessionStorage and cookies in the context of HTML?',
    answer: 'localStorage persists (~5-10MB) until explicitly cleared and isn\'t sent to the server. sessionStorage is scoped to a single tab and cleared on close. Cookies (~4KB) are sent with every HTTP request and support expiration dates — used for sessions/auth.',
    highlights: ['localStorage persists (~5-10MB) until explicitly…', 'sessionStorage is scoped to a single tab and…', 'Cookies (~4KB) are sent with every HTTP request and…'],
  },
  {
    id: 1026, category: 'HTML/CSS', difficulty: 'Mid',
    question: 'How does the <template> tag work in HTML5?',
    answer: '<template> holds inert markup that is parsed but not rendered or executed until explicitly cloned and inserted into the DOM via JavaScript — useful for reusable UI fragments like row templates in a table.',
    highlights: ['<template> holds inert markup that is parsed but…', 'useful for reusable UI fragments like row templates…'],
  },
  {
    id: 1027, category: 'HTML/CSS', difficulty: 'Junior',
    question: 'What is the difference between CSS and CSS3? List new features in CSS3.',
    answer: 'CSS3 is the modular evolution of CSS, adding Flexbox, Grid, animations/transitions, media queries, custom properties (variables), border-radius, box-shadow, and gradients — split into independent specs (modules) instead of one monolithic spec.',
    code: `/* CSS3 Features */\n\n/* Flexbox */\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  gap: 10px;\n}\n\n/* Grid */\n.grid {\n  display: grid;\n  grid-template-columns: 1fr 2fr 1fr;\n  gap: 20px;\n}\n\n/* Custom Properties (Variables) */\n:root {\n  --primary-color: #4FD1C5;\n  --spacing: 16px;\n}\n\nbutton {\n  background: var(--primary-color);\n  padding: var(--spacing);\n  border-radius: 8px;\n  transition: all 0.3s ease;\n}\n\n/* Media Query */\n@media (max-width: 768px) {\n  .grid {\n    grid-template-columns: 1fr;\n  }\n}`,
    highlights: ['CSS3 is the modular evolution of CSS, adding…', 'split into independent specs (modules) instead of…'],
  },
  {
    id: 1028, category: 'HTML/CSS', difficulty: 'Mid',
    question: 'What are CSS selectors? Difference between class selector and ID selector.',
    answer: 'Selectors target elements to style. Class (.name) can apply to multiple elements and has lower specificity; ID (#name) must be unique per page and has higher specificity, making it override classes.',
    highlights: ['Selectors target elements to style', 'Class (.name) can apply to multiple elements and…'],
  },
  {
    id: 1029, category: 'HTML/CSS', difficulty: 'Mid',
    question: 'How do you select all p elements inside a div? (descendant selector)',
    answer: 'div p { } selects every <p> nested anywhere inside a <div>, regardless of depth. Use div > p for only direct children.',
    highlights: ['div p { } selects every <p> nested anywhere inside…', 'Use div > p for only direct children'],
  },
  {
    id: 1030, category: 'HTML/CSS', difficulty: 'Mid',
    question: 'What are pseudo-selectors / pseudo-classes in CSS? Give examples (:hover, :nth-child, ::before, ::after).',
    answer: 'Pseudo-classes target an element\'s state (:hover, :focus, :nth-child(2)); pseudo-elements target a sub-part of an element (::before, ::after, ::first-line) to insert generated content or style a fragment without extra markup.',
    highlights: ['Pseudo-classes target an element\'s state (:hover,…'],
  },
  {
    id: 1031, category: 'HTML/CSS', difficulty: 'Junior',
    question: 'How do padding and margin differ in the box model?',
    answer: 'Padding is inside the element\'s border and affects its own background/clickable area. Margin is outside the border and creates space between the element and its neighbors — margins can also collapse between siblings.',
    highlights: ['Padding is inside the element\'s border and affects…', 'Margin is outside the border and creates space…', 'margins can also collapse between siblings'],
  },
  {
    id: 1032, category: 'HTML/CSS', difficulty: 'Mid',
    question: 'Why do we use box-sizing: border-box in CSS?',
    answer: 'border-box makes width/height include padding and border, so the element doesn\'t grow beyond its declared size when you add padding — this predictable sizing is why most resets apply it globally.',
    highlights: ['border-box makes width/height include padding and…', 'this predictable sizing is why most resets apply it…'],
  },
  {
    id: 1033, category: 'HTML/CSS', difficulty: 'Junior',
    question: 'What is Flexbox in CSS? Explain justify-content, align-items, flex-direction.',
    answer: 'Flexbox is a one-dimensional layout model for distributing space along a row or column. flex-direction sets the main axis (row/column). justify-content aligns items along the main axis; align-items aligns items along the cross axis.',
    highlights: ['Flexbox is a one-dimensional layout model for…', 'flex-direction sets the main axis (row/column)', 'justify-content aligns items along the main axis;…'],
  },
  {
    id: 1034, category: 'HTML/CSS', difficulty: 'Mid',
    question: 'What are media queries in CSS? How do you make a website responsive?',
    answer: '@media (max-width: 768px) { ... } applies styles conditionally based on viewport size, device type, or orientation. Responsive design combines media queries, fluid units (%, rem, vw), flexible images, and mobile-first breakpoints.',
    highlights: ['@media (max-width: 768px) { ', '} applies styles conditionally based on viewport…', 'Responsive design combines media queries, fluid…'],
  },
  {
    id: 1035, category: 'HTML/CSS', difficulty: 'Junior',
    question: 'What is the difference between min-width and max-width in media queries?',
    answer: 'min-width applies styles when the viewport is at least that wide (mobile-first, styles cascade up). max-width applies styles when the viewport is at most that wide (desktop-first, styles cascade down).',
    highlights: ['min-width applies styles when the viewport is at…', 'max-width applies styles when the viewport is at…'],
  },
  {
    id: 1036, category: 'HTML/CSS', difficulty: 'Mid',
    question: 'What are the standard responsive breakpoints for viewport / responsive devices?',
    answer: 'Common conventions: mobile <576px, small tablets 576-768px, tablets 768-992px, laptops 992-1200px, desktops 1200px+. Frameworks like Bootstrap and Tailwind use similar tiers (sm, md, lg, xl, 2xl).',
    highlights: ['Common conventions: mobile <576px, small tablets…', 'Frameworks like Bootstrap and Tailwind use similar…'],
  },
  {
    id: 1037, category: 'HTML/CSS', difficulty: 'Junior',
    question: 'What is the difference between px, em, rem, vh, and vw units in CSS?',
    answer: 'px is a fixed absolute unit. em is relative to the parent element\'s font size (compounds when nested). rem is relative to the root <html> font size (predictable, doesn\'t compound). vh/vw are relative to 1% of viewport height/width.',
    highlights: ['px is a fixed absolute unit', 'em is relative to the parent element\'s font size…', 'rem is relative to the root <html> font size…'],
  },
  {
    id: 1038, category: 'HTML/CSS', difficulty: 'Junior',
    question: 'What is the BOM (Browser Object Model) and how does it relate to CSS/layout?',
    answer: 'The BOM is the browser\'s JS API surface beyond the DOM — window, navigator, screen, location, history — giving access to viewport size, screen resolution, and URL, which JS uses to drive responsive/dynamic layout decisions.',
    highlights: ['The BOM is the browser\'s JS API surface beyond the DOM', 'window, navigator, screen, location, history', 'giving access to viewport size, screen resolution,…'],
  },
  {
    id: 1039, category: 'HTML/CSS', difficulty: 'Mid',
    question: 'How do you change background color, text color, and font size using CSS properties?',
    answer: 'background-color: #fff; color: #333; font-size: 16px; (or rem/em for scalability) — set directly on a selector or via a class.',
    highlights: ['background-color: #fff; color: #333; font-size:…', 'set directly on a selector or via a class'],
  },
  {
    id: 1040, category: 'HTML/CSS', difficulty: 'Mid',
    question: 'How do you create a responsive grid layout using CSS Grid or Flexbox?',
    answer: 'With Grid: grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); lets columns wrap and resize automatically. With Flexbox: flex-wrap: wrap combined with flex: 1 1 200px on children achieves a similar responsive effect.',
    highlights: ['With Grid: grid-template-columns: repeat(auto-fit,…', 'With Flexbox: flex-wrap: wrap combined with flex: 1…'],
  },
  {
    id: 1041, category: 'HTML/CSS', difficulty: 'Mid',
    question: 'How do you make a website responsive?',
    answer: 'Combine a viewport meta tag, fluid/relative units, flexible images (max-width:100%), media queries for breakpoints, and mobile-first CSS so layouts adapt gracefully across screen sizes.',
    highlights: ['Combine a viewport meta tag, fluid/relative units,…'],
  },
  {
    id: 1042, category: 'HTML/CSS', difficulty: 'Junior',
    question: 'What is the z-index property in CSS and how does stacking context work?',
    answer: 'z-index controls the stacking order of positioned elements (higher values appear on top). It only works on positioned elements (relative/absolute/fixed/sticky) and only compares within the same stacking context, which is created by properties like transform, opacity<1, or position.',
    highlights: ['z-index controls the stacking order of positioned…', 'It only works on positioned elements…'],
  },
  {
    id: 1043, category: 'HTML/CSS', difficulty: 'Junior',
    question: 'What is CSS specificity and how is it calculated? (inline > ID > class > tag)',
    answer: 'Specificity is calculated as a 4-part tuple: inline styles > ID selectors > class/attribute/pseudo-class selectors > element/pseudo-element selectors. Higher specificity wins regardless of source order; !important overrides all specificity (use sparingly).',
    highlights: ['Specificity is calculated as a 4-part tuple: inline…', 'Higher specificity wins regardless of source order;…'],
  },
  {
    id: 1044, category: 'HTML/CSS', difficulty: 'Junior',
    question: 'What is the difference between display: none, visibility: hidden, and opacity: 0?',
    answer: 'display:none removes the element entirely from layout (no space, not in accessibility tree). visibility:hidden hides it visually but keeps its layout space and is still in the tree. opacity:0 makes it fully transparent but still visible to interaction and screen readers.',
    highlights: ['display:none removes the element entirely from…', 'visibility:hidden hides it visually but keeps its…', 'opacity:0 makes it fully transparent but still…'],
  },
  {
    id: 1045, category: 'HTML/CSS', difficulty: 'Senior',
    question: 'What is CSS animation vs CSS transition? When would you use each?',
    answer: 'transition animates a property change between two states triggered by an event (hover, class toggle) — simple A-to-B. animation with @keyframes defines multi-step sequences that can loop, run automatically, and don\'t need a trigger event.',
    highlights: ['transition animates a property change between two…', 'simple A-to-B', 'animation with @keyframes defines multi-step…'],
  },
  {
    id: 1046, category: 'HTML/CSS', difficulty: 'Mid',
    question: 'How do you implement dark mode using CSS?',
    answer: 'Define CSS custom properties for colors, then override them under a [data-theme="dark"] selector or @media (prefers-color-scheme: dark), toggling a class/attribute on <html> via JS to switch themes without reloading.',
    highlights: ['Define CSS custom properties for colors, then…'],
  },
  {
    id: 1047, category: 'HTML/CSS', difficulty: 'Senior',
    question: 'What is the clamp() function in CSS and how is it used for responsive typography?',
    answer: 'clamp(min, preferred, max) picks a fluid value that scales with viewport but never goes below min or above max — e.g. font-size: clamp(1rem, 2vw + 1rem, 2rem) gives fluid typography without media queries.',
    highlights: ['clamp(min, preferred, max) picks a fluid value that…', 'font-size: clamp(1rem, 2vw + 1rem, 2rem) gives…'],
  },
  {
    id: 1048, category: 'HTML/CSS', difficulty: 'Junior',
    question: 'What is the difference between :is(), :where(), and :has() selectors in modern CSS?',
    answer: ':is() and :where() group multiple selectors compactly — :is() contributes normal specificity while :where() always has zero specificity. :has() is a true parent/relational selector, letting you style an element based on its descendants (e.g. div:has(> img)).',
    highlights: [':is() and :where() group multiple selectors compactly', ':is() contributes normal specificity while :where()…', ':has() is a true parent/relational selector,…'],
  },
  {
    id: 1049, category: 'HTML/CSS', difficulty: 'Mid',
    question: 'How do you create a sticky header that stays fixed during scroll?',
    answer: 'position: sticky; top: 0; z-index: 10; on the header keeps it in normal flow until the scroll reaches that offset, then it \'sticks\' to the top of its scrolling container.',
    highlights: ['position: sticky; top: 0; z-index: 10; on the…'],
  },
  {
    id: 1050, category: 'HTML/CSS', difficulty: 'Mid',
    question: 'What are CSS Modules and how do they help with style scoping in React?',
    answer: 'CSS Modules compile class names to unique hashed identifiers at build time (e.g. .button_a3f1), scoping styles to the component that imports them and preventing global class name collisions across a React app.',
    highlights: ['CSS Modules compile class names to unique hashed…', '.button_a3f1), scoping styles to the component that…'],
  },

  // ─── JAVASCRIPT (from Interview Masterpack) ───

  {
    id: 1051, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is JavaScript?',
    answer: 'JavaScript is a dynamically-typed, single-threaded, prototype-based scripting language that runs in browsers (and via Node.js on servers), enabling interactive, event-driven behavior on top of HTML/CSS.',
    code: `// Variables and types\nconst greeting = 'Hello';\nlet count = 0;\nvar name = 'Alice';\n\n// Functions\nfunction add(a, b) {\n  return a + b;\n}\nconst multiply = (x, y) => x * y;\n\n// Events\ndocument.addEventListener('DOMContentLoaded', () => {\n  console.log('Page loaded');\n});`,
    highlights: ['JavaScript is a dynamically-typed, single-threaded,…'],
  },
  {
    id: 1052, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is ECMAScript? How does JavaScript relate to it?',
    answer: 'ECMAScript (ES) is the standardized specification that JavaScript implements. Browsers and engines like V8 implement ECMAScript; JS is the most popular implementation, alongside others like JScript and ActionScript.',
    highlights: ['ECMAScript (ES) is the standardized specification…', 'Browsers and engines like V8 implement ECMAScript;…'],
  },
  {
    id: 1053, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is the difference between JavaScript and other programming languages?',
    answer: 'JS is interpreted/JIT-compiled, dynamically typed, single-threaded with an event loop for concurrency, and historically the only language natively executable in browsers — unlike statically-typed, multi-threaded languages like Java or C++.',
    highlights: ['JS is interpreted/JIT-compiled, dynamically typed,…', 'unlike statically-typed, multi-threaded languages…'],
  },
  {
    id: 1054, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is the execution context and how does the event loop work?',
    answer: 'An execution context is the environment (variables, this, scope chain) in which code runs — global, function, or eval. The event loop continuously checks if the call stack is empty, then pushes callbacks from the queue (macrotasks) or microtask queue onto it.',
    highlights: ['An execution context is the environment (variables,…', 'global, function, or eval', 'The event loop continuously checks if the call…'],
  },
  {
    id: 1055, category: 'JavaScript', difficulty: 'Mid',
    question: 'Explain the call stack, task queue, microtask queue in JavaScript.',
    answer: 'The call stack tracks currently executing function frames (LIFO). The macrotask/task queue holds callbacks like setTimeout and I/O. The microtask queue holds Promise callbacks and runs fully before the next macrotask, giving Promises higher priority.',
    code: `// Call stack example\nfunction greet(name) {\n  console.log('Hello, ' + name);\n}\nfunction welcome() {\n  greet('Alice'); // Added to call stack\n}\nwelcome(); // Execution\n\n// Microtask vs Macrotask\nconsole.log('Start');\nsetTimeout(() => console.log('setTimeout (macrotask)'), 0);\nPromise.resolve().then(() => console.log('Promise (microtask)'));\nconsole.log('End');\n// Output: Start, End, Promise (microtask), setTimeout (macrotask)`,
    highlights: ['The call stack tracks currently executing function…', 'The macrotask/task queue holds callbacks like…', 'The microtask queue holds Promise callbacks and…'],
  },
  {
    id: 1056, category: 'JavaScript', difficulty: 'Mid',
    question: 'What are the different phases of the event loop?',
    answer: 'Node.js phases run in order each loop tick: timers (setTimeout/setInterval), pending callbacks, idle/prepare, poll (I/O), check (setImmediate), and close callbacks — with microtasks (Promises, process.nextTick) draining between every phase.',
    highlights: ['Node.js phases run in order each loop tick: timers…', 'with microtasks (Promises, process.nextTick)…'],
  },
  {
    id: 1057, category: 'JavaScript', difficulty: 'Mid',
    question: 'Explain execution flow of Promise, async/await, setTimeout, setImmediate, process.nextTick().',
    answer: 'Order of priority: synchronous code runs first, then process.nextTick() (Node-specific, highest priority), then Promise microtasks, then setTimeout/setInterval (timer phase), then setImmediate (check phase, runs after I/O in Node).',
    highlights: ['Order of priority: synchronous code runs first,…'],
  },
  {
    id: 1058, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is the Temporal Dead Zone (TDZ) in JavaScript?',
    answer: 'The TDZ is the period between entering a scope and the actual declaration of a let/const variable, during which accessing it throws a ReferenceError — this prevents use-before-declare bugs that var silently allows.',
    highlights: ['The TDZ is the period between entering a scope and…', 'this prevents use-before-declare bugs that var…'],
  },
  {
    id: 1059, category: 'JavaScript', difficulty: 'Mid',
    question: 'What are primitive and non-primitive (reference) data types?',
    answer: 'Primitives (string, number, boolean, null, undefined, symbol, bigint) are immutable and compared by value. Non-primitives (object, array, function) are mutable, stored by reference, and compared by reference identity.',
    highlights: ['Primitives (string, number, boolean, null,…', 'Non-primitives (object, array, function) are…'],
  },
  {
    id: 1060, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is null vs undefined in JavaScript? What are falsy values?',
    answer: 'undefined means a variable was declared but never assigned. null is an intentional \'no value\' assigned explicitly. Falsy values: false, 0, \'\', null, undefined, NaN — everything else, including \'0\' and [], is truthy.',
    highlights: ['undefined means a variable was declared but never…', 'null is an intentional \'no value\' assigned explicitly', 'Falsy values: false, 0, \'\', null, undefined, NaN'],
  },
  {
    id: 1061, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is the Nullish coalescing operator (??) in JavaScript?',
    answer: 'a ?? b returns b only if a is null or undefined (unlike || which also falls through on 0, \'\', or false) — useful for defaulting values without accidentally overriding legitimate falsy values.',
    highlights: ['a ?? b returns b only if a is null or undefined…', 'useful for defaulting values without accidentally…'],
  },
  {
    id: 1062, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is optional chaining (?.) in JavaScript?',
    answer: 'obj?.prop?.method?.() safely accesses nested properties/calls, short-circuiting to undefined instead of throwing if any link in the chain is null or undefined.',
    highlights: ['obj?.prop?.method?.() safely accesses nested…'],
  },
  {
    id: 1063, category: 'JavaScript', difficulty: 'Mid',
    question: 'What are arrow functions and how are they different from regular functions?',
    answer: 'Arrow functions have concise syntax and lexically bind \'this\' from their enclosing scope (no own \'this\'). They also lack their own \'arguments\' object and cannot be used as constructors (no \'new\').',
    highlights: ['Arrow functions have concise syntax and lexically…', 'They also lack their own \'arguments\' object and…'],
  },
  {
    id: 1064, category: 'JavaScript', difficulty: 'Mid',
    question: 'What are the limitations of arrow functions?',
    answer: 'No own \'this\', \'arguments\', or \'super\' binding (all inherited lexically); cannot be used as constructors with \'new\'; cannot be used as generator functions; not ideal as object methods needing dynamic \'this\'.',
    highlights: ['No own \'this\', \'arguments\', or \'super\' binding (all…'],
  },
  {
    id: 1065, category: 'JavaScript', difficulty: 'Mid',
    question: 'Explain different types of functions in JavaScript (declaration, expression, arrow, IIFE, generator).',
    answer: 'Declaration: function foo(){} (hoisted fully). Expression: const foo = function(){} (not hoisted). Arrow: const foo = () => {}. IIFE: (function(){})() runs immediately. Generator: function* foo(){ yield x } produces an iterable that pauses/resumes via yield.',
    highlights: ['Declaration: function foo(){} (hoisted fully)', 'Expression: const foo = function(){} (not hoisted)', 'Arrow: const foo = () => {}'],
  },
  {
    id: 1066, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is an IIFE (Immediately Invoked Function Expression)?',
    answer: '(function(){ ... })() defines and executes a function immediately, creating a private scope to avoid polluting the global namespace — the classic pattern before ES6 modules existed.',
    highlights: ['(function(){ ', '})() defines and executes a function immediately,…', 'the classic pattern before ES6 modules existed'],
  },
  {
    id: 1067, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is a closure in JavaScript? Explain with an example.',
    answer: 'A closure is a function that retains access to its outer (lexical) scope\'s variables even after the outer function has returned. Example: function counter(){ let n=0; return () => ++n; } — each call to the returned function remembers and increments \'n\'.',
    highlights: ['A closure is a function that retains access to its…', 'Example: function counter(){ let n=0; return () =>…', 'each call to the returned function remembers and…'],
  },
  {
    id: 1068, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is the \'this\' keyword in JavaScript? How does it differ across contexts?',
    answer: '\'this\' refers to the object executing the current function. In a method call it\'s the calling object; in a plain function call it\'s undefined (strict mode) or global object; in an arrow function it\'s lexically inherited; with call/apply/bind it\'s explicitly set.',
    highlights: ['\'this\' refers to the object executing the current…', 'In a method call it\'s the calling object; in a…'],
  },
  {
    id: 1069, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is function currying in JavaScript? Explain with an example.',
    answer: 'Currying transforms a function taking multiple arguments into a sequence of functions each taking one argument: const add = a => b => a + b; add(2)(3) returns 5 — useful for partial application and composition.',
    highlights: ['Currying transforms a function taking multiple…', 'useful for partial application and composition'],
  },
  {
    id: 1070, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is memoization in JavaScript? Explain with an example.',
    answer: 'Memoization caches a function\'s results keyed by its arguments so repeated calls with the same input return instantly from cache instead of recomputing — commonly implemented with a Map inside a closure, widely used to optimize expensive pure functions like recursive Fibonacci.',
    highlights: ['Memoization caches a function\'s results keyed by…', 'commonly implemented with a Map inside a closure,…'],
  },
  {
    id: 1071, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is the spread operator (...) and rest parameter (...args)?',
    answer: 'Spread expands an iterable into individual elements: [...arr1, ...arr2] or {...obj}. Rest collects remaining arguments into an array: function sum(...nums){}. Same syntax, opposite direction — spread expands, rest gathers.',
    highlights: ['Spread expands an iterable into individual…', 'Rest collects remaining arguments into an array:…', 'Same syntax, opposite direction'],
  },
  {
    id: 1072, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is destructuring in JavaScript? (Array and object destructuring)',
    answer: 'Destructuring unpacks values from arrays/objects into variables in one line: const [a,b] = arr; const {x,y} = obj; — supports defaults, renaming, and nested patterns, reducing repetitive property access.',
    highlights: ['Destructuring unpacks values from arrays/objects…', 'supports defaults, renaming, and nested patterns,…'],
  },
  {
    id: 1073, category: 'JavaScript', difficulty: 'Mid',
    question: 'What are template literals (template strings) in JavaScript?',
    answer: 'Backtick-delimited strings (`Hello ${name}`) supporting embedded expression interpolation and multi-line strings without concatenation — also enable tagged templates for custom string processing.',
    highlights: ['Backtick-delimited strings (`Hello ${name}`)…', 'also enable tagged templates for custom string…'],
  },
  {
    id: 1074, category: 'JavaScript', difficulty: 'Mid',
    question: 'What are default parameters in JavaScript?',
    answer: 'function greet(name = \'Guest\'){} assigns a fallback value when an argument is undefined or omitted, avoiding manual `name = name || \'Guest\'` checks.',
    highlights: ['function greet(name = \'Guest\'){} assigns a fallback…'],
  },
  {
    id: 1075, category: 'JavaScript', difficulty: 'Mid',
    question: 'What are map and filter polyfills? Write them from scratch.',
    answer: 'Array.prototype.myMap = function(cb){ const res=[]; for(let i=0;i<this.length;i++) res.push(cb(this[i], i, this)); return res; }; myFilter is identical but pushes only when cb(...) returns true.',
    highlights: ['Array.prototype.myMap = function(cb){ const res=[];…'],
  },
  {
    id: 1076, category: 'JavaScript', difficulty: 'Senior',
    question: 'Implement Promise.all, Promise.allSettled, Promise.race, and Promise.any from scratch (polyfills).',
    answer: `Implementing these from scratch is a top-tier LTIMindtree coding question — it proves you understand Promise internals deeply.

Core pattern used by ALL combinators:
1. Return a new Promise with an executor
2. Attach .then() and .catch() to each input promise
3. Based on the combinator's logic, call resolve() or reject() at the right moment

Critical implementation details:
- Store results by INPUT INDEX, not completion order — two promises completing at the same time could race for the same slot
- Wrap each input with Promise.resolve() to safely handle non-Promise values passed in
- Promise state is immutable — once resolve()/reject() is called, subsequent calls are silently ignored, which is WHY Promise.race() works with no extra bookkeeping
- Empty array edge case: Promise.all([]) and Promise.allSettled([]) resolve immediately; Promise.any([]) rejects immediately with AggregateError`,
    code: `// ── Promise.all — ALL must succeed, results in input order ──
Promise.myAll = function(promises) {
  return new Promise((resolve, reject) => {
    if (promises.length === 0) return resolve([]);
    const results = new Array(promises.length);
    let resolvedCount = 0;

    promises.forEach((promise, i) => {
      Promise.resolve(promise) // handles non-Promise values safely
        .then(value => {
          results[i] = value;  // store at ORIGINAL index, not arrival order
          resolvedCount++;
          if (resolvedCount === promises.length) resolve(results);
        })
        .catch(reject);        // first rejection immediately rejects outer promise
    });
  });
};

// ── Promise.allSettled — wait for ALL, never rejects ──
Promise.myAllSettled = function(promises) {
  return new Promise((resolve) => {
    if (promises.length === 0) return resolve([]);
    const results = new Array(promises.length);
    let settledCount = 0;

    promises.forEach((promise, i) => {
      Promise.resolve(promise)
        .then(value  => { results[i] = { status: 'fulfilled', value }; })
        .catch(reason => { results[i] = { status: 'rejected', reason }; })
        .finally(() => {
          settledCount++;
          if (settledCount === promises.length) resolve(results); // ALWAYS resolves
        });
    });
  });
};

// ── Promise.race — first to settle (win OR lose) wins ──
Promise.myRace = function(promises) {
  return new Promise((resolve, reject) => {
    promises.forEach(promise => {
      Promise.resolve(promise)
        .then(resolve)  // first resolve() wins — subsequent calls ignored (immutable state)
        .catch(reject); // first reject() wins too
    });
    // No counter needed — immutability of Promise state handles it
  });
};

// ── Promise.any — first SUCCESS wins, only fails if ALL fail ──
Promise.myAny = function(promises) {
  return new Promise((resolve, reject) => {
    if (promises.length === 0)
      return reject(new AggregateError([], 'All promises were rejected'));

    const errors = new Array(promises.length);
    let rejectedCount = 0;

    promises.forEach((promise, i) => {
      Promise.resolve(promise)
        .then(resolve) // first fulfillment wins immediately
        .catch(reason => {
          errors[i] = reason;
          rejectedCount++;
          if (rejectedCount === promises.length) {
            // Only reject when EVERY promise has rejected
            reject(new AggregateError(errors, 'All promises were rejected'));
          }
        });
    });
  });
};

// ── Verify all polyfills ──
Promise.myAll([Promise.resolve(1), Promise.resolve(2)]).then(console.log); // [1, 2]
Promise.myAllSettled([Promise.resolve(1), Promise.reject('err')]).then(console.log);
// [{status:'fulfilled',value:1}, {status:'rejected',reason:'err'}]
Promise.myRace([new Promise(r => setTimeout(r, 100, 'slow')), Promise.resolve('fast')]).then(console.log); // 'fast'
Promise.myAny([Promise.reject('x'), Promise.resolve('y')]).then(console.log); // 'y'`,
    highlights: [
      'Store at original INDEX not arrival order — the key correctness detail for Promise.all',
      'Promise.resolve(promise) safely handles both Promise and non-Promise inputs',
      'Promise state immutability is why race() needs no bookkeeping — extra calls are ignored',
      'Promise.any needs AggregateError with all reasons only when EVERY promise fails',
    ],
  },
  {
    id: 1077, category: 'JavaScript', difficulty: 'Mid',
    question: 'Build an Event Emitter from scratch (closures, subscription handling, memory cleanup).',
    answer: 'Maintain a Map of event name to array of listener callbacks. on(event, cb) pushes to the array; emit(event, ...args) iterates and calls each listener; off(event, cb) filters it out — preventing memory leaks from orphaned listeners.',
    highlights: ['Maintain a Map of event name to array of listener…', 'on(event, cb) pushes to the array; emit(event,…', 'preventing memory leaks from orphaned listeners'],
  },
  {
    id: 1078, category: 'JavaScript', difficulty: 'Mid',
    question: 'Implement retry logic with exponential backoff in JavaScript.',
    answer: 'async function retry(fn, retries=3, delay=500){ try { return await fn(); } catch(e){ if(!retries) throw e; await new Promise(r=>setTimeout(r, delay)); return retry(fn, retries-1, delay*2); } } — doubles the wait after each failed attempt.',
    highlights: ['async function retry(fn, retries=3, delay=500){ try…', 'doubles the wait after each failed attempt'],
  },
  {
    id: 1079, category: 'JavaScript', difficulty: 'Mid',
    question: 'Implement a deep compare utility function (recursion, edge-case handling).',
    answer: 'Recursively compare primitive values directly; for objects/arrays, compare key counts, then recurse into each key\'s value; handle NaN, Date, and null/undefined explicitly as base cases before the general object branch.',
    highlights: ['Recursively compare primitive values directly; for…'],
  },
  {
    id: 1080, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is a callback function? List use cases.',
    answer: 'A callback is a function passed as an argument to be invoked later — used for async operations (fs.readFile, setTimeout), event handlers (onClick), and array iteration (map, forEach).',
    highlights: ['A callback is a function passed as an argument to…', 'used for async operations (fs.readFile,…'],
  },
  {
    id: 1081, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is callback hell? How do you avoid it?',
    answer: 'Callback hell is deeply nested callbacks that become unreadable (\'pyramid of doom\'). Avoid it with named functions, Promises, or async/await which flatten async code into linear, readable sequences.',
    highlights: ['Callback hell is deeply nested callbacks that…', 'Avoid it with named functions, Promises, or…'],
  },
  {
    id: 1082, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is a Promise? Explain its three states, how to create one, and how it works internally.',
    answer: `A Promise is an object representing the eventual completion or failure of an asynchronous operation — a placeholder for a value that will exist in the future.

The three states (and the critical rule):
1. Pending — initial state, operation is in progress
2. Fulfilled — operation completed successfully, has a value
3. Rejected — operation failed, has a reason (error)

Once a Promise moves from Pending to Fulfilled OR Rejected, it is SETTLED and can NEVER change state again. This immutability is fundamental to how Promise combinators like race() work.

How the executor works:
The function you pass to new Promise() is the executor — it runs SYNCHRONOUSLY the moment the Promise is created. It receives resolve and reject callbacks. Calling resolve(value) transitions the Promise to Fulfilled. Calling reject(reason) transitions it to Rejected. Only the first call matters — subsequent calls are silently ignored.

How .then() delivery works:
Even when a Promise is already resolved, .then() callbacks are always called ASYNCHRONOUSLY as microtasks — never synchronously. This ensures consistent behavior regardless of whether the Promise resolved before or after .then() was registered.`,
    code: `// Creating a Promise — executor runs synchronously
const myPromise = new Promise((resolve, reject) => {
  console.log('Executor runs NOW — synchronously'); // logged immediately

  setTimeout(() => {
    const success = Math.random() > 0.5;
    if (success) resolve('Data loaded!');       // → Fulfilled
    else         reject(new Error('Failed'));   // → Rejected
  }, 1000);
});

// Consuming
myPromise
  .then(value => console.log('Success:', value))
  .catch(err  => console.error('Error:', err.message))
  .finally(()  => console.log('Always runs — great for cleanup'));

// State immutability — only first call counts
new Promise((resolve, reject) => {
  resolve('first');  // ← this wins, Promise → Fulfilled
  reject('second');  // ← ignored silently
  resolve('third');  // ← also ignored
}).then(v => console.log(v)); // 'first'

// .then() is always async — even on already-resolved Promise
const p = Promise.resolve('immediate');
p.then(v => console.log('B -', v)); // logs SECOND
console.log('A - synchronous');     // logs FIRST
// Output: A - synchronous  →  B - immediate

// Real-world: wrapping a callback API into a Promise (promisification)
function readFileAsync(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) reject(err);
      else     resolve(data);
    });
  });
}
const content = await readFileAsync('./config.json');`,
    highlights: [
      'Three states: Pending → Fulfilled or Rejected — immutable once settled',
      'Executor runs synchronously — .then() callbacks always run asynchronously as microtasks',
      'resolve() and reject() are idempotent — only the first call has any effect',
    ],
  },
  {
    id: 1083, category: 'JavaScript', difficulty: 'Mid',
    question: 'Why were Promises introduced? What specific problems with callbacks did they solve?',
    answer: `Promises were introduced in ES6 (2015) to solve three fundamental problems with the callback pattern:

Problem 1 — Callback Hell (Pyramid of Doom)
Nested async operations create deeply indented code that grows horizontally. Adding error handling at every level makes it nearly unreadable.

Problem 2 — Inversion of Control
With callbacks, you hand your function to a third-party and TRUST it will call your callback exactly once, at the right time, with the right arguments. There's no guarantee — it could call it twice, zero times, synchronously, or swallow your error. Promises take back control: the library returns a Promise to you, and YOU decide when and how to react via .then()/.catch().

Problem 3 — No unified error handling
Callbacks had no standard for errors — Node.js used the convention cb(err, data) but this was never enforced. Each nested callback needed its own error check. Missing one caused silent failures. Promises unify this: one .catch() at the end of an entire chain handles any error from any step.

The evolution:
Callbacks (pre-2015) → Promises/ES6 (2015) → async/await/ES2017 (2017)
async/await is syntactic sugar ON TOP of Promises — it doesn't replace them. async functions return Promises; await unwraps them. They work together, not as alternatives.`,
    code: `// PROBLEM: Callback hell — 3 async steps, unreadable
getUser(userId, function(err, user) {
  if (err) return handleError(err);     // error check #1
  getOrders(user.id, function(err, orders) {
    if (err) return handleError(err);   // error check #2
    getProduct(orders[0].id, function(err, product) {
      if (err) return handleError(err); // error check #3
      render(user, orders, product);    // finally!
    });
  });
});

// SOLUTION with Promises — flat, one error handler
getUser(userId)
  .then(user    => getOrders(user.id))
  .then(orders  => getProduct(orders[0].id))
  .then(product => render(product))
  .catch(handleError); // catches errors from ANY step above

// SOLUTION with async/await — reads like synchronous code
async function load(userId) {
  try {
    const user    = await getUser(userId);
    const orders  = await getOrders(user.id);
    const product = await getProduct(orders[0].id);
    render(user, orders, product);
  } catch (err) {
    handleError(err); // one handler for all three steps
  }
}

// Inversion of control — Promises restore trust
// With callbacks: thirdParty.doWork(myCallback) — you're at their mercy
// With Promises:
const result = await thirdParty.doWork(); // you control when to act on the result`,
    highlights: [
      'Callbacks: pyramid of doom + no trust guarantee + scattered error checks',
      'Promises: flat chains + you control .then() + one .catch() handles everything',
      'async/await is syntactic sugar on Promises — not a replacement, they work together',
    ],
  },
  {
    id: 1084, category: 'JavaScript', difficulty: 'Mid',
    question: 'Explain Promise chaining deeply — how does each .then() work, the return rules, and the most common mistakes.',
    answer: `Promise chaining is the ability to sequence async operations. Every .then() returns a BRAND NEW Promise — not the original. This is the foundational rule everything else flows from.

What .then() does with the return value:
- Return a plain value → new Promise resolves with that value immediately
- Return a Promise → the chain WAITS for that Promise to settle (auto-unwrapping/flattening)
- Throw an error → new Promise rejects with that error
- Return nothing → new Promise resolves with undefined (the silent bug source)

Auto-flattening means you never get Promise<Promise<value>> — nested Promises are automatically unwrapped. This is what makes sequential async steps possible without nesting.

The three most common chain mistakes in production code:
1. Missing return — undefined flows silently to the next step
2. Nested .then() — recreates callback hell inside Promises
3. Not catching — unhandled rejections crash Node.js in modern versions`,
    code: `// How .then() creates a new Promise and passes values through
fetchUser(1)
  .then(user => {
    return fetchOrders(user.id); // returns a Promise → chain waits for it
  })
  .then(orders => {
    return orders.filter(o => o.status === 'active'); // returns plain value
  })
  .then(active => active.length) // returns a number
  .then(count  => console.log(count + ' active orders'))
  .catch(err   => console.error(err))   // catches any error above
  .finally(()  => hideSpinner());       // always runs

// Auto-flattening — you don't get Promise<Promise<>>
fetchUser()
  .then(user => fetchOrders(user.id))   // returns Promise<Orders>
  .then(orders => render(orders));      // receives Orders, not Promise<Orders>

// MISTAKE 1: Missing return — silent undefined bug
fetchUser(1)
  .then(user => {
    fetchOrders(user.id); // Promise created but LOST — no return
  })
  .then(orders => render(orders)); // orders is undefined!

// MISTAKE 2: Nested .then() — callback hell is back
fetchUser(1).then(user => {
  fetchOrders(user.id).then(orders => { // nested — avoid this
    render(user, orders);
  });
});

// CORRECT: flat chain with return
fetchUser(1)
  .then(user   => fetchOrders(user.id)) // return!
  .then(orders => render(orders));

// Real-world pipeline — fetch, validate, transform, render
fetch('/api/products')
  .then(res => {
    if (!res.ok) throw new Error('HTTP ' + res.status); // throw = rejection
    return res.json();
  })
  .then(data     => data.products)
  .then(products => products.filter(p => p.inStock))
  .then(available => renderGrid(available))
  .catch(err     => showErrorBanner(err.message))
  .finally(()    => hideLoadingSpinner());`,
    highlights: [
      '.then() always returns a NEW Promise — returning a Promise flattens it automatically',
      'Missing return inside .then() silently passes undefined to the next step',
      'Nested .then() recreates callback hell — always return and chain flat',
    ],
  },
  {
    id: 1085, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is async/await? How does it work under the hood and what are the critical mistakes to avoid?',
    answer: `async/await is ES2017 syntactic sugar over Promises. It makes asynchronous code read like synchronous code, but under the hood it's still Promises all the way down.

How it works internally:
An async function ALWAYS returns a Promise — even if you return a plain value, it's automatically wrapped in Promise.resolve(). When the JS engine hits await, it pauses execution of that async function, suspends its call frame, and yields control back to the event loop. When the awaited Promise settles, the continuation is queued as a microtask and execution resumes from where it paused. The thread is NEVER blocked.

async/await vs Promises — when to use which:
- Use async/await for sequential steps with conditionals — much cleaner than nested .then()
- Use Promise.all() for parallel operations — always, even inside async functions
- Use .then() chaining for simple one-or-two-step data transformations

The #1 performance mistake — sequential await when parallel is possible:
This is so common it's become a standard code review finding. Every await that doesn't need to wait for the previous result should be parallelized with Promise.all().`,
    code: `// async function ALWAYS returns a Promise
async function greet() {
  return 'Hello'; // auto-wrapped → Promise.resolve('Hello')
}
greet() instanceof Promise; // true
greet().then(console.log);  // 'Hello'

// await pauses the function — thread is not blocked
async function loadUser(id) {
  console.log('A'); // runs synchronously
  const user = await fetchUser(id); // pauses HERE, control returns to event loop
  console.log('C'); // resumes as microtask after fetchUser resolves
  return user;
}
console.log('B'); // runs WHILE loadUser is paused
// Output: A → B → C

// Error handling — try/catch catches any awaited rejection
async function loadDashboard(userId) {
  try {
    const user   = await fetchUser(userId);
    const orders = await fetchOrders(user.id);
    return { user, orders };
  } catch (err) {
    // catches failure from EITHER fetchUser OR fetchOrders
    console.error('Failed:', err.message);
  } finally {
    hideSpinner(); // always runs
  }
}

// ❌ CRITICAL MISTAKE: Sequential awaits when parallel is possible
async function slow() {
  const user  = await fetchUser();   // waits 300ms
  const prefs = await fetchPrefs();  // THEN waits 200ms = 500ms total
  // These don't depend on each other! Wasted 200ms.
}

// ✅ CORRECT: Parallel with Promise.all
async function fast() {
  const [user, prefs] = await Promise.all([
    fetchUser(),  // both fire simultaneously
    fetchPrefs(), // total time = slowest (~300ms), not sum (500ms)
  ]);
}

// Conditional logic — async/await wins over .then() here
async function loadContent(userId) {
  const user = await fetchUser(userId);
  if (user.isPremium) {
    return await fetchPremiumContent(); // conditional await — trivial with async/await
  }
  return fetchFreeContent();
}`,
    highlights: [
      'async fn always returns a Promise — await pauses the function without blocking the thread',
      'Sequential awaits for independent operations is the #1 async performance mistake',
      'Always use Promise.all() for parallel fetching — even inside async functions',
    ],
  },
  {
    id: 1086, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is event bubbling and event capturing in JavaScript?',
    answer: 'Bubbling: an event fires on the target then propagates upward through ancestors (default). Capturing: the event travels downward from the root to the target first. addEventListener\'s third argument (true) enables capture phase.',
    highlights: ['Bubbling: an event fires on the target then…', 'Capturing: the event travels downward from the root…', 'addEventListener\'s third argument (true) enables…'],
  },
  {
    id: 1087, category: 'JavaScript', difficulty: 'Mid',
    question: 'How do you stop event propagation in JavaScript?',
    answer: 'event.stopPropagation() prevents the event from bubbling/capturing further up or down the DOM tree. event.stopImmediatePropagation() additionally prevents other listeners on the same element from firing.',
    highlights: ['event.stopPropagation() prevents the event from…', 'event.stopImmediatePropagation() additionally…'],
  },
  {
    id: 1088, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is event-driven programming in Node.js?',
    answer: 'Node\'s core architecture is built around EventEmitter — modules emit named events (like \'data\', \'error\') and register listeners for them, enabling non-blocking, reactive handling of I/O and custom application events.',
    highlights: ['Node\'s core architecture is built around EventEmitter', 'modules emit named events (like \'data\', \'error\')…'],
  },
  {
    id: 1089, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is the difference between localStorage, sessionStorage, and cookies?',
    answer: 'localStorage persists indefinitely and isn\'t sent to the server. sessionStorage is cleared when the tab closes. Cookies are small (~4KB), sent with every HTTP request, and support expiry — best for session/auth tokens the server needs to see.',
    highlights: ['localStorage persists indefinitely and isn\'t sent…', 'sessionStorage is cleared when the tab closes', 'Cookies are small (~4KB), sent with every HTTP…'],
  },
  {
    id: 1090, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is the immutability concept in JavaScript?',
    answer: 'Immutability means not mutating data in place but producing new copies with changes — critical in React/Redux for predictable re-renders and time-travel debugging, typically achieved with spread syntax or libraries like Immer.',
    highlights: ['Immutability means not mutating data in place but…', 'critical in React/Redux for predictable re-renders…'],
  },
  {
    id: 1091, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is Object.freeze() vs Object.seal()?',
    answer: 'Object.freeze() prevents adding, removing, or modifying properties entirely (fully immutable, shallow). Object.seal() prevents adding/removing properties but still allows modifying existing property values.',
    highlights: ['Object.freeze() prevents adding, removing, or…', 'Object.seal() prevents adding/removing properties…'],
  },
  {
    id: 1092, category: 'JavaScript', difficulty: 'Mid',
    question: 'If deleting a property from an object is not working, what could be the possible reasons?',
    answer: 'The property may be non-configurable (defined via Object.defineProperty with configurable:false), the object may be frozen/sealed, or you may be in strict mode attempting to delete a variable rather than a property, which throws instead of silently failing.',
    highlights: ['The property may be non-configurable (defined via…'],
  },
  {
    id: 1093, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is the strict mode (\'use strict\') in JavaScript?',
    answer: '\'use strict\' opts into a restricted variant of JS that throws errors for silent mistakes (assigning to undeclared variables, duplicate parameters), disables \'this\' defaulting to the global object, and disallows some unsafe syntax.',
    highlights: ['\'use strict\' opts into a restricted variant of JS…'],
  },
  {
    id: 1094, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is code splitting in JavaScript?',
    answer: 'Code splitting breaks a large bundle into smaller chunks loaded on demand (via dynamic import()), reducing initial load time by only fetching the code needed for the current route/feature.',
    highlights: ['Code splitting breaks a large bundle into smaller…'],
  },
  {
    id: 1095, category: 'JavaScript', difficulty: 'Mid',
    question: 'What are design patterns in JavaScript? (Singleton, Observer, Factory, Module)',
    answer: 'Singleton ensures one shared instance. Observer lets subscribers react to state/event changes (pub-sub). Factory centralizes object creation logic. Module pattern uses closures/ES modules to encapsulate private state and expose a public API.',
    highlights: ['Singleton ensures one shared instance', 'Observer lets subscribers react to state/event…', 'Factory centralizes object creation logic'],
  },
  {
    id: 1096, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is a generator function in JavaScript?',
    answer: 'function* fn(){ yield 1; yield 2; } returns an iterator that pauses execution at each yield and resumes on the next .next() call — used to lazily produce sequences and to implement custom iteration/async flow control.',
    highlights: ['function* fn(){ yield 1; yield 2; } returns an…', 'used to lazily produce sequences and to implement…'],
  },
  {
    id: 1097, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is a MutationObserver in JavaScript?',
    answer: 'MutationObserver watches a DOM subtree for changes (attributes, child list, text content) and invokes a callback asynchronously — more efficient than the deprecated, synchronous Mutation Events.',
    highlights: ['MutationObserver watches a DOM subtree for changes…', 'more efficient than the deprecated, synchronous…'],
  },
  {
    id: 1098, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is TypeScript? How does it differ from JavaScript?',
    answer: 'TypeScript is a superset of JavaScript adding static typing, interfaces, generics, and compile-time error checking. It compiles down to plain JS, catching bugs before runtime and improving IDE tooling/autocomplete.',
    highlights: ['TypeScript is a superset of JavaScript adding…', 'It compiles down to plain JS, catching bugs before…'],
  },
  {
    id: 1099, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is MERN stack and how do its components work together?',
    answer: 'MongoDB (database) stores data as documents, Express.js (backend framework) builds the REST API on Node.js (JS runtime), and React (frontend library) consumes that API to render the UI — all in JavaScript end-to-end.',
    highlights: ['MongoDB (database) stores data as documents,…', 'all in JavaScript end-to-end'],
  },
  {
    id: 1100, category: 'JavaScript', difficulty: 'Mid',
    question: 'What are array methods and string methods in JavaScript?',
    answer: 'Array: map, filter, reduce, forEach, find, some, every, sort, slice, splice, flat. String: slice, split, trim, replace, includes, padStart, toUpperCase, template literals — most return new values rather than mutating in place (except splice, sort, push on arrays).',
    highlights: ['Array: map, filter, reduce, forEach, find, some,…', 'String: slice, split, trim, replace, includes,…', 'most return new values rather than mutating in…'],
  },
  {
    id: 1101, category: 'JavaScript', difficulty: 'Mid',
    question: 'What are JSON.stringify() and JSON.parse() methods?',
    answer: 'JSON.stringify() converts a JS object/array into a JSON string (for storage or network transfer). JSON.parse() converts a JSON string back into a JS object — together enabling serialization for APIs, localStorage, and config files.',
    highlights: ['JSON.stringify() converts a JS object/array into a…', 'JSON.parse() converts a JSON string back into a JS…', 'together enabling serialization for APIs,…'],
  },
  {
    id: 1102, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is a higher-order function in JavaScript?',
    answer: 'A function that takes another function as an argument, returns a function, or both — e.g. map, filter, reduce, or a custom function like withLogging(fn) that wraps fn with extra behavior.',
    highlights: ['A function that takes another function as an…', 'map, filter, reduce, or a custom function like…'],
  },
  {
    id: 1103, category: 'JavaScript', difficulty: 'Mid',
    question: 'Difference between concurrency and parallelism in JavaScript.',
    answer: 'Concurrency is managing multiple tasks making progress over overlapping time (JS\'s single-threaded event loop interleaves tasks). Parallelism is literally executing tasks simultaneously on multiple cores — JS achieves this only via Worker Threads or separate processes.',
    highlights: ['Concurrency is managing multiple tasks making…', 'Parallelism is literally executing tasks…', 'JS achieves this only via Worker Threads or…'],
  },
  {
    id: 1104, category: 'JavaScript', difficulty: 'Junior',
    question: 'Output question: What is the result of 3 + 4 + \'5\'?',
    answer: '\'75\' — 3+4 evaluates numerically to 7 first (left to right), then 7 + \'5\' triggers string coercion because one operand is a string, producing the concatenated string \'75\'.',
    highlights: ['3+4 evaluates numerically to 7 first (left to…'],
  },
  {
    id: 1105, category: 'JavaScript', difficulty: 'Junior',
    question: 'Output question: What is the output of: typeof {\'a\':\'Hey\'} === typeof [\'a\',\'Hey\']?',
    answer: 'true — both objects and arrays return \'object\' from typeof (arrays are a special kind of object in JS), so the comparison of the two \'object\' strings is true.',
    highlights: ['both objects and arrays return \'object\' from typeof…'],
  },
  {
    id: 1106, category: 'JavaScript', difficulty: 'Junior',
    question: 'Output question: What is the output of: {\'a\':\'b\'} === {\'c\':\'d\'}?',
    answer: 'false — objects are compared by reference, not value/structure. Two separately created object literals are always different references even if their contents matched exactly.',
    highlights: ['objects are compared by reference, not value/structure', 'Two separately created object literals are always…'],
  },
  {
    id: 1107, category: 'JavaScript', difficulty: 'Mid',
    question: 'Output question: What will be the output? (var vs let in setTimeout/for loop)',
    answer: 'With var, all setTimeout callbacks share the same function-scoped \'i\', so after the loop finishes they all log the final value (e.g. 3,3,3). With let, each iteration gets its own block-scoped \'i\' via closures, correctly logging 0,1,2.',
    highlights: ['With var, all setTimeout callbacks share the same…', 'With let, each iteration gets its own block-scoped…'],
  },
  {
    id: 1108, category: 'JavaScript', difficulty: 'Junior',
    question: 'Output question: What is the output of the hoisting example with var num=4, outer(), inner()?',
    answer: 'Function declarations are hoisted with their full body, so calling outer() before its declaration line still works. Any inner var declarations are hoisted as undefined until their assignment line executes, which is a classic source of unexpected undefined logs.',
    highlights: ['Function declarations are hoisted with their full…', 'Any inner var declarations are hoisted as undefined…'],
  },
  {
    id: 1109, category: 'JavaScript', difficulty: 'Mid',
    question: 'Output question: What does an IIFE that immediately returns an arrow function return?',
    answer: 'It returns whatever the arrow function itself returns when invoked — an IIFE like (function(){ return () => 42 })()() first executes the outer function returning the arrow function, then immediately invokes it, yielding 42.',
    highlights: ['It returns whatever the arrow function itself…', 'an IIFE like (function(){ return () => 42 })()()…'],
  },
  {
    id: 1110, category: 'JavaScript', difficulty: 'Mid',
    question: 'Write an arrow function to take two arguments and return their sum.',
    answer: 'const sum = (a, b) => a + b; — the implicit return of an arrow function with no braces returns the expression directly.',
    highlights: ['const sum = (a, b) => a + b;', 'the implicit return of an arrow function with no…'],
  },
  {
    id: 1111, category: 'JavaScript', difficulty: 'Junior',
    question: 'Write a function to reverse a string without using the built-in .reverse() method.',
    answer: 'function reverse(str){ let res=\'\'; for(let i=str.length-1;i>=0;i--) res+=str[i]; return res; } — iterates from the last character backward, or alternatively uses recursion or split/reduce.',
    highlights: ['function reverse(str){ let res=\'\'; for(let…', 'iterates from the last character backward, or…'],
  },
  {
    id: 1112, category: 'JavaScript', difficulty: 'Mid',
    question: 'Write a curried multiplication function: mul(2)(4)(6) = 48.',
    answer: 'const mul = a => b => c => a*b*c; — each call returns a new function accepting the next argument, chaining until all three are supplied and the product is computed.',
    highlights: ['const mul = a => b => c => a*b*c;', 'each call returns a new function accepting the next…'],
  },
  {
    id: 1113, category: 'JavaScript', difficulty: 'Mid',
    question: 'Write a program to multiply two numbers without using the * operator.',
    answer: 'function multiply(a,b){ let result=0; for(let i=0;i<Math.abs(b);i++) result+=Math.abs(a); return b<0 !== a<0 ? -result : result; } — repeated addition, adjusting sign at the end.',
    highlights: ['function multiply(a,b){ let result=0; for(let…', 'repeated addition, adjusting sign at the end'],
  },
  {
    id: 1114, category: 'JavaScript', difficulty: 'Junior',
    question: 'Write a bubble sort program in JavaScript.',
    answer: 'for(let i=0;i<arr.length;i++){ for(let j=0;j<arr.length-i-1;j++){ if(arr[j]>arr[j+1]){ [arr[j],arr[j+1]]=[arr[j+1],arr[j]]; } } } — repeatedly swaps adjacent out-of-order elements, O(n²) time.',
    highlights: ['for(let i=0;i<arr.length;i++){ for(let…', 'repeatedly swaps adjacent out-of-order elements,…'],
  },
  {
    id: 1115, category: 'JavaScript', difficulty: 'Mid',
    question: 'Write a Promise that resolves if value < 5 — then extend it to validate with retry and timeout.',
    answer: `This starts as a simple question but good candidates extend it to show real-world thinking. Start with the basic version, then demonstrate you know how to compose Promises into practical patterns like validation pipelines, retry logic, and timeouts.`,
    code: `// Basic — resolve/reject based on a condition
function validateValue(value) {
  return new Promise((resolve, reject) => {
    if (value < 5) resolve('Valid: ' + value);
    else           reject(new Error('Invalid: ' + value + ' is >= 5'));
  });
}

validateValue(3)
  .then(msg  => console.log(msg))        // 'Valid: 3'
  .catch(err => console.error(err.message));

validateValue(7)
  .then(msg  => console.log(msg))
  .catch(err => console.error(err.message)); // 'Invalid: 7 is >= 5'

// async/await version — same logic, cleaner for multi-step use
async function checkAndProcess(value) {
  try {
    const result = await validateValue(value);
    console.log('Processing:', result);
    return result;
  } catch (err) {
    console.error('Validation failed:', err.message);
    throw err; // re-throw so caller knows
  }
}

// Extended: validate a list, collect all results
async function validateAll(values) {
  const results = await Promise.allSettled(
    values.map(v => validateValue(v))
  );
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') console.log('values[' + i + ']: OK');
    else                          console.log('values[' + i + ']: FAIL -', r.reason.message);
  });
}
validateAll([2, 4, 6, 1, 8]);
// values[0]: OK | values[1]: OK | values[2]: FAIL | values[3]: OK | values[4]: FAIL

// Extended: with timeout — reject if validation takes too long
function validateWithTimeout(value, ms = 1000) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Validation timed out')), ms)
  );
  return Promise.race([validateValue(value), timeout]);
}`,
    highlights: [
      'resolve() for success path, reject(new Error()) for failure — always use Error objects',
      'Promise.allSettled is perfect for validating a list — partial failures acceptable',
      'Promise.race with a timeout Promise is the standard pattern for operation timeouts',
    ],
  },
  {
    id: 1116, category: 'JavaScript', difficulty: 'Mid',
    question: 'Write a program to count element occurrences in an array.',
    answer: 'const counts = arr.reduce((acc, val) => { acc[val] = (acc[val] || 0) + 1; return acc; }, {}); — builds a frequency map in a single pass.',
    highlights: ['const counts = arr.reduce((acc, val) => { acc[val]…', 'builds a frequency map in a single pass'],
  },
  {
    id: 1117, category: 'JavaScript', difficulty: 'Mid',
    question: 'Write a program to remove duplicate items from an array.',
    answer: 'const unique = [...new Set(arr)]; — Set automatically discards duplicate values, then spread converts it back into an array. Alternatively use arr.filter((v,i) => arr.indexOf(v) === i).',
    highlights: ['const unique = [...new Set(arr)];', 'Set automatically discards duplicate values, then…', 'Alternatively use arr.filter((v,i) =>…'],
  },
  {
    id: 1118, category: 'JavaScript', difficulty: 'Mid',
    question: 'Write a program to find duplicates in an array: arr = [1,2,3,4,3,2,9,7,4,9,8,2,4].',
    answer: 'Use a frequency Map counting occurrences, then filter keys with count > 1: const freq={}; arr.forEach(n=>freq[n]=(freq[n]||0)+1); const dups=Object.keys(freq).filter(k=>freq[k]>1).map(Number); → [2,3,4,9].',
    highlights: ['Use a frequency Map counting occurrences, then…'],
  },
  {
    id: 1119, category: 'JavaScript', difficulty: 'Mid',
    question: 'Sort the input array: arr = [8,2,1,4,9]. Expected Output: [1,2,4,8,9].',
    answer: 'arr.sort((a,b)=>a-b) → [1,2,4,8,9]. Note: default .sort() converts to strings and sorts lexicographically, so a numeric comparator is required for correct numeric ordering.',
    highlights: ['arr.sort((a,b)=>a-b) → [1,2,4,8,9]', 'Note: default .sort() converts to strings and sorts…'],
  },
  {
    id: 1120, category: 'JavaScript', difficulty: 'Mid',
    question: 'Find a value 10 in a deeply nested array: [1, [2, 3, [4, 5, [6, 7]]], [8, 9, [10]]].',
    answer: 'Flatten first with arr.flat(Infinity) then use .includes(10), or write a recursive search that checks each element — if it\'s an array, recurse into it; otherwise compare directly to the target.',
    highlights: ['Flatten first with arr.flat(Infinity) then use…', 'if it\'s an array, recurse into it; otherwise…'],
  },
  {
    id: 1121, category: 'JavaScript', difficulty: 'Mid',
    question: 'Write a Fibonacci series using recursion.',
    answer: 'function fib(n){ return n<=1 ? n : fib(n-1)+fib(n-2); } — simple but exponential time; add memoization (a cache object/Map keyed by n) to bring it down to linear time.',
    highlights: ['function fib(n){ return n<=1 ? n : fib(n-1)+fib(n-2); }', 'simple but exponential time; add memoization (a…'],
  },
  {
    id: 1122, category: 'JavaScript', difficulty: 'Mid',
    question: 'Transform an array of objects by renaming keys (e.g., name to username, age to userage).',
    answer: 'arr.map(({name, age, ...rest}) => ({username: name, userage: age, ...rest})); — destructures old keys and rebuilds the object under new key names.',
    highlights: ['arr.map(({name, age, ...rest}) => ({username: name,…', 'destructures old keys and rebuilds the object under…'],
  },
  {
    id: 1123, category: 'JavaScript', difficulty: 'Mid',
    question: 'Convert an array into an object: [1,2,3] -> {\'0\':1,\'1\':2,\'2\':3}. Why are keys strings? What if we want numeric keys?',
    answer: 'Object.assign({}, arr) or {...arr} does this conversion. Object keys are always coerced to strings internally in JS (except Symbols) — if you need numeric keys for math operations, convert with Number(key) when reading.',
    highlights: ['Object.assign({}, arr) or {...arr} does this conversion', 'Object keys are always coerced to strings…', 'if you need numeric keys for math operations,…'],
  },
  {
    id: 1124, category: 'JavaScript', difficulty: 'Mid',
    question: 'Write a polyfill for the reduce() method.',
    answer: 'Array.prototype.myReduce = function(cb, initial){ let acc = initial === undefined ? this[0] : initial; let start = initial === undefined ? 1 : 0; for(let i=start;i<this.length;i++) acc = cb(acc, this[i], i, this); return acc; };',
    highlights: ['Array.prototype.myReduce = function(cb, initial){…'],
  },
  {
    id: 1125, category: 'JavaScript', difficulty: 'Mid',
    question: 'Explain the longest substring without repeating characters problem and solution.',
    answer: 'Use the sliding-window technique with a Set/Map tracking characters in the current window. Expand the right pointer; if a duplicate is found, shrink the left pointer past the previous occurrence — track the max window length seen, O(n) time.',
    highlights: ['Use the sliding-window technique with a Set/Map…', 'Expand the right pointer; if a duplicate is found,…', 'track the max window length seen, O(n) time'],
  },
  {
    id: 1126, category: 'JavaScript', difficulty: 'Mid',
    question: 'DOM manipulation in JavaScript: explain getElementById, classList.add, textContent, element.remove().',
    answer: 'getElementById fetches a single element by its id. classList.add/remove/toggle manages CSS classes without string manipulation. textContent sets/reads an element\'s text (safer than innerHTML, no HTML parsing). element.remove() detaches it from the DOM.',
    highlights: ['getElementById fetches a single element by its id', 'classList.add/remove/toggle manages CSS classes…', 'textContent sets/reads an element\'s text (safer…'],
  },
  {
    id: 1127, category: 'JavaScript', difficulty: 'Mid',
    question: 'Explain control flow in JavaScript: for loop, while loop, if-else, switch, break statement.',
    answer: 'for/while loops repeat code while a condition holds. if-else branches on boolean conditions. switch compares a value against multiple case labels. break exits a loop or switch early, and continue skips to the next iteration.',
    highlights: ['for/while loops repeat code while a condition holds', 'if-else branches on boolean conditions', 'switch compares a value against multiple case labels'],
  },
  {
    id: 1128, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is the Fetch API in JavaScript? Explain GET vs POST requests, JSON, and CORS.',
    answer: 'fetch(url) returns a Promise resolving to a Response object. GET retrieves data (no body); POST sends a body (JSON.stringify(data)) with headers {\'Content-Type\':\'application/json\'}. CORS is the browser security policy controlling which cross-origin requests a server permits.',
    highlights: ['fetch(url) returns a Promise resolving to a…', 'GET retrieves data (no body); POST sends a body…', 'CORS is the browser security policy controlling…'],
  },
  {
    id: 1129, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is the difference between setTimeout() and setInterval() in JavaScript?',
    answer: 'setTimeout() runs a callback once after a delay. setInterval() runs a callback repeatedly at a fixed interval until cleared with clearInterval(). Both are macrotasks handled in the timers phase of the event loop.',
    highlights: ['setTimeout() runs a callback once after a delay', 'setInterval() runs a callback repeatedly at a fixed…', 'Both are macrotasks handled in the timers phase of…'],
  },
  {
    id: 1130, category: 'JavaScript', difficulty: 'Mid',
    question: 'How many ways can you create an object in JavaScript? (object literal, constructor, Object.create, class)',
    answer: 'Object literal ({}), constructor function (new Foo()), Object.create(proto) for explicit prototype linking, ES6 class syntax (new class Foo{}), and Object.assign({}, source) for cloning/merging.',
    highlights: ['Object literal ({}), constructor function (new…'],
  },
  {
    id: 1131, category: 'JavaScript', difficulty: 'Mid',
    question: 'What are the limitations of arrow functions vs regular functions? (no \'this\' binding, no \'arguments\' object, cannot be used as constructors)',
    answer: 'Arrow functions can\'t be used as object constructors, don\'t have their own \'this\' or \'arguments\' object (both inherited from the enclosing scope), and can\'t be used with call/apply/bind to rebind \'this\'.',
    highlights: ['Arrow functions can\'t be used as object…'],
  },
  {
    id: 1132, category: 'JavaScript', difficulty: 'Mid',
    question: 'Explain the concept of Symbol in JavaScript and when would you use it?',
    answer: 'Symbol() creates a guaranteed-unique primitive value, often used as a non-colliding object property key (for private-ish fields or well-known protocol hooks like Symbol.iterator) that won\'t clash with string keys.',
    highlights: ['Symbol() creates a guaranteed-unique primitive…'],
  },
  {
    id: 1133, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is the Proxy object in JavaScript? Explain use cases.',
    answer: 'new Proxy(target, handler) intercepts and customizes fundamental operations on an object (get, set, deleteProperty, has) via traps — used for validation, logging, reactive state (Vue\'s reactivity system uses Proxies), and access control.',
    highlights: ['new Proxy(target, handler) intercepts and…', 'used for validation, logging, reactive state (Vue\'s…'],
  },
  {
    id: 1134, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is the difference between synchronous and asynchronous JavaScript?',
    answer: 'Synchronous code executes line by line, blocking further execution until the current line finishes. Asynchronous code (callbacks, Promises, async/await) lets long-running operations (I/O, timers, network) run in the background without blocking the main thread.',
    highlights: ['Synchronous code executes line by line, blocking…', 'Asynchronous code (callbacks, Promises,…'],
  },
  {
    id: 1135, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is a tagged template literal in JavaScript?',
    answer: 'A function placed before a template literal (fn`Hello ${name}`) receives the string parts and interpolated values as separate arguments, allowing custom processing — used by libraries like styled-components to parse CSS.',
    highlights: ['A function placed before a template literal…', 'used by libraries like styled-components to parse CSS'],
  },
  {
    id: 1136, category: 'JavaScript', difficulty: 'Mid',
    question: 'Explain the \'new\' keyword and what it does internally when creating an object.',
    answer: '\'new Foo()\' creates a fresh empty object, sets its [[Prototype]] to Foo.prototype, executes Foo with \'this\' bound to that object, and returns the object (unless Foo explicitly returns another object).',
    highlights: ['\'new Foo()\' creates a fresh empty object, sets its…'],
  },
  {
    id: 1137, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is the difference between \'==\' and \'===\' in JavaScript?',
    answer: '== performs type coercion before comparing (e.g. \'5\' == 5 is true). === (strict equality) compares both value and type without coercion (e.g. \'5\' === 5 is false) — always prefer === to avoid coercion surprises.',
    highlights: ['== performs type coercion before comparing (e.g', '\'5\' == 5 is true)', '=== (strict equality) compares both value and type…'],
  },
  {
    id: 1138, category: 'JavaScript', difficulty: 'Mid',
    question: 'How does JavaScript handle memory management and garbage collection?',
    answer: 'JS engines use automatic garbage collection, primarily \'mark-and-sweep\': objects reachable from the global scope/roots are kept, unreachable objects are freed. Memory leaks still occur via forgotten timers, detached DOM references, or unremoved event listeners.',
    highlights: ['JS engines use automatic garbage collection,…', 'Memory leaks still occur via forgotten timers,…'],
  },
  {
    id: 1139, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is a Service Worker in JavaScript? How is it used in PWAs?',
    answer: 'A Service Worker is a background script that intercepts network requests, enabling offline caching, push notifications, and background sync — the core technology behind installable Progressive Web Apps.',
    highlights: ['A Service Worker is a background script that…', 'the core technology behind installable Progressive…'],
  },
  {
    id: 1140, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is IndexedDB and how does it compare to localStorage?',
    answer: 'IndexedDB is an asynchronous, transactional, object-oriented database in the browser supporting large structured data, indexes, and querying. localStorage is synchronous, string-only, and limited to ~5-10MB — IndexedDB is preferred for large or complex client-side datasets.',
    highlights: ['IndexedDB is an asynchronous, transactional,…', 'localStorage is synchronous, string-only, and…', 'IndexedDB is preferred for large or complex…'],
  },
  {
    id: 1141, category: 'JavaScript', difficulty: 'Mid',
    question: 'Build an offline-first UI using IndexedDB, sync recovery, retry handling, and conflict management.',
    answer: 'Write all user actions to IndexedDB first (optimistic local state), queue a background sync job per change, retry with exponential backoff on network failure, and resolve conflicts with a strategy like last-write-wins or version vectors when reconnecting to the server.',
    highlights: ['Write all user actions to IndexedDB first…'],
  },

  // ─── REACT (from Interview Masterpack) ───

  {
    id: 1142, category: 'React', difficulty: 'Junior',
    question: 'What is React? How is it different from other libraries/frameworks like Angular?',
    answer: 'React is a declarative, component-based UI library focused purely on the view layer, using a virtual DOM for efficient updates. Angular is a full opinionated framework (routing, DI, forms built-in) using real DOM with two-way data binding — React is lighter and more flexible, requiring you to choose supporting libraries.',
    code: `// React component example\nimport React from 'react';\n\nfunction Counter() {\n  const [count, setCount] = React.useState(0);\n  \n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>\n        Increment\n      </button>\n    </div>\n  );\n}\n\nexport default Counter;`,
    highlights: ['React is a declarative, component-based UI library…', 'Angular is a full opinionated framework (routing,…', 'React is lighter and more flexible, requiring you…'],
  },
  {
    id: 1143, category: 'React', difficulty: 'Junior',
    question: 'What is JSX? What is the difference between JSX and TSX?',
    answer: 'JSX is a syntax extension letting you write HTML-like markup inside JavaScript, compiled by Babel into React.createElement() calls. TSX is the same thing written in TypeScript files, adding type-checking for props and component signatures.',
    highlights: ['JSX is a syntax extension letting you write…', 'TSX is the same thing written in TypeScript files,…'],
  },
  {
    id: 1144, category: 'React', difficulty: 'Mid',
    question: 'What are the different types of components in React?',
    answer: 'Functional components (Hooks-based, the modern default), class components (legacy, lifecycle methods), presentational/dumb components (pure UI, no logic), container/smart components (manage state and data fetching), and higher-order components (wrap other components with shared logic).',
    code: `// Functional component with Hooks\nfunction UserProfile({ userId }) {\n  const [user, setUser] = React.useState(null);\n  \n  React.useEffect(() => {\n    fetch(\`/api/users/\${userId}\`)\n      .then(res => res.json())\n      .then(data => setUser(data));\n  }, [userId]);\n  \n  return user ? <h1>{user.name}</h1> : <p>Loading...</p>;\n}\n\n// Class component (legacy)\nclass Counter extends React.Component {\n  state = { count: 0 };\n  render() {\n    return <button onClick={() => this.setState({count: this.state.count + 1})}>\n      Count: {this.state.count}\n    </button>;\n  }\n}`,
    highlights: ['Functional components (Hooks-based, the modern…'],
  },
  {
    id: 1145, category: 'React', difficulty: 'Mid',
    question: 'How does React compare virtual DOM with real DOM? (Reconciliation / Diffing algorithm)',
    answer: 'React\'s reconciliation algorithm compares the new virtual DOM tree to the previous one level by level, assuming elements of the same type produce similar trees, and uses keys to efficiently match list items — computing a minimal set of real DOM mutations instead of re-rendering everything.',
    highlights: ['React\'s reconciliation algorithm compares the new…', 'computing a minimal set of real DOM mutations…'],
  },
  {
    id: 1146, category: 'React', difficulty: 'Mid',
    question: 'How does React update the page using the Virtual DOM?',
    answer: 'On a state/prop change, React re-renders the component to produce a new virtual DOM tree, diffs it against the previous tree (reconciliation), computes the minimal patch, and commits only those specific changes to the real DOM in a batched update.',
    highlights: ['On a state/prop change, React re-renders the…'],
  },
  {
    id: 1147, category: 'React', difficulty: 'Senior',
    question: 'What is React Fiber?',
    answer: 'Fiber is React\'s internal reconciliation engine (since React 16) that breaks rendering work into interruptible units, enabling prioritization, pausing, resuming, and concurrent features like Suspense and time-slicing, instead of the old synchronous, non-interruptible stack reconciler.',
    highlights: ['Fiber is React\'s internal reconciliation engine…'],
  },
  {
    id: 1148, category: 'React', difficulty: 'Junior',
    question: 'What is state in React? How does re-rendering happen when state changes?',
    answer: 'State is data local to a component that can change over time. Calling its setter (via useState/useReducer) schedules a re-render — React re-invokes the component function, diffs the new virtual DOM output, and updates only the changed real DOM nodes.',
    highlights: ['State is data local to a component that can change…', 'Calling its setter (via useState/useReducer)…', 'React re-invokes the component function, diffs the…'],
  },
  {
    id: 1149, category: 'React', difficulty: 'Mid',
    question: 'What happens if you try to update state directly in React?',
    answer: 'Mutating state directly (e.g. this.state.x = 5 or pushing into a state array) does NOT trigger a re-render because React doesn\'t know a change occurred — you must always use the setter function (setState/setX) with a new reference.',
    highlights: ['Mutating state directly (e.g', 'this.state.x = 5 or pushing into a state array)…', 'you must always use the setter function…'],
  },
  {
    id: 1150, category: 'React', difficulty: 'Mid',
    question: 'Can you pass props from child to parent component in React?',
    answer: 'Not directly (data flows one-way, top-down), but the parent can pass a callback function as a prop, which the child invokes with data — effectively \'lifting\' information back up to the parent.',
    highlights: ['Not directly (data flows one-way, top-down), but…', 'effectively \'lifting\' information back up to the parent'],
  },
  {
    id: 1151, category: 'React', difficulty: 'Mid',
    question: 'How do you handle events in React? How do you pass arguments to an event handler?',
    answer: 'Attach handlers via camelCase props (onClick={handleClick}). To pass arguments, wrap in an inline arrow function: onClick={() => handleClick(id)} — avoids invoking the function immediately during render.',
    highlights: ['Attach handlers via camelCase props…', 'To pass arguments, wrap in an inline arrow…', 'avoids invoking the function immediately during render'],
  },
  {
    id: 1152, category: 'React', difficulty: 'Junior',
    question: 'What is one-way data binding in React?',
    answer: 'Data flows in a single direction: from parent state down to child props. Children can\'t directly modify parent data; they must call a callback passed down as a prop to request a change, keeping data flow predictable.',
    highlights: ['Data flows in a single direction: from parent state…', 'Children can\'t directly modify parent data; they…'],
  },
  {
    id: 1153, category: 'React', difficulty: 'Mid',
    question: 'How do you share data among sibling components?',
    answer: 'Lift the shared state up to their nearest common parent, then pass it down as props to both siblings (with a callback for updates) — or use Context/a global store if the sharing spans many levels.',
    highlights: ['Lift the shared state up to their nearest common…', 'or use Context/a global store if the sharing spans…'],
  },
  {
    id: 1154, category: 'React', difficulty: 'Junior',
    question: 'What is conditional rendering in React? Explain with examples.',
    answer: 'Rendering different JSX based on a condition: ternary ({isLoggedIn ? <Dashboard/> : <Login/>}), logical && ({error && <ErrorMsg/>}), or early returns (if(!data) return <Spinner/>).',
    highlights: ['Rendering different JSX based on a condition:…'],
  },
  {
    id: 1155, category: 'React', difficulty: 'Mid',
    question: 'How do functional components handle lifecycle methods? (useEffect)',
    answer: 'useEffect(() => {...}, [deps]) replaces lifecycle methods: an empty dependency array mimics componentDidMount, deps present mimics componentDidUpdate for those values, and a returned cleanup function mimics componentWillUnmount.',
    highlights: ['useEffect(() => {...}, [deps]) replaces lifecycle…'],
  },
  {
    id: 1156, category: 'React', difficulty: 'Mid',
    question: 'How do you handle side effects in class and functional components?',
    answer: 'Class components perform side effects (data fetching, subscriptions) in componentDidMount/componentDidUpdate and clean up in componentWillUnmount. Functional components use useEffect with a cleanup function returned from the effect callback.',
    highlights: ['Class components perform side effects (data…', 'Functional components use useEffect with a cleanup…'],
  },
  {
    id: 1157, category: 'React', difficulty: 'Mid',
    question: 'How do you implement componentWillUnmount behavior in a functional component?',
    answer: 'Return a cleanup function from inside useEffect: useEffect(() => { const sub = subscribe(); return () => sub.unsubscribe(); }, []); — React calls the returned function automatically when the component unmounts.',
    highlights: ['Return a cleanup function from inside useEffect:…', 'React calls the returned function automatically…'],
  },
  {
    id: 1158, category: 'React', difficulty: 'Mid',
    question: 'What are React Hooks? List hooks you have used.',
    answer: 'Hooks let functional components use state and lifecycle features without classes. Commonly used: useState, useEffect, useContext, useRef, useMemo, useCallback, useReducer, and custom hooks built from these primitives.',
    highlights: ['Hooks let functional components use state and…', 'Commonly used: useState, useEffect, useContext,…'],
  },
  {
    id: 1159, category: 'React', difficulty: 'Mid',
    question: 'Types of React Hooks — list all built-in hooks.',
    answer: 'State: useState, useReducer. Effect: useEffect, useLayoutEffect. Context: useContext. Ref: useRef, useImperativeHandle. Performance: useMemo, useCallback, useTransition, useDeferredValue. Other: useId, useSyncExternalStore, useDebugValue.',
    highlights: ['State: useState, useReducer', 'Effect: useEffect, useLayoutEffect', 'Context: useContext'],
  },
  {
    id: 1160, category: 'React', difficulty: 'Mid',
    question: 'Can React Hooks replace Redux? When should each be used?',
    answer: 'useState/useReducer + useContext can manage small-to-medium shared state without Redux. Redux (or Zustand/Redux Toolkit) is preferable for large apps needing predictable global state, middleware (logging, async flows), time-travel debugging, and devtools across many disconnected components.',
    highlights: ['useState/useReducer + useContext can manage…', 'Redux (or Zustand/Redux Toolkit) is preferable for…'],
  },
  {
    id: 1161, category: 'React', difficulty: 'Mid',
    question: 'What are the rules of Hooks?',
    answer: 'Only call Hooks at the top level of a function component or custom hook (never inside loops, conditions, or nested functions), and only call them from React function components or other custom hooks — this preserves call-order consistency across renders.',
    highlights: ['Only call Hooks at the top level of a function…', 'this preserves call-order consistency across renders'],
  },
  {
    id: 1162, category: 'React', difficulty: 'Junior',
    question: 'What is useState? Difference between useState and useRef in form handling.',
    answer: 'useState triggers a re-render whenever its setter is called, ideal for values that affect the UI. useRef stores a mutable value across renders WITHOUT triggering a re-render — useful for uncontrolled form fields or storing values you don\'t need reflected in the UI.',
    highlights: ['useState triggers a re-render whenever its setter…', 'useRef stores a mutable value across renders…', 'useful for uncontrolled form fields or storing…'],
  },
  {
    id: 1163, category: 'React', difficulty: 'Junior',
    question: 'What is useRef? Give use cases (DOM access, storing mutable values).',
    answer: 'useRef(initialValue) returns a mutable .current object that persists across renders without causing re-renders — used for direct DOM node access (inputRef.current.focus()) or storing previous values/timers/instance variables.',
    highlights: ['useRef(initialValue) returns a mutable .current…', 'used for direct DOM node access…'],
  },
  {
    id: 1164, category: 'React', difficulty: 'Junior',
    question: 'What is useContext? Explain with an example.',
    answer: 'useContext(MyContext) reads the nearest matching <MyContext.Provider value={...}> above it in the tree, letting deeply nested components consume shared data (theme, auth user) without prop drilling.',
    highlights: ['useContext(MyContext) reads the nearest matching…'],
  },
  {
    id: 1165, category: 'React', difficulty: 'Senior',
    question: 'What is useTransition() hook in React 18?',
    answer: 'const [isPending, startTransition] = useTransition(); marks a state update as non-urgent (\'transition\'), letting React interrupt it to keep urgent updates (like typing) responsive while showing isPending for a loading indicator.',
    highlights: ['const [isPending, startTransition] =…'],
  },
  {
    id: 1166, category: 'React', difficulty: 'Junior',
    question: 'What is useDeferredValue() hook?',
    answer: 'useDeferredValue(value) returns a lagging copy of a value that updates at lower priority, letting expensive re-renders (e.g. a large filtered list) catch up in the background without blocking more urgent UI updates like keystrokes.',
    highlights: ['useDeferredValue(value) returns a lagging copy of a…', 'a large filtered list) catch up in the background…'],
  },
  {
    id: 1167, category: 'React', difficulty: 'Junior',
    question: 'What is useSyncExternalStore()?',
    answer: 'A hook for safely subscribing React components to external (non-React) data stores (like a custom store or browser APIs), ensuring consistent reads even under React 18\'s concurrent rendering — the primitive underlying libraries like Redux\'s useSelector.',
    highlights: ['A hook for safely subscribing React components to…', 'the primitive underlying libraries like Redux\'s…'],
  },
  {
    id: 1168, category: 'React', difficulty: 'Junior',
    question: 'What is useImperativeHandle and forwardRef()?',
    answer: 'forwardRef lets a parent pass a ref down to access a child\'s DOM node/instance. useImperativeHandle customizes exactly what that ref exposes to the parent, instead of the raw DOM node — used to build imperative APIs like a custom video player\'s play()/pause().',
    highlights: ['forwardRef lets a parent pass a ref down to access…', 'useImperativeHandle customizes exactly what that…', 'used to build imperative APIs like a custom video…'],
  },
  {
    id: 1169, category: 'React', difficulty: 'Mid',
    question: 'What are custom hooks? Have you built one? Provide an example.',
    answer: 'A custom hook is a JS function starting with \'use\' that composes built-in hooks to share reusable stateful logic across components. Example: function useToggle(initial=false){ const [on,setOn]=useState(initial); return [on, ()=>setOn(o=>!o)]; }',
    highlights: ['A custom hook is a JS function starting with \'use\'…', 'Example: function useToggle(initial=false){ const…'],
  },
  {
    id: 1170, category: 'React', difficulty: 'Mid',
    question: 'Build a reusable useFetch custom hook with loading states, error handling, request cancellation, and caching.',
    answer: 'Use useEffect with an AbortController: create it, pass its signal to fetch, and call controller.abort() in the cleanup function on unmount or URL change; track loading/error/data in state, and optionally cache responses in a module-level Map keyed by URL.',
    highlights: ['Use useEffect with an AbortController: create it,…'],
  },
  {
    id: 1171, category: 'React', difficulty: 'Mid',
    question: 'What are render props in React?',
    answer: 'A pattern where a component accepts a function as a prop (or children) that it calls with internal data/state, letting the consumer decide how to render it: <DataProvider render={data => <Chart data={data}/>} /> — largely superseded by hooks today.',
    highlights: ['A pattern where a component accepts a function as a…', 'largely superseded by hooks today'],
  },
  {
    id: 1172, category: 'React', difficulty: 'Junior',
    question: 'What is the Context API? Difference between Context API and Redux.',
    answer: 'Context API provides built-in dependency injection for passing data through the tree without props. Redux adds a single global immutable store, predictable reducers, middleware for async logic, and devtools/time-travel — better suited to large, complex state graphs than plain Context.',
    highlights: ['Context API provides built-in dependency injection…', 'Redux adds a single global immutable store,…', 'better suited to large, complex state graphs than…'],
  },
  {
    id: 1173, category: 'React', difficulty: 'Junior',
    question: 'What is a reducer, action, and store in Redux?',
    answer: 'An action is a plain object {type, payload} describing an event. A reducer is a pure function (state, action) => newState. The store holds the single source of truth state and exposes dispatch/getState/subscribe.',
    highlights: ['An action is a plain object {type, payload}…', 'A reducer is a pure function (state, action) =>…', 'The store holds the single source of truth state…'],
  },
  {
    id: 1174, category: 'React', difficulty: 'Junior',
    question: 'What is Redux Toolkit? How does it simplify Redux?',
    answer: 'Redux Toolkit (RTK) is the official, opinionated Redux setup that reduces boilerplate: createSlice auto-generates action creators/reducers, configureStore sets up devtools/middleware by default, and it uses Immer internally so you can write \'mutating\' logic that\'s actually applied immutably.',
    highlights: ['Redux Toolkit (RTK) is the official, opinionated…'],
  },
  {
    id: 1175, category: 'React', difficulty: 'Mid',
    question: 'How would you implement global state without Redux?',
    answer: 'Combine useContext + useReducer for a lightweight global store, or use a minimal library like Zustand or Jotai — both offer global state with far less boilerplate than Redux for small-to-medium apps.',
    highlights: ['Combine useContext + useReducer for a lightweight…', 'both offer global state with far less boilerplate…'],
  },
  {
    id: 1176, category: 'React', difficulty: 'Junior',
    question: 'What is React Query (TanStack Query)?',
    answer: 'A server-state management library handling data fetching, caching, background refetching, request deduplication, and pagination out of the box — separating \'server state\' concerns from client UI state, reducing the need for Redux for API data.',
    highlights: ['A server-state management library handling data…', 'separating \'server state\' concerns from client UI…'],
  },
  {
    id: 1177, category: 'React', difficulty: 'Mid',
    question: 'What are React keys and why are they important in lists?',
    answer: 'key is a stable, unique identifier React uses to track which list items changed, were added, or removed across re-renders, enabling correct and efficient reconciliation — using array index as a key can cause bugs when the list reorders.',
    highlights: ['key is a stable, unique identifier React uses to…', 'using array index as a key can cause bugs when the…'],
  },
  {
    id: 1178, category: 'React', difficulty: 'Junior',
    question: 'What is React.memo() and how does it work?',
    answer: 'React.memo(Component) wraps a functional component to skip re-rendering if its props are shallowly equal to the previous render — a performance optimization similar to PureComponent for class components.',
    highlights: ['React.memo(Component) wraps a functional component…', 'a performance optimization similar to PureComponent…'],
  },
  {
    id: 1179, category: 'React', difficulty: 'Junior',
    question: 'What is a React Pure Component? Explain roles and use cases.',
    answer: 'PureComponent automatically implements shouldComponentUpdate with a shallow prop/state comparison, skipping re-renders when nothing meaningfully changed — useful for optimizing class components that receive the same props repeatedly.',
    highlights: ['PureComponent automatically implements…', 'useful for optimizing class components that receive…'],
  },
  {
    id: 1180, category: 'React', difficulty: 'Junior',
    question: 'What is virtualization (windowing) in React? How do you optimize large lists?',
    answer: 'Virtualization renders only the list items currently visible in the viewport (plus a small buffer), recycling DOM nodes as the user scrolls — drastically reducing DOM node count for huge lists, implemented via libraries like react-window or react-virtualized.',
    highlights: ['Virtualization renders only the list items…', 'drastically reducing DOM node count for huge lists,…'],
  },
  {
    id: 1181, category: 'React', difficulty: 'Mid',
    question: 'Build a virtualized infinite table in React (rendering optimization, large dataset handling).',
    answer: 'Use a fixed-height container with absolute-positioned rows calculated from scrollTop and a known row height, rendering only rows within the visible range plus overscan buffer, and trigger a fetch-more callback when the scroll nears the bottom.',
    highlights: ['Use a fixed-height container with…'],
  },
  {
    id: 1182, category: 'React', difficulty: 'Mid',
    question: 'How do you avoid unnecessary re-rendering in React?',
    answer: 'Use React.memo/PureComponent, useCallback/useMemo to stabilize references, split state so unrelated updates don\'t cascade, avoid inline object/array literals as props, and use keys correctly in lists.',
    highlights: ['Use React.memo/PureComponent, useCallback/useMemo…'],
  },
  {
    id: 1183, category: 'React', difficulty: 'Mid',
    question: 'How do you optimize a slow/badly written React app? (debug, profile, reduce re-renders)',
    answer: 'Use React DevTools Profiler to find components re-rendering unnecessarily, apply memoization (memo/useMemo/useCallback), code-split with React.lazy, virtualize long lists, debounce expensive input handlers, and check for unstable prop references causing cascading renders.',
    highlights: ['Use React DevTools Profiler to find components…'],
  },
  {
    id: 1184, category: 'React', difficulty: 'Junior',
    question: 'What is the purpose of error boundaries in React?',
    answer: 'An error boundary (a class component implementing componentDidCatch/getDerivedStateFromError) catches JS errors thrown anywhere in its child component tree during rendering, preventing the entire app from crashing and showing a fallback UI instead.',
    highlights: ['An error boundary (a class component implementing…'],
  },
  {
    id: 1185, category: 'React', difficulty: 'Mid',
    question: 'How do you handle errors in asynchronous operations in React?',
    answer: 'Wrap async calls in try/catch inside useEffect or event handlers, store error state, and conditionally render an error UI — error boundaries alone do NOT catch errors inside async callbacks or event handlers, only render-phase errors.',
    highlights: ['Wrap async calls in try/catch inside useEffect or…', 'error boundaries alone do NOT catch errors inside…'],
  },
  {
    id: 1186, category: 'React', difficulty: 'Mid',
    question: 'How do you fetch data in React? Explain with examples.',
    answer: 'useEffect(() => { fetch(url).then(r=>r.json()).then(setData).catch(setError); }, [url]); — or use a data-fetching library like React Query/SWR which adds caching, retries, and loading states automatically.',
    highlights: ['useEffect(() => {…', 'or use a data-fetching library like React Query/SWR…'],
  },
  {
    id: 1187, category: 'React', difficulty: 'Mid',
    question: 'How do you call APIs in React? Explain with useEffect.',
    answer: 'Trigger the API call inside useEffect with the relevant dependencies (e.g. an id), track loading/error/data via useState, and clean up in-flight requests (AbortController) if the component unmounts or dependencies change before the response arrives.',
    highlights: ['Trigger the API call inside useEffect with the…', 'an id), track loading/error/data via useState, and…'],
  },
  {
    id: 1188, category: 'React', difficulty: 'Junior',
    question: 'What is Axios? How is it different from the Fetch API?',
    answer: 'Axios is a third-party HTTP client with automatic JSON transformation, request/response interceptors, built-in timeout support, and automatic rejection on HTTP error status codes — Fetch requires manual JSON parsing and doesn\'t reject on 4xx/5xx by default.',
    highlights: ['Axios is a third-party HTTP client with automatic…', 'Fetch requires manual JSON parsing and doesn\'t…'],
  },
  {
    id: 1189, category: 'React', difficulty: 'Mid',
    question: 'How do you securely store API keys in React?',
    answer: 'Never embed secret keys in frontend code (anything bundled is publicly visible). Keep sensitive keys server-side and proxy requests through your own backend; only non-sensitive, public keys should live in frontend env variables.',
    highlights: ['Never embed secret keys in frontend code (anything…', 'Keep sensitive keys server-side and proxy requests…'],
  },
  {
    id: 1190, category: 'React', difficulty: 'Mid',
    question: 'How would you implement retry logic for failed API requests in React?',
    answer: 'Wrap the fetch call in a retry helper with exponential backoff (retry N times, doubling delay each attempt), and surface a final error state to the UI if all retries are exhausted, ideally paired with a manual \'retry\' button for the user.',
    highlights: ['Wrap the fetch call in a retry helper with…'],
  },
  {
    id: 1191, category: 'React', difficulty: 'Senior',
    question: 'How do you identify and fix memory leaks in React?',
    answer: 'Common causes: forgotten event listeners, timers, or subscriptions not cleaned up in useEffect\'s return function, and setting state after unmount. Use the Chrome Performance/Memory profiler to spot detached DOM nodes and growing heap snapshots over time.',
    highlights: ['Common causes: forgotten event listeners, timers,…', 'Use the Chrome Performance/Memory profiler to spot…'],
  },
  {
    id: 1192, category: 'React', difficulty: 'Mid',
    question: 'How do you build a React application for production?',
    answer: 'Run the build command (npm run build / vite build) to produce a minified, tree-shaken, hashed-filename bundle; then serve the static output via a CDN or static file server, with environment-specific config injected at build time.',
    highlights: ['Run the build command (npm run build / vite build)…'],
  },
  {
    id: 1193, category: 'React', difficulty: 'Junior',
    question: 'What is the major difference between Webpack and Babel?',
    answer: 'Webpack is a module bundler — it combines files/assets into optimized output bundles. Babel is a transpiler — it converts modern/JSX/TS syntax into plain, browser-compatible JavaScript. Webpack typically invokes Babel as a loader during the bundling process.',
    highlights: ['Webpack is a module bundler', 'it combines files/assets into optimized output bundles', 'Babel is a transpiler'],
  },
  {
    id: 1194, category: 'React', difficulty: 'Mid',
    question: 'How do you optimize a React application for performance?',
    answer: 'Code-split with React.lazy/Suspense, memoize expensive components/values, virtualize long lists, debounce/throttle expensive handlers, optimize images and bundle size, and use production builds with tree-shaking.',
    highlights: ['Code-split with React.lazy/Suspense, memoize…'],
  },
  {
    id: 1195, category: 'React', difficulty: 'Mid',
    question: 'What techniques would you use to improve Core Web Vitals?',
    answer: 'Improve LCP by optimizing/preloading hero images and reducing server response time; improve CLS by reserving space for images/ads and avoiding layout-shifting fonts; improve INP by breaking up long JS tasks and deferring non-critical scripts.',
    highlights: ['Improve LCP by optimizing/preloading hero images…'],
  },
  {
    id: 1196, category: 'React', difficulty: 'Mid',
    question: 'Explain frontend caching strategies.',
    answer: 'Browser HTTP caching (Cache-Control headers), service-worker caching for offline assets, in-memory caching for API responses (React Query/SWR), and CDN edge caching for static assets — each targets a different layer of repeat-visit performance.',
    highlights: ['Browser HTTP caching (Cache-Control headers),…', 'each targets a different layer of repeat-visit…'],
  },
  {
    id: 1197, category: 'React', difficulty: 'Junior',
    question: 'What is the purpose of the .env file in React?',
    answer: 'Stores environment-specific configuration (API base URLs, feature flags) outside source code. Variables must be prefixed (e.g. REACT_APP_ or VITE_) to be exposed to the client bundle, and anything included is publicly visible — never store real secrets there.',
    highlights: ['Stores environment-specific configuration (API base…', 'Variables must be prefixed (e.g', 'REACT_APP_ or VITE_) to be exposed to the client…'],
  },
  {
    id: 1198, category: 'React', difficulty: 'Junior',
    question: 'What is a styled component? Have you implemented theming in React?',
    answer: 'styled-components lets you write actual CSS inside tagged template literals scoped to a component, generating unique class names automatically. Theming is implemented via a <ThemeProvider theme={...}> wrapping the app, letting styled components read theme values via props.',
    highlights: ['styled-components lets you write actual CSS inside…', 'Theming is implemented via a <ThemeProvider…'],
  },
  {
    id: 1199, category: 'React', difficulty: 'Senior',
    question: 'What is a React Server Component? Explain its advantages.',
    answer: 'Server Components render entirely on the server, sending only HTML/serialized output to the client with zero client-side JS bundle cost — reducing bundle size, enabling direct backend/database access, and improving initial load performance for content-heavy pages.',
    highlights: ['Server Components render entirely on the server,…', 'reducing bundle size, enabling direct…'],
  },
  {
    id: 1200, category: 'React', difficulty: 'Senior',
    question: 'What is Next.js and what are Server Components vs Client Components?',
    answer: 'Next.js is a React framework providing file-based routing, SSR/SSG, and API routes. Server Components (default in the App Router) render on the server with no client JS shipped; Client Components (marked \'use client\') run in the browser and support interactivity/hooks.',
    highlights: ['Next.js is a React framework providing file-based…', 'Server Components (default in the App Router)…'],
  },
  {
    id: 1201, category: 'React', difficulty: 'Senior',
    question: 'Can we use a Server Component inside a Client Component and vice versa in Next.js?',
    answer: 'A Client Component can render a Server Component only if it\'s passed down as a \'children\' prop from a parent Server Component — you cannot directly import a Server Component inside a Client Component\'s own render. A Server Component CAN directly import and render a Client Component.',
    highlights: ['A Client Component can render a Server Component…', 'you cannot directly import a Server Component…', 'A Server Component CAN directly import and render a…'],
  },
  {
    id: 1202, category: 'React', difficulty: 'Senior',
    question: 'Why do we need Client Components if Server Components exist in Next.js?',
    answer: 'Server Components can\'t use state, effects, event handlers, or browser-only APIs — anything interactive (forms, click handlers, useState) must be a Client Component, so most real apps mix both strategically.',
    highlights: ['Server Components can\'t use state, effects, event…', 'anything interactive (forms, click handlers,…'],
  },
  {
    id: 1203, category: 'React', difficulty: 'Mid',
    question: 'How do you handle dynamic routing in React?',
    answer: 'With React Router: <Route path="/users/:id" element={<UserPage/>}/>, then read the param via useParams(). In Next.js, dynamic routing is file-based: app/users/[id]/page.js automatically maps to /users/123.',
    highlights: ['With React Router: <Route path="/users/:id"…', 'In Next.js, dynamic routing is file-based:…'],
  },
  {
    id: 1204, category: 'React', difficulty: 'Junior',
    question: 'What is Routing in React.js?',
    answer: 'Routing maps URL paths to specific components/views, enabling multi-page-like navigation in a single-page app without full page reloads — implemented via React Router (<BrowserRouter>, <Routes>, <Route>) or a framework\'s built-in router (Next.js).',
    highlights: ['Routing maps URL paths to specific…', 'implemented via React Router (<BrowserRouter>,…'],
  },
  {
    id: 1205, category: 'React', difficulty: 'Mid',
    question: 'How do you manage form validation in React?',
    answer: 'Manually validate onChange/onSubmit with conditional logic and error state, or use a form library like React Hook Form (uncontrolled, performant, less re-rendering) or Formik combined with a schema validator like Yup or Zod.',
    highlights: ['Manually validate onChange/onSubmit with…'],
  },
  {
    id: 1206, category: 'React', difficulty: 'Mid',
    question: 'How do you create a basic form in React and submit it to a backend?',
    answer: 'Track input values in state (or use React Hook Form), call e.preventDefault() in the submit handler, then send the data via fetch/axios as a POST request with a JSON body to your API endpoint.',
    highlights: ['Track input values in state (or use React Hook…'],
  },
  {
    id: 1207, category: 'React', difficulty: 'Mid',
    question: 'How would you implement lazy loading with routes?',
    answer: 'const About = React.lazy(() => import(\'./About\')); wrap the route tree in <Suspense fallback={<Spinner/>}>, so each route\'s code is only downloaded when the user actually navigates to it, shrinking the initial bundle.',
    highlights: ['const About = React.lazy(() => import(\'./About\'));…'],
  },
  {
    id: 1208, category: 'React', difficulty: 'Mid',
    question: 'How do you optimize forms with hundreds of input fields in React?',
    answer: 'Use uncontrolled inputs with a library like React Hook Form (avoids per-keystroke re-renders of the whole form), virtualize long field lists if only a subset is visible, and split the form into memoized sub-sections.',
    highlights: ['Use uncontrolled inputs with a library like React…'],
  },
  {
    id: 1209, category: 'React', difficulty: 'Mid',
    question: 'How would you implement a multistep form with conditional rendering between steps?',
    answer: 'Track a currentStep state value and store all step data in one combined state object (or context); conditionally render the component matching currentStep, and validate each step\'s fields before allowing \'Next\' to advance.',
    highlights: ['Track a currentStep state value and store all step…'],
  },
  {
    id: 1210, category: 'React', difficulty: 'Mid',
    question: 'How would you implement infinite scrolling efficiently in React?',
    answer: 'Use an IntersectionObserver on a sentinel element at the bottom of the list to detect when the user nears the end, then fetch the next page and append results — combine with virtualization if the list also grows very large.',
    highlights: ['Use an IntersectionObserver on a sentinel element…', 'combine with virtualization if the list also grows…'],
  },
  {
    id: 1211, category: 'React', difficulty: 'Mid',
    question: 'What are Synthetic Events in React? Difference from real DOM events.',
    answer: 'SyntheticEvent is React\'s cross-browser wrapper around native DOM events, normalizing behavior across browsers and pooling event objects for performance (in older React versions) — you interact with the same API (e.target, e.preventDefault()) regardless of the underlying browser.',
    highlights: ['SyntheticEvent is React\'s cross-browser wrapper…', 'you interact with the same API (e.target,…'],
  },
  {
    id: 1212, category: 'React', difficulty: 'Senior',
    question: 'What is concurrent mode in React?',
    answer: 'Concurrent features (enabled via createRoot in React 18) let React prepare multiple UI versions simultaneously and interrupt/prioritize rendering work, keeping the UI responsive during expensive updates via features like useTransition and Suspense.',
    highlights: ['Concurrent features (enabled via createRoot in…'],
  },
  {
    id: 1213, category: 'React', difficulty: 'Junior',
    question: 'What is React Profiler?',
    answer: 'A React DevTools tool (and <Profiler> component) that measures how often components render and the cost of each render, helping pinpoint performance bottlenecks and unnecessary re-renders.',
    highlights: ['A React DevTools tool (and <Profiler> component)…'],
  },
  {
    id: 1214, category: 'React', difficulty: 'Junior',
    question: 'What is lazy loading / code splitting in React? (React.lazy, dynamic import)',
    answer: 'React.lazy(() => import(\'./Component\')) defers loading a component\'s code until it\'s actually rendered, paired with <Suspense> for a loading fallback — reducing the initial JS bundle size.',
    highlights: ['React.lazy(() => import(\'./Component\')) defers…', 'reducing the initial JS bundle size'],
  },
  {
    id: 1215, category: 'React', difficulty: 'Junior',
    question: 'What is lazy hydration and streaming SSR?',
    answer: 'Lazy hydration defers making below-the-fold or non-critical components interactive until they\'re needed/visible. Streaming SSR sends HTML to the browser in chunks as it\'s generated (via React 18\'s renderToPipeableStream), letting the browser start painting before the entire page finishes rendering server-side.',
    highlights: ['Lazy hydration defers making below-the-fold or…', 'Streaming SSR sends HTML to the browser in chunks…'],
  },
  {
    id: 1216, category: 'React', difficulty: 'Mid',
    question: 'What are micro-frontends in React?',
    answer: 'An architecture splitting a large frontend into independently developed, built, and deployed smaller apps (owned by different teams) that are composed together at runtime — often via Module Federation — letting teams ship independently on a shared shell.',
    highlights: ['An architecture splitting a large frontend into…', 'often via Module Federation', 'letting teams ship independently on a shared shell'],
  },
  {
    id: 1217, category: 'React', difficulty: 'Junior',
    question: 'What is the reconciliation algorithm (diffing) in React?',
    answer: 'React compares the new element tree to the previous one using heuristics: different element types cause a full subtree rebuild; same-type elements are compared prop by prop; list children are matched using keys — producing the minimal DOM patch instead of a full re-render.',
    highlights: ['React compares the new element tree to the previous…', 'producing the minimal DOM patch instead of a full…'],
  },
  {
    id: 1218, category: 'React', difficulty: 'Junior',
    question: 'What is the default localhost port in React? How do you change it?',
    answer: 'Create React App defaults to port 3000, Vite defaults to 5173. Change it via the PORT environment variable (CRA) or the server.port option in vite.config.js (Vite).',
    highlights: ['Create React App defaults to port 3000, Vite…', 'Change it via the PORT environment variable (CRA)…'],
  },
  {
    id: 1219, category: 'React', difficulty: 'Junior',
    question: 'What is the node_modules folder in React?',
    answer: 'The directory where npm/yarn install all project dependencies and their nested sub-dependencies — it\'s large, regenerable from package.json/lockfile, and should always be excluded from version control via .gitignore.',
    highlights: ['The directory where npm/yarn install all project…', 'it\'s large, regenerable from package.json/lockfile,…'],
  },
  {
    id: 1220, category: 'React', difficulty: 'Junior',
    question: 'What is lifting state up in React? Explain with an example.',
    answer: 'Moving shared state from a child component up to their closest common ancestor so multiple children can read and update the same data via props — e.g. two sibling inputs both needing to reflect/update the same \'temperature\' value lift it to their parent.',
    highlights: ['Moving shared state from a child component up to…', 'two sibling inputs both needing to reflect/update…'],
  },
  {
    id: 1221, category: 'React', difficulty: 'Junior',
    question: 'What is Tree Shaking in bundlers like Webpack/Vite?',
    answer: 'Tree shaking statically analyzes ES module imports/exports to detect and eliminate unused code from the final bundle, relying on the static (non-dynamic) nature of ES module syntax to determine what\'s actually referenced.',
    highlights: ['Tree shaking statically analyzes ES module…'],
  },
  {
    id: 1222, category: 'React', difficulty: 'Junior',
    question: 'What is a hydration error in React? What causes it?',
    answer: 'A hydration mismatch occurs when the server-rendered HTML doesn\'t match what the client would render on first pass — common causes: using Date.now()/Math.random() during render, browser-only APIs accessed during SSR, or conditional rendering based on typeof window.',
    highlights: ['A hydration mismatch occurs when the…', 'common causes: using Date.now()/Math.random()…'],
  },
  {
    id: 1223, category: 'React', difficulty: 'Junior',
    question: 'What is hydration in Next.js?',
    answer: 'Next.js server-renders pages to HTML, sends that to the browser for a fast first paint, then \'hydrates\' by attaching React\'s event handlers and internal state to the existing markup, making the static page interactive.',
    highlights: ['Next.js server-renders pages to HTML, sends that to…'],
  },
  {
    id: 1224, category: 'React', difficulty: 'Junior',
    question: 'What is the difference between React Router Link and a regular anchor tag?',
    answer: '<Link> intercepts the click and updates the route client-side without a full page reload, preserving app state and avoiding a full asset re-download. A plain <a> tag triggers a full browser navigation/page reload.',
    highlights: ['<Link> intercepts the click and updates the route…', 'A plain <a> tag triggers a full browser…'],
  },
  {
    id: 1225, category: 'React', difficulty: 'Mid',
    question: 'How do you configure webpack for React projects?',
    answer: 'Define entry/output paths, add loaders (babel-loader for JS/JSX, css-loader/style-loader for CSS), configure plugins (HtmlWebpackPlugin, MiniCssExtractPlugin), and set up devServer options for hot reloading — most modern setups (CRA, Vite) abstract this away by default.',
    highlights: ['Define entry/output paths, add loaders…', 'most modern setups (CRA, Vite) abstract this away…'],
  },
  {
    id: 1226, category: 'React', difficulty: 'Mid',
    question: 'How would you handle graceful API error handling in React?',
    answer: 'Centralize error handling in a shared API client/interceptor, map HTTP status codes to user-friendly messages, use error boundaries for render-time errors, and show retry affordances for transient network failures.',
    highlights: ['Centralize error handling in a shared API…'],
  },
  {
    id: 1227, category: 'React', difficulty: 'Mid',
    question: 'How do you manage multiple theme modes (dark/light) in React?',
    answer: 'Store the active theme in Context/state (or read prefers-color-scheme), define color tokens as CSS custom properties, and toggle a class/data-attribute on the root element — components then reference the variables rather than hardcoded colors.',
    highlights: ['Store the active theme in Context/state (or read…', 'components then reference the variables rather than…'],
  },
  {
    id: 1228, category: 'React', difficulty: 'Mid',
    question: 'What would you use for global state management? (Context, Redux, Zustand, React Query)',
    answer: 'Context+useReducer for small/simple shared state; Redux/Redux Toolkit for large apps needing strict predictability and devtools; Zustand for a lightweight, less-boilerplate global store; React Query specifically for server/API state (not client UI state).',
    highlights: ['Context+useReducer for small/simple shared state;…'],
  },
  {
    id: 1229, category: 'React', difficulty: 'Senior',
    question: 'How to structure large-scale React applications for better maintainability?',
    answer: 'Organize by feature/domain rather than file type, colocate related components/hooks/tests, enforce clear boundaries between UI and business logic, centralize API calls in a service layer, and use a consistent state-management strategy across the app.',
    highlights: ['Organize by feature/domain rather than file type,…'],
  },
  {
    id: 1230, category: 'React', difficulty: 'Mid',
    question: 'How do you manage state in large React applications?',
    answer: 'Split state by scope: local component state for UI-only concerns, Context for cross-cutting app-wide values (theme, auth), a dedicated store (Redux/Zustand) for complex shared business state, and a server-state library (React Query) for API data and caching.',
    highlights: ['Split state by scope: local component state for…'],
  },
  {
    id: 1231, category: 'React', difficulty: 'Senior',
    question: 'How would you design a frontend system serving millions of users daily?',
    answer: 'Use CDN-edge caching and code splitting to minimize payload, server-side render or statically generate content where possible, implement robust monitoring/error tracking, design for graceful degradation, and horizontally scale the backing services behind the API.',
    highlights: ['Use CDN-edge caching and code splitting to minimize…'],
  },
  {
    id: 1232, category: 'React', difficulty: 'Senior',
    question: 'How do you design a scalable frontend architecture for a large-scale application?',
    answer: 'Adopt a modular, feature-based folder structure, a shared design system/component library, strict typing (TypeScript), automated testing at multiple levels, CI/CD with preview deployments, and clear ownership boundaries — potentially micro-frontends for very large multi-team orgs.',
    highlights: ['Adopt a modular, feature-based folder structure, a…', 'potentially micro-frontends for very large…'],
  },
  {
    id: 1233, category: 'React', difficulty: 'Senior',
    question: 'Design dashboard architecture in React (component boundaries, API orchestration, state management, caching).',
    answer: 'Split into independent widget components each owning their own data fetch (via React Query for caching/dedup), a shared layout shell managing global filters/context, lazy-load heavy charts, and debounce filter-driven refetches to avoid request storms.',
    highlights: ['Split into independent widget components each…'],
  },
  {
    id: 1234, category: 'React', difficulty: 'Senior',
    question: 'Build a real-time notification system using WebSockets in React.',
    answer: 'Open a WebSocket connection in a top-level provider/hook on mount, push incoming messages into a shared notification store/context, render a toast/badge UI reactively, and reconnect with backoff on disconnect, cleaning up the socket on unmount.',
    highlights: ['Open a WebSocket connection in a top-level…'],
  },
  {
    id: 1235, category: 'React', difficulty: 'Mid',
    question: 'How do you implement real-time features (like chat) in a MERN stack app?',
    answer: 'Use Socket.IO (or native WebSockets) on the Express server to broadcast events to connected clients, store message history in MongoDB, and have the React client subscribe to relevant channels/rooms and optimistically render sent messages.',
    highlights: ['Use Socket.IO (or native WebSockets) on the Express…'],
  },
  {
    id: 1236, category: 'React', difficulty: 'Mid',
    question: 'How can you prevent security risks like XSS and CSRF in a MERN application?',
    answer: 'Prevent XSS by sanitizing/escaping user input and avoiding dangerouslySetInnerHTML with untrusted content; prevent CSRF with anti-CSRF tokens, SameSite cookies, and verifying the Origin/Referer header on state-changing requests.',
    highlights: ['Prevent XSS by sanitizing/escaping user input and…'],
  },
  {
    id: 1237, category: 'React', difficulty: 'Mid',
    question: 'How do you handle pagination in MongoDB and display it in a React frontend?',
    answer: 'Use .skip()/.limit() (or cursor-based pagination with _id for large datasets) on the MongoDB query, return total count/page metadata from the API, and render page controls in React that update a page query param triggering a refetch.',
    highlights: ['Use .skip()/.limit() (or cursor-based pagination…'],
  },
  {
    id: 1238, category: 'React', difficulty: 'Senior',
    question: 'How would you design a MERN app for scaling with microservices?',
    answer: 'Split the monolith by domain (auth, orders, catalog) into independently deployable services each with its own database, communicate via REST/gRPC or a message queue (Kafka/RabbitMQ) for async events, and put an API gateway in front for routing/auth.',
    highlights: ['Split the monolith by domain (auth, orders,…'],
  },
  {
    id: 1239, category: 'React', difficulty: 'Mid',
    question: 'Code review: identify bugs and improvements in a UserList component with useEffect([users]) anti-pattern. The bug creates an infinite re-render loop because \'users\' is listed as a dependency of the effect that sets \'users\'.',
    answer: 'The effect both reads and writes \'users\' via setUsers inside itself while listing \'users\' as a dependency — each write re-triggers the effect, causing an infinite loop. Fix: fetch data with an empty dependency array (run once) or derive the dependency from a stable primitive (like a userId) instead of the object being set.',
    highlights: ['The effect both reads and writes \'users\' via…', 'each write re-triggers the effect, causing an…', 'Fix: fetch data with an empty dependency array (run…'],
  },
  {
    id: 1240, category: 'React', difficulty: 'Senior',
    question: 'Tell us about a challenging project you worked on and how you handled a critical production issue.',
    answer: 'Describe the specific bug/outage using the STAR method: the Situation and business impact, the Task you owned, the Action you took to diagnose and fix it (root cause analysis, hotfix, rollback), and the Result (resolution time, prevention measures added afterward).',
    highlights: ['Describe the specific bug/outage using the STAR…'],
  },
  {
    id: 1241, category: 'React', difficulty: 'Mid',
    question: 'How do you mentor junior developers and review code?',
    answer: 'Pair-program on tricky problems, give code review feedback that explains the \'why\' not just the \'what\', encourage them to explain their reasoning before suggesting a fix, and share small, incremental learning resources tied to real tasks they\'re working on.',
    highlights: ['Pair-program on tricky problems, give code review…'],
  },
  {
    id: 1242, category: 'React', difficulty: 'Mid',
    question: 'What are the trade-offs between Redux vs Context API for state management?',
    answer: 'Redux offers middleware, devtools, time-travel debugging, and predictable patterns for large/complex state but adds boilerplate. Context is built-in and simpler for smaller shared state, but re-renders every consumer on any value change and lacks Redux\'s tooling for complex async flows.',
    highlights: ['Redux offers middleware, devtools, time-travel…', 'Context is built-in and simpler for smaller shared…'],
  },
  {
    id: 1243, category: 'React', difficulty: 'Junior',
    question: 'What is the difference between Redux Toolkit\'s createSlice and the traditional Redux approach?',
    answer: 'createSlice auto-generates action types, action creators, and a reducer from a single object definition, using Immer under the hood so you write seemingly-mutating logic that\'s converted to immutable updates — traditional Redux requires manually writing switch-based reducers and separate action creator functions.',
    highlights: ['createSlice auto-generates action types, action…', 'traditional Redux requires manually writing…'],
  },
  {
    id: 1244, category: 'React', difficulty: 'Junior',
    question: 'What is Zustand and how does it compare to Redux for state management?',
    answer: 'Zustand is a minimal state-management library using a single hook-based store with no boilerplate (no actions/reducers/providers required) — much simpler than Redux for small-to-medium apps, though it lacks Redux\'s mature middleware ecosystem and strict architectural conventions.',
    highlights: ['Zustand is a minimal state-management library using…', 'much simpler than Redux for small-to-medium apps,…'],
  },
  {
    id: 1245, category: 'React', difficulty: 'Mid',
    question: 'How do you handle form state management with React Hook Form vs Formik?',
    answer: 'React Hook Form uses uncontrolled inputs and refs internally, minimizing re-renders and improving performance for large forms. Formik uses controlled inputs with more explicit state management, historically more popular but generally heavier/slower for large forms.',
    highlights: ['React Hook Form uses uncontrolled inputs and refs…', 'Formik uses controlled inputs with more explicit…'],
  },
  {
    id: 1246, category: 'React', difficulty: 'Junior',
    question: 'What is React 19\'s new \'use\' hook and how does it simplify data fetching?',
    answer: 'The \'use\' hook lets you read the value of a Promise or Context directly during render (even conditionally), letting components suspend on data fetching without needing useEffect boilerplate, integrating naturally with Suspense.',
    highlights: ['The \'use\' hook lets you read the value of a Promise…'],
  },
  {
    id: 1247, category: 'React', difficulty: 'Senior',
    question: 'What is the difference between client-side and server-side data fetching in Next.js (getServerSideProps vs getStaticProps vs Server Components)?',
    answer: 'getServerSideProps fetches data on every request (SSR). getStaticProps fetches at build time and can be revalidated (ISR). In the modern App Router, Server Components fetch data directly during server rendering with fine-grained caching control replacing both older methods.',
    highlights: ['getServerSideProps fetches data on every request (SSR)', 'getStaticProps fetches at build time and can be…', 'In the modern App Router, Server Components fetch…'],
  },
  {
    id: 1248, category: 'React', difficulty: 'Mid',
    question: 'What are React compiler optimizations introduced in React 19?',
    answer: 'The React Compiler automatically memoizes components and values at build time by analyzing your code, reducing or eliminating the need to manually add useMemo/useCallback/React.memo for performance.',
    highlights: ['The React Compiler automatically memoizes…'],
  },
  {
    id: 1249, category: 'React', difficulty: 'Senior',
    question: 'What is the purpose of startTransition() in React 18?',
    answer: 'startTransition(() => setState(...)) tells React that this specific state update is low-priority/non-urgent, letting React interrupt it in favor of more urgent updates (like text input) to keep the UI responsive.',
    highlights: ['startTransition(() => setState(...)) tells React…'],
  },
  {
    id: 1250, category: 'React', difficulty: 'Mid',
    question: 'How would you implement real-time search with debouncing and AbortController?',
    answer: 'Debounce the input\'s onChange (e.g. 300ms) before firing the API call, and use an AbortController to cancel the previous in-flight request whenever a new keystroke triggers a new search — preventing outdated responses from overwriting newer results.',
    highlights: ['Debounce the input\'s onChange (e.g', '300ms) before firing the API call, and use an…', 'preventing outdated responses from overwriting…'],
  },

  // ─── NODE.JS (from Interview Masterpack) ───

  {
    id: 1251, category: 'Node.js', difficulty: 'Junior',
    question: 'What is Node.js and what is its primary purpose?',
    answer: 'Node.js is a JavaScript runtime built on Chrome\'s V8 engine that executes JS outside the browser, enabling server-side development, CLI tools, and build tooling with a non-blocking, event-driven I/O model suited for scalable network applications.',
    code: `// Node.js example: Simple HTTP server\nconst http = require('http');\n\nconst server = http.createServer((req, res) => {\n  res.writeHead(200, { 'Content-Type': 'text/plain' });\n  res.end('Hello, World!');\n});\n\nserver.listen(3000, () => {\n  console.log('Server running on http://localhost:3000');\n});\n\n// Non-blocking I/O\nconst fs = require('fs');\nfs.readFile('file.txt', (err, data) => {\n  if (err) throw err;\n  console.log(data);\n});\nconsole.log('Reading file...');`,
    highlights: ['Node.js is a JavaScript runtime built on Chrome\'s…'],
  },
  {
    id: 1252, category: 'Node.js', difficulty: 'Senior',
    question: 'Explain the internal architecture of Node.js.',
    answer: 'Node.js combines the V8 JS engine (executes JS), libuv (provides the event loop, thread pool, and async I/O), and core C++ bindings, exposing built-in modules (fs, http, crypto) — CPU-bound work can offload to libuv\'s thread pool while I/O stays non-blocking.',
    code: `// V8 engine executes JS\nconst v8 = require('v8');\nconsole.log(v8.getHeapStatistics());\n\n// libuv handles async I/O and event loop\nconst fs = require('fs').promises;\nconst path = require('path');\n\n// Non-blocking file operations\nfs.readFile('./data.json')\n  .then(data => console.log(data))\n  .catch(err => console.error(err));\n\n// CPU-intensive work on thread pool\nconst crypto = require('crypto');\ncrypto.pbkdf2('password', 'salt', 100000, 64, 'sha512', (err, key) => {\n  if (err) throw err;\n  console.log('Key derived');\n});`,
    highlights: ['Node.js combines the V8 JS engine (executes JS),…', 'CPU-bound work can offload to libuv\'s thread pool…'],
  },
  {
    id: 1253, category: 'Node.js', difficulty: 'Mid',
    question: 'Is Node.js single-threaded or multi-threaded? How does it achieve concurrency?',
    answer: 'The main JS execution thread is single-threaded, but Node achieves concurrency by delegating I/O and some CPU work to libuv\'s underlying thread pool and OS-level async mechanisms, then processing completed results via the event loop — giving async concurrency without explicit multi-threaded JS code.',
    highlights: ['The main JS execution thread is single-threaded,…', 'giving async concurrency without explicit…'],
  },
  {
    id: 1254, category: 'Node.js', difficulty: 'Junior',
    question: 'What is npm? List its main uses.',
    answer: 'npm (Node Package Manager) is the default package registry/CLI for Node — used to install/manage dependencies, run defined scripts (npm run build), publish packages, and manage semantic versioning via package.json.',
    highlights: ['npm (Node Package Manager) is the default package…', 'used to install/manage dependencies, run defined…'],
  },
  {
    id: 1255, category: 'Node.js', difficulty: 'Junior',
    question: 'What is the purpose of the package.json file in Node.js?',
    answer: 'package.json declares project metadata, dependencies/devDependencies with version ranges, npm scripts, entry point, and engine requirements — it\'s the manifest npm/yarn use to install and manage the project.',
    highlights: ['package.json declares project metadata,…', 'it\'s the manifest npm/yarn use to install and…'],
  },
  {
    id: 1256, category: 'Node.js', difficulty: 'Junior',
    question: 'What is the http module? Create a basic server using it.',
    answer: 'Node\'s built-in http module creates raw HTTP servers without a framework: const http=require(\'http\'); http.createServer((req,res)=>{ res.writeHead(200); res.end(\'Hello\'); }).listen(3000);',
    highlights: ['Node\'s built-in http module creates raw HTTP…'],
  },
  {
    id: 1257, category: 'Node.js', difficulty: 'Mid',
    question: 'How do you create a secure HTTPS server setup using Express?',
    answer: 'const https=require(\'https\'); const options={key: fs.readFileSync(\'key.pem\'), cert: fs.readFileSync(\'cert.pem\')}; https.createServer(options, app).listen(443); — wrapping your Express app with TLS certificate options, typically terminated at a load balancer/reverse proxy in production instead.',
    highlights: ['const https=require(\'https\'); const options={key:…', 'wrapping your Express app with TLS certificate…'],
  },
  {
    id: 1258, category: 'Node.js', difficulty: 'Mid',
    question: 'How do you update existing npm packages?',
    answer: 'npm update updates within the semver ranges in package.json. npm outdated lists packages with newer versions available. npm install pkg@latest force-updates a specific package to its newest release, potentially crossing a major version.',
    highlights: ['npm update updates within the semver ranges in…', 'npm outdated lists packages with newer versions…', 'npm install pkg@latest force-updates a specific…'],
  },
  {
    id: 1259, category: 'Node.js', difficulty: 'Mid',
    question: 'List global objects in Node.js.',
    answer: '__dirname, __filename, process, Buffer, global, console, require, module, exports, setTimeout/setInterval/setImmediate — available in every module without explicit import.',
    highlights: ['__dirname, __filename, process, Buffer, global,…', 'available in every module without explicit import'],
  },
  {
    id: 1260, category: 'Node.js', difficulty: 'Mid',
    question: 'Explain streams and buffers and their differences.',
    answer: 'A Buffer is a fixed-size chunk of raw binary data held in memory. A Stream is an abstraction for reading/writing data incrementally (in chunks over time) rather than loading it all into memory at once — streams often emit/consume data as a sequence of Buffers.',
    highlights: ['A Buffer is a fixed-size chunk of raw binary data…', 'A Stream is an abstraction for reading/writing data…', 'streams often emit/consume data as a sequence of…'],
  },
  {
    id: 1261, category: 'Node.js', difficulty: 'Mid',
    question: 'What are modules, streams, and the Buffer class in Node.js?',
    answer: 'Modules are reusable files exposing functionality via require/exports (or ES import/export). Streams handle continuous data flow (Readable, Writable, Duplex, Transform). Buffer represents fixed-length raw binary data, used for handling files, network packets, and binary protocols.',
    highlights: ['Modules are reusable files exposing functionality…', 'Streams handle continuous data flow (Readable,…', 'Buffer represents fixed-length raw binary data,…'],
  },
  {
    id: 1262, category: 'Node.js', difficulty: 'Mid',
    question: 'What are microtasks and macrotasks in Node.js?',
    answer: 'Microtasks (Promise callbacks, process.nextTick) run immediately after the current operation and before the event loop continues to the next phase. Macrotasks (setTimeout, setImmediate, I/O callbacks) are scheduled into specific event loop phases and run after all pending microtasks drain.',
    highlights: ['Microtasks (Promise callbacks, process.nextTick)…', 'Macrotasks (setTimeout, setImmediate, I/O…'],
  },
  {
    id: 1263, category: 'Node.js', difficulty: 'Mid',
    question: 'Explain piping data between streams.',
    answer: 'readableStream.pipe(writableStream) automatically reads chunks from the source and writes them to the destination while managing backpressure (pausing the source if the destination is slower) — commonly used for file copying or streaming HTTP responses.',
    highlights: ['readableStream.pipe(writableStream) automatically…', 'commonly used for file copying or streaming HTTP…'],
  },
  {
    id: 1264, category: 'Node.js', difficulty: 'Mid',
    question: 'What are the features of Express.js?',
    answer: 'Minimalist routing, middleware pipeline for request/response processing, robust HTTP utility methods, template engine support, and a large plugin ecosystem — Express is unopinionated, letting you structure the app however you prefer.',
    highlights: ['Minimalist routing, middleware pipeline for…', 'Express is unopinionated, letting you structure the…'],
  },
  {
    id: 1265, category: 'Node.js', difficulty: 'Junior',
    question: 'What is the role of Express.js in a MERN application?',
    answer: 'Express provides the backend web framework layer that defines REST API routes, applies middleware (auth, validation, logging), and connects to MongoDB — sitting between the React frontend\'s requests and the database.',
    highlights: ['Express provides the backend web framework layer…', 'sitting between the React frontend\'s requests and…'],
  },
  {
    id: 1266, category: 'Node.js', difficulty: 'Mid',
    question: 'What happens if you pass a parameter to the next() function inside middleware?',
    answer: 'Calling next(error) skips all remaining regular middleware/routes and jumps directly to the nearest error-handling middleware (one defined with 4 arguments: err, req, res, next).',
    highlights: ['Calling next(error) skips all remaining regular…'],
  },
  {
    id: 1267, category: 'Node.js', difficulty: 'Mid',
    question: 'How can you jump from one middleware to another, skipping some?',
    answer: 'Call next(\'route\') inside a middleware to skip any remaining route-specific middleware and move to the next matching route handler — useful for conditional routing logic within a chain.',
    highlights: ['Call next(\'route\') inside a middleware to skip any…', 'useful for conditional routing logic within a chain'],
  },
  {
    id: 1268, category: 'Node.js', difficulty: 'Mid',
    question: 'How can you minimize middleware overhead?',
    answer: 'Apply middleware only to the specific routes that need it rather than globally, order lightweight/fast-fail middleware (like auth checks) before heavier ones, and avoid synchronous/blocking work inside middleware functions.',
    highlights: ['Apply middleware only to the specific routes that…'],
  },
  {
    id: 1269, category: 'Node.js', difficulty: 'Mid',
    question: 'Write a middleware function to check if an application ID is present in the request header.',
    answer: 'function checkAppId(req, res, next){ const appId = req.headers[\'x-app-id\']; if(!appId) return res.status(400).json({error:\'Missing app id\'}); next(); }',
    highlights: ['function checkAppId(req, res, next){ const appId =…'],
  },
  {
    id: 1270, category: 'Node.js', difficulty: 'Junior',
    question: 'What is the difference between PATCH and PUT HTTP methods?',
    answer: 'PUT replaces an entire resource with the provided representation (idempotent, full update). PATCH applies a partial update, modifying only the specified fields — both are used for updates, but PATCH is more efficient for small changes.',
    highlights: ['PUT replaces an entire resource with the provided…', 'PATCH applies a partial update, modifying only the…', 'both are used for updates, but PATCH is more…'],
  },
  {
    id: 1271, category: 'Node.js', difficulty: 'Mid',
    question: 'When should you use PATCH vs POST vs GET?',
    answer: 'GET retrieves data without side effects (safe, idempotent, cacheable). POST creates a new resource or triggers a non-idempotent action. PATCH partially updates an existing resource. Use each according to REST semantics for predictable API behavior.',
    highlights: ['GET retrieves data without side effects (safe,…', 'POST creates a new resource or triggers a…', 'PATCH partially updates an existing resource'],
  },
  {
    id: 1272, category: 'Node.js', difficulty: 'Senior',
    question: 'If you are retrieving data, which HTTP method would you use?',
    answer: 'GET — it\'s designed for safe, idempotent, cacheable data retrieval with no side effects on the server, and request parameters are typically passed via the URL/query string rather than a body.',
    highlights: ['it\'s designed for safe, idempotent, cacheable data…'],
  },
  {
    id: 1273, category: 'Node.js', difficulty: 'Junior',
    question: 'What is HTTP Request? Explain common HTTP methods.',
    answer: 'An HTTP request is a client\'s message to a server specifying a method, URL, headers, and optional body. GET reads, POST creates, PUT replaces, PATCH partially updates, DELETE removes — each carrying specific idempotency/safety semantics.',
    highlights: ['An HTTP request is a client\'s message to a server…', 'GET reads, POST creates, PUT replaces, PATCH…', 'each carrying specific idempotency/safety semantics'],
  },
  {
    id: 1274, category: 'Node.js', difficulty: 'Mid',
    question: 'How do you handle routing in Node.js/Express.js?',
    answer: 'app.get(\'/users/:id\', handler), app.post(\'/users\', handler), etc. define routes matching HTTP method + path patterns; Express Router lets you modularize routes into separate files mounted with app.use(\'/api\', router).',
    highlights: ['app.get(\'/users/:id\', handler), app.post(\'/users\',…', 'define routes matching HTTP method + path patterns;…'],
  },
  {
    id: 1275, category: 'Node.js', difficulty: 'Mid',
    question: 'How do you create optional path API endpoints in Express.js?',
    answer: 'Use a \'?\' after a path segment: app.get(\'/users/:id?\', handler) makes the :id parameter optional, matching both /users and /users/123 — the handler checks req.params.id for presence.',
    highlights: ['Use a \'?\' after a path segment:…', 'the handler checks req.params.id for presence'],
  },
  {
    id: 1276, category: 'Node.js', difficulty: 'Junior',
    question: 'What is a REST API?',
    answer: 'REST (Representational State Transfer) is an architectural style for APIs using stateless HTTP requests, standard methods (GET/POST/PUT/DELETE) mapped to resources identified by URLs, and typically exchanging data as JSON.',
    highlights: ['REST (Representational State Transfer) is an…'],
  },
  {
    id: 1277, category: 'Node.js', difficulty: 'Mid',
    question: 'Explain error handling in Express.js.',
    answer: 'Wrap route logic in try/catch (or use async-error-catching middleware), pass errors to next(err), and define a centralized error-handling middleware (err, req, res, next) at the end of the middleware stack to format and send consistent error responses.',
    highlights: ['Wrap route logic in try/catch (or use…'],
  },
  {
    id: 1278, category: 'Node.js', difficulty: 'Junior',
    question: 'What is JWT? Explain the structure of a JWT token.',
    answer: 'JWT (JSON Web Token) is a compact, self-contained token for stateless authentication, structured as three Base64URL-encoded parts separated by dots: header (algorithm/type), payload (claims/user data), and signature (verifies integrity, signed with a secret/private key).',
    highlights: ['JWT (JSON Web Token) is a compact, self-contained…'],
  },
  {
    id: 1279, category: 'Node.js', difficulty: 'Mid',
    question: 'How can we modify the signature of a JWT?',
    answer: 'You can\'t validly modify a JWT\'s signature without the signing secret/private key — any change to the header or payload invalidates the original signature, causing verification to fail, which is exactly the tamper-detection JWTs are designed to provide.',
    highlights: ['You can\'t validly modify a JWT\'s signature without…', 'any change to the header or payload invalidates the…'],
  },
  {
    id: 1280, category: 'Node.js', difficulty: 'Mid',
    question: 'How do you implement role-based and permission-based access control (RBAC) in Express.js?',
    answer: 'Attach the authenticated user\'s role/permissions to req.user (via JWT payload or a DB lookup), then write a middleware factory like requireRole(\'admin\') that checks req.user.role before calling next(), returning 403 Forbidden otherwise.',
    highlights: ['Attach the authenticated user\'s role/permissions to…'],
  },
  {
    id: 1281, category: 'Node.js', difficulty: 'Mid',
    question: 'Write a middleware for RBAC in Node.js.',
    answer: 'const requireRole = (role) => (req, res, next) => { if(req.user?.role !== role) return res.status(403).json({error:\'Forbidden\'}); next(); }; — then apply per-route: app.delete(\'/users/:id\', requireRole(\'admin\'), handler).',
    highlights: ['const requireRole = (role) => (req, res, next) => {…', 'then apply per-route: app.delete(\'/users/:id\',…'],
  },
  {
    id: 1282, category: 'Node.js', difficulty: 'Mid',
    question: 'Explain input validation and data sanitization in Express.js.',
    answer: 'Validation ensures incoming data matches expected shape/types/rules (using libraries like Joi, Zod, or express-validator), rejecting malformed requests early. Sanitization strips/escapes dangerous content (HTML, SQL/NoSQL injection payloads) before it\'s processed or stored.',
    highlights: ['Validation ensures incoming data matches expected…', 'Sanitization strips/escapes dangerous content…'],
  },
  {
    id: 1283, category: 'Node.js', difficulty: 'Mid',
    question: 'Explain rate limiting in Express.js.',
    answer: 'Rate limiting caps how many requests a client can make in a time window (e.g. via express-rate-limit middleware), protecting against brute-force attacks and abuse by returning 429 Too Many Requests once the limit is exceeded.',
    highlights: ['Rate limiting caps how many requests a client can…', 'via express-rate-limit middleware), protecting…'],
  },
  {
    id: 1284, category: 'Node.js', difficulty: 'Mid',
    question: 'Explain logging and monitoring in a Node.js application.',
    answer: 'Use structured logging (Winston, Pino) writing to files/log aggregators with severity levels, correlate requests with unique IDs, and integrate monitoring/APM tools (Datadog, New Relic, CloudWatch) to track error rates, latency, and system health in real time.',
    highlights: ['Use structured logging (Winston, Pino) writing to…'],
  },
  {
    id: 1285, category: 'Node.js', difficulty: 'Junior',
    question: 'What is the difference between stateless and stateful APIs?',
    answer: 'Stateless APIs (typical REST) don\'t retain any client context between requests — each request carries all needed information (e.g. a JWT). Stateful APIs maintain session data server-side between requests (e.g. traditional session cookies backed by server memory/store).',
    highlights: ['Stateless APIs (typical REST) don\'t retain any…', 'each request carries all needed information (e.g', 'Stateful APIs maintain session data server-side…'],
  },
  {
    id: 1286, category: 'Node.js', difficulty: 'Mid',
    question: 'How can you achieve state management in a Node.js application?',
    answer: 'Use external stores like Redis for session/cache state shared across multiple server instances, or database-backed sessions — avoid storing state in server memory alone since it doesn\'t scale across multiple processes/instances.',
    highlights: ['Use external stores like Redis for session/cache…', 'avoid storing state in server memory alone since it…'],
  },
  {
    id: 1287, category: 'Node.js', difficulty: 'Senior',
    question: 'How do you scale a Node.js application using the cluster module?',
    answer: 'The cluster module forks multiple worker processes (typically one per CPU core) that share the same server port via the OS, with a master process load-balancing incoming connections across workers — letting a single-threaded Node app utilize all CPU cores.',
    highlights: ['The cluster module forks multiple worker processes…', 'letting a single-threaded Node app utilize all CPU…'],
  },
  {
    id: 1288, category: 'Node.js', difficulty: 'Junior',
    question: 'What is a worker thread? How does it handle CPU-intensive tasks?',
    answer: 'worker_threads run JS in parallel threads within the same process (unlike cluster\'s separate processes), each with its own event loop — ideal for offloading CPU-heavy synchronous work (image processing, heavy computation) without blocking the main event loop.',
    highlights: ['worker_threads run JS in parallel threads within…', 'ideal for offloading CPU-heavy synchronous work…'],
  },
  {
    id: 1289, category: 'Node.js', difficulty: 'Mid',
    question: 'How do you handle CPU-intensive tasks in frontend JavaScript (e.g., encrypting large strings) without blocking the UI?',
    answer: 'Offload the work to a Web Worker, which runs on a separate thread and communicates results back via postMessage — keeping the main UI thread free to remain responsive to user interaction.',
    highlights: ['Offload the work to a Web Worker, which runs on a…', 'keeping the main UI thread free to remain…'],
  },
  {
    id: 1290, category: 'Node.js', difficulty: 'Mid',
    question: 'Explain concurrency and parallelism for async tasks in Node.js.',
    answer: 'Concurrency (Node\'s default model) interleaves many I/O-bound tasks on a single thread via the event loop without true simultaneous execution. Parallelism requires actual simultaneous execution across multiple threads/cores, achieved in Node via worker_threads or the cluster module.',
    highlights: ['Concurrency (Node\'s default model) interleaves many…', 'Parallelism requires actual simultaneous execution…'],
  },
  {
    id: 1291, category: 'Node.js', difficulty: 'Mid',
    question: 'How can you optimize database queries?',
    answer: 'Add appropriate indexes on frequently queried fields, select only needed fields (avoid SELECT *), use pagination instead of loading full result sets, batch/aggregate queries where possible, and analyze slow queries with EXPLAIN or profiling tools.',
    highlights: ['Add appropriate indexes on frequently queried…'],
  },
  {
    id: 1292, category: 'Node.js', difficulty: 'Junior',
    question: 'What is Redis? Explain its use cases.',
    answer: 'Redis is an in-memory key-value data store used for caching (reducing DB load), session storage, rate limiting counters, pub-sub messaging, and leaderboards/queues — valued for its speed since data lives in RAM.',
    highlights: ['Redis is an in-memory key-value data store used for…', 'valued for its speed since data lives in RAM'],
  },
  {
    id: 1293, category: 'Node.js', difficulty: 'Mid',
    question: 'How can you increase the performance of a Node.js application?',
    answer: 'Use clustering/worker threads to use all CPU cores, add caching (Redis) for expensive reads, use streams for large data instead of loading everything into memory, optimize/index database queries, and profile to find actual bottlenecks before optimizing blindly.',
    highlights: ['Use clustering/worker threads to use all CPU cores,…'],
  },
  {
    id: 1294, category: 'Node.js', difficulty: 'Junior',
    question: 'What is profiling in Node.js?',
    answer: 'Profiling measures where CPU time and memory are actually spent (via node --prof, Chrome DevTools, or clinic.js) to identify real performance bottlenecks instead of guessing — essential before applying targeted optimizations.',
    highlights: ['Profiling measures where CPU time and memory are…', 'essential before applying targeted optimizations'],
  },
  {
    id: 1295, category: 'Node.js', difficulty: 'Junior',
    question: 'What is connection pooling for databases?',
    answer: 'Instead of opening/closing a new DB connection per request (expensive), a connection pool maintains a reusable set of open connections that requests borrow and return — drastically reducing connection overhead under load.',
    highlights: ['Instead of opening/closing a new DB connection per…', 'drastically reducing connection overhead under load'],
  },
  {
    id: 1296, category: 'Node.js', difficulty: 'Senior',
    question: 'Demonstrate the integration of OAuth 2.0 for third-party authentication in Node.js.',
    answer: 'Use a library like Passport.js with an OAuth strategy (e.g. passport-google-oauth20): redirect the user to the provider\'s consent screen, handle the callback with an authorization code, exchange it for tokens, then create/find the user record and issue your own session/JWT.',
    highlights: ['Use a library like Passport.js with an OAuth…', 'passport-google-oauth20): redirect the user to the…'],
  },
  {
    id: 1297, category: 'Node.js', difficulty: 'Mid',
    question: 'Implement a refresh token mechanism for JWT authentication in Node.js.',
    answer: 'Issue a short-lived access token and a longer-lived refresh token (stored securely, e.g. httpOnly cookie); when the access token expires, the client calls a /refresh endpoint that validates the refresh token (often checked against a stored/rotated value) and issues a new access token.',
    highlights: ['Issue a short-lived access token and a longer-lived…', 'httpOnly cookie); when the access token expires,…'],
  },
  {
    id: 1298, category: 'Node.js', difficulty: 'Junior',
    question: 'What is the role of indexes in performance optimization?',
    answer: 'Indexes create a sorted, fast-lookup data structure (typically a B-tree) on specified fields, letting queries filtering/sorting on those fields avoid scanning every document/row — at the cost of extra storage and slightly slower writes.',
    highlights: ['Indexes create a sorted, fast-lookup data structure…', 'at the cost of extra storage and slightly slower writes'],
  },
  {
    id: 1299, category: 'Node.js', difficulty: 'Junior',
    question: 'What is MongoDB and what are its key features?',
    answer: 'MongoDB is a document-oriented NoSQL database storing flexible, JSON-like BSON documents. Key features: schema flexibility, horizontal scaling via sharding, replica sets for high availability, a powerful aggregation pipeline, and rich secondary indexing.',
    highlights: ['MongoDB is a document-oriented NoSQL database…', 'Key features: schema flexibility, horizontal…'],
  },
  {
    id: 1300, category: 'Node.js', difficulty: 'Mid',
    question: 'What are documents, collections, and databases in MongoDB?',
    answer: 'A document is a single JSON-like record (BSON). A collection is a group of documents (analogous to a SQL table, but schema-less). A database is a container holding multiple collections.',
    highlights: ['A document is a single JSON-like record (BSON)', 'A collection is a group of documents (analogous to…', 'A database is a container holding multiple collections'],
  },
  {
    id: 1301, category: 'Node.js', difficulty: 'Junior',
    question: 'What is BSON vs JSON? Why does MongoDB use BSON?',
    answer: 'BSON (Binary JSON) is a binary-encoded superset of JSON adding types JSON lacks (dates, binary data, ObjectId) and enabling faster parsing/traversal than text-based JSON — MongoDB stores and transmits documents internally as BSON.',
    highlights: ['BSON (Binary JSON) is a binary-encoded superset of…', 'MongoDB stores and transmits documents internally…'],
  },
  {
    id: 1302, category: 'Node.js', difficulty: 'Junior',
    question: 'What is the difference between MongoDB and relational databases?',
    answer: 'MongoDB stores flexible, schema-less JSON-like documents and scales horizontally via sharding, favoring denormalization. Relational databases (SQL) use rigid predefined schemas, tables with relationships enforced via foreign keys, and strong ACID transactional guarantees across joins.',
    highlights: ['MongoDB stores flexible, schema-less JSON-like…', 'Relational databases (SQL) use rigid predefined…'],
  },
  {
    id: 1303, category: 'Node.js', difficulty: 'Mid',
    question: 'What are CRUD operations in MongoDB?',
    answer: 'Create: insertOne/insertMany. Read: find/findOne with query filters. Update: updateOne/updateMany/findOneAndUpdate with operators like $set. Delete: deleteOne/deleteMany — the four fundamental persistence operations.',
    highlights: ['Create: insertOne/insertMany', 'Read: find/findOne with query filters', 'Update: updateOne/updateMany/findOneAndUpdate with…'],
  },
  {
    id: 1304, category: 'Node.js', difficulty: 'Mid',
    question: 'How do you handle relations in MongoDB? (embedded vs referenced documents)',
    answer: 'Embedding nests related data directly inside the parent document (fast reads, good for one-to-few relationships that are always accessed together). Referencing stores an ObjectId pointing to a document in another collection (better for one-to-many/many-to-many, avoids document bloat, requires $lookup or app-level joins).',
    highlights: ['Embedding nests related data directly inside the…', 'Referencing stores an ObjectId pointing to a…'],
  },
  {
    id: 1305, category: 'Node.js', difficulty: 'Junior',
    question: 'What is the aggregation pipeline in MongoDB? Explain in detail.',
    answer: 'A sequence of stages (e.g. $match, $group, $sort, $project, $lookup, $unwind) that documents flow through, each transforming the data — used for complex reporting, joins across collections, and computed aggregations far beyond simple find() queries.',
    highlights: ['A sequence of stages (e.g', '$match, $group, $sort, $project, $lookup, $unwind)…', 'used for complex reporting, joins across…'],
  },
  {
    id: 1306, category: 'Node.js', difficulty: 'Mid',
    question: 'Suppose you have two tables — employee and address. How do you find which city an employee belongs to? (MongoDB $lookup / SQL JOIN)',
    answer: 'In MongoDB: db.employee.aggregate([{ $lookup: { from:\'address\', localField:\'addressId\', foreignField:\'_id\', as:\'addr\' } }]) joins the address collection by matching IDs. In SQL: SELECT e.name, a.city FROM employee e JOIN address a ON e.address_id = a.id.',
    highlights: ['In MongoDB: db.employee.aggregate([{ $lookup: {…', 'In SQL: SELECT e.name, a.city FROM employee e JOIN…'],
  },
  {
    id: 1307, category: 'Node.js', difficulty: 'Mid',
    question: 'What are indexes and covered queries in MongoDB? How do they speed up performance?',
    answer: 'Indexes are B-tree structures on specified fields that let MongoDB avoid full collection scans. A covered query is satisfied entirely from the index itself (all requested fields are in the index) without touching the actual documents — the fastest possible query type.',
    highlights: ['Indexes are B-tree structures on specified fields…', 'A covered query is satisfied entirely from the…', 'the fastest possible query type'],
  },
  {
    id: 1308, category: 'Node.js', difficulty: 'Senior',
    question: 'What is replication and what are replica sets and the Oplog in MongoDB?',
    answer: 'Replication maintains multiple synchronized copies of data across servers for high availability. A replica set is a group of MongoDB nodes (one primary, several secondaries) that automatically elects a new primary on failure. The Oplog is a capped collection logging all write operations that secondaries replay to stay in sync.',
    highlights: ['Replication maintains multiple synchronized copies…', 'A replica set is a group of MongoDB nodes (one…', 'The Oplog is a capped collection logging all write…'],
  },
  {
    id: 1309, category: 'Node.js', difficulty: 'Senior',
    question: 'What is sharding and horizontal scalability in MongoDB?',
    answer: 'Sharding distributes a large collection\'s data across multiple servers (shards) based on a shard key, allowing the database to scale horizontally beyond a single machine\'s storage/throughput limits, with a query router (mongos) directing requests to the right shard(s).',
    highlights: ['Sharding distributes a large collection\'s data…'],
  },
  {
    id: 1310, category: 'Node.js', difficulty: 'Junior',
    question: 'What is Write Concern, Read Preference, and Transactions in MongoDB?',
    answer: 'Write Concern specifies how many nodes must acknowledge a write before it\'s considered successful (durability vs speed tradeoff). Read Preference controls which replica set members serve reads (primary vs secondary). Transactions allow multiple operations across documents/collections to commit or roll back atomically.',
    highlights: ['Write Concern specifies how many nodes must…', 'Read Preference controls which replica set members…', 'Transactions allow multiple operations across…'],
  },
  {
    id: 1311, category: 'Node.js', difficulty: 'Mid',
    question: 'When would you choose MongoDB over a relational database?',
    answer: 'When your data is naturally document-shaped/hierarchical, requirements change frequently (flexible schema), you need to scale horizontally across many servers, or read/write patterns favor whole-document access over complex multi-table joins.',
    highlights: ['When your data is naturally…'],
  },
  {
    id: 1312, category: 'Node.js', difficulty: 'Mid',
    question: 'MongoDB indexing and schema design best practices.',
    answer: 'Index fields used in frequent query filters/sorts, avoid over-indexing (slows writes), design schema around your access patterns (embed data read together, reference data that grows unbounded), and use the aggregation pipeline\'s $match early to reduce documents processed downstream.',
    highlights: ['Index fields used in frequent query filters/sorts,…'],
  },
  {
    id: 1313, category: 'Node.js', difficulty: 'Mid',
    question: 'What are transactions? How do you achieve them in MongoDB?',
    answer: 'Transactions group multiple operations so they all succeed or all fail together (ACID guarantees). In MongoDB, use a session: session.startTransaction(), perform operations with { session }, then session.commitTransaction() or abortTransaction() on error.',
    highlights: ['Transactions group multiple operations so they all…', 'In MongoDB, use a session:…'],
  },
  {
    id: 1314, category: 'Node.js', difficulty: 'Mid',
    question: 'How do transactions help with rollback in case of failure?',
    answer: 'If any operation within a transaction fails, calling abortTransaction() undoes all changes made so far within that transaction, ensuring the database never ends up in a partially-updated, inconsistent state.',
    highlights: ['If any operation within a transaction fails,…'],
  },
  {
    id: 1315, category: 'Node.js', difficulty: 'Junior',
    question: 'What is the difference between hashing, encryption, and encoding?',
    answer: 'Encoding transforms data into another format for compatibility (Base64) — fully reversible, no security purpose. Encryption transforms data reversibly using a key, keeping it secret from anyone without that key. Hashing is one-way (irreversible), used to verify integrity or store passwords without ever storing the original value.',
    highlights: ['Encoding transforms data into another format for…', 'fully reversible, no security purpose', 'Encryption transforms data reversibly using a key,…'],
  },
  {
    id: 1316, category: 'Node.js', difficulty: 'Mid',
    question: 'How do you identify slow queries in MongoDB?',
    answer: 'Enable the database profiler (db.setProfilingLevel(1, {slowms: 100})) to log queries exceeding a threshold, or use .explain(\'executionStats\') on a specific query to inspect whether it\'s using an index or performing a full collection scan.',
    highlights: ['Enable the database profiler…'],
  },
  {
    id: 1317, category: 'Node.js', difficulty: 'Senior',
    question: 'How do you configure failover and disaster recovery in MongoDB?',
    answer: 'Deploy a replica set (typically 3+ nodes across availability zones) so a secondary is automatically elected primary on failure, combine with regular backups/snapshots, and for multi-region resilience consider sharded clusters with geographically distributed replica sets.',
    highlights: ['Deploy a replica set (typically 3+ nodes across…'],
  },
  {
    id: 1318, category: 'Node.js', difficulty: 'Junior',
    question: 'What is a load balancer? How do you implement it in Node.js?',
    answer: 'A load balancer distributes incoming traffic across multiple server instances to prevent overload and enable horizontal scaling. In Node, this is typically handled externally (Nginx, AWS ELB) or via the cluster module distributing connections across worker processes on one machine.',
    highlights: ['A load balancer distributes incoming traffic across…', 'In Node, this is typically handled externally…'],
  },
  {
    id: 1319, category: 'Node.js', difficulty: 'Mid',
    question: 'How do you avoid schema pitfalls in MongoDB?',
    answer: 'Avoid unbounded array growth inside a single document (document size limit is 16MB), design around actual query patterns rather than mirroring relational tables, and use references instead of embedding for data that grows large or is shared across many parents.',
    highlights: ['Avoid unbounded array growth inside a single…'],
  },
  {
    id: 1320, category: 'Node.js', difficulty: 'Mid',
    question: 'What measures do you take to write efficient MongoDB queries?',
    answer: 'Filter early with indexed fields, project only needed fields, avoid regex queries without anchors (can\'t use indexes efficiently), use aggregation pipeline stages that reduce document count as early as possible, and paginate large result sets.',
    highlights: ['Filter early with indexed fields, project only…'],
  },
  {
    id: 1321, category: 'Node.js', difficulty: 'Mid',
    question: 'How do you implement health checks in MongoDB?',
    answer: 'Expose a lightweight /health endpoint that pings the database (e.g. a trivial ping command or admin.command(\'ping\')) and reports connectivity/latency, used by load balancers/orchestrators (Kubernetes) to determine if an instance should receive traffic.',
    highlights: ['Expose a lightweight /health endpoint that pings…', 'a trivial ping command or admin.command(\'ping\'))…'],
  },
  {
    id: 1322, category: 'Node.js', difficulty: 'Senior',
    question: 'What is Kafka? Explain its use cases.',
    answer: 'Kafka is a distributed event-streaming platform for high-throughput, durable, publish-subscribe messaging between services — used for event-driven microservices communication, log aggregation, real-time analytics pipelines, and decoupling producers from consumers at scale.',
    highlights: ['Kafka is a distributed event-streaming platform for…', 'used for event-driven microservices communication,…'],
  },
  {
    id: 1323, category: 'Node.js', difficulty: 'Mid',
    question: 'What are the SOLID principles for software development?',
    answer: 'Single Responsibility (one reason to change), Open/Closed (open for extension, closed for modification), Liskov Substitution (subtypes must be substitutable for base types), Interface Segregation (prefer many small interfaces over one large one), Dependency Inversion (depend on abstractions, not concrete implementations).',
    highlights: ['Single Responsibility (one reason to change),…'],
  },
  {
    id: 1324, category: 'Node.js', difficulty: 'Mid',
    question: 'Explain best practices for designing and building REST APIs.',
    answer: 'Use nouns for resource URLs and HTTP methods for actions, version your API (/v1/), return consistent JSON error shapes and proper status codes, paginate large collections, support filtering/sorting via query params, and document endpoints (OpenAPI/Swagger).',
    highlights: ['Use nouns for resource URLs and HTTP methods for…'],
  },
  {
    id: 1325, category: 'Node.js', difficulty: 'Mid',
    question: 'How do you connect a MongoDB database to a Node.js application?',
    answer: 'Use Mongoose (an ODM): mongoose.connect(process.env.MONGO_URI), then define schemas/models to interact with collections in a structured, validated way — or the native MongoDB driver for lower-level control without a schema layer.',
    highlights: ['Use Mongoose (an ODM):…', 'or the native MongoDB driver for lower-level…'],
  },
  {
    id: 1326, category: 'Node.js', difficulty: 'Senior',
    question: 'How do you design scalable REST APIs with Node.js and Express?',
    answer: 'Keep the API stateless, use pagination/filtering to bound response sizes, cache expensive reads, apply rate limiting, design for horizontal scaling (no in-memory session state), and separate concerns via layered architecture (routes/controllers/services/data access).',
    highlights: ['Keep the API stateless, use pagination/filtering to…'],
  },
  {
    id: 1327, category: 'Node.js', difficulty: 'Mid',
    question: 'How do you handle API versioning and backward compatibility?',
    answer: 'Version explicitly in the URL (/api/v1/) or via a custom header, maintain old versions until clients migrate, avoid breaking changes to existing fields (add new optional fields instead of altering/removing existing ones), and communicate deprecation timelines clearly.',
    highlights: ['Version explicitly in the URL (/api/v1/) or via a…'],
  },
  {
    id: 1328, category: 'Node.js', difficulty: 'Senior',
    question: 'What are WebSockets and how do you implement real-time features in MERN?',
    answer: 'WebSockets provide a persistent, full-duplex connection between client and server (unlike request/response HTTP), enabling instant push updates. In MERN, Socket.IO on the Express server manages connections/rooms, and the React client subscribes via the socket.io-client library.',
    highlights: ['WebSockets provide a persistent, full-duplex…', 'In MERN, Socket.IO on the Express server manages…'],
  },
  {
    id: 1329, category: 'Node.js', difficulty: 'Mid',
    question: 'How do you secure MERN applications against common vulnerabilities?',
    answer: 'Sanitize/validate all input (prevent NoSQL injection/XSS), use helmet for secure HTTP headers, hash passwords with bcrypt, use HTTPS everywhere, implement rate limiting and CORS restrictions, and keep dependencies patched against known CVEs.',
    highlights: ['Sanitize/validate all input (prevent NoSQL…'],
  },
  {
    id: 1330, category: 'Node.js', difficulty: 'Mid',
    question: 'Explain how to implement server-side rendering (SSR) vs client-side rendering (CSR).',
    answer: 'CSR ships a mostly-empty HTML shell and lets the browser download JS to render content client-side (faster subsequent navigation, slower first paint/SEO). SSR renders full HTML on the server per request (faster first paint, better SEO), then hydrates on the client for interactivity.',
    highlights: ['CSR ships a mostly-empty HTML shell and lets the…', 'SSR renders full HTML on the server per request…'],
  },
  {
    id: 1331, category: 'Node.js', difficulty: 'Mid',
    question: 'What are best practices for error handling in MERN applications?',
    answer: 'Centralize error handling via Express error middleware, use custom error classes with status codes, never leak stack traces/internal details to clients in production, log errors with context, and handle errors consistently on the React side with error boundaries and try/catch.',
    highlights: ['Centralize error handling via Express error…'],
  },
  {
    id: 1332, category: 'Node.js', difficulty: 'Senior',
    question: 'How would you scale a MERN stack application to handle high traffic?',
    answer: 'Horizontally scale stateless API instances behind a load balancer, cache hot data in Redis, use a CDN for static assets, add database read replicas/sharding, and use a message queue to decouple slow background work from the request/response cycle.',
    highlights: ['Horizontally scale stateless API instances behind a…'],
  },
  {
    id: 1333, category: 'Node.js', difficulty: 'Mid',
    question: 'Describe your deployment workflow for a full MERN stack application.',
    answer: 'Push triggers a CI pipeline running lint/tests/build, Docker images are built and pushed to a registry, then deployed to the target environment (ECS/Kubernetes/EC2) via a CD tool, with environment variables/secrets injected at deploy time and health checks gating traffic cutover.',
    highlights: ['Push triggers a CI pipeline running…'],
  },
  {
    id: 1334, category: 'Node.js', difficulty: 'Mid',
    question: 'How do you install and use MongoDB locally for testing?',
    answer: 'Install MongoDB Community Server (or run it via Docker: docker run -d -p 27017:27017 mongo), connect via mongosh or Compass for a GUI, or use an in-memory MongoDB instance (mongodb-memory-server) for isolated automated tests.',
    highlights: ['Install MongoDB Community Server (or run it via…'],
  },
  {
    id: 1335, category: 'Node.js', difficulty: 'Mid',
    question: 'How do you handle large file uploads in Node.js (using streams)?',
    answer: 'Stream the upload directly to disk/cloud storage (e.g. via multer with streaming, or piping the request stream to an S3 upload) instead of buffering the entire file in memory, preventing memory exhaustion on large files.',
    highlights: ['Stream the upload directly to disk/cloud storage (e.g', 'via multer with streaming, or piping the request…'],
  },
  {
    id: 1336, category: 'Node.js', difficulty: 'Mid',
    question: 'SQL joins, aggregations, and GROUP BY queries — explain with examples.',
    answer: 'INNER JOIN returns matching rows across two tables; LEFT JOIN also includes unmatched rows from the left table. GROUP BY combined with aggregate functions (COUNT, SUM, AVG) summarizes rows sharing a value: SELECT dept, COUNT(*) FROM employees GROUP BY dept.',
    highlights: ['INNER JOIN returns matching rows across two tables;…', 'GROUP BY combined with aggregate functions (COUNT,…'],
  },
  {
    id: 1337, category: 'Node.js', difficulty: 'Senior',
    question: 'How would you design a banking transaction system with ACID compliance, concurrency handling, and failure recovery?',
    answer: 'Use database transactions (ACID) so a transfer\'s debit and credit either both commit or both roll back, apply row-level locking or optimistic concurrency control to prevent race conditions on balances, and maintain an immutable ledger/audit log for reconciliation and failure recovery.',
    highlights: ['Use database transactions (ACID) so a transfer\'s…'],
  },
  {
    id: 1338, category: 'Node.js', difficulty: 'Junior',
    question: 'What cloud platforms have you used? What is an S3 Bucket? What EC2 instance types have you used?',
    answer: 'S3 is AWS\'s object storage service for files/static assets, organized into buckets with configurable access policies. EC2 provides resizable virtual server instances (e.g. t3.medium for general workloads, c5 for compute-intensive tasks) billed by usage.',
    highlights: ['S3 is AWS\'s object storage service for files/static…', 'EC2 provides resizable virtual server instances (e.g', 't3.medium for general workloads, c5 for…'],
  },
  {
    id: 1340, category: 'Node.js', difficulty: 'Junior',
    question: 'What is the difference between CommonJS (require) and ES Modules (import/export) in Node.js?',
    answer: 'CommonJS (require/module.exports) loads modules synchronously and was Node\'s original module system. ES Modules (import/export) are the standardized JS module system, support static analysis (enabling tree-shaking) and top-level await, and load asynchronously — Node supports both via .cjs/.mjs extensions or package.json\'s \'type\' field.',
    highlights: ['CommonJS (require/module.exports) loads modules…', 'ES Modules (import/export) are the standardized JS…', 'Node supports both via .cjs/.mjs extensions or…'],
  },
  {
    id: 1341, category: 'Node.js', difficulty: 'Mid',
    question: 'How do you handle environment variables securely in a Node.js application?',
    answer: 'Store secrets in a .env file (never committed to version control, loaded via dotenv) or a proper secrets manager (AWS Secrets Manager, Vault) in production, and never hardcode credentials or expose them in client-shipped code.',
    highlights: ['Store secrets in a .env file (never committed to…'],
  },
  {
    id: 1342, category: 'Node.js', difficulty: 'Senior',
    question: 'How would you implement a GraphQL API with Node.js? Compare it with REST.',
    answer: 'Use Apollo Server or express-graphql to define a schema (types, queries, mutations) and resolvers, letting clients request exactly the fields they need in a single request. Compared to REST, GraphQL avoids over/under-fetching and multiple round trips, but adds complexity in caching and query cost control.',
    highlights: ['Use Apollo Server or express-graphql to define a…', 'Compared to REST, GraphQL avoids…'],
  },
  {
    id: 1343, category: 'Node.js', difficulty: 'Senior',
    question: 'What is a message queue? How would you use RabbitMQ or Kafka in a MERN app?',
    answer: 'A message queue decouples producers and consumers by buffering messages between services asynchronously. In a MERN app, you might publish an \'order placed\' event to RabbitMQ/Kafka from the API, letting separate worker services (email, inventory) consume it independently without blocking the original request.',
    highlights: ['A message queue decouples producers and consumers…', 'In a MERN app, you might publish an \'order placed\'…'],
  },
  {
    id: 1344, category: 'Node.js', difficulty: 'Senior',
    question: 'How do you implement distributed tracing and observability in a Node.js microservices app?',
    answer: 'Instrument services with OpenTelemetry to propagate a trace ID across service boundaries (via headers), export spans to a backend like Jaeger or Datadog APM, and correlate logs/metrics/traces together to diagnose latency across the full request path.',
    highlights: ['Instrument services with OpenTelemetry to propagate…'],
  },
  {
    id: 1345, category: 'Node.js', difficulty: 'Junior',
    question: 'What is gRPC and when would you prefer it over REST?',
    answer: 'gRPC is a high-performance RPC framework using Protocol Buffers (binary, strongly-typed) over HTTP/2, supporting streaming and code generation across languages. Prefer it over REST for internal service-to-service communication needing low latency and strict contracts, less so for public-facing browser-consumed APIs.',
    highlights: ['gRPC is a high-performance RPC framework using…', 'Prefer it over REST for internal service-to-service…'],
  },
  {
    id: 1346, category: 'Node.js', difficulty: 'Senior',
    question: 'How do you implement API gateway patterns in a microservices architecture?',
    answer: 'An API gateway is a single entry point that routes requests to the appropriate backend microservice, handling cross-cutting concerns centrally — authentication, rate limiting, request/response transformation, and aggregation of multiple service calls into one client-facing response.',
    highlights: ['An API gateway is a single entry point that routes…', 'authentication, rate limiting, request/response…'],
  },
  {
    id: 1347, category: 'Node.js', difficulty: 'Senior',
    question: 'What is the difference between horizontal and vertical scaling?',
    answer: 'Vertical scaling adds more resources (CPU/RAM) to a single existing server — simple but has a hard ceiling. Horizontal scaling adds more server instances running in parallel behind a load balancer — more complex but scales further and improves fault tolerance.',
    highlights: ['Vertical scaling adds more resources (CPU/RAM) to a…', 'simple but has a hard ceiling', 'Horizontal scaling adds more server instances…'],
  },
  {
    id: 1348, category: 'Node.js', difficulty: 'Senior',
    question: 'How do you implement a circuit breaker pattern in Node.js?',
    answer: 'Wrap calls to an unreliable dependency with a circuit breaker (e.g. using the \'opossum\' library): after a threshold of failures, the circuit \'opens\' and fails fast without calling the dependency for a cooldown period, then allows a trial request through to test recovery before fully \'closing\' again.',
    highlights: ['Wrap calls to an unreliable dependency with a…', 'using the \'opossum\' library): after a threshold of…'],
  },

  // ─── DSA (from Interview Masterpack) ───

  {
    id: 1349, category: 'DSA', difficulty: 'Mid',
    question: 'Find duplicates in an array: arr = [1,2,3,4,3,2,9,7,4,9,8,2,4]. Return [2,3,4,9].',
    answer: 'Build a frequency count using a Map/object in one pass, then collect keys whose count exceeds 1. O(n) time, O(n) space.',
    highlights: ['Build a frequency count using a Map/object in one…', 'O(n) time, O(n) space'],
  },
  {
    id: 1350, category: 'DSA', difficulty: 'Mid',
    question: 'Remove duplicate items from an array without using Set.',
    answer: 'Iterate the array, and for each element check if it already exists in a results array (using indexOf or a plain object as a seen-tracker) before pushing — O(n²) with indexOf, or O(n) using an object/map as the seen-tracker.',
    highlights: ['Iterate the array, and for each element check if it…', 'O(n²) with indexOf, or O(n) using an object/map as…'],
  },
  {
    id: 1351, category: 'DSA', difficulty: 'Junior',
    question: 'Reverse a string without using the built-in .reverse() method.',
    answer: 'Loop from the last index to the first, appending each character to a result string, or use two-pointer swapping if working with a character array in place.',
    highlights: ['Loop from the last index to the first, appending…'],
  },
  {
    id: 1352, category: 'DSA', difficulty: 'Junior',
    question: 'Write a bubble sort algorithm in JavaScript.',
    answer: 'Repeatedly compare adjacent elements and swap if out of order, making multiple passes until no swaps are needed in a full pass — O(n²) time, O(1) space, stable sort.',
    highlights: ['Repeatedly compare adjacent elements and swap if…', 'O(n²) time, O(1) space, stable sort'],
  },
  {
    id: 1353, category: 'DSA', difficulty: 'Mid',
    question: 'Write a selection sort and insertion sort algorithm in JavaScript.',
    answer: 'Selection sort: repeatedly find the minimum of the unsorted portion and swap it to the front — O(n²). Insertion sort: build the sorted portion one element at a time, shifting larger elements right to insert each new value in place — O(n²) worst case, O(n) best case (nearly sorted data).',
    highlights: ['Selection sort: repeatedly find the minimum of the…', 'Insertion sort: build the sorted portion one…', 'O(n²) worst case, O(n) best case (nearly sorted data)'],
  },
  {
    id: 1354, category: 'DSA', difficulty: 'Mid',
    question: 'Find the longest substring without repeating characters. (Sliding window technique)',
    answer: 'Maintain a sliding window with a Set of seen characters; expand the right pointer, and when a duplicate is found, shrink the left pointer past the duplicate\'s previous position — track the max window length, O(n) time.',
    highlights: ['Maintain a sliding window with a Set of seen…', 'track the max window length, O(n) time'],
  },
  {
    id: 1355, category: 'DSA', difficulty: 'Mid',
    question: 'Count element occurrences in an array. Return as an object/map.',
    answer: 'arr.reduce((acc, val) => { acc[val] = (acc[val]||0)+1; return acc; }, {}) builds a frequency map in a single O(n) pass.',
    highlights: ['arr.reduce((acc, val) => { acc[val] =…'],
  },
  {
    id: 1356, category: 'DSA', difficulty: 'Junior',
    question: 'Find the maximum and minimum element in an unsorted array.',
    answer: 'Iterate once, tracking a running max and min, updating each whenever a larger/smaller element is found — O(n) time, avoiding the need to sort first.',
    highlights: ['Iterate once, tracking a running max and min,…', 'O(n) time, avoiding the need to sort first'],
  },
  {
    id: 1357, category: 'DSA', difficulty: 'Mid',
    question: 'Merge two sorted arrays into one sorted array without using sort().',
    answer: 'Use two pointers, one per array; repeatedly compare the current elements and push the smaller one into the result, advancing that pointer — then append any remaining elements from whichever array isn\'t exhausted. O(n+m) time.',
    highlights: ['Use two pointers, one per array; repeatedly compare…', 'then append any remaining elements from whichever…', 'O(n+m) time'],
  },
  {
    id: 1358, category: 'DSA', difficulty: 'Mid',
    question: 'Flatten a deeply nested array without using Array.flat().',
    answer: 'Recursively check each element: if it\'s an array, recurse and concatenate its flattened result; otherwise push it directly to the output array.',
    highlights: ['Recursively check each element: if it\'s an array,…'],
  },
  {
    id: 1359, category: 'DSA', difficulty: 'Mid',
    question: 'Find if a value 10 exists in a deeply nested array: [1, [2, 3, [4, 5, [6, 7]]], [8, 9, [10]]].',
    answer: 'Recursively traverse: for each element, if it\'s an array recurse into it, otherwise compare it to the target and return true on a match — or flatten first with flat(Infinity) then use .includes().',
    highlights: ['Recursively traverse: for each element, if it\'s an…', 'or flatten first with flat(Infinity) then use…'],
  },
  {
    id: 1360, category: 'DSA', difficulty: 'Mid',
    question: 'Convert an array into an object: [1,2,3] -> {\'0\':1,\'1\':2,\'2\':3}. Explain why keys are strings.',
    answer: '{...arr} or Object.assign({}, arr) converts index-value pairs into object properties. JS object keys are always coerced to strings internally (except Symbols), which is why numeric indices appear as string keys in the resulting object.',
    highlights: ['{...arr} or Object.assign({}, arr) converts…', 'JS object keys are always coerced to strings…'],
  },
  {
    id: 1362, category: 'DSA', difficulty: 'Junior',
    question: 'Write a program to check if two strings are anagrams.',
    answer: 'Sort both strings\' characters and compare for equality, or build a character-frequency count for each and compare the counts — both run in O(n log n) or O(n) respectively.',
    highlights: ['Sort both strings\' characters and compare for…', 'both run in O(n log n) or O(n) respectively'],
  },
  {
    id: 1363, category: 'DSA', difficulty: 'Mid',
    question: 'Find the first non-repeating character in a string.',
    answer: 'Build a frequency map of each character in one pass, then iterate the string again in order and return the first character whose count is exactly 1.',
    highlights: ['Build a frequency map of each character in one…'],
  },
  {
    id: 1364, category: 'DSA', difficulty: 'Junior',
    question: 'Write a function to check if a string is a palindrome.',
    answer: 'Use two pointers starting at both ends, moving inward and comparing characters at each step until they meet or a mismatch is found — or compare the string to its reversed version directly.',
    highlights: ['Use two pointers starting at both ends, moving…', 'or compare the string to its reversed version directly'],
  },
  {
    id: 1365, category: 'DSA', difficulty: 'Mid',
    question: 'Sort an array of objects by a specific property.',
    answer: 'arr.sort((a, b) => a.property > b.property ? 1 : -1) or, for numeric properties, arr.sort((a,b) => a.property - b.property) for ascending order.',
    highlights: ['arr.sort((a, b) => a.property > b.property ? 1 :…', 'b.property) for ascending order'],
  },
  {
    id: 1366, category: 'DSA', difficulty: 'Mid',
    question: 'Find the intersection and union of two arrays.',
    answer: 'Intersection: arr1.filter(x => new Set(arr2).has(x)) keeps only shared elements. Union: [...new Set([...arr1, ...arr2])] combines both and removes duplicates.',
    highlights: ['Intersection: arr1.filter(x => new…', 'Union: [...new Set([...arr1, ...arr2])] combines…'],
  },
  {
    id: 1367, category: 'DSA', difficulty: 'Mid',
    question: 'Given an array of integers, find two numbers that add up to a target sum (Two Sum problem).',
    answer: 'Use a hash map: iterate once, and for each number check if (target - number) already exists in the map; if so return the pair, otherwise store the current number\'s index — achieves O(n) time instead of the O(n²) brute-force nested loop.',
    highlights: ['Use a hash map: iterate once, and for each number…', 'number) already exists in the map; if so return the…', 'achieves O(n) time instead of the O(n²) brute-force…'],
  },
  {
    id: 1368, category: 'DSA', difficulty: 'Mid',
    question: 'Write a function to rotate an array by k positions.',
    answer: 'Use the reversal algorithm: reverse the whole array, then reverse the first k elements, then reverse the remaining n-k elements — achieves an in-place O(n) rotation without extra array space.',
    highlights: ['Use the reversal algorithm: reverse the whole…', 'achieves an in-place O(n) rotation without extra…'],
  },
  {
    id: 1369, category: 'DSA', difficulty: 'Senior',
    question: 'Write a Fibonacci series using recursion and also using dynamic programming (memoization).',
    answer: 'Naive recursion: fib(n) = fib(n-1)+fib(n-2), exponential time due to repeated subproblems. With memoization (a cache/array storing already-computed values), each value is computed only once, bringing it down to O(n) time.',
    highlights: ['Naive recursion: fib(n) = fib(n-1)+fib(n-2),…', 'With memoization (a cache/array storing…'],
  },
  {
    id: 1370, category: 'DSA', difficulty: 'Junior',
    question: 'Write a factorial function using recursion.',
    answer: 'function factorial(n){ return n <= 1 ? 1 : n * factorial(n-1); } — the base case (n<=1 returns 1) prevents infinite recursion.',
    highlights: ['function factorial(n){ return n <= 1 ? 1 : n *…', 'the base case (n<=1 returns 1) prevents infinite…'],
  },
  {
    id: 1371, category: 'DSA', difficulty: 'Mid',
    question: 'Implement binary search on a sorted array.',
    answer: 'Repeatedly compare the target to the middle element of the current search range; if equal, return it; if smaller, search the left half; if larger, search the right half — halving the search space each step for O(log n) time.',
    highlights: ['Repeatedly compare the target to the middle element…', 'halving the search space each step for O(log n) time'],
  },
  {
    id: 1372, category: 'DSA', difficulty: 'Mid',
    question: 'Solve the coin change problem: find minimum number of coins to make a target amount.',
    answer: 'Use dynamic programming: build a dp array where dp[i] is the minimum coins needed for amount i, computed as min(dp[i], dp[i-coin]+1) for every coin ≤ i — dp[amount] gives the final answer (or indicates it\'s impossible).',
    highlights: ['Use dynamic programming: build a dp array where…', 'dp[amount] gives the final answer (or indicates…'],
  },
  {
    id: 1373, category: 'DSA', difficulty: 'Mid',
    question: 'Implement a recursive deep clone (deep copy) of a nested object/array.',
    answer: 'Recursively check each value: if it\'s an object/array, create a new empty container and recurse into each of its properties/elements; otherwise copy the primitive value directly — building a fully independent copy with no shared references.',
    highlights: ['Recursively check each value: if it\'s an…', 'building a fully independent copy with no shared…'],
  },
  {
    id: 1374, category: 'DSA', difficulty: 'Mid',
    question: 'Write a polyfill for Array.prototype.reduce().',
    answer: 'Array.prototype.myReduce = function(cb, init){ let acc = init !== undefined ? init : this[0]; let i = init !== undefined ? 0 : 1; for(; i<this.length; i++) acc = cb(acc, this[i], i, this); return acc; };',
    highlights: ['Array.prototype.myReduce = function(cb, init){ let…'],
  },
  {
    id: 1375, category: 'DSA', difficulty: 'Mid',
    question: 'Write a polyfill for Array.prototype.map() and Array.prototype.filter().',
    answer: 'myMap loops through and pushes cb(el) for every element into a result array. myFilter loops through and pushes the element itself only when cb(el) returns true — both preserve the original array unmodified.',
    highlights: ['myMap loops through and pushes cb(el) for every…', 'myFilter loops through and pushes the element…', 'both preserve the original array unmodified'],
  },
  {
    id: 1376, category: 'DSA', difficulty: 'Mid',
    question: 'Implement a Stack and a Queue using arrays in JavaScript.',
    answer: 'Stack (LIFO): push() and pop() both operate on the array\'s end. Queue (FIFO): enqueue via push() at the end, dequeue via shift() from the front (or use two pointers for O(1) dequeue instead of shift\'s O(n)).',
    highlights: ['Stack (LIFO): push() and pop() both operate on the…', 'Queue (FIFO): enqueue via push() at the end,…'],
  },
  {
    id: 1377, category: 'DSA', difficulty: 'Mid',
    question: 'Implement a basic Linked List with insert, delete, and search operations.',
    answer: 'Each node holds {value, next}. Insert: traverse to the desired position and relink pointers. Delete: find the target node and bypass it by relinking its predecessor\'s next pointer to its successor. Search: traverse node by node comparing values until found or the list ends.',
    highlights: ['Each node holds {value, next}', 'Insert: traverse to the desired position and relink…', 'Delete: find the target node and bypass it by…'],
  },
  {
    id: 1378, category: 'DSA', difficulty: 'Mid',
    question: 'Reverse a linked list (iterative and recursive approaches).',
    answer: 'Iterative: walk the list keeping prev/current pointers, reversing each node\'s \'next\' to point backward as you go. Recursive: recurse to the end of the list first, then reverse the link on the way back up the call stack.',
    highlights: ['Iterative: walk the list keeping prev/current…', 'Recursive: recurse to the end of the list first,…'],
  },
  {
    id: 1379, category: 'DSA', difficulty: 'Mid',
    question: 'Detect if a linked list has a cycle (Floyd\'s tortoise and hare algorithm).',
    answer: 'Use two pointers moving at different speeds (slow moves 1 step, fast moves 2 steps) — if they ever meet, a cycle exists; if fast reaches the end (null), there is no cycle. O(n) time, O(1) space.',
    highlights: ['Use two pointers moving at different speeds (slow…', 'if they ever meet, a cycle exists; if fast reaches…', 'O(n) time, O(1) space'],
  },
  {
    id: 1380, category: 'DSA', difficulty: 'Mid',
    question: 'Implement a Binary Search Tree with insert and search.',
    answer: 'Insert: recursively compare the new value to the current node — go left if smaller, right if larger, and insert when you reach a null spot. Search: recursively navigate left/right the same way until the value is found or you hit a null node.',
    highlights: ['Insert: recursively compare the new value to the…', 'go left if smaller, right if larger, and insert…', 'Search: recursively navigate left/right the same…'],
  },
  {
    id: 1381, category: 'DSA', difficulty: 'Senior',
    question: 'Write a BFS (Breadth-First Search) and DFS (Depth-First Search) for a graph.',
    answer: 'BFS uses a queue: visit a node, mark it visited, then enqueue all its unvisited neighbors, processing level by level. DFS uses a stack (or recursion): visit a node, mark it visited, then recursively/iteratively explore one unvisited neighbor\'s full branch before backtracking.',
    highlights: ['BFS uses a queue: visit a node, mark it visited,…', 'DFS uses a stack (or recursion): visit a node, mark…'],
  },
  {
    id: 1384, category: 'DSA', difficulty: 'Mid',
    question: 'Write a Promise that resolves if value < 5, then chain it to transform the result.',
    answer: `A simple Promise coding question that lets you demonstrate chaining, error handling, and async/await fluency in one answer.`,
    code: `// Basic conditional Promise
const checkValue = (value) =>
  new Promise((resolve, reject) =>
    value < 5
      ? resolve({ value, message: 'ok' })
      : reject(new Error(value + ' is not less than 5'))
  );

// Chain: validate → transform → display
checkValue(3)
  .then(result => ({ ...result, doubled: result.value * 2 })) // transform
  .then(data   => console.log('Result:', data))               // { value:3, message:'ok', doubled:6 }
  .catch(err   => console.error('Error:', err.message));

// async/await version — conditional branching is cleaner
async function process(value) {
  try {
    const result = await checkValue(value);
    if (result.value === 0) return 'zero';
    return result.message + ' — value is ' + result.value;
  } catch (err) {
    return 'rejected: ' + err.message;
  }
}

console.log(await process(3)); // 'ok — value is 3'
console.log(await process(7)); // 'rejected: 7 is not less than 5'`,
    highlights: [
      'Reject with new Error() — always use Error objects, not plain strings',
      'Each .then() can transform the value — returning a new object shape',
      'async/await makes conditional post-processing cleaner than nested .then()',
    ],
  },
  {
    id: 1385, category: 'DSA', difficulty: 'Senior',
    question: 'Implement Promise.all, Promise.race, and Promise.any from scratch — with edge cases.',
    answer: `Core insight: all three combinators wrap input promises inside a new Promise, subscribing to each one and deciding when to resolve/reject the outer Promise based on the combinator's rules. Promise state immutability — the fact that resolve()/reject() can only fire once — is the mechanism that makes Promise.race() work without any bookkeeping.`,
    code: `// Promise.all — every input must fulfill, results in input order
Promise.myAll = function(promises) {
  return new Promise((resolve, reject) => {
    if (!promises.length) return resolve([]); // edge case: empty array
    const results = new Array(promises.length);
    let done = 0;
    promises.forEach((p, i) => {
      Promise.resolve(p)             // handles non-Promise values safely
        .then(val => {
          results[i] = val;          // store at ORIGINAL index, not arrival order
          if (++done === promises.length) resolve(results);
        })
        .catch(reject);              // first rejection → outer rejects immediately
    });
  });
};

// Promise.race — first to settle (fulfil OR reject) determines outcome
Promise.myRace = function(promises) {
  return new Promise((resolve, reject) => {
    promises.forEach(p => {
      Promise.resolve(p).then(resolve).catch(reject);
      // Promise immutability: after first resolve/reject, subsequent calls are no-ops
    });
  });
};

// Promise.any — first to FULFILL wins; rejects only if ALL reject
Promise.myAny = function(promises) {
  return new Promise((resolve, reject) => {
    if (!promises.length)
      return reject(new AggregateError([], 'All promises were rejected'));
    const errors = new Array(promises.length);
    let rejCount = 0;
    promises.forEach((p, i) => {
      Promise.resolve(p)
        .then(resolve) // first fulfillment wins
        .catch(reason => {
          errors[i] = reason;
          if (++rejCount === promises.length)
            reject(new AggregateError(errors, 'All promises were rejected'));
        });
    });
  });
};

// Quick test
Promise.myAll([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)])
  .then(console.log); // [1, 2, 3]

Promise.myRace([
  new Promise(r => setTimeout(r, 200, 'slow')),
  Promise.resolve('fast')
]).then(console.log); // 'fast'

Promise.myAny([Promise.reject('x'), Promise.resolve('y'), Promise.reject('z')])
  .then(console.log); // 'y'`,
    highlights: [
      'Store results at original index — completion order differs from input order',
      'Promise.resolve(p) wraps plain values safely alongside real Promises',
      'Race relies on Promise immutability — no counter or flag needed',
    ],
  },
  {
    id: 1386, category: 'DSA', difficulty: 'Mid',
    question: 'Build an Event Emitter from scratch with on(), off(), and emit() methods.',
    answer: 'Store listeners in a Map keyed by event name, each mapping to an array of callback functions. on() pushes a callback, off() filters it out, emit() iterates and invokes every registered callback for that event with the given arguments.',
    highlights: ['Store listeners in a Map keyed by event name, each…', 'on() pushes a callback, off() filters it out,…'],
  },
  {
    id: 1387, category: 'DSA', difficulty: 'Mid',
    question: 'Implement retry logic with exponential backoff.',
    answer: 'Wrap the operation in a loop/recursive function that catches failures, waits an increasing delay (doubling each attempt, e.g. via setTimeout wrapped in a Promise) before retrying, up to a maximum retry count.',
    highlights: ['Wrap the operation in a loop/recursive function…', 'via setTimeout wrapped in a Promise) before…'],
  },
  {
    id: 1388, category: 'DSA', difficulty: 'Mid',
    question: 'Implement a deep compare utility function that handles nested objects, arrays, and edge cases.',
    answer: 'Recursively compare: if both are primitives, compare directly (with a special case for NaN); if both are objects/arrays, compare their key counts and then recursively compare each corresponding value — return false immediately on any type or value mismatch.',
    highlights: ['Recursively compare: if both are primitives,…', 'return false immediately on any type or value mismatch'],
  },
  {
    id: 1389, category: 'DSA', difficulty: 'Mid',
    question: 'Implement a deep merge function for two objects.',
    answer: 'Recursively walk both objects\' keys: if a key\'s value is itself a plain object in both sources, recursively merge those nested objects; otherwise the second object\'s value overwrites the first\'s for that key.',
    highlights: ['Recursively walk both objects\' keys: if a key\'s…'],
  },
  {
    id: 1390, category: 'DSA', difficulty: 'Mid',
    question: 'Write a function to group an array of objects by a property.',
    answer: 'arr.reduce((acc, item) => { const key = item[prop]; (acc[key] = acc[key] || []).push(item); return acc; }, {}) groups items into arrays keyed by the specified property\'s value.',
    highlights: ['arr.reduce((acc, item) => { const key = item[prop];…'],
  },
  {
    id: 1391, category: 'DSA', difficulty: 'Senior',
    question: 'Implement a LRU (Least Recently Used) cache using Map.',
    answer: 'A JS Map preserves insertion order, which we exploit: on get, delete and re-insert the key to mark it as most-recently-used; on put, if at capacity, delete the first (oldest) key via map.keys().next().value before inserting the new one — both operations run in O(1).',
    highlights: ['A JS Map preserves insertion order, which we…', 'both operations run in O(1)'],
  },
  {
    id: 1392, category: 'DSA', difficulty: 'Mid',
    question: 'Write a throttle and debounce function from scratch.',
    answer: 'Debounce: clear any pending timer and set a new one on every call, so the function only fires after calls stop for the specified delay. Throttle: track the last-executed timestamp and only allow the function to run again once the specified interval has passed since that timestamp.',
    highlights: ['Debounce: clear any pending timer and set a new one…', 'Throttle: track the last-executed timestamp and…'],
  },
  {
    id: 1393, category: 'DSA', difficulty: 'Mid',
    question: 'Implement memoization for a function with multiple arguments.',
    answer: 'Wrap the function so it builds a cache key by serializing all arguments (e.g. JSON.stringify(args)), checks a Map for that key before computing, and stores the result in the Map after computing it for the first time.',
    highlights: ['Wrap the function so it builds a cache key by…', 'JSON.stringify(args)), checks a Map for that key…'],
  },
  {
    id: 1394, category: 'DSA', difficulty: 'Mid',
    question: 'Given a machine coding round: Build a basic UI that fetches car brands from an API, displays models, and filters by brand.',
    answer: 'Fetch and store the brand list in state on mount; render a dropdown/select bound to a selectedBrand state value; on change, either filter an already-fetched full dataset client-side, or trigger a new fetch scoped to that brand and render the resulting models in a list.',
    highlights: ['Fetch and store the brand list in state on mount;…'],
  },

  // ─── AWS (from Interview Masterpack) ───

  {
    id: 1395, category: 'AWS', difficulty: 'Mid',
    question: 'What cloud platforms have you worked with? Describe your overall experience.',
    answer: 'Frame around concrete, specific experience: which services you used regularly (EC2, S3, Lambda, RDS), what you deployed with them, approximate scale (traffic/instance counts), and any cost-optimization or reliability work you owned.',
    highlights: ['Frame around concrete, specific experience: which…'],
  },
  {
    id: 1396, category: 'AWS', difficulty: 'Junior',
    question: 'What is AWS EC2? What instance types have you used and why?',
    answer: 'EC2 (Elastic Compute Cloud) provides resizable virtual servers billed by usage. Instance families are chosen by workload: t-series (burstable, general-purpose, cost-effective), c-series (compute-optimized, CPU-heavy tasks), m-series (balanced compute/memory), r-series (memory-optimized, e.g. caching/in-memory databases).',
    highlights: ['EC2 (Elastic Compute Cloud) provides resizable…', 'Instance families are chosen by workload: t-series…', 'caching/in-memory databases)'],
  },
  {
    id: 1397, category: 'AWS', difficulty: 'Junior',
    question: 'What is an S3 Bucket? How do you configure it for static website hosting?',
    answer: 'S3 (Simple Storage Service) is object storage organized into buckets. For static hosting: enable the \'Static website hosting\' property on the bucket, set an index/error document, and configure a public-read bucket policy (or serve via CloudFront for HTTPS and better performance).',
    highlights: ['S3 (Simple Storage Service) is object storage…', 'For static hosting: enable the \'Static website…'],
  },
  {
    id: 1398, category: 'AWS', difficulty: 'Junior',
    question: 'What is the difference between S3 Standard, S3-IA (Infrequent Access), and S3 Glacier storage classes?',
    answer: 'S3 Standard is for frequently accessed data (highest cost, lowest latency). S3-IA is cheaper for data accessed less often but needing fast retrieval when needed. Glacier is the cheapest, for long-term archival with retrieval times ranging from minutes to hours.',
    highlights: ['S3 Standard is for frequently accessed data…', 'S3-IA is cheaper for data accessed less often but…', 'Glacier is the cheapest, for long-term archival…'],
  },
  {
    id: 1399, category: 'AWS', difficulty: 'Junior',
    question: 'What is AWS CloudFront? How does it work as a CDN in front of S3?',
    answer: 'CloudFront is AWS\'s CDN — it caches content at globally distributed edge locations close to users, reducing latency and offloading traffic from the origin (e.g. an S3 bucket), while also providing HTTPS termination and DDoS protection.',
    highlights: ['CloudFront is AWS\'s CDN', 'it caches content at globally distributed edge…', 'an S3 bucket), while also providing HTTPS…'],
  },
  {
    id: 1400, category: 'AWS', difficulty: 'Junior',
    question: 'What is AWS Lambda? When would you choose serverless over EC2?',
    answer: 'Lambda runs code in response to triggers (API calls, events) without provisioning servers, billed per invocation/duration, and auto-scales instantly. Choose it for sporadic, event-driven, or unpredictable workloads; choose EC2 for constant, long-running, or highly customized server requirements.',
    highlights: ['Lambda runs code in response to triggers (API…', 'Choose it for sporadic, event-driven, or…'],
  },
  {
    id: 1401, category: 'AWS', difficulty: 'Senior',
    question: 'What is AWS API Gateway? How does it integrate with Lambda?',
    answer: 'API Gateway is a managed service for creating, publishing, and securing REST/HTTP/WebSocket APIs. It commonly routes incoming HTTP requests directly to Lambda functions, handling auth, throttling, and request/response transformation without managing your own server.',
    highlights: ['API Gateway is a managed service for creating,…', 'It commonly routes incoming HTTP requests directly…'],
  },
  {
    id: 1402, category: 'AWS', difficulty: 'Junior',
    question: 'What is AWS RDS vs DynamoDB? When would you use each?',
    answer: 'RDS is a managed relational database (MySQL/PostgreSQL/etc.) for structured data with complex relationships/transactions. DynamoDB is a managed NoSQL key-value/document store offering single-digit-millisecond latency at virtually unlimited scale, best for simple access patterns known in advance.',
    highlights: ['RDS is a managed relational database…', 'DynamoDB is a managed NoSQL key-value/document…'],
  },
  {
    id: 1403, category: 'AWS', difficulty: 'Junior',
    question: 'What is AWS Elastic Load Balancer (ELB)? How does it work with EC2 instances?',
    answer: 'ELB automatically distributes incoming traffic across multiple EC2 instances (in one or more Availability Zones), performing health checks and routing only to healthy instances — enabling horizontal scaling and fault tolerance.',
    highlights: ['ELB automatically distributes incoming traffic…', 'enabling horizontal scaling and fault tolerance'],
  },
  {
    id: 1404, category: 'AWS', difficulty: 'Senior',
    question: 'What is Auto Scaling in AWS? How does it help handle traffic spikes?',
    answer: 'Auto Scaling automatically adds or removes EC2 instances based on defined metrics (CPU utilization, request count) and thresholds, ensuring enough capacity during traffic spikes while reducing cost by scaling down during quiet periods.',
    highlights: ['Auto Scaling automatically adds or removes EC2…'],
  },
  {
    id: 1405, category: 'AWS', difficulty: 'Junior',
    question: 'What is AWS VPC (Virtual Private Cloud)? Explain subnets, security groups, and NACLs.',
    answer: 'A VPC is an isolated virtual network within AWS. Subnets divide it into smaller IP ranges (public-facing or private/internal). Security groups act as stateful instance-level firewalls (allow rules only). NACLs are stateless subnet-level firewalls supporting both allow and deny rules.',
    highlights: ['A VPC is an isolated virtual network within AWS', 'Subnets divide it into smaller IP ranges…', 'Security groups act as stateful instance-level…'],
  },
  {
    id: 1406, category: 'AWS', difficulty: 'Junior',
    question: 'What is AWS IAM? How do roles and policies work? Explain least privilege principle.',
    answer: 'IAM (Identity and Access Management) controls who can do what across AWS resources. Policies are JSON documents defining permitted/denied actions; roles are assumable identities (by users or services) granted specific policies. Least privilege means granting only the exact permissions needed, nothing more.',
    highlights: ['IAM (Identity and Access Management) controls who…', 'Policies are JSON documents defining…', 'Least privilege means granting only the exact…'],
  },
  {
    id: 1407, category: 'AWS', difficulty: 'Junior',
    question: 'What is AWS Secrets Manager vs AWS Parameter Store? How do you manage secrets?',
    answer: 'Secrets Manager is purpose-built for sensitive credentials, offering automatic rotation and fine-grained access control (at a per-secret cost). Parameter Store (part of Systems Manager) is a simpler, free/low-cost key-value store for config and secrets without built-in rotation.',
    highlights: ['Secrets Manager is purpose-built for sensitive…', 'Parameter Store (part of Systems Manager) is a…'],
  },
  {
    id: 1408, category: 'AWS', difficulty: 'Junior',
    question: 'What is AWS CloudWatch? How do you set up monitoring and alerts for a Node.js app?',
    answer: 'CloudWatch collects metrics, logs, and events across AWS resources. For a Node.js app: ship application logs via the CloudWatch agent/SDK, define custom metrics (response time, error rate), and configure alarms that trigger SNS notifications when thresholds are breached.',
    highlights: ['CloudWatch collects metrics, logs, and events…', 'For a Node.js app: ship application logs via the…'],
  },
  {
    id: 1409, category: 'AWS', difficulty: 'Junior',
    question: 'What is AWS Elastic Beanstalk? How is it different from deploying directly on EC2?',
    answer: 'Elastic Beanstalk is a PaaS that automatically provisions EC2, load balancers, auto-scaling, and monitoring from your uploaded application code — abstracting infrastructure management. Deploying directly on EC2 gives full control but requires manually configuring all of that yourself.',
    highlights: ['Elastic Beanstalk is a PaaS that automatically…', 'abstracting infrastructure management', 'Deploying directly on EC2 gives full control but…'],
  },
  {
    id: 1410, category: 'AWS', difficulty: 'Junior',
    question: 'What is AWS ECS (Elastic Container Service) and how does it relate to Docker?',
    answer: 'ECS is AWS\'s container orchestration service for running and scaling Docker containers, either on EC2 instances you manage or serverlessly via Fargate — handling scheduling, scaling, and service discovery for containerized applications.',
    highlights: ['ECS is AWS\'s container orchestration service for…', 'handling scheduling, scaling, and service discovery…'],
  },
  {
    id: 1411, category: 'AWS', difficulty: 'Junior',
    question: 'What is AWS ECR (Elastic Container Registry)?',
    answer: 'ECR is a managed Docker container registry for storing, versioning, and pulling container images, integrated directly with ECS/EKS for deployment and IAM for access control.',
    highlights: ['ECR is a managed Docker container registry for…'],
  },
  {
    id: 1412, category: 'AWS', difficulty: 'Junior',
    question: 'What is AWS SQS (Simple Queue Service)? How is it used for async message processing?',
    answer: 'SQS is a fully managed message queue that decouples producers from consumers — a producer sends a message to the queue, and one or more consumers poll and process it independently, providing durability and buffering against traffic spikes or slow downstream processing.',
    highlights: ['SQS is a fully managed message queue that decouples…', 'a producer sends a message to the queue, and one or…'],
  },
  {
    id: 1413, category: 'AWS', difficulty: 'Junior',
    question: 'What is AWS SNS (Simple Notification Service)? How is it different from SQS?',
    answer: 'SNS is a pub-sub messaging service that broadcasts a message to multiple subscribers simultaneously (fan-out to email, SMS, Lambda, SQS queues). SQS is point-to-point — a message sits in a queue until a single consumer processes and removes it.',
    highlights: ['SNS is a pub-sub messaging service that broadcasts…', 'SQS is point-to-point', 'a message sits in a queue until a single consumer…'],
  },
  {
    id: 1414, category: 'AWS', difficulty: 'Junior',
    question: 'What is AWS Route 53? How does DNS routing work for your deployed applications?',
    answer: 'Route 53 is AWS\'s scalable DNS service, mapping domain names to resources (ELB, CloudFront, EC2 IPs) and supporting routing policies like weighted, latency-based, geolocation, and failover routing for high availability.',
    highlights: ['Route 53 is AWS\'s scalable DNS service, mapping…'],
  },
  {
    id: 1415, category: 'AWS', difficulty: 'Junior',
    question: 'What is AWS CodePipeline / CodeDeploy? How do you set up a CI/CD pipeline on AWS?',
    answer: 'CodePipeline orchestrates the release process (source → build → test → deploy) across stages, often integrating CodeBuild for building/testing and CodeDeploy for automated, controlled deployment to EC2/ECS/Lambda with rollback support on failure.',
    highlights: ['CodePipeline orchestrates the release process…'],
  },
  {
    id: 1416, category: 'AWS', difficulty: 'Mid',
    question: 'How do you deploy a MERN stack app on AWS? Walk through your deployment workflow.',
    answer: 'Build the React app into static assets served via S3+CloudFront, deploy the Node/Express API on EC2/ECS/Elastic Beanstalk behind an ALB, use RDS or a managed MongoDB Atlas cluster for the database, and wire it together with CodePipeline for automated CI/CD.',
    highlights: ['Build the React app into static assets served via…'],
  },
  {
    id: 1417, category: 'AWS', difficulty: 'Senior',
    question: 'What is the difference between vertical and horizontal scaling in AWS?',
    answer: 'Vertical scaling resizes an existing instance to a bigger type (more CPU/RAM) — simple but has an upper limit and brief downtime during resize. Horizontal scaling adds more instances behind a load balancer via Auto Scaling — more resilient and effectively limitless.',
    highlights: ['Vertical scaling resizes an existing instance to a…', 'simple but has an upper limit and brief downtime…', 'Horizontal scaling adds more instances behind a…'],
  },
  {
    id: 1418, category: 'AWS', difficulty: 'Mid',
    question: 'How do you secure data at rest and in transit on AWS? (KMS, SSL/TLS, HTTPS)',
    answer: 'Encrypt data at rest using KMS-managed keys for S3/RDS/EBS volumes, and encrypt data in transit by enforcing HTTPS/TLS on all endpoints (via ACM certificates on ALB/CloudFront), never transmitting sensitive data over plain HTTP.',
    highlights: ['Encrypt data at rest using KMS-managed keys for…'],
  },
  {
    id: 1419, category: 'AWS', difficulty: 'Junior',
    question: 'What is AWS Cost Explorer? How do you optimize AWS costs for a production app?',
    answer: 'Cost Explorer visualizes and forecasts AWS spend by service/tag over time. Optimization strategies: right-size instances based on actual utilization, use Reserved/Savings Plans for predictable workloads, use Spot Instances for fault-tolerant batch work, and set up billing alerts/budgets.',
    highlights: ['Cost Explorer visualizes and forecasts AWS spend by…', 'Optimization strategies: right-size instances based…'],
  },
  {
    id: 1420, category: 'AWS', difficulty: 'Mid',
    question: 'What was the monthly traffic of your application and what AWS infra did you use to support it?',
    answer: 'Answer with real, specific numbers from your own project experience — approximate monthly active users/requests, the EC2 instance types and count, whether load balancing/auto-scaling was in place, and any caching (CloudFront/Redis) that reduced backend load.',
    highlights: ['Answer with real, specific numbers from your own…', 'approximate monthly active users/requests, the EC2…'],
  },
  {
    id: 1421, category: 'AWS', difficulty: 'Senior',
    question: 'How many EC2 instances did you run? Was it load-balanced? Did you use Auto Scaling?',
    answer: 'Answer based on your actual project: describe the instance count/type, whether an ALB distributed traffic across them, and the Auto Scaling policy (metric-based triggers, min/max instance bounds) used to handle demand fluctuations.',
    highlights: ['Answer based on your actual project: describe the…'],
  },
  {
    id: 1422, category: 'AWS', difficulty: 'Junior',
    question: 'What is an AMI (Amazon Machine Image)? How do you create and use one?',
    answer: 'An AMI is a pre-configured template (OS, application code, dependencies) used to launch EC2 instances quickly and consistently. Create one by configuring an instance exactly as needed, then using the \'Create Image\' action to snapshot it for future launches or Auto Scaling groups.',
    highlights: ['An AMI is a pre-configured template (OS,…', 'Create one by configuring an instance exactly as…'],
  },
  {
    id: 1423, category: 'AWS', difficulty: 'Junior',
    question: 'What is Infrastructure as Code? Have you used CloudFormation or Terraform on AWS?',
    answer: 'Infrastructure as Code defines cloud resources in version-controlled configuration files rather than manual console clicks, enabling repeatable, auditable deployments. CloudFormation (AWS-native, YAML/JSON) and Terraform (cloud-agnostic, HCL) are the two most common tools for this on AWS.',
    highlights: ['Infrastructure as Code defines cloud resources in…', 'CloudFormation (AWS-native, YAML/JSON) and…'],
  },
  {
    id: 1424, category: 'AWS', difficulty: 'Mid',
    question: 'What are best practices for securing an S3 bucket? (bucket policies, ACLs, block public access)',
    answer: 'Enable \'Block Public Access\' by default, use least-privilege bucket policies/IAM roles instead of broad ACLs, enable server-side encryption, enable versioning for recovery from accidental deletes, and enable access logging/CloudTrail for auditing.',
    highlights: ['Enable \'Block Public Access\' by default, use…'],
  },

  // ─── BEHAVIORAL (from Interview Masterpack) ───

  {
    id: 1425, category: 'Behavioral', difficulty: 'Mid',
    question: 'Tell me about yourself and walk me through your career journey.',
    answer: 'Structure it as a brief narrative: your current role and core stack, 1-2 standout achievements with measurable impact, why you\'re looking for a new opportunity now, and what you\'re excited to contribute to this specific role — keep it under 2 minutes.',
    highlights: ['Structure it as a brief narrative: your current…', 'keep it under 2 minutes'],
  },
  {
    id: 1426, category: 'Behavioral', difficulty: 'Mid',
    question: 'Why are you looking for a new opportunity? What motivates you to switch?',
    answer: 'Frame it positively around growth: seeking bigger scale/impact, product-company exposure, a stack/domain you want to deepen, or leadership opportunities — avoid criticizing your current employer directly.',
    highlights: ['Frame it positively around growth: seeking bigger…', 'avoid criticizing your current employer directly'],
  },
  {
    id: 1427, category: 'Behavioral', difficulty: 'Mid',
    question: 'What is your greatest strength as a developer? Give a specific example.',
    answer: 'Pick a genuine strength (e.g. debugging complex production issues, mentoring, system design) and back it with one concrete example showing the situation, your action, and the measurable outcome.',
    highlights: ['Pick a genuine strength (e.g', 'debugging complex production issues, mentoring,…'],
  },
  {
    id: 1428, category: 'Behavioral', difficulty: 'Mid',
    question: 'What is your greatest weakness, and how are you working to improve it?',
    answer: 'Choose a real, specific weakness (not a disguised strength), then show self-awareness and concrete action taken to improve it — e.g. \'I used to over-engineer solutions; I now default to the simplest working approach and iterate.\'',
    highlights: ['Choose a real, specific weakness (not a disguised…', '\'I used to over-engineer solutions; I now default…'],
  },
  {
    id: 1429, category: 'Behavioral', difficulty: 'Mid',
    question: 'Describe a time when you had a tight deadline and how you managed it.',
    answer: 'Use STAR: the Situation and stakes, the Task/deadline, the Actions (prioritization, communication with stakeholders, scope negotiation), and the Result — did you deliver on time, and what did you learn about your process?',
    highlights: ['Use STAR: the Situation and stakes, the…', 'did you deliver on time, and what did you learn…'],
  },
  {
    id: 1431, category: 'Behavioral', difficulty: 'Mid',
    question: 'Describe a disagreement within your team and how you resolved it.',
    answer: 'Focus on a genuine technical or process disagreement, show you listened to the other perspective, how you found common ground or escalated constructively, and the outcome — emphasize collaboration over \'winning.\'',
    highlights: ['Focus on a genuine technical or process…', 'emphasize collaboration over \'winning.\''],
  },
  {
    id: 1432, category: 'Behavioral', difficulty: 'Mid',
    question: 'What was the most challenging technical task you faced, and how did you solve it?',
    answer: 'Pick a task with real technical depth (a tricky bug, a performance bottleneck, a system design challenge), walk through your investigation process and the solution, and quantify the impact if possible.',
    highlights: ['Pick a task with real technical depth (a tricky…'],
  },
  {
    id: 1433, category: 'Behavioral', difficulty: 'Mid',
    question: 'Tell me about a time you failed. What did you learn from it?',
    answer: 'Choose a real failure with genuine consequences, own it honestly without excessive self-blame, and focus most of the answer on the concrete lesson and how you\'ve since applied it.',
    highlights: ['Choose a real failure with genuine consequences,…'],
  },
  {
    id: 1434, category: 'Behavioral', difficulty: 'Mid',
    question: 'Describe a situation where you had to learn a new technology quickly. How did you approach it?',
    answer: 'Describe your learning approach (docs, small proof-of-concept, pairing with an expert), the timeframe pressure, and how you successfully applied the new skill to deliver the actual task.',
    highlights: ['Describe your learning approach (docs, small…'],
  },
  {
    id: 1435, category: 'Behavioral', difficulty: 'Mid',
    question: 'How do you mentor junior developers and conduct code reviews?',
    answer: 'Explain your approach: pairing on hard problems, giving feedback that explains reasoning (not just corrections), encouraging questions, and balancing thoroughness with not blocking their progress unnecessarily.',
    highlights: ['Explain your approach: pairing on hard problems,…'],
  },
  {
    id: 1436, category: 'Behavioral', difficulty: 'Mid',
    question: 'How do you handle a situation where a colleague disagrees with your technical decision?',
    answer: 'Show openness to being wrong: ask them to walk through their reasoning, weigh trade-offs objectively, and either adjust your approach or explain your reasoning clearly — escalate to a lead only if consensus truly can\'t be reached.',
    highlights: ['Show openness to being wrong: ask them to walk…', 'escalate to a lead only if consensus truly can\'t be…'],
  },
  {
    id: 1437, category: 'Behavioral', difficulty: 'Mid',
    question: 'Describe a time you had to communicate a complex technical concept to a non-technical stakeholder.',
    answer: 'Describe how you translated technical detail into business impact/analogies the stakeholder could relate to, checked for understanding, and the outcome of that communication (buy-in, decision made, etc.).',
    highlights: ['Describe how you translated technical detail into…'],
  },
  {
    id: 1438, category: 'Behavioral', difficulty: 'Mid',
    question: 'Have you ever had to push back on a requirement? How did you handle it?',
    answer: 'Describe identifying a genuine issue (technical risk, unclear scope, unrealistic timeline), how you raised it with data/reasoning rather than just refusal, and how it was resolved collaboratively.',
    highlights: ['Describe identifying a genuine issue (technical…'],
  },
  {
    id: 1439, category: 'Behavioral', difficulty: 'Mid',
    question: 'How do you ensure your team delivers high-quality code within deadlines?',
    answer: 'Mention practices like code reviews, automated testing/CI gates, clear acceptance criteria upfront, and breaking work into smaller reviewable chunks to catch issues early rather than at the deadline.',
    highlights: ['Mention practices like code reviews, automated…'],
  },
  {
    id: 1440, category: 'Behavioral', difficulty: 'Mid',
    question: 'Describe your experience working in an Agile/Scrum environment.',
    answer: 'Describe your sprint cadence, your role in ceremonies (standups, planning, retros), how backlog items were estimated/prioritized, and how you handled scope changes mid-sprint.',
    highlights: ['Describe your sprint cadence, your role in…'],
  },
  {
    id: 1441, category: 'Behavioral', difficulty: 'Mid',
    question: 'Explain sprint planning, daily standup, backlog grooming, sprint review, and retrospective.',
    answer: 'Sprint planning selects and estimates the work for the upcoming sprint. Standup is a brief daily sync on progress/blockers. Backlog grooming refines and prioritizes upcoming work. Sprint review demos completed work to stakeholders. Retrospective reflects on what went well/poorly to improve the next sprint.',
    highlights: ['Sprint planning selects and estimates the work for…', 'Standup is a brief daily sync on progress/blockers', 'Backlog grooming refines and prioritizes upcoming work'],
  },
  {
    id: 1442, category: 'Behavioral', difficulty: 'Mid',
    question: 'How do you document your code and project architecture for your team?',
    answer: 'Use inline comments for non-obvious logic, README files for setup/architecture overviews, ADRs (Architecture Decision Records) for significant decisions, and keep documentation close to the code so it stays up to date.',
    highlights: ['Use inline comments for non-obvious logic, README…'],
  },
  {
    id: 1443, category: 'Behavioral', difficulty: 'Mid',
    question: 'How do you onboard new developers to your team and projects?',
    answer: 'Provide a clear README/setup guide, pair them on their first few tasks, assign a small well-scoped starter task to build familiarity, and encourage questions early rather than assuming context.',
    highlights: ['Provide a clear README/setup guide, pair them on…'],
  },
  {
    id: 1444, category: 'Behavioral', difficulty: 'Mid',
    question: 'What tools do you use to track project progress and manage tasks?',
    answer: 'Common tools: Jira/Azure DevOps for sprint/task tracking, Confluence/Notion for documentation, Slack/Teams for communication, and CI/CD dashboards for deployment visibility.',
    highlights: ['Common tools: Jira/Azure DevOps for sprint/task…'],
  },
  {
    id: 1445, category: 'Behavioral', difficulty: 'Mid',
    question: 'If your team is stuck on a critical bug, how would you guide them to a solution?',
    answer: 'Facilitate structured debugging: reproduce the issue reliably, narrow down via bisecting recent changes/logs, form hypotheses and test them systematically, and bring in additional expertise if stuck rather than guessing indefinitely.',
    highlights: ['Facilitate structured debugging: reproduce the…'],
  },
  {
    id: 1446, category: 'Behavioral', difficulty: 'Mid',
    question: 'A feature you implemented is causing performance issues in production. How would you debug it?',
    answer: 'Check monitoring/APM data first (CPU, memory, response times, error rates), reproduce under similar load if possible, profile the suspected code path, and roll back or feature-flag off the change if the issue is severe while investigating deeper.',
    highlights: ['Check monitoring/APM data first (CPU, memory,…'],
  },
  {
    id: 1447, category: 'Behavioral', difficulty: 'Mid',
    question: 'What steps would you take if your database suddenly becomes a bottleneck?',
    answer: 'Check for missing indexes or slow queries via the query planner, examine connection pool exhaustion, consider adding a read replica or caching layer (Redis) for hot data, and evaluate whether query patterns or schema design need to change.',
    highlights: ['Check for missing indexes or slow queries via the…'],
  },
  {
    id: 1448, category: 'Behavioral', difficulty: 'Mid',
    question: 'How would you handle a situation where the application is experiencing a memory leak?',
    answer: 'Use heap snapshots/profiling tools to compare memory usage over time and identify growing object retention, check for common culprits (unremoved event listeners, uncanceled timers, growing caches without eviction), and fix the specific leak with a targeted patch.',
    highlights: ['Use heap snapshots/profiling tools to compare…'],
  },
  {
    id: 1449, category: 'Behavioral', difficulty: 'Mid',
    question: 'Your CI/CD pipeline broke an hour before release. Walk me through your response.',
    answer: 'Stay calm and prioritize: check recent pipeline changes first, isolate whether it\'s a code issue or infra/config issue, communicate status to stakeholders early, and decide whether to fix forward quickly or delay the release rather than shipping unverified code.',
    highlights: ['Stay calm and prioritize: check recent pipeline…'],
  },
  {
    id: 1450, category: 'Behavioral', difficulty: 'Mid',
    question: 'What was your favorite project and why are you proud of it?',
    answer: 'Pick a project with genuine personal investment, describe the challenge and your specific contribution, and tie your pride to a concrete outcome (performance improvement, user impact, or a hard problem elegantly solved).',
    highlights: ['Pick a project with genuine personal investment,…'],
  },
  {
    id: 1451, category: 'Behavioral', difficulty: 'Mid',
    question: 'What was the monthly traffic of your application? What practices did you put in place to scale?',
    answer: 'Answer with real numbers from your experience, and describe the specific scaling practices used — caching, load balancing, database optimization, CDN usage, or horizontal scaling of services.',
    highlights: ['Answer with real numbers from your experience, and…', 'caching, load balancing, database optimization, CDN…'],
  },
  {
    id: 1452, category: 'Behavioral', difficulty: 'Mid',
    question: 'How do you stay updated with the latest trends in frontend/fullstack development?',
    answer: 'Mention concrete habits: following release notes for your core stack, reading engineering blogs, following key voices in the community, experimenting with new features/tools in side projects, and attending or watching conference talks.',
    highlights: ['Mention concrete habits: following release notes…'],
  },
  {
    id: 1453, category: 'Behavioral', difficulty: 'Mid',
    question: 'Where do you see yourself in 3–5 years?',
    answer: 'Connect your growth trajectory to the role: deepening technical expertise toward a senior/staff/architect track, or growing into technical leadership/mentoring — tie it to skills this specific role would help you build.',
    highlights: ['Connect your growth trajectory to the role:…', 'tie it to skills this specific role would help you…'],
  },
  {
    id: 1454, category: 'Behavioral', difficulty: 'Mid',
    question: 'Why should we hire you for this role? What makes you stand out?',
    answer: 'Connect your specific, demonstrated experience directly to the role\'s requirements, cite concrete achievements with measurable impact, and show genuine enthusiasm for the company\'s product/mission.',
    highlights: ['Connect your specific, demonstrated experience…'],
  },
  {
    id: 1455, category: 'Behavioral', difficulty: 'Mid',
    question: 'What do you know about our company and products?',
    answer: 'Research the company beforehand — their product, recent news, tech stack, and mission — and tie your answer to why that specifically excites you and aligns with your background.',
    highlights: ['Research the company beforehand', 'their product, recent news, tech stack, and mission', 'and tie your answer to why that specifically…'],
  },
  {
    id: 1456, category: 'Behavioral', difficulty: 'Mid',
    question: 'How does your experience at your current company align with what we are looking for?',
    answer: 'Map your current responsibilities and stack directly onto the job description\'s requirements, highlighting overlapping technologies and any relevant scale/domain experience.',
    highlights: ['Map your current responsibilities and stack…'],
  },
  {
    id: 1457, category: 'Behavioral', difficulty: 'Mid',
    question: 'Describe the architecture of your current backend. How did you scale it?',
    answer: 'Describe the real architecture you\'ve worked on — service boundaries, database choices, caching layers — and the specific scaling steps taken (horizontal scaling, caching, query optimization, load balancing) as traffic grew.',
    highlights: ['Describe the real architecture you\'ve worked on', 'service boundaries, database choices, caching layers', 'and the specific scaling steps taken (horizontal…'],
  },
  {
    id: 1458, category: 'Behavioral', difficulty: 'Mid',
    question: 'Where was your application deployed? Did you use load balancing or auto-scaling?',
    answer: 'Answer based on your actual project: cloud provider, deployment method, and whether a load balancer with auto-scaling policies handled traffic distribution and elasticity.',
    highlights: ['Answer based on your actual project: cloud…'],
  },
  {
    id: 1459, category: 'Behavioral', difficulty: 'Mid',
    question: 'Any specific reason you chose MongoDB over PostgreSQL in your project?',
    answer: 'Explain the real reasoning behind the choice — e.g. flexible/evolving schema needs, document-shaped data matching the domain model, or team familiarity — while acknowledging PostgreSQL would have been better suited for strict relational integrity/complex joins.',
    highlights: ['Explain the real reasoning behind the choice', 'flexible/evolving schema needs, document-shaped…', 'while acknowledging PostgreSQL would have been…'],
  },

  // ─── MANAGERIAL (from Interview Masterpack) ───

  {
    id: 1461, category: 'Managerial', difficulty: 'Senior',
    question: 'Describe a situation where you had to mentor a junior developer.',
    answer: 'Describe identifying their specific skill gap, the approach you took (pairing, structured tasks, feedback), and the measurable improvement in their output/confidence over time.',
    highlights: ['Describe identifying their specific skill gap, the…'],
  },
  {
    id: 1463, category: 'Managerial', difficulty: 'Senior',
    question: 'Explain the SOLID principles and how you apply them in your designs.',
    answer: 'Single Responsibility keeps each module/class focused on one concern. Open/Closed lets you extend behavior without modifying existing code. Liskov Substitution ensures subclasses are safely interchangeable with their base type. Interface Segregation favors small, focused interfaces. Dependency Inversion depends on abstractions, not concrete implementations — together they produce maintainable, testable code.',
    highlights: ['Single Responsibility keeps each module/class…', 'Open/Closed lets you extend behavior without…', 'Liskov Substitution ensures subclasses are safely…'],
  },
  {
    id: 1464, category: 'Managerial', difficulty: 'Senior',
    question: 'Explain design patterns in JavaScript and when to use them.',
    answer: 'Singleton ensures a single shared instance (e.g. a config object). Observer/Pub-Sub decouples event producers from consumers. Factory centralizes complex object creation logic. Module pattern encapsulates private state — choose based on the specific coupling/reuse problem you\'re solving, not by default.',
    highlights: ['Singleton ensures a single shared instance (e.g', 'a config object)', 'Observer/Pub-Sub decouples event producers from…'],
  },
  {
    id: 1465, category: 'Managerial', difficulty: 'Senior',
    question: 'How do you decide which tech stack is suitable for a specific project?',
    answer: 'Weigh team familiarity, project requirements (scale, real-time needs, data shape), long-term maintainability, hiring/community support for the stack, and total cost of ownership rather than choosing purely on hype.',
    highlights: ['Weigh team familiarity, project requirements…'],
  },
  {
    id: 1466, category: 'Managerial', difficulty: 'Senior',
    question: 'What is the difference between Development, FT, UAT, Pre-Prod, and Production environments?',
    answer: 'Development is where active coding happens. FT (Functional Testing) verifies feature correctness. UAT (User Acceptance Testing) validates against business requirements with real stakeholders. Pre-Prod mirrors production for final validation. Production is the live environment serving real users.',
    highlights: ['Development is where active coding happens', 'FT (Functional Testing) verifies feature correctness', 'UAT (User Acceptance Testing) validates against…'],
  },
  {
    id: 1467, category: 'Managerial', difficulty: 'Senior',
    question: 'How do you ensure 100% code coverage in your projects?',
    answer: 'Write tests alongside (or before, TDD-style) feature code, use coverage tools (Istanbul/nyc, Jest coverage) in CI to flag gaps, and prioritize meaningful test coverage of critical business logic over chasing the metric for its own sake.',
    highlights: ['Write tests alongside (or before, TDD-style)…'],
  },
  {
    id: 1468, category: 'Managerial', difficulty: 'Senior',
    question: 'What is the difference between unit testing, integration testing, and functional testing?',
    answer: 'Unit tests verify a single function/component in isolation (mocking dependencies). Integration tests verify multiple units working together correctly (e.g. API + database). Functional/E2E tests verify complete user-facing workflows behave as expected end-to-end.',
    highlights: ['Unit tests verify a single function/component in…', 'Integration tests verify multiple units working…', 'API + database)'],
  },
  {
    id: 1469, category: 'Managerial', difficulty: 'Senior',
    question: 'How do you secure sensitive data in a MERN stack application?',
    answer: 'Hash passwords with bcrypt, never store secrets in code (use env vars/secrets manager), enforce HTTPS, encrypt sensitive fields at rest, and apply strict input validation/sanitization to prevent injection attacks.',
    highlights: ['Hash passwords with bcrypt, never store secrets in…'],
  },
  {
    id: 1471, category: 'Managerial', difficulty: 'Senior',
    question: 'Explain sprint planning, daily standup, backlog grooming, sprint review, and sprint retrospective.',
    answer: 'Sprint planning selects/estimates upcoming work. Standup is a brief daily sync on progress/blockers. Backlog grooming keeps upcoming stories refined and prioritized. Sprint review demos finished work to stakeholders. Retrospective reflects on process improvements for the next sprint.',
    highlights: ['Sprint planning selects/estimates upcoming work', 'Standup is a brief daily sync on progress/blockers', 'Backlog grooming keeps upcoming stories refined and…'],
  },
  {
    id: 1475, category: 'Managerial', difficulty: 'Senior',
    question: 'What are the key considerations when designing RESTful APIs?',
    answer: 'Use consistent, resource-based URL naming and correct HTTP methods/status codes, version the API, paginate large collections, design clear and consistent error response shapes, and document the contract (OpenAPI/Swagger).',
    highlights: ['Use consistent, resource-based URL naming and…'],
  },
  {
    id: 1476, category: 'Managerial', difficulty: 'Senior',
    question: 'What is your approach to deploying and scaling a MERN stack application?',
    answer: 'Automate deployment via CI/CD with staged environments, keep the API stateless for horizontal scaling, cache expensive operations, and monitor key metrics to catch scaling issues before they impact users.',
    highlights: ['Automate deployment via CI/CD with staged…'],
  },
  {
    id: 1478, category: 'Managerial', difficulty: 'Senior',
    question: 'A feature you implemented in React is causing performance issues. How would you debug it?',
    answer: 'Use the React DevTools Profiler to identify which components are re-rendering excessively, check for missing memoization or unstable prop references, and verify the fix actually reduces render counts/time before shipping it.',
    highlights: ['Use the React DevTools Profiler to identify which…'],
  },
  {
    id: 1481, category: 'Managerial', difficulty: 'Senior',
    question: 'What is your approach to conducting code reviews?',
    answer: 'Focus first on correctness and design, then readability/maintainability, and only lastly style (ideally auto-enforced by linters). Explain the reasoning behind requested changes and distinguish blocking issues from optional suggestions.',
    highlights: ['Focus first on correctness and design, then…', 'Explain the reasoning behind requested changes and…'],
  },
  {
    id: 1482, category: 'Managerial', difficulty: 'Senior',
    question: 'How do you optimize MongoDB queries for better performance?',
    answer: 'Add indexes on frequently filtered/sorted fields, project only needed fields, use the aggregation pipeline\'s $match early to reduce documents processed, and check .explain() to confirm queries use indexes rather than full collection scans.',
    highlights: ['Add indexes on frequently filtered/sorted fields,…'],
  },
  {
    id: 1483, category: 'Managerial', difficulty: 'Senior',
    question: 'How do you manage error handling in an Express.js application?',
    answer: 'Centralize error handling in dedicated middleware, use custom error classes carrying status codes, avoid leaking internal details to clients, and ensure every async route handler\'s errors are properly caught and forwarded.',
    highlights: ['Centralize error handling in dedicated middleware,…'],
  },
  {
    id: 1484, category: 'Managerial', difficulty: 'Senior',
    question: 'Explain how you would secure an Express.js API.',
    answer: 'Use helmet for secure headers, validate/sanitize all input, hash passwords with bcrypt, enforce HTTPS, apply rate limiting, use JWT/OAuth for auth with short-lived tokens, and keep dependencies patched.',
    highlights: ['Use helmet for secure headers, validate/sanitize…'],
  },
  {
    id: 1485, category: 'Managerial', difficulty: 'Senior',
    question: 'How do you optimize React applications for performance?',
    answer: 'Memoize expensive components/values (React.memo, useMemo, useCallback), code-split with React.lazy, virtualize long lists, and use the Profiler to verify optimizations actually reduce unnecessary re-renders.',
    highlights: ['Memoize expensive components/values (React.memo,…'],
  },
  {
    id: 1486, category: 'Managerial', difficulty: 'Senior',
    question: 'How do you secure a Node.js application?',
    answer: 'Validate/sanitize input, keep dependencies updated (npm audit), use helmet and proper CORS configuration, store secrets securely (never in code), enforce HTTPS, and apply rate limiting against abuse.',
    highlights: ['Validate/sanitize input, keep dependencies updated…'],
  },
  {
    id: 1487, category: 'Managerial', difficulty: 'Senior',
    question: 'How would you handle database sharding and replication in MongoDB?',
    answer: 'Use replica sets for high availability (automatic failover to a secondary), and sharding when a single server\'s storage/throughput can no longer handle the dataset, choosing a shard key that distributes load evenly and matches common query patterns.',
    highlights: ['Use replica sets for high availability (automatic…'],
  },
  {
    id: 1490, category: 'Managerial', difficulty: 'Senior',
    question: 'What was the most challenging task you faced in your project, and how did you solve it?',
    answer: 'Choose a task with genuine technical or organizational difficulty, explain your investigation/decision process, and quantify the outcome where possible.',
    highlights: ['Choose a task with genuine technical or…'],
  },
  {
    id: 1491, category: 'Managerial', difficulty: 'Senior',
    question: 'What was the architecture of your backend? How did you scale it for large numbers of users?',
    answer: 'Describe the real service/database architecture and the concrete scaling steps taken as load grew — caching, horizontal scaling, database optimization, or architectural changes like introducing message queues.',
    highlights: ['Describe the real service/database architecture and…', 'caching, horizontal scaling, database optimization,…'],
  },
  {
    id: 1492, category: 'Managerial', difficulty: 'Senior',
    question: 'Where was your application deployed? Did you use load balancing?',
    answer: 'Answer with your actual deployment details — cloud provider, environment setup, and whether a load balancer distributed traffic across multiple instances for availability and scale.',
    highlights: ['Answer with your actual deployment details', 'cloud provider, environment setup, and whether a…'],
  },
  {
    id: 1493, category: 'Managerial', difficulty: 'Senior',
    question: 'How do you measure and enforce code quality standards across a team?',
    answer: 'Use automated linting/formatting in CI, enforce test coverage thresholds, require code review approval before merge, and periodically review recurring review feedback to identify patterns worth addressing with team-wide guidelines.',
    highlights: ['Use automated linting/formatting in CI, enforce…'],
  },
  {
    id: 1494, category: 'Managerial', difficulty: 'Senior',
    question: 'What metrics do you use to evaluate a team\'s engineering productivity?',
    answer: 'Favor outcome-oriented metrics (cycle time, deployment frequency, change failure rate, incident recovery time) over raw output metrics like lines of code or ticket count, which can be gamed and don\'t reflect real value delivered.',
    highlights: ['Favor outcome-oriented metrics (cycle time,…'],
  },
  {
    id: 1495, category: 'Managerial', difficulty: 'Senior',
    question: 'How do you handle technical debt in a fast-moving product team?',
    answer: 'Track debt explicitly (a visible backlog item, not just tribal knowledge), allocate a consistent percentage of sprint capacity to paying it down, and prioritize debt that\'s actively slowing delivery or causing recurring bugs over debt with no current impact.',
    highlights: ['Track debt explicitly (a visible backlog item, not…'],
  },
  {
    id: 1496, category: 'Managerial', difficulty: 'Senior',
    question: 'Describe how you would run an incident post-mortem after a production outage.',
    answer: 'Focus on a blameless root-cause analysis: timeline of what happened, contributing factors, what went well in the response, and concrete, assigned action items to prevent recurrence — never centered on blaming an individual.',
    highlights: ['Focus on a blameless root-cause analysis: timeline…', 'never centered on blaming an individual'],
  },
  {
    id: 1497, category: 'Managerial', difficulty: 'Senior',
    question: 'How do you balance feature delivery speed with maintainability and code quality?',
    answer: 'Set a baseline quality bar that\'s non-negotiable (tests, reviews) but scope features to ship incrementally, communicate trade-offs transparently to stakeholders when speed pressure risks quality, and schedule deliberate time for refactoring rather than letting debt compound silently.',
    highlights: ['Set a baseline quality bar that\'s non-negotiable…'],
  },

  // ─── JAVA (additions from Java Core / Java 8+ / Multithreading question bank) ───
  {
    id: 2000, category: 'Java', difficulty: 'Junior',
    question: 'Why is Java considered platform independent? What role does the JVM play?',
    answer: 'Java source code compiles to an intermediate form called bytecode (.class files), not directly to machine code. Each platform has its own JVM (Java Virtual Machine) that interprets/JIT-compiles that same bytecode into native instructions for that specific OS/CPU. So you compile once and the identical .class file runs anywhere a compatible JVM exists — "Write Once, Run Anywhere." The JVM is what\'s platform-specific, not your code.',
    code: `// Compile once (produces platform-neutral bytecode)
// javac HelloWorld.java  →  HelloWorld.class

// Run anywhere a JVM exists — same .class file
// java HelloWorld   (Windows JVM, Linux JVM, macOS JVM — all interpret the same bytecode)`,
    highlights: ['Compiles to platform-neutral bytecode', 'Each OS has its own JVM to run that bytecode', '"Write Once, Run Anywhere"'],
  },
  {
    id: 2001, category: 'Java', difficulty: 'Junior',
    question: 'What is the difference between JVM, JRE, and JDK?',
    answer: 'The JVM (Java Virtual Machine) is the runtime engine that executes bytecode. The JRE (Java Runtime Environment) bundles the JVM plus the standard class libraries needed to run Java applications — but has no compiler. The JDK (Java Development Kit) is the full development kit: it includes the JRE plus the compiler (javac), debugger, and other tools needed to write and build Java programs.',
    code: `// JDK  = JRE + development tools (javac, jdb, javadoc...)
// JRE  = JVM  + standard class libraries (java.lang, java.util...)
// JVM  = the engine that actually executes .class bytecode

// To develop: you need the JDK
// To just run a compiled app: the JRE is enough`,
    highlights: ['JDK = JRE + dev tools (compiler, debugger)', 'JRE = JVM + standard libraries', 'JVM = the engine that executes bytecode'],
  },
  {
    id: 2002, category: 'Java', difficulty: 'Mid',
    question: 'What is the difference between method overloading and method overriding? Can static methods be overridden?',
    answer: 'Overloading is having multiple methods with the same name but different parameter lists in the same class — resolved at compile time based on the arguments you pass. Overriding is a subclass providing its own implementation of a method it inherits from a superclass, with the exact same signature — resolved at runtime based on the actual object type (dynamic dispatch). Static methods cannot be truly overridden because they belong to the class, not an instance, and are resolved at compile time — a subclass "redefining" a static method with the same signature actually hides the parent\'s version rather than overriding it, so calling it through a superclass reference always invokes the superclass\'s version.',
    code: `class Parent {
  static void greet() { System.out.println("Parent static"); }
  void speak() { System.out.println("Parent instance"); }
}
class Child extends Parent {
  static void greet() { System.out.println("Child static"); } // hides, doesn't override
  @Override
  void speak() { System.out.println("Child instance"); }      // true override
}

Parent p = new Child();
p.greet();  // "Parent static" — resolved at compile time by reference type
p.speak();  // "Child instance" — resolved at runtime by actual object type`,
    highlights: ['Overloading: same name, different params, compile-time', 'Overriding: same signature in subclass, runtime dispatch', 'Static "overriding" is actually hiding, not true polymorphism'],
  },
  {
    id: 2003, category: 'Java', difficulty: 'Mid',
    question: 'Can constructors be inherited in Java? Why doesn\'t Java support multiple inheritance of classes?',
    answer: 'Constructors are not inherited — each class must define its own, though a subclass constructor implicitly (or explicitly via super(...)) calls a superclass constructor to initialize the inherited state. Java doesn\'t allow a class to extend multiple classes to avoid the "diamond problem" — ambiguity about which parent\'s implementation to use when two superclasses define the same method. Java sidesteps this by allowing multiple interface implementation instead (interfaces historically had no implementation, and even now with default methods, Java has explicit rules forcing you to resolve conflicts).',
    code: `interface A { default void hello() { System.out.println("A"); } }
interface B { default void hello() { System.out.println("B"); } }

class C implements A, B {
  // Must explicitly resolve the diamond ambiguity for default methods:
  public void hello() { A.super.hello(); } // explicit choice — Java forces this
}`,
    highlights: ['Constructors aren\'t inherited, but chained via super()', 'Multiple class inheritance banned to avoid the diamond problem', 'Multiple interface implementation is allowed instead'],
  },
  {
    id: 2004, category: 'Java', difficulty: 'Senior',
    question: 'What are the different types of Garbage Collectors in Java, and what commonly causes memory leaks despite GC?',
    answer: 'The JVM offers several collectors with different trade-offs: Serial (single-threaded, small apps), Parallel (multi-threaded, throughput-focused), CMS (Concurrent Mark Sweep, now removed, minimized pause times), G1 (Garbage First, default since Java 9, balances throughput and pause time by collecting garbage-heaviest regions first), and ZGC/Shenandoah (very low pause times for huge heaps). Despite automatic GC, "memory leaks" still happen when objects remain unintentionally reachable — common causes include static collections that keep growing, unclosed resources (streams, connections), listeners/callbacks that are registered but never unregistered, and inner classes holding an implicit reference to their outer class.',
    code: `// Classic Java memory leak: static collection never cleared
public class CacheLeak {
  private static final List<byte[]> cache = new ArrayList<>();
  public void addToCache(byte[] data) {
    cache.add(data); // never removed — grows forever, GC can't reclaim it
  }
}`,
    highlights: ['Serial/Parallel/G1/ZGC — different throughput vs pause-time trade-offs', 'G1 is the default collector since Java 9', 'Leaks: static collections, unclosed resources, dangling listeners'],
  },
  {
    id: 2005, category: 'Java', difficulty: 'Senior',
    question: 'What are Strong, Weak, Soft, and Phantom references in Java?',
    answer: 'These four reference types tell the garbage collector how aggressively it may reclaim an object. A Strong reference (a normal reference) is never collected while reachable. A Soft reference is collected only when the JVM is running low on memory — ideal for memory-sensitive caches. A Weak reference is collected at the next GC cycle regardless of memory pressure, as soon as no strong references remain — used in WeakHashMap and to avoid memory leaks in listener registries. A Phantom reference is enqueued after the object has already been finalized, used for cleanup scheduling/tracking rather than resurrecting the object.',
    code: `// Soft: good for a memory-sensitive cache
SoftReference<byte[]> cache = new SoftReference<>(loadLargeData());

// Weak: doesn't prevent GC, common in listener maps to avoid leaks
WeakHashMap<Key, Value> weakMap = new WeakHashMap<>();

// Phantom: used with a ReferenceQueue for post-mortem cleanup, never dereferenced
PhantomReference<Object> ref = new PhantomReference<>(obj, queue);`,
    highlights: ['Strong: never collected while reachable', 'Soft: collected only under memory pressure (caches)', 'Weak: collected at next GC (listener maps); Phantom: post-finalization cleanup'],
  },
  {
    id: 2006, category: 'Java', difficulty: 'Mid',
    question: 'Why is String immutable in Java, and how does the String Pool / intern() work?',
    answer: 'Strings are immutable so they can be safely shared without defensive copying — this enables the String Pool, a caching mechanism where literal strings with identical content are stored once and reused, saving memory. Immutability also makes strings safe as HashMap keys (their hash code can be cached) and safe to share across threads without synchronization. intern() explicitly places a string into the pool (or returns the existing pooled instance if the content already exists), which is how string literals get pooled automatically at compile time, while strings built via new String(...) or concatenation at runtime live on the heap unless you call intern() yourself.',
    code: `String a = "hello";              // placed in the String Pool
String b = "hello";              // reuses the same pooled instance
System.out.println(a == b);      // true — same reference

String c = new String("hello");  // forces a new heap object, NOT pooled
System.out.println(a == c);      // false — different references
System.out.println(a == c.intern()); // true — intern() returns the pooled instance`,
    highlights: ['Immutability enables safe sharing → the String Pool', 'Literals are pooled automatically at compile time', 'intern() manually pools a runtime-created string'],
  },
  {
    id: 2007, category: 'Java', difficulty: 'Mid',
    question: 'What is the difference between List, Set, and Map in the Java Collections Framework?',
    answer: 'List is an ordered collection that allows duplicates and index-based access (ArrayList, LinkedList). Set is a collection of unique elements with no guaranteed index-based access (HashSet, LinkedHashSet, TreeSet). Map stores key-value pairs where keys are unique (HashMap, LinkedHashMap, TreeMap) — it\'s technically not a Collection subtype at all, since it deals in pairs rather than single elements, but it\'s part of the same Collections Framework.',
    code: `List<String> list = new ArrayList<>(List.of("a", "b", "a"));  // ["a", "b", "a"] — duplicates OK, ordered
Set<String> set   = new HashSet<>(list);                       // ["a", "b"] — duplicates removed
Map<String, Integer> map = new HashMap<>();
map.put("a", 1);
map.put("a", 2); // overwrites — keys are unique`,
    highlights: ['List: ordered, allows duplicates, indexed', 'Set: unique elements, no reliable index access', 'Map: unique keys → values, not a Collection subtype'],
  },
  {
    id: 2008, category: 'Java', difficulty: 'Senior',
    question: 'Explain HashMap internals — how does it store data and handle collisions?',
    answer: 'A HashMap stores entries in an array of buckets. A key\'s hashCode() is passed through an internal hash-spreading function and then reduced (via modulo/masking) to pick a bucket index. When two keys land in the same bucket (a collision), Java 8+ stores them as a linked list of entries within that bucket, and if that list grows past a threshold (8 entries, with a large enough table), it converts to a red-black tree for that bucket to keep worst-case lookup at O(log n) instead of degrading to O(n). Resizing (rehashing every entry into a bigger table) happens automatically once the map exceeds its load factor (default 0.75) relative to capacity.',
    code: `// Simplified mental model of put(key, value):
// 1. int hash = spread(key.hashCode());
// 2. int bucketIndex = hash & (table.length - 1);
// 3. if bucket empty → insert node
//    else → walk the chain (or tree), replace if key.equals() matches, else append

Map<String, Integer> map = new HashMap<>(16, 0.75f); // initial capacity 16, resize at 75% full`,
    highlights: ['Bucket index derived from hashCode()', 'Collisions: linked list → red-black tree after 8 entries', 'Resizes (rehashes) once load factor (default 0.75) is exceeded'],
  },
  {
    id: 2009, category: 'Java', difficulty: 'Senior',
    question: 'What is the difference between ConcurrentHashMap and a synchronized HashMap? Why is it preferred for multithreaded code?',
    answer: 'A HashMap wrapped with Collections.synchronizedMap locks the entire map on every operation, so only one thread can read or write at a time, even for unrelated keys — a major bottleneck under contention. ConcurrentHashMap instead uses finer-grained locking (bucket/segment-level synchronization internally, further refined in Java 8 to per-node CAS operations for many operations), allowing multiple threads to read and write different parts of the map concurrently without blocking each other, while still being fully thread-safe.',
    code: `// Coarse locking — one thread at a time, for the WHOLE map
Map<String, Integer> synced = Collections.synchronizedMap(new HashMap<>());

// Fine-grained locking — much better concurrent throughput
ConcurrentHashMap<String, Integer> chm = new ConcurrentHashMap<>();
chm.compute("counter", (k, v) -> (v == null ? 0 : v) + 1); // atomic, lock-free-ish update`,
    highlights: ['synchronizedMap: locks the whole map per operation', 'ConcurrentHashMap: fine-grained, per-bucket/node locking', 'Much higher throughput under concurrent access'],
  },
  {
    id: 2010, category: 'Java', difficulty: 'Mid',
    question: 'What is the difference between HashSet and TreeSet? What about a PriorityQueue?',
    answer: 'HashSet stores unique elements with no guaranteed order and offers O(1) average add/contains via hashing. TreeSet also stores unique elements but keeps them sorted (natural ordering or a supplied Comparator), backed by a red-black tree, giving O(log n) operations in exchange for that ordering. PriorityQueue is not a Set at all (duplicates allowed) — it\'s a heap-based queue that always returns the smallest (or Comparator-defined highest-priority) element first via poll(), commonly used for task scheduling or algorithms like Dijkstra\'s.',
    code: `Set<Integer> hashSet = new HashSet<>(List.of(5, 1, 3)); // any iteration order
Set<Integer> treeSet  = new TreeSet<>(List.of(5, 1, 3));  // iterates 1, 3, 5 — sorted

PriorityQueue<Integer> pq = new PriorityQueue<>();
pq.addAll(List.of(5, 1, 3));
pq.poll(); // 1 — always returns the smallest first`,
    highlights: ['HashSet: unordered, O(1) average ops', 'TreeSet: sorted, O(log n), red-black tree backed', 'PriorityQueue: heap, allows duplicates, poll() gives min/highest-priority'],
  },
  {
    id: 2011, category: 'Java', difficulty: 'Senior',
    question: 'What is the difference between fail-fast and fail-safe iterators?',
    answer: 'A fail-fast iterator (used by ArrayList, HashMap, HashSet) throws a ConcurrentModificationException if the underlying collection is structurally modified while iterating, other than through the iterator\'s own remove() — it detects this via an internal modCount that\'s checked on every next() call. A fail-safe iterator (used by CopyOnWriteArrayList, ConcurrentHashMap) instead iterates over a snapshot or tolerates concurrent structural changes without throwing, at the cost of the iterator potentially not reflecting the very latest state.',
    code: `List<Integer> list = new ArrayList<>(List.of(1, 2, 3));
for (Integer i : list) {
  list.remove(i); // throws ConcurrentModificationException — fail-fast

}

List<Integer> cow = new CopyOnWriteArrayList<>(List.of(1, 2, 3));
for (Integer i : cow) {
  cow.remove(i); // no exception — fail-safe, iterates over a snapshot
}`,
    highlights: ['Fail-fast: throws ConcurrentModificationException (ArrayList, HashMap)', 'Fail-safe: tolerates concurrent changes (CopyOnWriteArrayList, ConcurrentHashMap)', 'Fail-fast detects modification via an internal modCount'],
  },
  {
    id: 2012, category: 'Java', difficulty: 'Junior',
    question: 'What is the difference between throw and throws in Java?',
    answer: 'throw is a statement used inside a method body to actually raise a specific exception instance at that point in the code. throws is a keyword used in a method\'s signature to declare that the method might propagate one or more checked exception types, so callers are forced to handle or re-declare them — it doesn\'t raise anything itself, it\'s just a compile-time contract.',
    code: `void withdraw(double amount) throws InsufficientFundsException { // declares it might throw
  if (amount > balance) {
    throw new InsufficientFundsException("Not enough funds"); // actually raises it
  }
}`,
    highlights: ['throw: actually raises an exception instance', 'throws: declares possible exceptions in the method signature', 'throws is a compile-time contract, not an action'],
  },
  {
    id: 2013, category: 'Java', difficulty: 'Mid',
    question: 'What is try-with-resources and how does it improve on manual resource cleanup?',
    answer: 'try-with-resources automatically closes any resource that implements AutoCloseable when the try block exits, whether normally or via an exception — eliminating the need for a manual finally block to call close(). Resources are closed in reverse order of declaration, and if both the try block and the close() call throw, the close() exception is "suppressed" and attached to the original exception rather than masking it, which the older manual pattern often got wrong.',
    code: `// Old way — verbose and easy to get wrong
BufferedReader br = null;
try {
  br = new BufferedReader(new FileReader("file.txt"));
  return br.readLine();
} finally {
  if (br != null) br.close();
}

// try-with-resources — concise and correct
try (BufferedReader br = new BufferedReader(new FileReader("file.txt"))) {
  return br.readLine();
} // br.close() called automatically, even on exception`,
    highlights: ['Auto-closes any AutoCloseable resource', 'Closes in reverse declaration order', 'Exceptions from close() are suppressed, not masking the original'],
  },
  {
    id: 2014, category: 'Java', difficulty: 'Mid',
    question: 'What is the difference between Thread and Process? Runnable vs Callable?',
    answer: 'A Process is an independent program with its own isolated memory space; a Thread is a lightweight unit of execution within a process, sharing that process\'s memory with other threads — which is why inter-thread communication is fast but requires careful synchronization. Runnable\'s run() method returns nothing and can\'t throw checked exceptions, making it suitable for fire-and-forget tasks. Callable\'s call() method returns a value (wrapped in a Future when submitted to an executor) and can throw checked exceptions, making it the choice when you need a result or need to propagate a failure.',
    code: `Runnable task = () -> System.out.println("fire and forget");

Callable<Integer> callable = () -> {
  Thread.sleep(100);
  return 42; // has a return value, can throw checked exceptions
};

ExecutorService pool = Executors.newFixedThreadPool(2);
Future<Integer> future = pool.submit(callable);
Integer result = future.get(); // blocks until the result is available`,
    highlights: ['Process: isolated memory; Thread: shares memory within a process', 'Runnable: no return value, no checked exceptions', 'Callable: returns a value via Future, can throw checked exceptions'],
  },
  {
    id: 2015, category: 'Java', difficulty: 'Senior',
    question: 'What is a deadlock and how do you prevent it? What does the Executor Framework provide?',
    answer: 'A deadlock happens when two or more threads each hold a lock the other needs and wait indefinitely — e.g. Thread A holds Lock 1 and waits for Lock 2, while Thread B holds Lock 2 and waits for Lock 1. Prevention strategies include always acquiring locks in a consistent global order across all threads, using tryLock() with a timeout instead of a blocking acquire, or minimizing the scope/number of nested locks. The Executor Framework (ExecutorService, thread pools) abstracts away manual Thread creation and management — you submit tasks and the framework handles pooling, queuing, and reusing worker threads, which is far more efficient and controllable than spawning a new Thread per task.',
    code: `// Deadlock risk: inconsistent lock ordering
void transfer(Account a, Account b, double amt) {
  synchronized (a) {
    synchronized (b) { a.debit(amt); b.credit(amt); } // Thread 2 doing transfer(b, a, ...) can deadlock
  }
}

// Fix: always lock in a consistent order (e.g. by account ID)
void transferSafe(Account a, Account b, double amt) {
  Account first = a.id < b.id ? a : b, second = a.id < b.id ? b : a;
  synchronized (first) {
    synchronized (second) { a.debit(amt); b.credit(amt); }
  }
}`,
    highlights: ['Deadlock: circular wait on locks held by each other', 'Prevent via consistent lock ordering or tryLock() with timeout', 'Executor Framework: managed thread pools instead of manual Thread creation'],
  },
  {
    id: 2016, category: 'Java', difficulty: 'Senior',
    question: 'What is the difference between Future and CompletableFuture? What do Atomic classes, CountDownLatch, and Semaphore do?',
    answer: 'A Future represents a pending async result but only offers a blocking get() to retrieve it — no way to chain further work or react to completion without blocking a thread. CompletableFuture extends this with a rich API for composing async pipelines non-blockingly (thenApply, thenCombine, exceptionally) and can be completed manually. Atomic classes (AtomicInteger, AtomicLong) provide lock-free, thread-safe operations on single variables using CAS (compare-and-swap) instructions. CountDownLatch lets one or more threads wait until a set number of other threads finish an initial countdown (one-time use). Semaphore controls access to a limited resource pool by maintaining a set number of permits that threads acquire and release.',
    code: `CompletableFuture<Integer> future = CompletableFuture
  .supplyAsync(() -> fetchUser())
  .thenApply(user -> user.getAge())
  .exceptionally(ex -> -1); // non-blocking composition, unlike plain Future

AtomicInteger counter = new AtomicInteger(0);
counter.incrementAndGet(); // lock-free, thread-safe

CountDownLatch latch = new CountDownLatch(3); // wait for 3 workers to finish
Semaphore permits = new Semaphore(5);         // allow max 5 concurrent accesses`,
    highlights: ['CompletableFuture: non-blocking, composable async pipelines', 'Atomic classes: lock-free CAS-based thread safety', 'CountDownLatch: one-time wait-for-N; Semaphore: limit concurrent access'],
  },

  // ─── JAVA 8+ STREAMS & FUNCTIONAL (additions) ───────────────────────
  {
    id: 2020, category: 'Java', difficulty: 'Mid',
    question: 'What are Functional Interfaces, and what do Predicate, Consumer, Supplier, and Function represent?',
    answer: 'A functional interface has exactly one abstract method (optionally annotated @FunctionalInterface for compiler enforcement), which is what allows a lambda expression to implement it. The java.util.function package provides common ones: Predicate<T> takes a T and returns a boolean (a test/filter condition), Consumer<T> takes a T and returns nothing (performs a side effect), Supplier<T> takes nothing and returns a T (a lazy value provider/factory), and Function<T,R> takes a T and returns an R (a transformation).',
    code: `Predicate<Integer> isEven = n -> n % 2 == 0;   // T -> boolean
Consumer<String> print = s -> System.out.println(s); // T -> void
Supplier<Double> random = () -> Math.random();  // () -> T
Function<String, Integer> length = String::length; // T -> R

System.out.println(isEven.test(4));   // true
System.out.println(length.apply("hi")); // 2`,
    highlights: ['Functional interface = exactly one abstract method', 'Predicate: T → boolean; Consumer: T → void', 'Supplier: () → T; Function: T → R'],
  },
  {
    id: 2021, category: 'Java', difficulty: 'Mid',
    question: 'What are Method References in Java? Give the different forms.',
    answer: 'A method reference is shorthand syntax for a lambda that just calls an existing method — using :: instead of writing out the lambda\'s parameter/body boilerplate. There are four forms: a static method reference (ClassName::staticMethod), a bound instance method reference (instance::method, on a specific object), an unbound instance method reference (ClassName::instanceMethod, where the first lambda parameter becomes the receiver), and a constructor reference (ClassName::new).',
    code: `List<String> names = List.of("bob", "ada");

names.forEach(System.out::println);           // bound instance method ref
names.stream().map(String::toUpperCase);      // unbound instance method ref (arg becomes receiver)
Stream.of("1","2").map(Integer::parseInt);    // static method ref
Supplier<ArrayList<String>> factory = ArrayList::new; // constructor ref`,
    highlights: ['Shorthand for a lambda that just calls an existing method', 'Static / bound instance / unbound instance / constructor forms', 'Uses :: instead of full lambda syntax'],
  },
  {
    id: 2022, category: 'Java', difficulty: 'Mid',
    question: 'What is the difference between intermediate and terminal operations in the Stream API?',
    answer: 'Intermediate operations (map, filter, sorted, distinct, peek) are lazy — they just build up a pipeline of transformations and return a new Stream without doing any actual work. Nothing executes until a terminal operation (collect, forEach, reduce, count, findFirst) is called, which triggers the entire pipeline to run element-by-element in a single pass. This laziness lets the JVM optimize the whole pipeline together and short-circuit early when possible (e.g. findFirst doesn\'t need to process the whole stream).',
    code: `Stream<Integer> pipeline = List.of(1,2,3,4,5).stream()
  .filter(n -> n % 2 == 0)  // intermediate — lazy, nothing happens yet
  .map(n -> n * n);         // intermediate — still lazy

List<Integer> result = pipeline.collect(Collectors.toList()); // terminal — NOW it runs: [4, 16]`,
    highlights: ['Intermediate ops are lazy and return a new Stream', 'Terminal op triggers the whole pipeline to execute', 'Enables short-circuiting (e.g. findFirst)'],
  },
  {
    id: 2023, category: 'Java', difficulty: 'Mid',
    question: 'What is the difference between map() and flatMap() in the Stream API?',
    answer: 'map transforms each element into exactly one new element (a 1-to-1 mapping), producing a Stream of the transformed type — even if that type is itself a collection, you\'d end up with a Stream of Streams. flatMap transforms each element into a Stream and then flattens all of those streams into a single, flat stream — the natural fit for "list of lists to a single list" scenarios.',
    code: `List<List<Integer>> nested = List.of(List.of(1,2), List.of(3,4));

// map: Stream<List<Integer>> — still nested
nested.stream().map(list -> list).collect(Collectors.toList());

// flatMap: Stream<Integer> — fully flattened
List<Integer> flat = nested.stream()
  .flatMap(List::stream)
  .collect(Collectors.toList()); // [1, 2, 3, 4]`,
    highlights: ['map: 1-to-1, can leave nested structures', 'flatMap: 1-to-many, then flattens into a single stream', 'Classic use: flattening a List<List<T>>'],
  },
  {
    id: 2024, category: 'Java', difficulty: 'Mid',
    question: 'What is Optional in Java and why does it help avoid NullPointerException?',
    answer: 'Optional<T> is a container object that either holds a non-null value or is empty, making the possible absence of a value explicit in the method\'s return type — forcing callers to consciously handle the empty case (via isPresent/ifPresent/orElse/map) instead of accidentally dereferencing a null and crashing with an NPE deep in unrelated code. It\'s intended for return types, not fields or method parameters, where it adds overhead without the same safety benefit.',
    code: `Optional<User> findUser(String id) {
  return Optional.ofNullable(repository.get(id));
}

// Forces explicit handling of the missing case:
String name = findUser("123")
  .map(User::getName)
  .orElse("Unknown"); // no risk of a silent NPE`,
    highlights: ['Makes "might be absent" explicit in the return type', 'Forces callers to handle the empty case', 'Best for return types, not fields/parameters'],
  },
  {
    id: 2025, category: 'Java', difficulty: 'Mid',
    question: 'What are default and static methods in interfaces, and why were they added?',
    answer: 'Before Java 8, interfaces could only declare abstract methods, so adding a new method to a widely-implemented interface would break every existing implementation. default methods provide a method body directly in the interface, so existing implementers automatically inherit the default behavior without being forced to implement it (this is exactly how the Collection interface added stream() and forEach() without breaking every collection class ever written). static methods on an interface belong to the interface itself (like a utility method), called via Interface.method(), and can\'t be overridden by implementers.',
    code: `interface Vehicle {
  void drive();
  default void honk() { System.out.println("Beep!"); } // existing implementers get this for free
  static Vehicle createDefault() { return () -> System.out.println("Driving"); } // interface-level utility
}`,
    highlights: ['default methods: backward-compatible interface evolution', 'Existing implementers inherit the default body automatically', 'static methods: interface-level utilities, not overridable'],
  },
  {
    id: 2026, category: 'Java', difficulty: 'Senior',
    question: 'What are Parallel Streams and when should you avoid them?',
    answer: 'Calling .parallel() (or parallelStream()) splits the stream\'s work across multiple threads from the common ForkJoinPool, processing chunks concurrently and combining results — useful for CPU-bound work on large datasets. You should avoid them for small datasets (thread coordination overhead outweighs any gain), I/O-bound operations (threads just block, wasting pool capacity shared with the rest of the app), operations with side effects or shared mutable state (introduces race conditions), or when strict ordering matters and hasn\'t been explicitly preserved.',
    code: `// Good fit: large, CPU-bound, stateless computation
long sum = LongStream.rangeClosed(1, 100_000_000).parallel().sum();

// Bad fit: small collection — overhead dominates any parallel benefit
List.of(1, 2, 3).parallelStream().map(n -> n * 2).toList();

// Bad fit: shared mutable state — race condition
List<Integer> results = new ArrayList<>();
list.parallelStream().forEach(results::add); // NOT thread-safe, corrupts the list`,
    highlights: ['Splits work across the common ForkJoinPool', 'Good for large, CPU-bound, stateless work', 'Avoid for small data, I/O-bound work, or shared mutable state'],
  },
  {
    id: 2027, category: 'Java', difficulty: 'Mid',
    question: 'What are Collectors, groupingBy, and partitioningBy in the Stream API?',
    answer: 'Collectors is a factory class providing common reduction strategies for the terminal collect() operation — toList, toMap, joining, counting, and more. groupingBy classifies elements into a Map keyed by a classifier function, where each key maps to a List (or another downstream collector\'s result) of matching elements — the general-purpose "group by category" tool. partitioningBy is a specialized two-way split: it always produces a Map<Boolean, List<T>> based on a predicate, with all matches under true and non-matches under false.',
    code: `List<String> words = List.of("apple", "banana", "avocado", "blueberry");

Map<Character, List<String>> byFirstLetter = words.stream()
  .collect(Collectors.groupingBy(w -> w.charAt(0)));
// {a=[apple, avocado], b=[banana, blueberry]}

Map<Boolean, List<String>> longOrShort = words.stream()
  .collect(Collectors.partitioningBy(w -> w.length() > 6));
// {false=[apple, banana], true=[avocado, blueberry]}`,
    highlights: ['Collectors: factory of reduction strategies for collect()', 'groupingBy: classify into N groups by a key function', 'partitioningBy: always exactly 2 groups, keyed by true/false'],
  },
  {
    id: 2028, category: 'Java', difficulty: 'Junior',
    question: 'What is the difference between limit(), skip(), peek(), and distinct() in the Stream API?',
    answer: 'limit(n) truncates the stream to at most n elements. skip(n) discards the first n elements and keeps the rest. peek() lets you observe each element as it flows through the pipeline (typically for debugging/logging) without transforming it — it\'s an intermediate operation and, being lazy, may not run at all if a terminal op short-circuits before reaching an element. distinct() removes duplicate elements based on equals()/hashCode().',
    code: `List<Integer> result = Stream.of(1, 2, 2, 3, 4, 5, 6)
  .distinct()               // 1, 2, 3, 4, 5, 6
  .peek(n -> System.out.println("saw: " + n)) // debug side-effect
  .skip(1)                  // drop the first → 2, 3, 4, 5, 6
  .limit(3)                 // take 3 → 2, 3, 4
  .collect(Collectors.toList());`,
    highlights: ['limit: keep first n; skip: drop first n', 'peek: observe without transforming (debugging)', 'distinct: dedupe via equals()/hashCode()'],
  },
  {
    id: 2029, category: 'Java', difficulty: 'Junior',
    question: 'What is the difference between anyMatch, allMatch, noneMatch, findFirst, and findAny?',
    answer: 'anyMatch, allMatch, and noneMatch are short-circuiting terminal operations returning a boolean: anyMatch is true if at least one element satisfies the predicate, allMatch is true only if every element does, noneMatch is true if none do. findFirst returns an Optional wrapping the first element encountered (respecting encounter order, even in parallel streams) — findAny returns any matching element and may be more efficient in parallel streams since it doesn\'t have to respect ordering.',
    code: `List<Integer> nums = List.of(2, 4, 6, 7, 8);

nums.stream().anyMatch(n -> n % 2 != 0);  // true — 7 is odd
nums.stream().allMatch(n -> n % 2 == 0);  // false — not all even
nums.stream().noneMatch(n -> n > 100);    // true — none exceed 100

Optional<Integer> first = nums.stream().filter(n -> n > 5).findFirst(); // Optional[6]
Optional<Integer> any   = nums.parallelStream().filter(n -> n > 5).findAny(); // could be 6, 7, or 8`,
    highlights: ['anyMatch/allMatch/noneMatch: short-circuiting boolean checks', 'findFirst: respects encounter order', 'findAny: no ordering guarantee, better for parallel streams'],
  },

  // ─── SPRING (Spring Framework + Spring Boot, new category) ─────────────
  {
    id: 2100, category: 'Spring', difficulty: 'Junior',
    question: 'What is Spring, and what problem does the IoC Container / Dependency Injection solve?',
    answer: 'Spring is a comprehensive framework for building Java applications, built around Inversion of Control (IoC) — instead of your objects creating and wiring their own dependencies (tight coupling, hard to test), you declare what a class needs and the Spring IoC Container creates, configures, and injects those dependencies for you (Dependency Injection). This decouples components from how their dependencies are constructed, makes swapping implementations trivial (e.g. for testing with mocks), and centralizes configuration instead of scattering `new` calls throughout the codebase.',
    code: `// Without DI — tightly coupled, hard to test
class OrderService {
  private PaymentGateway gateway = new StripeGateway(); // hardcoded, can't swap for a test mock
}

// With DI — Spring injects the dependency
@Service
class OrderService {
  private final PaymentGateway gateway;
  public OrderService(PaymentGateway gateway) { this.gateway = gateway; } // Spring wires this in
}`,
    highlights: ['IoC: framework controls object creation, not your code', 'DI: dependencies are injected, not hand-constructed', 'Decouples components, makes testing/swapping easy'],
  },
  {
    id: 2101, category: 'Spring', difficulty: 'Mid',
    question: 'What is the difference between Constructor Injection and Setter Injection? Which is recommended?',
    answer: 'Constructor Injection passes dependencies through the constructor, making them final and guaranteeing the bean is never in a partially-initialized state — this is the recommended approach because it makes dependencies explicit and required, and enables immutability. Setter Injection passes dependencies through setter methods after construction, making them optional and mutable — occasionally useful for optional dependencies or breaking circular dependency chains, but generally discouraged since a bean can exist momentarily without its dependencies set.',
    code: `// Recommended: constructor injection — dependency is guaranteed present & immutable
@Service
class OrderService {
  private final PaymentGateway gateway;
  public OrderService(PaymentGateway gateway) { this.gateway = gateway; }
}

// Setter injection — optional dependency, mutable
@Service
class NotificationService {
  private EmailSender emailSender;
  @Autowired(required = false)
  public void setEmailSender(EmailSender emailSender) { this.emailSender = emailSender; }
}`,
    highlights: ['Constructor injection: required, immutable, guaranteed complete', 'Setter injection: optional, mutable, can be set post-construction', 'Constructor injection is the modern recommended default'],
  },
  {
    id: 2102, category: 'Spring', difficulty: 'Mid',
    question: 'Explain the Spring Bean lifecycle and the difference between Singleton and Prototype scope.',
    answer: 'A bean\'s lifecycle runs: instantiate → populate properties (DI) → BeanNameAware/BeanFactoryAware callbacks → @PostConstruct / InitializingBean.afterPropertiesSet() → bean is ready for use → @PreDestroy / DisposableBean.destroy() on container shutdown. Singleton scope (the default) creates exactly one shared instance per Spring container, reused everywhere it\'s injected — appropriate for stateless services. Prototype scope creates a brand-new instance every time the bean is requested — appropriate for stateful, non-thread-safe objects that shouldn\'t be shared.',
    code: `@Service
@Scope("prototype") // new instance every injection/lookup, default is "singleton"
class ReportGenerator {
  @PostConstruct
  void init() { System.out.println("Bean ready"); }

  @PreDestroy
  void cleanup() { System.out.println("Bean being destroyed"); }
}`,
    highlights: ['Lifecycle: instantiate → inject → @PostConstruct → in use → @PreDestroy', 'Singleton (default): one shared instance per container', 'Prototype: a new instance every time it\'s requested'],
  },
  {
    id: 2103, category: 'Spring', difficulty: 'Junior',
    question: 'What is the difference between @Component, @Service, @Repository, and @Controller/@RestController?',
    answer: 'All four are specializations of @Component, so Spring\'s component scan picks up any of them as a bean — the distinction is purely semantic (and, for @Repository, functional). @Component is the generic stereotype. @Service marks a business-logic/service-layer bean. @Repository marks a data-access-layer bean and additionally enables Spring\'s automatic translation of persistence-specific exceptions into Spring\'s unified DataAccessException hierarchy. @Controller marks a Spring MVC controller whose methods return view names to be resolved; @RestController is @Controller + @ResponseBody combined, so every method\'s return value is serialized directly into the HTTP response body (typically as JSON) instead of resolving a view.',
    code: `@Repository // data access + exception translation
interface UserRepository extends JpaRepository<User, Long> {}

@Service // business logic
class UserService {
  private final UserRepository repo;
  UserService(UserRepository repo) { this.repo = repo; }
}

@RestController // = @Controller + @ResponseBody — returns JSON directly
class UserController {
  @GetMapping("/users/{id}")
  User getUser(@PathVariable Long id) { return userService.findById(id); }
}`,
    highlights: ['All are @Component specializations — same scanning mechanism', '@Repository also enables exception translation', '@RestController = @Controller + @ResponseBody (JSON body, not a view)'],
  },
  {
    id: 2104, category: 'Spring', difficulty: 'Mid',
    question: 'What is the difference between @Autowired, @Qualifier, and @Primary?',
    answer: '@Autowired tells Spring to inject a matching bean automatically by type. When multiple beans implement the same interface, Spring can\'t pick one automatically and throws a NoUniqueBeanDefinitionException unless disambiguated: @Qualifier("beanName") explicitly picks a specific bean by name at each injection point, while @Primary marks one implementation as the default choice whenever multiple candidates exist and no @Qualifier is specified — useful when you have one "usual" choice but occasionally need to override it.',
    code: `interface PaymentGateway {}

@Service("stripeGateway")
@Primary // the default when ambiguous
class StripeGateway implements PaymentGateway {}

@Service("paypalGateway")
class PaypalGateway implements PaymentGateway {}

@Service
class OrderService {
  // @Primary makes this resolve to StripeGateway automatically:
  @Autowired
  private PaymentGateway defaultGateway;

  // @Qualifier explicitly overrides for this specific injection point:
  @Autowired
  @Qualifier("paypalGateway")
  private PaymentGateway paypal;
}`,
    highlights: ['@Autowired: inject by type automatically', '@Qualifier: pick a specific bean by name when ambiguous', '@Primary: default choice among multiple candidates'],
  },
  {
    id: 2105, category: 'Spring', difficulty: 'Mid',
    question: 'What is AOP (Aspect-Oriented Programming) in Spring? Explain Advice, JoinPoint, Pointcut, and Aspect.',
    answer: 'AOP lets you modularize cross-cutting concerns — logic like logging, transactions, or security checks that would otherwise be scattered/duplicated across many unrelated classes — into a single reusable module applied declaratively. A JoinPoint is a specific point during execution where an aspect can hook in (typically a method call, in Spring AOP). A Pointcut is an expression that selects which join points to match (e.g. "all methods in the service package"). Advice is the actual code that runs at a matched join point (@Before, @After, @Around, @AfterThrowing). An Aspect is a class that bundles a pointcut with its advice into one reusable module.',
    code: `@Aspect
@Component
class LoggingAspect {
  @Around("execution(* com.example.service.*.*(..))") // pointcut: all service-layer methods
  Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
    long start = System.currentTimeMillis();
    Object result = joinPoint.proceed(); // actually invoke the target method
    System.out.println(joinPoint.getSignature() + " took " + (System.currentTimeMillis() - start) + "ms");
    return result;
  }
}`,
    highlights: ['AOP modularizes cross-cutting concerns (logging, security, transactions)', 'Pointcut: which join points to match; Advice: what runs there', 'Aspect: bundles a pointcut + its advice into one reusable module'],
  },
  {
    id: 2106, category: 'Spring', difficulty: 'Mid',
    question: 'Explain the Spring MVC request flow: DispatcherServlet, ViewResolver, and RequestMapping.',
    answer: 'Every incoming HTTP request first hits the DispatcherServlet, Spring MVC\'s single front controller. It consults a HandlerMapping to find which controller method (matched by @RequestMapping/@GetMapping etc.) should handle the request, invokes it, and receives back either a view name + Model (traditional MVC) or, with @RestController, the response body directly. For traditional MVC, the DispatcherServlet then hands the view name to a ViewResolver, which maps it to an actual template (e.g. a Thymeleaf or JSP file) to render using the Model data, and that rendered output becomes the HTTP response.',
    code: `@Controller // traditional MVC — returns a view name
class ProductController {
  @GetMapping("/products/{id}")
  String getProduct(@PathVariable Long id, Model model) {
    model.addAttribute("product", productService.findById(id));
    return "product-detail"; // ViewResolver maps this to product-detail.html
  }
}
// Flow: request → DispatcherServlet → HandlerMapping finds this method
//       → method runs, returns view name → ViewResolver resolves the template
//       → template rendered with Model data → HTTP response`,
    highlights: ['DispatcherServlet: single front controller for all requests', 'HandlerMapping finds the right @RequestMapping method', 'ViewResolver maps a returned view name to an actual template'],
  },
  {
    id: 2107, category: 'Spring', difficulty: 'Junior',
    question: 'What is the difference between @PathVariable, @RequestParam, and @RequestBody?',
    answer: '@PathVariable extracts a value from a placeholder embedded in the URL path itself (e.g. /users/{id}). @RequestParam extracts a value from the URL\'s query string or form data (e.g. ?page=2). @RequestBody deserializes the entire HTTP request body (typically JSON) into a Java object, used for POST/PUT payloads.',
    code: `@RestController
class UserController {
  @GetMapping("/users/{id}")           // /users/42
  User getUser(@PathVariable Long id) { ... }

  @GetMapping("/users")                // /users?page=2&size=10
  List<User> listUsers(@RequestParam int page, @RequestParam(defaultValue = "10") int size) { ... }

  @PostMapping("/users")               // JSON body: {"name": "Ada", "email": "..."}
  User createUser(@RequestBody UserDto dto) { ... }
}`,
    highlights: ['@PathVariable: from the URL path itself', '@RequestParam: from query string / form params', '@RequestBody: deserializes the whole JSON request body'],
  },
  {
    id: 2108, category: 'Spring', difficulty: 'Mid',
    question: 'How do you implement centralized/global exception handling in Spring Boot?',
    answer: '@ControllerAdvice (or @RestControllerAdvice for JSON APIs) defines a class that applies across all controllers, and @ExceptionHandler methods within it catch specific exception types thrown from any controller, letting you return a consistent error response shape (status code, message, timestamp) from one place instead of wrapping every controller method in try/catch. This keeps controllers focused on business logic and guarantees a uniform error contract for API consumers.',
    code: `@RestControllerAdvice
class GlobalExceptionHandler {
  @ExceptionHandler(ResourceNotFoundException.class)
  ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
      .body(new ErrorResponse(ex.getMessage(), Instant.now()));
  }

  @ExceptionHandler(Exception.class) // catch-all fallback
  ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
      .body(new ErrorResponse("Something went wrong", Instant.now()));
  }
}`,
    highlights: ['@ControllerAdvice: applies across all controllers globally', '@ExceptionHandler: catches a specific exception type', 'Guarantees a consistent error response shape across the whole API'],
  },
  {
    id: 2109, category: 'Spring', difficulty: 'Junior',
    question: 'What is Spring Boot and how is it different from the Spring Framework? What does Auto Configuration do?',
    answer: 'Spring Framework is the underlying dependency-injection and application framework, which historically required a lot of manual XML/Java configuration to wire up (data sources, view resolvers, security filters, etc.). Spring Boot is built on top of it to eliminate that boilerplate: it provides opinionated "starter" dependencies that pull in everything commonly needed for a use case (spring-boot-starter-web, spring-boot-starter-data-jpa), an embedded server (Tomcat/Jetty by default) so you don\'t need to deploy a WAR to an external server, and Auto Configuration — Spring Boot inspects what\'s on the classpath and automatically configures sensible-default beans for it (e.g. seeing an H2 driver on the classpath auto-configures an in-memory DataSource) unless you\'ve defined your own.',
    code: `// pom.xml — a single starter pulls in web MVC + embedded Tomcat + Jackson JSON support
// <dependency><artifactId>spring-boot-starter-web</artifactId></dependency>

@SpringBootApplication // = @Configuration + @EnableAutoConfiguration + @ComponentScan
public class MyApp {
  public static void main(String[] args) {
    SpringApplication.run(MyApp.class, args); // starts embedded server, no external deploy needed
  }
}`,
    highlights: ['Spring Boot = Spring + starters + embedded server + auto-config', 'Auto Configuration: sensible defaults based on the classpath', 'Eliminates most manual XML/Java wiring boilerplate'],
  },
  {
    id: 2110, category: 'Spring', difficulty: 'Junior',
    question: 'What is the difference between application.properties and application.yml? How do Profiles work?',
    answer: 'Both configure a Spring Boot application identically under the hood — .properties uses flat key=value pairs, while .yml uses YAML\'s nested, indentation-based structure, which is more readable for deeply nested configuration and avoids repeating common prefixes. Profiles (application-dev.yml, application-prod.yml, activated via spring.profiles.active) let you maintain environment-specific configuration overrides — different database URLs, logging levels, or feature flags per environment — layered on top of the base application.yml.',
    code: `# application.yml
spring:
  profiles:
    active: dev
---
# application-dev.yml — only loaded when the "dev" profile is active
spring:
  datasource:
    url: jdbc:h2:mem:devdb
---
# application-prod.yml — only loaded when the "prod" profile is active
spring:
  datasource:
    url: jdbc:postgresql://prod-host:5432/appdb`,
    highlights: ['.properties: flat key=value; .yml: nested, more readable', 'Profiles: environment-specific config overrides', 'Activated via spring.profiles.active'],
  },
  {
    id: 2111, category: 'Spring', difficulty: 'Junior',
    question: 'What is the difference between CrudRepository, PagingAndSortingRepository, and JpaRepository in Spring Data JPA?',
    answer: 'CrudRepository is the base interface providing basic create/read/update/delete methods (save, findById, findAll, deleteById). PagingAndSortingRepository extends it to add findAll(Pageable) and findAll(Sort) for pagination and sorting. JpaRepository extends both and adds JPA-specific conveniences like batch operations (saveAll, flush, deleteInBatch) and returning results as a List instead of an Iterable. In practice, most Spring Data JPA repositories extend JpaRepository directly since it includes everything the other two offer.',
    code: `interface ProductRepository extends JpaRepository<Product, Long> {
  // Free pagination + sorting inherited from JpaRepository:
  Page<Product> findByCategory(String category, Pageable pageable);
}

// Usage:
Pageable pageable = PageRequest.of(0, 20, Sort.by("price").descending());
Page<Product> page = productRepository.findByCategory("electronics", pageable);`,
    highlights: ['CrudRepository: basic CRUD operations', 'PagingAndSortingRepository: adds pagination/sorting', 'JpaRepository: adds batch ops + returns List; the usual base to extend'],
  },
  {
    id: 2112, category: 'Spring', difficulty: 'Mid',
    question: 'What is the difference between Lazy and Eager loading, and Cascade Types in Spring Data JPA?',
    answer: 'Lazy loading (FetchType.LAZY) defers fetching an associated entity until it\'s actually accessed — proxied, and fetched with a separate query at that point. Eager loading (FetchType.EAGER) fetches the association immediately as part of the parent query, always, whether you need it or not. Lazy is the safer default for collections since eager-loading every relationship transitively can silently balloon a simple query into a huge join or dozens of extra queries (the N+1 problem). Cascade Types control which operations (PERSIST, MERGE, REMOVE, etc.) automatically propagate from a parent entity to its associated child entities — e.g. CascadeType.REMOVE on an Order → OrderItems association means deleting the Order also deletes all its OrderItems automatically.',
    code: `@Entity
class Order {
  @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  private List<OrderItem> items; // not fetched until order.getItems() is called

  @ManyToOne(fetch = FetchType.EAGER) // always fetched with the Order
  private Customer customer;
}
// cascade = ALL: persisting/removing an Order also persists/removes its OrderItems`,
    highlights: ['Lazy: fetched on access, safer default for collections', 'Eager: always fetched with the parent, risk of N+1/overfetching', 'Cascade Types: which operations propagate parent → children'],
  },
  {
    id: 2113, category: 'Spring', difficulty: 'Mid',
    question: 'What is the difference between JPQL and Native Queries in Spring Data JPA?',
    answer: 'JPQL (Java Persistence Query Language) is written against your entity model — entity/field names, not table/column names — so it\'s database-agnostic and portable across different SQL dialects, with Hibernate translating it into the appropriate SQL underneath. A Native Query is raw, database-specific SQL, used when you need a feature JPQL doesn\'t support (window functions, database-specific functions, complex joins that are painful to express in JPQL) at the cost of portability.',
    code: `interface OrderRepository extends JpaRepository<Order, Long> {
  // JPQL — references the Order ENTITY and its fields
  @Query("SELECT o FROM Order o WHERE o.customer.email = :email AND o.status = 'PENDING'")
  List<Order> findPendingByCustomerEmail(@Param("email") String email);

  // Native SQL — references the actual TABLE and columns, DB-specific
  @Query(value = "SELECT * FROM orders WHERE status = 'PENDING' ORDER BY created_at DESC LIMIT :n", nativeQuery = true)
  List<Order> findRecentPending(@Param("n") int n);
}`,
    highlights: ['JPQL: queries the entity model, portable across databases', 'Native: raw SQL, database-specific but full SQL feature access', 'Use native when JPQL can\'t express what you need'],
  },
  {
    id: 2114, category: 'Spring', difficulty: 'Senior',
    question: 'How does Spring Security authentication and authorization work at a high level? What is a Filter Chain?',
    answer: 'Spring Security intercepts every request through a chain of Servlet Filters before it reaches your controllers. Authentication filters (e.g. UsernamePasswordAuthenticationFilter, or a custom JWT filter) extract credentials, verify them via an AuthenticationManager/AuthenticationProvider, and — on success — populate the SecurityContext with an Authentication object representing the logged-in user for the rest of the request\'s lifetime. Authorization then happens either declaratively (@PreAuthorize("hasRole(\'ADMIN\')") on a method, or matcher rules in the SecurityFilterChain config) by checking the authorities on that Authentication object against what\'s required for the requested resource.',
    code: `@Configuration
@EnableMethodSecurity
class SecurityConfig {
  @Bean
  SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    return http
      .authorizeHttpRequests(auth -> auth
        .requestMatchers("/admin/**").hasRole("ADMIN")
        .requestMatchers("/api/public/**").permitAll()
        .anyRequest().authenticated())
      .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
      .build();
  }
}

@PreAuthorize("hasRole('ADMIN')") // method-level authorization
void deleteUser(Long id) { ... }`,
    highlights: ['Requests pass through a chain of Servlet Filters', 'Authentication populates the SecurityContext on success', 'Authorization checks authorities against the requested resource'],
  },
  {
    id: 2115, category: 'Spring', difficulty: 'Mid',
    question: 'What is the difference between CSRF and CORS, and why does JWT-based auth typically disable CSRF protection?',
    answer: 'CSRF (Cross-Site Request Forgery) protection defends against a malicious site tricking a user\'s browser into submitting an authenticated request to your app using the user\'s existing session cookie, without the user\'s knowledge — Spring Security defends against this with a per-session CSRF token that must be included in state-changing requests. CORS (Cross-Origin Resource Sharing) is a browser-enforced policy controlling which origins are allowed to call your API from client-side JavaScript at all. CSRF protection is typically disabled for stateless JWT-based APIs because the attack it defends against relies on automatically-sent cookies — a JWT sent via an Authorization header must be attached explicitly by your own JavaScript, so a forged cross-site request can\'t "accidentally" include it the way a cookie would.',
    code: `@Bean
SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
  return http
    .csrf(csrf -> csrf.disable()) // safe to disable: JWT isn't auto-attached like a cookie
    .cors(cors -> cors.configurationSource(corsConfigurationSource())) // still needed for browser cross-origin calls
    .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
    .build();
}`,
    highlights: ['CSRF: defends against forged requests riding on session cookies', 'CORS: browser policy on which origins can call your API', 'JWT in a header isn\'t auto-sent like a cookie, so CSRF risk is much lower'],
  },
  {
    id: 2116, category: 'Spring', difficulty: 'Senior',
    question: 'What roles do Eureka, an API Gateway, and a Config Server play in a Spring Cloud microservices architecture?',
    answer: 'Eureka is a service registry — each microservice registers itself on startup (name + network location), and other services discover its current address by querying Eureka instead of hardcoding IPs, which matters since instances scale up/down and get rescheduled with different addresses. An API Gateway (e.g. Spring Cloud Gateway) sits in front of all microservices as the single entry point for external clients, handling routing to the right downstream service, cross-cutting concerns like authentication, rate limiting, and request logging in one place instead of duplicating them in every service. A Config Server centralizes externalized configuration for all microservices in one repository (often backed by Git), so config changes can be pushed without rebuilding/redeploying each service individually.',
    code: `# API Gateway routing config (application.yml)
spring:
  cloud:
    gateway:
      routes:
        - id: order-service
          uri: lb://ORDER-SERVICE   # "lb://" = load-balanced via Eureka service discovery
          predicates:
            - Path=/api/orders/**`,
    highlights: ['Eureka: service registry for dynamic discovery', 'API Gateway: single entry point, routing + cross-cutting concerns', 'Config Server: centralized, externalized config for all services'],
  },
  {
    id: 2117, category: 'Spring', difficulty: 'Senior',
    question: 'What is a Circuit Breaker (Resilience4j) and Feign Client, and why do they matter in microservices?',
    answer: 'In a microservices architecture, one service calling another over the network can fail or slow down, and without protection, a struggling downstream service can cause cascading failures as callers pile up waiting on it. A Circuit Breaker (Resilience4j is the modern standard, replacing the retired Netflix Hystrix) monitors the failure rate of calls to a dependency and "opens" once a threshold is crossed — subsequent calls fail fast immediately (optionally falling back to a default response) instead of waiting on a doomed request, giving the struggling service room to recover before the breaker periodically tests it again. Feign Client is a declarative HTTP client — you define an interface annotated with the target service\'s routes, and Feign generates the implementation, making inter-service calls read like local method calls instead of hand-written RestTemplate/WebClient boilerplate.',
    code: `@FeignClient(name = "inventory-service")
interface InventoryClient {
  @GetMapping("/api/inventory/{sku}")
  StockLevel getStock(@PathVariable String sku); // reads like a local method call
}

@Service
class OrderService {
  @CircuitBreaker(name = "inventoryService", fallbackMethod = "fallbackStock")
  StockLevel checkStock(String sku) { return inventoryClient.getStock(sku); }

  StockLevel fallbackStock(String sku, Throwable t) {
    return StockLevel.unknown(); // fails fast instead of cascading
  }
}`,
    highlights: ['Circuit Breaker: fails fast once a failure threshold trips, prevents cascades', 'Resilience4j is the modern standard (Hystrix is retired)', 'Feign Client: declarative interface-based HTTP client for inter-service calls'],
  },

  // ─── SPRING — scenario-based (production/real-project questions) ────
  {
    id: 2130, category: 'Spring', difficulty: 'Senior',
    question: 'Walk through designing a secure login system using Spring Boot and JWT.',
    answer: 'On login, validate the submitted credentials against the stored (BCrypt-hashed) password via a UserDetailsService and PasswordEncoder — never store or compare plaintext passwords. On success, issue a short-lived signed JWT access token (containing the user ID and roles as claims) plus a longer-lived refresh token stored server-side or as an httpOnly cookie. Register a custom filter (extending OncePerRequestFilter) that runs before Spring Security\'s standard auth filter, extracts the JWT from the Authorization header on every subsequent request, validates its signature and expiry, and populates the SecurityContext if valid. Protect endpoints with role-based rules, use HTTPS everywhere so the token can\'t be sniffed in transit, and keep the access token\'s expiry short (minutes, not days) so a leaked token has a limited blast radius.',
    code: `@Component
class JwtAuthFilter extends OncePerRequestFilter {
  protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) throws IOException, ServletException {
    String header = req.getHeader("Authorization");
    if (header != null && header.startsWith("Bearer ")) {
      String token = header.substring(7);
      if (jwtUtil.isValid(token)) {
        Authentication auth = jwtUtil.getAuthentication(token);
        SecurityContextHolder.getContext().setAuthentication(auth);
      }
    }
    chain.doFilter(req, res); // continue regardless — unauthenticated requests get rejected downstream
  }
}`,
    highlights: ['BCrypt-hash passwords, never store/compare plaintext', 'Custom filter validates JWT and populates SecurityContext per request', 'Short-lived access token + HTTPS everywhere limits blast radius of a leak'],
  },
  {
    id: 2131, category: 'Spring', difficulty: 'Senior',
    question: 'How would you optimize a slow REST API built with Spring Boot?',
    answer: 'Start by measuring, not guessing: enable Spring Boot Actuator and/or APM tracing to find where the time actually goes. Common culprits and fixes: N+1 queries (fix with @EntityGraph or a JOIN FETCH JPQL query to eager-load associations in one query), missing database indexes on frequently filtered/joined columns, returning far more data than the client needs (add pagination, or a leaner DTO projection instead of the full entity graph), synchronous calls to slow downstream services (parallelize independent calls with CompletableFuture, or cache their results), and lack of caching for expensive but rarely-changing computations (@Cacheable). Also check connection pool sizing (HikariCP) isn\'t a bottleneck under load.',
    code: `// N+1 fix: JOIN FETCH pulls the association in a single query
@Query("SELECT o FROM Order o JOIN FETCH o.items WHERE o.customerId = :id")
List<Order> findByCustomerWithItems(@Param("id") Long id);

// Caching an expensive, rarely-changing computation
@Cacheable(value = "productPricing", key = "#productId")
BigDecimal calculateDynamicPrice(Long productId) { /* expensive computation */ }`,
    highlights: ['Measure first (Actuator/APM) — don\'t guess the bottleneck', 'Fix N+1 with JOIN FETCH / @EntityGraph, add missing indexes', 'Cache expensive rarely-changing results, parallelize independent downstream calls'],
  },
  {
    id: 2132, category: 'Spring', difficulty: 'Mid',
    question: 'How do you implement pagination and sorting in a Spring Boot REST API?',
    answer: 'Accept a Pageable parameter directly in the controller method — Spring automatically resolves it from standard query params (?page=0&size=20&sort=price,desc) when the repository method extends PagingAndSortingRepository/JpaRepository. Return a Page<T> (or map it to a DTO wrapper) so the client also receives metadata like total elements, total pages, and whether it\'s the last page, not just the raw content list.',
    code: `@RestController
class ProductController {
  @GetMapping("/products")
  Page<ProductDto> listProducts(
      @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
    return productRepository.findAll(pageable).map(ProductDto::from);
  }
}
// GET /products?page=1&size=10&sort=price,asc  works automatically`,
    highlights: ['Pageable is resolved automatically from standard query params', 'Return Page<T> so clients get total count/pages metadata too', '@PageableDefault sets sane defaults when the client omits params'],
  },
  {
    id: 2133, category: 'Spring', difficulty: 'Senior',
    question: 'Explain optimistic locking with a practical Spring Data JPA example.',
    answer: 'Optimistic locking assumes conflicts are rare, so instead of holding a database lock for the whole transaction (pessimistic locking, which hurts throughput), it adds a @Version column to the entity. On every update, Hibernate includes the currently-known version in the WHERE clause and increments it — if another transaction already changed the row (and thus its version) in between, zero rows match the WHERE clause, and Hibernate throws an OptimisticLockException, letting the application retry or surface a "someone else already updated this" conflict to the user, rather than silently overwriting their change.',
    code: `@Entity
class Account {
  @Id Long id;
  BigDecimal balance;

  @Version // Hibernate manages this automatically
  Long version;
}

// UPDATE account SET balance = ?, version = version + 1
// WHERE id = ? AND version = ?   <-- fails (0 rows) if version changed concurrently
try {
  accountRepository.save(account);
} catch (OptimisticLockException e) {
  // another transaction updated this row first — reload and retry, or surface a conflict
}`,
    highlights: ['@Version column tracked automatically by Hibernate', 'Update fails if the row\'s version changed since it was read', 'Better throughput than pessimistic locking when conflicts are rare'],
  },
  {
    id: 2134, category: 'Spring', difficulty: 'Mid',
    question: 'How would you implement large file uploads in Spring Boot without running into memory issues?',
    answer: 'By default, Spring buffers the whole multipart file in memory (or a temp file past a configured threshold) — fine for small files, but risky for large ones under concurrent load. Configure spring.servlet.multipart.max-file-size and max-request-size explicitly, and set a file-size-threshold so files above a certain size spill to disk instead of memory automatically. For genuinely large files (video, big datasets), stream the upload directly to storage (e.g. an S3 multipart upload) using InputStream processing rather than loading the whole MultipartFile.getBytes() into a byte array, which avoids holding the entire file in heap memory at once.',
    code: `# application.yml
spring:
  servlet:
    multipart:
      max-file-size: 500MB
      max-request-size: 500MB
      file-size-threshold: 2KB  # spill to disk above this, don't hold small ones in memory either

@PostMapping("/upload")
ResponseEntity<String> upload(@RequestParam MultipartFile file) throws IOException {
  try (InputStream in = file.getInputStream()) {
    s3Client.putObject(bucket, key, in, file.getSize()); // streamed, not fully buffered in a byte[]
  }
  return ResponseEntity.ok("uploaded");
}`,
    highlights: ['Configure max-file-size/max-request-size and a disk-spill threshold', 'Stream directly to storage instead of file.getBytes() into memory', 'Avoids holding entire large files in heap under concurrent uploads'],
  },
  {
    id: 2135, category: 'Spring', difficulty: 'Mid',
    question: 'How would you implement role-based access control (RBAC) in Spring Boot?',
    answer: 'Model roles (and optionally finer-grained permissions/authorities) as part of your user data, load them into a UserDetails object\'s getAuthorities() during authentication so they\'re attached to the SecurityContext for the whole request. Enforce them at two levels: coarse-grained URL-pattern rules in the SecurityFilterChain (requestMatchers("/admin/**").hasRole("ADMIN")) for broad route protection, and fine-grained @PreAuthorize("hasAuthority(\'ORDER_DELETE\')") annotations on specific service methods for more granular checks that URL patterns alone can\'t express (e.g. "can edit their own order but not others\').',
    code: `@Entity
class User {
  @ManyToMany(fetch = FetchType.EAGER)
  Set<Role> roles; // e.g. ADMIN, USER
}

@Service
class CustomUserDetailsService implements UserDetailsService {
  UserDetails loadUserByUsername(String username) {
    User user = userRepository.findByUsername(username);
    var authorities = user.getRoles().stream()
      .map(r -> new SimpleGrantedAuthority("ROLE_" + r.getName()))
      .toList();
    return new org.springframework.security.core.userdetails.User(user.getUsername(), user.getPassword(), authorities);
  }
}

@PreAuthorize("hasRole('ADMIN') or #order.ownerId == authentication.principal.id")
void deleteOrder(@P("order") Order order) { ... }`,
    highlights: ['Roles loaded into UserDetails.getAuthorities() at auth time', 'Coarse: URL patterns in SecurityFilterChain', 'Fine-grained: @PreAuthorize on specific service methods'],
  },
  {
    id: 2136, category: 'Spring', difficulty: 'Mid',
    question: 'How do you reduce unnecessary database calls in a Spring Boot service layer?',
    answer: 'Common levers: use @Cacheable (backed by Caffeine/Redis) for expensive, rarely-changing reads so repeated calls hit the cache instead of the DB; batch operations (saveAll instead of looping save()) to cut round trips; fix N+1 patterns by fetching associations in one query (JOIN FETCH/@EntityGraph) instead of one extra query per related row; use projections/DTOs to select only the columns you need instead of full entities when you don\'t need the whole object graph; and enable Hibernate\'s first-level (session) cache to naturally dedupe repeated lookups of the same entity within a single transaction, which it does automatically.',
    code: `@Cacheable(value = "userPreferences", key = "#userId")
UserPreferences getPreferences(Long userId) { return preferencesRepository.findByUserId(userId); }

// Projection: fetch only 2 columns instead of the whole entity
interface UserSummary { String getName(); String getEmail(); }
List<UserSummary> findAllProjectedBy(); // Spring Data JPA interface projection`,
    highlights: ['@Cacheable for expensive, rarely-changing reads', 'Batch writes, fix N+1 with JOIN FETCH/@EntityGraph', 'Projections/DTOs to avoid over-fetching full entities'],
  },
  {
    id: 2137, category: 'Spring', difficulty: 'Senior',
    question: 'What steps would you take to make a Spring Boot application production-ready?',
    answer: 'Add Spring Boot Actuator for health checks, metrics, and readiness/liveness probes that your orchestrator (Kubernetes) can poll. Externalize all environment-specific config (DB credentials, API keys) via environment variables or a Config Server/secrets manager — never hardcode or commit them. Configure structured, centralized logging (JSON logs shipped to something like ELK/Datadog) instead of unstructured console output. Set sensible connection pool sizes and timeouts (HikariCP) so a slow dependency doesn\'t exhaust all threads. Add a global exception handler for consistent error responses, enable graceful shutdown so in-flight requests complete before the process exits during a deploy, and wire up distributed tracing (e.g. via Micrometer/OpenTelemetry) if it\'s part of a microservices system.',
    code: `# application.yml — production readiness essentials
management:
  endpoints:
    web:
      exposure:
        include: health, metrics, prometheus
  endpoint:
    health:
      probes:
        enabled: true # separate /actuator/health/liveness and /readiness for k8s

server:
  shutdown: graceful
spring:
  lifecycle:
    timeout-per-shutdown-phase: 30s`,
    highlights: ['Actuator health/readiness probes for the orchestrator', 'Externalized config, never hardcoded secrets', 'Graceful shutdown, connection pool tuning, centralized structured logging'],
  },
  {
    id: 2138, category: 'Spring', difficulty: 'Senior',
    question: 'Describe how you would design a microservice for document management (upload, storage, metadata, search).',
    answer: 'Split concerns cleanly: the service accepts uploads via a streamed multipart endpoint, storing the actual file bytes in object storage (S3 or equivalent) rather than the database — databases are poor at storing large blobs efficiently. Persist metadata (filename, owner, size, content type, storage key, tags) in a relational database for structured queries, and optionally sync a search-optimized copy into something like Elasticsearch for full-text search across document content/metadata. Generate pre-signed URLs for direct client download from object storage rather than proxying large file bytes through your own service. Version documents by storing each revision under a distinct storage key rather than overwriting, and enforce access control at the metadata layer (checking ownership/sharing permissions) before ever issuing a download URL.',
    code: `@PostMapping("/documents")
DocumentDto upload(@RequestParam MultipartFile file, Principal principal) throws IOException {
  String key = UUID.randomUUID() + "-" + file.getOriginalFilename();
  s3Client.putObject(bucket, key, file.getInputStream(), file.getSize()); // bytes → object storage
  Document doc = documentRepository.save(new Document(key, file.getOriginalFilename(),
      file.getSize(), principal.getName()));                              // metadata → relational DB
  return DocumentDto.from(doc);
}

@GetMapping("/documents/{id}/download-url")
String getDownloadUrl(@PathVariable Long id, Principal principal) {
  Document doc = documentRepository.findByIdAndCheckOwnership(id, principal.getName());
  return s3Client.generatePresignedUrl(bucket, doc.getStorageKey(), Duration.ofMinutes(15));
}`,
    highlights: ['File bytes → object storage; metadata → relational DB', 'Pre-signed URLs for direct download instead of proxying bytes', 'Access control checked at the metadata layer before issuing a URL'],
  },

  // ─── HIBERNATE (new category) ────────────────────────────────────────
  {
    id: 2200, category: 'Hibernate', difficulty: 'Junior',
    question: 'What is Hibernate and how does ORM (Object-Relational Mapping) work?',
    answer: 'Hibernate is an ORM framework that maps Java objects (entities) to relational database tables, letting you work with plain Java objects and let Hibernate translate operations on them into the appropriate SQL — instead of hand-writing SQL and manually mapping ResultSets back into objects. ORM works by annotating a class with @Entity and its fields with column mappings; Hibernate then generates INSERT/UPDATE/SELECT/DELETE statements automatically, manages object identity within a session, and translates relationships (@OneToMany, @ManyToOne) into foreign keys and joins.',
    code: `@Entity
@Table(name = "products")
class Product {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  Long id;

  @Column(name = "product_name", nullable = false)
  String name;

  BigDecimal price;
}

// No SQL written by hand:
Product p = new Product();
p.setName("Widget");
session.persist(p); // Hibernate generates: INSERT INTO products (product_name, price) VALUES (?, ?)`,
    highlights: ['Maps Java objects (entities) to relational tables', 'Auto-generates SQL from annotated entity classes', 'Manages relationships as foreign keys/joins automatically'],
  },
  {
    id: 2201, category: 'Hibernate', difficulty: 'Mid',
    question: 'What is the difference between Session and SessionFactory in Hibernate?',
    answer: 'SessionFactory is a heavyweight, thread-safe object created once per application (or per database) at startup — it holds the compiled mappings and connection pool configuration, and its job is to produce Session instances. A Session is a lightweight, single-threaded, short-lived object representing one unit of work / conversation with the database (roughly analogous to a JPA EntityManager) — it\'s where you actually perform persist/find/merge/remove operations, and it maintains the first-level cache for that unit of work.',
    code: `// Created once at application startup — expensive, thread-safe, shared
SessionFactory sessionFactory = new Configuration().configure().buildSessionFactory();

// Created per unit of work — cheap, NOT thread-safe, short-lived
try (Session session = sessionFactory.openSession()) {
  session.beginTransaction();
  Product p = session.get(Product.class, 1L);
  session.getTransaction().commit();
}`,
    highlights: ['SessionFactory: created once, thread-safe, heavyweight', 'Session: per unit of work, single-threaded, lightweight', 'Session holds the first-level cache for that unit of work'],
  },
  {
    id: 2202, category: 'Hibernate', difficulty: 'Mid',
    question: 'Explain the Entity Lifecycle in Hibernate: Transient, Persistent, Detached, and Removed states.',
    answer: 'A newly-created object (via `new`) is Transient — Hibernate knows nothing about it, and it has no database representation. Once you call persist() (or save()), it becomes Persistent (or "managed") — it\'s associated with a Session, tracked for changes, and any modifications are automatically synchronized to the database on flush/commit. If the Session closes (or the entity is explicitly detach()-ed) while the row still exists in the DB, it becomes Detached — Hibernate no longer tracks changes to it until it\'s merge()-d back into a new session. Calling remove() (or delete()) transitions a persistent entity to Removed, scheduling a DELETE on flush.',
    code: `Product p = new Product();       // Transient — not tracked, no DB row
p.setName("Widget");

session.persist(p);              // Persistent — now tracked, INSERT scheduled

session.close();                 // p is now Detached — changes no longer auto-tracked
p.setName("Changed");            // this change is silently NOT saved yet

Product managed = session2.merge(p); // re-attaches, now Persistent again in session2`,
    highlights: ['Transient: plain object, no DB row, not tracked', 'Persistent (managed): tracked, changes auto-synced on flush', 'Detached: was persistent, no longer tracked until merge()'],
  },
  {
    id: 2203, category: 'Hibernate', difficulty: 'Senior',
    question: 'What is the difference between the First-level Cache and Second-level Cache in Hibernate?',
    answer: 'The First-level cache is built into every Session automatically and cannot be disabled — within one Session, requesting the same entity by ID twice returns the same in-memory instance without hitting the database again, and it\'s cleared when the Session closes. The Second-level cache is optional, shared across all Sessions within a SessionFactory (i.e. across the whole application, not just one transaction), and must be explicitly configured with a caching provider (Ehcache, Redis, Caffeine) — it\'s useful for reference/lookup data that\'s read often and changes rarely, since it avoids hitting the database even across different transactions and requests.',
    code: `// First-level cache: automatic, per-Session, always on
Product p1 = session.get(Product.class, 1L); // hits the DB
Product p2 = session.get(Product.class, 1L); // same instance, NO second DB hit — same Session

@Entity
@Cacheable // opt into second-level cache
@org.hibernate.annotations.Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
class Category { ... } // shared across ALL sessions/transactions once configured`,
    highlights: ['1st-level: per-Session, automatic, always on, cleared on close', '2nd-level: opt-in, shared across the whole SessionFactory', 'Good fit for read-often, rarely-changing reference data'],
  },
  {
    id: 2204, category: 'Hibernate', difficulty: 'Senior',
    question: 'What is the N+1 problem specifically in Hibernate, and how do you diagnose and fix it?',
    answer: 'Fetching a list of N parent entities with a lazy association, then accessing that association on each one inside a loop, triggers 1 query for the parents plus N additional queries — one per parent — instead of a single efficient query, since Hibernate lazily fetches each association on first access. It\'s diagnosed by enabling SQL logging (spring.jpa.show-sql=true, or better, a tool like Hibernate\'s statistics or P6Spy) and noticing a suspicious burst of near-identical queries. It\'s fixed with JOIN FETCH in a JPQL query, an @EntityGraph annotation on the repository method, or by switching the association\'s default fetch type — each pulling the parent and its associations in a single SQL query with a JOIN instead of N+1 separate ones.',
    code: `// N+1 trap: 1 query for orders, then 1 more query PER order to fetch items
List<Order> orders = orderRepository.findAll();
orders.forEach(o -> o.getItems().size()); // triggers a lazy-load query, once per order

// Fix: fetch both in a single query with JOIN FETCH
@Query("SELECT o FROM Order o JOIN FETCH o.items")
List<Order> findAllWithItems();

// Alternative fix: @EntityGraph
@EntityGraph(attributePaths = "items")
List<Order> findAll();`,
    highlights: ['1 query for parents + N queries for each one\'s lazy association', 'Diagnose via SQL logging — look for repeated near-identical queries', 'Fix with JOIN FETCH or @EntityGraph to pull it in one query'],
  },
  {
    id: 2205, category: 'Hibernate', difficulty: 'Mid',
    question: 'What is the difference between HQL and the Criteria API in Hibernate?',
    answer: 'HQL (Hibernate Query Language, the precursor to JPQL) is a string-based, SQL-like query language written against entity names/fields — concise and readable, but query strings are only checked for correctness at runtime and are awkward to build dynamically (conditionally adding WHERE clauses means string concatenation). The Criteria API builds queries programmatically using a type-safe, fluent Java API instead of strings — more verbose, but compile-time type checking catches typos and refactoring mistakes, and it\'s far cleaner for building queries whose structure depends on runtime conditions (optional filters, dynamic sorting).',
    code: `// HQL — concise, but a runtime-checked string
List<Product> results = session.createQuery(
  "FROM Product p WHERE p.price > :min", Product.class)
  .setParameter("min", 100)
  .getResultList();

// Criteria API — type-safe, good for dynamic query building
CriteriaBuilder cb = session.getCriteriaBuilder();
CriteriaQuery<Product> query = cb.createQuery(Product.class);
Root<Product> root = query.from(Product.class);
query.select(root).where(cb.gt(root.get("price"), 100)); // compile-time checked field reference`,
    highlights: ['HQL: concise, SQL-like, runtime-checked string queries', 'Criteria API: verbose, type-safe, programmatic query building', 'Criteria API shines for dynamically-constructed queries'],
  },
  {
    id: 2206, category: 'Hibernate', difficulty: 'Mid',
    question: 'What is Dirty Checking in Hibernate, and what triggers a flush()?',
    answer: 'Dirty checking is Hibernate\'s automatic mechanism for detecting which fields of a managed (persistent) entity have changed since it was loaded, by comparing the entity\'s current state against a snapshot taken when it entered the Session — you never need to explicitly call an "update" method; simply mutating a field on a managed entity is enough. flush() is when Hibernate actually synchronizes those detected changes to the database by executing the necessary SQL — it happens automatically before a transaction commits, before a JPQL/HQL query that could be affected by pending changes runs, or can be triggered manually.',
    code: `Product p = session.get(Product.class, 1L); // loaded, snapshot taken
p.setPrice(new BigDecimal("29.99"));          // no explicit "save" call needed

session.getTransaction().commit();
// Hibernate compares current state vs snapshot, detects the price changed,
// and automatically generates: UPDATE products SET price = ? WHERE id = ?`,
    highlights: ['Detects changes by comparing current state vs a loaded snapshot', 'No explicit "update" call needed for managed entities', 'flush() syncs changes to the DB — happens automatically before commit/queries'],
  },
  {
    id: 2207, category: 'Hibernate', difficulty: 'Mid',
    question: 'What is the difference between persist(), save(), merge(), and update() in Hibernate?',
    answer: 'persist() (the JPA-standard method) makes a transient object managed, scheduling an INSERT — it\'s void and doesn\'t require a generated ID to be immediately available outside the transaction. save() is Hibernate\'s legacy, near-equivalent method that additionally returns the generated identifier immediately. merge() takes a detached (or even transient) object and copies its state onto a managed entity in the current session (loading it first if needed), returning that managed instance — the original object you passed in remains detached. update() reattaches a detached object directly, assuming no entity with that ID is already managed in the session — it throws if one is.',
    code: `// persist — JPA standard, void, schedules INSERT
session.persist(newProduct);

// merge — takes detached obj, returns a NEW managed instance with copied state
Product managed = session.merge(detachedProduct); // detachedProduct itself is still detached!

// update — reattaches directly, throws if another instance with the same ID is already managed
session.update(detachedProduct);`,
    highlights: ['persist(): JPA standard, void, for new (transient) entities', 'merge(): copies state onto a managed instance, returns the new instance', 'update(): reattaches directly, throws if the ID is already managed'],
  },
  {
    id: 2208, category: 'Hibernate', difficulty: 'Senior',
    question: 'What is the difference between Optimistic and Pessimistic Locking in Hibernate?',
    answer: 'Optimistic locking (via a @Version column) assumes conflicts are rare — it lets transactions proceed without holding any database lock, and only detects a conflict (throwing OptimisticLockException) at commit time if another transaction modified the same row first. It gives the best throughput under low contention. Pessimistic locking (LockModeType.PESSIMISTIC_WRITE) instead acquires an actual database row lock (SELECT ... FOR UPDATE) the moment you read the row, blocking any other transaction from modifying (or in some modes, even reading) it until the current transaction commits or rolls back — safer under high contention or when a conflict absolutely cannot be tolerated, at the cost of reduced concurrency and a risk of deadlocks/timeouts.',
    code: `// Optimistic: no lock held, conflict detected only at commit time
@Version Long version;

// Pessimistic: actively locks the row for the duration of the transaction
Product p = entityManager.find(Product.class, id, LockModeType.PESSIMISTIC_WRITE);
// generates: SELECT * FROM products WHERE id = ? FOR UPDATE
// other transactions trying to read/write this row now BLOCK until this one commits`,
    highlights: ['Optimistic: no lock, detects conflict at commit via @Version', 'Pessimistic: actual DB row lock (SELECT ... FOR UPDATE) held for the transaction', 'Optimistic: better throughput; Pessimistic: safer under high contention'],
  },

  // ─── DATABASE / SQL (additions) ─────────────────────────────────────
  {
    id: 2300, category: 'Database', difficulty: 'Mid',
    question: 'What is the difference between RIGHT JOIN, CROSS JOIN, and SELF JOIN?',
    answer: 'RIGHT JOIN returns all rows from the right table plus matching rows from the left (NULLs where there\'s no match) — the mirror image of LEFT JOIN, and rarely used in practice since any RIGHT JOIN can be rewritten as a LEFT JOIN by swapping table order, which most style guides prefer for consistency. CROSS JOIN produces the Cartesian product of two tables — every row from table A paired with every row from table B — used deliberately for generating combinations (e.g. all size × color variants of a product), but a dangerous accident if a normal JOIN\'s condition is forgotten. SELF JOIN isn\'t a distinct join type — it\'s simply joining a table to itself (using aliases to distinguish the two "copies"), typically used for hierarchical or comparative data like an employee table referencing a manager\'s ID in the same table.',
    code: `-- RIGHT JOIN (rewritable as a LEFT JOIN with tables swapped)
SELECT o.id, c.name FROM orders o RIGHT JOIN customers c ON o.customer_id = c.id;

-- CROSS JOIN: Cartesian product — every size with every color
SELECT s.size, c.color FROM sizes s CROSS JOIN colors c;

-- SELF JOIN: employees referencing their own manager, same table
SELECT e.name AS employee, m.name AS manager
FROM employees e JOIN employees m ON e.manager_id = m.id;`,
    highlights: ['RIGHT JOIN: mirror of LEFT JOIN, rarely used by convention', 'CROSS JOIN: full Cartesian product, deliberate combination generation', 'SELF JOIN: a table joined to itself via aliases'],
  },
  {
    id: 2301, category: 'Database', difficulty: 'Senior',
    question: 'What are SQL Window Functions? Explain ROW_NUMBER(), RANK(), and DENSE_RANK().',
    answer: 'Window functions compute a value across a set of rows related to the current row (the "window", defined by OVER (PARTITION BY ... ORDER BY ...)) without collapsing those rows into a single output row the way GROUP BY does — so you keep every original row while adding a computed column. ROW_NUMBER() assigns a strictly sequential, always-unique number to each row within its partition, even for ties. RANK() assigns the same rank to tied rows but then skips the next rank number(s) accordingly (1, 2, 2, 4). DENSE_RANK() also gives tied rows the same rank, but never skips a number afterward (1, 2, 2, 3).',
    code: `SELECT
  name, department, salary,
  ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS row_num,
  RANK()       OVER (PARTITION BY department ORDER BY salary DESC) AS rnk,
  DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dense_rnk
FROM employees;
-- Two employees tied for 2nd highest salary in Engineering:
-- row_num: 1, 2, 3   |   rank: 1, 2, 2, 4   |   dense_rank: 1, 2, 2, 3`,
    highlights: ['Window functions compute per-row without collapsing rows (unlike GROUP BY)', 'ROW_NUMBER: always unique, even for ties', 'RANK skips numbers after a tie; DENSE_RANK never skips'],
  },
  {
    id: 2302, category: 'Database', difficulty: 'Mid',
    question: 'What is a CTE (Common Table Expression), and how is it different from a subquery or a View?',
    answer: 'A CTE, defined with WITH name AS (...), is a named temporary result set scoped to a single query, making complex queries far more readable by letting you break a large query into named, sequential logical steps instead of deeply nesting subqueries. Unlike a subquery, a CTE can be referenced multiple times within the same query without repeating its definition, and can even be recursive (referencing itself) — essential for querying hierarchical data like an org chart or category tree. Unlike a View, a CTE is not persisted in the database schema at all — it only exists for the duration of the single statement it\'s attached to.',
    code: `-- Recursive CTE: walk an org chart from the CEO down
WITH RECURSIVE org_chart AS (
  SELECT id, name, manager_id, 1 AS depth FROM employees WHERE manager_id IS NULL
  UNION ALL
  SELECT e.id, e.name, e.manager_id, oc.depth + 1
  FROM employees e JOIN org_chart oc ON e.manager_id = oc.id
)
SELECT * FROM org_chart ORDER BY depth;`,
    highlights: ['Named, temporary result set scoped to one query', 'Can be recursive — ideal for hierarchical data', 'Not persisted in the schema, unlike a View'],
  },
  {
    id: 2303, category: 'Database', difficulty: 'Mid',
    question: 'What is the difference between a View, a Stored Procedure, and a Trigger?',
    answer: 'A View is a saved, named SELECT query that behaves like a virtual table — it doesn\'t store data itself, just the query definition, and is used to simplify repeated complex queries or restrict which columns/rows a user can see. A Stored Procedure is a saved, precompiled block of procedural SQL logic (with parameters, control flow, potentially multiple statements) that you explicitly call to perform an action, often used to encapsulate multi-step business logic close to the data. A Trigger is code that automatically executes in response to a specific event (BEFORE/AFTER INSERT/UPDATE/DELETE) on a table — never called directly, useful for enforcing invariants like auditing every change or auto-updating a related summary table.',
    code: `-- View: a saved, reusable query
CREATE VIEW active_customers AS
  SELECT * FROM customers WHERE status = 'active';

-- Stored Procedure: explicitly called to perform an action
CREATE PROCEDURE apply_discount(IN customer_id INT, IN pct DECIMAL)
BEGIN
  UPDATE orders SET total = total * (1 - pct) WHERE customer_id = customer_id;
END;

-- Trigger: fires automatically, never called directly
CREATE TRIGGER audit_price_change
AFTER UPDATE ON products FOR EACH ROW
INSERT INTO price_audit_log (product_id, old_price, new_price) VALUES (OLD.id, OLD.price, NEW.price);`,
    highlights: ['View: saved SELECT query, no data of its own', 'Stored Procedure: explicitly called, encapsulates procedural logic', 'Trigger: fires automatically on an event, never called directly'],
  },
  {
    id: 2304, category: 'Database', difficulty: 'Senior',
    question: 'What is the difference between a Clustered and a Non-clustered Index? What is a Composite Index?',
    answer: 'A Clustered Index determines the actual physical storage order of the table\'s rows on disk — because of this, a table can have at most one (often the primary key by default), and lookups by that key are extremely fast since the data itself is already sorted. A Non-clustered Index is a separate structure that stores the indexed column\'s value alongside a pointer back to the actual row\'s location, leaving the table\'s physical row order untouched — a table can have many of these. A Composite (or compound) Index spans multiple columns; it dramatically speeds up queries that filter/sort by the leading column(s) of the index in order, but is far less useful (or unused entirely) for queries that only filter on a non-leading column of that same index.',
    code: `-- Clustered: typically the primary key, defines physical row order (max 1 per table)
-- (in most DBs, created automatically for the PRIMARY KEY)

-- Non-clustered: separate lookup structure, many allowed per table
CREATE INDEX idx_customer_email ON customers (email);

-- Composite index: column ORDER matters
CREATE INDEX idx_orders_customer_date ON orders (customer_id, order_date);
-- Fast: WHERE customer_id = 5 AND order_date > '2024-01-01'   (uses both columns)
-- Fast: WHERE customer_id = 5                                  (uses leading column)
-- Slow/unused: WHERE order_date > '2024-01-01'                 (skips the leading column)`,
    highlights: ['Clustered: defines physical row order, max 1 per table', 'Non-clustered: separate structure with pointers, many allowed', 'Composite index: column order determines which queries benefit'],
  },
  {
    id: 2305, category: 'Database', difficulty: 'Senior',
    question: 'How do you read a SQL Execution Plan (EXPLAIN) to diagnose a slow query?',
    answer: 'EXPLAIN (or EXPLAIN ANALYZE, which actually runs the query and reports real timing/row counts, not just estimates) shows the database\'s chosen strategy for executing a query — which indexes it uses (or doesn\'t), the join algorithm for each join (nested loop, hash join, merge join), and the estimated vs actual number of rows processed at each step. The main red flags to look for: a "Seq Scan"/"Full Table Scan" on a large table where you\'d expect an index to be used (missing or unused index), a large gap between estimated and actual row counts (stale statistics, causing the optimizer to pick a bad plan), and nested loop joins over very large row counts (usually means a missing index on the join column, since nested loops scale poorly without one).',
    code: `EXPLAIN ANALYZE
SELECT * FROM orders WHERE customer_id = 123 AND status = 'PENDING';

-- Bad sign in the output: "Seq Scan on orders (cost=... rows=500000)"
--   → missing index on customer_id/status, scanning the whole table

-- Fix: add the index, re-run EXPLAIN, confirm it now shows
-- "Index Scan using idx_orders_customer_status"`,
    highlights: ['EXPLAIN ANALYZE shows real execution, not just an estimate', 'Watch for Seq Scans on large tables where an index should apply', 'Big estimate-vs-actual gaps suggest stale table statistics'],
  },

  {
    id: 2400, category: 'Java', difficulty: 'Senior',
    question: 'How would you troubleshoot a memory leak in a production Java application?',
    answer: 'Start by confirming it\'s a real leak, not just normal usage: watch heap usage over time via JVM metrics (Actuator, JMX, or a monitoring tool) — a genuine leak shows a steadily climbing baseline after each GC cycle rather than returning to a stable floor. Capture a heap dump (jmap -dump, or trigger one automatically on OutOfMemoryError via -XX:+HeapDumpOnOutOfMemoryError) and analyze it with a tool like Eclipse MAT, which can compute the "dominator tree" showing exactly which objects are retaining the most memory and, critically, the GC root chain showing why they\'re still reachable. Common culprits to check first: unbounded caches/static collections, unclosed resources (connections, streams), and listeners registered but never unregistered. Once identified, fix the root retention and verify with a follow-up heap dump comparison that the growth has stopped.',
    code: `# Capture a heap dump for offline analysis
jmap -dump:live,format=b,file=heap.hprof <pid>

# Or auto-capture on OOM in production (add as a JVM flag)
-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/var/dumps/

// Then open heap.hprof in Eclipse MAT and inspect the "Dominator Tree"
// to see which objects are retaining the most memory and their GC root chain`,
    highlights: ['Confirm it\'s real: baseline should climb steadily, not just fluctuate', 'Heap dump + Eclipse MAT dominator tree to find the retaining objects', 'Check unbounded caches, unclosed resources, and dangling listeners first'],
  },
  {
    id: 2401, category: 'System Design', difficulty: 'Senior',
    question: 'How would you debug a production issue where API response times suddenly increased?',
    answer: 'First correlate the timing precisely: check deployment history, feature flag changes, and traffic/volume graphs around the exact moment latency jumped — a sudden step-change usually points to a specific deploy or config change, while a gradual climb points to a resource leak or organic traffic growth outpacing capacity. Check the standard suspects in order of likelihood: database (slow query log, connection pool exhaustion, a missing index that only bites once a table crosses a size threshold), downstream service latency (check distributed tracing/APM to see which hop in the request chain got slower), infrastructure (CPU/memory saturation, noisy neighbor on shared infra, a node that\'s unhealthy but not yet failing health checks), and garbage collection pauses (check GC logs for long stop-the-world pauses coinciding with the latency spikes). Distributed tracing (Jaeger/Zipkin/Datadog APM) is the single most valuable tool here since it shows exactly which service/query in the chain is actually slow, rather than guessing.',
    code: `# Quick correlation checklist when investigating a latency spike:
# 1. Did a deploy or config/feature-flag change happen right before the spike?
# 2. Distributed trace: which specific span/hop got slower?
# 3. DB slow query log: any new slow queries, or connection pool saturation?
# 4. Infra metrics: CPU/memory/GC pause times during the spike window
# 5. Traffic graph: sudden spike, or gradual climb outpacing capacity?`,
    highlights: ['Correlate the exact timing against deploys/config changes first', 'Distributed tracing pinpoints which hop actually got slower', 'Check DB slow queries, connection pool saturation, and GC pause logs'],
  },
  {
    id: 2402, category: 'System Design', difficulty: 'Senior',
    question: 'How would you design a system to handle millions of records efficiently?',
    answer: 'Several complementary strategies, applied based on the actual access pattern: proper indexing on the columns actually filtered/sorted/joined on (and only those — over-indexing slows writes); pagination everywhere, never loading the full result set into memory or over the wire; batch processing for bulk writes/updates instead of row-by-row operations; read replicas to offload read-heavy traffic from the primary database; caching (Redis) for hot, frequently-accessed data to avoid re-querying the database for the same thing repeatedly; and, once a single database/table becomes the bottleneck despite the above, horizontal partitioning/sharding to split data across multiple database instances by a shard key (e.g. customer ID or region). For genuinely massive scale, consider whether the workload needs a different storage engine entirely (a columnar store for analytics, a search index for full-text/faceted queries) rather than forcing everything through one general-purpose relational database.',
    code: `-- Composite index matching the real query pattern, not a guess
CREATE INDEX idx_orders_status_date ON orders (status, created_at);

-- Batch insert instead of N individual round trips
INSERT INTO events (user_id, event_type, created_at) VALUES
  (1, 'click', NOW()), (2, 'view', NOW()), (3, 'click', NOW()); -- one round trip, not three

-- Pagination — never SELECT * with no LIMIT on a millions-row table
SELECT * FROM orders WHERE status = 'PENDING' ORDER BY created_at LIMIT 50 OFFSET 0;`,
    highlights: ['Index precisely for actual query patterns, paginate everything', 'Batch writes, read replicas for read-heavy load, cache hot data', 'Shard/partition once a single DB instance becomes the real bottleneck'],
  },

  // ─── LTIMindtree: JAVA CORE DEEP DIVES ─────────────────────────────────────
  {
    id: 2403, category: 'Java', difficulty: 'Mid',
    question: 'What are the SOLID principles? Explain each with a real-world example.',
    answer: `SOLID is the foundation of maintainable object-oriented code. Senior engineers don't just list them — they explain the pain SOLID prevents.

S — Single Responsibility Principle: A class should have one reason to change. Instead of a UserService that handles authentication, email sending, and database persistence all at once, split into AuthService, EmailService, and UserRepository. Now changing the email provider doesn't risk breaking auth logic.

O — Open/Closed Principle: Open for extension, closed for modification. Use a PaymentProcessor interface with StripeProcessor and PaypalProcessor implementations. When you add RazorpayProcessor, you don't touch existing code — you only add a new class. This prevents regression bugs.

L — Liskov Substitution Principle: Subclasses must be substitutable for their parent. If Rectangle has setWidth() and setHeight(), a Square subclass that overrides both to keep sides equal violates LSP — code expecting a Rectangle breaks. Better to not inherit Square from Rectangle.

I — Interface Segregation Principle: Clients shouldn't depend on methods they don't use. A Worker interface with work(), eat(), sleep() forces a Robot class to implement eat() and sleep() uselessly. Split into Workable and Restable interfaces instead.

D — Dependency Inversion Principle: Depend on abstractions, not concretions. A ReportService should depend on IDataSource, not directly on MySQLDataSource. You can then swap to MongoDataSource or MockDataSource in tests without changing ReportService at all.

The interviewer wants to hear: "I applied this in my project when..." — link each principle to a real change you made.`,
    code: `// DIP example — depend on abstraction
interface NotificationService { void send(String msg); }

class EmailNotification implements NotificationService {
    public void send(String msg) { /* SMTP logic */ }
}
class SMSNotification implements NotificationService {
    public void send(String msg) { /* Twilio logic */ }
}

class OrderService {
    private final NotificationService notifier; // injected — not hardcoded
    OrderService(NotificationService notifier) { this.notifier = notifier; }
    void placeOrder() { notifier.send("Order confirmed!"); }
}`,
    highlights: ['S=one reason to change', 'O=extend, not modify', 'L=safe substitution', 'I=minimal interfaces', 'D=depend on abstractions'],
  },
  {
    id: 2404, category: 'Java', difficulty: 'Mid',
    question: 'What happens when try, catch, and finally all contain return statements? What is the execution order of static blocks?',
    answer: `These are classic Java "gotcha" questions that interviewers use to test depth of knowledge.

Try-Catch-Finally return precedence: The finally block ALWAYS executes, and if finally contains a return, it overrides any return value from try or catch. This is a subtle bug source — the try's return value is discarded silently.

Static block execution order: Static blocks and static field initializers run in textual order, top to bottom, when the class is first loaded by the JVM. Multiple static blocks are allowed and they run in order. The static initializer runs BEFORE the main() method, and before any constructor.

Order: Static blocks (in order) → main() → Constructor.

This matters in interviews because it tests whether you understand ClassLoader mechanics, not just syntax.`,
    code: `// Return precedence
static int test() {
    try { return 1; }
    catch (Exception e) { return 2; }
    finally { return 3; } // ALWAYS returns 3 — try's 1 is discarded!
}

// Static block ordering
class Demo {
    static int x = 10; // runs first

    static {
        System.out.println("Static block 1, x=" + x); // prints 10
        x = 20;
    }

    static {
        System.out.println("Static block 2, x=" + x); // prints 20
    }

    public static void main(String[] args) {
        System.out.println("main(), x=" + x); // prints 20
    }
}
// Output: Static block 1, x=10 → Static block 2, x=20 → main(), x=20`,
    highlights: ['finally return overrides try/catch return', 'Multiple static blocks allowed — run top to bottom', 'Static blocks run before main()'],
  },
  {
    id: 2405, category: 'Java', difficulty: 'Senior',
    question: 'How does wait() differ from sleep()? Explain synchronized block vs method, and how to debug a production deadlock.',
    answer: `This question separates candidates who've actually debugged concurrent systems from those who only read about it.

wait() vs sleep():
- sleep() is a Thread method — it pauses the thread but does NOT release the monitor/lock. Other threads waiting on that object are still blocked.
- wait() is an Object method — it RELEASES the lock and puts the thread in a waiting state. Another thread must call notify()/notifyAll() to wake it. Must be called inside a synchronized block, or you get IllegalMonitorStateException.

synchronized method vs block:
- synchronized method: locks on 'this' (the entire object). Coarse-grained — no two synchronized methods on the same object run concurrently.
- synchronized block: you specify exactly which object to lock. Fine-grained — you can have two different locks for two independent resources inside the same class, allowing higher concurrency.

Detecting a production deadlock:
1. Take a thread dump: kill -3 <pid> on Linux, or jstack <pid>
2. Look for threads in BLOCKED state — jstack shows the lock each thread holds and which lock it's waiting for
3. Identify the circular dependency (Thread-1 holds Lock-A waiting for Lock-B; Thread-2 holds Lock-B waiting for Lock-A)
4. Prevention: always acquire locks in the same order; use tryLock() with timeout instead of raw synchronized.`,
    code: `// wait() releases the lock — sleep() does not
synchronized (queue) {
    while (queue.isEmpty()) {
        queue.wait(); // releases lock, thread sleeps until notified
    }
    process(queue.poll());
}

// Fine-grained locking with synchronized block
class BankAccount {
    private final Object transferLock = new Object();
    private final Object balanceLock = new Object();

    void transfer(BankAccount target, double amount) {
        // Always lock in consistent order to prevent deadlock
        Object first = this.id < target.id ? this.balanceLock : target.balanceLock;
        Object second = this.id < target.id ? target.balanceLock : this.balanceLock;
        synchronized (first) {
            synchronized (second) {
                this.balance -= amount;
                target.balance += amount;
            }
        }
    }
}`,
    highlights: ['wait() releases lock; sleep() holds lock', 'Synchronized block is finer-grained than method', 'jstack reveals deadlocks in production'],
  },
  {
    id: 2406, category: 'Java', difficulty: 'Senior',
    question: 'Solve Stream coding problems: find second-highest, numbers starting with 1, sort employees by salary desc then name alphabetically.',
    answer: `Stream coding questions are the most common Java technical screen at LTIMindtree. The key is narrating your approach while you code — interviewers want to see your thought process.

For second-highest: Use distinct() to handle duplicates, sort descending, skip(1) to bypass the max, then findFirst().

For numbers starting with "1": Convert to String, filter by startsWith("1"), map back to Integer.

For employee sorting: Use Comparator.comparingInt().reversed() chained with thenComparing() for the secondary sort. This shows knowledge of Comparator chaining which is a senior-level Java 8 skill.

Always mention: Streams are lazy — intermediate operations build a pipeline, nothing executes until a terminal operation is called. This is why chaining is efficient.`,
    code: `List<Integer> numbers = Arrays.asList(10, 15, 8, 49, 25, 98, 12, 110, 1);

// Second highest (handle duplicates with distinct)
Optional<Integer> secondHighest = numbers.stream()
    .distinct()
    .sorted(Comparator.reverseOrder())
    .skip(1)
    .findFirst();
System.out.println(secondHighest.orElse(-1)); // 98

// Numbers starting with '1'
List<Integer> startsWithOne = numbers.stream()
    .filter(n -> String.valueOf(n).startsWith("1"))
    .collect(Collectors.toList());
// [10, 15, 12, 110, 1]

// Employee: sort by salary desc, then name alphabetically
List<Employee> sorted = employees.stream()
    .sorted(Comparator.comparingDouble(Employee::getSalary).reversed()
        .thenComparing(Employee::getName))
    .collect(Collectors.toList());

// Frequency of elements using groupingBy
Map<Integer, Long> freq = numbers.stream()
    .collect(Collectors.groupingBy(n -> n, Collectors.counting()));

// Convert List to Map (id -> name)
Map<Integer, String> empMap = employees.stream()
    .collect(Collectors.toMap(Employee::getId, Employee::getName));`,
    highlights: ['distinct() before sorting handles duplicates', 'Comparator chaining with thenComparing()', 'Streams are lazy — pipeline executes at terminal op'],
  },
  {
    id: 2407, category: 'Java', difficulty: 'Senior',
    question: 'How would you make a cache thread-safe? When would you choose volatile vs AtomicReference vs synchronized?',
    answer: `This is a production engineering question — interviewers want to know you understand concurrency trade-offs, not just syntax.

volatile: Guarantees visibility (all threads see the latest write) but NOT atomicity. Use for a single boolean flag like a shutdown signal: volatile boolean running = true. You read or write it atomically as a single operation. NEVER use volatile for compound operations like cache.get() != null ? cache.get() : compute() — the two reads are not atomic together.

AtomicReference / ConcurrentHashMap: Use when you need atomic compound operations without explicit locking. ConcurrentHashMap.computeIfAbsent() is the idiomatic thread-safe cache pattern — it's internally lock-striped so multiple keys can be written concurrently.

synchronized: Use when you need mutual exclusion over a block of logic that involves multiple steps. Heaviest option but most flexible.

For a production-grade cache: ConcurrentHashMap + computeIfAbsent() is the right choice. For an LRU cache, wrap with Collections.synchronizedMap() around a LinkedHashMap, or use Guava Cache / Caffeine which handles thread safety, expiry, and eviction for you.`,
    code: `// WRONG: volatile doesn't protect compound check-then-act
private volatile Map<String, Data> cache = new HashMap<>();
// ↑ cache.get() and cache.put() are not atomic together!

// CORRECT: ConcurrentHashMap + computeIfAbsent (lock-striped internally)
private final ConcurrentHashMap<String, Data> cache = new ConcurrentHashMap<>();

public Data getData(String key) {
    return cache.computeIfAbsent(key, k -> expensiveLoad(k)); // atomic — only loads once
}

// CORRECT: volatile for a simple flag
private volatile boolean shutdown = false;

public void run() {
    while (!shutdown) { processTask(); } // all threads see updated value immediately
}

// For LRU: Caffeine (production standard)
LoadingCache<String, Data> lruCache = Caffeine.newBuilder()
    .maximumSize(1000)
    .expireAfterWrite(10, TimeUnit.MINUTES)
    .build(key -> expensiveLoad(key));`,
    highlights: ['volatile = visibility only, not atomicity', 'computeIfAbsent = atomic cache pattern', 'Caffeine/Guava for production LRU caches'],
  },

  // ─── LTIMindtree: SPRING BOOT DEEP DIVES ──────────────────────────────────
  {
    id: 2408, category: 'Spring', difficulty: 'Senior',
    question: 'How does @Transactional work internally? What are propagation types, and what happens when an exception occurs inside @Transactional?',
    answer: `This is one of the most important Spring questions for 5+ YOE candidates. Shallow answers get filtered out.

Internal mechanism: Spring uses AOP proxies. When you call a @Transactional method, you're actually calling a proxy that wraps your method in transaction begin/commit/rollback logic using the PlatformTransactionManager. IMPORTANT: self-invocation (calling a @Transactional method from within the same class) BYPASSES the proxy and thus bypasses transaction management — a classic production bug.

Key propagation types:
- REQUIRED (default): Join existing transaction if one exists; create new if not.
- REQUIRES_NEW: Always create a new transaction, suspending any existing one. Use this when you want an audit log saved even if the main operation rolls back.
- NESTED: Run in a nested transaction with a savepoint — partial rollback possible.
- SUPPORTS: Run transactionally if a transaction exists, non-transactionally if not.

Exception behavior: By default, @Transactional only rolls back on RuntimeException and Error. Checked exceptions do NOT trigger rollback unless you specify rollbackFor = Exception.class. This is the #1 source of silent data corruption bugs in Spring apps.

Always ask in code review: "Should this checked exception roll back the transaction?"`,
    code: `// Self-invocation BUG — proxy is bypassed!
@Service
class OrderService {
    public void placeOrder() {
        this.saveOrder(); // calls 'this', not the proxy — @Transactional ignored!
    }

    @Transactional
    public void saveOrder() { /* transaction never starts */ }
}

// FIX: inject self or restructure into separate class
@Service
class OrderService {
    @Autowired private OrderService self; // Spring injects the proxy

    public void placeOrder() { self.saveOrder(); } // now hits the proxy

    @Transactional
    public void saveOrder() { /* properly transactional */ }
}

// Rollback on checked exception — critical!
@Transactional(rollbackFor = Exception.class)
public void process() throws IOException {
    repo.save(entity);
    externalService.call(); // if this throws IOException → rolls back save
}

// REQUIRES_NEW for audit log that must persist even on rollback
@Transactional(propagation = Propagation.REQUIRES_NEW)
public void saveAuditLog(String event) { auditRepo.save(new AuditLog(event)); }`,
    highlights: ['Self-invocation bypasses proxy — classic production bug', 'Default only rolls back on RuntimeException', 'REQUIRES_NEW for independent audit/log transactions'],
  },
  {
    id: 2409, category: 'Spring', difficulty: 'Senior',
    question: 'How do you design REST API versioning, and how do you handle 1,000+ concurrent requests in Spring Boot?',
    answer: `Two questions in one — both are senior-level concerns that LTIMindtree specifically reports asking.

API Versioning strategies (with trade-offs):
1. URI versioning (/api/v1/users): Most visible, easiest to test in browser, easy to route at gateway level. Downside: URI should identify a resource, not a version — purists argue this.
2. Header versioning (Accept: application/vnd.app.v1+json): Cleaner URLs, follows HTTP spec. Harder to test manually.
3. Query param (?version=1): Simplest but pollutes query params.
4. Recommendation for interviews: URI versioning for public APIs, header versioning for internal APIs. Always be consistent across your entire API.

Handling 1,000+ concurrent requests:
- Async processing: @Async or WebFlux reactive endpoints. Tomcat's default thread pool is ~200 threads — async releases threads during I/O waits.
- Connection pooling: HikariCP (Spring Boot default) — tune maximumPoolSize based on DB capacity, not just app needs.
- Caching: Redis for hot data. Never hit the DB for data that changes infrequently.
- Rate limiting: Bucket4j at API Gateway level — protect the service from traffic spikes.
- Horizontal scaling: Deploy multiple instances behind a load balancer. Stateless design (JWTs, not sessions) is essential.
- Circuit breaker: Resilience4j prevents one slow downstream from consuming all threads.`,
    code: `// URI versioning — explicit and simple
@RestController
@RequestMapping("/api/v1/users")
class UserControllerV1 { ... }

@RestController
@RequestMapping("/api/v2/users")
class UserControllerV2 { ... }

// Header versioning — cleaner
@GetMapping(value = "/users", headers = "X-API-Version=2")
public ResponseEntity<UserV2DTO> getUsersV2() { ... }

// Async endpoint — releases Tomcat thread during long operation
@GetMapping("/heavy-report")
public CompletableFuture<Report> getReport() {
    return CompletableFuture.supplyAsync(this::generateReport, asyncExecutor);
}

// HikariCP tuning in application.yml
// spring.datasource.hikari.maximum-pool-size=20
// spring.datasource.hikari.minimum-idle=5
// spring.datasource.hikari.connection-timeout=30000

// Rate limiting with Bucket4j
Bucket bucket = Bucket.builder()
    .addLimit(Bandwidth.classic(100, Refill.intervally(100, Duration.ofMinutes(1))))
    .build();
if (!bucket.tryConsume(1)) return ResponseEntity.status(429).build();`,
    highlights: ['URI versioning for public, header for internal APIs', '@Async + thread pool tuning for concurrency', 'HikariCP + Redis + Bucket4j for 1000+ req/s'],
  },
  {
    id: 2410, category: 'Spring', difficulty: 'Senior',
    question: 'How does @ControllerAdvice work? How do you implement consistent API error responses across a Spring Boot application?',
    answer: `This is a question where showing production patterns impresses more than textbook answers.

@ControllerAdvice is a global interceptor for exceptions thrown by any @Controller in the application. Internally it works via Spring's HandlerExceptionResolver mechanism. When an exception propagates out of a controller, Spring checks all registered @ExceptionHandler methods across all @ControllerAdvice classes.

The professional pattern is to define a standard error response DTO, map every exception type to an appropriate HTTP status, include a request ID for traceability, and log at the appropriate level (WARN for client errors, ERROR for server errors).

Key insight to impress the interviewer: Never expose stack traces or internal class names in error responses — it's a security vulnerability. Always return a sanitized message. Use a request ID (MDC/MDC with Sleuth) so you can correlate client-reported errors to server logs.

ResponseEntityExceptionHandler is a base class you can extend — it already handles Spring MVC exceptions like MethodArgumentNotValidException and HttpMessageNotReadableException, so you don't need to reinvent that wheel.`,
    code: `// Standard error response DTO
@Data
@Builder
public class ApiError {
    private int status;
    private String error;
    private String message;
    private String path;
    private String requestId; // from MDC/Sleuth for traceability
    private LocalDateTime timestamp;
}

// Global handler
@ControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException ex,
                                                    HttpServletRequest request) {
        log.warn("Resource not found: {}", ex.getMessage());
        return ResponseEntity.status(404).body(ApiError.builder()
            .status(404).error("Not Found").message(ex.getMessage())
            .path(request.getRequestURI()).timestamp(LocalDateTime.now())
            .requestId(MDC.get("requestId")).build());
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiError> handleValidation(ConstraintViolationException ex,
                                                      HttpServletRequest request) {
        String msg = ex.getConstraintViolations().stream()
            .map(ConstraintViolation::getMessage).collect(Collectors.joining(", "));
        return ResponseEntity.status(400).body(ApiError.builder()
            .status(400).error("Validation Failed").message(msg)
            .path(request.getRequestURI()).timestamp(LocalDateTime.now()).build());
    }

    @ExceptionHandler(Exception.class) // catch-all — never expose stack traces
    public ResponseEntity<ApiError> handleAll(Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception", ex);
        return ResponseEntity.status(500).body(ApiError.builder()
            .status(500).error("Internal Server Error")
            .message("An unexpected error occurred") // sanitized!
            .requestId(MDC.get("requestId")).timestamp(LocalDateTime.now()).build());
    }
}`,
    highlights: ['@ControllerAdvice intercepts all controller exceptions globally', 'Extend ResponseEntityExceptionHandler to cover Spring MVC errors for free', 'Never expose stack traces — use requestId for log correlation'],
  },
  {
    id: 2411, category: 'Spring', difficulty: 'Senior',
    question: 'What is Spring Boot Actuator? What endpoints are available and how do you secure them in production?',
    answer: `Actuator is Spring Boot's built-in operations and observability toolkit — it exposes production-ready endpoints for health checks, metrics, thread dumps, and more. Knowing Actuator deeply signals you build production-aware services, not just local prototypes.

Key endpoints:
- /actuator/health: Used by load balancers and Kubernetes liveness/readiness probes. Customize with HealthIndicator for DB, Redis, external services.
- /actuator/metrics: Exposes Micrometer metrics. Integrate with Prometheus + Grafana for dashboards.
- /actuator/info: Application version, build info. Useful for knowing what's deployed.
- /actuator/env: Shows all configuration values — NEVER expose in production without auth.
- /actuator/threaddump: Snapshot of all threads — invaluable for diagnosing deadlocks.
- /actuator/httptrace: Recent HTTP requests.
- /actuator/loggers: Change log levels at runtime without restart — huge for production debugging.

Security: In production, ONLY expose /health and /info publicly. Secure everything else behind Spring Security with ROLE_ADMIN or restrict to internal network. This is a common security audit finding.`,
    code: `# application.yml — secure Actuator in production
management:
  endpoints:
    web:
      exposure:
        include: health, info, metrics, loggers # only what you need
  endpoint:
    health:
      show-details: when_authorized # hide internal details from anonymous callers

# Secure with Spring Security
@Configuration
public class ActuatorSecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.requestMatcher(EndpointRequest.toAnyEndpoint())
            .authorizeRequests()
            .requestMatchers(EndpointRequest.to("health", "info")).permitAll()
            .anyRequest().hasRole("ADMIN") // all other actuator endpoints require ADMIN
            .and().httpBasic();
    }
}

// Custom HealthIndicator — checks your external dependency
@Component
public class PaymentGatewayHealthIndicator implements HealthIndicator {
    @Override
    public Health health() {
        boolean up = paymentService.ping();
        return up ? Health.up().withDetail("gateway", "reachable").build()
                  : Health.down().withDetail("gateway", "unreachable").build();
    }
}

// Change log level at runtime without restart
// PUT /actuator/loggers/com.yourapp.service {"configuredLevel": "DEBUG"}`,
    highlights: ['Expose only /health + /info publicly — secure rest with ROLE_ADMIN', 'Custom HealthIndicator for Kubernetes probes', '/actuator/loggers lets you debug production without restart'],
  },

  // ─── LTIMindtree: REACT DEEP DIVES ────────────────────────────────────────
  {
    id: 2412, category: 'React', difficulty: 'Senior',
    question: 'Explain React Fiber and reconciliation. Why was Fiber introduced and how does it improve rendering?',
    answer: `React Fiber is the complete rewrite of React's core algorithm, introduced in React 16. Understanding it deeply distinguishes senior frontend engineers.

The old stack reconciler problem: React's original reconciler was synchronous and recursive. Once it started rendering a component tree, it couldn't pause — it would block the main thread until the entire tree was processed. For large trees, this caused visible jank (missed frames, unresponsive UI) because the browser couldn't handle user input or animations while React was rendering.

What Fiber introduced:
1. Incremental rendering: Work is split into small units (fibers). React can start rendering, pause for higher-priority work (like a user keypress), then resume. This is called time-slicing.
2. Priority scheduling: Not all updates are equal. A user typing is higher priority than a background data refresh. Fiber assigns priorities and processes them accordingly.
3. Concurrency foundation: Fiber made React 18's Concurrent Mode features possible — useTransition, Suspense, automatic batching. None of this was possible with the synchronous stack reconciler.

The reconciliation (diffing) algorithm: React compares the previous fiber tree with the new one using a heuristic O(n) algorithm — it assumes elements of the same type at the same position stay the same, and uses the key prop to match list items across renders. Misusing keys (using array index for reorderable lists) breaks this and causes incorrect renders.`,
    code: `// Fiber enables useTransition — mark low-priority updates
import { useTransition, useState } from 'react';

function SearchResults() {
    const [isPending, startTransition] = useTransition();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    const handleSearch = (e) => {
        setQuery(e.target.value); // high priority — updates input immediately

        startTransition(() => {
            // low priority — React can defer this if user keeps typing
            const filtered = expensiveFilter(allData, e.target.value);
            setResults(filtered);
        });
    };

    return (
        <>
            <input value={query} onChange={handleSearch} />
            {isPending ? <Spinner /> : <ResultsList data={results} />}
        </>
    );
}

// Key prop — tells Fiber how to match old and new list items
// BAD: index as key breaks reconciliation on reorder/insert
{items.map((item, index) => <Item key={index} data={item} />)}

// GOOD: stable unique id
{items.map(item => <Item key={item.id} data={item} />)}`,
    highlights: ['Fiber enables pausing, prioritizing, and resuming rendering', 'Time-slicing prevents main thread blocking', 'Foundation for all React 18 concurrent features'],
  },
  {
    id: 2413, category: 'React', difficulty: 'Senior',
    question: 'useState vs useRef — when do you choose one over the other? Common mistakes?',
    answer: `This question reveals whether you understand React's rendering model deeply. The answer is not just "useState triggers re-render, useRef doesn't."

useState: Use when the UI needs to reflect the value change. Every setState call schedules a re-render. If the value changing doesn't need to update what the user sees, useState is wasteful.

useRef: Use for three distinct purposes:
1. DOM access: ref.current gives direct access to a DOM node (focus, scrollIntoView, measuring dimensions, triggering animations).
2. Mutable values that don't trigger re-render: Storing a timer ID, a previous value, an AbortController, or a flag like "is the component mounted."
3. Preserving values across renders without causing re-renders: A WebSocket instance, an interval ID.

Common mistakes:
- Using useRef as state (then wondering why the UI doesn't update)
- Using useState for timer IDs (triggers unnecessary re-renders)
- Reading ref.current during render — it's a side effect pattern and can be stale
- Not cleaning up (clearInterval, abort the controller) in useEffect return

The interviewer wants to hear: "I used useRef in my project to store an AbortController so I could cancel inflight requests when the user navigated away, without triggering a re-render of the component."`,
    code: `// useRef for DOM access — focus on mount
function SearchBox() {
    const inputRef = useRef(null);
    useEffect(() => { inputRef.current?.focus(); }, []);
    return <input ref={inputRef} />;
}

// useRef to store mutable values without re-render
function PollingComponent({ url }) {
    const intervalRef = useRef(null);
    const [data, setData] = useState(null);

    useEffect(() => {
        intervalRef.current = setInterval(async () => {
            const res = await fetch(url);
            setData(await res.json());
        }, 5000);

        return () => clearInterval(intervalRef.current); // cleanup — no stale timer
    }, [url]);

    return <div>{JSON.stringify(data)}</div>;
}

// useRef to track previous value (common pattern)
function usePrevious(value) {
    const prevRef = useRef();
    useEffect(() => { prevRef.current = value; }); // runs after render
    return prevRef.current; // returns the PREVIOUS render's value
}`,
    highlights: ['useRef for DOM access and mutable values that don\'t affect UI', 'useState for any value whose change should update the display', 'Store timer IDs, AbortControllers, WebSockets in useRef'],
  },
  {
    id: 2414, category: 'React', difficulty: 'Senior',
    question: 'useMemo vs useCallback — when do you actually need them, and when do they hurt performance?',
    answer: `Most candidates say "useMemo caches values, useCallback caches functions." Senior answers explain WHEN they're actually needed and when they make things worse.

useMemo: Memoizes the RESULT of a computation. Use it when:
- A calculation is genuinely expensive (> 1ms — profiling should confirm this)
- The computed value is passed as a prop to a React.memo() component (otherwise React.memo is useless since props change every render anyway)

useCallback: Memoizes a FUNCTION reference. Use it when:
- Passing a callback to a React.memo() child — otherwise the child re-renders every time because the function is a new reference
- The function is in the dependency array of another hook (useEffect, useMemo)

When they HURT performance:
- Every useMemo/useCallback adds memory overhead and comparison overhead on every render
- If the dependency array changes on every render, the memoization never hits — you pay the cost with zero benefit
- For cheap computations, the memoization cost exceeds the computation cost
- Over-memoizing makes code harder to read and maintain

The rule: measure first with React DevTools Profiler. Apply useMemo/useCallback only where you've confirmed re-render cost is the actual problem.`,
    code: `// useMemo — expensive computation + passed to memoized child
const expensiveReport = useMemo(() => {
    return transactions.reduce((acc, t) => {
        // O(n) computation over thousands of items
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
    }, {});
}, [transactions]); // only recomputes when transactions array changes

// useCallback — stable function reference for memoized child
const handleDelete = useCallback((id) => {
    setItems(prev => prev.filter(item => item.id !== id));
}, []); // stable reference — [] deps means never recreated

// MemoChild only re-renders if its props change
const MemoChild = React.memo(({ onDelete }) => {
    console.log('MemoChild render'); // only logs when onDelete changes
    return <button onClick={() => onDelete(itemId)}>Delete</button>;
});

// BAD — useCallback is useless here if child is not memoized
function Parent() {
    const onClick = useCallback(() => doThing(), []); // paying cost for zero benefit
    return <NormalChild onClick={onClick} />; // NormalChild re-renders anyway
}`,
    highlights: ['useMemo for expensive calculations passed to React.memo children', 'useCallback for stable function refs in deps arrays or memoized children', 'Profile first — premature memoization adds cost with zero benefit'],
  },
  {
    id: 2415, category: 'React', difficulty: 'Senior',
    question: 'How does Redux Toolkit differ from plain Redux? Why use RTK Query?',
    answer: `This is highly relevant for LTIMindtree full-stack roles. Many candidates know Redux but can't articulate why RTK is the current standard.

Plain Redux problems that RTK solves:
1. Boilerplate: Plain Redux requires separate action type constants, action creators, and a reducer with a switch statement. RTK's createSlice() generates all three from a single object.
2. Immutability: Plain Redux requires spreading state carefully. RTK uses Immer under the hood — you can write mutating syntax (state.count++) and Immer produces the immutable update. This eliminates a whole class of bugs.
3. Redux DevTools + Thunk: These required manual setup. RTK's configureStore() includes both by default.

RTK Query (the game changer for data fetching):
RTK Query is a data fetching and caching layer built on top of RTK. It generates:
- Hooks (useGetUsersQuery, useCreateUserMutation) automatically from endpoint definitions
- Automatic loading/error/data states
- Automatic cache invalidation with tags
- Background refetching, polling, optimistic updates

Without RTK Query, teams write hundreds of lines of thunks, loading state reducers, and cache management manually. RTK Query collapses all of that into an API definition.

The honest answer in interviews: "RTK Query replaced our entire data fetching layer — we removed about 2,000 lines of manual thunk/reducer code."`,
    code: `// RTK createSlice — replaces 3 files of plain Redux boilerplate
const counterSlice = createSlice({
    name: 'counter',
    initialState: { value: 0 },
    reducers: {
        increment: state => { state.value += 1; }, // Immer handles immutability
        decrement: state => { state.value -= 1; },
        incrementByAmount: (state, action) => { state.value += action.payload; },
    },
});

// RTK Query — generates hooks automatically
const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    tagTypes: ['User'],
    endpoints: (builder) => ({
        getUsers: builder.query({ query: () => '/users', providesTags: ['User'] }),
        createUser: builder.mutation({
            query: (newUser) => ({ url: '/users', method: 'POST', body: newUser }),
            invalidatesTags: ['User'], // auto-refetches getUsers after create!
        }),
    }),
});

// Usage in component — no manual loading state, no thunk needed
export const { useGetUsersQuery, useCreateUserMutation } = apiSlice;

function UserList() {
    const { data: users, isLoading, error } = useGetUsersQuery();
    if (isLoading) return <Spinner />;
    if (error) return <Error />;
    return users.map(u => <UserCard key={u.id} user={u} />);
}`,
    highlights: ['createSlice eliminates action type constants + action creators boilerplate', 'Immer in RTK lets you write mutating-style reducer logic safely', 'RTK Query auto-generates hooks, cache, invalidation — replaces thunks'],
  },

  // ─── LTIMindtree: JAVASCRIPT DEEP DIVES ───────────────────────────────────
  {
    id: 2416, category: 'JavaScript', difficulty: 'Mid',
    question: 'What is the Temporal Dead Zone (TDZ)? How does hoisting differ between var, let/const, and function declarations?',
    answer: `Hoisting and TDZ questions appear in almost every LTIMindtree JavaScript round. The key is explaining the WHY, not just the WHAT.

Hoisting is JavaScript's behavior of moving declarations to the top of their scope during the compilation phase, before code executes.

var: Hoisted AND initialized to undefined. That's why you can read a var before its declaration — you get undefined, not an error.

let/const: Hoisted (the JS engine knows they exist) but NOT initialized. Accessing them before the declaration throws ReferenceError. The gap between the start of the scope and the declaration is the Temporal Dead Zone. The TDZ exists to prevent the confusing "undefined before assignment" behavior of var.

Function declarations: Fully hoisted — both the declaration and the body are hoisted. You can call a function before its declaration. Function expressions (const fn = function(){}) are NOT fully hoisted — only the variable declaration is hoisted.

Why does TDZ matter in practice? Using a let variable in a closure inside a loop, or accessing a class before its declaration (classes also have TDZ). Understanding TDZ prevents subtle bugs.`,
    code: `// var — hoisted and initialized to undefined
console.log(name);  // undefined (no error!)
var name = "Gopi";
console.log(name);  // "Gopi"

// let — hoisted but NOT initialized (TDZ)
console.log(age);   // ReferenceError: Cannot access 'age' before initialization
let age = 25;

// TDZ in a block scope
{
    // TDZ starts here for 'city'
    console.log(city); // ReferenceError — TDZ!
    let city = "Chennai"; // TDZ ends here
    console.log(city); // "Chennai"
}

// Function declaration — fully hoisted
greet(); // "Hello!" — works before declaration
function greet() { console.log("Hello!"); }

// Function expression — only variable hoisted, not body
sayHi(); // TypeError: sayHi is not a function
const sayHi = () => console.log("Hi!"); // arrow fn assigned after hoisting

// Class — also has TDZ!
const p = new Person(); // ReferenceError
class Person { constructor() {} }`,
    highlights: ['var hoists AND initializes to undefined', 'let/const hoist but TDZ prevents early access', 'Function declarations fully hoist — expressions do not'],
  },
  {
    id: 2417, category: 'JavaScript', difficulty: 'Mid',
    question: 'What are call(), apply(), and bind()? Explain with "this" binding — how does "this" behave in arrow vs regular functions?',
    answer: `The "this" problem is one of JavaScript's most-asked interview topics. Candidates who understand it deeply can explain the problem and all solutions.

"this" is determined by HOW a function is called, not where it's defined (except for arrow functions).

Regular function: this is the calling context. In a method, this = the object. In a standalone function call (or callback), this = undefined (strict mode) or window (non-strict).

Arrow function: this is lexically bound — it inherits "this" from the surrounding scope where the function was DEFINED, not called. Arrow functions have no own "this". This is why arrow functions are ideal for callbacks inside class methods.

call(): Invoke immediately with a specific this + args spread: fn.call(context, arg1, arg2)
apply(): Invoke immediately with a specific this + args as array: fn.apply(context, [arg1, arg2])
bind(): Returns a NEW function with "this" permanently bound. Useful for event handlers and callbacks.

Memory aid: Call = Comma-separated, Apply = Array, Bind = Borrow`,
    code: `// "this" problem in regular function callbacks
class Timer {
    constructor() { this.seconds = 0; }

    start() {
        setInterval(function() {
            this.seconds++; // BUG: this = window/undefined, not the Timer instance
            console.log(this.seconds); // NaN
        }, 1000);
    }
}

// FIX 1: Arrow function — lexical this
start() {
    setInterval(() => {
        this.seconds++; // CORRECT: arrow fn inherits 'this' from start()
        console.log(this.seconds); // 1, 2, 3...
    }, 1000);
}

// call, apply, bind
const person = { name: "Gopi" };

function greet(greeting, punctuation) {
    return \`\${greeting}, \${this.name}\${punctuation}\`;
}

greet.call(person, "Hello", "!");    // "Hello, Gopi!" — args spread
greet.apply(person, ["Hello", "!"]); // "Hello, Gopi!" — args array

const boundGreet = greet.bind(person); // returns new fn with 'this' fixed
boundGreet("Hello", "!");             // "Hello, Gopi!" — reusable

// Practical bind — event handler loses 'this' without it
class Button {
    constructor() { this.count = 0; }
    handleClick() { this.count++; }

    attach(element) {
        element.addEventListener('click', this.handleClick.bind(this)); // bound
    }
}`,
    highlights: ['"this" = calling context for regular fns, lexical scope for arrow fns', 'call() = immediate + spread args, apply() = immediate + array args', 'bind() = returns new fn with permanently fixed "this"'],
  },
  {
    id: 2418, category: 'JavaScript', difficulty: 'Senior',
    question: 'Implement debounce and throttle from scratch. Explain when you would use each in production.',
    answer: `Implementing these from scratch is a common LTIMindtree coding question. The implementations reveal whether you understand closures, timers, and execution context deeply.

Debounce: Execute the function ONLY after a certain quiet period. Use when you want to react to the FINAL state — search input (fire API call only when user stops typing), window resize handler (calculate layout only after resize is done).

Throttle: Execute at most ONCE per time window. Use when you want regular updates but need to cap frequency — scroll event handler (update parallax at 60fps), rate-limiting API calls.

The mental model: debounce = "wait until things calm down." throttle = "fire regularly, but not too often."

Production usage: React applications typically import debounce/throttle from lodash. But knowing the implementation tells interviewers you understand closures, that the returned function must be defined ONCE (outside useEffect or event handler) — a common bug where developers recreate the debounced function on every render, defeating the purpose.`,
    code: `// Debounce implementation
function debounce(fn, delay) {
    let timer;
    return function(...args) {
        clearTimeout(timer); // reset the countdown on each call
        timer = setTimeout(() => {
            fn.apply(this, args); // execute after quiet period
        }, delay);
    };
}

// Throttle implementation
function throttle(fn, limit) {
    let inThrottle = false;
    return function(...args) {
        if (!inThrottle) {
            fn.apply(this, args);
            inThrottle = true;
            setTimeout(() => { inThrottle = false; }, limit);
        }
    };
}

// React usage — MUST create outside render to preserve closure state
const debouncedSearch = useMemo(
    () => debounce((query) => fetchResults(query), 300),
    [] // created once
);

// Common BUG — creating inside render defeats debounce entirely
function SearchBox() {
    const handleSearch = debounce(fetchResults, 300); // NEW fn every render!
    return <input onChange={e => handleSearch(e.target.value)} />;
}

// CORRECT — stable reference via useMemo or useCallback
function SearchBox() {
    const handleSearch = useCallback(
        debounce(fetchResults, 300), // created once
        []
    );
    return <input onChange={e => handleSearch(e.target.value)} />;
}`,
    highlights: ['Debounce = fires after quiet period (search, resize)', 'Throttle = fires at most once per window (scroll, analytics)', 'Must create debounced/throttled fn once — not inside render'],
  },
  {
    id: 2419, category: 'JavaScript', difficulty: 'Senior',
    question: 'Explain the JavaScript event loop in depth: call stack, task queue, microtask queue. What executes in what order?',
    answer: `The event loop question separates candidates who truly understand JavaScript's async model. This is consistently asked in LTIMindtree interviews.

Call stack: Synchronous code. Functions push onto the stack when called, pop when they return. JavaScript is single-threaded — only one function executes at a time.

Web APIs: setTimeout, fetch, DOM events — these are handled by the browser (not the JS engine). When done, their callbacks are queued.

Microtask queue (high priority): Promise .then()/.catch()/.finally(), queueMicrotask(), async/await continuations, MutationObserver. After EVERY call stack frame that completes, the event loop drains the ENTIRE microtask queue before doing anything else.

Macrotask queue (lower priority): setTimeout, setInterval, I/O callbacks, UI rendering. One macrotask is processed per event loop tick.

Execution order: Synchronous code → ALL microtasks → ONE macrotask → ALL microtasks again → next macrotask...

This means: if you recursively queue microtasks (Promise resolving another Promise), you can STARVE the macrotask queue and block the browser from rendering or processing timers.`,
    code: `console.log('1 - sync');

setTimeout(() => console.log('2 - macrotask'), 0);

Promise.resolve()
    .then(() => console.log('3 - microtask 1'))
    .then(() => console.log('4 - microtask 2'));

async function asyncFn() {
    console.log('5 - sync inside async');
    await Promise.resolve();
    console.log('6 - after await (microtask)');
}
asyncFn();

console.log('7 - sync');

// Output order:
// 1 - sync
// 5 - sync inside async  (asyncFn runs synchronously until first await)
// 7 - sync
// 3 - microtask 1       (microtask queue drained)
// 6 - after await       (continuation is a microtask)
// 4 - microtask 2
// 2 - macrotask         (macrotask finally runs)

// Starvation example — never do this!
function recursiveMicrotasks() {
    Promise.resolve().then(recursiveMicrotasks); // queues infinite microtasks
    // setTimeout and UI rendering NEVER get a chance to run
}`,
    highlights: ['Microtasks drain completely before any macrotask runs', 'async/await continuations are microtasks', 'Infinite microtask recursion starves rendering and timers'],
  },

  // ─── LTIMindtree: CODING QUESTIONS ────────────────────────────────────────
  {
    id: 2420, category: 'Java', difficulty: 'Mid',
    question: 'Coding: Find the first non-repeating character, count character frequency, and check if a string is a palindrome using Java.',
    answer: `These three coding questions come up frequently in LTIMindtree technical rounds. The key is writing clean, readable code and explaining your approach clearly as you go.

For first non-repeating character: Use LinkedHashMap to preserve insertion order. Two passes — first to count frequencies, second to find the first with count 1. O(n) time, O(1) space (bounded character set).

For character frequency: Stream-based solution using Collectors.groupingBy() shows modern Java 8 knowledge.

For palindrome: Clean approach is two-pointer technique. Mention the edge case handling and whether to ignore non-alphanumeric characters (real palindrome check for strings like "A man a plan a canal Panama").

Always narrate: "I'll use a LinkedHashMap here because I need both frequency counts AND to preserve insertion order so I can find the FIRST non-repeating character efficiently."`,
    code: `// 1. First non-repeating character — O(n)
public static char firstNonRepeating(String s) {
    Map<Character, Integer> freq = new LinkedHashMap<>(); // preserves insertion order
    for (char c : s.toCharArray()) {
        freq.merge(c, 1, Integer::sum); // elegant: insert 1 or increment existing
    }
    return freq.entrySet().stream()
        .filter(e -> e.getValue() == 1)
        .map(Map.Entry::getKey)
        .findFirst()
        .orElse('\\0'); // '\\0' = no non-repeating char found
}
// firstNonRepeating("aabcddee") → 'b'

// 2. Character frequency using Streams (impresses interviewers)
public static Map<Character, Long> charFrequency(String s) {
    return s.chars()
        .mapToObj(c -> (char) c)
        .collect(Collectors.groupingBy(c -> c, Collectors.counting()));
}

// 3. Palindrome — two-pointer, O(n) time O(1) space
public static boolean isPalindrome(String s) {
    // Real-world version: ignore non-alphanumeric, case-insensitive
    String cleaned = s.toLowerCase().replaceAll("[^a-z0-9]", "");
    int left = 0, right = cleaned.length() - 1;
    while (left < right) {
        if (cleaned.charAt(left) != cleaned.charAt(right)) return false;
        left++; right--;
    }
    return true;
}
// isPalindrome("A man, a plan, a canal: Panama") → true`,
    highlights: ['LinkedHashMap preserves insertion order for first-non-repeating', 'merge() is cleaner than get/put for frequency counting', 'Two-pointer palindrome is O(n) time, O(1) space'],
  },
  {
    id: 2421, category: 'JavaScript', difficulty: 'Mid',
    question: 'Coding: Implement flattenArray, deepClone, and a custom Array.prototype.myFilter() in JavaScript.',
    answer: `These JavaScript coding questions test your understanding of recursion, prototype chain, and object cloning — all fundamental concepts that LTIMindtree reports asking.

Flatten array: Recursive approach with Array.isArray() check is the most common interview answer. Modern solution: arr.flat(Infinity). Show both.

Deep clone: The naive JSON.parse(JSON.stringify()) approach has known limitations (loses undefined, functions, Dates become strings, circular references throw). The proper recursive implementation handles these. In production: use structuredClone() (modern browsers) or lodash's cloneDeep().

Custom myFilter: Implementing built-in methods tests your understanding of how prototype methods work. Key details: use 'this' to reference the array, pass three arguments to the callback (element, index, array) to match the native specification.`,
    code: `// 1. Flatten array — recursive + modern approach
function flattenArray(arr) {
    return arr.reduce((flat, item) =>
        flat.concat(Array.isArray(item) ? flattenArray(item) : item),
    []);
}
// OR modern: arr.flat(Infinity)
// flattenArray([1, [2, [3, [4]]]]) → [1, 2, 3, 4]

// 2. Deep clone — robust implementation
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj; // primitive
    if (obj instanceof Date) return new Date(obj.getTime()); // preserve Dates
    if (Array.isArray(obj)) return obj.map(item => deepClone(item)); // arrays

    const cloned = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            cloned[key] = deepClone(obj[key]); // recurse for nested objects
        }
    }
    return cloned;
}
// Modern (2022+): structuredClone(obj) — handles Date, Map, Set, circular refs

// 3. Custom Array.prototype.myFilter
Array.prototype.myFilter = function(callback) {
    const result = [];
    for (let i = 0; i < this.length; i++) {
        if (i in this && callback(this[i], i, this)) { // 'in' skips holes in sparse arrays
            result.push(this[i]);
        }
    }
    return result;
};

// Verify it matches native behavior
const nums = [1, 2, 3, 4, 5];
console.log(nums.myFilter(n => n % 2 === 0)); // [2, 4]
console.log(nums.filter(n => n % 2 === 0));   // [2, 4] — identical`,
    highlights: ['JSON.parse/stringify deep clone fails on undefined, functions, Dates', 'Use structuredClone() in modern environments', 'Custom prototype methods must pass (element, index, array) to match spec'],
  },
  {
    id: 2422, category: 'Java', difficulty: 'Senior',
    question: 'Coding: Implement a thread-safe Singleton. What is double-checked locking and why is volatile required?',
    answer: `Singleton implementation is a classic Java interview question that reveals understanding of JVM memory model, thread safety, and design patterns. The evolution from naive to production-safe implementation tells a story.

Naive synchronized method: Thread-safe but slow — every call acquires a lock even though the instance only needs to be created once.

Double-checked locking: Faster — only locks when instance is null. But WITHOUT volatile, it's broken on multi-core systems. The JVM can reorder instructions, so thread B can see a non-null but partially constructed object.

The volatile keyword prevents instruction reordering and ensures the fully constructed object is visible to all threads before the reference is published.

Best approach in modern Java: The enum Singleton or the initialization-on-demand holder pattern (Bill Pugh). Both are thread-safe without volatile or synchronized overhead.

Always mention: In Spring Boot applications, you rarely implement Singleton manually — Spring beans are Singleton by default, and Spring manages thread safety through the container.`,
    code: `// 1. Broken — not thread-safe (two threads can create two instances)
public class Singleton {
    private static Singleton instance;
    public static Singleton getInstance() {
        if (instance == null) instance = new Singleton(); // RACE CONDITION
        return instance;
    }
}

// 2. Thread-safe but slow — synchronized on every call
public static synchronized Singleton getInstance() {
    if (instance == null) instance = new Singleton();
    return instance;
}

// 3. Double-checked locking — MUST have volatile
public class Singleton {
    private static volatile Singleton instance; // volatile prevents reordering

    private Singleton() {}

    public static Singleton getInstance() {
        if (instance == null) {                    // first check (no lock)
            synchronized (Singleton.class) {
                if (instance == null) {            // second check (with lock)
                    instance = new Singleton();    // volatile ensures safe publication
                }
            }
        }
        return instance;
    }
}

// 4. BEST: Bill Pugh / Initialization-on-demand holder (no synchronization needed!)
public class Singleton {
    private Singleton() {}

    private static class Holder {
        // JVM guarantees class initialization is thread-safe
        private static final Singleton INSTANCE = new Singleton();
    }

    public static Singleton getInstance() { return Holder.INSTANCE; }
}

// 5. Enum Singleton — also excellent, handles serialization correctly
public enum Singleton {
    INSTANCE;
    public void doWork() { /* ... */ }
}`,
    highlights: ['volatile prevents JVM instruction reordering in double-checked locking', 'Bill Pugh holder pattern — thread-safe with zero synchronization overhead', 'In Spring: @Bean scope singleton is handled by the container — don\'t roll your own'],
  },

  // ─── HCL JAVA INTERVIEW SERIES (Questions from HCL SkillSignal session) ─────

  {
    id: 2500, category: 'Java', difficulty: 'Junior',
    question: 'What does the super keyword do inside a Java constructor?',
    answer: `The super() call inside a constructor invokes the parent class constructor. Think of it like calling your boss (the parent class) before you start your own work — you must sort out the parent's setup first.

It must be the very first statement in the constructor body — no other code can come before it. Java inserts super() automatically ONLY when the parent has a no-argument constructor. If the parent only has parameterized constructors, the child MUST call super(args) explicitly or the code simply won't compile.

Key rules to remember:
• super() must be the FIRST line — anything before it is a compile error
• You cannot use both this() and super() in the same constructor (both try to be first)
• If you omit super(), Java silently adds super() — but only if the parent has a no-arg constructor
• super is NOT inherited — each subclass must call it explicitly with the right arguments

Common pitfall: If the parent class only has Animal(String name, int age) and the child does not call super(name, age), the compiler throws "constructor Animal in class Animal cannot be applied to given types."`,
    code: `class Animal {
    String name;
    int age;

    Animal(String name, int age) {
        this.name = name;
        this.age  = age;
        System.out.println("Animal constructor called");
    }
}

class Dog extends Animal {
    String breed;

    Dog(String name, int age, String breed) {
        super(name, age);   // ← MUST be first line; calls Animal(String, int)
        this.breed = breed;
        System.out.println("Dog constructor called");
    }
}

// new Dog("Rex", 3, "Labrador") prints:
// Animal constructor called
// Dog constructor called

// this() vs super() — cannot use both
class Dog {
    Dog() {
        this("Rex", 3, "Labrador"); // calls another Dog constructor — this() is first
    }
    Dog(String name, int age, String breed) {
        super(name, age); // calls Animal — super() is first here
        this.breed = breed;
    }
}`,
    highlights: ['super() must be the FIRST line — compile error if not', 'Java auto-inserts super() only when parent has a no-arg constructor', 'Cannot use this() and super() together in the same constructor'],
  },
  {
    id: 2501, category: 'Java', difficulty: 'Junior',
    question: 'How do you stop compilation errors when calling a method that throws a checked exception but you don\'t want to handle it right now?',
    answer: `Add "throws ExceptionType" to the caller method's signature. This tells the compiler: "I know this exception can happen here, but I'm passing the responsibility up the chain to whoever calls me."

Think of it like forwarding a complaint — instead of dealing with it yourself, you stamp it "not my problem" and send it upstairs.

The compilation error disappears because you've formally declared the exception is intentionally not handled at this level. But remember — it MUST be handled somewhere up the chain. You can't ignore a checked exception forever; it will eventually need a try-catch.

Difference between checked and unchecked:
• Checked exceptions (IOException, SQLException, etc.) — compiler FORCES you to either catch them or declare throws
• Unchecked exceptions (RuntimeException and its subclasses) — compiler doesn't care; no throws needed`,
    code: `// ❌ Without throws — compile error: "IOException must be caught or declared"
public void callerMethod() {
    riskyMethod(); // IOException not handled!
}

// ✅ With throws — compiles fine; responsibility passed up
public void callerMethod() throws IOException {
    riskyMethod(); // no try-catch needed here
}

// The caller of callerMethod() must now handle or declare it too
public void topMethod() {
    try {
        callerMethod(); // now THIS level must handle it
    } catch (IOException e) {
        System.out.println("Finally handled: " + e.getMessage());
    }
}`,
    highlights: ['throws declares the exception without handling it', 'Responsibility moves up the call chain', 'Only checked exceptions require throws — unchecked ones do not'],
  },
  {
    id: 2502, category: 'Java', difficulty: 'Mid',
    question: 'Design a component that opens many resources sequentially and handles partial failure using try-with-resources.',
    answer: `Declare ALL resources inside the try() parentheses. Java automatically closes them in REVERSE ORDER — even if a later resource fails to open, all previously opened resources are still safely closed.

Without try-with-resources you'd need nested finally blocks with null checks for each resource — incredibly error-prone. Each resource must implement AutoCloseable (or Closeable).

Why reverse order? Because resources often depend on each other (ResultSet depends on Statement which depends on Connection). Closing in the order you opened them could break dependent resources.

The key benefit for partial failure: if opening ResultSet fails, Java still automatically closes Statement and Connection — you get cleanup without writing a single line of finally code.`,
    code: `// ✅ try-with-resources: all resources declared together
try (
    Connection  conn = openConnection();        // opened 1st
    Statement   stmt = conn.createStatement();  // opened 2nd
    ResultSet   rs   = stmt.executeQuery(sql)   // opened 3rd
) {
    while (rs.next()) {
        System.out.println(rs.getString("name"));
    }
} catch (SQLException e) {
    // handle partial failure — e.g. if stmt creation failed,
    // conn is still closed automatically
}
// No finally, no null checks — Java handles ALL cleanup

// ❌ Without try-with-resources (old messy way):
Connection conn = null;
try {
    conn = openConnection();
    Statement stmt = conn.createStatement(); // what if THIS fails?
    // you'd need MORE nested try-finally blocks...
} finally {
    if (conn != null) conn.close(); // easy to forget or mess up
}`,
    highlights: ['Resources closed in REVERSE ORDER automatically', 'All previous resources closed even if a later one fails to open', 'Each resource must implement AutoCloseable'],
  },
  {
    id: 2503, category: 'Java', difficulty: 'Junior',
    question: 'What does removeFirstOccurrence do in LinkedList and what is printed?',
    answer: `removeFirstOccurrence scans from the HEAD (front) of the list and removes only the FIRST element that matches the value. It leaves all other occurrences untouched.

In this example: list = ["x", "y", "x"] → removeFirstOccurrence("x") removes the "x" at position 0 only → result is ["y", "x"].

Key point: Only ONE removal happens no matter how many duplicates exist. If you want to remove ALL occurrences you'd need to loop or use removeIf().

Compare with remove(Object o) — it does the same thing as removeFirstOccurrence. But removeLastOccurrence("x") would remove the LAST "x" instead (the one at the end).`,
    code: `import java.util.*;

LinkedList<String> l = new LinkedList<>(
    Arrays.asList("x", "y", "x")
);
l.removeFirstOccurrence("x");
System.out.println(l); // [y, x]

// Only the first "x" (index 0) is removed
// The second "x" (index 2) stays

// To remove ALL occurrences:
l.removeIf(s -> s.equals("x")); // removes every "x"

// removeLastOccurrence removes from the other end:
LinkedList<String> l2 = new LinkedList<>(Arrays.asList("x","y","x"));
l2.removeLastOccurrence("x");
System.out.println(l2); // [x, y]`,
    highlights: ['Scans from HEAD and removes FIRST match only', 'All other duplicates remain untouched', 'Output: [y, x]'],
  },
  {
    id: 2504, category: 'Java', difficulty: 'Mid',
    question: 'When iterating a HashSet, why use it.remove() instead of set.remove()? Explain ConcurrentModificationException.',
    answer: `it.remove() is SAFE because it removes the element through the iterator itself — the iterator stays in sync with the collection.

set.remove("a") during iteration is a STRUCTURAL CHANGE — it modifies the collection directly while the iterator is mid-scan. On the next it.next() call, the iterator detects the mismatch and throws ConcurrentModificationException.

Why does this happen? Java collections maintain an "modCount" (modification count). When you get an iterator, it remembers the current modCount. Any direct structural change bumps the modCount. When the iterator checks "has modCount changed since I started?" — it sees the mismatch and throws immediately.

Iterator's remove() bypasses this because it updates the iterator's own state AND the collection's modCount together — no mismatch.

This is why it.remove() is the ONLY safe way to delete elements while iterating a collection.`,
    code: `HashSet<String> s = new HashSet<>(Arrays.asList("a", "b", "c"));

// ✅ SAFE: remove via iterator
Iterator<String> it = s.iterator();
while (it.hasNext()) {
    String x = it.next();
    if (x.equals("a")) it.remove(); // safe — iterator stays in sync
}
System.out.println(s.contains("a")); // false — "a" removed correctly

// ❌ DANGEROUS: remove via set directly during iteration
Iterator<String> it2 = s.iterator();
while (it2.hasNext()) {
    String x = it2.next();
    if (x.equals("b")) s.remove("b"); // structural change!
    // it2.hasNext() or it2.next() → ConcurrentModificationException!
}

// Modern alternative using removeIf (Java 8+):
s.removeIf(x -> x.equals("a")); // internally uses iterator.remove() — safe`,
    highlights: ['it.remove() keeps iterator in sync — no exception', 'set.remove() during iteration → ConcurrentModificationException', 'removeIf() is the clean Java 8+ alternative'],
  },
  {
    id: 2505, category: 'Java', difficulty: 'Mid',
    question: 'What does java.util.function.Supplier represent and when would you use it?',
    answer: `Supplier<T> is a functional interface that takes NO input and returns a value of type T. Its single method is get().

Think of it as a "factory on demand" — you give someone a recipe to produce a value, but they only cook it when they actually need it. This is called lazy initialization.

The opposite of Supplier is Consumer (takes input, returns nothing). Function<T,R> takes input AND returns output.

When to use Supplier:
1. Lazy initialization — create expensive objects only when actually needed
2. orElseGet() — Optional's fallback that only executes if the Optional is empty (unlike orElse() which always evaluates the default)
3. Factory methods — produce new instances on demand
4. Default values in streams/maps`,
    code: `// 1. Basic usage
Supplier<String> greeting = () -> "Hello, World!";
System.out.println(greeting.get()); // Hello, World!

// 2. Lazy initialization — list created ONLY when get() is called
Supplier<List<String>> lazyList = () -> new ArrayList<>();
List<String> list = lazyList.get(); // created here, not before

// 3. orElseGet vs orElse — IMPORTANT difference
Optional<String> empty = Optional.empty();

// orElse ALWAYS evaluates "fallback" even if Optional has a value — wasteful
String v1 = empty.orElse(expensiveFallback()); // expensiveFallback() runs regardless

// orElseGet with Supplier — ONLY runs if Optional is empty
String v2 = empty.orElseGet(() -> expensiveFallback()); // runs only when needed ✅

// 4. Factory pattern
Supplier<User> userFactory = () -> new User("default");
User u = userFactory.get();`,
    highlights: ['Supplier = no input, returns T — "produce on demand"', 'Use for lazy init and orElseGet() to avoid unnecessary computation', 'Opposite of Consumer; Function takes AND returns'],
  },
  {
    id: 2506, category: 'Java', difficulty: 'Mid',
    question: 'Implement a method that receives a List<Integer> and a List<Predicate<Integer>> and returns integers satisfying ALL predicates (logical AND).',
    answer: `Chain all predicates together using Predicate::and with reduce(). The trick is starting with an identity predicate that always returns true (x -> true) — this is the "AND identity" so adding it doesn't change the result.

This is clean, scalable, and works for any number of predicates — no if-else chains, no loops. The stream's filter() then applies the combined predicate.

The reduce() approach:
• Start with "always true" as the seed (identity)
• Fold each predicate with AND: true AND p1 = p1; p1 AND p2 = both must pass
• The final combined predicate requires ALL individual predicates to pass`,
    code: `import java.util.*;
import java.util.function.Predicate;
import java.util.stream.Collectors;

public List<Integer> filterAll(
        List<Integer> items,
        List<Predicate<Integer>> preds) {

    // Chain all predicates with AND; start with identity (always true)
    Predicate<Integer> combined = preds.stream()
        .reduce(x -> true, Predicate::and);

    return items.stream()
        .filter(combined)
        .collect(Collectors.toList());
}

// Usage example:
List<Integer> nums = Arrays.asList(1, 2, 3, 4, 5, 6, 10, 12);

List<Predicate<Integer>> predicates = Arrays.asList(
    n -> n % 2 == 0,  // even
    n -> n > 3,        // greater than 3
    n -> n < 11        // less than 11
);

System.out.println(filterAll(nums, predicates)); // [4, 6, 10]`,
    highlights: ['reduce(x -> true, Predicate::and) chains all predicates with logical AND', 'Identity predicate "x -> true" ensures an empty list returns all items', 'Works for any number of predicates without if-else chains'],
  },
  {
    id: 2507, category: 'Java', difficulty: 'Junior',
    question: 'What is the difference between switch expressions (Java 14+) and traditional switch statements?',
    answer: `Traditional switch is a STATEMENT — it runs code but cannot directly return or assign a value. It also has dangerous fall-through: if you forget break, it runs the NEXT case too (a very common silent bug).

Switch EXPRESSION (Java 14+) uses the arrow -> syntax and:
• Can directly return a value and be assigned to a variable
• Has NO fall-through — each arrow case is independent
• Compiler enforces exhaustiveness — you MUST cover all cases (or have a default)
• Multiple labels in one case: case "MON", "TUE" -> "Weekday"

The biggest advantage: eliminating the fall-through bug. In traditional switch, forgetting a break silently executes the next case. In switch expressions, this is impossible by design.`,
    code: `// ❌ Traditional switch — fall-through risk, verbose
String result;
switch (day) {
    case "MON":
    case "TUE": result = "Weekday"; break; // forget break → disaster
    case "SAT": result = "Weekend"; break;
    default:    result = "Unknown";
}

// ✅ Switch expression — clean, safe, direct assignment
String result = switch (day) {
    case "MON", "TUE" -> "Weekday";   // multi-label, no fall-through
    case "SAT"        -> "Weekend";
    default           -> "Unknown";
};

// Switch expression with blocks (when you need multiple lines)
int numLetters = switch (day) {
    case "MON", "FRI", "SUN" -> 6;
    case "TUE"               -> 7;
    case "THU", "SAT"        -> 8;
    default -> {
        System.out.println("Calculating...");
        yield day.length(); // yield returns value from a block
    }
};`,
    highlights: ['Switch expression returns a value — traditional statement cannot', 'Arrow -> syntax has NO fall-through — forgetting break is impossible', 'yield keyword returns value from multi-line block cases'],
  },
  {
    id: 2508, category: 'Java', difficulty: 'Mid',
    question: 'What is the common optimization when using allMatch on a stream? How does short-circuiting help?',
    answer: `allMatch is a SHORT-CIRCUIT terminal operation — it stops scanning the stream the moment it finds the FIRST element that fails the predicate. It doesn't need to look at the rest.

Think of it like a quality inspector on a production line — the moment they find a defect, they stop the line. They don't inspect every single item.

Optimization tip: Place the CHEAPEST predicate first — the one most likely to fail quickly. This way the stream short-circuits early on most elements, avoiding expensive checks.

Example: checking "is even AND passes a slow database lookup" — put the cheap "is even" check first. For odd numbers (50% of a random list), you never even call the database.

The same short-circuit logic applies to: anyMatch (stops on first true), noneMatch (stops on first true), findFirst.`,
    code: `List<Integer> numbers = Arrays.asList(2, 4, 6, 7, 8, 10);

// Short-circuits at 7 — doesn't check 8 and 10
boolean allEven = numbers.stream()
    .allMatch(n -> n % 2 == 0); // stops at 7 (odd) → false

// ✅ Optimization: cheap check FIRST
boolean result = numbers.stream()
    .allMatch(n -> n > 0           // cheap — stops if n ≤ 0 found
                && expensiveDbCheck(n)); // expensive — only runs if n > 0

// vs sequential for-loop — same short-circuit idea:
for (int n : numbers) {
    if (n % 2 != 0) { // stops at first odd
        System.out.println("Not all even, stopped early!");
        break;
    }
}

// anyMatch: stops at FIRST true
boolean anyNegative = numbers.stream()
    .anyMatch(n -> n < 0); // stops the moment it finds a negative`,
    highlights: ['allMatch stops at FIRST failing element — never processes the rest', 'Put the CHEAPEST, most-likely-to-fail predicate first', 'anyMatch, noneMatch, findFirst all short-circuit too'],
  },
  {
    id: 2509, category: 'Java', difficulty: 'Mid',
    question: 'Why is mapToInt better than map when summing integers in a stream? What is the output?',
    answer: `mapToInt converts Stream<Integer> into a primitive IntStream — this avoids repeated AUTO-UNBOXING of Integer wrapper objects to int on every element.

Why does this matter? Integer is a heap-allocated wrapper object. Every time you do math on it, Java must "unbox" it to the primitive int. With mapToInt, you get a primitive IntStream that works directly with raw int values — no objects, no heap allocation, faster computation.

Additionally, IntStream provides .sum(), .average(), .min(), .max() directly as terminal operations. Plain Stream<Integer> has NO .sum() method — you'd need reduce() which is more verbose.

Output: sum = 6 (1 + 2 + 3)

Real performance difference matters for large datasets like processing millions of records — the unboxing overhead adds up significantly.`,
    code: `List<Integer> list = Arrays.asList(1, 2, 3);

// ✅ mapToInt → IntStream → .sum() available directly
int sum = list.stream()
    .mapToInt(Integer::intValue)  // unboxing happens ONCE per element, not repeatedly
    .sum();
System.out.println(sum); // 6

// Same with method reference shorthand
int sum2 = list.stream()
    .mapToInt(n -> n) // auto-unboxing in the lambda
    .sum();

// ❌ Without mapToInt — Stream<Integer> has NO .sum()
// list.stream().sum(); // compile error!

// You'd need reduce() instead — works but more verbose
int sum3 = list.stream()
    .reduce(0, Integer::sum); // 6, but works with Integer objects

// IntStream also gives you extra stats methods:
IntSummaryStatistics stats = list.stream()
    .mapToInt(Integer::intValue)
    .summaryStatistics();
System.out.println(stats.getMax());  // 3
System.out.println(stats.getMin());  // 1
System.out.println(stats.getAverage()); // 2.0`,
    highlights: ['mapToInt → IntStream avoids Integer auto-unboxing overhead', 'IntStream provides .sum(), .average(), .min(), .max() directly', 'Output: sum = 6'],
  },
  {
    id: 2510, category: 'Java', difficulty: 'Mid',
    question: 'Explain the relationship between JPA and Hibernate. Are they the same thing?',
    answer: `JPA and Hibernate are NOT the same — JPA is a SPECIFICATION and Hibernate is an IMPLEMENTATION.

Think of it like a USB standard vs a USB cable manufacturer:
• JPA (Java Persistence API) defines the rules — the interfaces, annotations, and behaviors for mapping Java objects to databases. It's like a contract or blueprint. It provides no actual working code.
• Hibernate is a framework that IMPLEMENTS those JPA interfaces. It's the actual code that generates SQL, manages sessions, handles caching, etc.

You write your code against JPA interfaces (@Entity, @Table, @Id, EntityManager). This means you could theoretically swap Hibernate for another JPA provider like EclipseLink without changing your application code — just the underlying engine changes.

In Spring Boot, when you add spring-boot-starter-data-jpa to your project, Hibernate is auto-configured as the default JPA provider under the hood. Spring Data JPA adds another layer on top that gives you repositories (findById, save, etc.) without writing SQL.

Stack: Your code → JPA annotations → Spring Data JPA → Hibernate → Database`,
    code: `// JPA annotations (part of the specification — same regardless of provider)
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    // Hibernate generates the SQL behind the scenes:
    // CREATE TABLE users (id BIGINT AUTO_INCREMENT, name VARCHAR NOT NULL, ...);
    // INSERT INTO users (name) VALUES (?);
}

// Spring Data JPA repository — works because of Hibernate underneath
public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByName(String name); // Hibernate translates to SQL
}

// application.properties — choose your JPA provider here:
// spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect`,
    highlights: ['JPA = specification (interfaces + rules). Hibernate = implementation (actual code)', 'You code against JPA — you could swap Hibernate for EclipseLink without changing app code', 'Spring Boot auto-configures Hibernate as the default JPA provider'],
  },
  {
    id: 2511, category: 'Java', difficulty: 'Mid',
    question: 'Review: @ManyToMany(cascade = CascadeType.ALL) is causing tag deletion when articles are deleted. Identify the bug and fix it.',
    answer: `The bug is CascadeType.ALL on a @ManyToMany relationship where tags are SHARED across multiple articles.

CascadeType.ALL includes CascadeType.REMOVE. When you delete one Article, REMOVE cascades to all its associated Tag entities — deleting Tags that other articles still use. This is catastrophic data loss.

Why is this wrong for @ManyToMany? In a many-to-many, the relationship is bidirectional — a Tag belongs to many Articles. Deleting one Article should NOT delete the Tag because other Articles still reference it. Only the JOIN TABLE row should be deleted.

The fix: Remove REMOVE from the cascade. Use only PERSIST and MERGE, which are safe — PERSIST saves new Tags when saving an Article, MERGE updates Tags when updating an Article. Neither deletes anything.

An additional safeguard: if you want to delete orphaned Tags (tags no longer referenced by any article), handle that in a scheduled cleanup job or explicitly, never via cascade.`,
    code: `// ❌ BUG: CascadeType.ALL includes REMOVE
@Entity
public class Article {
    @Id @GeneratedValue private Long id;

    @ManyToMany(cascade = CascadeType.ALL) // REMOVE cascades → deletes shared Tags!
    @JoinTable(name = "article_tag",
        joinColumns = @JoinColumn(name = "article_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id"))
    private Set<Tag> tags = new HashSet<>();
}

// ✅ FIX: Only PERSIST and MERGE are safe for shared entities
@Entity
public class Article {
    @Id @GeneratedValue private Long id;

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE}) // no REMOVE ✅
    @JoinTable(name = "article_tag",
        joinColumns = @JoinColumn(name = "article_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id"))
    private Set<Tag> tags = new HashSet<>();
}

// When an Article is deleted now:
// - The article_tag rows for that article are removed ✅
// - The Tag entities themselves are left intact ✅
// - Other articles' tags are unaffected ✅`,
    highlights: ['CascadeType.ALL includes REMOVE — NEVER use on shared ManyToMany entities', 'Safe cascades: PERSIST (save together) and MERGE (update together)', 'Delete only removes the join table row, not the shared Tag entity'],
  },
  {
    id: 2512, category: 'Spring', difficulty: 'Mid',
    question: 'When should business logic live in @Service vs @Component or controller layers? Discuss layering, single responsibility, and testing.',
    answer: `Business logic should ALWAYS live in @Service classes — never in controllers or raw @Component beans.

The controller layer has ONE job: handle HTTP. It receives requests, validates input format, and delegates to a service. That's it. If you put business rules in the controller (discounts, calculations, domain logic), you've tied that logic permanently to HTTP — you can't reuse it from a scheduled job, a message queue consumer, or a command-line tool without duplicating code.

@Component is a generic Spring bean with no semantic meaning. @Service is semantically identical under the hood but SIGNALS to every developer: "this class owns business rules." Use annotations to communicate intent.

For testing: @Service classes can be tested with plain JUnit + Mockito — no web context, no Spring container needed. Fast, simple, isolated. Controller logic requires @WebMvcTest or MockMvc, which loads a partial web context — slower and heavier. Keeping logic in services means your critical business rules have the lightest, fastest tests.

The architecture rule: Controllers handle web → Services own business rules → Repositories handle data → and NOTHING crosses those boundaries without a clear reason.`,
    code: `// ❌ WRONG: Business logic in controller
@RestController
public class OrderController {
    @PostMapping("/order")
    public ResponseEntity createOrder(@RequestBody Order order) {
        // Business logic INSIDE controller — cannot be reused from scheduler/queue
        if (order.getTotal() > 1000) {
            order.setDiscount(0.1);
        }
        if (order.getItems().isEmpty()) {
            return ResponseEntity.badRequest().body("No items");
        }
        orderRepo.save(order);
        return ResponseEntity.ok(order);
    }
}

// ✅ CORRECT: Controller delegates, Service owns logic
@RestController
public class OrderController {
    private final OrderService orderService;

    @PostMapping("/order")
    public ResponseEntity createOrder(@RequestBody Order order) {
        return ResponseEntity.ok(orderService.placeOrder(order)); // delegate
    }
}

@Service // clear semantic intent
public class OrderService {
    public Order placeOrder(Order order) {
        if (order.getItems().isEmpty()) throw new IllegalStateException("No items");
        if (order.getTotal() > 1000) order.applyDiscount(0.1); // business rule here
        return orderRepo.save(order);
    }
}

// Unit test — no Spring context needed:
@Test
void applyDiscountForLargeOrders() {
    Order order = new Order(List.of(item1, item2), 1500.0);
    Order result = orderService.placeOrder(order);
    assertEquals(0.1, result.getDiscount());
}`,
    highlights: ['Controllers only handle HTTP — delegate all business logic to @Service', '@Service signals semantic intent; @Component is generic with no meaning', 'Services can be unit tested without loading a web context — much faster tests'],
  },
  {
    id: 2513, category: 'Spring', difficulty: 'Senior',
    question: 'A @Bean method fails at runtime due to CGLIB proxying issues with a non-static inner configuration class. Why does this happen and how do you fix it?',
    answer: `Spring uses CGLIB to SUBCLASS @Configuration classes. This is how Spring intercepts @Bean method calls and ensures singleton semantics — when methodA() calls methodB() inside a @Configuration class, CGLIB intercepts that call to return the cached singleton instead of creating a new instance.

The problem: CGLIB subclasses the @Configuration class. To subclass a non-static inner class, Java requires an INSTANCE of the outer class — you cannot instantiate a non-static inner class without its enclosing instance. CGLIB cannot obtain or provide this outer class instance, so it fails at runtime with something like "Unable to proxy ... cannot subclass inner class."

The fix is simple: make the inner class STATIC. A static nested class can be instantiated independently without the outer class instance — CGLIB can subclass it normally.

Why this matters in Spring Boot: test configurations, modular configuration, and embedded configuration beans all commonly appear as inner classes. If you see CGLIB failures or beans not being properly intercepted, check for non-static inner @Configuration classes.`,
    code: `// ❌ PROBLEM: non-static inner class — CGLIB cannot subclass it
public class AppConfig {
    @Configuration
    class InnerConfig {  // non-static — needs OuterClass instance to instantiate
        @Bean
        public MyService myService() {
            return new MyService(otherBean()); // CGLIB can't intercept this
        }
        @Bean
        public OtherBean otherBean() { return new OtherBean(); }
    }
}
// Runtime error: CGLIB cannot proxy InnerConfig (needs outer class instance)

// ✅ FIX: make it static — instantiatable without outer class
public class AppConfig {
    @Configuration
    static class InnerConfig {  // static — CGLIB can subclass freely
        @Bean
        public MyService myService() {
            return new MyService(otherBean()); // CGLIB intercepts, returns cached singleton
        }
        @Bean
        public OtherBean otherBean() { return new OtherBean(); }
    }
}

// Common in test configurations too:
@SpringBootTest
class MyTest {
    @TestConfiguration
    static class TestConfig {  // must be static
        @Bean
        public MyService mockService() {
            return Mockito.mock(MyService.class);
        }
    }
}`,
    highlights: ['CGLIB subclasses @Configuration to intercept @Bean calls and ensure singleton scope', 'Non-static inner class requires outer instance — CGLIB cannot provide this', 'Fix: add static keyword — allows CGLIB to subclass without outer class'],
  },
  {
    id: 2514, category: 'Spring', difficulty: 'Mid',
    question: 'Tests intermittently fail because beans from @TestConfiguration are ignored. Identify the mistake and propose a fix.',
    answer: `The bug: @TestConfiguration beans are NOT automatically picked up by @SpringBootTest. @SpringBootTest does a full component scan from the main application class — it doesn't know about your @TestConfiguration unless you explicitly tell it.

This causes INTERMITTENT failures because Spring CACHES the ApplicationContext across tests. Sometimes the cache hits a context that includes your TestConfig (from a previous test that properly imported it) and it works. Other times a fresh context is loaded without it and your test fails. Random order = random success/failure.

Two fixes:

1. @Import — explicitly declare the test config in each test class that needs it.

2. Static inner class — declare @TestConfiguration as a static inner class INSIDE the test. Spring automatically includes nested static @TestConfiguration classes in the test's ApplicationContext.

Why not just use @SpringBootTest with everything? Because that loads your ENTIRE application context — all beans, all configs. This is slow. @TestConfiguration lets you replace specific beans with mocks while keeping everything else, keeping tests fast.`,
    code: `// ❌ BUGGY: TestConfig is not imported — intermittently ignored
@SpringBootTest
@ActiveProfiles("test")
public class MyControllerTest {
    // Spring has no idea MyTestConfig exists — it's not imported or nested
    @Test
    public void contextLoads() {}
}

// Elsewhere in test sources — Spring never scans this automatically:
@TestConfiguration
class MyTestConfig {
    @Bean
    public MyService myService() {
        return Mockito.mock(MyService.class); // this mock is never loaded!
    }
}

// ✅ FIX 1: Use @Import
@SpringBootTest
@ActiveProfiles("test")
@Import(MyTestConfig.class) // explicitly pulls in the test config
public class MyControllerTest {
    @Autowired
    MyService myService; // now gets the mock bean
}

// ✅ FIX 2: Static inner class (best option — always included automatically)
@SpringBootTest
@ActiveProfiles("test")
public class MyControllerTest {

    @TestConfiguration
    static class Config { // static inner = automatically included in THIS test's context
        @Bean
        public MyService myService() {
            return Mockito.mock(MyService.class);
        }
    }

    @Autowired
    MyService myService; // guaranteed to be the mock
}`,
    highlights: ['@TestConfiguration is NOT auto-scanned by @SpringBootTest — must import it', 'Intermittent failures happen because Spring caches contexts across tests', 'Best fix: static inner @TestConfiguration is always included automatically'],
  },
  {
    id: 2515, category: 'Spring', difficulty: 'Senior',
    question: 'A REST endpoint must operate under strong SLA for latency. How do you manage per-request timeouts, retries, client-side exposure, and fail-fast? What Spring Boot features help?',
    answer: `To operate under a tight SLA, you need timeouts at BOTH the server side and the client side, plus a clear failure strategy.

Server-side: Configure connection/read timeouts so the server drops requests that take too long. For database operations, @Transactional(timeout=X) aborts long-running queries. Return 408 or 504 with a clear error body so clients know whether the failure is retryable.

Client-side (when calling downstream services): Configure WebClient or RestTemplate with explicit connect and read timeouts. A downstream service hanging should not block your thread indefinitely.

Retries: Use Spring Retry's @Retryable with exponential backoff — but ONLY on idempotent operations (GET, PUT, DELETE). Never auto-retry a POST that creates resources unless you handle idempotency keys.

Circuit breaking: Resilience4j @CircuitBreaker prevents your service from hammering a broken downstream. After N failures, the circuit "opens" and requests immediately return a fallback response without trying the downstream. This protects both you and the failing service.

Observability: Micrometer + Prometheus to track p50/p95/p99 latency. Set SLA alerting on p99 so you know when you're approaching the limit before it becomes a customer issue.`,
    code: `// 1. Server-side timeout via properties
// application.properties:
// server.tomcat.connection-timeout=5000
// spring.datasource.hikari.connection-timeout=3000

// 2. Client-side timeout with WebClient
@Bean
public WebClient webClient() {
    HttpClient httpClient = HttpClient.create()
        .responseTimeout(Duration.ofSeconds(3))
        .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 2000);

    return WebClient.builder()
        .clientConnector(new ReactorClientHttpConnector(httpClient))
        .build();
}

// 3. Retry with exponential backoff — idempotent ops only!
@Service
public class DataService {
    @Retryable(
        retryFor = { HttpServerErrorException.class },
        maxAttempts = 3,
        backoff = @Backoff(delay = 500, multiplier = 2) // 500ms, 1s, 2s
    )
    public Data fetchData(String id) {
        return webClient.get()...retrieve()...block();
    }
}

// 4. Circuit breaker with Resilience4j
@CircuitBreaker(name = "inventoryService", fallbackMethod = "inventoryFallback")
public Inventory checkInventory(String productId) {
    return inventoryClient.getInventory(productId);
}

public Inventory inventoryFallback(String productId, Exception ex) {
    return Inventory.unavailable(); // graceful degradation
}

// 5. Client-facing error response for timeout
@ExceptionHandler(TimeoutException.class)
public ResponseEntity handleTimeout(TimeoutException e) {
    return ResponseEntity.status(504)
        .body(Map.of("error", "Request timed out", "retryable", true));
}`,
    highlights: ['Timeout at both server and client sides — never trust just one', '@Retryable with exponential backoff — only on idempotent operations', 'Resilience4j @CircuitBreaker prevents cascading failures to downstream services'],
  },
  {
    id: 2516, category: 'Spring', difficulty: 'Senior',
    question: 'How do Cache-Control, Vary, ETag, and cookie/session headers interact with CDN caching? What are the pitfalls for authenticated REST endpoints?',
    answer: `Cache-Control tells browsers AND CDNs how long to cache a response. The key values:
• max-age=N: cache for N seconds
• public: any cache (CDN, browser, proxy) can cache this
• private: only the browser can cache (NOT the CDN) — use for user-specific data
• no-store: cache nothing, ever — use for sensitive data

The #1 pitfall: never let CDNs cache authenticated/user-specific responses. If /profile returns User A's data with Cache-Control: public, the CDN caches it. The next person to hit /profile may get User A's data — a serious privacy/security breach.

Vary: tells the CDN to cache SEPARATE copies based on the specified request header. Vary: Authorization means "cache a different copy for each Authorization header value." Vary: Accept-Encoding means cache separate copies for gzip vs non-gzip clients.

ETags: the server sends ETag: "abc123" with the response. The client stores it and sends If-None-Match: "abc123" on the next request. If content hasn't changed, the server returns 304 Not Modified with no body — saves bandwidth.

Set-Cookie + caching: most CDNs refuse to cache any response that contains Set-Cookie. This is intentional — you don't want session cookies shared between users. If your cacheable endpoint accidentally includes Set-Cookie, the CDN will bypass its cache.`,
    code: `// ✅ Public cacheable endpoint — safe for CDN
@GetMapping("/products")
public ResponseEntity<List<Product>> getProducts() {
    return ResponseEntity.ok()
        .cacheControl(CacheControl.maxAge(1, TimeUnit.HOURS).cachePublic())
        .body(productService.findAll());
    // CDN caches for 1 hour — all users get same data
}

// ✅ ETag for conditional requests
@GetMapping("/products/{id}")
public ResponseEntity<Product> getProduct(@PathVariable Long id,
                                           WebRequest request) {
    Product product = productService.findById(id);
    String etag = "\"" + product.getVersion() + "\"";
    if (request.checkNotModified(etag)) {
        return ResponseEntity.status(304).build(); // no body sent — saves bandwidth
    }
    return ResponseEntity.ok().eTag(etag).body(product);
}

// ✅ Vary header for content negotiation
@GetMapping("/data")
public ResponseEntity<Data> getData(@RequestHeader("Accept-Encoding") String encoding) {
    return ResponseEntity.ok()
        .header(HttpHeaders.VARY, "Accept-Encoding") // separate cache per encoding
        .body(data);
}

// ✅ Authenticated endpoint — NEVER cache at CDN
@GetMapping("/profile")
@PreAuthorize("isAuthenticated()")
public ResponseEntity<User> getProfile() {
    return ResponseEntity.ok()
        .cacheControl(CacheControl.noStore().mustRevalidate()) // CDN must not cache this
        .body(userService.getCurrentUser());
    // DO NOT return Set-Cookie here — it would prevent CDN from caching other endpoints
}`,
    highlights: ['Use Cache-Control: private or no-store for authenticated/user-specific endpoints', 'ETags enable 304 responses — saves bandwidth without stale data', 'Set-Cookie on cacheable responses breaks CDN caching — keep them separate'],
  },
  {
    id: 2517, category: 'Spring', difficulty: 'Senior',
    question: 'Your API must support partial updates via JSON Merge Patch or JSON Patch. Describe a safe server-side approach that avoids removing required fields or violating invariants.',
    answer: `For partial updates, use PATCH with Content-Type: application/merge-patch+json (JSON Merge Patch) for simple objects. JSON Merge Patch means: "only the fields I send should be updated; fields not in the patch are left as-is; sending null means delete that field."

The critical safety rule: VALIDATE AFTER MERGING, not before. The patch itself may be valid (e.g., {"email": null} is valid JSON) but the RESULT violates your invariants (email is required). Validate the fully-merged entity, not the raw patch payload.

Three safety layers:
1. Load the existing entity first — never apply patch to a blank object
2. Merge the patch onto the existing entity using Jackson's readerForUpdating()
3. Validate the merged result with Bean Validation (@Valid) before saving

Protect invariant fields: use @JsonIgnore or a separate DTO/whitelist to block clients from patching id, createdAt, role, or any other system-managed field.

For complex nested updates (removing array elements, moving values), JSON Patch (RFC 6902) provides atomic operations: add, remove, replace, move, copy, test. The test operation is especially powerful — it validates a precondition before applying changes, giving you optimistic concurrency.`,
    code: `// ✅ Safe JSON Merge Patch endpoint
@PatchMapping(
    value = "/users/{id}",
    consumes = "application/merge-patch+json"
)
public ResponseEntity<User> patchUser(
        @PathVariable Long id,
        @RequestBody JsonNode patch) throws IOException {

    // 1. Load existing entity
    User existing = userRepo.findById(id)
        .orElseThrow(() -> new NotFoundException("User " + id));

    // 2. Merge patch onto existing entity
    User merged = objectMapper
        .readerForUpdating(existing)  // keeps existing fields not in patch
        .readValue(patch);

    // 3. Validate AFTER merge — catches "email set to null" violations
    Set<ConstraintViolation<User>> violations = validator.validate(merged);
    if (!violations.isEmpty()) {
        throw new ConstraintViolationException(violations);
    }

    // 4. Save and return
    return ResponseEntity.ok(userRepo.save(merged));
}

// Protect invariant fields with @JsonIgnore
public class User {
    @JsonIgnore                        // clients cannot patch the id
    private Long id;

    @JsonIgnore                        // clients cannot escalate their own role
    private String role;

    @JsonIgnore                        // system-managed
    private LocalDateTime createdAt;

    @NotBlank                          // validated after merge — null patch → 400
    private String name;

    @Email @NotBlank
    private String email;
}

// JSON Merge Patch semantics:
// PATCH { "name": "Alice" }         → updates name, everything else unchanged
// PATCH { "email": null }           → tries to null email → validation fails (400)
// PATCH { "role": "ADMIN" }         → @JsonIgnore silently ignores this field`,
    highlights: ['Validate AFTER merging — the raw patch is not enough to check invariants', '@JsonIgnore blocks clients from patching sensitive fields like id, role, createdAt', 'JSON Merge Patch: null = delete field; missing field = leave unchanged'],
  },


  // ─── NEW: gap-analysis additions (Java, Spring, System Design, Banking Scenarios) ───────────────────────────────────────────
  {
    id: 2601, category: 'Java', difficulty: 'Junior',
    question: 'What is polymorphism? Give a real-time example.',
    answer: `Polymorphism means "many forms" — the same method call behaves differently depending on the actual object it runs on. Java has two kinds:

1. Compile-time (static) polymorphism — method overloading. The compiler picks the right method based on the arguments you pass.
2. Runtime (dynamic) polymorphism — method overriding. The JVM picks the right method based on the actual object type at runtime, not the reference type. This is the one interviewers usually mean.

Real-time example: think of a payment system. You have a Payment reference, but at runtime it could be a CreditCardPayment, UpiPayment, or NetBankingPayment. You call payment.process() the same way everywhere — the correct version runs automatically based on the real object. This is exactly how Spring beans, JDBC drivers and most frameworks are designed — code against an interface, let polymorphism pick the implementation.`,
    code: `abstract class Payment {
    abstract void process(double amount);
}

class CreditCardPayment extends Payment {
    void process(double amount) { System.out.println("Charging card: " + amount); }
}

class UpiPayment extends Payment {
    void process(double amount) { System.out.println("Debiting UPI: " + amount); }
}

public class Demo {
    public static void main(String[] args) {
        Payment payment = new UpiPayment(); // reference type = Payment, object type = UpiPayment
        payment.process(500);               // runs UpiPayment's version — decided at RUNTIME
        // Same call site, different behavior depending on the actual object -> polymorphism
    }
}`,
    highlights: ['Overloading = compile-time polymorphism (same method name, different params)', 'Overriding = runtime polymorphism (JVM picks based on actual object type)', 'Lets you code against an interface/abstract type and swap implementations freely'],
  },
  {
    id: 2602, category: 'Java', difficulty: 'Junior',
    question: 'Is Java pass-by-value or pass-by-reference?',
    answer: `Java is always pass-by-value — there is no pass-by-reference in Java, even though it feels like it for objects.

For primitives (int, double, boolean...): a copy of the actual value is passed. Changes inside the method never affect the caller's variable.

For objects: what gets copied is the value of the reference (the memory address), not the object itself. So the method gets its own copy of the pointer, but both the original and the copy point to the SAME object. This means: mutating the object's fields through the copied reference IS visible to the caller (because it's the same object) — but reassigning the copied reference to point to a new object is NOT visible to the caller, because that only changes the local copy of the pointer.`,
    code: `class Box { int value; }

public class Demo {
    static void changeValue(int x) {
        x = 100; // only changes the local copy
    }
    static void mutateObject(Box b) {
        b.value = 100; // mutates the SAME object the caller sees
    }
    static void reassignObject(Box b) {
        b = new Box(); // only re-points the LOCAL copy of the reference
        b.value = 999;  // caller's box is untouched
    }
    public static void main(String[] args) {
        int num = 5;
        changeValue(num);
        System.out.println(num); // 5 — unchanged

        Box box = new Box();
        box.value = 1;
        mutateObject(box);
        System.out.println(box.value); // 100 — changed, same object was mutated

        reassignObject(box);
        System.out.println(box.value); // still 100 — caller's reference never moved
    }
}`,
    highlights: ['Always pass-by-value in Java — no exceptions', 'For objects, the VALUE that is copied is the reference (address), not the object', 'Mutating fields through the copy is visible to the caller; reassigning the copy is not'],
  },
  {
    id: 2603, category: 'Java', difficulty: 'Mid',
    question: 'Why should we override equals() and hashCode() together?',
    answer: `Java's contract requires: if two objects are equal according to equals(), they MUST return the same hashCode(). If you break this contract by overriding only one of them, hash-based collections (HashMap, HashSet, HashTable) silently misbehave.

Why it matters in practice: HashMap/HashSet first use hashCode() to find the right "bucket", then use equals() inside that bucket to check for an actual match. If two "equal" objects produce different hashCodes, they land in different buckets — a HashSet will happily store both as if they were different objects, and map.get(key) can return null even though an "equal" key was inserted, because it's looking in the wrong bucket entirely.

Rule of thumb: override both together, base them on the same fields, and use Objects.equals()/Objects.hash() to avoid mistakes. Most IDEs and Lombok's @EqualsAndHashCode generate a correct pair automatically.`,
    code: `class Employee {
    private final String id;
    private final String name;

    Employee(String id, String name) { this.id = id; this.name = name; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Employee)) return false;
        Employee e = (Employee) o;
        return id.equals(e.id); // "equal" means same id
    }

    @Override
    public int hashCode() {
        return java.util.Objects.hash(id); // MUST be based on the same field(s) as equals()
    }
}

// If hashCode() were NOT overridden (default Object identity hash):
Set<Employee> seen = new HashSet<>();
seen.add(new Employee("E1", "Alice"));
seen.contains(new Employee("E1", "Alice")); // would wrongly return false!
// because the two objects have different default hashCodes even though equals() says they match`,
    highlights: ["Contract: equal objects MUST have equal hashCodes", "Breaking it makes HashMap.get()/HashSet.contains() silently return wrong results", "Always override both together, from the same fields"],
  },
  {
    id: 2604, category: 'Java', difficulty: 'Senior',
    question: 'What happens if the hashCode() of an object changes after putting it into a HashMap?',
    answer: `The object becomes "lost" — you generally can no longer retrieve, update, or remove it correctly using its current state.

Here's why: HashMap decides which bucket an entry lives in at insertion time, based on the hashCode() at that moment. If the object is mutable and you later change a field that hashCode() depends on, the object's hashCode() now points to a DIFFERENT bucket — but the entry is still physically sitting in the OLD bucket. When you later call map.get(key), Java computes the NEW hashCode, looks in the NEW bucket, and finds nothing there, even though the entry still exists in the map (just in the wrong bucket for its current state).

Practical rule: never use a mutable field in hashCode()/equals() if the object will be used as a HashMap/HashSet key — or better, always use immutable keys (String, wrapper types, or immutable value objects) for hashing.`,
    code: `class MutableKey {
    int id;
    MutableKey(int id) { this.id = id; }
    @Override public int hashCode() { return id; }       // depends on mutable field
    @Override public boolean equals(Object o) {
        return o instanceof MutableKey && ((MutableKey) o).id == id;
    }
}

Map<MutableKey, String> map = new HashMap<>();
MutableKey key = new MutableKey(1);
map.put(key, "Alice");

key.id = 2; // mutated AFTER insertion — hashCode() now returns a different value

System.out.println(map.get(key));        // null! looking in the WRONG bucket now
System.out.println(map.containsKey(key)); // false — entry is "lost", still occupying memory
// Fix: use immutable keys, e.g. a final int id set once in the constructor with no setter`,
    highlights: ['HashMap places the entry using the hashCode() AT INSERTION TIME', 'Changing a hash-affecting field later leaves the entry in the wrong bucket', 'Prefer immutable objects as HashMap/HashSet keys'],
  },
  {
    id: 2605, category: 'Java', difficulty: 'Mid',
    question: 'How does HashMap resize (rehashing) work?',
    answer: `HashMap starts with a default capacity of 16 buckets and a load factor of 0.75. When the number of entries exceeds capacity × loadFactor (16 × 0.75 = 12 for the default), a resize is triggered automatically.

During resize: a new bucket array of DOUBLE the old capacity is created (e.g. 16 → 32), and every existing entry is rehashed — its bucket index is recalculated against the new capacity — and moved into the new array. This is an O(n) operation, so resizing is expensive and, if it happens often (many inserts), it can noticeably slow things down.

Practical tip: if you already know roughly how many entries you'll store, pass an initial capacity to the constructor (e.g. new HashMap<>(500)) to avoid repeated resizes during heavy inserts.`,
    code: `// Default: capacity 16, load factor 0.75 → resizes at 13th entry (threshold 12)
Map<String, Integer> map = new HashMap<>();
for (int i = 1; i <= 13; i++) {
    map.put("key" + i, i);
    // after the 13th put, size (13) > threshold (12) -> HashMap doubles to 32 buckets
    // and every existing entry gets rehashed into the new array
}

// If you know the expected size upfront, avoid resize churn:
Map<String, Integer> preSized = new HashMap<>(1024); // fewer/no resizes for ~750+ entries`,
    highlights: ['Default capacity 16, load factor 0.75 -> resize threshold = capacity * loadFactor', 'Resize doubles the bucket array and rehashes EVERY existing entry — O(n)', 'Pre-size the HashMap if you know roughly how many entries you\u2019ll insert'],
  },
  {
    id: 2606, category: 'Java', difficulty: 'Mid',
    question: 'What are Java 21 virtual threads, and when would you use them?',
    answer: `Virtual threads (JEP 444, finalized in Java 21) are lightweight threads managed by the JVM instead of the OS. A traditional "platform thread" maps 1:1 to an OS thread, which is expensive (roughly 1MB of stack, limited to a few thousand per JVM). Virtual threads are cheap — you can create millions of them — because many virtual threads share a small pool of underlying OS "carrier" threads. When a virtual thread blocks on I/O (a network call, a DB query, Thread.sleep), the JVM automatically unmounts it from its carrier thread, freeing that carrier to run another virtual thread, and remounts it once the I/O completes.

When to use them: any workload that is I/O-bound with lots of blocking calls and high concurrency — typical REST API backends calling databases/downstream services, where today you'd otherwise reach for reactive/async programming just to avoid exhausting a limited thread pool. Virtual threads let you keep the simple, readable "one thread per request" blocking style while still scaling to huge numbers of concurrent requests.

When NOT to use them: CPU-bound work (heavy computation, no blocking) gets no benefit — you're limited by CPU cores either way, so platform threads or a fixed-size pool are just as good. Also avoid long-held synchronized blocks around blocking calls, since that can still pin the virtual thread to its carrier.`,
    code: `// Old way: platform threads, limited by OS thread cost (~1MB stack each)
ExecutorService platformPool = Executors.newFixedThreadPool(200);

// New way (Java 21): virtual threads — cheap, can spin up thousands/millions
try (ExecutorService virtualPool = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 100_000; i++) {
        int taskId = i;
        virtualPool.submit(() -> {
            callDownstreamService(taskId); // blocking I/O call — JVM parks the virtual thread,
                                            // freeing the carrier thread for other work
        });
    }
} // executor auto-closes and waits for tasks to finish

// Spring Boot 3.2+: enable virtual threads for the embedded Tomcat request-handling threads
// application.properties
// spring.threads.virtual.enabled=true`,
    highlights: ['Virtual threads are cheap JVM-managed threads, not 1:1 with OS threads', 'JVM automatically parks a virtual thread during blocking I/O, freeing its carrier thread', 'Best for I/O-bound, high-concurrency workloads — no benefit for pure CPU-bound work'],
  },
  {
    id: 2607, category: 'Spring', difficulty: 'Mid',
    question: 'What does @SpringBootApplication do internally?',
    answer: `@SpringBootApplication is a convenience meta-annotation — it bundles together three annotations so you don't have to apply each one on your main class:

1. @SpringBootConfiguration — marks the class as a source of bean definitions (a specialized @Configuration).
2. @EnableAutoConfiguration — turns on Spring Boot's auto-configuration engine, which inspects the classpath (which JARs are present, e.g. spring-boot-starter-web) and automatically configures beans you'd otherwise have to wire up by hand (embedded Tomcat, Jackson, a DataSource, etc.).
3. @ComponentScan — tells Spring to scan the current package and all sub-packages for @Component, @Service, @Repository, @Controller classes and register them as beans automatically.

Because of #3, your main class's package location matters — anything outside that package tree won't be picked up unless you widen the scan explicitly.`,
    code: `// This single annotation...
@SpringBootApplication
public class InsuranceDocsApplication {
    public static void main(String[] args) {
        SpringApplication.run(InsuranceDocsApplication.class, args);
    }
}

// ...is equivalent to writing all of this yourself:
@SpringBootConfiguration
@EnableAutoConfiguration
@ComponentScan(basePackages = "com.example.insurancedocs")
public class InsuranceDocsApplicationExpanded {
    // same main method
}`,
    highlights: ['@SpringBootApplication = @SpringBootConfiguration + @EnableAutoConfiguration + @ComponentScan', 'Auto-configuration reads the classpath and wires common beans (Tomcat, DataSource, Jackson) for you', 'Component scanning only covers the main class\u2019s package and sub-packages'],
  },
  {
    id: 2608, category: 'Spring', difficulty: 'Mid',
    question: 'Why is constructor injection preferred over field injection?',
    answer: `Field injection (using @Autowired directly on a field) looks convenient but has real downsides:

1. Hidden dependencies — you can't tell what a class needs just by looking at its public API; you have to read every field.
2. Can't make fields final — so the class is technically mutable even though the dependency should never change after construction.
3. Hard to unit test without Spring — with plain JUnit/Mockito (no Spring context), you can't easily pass mocks into a field-injected class; you'd need reflection or a test-only Spring context.
4. Allows a partially-constructed object — Spring builds the bean, THEN injects fields, so there's a brief window (and a real risk in a constructor calling another method) where dependencies are still null.
5. Hides circular dependencies — field injection can silently succeed with a circular dependency using a workaround, whereas constructor injection FAILS FAST at startup, surfacing the design problem immediately instead of at runtime.

Constructor injection fixes all of this: dependencies are declared explicitly as constructor parameters, can be marked final (truly immutable, thread-safe by design), are guaranteed non-null the moment the object exists, and can be passed directly in plain unit tests with "new MyService(mockDep)" — no Spring context needed at all.`,
    code: `// Field injection — avoid this
@Service
class ReportService {
    @Autowired
    private PdfGenerator pdfGenerator; // hidden dependency, can't be final,
                                        // hard to unit test without a Spring context
}

// Constructor injection — preferred
@Service
class ReportServiceBetter {
    private final PdfGenerator pdfGenerator; // final = truly immutable

    public ReportServiceBetter(PdfGenerator pdfGenerator) { // dependency is explicit & required
        this.pdfGenerator = pdfGenerator;
    }
}

// Plain unit test, no Spring context needed at all:
@Test
void generatesReport() {
    PdfGenerator mockGenerator = mock(PdfGenerator.class);
    ReportServiceBetter service = new ReportServiceBetter(mockGenerator); // trivial to construct
    // ...assertions
}`,
    highlights: ['Constructor injection lets dependencies be final -> immutable and thread-safe', 'Guarantees the bean is never in a partially-initialized state', 'Trivial to unit test with plain "new" + mocks — no Spring context required', 'Surfaces circular dependencies at startup instead of hiding them'],
  },
  {
    id: 2609, category: 'Spring', difficulty: 'Senior',
    question: 'How does Spring create and manage beans (the IoC container)?',
    answer: `Spring's IoC container (an implementation of ApplicationContext, which extends the simpler BeanFactory) is responsible for the full lifecycle of every bean. At a high level:

1. On startup, Spring reads bean definitions — from @Component-annotated classes found via component scanning, @Bean methods in @Configuration classes, or (in older XML-based setups) XML config.
2. It builds a dependency graph from these definitions, figuring out what depends on what.
3. It instantiates beans (by default, eagerly, in dependency order, for singleton scope) and injects their dependencies (constructor/setter/field injection).
4. It runs any Aware callbacks and @PostConstruct / InitializingBean hooks.
5. The fully-initialized bean is placed in the container's internal cache (essentially a Map<String, Object>, keyed by bean name), ready to be handed out on every subsequent request/injection — for singleton scope, the SAME cached instance is returned every time.
6. On application shutdown, @PreDestroy / DisposableBean callbacks run to release resources (close connections, flush buffers, etc.).

ApplicationContext vs BeanFactory: BeanFactory is the low-level container (lazy bean initialization only, minimal features). ApplicationContext is what you actually use in a Spring Boot app — it extends BeanFactory and adds eager singleton initialization at startup, event publishing, internationalization, and easy integration with AOP — so problems like a missing dependency show up immediately at startup instead of on the first request.`,
    code: `@Configuration
class AppConfig {
    @Bean
    public PdfGenerator pdfGenerator() {
        return new PdfGenerator(); // Spring calls this once, caches the result
    }
}

// Under the hood, Spring Boot does roughly:
// ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
// 1. Scans for @Component/@Bean definitions
// 2. Resolves the dependency graph
// 3. Instantiates singleton beans eagerly, injecting dependencies
// 4. Caches each bean in an internal Map<String, Object>

PdfGenerator gen1 = context.getBean(PdfGenerator.class);
PdfGenerator gen2 = context.getBean(PdfGenerator.class);
System.out.println(gen1 == gen2); // true — same cached singleton instance returned both times`,
    highlights: ['ApplicationContext (extends BeanFactory) is the container you actually use in Spring Boot', 'Singleton beans are created eagerly at startup and cached in an internal bean registry', 'Container manages the full lifecycle: instantiate -> inject -> init callbacks -> use -> destroy callbacks'],
  },
  {
    id: 2610, category: 'Spring', difficulty: 'Senior',
    question: 'What is the self-invocation problem with @Transactional (and other Spring proxy-based features)?',
    answer: `Spring implements @Transactional (and @Async, @Cacheable, security annotations, etc.) using proxies — when a bean has one of these annotations, Spring wraps it in a proxy object at startup. When another bean calls a method on it, the call actually goes through the proxy first, which starts the transaction, then delegates to the real method.

The problem: if a method INSIDE the same class calls another @Transactional method on "this" (self-invocation), that call goes directly to the real object, completely bypassing the proxy. So the transactional behavior is silently skipped — no new transaction is started, no rollback happens on exception, exactly as if @Transactional weren't there at all. This is a very common, hard-to-notice bug.

Fixes: (1) split the method into a separate bean and call it through that bean (goes through the proxy correctly), or (2) inject the bean's own proxy via @Autowired/ApplicationContext and call through that, or (3) use AspectJ compile-time/load-time weaving instead of proxy-based AOP (rarely worth the complexity for most teams).`,
    code: `@Service
class OrderService {
    // BUG: calling saveOrder() from within processOrder() bypasses the proxy
    public void processOrder(Order order) {
        // ...some logic
        this.saveOrder(order); // self-invocation — @Transactional on saveOrder() is IGNORED here
    }

    @Transactional
    public void saveOrder(Order order) {
        // if an exception happens after this point, it will NOT roll back
        // when reached via self-invocation above
    }
}

// FIX 1: move the transactional method to a separate bean
@Service
class OrderWriter {
    @Transactional
    public void saveOrder(Order order) { /* ... */ }
}

@Service
class OrderServiceFixed {
    private final OrderWriter orderWriter;
    OrderServiceFixed(OrderWriter orderWriter) { this.orderWriter = orderWriter; }

    public void processOrder(Order order) {
        orderWriter.saveOrder(order); // goes through the PROXY correctly — transaction applies
    }
}`,
    highlights: ['@Transactional (and @Async, @Cacheable) work via Spring proxies wrapped around the bean', 'Calling a transactional method via "this" from inside the same class skips the proxy entirely', 'Fix: move the method to a separate bean, or call through the bean\u2019s own proxy'],
  },
  {
    id: 2611, category: 'API Design', difficulty: 'Junior',
    question: 'What are the common HTTP status codes and what do they mean?',
    answer: `HTTP status codes are grouped by their first digit, and interviewers usually want you to know these specific ones cold:

2xx — Success
• 200 OK — request succeeded, response body has the result (typical for GET/PUT).
• 201 Created — a new resource was successfully created (typical response for a successful POST); usually includes a Location header pointing to the new resource.
• 204 No Content — request succeeded, but there's nothing to return in the body (common for DELETE, or a PUT that doesn't need to echo data back).

4xx — Client errors (the caller did something wrong)
• 400 Bad Request — the request is malformed or fails validation (missing/invalid fields).
• 401 Unauthorized — the caller isn't authenticated at all (missing/invalid credentials — despite the name, this is really "unauthenticated").
• 403 Forbidden — the caller IS authenticated, but doesn't have permission for this action/resource.
• 404 Not Found — the resource/URL doesn't exist.

5xx — Server errors (something broke on the server side)
• 500 Internal Server Error — a generic, unhandled failure on the server; the client did nothing wrong.

Quick way to remember 401 vs 403: 401 = "who are you?", 403 = "I know who you are, but no."`,
    code: `// Typical Spring Boot REST controller mapping to these codes
@RestController
@RequestMapping("/api/documents")
class DocumentController {

    @PostMapping
    public ResponseEntity<Document> create(@Valid @RequestBody DocumentRequest req) {
        Document saved = documentService.save(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved); // 201
    }

    @GetMapping("/{id}")
    public ResponseEntity<Document> get(@PathVariable String id) {
        return documentService.find(id)
            .map(ResponseEntity::ok)                         // 200
            .orElse(ResponseEntity.notFound().build());       // 404
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        documentService.delete(id);
        return ResponseEntity.noContent().build();            // 204
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<String> handleForbidden() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not allowed"); // 403
    }
}`,
    highlights: ['2xx = success, 4xx = client\u2019s fault, 5xx = server\u2019s fault', '401 = not authenticated ("who are you?"); 403 = authenticated but not allowed ("no")', '201 for successful creation, 204 for success with no response body'],
  },
  {
    id: 2612, category: 'JWT', difficulty: 'Mid',
    question: 'What happens when a JWT access token expires?',
    answer: `A JWT carries its own expiry inside the token payload (the "exp" claim) — there's no server-side session to check, so expiry is enforced purely by the server validating that timestamp on every request.

What happens step by step:
1. Client sends a request with the expired access token in the Authorization header.
2. The server's JWT filter/interceptor decodes the token and checks "exp" against the current time.
3. Since it's in the past, the server rejects the request — typically with 401 Unauthorized — WITHOUT even checking the signature validity further; expiry is checked as part of standard validation.
4. The client is expected to catch this 401, and use a separate, longer-lived refresh token to request a new access token from a refresh endpoint (e.g. POST /auth/refresh), without forcing the user to log in again.
5. If the refresh token is also expired/invalid, the user is redirected to log in again from scratch.

This is why access tokens are usually kept short-lived (minutes) — since a JWT can't be individually revoked before it expires, a short lifespan limits the damage window if one is ever stolen. The refresh token (longer-lived, and stored/revocable server-side) is what allows a smooth experience without frequent re-logins.`,
    code: `// Client-side pattern: intercept 401s and try a silent refresh before giving up
async function apiFetch(url, options = {}) {
  let res = await fetch(url, { ...options, headers: authHeaders() });

  if (res.status === 401) {
    const refreshed = await tryRefreshToken(); // calls /auth/refresh with the refresh token
    if (refreshed) {
      res = await fetch(url, { ...options, headers: authHeaders() }); // retry once with new token
    } else {
      redirectToLogin(); // refresh token also invalid/expired
    }
  }
  return res;
}

// Server-side: JWT filter rejects expired tokens before the request even reaches the controller
// (Spring Security's JwtAuthenticationFilter throws ExpiredJwtException -> mapped to 401)`,
    highlights: ['Expiry ("exp" claim) is checked server-side on every request — no session lookup needed', 'An expired access token is rejected with 401; client uses a refresh token to get a new one silently', 'Short-lived access tokens limit damage since a JWT can\u2019t be revoked individually before it expires'],
  },
  {
    id: 2613, category: 'System Design', difficulty: 'Mid',
    question: 'What is service discovery in a microservices architecture?',
    answer: `In a microservices system, service instances are created and destroyed constantly (autoscaling, deployments, failures) and their IP addresses change every time — so you can't just hardcode "OrderService is at 10.0.0.5:8080". Service discovery solves this by keeping a live, queryable registry of "which service instances exist right now and where are they".

Two common patterns:
• Client-side discovery — each service instance registers itself with a registry (e.g. Netflix Eureka, Consul, Zookeeper) on startup and sends periodic heartbeats. When Service A wants to call Service B, it asks the registry for B's current healthy instances, then picks one itself (often with client-side load balancing).
• Server-side discovery — the caller just talks to a load balancer/API Gateway (e.g. Kubernetes Service + kube-proxy, AWS ALB, or a service mesh sidecar like Envoy), which looks up the registry and routes the request; the caller never sees individual instance addresses at all.

In practice, cloud-native stacks (Kubernetes) mostly do this for you via DNS-based Service objects, so many teams today don't run their own Eureka/Consul cluster — but the underlying registry-and-lookup concept is exactly the same.`,
    code: `// Client-side discovery example: Spring Cloud + Eureka
// 1. Each instance registers itself on startup (application.yml)
// eureka.client.serviceUrl.defaultZone: http://eureka-server:8761/eureka/

// 2. Calling another service by its logical NAME, not a hardcoded IP:
@Service
class OrderService {
    private final RestTemplate restTemplate; // @LoadBalanced

    Order enrichWithInventory(Order order) {
        // "inventory-service" is resolved via Eureka to a healthy instance's actual host:port
        Inventory inv = restTemplate.getForObject(
            "http://inventory-service/api/inventory/" + order.getSku(), Inventory.class);
        return order.withInventory(inv);
    }
}

// Kubernetes equivalent needs almost no code — DNS handles it:
// http://inventory-service.default.svc.cluster.local/api/inventory/{sku}`,
    highlights: ['Solves "where is this service instance right now" as instances scale up/down/restart', 'Client-side discovery: caller asks a registry (Eureka/Consul) then picks an instance itself', 'Server-side discovery: caller just hits a load balancer/gateway/service mesh — simpler for callers'],
  },
  {
    id: 2614, category: 'System Design', difficulty: 'Senior',
    question: 'What is the bulkhead pattern?',
    answer: `The bulkhead pattern isolates resources (thread pools, connection pools) PER dependency, so that one failing/slow downstream service can't exhaust resources needed by the rest of the system. The name comes from ship design — a ship's hull is divided into watertight bulkhead compartments, so a leak in one compartment doesn't sink the whole ship.

Without bulkheads: if all outgoing calls share one big thread pool, and one downstream dependency (say, a slow third-party API) starts hanging, requests pile up waiting on it, the shared pool fills up completely, and even calls to healthy, fast dependencies start failing — one slow dependency takes down the whole service. This is a very common real production outage pattern.

With bulkheads: each dependency (or group of related dependencies) gets its own dedicated, size-limited thread pool / connection pool / semaphore. If the slow dependency's pool fills up, only calls to THAT dependency are affected — calls to everything else keep flowing normally through their own separate pools.

Often paired with a circuit breaker: the bulkhead limits how much of your capacity a failing dependency can consume, and the circuit breaker stops sending it traffic altogether once it's clearly unhealthy.`,
    code: `// Resilience4j bulkhead example — isolate calls to a slow third-party service
BulkheadConfig config = BulkheadConfig.custom()
    .maxConcurrentCalls(10)       // only 10 concurrent calls to THIS dependency allowed
    .maxWaitDuration(Duration.ofMillis(500))
    .build();

Bulkhead paymentGatewayBulkhead = Bulkhead.of("paymentGateway", config);

Supplier<PaymentResult> decoratedCall = Bulkhead.decorateSupplier(
    paymentGatewayBulkhead,
    () -> paymentGatewayClient.charge(request)
);

// Even if paymentGateway is slow and its 10 slots are full,
// calls to inventoryService/notificationService use THEIR OWN separate bulkheads
// and are completely unaffected.`,
    highlights: ['Isolates resources (thread/connection pools) per downstream dependency', 'Prevents one slow/failing dependency from exhausting resources needed by everything else', 'Commonly paired with a circuit breaker for full resilience'],
  },
  {
    id: 2615, category: 'Banking Scenarios', difficulty: 'Senior',
    question: 'What is an idempotency key, and how would you use it to prevent a payment from being processed twice?',
    answer: `An idempotency key is a unique identifier (usually a UUID) that the CLIENT generates once and sends with a request. It lets the server recognize "this is the exact same operation I already handled" and safely return the original result instead of repeating the side effect — which is critical for payments, since a network timeout or a user double-clicking "Pay" must never charge them twice.

How it works end-to-end:
1. Client generates a UUID once per logical payment attempt and sends it in a header (e.g. Idempotency-Key: <uuid>) on every retry of that SAME attempt.
2. Server checks a store (a DB table or Redis) for that key BEFORE processing. If it's never been seen, the server processes the payment normally, then stores the key along with the result (and locks/marks it as "in-progress" first, to handle concurrent duplicate requests too).
3. If the key already exists and the payment finished, the server returns the SAME stored response immediately, without touching the payment logic again.
4. If the key exists but is still "in-progress" (a concurrent retry arrived while the first is still processing), the server rejects/holds the second request rather than running both in parallel.
5. Idempotency keys are typically stored with a TTL (e.g. 24 hours) since clients won't retry forever.

This is exactly how Stripe, Razorpay and most payment gateways design their charge APIs.`,
    code: `@PostMapping("/api/payments")
public ResponseEntity<PaymentResult> pay(
        @RequestHeader("Idempotency-Key") String idempotencyKey,
        @RequestBody PaymentRequest request) {

    // 1. Try to atomically claim this key (DB unique constraint or Redis SETNX)
    Optional<StoredResult> existing = idempotencyStore.findByKey(idempotencyKey);

    if (existing.isPresent()) {
        if (existing.get().isInProgress()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null); // still processing elsewhere
        }
        return ResponseEntity.ok(existing.get().getResult()); // return the ORIGINAL result — no re-charge
    }

    idempotencyStore.markInProgress(idempotencyKey); // claim it before doing any real work

    PaymentResult result = paymentService.charge(request); // the actual, side-effecting operation

    idempotencyStore.saveResult(idempotencyKey, result, Duration.ofHours(24));
    return ResponseEntity.ok(result);
}`,
    highlights: ['Client generates the key ONCE per logical attempt and reuses it on every retry', 'Server stores key -> result and returns the cached result on repeat requests instead of re-charging', 'Mark the key as in-progress first so concurrent duplicate requests don\u2019t both process'],
  },
  {
    id: 2616, category: 'Banking Scenarios', difficulty: 'Mid',
    question: 'How would you maintain an audit trail for financial transactions?',
    answer: `An audit trail is an immutable, chronological record of "who did what, when, and what changed" — required for financial systems both for debugging and for regulatory compliance (an auditor needs to be able to reconstruct exactly what happened to any transaction, months later).

Key design points:
• Append-only, never update/delete — audit records are written once and never modified. If a transaction is corrected, you add a NEW compensating record, you don't edit the old one — this preserves the true history.
• Capture the essentials on every record: who (user/service identity), what (action + entity type + entity id), when (timestamp, ideally UTC), before/after state (or a diff) where relevant, and a correlation/trace ID linking it to the originating request across services.
• Store separately from the transactional data — often a dedicated audit table/event store, or an append-only log (e.g. Kafka topic feeding a data warehouse), so a bug in the main application can't accidentally corrupt the audit history.
• Tamper-evidence for high-sensitivity systems — some banking systems add a hash chain (each record includes a hash of the previous record) so any retroactive tampering becomes detectable.`,
    code: `@Entity
@Table(name = "transaction_audit_log")
class TransactionAuditEntry {
    @Id
    private String id;               // audit record id (never reused)
    private String transactionId;    // links to the actual financial transaction
    private String action;           // e.g. "DEBIT_INITIATED", "DEBIT_COMPLETED", "REFUND_ISSUED"
    private String performedBy;      // user id or service name
    private Instant occurredAt;      // UTC timestamp
    private String correlationId;    // trace id shared across microservices for this request
    @Lob
    private String beforeState;      // JSON snapshot, nullable
    @Lob
    private String afterState;       // JSON snapshot
    // NOTE: no setters used after creation — records are write-once
}

// Written via an interceptor/aspect so every service call automatically logs an entry —
// application code never has to remember to call this manually, and can never skip it.
@Around("@annotation(Audited)")
public Object logAuditEntry(ProceedingJoinPoint pjp) throws Throwable {
    Object result = pjp.proceed();
    auditRepository.save(buildEntryFrom(pjp, result)); // append-only insert, no updates ever
    return result;
}`,
    highlights: ['Append-only — corrections add new records, existing ones are never edited', 'Capture who/what/when/before-after state, plus a correlation id for cross-service tracing', 'Store separately from live transactional data so it can\u2019t be silently altered'],
  },
  {
    id: 2617, category: 'Banking Scenarios', difficulty: 'Senior',
    question: 'How would you maintain data consistency between multiple microservices — what if the debit succeeds but the credit service fails?',
    answer: `This is the classic distributed-transaction problem: a fund transfer spans two services (AccountA's debit, AccountB's credit) that each have their own database, so you can't wrap both in a single ACID database transaction the way you could in a monolith.

The standard solution is the Saga pattern — break the transfer into a sequence of local transactions, each in its own service, coordinated so that if any step fails, PREVIOUS steps are undone by explicit compensating actions:

1. Debit service debits Account A, then publishes a "DebitCompleted" event.
2. Credit service listens for that event, credits Account B, and publishes "CreditCompleted".
3. If the credit step fails (Account B's service is down, validation fails, etc.), a compensating transaction runs: the debit service CREDITS Account A back (undoing the original debit) — not by "rolling back" a database transaction, but by explicitly performing the reverse business operation.

To make step 1 reliable (never lose the "please credit B" message even if the service crashes right after debiting), pair this with the Outbox pattern: write the debit AND an outbox row (containing the event to publish) in the SAME local database transaction, then a separate relay process reads the outbox table and publishes the event to Kafka/RabbitMQ — guaranteeing the event is never lost even if the process crashes right after committing.

The trade-off to be upfront about in an interview: this gives you eventual consistency, not immediate consistency — there's a brief window where the money has left Account A but hasn't yet arrived in Account B. For a banking system, that window is usually acceptable because it's measured in milliseconds/seconds and is always fully resolved (either both sides complete, or the debit is compensated).`,
    code: `// 1. Debit service — debit + outbox event written atomically in ONE local transaction
@Transactional
void debitAccount(String accountId, BigDecimal amount, String transferId) {
    accountRepository.debit(accountId, amount);
    outboxRepository.save(new OutboxEvent(transferId, "DEBIT_COMPLETED",
        toJson(new DebitCompletedPayload(accountId, amount, transferId))));
    // A separate relay process polls outboxRepository and publishes to Kafka —
    // guaranteed delivery even if the app crashes right after this commits.
}

// 2. Credit service — listens, credits, or triggers compensation on failure
@KafkaListener(topics = "debit-completed")
void onDebitCompleted(DebitCompletedPayload event) {
    try {
        accountRepository.credit(event.accountB(), event.amount());
        publish(new CreditCompletedEvent(event.transferId()));
    } catch (Exception e) {
        publish(new CreditFailedEvent(event.transferId())); // triggers compensation below
    }
}

// 3. Debit service — compensating transaction (undo the debit)
@KafkaListener(topics = "credit-failed")
void onCreditFailed(CreditFailedEvent event) {
    accountRepository.credit(event.accountA(), lookupOriginalAmount(event.transferId())); // reverse it
}`,
    highlights: ['No cross-service ACID transaction exists — use the Saga pattern: local steps + compensations', 'Outbox pattern guarantees the "credit me" event is never lost even if the debit service crashes', 'Result is eventual consistency: a brief in-flight window, always resolved via completion or compensation'],
  },
  {
    id: 2618, category: 'Banking Scenarios', difficulty: 'Senior',
    question: 'How would you handle a downstream service being unavailable during a payment flow?',
    answer: `You need a layered strategy — retrying blindly makes things worse (it can pile more load onto an already-struggling service), so combine several patterns:

1. Timeouts on every call — never wait forever; a hung call to a dead dependency should fail fast, not tie up your own threads/connections indefinitely.
2. Retry with exponential backoff (+ jitter) — for transient failures (a brief network blip), retry a few times with increasing delays (e.g. 200ms, 400ms, 800ms + random jitter) rather than hammering it immediately and repeatedly.
3. Circuit breaker — if failures keep happening past a threshold, "trip" the circuit and stop calling the dependency entirely for a cool-down period, failing fast instead of waiting on doomed calls; periodically send a test call through to see if it's recovered (half-open state).
4. Bulkhead — isolate this dependency's thread/connection pool so its unavailability can't exhaust resources needed by unrelated calls.
5. Fallback / graceful degradation — where possible, do something sensible instead of a hard failure: queue the payment for later processing, show the user "payment is being processed, we'll notify you," or serve cached/default data if the downstream call was for non-critical enrichment.
6. Idempotency — since retries can cause the request to actually reach the server even though the client thought it failed (timeout ≠ the server didn't process it), the operation must be safe to retry (see idempotency keys).

For something as critical as a payment specifically: if all retries + circuit breaker attempts are exhausted, don't silently fail — persist the payment as "pending" and process it asynchronously via a retry queue/scheduled job once the dependency recovers, and notify the user rather than losing the request.`,
    code: `// Resilience4j: timeout + retry + circuit breaker composed together
TimeLimiterConfig timeoutConfig = TimeLimiterConfig.custom()
    .timeoutDuration(Duration.ofSeconds(3)).build();

RetryConfig retryConfig = RetryConfig.custom()
    .maxAttempts(3)
    .intervalFunction(IntervalFunction.ofExponentialBackoff(200, 2)) // 200ms, 400ms, 800ms
    .retryExceptions(TimeoutException.class, IOException.class)
    .build();

CircuitBreakerConfig cbConfig = CircuitBreakerConfig.custom()
    .failureRateThreshold(50)                      // trip if 50%+ of recent calls fail
    .waitDurationInOpenState(Duration.ofSeconds(30)) // stay open (fail fast) for 30s, then test again
    .build();

Supplier<PaymentResult> call = () -> downstreamPaymentGateway.charge(request);
Supplier<PaymentResult> resilientCall = Decorators.ofSupplier(call)
    .withCircuitBreaker(CircuitBreaker.of("gateway", cbConfig))
    .withRetry(Retry.of("gateway", retryConfig))
    .withTimeLimiter(TimeLimiter.of(timeoutConfig), scheduledExecutor)
    .decorate();

try {
    return resilientCall.get();
} catch (Exception e) {
    paymentQueueService.enqueueForRetryLater(request); // fallback: don't lose the payment
    return PaymentResult.pending();
}`,
    highlights: ['Layer timeouts, retry-with-backoff, circuit breaker and bulkhead — never just "retry forever"', 'Idempotency is a prerequisite for safe retries — a timeout doesn\u2019t mean the server didn\u2019t process it', 'For payments specifically: fall back to a persisted "pending" state + async retry, never silently drop it'],
  },
  {
    id: 2619, category: 'Banking Scenarios', difficulty: 'Mid',
    question: 'How would you design retries so they don\'t cause duplicate transactions?',
    answer: `The key insight: retries are unavoidable in distributed systems (networks time out, services restart) — so the goal isn't to eliminate retries, it's to make the operation being retried safe to repeat. Two things make that possible together:

1. Idempotency keys — the client sends the same unique key on every retry of the same logical attempt. The server uses that key to detect "I've already handled this exact request" and returns the original result instead of processing it again (see the idempotency key pattern in detail).
2. Make the operation itself idempotent at the data level, not just at the API level — design writes so that repeating them has no additional effect. For example, instead of "increment balance by amount" (dangerous if run twice), use "set balance to X only if current version = Y" (an idempotent, versioned update) or check "does a transaction with this id already exist?" before inserting.

Also important: retries should ONLY happen for errors where you genuinely don't know the outcome (timeouts, connection resets, 5xx) — never blindly retry after a definitive response like a 400 Bad Request or a 402 Payment Declined, since retrying those wastes calls and can confuse the user without changing the outcome.`,
    code: `// Idempotent at the data level: guard the INSERT with a unique constraint on transactionId,
// so even if the same request is somehow processed twice, the DB itself rejects the duplicate.
@Transactional
PaymentResult processPayment(String idempotencyKey, PaymentRequest request) {
    try {
        Transaction txn = new Transaction(idempotencyKey, request.getAmount(), request.getAccountId());
        transactionRepository.save(txn); // idempotencyKey has a UNIQUE constraint in the DB
    } catch (DataIntegrityViolationException e) {
        // Unique constraint violation = this exact transaction already exists.
        // Not an error — it means a retry arrived; return the existing result.
        return transactionRepository.findByIdempotencyKey(idempotencyKey).toResult();
    }
    return doActualCharge(request);
}

// Client-side: only retry genuinely-ambiguous failures, never a definitive rejection
async function payWithRetry(request, idempotencyKey, attempt = 1) {
    try {
        return await callPaymentApi(request, idempotencyKey);
    } catch (err) {
        const retryable = err.code === 'TIMEOUT' || err.status >= 500;
        if (retryable && attempt < 3) {
            await sleep(2 ** attempt * 200);
            return payWithRetry(request, idempotencyKey, attempt + 1); // SAME idempotency key reused
        }
        throw err;
    }
}`,
    highlights: ['Idempotency key + a DB-level uniqueness guard together make repeats safe, even concurrent ones', 'Design writes to be idempotent (versioned/conditional updates) rather than "increment" style', 'Only retry ambiguous failures (timeouts, 5xx) — never retry a definitive rejection like 400/402'],
  },
  {
    id: 2620, category: 'Banking Scenarios', difficulty: 'Senior',
    question: 'How would you design transaction processing using the Saga / Outbox pattern?',
    answer: `This combines two patterns that solve different halves of the same problem in a multi-service transaction (e.g. a fund transfer, or an order that needs payment + inventory + shipping):

Saga pattern — handles the "what if a later step fails" problem. Break the overall business transaction into a sequence of local transactions, one per service, each followed by an event that triggers the next step. If any step fails, previously completed steps are undone via explicit COMPENSATING transactions (not a database rollback — a new operation that reverses the business effect, since each step already committed to its own database).
• Choreography style — each service listens for events and decides what to do next itself; no central coordinator. Simple for a few steps, but hard to see the overall flow as it grows.
• Orchestration style — a central saga orchestrator explicitly tells each service what to do and calls compensations in order on failure. More visible/debuggable, but adds a coordinating component.

Outbox pattern — handles the "what if we crash between committing our own change and publishing the event" problem. Instead of doing a DB write AND a separate message-broker publish as two independent operations (which can't be made atomic across two different systems), write the domain change AND an "outbox" row describing the event to publish, in the SAME local database transaction. A separate relay process (polling the outbox table, or using DB change-data-capture like Debezium) then reliably publishes each outbox row to Kafka/RabbitMQ and marks it as sent — guaranteeing the event is never lost, even if the process crashes right after the commit.

Put together: Saga defines the sequence-of-steps-with-compensations logic; Outbox guarantees that each step's "I'm done, trigger the next step" event is reliably delivered, so the saga can't get silently stuck.`,
    code: `// Orchestrated saga (simplified) for: debit account -> credit account -> notify user
class TransferOrchestrator {
    void transfer(TransferRequest req) {
        try {
            debitService.debit(req.fromAccount(), req.amount(), req.transferId());
            creditService.credit(req.toAccount(), req.amount(), req.transferId());
            notificationService.notify(req.userId(), "Transfer complete");
        } catch (CreditFailedException e) {
            debitService.compensateDebit(req.fromAccount(), req.amount(), req.transferId()); // undo step 1
        } catch (NotificationFailedException e) {
            // notification failing doesn't need a compensation — money movement already succeeded;
            // just retry the notification asynchronously instead of unwinding the transfer.
        }
    }
}

// Outbox: debit + "please credit" event recorded atomically, so it can never be silently lost
@Transactional
void debit(String accountId, BigDecimal amount, String transferId) {
    accountRepository.debit(accountId, amount);
    outboxRepository.save(new OutboxEvent(transferId, "CREDIT_REQUESTED", toJson(...)));
}
// A relay process (polling loop or Debezium CDC) publishes unsent outbox rows to Kafka
// and marks them sent, independent of application crashes/restarts.`,
    highlights: ['Saga = sequence of local transactions + explicit compensating actions on failure', 'Choreography (event-driven, no coordinator) vs Orchestration (central coordinator) — pick based on complexity', 'Outbox pattern guarantees each step\u2019s event is published exactly once, even across crashes'],
  },
  {
    id: 2621, category: 'Banking Scenarios', difficulty: 'Mid',
    question: 'How would you handle validation and transaction limits in a banking application?',
    answer: `Validation and limits need to be enforced at multiple layers — never rely on just one, because each layer catches different failure modes:

1. Input-level validation (fast, cheap, first line of defense) — required fields, correct types/formats, amount is positive and within a sane numeric range, account number format is valid. Done with bean validation annotations at the API boundary so malformed requests never even reach business logic.
2. Business-rule validation — per-transaction limit (e.g. max ₹2,00,000 per transfer), daily/monthly cumulative limit per account, minimum balance requirements, account status checks (frozen/closed accounts can't transact), currency/country restrictions. These need a DB read (current day's total, account status) so they can't be pure annotations — implemented as explicit service-layer checks.
3. Concurrency-safe enforcement — this is the part people often miss: if a user fires two transfers at nearly the same instant, checking "is today's total under the limit" and then writing the new transaction must be atomic, or both checks can pass before either write lands, silently exceeding the limit. Use a DB-level constraint/lock (SELECT ... FOR UPDATE on the daily-total row, or an optimistic version check) rather than a check-then-act pattern in application code alone.
4. Fail with a clear, specific error — "Daily transfer limit of ₹1,00,000 exceeded (₹85,000 already transferred today)" is far more useful than a generic 400, both for the user and for support/audit.

All of this should also feed the audit trail — a rejected transaction due to a limit breach is itself worth recording, since repeated limit-breach attempts can be a fraud signal.`,
    code: `record TransferRequest(
    @NotBlank String fromAccount,
    @NotBlank String toAccount,
    @Positive @DecimalMax("200000.00") BigDecimal amount // layer 1: input validation
) {}

@Service
class TransferValidator {
    void validate(TransferRequest req) {
        Account account = accountRepository.findByIdForUpdate(req.fromAccount()); // row lock

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new TransactionRejectedException("Account is " + account.getStatus());
        }

        BigDecimal todaysTotal = transactionRepository.sumTodaysDebits(req.fromAccount()); // within the SAME
        BigDecimal projectedTotal = todaysTotal.add(req.amount());                          // locked transaction
        if (projectedTotal.compareTo(account.getDailyLimit()) > 0) {
            throw new TransactionRejectedException(
                "Daily limit of " + account.getDailyLimit() + " exceeded ("
                + todaysTotal + " already transferred today)");
        }
        // Lock (findByIdForUpdate) held until the transaction commits — a concurrent
        // second transfer must wait, so both can't pass the limit check simultaneously.
    }
}`,
    highlights: ['Layer validation: input format -> business rules (limits, status) -> concurrency-safe enforcement', 'A naive check-then-write (without a lock) lets two concurrent transfers both slip past a limit', 'Give specific rejection reasons, and log rejected attempts to the audit trail as a fraud signal'],
  },
  {
    id: 2622, category: 'Banking Scenarios', difficulty: 'Mid',
    question: 'Why are immutability and thread safety important in banking applications?',
    answer: `Banking systems handle high-concurrency, high-stakes state (account balances, transaction records) where a subtle threading bug doesn't just crash something — it can silently create or destroy money, which is far worse than a visible crash.

Why immutability matters: an immutable object (final fields, no setters, a "wither" method returns a NEW instance instead of mutating in place) can be freely shared across threads with zero synchronization needed, because nothing can ever change its state after construction — there's no possibility of one thread reading a half-updated object while another thread is still writing to it. Representing a Transaction or Money value as immutable means once it's created, it's safe to pass around, cache, and log without any risk of it being altered later by a different part of the system (accidentally or maliciously).

Why thread safety matters beyond immutability: mutable shared state (an account balance being read-then-written by multiple concurrent requests) needs explicit protection, or you get classic race conditions: two concurrent transfers both read a balance of ₹1000, both independently compute "minus ₹800 = ₹200", and both write ₹200 — even though the two debits should have left the account with -₹600 (i.e., correctly rejected, or at ₹-600 if overdraft were allowed) — the second write silently overwrites the first, and ₹800 effectively evaporates from the books with no trace. This is exactly the kind of bug that's very hard to reproduce in testing (only shows up under real concurrent load) and catastrophic in production for a financial system, both for correctness and for audit/regulatory reasons.

The practical takeaway: prefer immutable value objects wherever possible (amounts, transaction records, DTOs), and where mutable shared state genuinely must exist (an account's balance), protect every read-modify-write with proper synchronization — a DB-level lock/optimistic version check (most common and most robust across multiple app instances) or, within a single JVM, synchronized/atomic types.`,
    code: `// Immutable value object — inherently thread-safe, safe to share/cache/log freely
final class Money {
    private final BigDecimal amount;
    private final String currency;
    Money(BigDecimal amount, String currency) { this.amount = amount; this.currency = currency; }
    Money add(Money other) { return new Money(amount.add(other.amount), currency); } // returns a NEW Money
    // no setters — once created, this object can never change
}

// UNSAFE: classic race condition on mutable shared state (lost update)
class UnsafeAccount {
    private BigDecimal balance;
    void debit(BigDecimal amount) {
        BigDecimal current = balance;              // Thread A and Thread B can both read 1000 here
        balance = current.subtract(amount);         // both compute 1000-800=200, second write wins — ₹800 lost
    }
}

// SAFE: DB-level optimistic locking protects the read-modify-write as one atomic unit
@Entity
class Account {
    @Version
    private long version; // JPA checks this on UPDATE — a concurrent modification throws
                           // OptimisticLockException instead of silently overwriting
    private BigDecimal balance;
}
// The failed transfer is then retried from scratch (fresh read) rather than corrupting the balance.`,
    highlights: ['Immutable objects need zero synchronization — nothing can change after construction', 'Mutable shared state (like a balance) needs explicit protection or you get silent lost updates', 'Prefer immutable value objects everywhere possible; protect real mutable state with DB-level locking/versioning'],
  },
  {
    id: 2623, category: 'Banking Scenarios', difficulty: 'Senior',
    question: 'How would you design an auditable, resilient REST API for a financial system?',
    answer: `This question is really asking you to combine several things you'd cover individually into one coherent design. A good answer touches all of these layers, briefly:

1. Authentication & authorization — OAuth2/JWT-based auth, fine-grained authorization (role/permission checks, not just "logged in or not") on every endpoint, since a financial API is a prime target.
2. Input validation — strict schema validation at the boundary (bean validation), rejecting malformed/out-of-range requests before they touch business logic.
3. Idempotency — every state-changing endpoint (POST/PUT) accepts an idempotency key, so retries from flaky networks/client bugs can never double-process.
4. Auditability — every request that changes state writes an immutable audit log entry (who, what, when, before/after, correlation id) — ideally via a cross-cutting interceptor/aspect so it can't be forgotten on a new endpoint.
5. Resilience — timeouts + retry-with-backoff + circuit breaker + bulkhead on every outbound call to a downstream/dependency, so one failing dependency degrades gracefully instead of cascading.
6. Consistency strategy — where the operation spans multiple services/databases, use Saga + Outbox rather than assuming a single ACID transaction; be explicit about what's eventually consistent and for how long.
7. Observability — structured logging with a correlation/trace ID propagated across every service hop, metrics (latency, error rate, saturation) per endpoint and per downstream dependency, and distributed tracing (e.g. OpenTelemetry) so a slow/failed request can be followed end-to-end.
8. Rate limiting & abuse protection — per-client/per-IP rate limits, especially on sensitive endpoints (login, payment initiation), to blunt both accidental retry storms and deliberate abuse.
9. Clear, consistent error responses — a standard error envelope (code, message, correlation id) across the whole API, using proper HTTP status codes, so clients and support can reliably act on failures.

In an interview, structure the answer this way (layer by layer) rather than jumping straight to code — it shows you're thinking about the system holistically, which is exactly what's being tested for a senior-leaning question like this.`,
    code: `// A single request handler that shows several of these layers working together
@PostMapping("/api/v1/transfers")
public ResponseEntity<TransferResult> transfer(
        @RequestHeader("Idempotency-Key") String idempotencyKey,          // 3. idempotency
        @Valid @RequestBody TransferRequest request,                       // 2. validation
        @AuthenticationPrincipal UserPrincipal user) {                     // 1. auth

    MDC.put("correlationId", UUID.randomUUID().toString());                // 7. observability

    return idempotencyService.executeOnce(idempotencyKey, () -> {
        auditService.logAttempt(user, request);                            // 4. auditability

        TransferResult result = resilientTransferExecutor.execute(request); // 5. resilience (circuit
                                                                              //    breaker + retry inside)
        auditService.logOutcome(user, request, result);                    // 4. auditability
        return ResponseEntity.ok(result);
    });
}
// Cross-cutting concerns (auth, rate limiting, correlation id, structured error envelope)
// are typically applied as filters/interceptors so every endpoint gets them automatically.`,
    highlights: ['Combine auth, validation, idempotency, audit logging, resilience patterns and observability as layers', 'Auditability should be enforced via a cross-cutting mechanism (aspect/filter), not per-endpoint discipline', 'Structure your interview answer layer-by-layer — it demonstrates systems thinking, not just a single trick'],
  },
  {
    id: 2624, category: 'Behavioral', difficulty: 'Mid',
    question: 'How would you explain your project experience to a banking/insurance client interviewer?',
    answer: `The goal is to translate your day-to-day technical work into language that shows you understand WHY it mattered to the business, not just what you built. A simple structure that works well:

1. Context first, briefly — who the client is (without over-sharing confidential specifics), what the system does, and your role/scope. Keep this to 2-3 sentences; don't make the interviewer wait for the substance.
2. The problem or responsibility — what specifically were you responsible for, and why did it matter for this kind of domain? For example, for a document management platform in insurance: reliability and correctness matter because a lost or corrupted policy document has real regulatory/customer-trust consequences, not just an inconvenience.
3. What you actually did (STAR-style: Situation, Task, Action, Result) — pick 2-3 concrete examples rather than a vague summary. Be specific about YOUR contribution ("I designed/built/debugged X") vs. the team's ("we shipped Y") — interviewers are evaluating you, not your team.
4. Connect it to domain concerns the client cares about — for a banking/insurance/financial client specifically, proactively mention how your work touched things like: data correctness and validation, auditability/traceability, security (auth, data handling of sensitive documents), reliability under load, and safe deployment practices (canary deployments, rollback strategy) — even if the interviewer didn't ask directly, this shows you understand what "good" means in a regulated domain, not just that you can write code.
5. What you learned / how you grew — briefly, shows self-awareness and continuous improvement, which matters more in senior-leaning roles.

A concrete framing example (adapt to your own real details): "I work on an insurance document management platform for [client] — my focus is the React/TypeScript frontend, including how documents move through review and approval states. One thing I focused on was making sure state transitions couldn't be triggered out of order by a slow network response or a double-click, since an incorrectly-applied status on a policy document isn't just a UI bug in this domain — it's a data-integrity issue. We used canary deployments in our CI/CD pipeline specifically so a bad release only reaches a small slice of traffic before it's caught."`,
    code: `// Not code — a reusable structure/checklist for the answer itself:

// 1. Context      -> client + system + your role (2-3 sentences)
// 2. Responsibility -> what you owned, and why it matters in THIS domain
// 3. STAR example  -> Situation / Task / Action(you specifically) / Result
// 4. Domain tie-in -> correctness, auditability, security, reliability, safe deploys
// 5. Growth        -> one honest thing you learned / would do differently

// Tip: prepare 2-3 STAR examples in advance covering different angles —
// (a) a bug you diagnosed and fixed, (b) a feature you designed end-to-end,
// (c) a time you improved reliability/performance/process —
// so you're not improvising the structure live in the interview.`,
    highlights: ['Structure: context -> your specific responsibility -> STAR example(s) -> domain tie-in -> growth', 'Say "I" for your own contribution, not just "we" — the interviewer is evaluating you', 'For banking/insurance, explicitly connect your work to correctness, auditability, security and reliability'],
  },
  {
    id: 2625, category: 'JavaScript', difficulty: 'Junior',
    question: 'How do you count duplicate numbers in an array?',
    answer: `Use a Map (or plain object) to build a frequency count in one pass — for each number, increment its count. Then filter for entries whose count is greater than 1. This is O(n) time and O(n) space, and gives you both WHICH numbers are duplicated and HOW MANY times each one appears — more information than just returning a list of duplicated values.`,
    code: `function countDuplicates(arr) {
  const counts = new Map();
  for (const num of arr) {
    counts.set(num, (counts.get(num) || 0) + 1);
  }

  const duplicates = new Map();
  for (const [num, count] of counts) {
    if (count > 1) duplicates.set(num, count);
  }
  return duplicates;
}

console.log(countDuplicates([1, 2, 3, 4, 3, 2, 9, 7, 4, 9, 8, 2, 4]));
// Map(4) { 2 => 3, 3 => 2, 4 => 3, 9 => 2 }
// -> 2 appears 3 times, 3 appears twice, 4 appears 3 times, 9 appears twice`,
    highlights: ['Build a frequency Map in a single pass — O(n) time', 'Filter for entries with count > 1 to get duplicates AND their counts', 'A Map (not a plain object) safely handles any key type, including numbers, without coercion surprises'],
  },
  {
    id: 2626, category: 'JavaScript', difficulty: 'Junior',
    question: 'How do you count duplicate characters in a string?',
    answer: `Same idea as counting duplicate numbers in an array — split the string into characters, build a frequency Map in one pass, then filter for characters whose count is greater than 1. O(n) time, O(1) extra space in practice (bounded by the character set size).`,
    code: `function countDuplicateChars(str) {
  const counts = new Map();
  for (const ch of str) {
    counts.set(ch, (counts.get(ch) || 0) + 1);
  }

  const duplicates = new Map();
  for (const [ch, count] of counts) {
    if (count > 1) duplicates.set(ch, count);
  }
  return duplicates;
}

console.log(countDuplicateChars('programming'));
// Map(3) { 'r' => 2, 'g' => 2, 'm' => 2 }
// -> 'r', 'g', and 'm' each appear twice in "programming"`,
    highlights: ['Identical pattern to counting duplicate array elements — build a frequency Map, filter count > 1', 'O(n) time; space is bounded by the number of distinct characters', "Use for...of on the string so it iterates by character, not by index"],
  },
  {
    id: 2627, category: 'System Design', difficulty: 'Junior',
    question: 'What is the HTTP request lifecycle — what happens when you hit Enter on a URL?',
    answer: `This is a classic "walk me through what happens" question. A good answer covers these stages, roughly in order:

1. URL parsing — the browser parses the URL into protocol, host, port, path and query string.
2. DNS resolution — the hostname (e.g. api.example.com) is resolved to an IP address, checking the browser cache, OS cache, then the DNS resolver/root servers if needed.
3. TCP connection — a TCP handshake (SYN, SYN-ACK, ACK) establishes a connection to the server's IP on the target port.
4. TLS handshake (for HTTPS) — client and server negotiate encryption, exchange certificates, and establish a secure channel before any HTTP data is sent.
5. HTTP request sent — the browser sends the request line (method + path), headers (Host, Authorization, Accept, cookies, etc.), and body if applicable.
6. Server processes the request — routes to the right handler/controller, runs middleware (auth, validation), executes business logic, possibly calls a database/downstream services.
7. HTTP response sent back — status line (e.g. 200 OK), response headers (Content-Type, cache headers), and the response body.
8. Browser processes the response — for an HTML page: parses HTML, builds the DOM, discovers and fetches additional resources (CSS, JS, images) — each of which repeats a version of steps 2-7 — then renders/paints the page, and executes JavaScript.

Connection reuse: modern browsers keep the TCP+TLS connection alive (HTTP keep-alive) and reuse it for subsequent requests to the same host, so steps 3-4 usually only happen once per host, not on every single request.`,
    code: `// Simplified timeline for a browser request to https://api.example.com/users

// 1. Parse URL:        protocol=https, host=api.example.com, path=/users
// 2. DNS lookup:        api.example.com -> 93.184.216.34  (cached after first lookup)
// 3. TCP handshake:      SYN -> SYN-ACK -> ACK             (~1 round trip)
// 4. TLS handshake:      cert exchange, key negotiation      (~1-2 round trips)
// 5. HTTP request sent:
//      GET /users HTTP/1.1
//      Host: api.example.com
//      Authorization: Bearer <token>
//      Accept: application/json
// 6. Server: routing -> middleware (auth) -> controller -> DB query -> build response
// 7. HTTP response received:
//      HTTP/1.1 200 OK
//      Content-Type: application/json
//      [ { "id": 1, "name": "Alice" }, ... ]
// 8. Browser: JSON parsed by JS (fetch().then(res => res.json())), used to update the DOM

// Connection reuse: the same TCP+TLS connection from steps 3-4 is kept alive
// and reused for the NEXT request to api.example.com — no repeat handshake needed.`,
    highlights: ['URL parse -> DNS resolve -> TCP handshake -> TLS handshake (HTTPS) -> request -> response -> render', 'TCP+TLS connections are reused (keep-alive) across requests to the same host', 'For an HTML page, rendering itself triggers a fresh round of these steps for every linked resource'],
  },
  {
    id: 2628, category: 'JavaScript', difficulty: 'Junior',
    question: 'How do you convert a camelCase string like "searchBoxText" into snake_case like "search_Box_Text"?',
    answer: `Use a regular expression to find each uppercase letter and insert an underscore right before it, leaving the case of the letters themselves unchanged (this matches the exact transformation in the example: only underscores are inserted, capitalization is preserved as-is). If you instead want FULL snake_case with every letter lowercased (search_box_text), add a .toLowerCase() at the end.`,
    code: `function camelToSnakeKeepCase(str) {
  // Insert "_" before every uppercase letter
  return str.replace(/([A-Z])/g, '_$1');
}

console.log(camelToSnakeKeepCase('searchBoxText'));
// "search_Box_Text"   <- matches the exact example: underscores inserted, casing preserved

// If you want fully-lowercased snake_case instead:
function camelToSnakeLower(str) {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}
console.log(camelToSnakeLower('searchBoxText'));
// "search_box_text"

// Reverse direction, for completeness (snake_case -> camelCase):
function snakeToCamel(str) {
  return str.replace(/_([a-zA-Z])/g, (_, ch) => ch.toUpperCase());
}
console.log(snakeToCamel('search_box_text')); // "searchBoxText"`,
    highlights: ['/([A-Z])/g finds every uppercase letter; "_$1" re-inserts it with an underscore prefix', 'Preserves original casing by default — add .toLowerCase() for fully-lowercased snake_case', 'The reverse (snake_case -> camelCase) uses a similar regex replacing "_x" with the uppercased "X"'],
  },
  {
    id: 2629, category: 'HTML/CSS', difficulty: 'Junior',
    question: 'What is <!DOCTYPE html> and why is it needed?',
    answer: 'The doctype is a declaration, not an HTML element. It tells the browser to use standards mode; without it, browsers may use quirks mode and render the page with legacy layout behavior. For modern HTML, <!DOCTYPE html> is the short HTML5 declaration and belongs before the <html> element.',
    code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Page title</title>
  </head>
  <body></body>
</html>`,
    highlights: ['A declaration, not an HTML element', 'Enables standards mode and avoids quirks mode', 'Place it at the start of the document'],
  },
  {
    id: 2630, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is an API, and how does JavaScript use APIs to communicate with other software?',
    answer: 'An API (Application Programming Interface) is a defined contract for how one piece of software can request data or actions from another. JavaScript uses browser APIs such as the DOM and Fetch, as well as web-service APIs exposed over HTTP. A web API defines endpoints, accepted inputs, response formats, and error behavior.',
    code: `const response = await fetch('/api/users');
const users = await response.json();
console.log(users);`,
    highlights: ['An API is a contract, not necessarily a network service', 'Browser APIs expose capabilities such as DOM and Fetch', 'HTTP APIs commonly exchange JSON'],
  },
  {
    id: 2631, category: 'JavaScript', difficulty: 'Mid',
    question: 'How do you handle errors in Fetch API requests?',
    answer: 'Fetch rejects for network failures, but an HTTP error such as 404 or 500 still resolves to a Response. Check response.ok (or status) and throw an error for unsuccessful status codes, then catch network, status, and parsing failures at the call site so the UI can show an appropriate error or retry state.',
    code: `async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Request failed: ' + response.status + ' ' + response.statusText);
  }
  return response.json();
}

try {
  const data = await fetchJson('/api/users');
  console.log(data);
} catch (error) {
  console.error('Could not load users:', error);
}`,
    highlights: ['Fetch does not reject just because the server returned 4xx or 5xx', 'Check response.ok before parsing the body', 'Handle network, HTTP, and JSON parsing errors'],
  },
  {
    id: 2632, category: 'JavaScript', difficulty: 'Junior',
    question: 'How do you send JSON data in a POST request with the Fetch API?',
    answer: 'Pass method: POST, set Content-Type to application/json, and serialize the payload with JSON.stringify in the request body. Check response.ok because Fetch does not treat HTTP error statuses as rejected promises.',
    code: `const response = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Ava' }),
});

if (!response.ok) {
  throw new Error('Request failed: ' + response.status);
}

const createdUser = await response.json();`,
    highlights: ['Set the HTTP method and JSON content type', 'Serialize the body with JSON.stringify', 'Check the response status before using the result'],
  },
  {
    id: 2633, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is the difference between map(), filter(), and find()?',
    answer: 'map() transforms every element and returns a same-length array. filter() returns a new array containing every element that passes a predicate. find() returns the first matching element, or undefined if there is no match. These methods do not mutate the original array by themselves.',
    code: `const values = [1, 2, 3, 4];
const doubled = values.map(value => value * 2);       // [2, 4, 6, 8]
const evens = values.filter(value => value % 2 === 0); // [2, 4]
const firstEven = values.find(value => value % 2 === 0); // 2`,
    highlights: ['map transforms every item', 'filter returns all matches', 'find returns only the first match or undefined'],
  },
  {
    id: 2634, category: 'JavaScript', difficulty: 'Junior',
    question: 'How do forEach() and map() differ in JavaScript?',
    answer: 'Both visit array elements, but map() returns a new array containing each callback result and is best for transformations. forEach() returns undefined and is intended for side effects such as logging or updating an external accumulator. Use map() when the transformed values are needed later.',
    code: `const numbers = [1, 2, 3];
const doubled = numbers.map(number => number * 2); // [2, 4, 6]

numbers.forEach(number => console.log(number)); // logs each value`,
    highlights: ['map returns a transformed array', 'forEach returns undefined', 'Prefer map for transformations and forEach for side effects'],
  },
  {
    id: 2635, category: 'JavaScript', difficulty: 'Mid',
    question: 'What are WeakMap and WeakSet, and when should you use them?',
    answer: 'WeakMap stores values under object keys, and WeakSet stores object values. Their references are weak, so an entry does not keep an otherwise unreachable object alive. They are not enumerable and do not expose size, which makes them useful for object-associated metadata or membership tracking when iteration is not needed.',
    code: `const metadata = new WeakMap();
const visited = new WeakSet();

const node = {};
metadata.set(node, { source: 'cache' });
visited.add(node);

console.log(metadata.get(node)); // { source: 'cache' }
console.log(visited.has(node));  // true`,
    highlights: ['WeakMap keys and WeakSet values must be objects', 'Entries do not prevent garbage collection of otherwise unreachable objects', 'They cannot be iterated; use Map or Set when enumeration is required'],
  },
  {
    id: 2636, category: 'React', difficulty: 'Mid',
    question: 'How are the browser DOM, React Virtual DOM, and Shadow DOM different?',
    answer: 'The browser DOM is the live tree of nodes rendered by the browser. React’s Virtual DOM is an in-memory representation React compares between renders to determine updates to the browser DOM. Shadow DOM is a browser feature that creates an encapsulated subtree for a web component, including scoped styles; it is not React’s rendering diff mechanism.',
    highlights: ['Browser DOM is the rendered document tree', 'Virtual DOM is React’s in-memory representation used during reconciliation', 'Shadow DOM encapsulates a web component’s markup and styles'],
  },
  {
    id: 2637, category: 'React', difficulty: 'Junior',
    question: 'What do constructor(), super(props), and render() do in a React class component?',
    answer: 'A class component constructor can initialize state and bind methods. It must call super(props) before using this; this invokes the React.Component constructor and makes props available on the instance. render() returns the React elements for the current UI. In modern React, function components and Hooks are generally preferred for new code.',
    code: `class Greeting extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ready: true };
  }

  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}`,
    highlights: ['Call super(props) before accessing this in the constructor', 'Initialize class state in the constructor when needed', 'render() describes the UI; it should remain free of side effects'],
  },
  {
    id: 2638, category: 'React', difficulty: 'Mid',
    question: 'How do useState, useContext, and useReducer differ?',
    answer: 'useState manages a value with a setter and is suited to straightforward local state. useReducer manages state through a reducer and dispatched actions, which can make complex transitions easier to organize. useContext reads a value provided by an ancestor; it shares data but does not itself define how that data changes. Context can expose a reducer’s state and dispatch across a subtree.',
    code: `const [name, setName] = useState('Ava');
const theme = useContext(ThemeContext);
const [state, dispatch] = useReducer(reducer, initialState);`,
    highlights: ['useState updates a local value directly', 'useReducer centralizes more complex state transitions', 'useContext reads shared provider data; it is not a state-update mechanism by itself'],
  },
  {
    id: 2639, category: 'JavaScript', difficulty: 'Junior',
    question: 'How does a Promise differ from a callback for handling asynchronous work?',
    answer: 'A callback is a function passed to another function to run later; deeply nested callbacks can make sequencing and error handling difficult. A Promise represents a future result and supports chaining with then/catch/finally, while async/await provides syntax for writing Promise-based flows in a sequential style. Promises do not make work synchronous; they make its completion and errors easier to compose.',
    code: `// Callback style
getUser(id, user => {
  getOrders(user.id, orders => console.log(orders));
});

// Promise style
getUser(id)
  .then(user => getOrders(user.id))
  .then(orders => console.log(orders))
  .catch(console.error);`,
    highlights: ['Callbacks are functions invoked later; Promises represent eventual outcomes', 'Promise chains make sequencing and error propagation explicit', 'async/await is syntax built on Promises'],
  },
  {
    id: 2640, category: 'JavaScript', difficulty: 'Junior',
    question: 'What are the main Promise instance methods and static methods?',
    answer: 'Instance methods operate on a Promise: then() handles fulfillment and returns a new Promise, catch() handles rejection, and finally() runs cleanup after settlement. Static methods create or combine promises: resolve() and reject() create settled promises, while all(), allSettled(), race(), and any() coordinate multiple promises with different success and failure rules.',
    code: `Promise.resolve('saved')
  .then(value => console.log(value))
  .catch(error => console.error(error))
  .finally(() => console.log('request complete'));

const results = await Promise.all([loadProfile(), loadSettings()]);`,
    highlights: ['then, catch, and finally are instance methods', 'resolve and reject create promises', 'all, allSettled, race, and any combine multiple promises'],
  },
  {
    id: 2641, category: 'React', difficulty: 'Mid',
    question: 'How does Suspense work with data fetching in React?',
    answer: 'A Suspense boundary shows its fallback when a descendant suspends while rendering. Data fetching in an ordinary useEffect does not suspend automatically; the data source must integrate with Suspense, such as a supported framework or data library. React.lazy also suspends while a component module loads. Keep the loading boundary near the UI that can wait, and use an error boundary for failures.',
    code: `function ProfilePage() {
  return (
    <Suspense fallback={<p>Loading profile...</p>}>
      <Profile />
    </Suspense>
  );
}

// Profile must read from a Suspense-enabled data source.
// A fetch started inside useEffect alone does not activate this fallback.`,
    highlights: ['Suspense displays a fallback when a child suspends during render', 'A plain useEffect fetch does not suspend by itself', 'Use an error boundary separately to handle failed requests'],
  },
  {
    id: 2642, category: 'React', difficulty: 'Mid',
    question: 'What is an optimistic UI update, and how should failures be handled?',
    answer: 'An optimistic update immediately reflects a likely successful user action before the server responds, making the interface feel faster. Keep enough prior state to roll the change back if the request fails; on success, reconcile with the server response. For overlapping updates, use request identifiers or cache patch mechanisms so an older failure does not undo a newer change.',
    code: `const previous = queryClient.getQueryData(['todos']);
queryClient.setQueryData(['todos'], current => [...current, newTodo]);

try {
  const saved = await createTodo(newTodo);
  queryClient.setQueryData(['todos'], current =>
    current.map(todo => todo.id === newTodo.id ? saved : todo)
  );
} catch (error) {
  queryClient.setQueryData(['todos'], previous);
  throw error;
}`,
    highlights: ['Update the UI before the request finishes', 'Reconcile with the server response on success', 'Restore prior state on failure without overwriting newer updates'],
  },
  {
    id: 2643, category: 'React', difficulty: 'Senior',
    question: 'How do React transitions work with Suspense boundaries?',
    answer: 'A transition marks an update as non-urgent. If that update causes a Suspense-enabled child to suspend, React can keep already revealed content visible instead of immediately replacing it with the boundary fallback. Use the boundary for genuinely new or not-yet-loaded content, and use the transition pending flag for lightweight progress feedback.',
    code: `const [isPending, startTransition] = useTransition();

function openReports() {
  startTransition(() => setTab('reports'));
}

return (
  <>
    <button onClick={openReports}>Reports</button>
    {isPending && <span>Updating...</span>}
    <Suspense fallback={<p>Loading reports...</p>}>
      <TabContent tab={tab} />
    </Suspense>
  </>
);`,
    highlights: ['Transitions mark non-urgent state updates', 'Suspense boundaries provide fallbacks for suspended content', 'Transitions can keep already revealed content visible while new content loads'],
  },
  {
    id: 2644, category: 'Node.js', difficulty: 'Mid',
    question: 'How would you use caching to improve performance in a MERN application?',
    answer: 'Cache at the layer that matches the data: use browser or CDN caching for static assets, a client data library for recently fetched API results, and a shared server-side cache such as Redis for expensive, frequently read database results. Set an appropriate TTL and invalidate or update entries after writes. Scope user-specific data by identity and never expose private responses through a shared public cache.',
    code: `const key = 'user:' + req.user.id;
const cached = await redis.get(key);

if (cached) return res.json(JSON.parse(cached));

const user = await User.findById(req.user.id).lean();
await redis.set(key, JSON.stringify(user), { EX: 60 });
return res.json(user);`,
    highlights: ['Use CDN/browser, client-query, and server-side caches for different data', 'Choose TTL and invalidate cached values when writes change the source', 'Keep personalized data isolated from shared public caches'],
  },
  {
    id: 2645, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is implicit type coercion in JavaScript, and when can it cause bugs?',
    answer: 'Implicit coercion is JavaScript converting a value to another type as part of an operation. For example, + concatenates if either operand becomes a string, while arithmetic operators usually convert strings to numbers. Prefer strict equality and explicit conversion at boundaries so the conversion is visible and validated.',
    code: `console.log('8' + 2); // "82"\nconsole.log('8' - 2); // 6\n\nconst input = '8';\nconst quantity = Number(input);\nif (Number.isFinite(quantity)) console.log(quantity + 2); // 10`,
    highlights: ['The same value can behave differently with different operators', 'Use === to avoid equality coercion', 'Convert and validate input explicitly'],
  },
  {
    id: 2646, category: 'JavaScript', difficulty: 'Junior',
    question: 'When should you use for...in versus for...of?',
    answer: 'for...in iterates enumerable property keys and is suited to inspecting object properties; it can also include inherited enumerable keys. for...of iterates values from an iterable such as an array, string, Map, or Set. For object key/value pairs, Object.entries() makes the intended scope explicit.',
    code: `const settings = { theme: 'dark', density: 'compact' };\nfor (const [key, value] of Object.entries(settings)) {\n  console.log(key, value);\n}\n\nfor (const letter of 'JS') console.log(letter);`,
    highlights: ['for...in yields keys', 'for...of yields iterable values', 'Use Object.entries() for an object’s own key/value pairs'],
  },
  {
    id: 2647, category: 'JavaScript', difficulty: 'Mid',
    question: 'Why can decimal arithmetic be imprecise in JavaScript, and when should you use BigInt?',
    answer: 'The Number type uses IEEE-754 binary floating point, so many decimal fractions cannot be represented exactly. BigInt supports integers larger than Number.MAX_SAFE_INTEGER, but it cannot be mixed directly with Number and does not represent fractional values. For money, use integer minor units or a decimal arithmetic library rather than relying on floating-point equality.',
    code: `console.log(0.1 + 0.2); // 0.30000000000000004\nconsole.log(Number.MAX_SAFE_INTEGER);\nconst largeId = 9007199254740993n;\nconsole.log(largeId + 1n); // BigInt arithmetic`,
    highlights: ['Floating-point fractions may have rounding error', 'BigInt is for large integers, not decimals', 'Use minor units or decimal arithmetic for currency'],
  },
  {
    id: 2648, category: 'JavaScript', difficulty: 'Mid',
    question: 'How should JavaScript applications handle dates and time zones?',
    answer: 'A Date represents an instant as milliseconds from the Unix epoch; it does not retain the original time-zone name. Local getters format that instant using the host time zone, while UTC getters use UTC. Exchange ISO 8601 timestamps with an explicit offset, and format for a user only at the presentation boundary.',
    code: `const instant = new Date('2026-09-28T12:00:00Z');\nconsole.log(instant.toISOString());\nconsole.log(instant.getUTCDate());\nconsole.log(new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(instant));`,
    highlights: ['A Date stores an instant, not a named time zone', 'Use explicit offsets in serialized timestamps', 'Separate UTC data handling from local display formatting'],
  },
  {
    id: 2649, category: 'JavaScript', difficulty: 'Mid',
    question: 'How do named exports, default exports, and dynamic imports differ in JavaScript modules?',
    answer: 'A named export exposes one or more explicitly named bindings; a default export identifies one primary value for the module. Static imports are resolved before the module runs and are easy for build tools to analyze. Dynamic import() loads a module on demand and returns a Promise, which is useful for optional or route-level features.',
    code: `// math.js\nexport const double = value => value * 2;\nexport default function clamp(value, max) {\n  return Math.min(value, max);\n}\n\n// app.js\nimport clamp, { double } from './math.js';\nconst loadChart = () => import('./chart.js');`,
    highlights: ['Named exports are imported by their exported name', 'A module has at most one default export', 'Dynamic import returns a Promise and can split code'],
  },
  {
    id: 2650, category: 'JavaScript', difficulty: 'Mid',
    question: 'How do regular-expression flags and capture groups work in JavaScript?',
    answer: 'A regular expression describes a text pattern. Flags modify matching behavior: i ignores case, g finds repeated matches, and m changes how line anchors behave. Parentheses create capture groups that can be read from match results or referenced in a replacement. Anchor validation patterns when the whole input must match.',
    code: `const pattern = /^(\\w+)-(\\d+)$/i;\nconst match = 'order-482'.match(pattern);\nif (match) {\n  console.log(match[1]); // "order"\n  console.log(match[2]); // "482"\n}\nconsole.log('a   b'.replace(/\\s+/g, ' ')); // "a b"`,
    highlights: ['Flags control case, repetition, and line matching', 'Parenthesized groups capture matched substrings', 'Use anchors when validating an entire value'],
  },
  {
    id: 2651, category: 'JavaScript', difficulty: 'Mid',
    question: 'How do try, catch, and finally behave with synchronous errors and Promises?',
    answer: 'A try block catches synchronous exceptions thrown while it runs. In async code, await a Promise inside try so its rejection is thrown at that point and can be caught. A Promise that is started but not awaited will reject later outside that synchronous try block. finally runs after either success or failure and is best reserved for cleanup.',
    code: `async function readConfig() {\n  try {\n    const response = await fetch('/config.json');\n    if (!response.ok) throw new Error('Request failed');\n    return await response.json();\n  } catch (error) {\n    console.error('Could not load config', error);\n    throw error;\n  } finally {\n    console.log('Request finished');\n  }\n}`,
    highlights: ['await a Promise inside try/catch to catch its rejection', 'A detached Promise can reject after the try block ends', 'Use finally for cleanup on either outcome'],
  },
  {
    id: 2652, category: 'JavaScript', difficulty: 'Junior',
    question: 'What is the difference between DOMContentLoaded and the window load event?',
    answer: 'DOMContentLoaded fires after the HTML has been parsed and deferred/module scripts have run; it does not wait for images and other subresources to finish. The window load event waits for the page’s dependent resources as well. Use the earlier event for DOM setup and load only when the complete resource set matters.',
    code: `document.addEventListener('DOMContentLoaded', () => {\n  document.querySelector('main')?.classList.add('ready');\n});\n\nwindow.addEventListener('load', () => {\n  console.log('Page resources finished loading');\n});`,
    highlights: ['DOMContentLoaded waits for parsing and deferred/module scripts', 'load waits for dependent resources such as images', 'Choose the event that matches the work being scheduled'],
  },
  {
    id: 2653, category: 'JavaScript', difficulty: 'Mid',
    question: 'When should you use textContent instead of innerHTML?',
    answer: 'Use textContent to insert plain text, especially when the value may come from a user or external source. innerHTML parses a string as markup, so untrusted content can become executable HTML and create an XSS vulnerability. If rich HTML is genuinely required, sanitize it with a vetted sanitizer and apply a restrictive Content Security Policy.',
    code: `const message = document.querySelector('#message');\nmessage.textContent = untrustedInput;\n\n// Avoid assigning untrustedInput to message.innerHTML.`,
    highlights: ['textContent inserts text without parsing markup', 'Untrusted innerHTML can enable cross-site scripting', 'Sanitize only when rich HTML is a real requirement'],
  },
  {
    id: 2654, category: 'JavaScript', difficulty: 'Junior',
    question: 'What does Array.from() do, and how is it different from Array.isArray()?',
    answer: 'Array.from() creates a new array from an iterable or array-like value and can map each item during creation. Array.isArray() only checks whether a value is an array; it does not convert or copy it. Use Array.from() to materialize values such as a NodeList or string when array methods are needed.',
    code: `const letters = Array.from('web');\nconst doubled = Array.from([1, 2, 3], value => value * 2);\nconsole.log(letters); // ['w', 'e', 'b']\nconsole.log(Array.isArray(doubled)); // true`,
    highlights: ['Array.from converts iterable or array-like input to an array', 'It accepts an optional mapping function', 'Array.isArray is a type check only'],
  },
  {
    id: 2655, category: 'JavaScript', difficulty: 'Mid',
    question: 'How do you use Math.random() safely, and when is it not appropriate?',
    answer: 'Math.random() returns a pseudorandom floating-point value from 0 inclusive to 1 exclusive; scale and floor it for ordinary UI choices or simulations. It is not cryptographically secure and should not generate passwords, access tokens, or security-sensitive identifiers. Use the Web Crypto API for security-sensitive random bytes.',
    code: `const ordinaryIndex = Math.floor(Math.random() * 5);\n\nconst secureBytes = new Uint8Array(16);\ncrypto.getRandomValues(secureBytes);\nconsole.log(ordinaryIndex, secureBytes);`,
    highlights: ['Math.random returns a value in [0, 1)', 'Use it for non-security-sensitive randomness', 'Use crypto.getRandomValues for security-sensitive bytes'],
  },
  {
    id: 2656, category: 'JavaScript', difficulty: 'Mid',
    question: 'How does JavaScript validate form input in the browser, and why must the server validate it again?',
    answer: 'Browser validation can improve feedback by checking required fields, input types, constraints, and custom rules before submission. It is a usability feature, not a security boundary: clients can disable scripts or forge requests. The server must validate all incoming data independently before storing it or performing actions.',
    code: `const form = document.querySelector('#signup');\nform.addEventListener('submit', event => {\n  if (!form.reportValidity()) {\n    event.preventDefault();\n    return;\n  }\n  // Send valid-looking data; the server still validates it.\n});`,
    highlights: ['Use native constraints and reportValidity() for browser feedback', 'Client-side checks can be bypassed', 'Always validate and authorize on the server'],
  },
  {
    id: 2657, category: 'HTML/CSS', difficulty: 'Mid',
    question: 'How do CSS container queries differ from media queries?',
    answer: 'A media query responds to viewport or user-environment features; a container query responds to the size or style of a designated ancestor container. Use media queries for page-level changes and container queries when a reusable component must adapt to the space its parent gives it.',
    code: `.card-list { container-type: inline-size; }\n\n@container (width > 36rem) {\n  .card { display: grid; grid-template-columns: 10rem 1fr; }\n}`,
    highlights: ['Media queries observe the viewport or environment', 'Container queries observe an ancestor container', 'Container-aware components adapt when reused in different layouts'],
  },
  {
    id: 2658, category: 'HTML/CSS', difficulty: 'Mid',
    question: 'What are CSS cascade layers, and how do they help manage specificity?',
    answer: 'Cascade layers let a stylesheet declare precedence groups such as reset, vendor, components, and utilities. For normal declarations, layer order is considered before selector specificity, making it easier to keep overrides predictable without escalating selectors or relying on !important.',
    code: `@layer reset, components, utilities;\n\n@layer components {\n  :where(.card) { padding: 1rem; }\n}\n\n@layer utilities {\n  .u-compact { padding: 0.5rem; }\n}`,
    highlights: ['Declare a layer order once', 'Layer precedence is considered before selector specificity', 'Layers help organize third-party and application rules'],
  },
  {
    id: 2659, category: 'HTML/CSS', difficulty: 'Mid',
    question: 'How do the :is(), :where(), and :has() CSS selectors differ?',
    answer: ':is() matches an element if it matches any selector in its list and takes the specificity of its most specific argument. :where() works similarly but always has zero specificity. :has() selects an element based on matching descendants or related elements, enabling relational styling without scripting.',
    code: `:where(.article, .dialog) h2 { margin-block-start: 0; }\n.card:has(img) { display: grid; }\n:is(button, a):focus-visible { outline: 2px solid currentColor; }`,
    highlights: [':is uses the most specific argument', ':where contributes zero specificity', ':has selects based on related matching elements'],
  },
  {
    id: 2660, category: 'HTML/CSS', difficulty: 'Junior',
    question: 'When should you use rem, em, percentages, and viewport units in CSS?',
    answer: 'rem is relative to the root font size and is useful for consistent type and spacing scales. em is relative to the current element’s font size (or, for some properties, the parent’s computed value), so nesting can compound. Percentages depend on the relevant containing dimension; viewport units depend on the viewport. Choose units based on which relationship should control resizing.',
    code: `:root { font-size: 100%; }\n.panel { width: min(90%, 48rem); padding: 1.25rem; }\n.panel-title { font-size: 1.5em; }\n.hero { min-height: 60vh; }`,
    highlights: ['rem follows the root font size', 'em follows a contextual font size and may compound', 'Percent and viewport units follow layout dimensions'],
  },
  {
    id: 2661, category: 'HTML/CSS', difficulty: 'Mid',
    question: 'How should CSS respect a user’s reduced-motion preference?',
    answer: 'Use the prefers-reduced-motion media feature to reduce or remove nonessential transitions and animations when a user requests less motion. Preserve the information conveyed by the animation through a static state change, and avoid disabling all motion indiscriminately when it communicates essential status.',
    code: `.panel { transition: transform 180ms ease; }\n\n@media (prefers-reduced-motion: reduce) {\n  .panel { transition: none; }\n}`,
    highlights: ['Respect prefers-reduced-motion', 'Remove nonessential movement while preserving state feedback', 'Test both motion preferences'],
  },
  {
    id: 2662, category: 'SCSS', difficulty: 'Junior',
    question: 'What is SCSS, and how does it become browser-readable CSS?',
    answer: 'SCSS is the CSS-compatible syntax of Sass, a stylesheet preprocessor. A build step compiles SCSS features such as variables and mixins into standard CSS; browsers consume the generated CSS, not the SCSS source. Source maps can connect generated rules back to their original files during development.',
    code: `$accent: #087f8c;\n.button { color: $accent; }\n\n// The compiler emits ordinary CSS using the resolved color.`,
    highlights: ['SCSS is a Sass syntax, not a browser runtime language', 'A compiler emits CSS', 'Source maps help debug generated styles'],
  },
  {
    id: 2663, category: 'SCSS', difficulty: 'Junior',
    question: 'How do Sass variables differ from CSS custom properties?',
    answer: 'Sass variables are resolved during compilation and disappear from the emitted CSS. CSS custom properties remain in the browser stylesheet, inherit through the DOM, and can change with runtime themes or JavaScript. Use Sass variables for build-time composition and custom properties for values that must respond at runtime.',
    code: `$base-gap: 1rem;\n:root { --accent: #087f8c; }\n\n.panel { gap: $base-gap; border-color: var(--accent); }\n[data-theme='night'] { --accent: #5eead4; }`,
    highlights: ['Sass variables are compile-time values', 'Custom properties remain available in the browser', 'Use runtime variables for themes and contextual values'],
  },
  {
    id: 2664, category: 'SCSS', difficulty: 'Junior',
    question: 'How does SCSS nesting work, and why should it stay shallow?',
    answer: 'Nested rules combine selectors, while the parent selector & inserts the current selector into a nested rule. Nesting can group closely related states, but deep nesting generates long selectors, increases coupling, and makes specificity harder to manage. Keep component nesting shallow.',
    code: `.menu {\n  color: #24313a;\n  &__item { padding: 0.5rem; }\n  &:focus-within { outline: 2px solid currentColor; }\n}`,
    highlights: ['Nested selectors are combined during compilation', '& refers to the parent selector', 'Deep nesting creates fragile, high-specificity output'],
  },
  {
    id: 2665, category: 'SCSS', difficulty: 'Mid',
    question: 'Why use @use and @forward instead of legacy Sass @import?',
    answer: '@use loads a Sass module once and gives its members a namespace, which makes dependencies explicit and avoids global-name collisions. @forward re-exports a module’s public API. Legacy Sass @import shares global scope and may duplicate output; it is deprecated in favor of the module system.',
    code: `// _tokens.scss\n$accent: #087f8c;\n\n// app.scss\n@use 'tokens';\n.button { border-color: tokens.$accent; }`,
    highlights: ['@use loads a namespaced module once', '@forward exposes a controlled public API', 'Avoid new code based on legacy @import'],
  },
  {
    id: 2666, category: 'SCSS', difficulty: 'Mid',
    question: 'When should you use an SCSS mixin versus @extend?',
    answer: 'A mixin copies configurable declarations into each include site and can accept arguments. @extend shares a selector rule with another selector, which can create combined selectors and surprising output. Use mixins for parameterized behavior; use placeholders and @extend only when the shared selector relationship is intentional and the generated CSS is understood.',
    code: `%control { border: 1px solid currentColor; }\n.input { @extend %control; }\n\n@mixin focus-ring($color) { outline: 2px solid $color; }\n.button:focus-visible { @include focus-ring(#087f8c); }`,
    highlights: ['Mixins emit declarations at each include site', '@extend combines selectors into shared rules', 'Inspect generated CSS when choosing either abstraction'],
  },
  {
    id: 2667, category: 'SCSS', difficulty: 'Mid',
    question: 'How do Sass functions, mixins, and control directives differ?',
    answer: 'A Sass function computes and returns a value for use in a declaration. A mixin emits reusable declarations or nested rules. Directives such as @if and @each control stylesheet generation at compile time. Keep generated output small and readable, and prefer CSS runtime features when values must respond to browser state.',
    code: `@function spacing($step) { @return $step * 0.25rem; }\n@mixin stack($gap) { display: flex; flex-direction: column; gap: $gap; }\n\n.card-list { @include stack(spacing(4)); }`,
    highlights: ['Functions return values', 'Mixins emit reusable styles', 'Control directives generate styles during compilation'],
  },
  {
    id: 2668, category: 'SCSS', difficulty: 'Mid',
    question: 'What is Sass interpolation, and when is it useful?',
    answer: 'Interpolation inserts a Sass expression into a selector, property name, or string using #{}. It is useful for generating a controlled family of utilities or names from data. Avoid dynamic generation when explicit CSS would be easier to inspect and maintain.',
    code: `$state: selected;\n.item--#{$state} { border-color: currentColor; }`,
    highlights: ['Interpolation uses #{...}', 'It can generate selector or property fragments', 'Keep generated names predictable and limited'],
  },
  {
    id: 2669, category: 'SCSS', difficulty: 'Mid',
    question: 'How would you organize an SCSS codebase for reusable components and themes?',
    answer: 'Separate tokens, base rules, layout primitives, and component styles into focused modules. Expose stable names through @forward and load them with @use. Keep component selectors shallow, use CSS custom properties for values that vary at runtime, and verify the emitted CSS and source maps in the build.',
    highlights: ['Group modules by responsibility', 'Use @use/@forward for explicit dependencies', 'Use CSS custom properties for runtime theme values'],
  },
  {
    id: 2670, category: 'SCSS', difficulty: 'Senior',
    question: 'How do you migrate an existing CSS project to SCSS without changing its appearance?',
    answer: 'First ensure the current stylesheet is covered by representative visual checks. Rename a small file to .scss and compile it without changing its rules, then migrate repeated values into variables and repeated declarations into focused mixins in small steps. Compare generated CSS, verify cascade order and source maps, and watch for selector changes caused by nesting or @extend.',
    highlights: ['Migrate incrementally; valid CSS is also valid SCSS', 'Compare generated output and visual behavior at each step', 'Watch cascade order, specificity, and source maps'],
  },
  {
    id: 2671, category: 'Java', difficulty: 'Junior',
    question: 'What is the difference between Java primitive types and wrapper classes?',
    answer: 'Primitive variables store values such as int, double, and boolean directly. Wrapper classes such as Integer and Double are objects, can be null, and are required by generic collections. Java automatically boxes and unboxes between them, but unboxing null throws NullPointerException.',
    code: `int count = 4;\nInteger boxed = count; // boxing\nint restored = boxed;  // unboxing\nInteger missing = null;\n// int invalid = missing; // would throw NullPointerException`,
    highlights: ['Primitives cannot be null; wrappers can', 'Collections use reference types such as Integer', 'Watch for null unboxing'],
  },
  {
    id: 2672, category: 'Java', difficulty: 'Junior',
    question: 'What does var mean in Java, and how is it different from dynamic typing?',
    answer: 'Local-variable type inference lets the compiler infer a local variable’s static type from its initializer. The variable remains strongly typed; var cannot be used for fields, method parameters, or a local without an initializer. It is available for local variables starting in Java 10.',
    code: `var names = List.of("Ada", "Lin"); // inferred as List<String>\nvar first = names.get(0); // inferred as String\n// first = 42; // compile-time error`,
    highlights: ['var is compile-time inference, not dynamic typing', 'The inferred type cannot change', 'Use it only when the initializer makes the type clear'],
  },
  {
    id: 2673, category: 'Java', difficulty: 'Junior',
    question: 'How do widening and narrowing primitive conversions differ in Java?',
    answer: 'Widening converts to a type with a larger range, such as int to long, and is normally implicit. Narrowing converts to a smaller or less precise type and requires a cast; it can truncate a fraction or overflow. Use exact arithmetic helpers when integer overflow must be detected.',
    code: `int count = 12;\nlong total = count; // widening\n\ndouble measurement = 9.8;\nint whole = (int) measurement; // becomes 9\nint safeSum = Math.addExact(20, 22);`,
    highlights: ['Widening usually preserves the value', 'Narrowing can lose range or precision', 'Math exact helpers can detect integer overflow'],
  },
  {
    id: 2674, category: 'Java', difficulty: 'Junior',
    question: 'When should you use a Java array versus an ArrayList?',
    answer: 'An array has a fixed length and can store primitives directly; use it when the size is known and stable or when an API requires an array. ArrayList grows and shrinks, offers collection operations, and stores reference types (primitive values are boxed). Choose based on size changes and API needs.',
    code: `int[] fixedScores = { 80, 92, 75 };\nList<Integer> changingScores = new ArrayList<>();\nchangingScores.add(80);\nchangingScores.add(92);\nSystem.out.println(changingScores.size()); // 2`,
    highlights: ['Arrays have fixed length and may store primitives', 'ArrayList resizes and offers collection methods', 'ArrayList<Integer> boxes int values'],
  },
  {
    id: 2675, category: 'Java', difficulty: 'Junior',
    question: 'How do break and continue affect Java loops?',
    answer: 'break exits the nearest loop or switch immediately. continue skips the rest of the current loop iteration and proceeds to the next one. Labeled forms can target an outer loop, but extracting a method is often clearer than deeply nested labeled control flow.',
    code: `for (int value : values) {\n    if (value < 0) continue; // skip invalid values\n    if (value == target) break; // stop when found\n    System.out.println(value);\n}`,
    highlights: ['break exits the loop', 'continue skips to the next iteration', 'Prefer simple loop structure over nested control-flow jumps'],
  },
  {
    id: 2676, category: 'Java', difficulty: 'Mid',
    question: 'How do static members differ from instance members in Java?',
    answer: 'An instance member belongs to each object and can use that object’s state. A static member belongs to the class and is shared; it cannot directly access instance fields without an object. Use static for behavior or constants that do not depend on an individual instance, not as a default for all methods.',
    code: `class Ticket {\n    private static int issued;\n    private final int number;\n\n    Ticket() { number = ++issued; }\n    int number() { return number; }\n    static int issuedCount() { return issued; }\n}`,
    highlights: ['Instance state is per object', 'Static state is shared by the class', 'Static methods need an object to access instance members'],
  },
  {
    id: 2677, category: 'Java', difficulty: 'Mid',
    question: 'How do this() and super() work in Java constructors?',
    answer: 'this(...) delegates to another constructor in the same class; super(...) invokes a constructor in the parent class. If used, either call must be the first statement in the constructor. Constructor chaining centralizes initialization and ensures parent state is initialized before child-specific setup.',
    code: `class Person {\n    Person(String name) { }\n}\nclass Member extends Person {\n    Member() { this("guest"); }\n    Member(String name) { super(name); }\n}`,
    highlights: ['this(...) calls another constructor in the same class', 'super(...) calls a parent constructor', 'Constructor delegation must be the first statement'],
  },
  {
    id: 2678, category: 'Java', difficulty: 'Mid',
    question: 'Is Java pass-by-value or pass-by-reference?',
    answer: 'Java is always pass-by-value. For an object argument, the copied value is the reference, so a method can mutate the referenced object but cannot replace the caller’s reference. Reassigning the parameter only changes the local copy.',
    code: `static void rename(User user) { user.name = "New"; }\nstatic void replace(User user) { user = new User("Other"); }\n\nUser current = new User("Original");\nrename(current);  // caller sees the object's changed field\nreplace(current); // caller still refers to the original object`,
    highlights: ['Primitive values are copied into parameters', 'Object references are also passed by value', 'Mutating the referenced object differs from reassigning the local parameter'],
  },
  {
    id: 2679, category: 'Java', difficulty: 'Junior',
    question: 'When should Java objects be compared with == versus equals()?',
    answer: 'For primitives, == compares values. For reference types, == checks whether both references point to the same object. equals() expresses logical equality when the class overrides it; classes that override equals should also provide a consistent hashCode implementation for hash-based collections.',
    code: `String first = new String("java");\nString second = new String("java");\nSystem.out.println(first == second);      // false\nSystem.out.println(first.equals(second)); // true`,
    highlights: ['== compares primitive values or reference identity', 'equals() can compare object content', 'Keep equals and hashCode consistent'],
  },
  {
    id: 2680, category: 'Java', difficulty: 'Junior',
    question: 'When should you use an enum instead of string constants in Java?',
    answer: 'An enum models a closed set of named values with compile-time type safety. It prevents invalid strings from flowing through APIs and can hold fields and methods. Use a class or configuration source instead when the set must be extended dynamically at runtime.',
    code: `enum OrderState { NEW, PAID, SHIPPED }\n\nOrderState state = OrderState.PAID;\nif (state == OrderState.PAID) {\n    System.out.println("Ready to ship");\n}`,
    highlights: ['Enums restrict values to a declared set', 'They are safer than free-form strings', 'Use dynamic configuration when values change at runtime'],
  },
  {
    id: 2681, category: 'Java', difficulty: 'Junior',
    question: 'When should you use Scanner versus BufferedReader for console input?',
    answer: 'Scanner provides convenient tokenization and parsing for small interactive programs. BufferedReader reads text efficiently as lines but leaves parsing to your code. For large input, BufferedReader is generally faster; validate parsed values and handle malformed input explicitly.',
    code: `try (BufferedReader reader = new BufferedReader(new InputStreamReader(System.in))) {\n    String line = reader.readLine();\n    int count = Integer.parseInt(line.trim());\n    System.out.println(count);\n} catch (IOException | NumberFormatException error) {\n    System.err.println("Invalid input");\n}`,
    highlights: ['Scanner is convenient for token parsing', 'BufferedReader is efficient for line-oriented input', 'Parsing can fail and should be validated'],
  },
  {
    id: 2682, category: 'Java', difficulty: 'Mid',
    question: 'How do you read a text file safely with modern Java APIs?',
    answer: 'Use Path and Files for common file operations, specify a character encoding, and use try-with-resources for streams or readers so they close on success and failure. For large files, process lines as a stream instead of loading the whole file into memory.',
    code: `Path path = Path.of("input.txt");\ntry (Stream<String> lines = Files.lines(path, StandardCharsets.UTF_8)) {\n    lines.filter(line -> !line.isBlank()).forEach(System.out::println);\n} catch (IOException error) {\n    System.err.println("Could not read file: " + error.getMessage());\n}`,
    highlights: ['Use Path/Files APIs and an explicit charset', 'try-with-resources closes the stream reliably', 'Stream large files line by line'],
  },
  {
    id: 2683, category: 'Python', difficulty: 'Junior',
    question: 'What does input() return in Python, and how should you validate it?',
    answer: 'input() always returns a string. Convert it explicitly before numeric work and handle conversion errors so malformed input does not crash the program. Validate the converted value against the application’s range or business rules as well.',
    code: `raw = input("How many items? ")\ntry:\n    count = int(raw)\nexcept ValueError:\n    print("Enter a whole number")\nelse:\n    if count < 0:\n        print("Count must not be negative")\n    else:\n        print(f"Items: {count}")`,
    highlights: ['input() returns str', 'Convert explicitly to int/float when needed', 'Handle conversion and domain validation separately'],
  },
  {
    id: 2684, category: 'Python', difficulty: 'Junior',
    question: 'How does Python match/case differ from a chain of if/elif statements?',
    answer: 'match/case, introduced in Python 3.10, performs structural pattern matching. It can match and bind parts of sequences, mappings, and class instances, and guards add conditions with if. It is useful when branching on the shape of data; for simple boolean conditions, if/elif is usually clearer.',
    code: `def describe(value):\n    match value:\n        case {"status": "error", "code": code} if code >= 500:\n            return f"server error {code}"\n        case [first, *rest]:\n            return f"first={first}, remaining={len(rest)}"\n        case _:\n            return "other"`,
    highlights: ['Pattern matching can inspect and unpack structured values', 'A guard adds a condition to a case', 'Use if/elif for ordinary boolean branching'],
  },
  {
    id: 2685, category: 'Python', difficulty: 'Junior',
    question: 'How do enumerate() and zip() simplify Python loops?',
    answer: 'enumerate() yields an index and item together, avoiding manual counter updates. zip() yields corresponding items from multiple iterables and stops at the shortest input by default. Use strict=True in supported Python versions when unequal lengths should be treated as an error.',
    code: `names = ["Ada", "Lin"]\nscores = [91, 87]\n\nfor index, name in enumerate(names, start=1):\n    print(index, name)\n\nfor name, score in zip(names, scores):\n    print(f"{name}: {score}")`,
    highlights: ['enumerate pairs indexes with values', 'zip walks iterables in parallel', 'Consider strict=True when length mismatch is a bug'],
  },
  {
    id: 2686, category: 'Python', difficulty: 'Mid',
    question: 'What is Python’s LEGB name-resolution rule?',
    answer: 'Python looks up a name in Local, Enclosing, Global, then Built-in scope. Assigning to a name inside a function makes it local unless declared global or nonlocal. Use nonlocal to rebind an enclosing function variable; prefer passing state explicitly when that keeps behavior clearer.',
    code: `count = 10\ndef make_counter():\n    count = 0\n    def increment():\n        nonlocal count\n        count += 1\n        return count\n    return increment\n\nnext_count = make_counter()\nprint(next_count()) # 1`,
    highlights: ['LEGB describes the lookup order', 'Assignments inside a function are local by default', 'Use nonlocal for an enclosing binding and global sparingly'],
  },
  {
    id: 2687, category: 'Python', difficulty: 'Mid',
    question: 'Why are mutable default arguments a Python pitfall?',
    answer: 'Default argument expressions are evaluated once when the function is defined. If the default is a mutable list or dictionary, calls share that same object and state can leak between calls. Use None as a sentinel and create a fresh mutable value inside the function.',
    code: `def add_tag(tag, tags=None):\n    if tags is None:\n        tags = []\n    tags.append(tag)\n    return tags\n\nprint(add_tag("new"))  # ['new']\nprint(add_tag("hot"))  # ['hot']`,
    highlights: ['Defaults are created once at function definition time', 'Mutable defaults can be shared across calls', 'Use None and allocate per call'],
  },
  {
    id: 2688, category: 'Python', difficulty: 'Mid',
    question: 'How are objects passed to Python functions, and what does that mean for mutation?',
    answer: 'Python passes object references by assignment: the parameter becomes a local name bound to the same object. Mutating a shared mutable object is visible to the caller, but rebinding the parameter is not. Return a new object when callers should retain the original unchanged.',
    code: `def append_item(items, value):\n    items.append(value)  # mutates the caller's list\n\ndef with_item(items, value):\n    return [*items, value]  # returns a new list`,
    highlights: ['Parameters are local names bound to passed objects', 'Mutations to shared mutable objects are visible to callers', 'Rebinding a parameter does not rebind the caller variable'],
  },
  {
    id: 2689, category: 'Python', difficulty: 'Mid',
    question: 'How do raw strings and capture groups help when using Python regular expressions?',
    answer: 'A raw string keeps most backslashes from being interpreted by Python before the regex engine sees them. Parenthesized groups capture parts of a match; named groups make extraction clearer. Use fullmatch() for whole-input validation and escape literal user-provided patterns when appropriate.',
    code: `import re\n\npattern = re.compile(r"(?P<user>[a-z]+)@(?P<host>[a-z.]+)")\nmatch = pattern.fullmatch("ada@example.org")\nif match:\n    print(match.group("host"))`,
    highlights: ['Raw strings make regex backslashes easier to read', 'Groups capture matched pieces; named groups document intent', 'Choose search, match, or fullmatch based on the required scope'],
  },
  {
    id: 2690, category: 'Python', difficulty: 'Mid',
    question: 'What is the difference between naive and timezone-aware datetime values?',
    answer: 'A naive datetime has no time-zone information, so its relationship to UTC is ambiguous. An aware datetime includes time-zone information and identifies an instant. Use timezone-aware UTC values for storage and exchange, then convert using zoneinfo when displaying local time.',
    code: `from datetime import datetime, timezone\nfrom zoneinfo import ZoneInfo\n\nnow_utc = datetime.now(timezone.utc)\nlocal = now_utc.astimezone(ZoneInfo("America/New_York"))\nprint(local.isoformat())`,
    highlights: ['Naive values do not identify a unique instant', 'Use aware UTC values for persisted timestamps', 'Use zoneinfo for daylight-saving-aware local conversions'],
  },
  {
    id: 2691, category: 'Python', difficulty: 'Mid',
    question: 'How does Python’s json module convert between JSON and Python values?',
    answer: 'json.loads()/load() decode JSON text or a file into Python values; json.dumps()/dump() encode supported Python values as JSON. JSON has no tuple, set, or arbitrary object type, so define explicit conversion for custom data and validate decoded input before relying on it.',
    code: `import json\n\npayload = {"name": "Mina", "active": True}\ntext = json.dumps(payload)\nrestored = json.loads(text)\nprint(restored["name"])`,
    highlights: ['loads/load decode JSON; dumps/dump encode it', 'JSON supports a smaller set of data types than Python', 'Validate external JSON after decoding'],
  },
  {
    id: 2692, category: 'Python', difficulty: 'Mid',
    question: 'Why can float arithmetic be imprecise, and when should you use Decimal?',
    answer: 'Python float uses binary floating-point, so some decimal fractions are approximations. Decimal is useful for decimal-domain arithmetic such as prices when constructed from strings. For fixed-scale values, integer minor units can also avoid rounding surprises.',
    code: `from decimal import Decimal\n\nprint(0.1 + 0.2)\namount = Decimal("0.10") + Decimal("0.20")\nprint(amount)  # 0.30`,
    highlights: ['Binary floats approximate many decimal fractions', 'Construct Decimal from strings for exact decimal inputs', 'Choose a monetary representation and rounding policy deliberately'],
  },
  {
    id: 2693, category: 'Python', difficulty: 'Mid',
    question: 'When should Python code use secrets instead of random?',
    answer: 'random is designed for simulations and reproducible pseudo-random sequences, not security. secrets uses the operating system’s secure randomness source and is appropriate for reset tokens, one-time secrets, and cryptographic identifiers.',
    code: `import random\nimport secrets\n\nsample = random.randint(1, 6)\nreset_token = secrets.token_urlsafe(24)`,
    highlights: ['Use random for simulation and sampling', 'Use secrets for security-sensitive values', 'Do not use random-generated values as authentication tokens'],
  },
  {
    id: 2694, category: 'Python', difficulty: 'Junior',
    question: 'How do dict.get() and dict.setdefault() differ?',
    answer: 'get(key, default) reads a value or returns a fallback without changing the dictionary. setdefault(key, default) returns the existing value or inserts the default when the key is missing. Use setdefault for intentional one-time initialization; use get for read-only fallback behavior.',
    code: `counts = {}\ncounts["pear"] = counts.get("pear", 0) + 1\n\ngroups = {}\ngroups.setdefault("fruit", []).append("pear")\nprint(counts, groups)`,
    highlights: ['get does not mutate the dictionary', 'setdefault inserts a missing key', 'Use defaultdict when repeated grouped initialization dominates'],
  },
  {
    id: 2695, category: 'Python', difficulty: 'Junior',
    question: 'What does range() return, and why is it useful in loops?',
    answer: 'range() returns an immutable, lazy sequence of integers rather than allocating a list of every value. It supports start, stop, and step, iteration, membership checks, and indexing. The stop value is excluded.',
    code: `for index in range(2, 8, 2):\n    print(index)  # 2, 4, 6\n\nprint(list(range(3)))  # [0, 1, 2]`,
    highlights: ['The stop bound is exclusive', 'range is memory-efficient for large integer sequences', 'Use direct iteration over a collection when you do not need indexes'],
  },
  {
    id: 2696, category: 'Python', difficulty: 'Mid',
    question: 'What is the difference between except, else, and finally in Python?',
    answer: 'except handles matching exceptions from the try block. else runs only when the try block completes without an exception. finally runs whether an exception occurred or not and is intended for cleanup; context managers are often safer for resources.',
    code: `try:\n    result = int(raw_value)\nexcept ValueError as error:\n    print("Invalid integer:", error)\nelse:\n    print("Parsed:", result)\nfinally:\n    print("Parsing attempt finished")`,
    highlights: ['except handles selected failures', 'else runs only when try succeeds', 'finally runs on both success and failure'],
  },
  {
    id: 2697, category: 'Python', difficulty: 'Mid',
    question: 'Do Python type hints enforce types at runtime?',
    answer: 'Type annotations document expected values and support static analysis, editor assistance, and runtime frameworks that choose to inspect them. Python does not automatically enforce them during normal execution; validate untrusted inputs at runtime when correctness or security depends on their shape.',
    code: `def total(values: list[int]) -> int:\n    return sum(values)\n\n# A static checker can flag this call; Python itself still executes it.\n# total([1, "two"])`,
    highlights: ['Annotations support tooling but are not runtime enforcement by default', 'Static checkers can catch mismatched calls before execution', 'Validate external data explicitly'],
  },

];

export const INTERVIEW_QA = [...BASE_INTERVIEW_QA, ...JS_APP_QA, ...GUIDE_QA];
