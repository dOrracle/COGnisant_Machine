const express = require('express');
const bodyParser = require('body-parser');
const PluginManager = require('./plugin-manager');
const Registry = require('./registry');
const TokenService = require('./token-service');
const TemplateEngine = require('../services/template-engine-handlebars');
const LineageStore = require('../services/lineage-store');
const OrchestrationCore = require('./orchestration-core');
const ToolProxy = require('../services/tool-proxy');
const GraphDbAdapter = require('../graph-db/graph-db-adapter');

async function start() {
  const app = express();
  app.use(bodyParser.json());

  const pluginManager = new PluginManager();
  await pluginManager.initialize();

  const registry = new Registry({ pluginManager });
  await registry.initialize();

  const tokenService = new TokenService({ secret: process.env.TOKEN_SECRET || 'dev-secret' });
  const templateEngine = new TemplateEngine();
  await templateEngine.initialize();

  const lineageStore = new LineageStore({ path: './data/lineage.json' });
  const toolProxy = new ToolProxy({ tokenService });
  const graphAdapter = new (require('../graph-db/mock-graph-db'))();

  const core = new OrchestrationCore({ registry, pluginManager, templateEngine, tokenService, toolProxy, graphDbAdapter: graphAdapter, lineageStore });
  await core.initialize();

  app.post('/api/register', async (req,res) => {
    const manifest = req.body;
    const reg = await core.registerManifest(manifest);
    res.json(reg);
  });

  app.get('/api/list', (req,res) => res.json(pluginManager.list()));

  app.post('/api/resolve', async (req,res) => {
    const { selector } = req.body;
    const r = await core.resolve(selector);
    res.json(r || { error: 'not found' });
  });

  app.post('/api/execute', async (req,res) => {
    try {
      const out = await core.executeTask(req.body);
      res.json(out);
    } catch(e){
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/health', (req,res)=> res.json({ status:'ok' }));

  const port = process.env.PORT || 3000;
  app.listen(port, ()=> console.log(`Orchestrator listening ${port}`));
}

start().catch(e=>{ console.error(e); process.exit(1); });