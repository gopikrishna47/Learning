import React, { useEffect, useRef } from 'react';
import { subscribeScrollProgress } from '../utils/scrollProgress.js';

/** Reading-progress bar. Updates the DOM directly — scrolling never re-renders React. */
export default function ProgressBar() {
  const ref = useRef(null);

  useEffect(() => subscribeScrollProgress((progress) => {
    if (ref.current) ref.current.style.transform = `scaleX(${progress / 100})`;
  }), []);

  return <div id="progress-bar" ref={ref} />;
}
