class FitnessCalculator {
constructor({ weights = { usage:0.3, success:0.4, recency:0.2, performance:0.1 } } = {}) {
this.weights = weights;
}
calculate(health, recentUsage = null){
let fitness = 0;
const usageScore = Math.min(health.usageCount / 10, 1.0);
fitness += usageScore * this.weights.usage;
fitness += (health.successRate || 0) * this.weights.success;
const daysSince = (Date.now() - (health.lastUsed || Date.now()))/(10006060*24);
const recencyScore = Math.max(0, 1 - (daysSince / 30));
fitness += recencyScore * this.weights.recency;
if(health.performance && health.performance.length){
const avg = health.performance.reduce((a,b)=>a+b,0)/health.performance.length;
fitness += Math.min(avg/1000,1) * this.weights.performance;
}
if(recentUsage && recentUsage.success) fitness += 0.1;
return Math.max(0, Math.min(1, fitness));
}
}
module.exports = FitnessCalculator;