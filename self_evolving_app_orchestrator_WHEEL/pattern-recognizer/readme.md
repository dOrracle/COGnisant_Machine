pattern-recognizer.js


README

Purpose: incremental learner for dimensional/context/template patterns and suggestions
API:

getSuggestions(context) -> suggestionList
learnFromUsage(usageHistory)
learnDimensionalPattern(usage), learnContextualPattern(usage)
exportPatterns(), importPatterns()
reset()


Config/env:

PATTERN_MIN_DATA_POINTS, PATTERN_CONFIDENCE_THRESHOLD, PATTERN_DECAY_RATE


Telemetry:

metrics: patterns.learned.count, suggestions.generated.count





Tests

Unit:

calculcateDimensionalSimilarity correctness
generateContextKey edge conditions
suggestion ranking correctness on synthetic pattern sets


Integration:

learnFromUsage with a synthetic history and ensure getSuggestions returns expected top results


Persistence:

export/import roundtrip produces equivalent internal state





DI notes

Constructor args: { persistenceClient, clock, similarityFn }
Persist patterns to Neo4j or a small key-value store for scale; provide async persistence hooks