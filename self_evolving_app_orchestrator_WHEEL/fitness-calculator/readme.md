fitness-calculator.js


README

Purpose: compute normalized fitness score from health metrics & recent usage
API:

calculate(health, recentUsage = null) -> 0..1 number
configureWeights({ usage, success, recency, performance })


Config/env:

FITNESS_WEIGHTS (JSON), PERFORMANCE_NORMALIZE_BASE


Telemetry:

metric: fitness.eval.count





Tests

Unit:

weight configurations produce expected outputs (edge conditions)
recency decay behavior test
guard against negative or NaN values


Integration:

integrate with SchemaPlugin health updates to ensure fitness updates reflect in sorting





DI notes

Constructor args: { normalizer, clock }
Expose weights via config injection so orchestrator can mutate in evolution meta-tuning
