// Verifies the Code Quest content:  npm run verify:game
//  • every code level: the reference solution passes ALL tests, the starter fails at least one
//  • every quiz: well-formed, answer index in range
//  • ids unique, hints present, boss levels have boss details
import { createServer } from 'vite';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

process.on('unhandledRejection', () => {});
const root = process.cwd();
const server = await createServer({
  root, configFile: false, logLevel: 'silent', appType: 'custom',
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, watch: null, hmr: false, ws: false },
});
const { LEVELS, WORLDS, TOTAL_XP } = await server.ssrLoadModule('/src/game/levels/index.js');
await server.close();
const { runChallenge } = await import(pathToFileURL(path.join(root, 'src/game/runnerCore.js')).href);

let failures = 0;
const fail = (msg) => { failures++; console.log('  ✗', msg); };
const ids = new Set();
let codeCount = 0; let quizCount = 0; let testCount = 0;

for (const level of LEVELS) {
  const label = `${level.id}`;
  if (ids.has(level.id)) fail(`${label}: duplicate id`);
  ids.add(level.id);
  if (!level.title || !level.story || !level.learn || !(level.xp > 0)) fail(`${label}: missing title/story/learn/xp`);

  if (level.kind === 'quiz') {
    quizCount++;
    if (!Array.isArray(level.questions) || level.questions.length < 3) fail(`${label}: needs ≥ 3 questions`);
    (level.questions || []).forEach((q, i) => {
      if (!q.q || !q.explain) fail(`${label} Q${i + 1}: missing text/explanation`);
      if (!Array.isArray(q.options) || q.options.length < 3) fail(`${label} Q${i + 1}: needs ≥ 3 options`);
      else if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) fail(`${label} Q${i + 1}: answer index out of range`);
      else if (new Set(q.options).size !== q.options.length) fail(`${label} Q${i + 1}: duplicate options`);
    });
    console.log(`✓ quiz  ${label} (${level.questions.length} questions)`);
    continue;
  }

  codeCount++;
  if (!Array.isArray(level.hints) || level.hints.length !== 2 || level.hints.some((h) => !h)) fail(`${label}: needs exactly 2 hints (idea, structure)`);
  if (!level.goal || !level.exports?.length) fail(`${label}: missing goal/exports`);
  if (level.isBoss && !level.boss?.name) fail(`${label}: boss level without boss details`);

  const solved = await runChallenge({ code: level.solution, exports: level.exports, tests: level.tests });
  const starter = await runChallenge({ code: level.starter, exports: level.exports, tests: level.tests });
  testCount += solved.results.length;
  const names = solved.results.map((r) => r.name);
  if (new Set(names).size !== names.length) fail(`${label}: duplicate test names`);
  if (solved.results.length < 5) fail(`${label}: only ${solved.results.length} tests (want ≥ 5)`);
  if (solved.compileError) fail(`${label}: solution does not compile — ${solved.compileError}`);
  solved.results.filter((r) => !r.pass).forEach((r) => fail(`${label}: solution FAILS "${r.name}" → ${r.error}`));
  if (starter.ok) fail(`${label}: the STARTER already passes every test`);
  if (starter.compileError && !/Define/.test(starter.compileError)) fail(`${label}: starter does not compile — ${starter.compileError}`);
  const passingStarter = starter.results.filter((r) => r.pass).length;
  console.log(`${solved.ok ? '✓' : '✗'} code  ${label} — ${solved.results.filter((r) => r.pass).length}/${solved.results.length} tests pass with the solution; starter passes ${passingStarter}/${starter.results.length}`);
}

console.log(`\n${WORLDS.length} worlds · ${LEVELS.length} levels (${codeCount} code, ${quizCount} quiz) · ${testCount} tests · ${TOTAL_XP} XP in total`);
console.log(failures ? `\n${failures} PROBLEM(S) FOUND` : '\nAll game content verified ✔');
process.exit(failures ? 1 : 0);
