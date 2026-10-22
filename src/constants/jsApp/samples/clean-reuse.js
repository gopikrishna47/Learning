// ❌ Copy-pasted selectors, messages and URLs in every file
document.querySelector('#message').textContent = 'Saved';
document.querySelector('#message').className = 'message message--success';

// ✅ DRY: one tiny helper, imported everywhere
// utils/dom.js
export const $ = (selector, root = document) => root.querySelector(selector);

export function showMessage(text, type = 'error') {
  const element = $('#message');
  element.textContent = text;
  element.className = 'message message--' + type;
}

// config.js: one place for values that change between environments
export const API_BASE = '/api';
export const STORAGE_KEYS = Object.freeze({ user: 'wayfar.user' });

// Rule of three: the third time you copy code, extract a function.
