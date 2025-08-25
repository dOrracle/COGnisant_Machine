# COGnisant_Machine — Shadow Agents, Orchestration & Self-Adapting Applications

**COGnisant_Machine** is a manifest-first, wheel-based orchestrator designed to make building, testing, and evolving multi-agent AI applications simple, auditable, and safe.

*** FIRST ROUND SCAFFOLDING AND CONCEPT PRESENTATION ONLY ***

This repository contains a minimal scaffold demonstrating the core concepts:
*   **Zero-code "shadow" agents**: Agents defined by manifests, not code.
*   **Reusable Orchestration Wheel**: A single, reusable control plane.
*   **Manifest-driven registry**: For discovering and managing agents.
*   **Template-driven interactions**: Using templates for prompts and schemas.
*   **Grounding/evidence contract**: Ensuring auditable and verifiable behavior.
*   **Lightweight evolution hooks**: For enabling self-adapting applications.

This README provides a comprehensive overview for developers, researchers, and operators who want to explore the scaffold and experiment with evolving agent workflows.

---

## Why This Exists

The primary goals of this project are to:

*   **Move orchestration complexity out of agent code**: Agents are represented by metadata, keeping the control plane clean.
*   **Enable rapid experimentation**: Generate many variants of agents and templates without changing the core orchestrator.
*   **Keep operations safe**: Enforce least-privilege tool access, sandboxing, and a promotion pipeline for autonomous changes.
*   **Make behavior auditable**: Use deterministic identifiers, evidence envelopes, and lineage capture for every decision.

---

## Key Concepts

*   **Shadow Agent**: A zero-code descriptor (`manifest.json`) that declares a cog's ID, capabilities, allowed tools, I/O contract, and implementation bindings. The orchestrator interacts only with these manifests, while the implementations run externally.
*   **Wheel (Orchestrator)**: The control plane that registers manifests, resolves cogs, renders templates, fetches grounding evidence, mints scoped tokens, calls implementations, and records lineage.
*   **Manifest**: JSON metadata located at `/cogs/<type>/<category>/<slot>/manifest.json` that defines how a cog appears to the system.
*   **Evidence Envelope**: Normalized retrieval results (`id`, `text`, `snippet`, `source`, `vectorScore`, `timestamp`) that ground agent outputs and must be referenced by them.
*   **Tool Proxy & Tokens**: All tool calls are routed through the orchestrator’s proxy. Scoped tokens restrict which tools an implementation can call.
*   **Evolution Engine & Pattern Recognizer (Stubs)**: Hooks for mutating templates and learning the best agent/tool combinations from usage patterns.

---

## What This Scaffold Contains

*   A **Node.js implementation** of the Orchestration Wheel (registry, plugin manager, template engine, token service, tool proxy, lineage store).
*   A **manifest generator CLI** to quickly scaffold new cogs.
*   **JSON Schemas** for manifests and evidence envelopes.
*   **Example manifests** (Gemini agent, Tavily tool, and a wheel).
*   A **mock graph DB adapter** and a **mock tool server** for local development.
*   **Stubs** for the Evolution Engine and Pattern Recognizer.
*   A **Docker Compose** layout for development and simple tests.

---

## Quick Start (Dev)

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Scaffold a Cog (Example):**
    ```bash
    npm run scaffold -- agent model gemini 2.5
    ```

3.  **Run the Orchestrator Locally:**
    ```bash
    npm run dev
    ```

4.  **Register a Manifest (Manual):**
    If you edit or add a manifest manually, register it by sending a `POST` request to `/api/register` with the manifest JSON.

5.  **Resolve a Cog:**
    ```bash
    POST /api/resolve
    {
      "selector": "agent/gemini@2.5"
    }
    ```

6.  **Execute a Task:**
    ```bash
    POST /api/execute
    {
      "selector": "agent/gemini@2.5",
      "templateName": "research-analysis",
      "context": {
        "topic": "quantum computing",
        "activeDimensions": ["analytical", "creative"]
      }
    }
    ```

---

## High-Level Architecture

The system is composed of a single, small **Orchestration Wheel** process that includes:

*   **Registry**: Loads manifests from the `/cogs` directory and resolves selectors to implementation bindings.
*   **Template Engine**: Renders prompt and schema templates using Handlebars.
*   **Grounding & Tool Proxy**: Fetches evidence from retrievers and enforces scoped access to tools via tokens.
*   **Token Service**: Issues short-lived HMAC JWTs for development (can be swapped for mTLS/OAuth in production).
*   **Lineage Store**: Appends a complete record of each request (request, evidence, template, implementation) to a durable audit trail.
*   **Evolution Hooks**: A periodic job or manual trigger that calls the `EvolutionEngine` to mutate templates and evaluate them in canary Wheels.

---

## Manifest Summary

The manifest is the only artifact the orchestrator needs to know about a cog.

#### Required Core Fields:
*   `type`, `category`, `slot`, `version`, `ioContract`

#### Recommended Fields:
*   `cogId`, `alias`, `name`, `description`, `trustLevel`, `capabilities`, `allowedTools`
*   `implementationBindings` (url, type, auth)
*   `runtimePolicies` (sandbox, cpu/mem)
*   `schemaTemplateMeta` (language hint)

---

## Evidence & Grounding Contract

*   Agents receive an **evidence envelope**. Each item in the envelope contains: `{ id, text, snippet, source, vectorScore, retrievalMethod, timestamp, metadata }`.
*   Agents must return the `usedEvidenceIds` in their output to make their claims auditable.
*   This grounding mechanism improves reliability and enables automated checks.

---

## Safety & Governance

*   **Default-Deny on Destructive Operations**: Templates that produce database writes must be explicitly enabled via policy and approved by a human for production use.
*   **Enforced Tool Access**: Agents may only call tools listed in their manifest's `allowedTools` list. This is enforced by the tool proxy at runtime.
*   **Scoped Tokens**: Tokens are issued per-request and include the `cogId`, `requestId`, and `allowedTools`.
*   **Sandboxed Evolution**: Evolution runs in sandbox or canary Wheels. Promotions to production require human review by default.

---

## Self-Adapting Flow

1.  **Collect Telemetry**: Gather data for each execution, including success, latency, evidence usage, and user feedback.
2.  **Recognize Patterns**: The `PatternRecognizer` ingests usage data to recommend promising agent, tool, and template combinations for a given context.
3.  **Evolve Candidates**: The `EvolutionEngine` generates new candidates by tweaking template parameters, prompt phrasing, or evidence counts and schedules them for evaluation.
4.  **Evaluate Fitness**: Candidates are evaluated using a fitness calculator that measures a composite metric of quality, grounding, success rate, latency, and cost.
5.  **Promote or Rollback**: Winners are promoted to canary traffic and monitored. If metrics are met, they are promoted to stable; otherwise, they are rolled back.

---

## Developer Guidance & Tests

*   All modules use **dependency injection**, allowing tests to inject mocks for the registry, graph adapter, and template engine.
*   **Unit tests** for manifest parsing, registry resolution, token generation, and template rendering are included.
*   **Contract tests** are provided to validate the `ioContract` expectations for any new implementation you add.

---

## Examples

In this scaffold, you will find:

*   An example **Gemini agent manifest** (shadow only) demonstrating `allowedTools`, `implementationBinding`, `ioContract`, and `schemaTemplateMeta`.
*   An example **Tavily tool manifest** demonstrating the expected I/O for tools.
*   An example **wheel manifest** showing how cogs can be composed into a Wheel.

---

## Operational Notes / Next Steps for Production

*   **Authentication**: Replace the development token service with mTLS or OAuth/JWT signed by your identity provider.
*   **Lineage Store**: Replace the file-based lineage store with a durable database like Neo4j, Timescale, or another event store to enable scalable lineage queries.
*   **Graph DB Adapter**: Implement a real Graph DB Adapter for your chosen graph store and implement template safety linting.
*   **Security**: Implement stronger manifest signing and supply-chain validation for third-party cogs.

---

## Design Philosophy & Benefits

*   **Create the wheel once, reuse forever**: The core orchestrator remains stable while behavior evolves via manifests, templates, and implementation bindings.
*   **Zero-code agents**: Spin up thousands of agent variants by changing manifests and templates, not the orchestrator.
*   **Safety first**: Sandboxed experiments, scoped tokens, and human-promoted changes reduce the blast radius of autonomous evolution.
*   **Language-agnostic runtime**: While this scaffold is Node.js-only, the manifest-first approach allows you to swap runtime implementations with no changes to the wheel.

---

## Where to Look Next

*   `/cli/scaffold-cog.js`: Quickly create new shadow agent manifests.
*   `/cogs/*`: Example manifests to copy and extend.
*   `/src/core`: The core orchestrator, registry, token service, and server endpoints.
*   `/src/services`: The template engine, tool proxy, grounding stub, and lineage store.
*   `/docs`: The manifest specification, evidence specification, and developer guide.
*   `/evolution` and `/plugins`: Stubs showing where to plug in learning and domain-specific plugins.

---

## Feedback & Iteration

This is a first, minimal, careful scaffold focused on concepts and safe experimentation. The next iterations will likely include:

*   An integrated registry UI and manifest linter in the CI/CD pipeline.
*   A real Graph DB Adapter and template linting.
*   An evolution dashboard showing candidates and lineage graphs.

If this catches your attention, by all means, roll with it. Just do me the courtesy of a fork so I can see how this progresses.

xoxo,
Kre8orr
