import world1 from './world1.js';
import world2 from './world2.js';
import world3 from './world3.js';
import world4 from './world4.js';
import world5 from './world5.js';
import world6 from './world6.js';

// Names of the tests registered with test('…') / check('…') at the start of a line.
function testNames(source) {
  const names = [];
  const re = /^(?:test|check)\(\s*(['"])((?:\\.|(?!\1).)*)\1/gm;
  let match;
  while ((match = re.exec(source))) names.push(match[2].replace(/\\(['"])/g, '$1'));
  return names;
}

export const WORLDS = [world1, world2, world3, world4, world5, world6].map((world, worldIndex) => ({
  ...world,
  index: worldIndex,
  levels: world.levels.map((level, levelIndex) => ({
    ...level,
    worldId: world.id,
    worldIndex,
    index: levelIndex,
    isBoss: level.difficulty === 'Boss',
    // The test names double as the level's checklist of requirements.
    objectives: level.kind === 'code' ? testNames(level.tests) : [],
  })),
}));

export const LEVELS = WORLDS.flatMap((world) => world.levels);
export const LEVEL_BY_ID = Object.fromEntries(LEVELS.map((level) => [level.id, level]));
export const TOTAL_XP = LEVELS.reduce((sum, level) => sum + level.xp, 0);

export const RANKS = [
  { min: 0, title: 'Intern', icon: '🌱' },
  { min: 300, title: 'Junior Dev', icon: '🛠️' },
  { min: 900, title: 'Mid-level Dev', icon: '⚙️' },
  { min: 1700, title: 'Senior Dev', icon: '🚀' },
  { min: 2500, title: 'Staff Engineer', icon: '🧠' },
  { min: 3100, title: 'Principal', icon: '👑' },
];

export function rankFor(xp) {
  let current = RANKS[0];
  RANKS.forEach((rank) => { if (xp >= rank.min) current = rank; });
  const next = RANKS.find((rank) => rank.min > xp) || null;
  return { current, next };
}
