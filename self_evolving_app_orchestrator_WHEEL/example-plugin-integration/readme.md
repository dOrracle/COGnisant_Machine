example-plugin-integration.js


README

Purpose: example wiring for PromptGenerator + SchemaPlugin + TemplateEngine showing lifecycle
Usage example showing initialization order, plugin add, template add, example generate call, and shut down
Config required for demo (mock neo4j connection, templates dir)
Test instructions to run demo locally with mocks/stubs



Tests

Integration:

Demo flows as an automated test using mocked services verifying emitted events and returned prompt


CI:

Mark as example/test-only; run in CI with mock drivers





DI notes

All services passed in via constructor to demo harness; show how to inject mocks