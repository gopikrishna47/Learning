// Manual run:  npm run gen:data
import { generateData } from './generate-data.mjs';
const t = Date.now();
const changed = await generateData(process.cwd());
console.log(`[portal-data] ${changed ? 'regenerated' : 'already up to date'} (${Date.now() - t} ms)`);
