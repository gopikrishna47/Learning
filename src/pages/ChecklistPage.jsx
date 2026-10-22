import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { QA_CATEGORIES } from '../constants/generated/catalog.js';
import { loadQACards } from '../data/index.js';
import useLoaded from '../hooks/useLoaded.js';

// Build checklist from actual Q&A data (no dependency on SECTIONS)
const GROUP_META = {
  JavaScript: { icon: '🟨', accent: '#f7df1e', desc: 'Closures, async, prototypes, ES6+' },
  React: { icon: '⚛️', accent: '#61dafb', desc: 'Hooks, state, rendering, patterns' },
  Java: { icon: '☕', accent: '#f59e0b', desc: 'OOP, JVM, generics, collections' },
  Python: { icon: '🐍', accent: '#3b82f6', desc: 'Decorators, GIL, dataclasses, comprehensions' },
  Database: { icon: '🗄️', accent: '#f472b6', desc: 'SQL, indexes, joins, normalization, sharding' },
  'HTML/CSS': { icon: '🎨', accent: '#f43f5e', desc: 'Box model, flexbox, grid, specificity' },
  SCSS: { icon: '🧵', accent: '#ec4899', desc: 'Variables, modules, mixins, and reusable styles' },
  JWT: { icon: '🔐', accent: '#a78bfa', desc: 'Tokens, OAuth, storage, revocation' },
  'Node.js': { icon: '🟩', accent: '#38bdf8', desc: 'Event loop, I/O, async patterns' },
  'System Design': { icon: '🧠', accent: '#fb923c', desc: 'Scalability, caching, load balancing' },
  Spring: { icon: '🍃', accent: '#6cbf4a', desc: 'Spring framework and application scenarios' },
  'Banking Scenarios': { icon: '🏦', accent: '#facc15', desc: 'Banking and payment scenarios' },
};
const FALLBACK_ACCENTS = ['#00ffd1', '#ff6b6b', '#f472b6', '#38bdf8', '#f59e0b', '#a78bfa'];
const GROUPS = QA_CATEGORIES.map(({ key }, index) => ({
  key,
  ...(GROUP_META[key] || {
    icon: '💬',
    accent: FALLBACK_ACCENTS[index % FALLBACK_ACCENTS.length],
    desc: 'Interview questions and scenarios',
  }),
}));

const STORAGE_KEY = 'qa_checklist_v2';

function loadDone() {
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); }
  catch { return new Set(); }
}
function notifyChange() {
  window.dispatchEvent(new Event('qa-checklist-change'));
}
function saveDone(set) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...set])); } catch { /* ignore */ }
  notifyChange();
}

// Animated ring progress
function RingProgress({ pct, accent, size = 56 }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={accent} strokeWidth="5"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  );
}

// Single group card
function GroupCard({ group, questions, done, onToggle, isExpanded, onToggleExpand }) {
  const completedCount = questions.filter(q => done.has(q.id)).length;
  const pct = questions.length ? Math.round((completedCount / questions.length) * 100) : 0;
  const allDone = pct === 100;
  const listRef = useRef(null);
  // Items mount the first time the group opens (and stay mounted so the close
  // animation works). 31 of 32 groups start collapsed, so this skips ~900 rows on load.
  const hasOpened = useRef(isExpanded);
  if (isExpanded) hasOpened.current = true;

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    if (isExpanded) {
      el.style.maxHeight = el.scrollHeight + 'px';
      el.style.opacity = '1';
    } else {
      el.style.maxHeight = '0';
      el.style.opacity = '0';
    }
  }, [isExpanded]);

  return (
    <article
      className={`cl2-group ${allDone ? 'all-done' : ''}`}
      style={{ '--ga': group.accent }}
    >
      {/* Group header */}
      <button className="cl2-group-head" onClick={onToggleExpand}>
        <RingProgress pct={pct} accent={group.accent} />
        <div className="cl2-group-info">
          <div className="cl2-group-title">
            <span className="cl2-group-icon">{group.icon}</span>
            {group.key}
            {allDone && <span className="cl2-done-badge">✓ Done</span>}
          </div>
          <div className="cl2-group-sub">{group.desc}</div>
          <div className="cl2-group-prog-text">
            {completedCount}/{questions.length} questions
          </div>
        </div>
        <span className={`cl2-chevron ${isExpanded ? 'open' : ''}`}>▾</span>
      </button>

      {/* Questions list — animated expand */}
      <div
        ref={listRef}
        className="cl2-list"
        style={{
          maxHeight: 0, opacity: 0, overflow: 'hidden',
          transition: 'max-height 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.28s ease'
        }}
      >
        <div className="cl2-list-inner">
          {hasOpened.current && questions.map((q, idx) => {
            const checked = done.has(q.id);
            return (
              <div
                key={q.id}
                className={`cl2-item ${checked ? 'checked' : ''}`}
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <div className="cl2-item-left">
                  <span className="cl2-item-num">{String(idx + 1).padStart(2, '0')}</span>
                  <span
                    className="cl2-diff-dot"
                    style={{ background: q.difficulty === 'Junior' ? '#34d399' : q.difficulty === 'Mid' ? '#fbbf24' : '#f87171' }}
                    title={q.difficulty}
                  />
                  <span className="cl2-item-q">{q.question}</span>
                </div>
                <button
                  className={`cl2-check-btn ${checked ? 'checked' : ''}`}
                  onClick={() => onToggle(q.id)}
                  title={checked ? 'Mark incomplete' : 'Mark done'}
                >
                  {checked ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ) : null}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}

export default function ChecklistPage() {
  const [done, setDone] = useState(loadDone);
  const [expanded, setExpanded] = useState(new Set(['JavaScript']));

  // Only id / category / difficulty / question are needed here — a small lazy chunk,
  // not the full answer bank.
  const { value: allQuestions, error: loadError } = useLoaded('cards', loadQACards);
  const questionsByGroup = useMemo(() => {
    if (!allQuestions) return [];
    const byCategory = new Map();
    for (const q of allQuestions) {
      if (!byCategory.has(q.category)) byCategory.set(q.category, []);
      byCategory.get(q.category).push(q);
    }
    return GROUPS.map(g => ({ ...g, questions: byCategory.get(g.key) || [] })).filter(g => g.questions.length > 0);
  }, [allQuestions]);

  const totalQ = allQuestions ? allQuestions.length : 0;
  const doneCount = useMemo(() => (allQuestions ? allQuestions.filter(q => done.has(q.id)).length : 0), [allQuestions, done]);
  const overallPct = totalQ ? Math.round((doneCount / totalQ) * 100) : 0;

  const toggle = (id) => {
    setDone(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      saveDone(next);
      return next;
    });
  };

  const toggleExpand = (key) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const expandAll = () => setExpanded(new Set(GROUPS.map(g => g.key)));
  const collapseAll = () => setExpanded(new Set());

  const handleReset = () => {
    if (window.confirm('Reset all checklist progress?')) {
      setDone(new Set());
      localStorage.removeItem(STORAGE_KEY);
      notifyChange();
    }
  };

  if (loadError) {
    return (
      <main className="cl2-page">
        <p style={{ padding: 'calc(var(--header-h) + 48px) 24px', textAlign: 'center' }}>
          Couldn&apos;t load the checklist. Check your connection and <button className="cl2-ctrl-btn" onClick={() => window.location.reload()}>reload</button>.
        </p>
      </main>
    );
  }
  if (!allQuestions) return <div className="route-loading">Loading checklist…</div>;

  return (
    <main className="cl2-page">
      {/* Hero */}
      <section className="cl2-hero">
        <div className="cl2-hero-inner">
          <div className="cl2-hero-text">
            <span className="cl2-eyebrow">Interview Checklist</span>
            <h1>Track every question across all {questionsByGroup.length} categories.</h1>
            <p>
              Check off each question as you master it. Progress is saved locally in your browser.
              Expand a category to see all questions and mark them done.
            </p>
            <div className="cl2-hero-actions">
              <Link to="/interview-qa" className="cl2-btn cl2-btn-primary">Open Q&A →</Link>
              <button className="cl2-btn cl2-btn-ghost" onClick={handleReset}>Reset progress</button>
            </div>
          </div>

          {/* Big ring */}
          <div className="cl2-hero-ring">
            <div className="cl2-ring-outer">
              <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="80" cy="80" r="68" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                <circle
                  cx="80" cy="80" r="68" fill="none"
                  stroke="url(#ringGrad)" strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 68}
                  strokeDashoffset={2 * Math.PI * 68 * (1 - overallPct / 100)}
                  style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
                />
                <defs>
                  <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#00ffd1" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="cl2-ring-label">
                <span className="cl2-ring-pct">{overallPct}%</span>
                <span className="cl2-ring-sub">{doneCount}/{totalQ}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category progress strip */}
        <div className="cl2-cat-strip">
          {questionsByGroup.map(g => {
            const cnt = g.questions.filter(q => done.has(q.id)).length;
            const p = g.questions.length ? Math.round((cnt / g.questions.length) * 100) : 0;
            return (
              <button
                key={g.key}
                className="cl2-cat-chip"
                style={{ '--ca': g.accent }}
                onClick={() => {
                  setExpanded(new Set([g.key]));
                  setTimeout(() => document.getElementById(`group-${g.key}`)
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
                }}
              >
                <span className="cl2-cat-chip-icon">{g.icon}</span>
                <span className="cl2-cat-chip-name">{g.key}</span>
                <span className="cl2-cat-chip-pct" style={{ color: g.accent }}>{p}%</span>
                <div className="cl2-cat-chip-bar">
                  <div className="cl2-cat-chip-fill" style={{ width: `${p}%`, background: g.accent }} />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Controls */}
      <div className="cl2-controls">
        <span className="cl2-controls-label">{questionsByGroup.length} categories · {totalQ} questions</span>
        <div className="cl2-controls-right">
          <button className="cl2-ctrl-btn" onClick={expandAll}>Expand all</button>
          <button className="cl2-ctrl-btn" onClick={collapseAll}>Collapse all</button>
        </div>
      </div>

      {/* Group cards */}
      <div className="cl2-groups">
        {questionsByGroup.map(g => (
          <div key={g.key} id={`group-${g.key}`}>
            <GroupCard
              group={g}
              questions={g.questions}
              done={done}
              onToggle={toggle}
              isExpanded={expanded.has(g.key)}
              onToggleExpand={() => toggleExpand(g.key)}
            />
          </div>
        ))}
      </div>
    </main>
  );
}
