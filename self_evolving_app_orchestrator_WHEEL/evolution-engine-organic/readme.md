evolution-engine-organic.js


README

Purpose: produce evolutionary candidates (mutation/crossover) from schemas/entities
API:

evolve(population, healthMap, usageHistory) -> newEntities[]
selectTopPerformers(population, healthMap)
mutateSchema(entity)
crossoverSchemas(parent1, parent2)
getCurrentCycle(), getCycleCount()


Config/env:

EVOLUTION_MUTATION_RATE, EVOLUTION_POPULATION_RATIO, EVOLUTION_SEED


Telemetry:

metrics: evolution.candidates.count, evolution.cycle.duration_ms





Tests

Unit:

selectTopPerformers sorts properly using a seeded RNG
mutateSchema respects mutationRate and clamped dims
crossoverSchemas produces candidate with expected merged properties


Integration:

run evolve with a mock fitnessMap and usageHistory, assert newSchemas length and valid shape


Reproducibility:

seedable RNG tests to ensure deterministic mutation sequences when seeded





DI notes

Constructor args: { rng, mutationStrategyRegistry, validator }
Expose strategy plugin points so different evolution algorithms can be swapped