plugin-manager.js


README

Purpose: manifest loading, validation, sandbox lifecycle, health heartbeats.
API:

loadFromFolder(path)
loadManifest(manifest)
getPlugin(cogId)
listPlugins(filter)
startPluginInstance(cogId)
stopPluginInstance(instanceId)


Config/env:

PLUGIN_SANDBOX_PATH, PLUGIN_HEARTBEAT_INTERVAL, PLUGIN_MAX_INSTANCES


Health & telemetry:

metrics: plugin.instances, plugin.errors, plugin.heartbeat_latency


Example: sample manifest-loading call and how to configure sandbox runner



Tests

Unit:

manifest validation with linter mock
manifest → cogId canonicalization logic
capability enforcement checks


Integration:

load manifest from disk -> start sandboxed worker (mock) -> heartbeat check
verify restart on crash with exponential backoff


Mocks:

sandboxRunner interface mock with start/stop/health





DI notes

Constructor args: { manifestLinter, sandboxRunner, registryClient, logger, metrics }
Expose plug-in lifecycle hooks for orchestrator to subscribe



plugin-schema-manager.js (Schema Plugin)


README

Purpose: domain plugin for schema evolution & template-driven schema generation
API:

initialize(config)
generateSchema(templateName, context, options)
applySchema(schemaId, options)
getSchemaStats()
evolveSchemas()
shutdown()


Expected config:

schema.maxSchemas, schema.evolutionInterval, neo4j.connectionUri


Events emitted:

schema-generated, schema-applied, schema-strengthened, schema-pruned, evolution-cycle-complete


Example usage snippet showing generate -> validate -> apply



Tests

Unit (pure logic):

calculateContextSimilarity edge cases
generateSchemaId canonicalization
initializeSchemaHealth values


Integration:

generateSchema -> templates.render (use TemplateEngine stub) -> produce schema string
applySchema -> Neo4jAdapter stub validating validateSchema called, executeSchema mocked to return counters


Edge tests:

reuse detection (findSimilarSchema) with different contexts
recordSchemaUsage updates schemaHealth





DI notes

Constructor signature: new SchemaPlugin({ templates, evolutionEngine, patternRecognizer, fitnessCalculator, neo4jAdapter, logger })
Do not require global Handlebars; use injected templates instance
Expose updateConfig(configPatch) to allow runtime changes by orchestrator



template-engine-handlebars.js


README

Purpose: template lifecycle manager (load, compile, cache, render)
API:

initialize(templatesDir)
addTemplate(name, source)
render(name, context) -> string
listTemplates()
compileRaw(templateStr) -> compiledFn


Config/env:

TEMPLATE_DIR, TEMPLATE_CACHE_TTL, TEMPLATE_SAFE_MODE (enable sanitizers)


Telemetry:

metrics: template.render.latency_ms, template.compile.count


Example: show registering a helper with deterministic RNG



Tests

Unit:

compile + render of simple templates, helper behavior
deterministic random helper seeded result
failure paths when template missing


Integration:

loadBuiltInTemplates from disk, render a fallback template
concurrent render stress test (caching behavior)


Security tests:

XSS/Injection sanitization tests for template inputs





DI notes

Constructor args: { handlebarsFactory, fileLoader, logger }
Expose instance-level helpers registration; avoid global Handlebars mutation