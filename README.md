# SignalTrace AI — Autonomous Business Investigation & Resolution Platform

> **Hackathon Track:** The Agent That Can Explain Why  
> **Flagship Incident Scenario:** -32.4% Sales Decline in Audio Hardware Category (Week 42)  
> **Core Promise:** Detect the Signal. Prove the Cause. Resolve the Problem.

---

## Executive Overview

SignalTrace AI is an autonomous, evidence-driven investigation platform designed for operations leaders, business owners, and supply-chain managers. Rather than guessing an answer or generating conversational hallucinations, SignalTrace connects cross-source business records (Sales Transactions, Manhattan WMS Inventory, and Carrier EDI 856 status), dynamically formulates and tests competing explanations, proves the root cause, and enforces human-in-the-loop authorization before executing corrective actions.

---

## Architecture & Visual Identity

### Visual Identity
- **Obsidian Black (`#07080D`):** Primary canvas background
- **Slate Surface (`#171A25`):** Cards, panels, modal overlays, drawers
- **Electric Cyan (`#39CFFF`):** Active signals, grounding facts, interactive links
- **Electric Blue (`#3478FF`):** Data pipelines, progress steps, connectors
- **Neon Magenta (`#FF2FB3`):** Critical anomalies, key findings, primary causal path

### System Architecture
```
┌────────────────────────────────────────────────────────────────────────┐
│                      Client Application (React + Vite)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │Signature Orb │  │Investigation │  │ Causal Node  │  │   Human    │  │
│  │& Voice Input │  │  Workspace   │  │    Graph     │  │  Gate Panel│  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘  │
└─────────┼─────────────────┼─────────────────┼────────────────┼─────────┘
          │                 │ REST API /api   │                │
┌─────────▼─────────────────▼─────────────────▼────────────────▼─────────┐
│              SignalTrace Orchestration Engine (Node.js/Express)        │
│                                                                        │
│  ┌───────────────────────┐  ┌───────────────────────────────────────┐  │
│  │  Meterless Context    │  │   Zetaris Data Virtualizer Adapter    │  │
│  │  • Scout Intent       │  │   • Live REST Fabric Connector        │  │
│  │  • H-MEM Knowledge    │  │   • Cross-Source Schema Virtualization│  │
│  │  • World Model State  │  │   • Provenance Preservation           │  │
│  └───────────────────────┘  └───────────────────────────────────────┘  │
│  ┌───────────────────────┐  ┌───────────────────────────────────────┐  │
│  │   NVIDIA Nemotron     │  │       Action Execution Engine         │  │
│  │   • Problem Framing   │  │   • Safety Gate Enforcer              │  │
│  │   • Causal Synthesis  │  │   • PO-88322 Dispatcher (Real Action) │  │
│  │   • NIM API Connector │  │   • Verification Telemetry Monitor    │  │
│  └───────────────────────┘  └───────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Persistent Storage: data/signaltrace_db.json & data/artifacts/  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Genuine Sponsor Technology Integrations

| Sponsor | Capability | Status | Implementation Details |
| :--- | :--- | :--- | :--- |
| **Zetaris** | Cross-Source Federated Data Access | **Partially Implemented (Live Adapter Prepared; Seeded Virtualizer Active)** | Adapter in `server/adapters/zetarisLiveAdapter.ts` connects to `${ZETARIS_API_URL}/v1/query`. In the absence of `ZETARIS_ID_TOKEN`, reports `status: "blocked"` with an actionable notice and uses local multi-source schemas while strictly preserving `zetaris://...` provenance. |
| **Meterless** | Context Layer, Memory & Routing | **Verified (Genuinely Connected Local-First Engine)** | Built from `meterless/meterless`: **Scout Intent** for early intent and risk routing, **H-MEM** for living knowledge graphs with SHA-256 chained audit ledgers (`data/meterless_hmem_state.json`), and **World Model** for dynamic relational state tracking. |
| **NVIDIA Nemotron** | Structured Causal Reasoning | **Partially Implemented (Live NIM Adapter Prepared; Rule Evaluator Active)** | Live OpenAI-compatible adapter targets `https://integrate.api.nvidia.com/v1/chat/completions` using `nvidia/llama-3.1-nemotron-70b-instruct`. When `NVIDIA_API_KEY` is missing, reports `status: "blocked"` and uses a deterministic rule engine without fabricating model calls. |
| **Cursor** | IDE & Automated Test Environment | **Verified (Development Environment)** | Primary developer IDE used for authoring, refactoring, and orchestrating Vitest test suites. Not a runtime service. |

---

## Flagship Demonstration Scenario Walkthrough

### 1. Incident Detection & Intake
- **The Query:** *"Why did our sales drop by 30% this week in the audio hardware category?"*
- **Scout Intent:** Detects intent `investigate_anomaly`, classifies domain as `sales`, risk as `MEDIUM`, and routes to `H-MEM` and `NemotronReasoner`.

### 2. Multi-Source Schema Mapping & Evidence Extraction
- **Sales DB (`zetaris://sales_db/transactions`):** Audio category GMV dropped from $767,000 (W41) to $518,500 (W42). 84% of the dollar shortfall is concentrated on `SKU-409` (Apex Pro ANC Headphones) and `SKU-412` (Ultra Soundbar Gen 2).
- **Manhattan WMS (`zetaris://wms_db/inventory_balances`):** `SKU-409` reached 0 units available on Oct 16 14:22 UTC. `SKU-412` reached 0 units on Oct 17 08:15 UTC. Buffer stock was only sized for 3 days.
- **Supplier EDI (`zetaris://edi_gateway/asn_records`):** Purchase order `PO-88321` from Shenzhen Acoustics (4,500 units) was scheduled for delivery Oct 11, delayed 9 days to Oct 20 due to customs inspection at Port of Long Beach.
- **Clickstream Lake (`zetaris://web_analytics/traffic`):** Storefront visits rose +4.2% YoY. Cart checkout dropouts commenced immediately at 14:24 UTC on Oct 16.
- **Marketing DB (`zetaris://promo_engine/audits`):** Discount campaign coupon uptime was 99.98%.

### 3. Competing Hypotheses Evaluation
The engine tests 4 competing explanations against actual evidence:
1. **Critical Stockouts (Most Likely Cause - High Plausibility):** Supported by zero-inventory balance across all 3 US regional fulfillment hubs.
2. **Supplier Delivery Delay (Supported Inference):** Supported by 9-day customs delay on inbound shipment PO-88321.
3. **Consumer Demand Drop (Unlikely / Contradicted by Data):** Contradicted by web analytics showing +4.2% traffic growth and steady search volume.
4. **Promotional Glitch (Ruled Out):** Coupon API uptime was 99.98% with healthy marketing ad spend.

### 4. Corrective Action & Human Gate
- **Action `act-01`:** Expedite air-freight / emergency cross-docking for cleared `PO-88321` units directly to West & Midwest DCs (Recovers stock in 24 hours).
- **Human Gate:** Operator reviews rationale, expected outcome, and financial risk ($6,400 fee vs $84,000 reclaimed gross margin).
- **Execution:** Clicking **"Authorize Execution"** and **"Execute Authorized Action"** dispatches a verified purchase order artifact (`data/artifacts/replenishment_po_*.json`) to the local procurement ledger.
- **Verification:** Verification checks confirm inventory balances recover to 4,500 units.

---

## Prerequisites & Installation

### Prerequisites
- **Node.js:** v18.0.0+ (Tested on Node `v22.14.0`)
- **npm:** v10.0.0+ (Tested on npm `10.9.2`)

### Installation
```powershell
# Clone or navigate to the workspace
cd C:\Users\Dinesh\Downloads\kirushproject2

# Install dependencies
npm install
```

### Environment Configuration
Copy the template to `.env`:
```powershell
Copy-Item .env.example .env
```

To connect live sponsor APIs, update `.env`:
```env
# NVIDIA Nemotron NIM API
NVIDIA_API_KEY=nvapi-your-key-here
NVIDIA_MODEL=nvidia/llama-3.1-nemotron-70b-instruct

# Zetaris Data Virtualization Fabric
ZETARIS_API_URL=https://api.saas.enterprise.zetaris.com
ZETARIS_ID_TOKEN=your-bearer-token
ZETARIS_TENANT_ID=your-tenant-id
```
*(If left blank, the application automatically runs in Seeded Demo Mode with full workflow functionality).*

---

## Running the Application

### 1. Unified Development Server (Frontend + Backend Engine)
```powershell
npm run dev
```
Open **`http://localhost:5173`** in your browser. All API requests (`/api/*`) are handled directly by the engine via Vite development middleware.

### 2. Standalone Backend Server (Optional)
```powershell
npm run server
```
Runs the Express backend independently on port `3001`.

### 3. Automated Test Suite (Vitest)
```powershell
npm test
```
Runs all 19 unit, integration, resilience, and edge case tests across 6 test suites.

### 4. TypeScript Type Checking & Production Build
```powershell
# Type check without emitting
npm run lint

# Production bundle build
npm run build

# Preview production build locally
npm run preview
```

---

## Acceptance Criteria Status Report

| Criterion | PRD Requirement | Final Status | Verification Notes |
| :--- | :--- | :--- | :--- |
| **AC-1** | Submit question; orb activates & console usable | **PASSED** | Signature orb reacts to hover/click; opens inquiry input with autofocus. |
| **AC-2** | Typed & voice input with graceful fallbacks | **PASSED** | Web Speech API integrated; permission requesting, listening waves, editable transcription review, and browser unsupported notices all verified. |
| **AC-3** | Visible investigation plan with step states | **PASSED** | 6-step progress timeline tracks completed, in-progress, and pending steps with attributed tools. |
| **AC-4** | Competing hypotheses evaluated (at least 3) | **PASSED** | 4 hypotheses evaluated: Stockouts, Supplier Delays, Demand Drop (contradicted), and Promo Anomaly (ruled out). |
| **AC-5** | Evidence traces to source records | **PASSED** | Every fact references source URIs (`zetaris://sales_db/...`, `zetaris://wms_db/...`, `zetaris://edi_gateway/...`). |
| **AC-6** | Facts, inferences, and hypotheses distinguished | **PASSED** | Strictly partitioned into observed facts, supported inferences, and unresolved questions. |
| **AC-7** | Structured report and grounded evidence graph | **PASSED** | Interactive SVG node graph with bezier connectors, key finding paths in magenta, and inspector drawer. |
| **AC-8** | Genuine sponsor integration roles | **PASSED** | Genuine Meterless local-first engine (Scout Intent + H-MEM + World Model) active; Zetaris and Nemotron live adapters implemented with honest fallback and blocker reporting. |
| **AC-9** | Cursor development environment used | **PASSED** | Cursor used for authoring TypeScript modules, structuring backend schemas, and running Vitest suites. |
| **AC-10**| Consequential actions require approval | **PASSED** | Safety gate enforces human sign-off; duplicate executions are strictly blocked. |
| **AC-11**| Honest integration status without fake success | **PASSED** | Missing credentials report `status: "blocked"` with actionable error messages; demo mode is clearly labeled. |
| **AC-12**| History persists across refresh | **PASSED** | File-backed JSON store in `data/signaltrace_db.json` preserves runs and allows reopening prior context. |
| **AC-13**| Essential tests pass & reproducible setup | **PASSED** | 19 tests pass in `npm test`; `npm run lint` and `npm run build` pass with zero errors. |
