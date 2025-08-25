schema-templates-manager.js


README

Purpose: management of Cypher schema templates; compile and render safe templates
API:

initialize(templatesDir)
addTemplate(name, source)
render(name, context)
listTemplates()


Config/env:

SCHEMA_TEMPLATES_DIR, TEMPLATE_SAFE_LINT (enable Cypher lint)


Telemetry:

metrics: schemaTemplates.renderCount, schemaTemplates.loadFailures





Tests

Unit:

addTemplate + render correctness
registerHelpers register isolation (no global leakage)


Integration:

loadBuiltInTemplates fallback path test (simulate missing dir)
render produced Cypher passes basic safety lints





DI notes

Constructor args: { handlebarsFactory, fileLoader, linter }
Use same TemplateEngine instance or adapter; don’t maintain separate global state