class GroundingService {
constructor({ toolProxy } = {}) { this.toolProxy = toolProxy; }
async fetchEvidence(query, opts = {}) {
// call toolProxy.fetchEvidence; for scaffold return empty array or mocked results
return await (this.toolProxy ? this.toolProxy.fetchEvidence(query) : []);
}
}
module.exports = GroundingService;