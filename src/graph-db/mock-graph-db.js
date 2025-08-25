const GraphDbAdapter = require('./graph-db-adapter');
class MockGraphDb extends GraphDbAdapter {
async initialize(){ this.emit('connected'); return true; }
async verifyConnectivity(){ return { ok:true }; }
async executeStatements(stmts){ return { success:true, results:[], executionTimeMs:5, counters:{} }; }
async validateStatements(stmts, options){ return { valid:true, warnings:[], errors:[] }; }
async checkSchemaExists(id){ return { exists:false }; }
async cleanupSchema(id){ return { success:true }; }
}
module.exports = MockGraphDb;