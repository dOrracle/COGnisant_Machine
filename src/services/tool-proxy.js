const fetch = require('node-fetch');
class ToolProxy {
constructor({ tokenService, logger = console } = {}) {
this.tokenService = tokenService;
this.logger = logger;
}
async fetchEvidence(query, opts = {}) {
// For scaffold: try forwarding to a local mock tavily if present
try {
const url = process.env.MOCK_TAVILY_URL || 'http://localhost:4001/search';
const res = await fetch(url, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ query })});
const json = await res.json();
return json.results || [];
} catch(e){
this.logger.warn('ToolProxy.fetchEvidence failed:', e.message);
return [];
}
}
// Proxy forward for arbitrary tool calls with token validation stub
async forwardToTool(toolUrl, token, payload){
// validate token (basic)
if(this.tokenService && token){
const claims = this.tokenService.verify(token.replace(/^Bearer\s+/,''));
if(!claims) throw new Error('invalid token');
}
const res = await fetch(toolUrl, { method:'POST', headers:{ 'content-type':'application/json' }, body: JSON.stringify(payload) });
return res.json();
}
}
module.exports = ToolProxy;