// utils/dom.js
export const $ = (selector, root = document) => root.querySelector(selector);

export const readForm = (form) => Object.fromEntries(new FormData(form));

export function showMessage(element, text, type = 'error') {
  element.textContent = text;                       // textContent: safe by default
  element.className = 'message message--' + type;
}

// services/api.js
const API_BASE = '/api';

export async function post(path, body) {
  const response = await fetch(API_BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));   // tolerate empty / non-JSON bodies
  if (!response.ok) throw new Error(data.message ?? 'Request failed (' + response.status + ')');
  return data;
}
