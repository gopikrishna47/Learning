import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

export default function ChecklistPanel({
  isOpen,
  onClose,
  sections,
  completed,
  onToggleComplete,
  onReset,
}) {
  const progressFillRef = useRef(null);
  const percentRef = useRef(null);
  const reduxCompleted = useSelector((state) => state.checklist.completed);
  const completedData = completed || reduxCompleted;
  const completedSet = completedData instanceof Set ? completedData : new Set();
  const sectionIds = new Set(sections.map((section) => section.id));
  const completedCount = [...completedSet].filter((id) => sectionIds.has(id)).length;

  useEffect(() => {
    const percentage = Math.round((completedCount / Math.max(sections.length, 1)) * 100);
    if (progressFillRef.current) {
      progressFillRef.current.style.width = `${percentage}%`;
    }
    if (percentRef.current) {
      percentRef.current.textContent = `${percentage}% complete`;
    }
  }, [completedCount, sections.length]);

  return (
    <>
      <button
        type="button"
        className={`floating-checklist-btn ${isOpen ? 'active' : ''}`}
        onClick={() => (isOpen ? onClose() : onClose())}
        aria-label="Toggle checklist"
      >
        <span>☑</span>
        <strong>{completedCount}</strong>
      </button>
      <div id="checklist-overlay" className={isOpen ? '' : 'hidden'} onClick={onClose} />
      <div className={`checklist-panel ${isOpen ? '' : 'hidden'}`} role="dialog" aria-modal="true">
        <div className="checklist-header">
          <div>
            <h3>📋 Progress Checklist</h3>
            <p className="checklist-subtitle">Track your interview prep in one place</p>
          </div>
          <button id="close-checklist" onClick={onClose} aria-label="Close checklist">
            ✕
          </button>
        </div>
        <div className="checklist-progress-bar">
          <div id="cl-progress-fill" ref={progressFillRef} />
        </div>
        <div id="cl-percent" ref={percentRef}>
          0% complete
        </div>
        <ul id="checklist-items">
          {sections.map((section) => (
            <li
              key={section.id}
              className={`cl-item ${completedSet.has(section.id) ? 'done' : ''}`}
              onClick={() => onToggleComplete(section.id)}
            >
              <div className="cl-dot" style={{ backgroundColor: section.color }} />
              <div className="cl-item-meta">
                <div className="cl-item-title">{section.title}</div>
                <div className="cl-item-sub">{section.sub}</div>
              </div>
              <div className="cl-check">{completedSet.has(section.id) ? '✓' : ''}</div>
            </li>
          ))}
        </ul>
        <button id="reset-checklist" className="btn-reset" onClick={onReset}>
          Reset All
        </button>
      </div>
    </>
  );
}
