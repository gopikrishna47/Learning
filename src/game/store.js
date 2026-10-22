import { useSyncExternalStore } from 'react';
import { WORLDS, LEVELS } from './levels/index.js';

// ─────────────────────────────────────────────────────────────────
//  Code Quest progress — one tiny external store, persisted to localStorage.
//    levels  { [levelId]: { stars, xp } }   best result per level
//    practice  when true every level is unlocked
//  Drafts (the code you are typing) live under their own key and do NOT notify
//  subscribers, so typing never re-renders the map or header stats.
// ─────────────────────────────────────────────────────────────────
const KEY = 'fsd_game_v1';
const DRAFT_KEY = 'fsd_game_drafts_v1';
const EMPTY = { levels: {}, practice: false };

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch { return fallback; }
}
function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode / quota — progress just won't persist */ }
}

let state = read(KEY, EMPTY);
const listeners = new Set();
const set = (next) => { state = next; write(KEY, state); listeners.forEach((fn) => fn()); };

export const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
export const getState = () => state;
export const useGame = () => useSyncExternalStore(subscribe, getState, getState);

// keep other tabs in sync
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === KEY) { state = read(KEY, EMPTY); listeners.forEach((fn) => fn()); }
  });
}

export const actions = {
  /** Keep the best stars/XP per level. Returns what changed so the UI can celebrate. */
  completeLevel(id, { stars, xp }) {
    const previous = state.levels[id];
    const better = !previous || xp > previous.xp || stars > previous.stars;
    const best = better ? { stars: Math.max(stars, previous?.stars || 0), xp: Math.max(xp, previous?.xp || 0) } : previous;
    set({ ...state, levels: { ...state.levels, [id]: best } });
    return { first: !previous, gained: Math.max(0, best.xp - (previous?.xp || 0)) };
  },
  setPractice(practice) { set({ ...state, practice }); },
  reset() { set({ ...EMPTY }); write(DRAFT_KEY, {}); },
};

export function getDraft(id) {
  return read(DRAFT_KEY, {})[id] || null;
}
export function saveDraft(id, draft) {
  write(DRAFT_KEY, { ...read(DRAFT_KEY, {}), [id]: draft });
}
export function clearDraft(id) {
  const all = read(DRAFT_KEY, {});
  delete all[id];
  write(DRAFT_KEY, all);
}

// ── derived helpers ─────────────────────────────────────────────
export function isUnlocked(level, s = state) {
  if (s.practice) return true;
  if (level.worldIndex > 0) {
    const previousWorld = WORLDS[level.worldIndex - 1];
    if (!s.levels[previousWorld.levels[previousWorld.levels.length - 1].id]) return false;
  }
  if (level.index === 0) return true;
  return Boolean(s.levels[WORLDS[level.worldIndex].levels[level.index - 1].id]);
}

export function summarize(s = state) {
  const done = LEVELS.filter((level) => s.levels[level.id]);
  return {
    xp: done.reduce((sum, level) => sum + s.levels[level.id].xp, 0),
    stars: done.reduce((sum, level) => sum + s.levels[level.id].stars, 0),
    cleared: done.length,
  };
}

export function nextLevel(level) {
  const flat = LEVELS.findIndex((l) => l.id === level.id);
  return LEVELS[flat + 1] || null;
}

/** The first unlocked level you have not cleared yet (for the "Continue" button). */
export function continueLevel(s = state) {
  return LEVELS.find((level) => !s.levels[level.id] && isUnlocked(level, s)) || null;
}
