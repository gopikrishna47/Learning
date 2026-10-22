// ─────────────────────────────────────────────────────────────────
//  data/index.js — on-demand access to the portal's content.
//
//  Content is split at build time (see build/generate-data.mjs) so a page
//  only downloads what it actually shows:
//    • one module per Q&A category      → loadQA(['React', 'TypeScript'])
//    • one module per topic's sections  → loadSections('react')
//    • a small search index             → loadSearchIndex()
//  Every loader is cached, so revisiting a page or prefetching is free.
// ─────────────────────────────────────────────────────────────────
import { QA_CATEGORIES } from '../constants/generated/catalog.js';

const qaLoaders = import.meta.glob('../constants/generated/qa/*.js');
const sectionLoaders = import.meta.glob('../constants/generated/sections/*.js');

const SLUG_BY_CATEGORY = Object.fromEntries(QA_CATEGORIES.map((c) => [c.key, c.slug]));
const cache = new Map();

function cached(key, load) {
  let promise = cache.get(key);
  if (!promise) {
    // Drop failed loads (offline, or a stale chunk after a redeploy) so a retry can succeed.
    promise = load().catch((error) => { cache.delete(key); throw error; });
    cache.set(key, promise);
  }
  return promise;
}

/** Full Q&A items of one category (original order). */
export function loadCategory(category) {
  const loader = qaLoaders[`../constants/generated/qa/${SLUG_BY_CATEGORY[category]}.js`];
  if (!loader) return Promise.resolve([]);
  return cached(`qa:${category}`, () => loader().then((m) => m.default));
}

/** Full Q&A items for several categories, merged back into authoring order. */
export async function loadQA(categories) {
  if (!categories.length) return [];
  const lists = await Promise.all(categories.map(loadCategory));
  return lists.length === 1 ? lists[0] : lists.flat().sort((a, b) => a._i - b._i);
}

export const loadAllQA = () => loadQA(QA_CATEGORIES.map((c) => c.key));

/** id → full item, for every Q&A (built once; used by cross-category search). */
export function loadQAIndex() {
  return cached('qa:index', async () => new Map((await loadAllQA()).map((item) => [item.id, item])));
}

/** A topic's study sections, in the topic's own order. */
export function loadSections(topicKey) {
  const loader = sectionLoaders[`../constants/generated/sections/${topicKey}.js`];
  if (!loader) return Promise.resolve([]);
  return cached(`sections:${topicKey}`, () => loader().then((m) => m.default));
}

export const loadSearchIndex = () =>
  cached('search', () => import('../constants/generated/search-index.js').then((m) => m.default));

export const loadQACards = () =>
  cached('qa-cards', () => import('../constants/generated/qa-cards.js').then((m) => m.default.map(
    ([id, category, difficulty, question, highlights]) => ({ id, category, difficulty, question, highlights }),
  )));

export const loadQAIds = () =>
  cached('qa-ids', () => import('../constants/generated/qa-ids.js').then((m) => m.default));

/** Warm the caches for a topic (hover/focus on a link, or browser idle time). */
export function prefetchTopic(topic, { qa = false } = {}) {
  loadSections(topic.key).catch(() => {});
  if (qa) loadQA(topic.qaCategories).catch(() => {});
}

export const whenIdle = (fn) => {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(fn, { timeout: 3000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(fn, 800);
  return () => window.clearTimeout(id);
};
