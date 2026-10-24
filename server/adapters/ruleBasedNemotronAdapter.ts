import { IReasoningAdapter, ProblemFrame } from './interfaces';
import {
  EvidenceItem,
  Hypothesis,
  InvestigationReport
} from '../types/schemas';

export class RuleBasedNemotronAdapter implements IReasoningAdapter {
  public adapterName = 'Nemotron Reasoning & Hypothesis Evaluator (Phase 2 Local Adapter)';
  public provider: 'RuleEngine' = 'RuleEngine';
  public isLiveConnected = false; // Phase 3 connects to NVIDIA Nemotron 70B API

  public getStatus() {
    return {
      status: 'phase3_pending',
      details: 'Deterministic causal evaluator running in Phase 2. Typed interfaces prepared for NVIDIA Nemotron 70B endpoints in Phase 3.'
    };
  }

  public async extractProblemFrame(
    query: string,
    businessAreaHint?: string
  ): Promise<ProblemFrame> {
    const qLower = query.toLowerCase().trim();

    // Ambiguity / Clarification check
    if (
      qLower.length < 12 ||
      qLower === 'help' ||
      qLower === 'investigate' ||
      qLower === 'sales drop' ||
      qLower === 'what happened' ||
      qLower === 'why are sales bad'
    ) {
      return {
        businessArea: 'Unspecified',
        metricShortfall: 'Unspecified',
        timeWindow: 'Unspecified',
        detectedAnomaly: 'Vague query lacking specific product category or time window',
        needsClarification: true,
        clarificationReason:
          'Please specify the product category, department, or timeframe you want to investigate.',
        clarificationOptions: [
          'Investigate -32.4% Audio Category sales drop (Week 42)',
          'Check SKU-409 & SKU-412 warehouse stockout status',
          'Audit Shenzhen Acoustics PO-88321 inbound delivery delays'
        ]
      };
    }

    // Default to Audio category if query references audio, headphones, soundbars, or 30% drop
    let businessArea = businessAreaHint || 'Consumer Electronics / Audio Hardware';
    if (qLower.includes('freight') || qLower.includes('shipping') || qLower.includes('lead time')) {
      businessArea = 'Global Logistics / Inbound Ports';
    } else if (qLower.includes('return') || qLower.includes('firmware') || qLower.includes('display')) {
      businessArea = 'Smart Home / Hardware Quality';
    }

    return {
      businessArea,
      metricShortfall: '-32.4% WoW ($248,500 shortfall)',
      timeWindow: 'October 14 - October 21, 2026 (Week 42)',
      detectedAnomaly: 'Sales decline correlated with zero-inventory events on flagship items',
      needsClarification: false
    };
  }

  public async generateAndRankHypotheses(
    frame: ProblemFrame,
    evidence: EvidenceItem[]
  ): Promise<Hypothesis[]> {
    // 1. Analyze evidence dynamically
    const hasZeroStockEvidence = evidence.some(
      (e) =>
        e.description.toLowerCase().includes('0 available') ||
        e.description.toLowerCase().includes('0 units') ||
        e.description.toLowerCase().includes('stockout')
    );

    const hasSupplierDelayEvidence = evidence.some(
      (e) =>
        e.description.toLowerCase().includes('delayed') ||
        e.description.toLowerCase().includes('delay') ||
        e.description.toLowerCase().includes('customs hold')
    );

    const trafficEvidence = evidence.find((e) =>
      e.sourceUri.includes('web_analytics') || e.title.toLowerCase().includes('traffic')
    );
    const trafficIsUp = trafficEvidence && trafficEvidence.description.includes('+4.2%');

    const promoEvidence = evidence.find((e) =>
      e.sourceUri.includes('promo_engine') || e.title.toLowerCase().includes('promo')
    );
    const promoIsHealthy = promoEvidence && promoEvidence.description.includes('99.98%');

    // Collect IDs
    const stockoutEvIds = evidence
      .filter((e) => e.sourceUri.includes('wms_db') || e.sourceUri.includes('sales_db'))
      .map((e) => e.id);
    const supplierEvIds = evidence
      .filter((e) => e.sourceUri.includes('edi_gateway') || e.sourceUri.includes('nemotron'))
      .map((e) => e.id);
    const trafficEvIds = trafficEvidence ? [trafficEvidence.id] : [];
    const promoEvIds = promoEvidence ? [promoEvidence.id] : [];

    // Hypotheses evaluated based on actual evidence
    const hypotheses: Hypothesis[] = [
      {
        id: 'hyp-1',
        title: 'Critical Stockout of Top-Tier Revenue Drivers',
        category: 'Stockouts',
        plausibility: hasZeroStockEvidence ? 'High Plausibility' : 'Supported Inference',
        summary:
          'Flagship items SKU-409 and SKU-412 were depleted to zero available units across all 3 US regional fulfillment hubs starting Oct 16. These items account for 41% of category revenue.',
        supportingEvidenceIds: stockoutEvIds,
        contradictingEvidenceIds: [],
        unresolvedQuestions: [
          'Why did reorder point fail to trigger emergency buffer escalation before stock reached zero?'
        ],
        isPrimaryCause: true,
        score: 0.94
      },
      {
        id: 'hyp-2',
        title: 'Supplier Delay on Component PO-88321',
        category: 'Supplier Delays',
        plausibility: hasSupplierDelayEvidence ? 'Supported Inference' : 'Unlikely / Contradicted',
        summary:
          'PO-88321 from Shenzhen Acoustics (4,500 units) was scheduled for arrival on Oct 11, but delayed 9 days to Oct 20 at Port of Long Beach customs clearance.',
        supportingEvidenceIds: supplierEvIds,
        contradictingEvidenceIds: [],
        unresolvedQuestions: [
          'Did the ocean carrier provide transshipment telemetry prior to port arrival?'
        ],
        isPrimaryCause: false,
        score: 0.88
      },
      {
        id: 'hyp-3',
        title: 'Consumer Demand Drop / Macro Market Shift',
        category: 'Demand Drop',
        plausibility: trafficIsUp ? 'Unlikely / Contradicted' : 'Supported Inference',
        summary:
          'Investigated whether organic demand collapsed. Storefront visits to the Audio collection grew +4.2% WoW, proving underlying customer purchase intent remained strong.',
        supportingEvidenceIds: [],
        contradictingEvidenceIds: trafficEvIds,
        unresolvedQuestions: [],
        isPrimaryCause: false,
        score: 0.12
      },
      {
        id: 'hyp-4',
        title: 'Promotional Discounting or Coupon Failure',
        category: 'Promotional Anomaly',
        plausibility: promoIsHealthy ? 'Ruled Out' : 'Supported Inference',
        summary:
          'Investigated potential checkout discount outage. Campaign coupon API maintained 99.98% uptime with regular ad spend, ruling out marketing error.',
        supportingEvidenceIds: [],
        contradictingEvidenceIds: promoEvIds,
        unresolvedQuestions: [],
        isPrimaryCause: false,
        score: 0.05
      }
    ];

    return hypotheses;
  }

  public async synthesizeCausalReport(
    frame: ProblemFrame,
    hypotheses: Hypothesis[],
    evidence: EvidenceItem[]
  ): Promise<InvestigationReport> {
    const primaryHyp = hypotheses.find((h) => h.isPrimaryCause) || hypotheses[0];

    return {
      executiveSummary: `Investigation confirmed that the $248,500 (-32.4% WoW) revenue decline in ${frame.businessArea} during ${frame.timeWindow} was caused by physical inventory stockouts of SKU-409 and SKU-412. The stockouts were directly precipitated by a 9-day customs delay on inbound shipment PO-88321. Competing explanations including macro demand drop and promotional bugs were evaluated and contradicted by traffic and campaign uptime records.`,
      timeWindow: frame.timeWindow,
      affectedBusinessArea: frame.businessArea,
      metricsSummary: [
        { label: 'Weekly Revenue Shortfall', value: '$248,500', delta: '-32.4%' },
        { label: 'Lost Product Units', value: '1,420 units', delta: '-68%' },
        { label: 'Delayed Inbound Units', value: '4,500 units', delta: '+9 Days Late' },
        { label: 'Storefront Traffic Trend', value: '184,200 visits', delta: '+4.2% YoY' }
      ],
      primaryRootCause: `${primaryHyp.title}: 0 available inventory due to supplier PO-88321 9-day port delay.`,
      plausibilityRationale:
        'Causal correlation established: SKU-409 and SKU-412 depleted on Oct 16. Checkout dropouts commenced immediately at 14:24 UTC. Web storefront demand was verified healthy (+4.2% traffic), proving lost sales were supply-constrained rather than demand-constrained.',
      limitationsAndMissingData: [
        'Carrier transshipment notice logs prior to Long Beach departure were unavailable in EDI 856.',
        'Customer satisfaction surveys for cart abandonment during the out-of-stock window are pending analysis.'
      ],
      calculatedBusinessImpact:
        'Estimated ongoing revenue loss of $42,000 per day until fulfillment centers are replenished with cleared units.',
      recommendedNextSteps: [
        'Authorize expedited air/cross-dock transport for cleared PO-88321 units from Long Beach to West & Midwest DCs (Expected recovery: 24h).',
        'Raise dynamic ERP safety stock buffer parameter from 3 days to 10 days to absorb future ocean transshipment volatility.',
        'Issue proactive stock-alert backorder vouchers to 382 abandoned checkout customers.'
      ]
    };
  }
}
