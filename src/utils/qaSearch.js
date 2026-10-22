// Builds (and caches) one lowercase search string per Q&A item, including
// the long-form explanation and real-world example blocks of guide items.

const cache = new WeakMap();

function blocksText(blocks = []) {
  return blocks
    .map((block) => {
      switch (block[0]) {
        case 'ul': case 'ol': return block[1].join(' ');
        case 'code': return block[2];
        case 'table': return [...block[1], ...block[2].flat()].join(' ');
        default: return block[1];
      }
    })
    .join(' ');
}

export function qaSearchText(item) {
  let text = cache.get(item);
  if (text === undefined) {
    text = [item.question, item.answer, blocksText(item.body), blocksText(item.realWorld)]
      .join(' ')
      .toLowerCase();
    cache.set(item, text);
  }
  return text;
}

export const matchesQuery = (item, query) => !query || qaSearchText(item).includes(query.toLowerCase());
