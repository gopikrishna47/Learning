import React, { useSyncExternalStore } from 'react';
import { getScrollProgress, subscribeScrollProgress } from '../utils/scrollProgress.js';

// Re-renders only when the button crosses the "show after 5% scroll" threshold.
const subscribe = (onChange) => subscribeScrollProgress(onChange);
const getVisible = () => getScrollProgress() > 0.05;

export default function BackToTop() {
  const isVisible = useSyncExternalStore(subscribe, getVisible, () => false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      id="back-top"
      className={isVisible ? 'visible' : ''}
      onClick={scrollToTop}
      title="Back to top"
    >
      ↑
    </button>
  );
}
