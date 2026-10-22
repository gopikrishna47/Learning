// ─────────────────────────────────────────────────────────────────
// Priority scoring for the Interview Q&A "⭐ Priority Order" toggle.
//
// This runs entirely client-side (no data-file changes needed) and
// blends three signals per question, all derived from data that is
// already in each Q&A item:
//
//   • recency    – how recently the question was added to this topic.
//                  Newer entries (higher `id` within the current topic's
//                  list) score higher — useful since new questions get
//                  appended as the bank is expanded.
//   • frequency  – how often this *kind* of question tends to come up
//                  in real interviews, estimated by matching the
//                  question/answer/highlights text against a curated
//                  list of high-frequency interview terms.
//   • importance – how "must-know" / core the concept is, estimated the
//                  same way against a separate list of architecture,
//                  trade-off and best-practice terms, plus a difficulty
//                  weighting (Senior-tagged questions skew "important").
//
// The three signals are blended into `total` for sorting, and also kept
// separate so the UI can show small "why this is high up" badges.
// ─────────────────────────────────────────────────────────────────

const FREQUENT_TERMS = [
  'hashmap', 'arraylist', 'linkedlist', 'equals', 'hashcode', 'singleton',
  'multithread', 'synchronized', 'exception', 'interface', 'abstract class',
  'collection', 'stream', 'lambda', 'rest api', 'microservice',
  'dependency injection', 'spring boot', 'autowired', 'hibernate', 'jpa',
  'join', 'index', 'transaction', 'closure', 'promise', 'async', 'event loop',
  'virtual dom', 'hooks', 'usestate', 'useeffect', 'redux', 'lifecycle',
  'normalization', 'acid', 'concurrency', 'garbage collection',
  'immutability', 'string pool', 'polymorphism', 'inheritance',
  'encapsulation', 'overload', 'override', 'var, let', 'this keyword',
  'sql query', 'primary key', 'foreign key',
];

const IMPORTANT_TERMS = [
  'trade-off', 'tradeoff', 'scalability', 'performance', 'architecture',
  'production', 'design pattern', 'solid', 'security', 'best practice',
  'real-world', 'real world', 'system design', 'thread safety',
  'memory leak', 'optimization', 'microservices', 'load balanc', 'caching',
  'database design', 'race condition', 'deadlock', 'idempoten',
];

const DIFFICULTY_FREQUENCY_BOOST  = { Junior: 0.05, Mid: 0.15, Senior: 0 };
const DIFFICULTY_IMPORTANCE_BOOST = { Junior: 0, Mid: 0.05, Senior: 0.15 };

function countHits(haystack, terms) {
  let hits = 0;
  for (const t of terms) if (haystack.includes(t)) hits++;
  return hits;
}

export function scoreItem(item, minId, maxId) {
  const text = `${item.question || ''} ${item.answer || ''} ${(item.highlights || []).join(' ')}`.toLowerCase();

  const freqHits = countHits(text, FREQUENT_TERMS);
  const impHits  = countHits(text, IMPORTANT_TERMS);

  const frequency  = Math.min(1, freqHits / 3 + (DIFFICULTY_FREQUENCY_BOOST[item.difficulty] || 0));
  const importance = Math.min(1, impHits / 2 + (DIFFICULTY_IMPORTANCE_BOOST[item.difficulty] || 0));

  const range   = Math.max(1, maxId - minId);
  const recency = ((item.id ?? minId) - minId) / range; // 0 = oldest in topic, 1 = newest

  const total = 0.4 * recency + 0.35 * frequency + 0.25 * importance;

  return { recency, frequency, importance, total };
}

// Returns [{ item, score }] sorted highest-priority first.
export function rankByPriority(items) {
  if (!items.length) return [];
  const ids   = items.map(i => i.id ?? 0);
  const minId = Math.min(...ids);
  const maxId = Math.max(...ids);

  return items
    .map(item => ({ item, score: scoreItem(item, minId, maxId) }))
    .sort((a, b) => b.score.total - a.score.total || (b.item.id ?? 0) - (a.item.id ?? 0));
}
