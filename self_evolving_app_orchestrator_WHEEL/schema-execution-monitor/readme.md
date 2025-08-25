schema-execution-monitor.js


README

Purpose: aggregate execution history, compute summaries, expose monitoring endpoints
API:

trackExecution({ schemaId, executionTime, success, error })
getExecutionHistory(schemaId, limit)
getPerformanceSummary()


Config/env:

EXECUTION_HISTORY_SIZE, EXECUTION_METRICS_EXPORT_INTERVAL


Telemetry:

built-on metrics; also emit events for schema-executed/schema-execution-failed





Tests

Unit:

maintain bounded history, aggregate metrics calculation correctness


Integration:

integration with Neo4jAdapter.trackExecution events and resulting summary queries





DI notes

Constructor args: { metricsClient, eventEmitter, storageClient }