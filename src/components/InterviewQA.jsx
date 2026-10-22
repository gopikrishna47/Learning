import React, { memo, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import QARichContent from './categories/QARichContent.jsx';
import { matchesQuery } from '../utils/qaSearch.js';
import { QA_ANSWERED, QA_CATEGORIES, QA_TOTAL } from '../constants/generated/catalog.js';
import { loadCategory, loadQACards, loadQAIndex } from '../data/index.js';
import useLoaded from '../hooks/useLoaded.js';
import useIncremental from '../hooks/useIncremental.js';

// Performance notes
//  • The list is built from lightweight "cards" (question, difficulty, 3 pills) — a
//    small lazy chunk — instead of the full 1,000+ answer bank.
//  • An answer's full text is fetched (per category, cached) only when its card opens.
//  • Full-text search needs every answer, so that index is fetched on first search.
//  • Long lists render progressively as you scroll; cards are memoised so opening
//    one card doesn't re-render the rest.

const CATEGORY_META = {
  JavaScript: { icon: '🟨', accent: '#f7df1e' },
  React: { icon: '⚛️', accent: '#61dafb' },
  Java: { icon: '☕', accent: '#f59e0b' },
  Python: { icon: '🐍', accent: '#3b82f6' },
  Database: { icon: '🗄️', accent: '#f472b6' },
  'HTML/CSS': { icon: '🎨', accent: '#f43f5e' },
  SCSS: { icon: '🧵', accent: '#ec4899' },
  JWT: { icon: '🔐', accent: '#a78bfa' },
  'Node.js': { icon: '🟩', accent: '#38bdf8' },
  'System Design': { icon: '🧠', accent: '#fb923c' },
  Spring: { icon: '🍃', accent: '#6cbf4a' },
  'Banking Scenarios': { icon: '🏦', accent: '#facc15' },
  TypeScript: { icon: '🔷', accent: '#3178c6' },
  'Next.js': { icon: '▲', accent: '#e5e5e5' },
  GraphQL: { icon: '🕸️', accent: '#e535ab' },
  'API Design': { icon: '🔌', accent: '#22d3ee' },
  Microservices: { icon: '🧱', accent: '#ff6b35' },
  'Production Scenarios': { icon: '🚨', accent: '#ef4444' },
  DSA: { icon: '🧩', accent: '#a78bfa' },
  'React Native': { icon: '📱', accent: '#61dafb' },
  'Offline-First': { icon: '📴', accent: '#84cc16' },
  'AI Tooling': { icon: '🤖', accent: '#9c27b0' },
  'Resume & Projects': { icon: '📄', accent: '#fbbf24' },
  Behavioral: { icon: '🎯', accent: '#c792ea' },
  Managerial: { icon: '👥', accent: '#c792ea' },
};
const CATEGORY_ACCENTS = ['#00ffd1', '#ff6b6b', '#f472b6', '#38bdf8', '#f59e0b', '#a78bfa'];
const CATEGORIES = [
  { key: 'All', icon: '🗂️', accent: '#00ffd1' },
  ...QA_CATEGORIES.map(({ key }, index) => ({
    key,
    ...(CATEGORY_META[key] || {
      icon: '💬',
      accent: CATEGORY_ACCENTS[index % CATEGORY_ACCENTS.length],
    }),
  })),
];
const CATEGORY_BY_KEY = new Map(CATEGORIES.map((c) => [c.key, c]));

const DIFFICULTIES = ['All', 'Junior', 'Mid', 'Senior'];

const diffColor = { Junior: '#34d399', Mid: '#fbbf24', Senior: '#f87171' };

/** Full answer for one opened card — fetched (and cached) by category. */
function QACardBody({ row }) {
  const { value: items, error } = useLoaded(`cat:${row.category}`, () => loadCategory(row.category));
  const item = useMemo(() => items?.find((i) => i.id === row.id), [items, row.id]);

  if (error) return <div className="qa-card-body"><div className="qa-card-answer">Couldn&apos;t load this answer — check your connection and try again.</div></div>;
  if (!item) return <div className="qa-card-body"><div className="qa-card-answer">Loading…</div></div>;

  return (
    <div className="qa-card-body">
      <div className="qa-card-answer">{item.answer}</div>
      <QARichContent item={item} />
      {item.code && (
        <div className="qa-code-wrap">
          <div className="qa-code-label">
            <span>{item.category}</span>
            <CopyBtn code={item.code} />
          </div>
          <pre className="qa-code"><code>{item.code}</code></pre>
        </div>
      )}
    </div>
  );
}

const QAListCard = memo(function QAListCard({ row, catInfo, isOpen, onToggle }) {
  return (
    <div
      className={`qa-card ${isOpen ? 'open' : ''}`}
      style={{ '--card-accent': catInfo.accent }}
    >
      {/* Card header */}
      <div className="qa-card-head" onClick={() => onToggle(row.id)}>
        <div className="qa-card-meta">
          <span className="qa-card-cat-icon">{catInfo.icon}</span>
          <span className="qa-card-cat">{row.category}</span>
          <span className="qa-card-diff" style={{ '--diff-c': diffColor[row.difficulty] || '#888' }}>
            {row.difficulty}
          </span>
        </div>
        <p className="qa-card-question">{row.question}</p>
        <div className="qa-card-pills">
          {row.highlights?.map(h => (
            <span key={h} className="qa-card-pill">{h}</span>
          ))}
        </div>
        <span className={`qa-card-chevron ${isOpen ? 'up' : ''}`}>▾</span>
      </div>

      {/* Expandable body */}
      {isOpen && <QACardBody row={row} />}
    </div>
  );
});

export default function InterviewQA() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeDiff, setActiveDiff] = useState('All');
  const [openId, setOpenId] = useState(null);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const tabsRef = useRef(null);

  const { value: rows, error: rowsError } = useLoaded('cards', loadQACards);
  // Search covers answers and code, so it needs the full bank — fetched on first use.
  const { value: fullIndex, error: indexError } = useLoaded(deferredSearch ? 'index' : null, loadQAIndex);

  const filtered = useMemo(() => {
    if (!rows) return [];
    if (deferredSearch && !fullIndex) return [];
    return rows.filter((row) => {
      const catOk = activeCategory === 'All' || row.category === activeCategory;
      const diffOk = activeDiff === 'All' || row.difficulty === activeDiff;
      return catOk && diffOk && (!deferredSearch || matchesQuery(fullIndex.get(row.id), deferredSearch));
    });
  }, [rows, fullIndex, activeCategory, activeDiff, deferredSearch]);

  const view = useIncremental(filtered.length, `${activeCategory}|${activeDiff}|${deferredSearch}`, 40);
  const toggleCard = useCallback((id) => setOpenId((cur) => (cur === id ? null : id)), []);

  const currentAccent = CATEGORY_BY_KEY.get(activeCategory)?.accent || '#00ffd1';
  const searching = Boolean(deferredSearch) && !fullIndex && !indexError;
  const loading = !rows && !rowsError;

  // Scroll active tab into view
  useEffect(() => {
    const el = tabsRef.current?.querySelector('.qa-tab.active');
    if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
  }, [activeCategory]);

  return (
    <section className="qa-page">
      {/* Hero */}
      <div className="qa-hero">
        <p className="qa-eyebrow">Interview Q&amp;A ({CATEGORIES.length - 1} categories)</p>
        <h2>Deep-dive prep across programming languages, frameworks, infrastructure, and real-world scenarios.</h2>
        <p>Filter by category and difficulty. Expand any card to read the full answer and code example.</p>
        <div className="qa-hero-stats">
          <div className="qa-stat"><span>{QA_TOTAL}</span><label>Questions</label></div>
          <div className="qa-stat"><span>{QA_ANSWERED}</span><label>Answered</label></div>
          <div className="qa-stat"><span>{CATEGORIES.length - 1}</span><label>Categories</label></div>
          <div className="qa-stat"><span>⚡</span><label>Ready</label></div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="qa-filters">
        {/* Category tabs */}
        <div className="qa-tabs" ref={tabsRef}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              className={`qa-tab ${activeCategory === cat.key ? 'active' : ''}`}
              style={{ '--tab-accent': cat.accent }}
              onClick={() => { setActiveCategory(cat.key); setOpenId(null); }}
            >
              <span className="qa-tab-icon">{cat.icon}</span>
              <span className="qa-tab-label">{cat.key}</span>
            </button>
          ))}
        </div>

        {/* Difficulty + Search row */}
        <div className="qa-filter-row">
          <div className="qa-diff-btns">
            {DIFFICULTIES.map(d => (
              <button
                key={d}
                className={`qa-diff-btn ${activeDiff === d ? 'active' : ''}`}
                style={activeDiff === d && d !== 'All' ? { '--db-color': diffColor[d] } : {}}
                onClick={() => setActiveDiff(d)}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="qa-search-wrap">
            <span className="qa-search-icon">🔍</span>
            <input
              className="qa-search"
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="qa-search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
          <span className="qa-result-count">
            {loading || searching ? '…' : filtered.length} results
          </span>
        </div>
      </div>

      {/* Cards */}
      {rowsError || indexError ? (
        <div className="qa-empty">
          <span>⚠️</span>
          <p>Couldn&apos;t load the questions. Check your connection and try again.</p>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      ) : loading || searching ? (
        <div className="route-loading">{searching ? 'Searching…' : 'Loading questions…'}</div>
      ) : filtered.length === 0 ? (
        <div className="qa-empty">
          <span>🔎</span>
          <p>No questions match your filters.</p>
          <button onClick={() => { setSearch(''); setActiveDiff('All'); setActiveCategory('All'); }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="qa-cards" style={{ '--active-accent': currentAccent }}>
          {filtered.slice(0, view.count).map((row) => (
            <QAListCard
              key={row.id}
              row={row}
              catInfo={CATEGORY_BY_KEY.get(row.category) || CATEGORIES[0]}
              isOpen={openId === row.id}
              onToggle={toggleCard}
            />
          ))}
          {view.hasMore && <div ref={view.sentinelRef} className="qa-sentinel" aria-hidden="true" />}
        </div>
      )}
    </section>
  );
}

function CopyBtn({ code }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button className="qa-copy-btn" onClick={handle}>
      {copied ? '✓ copied' : 'copy'}
    </button>
  );
}
