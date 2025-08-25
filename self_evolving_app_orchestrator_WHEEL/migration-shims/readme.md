migration-shims.js


README

Purpose: temporary compatibility adapters; list of shim functions and deprecated entrypoints
Usage: map old callers to new OrchestrationCore methods
Deprecation policy: timeline & logs; how to report remaining uses



Tests

Unit: shim mapping correctness
Integration: run a small migration test to ensure old API calls still produce expected results