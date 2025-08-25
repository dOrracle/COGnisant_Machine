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