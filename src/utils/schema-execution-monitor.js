class SchemaExecutionMonitor {
constructor({ maxHistory = 100 } = {}) {
this.history = [];
this.maxHistory = maxHistory;
}
trackExecution(meta){
this.history.push(meta);
if(this.history.length > this.maxHistory) this.history.shift();
}
getPerformanceSummary(){
const executions = this.history;
const total = executions.length;
const successful = executions.filter(e=>e.success).length;
const avg = executions.reduce((s,e)=>s+(e.executionTime||0),0)/(total||1);
return { total, successful, successRate: total?successful/total:0, avgExecutionTime: avg };
}
}
module.exports = SchemaExecutionMonitor;