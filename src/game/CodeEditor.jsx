import React, { useMemo, useRef } from 'react';
import { highlightJs } from '../utils/highlight.js';

/**
 * A dependency-free code editor: a transparent <textarea> on top of a syntax-highlighted
 * <pre>. Supports Tab / Shift+Tab indentation, smart Enter indentation and Ctrl/⌘+Enter to run.
 */
export default function CodeEditor({ value, onChange, onRun, readOnly = false, ariaLabel = 'Code editor' }) {
  const taRef = useRef(null);
  const preRef = useRef(null);
  const gutterRef = useRef(null);

  const html = useMemo(() => `${highlightJs(value)}\n`, [value]);
  const lineCount = useMemo(() => value.split('\n').length, [value]);
  const gutter = useMemo(() => Array.from({ length: lineCount }, (_, i) => i + 1).join('\n'), [lineCount]);

  const sync = () => {
    const ta = taRef.current;
    if (!ta) return;
    if (preRef.current) { preRef.current.scrollTop = ta.scrollTop; preRef.current.scrollLeft = ta.scrollLeft; }
    if (gutterRef.current) gutterRef.current.scrollTop = ta.scrollTop;
  };

  // execCommand keeps the browser's native undo stack and fires a normal input event.
  const insert = (text) => {
    const ta = taRef.current;
    ta.focus();
    if (!document.execCommand || !document.execCommand('insertText', false, text)) {
      const { selectionStart: start, selectionEnd: end } = ta;
      ta.setRangeText(text, start, end, 'end');
      onChange(ta.value);
    }
  };

  const onKeyDown = (event) => {
    if (readOnly) return;
    const ta = taRef.current;
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      if (onRun) onRun();
      return;
    }
    if (event.key === 'Tab') {
      event.preventDefault();
      const { selectionStart: start, selectionEnd: end, value: text } = ta;
      const multiLine = text.slice(start, end).includes('\n');
      if (!event.shiftKey && !multiLine) { insert('  '); return; }
      // (un)indent every selected line
      const lineStart = text.lastIndexOf('\n', start - 1) + 1;
      const block = text.slice(lineStart, end);
      const changed = block
        .split('\n')
        .map((line) => (event.shiftKey ? line.replace(/^ {1,2}/, '') : `  ${line}`))
        .join('\n');
      ta.setSelectionRange(lineStart, end);
      insert(changed);
      ta.setSelectionRange(lineStart, lineStart + changed.length);
      return;
    }
    if (event.key === 'Enter' && !event.shiftKey && !event.altKey) {
      const { selectionStart: start, value: text } = ta;
      const lineStart = text.lastIndexOf('\n', start - 1) + 1;
      const indent = (text.slice(lineStart, start).match(/^\s*/) || [''])[0];
      const before = text[start - 1];
      const after = text[start];
      const extra = /[{([]/.test(before || '') ? '  ' : '';
      if (indent || extra) {
        event.preventDefault();
        const closing = extra && /[})\]]/.test(after || '') ? `\n${indent}` : '';
        insert(`\n${indent}${extra}${closing}`);
        if (closing) ta.setSelectionRange(ta.selectionStart - closing.length, ta.selectionStart - closing.length);
      }
    }
  };

  return (
    <div className={`gm-editor ${readOnly ? 'is-readonly' : ''}`}>
      <pre ref={gutterRef} className="gm-editor-gutter" aria-hidden="true">{gutter}</pre>
      <div className="gm-editor-body">
        <pre ref={preRef} className="gm-editor-pre" aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />
        <textarea
          ref={taRef}
          className="gm-editor-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onScroll={sync}
          onKeyDown={onKeyDown}
          readOnly={readOnly}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          aria-label={ariaLabel}
          wrap="off"
        />
      </div>
    </div>
  );
}
