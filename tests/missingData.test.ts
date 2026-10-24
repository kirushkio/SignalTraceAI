import { describe, it, expect } from 'vitest';
import { InvestigationOrchestrator } from '../server/engine/orchestrator';

describe('Missing Data & Clarification Engine', () => {
  const orchestrator = new InvestigationOrchestrator();

  it('triggers clarification when query is too ambiguous or missing essential details', async () => {
    const vagueQueries = ['help', 'sales drop', 'what happened', 'investigate'];

    for (const query of vagueQueries) {
      const result = await orchestrator.runInvestigation({ query });
      expect(result.status).toBe('clarification_needed');
      expect(result.clarificationPrompt).toBeDefined();
      expect(result.suggestedClarifications).toBeDefined();
      expect(result.suggestedClarifications!.length).toBeGreaterThan(0);
      expect(result.investigation).toBeUndefined();
    }
  });

  it('proceeds without clarification when sufficient domain scope is provided', async () => {
    const specificQuery = 'Investigate -32.4% Audio Category sales drop in Week 42';
    const result = await orchestrator.runInvestigation({ query: specificQuery });
    expect(result.status).toBe('ready');
    expect(result.investigation).toBeDefined();
  });
});
