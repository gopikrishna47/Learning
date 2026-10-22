// ─────────────────────────────────────────────────────────────────
//  SECTIONS.JS  — unified topic + concept data for all categories
// ─────────────────────────────────────────────────────────────────

import { LEGACY_SECTIONS } from './legacySections.js';
import { JS_APP_SECTIONS } from './jsApp/sections.js';

const RAW_SECTIONS = [

  // ═══════════════════════════════════════════════════════════════
  // REACT (IDs 1–17)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 1, title: 'React Foundations', sub: 'Virtual DOM, JSX, Components, Props',
    color: '#00ffd1', level: 'junior',
    concepts: [
      {
        title: 'Virtual DOM & Reconciliation',
        description: [
          'In simple English: React keeps a lightweight copy of the real DOM in memory called the Virtual DOM. When state changes, React does NOT touch the browser DOM directly — that would be slow. Instead it builds a new Virtual DOM tree first.',
          'React then "diffs" the new tree against the previous one to figure out exactly what changed (this is called reconciliation), and only sends the minimum set of real DOM updates needed. This is why React feels fast even on big pages.',
          'Diffing rules to remember: if the element type stays the same (div → div), React updates it in place. If the type changes (div → span), React throws away the old node and everything inside it, and builds a fresh one.',
        ],
        code: `<span class="c-comment">// setCount triggers: new Virtual DOM → diff vs old tree → patch real DOM</span>
<span class="c-keyword">function</span> <span class="c-fn">Counter</span>() {
  <span class="c-keyword">const</span> [count, setCount] = useState(<span class="c-num">0</span>);

  <span class="c-comment">// Only the text inside the button actually changes in the real DOM,</span>
  <span class="c-comment">// even though this whole component "re-renders" on every click.</span>
  <span class="c-keyword">return</span> (
    &lt;<span class="c-tag">button</span> onClick={() =&gt; setCount(c =&gt; c + <span class="c-num">1</span>)}&gt;
      Count: {count}
    &lt;/<span class="c-tag">button</span>&gt;
  );
}`,
        interviewTip: '💡 <strong>Interview:</strong> "What happens when you change a &lt;div&gt; to a &lt;span&gt;?" → React unmounts the entire old subtree and mounts a brand-new one — every child inside loses its state. Say this out loud, it\'s the exact answer they want.',
      },
      {
        title: 'JSX Rules & Pitfalls',
        description: [
          'JSX looks like HTML but it is NOT HTML — it is syntactic sugar that gets compiled to React.createElement(type, props, ...children) calls. Knowing this helps explain every "weird" JSX rule.',
          'Because it compiles down to a single function call, a component can only return ONE root element (or a Fragment <>...</> which renders nothing extra to the DOM).',
        ],
        list: [
          'Must return a single root element (or a Fragment)',
          'class → className, for → htmlFor (these are reserved JS words)',
          'Self-closing tags are required for empty elements: <img />, <br />',
          'Curly braces {} only accept expressions, never statements (no if/for inside JSX directly)',
        ],
        code: `<span class="c-comment">// Fragment avoids adding an extra, unnecessary DOM node</span>
<span class="c-keyword">function</span> <span class="c-fn">Card</span>() {
  <span class="c-keyword">return</span> (
    &lt;&gt;
      &lt;<span class="c-tag">h1</span>&gt;Title&lt;/<span class="c-tag">h1</span>&gt;
      &lt;<span class="c-tag">p</span>&gt;Body text goes here&lt;/<span class="c-tag">p</span>&gt;
    &lt;/&gt;
  );
}

<span class="c-comment">// Conditional rendering — ternary or && works, "if" statements don't</span>
&lt;<span class="c-tag">div</span>&gt;{isLoggedIn ? &lt;<span class="c-tag">Dashboard</span> /&gt; : &lt;<span class="c-tag">Login</span> /&gt;}&lt;/<span class="c-tag">div</span>&gt;</span>`,
        interviewTip: '💡 <strong>Pitfall:</strong> {0 && <Banner />} renders the literal "0" on screen, not nothing — a classic React bug. Use {count > 0 && <Banner />} instead.',
      },
      {
        title: 'Props vs State',
        description: [
          'Props are inputs a component receives from its parent — think of them like function arguments. They are read-only inside the child; the child should never change them directly.',
          'State is data a component owns and manages itself. It can change over time (usually from user interaction), and changing it triggers a re-render. Props flow one-way, top to bottom; state stays local unless you deliberately "lift it up" to a shared parent.',
        ],
        code: `<span class="c-keyword">function</span> <span class="c-fn">Counter</span>({ label }) {        <span class="c-comment">// "label" is a prop — comes from the parent</span>
  <span class="c-keyword">const</span> [count, setCount] = useState(<span class="c-num">0</span>); <span class="c-comment">// "count" is state — owned right here</span>

  <span class="c-keyword">return</span> (
    &lt;<span class="c-tag">button</span> onClick={() =&gt; setCount(c =&gt; c + <span class="c-num">1</span>)}&gt;
      {label}: {count}
    &lt;/<span class="c-tag">button</span>&gt;
  );
}

<span class="c-comment">// Usage — parent passes the prop down</span>
&lt;<span class="c-tag">Counter</span> label=<span class="c-str">"Clicks"</span> /&gt;</span>`,
        interviewTip: '💡 <strong>Pitfall:</strong> Never mutate props directly — writing props.x = 5 breaks React\'s data-flow model and won\'t even trigger a re-render. If a child needs to change something, the parent should pass down a function (callback) to do it.',
      },
    ],
  },
  {
    id: 2, title: 'Rendering & Internals', sub: 'Fiber, Concurrent Mode, Hydration',
    color: '#ff6b6b', level: 'senior',
    concepts: [
      {
        title: 'React Fiber Architecture',
        description: [
          'Fiber is React\'s internal "engine" for rendering, introduced in React 16. Before Fiber, React rendered the whole tree in one uninterruptible pass — a big update could freeze the page for a moment.',
          'Fiber breaks rendering work into small units that can be paused, resumed, reused, or thrown away. This is what allows React to say "this update is urgent (a click), that one can wait (background data)".',
        ],
        list: [
          'Work is split into "fibers" — a linked-list data structure, one per component',
          'Rendering is interruptible: a high-priority update (like typing) can jump ahead of a low-priority one',
          'Two phases: render (builds the new tree, can be paused/interrupted, no side effects) and commit (applies changes to the real DOM, always runs fully, synchronous)',
        ],
        interviewTip: '💡 <strong>Interview:</strong> Fiber itself doesn\'t make React "faster" for a single update — its real value is enabling concurrent features (Suspense, transitions) by making rendering interruptible. Mention this distinction, it shows depth.',
      },
      {
        title: 'Concurrent Mode & Transitions',
        description: [
          'React 18\'s concurrent features let React prepare more than one version of the UI at the same time, without blocking the user from typing or clicking while that work happens in the background.',
          'startTransition tells React: "this state update is not urgent — if something more important comes in (like a keystroke), pause this and handle that first."',
        ],
        code: `<span class="c-keyword">import</span> { useTransition } <span class="c-keyword">from</span> <span class="c-str">'react'</span>;

<span class="c-keyword">function</span> <span class="c-fn">SearchBox</span>() {
  <span class="c-keyword">const</span> [isPending, startTransition] = useTransition();
  <span class="c-keyword">const</span> [input, setInput] = useState(<span class="c-str">''</span>);

  <span class="c-keyword">const</span> handleChange = (e) =&gt; {
    setInput(e.target.value);          <span class="c-comment">// urgent — keeps the input snappy</span>
    startTransition(() =&gt; {
      setSearchTerm(e.target.value);   <span class="c-comment">// deferred — won't block typing</span>
    });
  };

  <span class="c-keyword">return</span> (
    &lt;&gt;
      &lt;<span class="c-tag">input</span> value={input} onChange={handleChange} /&gt;
      {isPending &amp;&amp; &lt;<span class="c-tag">Spinner</span> /&gt;}
    &lt;/&gt;
  );
}`,
        interviewTip: '💡 <strong>Key:</strong> startTransition doesn\'t make the update itself faster — it just tells React it\'s low priority so urgent updates (typing, clicks) don\'t get blocked by it.',
      },
      {
        title: 'Hydration & SSR',
        description: [
          'With server-side rendering, the server sends fully-built HTML to the browser so the user sees content immediately. But that HTML is "dead" — there are no click handlers wired up yet.',
          'Hydration is the process where React attaches its event listeners and internal state to that existing server-rendered HTML, turning it into a fully interactive app without re-building the DOM from scratch.',
        ],
        list: [
          'Flow: server renders HTML → browser paints it instantly → React "hydrates" it in the background',
          'React 18 adds selective hydration — different parts of the page can become interactive independently, so one slow component doesn\'t block the whole page',
          'A mismatch between what the server rendered and what the client would render causes a "hydration error" — usually from using browser-only APIs (like Date.now() or window) during render',
        ],
        interviewTip: '💡 <strong>Interview:</strong> If asked "why did I get a hydration mismatch warning?" — the answer is almost always non-deterministic render output (random values, dates, or reading window/localStorage) that differs between server and client.',
      },
    ],
  },
  {
    id: 3, title: 'Hooks — Deep Dive', sub: 'useState, useEffect, useMemo, Custom',
    color: '#a78bfa', level: 'mid',
    concepts: [
      {
        title: 'useState & Batching',
        description: [
          'useState gives you a piece of state and a setter function: [value, setter]. Calling the setter schedules a re-render — it does not update the value immediately in the current line of code.',
          'React 18 batches (groups) all state updates that happen inside event handlers, and even inside setTimeout, Promises, and native event listeners, into a single re-render for performance. Earlier React versions only batched inside React\'s own event handlers.',
        ],
        code: `<span class="c-comment">// Functional update — always safe when the new value depends on the old one</span>
setCount(prev =&gt; prev + <span class="c-num">1</span>);

<span class="c-comment">// Lazy initializer — the function only runs ONCE, on first render</span>
<span class="c-comment">// good for expensive calculations you don't want repeated every render</span>
<span class="c-keyword">const</span> [data, setData] = useState(() =&gt; heavyCompute());`,
        interviewTip: '💡 Never call setState() directly during render — that causes an infinite loop. Only call it inside event handlers, useEffect, or other callbacks.',
      },
      {
        title: 'useEffect Patterns',
        description: [
          'useEffect lets a component "reach outside itself" — to fetch data, subscribe to something, or manually touch the DOM. It runs AFTER the browser has painted the screen, not during render.',
          'The dependency array is what controls when the effect re-runs. Get this wrong and you get either stale data (missing dependency) or an infinite loop (unstable dependency, like a new object every render).',
        ],
        code: `<span class="c-comment">// 1. Runs once, on mount only — empty array</span>
useEffect(() =&gt; {
  fetch(<span class="c-str">'/api/user'</span>).then(r =&gt; r.json()).then(setUser);
}, []);

<span class="c-comment">// 2. Runs again whenever "count" changes</span>
useEffect(() =&gt; {
  document.title = <span class="c-str">\`Count: \${count}\`</span>;
}, [count]);

<span class="c-comment">// 3. Cleanup function — runs before the NEXT effect, and on unmount</span>
useEffect(() =&gt; {
  <span class="c-keyword">const</span> id = setInterval(tick, <span class="c-num">1000</span>);
  <span class="c-keyword">return</span> () =&gt; clearInterval(id); <span class="c-comment">// always clean up subscriptions/timers</span>
}, []);`,
        interviewTip: '💡 <strong>Interview:</strong> "Missing dependency" bugs cause stale closures (the effect keeps using an old value). "Extra/unstable dependency" bugs (like a new object or function every render) cause infinite loops. Know both directions.',
      },
      {
        title: 'useMemo & useCallback',
        description: [
          'Both hooks exist to avoid unnecessary work between renders — but they memoize different things. useMemo memoizes a computed VALUE. useCallback memoizes a FUNCTION reference (it\'s actually just useMemo(() => fn, deps) under the hood).',
          'They are most useful for two things: skipping an expensive calculation, or keeping a stable reference so a child wrapped in React.memo doesn\'t re-render for no reason.',
        ],
        code: `<span class="c-comment">// useMemo — skip re-sorting a large array unless "items" actually changes</span>
<span class="c-keyword">const</span> sorted = useMemo(() =&gt; [...items].sort(compareFn), [items]);

<span class="c-comment">// useCallback — gives child components a stable function reference</span>
<span class="c-comment">// (without this, a new function is created every render, breaking React.memo)</span>
<span class="c-keyword">const</span> handleSelect = useCallback((id) =&gt; selectItem(id), []);`,
        interviewTip: '💡 Don\'t sprinkle these everywhere "just in case" — memoization itself has a small cost. Profile with React DevTools first, then memoize only the parts that are actually slow or that feed into React.memo children.',
      },
      {
        title: 'useRef & useReducer',
        description: [
          'useRef gives you a mutable box ({ current: value }) that survives across re-renders WITHOUT causing a re-render when it changes. It\'s the standard way to grab a reference to a real DOM node, or to store a value you don\'t want tied to the render cycle (like a previous value, or an interval ID).',
          'useReducer is like useState but for more complex state logic — instead of calling many small setters, you dispatch a described "action" and a single reducer function decides the next state. It shines when several pieces of state update together, or update logic gets tangled.',
        ],
        code: `<span class="c-comment">// useRef — direct access to a DOM node</span>
<span class="c-keyword">const</span> inputRef = useRef(<span class="c-kw2">null</span>);
&lt;<span class="c-tag">input</span> ref={inputRef} /&gt;
<span class="c-comment">// inputRef.current is the actual <input> DOM element</span>
inputRef.current.focus();

<span class="c-comment">// useReducer — predictable state transitions via named actions</span>
<span class="c-keyword">function</span> <span class="c-fn">reducer</span>(state, action) {
  <span class="c-keyword">switch</span> (action.type) {
    <span class="c-keyword">case</span> <span class="c-str">'increment'</span>: <span class="c-keyword">return</span> { count: state.count + <span class="c-num">1</span> };
    <span class="c-keyword">case</span> <span class="c-str">'reset'</span>:     <span class="c-keyword">return</span> { count: <span class="c-num">0</span> };
    <span class="c-keyword">default</span>: <span class="c-keyword">throw new</span> Error(<span class="c-str">'Unknown action'</span>);
  }
}
<span class="c-keyword">const</span> [state, dispatch] = useReducer(reducer, { count: <span class="c-num">0</span> });
dispatch({ type: <span class="c-str">'increment'</span> });`,
        interviewTip: '💡 <strong>Interview:</strong> "Does changing a ref cause a re-render?" → No — that\'s the whole point of useRef. If you need the UI to update, that value belongs in state, not a ref.',
      },
    ],
  },
  {
    id: 4, title: 'State & Data Flow', sub: 'Context, Redux, Zustand, Derived State',
    color: '#fbbf24', level: 'mid',
    concepts: [
      {
        title: 'Context API',
        description: [
          'Context solves "prop drilling" — passing a prop down through five components that don\'t actually need it, just so it reaches the sixth one that does. You create a Context, provide a value at some point in the tree, and any descendant can read it directly.',
          'The trade-off: every component that consumes a Context re-renders whenever that Context\'s value changes — even if the component only cares about part of it. Context is not built for frequently-changing data.',
        ],
        code: `<span class="c-keyword">const</span> ThemeCtx = createContext(<span class="c-str">'light'</span>);

<span class="c-comment">// Provide once, near the root</span>
&lt;<span class="c-tag">ThemeCtx.Provider</span> value={theme}&gt;
  &lt;<span class="c-tag">App</span> /&gt;
&lt;/<span class="c-tag">ThemeCtx.Provider</span>&gt;

<span class="c-comment">// Consume anywhere below — no prop drilling needed</span>
<span class="c-keyword">function</span> <span class="c-fn">ThemedButton</span>() {
  <span class="c-keyword">const</span> theme = useContext(ThemeCtx);
  <span class="c-keyword">return</span> &lt;<span class="c-tag">button</span> className={theme}&gt;Click&lt;/<span class="c-tag">button</span>&gt;;
}`,
        interviewTip: '💡 Context is NOT a state management library — it\'s just a way to skip prop drilling for rarely-changing values (theme, auth user, locale). For state that updates often, reach for Zustand or Redux instead.',
      },
      {
        title: 'Redux Architecture',
        description: [
          'Redux keeps your entire application state in one single, immutable tree (the "store"). Nothing is allowed to mutate state directly — instead, you describe WHAT happened by dispatching an action, and a pure reducer function decides what the new state should look like.',
          'This one-way data flow (dispatch action → reducer → new state → UI re-renders) makes state changes predictable and easy to debug — you can literally log every action and replay them.',
        ],
        code: `<span class="c-comment">// 1. Action — plain object describing WHAT happened</span>
<span class="c-keyword">const</span> action = { type: <span class="c-str">'cart/add'</span>, payload: { id: <span class="c-num">7</span> } };

<span class="c-comment">// 2. Reducer — pure function: (oldState, action) => newState</span>
<span class="c-keyword">function</span> <span class="c-fn">cartReducer</span>(state = [], action) {
  <span class="c-keyword">switch</span> (action.type) {
    <span class="c-keyword">case</span> <span class="c-str">'cart/add'</span>: <span class="c-keyword">return</span> [...state, action.payload];
    <span class="c-keyword">default</span>: <span class="c-keyword">return</span> state;
  }
}

<span class="c-comment">// 3. Flow: dispatch(action) → middleware → reducer → store updates → components re-render</span>
store.dispatch(action);`,
        interviewTip: '💡 Use Redux Toolkit (RTK) in real projects — it removes almost all the boilerplate (no more manual action types/creators) and includes RTK Query for server-state caching out of the box.',
      },
      {
        title: 'Zustand — Lightweight State Management',
        description: [
          'Zustand is a small state library that skips most of Redux\'s ceremony — no Provider wrapping your app, no action types, no reducers. You define a store as a simple hook and call it wherever you need it.',
          'Unlike Context, components using Zustand only re-render when the specific slice of state they selected actually changes — so it doesn\'t have Context\'s "everyone re-renders" problem.',
        ],
        code: `<span class="c-keyword">import</span> { create } <span class="c-keyword">from</span> <span class="c-str">'zustand'</span>;

<span class="c-comment">// Define the store — state + the functions that update it, together</span>
<span class="c-keyword">const</span> useCartStore = create((set) =&gt; ({
  items: [],
  addItem: (item) =&gt; set((state) =&gt; ({ items: [...state.items, item] })),
}));

<span class="c-comment">// Use it directly in any component — no Provider needed</span>
<span class="c-keyword">function</span> <span class="c-fn">CartBadge</span>() {
  <span class="c-keyword">const</span> count = useCartStore((state) =&gt; state.items.length); <span class="c-comment">// selector — only re-renders on count change</span>
  <span class="c-keyword">return</span> &lt;<span class="c-tag">span</span>&gt;{count}&lt;/<span class="c-tag">span</span>&gt;;
}`,
        interviewTip: '💡 <strong>Interview:</strong> "Redux vs Zustand — when would you pick one over the other?" → Redux for large teams that need strict conventions, DevTools time-travel, and middleware; Zustand for smaller/faster projects where you want less boilerplate.',
      },
    ],
  },
  {
    id: 5, title: 'Forms & Inputs', sub: 'Controlled, Uncontrolled, Validation',
    color: '#34d399', level: 'junior',
    concepts: [
      {
        title: 'Controlled vs Uncontrolled Components',
        description: [
          'Controlled: React state is the single source of truth for the input\'s value — you set value={state} and update state on every onChange. This gives you full control (validate as they type, format input, disable the submit button conditionally).',
          'Uncontrolled: the DOM itself holds the value, and you only read it when you need it (usually via a ref), similar to plain HTML forms. Simpler for basic cases, but harder to validate live.',
        ],
        code: `<span class="c-comment">// Controlled — React is the source of truth</span>
<span class="c-keyword">const</span> [email, setEmail] = useState(<span class="c-str">''</span>);
&lt;<span class="c-tag">input</span> value={email} onChange={e =&gt; setEmail(e.target.value)} /&gt;

<span class="c-comment">// Uncontrolled — the DOM holds the value, read it on demand</span>
<span class="c-keyword">const</span> nameRef = useRef();
&lt;<span class="c-tag">input</span> ref={nameRef} defaultValue=<span class="c-str">"initial"</span> /&gt;
<span class="c-comment">// later: nameRef.current.value</span>`,
        interviewTip: '💡 Use controlled inputs for real-time validation or when other UI depends on the value as you type. Use uncontrolled for simple forms, file inputs (they must be uncontrolled), or wrapping third-party DOM widgets.',
      },
      {
        title: 'Form Validation Patterns',
        description: [
          'Validation usually happens at two moments: on every keystroke (live feedback, can feel noisy) or on blur/submit (calmer, standard UX). Most production apps validate on blur and again on submit as a final check.',
          'For anything beyond a couple of fields, a library like React Hook Form is worth using — it minimizes re-renders (uncontrolled under the hood) and handles error state, touched/dirty tracking, and schema validation for you.',
        ],
        code: `<span class="c-keyword">import</span> { useForm } <span class="c-keyword">from</span> <span class="c-str">'react-hook-form'</span>;

<span class="c-keyword">function</span> <span class="c-fn">SignupForm</span>() {
  <span class="c-keyword">const</span> { register, handleSubmit, formState: { errors } } = useForm();

  <span class="c-keyword">const</span> onSubmit = (data) =&gt; console.log(data);

  <span class="c-keyword">return</span> (
    &lt;<span class="c-tag">form</span> onSubmit={handleSubmit(onSubmit)}&gt;
      &lt;<span class="c-tag">input</span> {...register(<span class="c-str">'email'</span>, { required: <span class="c-str">'Email is required'</span> })} /&gt;
      {errors.email &amp;&amp; &lt;<span class="c-tag">span</span>&gt;{errors.email.message}&lt;/<span class="c-tag">span</span>&gt;}
      &lt;<span class="c-tag">button</span> type=<span class="c-str">"submit"</span>&gt;Sign up&lt;/<span class="c-tag">button</span>&gt;
    &lt;/<span class="c-tag">form</span>&gt;
  );
}`,
        interviewTip: '💡 <strong>Interview:</strong> React Hook Form keeps inputs uncontrolled internally, which is why it avoids the re-render-on-every-keystroke cost that plain useState-based forms have on large forms.',
      },
    ],
  },
  {
    id: 6, title: 'Events & DOM', sub: 'Synthetic Events, Delegation, Bubbling',
    color: '#f472b6', level: 'junior',
    concepts: [
      {
        title: 'Synthetic Events',
        description: [
          'React doesn\'t hand you the raw browser event — it wraps it in a SyntheticEvent object that behaves the same way across all browsers, so you don\'t have to write browser-specific code.',
          'In React 17+, event listeners are attached to the root container your app is mounted in (not to document like older React did) — this fixes conflicts when mixing React with other libraries on the same page.',
        ],
        code: `<span class="c-keyword">function</span> <span class="c-fn">Form</span>() {
  <span class="c-keyword">const</span> handleSubmit = (e) =&gt; {
    e.preventDefault();       <span class="c-comment">// same API as a native event</span>
    console.log(e.target.elements.email.value);
  };
  <span class="c-keyword">return</span> &lt;<span class="c-tag">form</span> onSubmit={handleSubmit}&gt;...&lt;/<span class="c-tag">form</span>&gt;;
}`,
        interviewTip: '💡 e.stopPropagation() stops the event from bubbling further up. e.nativeEvent gives you the raw underlying DOM event if you ever need it.',
      },
      {
        title: 'Event Bubbling & Delegation',
        description: [
          'Events "bubble" — they fire on the element clicked first, then travel up through every parent. React (and the DOM) both use this by default, which is why clicking a child can also trigger a handler on its parent.',
          'Event delegation uses this behavior on purpose: instead of attaching a listener to every single list item, you attach ONE listener to the parent and check event.target to figure out which child was actually clicked. Fewer listeners, better performance for long lists.',
        ],
        code: `<span class="c-keyword">function</span> <span class="c-fn">TodoList</span>({ items }) {
  <span class="c-keyword">const</span> handleClick = (e) =&gt; {
    <span class="c-keyword">const</span> id = e.target.dataset.id;
    <span class="c-keyword">if</span> (id) console.log(<span class="c-str">'Clicked item:'</span>, id); <span class="c-comment">// one listener, many items</span>
  };

  <span class="c-keyword">return</span> (
    &lt;<span class="c-tag">ul</span> onClick={handleClick}&gt;
      {items.map(i =&gt; &lt;<span class="c-tag">li</span> key={i.id} data-id={i.id}&gt;{i.text}&lt;/<span class="c-tag">li</span>&gt;)}
    &lt;/<span class="c-tag">ul</span>&gt;
  );
}`,
        interviewTip: '💡 React already delegates events internally (to the root container), so manual delegation like above is mostly useful for very large or dynamically-changing lists where you want to avoid per-item handler churn.',
      },
    ],
  },
  {
    id: 7, title: 'Component Patterns', sub: 'HOC, Render Props, Compound Components',
    color: '#fb923c', level: 'mid',
    concepts: [
      {
        title: 'Higher-Order Components (HOC)',
        description: [
          'An HOC is a function that takes a component and returns a new, enhanced component — the pattern is literally "component in, component out". It\'s used for cross-cutting concerns that many components need: auth checks, logging, injecting shared data.',
          'HOCs have mostly been replaced by custom hooks in modern React because hooks avoid "wrapper hell" (deeply nested wrapping components) and don\'t obscure props the way HOCs can.',
        ],
        code: `<span class="c-keyword">function</span> <span class="c-fn">withAuth</span>(Component) {
  <span class="c-keyword">return function</span> <span class="c-fn">AuthGuard</span>(props) {
    <span class="c-keyword">const</span> { user } = useAuth();
    <span class="c-keyword">if</span> (!user) <span class="c-keyword">return</span> &lt;<span class="c-tag">Redirect</span> to=<span class="c-str">"/login"</span> /&gt;;
    <span class="c-keyword">return</span> &lt;<span class="c-tag">Component</span> {...props} user={user} /&gt;; <span class="c-comment">// pass original props through, plus extras</span>
  };
}

<span class="c-comment">// Usage</span>
<span class="c-keyword">const</span> ProtectedDashboard = withAuth(Dashboard);</span>`,
        interviewTip: '💡 Custom hooks are the modern default. Reach for an HOC only when you truly need to wrap JSX (like adding a wrapper <div>) or you\'re working in a legacy class-component codebase.',
      },
      {
        title: 'Custom Hooks',
        description: [
          'A custom hook is just a regular JavaScript function whose name starts with "use" — that naming convention is what tells React (and the linter) it\'s allowed to call other hooks inside it.',
          'Custom hooks let you extract and reuse stateful logic (data fetching, form handling, subscriptions) across multiple components without repeating the same useState/useEffect code everywhere.',
        ],
        code: `<span class="c-keyword">function</span> <span class="c-fn">useFetch</span>(url) {
  <span class="c-keyword">const</span> [data, setData] = useState(<span class="c-kw2">null</span>);
  <span class="c-keyword">const</span> [loading, setLoading] = useState(<span class="c-kw2">true</span>);

  useEffect(() =&gt; {
    <span class="c-keyword">let</span> cancelled = <span class="c-kw2">false</span>;
    fetch(url).then(r =&gt; r.json()).then(d =&gt; {
      <span class="c-keyword">if</span> (!cancelled) { setData(d); setLoading(<span class="c-kw2">false</span>); }
    });
    <span class="c-keyword">return</span> () =&gt; { cancelled = <span class="c-kw2">true</span>; }; <span class="c-comment">// avoid setting state after unmount</span>
  }, [url]);

  <span class="c-keyword">return</span> { data, loading };
}

<span class="c-comment">// Usage — feels like a built-in hook</span>
<span class="c-keyword">const</span> { data, loading } = useFetch(<span class="c-str">'/api/user'</span>);`,
        interviewTip: '💡 <strong>Interview:</strong> Custom hooks don\'t share STATE between components — each component calling useFetch() gets its own independent state. They only share the LOGIC, not the data.',
      },
      {
        title: 'Compound Components',
        description: [
          'A compound component is a set of components that work together to form one cohesive UI unit, sharing implicit state via Context — similar to how a native <select> and its <option> children work together.',
          'This pattern gives the consumer flexibility to arrange the pieces however they like, while the parent quietly manages the shared state (like "which tab is active") behind the scenes.',
        ],
        code: `<span class="c-keyword">const</span> TabsCtx = createContext();

<span class="c-keyword">function</span> <span class="c-fn">Tabs</span>({ children, defaultTab }) {
  <span class="c-keyword">const</span> [active, setActive] = useState(defaultTab);
  <span class="c-keyword">return</span> &lt;<span class="c-tag">TabsCtx.Provider</span> value={{ active, setActive }}&gt;{children}&lt;/<span class="c-tag">TabsCtx.Provider</span>&gt;;
}
Tabs.Tab = ({ id, children }) =&gt; {
  <span class="c-keyword">const</span> { active, setActive } = useContext(TabsCtx);
  <span class="c-keyword">return</span> &lt;<span class="c-tag">button</span> onClick={() =&gt; setActive(id)} aria-selected={active === id}&gt;{children}&lt;/<span class="c-tag">button</span>&gt;;
};

<span class="c-comment">// Usage — the consumer controls the layout, Tabs manages the state</span>
&lt;<span class="c-tag">Tabs</span> defaultTab=<span class="c-str">"profile"</span>&gt;
  &lt;<span class="c-tag">Tabs.Tab</span> id=<span class="c-str">"profile"</span>&gt;Profile&lt;/<span class="c-tag">Tabs.Tab</span>&gt;
  &lt;<span class="c-tag">Tabs.Tab</span> id=<span class="c-str">"settings"</span>&gt;Settings&lt;/<span class="c-tag">Tabs.Tab</span>&gt;
&lt;/<span class="c-tag">Tabs</span>&gt;</span>`,
        interviewTip: '💡 Real-world examples: Radix UI and Headless UI are built almost entirely on this pattern. It\'s worth naming one if asked for a real-world example in an interview.',
      },
    ],
  },
  {
    id: 8, title: 'Performance & Optimization', sub: 'React.memo, Code Splitting, Virtualization',
    color: '#22d3ee', level: 'mid',
    concepts: [
      {
        title: 'React.memo & Stable References',
        description: [
          'React.memo wraps a component so React can skip re-rendering it when its props haven\'t actually changed — React does a shallow comparison of the old props vs new props.',
          'The catch: this only works if the props are referentially stable. If you pass an inline function or a new object literal as a prop, it\'s a brand-new reference every render, so React.memo thinks "props changed" even when the data is identical.',
        ],
        code: `<span class="c-keyword">const</span> Item = React.memo(<span class="c-keyword">function</span> <span class="c-fn">Item</span>({ id, onClick }) {
  <span class="c-keyword">return</span> &lt;<span class="c-tag">li</span> onClick={() =&gt; onClick(id)}&gt;{id}&lt;/<span class="c-tag">li</span>&gt;;
});

<span class="c-comment">// The parent MUST stabilize the function prop, or memo is pointless</span>
<span class="c-keyword">const</span> handleClick = useCallback(id =&gt; select(id), []);
&lt;<span class="c-tag">Item</span> id={<span class="c-num">1</span>} onClick={handleClick} /&gt;</span>`,
        interviewTip: '💡 Always profile with React DevTools Profiler BEFORE adding memoization. Wrapping everything in React.memo "just in case" adds comparison overhead and complexity without guaranteed benefit — optimize what\'s actually measured to be slow.',
      },
      {
        title: 'Code Splitting & Lazy Loading',
        description: [
          'By default, your whole app ships as one big JavaScript bundle the user has to download before anything renders. Code splitting breaks that bundle into smaller chunks that load only when needed.',
          'React.lazy() + Suspense is the built-in way to do this for components — the chunk for a route or a heavy widget downloads only when the user actually navigates there or opens it.',
        ],
        code: `<span class="c-keyword">const</span> Dashboard = React.lazy(() =&gt; <span class="c-keyword">import</span>(<span class="c-str">'./Dashboard'</span>));

<span class="c-keyword">function</span> <span class="c-fn">App</span>() {
  <span class="c-keyword">return</span> (
    &lt;<span class="c-tag">Suspense</span> fallback={&lt;<span class="c-tag">Spinner</span> /&gt;}&gt;
      &lt;<span class="c-tag">Dashboard</span> /&gt; <span class="c-comment">// downloads its own JS chunk only when rendered</span>
    &lt;/<span class="c-tag">Suspense</span>&gt;
  );
}`,
        interviewTip: '💡 Route-level code splitting is the biggest, easiest win — split by page/route first (React Router supports this natively), then only split individual heavy components if bundle analysis shows it\'s worth it.',
      },
      {
        title: 'List Virtualization',
        description: [
          'Rendering a list of 10,000 items all at once creates 10,000 real DOM nodes — even though the user can only see maybe 15 of them on screen at a time. That\'s wasted memory and a slow initial render.',
          'Virtualization (windowing) only renders the items currently visible in the viewport (plus a small buffer), and recycles DOM nodes as the user scrolls — libraries like react-window or react-virtualized handle the math for you.',
        ],
        code: `<span class="c-keyword">import</span> { FixedSizeList } <span class="c-keyword">from</span> <span class="c-str">'react-window'</span>;

<span class="c-keyword">function</span> <span class="c-fn">BigList</span>({ items }) {
  <span class="c-keyword">const</span> Row = ({ index, style }) =&gt; (
    &lt;<span class="c-tag">div</span> style={style}&gt;{items[index].name}&lt;/<span class="c-tag">div</span>&gt; <span class="c-comment">// "style" positions the row absolutely</span>
  );

  <span class="c-keyword">return</span> (
    &lt;<span class="c-tag">FixedSizeList</span> height={<span class="c-num">400</span>} itemCount={items.length} itemSize={<span class="c-num">35</span>} width={<span class="c-num">300</span>}&gt;
      {Row}
    &lt;/<span class="c-tag">FixedSizeList</span>&gt;
  );
}`,
        interviewTip: '💡 <strong>Interview:</strong> "How would you render a list of 100,000 rows without freezing the browser?" → Virtualization. This exact question comes up often for senior frontend roles — mention react-window by name.',
      },
    ],
  },
  {
    id: 9, title: 'Advanced React APIs', sub: 'Portals, Error Boundaries, forwardRef',
    color: '#e879f9', level: 'senior',
    concepts: [
      {
        title: 'Portals',
        description: [
          'ReactDOM.createPortal lets you render a component\'s children into a DIFFERENT DOM node than where the component sits in the tree — while keeping it logically part of the React tree (context, event bubbling still work normally).',
          'This is the standard fix for modals, tooltips, and dropdowns that need to visually "escape" a parent with overflow: hidden or a fixed z-index stacking context.',
        ],
        code: `<span class="c-keyword">function</span> <span class="c-fn">Modal</span>({ children }) {
  <span class="c-keyword">return</span> ReactDOM.createPortal(
    &lt;<span class="c-tag">div</span> className=<span class="c-str">"modal-overlay"</span>&gt;{children}&lt;/<span class="c-tag">div</span>&gt;,
    document.getElementById(<span class="c-str">'modal-root'</span>) <span class="c-comment">// a separate <div> outside the app root</span>
  );
}`,
        interviewTip: '💡 A React event fired inside a Portal still bubbles up through the REACT tree (to Modal\'s parent), not through the DOM tree it was physically inserted into — this trips people up in interviews, know it cold.',
      },
      {
        title: 'Error Boundaries',
        description: [
          'An Error Boundary is a component that catches JavaScript errors thrown anywhere in its child tree during rendering, and shows a fallback UI instead of crashing the whole app white-screen.',
          'They currently MUST be class components — there is no hook equivalent yet, because the error-catching lifecycle methods (getDerivedStateFromError, componentDidCatch) don\'t have a hook version.',
        ],
        code: `<span class="c-keyword">class</span> <span class="c-fn">ErrorBoundary</span> <span class="c-keyword">extends</span> React.Component {
  state = { hasError: <span class="c-kw2">false</span> };

  <span class="c-keyword">static</span> getDerivedStateFromError() {
    <span class="c-keyword">return</span> { hasError: <span class="c-kw2">true</span> }; <span class="c-comment">// triggers the fallback UI</span>
  }

  componentDidCatch(error, info) {
    logErrorToService(error, info); <span class="c-comment">// send to Sentry/monitoring</span>
  }

  render() {
    <span class="c-keyword">if</span> (this.state.hasError) <span class="c-keyword">return</span> &lt;<span class="c-tag">h2</span>&gt;Something went wrong.&lt;/<span class="c-tag">h2</span>&gt;;
    <span class="c-keyword">return</span> this.props.children;
  }
}`,
        interviewTip: '💡 Error boundaries do NOT catch errors in event handlers, async code (setTimeout/Promises), or during server-side rendering — only errors thrown during the render phase of a child component.',
      },
      {
        title: 'forwardRef & useImperativeHandle',
        description: [
          'By default, refs don\'t pass through a component — you can\'t do <MyInput ref={r} /> and expect it to work, because "ref" isn\'t a normal prop. forwardRef explicitly lets a component accept a ref and forward it to a DOM node inside.',
          'useImperativeHandle goes one step further — instead of exposing the raw DOM node, it lets you expose a custom, limited set of methods (like focus(), or clear()) to the parent, hiding your internal implementation.',
        ],
        code: `<span class="c-keyword">const</span> FancyInput = forwardRef((props, ref) =&gt; {
  <span class="c-keyword">const</span> inputRef = useRef();

  useImperativeHandle(ref, () =&gt; ({
    focus: () =&gt; inputRef.current.focus(),      <span class="c-comment">// only expose what's needed</span>
    clear: () =&gt; { inputRef.current.value = <span class="c-str">''</span>; },
  }));

  <span class="c-keyword">return</span> &lt;<span class="c-tag">input</span> ref={inputRef} {...props} /&gt;;
});

<span class="c-comment">// Parent gets a clean, limited API — not the raw DOM node</span>
<span class="c-keyword">const</span> ref = useRef();
&lt;<span class="c-tag">FancyInput</span> ref={ref} /&gt;
ref.current.focus();</span>`,
        interviewTip: '💡 Use this sparingly — it\'s an "escape hatch" from React\'s normal data-down, callback-up flow. Reach for it only for things state genuinely can\'t express well, like focus management or scroll position.',
      },
    ],
  },
  {
    id: 10, title: 'Networking & Async', sub: 'Fetch, AbortController, Race Conditions',
    color: '#4ade80', level: 'mid',
    concepts: [
      {
        title: 'Race Conditions in useEffect',
        description: [
          'Imagine a user typing into a search box quickly — each keystroke can fire a new fetch call. Because network requests don\'t always resolve in the order they were sent, a slower EARLIER request can resolve AFTER a faster LATER one, overwriting the correct, newer results with stale data.',
          'The fix is to cancel the in-flight request whenever the effect re-runs (or the component unmounts) — AbortController is the browser-native way to do this.',
        ],
        code: `useEffect(() =&gt; {
  <span class="c-keyword">const</span> ctrl = <span class="c-keyword">new</span> AbortController();

  fetch(<span class="c-str">\`/api/search?q=\${query}\`</span>, { signal: ctrl.signal })
    .then(r =&gt; r.json())
    .then(setData)
    .catch(e =&gt; {
      <span class="c-keyword">if</span> (e.name !== <span class="c-str">'AbortError'</span>) <span class="c-keyword">throw</span> e; <span class="c-comment">// ignore expected cancellations</span>
    });

  <span class="c-keyword">return</span> () =&gt; ctrl.abort(); <span class="c-comment">// cancel this request when "query" changes again, or on unmount</span>
}, [query]);`,
        interviewTip: '💡 This is THE correct pattern for async data fetching in useEffect — memorize it. Interviewers specifically ask "how do you handle race conditions in a search box" and expect AbortController by name.',
      },
      {
        title: 'Loading / Error / Data States',
        description: [
          'Every async request in a UI really has (at minimum) three states to handle: loading, error, and success-with-data. Forgetting any one of them is the #1 source of "blank screen" or "stuck spinner" bugs in real apps.',
          'A simple pattern is to track all three explicitly rather than inferring them from each other (e.g. don\'t assume "not loading and no data" means "error" — it might just mean "hasn\'t fetched yet").',
        ],
        code: `<span class="c-keyword">function</span> <span class="c-fn">UserProfile</span>({ id }) {
  <span class="c-keyword">const</span> [state, setState] = useState({ status: <span class="c-str">'idle'</span>, data: <span class="c-kw2">null</span>, error: <span class="c-kw2">null</span> });

  useEffect(() =&gt; {
    setState({ status: <span class="c-str">'loading'</span>, data: <span class="c-kw2">null</span>, error: <span class="c-kw2">null</span> });
    fetch(<span class="c-str">\`/api/users/\${id}\`</span>)
      .then(r =&gt; r.json())
      .then(data =&gt; setState({ status: <span class="c-str">'success'</span>, data, error: <span class="c-kw2">null</span> }))
      .catch(error =&gt; setState({ status: <span class="c-str">'error'</span>, data: <span class="c-kw2">null</span>, error }));
  }, [id]);

  <span class="c-keyword">if</span> (state.status === <span class="c-str">'loading'</span>) <span class="c-keyword">return</span> &lt;<span class="c-tag">Spinner</span> /&gt;;
  <span class="c-keyword">if</span> (state.status === <span class="c-str">'error'</span>)   <span class="c-keyword">return</span> &lt;<span class="c-tag">ErrorMsg</span> error={state.error} /&gt;;
  <span class="c-keyword">return</span> &lt;<span class="c-tag">Profile</span> user={state.data} /&gt;;
}`,
        interviewTip: '💡 In production, this whole pattern (loading/error/data + caching + retries) is exactly what React Query / TanStack Query gives you for free — mention that you\'d reach for it instead of hand-rolling this in a real project.',
      },
    ],
  },
  {
    id: 11, title: 'Testing React', sub: 'Testing Library, Mocking, MSW',
    color: '#f59e0b', level: 'mid',
    concepts: [
      {
        title: 'React Testing Library Philosophy',
        description: [
          'The core idea: test your component the way a USER would use it, not the way it\'s implemented internally. Query by role, label, or visible text — not by className or internal component state.',
          'This means your tests keep passing even if you refactor the component\'s internals (change from class to function, rename an internal variable), and only break when the actual user-facing behavior changes — which is exactly what you want from a test.',
        ],
        code: `<span class="c-keyword">import</span> { render, screen } <span class="c-keyword">from</span> <span class="c-str">'@testing-library/react'</span>;
<span class="c-keyword">import</span> userEvent <span class="c-keyword">from</span> <span class="c-str">'@testing-library/user-event'</span>;

test(<span class="c-str">'submits the form with valid input'</span>, <span class="c-keyword">async</span> () =&gt; {
  render(&lt;<span class="c-tag">LoginForm</span> /&gt;);

  <span class="c-keyword">await</span> userEvent.type(screen.getByLabelText(<span class="c-str">'Email'</span>), <span class="c-str">'a@b.com'</span>);
  <span class="c-keyword">await</span> userEvent.click(screen.getByRole(<span class="c-str">'button'</span>, { name: <span class="c-str">/submit/i</span> }));

  expect(screen.getByText(<span class="c-str">'Success'</span>)).toBeInTheDocument();
});`,
        interviewTip: '💡 getByRole is the gold-standard query — it also verifies your markup is accessible (a button with no accessible name won\'t be found), so it doubles as an accessibility check.',
      },
      {
        title: 'Mocking APIs with MSW',
        description: [
          'MSW (Mock Service Worker) intercepts actual network requests at the network level, so your component code doesn\'t know or care that it\'s being tested — it calls fetch() exactly as it would in production, and MSW returns a fake response.',
          'This is more reliable than manually mocking fetch or axios in every test file, because you write realistic API handlers once and reuse them across your entire test suite (and even in local development).',
        ],
        code: `<span class="c-keyword">import</span> { rest } <span class="c-keyword">from</span> <span class="c-str">'msw'</span>;
<span class="c-keyword">import</span> { setupServer } <span class="c-keyword">from</span> <span class="c-str">'msw/node'</span>;

<span class="c-keyword">const</span> server = setupServer(
  rest.get(<span class="c-str">'/api/user'</span>, (req, res, ctx) =&gt;
    res(ctx.json({ id: <span class="c-num">1</span>, name: <span class="c-str">'Ada'</span> }))
  )
);

beforeAll(() =&gt; server.listen());
afterEach(() =&gt; server.resetHandlers());
afterAll(() =&gt; server.close());

test(<span class="c-str">'renders the user name'</span>, <span class="c-keyword">async</span> () =&gt; {
  render(&lt;<span class="c-tag">UserProfile</span> /&gt;);
  expect(<span class="c-keyword">await</span> screen.findByText(<span class="c-str">'Ada'</span>)).toBeInTheDocument();
});`,
        interviewTip: '💡 <strong>Interview:</strong> "Why MSW over jest.mock(\'axios\')?" → MSW tests the real request/response cycle (URL, method, headers), catching bugs that a hand-mocked function would silently hide.',
      },
    ],
  },
  {
    id: 12, title: 'React Architecture', sub: 'Folder Structure, Feature Slices, Containers',
    color: '#818cf8', level: 'senior',
    concepts: [
      {
        title: 'Feature-Based Folder Structure',
        description: [
          'Instead of grouping files by TYPE (one giant components/ folder, one giant hooks/ folder), group them by FEATURE. Everything related to "cart" — its component, its hook, its Redux slice, its tests — lives in one folder together.',
          'This scales far better as a codebase grows: when you touch a feature, everything related is right next to it, and it\'s obvious what\'s safe to delete when a feature is removed.',
        ],
        list: [
          'src/features/auth/ — AuthForm.jsx, useAuth.js, authSlice.js, AuthForm.test.jsx',
          'src/features/cart/ — CartPanel.jsx, useCart.js, cartSlice.js',
          'src/shared/ — Button.jsx, Modal.jsx, api.js, utils.js (things genuinely used everywhere)',
        ],
        interviewTip: '💡 When a file changes, its related code and its tests should ideally be findable in the same folder. Ask yourself: "if I delete this feature folder, does the app still make sense?" If yes, the boundary is right.',
      },
      {
        title: 'Container vs Presentational Components',
        description: [
          'A "container" component handles logic — fetching data, managing state, talking to Redux — and passes plain data down as props. A "presentational" component just receives props and renders UI, with no idea where the data came from.',
          'This split has become less rigid since hooks arrived (a lot of what containers did is now a custom hook), but the underlying principle — separate "how data is fetched" from "how it looks" — is still valuable for testability and reuse.',
        ],
        code: `<span class="c-comment">// Presentational — pure, easy to test, easy to reuse with different data</span>
<span class="c-keyword">function</span> <span class="c-fn">UserCard</span>({ name, avatarUrl }) {
  <span class="c-keyword">return</span> (
    &lt;<span class="c-tag">div</span>&gt;
      &lt;<span class="c-tag">img</span> src={avatarUrl} alt={name} /&gt;
      &lt;<span class="c-tag">p</span>&gt;{name}&lt;/<span class="c-tag">p</span>&gt;
    &lt;/<span class="c-tag">div</span>&gt;
  );
}

<span class="c-comment">// Container (or a custom hook) — owns the data-fetching logic</span>
<span class="c-keyword">function</span> <span class="c-fn">UserCardContainer</span>({ id }) {
  <span class="c-keyword">const</span> { data } = useFetch(<span class="c-str">\`/api/users/\${id}\`</span>);
  <span class="c-keyword">if</span> (!data) <span class="c-keyword">return</span> <span class="c-kw2">null</span>;
  <span class="c-keyword">return</span> &lt;<span class="c-tag">UserCard</span> name={data.name} avatarUrl={data.avatar} /&gt;;
}`,
        interviewTip: '💡 If asked "is this pattern still relevant with hooks?" → say custom hooks now handle most of what a "container" did, but the core separation of concerns is still good practice — just applied differently.',
      },
    ],
  },
  {
    id: 13, title: 'Edge Cases & Debugging', sub: 'Stale Closures, Memory Leaks, Keys',
    color: '#f87171', level: 'senior',
    concepts: [
      {
        title: 'Stale Closures',
        description: [
          'A "stale closure" happens when a function (inside useEffect, setTimeout, or an event listener) captures an OLD value of a variable from the render it was created in, and keeps using that old value even after state has since changed.',
          'This is one of the most common subtle hook bugs — the code runs without errors, it just silently uses outdated data.',
        ],
        code: `<span class="c-comment">// Bug: "count" inside the interval is always 0, frozen from the first render</span>
useEffect(() =&gt; {
  <span class="c-keyword">const</span> id = setInterval(() =&gt; console.log(count), <span class="c-num">1000</span>);
  <span class="c-keyword">return</span> () =&gt; clearInterval(id);
}, []); <span class="c-comment">// ← missing "count" in the dependency array</span>

<span class="c-comment">// Fix 1: add the dependency (interval resets each time count changes)</span>
useEffect(() =&gt; {
  <span class="c-keyword">const</span> id = setInterval(() =&gt; console.log(count), <span class="c-num">1000</span>);
  <span class="c-keyword">return</span> () =&gt; clearInterval(id);
}, [count]);

<span class="c-comment">// Fix 2: use a functional update so you never need "count" in scope at all</span>
setInterval(() =&gt; setCount(c =&gt; c + <span class="c-num">1</span>), <span class="c-num">1000</span>);</span>`,
        interviewTip: '💡 Stale closures are the #1 source of subtle bugs with hooks. Install eslint-plugin-react-hooks — its "exhaustive-deps" rule catches most of these automatically before they ship.',
      },
      {
        title: 'Keys & List Reconciliation Bugs',
        description: [
          'React uses the "key" prop to match items in a new list back to items in the old list, so it knows what to update, add, or remove — instead of re-creating the whole list every time.',
          'Using the array INDEX as a key seems convenient but breaks badly when items are reordered, inserted, or removed — React matches by position, not identity, so state can end up attached to the wrong item (a classic bug: the wrong row\'s checkbox stays checked after deleting an earlier row).',
        ],
        code: `<span class="c-comment">// ❌ Bad — index as key breaks when the list is reordered/filtered</span>
{items.map((item, i) =&gt; &lt;<span class="c-tag">Row</span> key={i} data={item} /&gt;)}

<span class="c-comment">// ✅ Good — a stable, unique ID that doesn't change if the list is reordered</span>
{items.map(item =&gt; &lt;<span class="c-tag">Row</span> key={item.id} data={item} /&gt;)}</span>`,
        interviewTip: '💡 <strong>Interview:</strong> "Why is using array index as a key bad?" → Because React uses keys purely for identity matching between renders — if the list can be reordered, filtered, or have items removed, index-as-key causes state (like input values, checkboxes) to attach to the wrong DOM element.',
      },
      {
        title: 'Memory Leaks from Unfinished Async Work',
        description: [
          'If a component fetches data and then unmounts before the fetch finishes, calling setState() when the fetch resolves will warn "can\'t perform a state update on an unmounted component" — and in more complex cases, can genuinely hold onto memory the component should have released.',
          'The fix is always the same shape: track whether the component is still mounted (or use AbortController), and skip the state update if it isn\'t.',
        ],
        code: `useEffect(() =&gt; {
  <span class="c-keyword">let</span> isMounted = <span class="c-kw2">true</span>;

  fetchUser(id).then(user =&gt; {
    <span class="c-keyword">if</span> (isMounted) setUser(user); <span class="c-comment">// only update state if we're still mounted</span>
  });

  <span class="c-keyword">return</span> () =&gt; { isMounted = <span class="c-kw2">false</span>; }; <span class="c-comment">// cleanup runs on unmount</span>
}, [id]);`,
        interviewTip: '💡 The isMounted flag pattern is fine, but AbortController (shown in the Networking section) is the more modern approach — it actually cancels the network request instead of just ignoring its result.',
      },
    ],
  },
  {
    id: 14, title: 'Browser & JS Fundamentals', sub: 'Event Loop, Closures, Debounce',
    color: '#fcd34d', level: 'mid',
    concepts: [
      {
        title: 'Event Loop & Task Queue',
        description: [
          'JavaScript runs on a single thread — it can only do one thing at a time. The event loop is the mechanism that decides what runs next: it processes the current call stack completely, then drains ALL pending microtasks (Promise callbacks), and only then runs ONE macrotask (like a setTimeout callback) before repeating.',
          'This ordering — sync code, then all microtasks, then one macrotask — explains almost every "what\'s the console.log order" interview question you\'ll ever be asked.',
        ],
        code: `console.log(<span class="c-str">'A'</span>);                                    <span class="c-comment">// sync — runs first</span>
setTimeout(() =&gt; console.log(<span class="c-str">'B'</span>), <span class="c-num">0</span>);           <span class="c-comment">// macrotask — runs last</span>
Promise.resolve().then(() =&gt; console.log(<span class="c-str">'C'</span>)); <span class="c-comment">// microtask — runs before macrotasks</span>
console.log(<span class="c-str">'D'</span>);                                    <span class="c-comment">// sync — runs second</span>

<span class="c-comment">// Output: A, D, C, B</span>
<span class="c-comment">// Rule:   all sync code → drain all microtasks → run one macrotask</span>`,
        interviewTip: '💡 Even setTimeout(fn, 0) doesn\'t run immediately — it still goes to the back of the macrotask queue, behind every microtask that\'s currently pending. This surprises people constantly.',
      },
      {
        title: 'Debouncing User Input',
        description: [
          'Debouncing means "wait for the user to stop, then act" — you delay running a function until a certain amount of time has passed with no new calls. Every new call resets the timer.',
          'It\'s the standard fix for search boxes, resize handlers, or anything that would otherwise fire an expensive operation (an API call, a heavy re-calculation) on every single keystroke or pixel of movement.',
        ],
        code: `<span class="c-keyword">function</span> <span class="c-fn">debounce</span>(fn, delay) {
  <span class="c-keyword">let</span> timer;
  <span class="c-keyword">return</span> (...args) =&gt; {
    clearTimeout(timer);                          <span class="c-comment">// cancel the previous pending call</span>
    timer = setTimeout(() =&gt; fn(...args), delay); <span class="c-comment">// schedule a fresh one</span>
  };
}

<span class="c-comment">// Only calls the API 300ms after the user stops typing</span>
<span class="c-keyword">const</span> debouncedSearch = debounce(query =&gt; fetchResults(query), <span class="c-num">300</span>);
searchInput.addEventListener(<span class="c-str">'input'</span>, e =&gt; debouncedSearch(e.target.value));`,
        interviewTip: '💡 Debounce = "wait for a quiet moment, then run once." Throttle = "run at most once every X ms, no matter how often it\'s called." Interviewers love asking you to explain the difference AND implement one from scratch on a whiteboard.',
      },
    ],
  },
  {
    id: 15, title: 'React 18+ Features', sub: 'Batching, Transitions, useDeferredValue',
    color: '#2dd4bf', level: 'senior',
    concepts: [
      {
        title: 'Automatic Batching',
        description: [
          'Before React 18, React only batched (grouped) multiple state updates into one re-render when they happened inside a React event handler — updates inside a setTimeout, a native event listener, or a Promise each triggered their own separate re-render.',
          'React 18 batches automatically everywhere by default, meaning multiple setState calls anywhere in your code become a single re-render — better performance, with no code changes needed on your part.',
        ],
        code: `<span class="c-comment">// React 18: BOTH updates below are batched into a single re-render</span>
setTimeout(() =&gt; {
  setCount(c =&gt; c + <span class="c-num">1</span>); <span class="c-comment">// ← batched</span>
  setName(<span class="c-str">'Alice'</span>);   <span class="c-comment">// ← batched, same render pass</span>
}, <span class="c-num">1000</span>);

<span class="c-comment">// If you ever NEED an immediate, synchronous update, opt out with flushSync</span>
<span class="c-keyword">import</span> { flushSync } <span class="c-keyword">from</span> <span class="c-str">'react-dom'</span>;
flushSync(() =&gt; setCount(c =&gt; c + <span class="c-num">1</span>)); <span class="c-comment">// forces an immediate render, use rarely</span>`,
        interviewTip: '💡 <strong>Interview:</strong> "What changed about batching in React 18?" → It became automatic everywhere (setTimeout, promises, native listeners), not just inside React\'s own event handlers like in React 17.',
      },
      {
        title: 'useDeferredValue',
        description: [
          'useDeferredValue gives you a "lagging" copy of a value — React will try to keep it up to date, but it will happily let it fall behind if there\'s more urgent work (like keeping a text input responsive) to do first.',
          'It\'s similar in spirit to startTransition, but for a VALUE you receive as a prop or from state, rather than an update you\'re triggering yourself.',
        ],
        code: `<span class="c-keyword">function</span> <span class="c-fn">SearchResults</span>({ query }) {
  <span class="c-keyword">const</span> deferredQuery = useDeferredValue(query); <span class="c-comment">// lags behind "query" under heavy load</span>
  <span class="c-keyword">const</span> results = useMemo(() =&gt; expensiveSearch(deferredQuery), [deferredQuery]);

  <span class="c-keyword">return</span> &lt;<span class="c-tag">ResultsList</span> results={results} /&gt;; <span class="c-comment">// input stays responsive; results update slightly delayed</span>
}`,
        interviewTip: '💡 useTransition is for updates YOU trigger (you call the setter inside startTransition). useDeferredValue is for values you RECEIVE and can\'t control the update of directly. Know when to use each.',
      },
      {
        title: 'Suspense for Data Fetching',
        description: [
          'Suspense originally only worked with React.lazy() for code splitting, but React 18 extends the pattern to data fetching too — a component can "suspend" (pause rendering) while it waits for data, and Suspense shows a fallback until it\'s ready.',
          'This lets you declare loading states at the boundary level (wrap a whole section in one <Suspense>) instead of manually tracking a loading flag inside every single component.',
        ],
        code: `&lt;<span class="c-tag">Suspense</span> fallback={&lt;<span class="c-tag">Spinner</span> /&gt;}&gt;
  &lt;<span class="c-tag">UserProfile</span> id={<span class="c-num">1</span>} /&gt;  <span class="c-comment">// this component "suspends" while its data loads</span>
&lt;/<span class="c-tag">Suspense</span>&gt;</span>`,
        interviewTip: '💡 Full data-fetching Suspense support currently needs a framework that implements it properly (like Next.js App Router) or a library built for it (React Query has experimental support) — plain useEffect + fetch does not suspend on its own.',
      },
    ],
  },
  {
    id: 16, title: 'React Ecosystem', sub: 'React Router, React Query, State Libs',
    color: '#60a5fa', level: 'junior',
    concepts: [
      {
        title: 'React Router v6',
        description: [
          'React Router handles client-side navigation — switching what\'s on screen based on the URL, without a full page reload. Version 6 uses a nested <Routes> model where routes can be defined declaratively and matched by best-fit.',
          'It also provides hooks for reading URL info and navigating programmatically, replacing older APIs like withRouter and the history object.',
        ],
        code: `&lt;<span class="c-tag">BrowserRouter</span>&gt;
  &lt;<span class="c-tag">Routes</span>&gt;
    &lt;<span class="c-tag">Route</span> path=<span class="c-str">"/"</span> element={&lt;<span class="c-tag">Home</span> /&gt;} /&gt;
    &lt;<span class="c-tag">Route</span> path=<span class="c-str">"/user/:id"</span> element={&lt;<span class="c-tag">User</span> /&gt;} /&gt;
  &lt;/<span class="c-tag">Routes</span>&gt;
&lt;/<span class="c-tag">BrowserRouter</span>&gt;

<span class="c-comment">// Inside a route's component:</span>
<span class="c-keyword">const</span> { id } = useParams();      <span class="c-comment">// read the ":id" from the URL</span>
<span class="c-keyword">const</span> navigate = useNavigate();
navigate(<span class="c-str">'/home'</span>);              <span class="c-comment">// go there programmatically, e.g. after a form submit</span>`,
        interviewTip: '💡 useParams reads dynamic URL segments, useSearchParams reads/writes query strings (?sort=asc), and useNavigate replaces the old history.push() — know all three, they cover most routing questions.',
      },
      {
        title: 'React Query / TanStack Query',
        description: [
          'React Query manages "server state" — data that lives on a server and needs fetching, caching, background refreshing, and eventual re-syncing — which is fundamentally different from local UI state like "is this dropdown open".',
          'Instead of hand-rolling useEffect + useState + loading/error flags for every API call, you describe a query key and a fetch function, and React Query handles caching, deduplication, retries, and refetching for you.',
        ],
        code: `<span class="c-keyword">import</span> { useQuery } <span class="c-keyword">from</span> <span class="c-str">'@tanstack/react-query'</span>;

<span class="c-keyword">function</span> <span class="c-fn">TodoList</span>() {
  <span class="c-keyword">const</span> { data, isLoading, error } = useQuery({
    queryKey: [<span class="c-str">'todos'</span>],
    queryFn: () =&gt; fetch(<span class="c-str">'/api/todos'</span>).then(r =&gt; r.json()),
    staleTime: <span class="c-num">5000</span>, <span class="c-comment">// treat cached data as fresh for 5 seconds</span>
  });

  <span class="c-keyword">if</span> (isLoading) <span class="c-keyword">return</span> &lt;<span class="c-tag">Spinner</span> /&gt;;
  <span class="c-keyword">if</span> (error)     <span class="c-keyword">return</span> &lt;<span class="c-tag">ErrorMsg</span> /&gt;;
  <span class="c-keyword">return</span> &lt;<span class="c-tag">ul</span>&gt;{data.map(t =&gt; &lt;<span class="c-tag">li</span> key={t.id}&gt;{t.text}&lt;/<span class="c-tag">li</span>&gt;)}&lt;/<span class="c-tag">ul</span>&gt;;
}`,
        interviewTip: '💡 Use React Query (or RTK Query) for server state — data from an API. Use Zustand/Redux for pure client UI state — modal open/closed, selected tab. Mixing the two up is a common junior mistake to call out.',
      },
    ],
  },
  {
    id: 17, title: 'React Coding Tasks', sub: 'Search, Infinite Scroll, Modal, Form',
    color: '#f9a8d4', level: 'junior',
    concepts: [
      {
        title: 'Debounced Search',
        description: [
          'A very common live-coding task: build a search input that only calls the API after the user pauses typing for ~300ms, instead of firing a request on every keystroke.',
          'This combines a few ideas you should already know: debouncing, useEffect cleanup, and handling loading/empty states — walk through each piece out loud when you implement it in an interview.',
        ],
        code: `<span class="c-keyword">function</span> <span class="c-fn">Search</span>() {
  <span class="c-keyword">const</span> [query, setQuery] = useState(<span class="c-str">''</span>);
  <span class="c-keyword">const</span> [results, setResults] = useState([]);

  useEffect(() =&gt; {
    <span class="c-keyword">if</span> (!query) { setResults([]); <span class="c-keyword">return</span>; }

    <span class="c-keyword">const</span> timer = setTimeout(() =&gt; {
      fetch(<span class="c-str">\`/api/search?q=\${query}\`</span>).then(r =&gt; r.json()).then(setResults);
    }, <span class="c-num">300</span>); <span class="c-comment">// wait for the user to pause</span>

    <span class="c-keyword">return</span> () =&gt; clearTimeout(timer); <span class="c-comment">// cancel the pending call if they type again</span>
  }, [query]);

  <span class="c-keyword">return</span> (
    &lt;&gt;
      &lt;<span class="c-tag">input</span> value={query} onChange={e =&gt; setQuery(e.target.value)} placeholder=<span class="c-str">"Search..."</span> /&gt;
      {results.map(r =&gt; &lt;<span class="c-tag">div</span> key={r.id}&gt;{r.title}&lt;/<span class="c-tag">div</span>&gt;)}
    &lt;/&gt;
  );
}`,
        interviewTip: '💡 This exact pattern comes up constantly in live coding rounds. Memorize the shape: debounce timer inside useEffect, cleanup clears it, empty query short-circuits.',
      },
      {
        title: 'Accessible Modal with Focus Trap',
        description: [
          'A modal needs more than "show a div on top" to be genuinely accessible: focus should move INTO the modal when it opens, stay trapped inside it while it\'s open (Tab shouldn\'t escape to the page behind it), and Escape should close it.',
          'This is a great task to talk through the "why" for each piece — interviewers are often testing whether you think about accessibility, not just visual layout.',
        ],
        code: `<span class="c-keyword">function</span> <span class="c-fn">Modal</span>({ onClose, children }) {
  <span class="c-keyword">const</span> ref = useRef();

  useEffect(() =&gt; {
    ref.current?.focus();  <span class="c-comment">// move focus into the modal on open</span>

    <span class="c-keyword">const</span> handleKey = (e) =&gt; { <span class="c-keyword">if</span> (e.key === <span class="c-str">'Escape'</span>) onClose(); };
    document.addEventListener(<span class="c-str">'keydown'</span>, handleKey);
    <span class="c-keyword">return</span> () =&gt; document.removeEventListener(<span class="c-str">'keydown'</span>, handleKey);
  }, [onClose]);

  <span class="c-keyword">return</span> ReactDOM.createPortal(
    &lt;<span class="c-tag">div</span> className=<span class="c-str">"overlay"</span> onClick={onClose}&gt;
      &lt;<span class="c-tag">div</span> ref={ref} tabIndex={-<span class="c-num">1</span>} role=<span class="c-str">"dialog"</span> aria-modal=<span class="c-str">"true"</span> onClick={e =&gt; e.stopPropagation()}&gt;
        {children}
      &lt;/<span class="c-tag">div</span>&gt;
    &lt;/<span class="c-tag">div</span>&gt;,
    document.getElementById(<span class="c-str">'modal-root'</span>)
  );
}`,
        interviewTip: '💡 role="dialog" + aria-modal="true" tells screen readers this is a modal. Stopping click propagation on the inner div is what stops clicking inside the modal from also closing it via the overlay\'s onClick.',
      },
      {
        title: 'Infinite Scroll',
        description: [
          'Infinite scroll loads more items automatically as the user nears the bottom of the page, instead of a manual "Load more" button. The cleanest modern way to detect "user is near the bottom" is the IntersectionObserver API — it\'s far cheaper than listening to scroll events and calculating positions by hand.',
          'You place an invisible "sentinel" element at the bottom of the list, and observe when it enters the viewport.',
        ],
        code: `<span class="c-keyword">function</span> <span class="c-fn">InfiniteList</span>({ items, loadMore }) {
  <span class="c-keyword">const</span> sentinelRef = useRef();

  useEffect(() =&gt; {
    <span class="c-keyword">const</span> observer = <span class="c-keyword">new</span> IntersectionObserver(([entry]) =&gt; {
      <span class="c-keyword">if</span> (entry.isIntersecting) loadMore(); <span class="c-comment">// sentinel is visible → fetch the next page</span>
    });

    <span class="c-keyword">if</span> (sentinelRef.current) observer.observe(sentinelRef.current);
    <span class="c-keyword">return</span> () =&gt; observer.disconnect();
  }, [loadMore]);

  <span class="c-keyword">return</span> (
    &lt;&gt;
      {items.map(i =&gt; &lt;<span class="c-tag">Row</span> key={i.id} data={i} /&gt;)}
      &lt;<span class="c-tag">div</span> ref={sentinelRef} style={{ height: <span class="c-num">1</span> }} /&gt; <span class="c-comment">// invisible trigger element</span>
    &lt;/&gt;
  );
}`,
        interviewTip: '💡 <strong>Interview:</strong> "Why IntersectionObserver instead of a scroll event listener?" → It doesn\'t run on the main thread on every scroll pixel — the browser notifies you only when the visibility actually changes, which is much better for performance.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // JAVASCRIPT LEARNING PATH (Additional sections 95–102)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 95, title: 'Runtime & Script Loading', sub: 'Browser JavaScript, output, execution order',
    color: '#facc15', level: 'junior',
    concepts: [
      {
        title: 'Where JavaScript Runs',
        description: ['JavaScript is a language; the host runtime supplies APIs. Browsers add the DOM, storage, and Fetch, while Node.js adds filesystem and server APIs.', 'Keep language features separate from environment features so browser-only globals are not accidentally used in server code.'],
        code: `console.log(typeof window); // "object" in a browser, "undefined" in Node.js\nconsole.log(typeof process); // commonly available in Node.js`,
        interviewTip: '💡 The ECMAScript specification defines core language behavior; browser and Node APIs come from their respective runtimes.',
      },
      {
        title: 'Script Placement and Loading',
        description: ['A classic script encountered during HTML parsing can pause parsing while it downloads and runs. defer scripts run after parsing and keep document order; async scripts run as soon as ready and do not guarantee order.', 'For most page scripts that need the DOM, use defer or a module script rather than placing blocking code in the document head.'],
        code: `&lt;script defer src="app.js"&gt;&lt;/script&gt;\n&lt;script async src="analytics.js"&gt;&lt;/script&gt;\n&lt;script type="module" src="main.js"&gt;&lt;/script&gt;`,
        interviewTip: '💡 Use async for independent scripts such as analytics; use defer when execution order and parsed markup matter.',
      },
      {
        title: 'Expressions, Statements, and Console Output',
        description: ['Expressions produce values; statements perform an action or control execution. Prefer console methods while debugging and return values from functions instead of relying on console output.', 'A semicolon is optional in many positions, but consistent formatting avoids ambiguity around automatic semicolon insertion.'],
        code: `const total = 12 + 8;\nconsole.log('total:', total);\n\nfunction addTax(price, rate) {\n  return price * (1 + rate);\n}`,
      },
    ],
  },
  {
    id: 96, title: 'Types, Coercion & Operators', sub: 'Primitive values, references, comparisons',
    color: '#fde047', level: 'junior',
    concepts: [
      {
        title: 'Primitive Values and References',
        description: ['Primitives include string, number, bigint, boolean, undefined, symbol, and null. Objects, arrays, and functions are reference values.', 'Assignment copies a primitive value but copies an object reference. Two variables can therefore point at the same mutable object.'],
        code: `const first = 7;\nlet second = first;\nsecond = 9;\nconsole.log(first); // 7\n\nconst original = { score: 7 };\nconst alias = original;\nalias.score = 9;\nconsole.log(original.score); // 9`,
      },
      {
        title: 'Coercion and Explicit Conversion',
        description: ['JavaScript sometimes converts values implicitly, such as when + combines a string and a number. Explicit conversion with Number(), String(), or Boolean() makes intent clearer.', 'Validate untrusted text before converting it to a number; Number.isNaN() can distinguish failed numeric conversion from valid numeric values.'],
        code: `console.log('5' + 2); // "52"\nconsole.log(Number('5') + 2); // 7\n\nconst quantity = Number('not a number');\nconsole.log(Number.isNaN(quantity)); // true`,
      },
      {
        title: 'Equality and Truthiness',
        description: ['Prefer === and !== to avoid implicit conversion during equality checks. Truthy/falsy checks are useful for optional values, but distinguish a missing value from valid values such as 0 or an empty string when the domain requires it.', 'Use nullish coalescing when only null and undefined should trigger a default.'],
        code: `console.log(0 == false); // true\nconsole.log(0 === false); // false\n\nconst suppliedLimit = 0;\nconst limit = suppliedLimit ?? 20;\nconsole.log(limit); // 0`,
      },
    ],
  },
  {
    id: 97, title: 'Branching & Iteration', sub: 'Conditions, loops, iterables',
    color: '#fb923c', level: 'junior',
    concepts: [
      {
        title: 'Conditions and Switch',
        description: ['Use if/else for branching and switch when one expression is compared against several discrete cases. Remember that switch cases fall through unless they return, throw, or break.', 'For simple value selection, a lookup object or a conditional expression may be clearer than a long switch.'],
        code: `function labelForStatus(status) {\n  switch (status) {\n    case 'ready': return 'Ready';\n    case 'busy': return 'In progress';\n    default: return 'Unknown';\n  }\n}`,
      },
      {
        title: 'Loops and Early Exit',
        description: ['Use for when the index or iteration count matters, for...of for values from an iterable, and while when the stopping condition is evaluated each pass.', 'break exits the nearest loop; continue skips to its next iteration. Avoid mutating a collection in ways that make iteration order difficult to reason about.'],
        code: `const scores = [72, 91, 84];\nlet passing = 0;\n\nfor (const score of scores) {\n  if (score < 80) continue;\n  passing += 1;\n}\nconsole.log(passing); // 2`,
      },
      {
        title: 'for...in, for...of, and Object.entries',
        description: ['for...in iterates enumerable string keys, which is useful for object properties but usually not for array values. for...of iterates values from iterable objects such as arrays, strings, maps, and sets.', 'Object.entries() makes both a key and value explicit when traversing an object.'],
        code: `const profile = { name: 'Mina', level: 3 };\nfor (const [key, value] of Object.entries(profile)) {\n  console.log(key, value);\n}\n\nfor (const item of ['a', 'b']) {\n  console.log(item);\n}`,
      },
    ],
  },
  {
    id: 98, title: 'Functions, Scope & Modules', sub: 'Parameters, closures, imports and exports',
    color: '#f59e0b', level: 'mid',
    concepts: [
      {
        title: 'Function Forms and Parameters',
        description: ['Function declarations are hoisted; function expressions and arrow functions are values assigned to variables. Arrow functions capture this lexically and are not constructors.', 'Default and rest parameters make optional and variable-length inputs explicit. Keep functions focused on one transformation or decision.'],
        code: `function formatName(first, last = '') {\n  return [first, last].filter(Boolean).join(' ');\n}\n\nconst sum = (...values) =>\n  values.reduce((total, value) => total + value, 0);\n\nconsole.log(sum(2, 4, 6)); // 12`,
      },
      {
        title: 'Scope and Closures',
        description: ['A binding is available within its lexical scope. let and const are block-scoped; var is function-scoped. A closure retains access to bindings from the scope where its function was created.', 'Closures are useful for private state and callbacks, but long-lived closures can also retain references longer than intended.'],
        code: `function makeIdGenerator(prefix) {\n  let nextId = 1;\n  return () => prefix + '-' + nextId++;\n}\n\nconst makeOrderId = makeIdGenerator('order');\nconsole.log(makeOrderId()); // order-1\nconsole.log(makeOrderId()); // order-2`,
      },
      {
        title: 'ES Modules',
        description: ['Modules give each file its own scope and let it expose a deliberate public API. Named exports support multiple bindings; a default export represents the module’s primary value.', 'Static imports are analyzed by build tools. Dynamic import() returns a Promise and can load code only when a feature is needed.'],
        code: `// math.js\nexport const double = value => value * 2;\nexport default function clamp(value, max) {\n  return Math.min(value, max);\n}\n\n// app.js\nimport clamp, { double } from './math.js';\nconst loadEditor = () => import('./editor.js');`,
      },
    ],
  },
  {
    id: 99, title: 'Objects, Arrays & Collections', sub: 'Properties, transformations, maps and sets',
    color: '#ef4444', level: 'mid',
    concepts: [
      {
        title: 'Object Properties and Safe Access',
        description: ['Objects associate keys with values. Dot notation is convenient for known identifiers; bracket notation handles computed keys. Object.hasOwn() checks for an own property without walking the prototype chain.', 'Optional chaining safely stops when an intermediate value is nullish; it does not replace input validation when a value is required.'],
        code: `const settings = { display: { density: 'compact' } };\nconst density = settings.display?.density ?? 'comfortable';\nconst hasTheme = Object.hasOwn(settings, 'theme');\nconsole.log(density, hasTheme);`,
      },
      {
        title: 'Array Transformations',
        description: ['map creates a transformed array, filter selects matching elements, and reduce combines elements into one result. These methods return new arrays or values and are easier to compose when callbacks avoid side effects.', 'sort mutates its receiver; copy first when the original order must be preserved.'],
        code: `const prices = [12, 5, 18];\nconst sorted = [...prices].sort((a, b) => a - b);\nconst expensive = sorted.filter(price => price >= 10);\nconst total = expensive.reduce((sum, price) => sum + price, 0);`,
      },
      {
        title: 'Map, Set, and Iterables',
        description: ['Map stores key/value pairs with keys of any type and predictable iteration order. Set stores unique values. Both are iterable and are often clearer than plain objects or arrays for lookup-heavy tasks.', 'Choose a data structure based on operations: a Set for membership, a Map for keyed lookup, and an array when ordering and indexed traversal matter.'],
        code: `const uniqueTags = new Set(['js', 'web', 'js']);\nconst visits = new Map();\nvisits.set('/guide', 3);\nconsole.log(uniqueTags.size); // 2\nconsole.log(visits.get('/guide')); // 3`,
      },
    ],
  },
  {
    id: 100, title: 'Strings, Numbers, Dates & Regex', sub: 'Built-in values and validation patterns',
    color: '#ec4899', level: 'mid',
    concepts: [
      {
        title: 'Strings and Number Precision',
        description: ['Strings are immutable; methods such as slice(), includes(), and replace() return values rather than editing the original string. Template literals interpolate expressions and support multiline text.', 'Most JavaScript numbers use IEEE-754 floating-point representation, so decimal arithmetic can have rounding artifacts. BigInt represents integers beyond Number’s safe integer range but cannot be mixed directly with Number.'],
        code: `console.log((0.1 + 0.2).toFixed(2)); // "0.30"\nconst accountId = 9007199254740993n;\nconsole.log(accountId + 2n);\nconsole.log('status: ' + 'ready'.toUpperCase());`,
      },
      {
        title: 'Dates and Time Zones',
        description: ['Date stores a timestamp in milliseconds; local getters format it using the machine’s local time zone, while UTC getters use Coordinated Universal Time. A date-only string and a local date-time string can be interpreted differently.', 'For APIs, exchange ISO 8601 timestamps with an explicit time zone and format them for the user at the presentation boundary.'],
        code: `const instant = new Date('2026-09-28T12:00:00Z');\nconsole.log(instant.toISOString());\nconsole.log(instant.getUTCFullYear());`,
      },
      {
        title: 'Regular Expressions',
        description: ['Regular expressions describe text patterns for searching, validation, and replacement. Flags such as i and g control case sensitivity and repeated matches; capture groups let code reuse matched parts.', 'Use a simple, anchored pattern for input validation and avoid complex patterns that can take exponential time on adversarial input.'],
        code: `const match = 'order-482'.match(/^order-(\\d+)$/i);\nif (match) console.log(match[1]); // "482"\nconst normalized = 'a   b'.replace(/\\s+/g, ' ');`,
      },
    ],
  },
  {
    id: 101, title: 'Errors, JSON & Async Workflows', sub: 'Exceptions, serialization, timers and requests',
    color: '#8b5cf6', level: 'mid',
    concepts: [
      {
        title: 'Exceptions and Cleanup',
        description: ['Throw Error objects for exceptional failures, catch only where recovery or useful context can be added, and rethrow errors that cannot be handled locally.', 'finally is suitable for cleanup that must happen on either outcome. In async functions, await inside try/catch to handle a rejected Promise.'],
        code: `async function loadSettings() {\n  try {\n    const response = await fetch('/api/settings');\n    if (!response.ok) throw new Error('Settings request failed');\n    return await response.json();\n  } catch (error) {\n    console.error(error);\n    throw error;\n  }\n}`,
      },
      {
        title: 'JSON Serialization Boundaries',
        description: ['JSON.stringify converts supported JavaScript data into JSON text; JSON.parse turns valid JSON text back into values. Functions and undefined object properties are omitted, and circular references cannot be serialized.', 'Treat parsed network data as untrusted input: validate its shape before using it.'],
        code: `const payload = { id: 7, tags: ['web', 'js'] };\nconst text = JSON.stringify(payload);\nconst restored = JSON.parse(text);\nconsole.log(restored.tags[0]); // "web"`,
      },
      {
        title: 'Timers, Promises, and Network Work',
        description: ['Timers schedule callbacks; they do not promise an exact execution time. Promise continuations run as microtasks after the current synchronous work finishes.', 'Fetch rejects on network-level failure, not merely for an HTTP error status. Check response.ok, parse the body, and use AbortController when a request should be cancelled.'],
        code: `const controller = new AbortController();\nconst response = await fetch('/api/items', { signal: controller.signal });\nif (!response.ok) throw new Error('Request failed: ' + response.status);\nconst items = await response.json();\n// Call controller.abort() when this request is no longer needed.`,
      },
    ],
  },
  {
    id: 102, title: 'DOM, Forms & Browser APIs', sub: 'Document access, events, storage and platform APIs',
    color: '#06b6d4', level: 'mid',
    concepts: [
      {
        title: 'Selecting and Updating DOM Elements',
        description: ['Use querySelector() for one CSS-selector match and querySelectorAll() for a static list of matches. Change text with textContent when inserting user-controlled values; innerHTML parses markup and can introduce script injection if used with untrusted strings.', 'Keep DOM writes localized and prefer event-driven updates over repeatedly scanning the whole document.'],
        code: `const status = document.querySelector('[data-status]');\nstatus.textContent = 'Saved';\n\nconst rows = document.querySelectorAll('.result-row');\nconsole.log(rows.length);`,
      },
      {
        title: 'Forms and Browser Events',
        description: ['Listen for submit on the form rather than click on its button so keyboard submission works too. preventDefault() suppresses the browser’s default action; it does not stop propagation.', 'Read FormData for a compact way to collect named controls, then validate before sending data.'],
        code: `const form = document.querySelector('#profile-form');\nform.addEventListener('submit', event => {\n  event.preventDefault();\n  const values = new FormData(form);\n  console.log(values.get('email'));\n});`,
      },
      {
        title: 'Browser APIs and Capability Checks',
        description: ['The browser exposes APIs such as URL, History, Storage, Geolocation, Canvas, and IntersectionObserver through runtime objects. These APIs are not part of the JavaScript language itself.', 'Check for a capability before using optional APIs, and provide a fallback when a browser or permission does not support the feature.'],
        code: `if ('IntersectionObserver' in window) {\n  const observer = new IntersectionObserver(entries => {\n    entries.forEach(entry => console.log(entry.isIntersecting));\n  });\n  observer.observe(document.querySelector('#sentinel'));\n}`,
      },
    ],
  },
  // Existing advanced JavaScript modules follow.
  {
    id: 18, title: 'JavaScript ES6+ Syntax', sub: 'let/const, Arrow, Destructuring, Spread',
    color: '#fcd34d', level: 'junior',
    concepts: [
      {
        title: 'var vs let vs const',
        description: [
          'var is function-scoped and gets "hoisted" — JavaScript moves its declaration to the top of the function and initializes it with undefined, so you can technically reference it before the line it\'s declared on (though the value will be undefined, not an error).',
          'let and const are block-scoped — they only exist inside the nearest {} they were declared in, and accessing them before their declaration throws a ReferenceError (the "temporal dead zone"). const additionally prevents reassignment, but does NOT make the value itself immutable — you can still mutate an object or array\'s contents.',
        ],
        code: `<span class="c-keyword">if</span> (<span class="c-kw2">true</span>) {
  <span class="c-keyword">var</span> a = <span class="c-num">1</span>;   <span class="c-comment">// leaks outside the block — still accessible after</span>
  <span class="c-keyword">let</span> b = <span class="c-num">2</span>;   <span class="c-comment">// block-scoped — only exists inside these { }</span>
  <span class="c-keyword">const</span> c = <span class="c-num">3</span>; <span class="c-comment">// block-scoped, cannot be reassigned</span>
}
console.log(a); <span class="c-comment">// 1</span>
console.log(b); <span class="c-comment">// ReferenceError: b is not defined</span>

<span class="c-comment">// const doesn't freeze the value — only the binding itself</span>
<span class="c-keyword">const</span> user = { name: <span class="c-str">'Ada'</span> };
user.name = <span class="c-str">'Grace'</span>; <span class="c-comment">// ✅ fine — mutating the object, not reassigning "user"</span>
user = {};        <span class="c-comment">// ❌ TypeError — this IS a reassignment</span>`,
        interviewTip: '💡 Default to const for everything. Switch to let only when you know you\'ll reassign the variable. Avoid var entirely in modern code — it exists mainly for historical/legacy reasons.',
      },
      {
        title: 'Destructuring & Spread',
        description: [
          'Destructuring pulls values out of arrays or objects into their own named variables in one line, instead of writing const name = user.name; const age = user.age; separately.',
          'Spread (...) expands an array or object into its individual elements/properties — commonly used to copy or merge data immutably (without mutating the original), which matters a lot in React where you should never mutate state directly.',
        ],
        code: `<span class="c-comment">// Object destructuring, with a default value if "age" is missing</span>
<span class="c-keyword">const</span> { name, age = <span class="c-num">18</span> } = user;

<span class="c-comment">// Array destructuring with rest — grabs the first item, collects the rest</span>
<span class="c-keyword">const</span> [first, ...rest] = [<span class="c-num">1</span>, <span class="c-num">2</span>, <span class="c-num">3</span>]; <span class="c-comment">// first = 1, rest = [2, 3]</span>

<span class="c-comment">// Spread — shallow copy, or merge multiple objects (later keys win)</span>
<span class="c-keyword">const</span> merged = { ...defaults, ...overrides };
<span class="c-keyword">const</span> copyPlusOne = [...items, newItem]; <span class="c-comment">// doesn't mutate "items"</span>`,
        interviewTip: '💡 Spread only does a SHALLOW copy — { ...user, address: user.address } still shares the same nested "address" object reference. Mutating the nested object mutates both copies. This trips people up when updating nested state in React.',
      },
      {
        title: 'Closures',
        description: [
          'A closure is a function that "remembers" the variables from the scope it was created in, even after that outer function has already finished running. It sounds abstract, but it\'s something you use constantly without thinking about it.',
          'Closures are the mechanism behind data privacy (variables that can\'t be accessed from outside), factory functions that create configured functions, and memoization — and they are literally how React hooks like useState work under the hood.',
        ],
        code: `<span class="c-keyword">function</span> <span class="c-fn">makeCounter</span>() {
  <span class="c-keyword">let</span> count = <span class="c-num">0</span>;               <span class="c-comment">// "count" is private — no outside code can touch it directly</span>
  <span class="c-keyword">return</span> () =&gt; ++count;      <span class="c-comment">// the returned function "closes over" count</span>
}

<span class="c-keyword">const</span> counter = makeCounter();
console.log(counter()); <span class="c-comment">// 1</span>
console.log(counter()); <span class="c-comment">// 2 — count persisted between calls, even though makeCounter() already returned</span>`,
        interviewTip: '💡 <strong>Interview:</strong> Closures power React hooks — useState stores each component\'s state outside the component function, and the closure "remembers" which piece of state belongs to that particular render. Mentioning this connects two big interview topics at once.',
      },
    ],
  },
  {
    id: 19, title: 'Advanced JS Concepts', sub: 'Promises, Async/Await, Generators, Symbols',
    color: '#f59e0b', level: 'mid',
    concepts: [
      {
        title: 'Promises & Async/Await',
        description: [
          'A Promise represents a value that isn\'t available yet but will be at some point — either it succeeds (resolves) or fails (rejects). async/await is just cleaner syntax layered on top of Promises; under the hood it\'s the exact same mechanism.',
          'The four combinators handle "many promises at once" differently: Promise.all fails fast (one rejection rejects everything), Promise.allSettled always waits for every promise and never short-circuits, and Promise.race resolves or rejects as soon as the FIRST one settles.',
        ],
        code: `<span class="c-comment">// Promise.all — fail-fast: if ANY promise rejects, the whole thing rejects immediately</span>
<span class="c-keyword">await</span> Promise.all([fetchUser(), fetchOrders()]);

<span class="c-comment">// Promise.allSettled — always waits for everything, gives you a result per promise</span>
<span class="c-keyword">const</span> results = <span class="c-keyword">await</span> Promise.allSettled([fetchA(), fetchB()]);
<span class="c-comment">// results[i].status is "fulfilled" or "rejected" — nothing is thrown</span>

<span class="c-comment">// async/await error handling — a plain try/catch, no .then/.catch chains needed</span>
<span class="c-keyword">try</span> {
  <span class="c-keyword">const</span> data = <span class="c-keyword">await</span> fetchUser(id);
} <span class="c-keyword">catch</span> (err) {
  console.error(<span class="c-str">'Failed to fetch user:'</span>, err);
}`,
        interviewTip: '💡 Promise.all vs allSettled is a classic question — memorize the phrase "fail-fast" for .all and "always waits, never throws" for .allSettled. Use .all when every result is required; use .allSettled when partial success is fine.',
      },
      {
        title: 'Prototypal Inheritance',
        description: [
          'Every JavaScript object has an internal link to another object called its "prototype". When you access a property that doesn\'t exist directly on the object, the engine automatically walks up this prototype chain looking for it, until it finds it or reaches the end (null).',
          'ES6 class syntax (class, extends) looks like traditional class-based inheritance from other languages, but it is purely syntactic sugar over this same prototype chain mechanism — there\'s no separate "class system" happening under the hood.',
        ],
        code: `<span class="c-keyword">const</span> animal = {
  speak() { <span class="c-keyword">return</span> <span class="c-str">'Some generic sound'</span>; }
};

<span class="c-keyword">const</span> dog = Object.create(animal); <span class="c-comment">// dog's prototype is now "animal"</span>
dog.bark = () =&gt; <span class="c-str">'Woof'</span>;

console.log(dog.speak()); <span class="c-comment">// "Some generic sound" — found via the prototype chain, not on "dog" itself</span>
console.log(dog.bark());  <span class="c-comment">// "Woof" — found directly on "dog"</span>`,
        interviewTip: '💡 <strong>Interview:</strong> "Is JavaScript class-based or prototype-based?" → Prototype-based under the hood — class/extends are just cleaner syntax on top of Object.create and the prototype chain that already existed.',
      },
      {
        title: 'Debouncing & Throttling',
        description: [
          'Both patterns reduce how often an expensive function runs in response to fast, repeated events (typing, scrolling, resizing) — but they behave differently. Debouncing waits for a pause and runs once after it. Throttling guarantees the function runs at a steady maximum rate, no matter how often the event fires.',
          'Interviewers often ask you to implement one from scratch, so knowing the shape of both by heart is worth it.',
        ],
        code: `<span class="c-comment">// Debounce — wait for a quiet period, then run once</span>
<span class="c-keyword">function</span> <span class="c-fn">debounce</span>(fn, delay) {
  <span class="c-keyword">let</span> t;
  <span class="c-keyword">return</span> (...args) =&gt; {
    clearTimeout(t);
    t = setTimeout(() =&gt; fn(...args), delay);
  };
}

<span class="c-comment">// Throttle — run at most once per "limit" ms, regardless of call frequency</span>
<span class="c-keyword">function</span> <span class="c-fn">throttle</span>(fn, limit) {
  <span class="c-keyword">let</span> waiting = <span class="c-kw2">false</span>;
  <span class="c-keyword">return</span> (...args) =&gt; {
    <span class="c-keyword">if</span> (waiting) <span class="c-keyword">return</span>;
    fn(...args);
    waiting = <span class="c-kw2">true</span>;
    setTimeout(() =&gt; { waiting = <span class="c-kw2">false</span>; }, limit);
  };
}`,
        interviewTip: '💡 Debounce = wait for calm, run once. Throttle = cap the rate, run steadily. Use debounce for search inputs; use throttle for scroll or resize listeners where you still want periodic updates while the event keeps firing.',
      },
    ],
  },
  {
    id: 20, title: 'DOM & Web APIs', sub: 'querySelector, EventTarget, Storage, History',
    color: '#fb923c', level: 'junior',
    concepts: [
      {
        title: 'Event Delegation',
        description: [
          'Instead of attaching a click listener to every single item in a list (which is wasteful and doesn\'t work for items added later), attach ONE listener to a shared parent element, and use event.target inside the handler to figure out which specific child was actually clicked.',
          'This relies on event bubbling — a click on a child element also fires on all of its ancestors as the event travels up the DOM tree.',
        ],
        code: `document.getElementById(<span class="c-str">'list'</span>)
  .addEventListener(<span class="c-str">'click'</span>, (e) =&gt; {
    <span class="c-keyword">if</span> (e.target.tagName === <span class="c-str">'LI'</span>) {
      console.log(<span class="c-str">'Clicked:'</span>, e.target.textContent);
    }
  });
<span class="c-comment">// Works even for <li> elements added to the list AFTER this listener was set up</span>`,
        interviewTip: '💡 Event delegation is especially valuable for large or dynamically-changing lists — you set up the listener once, and it automatically covers every future item without re-attaching anything.',
      },
      {
        title: 'LocalStorage vs SessionStorage vs Cookies',
        description: [
          'All three store data in the browser, but with different lifespans, size limits, and visibility to the server. Picking the right one depends on how long the data should live and whether the server needs to see it automatically.',
          'localStorage persists until it\'s explicitly cleared (even after closing the browser). sessionStorage clears the moment the tab closes. Cookies are the only one of the three that gets automatically sent with every HTTP request to the matching domain.',
        ],
        list: [
          'localStorage: ~5–10 MB, no expiry, JavaScript-only, per origin',
          'sessionStorage: ~5 MB, cleared when the tab closes, JavaScript-only',
          'Cookies: ~4 KB, sent with every matching request automatically, can be flagged HttpOnly (invisible to JS) and Secure (HTTPS only)',
        ],
        interviewTip: '💡 Never store a JWT (auth token) in localStorage — it\'s readable by any JavaScript on the page, so it\'s vulnerable to XSS attacks. Store it in an HttpOnly cookie instead, which JavaScript can\'t read at all.',
      },
      {
        title: 'Event Bubbling & Capturing',
        description: [
          'When an event fires on an element, it doesn\'t just happen there — it travels through the DOM tree in two phases. Capturing goes DOWN from the document to the target first, then bubbling goes back UP from the target to the document. By default, addEventListener listens during the bubbling phase.',
          'Understanding this order matters when you have nested elements with their own listeners, and need to control which one "wins" or whether an event should be allowed to propagate further.',
        ],
        code: `<span class="c-comment">// Default — listens during the BUBBLING phase (child fires before parent)</span>
parent.addEventListener(<span class="c-str">'click'</span>, () =&gt; console.log(<span class="c-str">'parent'</span>));
child.addEventListener(<span class="c-str">'click'</span>, () =&gt; console.log(<span class="c-str">'child'</span>));
<span class="c-comment">// Clicking the child logs: "child" then "parent"</span>

<span class="c-comment">// Passing "true" listens during the CAPTURING phase instead (parent fires first)</span>
parent.addEventListener(<span class="c-str">'click'</span>, () =&gt; console.log(<span class="c-str">'parent capture'</span>), <span class="c-kw2">true</span>);

<span class="c-comment">// Stop the event from bubbling further up the tree</span>
child.addEventListener(<span class="c-str">'click'</span>, (e) =&gt; e.stopPropagation());`,
        interviewTip: '💡 <strong>Interview:</strong> "What\'s the difference between stopPropagation and preventDefault?" → stopPropagation stops the event from bubbling/capturing further; preventDefault stops the browser\'s DEFAULT behavior (like a form actually submitting or a link actually navigating). They\'re unrelated and often used together.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HTML, CSS & SCSS FOUNDATIONS (IDs 103–111)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 103, title: 'HTML Structure & Semantics', sub: 'Document outline, metadata, landmarks',
    color: '#fb7185', level: 'junior',
    concepts: [
      {
        title: 'Document Structure and Metadata',
        description: ['An HTML document has a doctype, a root element, a head for metadata and linked resources, and a body for page content.', 'Set the document language and a responsive viewport. A useful title and description help browsers, assistive technology, and search previews.'],
        code: `&lt;!doctype html&gt;\n&lt;html lang="en"&gt;\n  &lt;head&gt;\n    &lt;meta charset="utf-8"&gt;\n    &lt;meta name="viewport" content="width=device-width, initial-scale=1"&gt;\n    &lt;title&gt;Field Notes&lt;/title&gt;\n  &lt;/head&gt;\n  &lt;body&gt;&lt;main&gt;...&lt;/main&gt;&lt;/body&gt;\n&lt;/html&gt;`,
      },
      {
        title: 'Semantic Landmarks and Content',
        description: ['Use elements such as header, nav, main, article, section, and footer according to the role of their content. Semantics communicate structure without depending on visual styling.', 'Use headings in a meaningful hierarchy and give each section a descriptive heading. Choose a generic div only when no semantic element fits.'],
        code: `&lt;main&gt;\n  &lt;article aria-labelledby="story-title"&gt;\n    &lt;h1 id="story-title"&gt;Field Notes&lt;/h1&gt;\n    &lt;section aria-labelledby="recent-title"&gt;\n      &lt;h2 id="recent-title"&gt;Recent entries&lt;/h2&gt;\n    &lt;/section&gt;\n  &lt;/article&gt;\n&lt;/main&gt;`,
      },
      {
        title: 'Links, Lists, and Tables',
        description: ['Use anchors for navigation, buttons for actions, lists for grouped items, and tables for genuinely tabular data. Avoid choosing elements only for their default appearance.', 'A table should identify its header cells so relationships remain understandable to assistive technology.'],
        code: `&lt;nav aria-label="Sections"&gt;\n  &lt;ul&gt;\n    &lt;li&gt;&lt;a href="#schedule"&gt;Schedule&lt;/a&gt;&lt;/li&gt;\n  &lt;/ul&gt;\n&lt;/nav&gt;`,
      },
    ],
  },
  {
    id: 104, title: 'HTML Forms & Accessibility', sub: 'Labels, constraints, validation, keyboard use',
    color: '#f43f5e', level: 'junior',
    concepts: [
      {
        title: 'Labels and Form Controls',
        description: ['Every form control needs an accessible name. Associate a label using matching for/id values or wrap the control in its label.', 'Use input types and attributes such as required, min, max, and autocomplete to describe the expected data and improve browser assistance.'],
        code: `&lt;form&gt;\n  &lt;label for="email"&gt;Email address&lt;/label&gt;\n  &lt;input id="email" name="email" type="email" required autocomplete="email"&gt;\n  &lt;button type="submit"&gt;Join&lt;/button&gt;\n&lt;/form&gt;`,
      },
      {
        title: 'Native Validation and Submission',
        description: ['Native constraints provide useful baseline feedback, but application rules may need additional client-side validation. Always validate again on the server because browser checks can be bypassed.', 'Listen for the form submit event rather than only a button click so keyboard and assistive-technology submission work naturally.'],
        code: `const form = document.querySelector('form');\nform.addEventListener('submit', event => {\n  if (!form.reportValidity()) event.preventDefault();\n});`,
      },
      {
        title: 'Accessible Interaction Details',
        description: ['Preserve visible focus, use buttons for actions, and describe errors next to the relevant field. Announce dynamically inserted status messages when the user needs to know about them.', 'Do not rely on color alone to indicate validation state; pair it with text and programmatic state.'],
        list: ['Keep controls keyboard-operable', 'Connect help and error text with aria-describedby when needed', 'Move focus thoughtfully after form errors'],
      },
    ],
  },
  {
    id: 105, title: 'HTML Media & Responsive Content', sub: 'Images, media, embeds, progressive behavior',
    color: '#e11d48', level: 'junior',
    concepts: [
      {
        title: 'Images and Responsive Sources',
        description: ['Provide meaningful alternative text for informative images and an empty alt value for purely decorative images. Use width and height to reserve layout space.', 'Use srcset/sizes or picture/source when the browser should choose an image candidate for the viewport or content format.'],
        code: `&lt;img src="map-800.jpg" srcset="map-400.jpg 400w, map-800.jpg 800w"\n  sizes="(max-width: 600px) 100vw, 800px" width="800" height="500"\n  alt="Trail route from the visitor center to the lake"&gt;`,
      },
      {
        title: 'Audio, Video, and Embeds',
        description: ['Prefer native audio and video elements for media playback, provide controls and captions where appropriate, and include fallback text.', 'Embedded third-party content should be constrained and reviewed for privacy and security. Use iframe sandbox and a restrictive allow policy when feasible.'],
        code: `&lt;video controls width="640" poster="preview.jpg"&gt;\n  &lt;source src="demo.mp4" type="video/mp4"&gt;\n  &lt;track kind="captions" src="demo.vtt" srclang="en" label="English"&gt;\n  Video playback is unavailable.\n&lt;/video&gt;`,
      },
      {
        title: 'Data Attributes and Native Disclosure',
        description: ['Custom data-* attributes attach small application-specific values to an element; JavaScript reads them through dataset. They should not replace semantic attributes or store secrets.', 'Native details/summary provides a keyboard-operable disclosure widget without custom event handling.'],
        code: `&lt;details data-topic="setup"&gt;\n  &lt;summary&gt;Setup details&lt;/summary&gt;\n  &lt;p&gt;Install the project dependencies before running it.&lt;/p&gt;\n&lt;/details&gt;`,
      },
    ],
  },
  {
    id: 106, title: 'CSS Selectors & Cascade', sub: 'Rules, specificity, inheritance, layers',
    color: '#d946ef', level: 'junior',
    concepts: [
      {
        title: 'Selectors and Combinators',
        description: ['Selectors target elements by type, class, ID, attributes, state, or relationships. Prefer classes and clear component boundaries over deeply nested selectors.', 'Pseudo-classes describe a state such as focus or checked; pseudo-elements target a generated or specific part of an element.'],
        code: `.form-field:focus-within {\n  outline: 2px solid #087f8c;\n}\n\n.card > h2 { margin-block-start: 0; }\n.navigation a[aria-current="page"] { font-weight: 700; }`,
      },
      {
        title: 'Cascade, Specificity, and Inheritance',
        description: ['The cascade resolves competing declarations using origin/importance, cascade layer, specificity, and source order. Inherited properties such as color flow from parent to child; many layout properties do not.', 'Use low-specificity component rules and avoid escalating with repeated IDs or !important.'],
        code: `@layer reset, components, overrides;\n\n@layer components {\n  :where(.card) { color: #24323b; }\n}\n\n@layer overrides {\n  .card[data-state="selected"] { color: #075985; }\n}`,
      },
      {
        title: 'Units and the Box Model',
        description: ['The default content-box sizing adds padding and borders outside the declared width. border-box includes them in that width, which makes layout arithmetic easier.', 'Use rem for type and spacing tied to the root scale, percentages for relationships, and viewport/container-relative units when the design calls for them.'],
        code: `*, *::before, *::after { box-sizing: border-box; }\n\n.panel {\n  width: min(100%, 48rem);\n  padding: 1.5rem;\n  margin-inline: auto;\n}`,
      },
    ],
  },
  {
    id: 107, title: 'CSS Layout Systems', sub: 'Flow, positioning, Flexbox, Grid',
    color: '#a855f7', level: 'mid',
    concepts: [
      {
        title: 'Normal Flow and Positioning',
        description: ['Normal flow lays out block and inline content according to writing mode. Relative positioning offsets an element without removing its original space; absolute positioning removes it from normal flow and uses a containing block.', 'Fixed and sticky positioning are useful for overlays and persistent controls, but check stacking contexts and scroll containers when debugging z-index.'],
        code: `.badge {\n  position: absolute;\n  inset-block-start: 0.5rem;\n  inset-inline-end: 0.5rem;\n}`,
      },
      {
        title: 'Flexbox for One-Dimensional Layout',
        description: ['Flexbox distributes and aligns items along a primary axis and a cross axis. It is a natural fit for toolbars, rows, columns, and content that needs to wrap.', 'Use gap for consistent spacing and allow items to shrink or wrap intentionally instead of adding arbitrary margins.'],
        code: `.toolbar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 1rem;\n  flex-wrap: wrap;\n}`,
      },
      {
        title: 'Grid for Two-Dimensional Layout',
        description: ['Grid defines rows and columns together, which helps with page shells, card galleries, and aligned form layouts. Flexible tracks and minmax() adapt to available space.', 'Choose the layout model that matches the relationship: Flexbox for a main axis, Grid when both dimensions matter.'],
        code: `.card-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));\n  gap: 1rem;\n}`,
      },
    ],
  },
  {
    id: 108, title: 'CSS Responsive & Visual Design', sub: 'Media/container queries, tokens, motion',
    color: '#9333ea', level: 'mid',
    concepts: [
      {
        title: 'Responsive Breakpoints and Container Queries',
        description: ['Media queries adapt to viewport or user preferences; container queries adapt a component to the size of its containing region. Start from content constraints instead of targeting specific device names.', 'A component query requires an ancestor to establish a containment context.'],
        code: `.product-list { container-type: inline-size; }\n\n@container (width > 38rem) {\n  .product-card { display: grid; grid-template-columns: 8rem 1fr; }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  *, *::before, *::after { scroll-behavior: auto; }\n}`,
      },
      {
        title: 'Design Tokens and Custom Properties',
        description: ['CSS custom properties are runtime values that participate in inheritance and can be changed by themes or component state. They complement, rather than replace, preprocessor variables.', 'Centralize color, spacing, and type decisions so a theme change does not require rewriting every component rule.'],
        code: `:root {\n  --space-3: 1rem;\n  --surface: #fff;\n  --text: #25313a;\n}\n\n.panel { color: var(--text); background: var(--surface); padding: var(--space-3); }`,
      },
      {
        title: 'Typography, Color, and Motion',
        description: ['Build readable hierarchy with a small type scale, line length, and contrast. Use relative units where users should be able to scale text.', 'Transitions and animations should clarify state changes, remain brief, and respect prefers-reduced-motion.'],
        code: `.button {\n  color: #fff;\n  background: #087f8c;\n  transition: background-color 160ms ease;\n}\n.button:hover { background: #066874; }`,
      },
    ],
  },
  {
    id: 109, title: 'SCSS Syntax & Structure', sub: 'Variables, nesting, partials, modules',
    color: '#e879f9', level: 'junior',
    concepts: [
      {
        title: 'SCSS and Compilation',
        description: ['SCSS is Sass syntax that remains close to CSS. A Sass compiler transforms SCSS source into standard CSS that browsers can load; the browser does not execute SCSS.', 'Keep source files readable and configure source maps in development so generated CSS can be traced back to its source.'],
        code: `$accent: #087f8c;\n\n.notice {\n  border-inline-start: 4px solid $accent;\n  padding: 1rem;\n}`,
      },
      {
        title: 'Variables and Nesting',
        description: ['SCSS variables are compile-time values. Nesting can group related selectors, and the parent selector & can express modifier states.', 'Keep nesting shallow so selectors remain predictable and do not accidentally gain excessive specificity.'],
        code: `$radius: 0.5rem;\n\n.card {\n  border-radius: $radius;\n\n  &__title { font-weight: 700; }\n  &:hover { border-color: currentColor; }\n}`,
      },
      {
        title: 'Partials and the Module System',
        description: ['Split styles into focused files and load Sass modules with @use. Modules are namespaced by default, which helps prevent collisions and makes dependencies explicit.', 'Prefer @use/@forward for new Sass code instead of legacy @import, which can duplicate output and share global names.'],
        code: `// _tokens.scss\n$brand: #087f8c;\n\n// app.scss\n@use 'tokens';\n\n.link { color: tokens.$brand; }`,
      },
    ],
  },
  {
    id: 110, title: 'SCSS Reuse & Abstraction', sub: 'Mixins, functions, placeholders, interpolation',
    color: '#d946ef', level: 'mid',
    concepts: [
      {
        title: 'Mixins and Content Blocks',
        description: ['A mixin emits a reusable set of declarations and can accept parameters. Use it for repeated patterns that need configuration; use a content block when callers need to supply nested rules.', 'Avoid generating large duplicated selectors through overly broad mixins.'],
        code: `@mixin focus-ring($color) {\n  outline: 2px solid $color;\n  outline-offset: 2px;\n}\n\n.button:focus-visible { @include focus-ring(#087f8c); }`,
      },
      {
        title: 'Functions and Compile-Time Logic',
        description: ['Sass functions return values for use in declarations; mixins emit declarations or rules. Control directives such as @if and @each can generate styles from configuration data at compile time.', 'Keep control flow simple so the generated CSS remains easy to inspect.'],
        code: `@function spacing($step) {\n  @return $step * 0.25rem;\n}\n\n$steps: (1, 2, 3);\n@each $step in $steps {\n  .gap-#{$step} { gap: spacing($step); }\n}`,
      },
      {
        title: 'Placeholders, Extend, and Interpolation',
        description: ['A %placeholder selector emits no CSS until extended. @extend groups selectors that share a rule; mixins copy declarations into each use site, so choose based on the output and coupling you want.', 'Interpolation inserts Sass values into selector or property names. Use it sparingly because generated selectors can be harder to trace.'],
        code: `%control-base {\n  border: 1px solid currentColor;\n  border-radius: 0.375rem;\n}\n\n.input { @extend %control-base; }\n$variant: warning;\n.alert-#{$variant} { font-weight: 700; }`,
      },
    ],
  },
  {
    id: 111, title: 'SCSS Architecture & Migration', sub: 'Tokens, layers, maintainable stylesheets',
    color: '#c026d3', level: 'senior',
    concepts: [
      {
        title: 'Organizing Styles by Responsibility',
        description: ['Separate design tokens, reset/base styles, layout primitives, and component styles. Use @use/@forward to make the public API of each Sass module explicit.', 'Avoid a single global stylesheet full of deeply nested selectors; keep component styles local and layering intentional.'],
        list: ['tokens: colors, spacing, typography', 'base: element defaults and accessible focus styles', 'components: reusable visual patterns', 'utilities: small, predictable helpers'],
      },
      {
        title: 'SCSS Variables and CSS Custom Properties',
        description: ['Sass variables are resolved during compilation and are useful for build-time constants. CSS custom properties remain in the output and can vary at runtime through inheritance, themes, or JavaScript.', 'Use Sass to compose the stylesheet and custom properties for values that must change in the browser.'],
        code: `$default-accent: #087f8c;\n\n:root {\n  --accent: #{$default-accent};\n}\n\n[data-theme='night'] { --accent: #5eead4; }\n.button { background: var(--accent); }`,
      },
      {
        title: 'Migrating CSS to SCSS Safely',
        description: ['SCSS accepts ordinary CSS, so migration can be incremental: rename a stylesheet, compile it, compare the generated CSS, and then introduce variables or modules in small steps.', 'Check output size, selector specificity, source maps, and browser behavior during migration. Do not assume that nesting is automatically a maintainability improvement.'],
        list: ['Keep a before/after visual check', 'Preserve cascade order and media-query behavior', 'Replace legacy @import with modules deliberately'],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // NODE.JS (IDs 21–32)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 21, title: 'Node.js Fundamentals', sub: 'Modules, NPM, Event Loop, Callbacks',
    color: '#34d399', level: 'junior',
    concepts: [
      {
        title: 'Node.js Event Loop',
        description: ['Node.js is single-threaded but handles concurrency via its event loop and libuv. I/O operations are offloaded to the OS; callbacks are queued when they complete.'],
        list: ['Phases: timers → I/O callbacks → idle → poll → check (setImmediate) → close callbacks', 'process.nextTick runs before any I/O callback in the next iteration', 'Non-blocking I/O is the key to Node\'s scalability'],
        interviewTip: '💡 process.nextTick fires before I/O. setImmediate fires after I/O. setTimeout fires after a minimum delay.',
      },
      {
        title: 'CommonJS vs ES Modules',
        description: ['Node.js originally used CommonJS (require/module.exports). ES Modules (import/export) are now supported natively with .mjs files or "type":"module" in package.json.'],
        code: `<span class="c-comment">// CommonJS</span>\n<span class="c-keyword">const</span> fs = require(<span class="c-str">'fs'</span>);\nmodule.exports = { myFunc };\n\n<span class="c-comment">// ES Module</span>\n<span class="c-keyword">import</span> fs <span class="c-keyword">from</span> <span class="c-str">'fs'</span>;\n<span class="c-keyword">export</span> { myFunc };`,
      },
    ],
  },
  {
    id: 22, title: 'Node.js Async & Streams', sub: 'Timers, Promises, async/await, Streams',
    color: '#2dd4bf', level: 'mid',
    concepts: [
      {
        title: 'Streams & Buffers',
        description: ['Streams process data in chunks instead of loading everything into memory. Types: Readable, Writable, Duplex (both), Transform (transforms data as it passes through).'],
        code: `<span class="c-keyword">const</span> fs = require(<span class="c-str">'fs'</span>);\n<span class="c-keyword">const</span> zlib = require(<span class="c-str">'zlib'</span>);\n\n<span class="c-comment">// Pipe: readable → transform → writable</span>\nfs.createReadStream(<span class="c-str">'large.txt'</span>)\n  .pipe(zlib.createGzip())\n  .pipe(fs.createWriteStream(<span class="c-str">'large.txt.gz'</span>));`,
        interviewTip: '💡 Use streams for large files — never load a 1 GB file into memory with fs.readFileSync.',
      },
    ],
  },
  {
    id: 23, title: 'Express.js Basics', sub: 'Routing, Middleware, Request/Response',
    color: '#10b981', level: 'junior',
    concepts: [
      {
        title: 'Express Middleware Chain',
        description: ['Middleware functions have access to req, res, and next. They execute in order and form a pipeline. Call next() to pass to the next middleware, or end the response.'],
        code: `<span class="c-comment">// Logger middleware</span>\napp.use((req, res, next) =&gt; {\n  console.log(<span class="c-str">\`\${req.method} \${req.url}\`</span>);\n  next(); <span class="c-comment">// ← MUST call next or respond</span>\n});\n\n<span class="c-comment">// Route handler</span>\napp.get(<span class="c-str">'/users/:id'</span>, async (req, res) =&gt; {\n  <span class="c-keyword">const</span> user = <span class="c-keyword">await</span> User.findById(req.params.id);\n  res.json(user);\n});`,
        interviewTip: '💡 Error middleware has 4 args: (err, req, res, next). Register it last.',
      },
    ],
  },
  {
    id: 24, title: 'Express Middleware & Routing', sub: 'Custom Middleware, Error Handling, CORS',
    color: '#059669', level: 'mid',
    concepts: [
      {
        title: 'Error Handling in Express',
        description: ['Express has a special 4-argument error handler. Any error passed to next(err) skips regular middleware and goes directly to error handlers.'],
        code: `<span class="c-comment">// Async route wrapper to catch errors</span>\n<span class="c-keyword">const</span> wrap = fn =&gt; (req, res, next) =&gt; Promise.resolve(fn(req, res, next)).catch(next);\n\napp.get(<span class="c-str">'/data'</span>, wrap(<span class="c-keyword">async</span> (req, res) =&gt; {\n  <span class="c-keyword">const</span> data = <span class="c-keyword">await</span> db.query(); <span class="c-comment">// if throws → next(err)</span>\n  res.json(data);\n}));\n\n<span class="c-comment">// Global error handler — must be last</span>\napp.use((err, req, res, next) =&gt; {\n  res.status(<span class="c-num">500</span>).json({ error: err.message });\n});`,
      },
    ],
  },
  {
    id: 25, title: 'Authentication & Security', sub: 'JWT, OAuth, bcrypt, HTTPS, Helmet',
    color: '#f87171', level: 'senior',
    concepts: [
      {
        title: 'JWT Implementation',
        description: ['A JWT has three Base64url-encoded parts: Header (algorithm), Payload (claims), Signature (tamper proof). The server signs with a secret; verify the signature on each request.'],
        code: `<span class="c-comment">// Sign on login</span>\n<span class="c-keyword">const</span> token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: <span class="c-str">'15m'</span> });\n\n<span class="c-comment">// Verify in middleware</span>\n<span class="c-keyword">function</span> <span class="c-fn">authMiddleware</span>(req, res, next) {\n  <span class="c-keyword">const</span> token = req.headers.authorization?.split(<span class="c-str">' '</span>)[<span class="c-num">1</span>];\n  <span class="c-keyword">try</span> {\n    req.user = jwt.verify(token, process.env.JWT_SECRET);\n    next();\n  } <span class="c-keyword">catch</span> { res.status(<span class="c-num">401</span>).json({ error: <span class="c-str">'Unauthorized'</span> }); }\n}`,
        interviewTip: '💡 Store JWTs in HttpOnly cookies, not localStorage. Short-lived access tokens + long-lived refresh tokens.',
      },
      {
        title: 'Password Hashing with bcrypt',
        description: ['Never store plain-text passwords. bcrypt hashes with a salt and work factor, making brute force attacks expensive.'],
        code: `<span class="c-keyword">const</span> bcrypt = require(<span class="c-str">'bcrypt'</span>);\n\n<span class="c-comment">// On register</span>\n<span class="c-keyword">const</span> hash = <span class="c-keyword">await</span> bcrypt.hash(password, <span class="c-num">12</span>); <span class="c-comment">// 12 rounds</span>\n\n<span class="c-comment">// On login</span>\n<span class="c-keyword">const</span> valid = <span class="c-keyword">await</span> bcrypt.compare(password, user.hash);`,
      },
    ],
  },
  {
    id: 26, title: 'Database Integration', sub: 'MongoDB, MySQL, ORMs, Query Optimization', color: '#fbbf24', level: 'mid',
    concepts: [{
      title: 'SQL vs NoSQL Trade-offs',
      description: ['SQL databases (PostgreSQL, MySQL) enforce schemas and ACID transactions — great for relational data. NoSQL (MongoDB) is flexible and scales horizontally — great for documents and high write throughput.'],
      list: ['SQL: strong consistency, JOIN queries, schema migrations required', 'NoSQL: flexible schema, horizontal scaling, eventual consistency', 'Indexing is critical in both — add indexes on frequently queried fields'],
      interviewTip: '💡 "What database would you use for X?" — Think about: query patterns, consistency needs, scale, and team familiarity.',
    }],
  },
  {
    id: 27, title: 'REST API Design', sub: 'HTTP Methods, Status Codes, Versioning', color: '#60a5fa', level: 'mid',
    concepts: [{
      title: 'REST Conventions',
      description: ['REST uses HTTP verbs to describe actions on resource nouns. URLs represent resources, not actions.'],
      code: `GET    /users          <span class="c-comment">→ list all users</span>\nGET    /users/:id      <span class="c-comment">→ get one user</span>\nPOST   /users          <span class="c-comment">→ create user</span>\nPUT    /users/:id      <span class="c-comment">→ replace user</span>\nPATCH  /users/:id      <span class="c-comment">→ partial update</span>\nDELETE /users/:id      <span class="c-comment">→ delete user</span>\n\n<span class="c-comment">// Status codes: 200 OK, 201 Created, 400 Bad Request</span>\n<span class="c-comment">// 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Server Error</span>`,
      interviewTip: '💡 PUT replaces the entire resource. PATCH applies partial changes. Know the distinction.',
    }],
  },
  {
    id: 28, title: 'File Upload & Storage', sub: 'Multer, AWS S3, Buffer, Streams', color: '#3b82f6', level: 'mid',
    concepts: [{
      title: 'Multer & S3 Upload', description: ['Multer is middleware for handling multipart/form-data. Store files on S3 (or similar) rather than local disk for production — local disk doesn\'t scale across multiple instances.'],
      code: `<span class="c-keyword">const</span> upload = multer({ storage: multer.memoryStorage() });\napp.post(<span class="c-str">'/upload'</span>, upload.single(<span class="c-str">'file'</span>), <span class="c-keyword">async</span> (req, res) =&gt; {\n  <span class="c-keyword">await</span> s3.putObject({\n    Bucket: <span class="c-str">'my-bucket'</span>,\n    Key: req.file.originalname,\n    Body: req.file.buffer,\n  }).promise();\n  res.json({ url: <span class="c-str">\`https://s3.../\${req.file.originalname}\`</span> });\n});`
    }],
  },
  {
    id: 29, title: 'Node.js Performance', sub: 'Clustering, Worker Threads, Load Balancing', color: '#2dd4bf', level: 'senior',
    concepts: [{
      title: 'Clustering & Worker Threads', description: ['Node.js is single-threaded, so a single process can only use one CPU core. cluster module forks child processes that share server ports. Worker threads run CPU-intensive tasks without blocking the event loop.'],
      code: `<span class="c-keyword">const</span> cluster = require(<span class="c-str">'cluster'</span>);\n<span class="c-keyword">if</span> (cluster.isPrimary) {\n  os.cpus().forEach(() =&gt; cluster.fork());\n} <span class="c-keyword">else</span> {\n  app.listen(<span class="c-num">3000</span>); <span class="c-comment">// each worker handles requests</span>\n}`,
      interviewTip: '💡 cluster for multi-core HTTP serving. Worker threads for CPU-heavy tasks like image processing or crypto.'
    }],
  },
  {
    id: 30, title: 'Testing Node.js', sub: 'Jest, Mocha, Integration Tests', color: '#34d399', level: 'mid',
    concepts: [{
      title: 'Unit & Integration Testing', description: ['Unit tests test a function in isolation. Integration tests test how multiple parts work together (e.g., the HTTP layer + database). Use supertest to test Express routes without starting a real server.'],
      code: `<span class="c-keyword">import</span> request from <span class="c-str">'supertest'</span>;\n<span class="c-keyword">import</span> app from <span class="c-str">'./app.js'</span>;\n\ntest(<span class="c-str">'GET /users returns 200'</span>, <span class="c-keyword">async</span> () =&gt; {\n  <span class="c-keyword">const</span> res = <span class="c-keyword">await</span> request(app).get(<span class="c-str">'/users'</span>);\n  expect(res.status).toBe(<span class="c-num">200</span>);\n  expect(res.body).toBeInstanceOf(Array);\n});`
    }],
  },
  {
    id: 31, title: 'Node.js WebSockets', sub: 'Socket.io, Real-time Updates, Pub/Sub', color: '#06b6d4', level: 'mid',
    concepts: [{
      title: 'Socket.io Real-time Communication', description: ['WebSockets maintain a persistent bidirectional connection. Socket.io adds rooms, namespaces, and automatic reconnection on top of WebSockets with fallback to polling.'],
      code: `<span class="c-comment">// Server</span>\nio.on(<span class="c-str">'connection'</span>, socket =&gt; {\n  socket.join(<span class="c-str">'room1'</span>);\n  socket.on(<span class="c-str">'message'</span>, data =&gt; {\n    io.to(<span class="c-str">'room1'</span>).emit(<span class="c-str">'message'</span>, data); <span class="c-comment">// broadcast to room</span>\n  });\n});`,
      interviewTip: '💡 Use WebSockets for chat, live dashboards, and collaborative editing. For one-way push, Server-Sent Events (SSE) is simpler.'
    }],
  },
  {
    id: 32, title: 'Node.js Advanced Patterns', sub: 'Design Patterns, Microservices, Docker', color: '#0891b2', level: 'senior',
    concepts: [{
      title: 'Microservices vs Monolith', description: ['A monolith is easier to develop and deploy but harder to scale independently. Microservices scale individual services but add network latency and operational complexity.'],
      list: ['Monolith: single codebase, single deployment, easier debugging', 'Microservices: independent deployments, each service owns its data', 'Event-driven: services communicate via message queues (Kafka, RabbitMQ) for loose coupling'],
      interviewTip: '💡 "Start with a monolith and extract services only when you have a clear scaling need" — Martin Fowler.'
    }],
  },

  // ═══════════════════════════════════════════════════════════════
  // JAVA (IDs 33–44) — COMPREHENSIVE INTERVIEW PREPARATION
  // ═══════════════════════════════════════════════════════════════

  {
    id: 33, title: 'Java Fundamentals & OOP', sub: 'OOP Pillars, Classes, Inheritance, Interfaces, Abstraction', color: '#f59e0b', level: 'junior',
    concepts: [
      {
        title: 'The 4 OOP Pillars — Deep Dive',
        description: [
          '1️⃣ ENCAPSULATION: Bundling data (fields) and behavior (methods) together, and restricting direct access using access modifiers. The goal is to protect internal state and expose only a clean API. Use private fields + public getters/setters.',
          '2️⃣ INHERITANCE: A class (child) extends another (parent) to reuse code. Java supports single inheritance for classes but multiple inheritance via interfaces. Use "extends" for classes, "implements" for interfaces.',
          '3️⃣ POLYMORPHISM: One interface, many implementations. At runtime, the JVM calls the actual overriding method (dynamic dispatch). Compile-time polymorphism = method overloading (same name, different params).',
          '4️⃣ ABSTRACTION: Hiding implementation complexity, showing only what matters. Achieved via abstract classes (partial implementation allowed) and interfaces (pure contract, default methods since Java 8).',
        ],
        code: `<span class="c-comment">// ── 1. Encapsulation ─────────────────────────────────</span>
<span class="c-keyword">public class</span> <span class="c-fn">BankAccount</span> {
  <span class="c-keyword">private double</span> balance; <span class="c-comment">// hidden state</span>

  <span class="c-keyword">public void</span> deposit(<span class="c-keyword">double</span> amount) {
    <span class="c-keyword">if</span> (amount &gt; <span class="c-num">0</span>) balance += amount; <span class="c-comment">// validation inside</span>
  }
  <span class="c-keyword">public double</span> getBalance() { <span class="c-keyword">return</span> balance; }
}

<span class="c-comment">// ── 2. Inheritance + 3. Polymorphism ─────────────────</span>
<span class="c-keyword">public abstract class</span> <span class="c-fn">Shape</span> {
  <span class="c-keyword">public abstract double</span> area(); <span class="c-comment">// must override</span>
  <span class="c-keyword">public void</span> print() { System.out.println(<span class="c-str">"Area: "</span> + area()); }
}

<span class="c-keyword">public class</span> <span class="c-fn">Circle</span> <span class="c-keyword">extends</span> Shape {
  <span class="c-keyword">private double</span> r;
  <span class="c-keyword">public</span> Circle(<span class="c-keyword">double</span> r) { <span class="c-keyword">this</span>.r = r; }
  @Override
  <span class="c-keyword">public double</span> area() { <span class="c-keyword">return</span> Math.PI * r * r; }
}

<span class="c-comment">// Runtime polymorphism — Shape ref holds Circle object</span>
Shape s = <span class="c-keyword">new</span> Circle(<span class="c-num">5</span>);
s.print(); <span class="c-comment">// calls Circle.area() → 78.54</span>`,
        interviewTip: '💡 KEY: Interface vs Abstract class → Use interface when unrelated classes share a contract (Flyable: Bird, Plane). Use abstract class when related classes share code (Animal: Dog, Cat). Since Java 8, interfaces can have default methods and static methods.',
      },
      {
        title: 'Interfaces vs Abstract Classes — Interview Favourite',
        description: [
          'Abstract Class: Can have constructors, instance variables, concrete methods, abstract methods. A class can extend only ONE abstract class. Use when you want to share code among related classes.',
          'Interface: Before Java 8 — only abstract methods. Java 8+ — default methods, static methods. Java 9+ — private methods. A class can implement MULTIPLE interfaces. Use for unrelated classes that share a capability.',
          'The golden rule: "Program to an interface, not an implementation" — declare variables using the interface type (List, not ArrayList) so you can swap implementations without changing code.',
        ],
        code: `<span class="c-comment">// ── Abstract Class — shared state + partial impl ──────</span>
<span class="c-keyword">public abstract class</span> <span class="c-fn">Vehicle</span> {
  <span class="c-keyword">protected</span> String brand;   <span class="c-comment">// shared state</span>
  <span class="c-keyword">protected int</span> speed = <span class="c-num">0</span>;

  <span class="c-keyword">public void</span> accelerate(<span class="c-keyword">int</span> delta) { speed += delta; } <span class="c-comment">// shared code</span>
  <span class="c-keyword">public abstract void</span> fuelType();  <span class="c-comment">// must implement</span>
}

<span class="c-comment">// ── Interface — contract for unrelated classes ────────</span>
<span class="c-keyword">public interface</span> <span class="c-fn">Chargeable</span> {
  <span class="c-keyword">void</span> charge();                         <span class="c-comment">// abstract</span>
  <span class="c-keyword">default void</span> showStatus() {            <span class="c-comment">// Java 8 default</span>
    System.out.println(<span class="c-str">"Charging..."</span>);
  }
  <span class="c-keyword">static</span> String protocol() { <span class="c-keyword">return</span> <span class="c-str">"USB-C"</span>; } <span class="c-comment">// Java 8 static</span>
}

<span class="c-comment">// Class can extend one abstract class, implement many interfaces</span>
<span class="c-keyword">public class</span> <span class="c-fn">ElectricCar</span> <span class="c-keyword">extends</span> Vehicle <span class="c-keyword">implements</span> Chargeable {
  @Override <span class="c-keyword">public void</span> fuelType() { System.out.println(<span class="c-str">"Electric"</span>); }
  @Override <span class="c-keyword">public void</span> charge()    { System.out.println(<span class="c-str">"Plugged in"</span>); }
}`,
        interviewTip: '💡 TRICK Q: "Can interface have constructor?" → No. "Can abstract class be instantiated?" → No, only via subclass. "Can we have abstract class without abstract method?" → Yes, to prevent direct instantiation.',
      },
      {
        title: 'Method Overloading vs Overriding',
        description: [
          'OVERLOADING (Compile-time / Static polymorphism): Same method name, different parameter list (type, count, or order). The compiler chooses which version to call based on the argument types at compile time.',
          'OVERRIDING (Runtime / Dynamic polymorphism): Subclass redefines a method from the parent with the SAME signature. The JVM decides which version to call at runtime based on the actual object type. Rules: same name, same params, same or wider access, same or narrower return type (covariant).',
        ],
        code: `<span class="c-comment">// ── Overloading — same name, different params ─────────</span>
<span class="c-keyword">public class</span> <span class="c-fn">Calculator</span> {
  <span class="c-keyword">public int</span>    add(<span class="c-keyword">int</span> a, <span class="c-keyword">int</span> b)       { <span class="c-keyword">return</span> a + b; }
  <span class="c-keyword">public double</span> add(<span class="c-keyword">double</span> a, <span class="c-keyword">double</span> b) { <span class="c-keyword">return</span> a + b; }
  <span class="c-keyword">public int</span>    add(<span class="c-keyword">int</span> a, <span class="c-keyword">int</span> b, <span class="c-keyword">int</span> c) { <span class="c-keyword">return</span> a + b + c; }
}
<span class="c-comment">// Resolved at COMPILE time based on argument types</span>

<span class="c-comment">// ── Overriding — same signature in subclass ───────────</span>
<span class="c-keyword">class</span> <span class="c-fn">Animal</span> {
  <span class="c-keyword">public</span> String sound() { <span class="c-keyword">return</span> <span class="c-str">"..."</span>; }
}
<span class="c-keyword">class</span> <span class="c-fn">Dog</span> <span class="c-keyword">extends</span> Animal {
  @Override
  <span class="c-keyword">public</span> String sound() { <span class="c-keyword">return</span> <span class="c-str">"Woof"</span>; } <span class="c-comment">// must use @Override!</span>
}
<span class="c-keyword">class</span> <span class="c-fn">Cat</span> <span class="c-keyword">extends</span> Animal {
  @Override
  <span class="c-keyword">public</span> String sound() { <span class="c-keyword">return</span> <span class="c-str">"Meow"</span>; }
}

Animal a = <span class="c-keyword">new</span> Dog();
a.sound(); <span class="c-comment">// "Woof" — JVM resolves at RUNTIME (dynamic dispatch)</span>`,
        interviewTip: '💡 Cannot override: static methods (they\'re hidden, not overridden), final methods, private methods. @Override annotation is optional but use it — the compiler catches signature mismatches.',
      },
    ],
  },

  {
    id: 34, title: 'Java 8+ Modern Features', sub: 'Lambda, Streams, Optional, Method Refs, Date/Time API', color: '#f97316', level: 'mid',
    concepts: [
      {
        title: 'Lambda Expressions & Functional Interfaces',
        description: [
          'A lambda is an anonymous function: (parameters) -> expression or block. They implement functional interfaces (interfaces with exactly ONE abstract method). Java 8 ships with built-in functional interfaces in java.util.function.',
          'Key built-in functional interfaces: Predicate<T> → boolean test(T t), Function<T,R> → R apply(T t), Consumer<T> → void accept(T t), Supplier<T> → T get(), BiFunction<T,U,R> → R apply(T t, U u).',
          'Method references (::) are shorthand for lambdas that just call an existing method. 4 forms: ClassName::staticMethod, object::instanceMethod, ClassName::instanceMethod, ClassName::new.',
        ],
        code: `<span class="c-comment">// Functional interfaces + lambdas</span>
Predicate&lt;String&gt;  nonEmpty = s -&gt; !s.isEmpty();
Function&lt;String,Integer&gt; len = String::length;   <span class="c-comment">// method ref</span>
Consumer&lt;String&gt;   print   = System.out::println; <span class="c-comment">// method ref</span>
Supplier&lt;List&gt;     newList = ArrayList::new;       <span class="c-comment">// constructor ref</span>

<span class="c-comment">// Compose functions</span>
Function&lt;Integer,Integer&gt; doubleIt  = x -&gt; x * <span class="c-num">2</span>;
Function&lt;Integer,Integer&gt; addThree  = x -&gt; x + <span class="c-num">3</span>;
Function&lt;Integer,Integer&gt; combined  = doubleIt.andThen(addThree);
combined.apply(<span class="c-num">5</span>); <span class="c-comment">// (5*2)+3 = 13</span>

<span class="c-comment">// Custom functional interface</span>
@FunctionalInterface
<span class="c-keyword">interface</span> <span class="c-fn">Transformer</span>&lt;T&gt; {
  T transform(T input);  <span class="c-comment">// only ONE abstract method</span>
}
Transformer&lt;String&gt; upper = s -&gt; s.toUpperCase();
upper.transform(<span class="c-str">"hello"</span>); <span class="c-comment">// "HELLO"</span>`,
        interviewTip: '💡 "What is a functional interface?" — has exactly ONE abstract method (SAM). @FunctionalInterface annotation is optional but recommended. Lambdas capture effectively-final variables from the enclosing scope.',
      },
      {
        title: 'Stream API — Lazy Pipeline Processing',
        description: [
          'Streams represent a pipeline of operations on a data source (collections, arrays, files). Three parts: Source → Intermediate operations (lazy, return Stream) → Terminal operation (triggers execution, returns result).',
          'Intermediate ops (lazy): filter(), map(), flatMap(), distinct(), sorted(), limit(), skip(), peek(). These build the pipeline but do NOT execute.',
          'Terminal ops (eager, trigger execution): collect(), forEach(), reduce(), count(), findFirst(), anyMatch(), allMatch(), min(), max(). Without a terminal op, nothing runs.',
        ],
        code: `List&lt;Employee&gt; employees = getEmployees();

<span class="c-comment">// ── Pipeline 1: Filter, map, collect ─────────────────</span>
List&lt;String&gt; seniorNames = employees.stream()
  .filter(e -&gt; e.getYears() &gt; <span class="c-num">5</span>)           <span class="c-comment">// intermediate</span>
  .sorted(Comparator.comparing(Employee::getSalary).reversed())
  .map(Employee::getName)                    <span class="c-comment">// intermediate</span>
  .collect(Collectors.toList());             <span class="c-comment">// terminal ← triggers all</span>

<span class="c-comment">// ── Pipeline 2: Grouping (very common in interviews) ──</span>
Map&lt;String, List&lt;Employee&gt;&gt; byDept = employees.stream()
  .collect(Collectors.groupingBy(Employee::getDept));

Map&lt;String, Double&gt; avgSalByDept = employees.stream()
  .collect(Collectors.groupingBy(Employee::getDept,
           Collectors.averagingDouble(Employee::getSalary)));

<span class="c-comment">// ── Pipeline 3: flatMap — flatten nested collections ──</span>
List&lt;List&lt;Integer&gt;&gt; nested = List.of(List.of(<span class="c-num">1</span>,<span class="c-num">2</span>), List.of(<span class="c-num">3</span>,<span class="c-num">4</span>));
List&lt;Integer&gt; flat = nested.stream()
  .flatMap(Collection::stream)
  .collect(Collectors.toList()); <span class="c-comment">// [1, 2, 3, 4]</span>

<span class="c-comment">// ── Pipeline 4: reduce ────────────────────────────────</span>
<span class="c-keyword">int</span> sum = IntStream.rangeClosed(<span class="c-num">1</span>, <span class="c-num">10</span>).reduce(<span class="c-num">0</span>, Integer::sum); <span class="c-comment">// 55</span>`,
        interviewTip: '💡 KEY INTERVIEW: Streams are LAZY — if you write .filter().map() with no terminal op, NOTHING executes. Also: Stream can be consumed only ONCE; a second terminal op throws IllegalStateException. Use parallelStream() for CPU-bound work on large data.',
      },
      {
        title: 'Optional — Eliminating NullPointerException',
        description: [
          'Optional<T> is a container that may or may not hold a value. Its purpose is to make the absence of a value explicit in the API, forcing callers to handle the empty case instead of getting a surprise NPE.',
          'Creation: Optional.of(value) — throws NPE if null. Optional.ofNullable(value) — safe, wraps null as empty. Optional.empty() — explicitly empty.',
          'Consumption: isPresent()/isEmpty(), get() (dangerous!), orElse(default), orElseGet(supplier), orElseThrow(exception), ifPresent(consumer), map(), flatMap(), filter().',
        ],
        code: `<span class="c-comment">// ── Bad: nullable return (forces callers to null-check)</span>
<span class="c-keyword">public</span> User findUser(String id) { <span class="c-keyword">return</span> db.get(id); } <span class="c-comment">// null if absent</span>

<span class="c-comment">// ── Good: Optional makes absence explicit ─────────────</span>
<span class="c-keyword">public</span> Optional&lt;User&gt; findUser(String id) {
  <span class="c-keyword">return</span> Optional.ofNullable(db.get(id));
}

<span class="c-comment">// ── Chained operations (like Stream) ──────────────────</span>
String city = findUser(<span class="c-str">"u1"</span>)
  .map(User::getAddress)
  .map(Address::getCity)
  .filter(c -&gt; !c.isBlank())
  .orElse(<span class="c-str">"Unknown"</span>);  <span class="c-comment">// safe — no NPE risk</span>

<span class="c-comment">// ── orElseGet vs orElse ───────────────────────────────</span>
<span class="c-comment">// orElse(value) — value ALWAYS computed (even if present)</span>
<span class="c-comment">// orElseGet(supplier) — supplier called ONLY if empty (lazy, preferred)</span>
Optional&lt;User&gt; opt = Optional.empty();
User u = opt.orElseGet(() -&gt; createDefaultUser()); <span class="c-comment">// lazy</span>

<span class="c-comment">// ── orElseThrow ───────────────────────────────────────</span>
User user = findUser(<span class="c-str">"u99"</span>)
  .orElseThrow(() -&gt; <span class="c-keyword">new</span> UserNotFoundException(<span class="c-str">"u99"</span>));`,
        interviewTip: '💡 AVOID: Optional.get() without isPresent() check — still throws NoSuchElementException. AVOID: returning Optional from setters or using as constructor args. Optional is designed as a RETURN TYPE to signal absence.',
      },
    ],
  },

  {
    id: 35, title: 'Collections & Generics', sub: 'List, Set, Map, Comparable, Comparator, Type Safety', color: '#fb923c', level: 'junior',
    concepts: [
      {
        title: 'Collections Framework — Choosing the Right Data Structure',
        description: [
          'The hierarchy: Iterable → Collection → List/Set/Queue. Map is separate (not a Collection). Always declare variables using the interface type (List, not ArrayList) for flexibility.',
          'List implementations: ArrayList — O(1) random access, O(n) insert/delete at middle. LinkedList — O(1) insert/delete at head/tail, O(n) random access. Use ArrayList by default unless frequent insertions at head.',
          'Set implementations: HashSet — O(1) add/contains/remove, no order. LinkedHashSet — maintains insertion order. TreeSet — sorted (natural or Comparator), O(log n) ops. Map implementations follow the same pattern.',
        ],
        code: `<span class="c-comment">// ── Choosing the right implementation ─────────────────</span>
List&lt;String&gt;  list    = <span class="c-keyword">new</span> ArrayList&lt;&gt;();   <span class="c-comment">// fast random access</span>
List&lt;String&gt;  queue   = <span class="c-keyword">new</span> LinkedList&lt;&gt;();   <span class="c-comment">// fast add/remove at ends</span>
Set&lt;String&gt;   unique  = <span class="c-keyword">new</span> HashSet&lt;&gt;();     <span class="c-comment">// O(1), no duplicates</span>
Set&lt;String&gt;   ordered = <span class="c-keyword">new</span> LinkedHashSet&lt;&gt;();<span class="c-comment">// insertion order</span>
Set&lt;String&gt;   sorted  = <span class="c-keyword">new</span> TreeSet&lt;&gt;();     <span class="c-comment">// sorted order</span>
Map&lt;K,V&gt;      map     = <span class="c-keyword">new</span> HashMap&lt;&gt;();      <span class="c-comment">// O(1) get/put</span>
Map&lt;K,V&gt;      lhm     = <span class="c-keyword">new</span> LinkedHashMap&lt;&gt;();<span class="c-comment">// insertion order</span>
Map&lt;K,V&gt;      tree    = <span class="c-keyword">new</span> TreeMap&lt;&gt;();      <span class="c-comment">// sorted by key</span>

<span class="c-comment">// Thread-safe alternatives</span>
List&lt;String&gt; safe1 = Collections.synchronizedList(<span class="c-keyword">new</span> ArrayList&lt;&gt;());
List&lt;String&gt; safe2 = <span class="c-keyword">new</span> CopyOnWriteArrayList&lt;&gt;(); <span class="c-comment">// read-heavy</span>
Map&lt;K,V&gt;    safe3 = <span class="c-keyword">new</span> ConcurrentHashMap&lt;&gt;();     <span class="c-comment">// concurrent map</span>

<span class="c-comment">// Immutable collections (Java 9+)</span>
List&lt;String&gt; immutable = List.of(<span class="c-str">"a"</span>, <span class="c-str">"b"</span>, <span class="c-str">"c"</span>); <span class="c-comment">// UOE on modify</span>`,
        interviewTip: '💡 "Why is HashMap O(1)?" → hash(key) % buckets gives bucket index, then equals() to find exact entry. Worst case O(n) if all keys hash to same bucket (hash collision). Java 8+: buckets with 8+ entries convert to red-black tree → O(log n) worst case.',
      },
      {
        title: 'Comparable vs Comparator — Sorting Objects',
        description: [
          'Comparable (java.lang): defines NATURAL ORDER inside the class itself. Implement compareTo(). Used by Collections.sort() and TreeSet/TreeMap by default. A class can have only ONE natural order.',
          'Comparator (java.util): defines CUSTOM ORDER outside the class. Implement compare(). Can have multiple Comparators for different sort criteria. Java 8+ has factory methods: Comparator.comparing(), thenComparing(), reversed().',
          'Rule of thumb: Use Comparable for natural order (alphabetical for String, numeric for Integer). Use Comparator for alternative orderings or when you cannot modify the class.',
        ],
        code: `<span class="c-comment">// ── Comparable — natural order (inside the class) ─────</span>
<span class="c-keyword">public class</span> <span class="c-fn">Employee</span> <span class="c-keyword">implements</span> Comparable&lt;Employee&gt; {
  <span class="c-keyword">private</span> String name;
  <span class="c-keyword">private double</span> salary;

  @Override
  <span class="c-keyword">public int</span> compareTo(Employee other) {
    <span class="c-keyword">return</span> Double.compare(<span class="c-keyword">this</span>.salary, other.salary); <span class="c-comment">// asc salary</span>
  }
}
Collections.sort(employees); <span class="c-comment">// uses compareTo</span>

<span class="c-comment">// ── Comparator — custom order (outside the class) ─────</span>
Comparator&lt;Employee&gt; byName = Comparator.comparing(Employee::getName);
Comparator&lt;Employee&gt; byNameThenSal = Comparator
  .comparing(Employee::getName)
  .thenComparing(Employee::getSalary)
  .reversed();

employees.sort(byNameThenSal);

<span class="c-comment">// Sort with lambda</span>
employees.sort((a, b) -&gt; b.getName().compareTo(a.getName())); <span class="c-comment">// desc name</span>`,
        interviewTip: '💡 compareTo contract: returns negative if this < other, 0 if equal, positive if this > other. ALWAYS use Integer.compare(), Double.compare() instead of subtraction — subtraction can overflow with large negative numbers!',
      },
      {
        title: 'Generics — Type Safety at Compile Time',
        description: [
          'Generics allow classes and methods to operate on typed parameters. They provide compile-time type checking, eliminating runtime ClassCastException. The type information is ERASED at runtime (type erasure) — the JVM sees raw types.',
          'Wildcards: ? extends T (upper bound, read-only, for producers), ? super T (lower bound, write-only, for consumers). PECS: Producer Extends, Consumer Super.',
          'Generic methods allow type inference on individual methods independent of the class type parameter.',
        ],
        code: `<span class="c-comment">// ── Generic class ─────────────────────────────────────</span>
<span class="c-keyword">public class</span> <span class="c-fn">Pair</span>&lt;A, B&gt; {
  <span class="c-keyword">private final</span> A first;
  <span class="c-keyword">private final</span> B second;
  <span class="c-keyword">public</span> Pair(A a, B b) { first = a; second = b; }
  <span class="c-keyword">public</span> A getFirst()  { <span class="c-keyword">return</span> first; }
  <span class="c-keyword">public</span> B getSecond() { <span class="c-keyword">return</span> second; }
}
Pair&lt;String, Integer&gt; p = <span class="c-keyword">new</span> Pair&lt;&gt;(<span class="c-str">"age"</span>, <span class="c-num">30</span>);

<span class="c-comment">// ── Generic method ────────────────────────────────────</span>
<span class="c-keyword">public static</span> &lt;T <span class="c-keyword">extends</span> Comparable&lt;T&gt;&gt; T max(T a, T b) {
  <span class="c-keyword">return</span> a.compareTo(b) &gt; <span class="c-num">0</span> ? a : b;
}
max(<span class="c-str">"Apple"</span>, <span class="c-str">"Banana"</span>); <span class="c-comment">// "Banana" — T inferred as String</span>
max(<span class="c-num">10</span>, <span class="c-num">20</span>);           <span class="c-comment">// 20    — T inferred as Integer</span>

<span class="c-comment">// ── Wildcards (PECS) ──────────────────────────────────</span>
<span class="c-comment">// ? extends T → read from list (Producer Extends)</span>
<span class="c-keyword">public static double</span> sum(List&lt;? <span class="c-keyword">extends</span> Number&gt; list) {
  <span class="c-keyword">return</span> list.stream().mapToDouble(Number::doubleValue).sum();
}
sum(List.of(<span class="c-num">1</span>, <span class="c-num">2</span>, <span class="c-num">3</span>));       <span class="c-comment">// works with Integer</span>
sum(List.of(<span class="c-num">1.1</span>, <span class="c-num">2.2</span>));     <span class="c-comment">// works with Double</span>

<span class="c-comment">// ? super T → write to list (Consumer Super)</span>
<span class="c-keyword">public static void</span> addNumbers(List&lt;? <span class="c-keyword">super</span> Integer&gt; list) {
  list.add(<span class="c-num">1</span>); list.add(<span class="c-num">2</span>); <span class="c-comment">// safe to write Integers</span>
}`,
        interviewTip: '💡 Type Erasure: List<String> and List<Integer> are the SAME type at runtime (List). You cannot do new T[], instanceof List<String>, or overload with different generic params.',
      },
    ],
  },

  {
    id: 36, title: 'Exception Handling & Custom Exceptions', sub: 'Checked vs Unchecked, try-with-resources, Exception Hierarchy', color: '#fbbf24', level: 'junior',
    concepts: [
      {
        title: 'Exception Hierarchy & Checked vs Unchecked',
        description: [
          'Java exception hierarchy: Throwable → Error (JVM errors, don\'t catch: OutOfMemoryError, StackOverflowError) and Exception (application errors, catch these).',
          'Checked Exceptions (extend Exception directly): IOException, SQLException, ClassNotFoundException. Must be declared in method signature (throws) or caught. Compiler enforces this — "handle or declare" rule.',
          'Unchecked Exceptions (extend RuntimeException): NullPointerException, IllegalArgumentException, ArrayIndexOutOfBoundsException, ClassCastException. No compiler enforcement. Use for programming errors.',
        ],
        code: `<span class="c-comment">// ── Exception Hierarchy ───────────────────────────────</span>
<span class="c-comment">// Throwable</span>
<span class="c-comment">//   ├── Error (don't catch: OOM, SOE)</span>
<span class="c-comment">//   └── Exception</span>
<span class="c-comment">//         ├── Checked: IOException, SQLException</span>
<span class="c-comment">//         └── RuntimeException (unchecked)</span>
<span class="c-comment">//               ├── NullPointerException</span>
<span class="c-comment">//               ├── IllegalArgumentException</span>
<span class="c-comment">//               └── IndexOutOfBoundsException</span>

<span class="c-comment">// ── Multi-catch (Java 7+) ─────────────────────────────</span>
<span class="c-keyword">try</span> {
  processFile(path);
} <span class="c-keyword">catch</span> (IOException | ParseException e) { <span class="c-comment">// multi-catch</span>
  log.error(<span class="c-str">"Processing failed"</span>, e);
} <span class="c-keyword">finally</span> {
  cleanup(); <span class="c-comment">// ALWAYS runs, even if exception or return</span>
}

<span class="c-comment">// ── try-with-resources (Java 7+) ──────────────────────</span>
<span class="c-keyword">try</span> (InputStream in    = <span class="c-keyword">new</span> FileInputStream(<span class="c-str">"a.txt"</span>);
     OutputStream out = <span class="c-keyword">new</span> FileOutputStream(<span class="c-str">"b.txt"</span>)) {
  <span class="c-comment">// resources auto-closed in reverse order — no finally needed</span>
  in.transferTo(out);
}`,
        interviewTip: '💡 "When to use checked vs unchecked?" → Checked for recoverable conditions caller should handle (file not found — maybe retry). Unchecked for programming errors (null arg to a method that says it\'s non-null). Modern style: prefer unchecked to avoid "exception tunneling" boilerplate.',
      },
      {
        title: 'Custom Exceptions — Best Practices',
        description: [
          'Create custom exceptions to make your domain model explicit. A UserNotFoundException is far more meaningful than a generic RuntimeException("User not found").',
          'Best practices: 1) Extend RuntimeException for unchecked (preferred in modern Spring apps). 2) Always provide a message constructor calling super(message). 3) Optionally provide a cause constructor for chaining. 4) Optionally add domain-specific fields (errorCode, resourceId).',
          'Exception chaining preserves the original cause. Always chain: catch (IOException e) { throw new ServiceException("DB failed", e); } — never swallow the cause.',
        ],
        code: `<span class="c-comment">// ── Custom Exception with domain fields ───────────────</span>
<span class="c-keyword">public class</span> <span class="c-fn">ResourceNotFoundException</span> <span class="c-keyword">extends</span> RuntimeException {
  <span class="c-keyword">private final</span> String resourceType;
  <span class="c-keyword">private final</span> Object resourceId;

  <span class="c-keyword">public</span> ResourceNotFoundException(String type, Object id) {
    <span class="c-keyword">super</span>(String.format(<span class="c-str">"%s not found with id: %s"</span>, type, id));
    <span class="c-keyword">this</span>.resourceType = type;
    <span class="c-keyword">this</span>.resourceId = id;
  }
  <span class="c-comment">// getters...</span>
}

<span class="c-comment">// Usage — very readable, domain-specific</span>
<span class="c-keyword">throw new</span> ResourceNotFoundException(<span class="c-str">"User"</span>, userId);

<span class="c-comment">// ── Exception chaining — never lose the cause ─────────</span>
<span class="c-keyword">try</span> {
  connection.execute(sql);
} <span class="c-keyword">catch</span> (SQLException e) {
  <span class="c-keyword">throw new</span> DataAccessException(<span class="c-str">"Query failed"</span>, e); <span class="c-comment">// chain!</span>
}

<span class="c-comment">// ── Global exception handler in Spring Boot ───────────</span>
@RestControllerAdvice
<span class="c-keyword">public class</span> <span class="c-fn">GlobalExceptionHandler</span> {
  @ExceptionHandler(ResourceNotFoundException.class)
  @ResponseStatus(HttpStatus.NOT_FOUND)
  <span class="c-keyword">public</span> ErrorResponse handleNotFound(ResourceNotFoundException e) {
    <span class="c-keyword">return new</span> ErrorResponse(<span class="c-str">"NOT_FOUND"</span>, e.getMessage());
  }
}`,
        interviewTip: '💡 In Spring Boot, @ControllerAdvice + @ExceptionHandler centralizes error handling — you catch once instead of in every controller. Pair with @ResponseStatus or ResponseEntity to control HTTP status codes.',
      },
    ],
  },

  {
    id: 37, title: 'Spring Boot Fundamentals', sub: 'Auto-configuration, Annotations, Application Lifecycle', color: '#22c55e', level: 'junior',
    concepts: [
      {
        title: 'How Spring Boot Auto-Configuration Works',
        description: [
          'Spring Boot uses @SpringBootApplication which combines @Configuration + @EnableAutoConfiguration + @ComponentScan. Auto-configuration scans spring.factories / META-INF/spring/AutoConfiguration.imports for configuration classes.',
          'Each auto-config class uses @ConditionalOn* annotations to activate only when certain conditions are met. Examples: @ConditionalOnClass (a class is on classpath), @ConditionalOnMissingBean (no bean of that type defined), @ConditionalOnProperty.',
          'Component scanning: @Component, @Service, @Repository, @Controller, @RestController are all stereotypes that get picked up automatically. @Service/@Repository add semantic meaning and enable Spring features (like exception translation for @Repository).',
        ],
        code: `<span class="c-keyword">@SpringBootApplication</span>
<span class="c-comment">// = @Configuration + @EnableAutoConfiguration + @ComponentScan</span>
<span class="c-keyword">public class</span> <span class="c-fn">App</span> {
  <span class="c-keyword">public static void</span> main(String[] args) {
    <span class="c-keyword">var</span> ctx = SpringApplication.run(App.class, args);
    <span class="c-comment">// ctx is ApplicationContext — all beans available here</span>
  }
}

<span class="c-comment">// ── Auto-config example: DataSource ──────────────────</span>
<span class="c-comment">// In application.properties:</span>
<span class="c-comment">// spring.datasource.url=jdbc:postgresql://localhost/mydb</span>
<span class="c-comment">// spring.datasource.username=user</span>
<span class="c-comment">// Spring Boot auto-creates: DataSource, EntityManagerFactory,</span>
<span class="c-comment">// TransactionManager — no boilerplate XML needed!</span>

<span class="c-comment">// ── Conditional beans ─────────────────────────────────</span>
@Configuration
<span class="c-keyword">public class</span> <span class="c-fn">CacheConfig</span> {
  @Bean
  @ConditionalOnProperty(name = <span class="c-str">"cache.enabled"</span>, havingValue = <span class="c-str">"true"</span>)
  <span class="c-keyword">public</span> CacheManager cacheManager() {
    <span class="c-keyword">return new</span> RedisCacheManager(...);
  }
}`,
        interviewTip: '💡 "How do you override auto-configuration?" → Define your own @Bean of the same type — auto-config has @ConditionalOnMissingBean, so YOUR bean wins. Or exclude: @SpringBootApplication(exclude = DataSourceAutoConfiguration.class).',
      },
      {
        title: 'Spring Annotations — Cheat Sheet',
        description: [
          'STEREOTYPE ANNOTATIONS (mark classes as Spring components): @Component (generic), @Service (business logic), @Repository (data layer — adds DB exception translation), @Controller (MVC), @RestController (@Controller + @ResponseBody).',
          'BEAN CONFIG: @Configuration (defines beans), @Bean (method that returns a bean), @Primary (preferred when multiple candidates), @Qualifier("name") (specify which bean to inject).',
          'REQUEST MAPPING: @RequestMapping, @GetMapping, @PostMapping, @PutMapping, @DeleteMapping, @PatchMapping, @PathVariable, @RequestParam, @RequestBody, @ResponseBody, @ResponseStatus.',
        ],
        code: `<span class="c-comment">// ── Complete REST controller example ──────────────────</span>
@RestController
@RequestMapping(<span class="c-str">"/api/v1/products"</span>)
<span class="c-keyword">public class</span> <span class="c-fn">ProductController</span> {

  @GetMapping                              <span class="c-comment">// GET /api/v1/products</span>
  <span class="c-keyword">public</span> List&lt;ProductDto&gt; getAll(
      @RequestParam(defaultValue = <span class="c-str">"0"</span>) <span class="c-keyword">int</span> page,
      @RequestParam(defaultValue = <span class="c-str">"20"</span>) <span class="c-keyword">int</span> size) {
    <span class="c-keyword">return</span> service.findAll(PageRequest.of(page, size));
  }

  @GetMapping(<span class="c-str">"/{id}"</span>)                     <span class="c-comment">// GET /api/v1/products/42</span>
  <span class="c-keyword">public</span> ProductDto getById(@PathVariable Long id) {
    <span class="c-keyword">return</span> service.findById(id);
  }

  @PostMapping                             <span class="c-comment">// POST /api/v1/products</span>
  @ResponseStatus(HttpStatus.CREATED)      <span class="c-comment">// 201</span>
  <span class="c-keyword">public</span> ProductDto create(@Valid @RequestBody CreateProductDto dto) {
    <span class="c-keyword">return</span> service.create(dto);
  }

  @PutMapping(<span class="c-str">"/{id}"</span>)
  <span class="c-keyword">public</span> ProductDto update(@PathVariable Long id,
                           @Valid @RequestBody UpdateProductDto dto) {
    <span class="c-keyword">return</span> service.update(id, dto);
  }

  @DeleteMapping(<span class="c-str">"/{id}"</span>)
  @ResponseStatus(HttpStatus.NO_CONTENT)   <span class="c-comment">// 204</span>
  <span class="c-keyword">public void</span> delete(@PathVariable Long id) {
    service.delete(id);
  }
}`,
        interviewTip: '💡 @RestController = @Controller + @ResponseBody. Use @Valid on @RequestBody to trigger Bean Validation (JSR-380). Pair with @NotNull, @Size, @Email on DTO fields. Add @ExceptionHandler(MethodArgumentNotValidException) in @ControllerAdvice to return clean 400 errors.',
      },
    ],
  },

  {
    id: 38, title: 'Dependency Injection & Spring IoC', sub: 'Constructor/Setter/Field Injection, Bean Scopes, @Autowired', color: '#16a34a', level: 'mid',
    concepts: [
      {
        title: 'IoC Container & 3 Types of Dependency Injection',
        description: [
          'IoC (Inversion of Control): Instead of your class creating its own dependencies (new UserRepository()), the Spring container creates them and "injects" them into your class. YOU define what you need; Spring provides it.',
          'Constructor Injection (RECOMMENDED): Dependencies passed via constructor. Benefits: immutable fields (final), clearly communicates required dependencies, easy to test (just pass mocks to constructor), no risk of null fields.',
          'Field Injection (@Autowired on field, AVOID): Works but hides dependencies, makes testing harder (need reflection or Spring context), cannot make fields final. Setter injection is a middle ground — optional dependencies.',
        ],
        code: `<span class="c-comment">// ── ❌ Field injection (avoid in production) ───────────</span>
@Service
<span class="c-keyword">public class</span> <span class="c-fn">OrderService</span> {
  @Autowired UserRepository userRepo; <span class="c-comment">// hidden dependency</span>
  @Autowired EmailService emailSvc;  <span class="c-comment">// can't be final</span>
}

<span class="c-comment">// ── ✅ Constructor injection (preferred) ───────────────</span>
@Service
<span class="c-keyword">public class</span> <span class="c-fn">OrderService</span> {
  <span class="c-keyword">private final</span> UserRepository userRepo;   <span class="c-comment">// final = immutable</span>
  <span class="c-keyword">private final</span> EmailService emailSvc;

  <span class="c-comment">// @Autowired optional if only one constructor (Spring 4.3+)</span>
  <span class="c-keyword">public</span> OrderService(UserRepository userRepo, EmailService emailSvc) {
    <span class="c-keyword">this</span>.userRepo  = userRepo;
    <span class="c-keyword">this</span>.emailSvc  = emailSvc;
  }
}

<span class="c-comment">// ── @Qualifier when multiple beans of same type ────────</span>
@Service
<span class="c-keyword">public class</span> <span class="c-fn">NotificationService</span> {
  <span class="c-keyword">public</span> NotificationService(
      @Qualifier(<span class="c-str">"emailNotifier"</span>) Notifier notifier) {
    <span class="c-keyword">this</span>.notifier = notifier;
  }
}`,
        interviewTip: '💡 "Why prefer constructor injection?" → (1) Immutable fields, (2) required deps explicit at object creation, (3) easy unit testing — just new OrderService(mockRepo, mockEmail) with no Spring context needed.',
      },
      {
        title: 'Bean Scopes — Singleton, Prototype, Request, Session',
        description: [
          'Singleton (default): ONE bean instance per ApplicationContext. All requests for that bean return the SAME object. Good for stateless services (most services should be stateless).',
          'Prototype: NEW instance every time the bean is requested (getBean() or injected). Good for stateful beans. WARNING: Spring creates but does NOT manage lifecycle of prototype beans — you must destroy them yourself.',
          'Web scopes (only in web context): Request (new instance per HTTP request), Session (new instance per HTTP session). Use @Scope("request") or @RequestScope. Inject into singletons using scoped proxy: @Scope(value="request", proxyMode=ScopedProxyMode.TARGET_CLASS).',
        ],
        code: `<span class="c-comment">// ── Singleton (default) ───────────────────────────────</span>
@Service  <span class="c-comment">// or: @Scope("singleton")</span>
<span class="c-keyword">public class</span> <span class="c-fn">UserService</span> { <span class="c-comment">// one instance, shared by all</span> }

<span class="c-comment">// ── Prototype ─────────────────────────────────────────</span>
@Component
@Scope(<span class="c-str">"prototype"</span>)
<span class="c-keyword">public class</span> <span class="c-fn">ReportBuilder</span> {
  <span class="c-keyword">private</span> List&lt;String&gt; rows = <span class="c-keyword">new</span> ArrayList&lt;&gt;(); <span class="c-comment">// stateful</span>
  <span class="c-keyword">public void</span> addRow(String row) { rows.add(row); }
}
<span class="c-comment">// Each injection point gets a FRESH ReportBuilder</span>

<span class="c-comment">// ── Request scope (web) ───────────────────────────────</span>
@Component
@RequestScope  <span class="c-comment">// = @Scope(value="request", proxyMode=TARGET_CLASS)</span>
<span class="c-keyword">public class</span> <span class="c-fn">RequestContext</span> {
  <span class="c-keyword">private</span> String correlationId;
  <span class="c-keyword">private</span> User   currentUser;
  <span class="c-comment">// Fresh per HTTP request, safe to hold request state</span>
}

<span class="c-comment">// ── Bean lifecycle hooks ───────────────────────────────</span>
@Service
<span class="c-keyword">public class</span> <span class="c-fn">CacheService</span> {
  @PostConstruct  <span class="c-comment">// runs after injection, before first use</span>
  <span class="c-keyword">public void</span> init()    { loadCache(); }

  @PreDestroy     <span class="c-comment">// runs before bean is destroyed</span>
  <span class="c-keyword">public void</span> cleanup() { saveCache(); }
}`,
        interviewTip: '💡 TRAP: Injecting a prototype bean into a singleton — the singleton holds a single prototype reference, defeating its purpose. Fix: use ApplicationContext.getBean() or method injection (@Lookup). Or use scoped proxy.',
      },
    ],
  },

  {
    id: 39, title: 'Spring Data JPA & Hibernate', sub: 'Entities, Relationships, JPQL, N+1 Problem, Transactions', color: '#15803d', level: 'mid',
    concepts: [
      {
        title: 'JPA Entities, Relationships & Fetch Types',
        description: [
          'JPA (Java Persistence API) is a specification for ORM. Hibernate is the most common implementation. Entities map to database tables. Use @Entity + @Id on every entity.',
          'Relationships: @OneToOne, @OneToMany, @ManyToOne, @ManyToMany. Each has FetchType (LAZY — load on access, EAGER — load immediately). DEFAULT: @ManyToOne and @OneToOne are EAGER, @OneToMany and @ManyToMany are LAZY.',
          'CascadeType controls what happens to related entities: PERSIST, MERGE, REMOVE, REFRESH, DETACH, ALL. Be careful with CascadeType.REMOVE on @OneToMany — it deletes all children when parent is deleted.',
        ],
        code: `<span class="c-comment">// ── Complete entity with relationships ────────────────</span>
@Entity
@Table(name = <span class="c-str">"orders"</span>)
<span class="c-keyword">public class</span> <span class="c-fn">Order</span> {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  <span class="c-keyword">private</span> Long id;

  @Column(nullable = <span class="c-kw2">false</span>)
  <span class="c-keyword">private</span> LocalDateTime createdAt;

  @ManyToOne(fetch = FetchType.LAZY)  <span class="c-comment">// explicit LAZY (good practice)</span>
  @JoinColumn(name = <span class="c-str">"customer_id"</span>)
  <span class="c-keyword">private</span> Customer customer;

  @OneToMany(mappedBy = <span class="c-str">"order"</span>, cascade = CascadeType.ALL,
             fetch = FetchType.LAZY, orphanRemoval = <span class="c-kw2">true</span>)
  <span class="c-keyword">private</span> List&lt;OrderItem&gt; items = <span class="c-keyword">new</span> ArrayList&lt;&gt;();

  <span class="c-comment">// Helper to maintain bidirectional sync</span>
  <span class="c-keyword">public void</span> addItem(OrderItem item) {
    items.add(item);
    item.setOrder(<span class="c-keyword">this</span>);
  }
}`,
        interviewTip: '💡 Always initialize collection fields (= new ArrayList<>()). Use mappedBy on the non-owning side. The owning side (with @JoinColumn) controls the FK column.',
      },
      {
        title: 'N+1 Problem — The Most Common JPA Interview Topic',
        description: [
          'N+1 Problem: Loading 1 parent entity (1 query), then loading each of N children lazily (N separate queries) = N+1 total queries. This is a performance killer in production with thousands of rows.',
          'Solutions: (1) JPQL JOIN FETCH — eagerly loads association in ONE query. (2) @EntityGraph — declarative fetch plan. (3) @BatchSize — Hibernate loads N collections in batches of the given size. (4) Projection/DTO query — select only what you need.',
          'Always use LAZY fetching as default, and explicitly load only what you need per use-case. Enable hibernate.show_sql=true in dev to spot N+1 problems early.',
        ],
        code: `<span class="c-comment">// ── ❌ N+1 problem — 1 + N queries ────────────────────</span>
List&lt;Order&gt; orders = orderRepo.findAll(); <span class="c-comment">// 1 query</span>
orders.forEach(o -&gt; {
  o.getItems().size(); <span class="c-comment">// N queries (lazy load per order)!</span>
});

<span class="c-comment">// ── ✅ Fix 1: JOIN FETCH in JPQL ──────────────────────</span>
@Query(<span class="c-str">"SELECT o FROM Order o JOIN FETCH o.items WHERE o.id = :id"</span>)
Optional&lt;Order&gt; findWithItems(@Param(<span class="c-str">"id"</span>) Long id);
<span class="c-comment">// Single query with JOIN — loads order + items together</span>

<span class="c-comment">// ── ✅ Fix 2: @EntityGraph ────────────────────────────</span>
@EntityGraph(attributePaths = {<span class="c-str">"items"</span>, <span class="c-str">"customer"</span>})
@Query(<span class="c-str">"SELECT o FROM Order o"</span>)
List&lt;Order&gt; findAllWithItemsAndCustomer();

<span class="c-comment">// ── ✅ Fix 3: DTO Projection (best for read-only) ─────</span>
@Query(<span class="c-str">"SELECT new com.app.dto.OrderSummary(o.id, o.total, c.name) "</span>
     + <span class="c-str">"FROM Order o JOIN o.customer c"</span>)
List&lt;OrderSummary&gt; findOrderSummaries();`,
        interviewTip: '💡 "How do you detect N+1?" → Enable spring.jpa.show-sql=true and logging.level.org.hibernate.SQL=DEBUG. Count the SQL statements. Fix with JOIN FETCH or @EntityGraph. DTO projections are fastest — they avoid hydrating the full entity.',
      },
    ],
  },

  {
    id: 40, title: 'REST APIs with Spring Boot', sub: 'Controller, Service, DTO, Validation, ResponseEntity, Error Handling', color: '#22c55e', level: 'mid',
    concepts: [
      {
        title: 'Layered Architecture: Controller → Service → Repository',
        description: [
          'Standard Spring Boot layering: Controller (HTTP concerns only — routing, parsing, status codes), Service (business logic, transactions), Repository (data access). Never put business logic in controllers or SQL in services.',
          'DTOs (Data Transfer Objects) decouple your API from your database schema. Use separate Request DTOs (what comes IN) and Response DTOs (what goes OUT). Never expose JPA entities directly — it couples your API to the DB schema.',
          'Bean Validation (@Valid + JSR-380 annotations): Validate incoming DTOs declaratively. @NotNull, @NotBlank, @Size, @Email, @Min, @Max, @Pattern. Spring auto-returns 400 Bad Request on validation failure.',
        ],
        code: `<span class="c-comment">// ── DTO with validation ───────────────────────────────</span>
<span class="c-keyword">public record</span> <span class="c-fn">CreateUserRequest</span>(
  @NotBlank(message = <span class="c-str">"Name is required"</span>)
  @Size(min=<span class="c-num">2</span>, max=<span class="c-num">100</span>) String name,

  @NotBlank @Email String email,

  @NotNull @Min(<span class="c-num">18</span>) @Max(<span class="c-num">120</span>) Integer age
) {}

<span class="c-comment">// ── Controller — HTTP concerns only ───────────────────</span>
@RestController
@RequestMapping(<span class="c-str">"/api/users"</span>)
<span class="c-keyword">public class</span> <span class="c-fn">UserController</span> {
  <span class="c-keyword">private final</span> UserService service;

  <span class="c-keyword">public</span> UserController(UserService service) { <span class="c-keyword">this</span>.service = service; }

  @PostMapping
  <span class="c-keyword">public</span> ResponseEntity&lt;UserResponse&gt; create(
      @Valid @RequestBody CreateUserRequest req) {
    UserResponse res = service.create(req);
    URI location = URI.create(<span class="c-str">"/api/users/"</span> + res.id());
    <span class="c-keyword">return</span> ResponseEntity.created(location).body(res); <span class="c-comment">// 201</span>
  }
}

<span class="c-comment">// ── Service — business logic ──────────────────────────</span>
@Service
<span class="c-keyword">public class</span> <span class="c-fn">UserService</span> {
  @Transactional
  <span class="c-keyword">public</span> UserResponse create(CreateUserRequest req) {
    <span class="c-keyword">if</span> (repo.existsByEmail(req.email()))
      <span class="c-keyword">throw new</span> DuplicateEmailException(req.email());
    User user = mapper.toEntity(req);
    <span class="c-keyword">return</span> mapper.toResponse(repo.save(user));
  }
}`,
        interviewTip: '💡 ResponseEntity lets you control status, headers, and body independently. Use ResponseEntity.ok(body) for 200, .created(uri).body(body) for 201, .noContent().build() for 204, .notFound().build() for 404.',
      },
      {
        title: 'Global Exception Handling with @ControllerAdvice',
        description: [
          '@ControllerAdvice (or @RestControllerAdvice = @ControllerAdvice + @ResponseBody) is a class that applies to all controllers. @ExceptionHandler methods inside it handle specific exception types globally — no try/catch in controllers.',
          'Define a standard error response format: timestamp, status, error code, message, path. Consistent error format is critical for API consumers (frontend, other services).',
          'Order of exception matching: most specific exception class first. Spring picks the closest matching @ExceptionHandler.',
        ],
        code: `<span class="c-comment">// ── Standard error response DTO ───────────────────────</span>
<span class="c-keyword">public record</span> <span class="c-fn">ApiError</span>(
  LocalDateTime timestamp, <span class="c-keyword">int</span> status,
  String error, String message, String path
) {
  <span class="c-keyword">public static</span> ApiError of(HttpStatus s, String msg, String path) {
    <span class="c-keyword">return new</span> ApiError(LocalDateTime.now(), s.value(), s.name(), msg, path);
  }
}

<span class="c-comment">// ── Global exception handler ─────────────────────────</span>
@RestControllerAdvice
<span class="c-keyword">public class</span> <span class="c-fn">GlobalExceptionHandler</span> {

  @ExceptionHandler(ResourceNotFoundException.class)
  <span class="c-keyword">public</span> ResponseEntity&lt;ApiError&gt; handleNotFound(
      ResourceNotFoundException ex, HttpServletRequest req) {
    <span class="c-keyword">return</span> ResponseEntity.status(HttpStatus.NOT_FOUND)
      .body(ApiError.of(NOT_FOUND, ex.getMessage(), req.getRequestURI()));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  <span class="c-keyword">public</span> ResponseEntity&lt;ApiError&gt; handleValidation(
      MethodArgumentNotValidException ex, HttpServletRequest req) {
    String msg = ex.getBindingResult().getFieldErrors().stream()
      .map(f -&gt; f.getField() + <span class="c-str">": "</span> + f.getDefaultMessage())
      .collect(Collectors.joining(<span class="c-str">", "</span>));
    <span class="c-keyword">return</span> ResponseEntity.badRequest()
      .body(ApiError.of(BAD_REQUEST, msg, req.getRequestURI()));
  }

  @ExceptionHandler(Exception.class)  <span class="c-comment">// catch-all</span>
  <span class="c-keyword">public</span> ResponseEntity&lt;ApiError&gt; handleAll(
      Exception ex, HttpServletRequest req) {
    <span class="c-keyword">return</span> ResponseEntity.internalServerError()
      .body(ApiError.of(INTERNAL_SERVER_ERROR, <span class="c-str">"Unexpected error"</span>, req.getRequestURI()));
  }
}`,
        interviewTip: '💡 Never expose internal exception messages (stack traces, SQL errors) to API consumers — security risk. Log the full exception internally, return a safe generic message externally.',
      },
    ],
  },

  {
    id: 41, title: 'Spring Security & JWT', sub: 'Filter Chain, Authentication, Authorization, JWT, Password Encoding', color: '#f87171', level: 'senior',
    concepts: [
      {
        title: 'Spring Security Filter Chain',
        description: [
          'Spring Security is implemented as a chain of Servlet Filters. Every HTTP request passes through this chain. The key filter is UsernamePasswordAuthenticationFilter (form login) or your custom JwtAuthenticationFilter.',
          'SecurityFilterChain (Spring Security 5.7+) replaces WebSecurityConfigurerAdapter. You define which paths need authentication, which are public, and what authentication mechanism to use (JWT, form login, OAuth2, basic auth).',
          'Authentication object: After successful login, Spring creates an Authentication object (holding principal, credentials, authorities) and stores it in SecurityContextHolder (ThreadLocal) for the duration of the request.',
        ],
        code: `@Configuration
@EnableWebSecurity
@EnableMethodSecurity  <span class="c-comment">// enables @PreAuthorize</span>
<span class="c-keyword">public class</span> <span class="c-fn">SecurityConfig</span> {

  @Bean
  <span class="c-keyword">public</span> SecurityFilterChain filterChain(HttpSecurity http) <span class="c-keyword">throws</span> Exception {
    <span class="c-keyword">return</span> http
      .csrf(csrf -&gt; csrf.disable())       <span class="c-comment">// stateless JWT — no CSRF needed</span>
      .sessionManagement(sm -&gt;
          sm.sessionCreationPolicy(STATELESS))
      .authorizeHttpRequests(auth -&gt; auth
          .requestMatchers(<span class="c-str">"/api/auth/**"</span>).permitAll()
          .requestMatchers(<span class="c-str">"/api/admin/**"</span>).hasRole(<span class="c-str">"ADMIN"</span>)
          .anyRequest().authenticated()
      )
      .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
      .build();
  }

  @Bean
  <span class="c-keyword">public</span> PasswordEncoder passwordEncoder() {
    <span class="c-keyword">return new</span> BCryptPasswordEncoder(<span class="c-num">12</span>); <span class="c-comment">// strength 12</span>
  }
}`,
        interviewTip: '💡 NEVER store plain-text passwords. BCrypt auto-generates a salt and is computationally expensive to brute-force. BCryptPasswordEncoder.matches(raw, encoded) is used for verification — the salt is embedded in the encoded string.',
      },
      {
        title: 'JWT Authentication — Full Flow',
        description: [
          'JWT (JSON Web Token) flow: (1) User POSTs credentials → server verifies → creates signed JWT → returns to client. (2) Client includes JWT in Authorization: Bearer <token> header on every request. (3) Server validates signature, extracts claims (userId, roles), sets SecurityContext.',
          'JWT structure: Header (algorithm) . Payload (claims: sub, iat, exp, roles) . Signature (HMAC or RSA). The signature makes it tamper-proof — changing the payload invalidates the signature.',
          'Implement a OncePerRequestFilter that extracts the JWT, validates it, and sets the Authentication in SecurityContextHolder before the main filter chain runs.',
        ],
        code: `<span class="c-comment">// ── JWT Filter ────────────────────────────────────────</span>
@Component
<span class="c-keyword">public class</span> <span class="c-fn">JwtAuthFilter</span> <span class="c-keyword">extends</span> OncePerRequestFilter {
  @Override
  <span class="c-keyword">protected void</span> doFilterInternal(HttpServletRequest req,
      HttpServletResponse res, FilterChain chain) <span class="c-keyword">throws</span> IOException, ServletException {

    String header = req.getHeader(<span class="c-str">"Authorization"</span>);
    <span class="c-keyword">if</span> (header == <span class="c-kw2">null</span> || !header.startsWith(<span class="c-str">"Bearer "</span>)) {
      chain.doFilter(req, res); <span class="c-keyword">return</span>;
    }

    String token = header.substring(<span class="c-num">7</span>);
    <span class="c-keyword">if</span> (jwtService.isValid(token)) {
      String username = jwtService.extractUsername(token);
      UserDetails user = userDetailsService.loadUserByUsername(username);
      UsernamePasswordAuthenticationToken auth =
          <span class="c-keyword">new</span> UsernamePasswordAuthenticationToken(user, <span class="c-kw2">null</span>, user.getAuthorities());
      SecurityContextHolder.getContext().setAuthentication(auth);
    }
    chain.doFilter(req, res);
  }
}

<span class="c-comment">// ── Method-level security ─────────────────────────────</span>
@RestController
<span class="c-keyword">public class</span> <span class="c-fn">AdminController</span> {
  @GetMapping(<span class="c-str">"/admin/users"</span>)
  @PreAuthorize(<span class="c-str">"hasRole('ADMIN')"</span>)
  <span class="c-keyword">public</span> List&lt;User&gt; getAllUsers() { <span class="c-keyword">return</span> userService.findAll(); }

  @GetMapping(<span class="c-str">"/users/{id}"</span>)
  @PreAuthorize(<span class="c-str">"hasRole('ADMIN') or #id == authentication.principal.id"</span>)
  <span class="c-keyword">public</span> User getUser(@PathVariable Long id) { ... }
}`,
        interviewTip: '💡 JWT is STATELESS — the server doesn\'t store sessions. The downside: you cannot invalidate a token before expiry (no server-side state). Solutions: short expiry (15 min) + refresh tokens, or maintain a token blacklist in Redis.',
      },
    ],
  },

  {
    id: 42, title: 'Spring AOP & Transactions', sub: '@Transactional Propagation, Isolation, AOP Cross-cutting Concerns', color: '#fb923c', level: 'senior',
    concepts: [
      {
        title: '@Transactional — Propagation & Isolation Deep Dive',
        description: [
          'Spring @Transactional works via a proxy (AOP). When you call a @Transactional method, Spring\'s proxy intercepts, begins a transaction, calls the real method, and commits or rolls back. Self-invocation (calling a @Transactional method from within the same class) BYPASSES the proxy — no transaction!',
          'Propagation defines what happens when a @Transactional method calls another @Transactional method. REQUIRED (default): join existing tx or create new. REQUIRES_NEW: always create new, suspend existing. SUPPORTS: join if exists, no tx if not. NOT_SUPPORTED: always run without tx. NEVER: throw if tx exists.',
          'Isolation levels control what concurrent transactions can see: READ_UNCOMMITTED (dirty reads OK), READ_COMMITTED (default in most DBs), REPEATABLE_READ (same query returns same data), SERIALIZABLE (fully isolated, slowest).',
        ],
        code: `<span class="c-comment">// ── Propagation examples ──────────────────────────────</span>
@Service
<span class="c-keyword">public class</span> <span class="c-fn">OrderService</span> {

  @Transactional  <span class="c-comment">// Propagation.REQUIRED (default)</span>
  <span class="c-keyword">public void</span> placeOrder(OrderRequest req) {
    Order order = orderRepo.save(new Order(req));
    auditService.log(<span class="c-str">"ORDER_PLACED"</span>, order.getId()); <span class="c-comment">// joins THIS tx</span>
    emailService.sendConfirmation(order);             <span class="c-comment">// runs in NEW tx</span>
  }
}

@Service
<span class="c-keyword">public class</span> <span class="c-fn">AuditService</span> {
  @Transactional(propagation = Propagation.REQUIRED) <span class="c-comment">// joins caller's tx</span>
  <span class="c-keyword">public void</span> log(String event, Long ref) { ... }
}

@Service
<span class="c-keyword">public class</span> <span class="c-fn">EmailService</span> {
  @Transactional(propagation = Propagation.REQUIRES_NEW) <span class="c-comment">// own tx</span>
  <span class="c-keyword">public void</span> sendConfirmation(Order o) {
    <span class="c-comment">// Even if order tx rolls back, email log is committed</span>
    emailLogRepo.save(<span class="c-keyword">new</span> EmailLog(o));
    mailer.send(o.getCustomer().getEmail());
  }
}

<span class="c-comment">// ── Isolation: prevent phantom reads ──────────────────</span>
@Transactional(isolation = Isolation.SERIALIZABLE)
<span class="c-keyword">public void</span> processWithFullIsolation() { ... }

<span class="c-comment">// ── rollbackFor — checked exceptions don't auto-rollback</span>
@Transactional(rollbackFor = Exception.class)
<span class="c-keyword">public void</span> riskyOperation() <span class="c-keyword">throws</span> IOException { ... }`,
        interviewTip: '💡 CLASSIC TRAP: @Transactional on a private method — no proxy, no transaction. Must be public. Self-invocation: orderService.placeOrder() calls this.helperMethod() — the helperMethod @Transactional is IGNORED because no proxy intercepts internal calls. Fix: inject self or use programmatic TransactionTemplate.',
      },
      {
        title: 'AOP — Aspect-Oriented Programming for Cross-cutting Concerns',
        description: [
          'AOP separates cross-cutting concerns (logging, timing, security, caching) from business logic. Without AOP, you\'d copy-paste logging/timing code into every method. With AOP, you define it ONCE in an Aspect.',
          'Key terms: Aspect (the class), Pointcut (WHICH methods to intercept — expression), Advice (WHAT to do — @Before, @After, @Around, @AfterReturning, @AfterThrowing), JoinPoint (the method being intercepted), Weaving (applying aspects — Spring does it at runtime via proxy).',
          '@Around is the most powerful — it wraps the method call, can modify args and return value, and controls whether the real method runs at all.',
        ],
        code: `<span class="c-comment">// ── Logging + Timing Aspect ───────────────────────────</span>
@Aspect
@Component
<span class="c-keyword">public class</span> <span class="c-fn">PerformanceAspect</span> {

  <span class="c-comment">// Pointcut: all methods in service package</span>
  @Pointcut(<span class="c-str">"execution(* com.app.service.*.*(..))"</span>)
  <span class="c-keyword">private void</span> serviceMethods() {}

  @Around(<span class="c-str">"serviceMethods()"</span>)
  <span class="c-keyword">public</span> Object logAndTime(ProceedingJoinPoint pjp) <span class="c-keyword">throws</span> Throwable {
    String method = pjp.getSignature().getName();
    log.info(<span class="c-str">"→ {} started"</span>, method);
    <span class="c-keyword">long</span> start = System.currentTimeMillis();
    <span class="c-keyword">try</span> {
      Object result = pjp.proceed(); <span class="c-comment">// call actual method</span>
      log.info(<span class="c-str">"← {} OK ({}ms)"</span>, method, System.currentTimeMillis() - start);
      <span class="c-keyword">return</span> result;
    } <span class="c-keyword">catch</span> (Exception e) {
      log.error(<span class="c-str">"✗ {} FAILED: {}"</span>, method, e.getMessage());
      <span class="c-keyword">throw</span> e;
    }
  }

  <span class="c-comment">// Custom annotation-based pointcut</span>
  @Around(<span class="c-str">"@annotation(com.app.annotation.RateLimited)"</span>)
  <span class="c-keyword">public</span> Object rateLimited(ProceedingJoinPoint pjp) <span class="c-keyword">throws</span> Throwable {
    <span class="c-keyword">if</span> (rateLimiter.isAllowed()) <span class="c-keyword">return</span> pjp.proceed();
    <span class="c-keyword">throw new</span> TooManyRequestsException();
  }
}`,
        interviewTip: '💡 Spring AOP uses JDK dynamic proxy (for interfaces) or CGLIB proxy (for classes). AOP can\'t intercept private/static/final methods — the proxy can\'t override them. Spring @Transactional IS implemented via AOP aspects internally.',
      },
    ],
  },

  {
    id: 43, title: 'Spring Boot Testing', sub: 'JUnit 5, Mockito, @WebMvcTest, @SpringBootTest, TestContainers', color: '#fbbf24', level: 'mid',
    concepts: [
      {
        title: 'Unit Testing with JUnit 5 + Mockito',
        description: [
          'Unit tests test a class in ISOLATION — all dependencies replaced with mocks. Fast (milliseconds), no Spring context, no DB. Rule: every method in a service class should have unit tests.',
          'Mockito key annotations: @Mock (creates mock), @InjectMocks (creates real object and injects mocks), @Spy (real object but spy on calls), @Captor (captures arguments). Use @ExtendWith(MockitoExtension.class) — NO need for Spring.',
          'Mockito methods: when().thenReturn(), when().thenThrow(), doNothing(), verify(), verifyNoInteractions(), ArgumentCaptor.capture(), ArgumentMatchers.any().',
        ],
        code: `@ExtendWith(MockitoExtension.class)
<span class="c-keyword">class</span> <span class="c-fn">UserServiceTest</span> {

  @Mock UserRepository userRepo;
  @Mock EmailService emailSvc;
  @InjectMocks UserService userService;

  @Test
  <span class="c-keyword">void</span> createUser_shouldSaveAndSendEmail() {
    <span class="c-comment">// Arrange</span>
    CreateUserRequest req = <span class="c-keyword">new</span> CreateUserRequest(<span class="c-str">"Alice"</span>, <span class="c-str">"alice@example.com"</span>);
    User savedUser = <span class="c-keyword">new</span> User(<span class="c-num">1L</span>, <span class="c-str">"Alice"</span>, <span class="c-str">"alice@example.com"</span>);
    when(userRepo.existsByEmail(req.email())).thenReturn(<span class="c-kw2">false</span>);
    when(userRepo.save(any(User.class))).thenReturn(savedUser);

    <span class="c-comment">// Act</span>
    UserResponse result = userService.create(req);

    <span class="c-comment">// Assert</span>
    assertThat(result.name()).isEqualTo(<span class="c-str">"Alice"</span>);
    verify(userRepo).save(any(User.class));
    verify(emailSvc).sendWelcome(<span class="c-str">"alice@example.com"</span>);
  }

  @Test
  <span class="c-keyword">void</span> createUser_whenEmailExists_shouldThrow() {
    when(userRepo.existsByEmail(any())).thenReturn(<span class="c-kw2">true</span>);
    assertThrows(DuplicateEmailException.class,
      () -&gt; userService.create(<span class="c-keyword">new</span> CreateUserRequest(<span class="c-str">"X"</span>, <span class="c-str">"x@x.com"</span>)));
    verifyNoInteractions(emailSvc); <span class="c-comment">// ensure email NOT sent</span>
  }
}`,
        interviewTip: '💡 Test naming: methodName_condition_expectedBehavior. Use AssertJ (assertThat) over JUnit assertions — fluent API is more readable. @ParameterizedTest + @CsvSource to run same test with multiple inputs.',
      },
      {
        title: 'Integration Testing with @WebMvcTest & @SpringBootTest',
        description: [
          '@WebMvcTest loads ONLY the web layer (controllers, filters, security). Services are mocked with @MockBean. Use MockMvc to simulate HTTP requests without a real server. Fast — no DB needed.',
          '@SpringBootTest loads the FULL application context (like a real running app). Use with @AutoConfigureMockMvc for HTTP testing, or with TestRestTemplate. Slow — suitable for integration tests.',
          'TestContainers: Spin up REAL Docker containers (PostgreSQL, Redis, Kafka) for your tests. Ensures tests run against the real database engine, not an in-memory H2 that behaves differently.',
        ],
        code: `<span class="c-comment">// ── @WebMvcTest — controller layer only ───────────────</span>
@WebMvcTest(UserController.class)
<span class="c-keyword">class</span> <span class="c-fn">UserControllerTest</span> {

  @Autowired MockMvc mockMvc;
  @MockBean  UserService userService;

  @Test
  <span class="c-keyword">void</span> createUser_returns201() <span class="c-keyword">throws</span> Exception {
    UserResponse res = <span class="c-keyword">new</span> UserResponse(<span class="c-num">1L</span>, <span class="c-str">"Alice"</span>, <span class="c-str">"alice@x.com"</span>);
    when(userService.create(any())).thenReturn(res);

    mockMvc.perform(post(<span class="c-str">"/api/users"</span>)
        .contentType(MediaType.APPLICATION_JSON)
        .content(<span class="c-str">"""{"name":"Alice","email":"alice@x.com","age":25}"""</span>))
      .andExpect(status().isCreated())
      .andExpect(jsonPath(<span class="c-str">"$.name"</span>).value(<span class="c-str">"Alice"</span>))
      .andExpect(jsonPath(<span class="c-str">"$.id"</span>).value(<span class="c-num">1</span>));
  }
}

<span class="c-comment">// ── TestContainers — real PostgreSQL in tests ─────────</span>
@SpringBootTest
@Testcontainers
<span class="c-keyword">class</span> <span class="c-fn">UserRepositoryIT</span> {

  @Container
  <span class="c-keyword">static</span> PostgreSQLContainer&lt;?&gt; postgres =
      <span class="c-keyword">new</span> PostgreSQLContainer&lt;&gt;(<span class="c-str">"postgres:16"</span>);

  @DynamicPropertySource
  <span class="c-keyword">static void</span> props(DynamicPropertyRegistry r) {
    r.add(<span class="c-str">"spring.datasource.url"</span>, postgres::getJdbcUrl);
    r.add(<span class="c-str">"spring.datasource.username"</span>, postgres::getUsername);
    r.add(<span class="c-str">"spring.datasource.password"</span>, postgres::getPassword);
  }

  @Test
  <span class="c-keyword">void</span> findByEmail_shouldReturnUser() {
    <span class="c-comment">// runs against REAL PostgreSQL container</span>
  }
}`,
        interviewTip: '💡 Testing pyramid: Many unit tests (fast, cheap) → fewer integration tests → fewest E2E tests. @WebMvcTest is the sweet spot for controller testing — tests real serialization, validation, security config, without the full context cost.',
      },
    ],
  },

  {
    id: 44, title: 'Java Multithreading & Concurrency', sub: 'Threads, ExecutorService, Synchronized, volatile, CompletableFuture', color: '#f97316', level: 'senior',
    concepts: [
      {
        title: 'Threads, ExecutorService & Thread Pools',
        description: [
          'Thread creation: extend Thread or implement Runnable. But never create raw threads in production — use ExecutorService (thread pool). Raw threads are expensive (1MB stack each) and unmanaged.',
          'ExecutorService: Executors.newFixedThreadPool(n) for CPU-bound (n = num cores), newCachedThreadPool() for short-lived tasks, newSingleThreadExecutor() for sequential, ScheduledExecutorService for periodic tasks.',
          'Future vs CompletableFuture: Future.get() blocks the calling thread. CompletableFuture is non-blocking — you chain callbacks (thenApply, thenCompose, thenCombine) that run when the computation completes.',
        ],
        code: `<span class="c-comment">// ── Thread Pool — always use instead of new Thread() ──</span>
ExecutorService pool = Executors.newFixedThreadPool(
    Runtime.getRuntime().availableProcessors()); <span class="c-comment">// CPU cores</span>

Future&lt;String&gt; future = pool.submit(() -&gt; {
  Thread.sleep(<span class="c-num">1000</span>);
  <span class="c-keyword">return</span> <span class="c-str">"result"</span>;
});
String result = future.get(); <span class="c-comment">// blocks until done</span>
pool.shutdown();

<span class="c-comment">// ── CompletableFuture — non-blocking chaining ─────────</span>
CompletableFuture
  .supplyAsync(() -&gt; fetchUser(userId))      <span class="c-comment">// async task</span>
  .thenApply(user -&gt; enrichWithOrders(user)) <span class="c-comment">// transform result</span>
  .thenApply(UserDto::from)
  .exceptionally(ex -&gt; UserDto.empty())      <span class="c-comment">// handle error</span>
  .thenAccept(dto -&gt; sendResponse(dto));     <span class="c-comment">// consume final result</span>

<span class="c-comment">// ── Combine multiple async operations ─────────────────</span>
CompletableFuture&lt;User&gt;    userFut  = fetchUserAsync(id);
CompletableFuture&lt;Profile&gt; profFut  = fetchProfileAsync(id);
CompletableFuture.allOf(userFut, profFut).thenRun(() -&gt; {
  User    user    = userFut.join();    <span class="c-comment">// join() — non-blocking here</span>
  Profile profile = profFut.join();
  buildDashboard(user, profile);
});`,
        interviewTip: '💡 CompletableFuture.supplyAsync() uses ForkJoinPool.commonPool() by default. Always provide a custom executor for production: CompletableFuture.supplyAsync(task, myPool) to control thread count and queue behavior.',
      },
      {
        title: 'Synchronization, volatile, and Atomic Classes',
        description: [
          'Race condition: two threads read-modify-write a shared variable simultaneously — result is unpredictable. Fix with: synchronized block/method, volatile, or Atomic classes.',
          'synchronized: only ONE thread can enter a synchronized block/method at a time. Uses an intrinsic lock (monitor). synchronized on an instance method locks on "this". synchronized on a static method locks on the Class object. Heavy-weight — causes thread contention.',
          'volatile: ensures VISIBILITY — changes by one thread are immediately visible to all other threads. Does NOT ensure atomicity. Use for a single flag (boolean running = true). For counter/compound operations, use AtomicInteger, AtomicLong, AtomicReference.',
        ],
        code: `<span class="c-comment">// ── volatile — visibility, not atomicity ──────────────</span>
<span class="c-keyword">private volatile boolean</span> running = <span class="c-kw2">true</span>;

<span class="c-keyword">public void</span> stop() { running = <span class="c-kw2">false</span>; } <span class="c-comment">// visible to all threads</span>
<span class="c-keyword">public void</span> run()  { <span class="c-keyword">while</span> (running) { process(); } }

<span class="c-comment">// ── synchronized — mutual exclusion ───────────────────</span>
<span class="c-keyword">public class</span> <span class="c-fn">Counter</span> {
  <span class="c-keyword">private int</span> count = <span class="c-num">0</span>;

  <span class="c-keyword">public synchronized void</span> increment() { count++; } <span class="c-comment">// thread-safe</span>
  <span class="c-keyword">public synchronized int</span>  get()       { <span class="c-keyword">return</span> count; }
}

<span class="c-comment">// ── AtomicInteger — lock-free, faster than synchronized</span>
<span class="c-keyword">private final</span> AtomicInteger counter = <span class="c-keyword">new</span> AtomicInteger(<span class="c-num">0</span>);
counter.incrementAndGet(); <span class="c-comment">// atomic read-increment-write</span>
counter.compareAndSet(<span class="c-num">5</span>, <span class="c-num">10</span>); <span class="c-comment">// CAS: only sets to 10 if current == 5</span>

<span class="c-comment">// ── ReentrantLock — explicit lock with tryLock ─────────</span>
<span class="c-keyword">private final</span> Lock lock = <span class="c-keyword">new</span> ReentrantLock();

<span class="c-keyword">public void</span> transfer(Account from, Account to, <span class="c-keyword">double</span> amt) {
  lock.lock();
  <span class="c-keyword">try</span> {
    from.debit(amt); to.credit(amt);
  } <span class="c-keyword">finally</span> {
    lock.unlock(); <span class="c-comment">// ALWAYS unlock in finally!</span>
  }
}`,
        interviewTip: '💡 "What is deadlock?" → Two threads each hold a lock the other needs. Prevention: always acquire locks in the same order. "What is thread starvation?" → Low-priority threads never get CPU. "What is livelock?" → Threads keep responding to each other without making progress.',
      },
    ],
  },


  // ═══════════════════════════════════════════════════════════════
  // DSA (IDs 45–54)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 45, title: 'Arrays & Strings', sub: 'Two Pointers, Sliding Window, Matrix', color: '#a78bfa', level: 'junior',
    concepts: [
      {
        title: 'Two Pointer Technique', description: ['Two pointers move toward each other (or in the same direction) to solve problems in O(n) that would otherwise take O(n²).'],
        code: `<span class="c-comment">// Find pair that sums to target in sorted array</span>\n<span class="c-keyword">function</span> <span class="c-fn">twoSum</span>(arr, target) {\n  <span class="c-keyword">let</span> left = <span class="c-num">0</span>, right = arr.length - <span class="c-num">1</span>;\n  <span class="c-keyword">while</span> (left &lt; right) {\n    <span class="c-keyword">const</span> sum = arr[left] + arr[right];\n    <span class="c-keyword">if</span> (sum === target) <span class="c-keyword">return</span> [left, right];\n    <span class="c-keyword">if</span> (sum &lt; target) left++; <span class="c-keyword">else</span> right--;\n  }\n}`,
        interviewTip: '💡 Two pointers → sorted array or subarray problems. Sliding window → subarray/substring with a constraint.',
      },
      {
        title: 'Sliding Window', description: ['Sliding window maintains a window over a data structure, expanding or shrinking to satisfy a constraint — O(n) for most problems.'],
        code: `<span class="c-comment">// Longest substring without repeating chars</span>\n<span class="c-keyword">function</span> <span class="c-fn">lengthOfLongest</span>(s) {\n  <span class="c-keyword">const</span> seen = <span class="c-keyword">new</span> Map();\n  <span class="c-keyword">let</span> max = <span class="c-num">0</span>, left = <span class="c-num">0</span>;\n  <span class="c-keyword">for</span> (<span class="c-keyword">let</span> r = <span class="c-num">0</span>; r &lt; s.length; r++) {\n    <span class="c-keyword">if</span> (seen.has(s[r])) left = Math.max(left, seen.get(s[r]) + <span class="c-num">1</span>);\n    seen.set(s[r], r);\n    max = Math.max(max, r - left + <span class="c-num">1</span>);\n  }\n  <span class="c-keyword">return</span> max;\n}`,
      },
    ],
  },
  {
    id: 46, title: 'Linked Lists', sub: 'Singly, Doubly, Circular, Fast/Slow Pointer', color: '#c4b5fd', level: 'mid',
    concepts: [{
      title: 'Fast & Slow Pointer (Floyd\'s Cycle Detection)',
      description: ['Two pointers moving at different speeds can detect cycles in O(n) time and O(1) space.'],
      code: `<span class="c-keyword">function</span> <span class="c-fn">hasCycle</span>(head) {\n  <span class="c-keyword">let</span> slow = head, fast = head;\n  <span class="c-keyword">while</span> (fast && fast.next) {\n    slow = slow.next;\n    fast = fast.next.next;\n    <span class="c-keyword">if</span> (slow === fast) <span class="c-keyword">return</span> <span class="c-kw2">true</span>;\n  }\n  <span class="c-keyword">return</span> <span class="c-kw2">false</span>;\n}`,
      interviewTip: '💡 Fast/slow pointer also finds the middle of a list (slow at n/2 when fast reaches end).',
    }],
  },
  {
    id: 47, title: 'Stacks & Queues', sub: 'LIFO, FIFO, Monotonic Stack', color: '#d8b4fe', level: 'mid',
    concepts: [{
      title: 'Monotonic Stack',
      description: ['A monotonic stack maintains elements in increasing or decreasing order. Pop elements that violate the order. Solves "next greater element" problems in O(n).'],
      code: `<span class="c-comment">// Next Greater Element</span>\n<span class="c-keyword">function</span> <span class="c-fn">nextGreater</span>(nums) {\n  <span class="c-keyword">const</span> result = <span class="c-keyword">new</span> Array(nums.length).fill(-<span class="c-num">1</span>);\n  <span class="c-keyword">const</span> stack = []; <span class="c-comment">// indexes, decreasing values</span>\n  <span class="c-keyword">for</span> (<span class="c-keyword">let</span> i = <span class="c-num">0</span>; i &lt; nums.length; i++) {\n    <span class="c-keyword">while</span> (stack.length && nums[i] &gt; nums[stack.at(-<span class="c-num">1</span>)]) {\n      result[stack.pop()] = nums[i];\n    }\n    stack.push(i);\n  }\n  <span class="c-keyword">return</span> result;\n}`,
      interviewTip: '💡 Valid Parentheses is the classic stack problem — push opens, pop on close, check top matches.',
    }],
  },
  {
    id: 48, title: 'Trees & Graphs', sub: 'DFS, BFS, Binary Search Tree, Trie', color: '#e9d5ff', level: 'senior',
    concepts: [
      {
        title: 'DFS vs BFS', description: ['DFS uses a stack (or recursion). BFS uses a queue. BFS finds shortest path in unweighted graphs. DFS is simpler to implement recursively.'],
        code: `<span class="c-comment">// BFS — level-order traversal</span>\n<span class="c-keyword">function</span> <span class="c-fn">bfs</span>(root) {\n  <span class="c-keyword">const</span> queue = [root];\n  <span class="c-keyword">while</span> (queue.length) {\n    <span class="c-keyword">const</span> node = queue.shift();\n    console.log(node.val);\n    <span class="c-keyword">if</span> (node.left)  queue.push(node.left);\n    <span class="c-keyword">if</span> (node.right) queue.push(node.right);\n  }\n}`,
        interviewTip: '💡 DFS on a tree naturally uses O(h) stack space where h is height. BFS uses O(w) where w is max width.',
      },
      {
        title: 'Binary Search Tree Operations', description: ['BST property: left < root < right. Inorder traversal gives sorted output. Search, insert, delete are O(log n) for balanced trees.'],
        code: `<span class="c-keyword">function</span> <span class="c-fn">searchBST</span>(root, val) {\n  <span class="c-keyword">if</span> (!root || root.val === val) <span class="c-keyword">return</span> root;\n  <span class="c-keyword">return</span> val &lt; root.val\n    ? searchBST(root.left, val)\n    : searchBST(root.right, val);\n}`,
      },
    ],
  },
  {
    id: 49, title: 'Hash Tables & Sets', sub: 'Hash Functions, Collision, Frequency Count', color: '#c4b5fd', level: 'mid',
    concepts: [{
      title: 'Hash Map Patterns', description: ['Hash maps enable O(1) average lookup. Common interview patterns: frequency count, two-sum complement lookup, anagram detection.'],
      code: `<span class="c-comment">// Two Sum — O(n) with hash map</span>\n<span class="c-keyword">function</span> <span class="c-fn">twoSum</span>(nums, target) {\n  <span class="c-keyword">const</span> map = <span class="c-keyword">new</span> Map();\n  <span class="c-keyword">for</span> (<span class="c-keyword">let</span> i = <span class="c-num">0</span>; i &lt; nums.length; i++) {\n    <span class="c-keyword">const</span> complement = target - nums[i];\n    <span class="c-keyword">if</span> (map.has(complement)) <span class="c-keyword">return</span> [map.get(complement), i];\n    map.set(nums[i], i);\n  }\n}`,
      interviewTip: '💡 When you see "find pair" or "check if exists", think hash map first.',
    }],
  },
  {
    id: 50, title: 'Sorting Algorithms', sub: 'Quick, Merge, Heap, Time & Space Complexity', color: '#a78bfa', level: 'mid',
    concepts: [{
      title: 'Sorting Complexity & Trade-offs', description: ['Quick sort is O(n log n) average but O(n²) worst case. Merge sort is always O(n log n) but uses O(n) extra space. Heap sort is O(n log n) with O(1) space but poor cache performance.'],
      list: ['Bubble/Selection/Insertion: O(n²) — only use for tiny arrays or nearly sorted', 'Merge Sort: stable, O(n log n) always, O(n) space', 'Quick Sort: O(n log n) avg, O(n²) worst, O(log n) space, fastest in practice', 'Heap Sort: O(n log n), O(1) space, unstable'],
      interviewTip: '💡 "What sort does JavaScript use?" → Array.sort uses Timsort (merge + insertion hybrid).',
    }],
  },
  {
    id: 51, title: 'Searching & Binary Search', sub: 'Binary Search & Its Variations', color: '#9333ea', level: 'junior',
    concepts: [{
      title: 'Binary Search Template', description: ['Binary search works on sorted data. The key is deciding what condition moves left or right. Use lo ≤ hi with careful boundary handling.'],
      code: `<span class="c-keyword">function</span> <span class="c-fn">binarySearch</span>(arr, target) {\n  <span class="c-keyword">let</span> lo = <span class="c-num">0</span>, hi = arr.length - <span class="c-num">1</span>;\n  <span class="c-keyword">while</span> (lo &lt;= hi) {\n    <span class="c-keyword">const</span> mid = (lo + hi) &gt;&gt; <span class="c-num">1</span>;\n    <span class="c-keyword">if</span> (arr[mid] === target) <span class="c-keyword">return</span> mid;\n    <span class="c-keyword">if</span> (arr[mid] &lt; target) lo = mid + <span class="c-num">1</span>;\n    <span class="c-keyword">else</span> hi = mid - <span class="c-num">1</span>;\n  }\n  <span class="c-keyword">return</span> -<span class="c-num">1</span>;\n}`,
      interviewTip: '💡 Binary search applies beyond sorted arrays — think "search space". Can binary search the answer itself (e.g., minimum feasible capacity).',
    }],
  },
  {
    id: 52, title: 'Dynamic Programming', sub: 'Memoization, Tabulation, Classic Problems', color: '#7e22ce', level: 'senior',
    concepts: [
      {
        title: 'DP Framework', description: ['DP solves problems with overlapping subproblems and optimal substructure. Top-down uses recursion + memoization. Bottom-up builds a table iteratively.'],
        code: `<span class="c-comment">// Fibonacci — bottom-up DP</span>\n<span class="c-keyword">function</span> <span class="c-fn">fib</span>(n) {\n  <span class="c-keyword">const</span> dp = [<span class="c-num">0</span>, <span class="c-num">1</span>];\n  <span class="c-keyword">for</span> (<span class="c-keyword">let</span> i = <span class="c-num">2</span>; i &lt;= n; i++) dp[i] = dp[i-<span class="c-num">1</span>] + dp[i-<span class="c-num">2</span>];\n  <span class="c-keyword">return</span> dp[n];\n}\n\n<span class="c-comment">// Climb stairs: dp[i] = dp[i-1] + dp[i-2]</span>\n<span class="c-comment">// Coin change: dp[i] = min(dp[i - coin] + 1) for each coin</span>`,
        interviewTip: '💡 DP interview pattern: 1) Define subproblem, 2) State transition, 3) Base case, 4) Build table / memoize.',
      },
    ],
  },
  {
    id: 53, title: 'Greedy & Backtracking', sub: 'Optimal Substructure, Permutations, N-Queens', color: '#6b21a8', level: 'senior',
    concepts: [
      {
        title: 'Backtracking Template', description: ['Backtracking explores all possibilities by building candidates incrementally and abandoning ("pruning") a path when it can\'t lead to a valid solution.'],
        code: `<span class="c-comment">// Permutations</span>\n<span class="c-keyword">function</span> <span class="c-fn">permute</span>(nums) {\n  <span class="c-keyword">const</span> result = [];\n  <span class="c-keyword">function</span> <span class="c-fn">bt</span>(path, used) {\n    <span class="c-keyword">if</span> (path.length === nums.length) { result.push([...path]); <span class="c-keyword">return</span>; }\n    <span class="c-keyword">for</span> (<span class="c-keyword">let</span> i = <span class="c-num">0</span>; i &lt; nums.length; i++) {\n      <span class="c-keyword">if</span> (used[i]) <span class="c-keyword">continue</span>;\n      used[i] = <span class="c-kw2">true</span>; path.push(nums[i]);\n      bt(path, used);\n      used[i] = <span class="c-kw2">false</span>; path.pop(); <span class="c-comment">// undo</span>\n    }\n  }\n  bt([], {});\n  <span class="c-keyword">return</span> result;\n}`,
        interviewTip: '💡 Backtracking = "try, recurse, undo". Common problems: subsets, combinations, permutations, N-Queens, word search.',
      },
    ],
  },
  {
    id: 54, title: 'Graph Algorithms', sub: 'Dijkstra, Union-Find, Topological Sort', color: '#581c87', level: 'senior',
    concepts: [
      {
        title: 'Dijkstra\'s Shortest Path', description: ['Dijkstra finds the shortest path from a source to all other nodes in a weighted graph with non-negative edges. Uses a min-heap (priority queue).'],
        code: `<span class="c-keyword">function</span> <span class="c-fn">dijkstra</span>(graph, start) {\n  <span class="c-keyword">const</span> dist = {}; <span class="c-keyword">const</span> pq = [[<span class="c-num">0</span>, start]]; <span class="c-comment">// [cost, node]</span>\n  dist[start] = <span class="c-num">0</span>;\n  <span class="c-keyword">while</span> (pq.length) {\n    <span class="c-keyword">const</span> [cost, node] = pq.shift();\n    <span class="c-keyword">if</span> (cost > (dist[node] ?? Infinity)) <span class="c-keyword">continue</span>;\n    <span class="c-keyword">for</span> (<span class="c-keyword">const</span> [next, weight] of graph[node] || []) {\n      <span class="c-keyword">const</span> nc = cost + weight;\n      <span class="c-keyword">if</span> (nc &lt; (dist[next] ?? Infinity)) {\n        dist[next] = nc; pq.push([nc, next]);\n      }\n    }\n  }\n  <span class="c-keyword">return</span> dist;\n}`,
        interviewTip: '💡 Union-Find (Disjoint Set Union) detects cycles and finds connected components in O(α(n)) — nearly O(1).',
      },
    ],
  },

  {
    id: 112, title: 'Java Runtime & Program Structure', sub: 'Source, bytecode, JVM, entry points', color: '#fbbf24', level: 'junior',
    concepts: [
      {
        title: 'Compile and Run a Java Program',
        description: ['Java source files are compiled into bytecode. A compatible JVM executes that bytecode on the host platform; this is the basis for Java portability.', 'The JDK includes development tools such as javac, while a runtime environment supplies what is needed to run compiled programs.'],
        code: `// Save as Welcome.java\npublic class Welcome {\n    public static void main(String[] args) {\n        System.out.println("Welcome to Java");\n    }\n}\n\n// Terminal: javac Welcome.java\n// Terminal: java Welcome`,
      },
      {
        title: 'Packages, Imports, and Source Files',
        description: ['A package names a group of related types and helps avoid class-name collisions. The package declaration belongs at the top of a source file and should match the source directory structure.', 'Import only the types needed by a file; java.lang types are available without an explicit import.'],
        code: `package com.example.catalog;\n\nimport java.util.List;\n\npublic class Catalog {\n    private final List&lt;String&gt; names;\n\n    public Catalog(List&lt;String&gt; names) {\n        this.names = List.copyOf(names);\n    }\n}`,
      },
    ],
  },
  {
    id: 113, title: 'Java Variables, Types & Casting', sub: 'Primitives, references, scope, conversions', color: '#f59e0b', level: 'junior',
    concepts: [
      {
        title: 'Primitive and Reference Types',
        description: ['Java has eight primitive types: boolean, char, byte, short, int, long, float, and double. Variables of reference types hold a reference to an object; they can also be null.', 'Wrapper classes such as Integer and Boolean let primitive values participate in APIs that require objects, including generic collections. Autoboxing and unboxing convert between the two forms.'],
        code: `int attempts = 3;\nInteger boxedAttempts = attempts;\nint restored = boxedAttempts;\n\nList&lt;Integer&gt; scores = List.of(82, 91, 76);`,
      },
      {
        title: 'Variable Scope and Type Inference',
        description: ['A local variable exists within its declaring block; fields belong to an object or class. Local variables must be initialized before use, while fields receive type-specific default values.', 'Since Java 10, var can infer a local variable’s declared type from its initializer. It does not make Java dynamically typed and cannot be used for fields or uninitialized locals.'],
        code: `var message = "ready"; // inferred as String\nint retries = 0;\n\nif (retries == 0) {\n    String status = message;\n    System.out.println(status);\n}`,
      },
      {
        title: 'Widening and Narrowing Conversions',
        description: ['Widening conversions move to a type with a broader range, such as int to long. Narrowing conversions require an explicit cast and can lose high-order bits or precision.', 'For integer calculations that must detect overflow, use exact arithmetic helpers such as Math.addExact rather than assuming a cast preserves the value.'],
        code: `int count = 12;\nlong total = count; // widening\n\ndouble measurement = 9.8;\nint whole = (int) measurement; // truncates to 9\n\nint safeTotal = Math.addExact(20, 22);`,
      },
    ],
  },
  {
    id: 114, title: 'Java Operators & Control Flow', sub: 'Expressions, conditions, switch, loops', color: '#fb923c', level: 'junior',
    concepts: [
      {
        title: 'Operators and Boolean Conditions',
        description: ['Arithmetic, comparison, logical, assignment, and bitwise operators form expressions. Parentheses make precedence and intent easier to review.', 'Use short-circuit && and || when the right-hand condition should run only when the left side allows it.'],
        code: `int age = 21;\nboolean canRegister = age &gt;= 18 &amp;&amp; age &lt; 120;\n\nint nextValue = age + 1;\nSystem.out.println(canRegister &amp;&amp; nextValue &gt; age);`,
      },
      {
        title: 'if, switch, and Branching',
        description: ['Use if/else for ranges and compound conditions. switch selects among discrete values; modern switch expressions can produce a value and avoid accidental fall-through.', 'Include a default branch when the input domain can grow or contain unexpected values.'],
        code: `String label = switch (status) {\n    case 200 -&gt; "ok";\n    case 404 -&gt; "missing";\n    default -&gt; "other";\n};`,
      },
      {
        title: 'Loops and Loop Control',
        description: ['Use a counted for loop when an index matters, an enhanced for loop to visit every element, and while when repetition depends on a condition.', 'break exits the nearest loop; continue skips the remainder of the current iteration. Ensure loops update the state that controls their termination.'],
        code: `int total = 0;\nfor (int score : scores) {\n    if (score &lt; 0) continue;\n    total += score;\n}\nSystem.out.println(total);`,
      },
    ],
  },
  {
    id: 115, title: 'Java Arrays & Methods', sub: 'Fixed-size sequences, signatures, varargs', color: '#f97316', level: 'junior',
    concepts: [
      {
        title: 'Arrays and Utility Operations',
        description: ['An array has a fixed length and stores values of one component type. Its indexes range from zero through length minus one; accessing outside that range throws an exception.', 'Use java.util.Arrays for common operations such as sorting, searching, equality checks, and readable output. Use a collection when the number of items must grow or shrink.'],
        code: `int[] values = { 8, 3, 5 };\nArrays.sort(values);\nSystem.out.println(Arrays.toString(values));\nSystem.out.println(Arrays.binarySearch(values, 5));`,
      },
      {
        title: 'Methods, Return Types, and Parameters',
        description: ['A method signature identifies the method name and parameter types; the return type is declared separately. Java passes arguments by value, including a copied reference value when the argument is an object.', 'Keep methods focused and return a result when callers need to compose the operation.'],
        code: `static int clamp(int value, int min, int max) {\n    return Math.max(min, Math.min(value, max));\n}\n\nint safeValue = clamp(14, 0, 10);`,
      },
      {
        title: 'Overloads and Varargs',
        description: ['Overloaded methods share a name but have different parameter lists; the compiler selects a matching overload. Varargs let a method accept zero or more trailing values as an array.', 'Avoid overload sets whose argument types make calls ambiguous, especially when null can match multiple reference types.'],
        code: `static int sum(int... values) {\n    int total = 0;\n    for (int value : values) total += value;\n    return total;\n}\n\nint result = sum(2, 4, 6);`,
      },
    ],
  },
  {
    id: 116, title: 'Java Classes, Constructors & Access', sub: 'Fields, initialization, static members', color: '#ea580c', level: 'mid',
    concepts: [
      {
        title: 'Constructors and Initialization',
        description: ['A constructor initializes a new instance and has the same name as its class. A constructor can delegate to another constructor in the same class with this(...), or invoke a parent constructor with super(...).', 'Initialize fields to a valid state and validate constructor inputs before storing them.'],
        code: `class UserProfile {\n    private final String name;\n\n    UserProfile(String name) {\n        this.name = Objects.requireNonNull(name);\n    }\n}`,
      },
      {
        title: 'Access Modifiers and Encapsulation',
        description: ['private limits access to the declaring class, package-private to the package, protected to package/subclasses, and public to all callers subject to module visibility.', 'Encapsulation protects invariants by keeping fields private and exposing operations that validate state changes.'],
        code: `class Temperature {\n    private double celsius;\n\n    public void setCelsius(double value) {\n        if (value &lt; -273.15) throw new IllegalArgumentException();\n        celsius = value;\n    }\n}`,
      },
      {
        title: 'Static and Instance Members',
        description: ['Instance fields and methods belong to each object. Static members belong to the class and are shared; use them for behavior or constants that do not depend on a particular instance.', 'Prefer instance methods for polymorphic behavior and avoid mutable global static state.'],
        code: `class Ids {\n    private static int next = 1;\n    private final int value = next++;\n\n    int value() { return value; }\n    static int issuedCount() { return next - 1; }\n}`,
      },
    ],
  },
  {
    id: 117, title: 'Java Strings, Enums & Packages', sub: 'Text, constants, namespaces', color: '#f59e0b', level: 'mid',
    concepts: [
      {
        title: 'String Equality and StringBuilder',
        description: ['String is immutable, so operations create new values. Compare content with equals(), not ==, which compares whether two references point to the same object.', 'For repeated concatenation in a loop, StringBuilder avoids creating a chain of temporary strings.'],
        code: `String language = new String("Java");\nSystem.out.println(language.equals("Java")); // true\nSystem.out.println(language == "Java"); // usually false\n\nStringBuilder text = new StringBuilder();\ntext.append("core").append(" ").append("Java");`,
      },
      {
        title: 'Enums and Exhaustive Choices',
        description: ['An enum defines a fixed set of named instances. Enums can have fields, constructors, and methods, making them safer than unrelated integer or string constants.', 'Use a switch expression over an enum when every constant should be handled explicitly.'],
        code: `enum Priority { LOW, NORMAL, HIGH }\n\nstatic int weight(Priority priority) {\n    return switch (priority) {\n        case LOW -&gt; 1;\n        case NORMAL -&gt; 2;\n        case HIGH -&gt; 3;\n    };\n}`,
      },
      {
        title: 'Packages and API Organization',
        description: ['Packages group related types, express namespaces, and participate in access control. Keep package names stable and organize by domain or responsibility.', 'A public class is normally declared in a source file with the same name. Imports improve readability but do not copy or load code at runtime.'],
        code: `package com.example.orders;\n\nimport java.util.List;\n\npublic class OrderService {\n    public List&lt;String&gt; statuses() {\n        return List.of("NEW", "PAID", "SHIPPED");\n    }\n}`,
      },
    ],
  },
  {
    id: 118, title: 'Java Input & File I/O', sub: 'Console input, paths, streams, resource safety', color: '#c2410c', level: 'mid',
    concepts: [
      {
        title: 'Reading Console Input',
        description: ['Scanner offers convenient token parsing and delimiter handling. BufferedReader is often more efficient for large text input; parse values explicitly and handle malformed input.', 'Close resources when ownership ends, or use try-with-resources so they close even if an exception occurs.'],
        code: `try (Scanner scanner = new Scanner(System.in)) {\n    System.out.print("Name: ");\n    String name = scanner.nextLine();\n    System.out.println("Hello, " + name);\n}`,
      },
      {
        title: 'Reading and Writing Files',
        description: ['The Path and Files APIs provide modern operations for reading, writing, and traversing files. Choose explicit character encodings for text and handle checked I/O failures at a boundary that can recover or report them.', 'For large files, stream lines or bytes rather than loading the entire file into memory.'],
        code: `Path path = Path.of("notes.txt");\ntry (var lines = Files.lines(path, StandardCharsets.UTF_8)) {\n    lines.filter(line -&gt; !line.isBlank())\n         .forEach(System.out::println);\n} catch (IOException error) {\n    System.err.println("Could not read notes: " + error.getMessage());\n}`,
      },
      {
        title: 'Resource Ownership and Exceptions',
        description: ['Use try-with-resources for objects that implement AutoCloseable. Resources are closed in reverse declaration order, including when the body throws.', 'Catch an exception where the program can add context, recover, or translate it into an appropriate result; do not silently swallow failures.'],
        code: `try (var reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {\n    System.out.println(reader.readLine());\n} catch (IOException error) {\n    throw new UncheckedIOException("Loading configuration failed", error);\n}`,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // SYSTEM DESIGN (IDs 55–62)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 55, title: 'System Design Fundamentals', sub: 'Scalability, Load Balancing, CAP Theorem', color: '#ff6b6b', level: 'senior',
    concepts: [{
      title: 'CAP Theorem & Scalability', description: ['CAP Theorem: a distributed system can only guarantee two of three: Consistency, Availability, Partition tolerance. Network partitions always happen, so you choose CP (consistent but may be unavailable) or AP (available but may be stale).'],
      list: ['Vertical scaling: bigger machines (limits)', 'Horizontal scaling: more machines + load balancer', 'Stateless services scale horizontally; stateful services need session affinity or distributed state'],
      interviewTip: '💡 Classic interview: "Design Twitter". Start with requirements → single-box design → scale bottlenecks one by one.',
    }],
  },
  {
    id: 56, title: 'Database Design', sub: 'Normalization, Indexing, Replication, Sharding', color: '#ff5252', level: 'senior',
    concepts: [{
      title: 'Indexing & Sharding', description: ['Indexes speed up reads but slow down writes. B-tree indexes for range queries; hash indexes for exact lookups. Sharding partitions data across nodes by a shard key.'],
      list: ['Index on WHERE, JOIN, ORDER BY columns', 'Too many indexes slows INSERT/UPDATE', 'Sharding: range-based, hash-based, or directory-based', 'Replication: leader-follower for read scaling and failover'],
      interviewTip: '💡 "The index is a copy of the column sorted for fast lookup." Composite index order matters — (a,b) index doesn\'t speed up queries on b alone.',
    }],
  },
  {
    id: 57, title: 'API Design & Conventions', sub: 'REST, GraphQL, gRPC, Rate Limiting', color: '#f87171', level: 'mid',
    concepts: [{
      title: 'REST vs GraphQL vs gRPC', description: ['REST is simple, broadly supported, cacheable. GraphQL lets clients specify exactly what data they need — eliminates over/under-fetching. gRPC uses protobuf binary encoding for high-performance internal services.'],
      list: ['REST: resource-based URLs, multiple round trips for related data', 'GraphQL: single endpoint, flexible queries, complex caching', 'gRPC: binary protocol, typed contracts, streaming — great for microservices'],
      interviewTip: '💡 Public API → REST. Data-rich client → GraphQL. Internal microservices → gRPC.',
    }],
  },
  {
    id: 58, title: 'Caching Strategies', sub: 'Redis, Cache-Aside, Write-Through, TTL', color: '#fbbf24', level: 'senior',
    concepts: [{
      title: 'Cache Patterns', description: ['Cache-aside (lazy loading): application checks cache first, fetches from DB on miss, writes to cache. Write-through: writes go to cache and DB simultaneously. Write-behind: writes go to cache, async to DB.'],
      code: `<span class="c-comment">// Cache-aside pattern</span>\n<span class="c-keyword">async function</span> <span class="c-fn">getUser</span>(id) {\n  <span class="c-keyword">const</span> cached = <span class="c-keyword">await</span> redis.get(<span class="c-str">\`user:\${id}\`</span>);\n  <span class="c-keyword">if</span> (cached) <span class="c-keyword">return</span> JSON.parse(cached);\n  \n  <span class="c-keyword">const</span> user = <span class="c-keyword">await</span> db.find(id);\n  <span class="c-keyword">await</span> redis.setex(<span class="c-str">\`user:\${id}\`</span>, <span class="c-num">3600</span>, JSON.stringify(user));\n  <span class="c-keyword">return</span> user;\n}`,
      interviewTip: '💡 Cache invalidation is the hardest part. Set a sensible TTL and invalidate on writes.',
    }],
  },
  {
    id: 59, title: 'Message Queues & Pub/Sub', sub: 'Kafka, RabbitMQ, Event-Driven Architecture', color: '#10b981', level: 'senior',
    concepts: [{
      title: 'Kafka vs RabbitMQ', description: ['Kafka is a distributed log — messages persist and can be replayed by multiple consumers. RabbitMQ is a message broker — messages are consumed once then deleted. Kafka wins for event sourcing and analytics; RabbitMQ wins for task queues.'],
      list: ['Kafka: ordered, persistent log, consumer groups, replay', 'RabbitMQ: routing with exchanges, acknowledgment, dead letter queues', 'Use cases: Kafka for event streaming, RabbitMQ for work queues'],
    }],
  },
  {
    id: 60, title: 'DevOps & Deployment', sub: 'Docker, Kubernetes, CI/CD, Monitoring', color: '#06b6d4', level: 'senior',
    concepts: [{
      title: 'Docker & Kubernetes Concepts', description: ['Docker containerizes apps with their dependencies. Kubernetes orchestrates containers — handles scheduling, scaling, self-healing, and rolling deployments.'],
      code: `<span class="c-comment"># Dockerfile</span>\nFROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --production\nCOPY . .\nEXPOSE 3000\nCMD ["node", "src/index.js"]`,
      interviewTip: '💡 Key K8s concepts: Pod (one or more containers), Service (stable endpoint), Deployment (manages replicas), Ingress (HTTP routing).',
    }],
  },
  {
    id: 61, title: 'Security Best Practices', sub: 'OWASP Top 10, XSS, CSRF, SQL Injection', color: '#f87171', level: 'senior',
    concepts: [{
      title: 'OWASP Top 10 Highlights', description: ['The most critical web security risks. Knowing these shows you think about security as part of development.'],
      list: ['SQL Injection: use parameterized queries / ORM', 'XSS: sanitize output, Content-Security-Policy header', 'CSRF: SameSite cookies, CSRF tokens', 'Broken Access Control: check permissions server-side, not just client-side', 'Secrets: never hardcode, use environment variables + secrets managers'],
      interviewTip: '💡 "Never trust user input" is the golden rule. Validate server-side regardless of client validation.',
    }],
  },
  {
    id: 62, title: 'Interview Q&A Patterns', sub: 'System Design Framework, Behavioral, Soft Skills', color: '#fbbf24', level: 'mid',
    concepts: [{
      title: 'System Design Interview Framework',
      description: ['A structured approach to any system design question.'],
      list: ['1. Clarify requirements (5 min): functional + non-functional, scale estimates', '2. High-level design: core components, data flow diagram', '3. Deep-dive: tackle bottlenecks (DB, cache, async queues)', '4. Trade-offs: discuss alternatives, what you\'d do differently'],
      interviewTip: '💡 Interviewers want to hear your reasoning, not a perfect answer. Think out loud and ask clarifying questions.',
    }],
  },
  // ═══════════════════════════════════════════════════════════════
  // PYTHON (IDs 63–88)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 63, title: 'Python Basics', sub: 'Syntax, Interpreter, Indentation, print/input', color: '#3776AB', level: 'junior',
    concepts: [{
      title: 'Getting Started With Python',
      description: [
        'Python is an interpreted, dynamically typed, high-level language. Code blocks are defined by indentation (no curly braces), which forces readable, consistent formatting.',
        'CPython (the reference implementation) compiles source to bytecode (.pyc) which the interpreter then executes — a hybrid of compiled and interpreted execution.',
      ],
      list: ['Interpreted & dynamically typed', 'Indentation defines code blocks', 'Everything is an object (functions, classes, modules included)', 'Huge standard library — "batteries included"'],
      code: `print("Hello, World!")\n\n# Indentation defines blocks — no braces\ndef greet(name):\n    if name:\n        print(f"Hello, {name}!")\n    else:\n        print("Hello, stranger!")\n\ngreet("Ada")`,
      interviewTip: '💡 <strong>Interview:</strong> "Is Python interpreted or compiled?" → CPython compiles source to bytecode which the interpreter then executes — a hybrid model, not purely interpreted.',
      blog: 'https://realpython.com/python-first-steps/',
    }],
  },
  {
    id: 64, title: 'Variables & Data Types', sub: 'int, float, str, bool, None, dynamic typing', color: '#FFD43B', level: 'junior',
    concepts: [{
      title: 'Variables and Built-in Types',
      description: [
        'Variables are names bound to objects, not fixed memory boxes — reassigning a name simply points it at a new object.',
        'Python is strongly typed (no implicit int + str) but dynamically typed (types are checked at runtime, not declared upfront).',
      ],
      list: ['int, float, complex — numeric types', 'str, bool, NoneType — text, logic, absence', 'type(x) reveals the runtime type of any object'],
      code: `age = 30            # int\nprice = 19.99        # float\nname = "Ada"         # str\nis_active = True     # bool\nnothing = None       # NoneType\n\nprint(type(age), type(price), type(name))`,
      interviewTip: '💡 <strong>Interview:</strong> "Strongly vs dynamically typed?" → Strongly typed means no silent coercion between unrelated types; dynamically typed means the type is attached to the value, not the variable name, and checked at runtime.',
      blog: 'https://realpython.com/python-variables/',
    }],
  },
  {
    id: 65, title: 'Operators', sub: 'Arithmetic, Comparison, Logical, Identity, Membership', color: '#4B8BBE', level: 'junior',
    concepts: [{
      title: 'Operator Categories',
      description: [
        'Python groups operators into arithmetic, comparison, logical, identity (is), and membership (in) — each returning predictable, well-defined results.',
      ],
      list: ['Arithmetic: + - * / // % **', 'Comparison returns bool: == != &lt; &gt; &lt;= &gt;=', 'is checks identity (same object); == checks equality (same value)', 'in / not in test membership in a sequence or collection'],
      code: `a, b = 7, 3\nprint(a // b, a % b, a ** b)     # floor div, modulo, power\nprint(a &gt; b and a != b)        # logical + comparison\nprint(a is not None)            # identity check\nprint(3 in [1, 2, 3])           # membership check`,
      interviewTip: '💡 <strong>Interview:</strong> "== vs is?" → == compares values via __eq__; is compares object identity (memory location). Use is only for None, True, False, and singleton checks.',
      blog: 'https://realpython.com/python-operators-expressions/',
    }],
  },
  {
    id: 66, title: 'Strings', sub: 'Immutability, Slicing, f-strings, Methods', color: '#306998', level: 'junior',
    concepts: [{
      title: 'Working With Strings',
      description: [
        'Strings are immutable sequences of Unicode characters — every "modifying" method actually returns a brand-new string.',
        'f-strings (formatted string literals) are the modern, fastest, and most readable way to interpolate values.',
      ],
      list: ['Immutable — methods return new strings, originals never change', 'Slicing: s[start:stop:step]', 'f"{expr}" evaluates any expression inline'],
      code: `name = "Python"\nprint(name[0], name[-1])        # indexing\nprint(name[1:4])                 # slicing\nprint(name.upper(), name.lower())\nprint(f"{name} has {len(name)} letters")\nprint(", ".join(["a", "b", "c"]))`,
      interviewTip: '💡 <strong>Interview:</strong> "Why are strings immutable in Python?" → Immutability enables safe hashing (usable as dict keys), string interning for memory savings, and thread-safety without locks.',
      blog: 'https://realpython.com/python-strings/',
    }],
  },
  {
    id: 67, title: 'Lists', sub: 'Mutable Sequences, Comprehensions, Common Methods', color: '#FFE873', level: 'junior',
    concepts: [{
      title: 'Lists and List Comprehensions',
      description: [
        'Lists are ordered, mutable, and allow duplicates. List comprehensions offer a concise, Pythonic replacement for map/filter loops.',
      ],
      list: ['Mutable, ordered, duplicates allowed', 'append / extend / insert / pop / remove / sort', 'Comprehension: [expr for item in iterable if condition]'],
      code: `nums = [5, 2, 9, 1]\nnums.append(7)\nnums.sort()\nsquares = [n * n for n in nums if n % 2 == 0]\nprint(nums, squares)`,
      interviewTip: '💡 <strong>Interview:</strong> "list vs tuple?" → Lists are mutable (resizable, more overhead); tuples are immutable, slightly faster, and hashable — often used for fixed records or dict keys.',
      blog: 'https://realpython.com/python-lists-tuples/',
    }],
  },
  {
    id: 68, title: 'Tuples', sub: 'Immutable Sequences, Unpacking, Namedtuples', color: '#3776AB', level: 'junior',
    concepts: [{
      title: 'Tuples and Unpacking',
      description: [
        'Tuples are immutable ordered sequences — ideal for fixed collections of related values and for unpacking into multiple variables at once.',
      ],
      list: ['Immutable — safe as dict keys or set members', 'Unpacking: a, b = (1, 2)', 'A single-item tuple needs a trailing comma: (5,)', 'namedtuple adds field names for readability'],
      code: `point = (3, 4)\nx, y = point                    # unpacking\nperson = ("Ada", 30, "Engineer")\nname, age, role = person\nsingle = (5,)                    # trailing comma required`,
      interviewTip: '💡 <strong>Interview:</strong> "When would you choose a tuple over a list?" → When the collection shouldn\'t change (coordinates, RGB values) or needs to be hashable for use as a dict key or set element.',
      blog: 'https://realpython.com/python-lists-tuples/',
    }],
  },
  {
    id: 69, title: 'Sets', sub: 'Unique Elements, Set Algebra, Membership', color: '#FFD43B', level: 'junior',
    concepts: [{
      title: 'Sets and Set Operations',
      description: [
        'A set is an unordered collection of unique, hashable elements, backed by a hash table — making membership tests very fast on average.',
      ],
      list: ['No duplicates, no guaranteed order', 'O(1) average membership testing', 'Union |, intersection &, difference -, symmetric difference ^'],
      code: `a = {1, 2, 3}\nb = {2, 3, 4}\nprint(a | b)   # union\nprint(a & b)   # intersection\nprint(a - b)   # difference\nprint(3 in a)  # membership`,
      interviewTip: '💡 <strong>Interview:</strong> "Why use a set to de-duplicate a list?" → set(my_list) removes duplicates in roughly O(n) time using hashing, far faster than checking for duplicates with nested loops.',
      blog: 'https://realpython.com/python-sets/',
    }],
  },
  {
    id: 70, title: 'Dictionaries', sub: 'Key-Value Mapping, Comprehensions, .get()', color: '#4B8BBE', level: 'junior',
    concepts: [{
      title: 'Dictionaries',
      description: [
        'Dictionaries map hashable keys to values and have preserved insertion order since Python 3.7. Internally, keys are hashed to bucket indices for near O(1) lookup.',
      ],
      list: ['Keys must be hashable (immutable)', 'Insertion order preserved since Python 3.7', '.get(key, default) avoids a KeyError'],
      code: `user = {"name": "Ada", "age": 30}\nuser["email"] = "ada@example.com"\nprint(user.get("phone", "N/A"))\nfor key, value in user.items():\n    print(key, value)\nsquared = {n: n * n for n in range(5)}`,
      interviewTip: '💡 <strong>Interview:</strong> "How does a dict achieve near O(1) lookup?" → Keys are hashed to determine a bucket index; collisions are resolved internally via open addressing, so lookup avoids scanning every item.',
      blog: 'https://realpython.com/python-dicts/',
    }],
  },
  {
    id: 71, title: 'Functions', sub: 'def, Default Args, *args/**kwargs, First-Class', color: '#306998', level: 'junior',
    concepts: [{
      title: 'Defining Functions',
      description: [
        'Functions are defined with def, support default and keyword-only arguments, and can accept arbitrary positional (*args) and keyword (**kwargs) arguments.',
        'Functions are first-class objects in Python — they can be assigned to variables, passed as arguments, and returned from other functions.',
      ],
      list: ['Default args are evaluated once at definition time — avoid mutable defaults', '*args collects extra positionals into a tuple, **kwargs into a dict', 'Functions can be passed around like any other value'],
      code: `def greet(name, greeting="Hello", *, shout=False):\n    message = f"{greeting}, {name}!"\n    return message.upper() if shout else message\n\ndef total(*args, **kwargs):\n    print(args, kwargs)\n    return sum(args)\n\nprint(greet("Ada", shout=True))\nprint(total(1, 2, 3, verbose=True))`,
      interviewTip: '💡 <strong>Interview:</strong> "Why is def f(x, items=[]) dangerous?" → The list default is created once when the function is defined and shared across every call, so mutations leak state between unrelated calls.',
      blog: 'https://realpython.com/defining-your-own-python-function/',
    }],
  },
  {
    id: 72, title: 'Lambda', sub: 'Anonymous Functions, map/filter/sorted', color: '#FFE873', level: 'mid',
    concepts: [{
      title: 'Lambda Expressions',
      description: [
        'A lambda is a small, anonymous, single-expression function — most useful as a short-lived key or callback passed to functions like sorted, map, and filter.',
      ],
      list: ['Restricted to a single expression, no statements', 'Common with sorted(key=...), map(), filter()', 'A named def is usually clearer for anything non-trivial'],
      code: `square = lambda x: x * x\nnums = [5, 2, 9, 1]\nevens = list(filter(lambda n: n % 2 == 0, nums))\nby_len = sorted(["ccc", "a", "bb"], key=lambda s: len(s))\nprint(square(4), evens, by_len)`,
      interviewTip: '💡 <strong>Interview:</strong> "When would you avoid a lambda?" → When the logic needs more than one expression, a name for reuse, or a docstring — a regular function is more readable and testable.',
      blog: 'https://realpython.com/python-lambda/',
    }],
  },
  {
    id: 73, title: 'Modules', sub: 'import, from...import, __name__ == "__main__"', color: '#3776AB', level: 'mid',
    concepts: [{
      title: 'Modules and Imports',
      description: [
        'A module is simply a .py file. import loads it once and caches it in sys.modules; from module import name pulls a specific attribute into the current namespace.',
        'The __name__ == "__main__" guard lets a file work both as an importable module and a standalone script.',
      ],
      list: ['import module vs from module import name', 'Modules are cached after first import — later imports are cheap', '__name__ == "__main__" guards script-only code'],
      code: `# mymath.py\ndef add(a, b):\n    return a + b\n\n# main.py\nimport mymath\nfrom mymath import add as plus\n\nprint(mymath.add(2, 3))\nprint(plus(2, 3))\n\nif __name__ == "__main__":\n    print("Run directly, not imported")`,
      interviewTip: '💡 <strong>Interview:</strong> "What does if __name__ == \'__main__\' do?" → __name__ is "__main__" only when the file is executed directly, so code inside that guard never runs when the file is merely imported elsewhere.',
      blog: 'https://docs.python.org/3/tutorial/modules.html',
    }],
  },
  {
    id: 74, title: 'Packages', sub: '__init__.py, Namespace Packages, Relative Imports', color: '#FFD43B', level: 'mid',
    concepts: [{
      title: 'Organizing Code Into Packages',
      description: [
        'A package is a directory of modules, traditionally marked with an __init__.py file. Packages group related functionality and support both absolute and relative imports.',
      ],
      list: ['__init__.py marks a directory as a regular package (optional since 3.3 for namespace packages)', 'Absolute imports are preferred; relative imports (from . import x) work within a package', 'Group related modules to keep large codebases organized and avoid one giant file'],
      code: `# project/\n#   mypkg/\n#     __init__.py\n#     utils.py\n#     shapes/\n#       __init__.py\n#       circle.py\n\nfrom mypkg import utils\nfrom mypkg.shapes.circle import area\nfrom . import utils            # relative import, used inside a package`,
      interviewTip: '💡 <strong>Interview:</strong> "Package vs module?" → A module is a single .py file; a package is a directory of modules (with an __init__.py) that groups related functionality under one importable namespace.',
      blog: 'https://docs.python.org/3/tutorial/modules.html#packages',
    }],
  },
  {
    id: 75, title: 'OOP', sub: 'Classes, Inheritance, Polymorphism, Dunder Methods', color: '#4B8BBE', level: 'mid',
    concepts: [{
      title: 'Object-Oriented Python',
      description: [
        'Classes bundle data and behavior. Inheritance lets subclasses reuse and override parent behavior; dunder methods (__init__, __repr__, __eq__…) hook custom objects into Python\'s built-in syntax.',
      ],
      list: ['__init__ is the constructor; self refers to the instance', 'Inheritance: class Dog(Animal) reuses & overrides behavior', 'Dunder methods (__repr__, __eq__, __len__) hook into built-ins and operators', 'Encapsulation via _protected and __name_mangled conventions'],
      code: `class Animal:\n    def __init__(self, name):\n        self.name = name\n\n    def speak(self):\n        raise NotImplementedError\n\n    def __repr__(self):\n        return f"Animal({self.name!r})"\n\nclass Dog(Animal):\n    def speak(self):\n        return f"{self.name} says Woof!"\n\nfor pet in [Dog("Rex")]:\n    print(pet.speak())`,
      interviewTip: '💡 <strong>Interview:</strong> "classmethod vs staticmethod?" → @classmethod receives the class (cls) and can read/modify class-level state; @staticmethod receives neither self nor cls — it\'s just a plain function namespaced inside the class.',
      blog: 'https://realpython.com/python3-object-oriented-programming/',
    }],
  },
  {
    id: 76, title: 'Exception Handling', sub: 'try/except/else/finally, Custom Exceptions', color: '#306998', level: 'mid',
    concepts: [{
      title: 'Handling Errors Gracefully',
      description: [
        'try/except/else/finally gives fine-grained control over error handling and cleanup. Custom exception classes let you model domain-specific failure modes.',
      ],
      list: ['except clauses are checked top to bottom — most specific first', 'else runs only if no exception was raised in try', 'finally always runs — used for guaranteed cleanup', 'Custom exceptions subclass Exception for domain-specific errors'],
      code: `class InsufficientFundsError(Exception):\n    pass\n\ndef withdraw(balance, amount):\n    try:\n        if amount &gt; balance:\n            raise InsufficientFundsError("Not enough funds")\n        balance -= amount\n    except InsufficientFundsError as e:\n        print(f"Error: {e}")\n    else:\n        print("Withdrawal successful")\n    finally:\n        print("Transaction attempt finished")\n    return balance`,
      interviewTip: '💡 <strong>Interview:</strong> "try/except/else/finally order?" → try runs first; except only fires on a matching error; else only runs on success (no exception); finally always runs last, error or not.',
      blog: 'https://realpython.com/python-exceptions/',
    }],
  },
  {
    id: 77, title: 'File Handling', sub: 'open/with, Read/Write Modes, pathlib', color: '#FFE873', level: 'mid',
    concepts: [{
      title: 'Reading and Writing Files',
      description: [
        'The with statement guarantees a file is closed even if an exception occurs. pathlib.Path is the modern, object-oriented, cross-platform way to work with filesystem paths.',
      ],
      list: ["Always use with open(...) — it auto-closes the file even on error", "Modes: 'r' read, 'w' write (overwrite), 'a' append, 'b' binary", 'pathlib.Path replaces most os.path string-based path handling'],
      code: `from pathlib import Path\n\nwith open("notes.txt", "w") as f:\n    f.write("Hello, file!\\n")\n\nwith open("notes.txt", "r") as f:\n    for line in f:\n        print(line.strip())\n\npath = Path("notes.txt")\nprint(path.exists(), path.stat().st_size)`,
      interviewTip: '💡 <strong>Interview:</strong> "Why prefer with open() over manual open()/close()?" → with guarantees the file is closed even if an exception is raised inside the block, preventing resource leaks and file-handle exhaustion.',
      blog: 'https://realpython.com/read-write-files-python/',
    }],
  },
  {
    id: 78, title: 'Decorators', sub: '@syntax, functools.wraps, Common Use Cases', color: '#3776AB', level: 'senior',
    concepts: [{
      title: 'Decorators',
      description: [
        'A decorator is a function that wraps another function to add behavior without changing its source. @decorator above a function is sugar for func = decorator(func).',
        'functools.wraps preserves the original function\'s __name__ and __doc__, which is essential for debugging and introspection.',
      ],
      list: ['@decorator is sugar for func = decorator(func)', 'functools.wraps preserves the original __name__/__doc__', 'Common uses: logging, timing, caching, auth checks, retries'],
      code: `import functools\nimport time\n\ndef timer(func):\n    @functools.wraps(func)\n    def wrapper(*args, **kwargs):\n        start = time.perf_counter()\n        result = func(*args, **kwargs)\n        print(f"{func.__name__} took {time.perf_counter() - start:.4f}s")\n        return result\n    return wrapper\n\n@timer\ndef slow_add(a, b):\n    time.sleep(0.1)\n    return a + b`,
      interviewTip: '💡 <strong>Interview:</strong> "What does @functools.wraps do and why does it matter?" → Without it, the wrapper replaces the original function\'s metadata (__name__, __doc__), breaking introspection, auto-generated docs, and debugging tools.',
      blog: 'https://realpython.com/primer-on-python-decorators/',
    }],
  },
  {
    id: 79, title: 'Iterators', sub: 'Iterable vs Iterator Protocol, StopIteration', color: '#FFD43B', level: 'mid',
    concepts: [{
      title: 'The Iterator Protocol',
      description: [
        'An iterable implements __iter__(); an iterator implements both __iter__() and __next__(). A for loop calls iter() once, then next() repeatedly until StopIteration is raised.',
      ],
      list: ['Every iterator is iterable, but not every iterable is an iterator', 'Built-ins like list, dict, str are iterable but are not iterators themselves', 'iter(x) produces a fresh iterator each time it is called'],
      code: `class Countdown:\n    def __init__(self, start):\n        self.current = start\n\n    def __iter__(self):\n        return self\n\n    def __next__(self):\n        if self.current &lt;= 0:\n            raise StopIteration\n        self.current -= 1\n        return self.current + 1\n\nfor n in Countdown(3):\n    print(n)   # 3, 2, 1`,
      interviewTip: '💡 <strong>Interview:</strong> "Difference between iterable and iterator?" → iter(some_list) creates a brand-new iterator each call; the list itself only implements __iter__, not __next__, so it can be iterated over many times independently.',
      blog: 'https://realpython.com/python-iterators-iterables/',
    }],
  },
  {
    id: 80, title: 'Generators', sub: 'yield, Lazy Evaluation, Generator Expressions', color: '#4B8BBE', level: 'senior',
    concepts: [{
      title: 'Generators and yield',
      description: [
        'yield pauses a function and saves its entire local state, resuming exactly where it left off on the next call. This makes generators compute values lazily — one at a time, on demand.',
      ],
      list: ['yield pauses the function, preserving all local state', 'Generators save huge memory for big or infinite sequences', 'Generator expressions (x for x in ...) are the lazy sibling of list comprehensions'],
      code: `def fibonacci(limit):\n    a, b = 0, 1\n    while a &lt; limit:\n        yield a\n        a, b = b, a + b\n\nfor num in fibonacci(20):\n    print(num, end=" ")\n\n# Generator expression — lazy, no intermediate list\nsquares = (n * n for n in range(1_000_000))\nprint(next(squares))`,
      interviewTip: '💡 <strong>Interview:</strong> "Why use a generator instead of returning a list?" → Generators yield items one at a time on demand, so the whole sequence never sits in memory at once — critical for large files or infinite streams.',
      blog: 'https://realpython.com/introduction-to-python-generators/',
    }],
  },
  {
    id: 81, title: 'Context Managers', sub: 'with Statement, __enter__/__exit__, @contextmanager', color: '#306998', level: 'senior',
    concepts: [{
      title: 'Context Managers and with',
      description: [
        '__enter__ runs on entry to a with block and __exit__ always runs on exit — even if an exception was raised — making context managers ideal for guaranteed setup/teardown.',
        '@contextlib.contextmanager turns a generator function with a single yield into a fully working context manager, no class required.',
      ],
      list: ['__enter__ runs on entry, __exit__ always runs on exit (even on exception)', '@contextmanager turns a generator function into a context manager with one yield', 'Common uses: file handles, locks, DB transactions, temporary state changes'],
      code: `from contextlib import contextmanager\nimport time\n\n@contextmanager\ndef timer_ctx(label):\n    start = time.perf_counter()\n    try:\n        yield\n    finally:\n        print(f"{label}: {time.perf_counter() - start:.4f}s")\n\nwith timer_ctx("block"):\n    sum(range(1_000_000))\n\nclass ManagedFile:\n    def __enter__(self):\n        self.f = open("log.txt", "w")\n        return self.f\n    def __exit__(self, exc_type, exc_val, exc_tb):\n        self.f.close()`,
      interviewTip: '💡 <strong>Interview:</strong> "How do you write a custom context manager two ways?" → Either a class implementing __enter__/__exit__, or a generator function decorated with @contextlib.contextmanager where code before yield is setup and code in the finally block after yield is teardown.',
      blog: 'https://realpython.com/python-with-statement/',
    }],
  },
  {
    id: 82, title: 'Virtual Environment', sub: 'venv, Isolated Dependencies, activate/deactivate', color: '#FFE873', level: 'mid',
    concepts: [{
      title: 'Isolating Project Dependencies',
      description: [
        'A virtual environment gives each project its own isolated site-packages directory, so dependencies (and their versions) never clash across projects.',
      ],
      list: ['Each project gets its own isolated site-packages — no version clashes', 'Built into the standard library since Python 3.3 via the venv module', 'Popular alternatives: virtualenv, conda, poetry, pipenv'],
      code: `python -m venv .venv          # create\nsource .venv/bin/activate     # activate (macOS/Linux)\n.venv\\Scripts\\activate         # activate (Windows)\npip install requests\ndeactivate                    # exit the environment`,
      interviewTip: '💡 <strong>Interview:</strong> "Why use a virtual environment?" → It avoids dependency conflicts between projects and keeps the global/system Python installation clean and reproducible across machines.',
      blog: 'https://docs.python.org/3/library/venv.html',
    }],
  },
  {
    id: 83, title: 'pip', sub: 'Package Installer, requirements.txt, PyPI', color: '#3776AB', level: 'mid',
    concepts: [{
      title: 'Managing Packages With pip',
      description: [
        'pip installs packages from PyPI (the Python Package Index). requirements.txt pins exact versions so installs are reproducible across machines and environments.',
      ],
      list: ['Installs packages from PyPI (Python Package Index)', 'requirements.txt pins exact versions for reproducible installs', 'pip freeze snapshots the exact state of the current environment'],
      code: `pip install requests==2.31.0\npip install -r requirements.txt\npip freeze &gt; requirements.txt\npip uninstall requests\npip list --outdated`,
      interviewTip: '💡 <strong>Interview:</strong> "How do you make an install reproducible across machines?" → Pin exact versions in requirements.txt (or use a lockfile tool like poetry/pip-tools) and always install inside a dedicated virtual environment.',
      blog: 'https://pip.pypa.io/en/stable/',
    }],
  },
  {
    id: 84, title: 'Type Hinting', sub: 'Annotations, Optional, Generics, mypy', color: '#FFD43B', level: 'mid',
    concepts: [{
      title: 'Static Typing With Type Hints',
      description: [
        'Type hints document expected argument and return types. They are not enforced at runtime by default — static checkers like mypy verify them ahead of time.',
      ],
      list: ['Type hints are not enforced at runtime — tools like mypy check them statically', 'Optional[X] means X or None; list[dict] uses built-in generics (Python 3.9+)', 'Improves IDE autocomplete, documentation, and catches bugs before running the code'],
      code: `from typing import Optional\n\ndef greet(name: str, times: int = 1) -&gt; str:\n    return (f"Hello, {name}! " * times).strip()\n\ndef find_user(user_id: int) -&gt; Optional[dict]:\n    return None  # not found\n\nusers: list[dict] = []`,
      interviewTip: '💡 <strong>Interview:</strong> "Does Python enforce type hints at runtime?" → No — they are purely documentation/tooling hints unless you add explicit runtime checks or use a validation library like pydantic.',
      blog: 'https://docs.python.org/3/library/typing.html',
    }],
  },
  {
    id: 85, title: 'Dataclasses', sub: '@dataclass, field(), frozen, Auto-generated Methods', color: '#4B8BBE', level: 'mid',
    concepts: [{
      title: 'Reducing Boilerplate With @dataclass',
      description: [
        '@dataclass auto-generates __init__, __repr__, and __eq__ from typed class attributes, removing repetitive boilerplate from data-holding classes.',
      ],
      list: ['Removes __init__ / __repr__ / __eq__ boilerplate for data-holding classes', 'field(default_factory=list) avoids the mutable-default-argument trap', 'frozen=True makes instances immutable (and hashable)'],
      code: `from dataclasses import dataclass, field\n\n@dataclass\nclass Point:\n    x: float\n    y: float\n    tags: list[str] = field(default_factory=list)\n\n    def distance(self) -&gt; float:\n        return (self.x ** 2 + self.y ** 2) ** 0.5\n\np1 = Point(3, 4)\np2 = Point(3, 4)\nprint(p1 == p2, p1.distance())`,
      interviewTip: '💡 <strong>Interview:</strong> "dataclass vs regular class vs namedtuple?" → dataclass gives mutable, typed, boilerplate-free classes; namedtuple is immutable and tuple-like; a plain class gives full control but requires writing __init__/__repr__/__eq__ by hand.',
      blog: 'https://docs.python.org/3/library/dataclasses.html',
    }],
  },
  {
    id: 86, title: 'Async Programming', sub: 'async/await, asyncio, Event Loop', color: '#306998', level: 'senior',
    concepts: [{
      title: 'Asynchronous I/O With asyncio',
      description: [
        'async def defines a coroutine; await pauses it without blocking the thread, letting the event loop run other coroutines in the meantime. This is ideal for I/O-bound work like network calls.',
      ],
      list: ['async def defines a coroutine; await pauses it without blocking the thread', 'asyncio.gather runs coroutines concurrently on a single-threaded event loop', 'Best for I/O-bound work (network, disk) — not CPU-bound work, since the GIL still applies'],
      code: `import asyncio\n\nasync def fetch(name, delay):\n    await asyncio.sleep(delay)\n    print(f"Fetched {name}")\n    return name\n\nasync def main():\n    results = await asyncio.gather(\n        fetch("A", 1),\n        fetch("B", 2),\n    )\n    print(results)\n\nasyncio.run(main())`,
      interviewTip: '💡 <strong>Interview:</strong> "asyncio vs threading — when to use which?" → asyncio shines for many concurrent I/O-bound tasks with low overhead (single thread, cooperative multitasking); threading suits blocking I/O libraries that aren\'t async-aware; multiprocessing is for CPU-bound work that needs to bypass the GIL.',
      blog: 'https://docs.python.org/3/library/asyncio.html',
    }],
  },
  {
    id: 87, title: 'Multiprocessing', sub: 'Pool, Process, Bypassing the GIL', color: '#FFE873', level: 'senior',
    concepts: [{
      title: 'True Parallelism With multiprocessing',
      description: [
        'Each process spawned by multiprocessing gets its own Python interpreter and memory space, achieving real parallelism by bypassing the Global Interpreter Lock (GIL).',
      ],
      list: ['Each process has its own interpreter & memory — true parallelism, bypasses the GIL', 'Best for CPU-bound work: image processing, number crunching, ML preprocessing', 'Processes are heavier than threads — more memory, slower to start, and need pickling to share data'],
      code: `from multiprocessing import Pool\nimport os\n\ndef square(n):\n    return n * n\n\nif __name__ == "__main__":\n    with Pool(processes=os.cpu_count()) as pool:\n        results = pool.map(square, range(10))\n    print(results)`,
      interviewTip: '💡 <strong>Interview:</strong> "Why does multiprocessing help but threading doesn\'t for CPU-bound tasks?" → The GIL lets only one thread execute Python bytecode at a time; separate processes each get their own interpreter and GIL, enabling genuine parallel CPU use.',
      blog: 'https://docs.python.org/3/library/multiprocessing.html',
    }],
  },
  {
    id: 88, title: 'Threading', sub: 'Thread, Lock, GIL, I/O-bound Concurrency', color: '#3776AB', level: 'senior',
    concepts: [{
      title: 'Concurrency With threading',
      description: [
        'Threads share the same memory space, making data sharing easy but requiring careful synchronization with locks to avoid race conditions. Threading is best suited to I/O-bound work.',
      ],
      list: ['Good for I/O-bound concurrency (network calls, file I/O) despite the GIL', 'threading.Lock prevents race conditions on shared state', 'Threads share memory (easy data sharing, but requires careful synchronization)'],
      code: `import threading\n\ncounter = 0\nlock = threading.Lock()\n\ndef increment():\n    global counter\n    for _ in range(100_000):\n        with lock:\n            counter += 1\n\nthreads = [threading.Thread(target=increment) for _ in range(4)]\nfor t in threads: t.start()\nfor t in threads: t.join()\nprint(counter)   # 400000, safe thanks to the lock`,
      interviewTip: '💡 <strong>Interview:</strong> "What is the GIL and why does it matter for threading?" → The Global Interpreter Lock allows only one thread to execute Python bytecode at a time, so threading gives concurrency (good for I/O-bound waits) but not true CPU parallelism.',
      blog: 'https://docs.python.org/3/library/threading.html',
    }],
  },

  {
    id: 119, title: 'Python Control Flow & Loops', sub: 'Conditions, match/case, iteration', color: '#FFD43B', level: 'junior',
    concepts: [
      {
        title: 'Conditions and Structural Pattern Matching',
        description: ['Use if/elif/else for boolean conditions. Python 3.10+ match/case can destructure and match structured values; it is not simply a switch statement because patterns can bind names and use guards.', 'Use a wildcard case for an intentional fallback and keep match patterns readable.'],
        code: `def describe(value):\n    match value:\n        case {"kind": "error", "code": code} if code >= 500:\n            return "server error"\n        case {"kind": "error", "code": code}:\n            return f"client error {code}"\n        case _:\n            return "other"`,
      },
      {
        title: 'for, while, break, and continue',
        description: ['for iterates over an iterable; range() is a compact way to express integer sequences. Use while when repetition depends on a condition that changes during the loop.', 'break exits the nearest loop, continue skips to its next iteration, and loop else runs only when the loop finishes without break.'],
        code: `for index, name in enumerate(names):\n    if not name:\n        continue\n    if name == target:\n        print("found at", index)\n        break\nelse:\n    print("not found")`,
      },
    ],
  },
  {
    id: 120, title: 'Python Iteration & Comprehensions', sub: 'enumerate, zip, comprehensions, lazy values', color: '#4B8BBE', level: 'junior',
    concepts: [
      {
        title: 'enumerate, zip, and Built-ins',
        description: ['enumerate pairs each item with its index without manual counter updates. zip combines iterables position by position and stops at the shortest input unless strict mode is requested.', 'any() and all() express common boolean aggregation without a custom loop.'],
        code: `for position, item in enumerate(items, start=1):\n    print(position, item)\n\nfor name, score in zip(names, scores, strict=True):\n    print(f"{name}: {score}")`,
      },
      {
        title: 'Comprehensions and Generator Expressions',
        description: ['A comprehension creates a list, set, or dictionary from an iterable with an optional filter. Prefer a normal loop when the expression becomes difficult to scan.', 'A generator expression yields values lazily, which avoids creating a full intermediate collection for one-pass aggregation.'],
        code: `squares = [number * number for number in values if number >= 0]\nunique_words = {word.lower() for word in words}\nindex = {item.id: item for item in records}\ntotal = sum(number * number for number in values)`,
      },
    ],
  },
  {
    id: 121, title: 'Python Scope & Function Pitfalls', sub: 'LEGB, defaults, references and mutation', color: '#FFE873', level: 'mid',
    concepts: [
      {
        title: 'LEGB Scope and Closures',
        description: ['Name lookup follows Local, Enclosing, Global, Built-in scope. Use nonlocal to rebind a name in an enclosing function and global only when module-level reassignment is truly required.', 'Closures retain access to enclosing bindings; they do not freeze the value at function creation.'],
        code: `def make_counter():\n    count = 0\n\n    def increment():\n        nonlocal count\n        count += 1\n        return count\n\n    return increment`,
      },
      {
        title: 'Mutable Default Arguments',
        description: ['Default argument expressions are evaluated once when the function is defined, not on every call. A mutable default can therefore retain state across calls.', 'Use None as a sentinel and create a fresh list or dictionary inside the function when each call needs independent state.'],
        code: `def add_item(item, items=None):\n    if items is None:\n        items = []\n    items.append(item)\n    return items`,
      },
      {
        title: 'Arguments, Aliasing, and Mutation',
        description: ['Python passes object references by assignment: a function receives a reference to the same object, but rebinding its parameter does not rebind the caller’s variable.', 'Mutating a shared list or dictionary is visible to the caller. Return a new value when callers should retain the original.'],
        code: `def add_label(labels, label):\n    return [*labels, label]\n\ncurrent = ["draft"]\nupdated = add_label(current, "review")\nprint(current, updated)`,
      },
    ],
  },
  {
    id: 122, title: 'Python Regex & Text Processing', sub: 'Raw patterns, matching, groups, replacement', color: '#306998', level: 'mid',
    concepts: [
      {
        title: 'Regular Expressions with re',
        description: ['Use raw string literals for regex patterns so backslashes are interpreted by the regex engine instead of first by the Python string parser.', 'Choose search() to find a match anywhere, match() to check from the beginning, and fullmatch() when the entire input must conform.'],
        code: `import re\n\npattern = re.compile(r"(?P<user>[a-z]+)@(?P<host>[a-z.]+)")\nmatch = pattern.fullmatch("sam@example.org")\nif match:\n    print(match.group("host"))`,
      },
      {
        title: 'Groups, Substitution, and Validation',
        description: ['Capture groups expose matched portions; named groups make larger patterns easier to maintain. re.sub() replaces matches, and compiled patterns are useful when reused.', 'Regex is useful for lexical checks, but complex business validation is often clearer as ordinary code.'],
        code: `cleaned = re.sub(r"\\s+", " ", "  hello   world  ").strip()\nparts = re.findall(r"[A-Z][a-z]+", "Ada Lovelace")\nprint(cleaned, parts)`,
      },
    ],
  },
  {
    id: 123, title: 'Python Dates, JSON & Numeric Tools', sub: 'Standard library APIs and data exchange', color: '#3776AB', level: 'mid',
    concepts: [
      {
        title: 'Dates and Time Zones',
        description: ['Use aware datetimes for real-world instants; naive datetimes do not identify a time zone and are easy to misinterpret. Store or exchange timestamps in UTC and convert for display.', 'Use zoneinfo for IANA time zones rather than applying a fixed offset where daylight-saving rules matter.'],
        code: `from datetime import datetime, timezone\nfrom zoneinfo import ZoneInfo\n\nnow_utc = datetime.now(timezone.utc)\nlocal_time = now_utc.astimezone(ZoneInfo("America/New_York"))\nprint(local_time.isoformat())`,
      },
      {
        title: 'JSON Serialization',
        description: ['The json module converts JSON text to Python values with loads()/load() and Python values to JSON with dumps()/dump(). JSON object keys become strings, and unsupported types need explicit conversion.', 'Validate decoded data before trusting its shape or using it in application logic.'],
        code: `import json\n\npayload = {"name": "Mina", "active": True}\ntext = json.dumps(payload)\nrestored = json.loads(text)\nprint(restored["name"])`,
      },
      {
        title: 'Floating Point, Decimal, and Secure Randomness',
        description: ['Binary floating-point cannot exactly represent every decimal fraction. Use Decimal constructed from strings for decimal-domain calculations such as money.', 'random is appropriate for simulation and sampling; use secrets for passwords, tokens, and other security-sensitive values.'],
        code: `from decimal import Decimal\nfrom secrets import token_urlsafe\n\namount = Decimal("0.10") + Decimal("0.20")\nreset_token = token_urlsafe(24)\nprint(amount)`,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // INTERVIEW PREP ROADMAP (IDs 89–94)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 89, title: '30-Day Structured Prep Roadmap', sub: '7 Phases, Foundation to Simulation', color: '#fbbf24', level: 'mid',
    concepts: [
      {
        title: 'What a Good Interview Process Actually Tests',
        description: [
          'Before building a study plan, it helps to know what\u2019s really being evaluated. A senior-level technical interview is rarely just "did you get the right answer" — it\u2019s a composite of several signals gathered across rounds.',
        ],
        list: [
          'Role understanding — can you break the job description into technical skills, behavioral expectations and problem-solving weight?',
          'Pattern recognition — not memorised solutions, but can you spot the right approach on an UNSEEN problem?',
          'Coding out loud — thinking and communicating while you write, as if the interviewer were pairing with you',
          'Resume depth — every bullet point should survive five levels of "why/how" follow-up; assume anything on it is fair game',
          'Prepared stories, not definitions — behavioral answers backed by real situations and numbers, not rehearsed value statements',
          'Deliberate practice — a handful of serious, full-length mock interviews with an error log beats dozens of casual ones',
          'How you think when stuck — the interview tests your reasoning process when the answer isn\u2019t obvious, not just what you already know',
        ],
        interviewTip: '💡 <strong>Mindset:</strong> the goal isn\u2019t to walk in hoping for a question you already know — it\u2019s to walk in knowing how to think through a question you don\u2019t.',
      },
      {
        title: 'The 7-Phase, 30-Day Roadmap',
        description: [
          'A rough week-by-week shape that scales up in difficulty and scales down in "new learning" as the interview date approaches — the last few days are for review and rehearsal, not new material.',
        ],
        list: [
          'Days 1–5 — Foundation: understand the target role, revise DSA basics and language syntax, do a deep dive on your resume, start listing story topics',
          'Days 6–12 — Patterns: pattern-based coding practice (arrays/hashing → two pointers → binary search → stacks → trees → graphs), system design basics, first drafts of your stories',
          'Days 13–18 — Strengthen: move to medium/hard problems, cover remaining DSA patterns (heaps, recursion/backtracking, DP), one full end-to-end system design, stories with real numbers',
          'Days 19–23 — Mocks: a full mock for each round type (coding, system design, behavioral) — fill an error log after every single one',
          'Days 24–26 — Fix: only fix weaknesses now — redo every question you got wrong, revisit your two weakest DSA patterns, rehearse stories out loud',
          'Days 27–29 — Simulation: back-to-back full interview loops under real time pressure and conditions',
          'Day 30 — Rest: review the error log, rehearse story headlines, re-check you can explain every resume bullet — then stop and sleep. This day is for performing better on what you already know, not learning more.',
        ],
      },
    ],
  },
  {
    id: 90, title: 'DSA Pattern Recognition Cheat Sheet', sub: 'Signal → Pattern Mapping for Unseen Problems', color: '#a78bfa', level: 'mid',
    concepts: [
      {
        title: 'Recognizing the Pattern From the Problem Signal',
        description: [
          'The fastest way to solve an unfamiliar problem in an interview is recognizing which of a small set of patterns it belongs to. This is a quick "signal → pattern" lookup — for the actual code and deep-dive walkthroughs of each pattern, see the DSA topic.',
        ],
        list: [
          'Arrays & Hashing — signal: duplicates, frequency counting, need O(1) lookup — e.g. Two Sum, Group Anagrams, Top K Frequent Elements',
          'Two Pointers — signal: sorted array, looking for a pair/triplet, or an in-place operation — e.g. 3Sum, Container With Most Water, Remove Duplicates',
          'Sliding Window — signal: longest/shortest subarray or substring satisfying a condition — e.g. Longest Substring Without Repeating Characters, Minimum Window Substring',
          'Binary Search — signal: sorted or monotonic data, minimize/maximize a feasible value — e.g. Search in Rotated Sorted Array, Koko Eating Bananas',
          'Stacks & Queues — signal: nesting, "next greater element", order-sensitive processing — e.g. Valid Parentheses, Daily Temperatures, Min Stack',
          'Trees — signal: hierarchy, recursion on left/right children, level-by-level processing — e.g. Validate BST, Level Order Traversal, Lowest Common Ancestor',
          'Graphs — signal: connections, islands/regions, dependencies, shortest path — e.g. Number of Islands, Course Schedule, Word Ladder',
          'Heaps — signal: top-K elements, a running median, merging several sorted streams — e.g. Kth Largest Element, Merge K Sorted Lists, Find Median from Data Stream',
          'Recursion & Backtracking — signal: generate all combinations/choices, with the ability to undo a choice — e.g. Subsets, Permutations, Combination Sum, Word Search',
          'Basic Dynamic Programming — signal: overlapping subproblems, count the number of ways, or a min/max cost — e.g. Climbing Stairs, House Robber, Coin Change, Longest Increasing Subsequence',
        ],
      },
      {
        title: 'Three Questions To Answer For Every Pattern',
        description: [
          'Knowing the pattern\u2019s name is half the job — the other half is being able to explain it. For each pattern you study, make sure you can answer all three of these, out loud, without notes:',
        ],
        list: [
          '1. What is this pattern actually doing, in plain words?',
          '2. Why does it work — what property of the input or problem makes it correct?',
          '3. What changes if a constraint changes — e.g. the input is 10x larger, memory is limited, or the data arrives as a stream?',
        ],
        interviewTip: '💡 After every problem you solve, force yourself to say ONE line explaining why your solution works, and then change ONE constraint (bigger input, streaming data, a memory limit) and adjust your approach out loud. This single habit does more for pattern recognition than solving extra problems.',
      },
    ],
  },
  {
    id: 91, title: 'Self-Assessment Checklist', sub: '20 Honest Questions Before Interview Day', color: '#34d399', level: 'mid',
    concepts: [
      {
        title: 'Technical & Resume Readiness',
        description: [
          'Sit down before your interview and answer these honestly. Any answer that isn\u2019t a clear "yes" is a to-do item, not a hope-it-doesn\u2019t-come-up item.',
        ],
        list: [
          'Can I solve a completely new coding problem while explaining my thinking from start to finish?',
          'Can I recognize common DSA patterns without being told which one to use?',
          'Can I explain WHY my chosen approach works, not just write the code?',
          'Can I state the time and space complexity of my solution clearly and immediately?',
          'Can I handle edge cases and changing constraints without freezing up? (empty input, duplicates, the largest possible constraint)',
          'Can I write syntactically correct code without leaning on pseudocode or an IDE\u2019s autocomplete?',
          'Can I defend every technical statement on my resume if the interviewer goes five levels deeper?',
          'Can I explain exactly what I personally contributed to every project I list — using "I", not "we"?',
          'Can I explain why I chose the specific technologies/solutions on my resume, including the alternatives I considered?',
        ],
      },
      {
        title: 'Behavioral, System Design & Process Readiness',
        list: [
          'Do I have at least five strong stories around ownership, failure, conflict, ambiguity and measurable impact?',
          'Can I structure a behavioral answer using Situation, Task, Action and Result (STAR)?',
          'Can I clearly explain what I personally did in every behavioral story — with Action as the majority of the answer?',
          'Do my stories include numbers or measurable outcomes wherever possible?',
          'Can I design a system, estimate its scale, and explain my trade-offs without just reproducing a memorized diagram?',
          'Can I explain WHY I chose one system design approach over the alternatives?',
          'Can I handle a system design requirement changing mid-interview without losing the thread?',
          'Have I done serious mock interviews where someone actually evaluates how I communicate and think, not just whether I got the answer?',
          'Do I keep an error log of the mistakes I repeatedly make during preparation?',
          'Have I actually fixed the weaknesses my mocks surfaced, instead of just collecting a score and moving on?',
          'When I genuinely don\u2019t know the answer, do I know HOW to think my way toward one? (This is the most important question on this list.)',
        ],
        interviewTip: '💡 If the last one is a "no": the fallback process is clarify the problem → break it down → test one assumption → keep moving. Practicing that sequence matters more than memorizing more solutions.',
      },
    ],
  },
  {
    id: 92, title: 'Behavioral Story Bank & STAR Framework', sub: 'Build Reusable Stories, Not Rehearsed Definitions', color: '#c792ea', level: 'mid',
    concepts: [
      {
        title: 'Ten Story Types Worth Having Ready',
        description: [
          'Rather than memorizing definitions of "good" workplace behavior, prepare real stories — most companies\u2019 behavioral rubrics map onto a small set of recurring themes. Aim for 8–10 stories total; a good story often covers 2–3 of these themes at once.',
        ],
        list: [
          'Failure — a project or decision that didn\u2019t work out: what broke, what it cost, what you changed afterward',
          'Disagreement — a real technical disagreement with a manager or teammate, and how it was resolved',
          'Difficult deadline — tight time and large scope: what you cut, what you shipped, what you\u2019d do differently',
          'Ownership — something you took responsibility for that was outside your formal job scope',
          'Ambiguity — requirements were unclear and you had to make a call without full information',
          'Technical decision — a genuinely difficult choice between two or more valid options, and your reasoning',
          'A mistake — something you got wrong, how quickly you caught it, and how you fixed it',
          'A measurable achievement — a clear success with real before/after numbers',
          'Helping others (optional) — a time you helped a teammate or junior colleague grow',
          'Simplifying (optional) — a time you simplified an overly complex process, system, or decision',
        ],
      },
      {
        title: 'STAR Answer Template',
        list: [
          'Story name: a short label so you can recall it instantly',
          'Situation (aim for ~2 sentences): just enough context to set the scene, no more',
          'Task (aim for 1 sentence): what you were specifically responsible for',
          'Action (5–6 points, use "I" not "we"): the concrete decisions and steps YOU took',
          'Result (with numbers): the measurable outcome — latency, cost, users, hours saved, error rate, whatever applies',
          'What this story demonstrates: which themes/competencies it covers (see the list above)',
          'Expected follow-ups: the "why" questions an interviewer is likely to ask next, so you\u2019re not caught off guard',
        ],
        interviewTip: '💡 Action should be roughly 60% of the answer. If you catch yourself narrating what "we" did as a team, stop and restate it as what YOU specifically did, decided, or changed — that\u2019s what\u2019s actually being evaluated.',
      },
    ],
  },
  {
    id: 93, title: 'Daily Practice Drills', sub: 'What Each Round Tests + Small Habits That Compound', color: '#fb923c', level: 'junior',
    concepts: [
      {
        title: 'What Each Interview Round Is Really Testing',
        list: [
          'Coding round — can you clarify the problem, structure your thinking, communicate while you work, write correct code, test it, and then optimise it?',
          'System design round — practicality, reliability, efficiency and scalability of your design; NOT whether you memorized one specific architecture diagram',
          'Behavioral round — what actually happened, what YOU specifically did, why you made that decision, and what the measurable result was',
        ],
      },
      {
        title: 'Five Drills To Run Every Day',
        list: [
          'When you first see a problem, spend 2 minutes ONLY on clarifying questions — no code yet',
          'After every solution, say in one line why it works',
          'After every solution, change one constraint (10x bigger input, a memory limit, streaming data) and adjust your approach out loud',
          'When stuck: clarify → break the problem down → test one assumption → keep moving. Never sit in silence.',
          'For every behavioral answer: lead with the action you took, your reasoning for it, and the result — don\u2019t just recite a value statement',
        ],
        interviewTip: '💡 Silence is one of the worst things in a live coding interview. Saying "I\u2019m thinking about whether a hash map could give me O(1) lookup here…" out loud is far better than 30 seconds of quiet — interviewers often give hints to candidates who think out loud.',
      },
    ],
  },
  {
    id: 94, title: 'Curated Learning Resources', sub: 'Where to Practice, Study, and Run Mock Interviews', color: '#38bdf8', level: 'junior',
    concepts: [
      {
        title: 'DSA Practice Platforms',
        list: [
          'LeetCode — the go-to practice platform; focus on pattern-tagged problem sets rather than random grinding',
          'NeetCode.io — a curated ~150-problem set mapped to every major pattern, with video walkthroughs explaining the pattern, not just the solution',
          'AlgoExpert — paid, but strong video + text + code explanations side by side; good for understanding the "why" behind a solution',
          'GeeksforGeeks (DSA section) — best used as a reference for data-structure theory, edge cases and alternative implementations, not as primary practice',
        ],
      },
      {
        title: 'System Design & Cloud',
        list: [
          'HelloInterview (System Design) — one of the best free system-design curricula: capacity estimation, API design, databases, caching, full end-to-end systems',
          'System Design Primer (GitHub) — a huge, free, well-organized reference on load balancing, caching, databases and scalability concepts',
          'ByteByteGo (YouTube) — clear, visual explanations of how real large-scale systems work',
          'Cloud provider "getting started" docs — if your resume mentions a cloud platform (EC2/S3/RDS-style services), know the fundamentals deeply; use the free tier to actually run them rather than just naming them',
        ],
      },
      {
        title: 'Behavioral Prep & Mock Interviews',
        list: [
          'A general behavioral question bank (e.g. InterviewBit\u2019s behavioral section) — practice structuring answers in STAR format against common prompts',
          'Pramp — free peer-to-peer mock interviews for both coding and behavioral rounds',
          'interviewing.io — paid, anonymous mock interviews with real working engineers; the feedback quality is usually worth the cost',
        ],
      },
      {
        title: 'Tools & Extras',
        list: [
          'Excalidraw — a free whiteboard tool with a hand-drawn aesthetic; good for practicing system-design diagrams before a virtual interview',
          'NeetCode (YouTube) — explains the underlying pattern before solving each problem, reinforcing pattern recognition over memorization',
          'Tech Interview Handbook — a free, comprehensive guide covering resume tips, coding patterns, system design and behavioral prep in one place',
          'Levels.fyi — crowdsourced compensation data across tech companies, useful for knowing your market value before negotiating an offer',
        ],
      },
    ],
  },

];

export const SECTIONS = [...RAW_SECTIONS, ...LEGACY_SECTIONS, ...JS_APP_SECTIONS].map(section => ({
  ...section,
  concepts: section.concepts && section.concepts.length > 0
    ? section.concepts
    : [{
      title: 'Core Concept',
      description: [
        `${section.title} is a high-value topic for interviews because it tests both fundamentals and practical judgment.`,
        'A strong answer explains the idea clearly, mentions trade-offs, and connects it to real-world use.',
      ],
      list: [
        `Explain ${section.title.toLowerCase()} in plain language first.`,
        'Give a real-world example or common use case.',
        'Call out pros, cons, and trade-offs when relevant.',
      ],
      interviewTip: `Interview prompt: explain ${section.title} in under 60 seconds and give one practical example.`,
    }],
}));
