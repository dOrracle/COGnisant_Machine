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