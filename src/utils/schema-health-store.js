class SchemaHealthStore {
constructor({ maxPerformanceWindow = 10 } = {}) {
this.store = new Map();
this.maxPerformanceWindow = maxPerformanceWindow;
}
initializeHealth(schemaId){
this.store.set(schemaId, { fitness:0.5, usageCount:0, successRate:1.0, lastUsed:Date.now(), performance:[] });
}
updateHealth(schemaId, usage){
const h = this.store.get(schemaId) || { fitness:0.5, usageCount:0, successRate:1.0, lastUsed:Date.now(), performance:[] };
h.usageCount++;
h.lastUsed = usage.timestamp || Date.now();
const successes = h.usageCount * h.successRate + (usage.success ? 1 : 0);
h.successRate = successes / h.usageCount;
if(usage.metrics && usage.metrics.performance){
h.performance.push(usage.metrics.performance);
if(h.performance.length > this.maxPerformanceWindow) h.performance.shift();
}
// fitness calc left to FitnessCalculator
this.store.set(schemaId, h);
}
get(schemaId){ return this.store.get(schemaId); }
getTopPerformers(limit=10){
return Array.from(this.store.entries()).sort((a,b)=>b[1].fitness - a[1].fitness).slice(0,limit);
}
}
module.exports = SchemaHealthStore;