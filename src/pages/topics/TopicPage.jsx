import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { hexToRgb } from '../../constants/topics.js';
import { HUB } from '../../constants/generated/hub.js';
import { loadSections } from '../../data/index.js';
import useLoaded from '../../hooks/useLoaded.js';
import { toggleComplete } from '../../redux/store.js';
import TopicPageLayout from './TopicPageLayout.jsx';

/** Generic topic page — everything comes from the TOPICS registry entry.
 *  Only this topic's sections are downloaded; Q&A loads when its tab opens. */
export default function TopicPage({ topic }) {
  const dispatch = useDispatch();
  const completed = useSelector((s) => s.checklist.completed);
  const onToggle = useCallback((id) => dispatch(toggleComplete(id)), [dispatch]);
  const { value: sections, error } = useLoaded(topic.key, () => loadSections(topic.key));

  if (error) {
    return (
      <main className="tp-page" style={{ padding: 'calc(var(--header-h) + 48px) 24px', textAlign: 'center' }}>
        <p>Couldn&apos;t load this topic. Check your connection and try again.</p>
        <button className="btn-checklist" onClick={() => window.location.reload()}>Reload</button>
      </main>
    );
  }
  if (!sections) return <div className="route-loading">Loading…</div>;

  return (
    <TopicPageLayout
      icon={topic.icon}
      title={topic.title || topic.label}
      subtitle={topic.subtitle}
      color={topic.color}
      accentRgb={hexToRgb(topic.color)}
      sections={sections}
      qaCategories={topic.qaCategories}
      qaCount={HUB[topic.key].qaCount}
      completed={completed}
      defaultTab={topic.defaultTab || 'learn'}
      onToggle={onToggle}
    />
  );
}
