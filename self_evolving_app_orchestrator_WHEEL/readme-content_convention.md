README content convention

Keep a consistent template (Purpose, API, Config/Env, Telemetry, Example, Failure Modes, Security Notes)
Save as README.md next to the file in the repo



Testing guidance

Use jest/mocha for unit tests; sinon/nock for mocking external calls (Neo4j driver mock, handlebar renders)
Provide a lightweight docker-compose for integration tests (Neo4j test container) with teardown
Use snapshot tests where appropriate for template rendering



DI & constructor-injection pattern

Always export a class that accepts a single options/config object with named dependencies:

e.g., class SchemaPlugin { constructor({ templates, evolutionEngine, neo4jAdapter, logger }) { ... } }


Provide a factory function in each module that wires default implementations:

createDefaultSchemaPlugin(config) { return new SchemaPlugin({ templates: createDefaultTemplateEngine(config), ... }) }


Tests use the class directly, injecting mocks/fakes



CI & automation

Add a pre-commit hook to run manifest linter and unit tests for changed files
Add integration test stage with short-lived Neo4j docker container for DB adapter tests
Gate merges on unit + integration + manifest lint