import { describe, it, expect } from 'vitest';
import { RuleBasedNemotronAdapter } from '../server/adapters/ruleBasedNemotronAdapter';
import { EvidenceItem } from '../server/types/schemas';

describe('Conflicting & Contradictory Evidence Evaluation', () => {
  const reasoner = new RuleBasedNemotronAdapter();

  it('correctly disproves consumer demand drop when storefront traffic is healthy', async () => {
    const frame = {
      businessArea: 'Audio Hardware',
      metricShortfall: '-32.4%',
      timeWindow: 'Week 42',
      detectedAnomaly: 'Sales decline',
      needsClarification: false
    };

    const evidence: EvidenceItem[] = [
      {
        id: 'ev-traffic',
        title: 'Digital Storefront Traffic',
        category: 'fact',
        sourceId: 'src_zetaris',
        sourceName: 'Clickstream Lake',
        sourceUri: 'zetaris://web_analytics/traffic',
        timestamp: '2026-10-21T00:00:00Z',
        description: 'Audio category visits rose +4.2% YoY with high purchase intent.',
        isDemoSeed: true
      },
      {
        id: 'ev-stockout',
        title: 'WMS Zero Stock',
        category: 'fact',
        sourceId: 'src_zetaris',
        sourceName: 'Manhattan WMS',
        sourceUri: 'zetaris://wms_db/inventory_balances',
        timestamp: '2026-10-16T14:22:00Z',
        description: '0 available units for SKU-409 and SKU-412 across all warehouses.',
        isDemoSeed: true
      },
      {
        id: 'ev-promo',
        title: 'Promo Campaign Health',
        category: 'fact',
        sourceId: 'src_zetaris',
        sourceName: 'Marketing DB',
        sourceUri: 'zetaris://promo_engine/audits',
        timestamp: '2026-10-20T00:00:00Z',
        description: 'Coupon API maintained 99.98% uptime.',
        isDemoSeed: true
      }
    ];

    const hypotheses = await reasoner.generateAndRankHypotheses(frame, evidence);

    // Demand drop must be contradicted
    const demandHyp = hypotheses.find((h) => h.category === 'Demand Drop');
    expect(demandHyp).toBeDefined();
    expect(demandHyp?.plausibility).toBe('Unlikely / Contradicted');
    expect(demandHyp?.contradictingEvidenceIds).toContain('ev-traffic');

    // Promo glitch must be ruled out
    const promoHyp = hypotheses.find((h) => h.category === 'Promotional Anomaly');
    expect(promoHyp).toBeDefined();
    expect(promoHyp?.plausibility).toBe('Ruled Out');
    expect(promoHyp?.contradictingEvidenceIds).toContain('ev-promo');

    // Stockouts must be high plausibility
    const stockHyp = hypotheses.find((h) => h.category === 'Stockouts');
    expect(stockHyp).toBeDefined();
    expect(stockHyp?.plausibility).toBe('High Plausibility');
    expect(stockHyp?.isPrimaryCause).toBe(true);
  });
});
