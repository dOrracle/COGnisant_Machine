Graph DB Adapter — README
Purpose

Provide a small, implementation‑agnostic adapter interface for graph datastores (Cypher, Gremlin, DQL, etc.).
Keep Schema/Template components and Plugins decoupled from a specific graph product so the orchestrator can swap Neo4j, Dgraph, JanusGraph, or mocks without changing business logic.

Public API (minimal)

async initialize()
async shutdown()
async verifyConnectivity() -> { ok: boolean, message?: string }
async executeStatements(statements: string[], params?: object, options?: object) -> {
success: boolean,
results: any[],
executionTimeMs: number,
counters?: object
}
async validateStatements(statements: string[], options?: { allowDestructive?: boolean, language?: string }) -> {
valid: boolean,
warnings: string[],
errors: string[]
}
async runTransaction(transactionFn: (tx) => Promise<any>, options?: object) -> any
async checkSchemaExists(schemaIdentifier: string, options?: object) -> { exists: boolean, nodeCount?: number, relCount?: number }
async cleanupSchema(schemaIdentifier: string, options?: object) -> { success: boolean, details?: any }
async getStats() -> object
trackExecution(meta: object)  // non-blocking telemetry hook
EventEmitter events: 'connected', 'disconnected', 'schema-executed', 'schema-execution-failed', 'health-check', 'schema-cleaned'

Design Principles

Language-agnostic: support a language hint (e.g., { language: 'cypher'|'gremlin'|'dql'|'native' }) and let implementations accept or reject statements.
Best-effort semantics: Where DB features differ, implementations provide best-effort results and normalized response shapes.
Safety-first validation: validateStatements must detect destructive operations (unless allowDestructive=true) and return structured errors/warnings.
Non-blocking telemetry: trackExecution should emit or enqueue events rather than blocking the main execution path.
Error normalization: errors returned should follow a consistent shape { code, message, retryable, details }.

Configuration & Environment

Adapter implementations should accept a config object. common keys:

GRAPHDB_URI
GRAPHDB_USER
GRAPHDB_PASSWORD / secretRef
GRAPHDB_DATABASE (optional)
GRAPHDB_LANGUAGE_HINT (optional default)
ADAPTER_TYPE (e.g., neo4j|gremlin|dgraph|mock)
CONNECTION_POOL_SIZE, TIMEOUT_MS


For local/dev: allow a MOCK_ADAPTER flag to use mock implementation.

Telemetry Keys / Metrics

graphdb.connect.latency_ms
graphdb.query.latency_ms
graphdb.tx.rollback.count
graphdb.exec.success_count
graphdb.exec.fail_count
graphdb.health.status

Example Usage (pseudo)
const adapter = createGraphDbAdapter({ type: 'cypher', uri: process.env.GRAPHDB_URI, user, password });
await adapter.initialize();
const validation = await adapter.validateStatements([cypherString], { allowDestructive: false, language: 'cypher' });
if (!validation.valid) throw new Error('Schema validation failed: ' + validation.errors.join(', '));
const result = await adapter.executeStatements([cypherString], { someParam: 1 }, { language: 'cypher' });
adapter.trackExecution({ schemaId, executionTime: result.executionTimeMs, success: result.success });
Tests to Add

Unit

parse/split helpers (statements splitting, simple string-aware parsing)
validation heuristics (detect destructive keywords not inside strings)
error-shape normalization


Integration (use mock adapter or lightweight container)

executeStatements + validateStatements flows with a test graph instance (optional docker)
runTransaction behavior (commit/rollback)


Contract tests (for SchemaPlugin)

confirm SchemaPlugin calls validateStatements before executeStatements (mock adapter)



Dependency Injection Notes

Export a class or factory that accepts dependencies/config via constructor:

new GraphDbAdapter({ driverFactory, logger, metricsClient, languageHint })


Avoid requiring concrete drivers at module top-level. Implementations should be pluggable and injected by OrchestrationCore.

Security & Safety Notes

Do not log full statements by default in production (PII risk). Provide DEBUG_LOG_FULL_STATEMENTS only in dev mode.
Default deny destructive operations; require explicit allowDestructive + policy approval for writes that could delete/drop.
Support short-lived credentials and secrets via secret managers rather than plaintext env vars.

Implementation Suggestions

Provide an abstract base class (GraphDbAdapter) implementing common helpers (splitStatements, basic linting).
Implement concrete adapters:

neo4j-impl (wrap driver) — optional, but not required if you avoid committing DB-specific logic.
gremlin-impl
dgraph-impl
mock-impl (for tests / local dev)


Adapter should expose metadata about supported languages and transactional capabilities for resolver selection.

File placement & minimal repo hint

src/graph-db/graph-db-adapter.js         // abstract base + helpers
src/graph-db/neo4j-adapter.js            // optional concrete impl
src/graph-db/mock-adapter.js             // test/dev
test/graph-db/ (unit + integration tests)

Failure Modes & Troubleshooting

Connectivity failure: verify credentials, network, and adapter type; adapter.emit('disconnected') and orchestrator should fallback/retry.
Validation false negatives: tighten validation heuristics or enable simulation/dry-run if DB supports it.
Stale registry endpoints: adapters should heartbeat; registry should evict stale instances.

Minimal Example Manifest Snippet (for a shadow agent/schema plugin)

useful keys to include so templates can indicate language:
{
"cogId": "cog:plugin:schema-manager",
"capabilities": ["generate-schema", "apply-schema"],
"schemaTemplateMeta": {
"language": "cypher",   // used to pick adapter that supports 'cypher'
"safeByDefault": true
}
}

Notes

Keep adapter surface intentionally small and stable: high-level semantics only. Let product-specific nuances live inside concrete adapter implementations.
This makes the orchestrator and Schema/Template components database-agnostic while preserving graph-specific capabilities where needed.