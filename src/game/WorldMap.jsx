import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { WORLDS, LEVELS, TOTAL_XP, rankFor } from './levels/index.js';
import { actions, continueLevel, isUnlocked, summarize, useGame } from './store.js';

const KIND_ICON = { quiz: '💬', code: '⌨️' };

function Stars({ count, total = 3 }) {
  return (
    <span className="gm-stars" aria-label={`${count} of ${total} stars`}>
      {Array.from({ length: total }, (_, i) => <span key={i} className={i < count ? 'on' : ''}>★</span>)}
    </span>
  );
}
export { Stars };

export default function WorldMap() {
  const game = useGame();
  const navigate = useNavigate();
  const { xp, stars, cleared } = summarize(game);
  const { current, next } = rankFor(xp);
  const resume = continueLevel(game);
  const rankPct = next ? Math.round(((xp - current.min) / (next.min - current.min)) * 100) : 100;

  const confirmReset = () => {
    if (window.confirm('Reset ALL Code Quest progress? This cannot be undone.')) actions.reset();
  };

  return (
    <div className="gm-map">
      <header className="gm-hero">
        <div className="gm-hero-text">
          <p className="gm-eyebrow">🎮 Code Quest</p>
          <h1>Level up your full-stack skills</h1>
          <p>
            Six worlds of real interview topics — fetching APIs, debouncing &amp; throttling, JWT, secure login,
            Microsoft auth (MSAL &amp; Managed Identity) and core JavaScript. Write the code, beat the hidden tests,
            defeat the boss.
          </p>
          <div className="gm-hero-actions">
            {resume ? (
              <button className="gm-btn primary" onClick={() => navigate(`/game/${resume.id}`)}>
                {cleared ? '▶ Continue' : '▶ Start the quest'} — {resume.title}
              </button>
            ) : (
              <span className="gm-badge-all">🏆 Every level cleared!</span>
            )}
            <label className="gm-toggle" title="Unlock every level so you can jump anywhere">
              <input type="checkbox" checked={game.practice} onChange={(e) => actions.setPractice(e.target.checked)} />
              <span>Practice mode (unlock all)</span>
            </label>
          </div>
        </div>

        <aside className="gm-rank" aria-label="Your progress">
          <div className="gm-rank-top">
            <span className="gm-rank-icon">{current.icon}</span>
            <div>
              <div className="gm-rank-title">{current.title}</div>
              <div className="gm-rank-sub">{next ? `${next.min - xp} XP to ${next.title}` : 'Max rank reached'}</div>
            </div>
          </div>
          <div className="gm-bar"><span style={{ width: `${rankPct}%` }} /></div>
          <div className="gm-stats">
            <div><b>{xp}</b><small>/ {TOTAL_XP} XP</small></div>
            <div><b>{stars}</b><small>/ {LEVELS.length * 3} ★</small></div>
            <div><b>{cleared}</b><small>/ {LEVELS.length} levels</small></div>
          </div>
          <button className="gm-link" onClick={confirmReset}>Reset progress</button>
        </aside>
      </header>

      <div className="gm-worlds">
        {WORLDS.map((world) => {
          const done = world.levels.filter((l) => game.levels[l.id]).length;
          const open = isUnlocked(world.levels[0], game);
          const previous = WORLDS[world.index - 1];
          const boss = world.levels[world.levels.length - 1].boss;
          return (
            <section key={world.id} className={`gm-world ${open ? '' : 'locked'}`} style={{ '--w': world.color }}>
              <div className="gm-world-head">
                <span className="gm-world-icon">{world.icon}</span>
                <div className="gm-world-title">
                  <h2>World {world.index + 1} · {world.title}</h2>
                  <p>{world.blurb}</p>
                </div>
                <div className="gm-world-progress">
                  <b>{done}/{world.levels.length}</b>
                  <div className="gm-bar small"><span style={{ width: `${(done / world.levels.length) * 100}%` }} /></div>
                </div>
              </div>

              {!open && previous && (
                <p className="gm-world-lock">🔒 Defeat <b>{previous.levels[previous.levels.length - 1].boss.name}</b> in World {previous.index + 1} to enter.</p>
              )}

              <ol className="gm-nodes">
                {world.levels.map((level) => {
                  const result = game.levels[level.id];
                  const unlocked = isUnlocked(level, game);
                  const icon = level.isBoss ? level.boss.emoji : KIND_ICON[level.kind];
                  const body = (
                    <>
                      <span className="gm-node-badge">{unlocked ? icon : '🔒'}</span>
                      <span className="gm-node-title">{level.isBoss ? 'Boss' : `Level ${level.index + 1}`}</span>
                      <span className="gm-node-name">{level.title.replace(/^Boss: /, '')}</span>
                      {result ? <Stars count={result.stars} /> : <span className="gm-node-xp">{level.xp} XP · {level.difficulty}</span>}
                    </>
                  );
                  const classes = `gm-node ${level.isBoss ? 'boss' : ''} ${result ? 'done' : ''} ${unlocked ? '' : 'locked'}`;
                  return (
                    <li key={level.id}>
                      {unlocked
                        ? <Link to={`/game/${level.id}`} className={classes}>{body}</Link>
                        : <span className={classes} aria-disabled="true">{body}</span>}
                    </li>
                  );
                })}
              </ol>
              {boss && <p className="gm-world-boss">{boss.emoji} Final boss: <b>{boss.name}</b></p>}
            </section>
          );
        })}
      </div>
    </div>
  );
}
