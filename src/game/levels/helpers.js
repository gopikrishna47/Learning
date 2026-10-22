// Code-level files live in ../content/<id>.{starter,solution,tests}.js and are
// loaded as plain text (?raw) — they are never executed by the app itself, only
// by the sandboxed test runner.
const RAW = import.meta.glob('../content/*.js', { query: '?raw', import: 'default', eager: true });
const read = (id, kind) => {
  const text = RAW[`../content/${id}.${kind}.js`];
  if (typeof text !== 'string') throw new Error(`Missing level file: content/${id}.${kind}.js`);
  return text;
};

/** A coding level: write functions, hidden tests judge them. */
export const code = (id, meta) => ({
  kind: 'code',
  id,
  starter: read(id, 'starter'),
  solution: read(id, 'solution'),
  tests: read(id, 'tests'),
  ...meta,
});

/** A quiz level: multiple-choice questions with explanations. */
export const quiz = (id, meta) => ({ kind: 'quiz', id, ...meta });
