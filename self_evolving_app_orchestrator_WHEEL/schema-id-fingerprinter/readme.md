schema-id-fingerprinter.js


README

Purpose: canonical fingerprinting for schemas to avoid collisions
API:

generateId({ templateName, schemaString, contextActiveDimensions, salt?}) -> schema_<hex>
canonicalizeForHash(input) -> canonical JSON


Config/env:

FINGERPRINT_ALGO (sha256 preferred), FINGERPRINT_SALT


Telemetry:

metric: fingerprint.generated.count





Tests

Unit:

identical input -> same id
different but equivalent orderings produce identical canonical id (canonicalization)
include templateName and schemaString in hash (test collisions unlikely)


Integration:

ensure schemaId used by SchemaPlugin when storing/retrieving schemas





DI notes

Constructor args: { hashFactory, canonicalizer }
Expose deterministic canonicalization function for tests