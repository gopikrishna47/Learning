import React, { memo, useState, useRef, useEffect, useMemo, useDeferredValue } from 'react';
import { useLocation } from 'react-router-dom';
import CodeBlock from '../../components/categories/CodeBlock.jsx';
import ResourceLinks, { FileChips } from '../../components/categories/ResourceLinks.jsx';
import QARichContent from '../../components/categories/QARichContent.jsx';
import { matchesQuery } from '../../utils/qaSearch.js';
import BackToTop from '../../components/BackToTop.jsx';
import { rankByPriority } from '../../utils/priorityScore.js';
import { hexToRgb } from '../../constants/topics.js';
import { loadQA, whenIdle } from '../../data/index.js';
import useLoaded from '../../hooks/useLoaded.js';
import useIncremental from '../../hooks/useIncremental.js';

const EMPTY = [];

// ── Difficulty colours ────────────────────────────────────────────
const LVL_COLOR = { junior: '#34d399', mid: '#fbbf24', senior: '#f87171' };
const DIFF_COLOR = { Junior: '#34d399', Mid: '#fbbf24', Senior: '#f87171' };

// ── Concept accordion ─────────────────────────────────────────────
function ConceptAcc({ concept, color }) {
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);   // body is mounted lazily, on first open
  const bodyRef = useRef(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.style.maxHeight = open ? el.scrollHeight + 'px' : '0';
    el.style.opacity = open ? '1' : '0';
  }, [open]);

  return (
    <div className={`concept-acc ${open ? 'open' : ''}`} style={{ '--ca': color }}>
      <button className="concept-acc-head" onClick={() => { setEverOpened(true); setOpen(o => !o); }}>
        <h3 className="concept-acc-title">{concept.title}</h3>
        <span className={`concept-acc-chevron ${open ? 'up' : ''}`}>▾</span>
      </button>
      <div ref={bodyRef} className="concept-acc-body"
        style={{
          maxHeight: 0, opacity: 0, overflow: 'hidden',
          transition: 'max-height 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease'
        }}>
        {everOpened && <div className="concept-acc-inner">
          <FileChips files={concept.usedIn} />
          {concept.description?.map((d, i) => <p key={i} className="concept-acc-desc">{d}</p>)}
          {concept.list && (
            <ul className="concept-acc-list">
              {concept.list.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          )}
          {concept.code && <CodeBlock code={concept.code} />}
          {concept.interviewTip && (
            <div className="interview-tip" dangerouslySetInnerHTML={{ __html: concept.interviewTip }} />
          )}
          <ResourceLinks
            blogs={concept.blogs || (concept.blog ? [{ title: 'Read more on this topic', url: concept.blog }] : [])}
            videos={concept.videos}
          />
        </div>}
      </div>
    </div>
  );
}

// ── Section card ──────────────────────────────────────────────────
const SectionCard = memo(function SectionCard({ section, isCompleted, onToggle, autoOpen = false }) {
  const [expanded, setExpanded] = useState(autoOpen);
  const [everOpened, setEverOpened] = useState(autoOpen);  // concepts mount on first open only
  const bodyRef = useRef(null);
  const cardRef = useRef(null);

  // Deep-link from search (#s<id>): open the card and scroll it into view.
  useEffect(() => {
    if (!autoOpen) return undefined;
    setEverOpened(true);
    setExpanded(true);
    const t = setTimeout(() => cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    return () => clearTimeout(t);
  }, [autoOpen]);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.style.maxHeight = expanded ? el.scrollHeight + 3000 + 'px' : '0';
    el.style.opacity = expanded ? '1' : '0';
  }, [expanded]);

  const recalc = () => {
    const el = bodyRef.current;
    if (el && expanded) el.style.maxHeight = el.scrollHeight + 3000 + 'px';
  };

  return (
    <div
      ref={cardRef}
      className={`topic-card ${isCompleted ? 'completed' : ''}`}
      id={`s${section.id}`}
      style={{ '--tc': section.color, '--tc-rgb': hexToRgb(section.color) }}
    >
      <div className="topic-card-head">
        <button
          type="button"
          className="topic-card-toggle"
          aria-expanded={expanded}
          aria-controls={`topic-card-body-${section.id}`}
          onClick={() => { setEverOpened(true); setExpanded(e => !e); }}
        >
          <div className="topic-card-num">{String(section.id).padStart(2, '0')}</div>
          <div className="topic-card-meta">
            <h2 className="topic-card-title">{section.title}</h2>
            <p className="topic-card-sub">{section.sub}</p>
          </div>
          <span className="topic-card-level"
            style={{
              color: LVL_COLOR[section.level] || '#888',
              background: `${LVL_COLOR[section.level]}18`,
              border: `1px solid ${LVL_COLOR[section.level]}33`
            }}>
            {section.level.toUpperCase()}
          </span>
          <span className={`topic-card-chevron ${expanded ? 'up' : ''}`}>▾</span>
        </button>
        <button
          type="button"
          className={`topic-card-check ${isCompleted ? 'done' : ''}`}
          aria-pressed={isCompleted}
          onClick={() => onToggle(section.id)}
          title="Mark complete"
        >{isCompleted ? '☑' : '☐'}</button>
      </div>

      <div id={`topic-card-body-${section.id}`} ref={bodyRef} className="topic-card-body"
        style={{
          maxHeight: 0, opacity: 0, overflow: 'hidden',
          transition: 'max-height 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.28s ease'
        }}
        onClick={recalc}>
        <div className="topic-card-inner">
          {everOpened && section.concepts?.map((c, i) => (
            <ConceptAcc key={i} concept={c} color={section.color} />
          ))}
        </div>
      </div>
    </div>
  );
});

// ── Q&A card ─────────────────────────────────────────────────────
const QACard = memo(function QACard({ item, accent, score }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(item.code || '').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  // Only shown while "Priority Order" is active (score is non-null then)
  const badges = [];
  if (score) {
    if (score.recency >= 0.66) badges.push({ label: '🆕 Recently Added', cls: 'recent' });
    if (score.frequency >= 0.5) badges.push({ label: '🔥 Frequently Asked', cls: 'frequent' });
    if (score.importance >= 0.5) badges.push({ label: '⭐ Must-Know', cls: 'important' });
  }

  return (
    <div className={`qa-card ${open ? 'open' : ''}`} style={{ '--card-accent': accent }}>
      <div className="qa-card-head" onClick={() => setOpen(o => !o)}>
        <div className="qa-card-meta">
          <span className="qa-card-diff"
            style={{ '--diff-c': DIFF_COLOR[item.difficulty] || '#888' }}>
            {item.difficulty}
          </span>
          <span style={{ fontSize: '0.7rem', color: '#666', marginLeft: 8 }}>#{item.id}</span>
          {badges.map(b => (
            <span key={b.cls} className={`qa-priority-badge ${b.cls}`}>{b.label}</span>
          ))}
        </div>
        <p className="qa-card-question">{item.question}</p>
        <div className="qa-card-pills">
          {item.highlights?.slice(0, 3).map(h => (
            <span key={h} className="qa-card-pill">{h}</span>
          ))}
        </div>
        <span className={`qa-card-chevron ${open ? 'up' : ''}`}>▾</span>
      </div>
      {open && (
        <div className="qa-card-body">
          <div className="qa-card-answer">{item.answer}</div>
          <QARichContent item={item} />
          {item.code && (
            <div className="qa-code-wrap">
              <div className="qa-code-label">
                <span>{item.category}</span>
                <button className="qa-copy-btn" onClick={handleCopy}>
                  {copied ? '✓ copied' : 'copy'}
                </button>
              </div>
              <pre className="qa-code"><code>{item.code}</code></pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

// ── Main layout ───────────────────────────────────────────────────
export default function TopicPageLayout({
  icon, title, subtitle, color, accentRgb,
  sections, qaCategories, qaCount, completed, onToggle, defaultTab = 'learn',
}) {
  const [tab, setTab] = useState(defaultTab);   // 'learn' | 'qa'
  const [levelFilter, setLvl] = useState('all');
  const [diffFilter, setDiff] = useState('All');
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);  // keep typing responsive while big lists re-filter
  const [sortMode, setSortMode] = useState('default');  // 'default' | 'priority'

  // Q&A content is fetched only when the Q&A tab is opened (and pre-warmed when
  // the browser is idle), so the default "Learning Topics" view loads fastest.
  const qaKey = qaCategories.join('|');
  const qaLoad = useLoaded(tab === 'qa' && qaCategories.length ? qaKey : null, () => loadQA(qaCategories));
  const qaItems = qaLoad.value || EMPTY;
  useEffect(() => {
    if (tab !== 'learn' || !qaCategories.length) return undefined;
    return whenIdle(() => { loadQA(qaCategories).catch(() => {}); });
  }, [tab, qaKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const { hash } = useLocation();
  const targetId = /^#s\d+$/.test(hash) ? Number(hash.slice(2)) : null;

  const LEVELS = ['all', 'junior', 'mid', 'senior'];
  const DIFFS = ['All', 'Junior', 'Mid', 'Senior'];

  const filteredSections = useMemo(() => sections.filter(s => {
    const lvl = levelFilter === 'all' || s.level === levelFilter;
    const q = deferredSearch.toLowerCase();
    const srch = !q || s.title.toLowerCase().includes(q) || s.sub.toLowerCase().includes(q);
    return lvl && srch;
  }), [sections, levelFilter, deferredSearch]);

  const filteredQA = useMemo(() => {
    const text = deferredSearch.toLowerCase();
    return qaItems.filter(q => (diffFilter === 'All' || q.difficulty === diffFilter) && matchesQuery(q, text));
  }, [qaItems, diffFilter, deferredSearch]);

  // When "Priority Order" is on, re-rank the filtered questions by the
  // recency / frequency / importance blend (see utils/priorityScore.js).
  // Otherwise keep the original authored order with no score attached.
  const rankedQA = useMemo(() => {
    if (sortMode !== 'priority') return filteredQA.map(item => ({ item, score: null }));
    return rankByPriority(filteredQA);
  }, [filteredQA, sortMode]);

  // Render long Q&A lists progressively instead of mounting hundreds of cards at once
  const qaView = useIncremental(rankedQA.length, `${diffFilter}|${deferredSearch}|${sortMode}|${qaKey}`, 40);

  const doneCount = sections.filter(s => completed.has(s.id)).length;
  const totalCount = sections.length;
  const pct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <main className="tp-page" style={{
      '--tp-accent': color, '--tp-rgb': accentRgb,
      padding: 'calc(var(--header-h) + 24px) 24px 80px', maxWidth: 1100, margin: '0 auto'
    }}>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="tp-hero">
        <div className="tp-hero-left">
          <span className="tp-eyebrow">{icon} {title}</span>
          <h1 className="tp-title">{title}</h1>
          <p className="tp-sub">{subtitle}</p>
        </div>
        <div className="tp-hero-stats">
          <div className="tp-stat"><span>{totalCount}</span><label>Topics</label></div>
          <div className="tp-stat"><span>{doneCount}</span><label>Done</label></div>
          <div className="tp-stat"><span>{pct}%</span><label>Progress</label></div>
          <div className="tp-stat"><span>{qaCount}</span><label>Q&amp;As</label></div>
        </div>
      </div>

      {/* ── Progress bar ─────────────────────────────────────── */}
      <div className="tp-progress-bar">
        <div className="tp-progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>

      {/* ── Tab switcher ─────────────────────────────────────── */}
      <div className="tp-tabs">
        <button className={`tp-tab ${tab === 'learn' ? 'active' : ''}`}
          onClick={() => setTab('learn')} style={{ '--tab-c': color }}>
          📚 Learning Topics <span className="tp-tab-count">{totalCount}</span>
        </button>
        <button className={`tp-tab ${tab === 'qa' ? 'active' : ''}`}
          onClick={() => setTab('qa')} style={{ '--tab-c': color }}>
          💬 Interview Q&amp;A <span className="tp-tab-count">{qaCount}</span>
        </button>
      </div>

      {/* ── Shared search ────────────────────────────────────── */}
      <div className="tp-controls">
        <div className="tp-search-wrap">
          <span className="tp-search-icon">🔍</span>
          <input className="tp-search" type="text" placeholder="Search..."
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="tp-search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>

        {tab === 'learn' ? (
          <div className="tp-filter-btns">
            {LEVELS.map(l => (
              <button key={l}
                className={`tp-filter-btn ${levelFilter === l ? 'active' : ''}`}
                style={levelFilter === l ? { '--fb-c': color } : {}}
                onClick={() => setLvl(l)}>
                {l === 'all' ? 'All' : l.charAt(0).toUpperCase() + l.slice(1)}
              </button>
            ))}
          </div>
        ) : (
          <div className="tp-filter-btns">
            {DIFFS.map(d => (
              <button key={d}
                className={`tp-filter-btn ${diffFilter === d ? 'active' : ''}`}
                style={diffFilter === d && d !== 'All' ? { '--fb-c': DIFF_COLOR[d] } : {}}
                onClick={() => setDiff(d)}>
                {d}
              </button>
            ))}
            <button
              className={`tp-priority-btn ${sortMode === 'priority' ? 'active' : ''}`}
              onClick={() => setSortMode(m => m === 'priority' ? 'default' : 'priority')}
              title="Sort by recently added + frequently asked + most important">
              ⭐ Priority Order
            </button>
          </div>
        )}

        <span className="tp-count">
          {tab === 'learn'
            ? `${filteredSections.length} topics`
            : `${qaLoad.value ? filteredQA.length : qaCount} questions`}
        </span>
      </div>

      {/* ── Content panels ───────────────────────────────────── */}
      {tab === 'learn' ? (
        <div className="tp-sections">
          {filteredSections.length === 0 ? (
            <div className="lp-empty">
              <span>🔎</span><p>No topics match your filters.</p>
              <button onClick={() => { setSearch(''); setLvl('all'); }}>Clear filters</button>
            </div>
          ) : (
            filteredSections.map(s => (
              <SectionCard key={s.id} section={s}
                isCompleted={completed.has(s.id)}
                autoOpen={s.id === targetId}
                onToggle={onToggle} />
            ))
          )}
        </div>
      ) : (
        <div className="tp-qa" style={{ '--active-accent': color }}>
          {sortMode === 'priority' && rankedQA.length > 0 && (
            <p className="tp-priority-hint">
              ⭐ Sorted by <strong>recently added</strong> → <strong>frequently asked</strong> → <strong>most important</strong> first.
            </p>
          )}
          {qaLoad.error ? (
            <div className="lp-empty">
              <span>⚠️</span><p>Couldn&apos;t load the questions. Check your connection and try again.</p>
              <button onClick={() => window.location.reload()}>Reload</button>
            </div>
          ) : qaLoad.loading ? (
            <div className="route-loading">Loading questions…</div>
          ) : rankedQA.length === 0 ? (
            <div className="lp-empty">
              <span>🔎</span><p>No questions match your filters.</p>
              <button onClick={() => { setSearch(''); setDiff('All'); }}>Clear filters</button>
            </div>
          ) : (
            <div className="qa-cards">
              {rankedQA.slice(0, qaView.count).map(({ item, score }) => (
                <QACard key={item.id} item={item} accent={color} score={score} />
              ))}
              {qaView.hasMore && <div ref={qaView.sentinelRef} className="qa-sentinel" aria-hidden="true" />}
            </div>
          )}
        </div>
      )}

      <BackToTop />
    </main>
  );
}
