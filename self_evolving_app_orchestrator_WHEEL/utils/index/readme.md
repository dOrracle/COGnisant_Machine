utils/index.js


README

Purpose: small pure helpers (similarity, canonicalize, parse)
Export list and expected behavior for each helper
Example usage and edge case notes



Tests

Unit: tests for each helper with edge inputs
Mutation/contract checks: ensure behavior remains stable



DI notes

Keep pure functions; avoid side effects; no DI required but allow injecting timezone/clock where needed