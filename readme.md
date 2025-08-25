Purpose: Node-only COGnisant_Machine scaffold: wheel orchestrator, manifest-first shadow agents, template engine, graph-db adapter abstraction, tool proxy, evolution stubs, CLI.
Quick start:
npm install
npm run scaffold agent model gemini 2.5
npm run dev
docker-compose up (optional dev stack)
See docs/* for details.

Notes / Guidance

This scaffold is intentionally example-first. Many components are minimal or stubbed to remain portable and language-agnostic. Replace mock-graph-db and mock-tavily with production implementations when ready.
All modules use dependency injection-friendly constructors so you can swap implementations in tests.
Security: dev token service uses HMAC JWT. Replace with mTLS or OAuth for production.
Evolution & PatternRecognizer are present as stubs to show where to plug instrumentation and experiments — they are not running full auto-evolve loops in scaffold.