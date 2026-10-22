import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../game/game.css';
import { LEVEL_BY_ID } from '../game/levels/index.js';
import WorldMap from '../game/WorldMap.jsx';
import LevelScreen from '../game/LevelScreen.jsx';

/** /game → world map · /game/:levelId → a level. Everything here is code-split. */
export default function GamePage() {
  const { levelId } = useParams();
  const level = levelId ? LEVEL_BY_ID[levelId] : null;

  useEffect(() => { window.scrollTo(0, 0); }, [levelId]);

  return (
    <main className="gm-page">
      {!levelId && <WorldMap />}
      {levelId && level && <LevelScreen key={level.id} level={level} />}
      {levelId && !level && (
        <div className="gm-card gm-locked">
          <div className="gm-locked-icon">🧭</div>
          <h2>That level doesn’t exist</h2>
          <Link className="gm-btn primary" to="/game">Back to the map</Link>
        </div>
      )}
    </main>
  );
}
