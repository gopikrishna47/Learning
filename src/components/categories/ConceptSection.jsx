import React, { useEffect, useRef } from 'react';
import CodeBlock from './CodeBlock';

export default function ConceptSection({ section, isCompleted, onToggleComplete }) {
  const sectionRef = useRef(null);

  useEffect(() => {
    const nodes = sectionRef.current?.querySelectorAll('.concept-card') || [];
    nodes.forEach((card) => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    });
  }, []);

  const getLevelColor = (level) => {
    const colors = {
      junior: '#34d399',
      mid: '#fbbf24',
      senior: '#f87171',
    };
    return colors[level] || '#fff';
  };

  // Parse description to extract code blocks and other content
  const getContentHTML = () => {
    return section.description || '';
  };

  return (
    <section
      ref={sectionRef}
      className={`concept-section ${isCompleted ? 'just-done' : ''}`}
      data-level={section.level}
      data-id={section.id}
      id={`s${section.id}`}
      style={{
        '--accent': section.color,
        '--accent-rgb': section.color.replace('#', '').match(/.{1,2}/g).map(x => parseInt(x, 16)).join(','),
      }}
    >
      <div className="section-header">
        <div className="section-num">{String(section.id).padStart(2, '0')}</div>
        <div className="section-meta">
          <h2>{section.title}</h2>
          <p>{section.sub}</p>
        </div>
        <div className={`section-badge ${section.level}`}>{section.level}</div>
        <button
          className={`check-section ${isCompleted ? 'done' : ''}`}
          onClick={onToggleComplete}
          title="Mark complete"
        >
          {isCompleted ? '☑' : '☐'}
        </button>
      </div>
      <div className="section-body">
        {section.concepts && section.concepts.length > 0 ? (
          <div className="concept-grid">
            {section.concepts.map((concept, idx) => (
              <ConceptCard
                key={idx}
                concept={concept}
                color={section.color}
              />
            ))}
          </div>
        ) : (
          <div className="concept-grid">
            <div className="concept-card" style={{ '--c': section.color }}>
              <h3>Overview</h3>
              <p>{section.sub}</p>
              <p><strong>Level:</strong> {section.level}</p>
              <p style={{ marginTop: '12px', color: '#9ca3af' }}>
                This section contains the core topic summary and interview-ready highlights.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ConceptCard({ concept, color }) {
  return (
    <div className="concept-card" style={{ '--c': color }}>
      <h3>{concept.title}</h3>
      {concept.description && (
        <>
          {concept.description.map((desc, idx) => (
            <p key={idx}>{desc}</p>
          ))}
        </>
      )}
      {concept.list && (
        <ul>
          {concept.list.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      )}
      {concept.code && <CodeBlock code={concept.code} />}
      {concept.interviewTip && (
        <div className="interview-tip">{concept.interviewTip}</div>
      )}
    </div>
  );
}
