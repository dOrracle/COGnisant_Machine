const EventEmitter = require('eventemitter3');

class OrchestrationCore extends EventEmitter {
  constructor({ registry, pluginManager, templateEngine, tokenService, toolProxy, graphDbAdapter, lineageStore, logger } = {}) {
    super();
    this.registry = registry;
    this.pluginManager = pluginManager;
    this.templateEngine = templateEngine;
    this.tokenService = tokenService;
    this.toolProxy = toolProxy;
    this.graphDbAdapter = graphDbAdapter;
    this.lineageStore = lineageStore;
    this.logger = logger || console;
  }

  async initialize() {
    if(this.registry && this.registry.initialize) await this.registry.initialize();
    if(this.pluginManager && this.pluginManager.initialize) await this.pluginManager.initialize();
    if(this.templateEngine && this.templateEngine.initialize) await this.templateEngine.initialize();
    this.emit('initialized');
  }

  async registerManifest(manifest) {
    return await this.registry.register(manifest);
  }

  async resolve(selector) {
    // selector: alias or cogId or short form
    return await this.registry.resolve(selector);
  }

  async executeTask({ selector, templateName, context, options = {} }) {
    const requestId = require('uuid').v4();
    const resolved = await this.resolve(selector);
    if(!resolved) throw new Error('No such cog: ' + selector);
    const impl = resolved.implementation; // { url, auth }
    // Prepare evidence (grounding) if requested
    let evidence = context.evidence || [];
    if(options.ground && this.templateEngine && this.templateEngine.buildGroundQuery){
      const q = this.templateEngine.buildGroundQuery(templateName, context);
      evidence = await (this.toolProxy ? this.toolProxy.fetchEvidence(q) : []);
    }
    // Render prompt
    const prompt = this.templateEngine ? await this.templateEngine.render(templateName, { ...context, evidence }) : '';
    // Mint token scoped for impl.allowedTools
    const token = this.tokenService ? this.tokenService.issue({ cogId: resolved.cogId, allowedTools: resolved.allowedTools, requestId }) : null;
    // Call impl via HTTP
    const fetch = require('node-fetch');
    const resp = await fetch(impl.url, {
      method: 'POST',
      headers: { 'content-type':'application/json', 'authorization': token ? `Bearer ${token}` : '' },
      body: JSON.stringify({ requestId, prompt, context, evidence })
    });
    const result = await resp.json();
    // Record lineage
    if(this.lineageStore) this.lineageStore.record({ requestId, selector, resolved, templateName, evidenceIds: (evidence||[]).map(e=>e.id), result });
    return result;
  }
}

module.exports = OrchestrationCore;