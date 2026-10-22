import React from 'react';

/** Tiny inline formatter for level text: `code` → <code>, **bold** → <strong>, blank line → new paragraph. */
export default function Rich({ text, block = false }) {
  const paragraphs = String(text).split(/\n{2,}/);
  const inline = (chunk, key) =>
    chunk.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) return <code key={`${key}-${i}`}>{part.slice(1, -1)}</code>;
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) return <strong key={`${key}-${i}`}>{part.slice(2, -2)}</strong>;
      return part.split('\n').flatMap((line, j) => (j === 0 ? [line] : [<br key={`${key}-${i}-${j}`} />, line]));
    });
  if (!block && paragraphs.length === 1) return <>{inline(paragraphs[0], 0)}</>;
  return <>{paragraphs.map((p, i) => <p key={i}>{inline(p, i)}</p>)}</>;
}
