import React from 'react';
import { LANG_LABEL } from '../../constants/youtubeChannels.js';

/** "Used in: login.js · register.js" chips. */
export function FileChips({ files }) {
  if (!files?.length) return null;
  return (
    <div className="file-chips" aria-label="Used in files">
      <span className="file-chips-label">Used in</span>
      {files.map((file) => <code key={file} className="file-chip">{file}</code>)}
    </div>
  );
}

/** Blog / docs links and YouTube lessons for a concept. */
export default function ResourceLinks({ blogs = [], videos = [] }) {
  if (!blogs.length && !videos.length) return null;
  return (
    <div className="resource-links">
      {blogs.length > 0 && (
        <div className="resource-group">
          <h4 className="resource-heading">📖 Read &amp; practise</h4>
          <ul className="resource-list">
            {blogs.map(({ title, url }) => (
              <li key={url}>
                <a className="resource-link" href={url} target="_blank" rel="noopener noreferrer">{title}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {videos.length > 0 && (
        <div className="resource-group">
          <h4 className="resource-heading">▶ Watch &amp; learn</h4>
          <ul className="resource-list">
            {videos.map(({ channel, lang, url }) => (
              <li key={channel}>
                <a className="resource-link resource-link--video" href={url} target="_blank" rel="noopener noreferrer">
                  {channel}
                </a>
                <span className={`resource-lang resource-lang--${lang}`}>{LANG_LABEL[lang]}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
