const comment = document.querySelector('#comment');
const container = document.querySelector('#container');
const userName = new URLSearchParams(location.search).get('name') ?? 'traveller';

// 1. Best: treat user text as TEXT, so the browser never parses it as HTML
comment.textContent = userName;

// 2. Need rich HTML? Sanitize it first with DOMPurify (purify.min.js)
const dirty = '<img src=x onerror="alert(1)"><b>Hi</b>';
const clean = DOMPurify.sanitize(dirty);      // <img src="x"><b>Hi</b>
container.innerHTML = clean;

// 3. Building an HTML string yourself? Encode every dynamic value (encoder.js)
const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const encodeHtml = (text) => text.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);

container.innerHTML = '<p>Hello ' + encodeHtml(userName) + '</p>';
