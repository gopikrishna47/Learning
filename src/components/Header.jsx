import React, { useState, useEffect, useMemo, useRef, useDeferredValue } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TOPICS, topicForSection } from '../constants/topics.js';
import { QA_TOTAL } from '../constants/generated/catalog.js';
import { loadQAIds, loadSearchIndex } from '../data/index.js';
import useLoaded from '../hooks/useLoaded.js';

const QA_STORAGE_KEY = 'qa_checklist_v2';
export const QA_CHANGE_EVENT = 'qa-checklist-change';

function getQADoneCount(validIds) {
  try {
    const stored = JSON.parse(localStorage.getItem(QA_STORAGE_KEY) || '[]');
    if (!Array.isArray(stored)) return 0;
    return new Set(stored.filter(id => !validIds || validIds.has(id))).size;
  } catch { return 0; }
}

const TOPIC_LINKS = TOPICS.map(t => ({ to: t.route, icon: t.icon, label: t.navLabel || t.label }));

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showResults, setShowResults] = useState(false);
  const [showTopics, setShowTopics] = useState(false);
  const [qaCount, setQaCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [wantSearchIndex, setWantSearchIndex] = useState(false);
  const searchWrapRef = useRef(null);
  const topicsRef = useRef(null);
  const totalQA = QA_TOTAL;
  const isQaActive = location.pathname === '/interview-qa' || location.pathname === '/qa';

  // Search state lives here (not in Redux / App) so typing re-renders only the header.
  // The search index is a small lazy chunk, fetched the first time the box is used.
  const { value: searchIndex, loading: searchLoading } = useLoaded(wantSearchIndex ? 'search' : null, loadSearchIndex);
  const deferredQuery = useDeferredValue(searchQuery);
  const searchResults = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q || !searchIndex) return [];
    return searchIndex.filter((section) => section.h.includes(q)).slice(0, 30);
  }, [deferredQuery, searchIndex]);

  // Only the ids are needed here (to ignore stale ids in localStorage) — tiny lazy chunk.
  const { value: qaIdList } = useLoaded('qa-ids', loadQAIds);
  const validQaIds = useMemo(() => (qaIdList ? new Set(qaIdList) : null), [qaIdList]);

  useEffect(() => {
    const sync = () => setQaCount(getQADoneCount(validQaIds));
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener(QA_CHANGE_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(QA_CHANGE_EVENT, sync);
    };
  }, [validQaIds]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { setShowResults(false); setShowTopics(false); } };
    const onOut = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) setShowResults(false);
      if (topicsRef.current && !topicsRef.current.contains(e.target)) setShowTopics(false);
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onOut);
    return () => { window.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onOut); };
  }, []);

  // Close topic dropdown on route change
  useEffect(() => { setShowTopics(false); }, [location.pathname]);

  const isTopicActive = TOPIC_LINKS.some(l => location.pathname === l.to);

  return (
    <header id="site-header">
      <div className="header-inner">
        {/* Logo */}
        <Link to="/" className="logo" onClick={() => setSearchQuery('')}>
          <span className="logo-icon">🚀</span>
          <span className="logo-text">Full Stack <span className="logo-accent">Dev</span></span>
        </Link>

        {/* Nav */}
        <nav className="header-nav" aria-label="Primary navigation">
          <Link to="/" className={`header-nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>

          {/* Topics dropdown */}
          <div className="hn-dropdown" ref={topicsRef}>
            <button
              className={`header-nav-link hn-dropdown-btn ${isTopicActive ? 'active' : ''}`}
              onClick={() => setShowTopics(v => !v)}
            >
              Topics <span className="hn-caret">{showTopics ? '▴' : '▾'}</span>
            </button>
            {showTopics && (
              <div className="hn-dropdown-menu">
                {TOPIC_LINKS.map(({ to, icon, label }) => (
                  <Link key={to} to={to}
                    className={`hn-dropdown-item ${location.pathname === to ? 'active' : ''}`}>
                    <span className="hn-di-icon">{icon}</span>
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/interview-qa" className={`header-nav-link ${isQaActive ? 'active' : ''}`}>
            Interview Q&amp;A
          </Link>

          <Link to="/checklist"
            className={`header-nav-link ${location.pathname === '/checklist' ? 'active' : ''}`}>
            Checklist
          </Link>

          <Link to="/game"
            className={`header-nav-link header-nav-game ${location.pathname.startsWith('/game') ? 'active' : ''}`}>
            🎮 Game
          </Link>
        </nav>

        {/* Search + CTA */}
        <div className="header-controls">
          <Link
            to="/interview-qa"
            className={`btn-checklist header-qa-shortcut ${isQaActive ? 'active' : ''}`}
            aria-label="Interview Q&A"
          >
            Q&amp;A
          </Link>
          <div className="search-wrap" ref={searchWrapRef}>
            <span className="search-icon">🔍</span>
            <input
              id="search-input"
              type="text"
              placeholder="Search concepts… (Ctrl+K)"
              autoComplete="off"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setShowResults(e.target.value !== ''); }}
              onFocus={() => { setWantSearchIndex(true); if (searchQuery) setShowResults(true); }}
            />
            {showResults && (
              <div id="search-results" className="search-results">
                {searchResults.length > 0 ? searchResults.map(result => (
                  <div key={result.id} className="search-result-item"
                    onMouseDown={() => {
                      const topic = topicForSection(result.id);
                      if (topic) navigate({ pathname: topic.route, hash: `#s${result.id}` });
                      setShowResults(false); setSearchQuery('');
                    }}>
                    <div className="sri-color-dot" style={{ backgroundColor: result.color }} />
                    <div className="sri-num">#{result.id}</div>
                    <div>
                      <div className="sri-title">{result.title}</div>
                      <div className="sri-sub">{result.sub}</div>
                    </div>
                  </div>
                )) : (
                  <div className="search-no-results">
                    {searchLoading || deferredQuery !== searchQuery ? 'Searching…' : 'No results found'}
                  </div>
                )}
              </div>
            )}
          </div>

          <button className="btn-game" onClick={() => navigate('/game')} aria-label="Open the Code Quest game">
            🎮 <span>Game</span>
          </button>

          <button className="btn-checklist" onClick={() => navigate('/checklist')}>
            <span id="checklist-count">{qaCount}/{totalQA}</span> Checklist
          </button>
        </div>
      </div>
    </header>
  );
}
