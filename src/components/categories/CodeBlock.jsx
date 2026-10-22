import React, { useState, useRef } from 'react';

export default function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef(null);

  const handleCopy = () => {
    const codeText = preRef.current?.querySelector('code')?.innerText || '';
    navigator.clipboard.writeText(codeText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <pre ref={preRef}>
      <code dangerouslySetInnerHTML={{ __html: code }} />
      <button
        className="copy-code-btn"
        onClick={handleCopy}
        style={{
          position: 'absolute',
          top: '8px',
          right: '40px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '4px',
          color: '#5c6370',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.62rem',
          padding: '2px 8px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          letterSpacing: '0.05em',
        }}
        onMouseEnter={(e) => (e.target.style.color = '#abb2bf')}
        onMouseLeave={(e) => (e.target.style.color = '#5c6370')}
      >
        {copied ? 'copied!' : 'copy'}
      </button>
    </pre>
  );
}
