import { createStore, combineReducers } from 'redux';

// ── Persistence ──────────────────────────────────────────────────
export const COMPLETED_KEY = 'rcu_done';

function readCompleted() {
  try {
    const parsed = JSON.parse(localStorage.getItem(COMPLETED_KEY) || '[]');
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function writeCompleted(set) {
  try {
    if (set.size === 0) localStorage.removeItem(COMPLETED_KEY);
    else localStorage.setItem(COMPLETED_KEY, JSON.stringify([...set]));
  } catch {
    /* storage unavailable (private mode / quota) — progress just won't persist */
  }
}

// Action Types
const TOGGLE_COMPLETE = 'TOGGLE_COMPLETE';
const RESET_CHECKLIST = 'RESET_CHECKLIST';
const SET_COMPLETED = 'SET_COMPLETED';

// Initial States
const initialChecklistState = { completed: readCompleted() };

// Reducers (pure — persistence happens in store.subscribe below)
const checklistReducer = (state = initialChecklistState, action) => {
  switch (action.type) {
    case TOGGLE_COMPLETE: {
      const next = new Set(state.completed);
      if (next.has(action.payload)) next.delete(action.payload);
      else next.add(action.payload);
      return { ...state, completed: next };
    }
    case RESET_CHECKLIST:
      return { ...state, completed: new Set() };
    case SET_COMPLETED:
      return { ...state, completed: new Set(action.payload) };
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  checklist: checklistReducer,
});

export const store = createStore(rootReducer);

// Persist only when the completed set actually changes
let lastCompleted = store.getState().checklist.completed;
store.subscribe(() => {
  const current = store.getState().checklist.completed;
  if (current !== lastCompleted) {
    lastCompleted = current;
    writeCompleted(current);
  }
});

// Keep multiple tabs in sync
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === COMPLETED_KEY || e.key === null) {
      store.dispatch({ type: SET_COMPLETED, payload: [...readCompleted()] });
    }
  });
}

// Action Creators
export const toggleComplete = (id) => ({ type: TOGGLE_COMPLETE, payload: id });
export const resetChecklist = () => ({ type: RESET_CHECKLIST });
