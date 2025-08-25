# README.md

COGnisant_Machine — Quick Start
===============================

COGnisant_Machine is a manifest-first, wheel-based orchestrator for composing zero-code "shadow" agents, tools, and services for adaptive AI workflows. This starter provides a minimal repo scaffold, a manifest specification, a manifest generator CLI, and example manifests to get you running locally.

Prerequisites
-------------
- Node.js 18+
- npm or yarn
- (Optional) Docker for integration tests / dev services

Quick install
-------------
1. Clone repo
   - git clone <repo-url>
2. Install CLI dependencies
   - npm install
3. Scaffold a new cog (example)
   - node ./cli/scaffold-cog.js agent model gemini 2.5

Manifest spec (summary)
-----------------------
Each cog is represented by a manifest JSON file at:
  /cogs/<type>/<category>/<slot>/manifest.json

Minimal manifest fields:
- cogId: canonical id (auto-generated if omitted)
- alias: short alias (e.g., agent/gemini)
- name: human name
- description: short description
- type: agent | tool | service
- category: functional grouping (model, web_search, grounding)
- slot: role name (gemini, tavily)
- version: semver or tag
- trustLevel: internal | vetted | third-party | untrusted
- capabilities: [ "generate", "summarize" ]
- allowedTools: [ "tool:web_search/tavily", "service:grounding/main" ]
- sideEffects: { dbWrites: false, network: true }
- implementationBindings: [{ id, type, url, auth, tags }]
- runtimePolicies: { sandbox: true, cpuLimit: "1", memLimit: "512Mi" }
- ioContract: { inputSchema, outputSchema }
- schemaTemplateMeta (optional): { language: "cypher" | "gremlin" | "dql" }

See /cogs/... example manifests for full examples.

CLI: scaffold-cog.js (usage)
----------------------------
node ./cli/scaffold-cog.js <type> <category> <slot> [version]

Example:
  node ./cli/scaffold-cog.js agent model gemini 2.5

This creates:
  ./cogs/agent/model/gemini/manifest.json

Generator supports CSV bulk mode:
  node ./cli/scaffold-cog.js --bulk ./data/new-cogs.csv

Files & layout (starter)
------------------------
- README.md
- package.json
- /cli/scaffold-cog.js         (manifest generator)
- /cogs/                       (generated manifests live here)
  - /agent/
  - /tool/
  - /service/
- /wheels/                     (example wheel compositions)
- /src/                        (core runtime stubs - optional)
- /test/                       (unit + integration scaffolding)
- docker-compose.yml (optional dev stack)

Next steps
----------
- Run the scaffold CLI to create a few example manifests.
- Hook the registry/resolver to load manifests from /cogs.
- Add a mock adapter in /src for dev testing.
- Add the manifest linter & CI gates (recommended).

---

# manifest.template.json

{
  "cogId": "cog:<type>:<category>/slot:<slot>@<version>",
  "alias": "<type>/<slot>@<version>",
  "name": "<Human-friendly name>",
  "description": "<Short description of the cog>",
  "type": "<agent|tool|service>",
  "category": "<functional category e.g. model, web_search, grounding>",
  "slot": "<slot-name>",
  "version": "<semver or tag>",
  "trustLevel": "internal",
  "capabilities": ["generate"],
  "allowedTools": ["tool:web_search/tavily"],
  "sideEffects": { "dbWrites": false, "network": true },
  "implementationBindings": [
    {
      "id": "impl-<slug>",
      "type": "http|container|serverless",
      "url": "https://example.com/impl/exec",
      "auth": "mTLS|oauth2",
      "tags": ["stable","us-west"]
    }
  ],
  "runtimePolicies": { "sandbox": true, "cpuLimit": "1", "memLimit": "512Mi" },
  "ioContract": {
    "inputSchema": { "type": "object", "required": ["task", "context"] },
    "outputSchema": { "type": "object", "required": ["result", "usedEvidenceIds"] }
  },
  "schemaTemplateMeta": { "language": "cypher" }
}

---

# cli/scaffold-cog.js
#!/usr/bin/env node
// Minimal manifest generator for COGnisant_Machine
// Usage:
//   node scaffold-cog.js <type> <category> <slot> [version]
//   node scaffold-cog.js --bulk ./data/cogs.csv

const fs = require('fs').promises;
const path = require('path');

function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
}

function defaultManifest({ type, category, slot, version }) {
  const v = version || 'v0.0.1';
  const cogId = `cog:${type}:${category}/slot:${slot}@${v}`;
  return {
    cogId,
    alias: `${type}/${slot}@${v}`,
    name: `${slot} ${type}`,
    description: `Auto-generated ${type} cog for ${slot}`,
    type,
    category,
    slot,
    version: v,
    trustLevel: 'internal',
    capabilities: [],
    allowedTools: [],
    sideEffects: { dbWrites: false, network: true },
    implementationBindings: [],
    runtimePolicies: { sandbox: true, cpuLimit: '1', memLimit: '512Mi' },
    ioContract: {
      inputSchema: { type: 'object', required: ['task', 'context'] },
      outputSchema: { type: 'object', required: ['result'] }
    }
  };
}

async function writeManifest(type, category, slot, version) {
  const folder = path.join(process.cwd(), 'cogs', type, category, slot);
  await fs.mkdir(folder, { recursive: true });
  const manifest = defaultManifest({ type, category, slot, version });
  const file = path.join(folder, 'manifest.json');
  await fs.writeFile(file, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`Wrote manifest -> ${file}`);
}

async function bulkFromCsv(csvPath) {
  const csv = await fs.readFile(csvPath, 'utf8');
  const lines = csv.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
  // Expect header: type,category,slot,version
  const header = lines.shift().split(',').map(h=>h.trim());
  for (const line of lines) {
    const cols = line.split(',').map(c=>c.trim());
    const obj = header.reduce((acc, h, i) => (acc[h]=cols[i], acc), {});
    const { type, category, slot, version } = obj;
    await writeManifest(type || 'agent', category || 'misc', slot || 'unnamed', version || 'v0.0.1');
  }
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0) {
    console.error('Usage: node scaffold-cog.js <type> <category> <slot> [version]');
    console.error(' or: node scaffold-cog.js --bulk ./data/cogs.csv');
    process.exit(1);
  }

  if (argv[0] === '--bulk') {
    const csvPath = argv[1];
    if (!csvPath) { console.error('Missing CSV path'); process.exit(1); }
    await bulkFromCsv(csvPath);
    return;
  }

  const [type, category, slot, version] = argv;
  if (!type || !category || !slot) {
    console.error('type, category and slot are required');
    process.exit(1);
  }
  await writeManifest(slugify(type), slugify(category), slugify(slot), version);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

Make executable:
- chmod +x cli/scaffold-cog.js

---

# Repo scaffold (file tree + sample manifests)

- README.md
- package.json
- cli/
  - scaffold-cog.js
- cogs/
  - agent/
    - model/
      - gemini/
        - manifest.json
  - tool/
    - web_search/
      - tavily/
        - manifest.json
  - service/
    - grounding/
      - main/
        - manifest.json
- wheels/
  - thought-analytical/
    - wheel-manifest.json
- src/
  - graph-db/
    - graph-db-adapter.js   (stub)
  - core/
    - orchestration-core.js (stub)
  - plugins/
    - schema-plugin.js      (stub)
- test/
  - unit/
  - integration/
- docker-compose.yml
- data/
  - new-cogs.csv

Example: cogs/agent/model/gemini/manifest.json
{
  "cogId": "cog:agent:model/slot:gemini@2.5",
  "alias": "agent/gemini@2.5",
  "name": "Gemini Agent (2.5)",
  "description": "Analytical LLM agent using Gemini 2.5 binding",
  "type": "agent",
  "category": "model",
  "slot": "gemini",
  "version": "2.5",
  "trustLevel": "internal",
  "capabilities": ["generate","summarize"],
  "allowedTools": ["tool:web_search/tavily","service:grounding/main"],
  "sideEffects": { "dbWrites": false, "network": true },
  "implementationBindings": [
    {
      "id": "impl-gemini-2.5-http",
      "type": "http",
      "url": "https://agents.local/gemini-2.5/exec",
      "auth": "mTLS",
      "tags": ["stable","dev"]
    }
  ],
  "runtimePolicies": { "sandbox": true, "cpuLimit": "1", "memLimit": "1Gi" },
  "ioContract": {
    "inputSchema": { "type": "object", "required": ["task","context"] },
    "outputSchema": { "type": "object", "required": ["result","usedEvidenceIds"] }
  },
  "schemaTemplateMeta": { "language": "cypher" }
}

Example: cogs/tool/web_search/tavily/manifest.json
{
  "cogId": "cog:tool:web_search/slot:tavily@v1.0.0",
  "alias": "tool/tavily@v1.0.0",
  "name": "Tavily Web Tool",
  "description": "Web search / scraping tool",
  "type": "tool",
  "category": "web_search",
  "slot": "tavily",
  "version": "v1.0.0",
  "trustLevel": "internal",
  "capabilities": ["search","fetch-metadata"],
  "allowedTools": [],
  "sideEffects": { "dbWrites": false, "network": true },
  "implementationBindings": [
    {
      "id": "impl-tavily-http",
      "type": "http",
      "url": "https://tools.local/tavily/exec",
      "auth": "mTLS",
      "tags": ["stable"]
    }
  ],
  "runtimePolicies": { "sandbox": true, "cpuLimit": "0.5", "memLimit": "256Mi" },
  "ioContract": {
    "inputSchema": { "type": "object", "required": ["query"] },
    "outputSchema": { "type": "object", "required": ["results"] }
  }
}

Example: wheels/thought-analytical/wheel-manifest.json
{
  "wheelId": "wheel:thought-analytical@dev",
  "name": "Thought Analytical Wheel (dev)",
  "description": "Collects analytical thought agents & helper tools",
  "cogs": [
    "cog:agent:model/slot:gemini@2.5",
    "cog:tool:web_search/slot:tavily@v1.0.0",
    "cog:service:grounding/slot:main@stable"
  ]
}

---

# package.json (starter)
{
  "name": "cognisant-machine-starter",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "scaffold": "node ./cli/scaffold-cog.js",
    "test": "echo \"Run unit tests\" && exit 0"
  },
  "dependencies": {},
  "devDependencies": {}
}

---

If you want I can:
- Produce a zip of the scaffolded repo layout with these files and example manifests.
- Add a manifest linter (JSON Schema + CLI).
- Add registry/resolver stub to load manifests and resolve selectors.

Which next step should I do?