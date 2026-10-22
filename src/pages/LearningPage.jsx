import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { TOPICS, hexToRgb } from '../constants/topics.js';
import { SECTION_TOTAL } from '../constants/generated/catalog.js';
import { HUB, SECTION_IDS } from '../constants/generated/hub.js';
import { prefetchTopic } from '../data/index.js';
import BackToTop from '../components/BackToTop.jsx';

const HUB_TOPICS = TOPICS.filter((t) => t.hub !== false);
const VALID_SECTION_IDS = new Set(SECTION_IDS);

function TopicCard({ card, completed }) {
  const done = card.ids.filter(id => completed.has(id)).length;
  const total = card.ids.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  // Counts + 3 preview questions are precomputed at build time (generated/hub.js),
  // so the home page never has to download the Q&A bank.
  const { qaCount, preview: qaPreview } = HUB[card.key];
  const warm = () => prefetchTopic(card);   // start fetching the topic's content on hover/focus

  return (
    <Link to={card.route} className="hub-card" style={{ '--hc': card.color, '--hc-rgb': hexToRgb(card.color) }}
      onMouseEnter={warm} onFocus={warm} onTouchStart={warm}>
      <div className="hub-card-icon">{card.icon}</div>
      <div className="hub-card-body">
        <h2 className="hub-card-title">{card.label}</h2>
        <p className="hub-card-desc">{card.desc}</p>
        <div className="hub-card-meta">
          <span>{total} topics</span>
          <span>·</span>
          <span>{qaCount} Q&amp;As</span>
        </div>
        <div className="hub-card-qa">
          <div className="hub-card-qa-title">Practice Q&amp;As</div>
          <ul className="hub-card-qa-list">
            {qaPreview.map(item => (
              <li key={item.id} className="hub-card-qa-item">{item.question}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="hub-card-progress">
        <div className="hub-card-pct">{pct}%</div>
        <div className="hub-card-bar">
          <div className="hub-card-fill" style={{ width: `${pct}%`, background: card.color }} />
        </div>
        <div className="hub-card-done">{done}/{total}</div>
      </div>
      <span className="hub-card-arrow">→</span>
    </Link>
  );
}

export default function LearningPage() {
  const completed = useSelector(s => s.checklist.completed);

  const totalTopics = SECTION_TOTAL;
  const totalDone = useMemo(
    () => [...completed].filter(id => VALID_SECTION_IDS.has(id)).length,
    [completed],
  );
  const totalPct = totalTopics ? Math.round((totalDone / totalTopics) * 100) : 0;

  return (
    <main id="learning-page" style={{ padding: 'calc(var(--header-h) + 32px) 24px 80px', maxWidth: 1100, margin: '0 auto' }}>

      {/* ── Hero ── */}
      <div className="hub-hero">
        <div className="hub-hero-text">
          <span className="lp-eyebrow">Full-Stack Interview Prep · {totalTopics} topics</span>
          <h1>Pick a topic and dive in</h1>
          <p>Each topic now bundles concept explanations, code examples, and matching interview questions so you can study by language or framework in one place.</p>
        </div>
        <div className="hub-hero-stats">
          <div className="lp-stat"><span>{totalTopics}</span><label>Topics</label></div>
          <div className="lp-stat"><span>{totalDone}</span><label>Done</label></div>
          <div className="lp-stat"><span>{totalPct}%</span><label>Overall</label></div>
        </div>
      </div>

      {/* ── Game promo ── */}
      <Link to="/game" className="hub-game-banner">
        <span className="hgb-icon">🎮</span>
        <span className="hgb-text">
          <b>New: Code Quest</b>
          <small>Play through 30 levels — fetch APIs, debounce &amp; throttle, JWT, secure login, MSAL &amp; more. Beat the hidden tests, defeat the bosses.</small>
        </span>
        <span className="hgb-cta">Play →</span>
      </Link>

      {/* ── Global progress bar ── */}
      <div className="hub-global-bar">
        <div className="hub-global-fill" style={{ width: `${totalPct}%` }} />
      </div>

      {/* ── Topic grid ── */}
      <div className="hub-grid">
        {HUB_TOPICS.map(card => (
          <TopicCard key={card.key} card={card} completed={completed} />
        ))}
      </div>

      <BackToTop />
    </main>
  );
}
