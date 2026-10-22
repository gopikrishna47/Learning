import React from 'react';

export default function Navigation({ filter, onFilterChange }) {
  const filters = [
    { value: 'all', label: 'All' },
    { value: 'junior', label: '🟢 Junior' },
    { value: 'mid', label: '🟡 Mid' },
    { value: 'senior', label: '🔴 Senior' },
  ];

  return (
    <nav className="topic-nav" id="topic-nav">
      {filters.map((f) => (
        <button
          key={f.value}
          className={`tnav-btn ${filter === f.value ? 'active' : ''}`}
          onClick={() => onFilterChange(f.value)}
        >
          {f.label}
        </button>
      ))}
    </nav>
  );
}
