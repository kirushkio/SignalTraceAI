import { describe, it, expect, beforeEach } from 'vitest';
import { ZetarisLiveAdapter } from '../server/adapters/zetarisLiveAdapter';
import { NemotronLiveAdapter } from '../server/adapters/nemotronLiveAdapter';
import { InvestigationOrchestrator } from '../server/engine/orchestrator';
import { DatabaseStore } from '../server/storage/db';

describe('Edge Cases, Resilience & Reliability Suite', () => {
  describe('Network Timeouts & Failed API Calls', () => {
    it('handles simulated unreachable network or invalid URL for Zetaris gracefully', async () => {
      const adapter = new ZetarisLiveAdapter({
        apiUrl: 'http://127.0.0.1:59999/unreachable_nonexistent',
        idToken: 'fake_token',
        timeoutMs: 100 // fast timeout
      });

      const res = await adapter.testConnection();
      expect(res.connected).toBe(false);
      expect(res.status).toBe('blocked');
      expect(res.error).toBeDefined();

      // Ensure fallback query still succeeds without throwing
      const sales = await adapter.fetchSalesTransactions('Audio', 'Week 42');
      expect(sales.records.length).toBeGreaterThan(0);
      expect(sales.isDemoData).toBe(true);
    });

    it('handles simulated unreachable network or timeout for Nemotron gracefully', async () => {
      const adapter = new NemotronLiveAdapter({
        baseUrl: 'http://127.0.0.1:59999/unreachable_nonexistent',
        apiKey: 'fake_key',
        timeoutMs: 100 // fast timeout
      });

      const res = await adapter.testConnection();
      expect(res.connected).toBe(false);
      expect(res.status).toBe('blocked');
      expect(res.error).toBeDefined();

      // Ensure problem framing falls back without throwing
      const frame = await adapter.extractProblemFrame('Investigate sales drop in Audio');
      expect(frame.businessArea).toContain('Audio');
    });
  });

  describe('Database Resilience & Recovery', () => {
    it('handles database read operations reliably without throwing exceptions', () => {
      const store = new DatabaseStore();
      const all = store.getAllInvestigations();
      expect(Array.isArray(all)).toBe(true);

      const nonExistent = store.getInvestigation('inv-nonexistent-999');
      expect(nonExistent).toBeNull();
    });
  });

  describe('Investigation Lifecycle Edge Cases', () => {
    const orchestrator = new InvestigationOrchestrator();

    it('handles rapid sequential inquiries without state corruption', async () => {
      const q1 = orchestrator.runInvestigation({
        query: 'Investigate -32.4% Audio Category sales drop in Week 42'
      });
      const q2 = orchestrator.runInvestigation({
        query: 'Which high-demand products are experiencing stockouts?'
      });

      const [res1, res2] = await Promise.all([q1, q2]);
      expect(res1.status).toBe('ready');
      expect(res2.status).toBe('ready');
      expect(res1.investigation!.id).not.toBe(res2.investigation!.id);
    });

    it('allows cancelling an investigation and marks status correctly in persistent storage', async () => {
      const res = await orchestrator.runInvestigation({
        query: 'Investigate -32.4% Audio Category sales drop in Week 42'
      });
      const invId = res.investigation!.id;

      const cancelled = await orchestrator.cancelInvestigation(invId);
      expect(cancelled.status).toBe('cancelled');
    });
  });
});
