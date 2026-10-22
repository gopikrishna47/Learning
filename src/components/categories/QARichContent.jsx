import React, { useMemo, useState } from 'react';
import { highlightJs } from '../../utils/highlight.js';

const HIGHLIGHTED_LANGS = new Set(['js', 'javascript', 'jsx', 'ts', 'typescript', 'tsx']);

/** Renders **bold** and `code` inline markers as React nodes (no raw HTML). */
function Inline({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('`')) return <code key={i} className="qa-inline-code">{part.slice(1, -1)}</code>;
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function CodeBlock({ lang, text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => navigator.clipboard.writeText(text).then(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  });
  const highlighted = HIGHLIGHTED_LANGS.has(lang?.toLowerCase());
  // Tokenise once per snippet — toggling "copied" re-renders this component.
  const html = useMemo(() => (highlighted ? highlightJs(text) : null), [highlighted, text]);
  return (
    <div className="qa-code-wrap">
      <div className="qa-code-label">
        <span>{lang || 'text'}</span>
        <button className="qa-copy-btn" onClick={copy}>{copied ? '✓ copied' : 'copy'}</button>
      </div>
      <pre className="qa-code">
        {highlighted
          ? <code dangerouslySetInnerHTML={{ __html: html }} />
          : <code>{text}</code>}
      </pre>
    </div>
  );
}

/** One structured block: paragraph, heading, list, code or table. */
function Block({ block }) {
  const [type, a, b] = block;
  switch (type) {
    case 'h': return <h4 className="qa-rich-heading">{a}</h4>;
    case 'p': return <p className="qa-rich-p"><Inline text={a} /></p>;
    case 'quote': return <blockquote className="qa-rich-quote"><Inline text={a} /></blockquote>;
    case 'ul': return <ul className="qa-rich-list">{a.map((x, i) => <li key={i}><Inline text={x} /></li>)}</ul>;
    case 'ol': return <ol className="qa-rich-list">{a.map((x, i) => <li key={i}><Inline text={x} /></li>)}</ol>;
    case 'code': return <CodeBlock lang={a} text={b} />;
    case 'table':
      return (
        <div className="qa-rich-table-wrap">
          <table className="qa-rich-table">
            {a.length > 0 && <thead><tr>{a.map((c, i) => <th key={i}><Inline text={c} /></th>)}</tr></thead>}
            <tbody>
              {b.map((row, r) => (
                <tr key={r}>{row.map((c, i) => <td key={i}><Inline text={c} /></td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default: return null;
  }
}

export const Blocks = ({ blocks }) => blocks.map((block, i) => <Block key={i} block={block} />);

/**
 * Long-form content for guide-based Q&A items:
 * a real-world example panel plus a collapsible full explanation.
 */
export default function QARichContent({ item }) {
  const [expanded, setExpanded] = useState(false);
  const hasBody = item.body?.length > 0;
  const hasRealWorld = item.realWorld?.length > 0;
  if (!hasBody && !hasRealWorld) return null;

  return (
    <div className="qa-rich">
      {hasRealWorld && (
        <div className="qa-realworld">
          <div className="qa-realworld-label">🌍 Real-world example</div>
          <Blocks blocks={item.realWorld.filter((b) => !(b[0] === 'h' && /^real[- ]?world( example)?$/i.test(b[1])))} />
        </div>
      )}
      {hasBody && (
        <>
          <button className="qa-rich-toggle" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
            {expanded ? '▲ Hide full explanation' : '▼ Read the full explanation'}
          </button>
          {expanded && <div className="qa-rich-body"><Blocks blocks={item.body} /></div>}
        </>
      )}
    </div>
  );
}
