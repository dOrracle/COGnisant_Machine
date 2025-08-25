Canonical identifier patterns (examples)

cog:agent:model/slot:gemini@2.5
cog:tool:web_search/slot:tavily@v1.0.0
wheel:thought-analytical@canary

Recommended CLI commands

cognisant init
cognisant scaffold cog --type agent --category model --slot gemini --version 2.5
cognisant register ./cogs/agent/model/gemini/manifest.json
cognisant resolve agent/gemini
cognisant promote cog:tool:web_search/slot:tavily@v1.1.0 --to stable

Suggested repo layout (starter)

/docs

/architecture.md
/manifest-spec.md
/getting-started.md


/cogs

/agent/
/tool/
/service/


/wheels

/grounding/
/thought-analytical/


/src

/core (orchestration-core.js, plugin-manager.js)
/adapters (graph-db-adapter.js, mock-adapter.js)
/services (grounding-service.js, template-engine.js)
/plugins (schema-plugin, example plugins)
/cli (cognisant CLI)


/test (unit / integration)
docker-compose.yml (dev stack)
