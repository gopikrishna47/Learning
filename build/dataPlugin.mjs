// Vite plugin: keeps src/constants/generated/ in sync with the source data.
//  • `vite build` / `vite` start  → generate once before anything is bundled
//  • dev server                    → regenerate + full reload when a file in
//                                    src/constants/ (outside generated/) changes
import path from 'node:path';
import { generateData } from './generate-data.mjs';

export default function portalDataPlugin() {
  let root = process.cwd();
  let running = null;

  const run = () => {
    if (!running) running = generateData(root).finally(() => { running = null; });
    return running;
  };

  return {
    name: 'portal-data-generator',
    configResolved(config) { root = config.root; },

    async buildStart() {
      await run();
    },

    configureServer(server) {
      const logger = server.config.logger;
      let timer;
      let busy = false;   // a regeneration loop is running
      let dirty = false;  // a file changed while it was running → go round again

      const regenerate = async (file) => {
        if (busy) { dirty = true; return; }   // never drop an edit that lands mid-run
        busy = true;
        try {
          do {
            dirty = false;
            logger.info(`[portal-data] ${path.relative(root, file)} changed — regenerating`, { timestamp: true });
            try {
              if (await run()) server.ws.send({ type: 'full-reload' });
            } catch (err) {
              logger.error(`[portal-data] ${err.message}`);
            }
          } while (dirty);
        } finally {
          busy = false;
        }
      };

      const onFsEvent = (file) => {
        const f = file.split(path.sep).join('/');
        if (!f.includes('/src/constants/') || f.includes('/src/constants/generated/')) return;
        clearTimeout(timer);
        timer = setTimeout(() => regenerate(file), 200);
      };
      server.watcher.on('change', onFsEvent);
      server.watcher.on('add', onFsEvent);
      server.watcher.on('unlink', onFsEvent);
    },
  };
}
