import { describe, it, expect, beforeEach } from 'vitest';
import { InvestigationOrchestrator } from '../server/engine/orchestrator';
import { SeededZetarisAdapter } from '../server/adapters/seededZetarisAdapter';
import { RuleBasedNemotronAdapter } from '../server/adapters/ruleBasedNemotronAdapter';
import { FilePersistentMemoryAdapter } from '../server/adapters/filePersistentMemoryAdapter';
import { dbStore } from '../server/storage/db';

describe('Investigation Lifecycle End-to-End', () => {
  let orchestrator: InvestigationOrchestrator;

  beforeEach(() => {
    orchestrator = new InvestigationOrchestrator(
      new SeededZetarisAdapter(),
      new RuleBasedNemotronAdapter(),
      new FilePersistentMemoryAdapter()
    );
  });

  it('runs complete lifecycle from query to structured report and causal graph', async () => {
    const query = 'Why did our sales drop by 30% this week in the audio hardware category?';
    const result = await orchestrator.runInvestigation({ query });

    expect(result.status).toBe('ready');
    expect(result.investigation).toBeDefined();

    const inv = result.investigation!;
    expect(inv.title).toContain('Audio Hardware');
    expect(inv.severity).toBe('critical');

    // 1. Verify Investigation Plan Timeline
    expect(inv.timeline.length).toBeGreaterThanOrEqual(6);
    expect(inv.timeline.some((s) => s.sourceTool === 'Zetaris')).toBe(true);
    expect(inv.timeline.some((s) => s.sourceTool === 'Nemotron')).toBe(true);

    // 2. Verify Multi-Source Evidence
    expect(inv.evidence.length).toBeGreaterThanOrEqual(5);
    const facts = inv.evidence.filter((e) => e.category === 'fact');
    const inferences = inv.evidence.filter((e) => e.category === 'inference');
    expect(facts.length).toBeGreaterThanOrEqual(4);
    expect(inferences.length).toBeGreaterThanOrEqual(1);

    // 3. Verify Competing Hypotheses
    expect(inv.hypotheses.length).toBe(4);
    const primary = inv.hypotheses.find((h) => h.isPrimaryCause);
    expect(primary).toBeDefined();
    expect(primary?.category).toBe('Stockouts');
    expect(primary?.plausibility).toBe('High Plausibility');

    // 4. Verify Causal Node Graph
    expect(inv.nodes.length).toBeGreaterThanOrEqual(6);
    expect(inv.edges.length).toBeGreaterThanOrEqual(6);
    const keyEdge = inv.edges.find((e) => e.isKeyPath);
    expect(keyEdge).toBeDefined();

    // 5. Verify Prioritized Actions
    expect(inv.actions.length).toBeGreaterThanOrEqual(2);
    expect(inv.actions[0].requiresApproval).toBe(true);
    expect(inv.actions[0].approvalStatus).toBe('pending');

    // 6. Verify Persistent Storage
    const stored = dbStore.getInvestigation(inv.id);
    expect(stored).toBeDefined();
    expect(stored?.id).toBe(inv.id);
  });
});
