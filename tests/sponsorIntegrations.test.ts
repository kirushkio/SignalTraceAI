import { describe, it, expect, beforeEach } from 'vitest';
import { ZetarisLiveAdapter } from '../server/adapters/zetarisLiveAdapter';
import { NemotronLiveAdapter } from '../server/adapters/nemotronLiveAdapter';
import { MeterlessWorkflowAdapter, MeterlessScoutIntent, MeterlessHMemEngine } from '../server/adapters/meterlessEngine';

describe('Sponsor Technology Integrations (Phase 3)', () => {
  describe('Zetaris Data Access Adapter', () => {
    it('detects missing credentials and returns blocked status with actionable explanation', async () => {
      const adapter = new ZetarisLiveAdapter({ idToken: undefined });
      const result = await adapter.testConnection();

      expect(result.connected).toBe(false);
      expect(result.status).toBe('blocked');
      expect(result.error).toContain('Missing ZETARIS_ID_TOKEN');
      expect(adapter.getStatus().status).toBe('demo_seeded');
    });

    it('falls back gracefully to multi-source demo schemas when live credentials are missing', async () => {
      const adapter = new ZetarisLiveAdapter({ idToken: undefined });
      const sales = await adapter.fetchSalesTransactions('Audio', 'Week 42');

      expect(sales.records.length).toBeGreaterThan(0);
      expect(sales.isDemoData).toBe(true);
      expect(sales.sourceSystem).toContain('Zetaris');
      expect(sales.sourceUri).toContain('zetaris://');

      const inventory = await adapter.fetchInventoryStatus(['SKU-409', 'SKU-412']);
      expect(inventory.records.length).toBe(3);
      expect(inventory.records.some((r) => r.availableStock === 0)).toBe(true);
    });
  });

  describe('Meterless Context Engine (Scout Intent + H-MEM + World Model)', () => {
    it('accurately routes and risk-scores incoming queries with Scout Intent', () => {
      const scout = new MeterlessScoutIntent();

      const vague = scout.classify('help');
      expect(vague.detectedIntent).toBe('clarification_needed');
      expect(vague.confidenceScore).toBeLessThan(0.7);

      const salesIncident = scout.classify('Why did our sales drop by 30% this week in the audio category?');
      expect(salesIncident.detectedIntent).toBe('investigate_anomaly');
      expect(salesIncident.primaryDomain).toBe('sales');
      expect(salesIncident.riskLevel).toBe('MEDIUM');
      expect(salesIncident.routedEngines).toContain('H-MEM');

      const consequentialAction = scout.classify('Approve and execute PO-88321 emergency air freight dispatch');
      expect(consequentialAction.detectedIntent).toBe('execute_mitigation');
      expect(consequentialAction.riskLevel).toBe('CONSEQUENTIAL_HIGH');
    });

    it('maintains living knowledge graph and cryptographically signed audit ledger in H-MEM', () => {
      const hmem = new MeterlessHMemEngine();

      hmem.insertKnowledge(
        {
          id: 'test_node_sku_99',
          entityType: 'sku',
          label: 'SKU-99 Test ANC Pro',
          properties: { burnRate: 85, reorderPoint: 200 },
          trustScore: 0.97,
          provenanceUri: 'zetaris://wms_db/skus/99'
        },
        [
          {
            fromNodeId: 'test_node_sku_99',
            toNodeId: 'wh_central',
            relationType: 'fulfills',
            weight: 0.9
          }
        ]
      );

      const retrieved = hmem.hybridRetrieve('ANC Pro');
      expect(retrieved.nodes.length).toBeGreaterThan(0);
      expect(retrieved.nodes[0].trustScore).toBe(0.97);

      const stats = hmem.getStats();
      expect(stats.ledgerEntries).toBeGreaterThan(0);
    });

    it('reports connected status for genuinely active local-first engine', () => {
      const adapter = new MeterlessWorkflowAdapter();
      const status = adapter.getStatus();
      expect(status.status).toBe('connected');
      expect(status.details).toContain('H-MEM');
    });
  });

  describe('NVIDIA Nemotron Reasoning Adapter', () => {
    it('detects missing NVIDIA_API_KEY and returns blocked status with explicit blocker rationale', async () => {
      const adapter = new NemotronLiveAdapter({ apiKey: undefined });
      const result = await adapter.testConnection();

      expect(result.connected).toBe(false);
      expect(result.status).toBe('blocked');
      expect(result.error).toContain('Missing NVIDIA_API_KEY');
      expect(adapter.getStatus().status).toBe('demo_seeded');
    });

    it('falls back to deterministic causal reasoning with structured outputs when real API is offline', async () => {
      const adapter = new NemotronLiveAdapter({ apiKey: undefined });
      const frame = await adapter.extractProblemFrame('Investigate sales decline in Audio category');

      expect(frame.needsClarification).toBe(false);
      expect(frame.businessArea).toContain('Audio');

      const hypotheses = await adapter.generateAndRankHypotheses(frame, [
        {
          id: 'ev-1',
          title: '0 Stock',
          category: 'fact',
          sourceId: 'src_zetaris',
          sourceName: 'WMS',
          sourceUri: 'zetaris://wms_db/test',
          timestamp: '2026-10-16',
          description: '0 available units stockout',
          isDemoSeed: true
        }
      ]);

      expect(hypotheses.length).toBe(4);
      const primary = hypotheses.find((h) => h.isPrimaryCause);
      expect(primary).toBeDefined();
      expect(primary?.category).toBe('Stockouts');
    });
  });
});
