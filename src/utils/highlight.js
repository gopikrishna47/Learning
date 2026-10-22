// ─────────────────────────────────────────────────────────────────
//  highlight.js — tiny, dependency-free JavaScript syntax highlighter.
//
//  The portal's <CodeBlock> renders trusted HTML, so code samples are
//  stored pre-highlighted using the existing `c-*` span classes.
//  Authoring raw code and running it through `highlightJs()` keeps data
//  files readable and guarantees every `<`, `>` and `&` is escaped.
// ─────────────────────────────────────────────────────────────────

const KEYWORDS = new Set([
  'const', 'let', 'var', 'function', 'return', 'new', 'class', 'constructor', 'extends',
  'if', 'else', 'switch', 'case', 'break', 'for', 'while', 'do', 'of', 'in', 'try', 'catch',
  'finally', 'throw', 'async', 'await', 'export', 'default', 'import', 'from', 'static',
  'get', 'set', 'typeof', 'instanceof', 'this', 'super', 'delete',
]);
const CONSTANTS = new Set(['true', 'false', 'null', 'undefined', 'NaN', 'Infinity']);

const TOKEN =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|\b(\d+(?:\.\d+)?)\b|([A-Za-z_$][\w$]*)/g;

export function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const span = (cls, text) => `<span class="${cls}">${escapeHtml(text)}</span>`;

/** Returns highlighted, HTML-safe markup for a JavaScript snippet. */
export function highlightJs(source) {
  const code = source.replace(/^\n+|\s+$/g, '');
  let out = '';
  let last = 0;

  for (const match of code.matchAll(TOKEN)) {
    const [text, comment, string, number, word] = match;
    const end = match.index + text.length;
    out += escapeHtml(code.slice(last, match.index));
    last = end;

    if (comment) out += span('c-comment', text);
    else if (string) out += span('c-str', text);
    else if (number) out += span('c-num', text);
    else if (KEYWORDS.has(word)) out += span('c-keyword', text);
    else if (CONSTANTS.has(word)) out += span('c-kw2', text);
    else if (/^\s*\(/.test(code.slice(end))) out += span('c-fn', text);
    else out += escapeHtml(text);
  }
  return out + escapeHtml(code.slice(last));
}

/** Markup / CSS / shell snippets: escape only (no JS colouring). */
export const plainCode = (source) => escapeHtml(source.replace(/^\n+|\s+$/g, ''));
