// ─────────────────────────────────────────────────────────────────
//  jsApp/qa.js — interview Q&A for the WayFar JavaScript concepts.
//  Ids 2698+, category "JS App Concepts".
// ─────────────────────────────────────────────────────────────────

const CATEGORY = 'JS App Concepts';

export const JS_APP_QA = [
  {
    id: 2698, category: CATEGORY, difficulty: 'Junior',
    question: 'What is the difference between event.target and event.currentTarget?',
    answer: 'event.target is the element that actually triggered the event, usually the deepest element that was clicked. event.currentTarget is the element the listener is attached to, which is the element handling the event right now. They are the same when you click the element that owns the listener, and different when the event bubbles up from a child. Event delegation relies on this difference.',
    code: `list.addEventListener('click', (event) => {\n  console.log(event.target);        // the <li> that was clicked\n  console.log(event.currentTarget); // the <ul> with the listener\n});`,
    highlights: ['target = origin of the event', 'currentTarget = element running the handler', 'Basis of event delegation'],
  },
  {
    id: 2699, category: CATEGORY, difficulty: 'Junior',
    question: 'What do preventDefault() and stopPropagation() do, and how do they differ?',
    answer: 'preventDefault() cancels the browser default action for the event, such as a form submit reloading the page or a link navigating away. stopPropagation() stops the event from bubbling up to parent listeners. They are independent: preventing the default does not stop bubbling, and stopping propagation does not cancel the default action. In a login form you call preventDefault() on submit so JavaScript can handle the request.',
    code: `form.addEventListener('submit', (event) => {\n  event.preventDefault();   // no page reload\n  // validate, then fetch()\n});`,
    highlights: ['preventDefault cancels the default action', 'stopPropagation stops bubbling', 'They are independent'],
  },
  {
    id: 2700, category: CATEGORY, difficulty: 'Junior',
    question: 'textContent vs innerHTML: which should you use and why?',
    answer: 'textContent sets or reads plain text and never parses markup, so it is fast and safe for user data. innerHTML parses its value as HTML, which is needed only when you intentionally insert markup, and it is the classic XSS entry point when the string contains user input. Use textContent by default. If you must insert HTML, sanitise it with DOMPurify first. innerText is similar to textContent but aware of CSS layout, so it is slower.',
    code: `el.textContent = userInput;                   // safe\nel.innerHTML = DOMPurify.sanitize(userHtml);  // only for trusted rich text`,
    highlights: ['textContent never parses HTML', 'innerHTML + user data = XSS risk', 'Sanitise before using innerHTML'],
  },
  {
    id: 2701, category: CATEGORY, difficulty: 'Junior',
    question: 'What is the difference between location.assign, location.replace and location.href?',
    answer: 'Setting location.href and calling location.assign() both navigate to a new URL and add a new entry to the session history, so the Back button returns to the previous page. location.replace() navigates but replaces the current history entry, so Back skips it. Use replace after login so users cannot go Back to a completed login form. location.reload() refreshes the current page.',
    code: `location.assign('/home.html');   // Back returns to this page\nlocation.replace('/home.html');  // Back skips this page`,
    highlights: ['assign/href add history entries', 'replace does not', 'Use replace after login'],
  },
  {
    id: 2702, category: CATEGORY, difficulty: 'Junior',
    question: 'What are the states of a Promise and what do then, catch and finally do?',
    answer: 'A promise starts pending and ends either fulfilled (with a value) or rejected (with a reason). Once settled it never changes. then() handles fulfilment and returns a new promise, which enables chaining. catch() handles a rejection from anywhere earlier in the chain. finally() runs in both cases for cleanup, such as hiding a loader, and does not receive the result. An unhandled rejection triggers the unhandledrejection event.',
    code: `fetchUser()\n  .then((user) => render(user))\n  .catch((error) => showError(error))\n  .finally(() => hideLoader());`,
    highlights: ['pending → fulfilled | rejected', 'then returns a new promise', 'finally always runs'],
  },
  {
    id: 2703, category: CATEGORY, difficulty: 'Mid',
    question: 'Why is awaiting inside a loop slow, and how do you fix it?',
    answer: 'Each await pauses the function until that promise settles, so awaiting in a loop runs requests one after another and the total time is the sum of all of them. If the requests are independent, start them all first and wait together: map the items to promises and await Promise.all(). Use Promise.allSettled when one failure should not discard the other results. Keep sequential awaits only when a request depends on the previous one. Also avoid await inside forEach, because forEach ignores the returned promises.',
    code: `// slow: one by one\nfor (const id of ids) users.push(await getUser(id));\n\n// fast: in parallel\nconst users = await Promise.all(ids.map(getUser));`,
    highlights: ['Sequential awaits add up', 'Promise.all runs in parallel', 'forEach does not wait for async callbacks'],
  },
  {
    id: 2704, category: CATEGORY, difficulty: 'Mid',
    question: 'Does fetch() reject the promise on a 404 or 500 response?',
    answer: 'No. fetch() rejects only when the request cannot complete, for example on a network failure, a CORS block or an abort. A response with status 404 or 500 still resolves, so you must check response.ok (or response.status) and throw your own error. Wrap this in one reusable request helper so every call handles errors the same way. Use AbortController to add timeouts.',
    code: `const response = await fetch(url);\nif (!response.ok) throw new Error('HTTP ' + response.status);\nconst data = await response.json();`,
    highlights: ['Rejects only on network failure', 'Check response.ok yourself', 'AbortController for timeouts'],
  },
  {
    id: 2705, category: CATEGORY, difficulty: 'Mid',
    question: 'localStorage vs sessionStorage vs cookies: when do you use each, and where should an auth token live?',
    answer: 'localStorage persists until cleared and is shared across tabs of the same origin. sessionStorage is the same API but is limited to one tab and cleared when it closes. Cookies are small, can expire, are sent to the server automatically on each request and can be marked HttpOnly, Secure and SameSite. localStorage and sessionStorage are readable by any script on the page, so an XSS bug can steal a token stored there. For authentication tokens prefer an HttpOnly, Secure, SameSite cookie set by the server, and keep only non-sensitive UI state in web storage.',
    highlights: ['Web storage is readable by JavaScript', 'HttpOnly cookies are not', 'Never store passwords in the browser'],
  },
  {
    id: 2706, category: CATEGORY, difficulty: 'Mid',
    question: 'How does the Notification API permission flow work?',
    answer: 'Notifications need a secure context (HTTPS or localhost) and the user\'s consent. Notification.permission is "default", "granted" or "denied". Call Notification.requestPermission() from a user gesture such as a button click, because browsers block or ignore prompts on page load. Only construct new Notification(title, options) when the permission is "granted". Check "Notification" in window for support, and always provide an in-page fallback message. To notify when the tab is closed you need a service worker and the Push API.',
    highlights: ['Request permission after a user action', 'Handle denied and unsupported cases', 'Background notifications need service workers'],
  },
  {
    id: 2707, category: CATEGORY, difficulty: 'Junior',
    question: 'Does the finally block run if try contains a return statement?',
    answer: 'Yes. finally always runs after try and catch, even if they return or throw. That is why it is the right place for cleanup such as hiding a loader or closing a connection. If finally itself returns a value, it overrides the earlier return, so avoid returning from finally.',
    code: `function demo() {\n  try { return 'try'; }\n  finally { console.log('cleanup'); }   // runs before the function returns\n}`,
    highlights: ['finally always runs', 'Use it for cleanup', 'A return in finally overrides the earlier one'],
  },
  {
    id: 2708, category: CATEGORY, difficulty: 'Mid',
    question: 'How do custom errors and the rethrow pattern improve error handling?',
    answer: 'A custom error class (class ApiError extends Error) carries extra information such as an HTTP status or error code, and instanceof lets callers react differently to different failures. In a catch block, handle only the errors you understand, for example redirecting to login on a 401, and rethrow everything else so real bugs are not swallowed. Add a global unhandledrejection listener for logging, and show users friendly messages instead of raw error text.',
    code: `try { await loadTrips(); }\ncatch (error) {\n  if (error instanceof ApiError && error.status === 401) redirectToLogin();\n  else throw error;   // not ours to handle\n}`,
    highlights: ['extends Error for custom types', 'Handle what you can, rethrow the rest', 'Log details, show friendly messages'],
  },
  {
    id: 2709, category: CATEGORY, difficulty: 'Mid',
    question: 'What are the differences between default and named exports, and why use ES modules?',
    answer: 'A module can have many named exports, imported with braces and the exact name, and one default export, imported under any name. Use named exports for groups of helpers and a default export for the main thing a file provides. ES modules have their own scope, so nothing leaks to the global namespace, they run in strict mode, they are deferred by default and they are statically analysable, which enables tree shaking. They differ from CommonJS require(), which is dynamic and synchronous. Dynamic import() loads code on demand and returns a promise.',
    highlights: ['Own scope, strict mode, deferred', 'Named vs default exports', 'import() for lazy loading'],
  },
  {
    id: 2710, category: CATEGORY, difficulty: 'Mid',
    question: 'Are JavaScript classes real classes? What are private fields and static methods?',
    answer: 'JavaScript classes are syntax over prototype-based inheritance: methods are placed once on the constructor\'s prototype and shared by all instances. A #private field is genuinely inaccessible outside the class body, unlike the _name naming convention. static members belong to the class itself and are called as ClassName.method(). In a subclass created with extends, super() must be called before using this. Prefer composition over deep inheritance trees.',
    code: `class User {\n  #createdAt = new Date();\n  static fromForm(data) { return new User(data); }\n}\nconsole.log(Object.getPrototypeOf(new User({})) === User.prototype); // true`,
    highlights: ['Sugar over prototypes', '#private is enforced by the language', 'static belongs to the class'],
  },
  {
    id: 2711, category: CATEGORY, difficulty: 'Junior',
    question: 'Is client-side form validation enough?',
    answer: 'No. Client-side validation improves the experience by giving instant feedback, but anyone can bypass it with developer tools or by calling the API directly. The server must validate and sanitise every request again. Write client rules as small pure functions that return error messages, use accessible markup (labels, role="alert") and use the browser\'s built-in constraint validation where possible.',
    highlights: ['Client validation = UX', 'Server validation = security', 'Pure functions are easy to test'],
  },
  {
    id: 2712, category: CATEGORY, difficulty: 'Senior',
    question: 'What is the difference between validating, sanitising and encoding, and how do they prevent XSS?',
    answer: 'Validation checks that input has the expected shape (an email looks like an email) and rejects it otherwise. Sanitising removes dangerous parts from HTML you intend to keep, which is what DOMPurify does for rich text. Encoding (output escaping) converts special characters like < > & " into entities so data is displayed as text, and it must match the context: HTML body, attribute, URL or JavaScript. The safest default is to avoid HTML parsing altogether with textContent. Combine these with a Content-Security-Policy as a second layer, and never write your own regex-based sanitiser.',
    code: `el.textContent = userName;                       // best\ncontainer.innerHTML = DOMPurify.sanitize(html);  // rich text\nhtmlString = '<p>' + encodeHtml(userName) + '</p>';  // manual strings`,
    highlights: ['Validate input, sanitise HTML, encode output', 'textContent avoids parsing entirely', 'CSP adds defence in depth'],
  },
  {
    id: 2713, category: CATEGORY, difficulty: 'Senior',
    question: 'How do you prevent an open-redirect vulnerability after login?',
    answer: 'An open redirect happens when the app sends users to any URL passed in a parameter such as ?redirect=, which attackers use for phishing links that start on your trusted domain. Only accept relative paths that start with a single "/" (reject "//" and absolute URLs), or compare against an allow-list of known destinations, and fall back to a default page otherwise. Parse the value with the URL class if you need stricter checks, such as confirming that the origin equals your own.',
    code: `const target = new URLSearchParams(location.search).get('redirect');\nconst isSafe = target?.startsWith('/') && !target.startsWith('//');\nlocation.replace(isSafe ? target : '/home.html');`,
    highlights: ['Never trust redirect parameters', 'Allow only same-site paths', 'Reject "//" and absolute URLs'],
  },
];
