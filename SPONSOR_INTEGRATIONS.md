# SignalTrace AI — Sponsor Technology Integration Specification (Phase 3)

This document provides a truthful, technically grounded accounting of the sponsor integrations in **SignalTrace AI**, specifying the architectural role of each technology, authentication requirements, verification evidence, and reproduction steps.

---

## Truthfulness & Transparency Matrix

| Sponsor Technology | Track / Capability | Genuine Implementation Status | Runtime Evidence & Fallback Behavior |
| :--- | :--- | :--- | :--- |
| **A. Zetaris** | Cross-Source Federated Business Data Access | **Partially Implemented (Live Adapter Prepared; Seeded Virtualizer Active)** | Live REST adapter connects to `${ZETARIS_API_URL}/v1/query`. In the absence of `ZETARIS_ID_TOKEN`, the adapter reports `status: "blocked"` with an explicit actionable notice and transparently falls back to local multi-source schemas while strictly preserving `zetaris://...` provenance. |
| **B. Meterless** | Persistent Agent Context & Workflow Continuity | **Verified (Genuinely Connected Local-First Architecture)** | Integrates documented engines from `meterless/meterless`: **Scout Intent** for early goal detection and risk scoring, **H-MEM** for hierarchical knowledge graphs with cryptographically signed audit ledgers, and **World Model** for dynamic relational state continuity. State is persisted in `data/meterless_hmem_state.json`. |
| **C. NVIDIA Nemotron** | Structured Causal Reasoning & Hypothesis Evaluation | **Partially Implemented (Live NIM Adapter Prepared; Rule Evaluator Active)** | Live OpenAI-compatible adapter targets `https://integrate.api.nvidia.com/v1/chat/completions` using `nvidia/llama-3.1-nemotron-70b-instruct`. In the absence of `NVIDIA_API_KEY`, the adapter reports `status: "blocked"` and uses a deterministic rule-based causal evaluator that never fabricates live API calls. |
| **D. Cursor** | Developer Environment & Automated Testing Suite | **Verified (Development Environment)** | Used as the primary IDE environment for coding, refactoring, and orchestrating Vitest test suites. Not a runtime service. |

---

## Detailed Technology Breakdowns

### 1. Zetaris — Cross-Source Data Access

#### Architecture & Role
In the SignalTrace AI architecture, Zetaris acts as the federated data layer uniting separate, fragmented enterprise systems:
- **Sales DB:** Checkout transactions, abandoned shopping carts, and gross merchandise volume dropouts.
- **Manhattan WMS:** Inventory ledgers, available-to-promise counts across fulfillment hubs (`US-WEST-DC1`, `US-MIDWEST-DC2`, `US-EAST-DC3`).
- **EDI 856 Gateway:** Advance ship notices, carrier status codes, and customs clearance updates at the Port of Long Beach.

#### Implementation
- **Source Module:** [`server/adapters/zetarisLiveAdapter.ts`](file:///C:/Users/Dinesh/Downloads/kirushproject2/server/adapters/zetarisLiveAdapter.ts)
- **Documented Endpoint:** `${ZETARIS_API_URL}/v1/query` and `${ZETARIS_API_URL}/v1/health`
- **Headers Sent:**
  - `Authorization: Bearer <ZETARIS_ID_TOKEN>`
  - `X-Request-Id: <UUID>`
  - `X-Tenant-Id: <ZETARIS_TENANT_ID>`
- **Health Check Method:** `testConnection()` validates endpoint reachability and Bearer token validity.
- **Blocker Status & Fallback:**
  - If `ZETARIS_ID_TOKEN` is unset in `.env`, `testConnection()` immediately reports:
    ```json
    { "connected": false, "status": "blocked", "error": "Missing ZETARIS_ID_TOKEN environment variable." }
    ```
  - The orchestrator falls back to the deterministic multi-source dataset, tagging every evidence item as `isDemoData: true` and annotating the source as `Zetaris Virtualizer (Demo Fallback: Missing Live Credentials)`.

---

### 2. Meterless — Agent Context & Workflow Continuity

#### Architecture & Role
Meterless is a local-first open-source context architecture (`github.com/meterless/meterless`) designed to solve agent context dilution and memory loss. SignalTrace AI integrates three core engines:
1. **Scout Intent (`MeterlessScoutIntent`):**
   - Intercepts incoming queries at step 1 of the agent lifecycle.
   - Extracts goal intent (`investigate_anomaly`, `execute_mitigation`, or `clarification_needed`), primary domain (`sales`, `inventory`, `logistics`), and risk classification (`CONSEQUENTIAL_HIGH` vs. `MEDIUM`).
2. **H-MEM Hierarchical Memory (`MeterlessHMemEngine`):**
   - Maintains a living knowledge graph with nodes for products (`SKU-409`), suppliers (`PO-88321`), and distribution centers (`US-WEST-DC1`).
   - Assigns verified `trustScore` ratings (0.0 to 1.0) and records an immutable SHA-256 audit ledger (`HMemLedgerEntry`) for every finding.
   - Implements hybrid retrieval matching keyword semantics and graph edge traversals.
3. **World Model (`MeterlessWorldModel`):**
   - Tracks dynamic environmental entity state (e.g. `SKU-409: OUT_OF_STOCK`, `PO-88321: CLEARED_PORT`).
   - Ensures state continuity across browser refreshes and investigation resumptions.

#### Implementation
- **Source Module:** [`server/adapters/meterlessEngine.ts`](file:///C:/Users/Dinesh/Downloads/kirushproject2/server/adapters/meterlessEngine.ts)
- **Persistent Storage:** `data/meterless_hmem_state.json` and `data/meterless_world_model.json`
- **Verification Evidence:** Passed in Vitest integration test `tests/sponsorIntegrations.test.ts`.

---

### 3. NVIDIA Nemotron — Reasoning & Hypothesis Evaluation

#### Architecture & Role
SignalTrace AI delegates structured causal reasoning to NVIDIA's high-parameter models:
- **Problem Framing:** Extracts affected business areas, anomaly deltas, and time horizons; detects vague queries.
- **Competing Hypothesis Ranking:** Compares 4 competing explanations (Stockouts vs. Supplier Delays vs. Demand Drop vs. Promo Glitch) against retrieved evidence.
- **Structured Report Synthesis:** Formulates executive summaries, calculated business impact estimates, and next steps without conversational hallucinations.

#### Implementation
- **Source Module:** [`server/adapters/nemotronLiveAdapter.ts`](file:///C:/Users/Dinesh/Downloads/kirushproject2/server/adapters/nemotronLiveAdapter.ts)
- **Documented Endpoint:** `https://integrate.api.nvidia.com/v1/chat/completions` (NVIDIA NIM API)
- **Model Identifier:** `nvidia/llama-3.1-nemotron-70b-instruct`
- **Safety & Resilience:**
  - Structured output parser with markdown fence stripping.
  - 12-second abort controller timeout.
  - Exponential backoff retry logic (max 2 retries).
- **Blocker Status & Fallback:**
  - If `NVIDIA_API_KEY` is not set, `testConnection()` reports:
    ```json
    { "connected": false, "status": "blocked", "error": "Missing NVIDIA_API_KEY environment variable." }
    ```
  - The orchestrator falls back to [`RuleBasedNemotronAdapter`](file:///C:/Users/Dinesh/Downloads/kirushproject2/server/adapters/ruleBasedNemotronAdapter.ts), which dynamically computes causal relationships and tags the model route as `Rule-based Causal Evaluator (Demo Fallback: Missing NVIDIA_API_KEY)`. It never claims real Nemotron inference unless verified.

---

### 4. Cursor — Development & Verification Environment

In accordance with hackathon rules:
- **Role:** Primary developer IDE used by the team to author TypeScript schemas, structure backend modules, and run Vitest test suites.
- **Runtime Statement:** Cursor is an IDE tool, **not** a production runtime service or backend API.

---

## How to Configure and Reproduce

### 1. Set Up Environment Variables
Copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```

If you have live credentials, enter them into `.env`:
```env
NVIDIA_API_KEY=nvapi-your-key-here
NVIDIA_MODEL=nvidia/llama-3.1-nemotron-70b-instruct

ZETARIS_API_URL=https://api.saas.enterprise.zetaris.com
ZETARIS_ID_TOKEN=your-zetaris-bearer-token
ZETARIS_TENANT_ID=your-tenant-id
```

If credentials are omitted, the application transparently runs in **Seeded Demo Mode** with full functionality intact.

### 2. Run Sponsor Verification Tests
```powershell
npm test
```
All 5 test suites (14 tests) validate connection test behavior, missing credential handling, fallback isolation, and Meterless H-MEM graph continuity.

### 3. Verify Live Status in the UI
1. Run `npm run dev`.
2. Open `http://localhost:5173/#datasources`.
3. Click **"Run Live Health Check"**.
4. The system will ping the live endpoints, query local adapters, and display the real-time diagnostic status without exposing private secrets.
