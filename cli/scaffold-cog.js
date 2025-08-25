#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');

function slug(s){ return String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }
function defaultManifest({type, category, slot, version}) {
  const v = version || 'v0.0.1';
  const cogId = `cog:${type}:${category}/slot:${slot}@${v}`;
  return {
    cogId,
    alias: `${type}/${slot}@${v}`,
    name: `${slot} ${type}`,
    description: `Auto scaffolded ${type} cog ${slot}`,
    type, category, slot, version: v,
    trustLevel: 'internal',
    capabilities: [],
    allowedTools: [],
    sideEffects: { dbWrites:false, network:true },
    implementationBindings: [],
    runtimePolicies: { sandbox:true, cpuLimit:'1', memLimit:'512Mi' },
    ioContract: { inputSchema:{type:'object', required:['task','context']}, outputSchema:{type:'object', required:['result']} }
  };
}

async function writeManifest(type, category, slot, version){
  const folder = path.join(process.cwd(),'cogs', type, category, slot);
  await fs.mkdir(folder,{recursive:true});
  const manifest = defaultManifest({type,category,slot,version});
  await fs.writeFile(path.join(folder,'manifest.json'), JSON.stringify(manifest,null,2),'utf8');
  console.log('Wrote', path.join(folder,'manifest.json'));
}

async function main(){
  const argv = process.argv.slice(2);
  if(argv[0] === '--bulk'){
    const csv = argv[1];
    const data = (await fs.readFile(csv,'utf8')).split(/\r?\n/).filter(Boolean);
    const header = data.shift().split(',').map(h=>h.trim());
    for(const row of data){
      const cols = row.split(',').map(c=>c.trim());
      const obj = header.reduce((acc,k,i)=>{acc[k]=cols[i];return acc;},{});
      await writeManifest(slug(obj.type||'agent'), slug(obj.category||'misc'), slug(obj.slot||'unnamed'), obj.version||'v0.0.1');
    }
    return;
  }
  const [type,category,slot,version] = argv;
  if(!type || !category || !slot){ console.error('Usage: scaffold-cog.js <type> <category> <slot> [version]'); process.exit(1); }
  await writeManifest(slug(type), slug(category), slug(slot), version);
}
main().catch(err=>{ console.error(err); process.exit(1); });