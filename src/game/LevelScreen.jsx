import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { WORLDS } from './levels/index.js';
import { actions, clearDraft, getDraft, isUnlocked, nextLevel, saveDraft, useGame } from './store.js';
import { runLevelTests } from './runner.js';
import { highlightJs } from '../utils/highlight.js';
import CodeEditor from './CodeEditor.jsx';
import QuizPlayer from './QuizPlayer.jsx';
import Rich from './Rich.jsx';
import { Stars } from './WorldMap.jsx';

const XP_FACTOR = [1, 0.75, 0.5, 0.25];            // by number of hints used
const HINT_LABEL = ['💡 Show idea', '🧱 Show structure', '🔓 Reveal solution'];

function Header({ level, world }) {
  return (
    <div className="gm-topbar" style={{ '--w': world.color }}>
      <Link to="/game" className="gm-back">← World map</Link>
      <div className="gm-crumbs">
        <span>{world.icon} {world.title}</span>
        <span className="gm-dot">·</span>
        <span>{level.isBoss ? 'Boss level' : `Level ${level.index + 1} of ${world.levels.length}`}</span>
      </div>
      <h1>{level.title}</h1>
      <div className="gm-chips">
        <span className={`gm-chip diff-${level.difficulty.toLowerCase()}`}>{level.difficulty}</span>
        <span className="gm-chip">{level.kind === 'quiz' ? '💬 Quiz' : '⌨️ Code'}</span>
        <span className="gm-chip xp">⚡ {level.xp} XP</span>
      </div>
    </div>
  );
}

function RewardCard({ level, reward, onRetry, retryLabel = 'Keep tinkering' }) {
  const navigate = useNavigate();
  const following = nextLevel(level);
  return (
    <div className="gm-reward" role="status">
      <div className="gm-reward-top">
        <div className="gm-reward-title">{level.isBoss ? `${level.boss.emoji} ${level.boss.name} defeated!` : '🎉 Level cleared!'}</div>
        <Stars count={reward.stars} />
        <div className="gm-reward-xp">{reward.gained > 0 ? `+${reward.gained} XP` : 'Already cleared — no new XP'}</div>
      </div>
      <div className="gm-learn"><b>💼 Interview takeaway</b><p><Rich text={level.learn} /></p></div>
      <div className="gm-reward-actions">
        {following && <button className="gm-btn primary" onClick={() => navigate(`/game/${following.id}`)}>Next: {following.title.replace(/^Boss: /, '')} →</button>}
        {!following && <Link className="gm-btn primary" to="/game">🏆 Back to the map</Link>}
        <button className="gm-btn" onClick={onRetry}>{retryLabel}</button>
        <Link className="gm-btn ghost" to="/game">World map</Link>
      </div>
    </div>
  );
}

// ───────────────────────── quiz level ─────────────────────────
function QuizLevel({ level, world }) {
  const [attempt, setAttempt] = useState(0);
  const [outcome, setOutcome] = useState(null);

  const finish = ({ correct, total, passed }) => {
    if (!passed) { setOutcome({ passed: false, correct, total }); return; }
    const stars = correct === total ? 3 : correct === total - 1 ? 2 : 1;
    const xp = Math.round(level.xp * (stars === 3 ? 1 : stars === 2 ? 0.8 : 0.6));
    setOutcome({ passed: true, correct, total, reward: { stars, xp, ...actions.completeLevel(level.id, { stars, xp }) } });
  };
  const again = () => { setOutcome(null); setAttempt((n) => n + 1); };

  return (
    <div className="gm-level-single" style={{ '--w': world.color }}>
      <Header level={level} world={world} />
      <div className="gm-card gm-story"><Rich text={level.story} /></div>
      <div className="gm-card">
        {!outcome && <QuizPlayer key={attempt} level={level} onFinish={finish} />}
        {outcome && !outcome.passed && (
          <div className="gm-reward fail">
            <div className="gm-reward-title">So close — {outcome.correct}/{outcome.total} correct</div>
            <p>You need at least {Math.ceil(outcome.total * 0.66)} right answers. The explanations after each answer are the lesson — try again!</p>
            <div className="gm-reward-actions"><button className="gm-btn primary" onClick={again}>Retry quiz</button><Link className="gm-btn ghost" to="/game">World map</Link></div>
          </div>
        )}
        {outcome && outcome.passed && <RewardCard level={level} reward={outcome.reward} onRetry={again} retryLabel="Retake quiz" />}
      </div>
    </div>
  );
}

// ───────────────────────── code level ─────────────────────────
function CodeLevel({ level, world }) {
  const draft = useMemo(() => getDraft(level.id), [level.id]);
  const [code, setCode] = useState(draft?.code ?? level.starter);
  const [hints, setHints] = useState(draft?.hints ?? 0);
  const [run, setRun] = useState({ status: 'idle', results: [], compileError: null, logs: [] });
  const [reward, setReward] = useState(null);
  const running = useRef(false);

  // Autosave the draft shortly after typing stops — and ALWAYS when the page is hidden/closed or the
  // level is left, so a quick reload or navigation never loses the last edits.
  const latest = useRef({ code, hints });
  latest.current = { code, hints };
  useEffect(() => {
    const timer = setTimeout(() => saveDraft(level.id, { code, hints }), 300);
    return () => clearTimeout(timer);
  }, [code, hints, level.id]);
  useEffect(() => {
    const flush = () => saveDraft(level.id, latest.current);
    const onVisibility = () => { if (document.hidden) flush(); };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onVisibility);
      flush();
    };
  }, [level.id]);

  const runTests = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    setReward(null);
    setRun({ status: 'running', results: [], compileError: null, logs: [] });
    const summary = await runLevelTests(level, code, {
      onResult: (result) => setRun((current) => ({ ...current, results: [...current.results, result] })),
    });
    running.current = false;
    setRun({ status: 'done', results: summary.results, compileError: summary.compileError || null, logs: summary.logs || [], ok: summary.ok });
    if (summary.ok) {
      const stars = Math.max(1, 3 - hints);
      const xp = Math.round(level.xp * XP_FACTOR[hints]);
      setReward({ stars, xp, ...actions.completeLevel(level.id, { stars, xp }) });
    }
  }, [code, hints, level]);

  const revealHint = () => {
    if (hints === 2 && !window.confirm('Reveal the full solution? You can still clear the level, but for only 25% of the XP and 1 star.')) return;
    setHints((h) => Math.min(3, h + 1));
  };
  const resetCode = () => {
    if (window.confirm('Reset the editor to the starter code?')) { setCode(level.starter); clearDraft(level.id); setRun({ status: 'idle', results: [], compileError: null, logs: [] }); setReward(null); }
  };

  const total = level.objectives.length;
  const passed = run.results.filter((r) => r.pass).length;
  const bossHp = run.status === 'idle' ? 100 : Math.round(((total - passed) / total) * 100);
  const potentialStars = Math.max(1, 3 - hints);

  return (
    <div className="gm-level-wrap" style={{ '--w': world.color }}>
      <Header level={level} world={world} />
      {level.isBoss && (
        <div className="gm-boss">
          <span className="gm-boss-emoji">{level.boss.emoji}</span>
          <div className="gm-boss-body">
            <div className="gm-boss-name">{level.boss.name} <small>“{level.boss.taunt}”</small></div>
            <div className="gm-hp" aria-label={`Boss health ${bossHp}%`}><span style={{ width: `${bossHp}%` }} /></div>
          </div>
          <span className="gm-boss-hp">{bossHp}% HP</span>
        </div>
      )}

      <div className="gm-level">
        <aside className="gm-side">
          <div className="gm-card gm-story">
            <h3>📜 Mission</h3>
            <Rich text={level.story} block />
            <p className="gm-goal"><Rich text={level.goal} /></p>
          </div>

          <div className="gm-card">
            <h3>✅ Requirements <small>{passed}/{total}</small></h3>
            <ul className="gm-reqs">
              {level.objectives.map((name, i) => {
                const result = run.results[i];
                const state = result ? (result.pass ? 'pass' : 'fail') : run.status === 'running' ? 'wait' : 'idle';
                return (
                  <li key={name} className={state}>
                    <span className="gm-req-icon">{{ pass: '✓', fail: '✗', wait: '…', idle: '○' }[state]}</span>
                    <div>
                      <span><Rich text={name} /></span>
                      {result && !result.pass && <code className="gm-req-error">{result.error}</code>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="gm-card">
            <h3>🧠 Hints <small>cost XP</small></h3>
            {hints === 0 && <p className="gm-muted">Stuck? Hints cost XP: idea −25%, structure −50%, solution −75%. Right now a clear earns <Stars count={potentialStars} />.</p>}
            {hints >= 1 && <div className="gm-hint"><b>💡 Idea</b><p><Rich text={level.hints[0]} /></p></div>}
            {hints >= 2 && <div className="gm-hint"><b>🧱 Structure</b><p><Rich text={level.hints[1]} /></p></div>}
            {hints >= 3 && (
              <div className="gm-hint"><b>🔓 Solution</b>
                <pre className="gm-solution"><code dangerouslySetInnerHTML={{ __html: highlightJs(level.solution) }} /></pre>
                <button className="gm-btn small" onClick={() => setCode(level.solution)}>Copy into editor</button>
              </div>
            )}
            {hints < 3 && <button className="gm-btn small" onClick={revealHint}>{HINT_LABEL[hints]} (−{[25, 50, 75][hints]}% XP)</button>}
          </div>
        </aside>

        <section className="gm-work">
          <div className="gm-toolbar">
            <button className="gm-btn primary" onClick={runTests} disabled={run.status === 'running'}>
              {run.status === 'running' ? '⏳ Running…' : '▶ Run tests'} <kbd>Ctrl/⌘ ↵</kbd>
            </button>
            <button className="gm-btn ghost" onClick={resetCode}>↺ Reset</button>
            <span className="gm-toolbar-note">JavaScript · runs in a sandboxed worker · fake clock &amp; fetch</span>
          </div>

          <CodeEditor value={code} onChange={setCode} onRun={runTests} ariaLabel={`Code for ${level.title}`} />

          {run.compileError && (
            <div className="gm-alert error" role="alert"><b>Can’t run your code yet</b><code>{run.compileError}</code></div>
          )}
          {run.status === 'done' && !run.ok && !run.compileError && (
            <div className="gm-alert warn" role="status">{passed}/{total} requirements met — check the ✗ items on the left.</div>
          )}
          {run.logs.length > 0 && (
            <div className="gm-console">
              <div className="gm-console-head">Console</div>
              {run.logs.slice(0, 50).map((entry, i) => <div key={i} className={`gm-log ${entry.level}`}>{entry.text}</div>)}
            </div>
          )}
          {reward && <RewardCard level={level} reward={reward} onRetry={() => setReward(null)} />}
        </section>
      </div>
    </div>
  );
}

// ───────────────────────── wrapper ─────────────────────────
export default function LevelScreen({ level }) {
  const game = useGame();
  const world = WORLDS[level.worldIndex];

  if (!isUnlocked(level, game)) {
    return (
      <div className="gm-card gm-locked" style={{ '--w': world.color }}>
        <div className="gm-locked-icon">🔒</div>
        <h2>{level.title} is locked</h2>
        <p>Clear the previous level first — or switch on <b>Practice mode</b> on the world map to unlock everything.</p>
        <Link className="gm-btn primary" to="/game">Back to the map</Link>
      </div>
    );
  }
  return level.kind === 'quiz' ? <QuizLevel level={level} world={world} /> : <CodeLevel level={level} world={world} />;
}
