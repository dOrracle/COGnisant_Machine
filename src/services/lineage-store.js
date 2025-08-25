const fs = require('fs').promises;
class LineageStore {
constructor({ path = './data/lineage.json' } = {}) {
this.path = path;
}
async record(evt){
try{
const list = JSON.parse(await fs.readFile(this.path,'utf8')).concat([evt]);
await fs.writeFile(this.path, JSON.stringify(list,null,2),'utf8');
}catch(e){
// if file missing create
await fs.writeFile(this.path, JSON.stringify([evt],null,2),'utf8');
}
}
}
module.exports = LineageStore;