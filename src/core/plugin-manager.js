const fs = require('fs').promises;
const path = require('path');

class PluginManager {
  constructor({ cogsPath = path.join(process.cwd(),'cogs'), logger = console } = {}) {
    this.cogsPath = cogsPath;
    this.logger = logger;
    this.manifests = new Map();
  }

  async initialize() {
    await this.loadManifests();
  }

  async loadManifests() {
    // Walk cogsPath first-level type/category/slot
    const types = await fs.readdir(this.cogsPath).catch(()=>[]);
    for(const t of types){
      const tpath = path.join(this.cogsPath, t);
      const categories = await fs.readdir(tpath).catch(()=>[]);
      for(const c of categories){
        const cpath = path.join(tpath, c);
        const slots = await fs.readdir(cpath).catch(()=>[]);
        for(const s of slots){
          const spath = path.join(cpath, s, 'manifest.json');
          try{
            const content = await fs.readFile(spath, 'utf8');
            const manifest = JSON.parse(content);
            this.manifests.set(manifest.cogId || `${t}:${c}/${s}`, manifest);
          }catch(e){
            this.logger.warn('Skipping manifest', spath, e.message);
          }
        }
      }
    }
  }

  list() { return Array.from(this.manifests.values()); }

  get(cogId) { return this.manifests.get(cogId); }
}

module.exports = PluginManager;