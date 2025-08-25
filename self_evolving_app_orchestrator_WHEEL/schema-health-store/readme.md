schema-health-store.js


README

Purpose: encapsulate in-memory/persistent health store for schemas (fitness, usage, perf windows)
API:

initializeHealth(schemaId)
updateHealth(schemaId, usage)
getHealth(schemaId)
getTopPerformers(limit)
persistSnapshot(), loadSnapshot()


Config/env:

SCHEMA_HEALTH_SNAPSHOT_INTERVAL, SCHEMA_HEALTH_PERSIST_PATH


Telemetry:

metrics: schema.health.updates, schema.health.persist.duration_ms





Tests

Unit:

rolling perf array behaviors and capacity constraints
compute successRate from usage sequences


Integration:

persist/load snapshot cycle with test DB or FS





DI notes

Constructor args: { storageClient, clock, maxPerformanceWindow }
Provide pluggable persistence (memory, file, DB)