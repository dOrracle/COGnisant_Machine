const express = require('express');
const bodyParser = require('body-parser');

class Registry {
  constructor({ pluginManager, ajv } = {}) {
    this.pluginManager = pluginManager;
    this.ajv = ajv;
    this.app = express();
    this.app.use(bodyParser.json());
    this.router = express.Router();
    this.app.use('/api', this.router);
    this.router.get('/list', (req,res)=> res.json(this.pluginManager.list()));
    this.router.post('/register', async (req,res)=> {
      const manifest = req.body;
      // optional schema validation here
      // will write into cogs folder by CLI normally; for now keep in-memory
      this.pluginManager.manifests.set(manifest.cogId, manifest);
      res.json({ok:true, manifest});
    });
  }

  async initialize() {
    // nothing - pluginManager.initialize runs separately
  }

  async register(manifest) {
    this.pluginManager.manifests.set(manifest.cogId, manifest);
    return manifest;
  }

  resolve(selector) {
    // selector could be alias or cogId
    const list = this.pluginManager.list();
    let manu = list.find(m => m.cogId === selector || m.alias === selector);
    if(!manu) {
      // try type/slot short form
      manu = list.find(m => `${m.type}/${m.slot}` === selector);
    }
    if(!manu) return null;
    // choose first implementationBinding or a mock endpoint
    const impl = (manu.implementationBindings && manu.implementationBindings[0]) || { url: `http://localhost:3001/mock/${manu.slot}` };
    return { cogId: manu.cogId, alias: manu.alias, implementation: impl, allowedTools: manu.allowedTools || [] };
  }
}

module.exports = Registry;