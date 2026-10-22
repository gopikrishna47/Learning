// ─────────────────────────────────────────────────────────────────
//  Curated YouTube channels (Tamil + Indian-English teachers).
//  Links are YouTube *searches* scoped to the channel name, so they never
//  go stale when a video is re-uploaded or removed.
// ─────────────────────────────────────────────────────────────────

export const CHANNELS = {
  emc:        { name: 'Error Makes Clever', lang: 'ta' },
  tutorjoes:  { name: 'Tutor Joes',         lang: 'ta' },
  codeio:     { name: 'code io - Tamil',    lang: 'ta' },
  logicfirst: { name: 'Logic First Tamil',  lang: 'ta' },
  akshay:     { name: 'Akshay Saini',       lang: 'en-IN' },
  telusko:    { name: 'Telusko',            lang: 'en-IN' },
};

export const LANG_LABEL = { ta: 'தமிழ்', 'en-IN': 'Indian English' };

/** Two Tamil + two Indian-English channels — the default learning mix. */
export const DEFAULT_CHANNELS = ['emc', 'tutorjoes', 'telusko', 'akshay'];

export const youtubeSearchUrl = (query) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

/**
 * Build the `videos` array for a concept.
 * @param {string} topic      what to search for, e.g. "JavaScript promises"
 * @param {string[]} [keys]   channel keys from CHANNELS
 */
export function videos(topic, keys = DEFAULT_CHANNELS) {
  return keys.map((key) => {
    const { name, lang } = CHANNELS[key];
    const query = lang === 'ta' ? `${topic} tamil ${name}` : `${topic} ${name}`;
    return { channel: name, lang, title: topic, url: youtubeSearchUrl(query) };
  });
}
