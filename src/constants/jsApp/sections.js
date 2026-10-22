// ─────────────────────────────────────────────────────────────────
//  jsApp/sections.js — "JavaScript in a Real App (WayFar Travel App)"
//  Section ids 142–149. Code lives in ./samples/* (real, lintable files)
//  and is highlighted once at load time.
// ─────────────────────────────────────────────────────────────────

import { highlightJs, plainCode } from '../../utils/highlight.js';
import { videos } from '../youtubeChannels.js';

import eventObject from './samples/event-object.js?raw';
import domManipulation from './samples/dom-manipulation.js?raw';
import locationSample from './samples/location.js?raw';
import promises from './samples/promises.js?raw';
import asyncAwait from './samples/async-await.js?raw';
import fetchSample from './samples/fetch.js?raw';
import localStorageSample from './samples/local-storage.js?raw';
import notifications from './samples/notifications.js?raw';
import classes from './samples/classes.js?raw';
import modules from './samples/modules.js?raw';
import formValidation from './samples/form-validation.js?raw';
import errorHandling from './samples/error-handling.js?raw';
import security from './samples/security.js?raw';
import cleanNaming from './samples/clean-naming.js?raw';
import cleanFunctions from './samples/clean-functions.js?raw';
import cleanReuse from './samples/clean-reuse.js?raw';
import cleanTooling from './samples/clean-tooling.js?raw';
import projectStructure from './samples/project-structure.txt?raw';
import projectForm from './samples/project-form.html?raw';
import projectValidators from './samples/project-validators.js?raw';
import projectHelpers from './samples/project-helpers.js?raw';
import projectRegister from './samples/project-register.js?raw';
import projectLogin from './samples/project-login.js?raw';

const MDN = 'https://developer.mozilla.org/en-US/docs/';
const JSINFO = 'https://javascript.info/';
const OWASP = 'https://cheatsheetseries.owasp.org/cheatsheets/';

const link = (title, url) => ({ title, url });

/** Builds one concept in the shape TopicPageLayout expects. */
const concept = ({ title, usedIn, description, list, code, tip, blogs, video }) => ({
  title,
  usedIn,
  description,
  list,
  code,
  interviewTip: tip ? `💡 ${tip}` : undefined,
  blogs,
  videos: video ? videos(video) : undefined,
});

const section = (id, title, sub, level, concepts) => ({
  id, title, sub, level, color: '#f2b45a', concepts,
});

export const JS_APP_SECTIONS = [
  section(142, 'WayFar App: Architecture & File Map',
    'How login.js, register.js, User.js, Utilities.js and the security files fit together', 'junior', [
      concept({
        title: 'Which file uses which concept',
        description: [
          'WayFar is a small vanilla-JavaScript travel app with a login page and a registration page. Every file has one clear job, and each job exercises a handful of core browser and language features. Use this map as your checklist: learn a concept, then open the file that uses it.',
        ],
        list: [
          'login.js → Event object · Promises · localStorage · Location object · DOM methods · Notification API · Error handling · Modules',
          'register.js → Class concept · Event object · DOM methods · Notification API · Error handling · Modules',
          'User.js → Class concept · Modules',
          'Utilities.js → Form validation · Fetch API · Async/await · Notification API · Error handling · Modules',
          'purify.min.js + encoder.js → XSS protection: sanitising HTML and encoding output',
        ],
        blogs: [link('MDN: JavaScript first steps', `${MDN}Learn_web_development/Core/Scripting`)],
        video: 'JavaScript project structure beginners',
      }),
      concept({
        title: 'Request flow: from click to redirect',
        description: [
          'Understanding the order of events is more valuable than memorising any single API. Trace one login from the click to the redirect and you have touched almost every topic in this section.',
        ],
        list: [
          '1. The user submits the form → the submit event fires and preventDefault() stops the page reload.',
          '2. Form values are read from the DOM and checked by pure validation functions.',
          '3. If valid, fetch() sends the credentials to the server and returns a promise; async/await keeps the code linear.',
          '4. On success the user object is saved in localStorage, a Notification confirms the login, and location.replace() moves to the home page.',
          '5. On failure try/catch shows a friendly message, using textContent so nothing from the server is parsed as HTML.',
        ],
        tip: 'In interviews, walk through a flow like this end to end. It shows you understand how the pieces connect, not just what each one does.',
        blogs: [link('Best Tamil JavaScript YouTube channels compared (Error Makes Clever)', 'https://www.errormakesclever.com/blog/best-tamil-javascript-youtube-channel')],
        video: 'JavaScript login registration form project',
      }),
    ]),

  section(143, 'Events & the DOM', 'Event object, DOM manipulation methods and the Location object', 'junior', [
    concept({
      title: 'Event object: properties and methods',
      usedIn: ['login.js', 'register.js'],
      description: [
        'Whenever something happens in the page (a click, a key press, a form submit), the browser creates an Event object and passes it as the first argument to your listener. It describes what happened and gives you tools to change what happens next.',
        'Four things matter most: event.type (the event name), event.target (the element that started the event), event.currentTarget (the element your listener is attached to) and the two control methods. preventDefault() cancels the browser default action, such as a form submit reloading the page. stopPropagation() stops the event bubbling up to parent elements.',
      ],
      list: [
        'target vs currentTarget: target is the deepest element clicked, currentTarget is where addEventListener was called.',
        'preventDefault() and stopPropagation() are independent: one does not imply the other.',
        'Listen to submit on the form, not click on the button, so pressing Enter also works.',
        'Use { once: true } for one-time listeners, and removeEventListener for long-lived pages.',
      ],
      code: highlightJs(eventObject),
      tip: 'Classic question: "target vs currentTarget?" target is who started the event, currentTarget is who is handling it right now. They differ whenever the event bubbles up from a child.',
      blogs: [
        link('MDN: Event', `${MDN}Web/API/Event`),
        link('javascript.info: Introduction to browser events', `${JSINFO}introduction-browser-events`),
        link('javascript.info: Bubbling and capturing', `${JSINFO}bubbling-and-capturing`),
      ],
      video: 'JavaScript events event object preventDefault',
    }),
    concept({
      title: 'DOM manipulation methods',
      usedIn: ['login.js', 'register.js'],
      description: [
        'The DOM is the browser\'s live tree of objects built from your HTML. JavaScript can select nodes, change them, and create or remove them, and the page updates immediately.',
        'Select with querySelector / querySelectorAll (CSS selectors) or getElementById. Change content with textContent, styling with classList, and attributes with setAttribute or dataset. Create nodes with createElement and insert them with append. For many insertions, build a DocumentFragment first so the page is updated once.',
      ],
      list: [
        'textContent is safe for user data; innerHTML parses HTML and can run attacker scripts (XSS).',
        'querySelectorAll returns a static NodeList; getElementsByClassName returns a live HTMLCollection.',
        'classList.add / remove / toggle beats editing the className string by hand.',
        'Event delegation: attach one listener to a parent instead of one per child.',
      ],
      code: highlightJs(domManipulation),
      tip: 'Expect "textContent vs innerHTML vs innerText". textContent is fastest and safest, innerText is layout-aware, innerHTML parses markup.',
      blogs: [
        link('MDN: Introduction to the DOM', `${MDN}Web/API/Document_Object_Model/Introduction`),
        link('javascript.info: Searching elements', `${JSINFO}searching-elements-dom`),
        link('javascript.info: Modifying the document', `${JSINFO}modifying-document`),
      ],
      video: 'JavaScript DOM manipulation querySelector createElement',
    }),
    concept({
      title: 'Location object',
      usedIn: ['login.js'],
      description: [
        'window.location describes the current URL and also controls navigation. Read its parts (href, origin, pathname, search, hash) or call assign, replace and reload to move around.',
        'After a successful login, use location.replace so the login page is not left in the history: pressing Back should not return the user to a form they have already completed. Parse query strings with URLSearchParams instead of splitting strings by hand.',
      ],
      list: [
        'location.href = url and location.assign(url) add a history entry.',
        'location.replace(url) navigates without a history entry.',
        'location.search holds "?a=1&b=2"; URLSearchParams parses it safely.',
        'Never redirect to an untrusted ?redirect= value without validating it (open-redirect attack).',
      ],
      code: highlightJs(locationSample),
      tip: 'Mention open redirects. A login page that sends users to any ?redirect= URL can be abused for phishing. Only allow same-site paths that start with a single slash.',
      blogs: [
        link('MDN: Location', `${MDN}Web/API/Location`),
        link('MDN: URLSearchParams', `${MDN}Web/API/URLSearchParams`),
        link('javascript.info: URL objects', `${JSINFO}url`),
      ],
      video: 'JavaScript window location object href replace reload',
    }),
  ]),

  section(144, 'Async JavaScript', 'Promises, async/await and the Fetch API', 'mid', [
    concept({
      title: 'Handling of promises',
      usedIn: ['login.js'],
      description: [
        'A Promise represents a value that will arrive later. It is pending first, then either fulfilled with a value or rejected with an error, and it never changes state again. Attach handlers with .then() for success, .catch() for failure and .finally() for cleanup that must always run.',
        'Every .then() returns a new promise, which is why chains work and why one .catch() at the end handles any failure above it. Use Promise.all to run independent tasks together (fails fast), Promise.allSettled to collect every outcome, and Promise.race for timeouts.',
      ],
      list: [
        'Three states: pending → fulfilled or rejected (settled, final).',
        'Always return the promise inside .then() so the chain waits for it.',
        'A missing .catch() becomes an unhandled rejection.',
        'Promise.all rejects on the first failure; allSettled never rejects.',
      ],
      code: highlightJs(promises),
      tip: 'Be ready to explain the event loop: promise callbacks run in the microtask queue, which is drained before timers (the macrotask queue).',
      blogs: [
        link('javascript.info: Promise basics', `${JSINFO}promise-basics`),
        link('javascript.info: Promise chaining', `${JSINFO}promise-chaining`),
        link('MDN: Promise', `${MDN}Web/JavaScript/Reference/Global_Objects/Promise`),
      ],
      video: 'JavaScript promises then catch finally',
    }),
    concept({
      title: 'Async / Await',
      usedIn: ['Utilities.js'],
      description: [
        'async/await is syntax over promises that lets asynchronous code read top to bottom. An async function always returns a promise; await pauses that function (not the whole page) until the promise settles.',
        'Errors become ordinary exceptions, so you handle them with try/catch. The most common mistake is awaiting independent calls one after another. Start them together and await Promise.all to cut the total time.',
      ],
      list: [
        'await is only valid inside async functions and at the top level of ES modules.',
        'Sequential awaits add up; Promise.all makes independent calls run in parallel.',
        'Do not use await inside forEach; use for...of or Promise.all with map.',
        'try/catch around await replaces .catch().',
      ],
      code: highlightJs(asyncAwait),
      tip: 'Popular question: "Why is awaiting in a loop slow?" Because each iteration waits for the previous one. Collect the promises with map() and await Promise.all().',
      blogs: [
        link('javascript.info: Async/await', `${JSINFO}async-await`),
        link('MDN: async function', `${MDN}Web/JavaScript/Reference/Statements/async_function`),
      ],
      video: 'JavaScript async await',
    }),
    concept({
      title: 'Fetch API',
      usedIn: ['Utilities.js'],
      description: [
        'fetch(url, options) makes HTTP requests and returns a promise for a Response. For POST requests set method, headers and a JSON-stringified body, then call response.json() to read the reply.',
        'Important gotcha: fetch only rejects on network failure. A 404 or 500 still resolves, so check response.ok yourself. Add an AbortController to cancel slow requests, and wrap everything in one reusable function instead of repeating the boilerplate.',
      ],
      list: [
        'response.ok is true for status 200–299.',
        'Set Content-Type: application/json when sending JSON.',
        'AbortController + signal gives you timeouts and cancellation.',
        'Centralise requests in one helper (base URL, headers, error handling).',
      ],
      code: highlightJs(fetchSample),
      tip: 'The question every interviewer asks: "Does fetch reject on a 404?" No. It only rejects when the request cannot complete, so you must check response.ok.',
      blogs: [
        link('MDN: Using fetch', `${MDN}Web/API/Fetch_API/Using_Fetch`),
        link('javascript.info: Fetch', `${JSINFO}fetch`),
        link('MDN: AbortController', `${MDN}Web/API/AbortController`),
      ],
      video: 'JavaScript Fetch API GET POST',
    }),
  ]),

  section(145, 'Browser Storage & Notifications', 'localStorage and the Notification API', 'mid', [
    concept({
      title: 'Local storage',
      usedIn: ['login.js'],
      description: [
        'localStorage keeps string key/value pairs in the browser with no expiry. It is synchronous, limited to roughly 5 MB per origin, and shared by every tab of the same site. Store objects with JSON.stringify and read them back with JSON.parse.',
        'sessionStorage is the same API but cleared when the tab closes. Cookies are sent to the server on every request and can be HttpOnly. Because any script on the page can read localStorage, never put passwords or long-lived secrets there.',
      ],
      list: [
        'Only strings can be stored: serialise objects with JSON.stringify.',
        'Always wrap JSON.parse in try/catch: the stored value may be corrupted or missing.',
        'Wrap storage in a small module so keys and error handling live in one place.',
        'Tokens in localStorage are exposed to XSS; prefer HttpOnly cookies set by the server.',
      ],
      code: highlightJs(localStorageSample),
      tip: 'Compare localStorage, sessionStorage and cookies (lifetime, size, sent to the server or not, JavaScript access) and say where you would keep an auth token and why.',
      blogs: [
        link('MDN: Web Storage API', `${MDN}Web/API/Web_Storage_API`),
        link('javascript.info: LocalStorage, sessionStorage', `${JSINFO}localstorage`),
        link('OWASP: HTML5 security cheat sheet', `${OWASP}HTML5_Security_Cheat_Sheet.html`),
      ],
      video: 'JavaScript localStorage sessionStorage',
    }),
    concept({
      title: 'Notification API',
      usedIn: ['login.js', 'register.js', 'Utilities.js'],
      description: [
        'The Notification API shows system-level pop-ups outside the page. It works only on secure origins (HTTPS or localhost) and needs the user\'s permission, which is "default", "granted" or "denied".',
        'Request permission from a user action such as a click, because browsers ignore or block prompts that appear on page load. Always check for support first, and keep an in-page message as the fallback since users can deny the permission. For notifications while the tab is closed you need a service worker and the Push API.',
      ],
      list: [
        'Check "Notification" in window before using it.',
        'Notification.requestPermission() returns a promise in modern browsers.',
        'Never rely on it alone: show an in-page message as well.',
        'Put it in a shared helper such as notify(title, body) so every page behaves the same.',
      ],
      code: highlightJs(notifications),
      blogs: [
        link('MDN: Notifications API', `${MDN}Web/API/Notifications_API`),
        link('MDN: Using the Notifications API', `${MDN}Web/API/Notifications_API/Using_the_Notifications_API`),
      ],
      video: 'JavaScript Notification API web notifications',
    }),
  ]),

  section(146, 'Classes & Modular JavaScript', 'The class concept and ES modules', 'mid', [
    concept({
      title: 'Class concept',
      usedIn: ['register.js', 'User.js'],
      description: [
        'A class is a blueprint for objects: a constructor sets up the data, methods define behaviour, getters expose computed values, static members belong to the class itself, and #private fields are hidden from outside code. extends gives inheritance, and super() must run before you touch this in a subclass.',
        'Under the hood, JavaScript classes are syntax over prototypes, so methods live once on the prototype and are shared by every instance. In WayFar, User.js defines the shape of a user and register.js builds one from the form data. A toJSON() method controls exactly what is serialised, so secrets never reach storage.',
      ],
      list: [
        'Methods are shared via the prototype; arrow-function class fields are copied onto each instance.',
        '#private fields are truly private (unlike a _name convention).',
        'static methods are called on the class: User.fromForm(data).',
        'Prefer composition for sharing behaviour; use inheritance only for a real "is-a" relationship.',
      ],
      code: highlightJs(classes),
      tip: 'Say "classes are syntactic sugar over prototypal inheritance" and be ready to show how Object.getPrototypeOf(user) points at User.prototype.',
      blogs: [
        link('javascript.info: Classes', `${JSINFO}class`),
        link('MDN: Classes', `${MDN}Web/JavaScript/Reference/Classes`),
        link('MDN: Private elements', `${MDN}Web/JavaScript/Reference/Classes/Private_elements`),
      ],
      video: 'JavaScript ES6 classes constructor extends',
    }),
    concept({
      title: 'Modular programming',
      usedIn: ['login.js', 'register.js', 'User.js', 'Utilities.js'],
      description: [
        'Split code into small files that each do one job, then connect them with ES modules: export from one file and import in another. Every module has its own scope, so nothing leaks into the global namespace.',
        'Use named exports for groups of helpers and a default export for the one main thing a file provides. Load the entry file with type="module": it is deferred automatically and runs in strict mode. Dynamic import() loads code only when needed, which keeps the first page load fast.',
      ],
      list: [
        'One responsibility per module: validators, API, storage, UI.',
        'Entry files (login.js) only wire modules together.',
        'Modules are singletons: the same instance is shared by every importer.',
        'import() returns a promise, so it works with await and code splitting.',
      ],
      code: highlightJs(modules),
      tip: 'Know ES modules (static, tree-shakeable, async) versus CommonJS require() (dynamic, synchronous, Node.js).',
      blogs: [
        link('javascript.info: Modules', `${JSINFO}modules-intro`),
        link('MDN: JavaScript modules', `${MDN}Web/JavaScript/Guide/Modules`),
      ],
      video: 'JavaScript ES6 modules import export',
    }),
  ]),

  section(147, 'Validation, Errors & Security', 'Form validation, error handling and the security files', 'mid', [
    concept({
      title: 'Form validation',
      usedIn: ['Utilities.js'],
      description: [
        'Validate before sending: required fields, email format, password strength and matching passwords. Write each rule as a small pure function that returns an error message, so rules are easy to test and reuse. Show errors next to the field and tell the user how to fix them.',
        'Client-side validation is for user experience only. Anyone can bypass it, so the server must validate again. The browser also has built-in tools: HTML attributes (required, type="email", minlength) and the Constraint Validation API (checkValidity, reportValidity, setCustomValidity).',
      ],
      list: [
        'Return an array of messages: empty array means valid.',
        'Keep rules separate from DOM code so they can be unit-tested.',
        'Use accessible markup: <label>, role="alert" and aria-live for messages.',
        'Always re-validate on the server.',
      ],
      code: highlightJs(formValidation),
      tip: 'If asked "is client-side validation enough?", answer no. It improves UX, while server-side validation provides security.',
      blogs: [
        link('MDN: Client-side form validation', `${MDN}Learn/Forms/Form_validation`),
        link('MDN: Constraint Validation API', `${MDN}Web/API/Constraint_validation`),
        link('OWASP: Input validation cheat sheet', `${OWASP}Input_Validation_Cheat_Sheet.html`),
      ],
      video: 'JavaScript form validation',
    }),
    concept({
      title: 'Error handling',
      usedIn: ['login.js', 'register.js', 'Utilities.js'],
      description: [
        'Use try / catch / finally to handle runtime failures without crashing the app, and throw to raise your own errors. finally always runs, even after a return or throw, which makes it the right place to hide loaders and release resources.',
        'Create custom error classes (extends Error) to carry extra data such as an HTTP status, handle only the errors you understand, and rethrow the rest. Add a global unhandledrejection listener as a safety net, and show users friendly messages instead of raw error text.',
      ],
      list: [
        'throw new Error(message): never throw strings.',
        'catch (error) can narrow with instanceof.',
        'Rethrow errors you cannot handle so they are not silently swallowed.',
        'Log technical details for developers; show simple text to users.',
      ],
      code: highlightJs(errorHandling),
      tip: 'Trick question: does finally run after a return inside try? Yes, and a return inside finally overrides it.',
      blogs: [
        link('javascript.info: Error handling, try...catch', `${JSINFO}try-catch`),
        link('javascript.info: Custom errors', `${JSINFO}custom-errors`),
        link('MDN: Control flow and error handling', `${MDN}Web/JavaScript/Guide/Control_flow_and_error_handling`),
      ],
      video: 'JavaScript error handling try catch finally throw',
    }),
    concept({
      title: 'JavaScript security files (DOMPurify & encoder)',
      usedIn: ['purify.min.js', 'encoder.js'],
      description: [
        'XSS (cross-site scripting) happens when attacker-controlled text is inserted into a page as HTML and runs as code. Three defences work together. Treat user data as text with textContent. If you really need rich HTML, sanitise it with DOMPurify (purify.min.js) before using innerHTML. If you build HTML strings, encode every dynamic value (encoder.js) so < > & " \' become harmless entities.',
        'Remember the difference: validation checks that input has the expected shape, sanitising removes dangerous parts of HTML, and encoding makes data safe for one specific output context. Add a Content-Security-Policy header as defence in depth.',
      ],
      list: [
        'Default to textContent; reach for innerHTML only when you need markup.',
        'Sanitise HTML with a maintained library, never with your own regex.',
        'Encode for the context: HTML body, attribute, URL and JavaScript each differ.',
        'Keep DOMPurify updated; security libraries change with new bypasses.',
      ],
      code: highlightJs(security),
      tip: 'A strong answer separates the three ideas: validate input, sanitise HTML, encode output. Then mention CSP as the extra layer.',
      blogs: [
        link('OWASP: XSS prevention cheat sheet', `${OWASP}Cross_Site_Scripting_Prevention_Cheat_Sheet.html`),
        link('DOMPurify on GitHub', 'https://github.com/cure53/DOMPurify'),
      ],
      video: 'XSS prevention DOMPurify sanitize HTML JavaScript',
    }),
  ]),

  section(148, 'Clean Code Standards for Vanilla JS', 'Naming, small functions, reusable helpers and tooling', 'junior', [
    concept({
      title: 'Naming and constants',
      description: [
        'Good names remove the need for comments. Variables and functions use camelCase, classes use PascalCase and constants use UPPER_SNAKE_CASE. Functions are verbs (validateLogin), data are nouns (credentials), and booleans read as questions (isAdmin, hasError). Replace magic numbers and strings with named constants.',
      ],
      code: highlightJs(cleanNaming),
      blogs: [link('Clean Code JavaScript (ryanmcdermott)', 'https://github.com/ryanmcdermott/clean-code-javascript')],
      video: 'clean code JavaScript naming best practices',
    }),
    concept({
      title: 'Small, single-purpose functions',
      description: [
        'A function should do one thing. Separate reading the DOM, validating, calling the server and updating the screen. Pure functions (same input, same output, no side effects) are trivial to test, while the event handler only orchestrates. Use early returns to avoid deeply nested if blocks.',
      ],
      list: [
        'Aim for functions that fit on one screen and take three or fewer arguments.',
        'Keep side effects (DOM, network, storage) at the edges of your code.',
        'Prefer const and immutability; avoid changing function arguments.',
      ],
      code: highlightJs(cleanFunctions),
      blogs: [link('Clean Code JavaScript: functions', 'https://github.com/ryanmcdermott/clean-code-javascript#functions')],
      video: 'JavaScript clean code single responsibility functions',
    }),
    concept({
      title: 'DRY and reusable helpers',
      description: [
        'Do not repeat yourself: extract the repeated selector, message handling or URL into one helper or config value. Changes then happen in one place. Use the rule of three: copy once, think twice, extract on the third time. Avoid over-abstracting too early, because the wrong abstraction costs more than a little duplication.',
      ],
      code: highlightJs(cleanReuse),
      blogs: [link('MDN: JavaScript modules', `${MDN}Web/JavaScript/Guide/Modules`)],
      video: 'JavaScript DRY reusable code utility functions',
    }),
    concept({
      title: 'Documentation, linting and formatting',
      description: [
        'Automate standards so reviews focus on design. ESLint catches bugs and bad patterns, Prettier formats code consistently, and JSDoc comments document parameters and return types for editors and teammates. Write comments to explain why, not what.',
      ],
      list: [
        'ESLint: finds unused variables, accidental globals and == mistakes.',
        'Prettier: one formatting style, zero style debates.',
        'Vitest or Jest: test pure functions first; they need no mocks.',
      ],
      code: highlightJs(cleanTooling),
      blogs: [
        link('Airbnb JavaScript style guide', 'https://github.com/airbnb/javascript'),
        link('ESLint documentation', 'https://eslint.org/docs/latest/'),
        link('Prettier documentation', 'https://prettier.io/docs/'),
      ],
      video: 'ESLint Prettier setup JavaScript project',
    }),
  ]),

  section(149, 'Project: Build the WayFar Auth Flow', 'Register and log in with clean, modular, reusable code', 'mid', [
    concept({
      title: '1. Folder structure and the form',
      description: [
        'Build it in layers. Entry files wire the page, services talk to the outside world (network, storage, notifications), utils hold pure helpers, and models describe your data. Start with accessible HTML: every input has a label, a suitable autocomplete value and the right type.',
      ],
      code: `${plainCode(projectStructure)}\n\n${plainCode(projectForm)}`,
      blogs: [link('MDN: Your first form', `${MDN}Learn/Forms/Your_first_form`), link('javascript.info: Form controls', `${JSINFO}form-elements`)],
      video: 'JavaScript login registration form project',
    }),
    concept({
      title: '2. utils/validators.js: pure validation',
      description: [
        'Validators take plain values and return an array of messages. No DOM, no network, so they can be unit-tested in a second. The same file serves both pages.',
      ],
      code: highlightJs(projectValidators),
      blogs: [link('MDN: Regular expressions guide', `${MDN}Web/JavaScript/Guide/Regular_expressions`)],
      video: 'JavaScript form validation regex',
    }),
    concept({
      title: '3. utils/dom.js and services/api.js',
      description: [
        'Two tiny helpers remove most of the repeated code from both pages: $ and readForm for the DOM, post for the network. The API helper turns HTTP failures into real errors, so pages need only one try/catch.',
      ],
      code: highlightJs(projectHelpers),
      blogs: [link('MDN: Using fetch', `${MDN}Web/API/Fetch_API/Using_Fetch`)],
      video: 'JavaScript fetch API POST request',
    }),
    concept({
      title: '4. models/User.js, services/session.js and services/notify.js',
      description: [
        'These three files are the samples from the earlier sections, used unchanged: the User class (Class concept), the session storage wrapper (Local storage) and the notify helper (Notification API). Reuse is the point: register.js and login.js import them instead of repeating that logic.',
      ],
      list: [
        'User.js → class with displayName and toJSON() (see "Class concept").',
        'session.js → save / load / clear around localStorage (see "Local storage").',
        'notify.js → permission-aware notification helper (see "Notification API").',
      ],
      video: 'JavaScript localStorage Notification API',
    }),
    concept({
      title: '5. register.js: the entry point',
      usedIn: ['register.js'],
      description: [
        'The entry file only orchestrates: read the form, validate, call the server, update the UI, notify and redirect. Every step is a call into a small, tested helper, which is why the file stays short and readable.',
      ],
      code: highlightJs(projectRegister),
      blogs: [link('javascript.info: Async/await', `${JSINFO}async-await`)],
      video: 'JavaScript registration form fetch async await',
    }),
    concept({
      title: '6. login.js: sessions and safe redirects',
      usedIn: ['login.js'],
      description: [
        'Login adds two production concerns: persisting the signed-in user and redirecting safely. Only non-secret profile data goes into localStorage, because toJSON() filters the user object. The redirect target is validated so ?redirect= cannot send people to another site.',
        'In a real system the server should authenticate with an HttpOnly, Secure, SameSite cookie, and the client keeps only display data. Hash passwords on the server with bcrypt or argon2; never in the browser.',
      ],
      code: highlightJs(projectLogin),
      tip: 'Extension tasks: add a logout button that calls session.clear(), a route guard that redirects to login when session.load() is null, and unit tests for validators.js.',
      blogs: [
        link('OWASP: Authentication cheat sheet', `${OWASP}Authentication_Cheat_Sheet.html`),
        link('OWASP: Unvalidated redirects and forwards', `${OWASP}Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html`),
      ],
      video: 'JavaScript login system localStorage fetch',
    }),
  ]),
];
