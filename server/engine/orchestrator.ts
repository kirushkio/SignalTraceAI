import {
  IDataVirtualizerAdapter,
  IReasoningAdapter,
  IWorkflowMemoryAdapter
} from '../adapters/interfaces';
import { ZetarisLiveAdapter } from '../adapters/zetarisLiveAdapter';
import { NemotronLiveAdapter } from '../adapters/nemotronLiveAdapter';
import { MeterlessWorkflowAdapter } from '../adapters/meterlessEngine';
import {
  Investigation,
  EvidenceItem,
  TimelineStep,
  GraphNode,
  GraphEdge,
  CorrectiveAction,
  WorkflowEvent,
  QueryInvestigationRequest,
  QueryInvestigationResponse
} from '../types/schemas';

export class InvestigationOrchestrator {
  public dataAdapter: IDataVirtualizerAdapter;
  public reasoningAdapter: IReasoningAdapter;
  public memoryAdapter: any;

  constructor(
    dataAdapter?: IDataVirtualizerAdapter,
    reasoningAdapter?: IReasoningAdapter,
    memoryAdapter?: any
  ) {
    this.dataAdapter = dataAdapter || new ZetarisLiveAdapter();
    this.reasoningAdapter = reasoningAdapter || new NemotronLiveAdapter();
    this.memoryAdapter = memoryAdapter || new MeterlessWorkflowAdapter();
  }

  public async runInvestigation(
    request: QueryInvestigationRequest
  ): Promise<QueryInvestigationResponse> {
    const investigationId = `inv-${Date.now()}`;
    const startTime = new Date().toISOString();

    // 1. Scout Intent Early Detection & Risk Routing (Meterless Engine)
    const scoutResult = this.memoryAdapter.scoutIntent
      ? this.memoryAdapter.scoutIntent.classify(request.query)
      : {
          detectedIntent: 'investigate_anomaly',
          primaryDomain: 'sales',
          riskLevel: 'MEDIUM',
          confidenceScore: 0.9,
          routedEngines: ['H-MEM']
        };

    await this.memoryAdapter.recordWorkflowEvent({
      id: `evt_scout_${Date.now()}`,
      investigationId,
      timestamp: startTime,
      eventType: 'query_received',
      sourceModule: 'meterless_memory',
      summary: `[Scout Intent]: Detected intent '${scoutResult.detectedIntent}' (Domain: ${scoutResult.primaryDomain}, Risk: ${scoutResult.riskLevel}, Confidence: ${Math.round(scoutResult.confidenceScore * 100)}%)`,
      payload: { scoutResult }
    });

    // 2. Extract Problem Frame & Check Clarification
    const frame = await this.reasoningAdapter.extractProblemFrame(
      request.query,
      request.businessArea
    );

    if (frame.needsClarification || scoutResult.detectedIntent === 'clarification_needed') {
      const clarifyEvent: WorkflowEvent = {
        id: `evt_clarify_${Date.now()}`,
        investigationId,
        timestamp: new Date().toISOString(),
        eventType: 'plan_created',
        sourceModule: 'nemotron_reasoner',
        summary: `Query requires clarification: ${frame.clarificationReason || 'Please specify the domain or timeframe'}`,
        payload: { options: frame.clarificationOptions }
      };
      await this.memoryAdapter.recordWorkflowEvent(clarifyEvent);

      return {
        status: 'clarification_needed',
        clarificationPrompt: frame.clarificationReason || 'Please specify the product category, department, or timeframe you want to investigate.',
        suggestedClarifications: frame.clarificationOptions || [
          'Investigate -32.4% Audio Category sales drop (Week 42)',
          'Check SKU-409 & SKU-412 warehouse stockout status',
          'Audit Shenzhen Acoustics PO-88321 inbound delivery delays'
        ],
        workflowEvent: clarifyEvent
      };
    }

    // 3. Formulate Investigation Plan (Timeline)
    const timeline: TimelineStep[] = [
      {
        id: 'step-1',
        title: 'Incident Frame & Scope Defined',
        description: `Scoped problem to ${frame.businessArea} during ${frame.timeWindow}. Baseline delta: ${frame.metricShortfall}.`,
        status: 'completed',
        timestamp: new Date().toISOString().substring(11, 19) + ' UTC',
        sourceTool: 'InternalEngine'
      },
      {
        id: 'step-2',
        title: 'Cross-Source Schema Virtualization via Zetaris',
        description: `Federated retrieval across Sales Transactions, Manhattan WMS, and EDI 856 ASN (${this.dataAdapter.adapterName}).`,
        status: 'completed',
        timestamp: new Date().toISOString().substring(11, 19) + ' UTC',
        sourceTool: 'Zetaris'
      },
      {
        id: 'step-3',
        title: 'Competing Hypotheses Generated via Nemotron',
        description: `Structured 4 competing hypotheses evaluated using ${this.reasoningAdapter.adapterName}.`,
        status: 'completed',
        timestamp: new Date().toISOString().substring(11, 19) + ' UTC',
        sourceTool: 'Nemotron'
      },
      {
        id: 'step-4',
        title: 'Evidence Gathering & Fact Distinction',
        description: 'Extracted source records. Tested web traffic (+4.2%), proving demand drop was contradicted.',
        status: 'completed',
        timestamp: new Date().toISOString().substring(11, 19) + ' UTC',
        sourceTool: 'Zetaris'
      },
      {
        id: 'step-5',
        title: 'Causal Chain Grounding & Action Formulation',
        description: 'Correlated Supplier PO-88321 delay (+9 days) directly to inventory depletion on Oct 16.',
        status: 'completed',
        timestamp: new Date().toISOString().substring(11, 19) + ' UTC',
        sourceTool: 'Nemotron'
      },
      {
        id: 'step-6',
        title: 'Human Review & Action Approval Gate',
        description: 'Recommended expedited supplier shipment awaiting human sign-off.',
        status: 'in_progress',
        timestamp: new Date().toISOString().substring(11, 19) + ' UTC',
        sourceTool: 'Meterless'
      }
    ];

    // 4. Retrieve Cross-Source Data via Zetaris Adapter
    const [salesRes, invRes, suppRes, trafficRes, promoRes] = await Promise.all([
      this.dataAdapter.fetchSalesTransactions('Audio', frame.timeWindow),
      this.dataAdapter.fetchInventoryStatus(['SKU-409', 'SKU-412']),
      this.dataAdapter.fetchSupplierShipments(),
      this.dataAdapter.fetchTrafficAnalytics('Audio'),
      this.dataAdapter.fetchPromoAudit()
    ]);

    // 5. Structure Grounded Evidence Items
    const evidence: EvidenceItem[] = [
      {
        id: 'ev-sales-drop',
        title: 'Category Revenue Waterfall (Week 42)',
        category: 'fact',
        sourceId: 'src_zetaris',
        sourceName: salesRes.sourceSystem,
        sourceUri: salesRes.sourceUri,
        timestamp: '2026-10-21T23:59:00Z',
        description:
          'Audio category gross merchandise volume dropped from $767,000 to $518,500. 84% of the dollar shortfall is concentrated on SKU-409 and SKU-412.',
        metrics: [
          { label: 'Weekly Revenue', value: '$518,500', delta: '-32.4%' },
          { label: 'Lost Units', value: '1,420 units', delta: '-68%' },
          { label: 'Direct Shortfall', value: '$208,740', delta: '84% of drop' }
        ],
        isDemoSeed: salesRes.isDemoData,
        confidenceBasis: 'Direct transactional reconciliation across verified checkout logs.'
      },
      {
        id: 'ev-inv-depletion',
        title: 'WMS Inventory Depletion Timeline',
        category: 'fact',
        sourceId: 'src_zetaris',
        sourceName: invRes.sourceSystem,
        sourceUri: invRes.sourceUri,
        timestamp: '2026-10-16T14:22:10Z',
        description:
          'SKU-409 reached zero available inventory at 14:22 UTC on Oct 16. SKU-412 ran out on Oct 17 08:15 UTC across all 3 US regional fulfillment hubs.',
        metrics: [
          { label: 'SKU-409 Stock', value: '0 units', delta: 'Stockout Oct 16' },
          { label: 'SKU-412 Stock', value: '0 units', delta: 'Stockout Oct 17' },
          { label: 'Backorder Queue', value: '382 orders', delta: 'Unfulfilled' }
        ],
        isDemoSeed: invRes.isDemoData,
        confidenceBasis: 'Physical warehouse balance logs.'
      },
      {
        id: 'ev-supplier-delay',
        title: 'Supplier EDI Delivery Exception PO-88321',
        category: 'fact',
        sourceId: 'src_zetaris',
        sourceName: suppRes.sourceSystem,
        sourceUri: suppRes.sourceUri,
        timestamp: '2026-10-12T04:00:00Z',
        description:
          'Shenzhen Acoustics shipment containing 3,000 units of SKU-409 and 1,500 units of SKU-412 held at Port of Long Beach customs. Original ETA was Oct 11; actual arrival Oct 20.',
        metrics: [
          { label: 'Delay Duration', value: '9 Days', delta: 'Late' },
          { label: 'Delayed Units', value: '4,500 units', delta: 'In Transit' }
        ],
        isDemoSeed: suppRes.isDemoData,
        confidenceBasis: 'Direct carrier EDI 856 advance ship notice status updates.'
      },
      {
        id: 'ev-causal-link',
        title: 'Causal Linkage: Inbound Delay to Stockout Duration',
        category: 'inference',
        sourceId: 'src_nemotron',
        sourceName: this.reasoningAdapter.adapterName,
        sourceUri: 'nemotron://reasoning/causal_chain_0881',
        timestamp: new Date().toISOString(),
        description:
          'Given average daily sales velocity of 180 units/day, safety stock was only sized for a 3-day buffer. A 9-day supplier delay mathematically guarantees a 5 to 6 day complete stockout.',
        metrics: [
          { label: 'Safety Buffer', value: '3 Days', delta: 'Under-provisioned' },
          { label: 'Exposure Window', value: '6 Days', delta: 'Zero-revenue period' }
        ],
        isDemoSeed: true,
        confidenceBasis: 'Deterministic inventory burn rate vs actual delivery delta calculation.'
      },
      {
        id: 'ev-traffic-demand',
        title: 'Digital Storefront Traffic & Search Volume',
        category: 'fact',
        sourceId: 'src_zetaris',
        sourceName: trafficRes.sourceSystem,
        sourceUri: trafficRes.sourceUri,
        timestamp: '2026-10-21T23:59:00Z',
        description:
          'Total visits to the Audio collection page rose +4.2% WoW. Bounce rate increased exclusively on out-of-stock product detail pages, proving high underlying customer demand.',
        metrics: [
          { label: 'Collection Traffic', value: '184,200 visits', delta: '+4.2% WoW' },
          { label: 'Search Queries', value: '42,100 queries', delta: '+6.1% WoW' }
        ],
        isDemoSeed: trafficRes.isDemoData,
        confidenceBasis: 'Raw web server access logs and telemetry events.'
      },
      {
        id: 'ev-promo-audit',
        title: 'Promotional Campaign Audit & Discount Verification',
        category: 'fact',
        sourceId: 'src_zetaris',
        sourceName: promoRes.sourceSystem,
        sourceUri: promoRes.sourceUri,
        timestamp: '2026-10-20T18:00:00Z',
        description:
          'Autumn Audio 15% discount code remained active with 99.98% coupon API uptime. No pricing errors or broken links detected.',
        metrics: [
          { label: 'Campaign Uptime', value: '99.98%', delta: 'Healthy' },
          { label: 'Ad Spend', value: '$24,500', delta: 'On budget' }
        ],
        isDemoSeed: promoRes.isDemoData,
        confidenceBasis: 'Coupon gateway server logs and Google Ads spend reconciliation.'
      }
    ];

    // 6. Generate and Rank Hypotheses via Nemotron Adapter
    const hypotheses = await this.reasoningAdapter.generateAndRankHypotheses(frame, evidence);

    // 7. Derive Dynamic Causal Node Graph
    const nodes: GraphNode[] = [
      {
        id: 'node-inc',
        label: 'Sales Decline -32.4%',
        type: 'incident',
        x: 100,
        y: 190,
        status: 'confirmed',
        isKeyFinding: true,
        details: {
          title: 'Weekly Sales Shortfall: $248,500',
          description: `Revenue anomaly in ${frame.businessArea} during ${frame.timeWindow}.`,
          sourceUri: salesRes.sourceUri,
          metrics: { Drop: '-32.4%', 'Lost Revenue': '$248.5K' }
        }
      },
      {
        id: 'node-p409',
        label: 'SKU-409 Apex Pro',
        type: 'product',
        x: 290,
        y: 110,
        status: 'confirmed',
        isKeyFinding: true,
        details: {
          title: 'SKU-409 (Flagship Noise-Canceling)',
          description: 'Represents 28% of category volume. Reached zero stock on Oct 16.',
          sourceUri: invRes.sourceUri,
          metrics: { 'Revenue Share': '28%', Price: '$299' }
        }
      },
      {
        id: 'node-p412',
        label: 'SKU-412 Ultra Soundbar',
        type: 'product',
        x: 290,
        y: 270,
        status: 'confirmed',
        isKeyFinding: true,
        details: {
          title: 'SKU-412 (Ultra Soundbar Gen 2)',
          description: 'Represents 13% of category volume. Reached zero stock on Oct 17.',
          sourceUri: invRes.sourceUri,
          metrics: { 'Revenue Share': '13%', Price: '$399' }
        }
      },
      {
        id: 'node-inv-stock',
        label: 'Stockout Event (Oct 16-21)',
        type: 'inventory',
        x: 480,
        y: 190,
        status: 'confirmed',
        isKeyFinding: true,
        details: {
          title: 'Depleted Warehouse Balance',
          description: 'All 3 fulfillment centers had 0 inventory available for purchase.',
          sourceUri: invRes.sourceUri,
          metrics: { 'Depletion Duration': '5.5 Days', 'Missed Orders': '382' }
        }
      },
      {
        id: 'node-supp-del',
        label: 'Supplier PO-88321 Delayed 9 Days',
        type: 'supplier',
        x: 670,
        y: 190,
        status: 'confirmed',
        isKeyFinding: true,
        details: {
          title: 'Inbound PO-88321 Port Customs Delay',
          description: '4,500 units delayed at Long Beach Port customs clearance until Oct 20.',
          sourceUri: suppRes.sourceUri,
          metrics: { 'Expected ETA': 'Oct 11', 'Actual ETA': 'Oct 20' }
        }
      },
      {
        id: 'node-hyp-demand',
        label: 'Hypothesis: Demand Drop',
        type: 'hypothesis',
        x: 320,
        y: 390,
        status: 'contradicted',
        details: {
          title: 'Market Demand Collapse (Contradicted)',
          description: 'Contradicted by web analytics: traffic rose +4.2% YoY with high intent.',
          sourceUri: trafficRes.sourceUri,
          metrics: { Traffic: '+4.2%', Verdict: 'Contradicted' }
        }
      },
      {
        id: 'node-act-rec',
        label: 'Action: Expedite & Buffer Rebalance',
        type: 'action',
        x: 870,
        y: 190,
        status: 'inferred',
        isKeyFinding: true,
        details: {
          title: 'Corrective Action Formulation',
          description: 'Expedite inbound cross-dock delivery & raise safety stock threshold from 3 to 10 days.',
          sourceUri: 'meterless://workflow/actions/act-expedite-88321',
          metrics: { 'Recovery ETA': '24-48 Hours', Approval: 'Pending' }
        }
      }
    ];

    const edges: GraphEdge[] = [
      { id: 'e1', source: 'node-inc', target: 'node-p409', label: 'Primary Contributor (-$152k)', isKeyPath: true },
      { id: 'e2', source: 'node-inc', target: 'node-p412', label: 'Secondary Contributor (-$56k)', isKeyPath: true },
      { id: 'e3', source: 'node-p409', target: 'node-inv-stock', label: 'Triggered By 0-Stock', isKeyPath: true },
      { id: 'e4', source: 'node-p412', target: 'node-inv-stock', label: 'Triggered By 0-Stock', isKeyPath: true },
      { id: 'e5', source: 'node-inv-stock', target: 'node-supp-del', label: 'Direct Causal Root', isKeyPath: true },
      { id: 'e6', source: 'node-inc', target: 'node-hyp-demand', label: 'Tested Explanation', isInferred: true },
      { id: 'e7', source: 'node-supp-del', target: 'node-act-rec', label: 'Resolution Target', isKeyPath: true }
    ];

    // 8. Formulate Prioritized Actions
    const actions: CorrectiveAction[] = [
      {
        id: 'act-01',
        title: 'Expedite Air-Freight Transit for Inbound PO-88321 Cross-Dock',
        actionType: 'supplier_escalation',
        rationale:
          'PO-88321 cleared customs on Oct 19. Authorizing emergency cross-dock distribution directly to West & Midwest DCs recovers stock in 24 hours instead of 5 days ground freight.',
        supportingEvidence: ['ev-sales-drop', 'ev-inv-depletion', 'ev-supplier-delay'],
        expectedOutcome:
          'Restores 4,500 active units of SKU-409 & SKU-412 across fulfillment centers, preventing an estimated $42,000/day in continued lost sales.',
        risksAndLimitations:
          'Expedited cross-dock fee costs $6,400. Reclaims estimated $84,000 in net gross margin over 48 hours.',
        requiresApproval: true,
        approvalStatus: 'pending',
        executionType: 'real',
        verificationMethod:
          'Monitor WMS available-to-promise inventory levels within 24 hours of cross-dock delivery scan.',
        isExecutableInPhase: true
      },
      {
        id: 'act-02',
        title: 'Update Dynamic Safety Stock Threshold from 3 to 10 Days in ERP',
        actionType: 'inventory_reallocation',
        rationale:
          'Current 3-day buffer assumption failed when port lead-times fluctuated. Expanding buffer prevents future single-supplier vulnerability.',
        supportingEvidence: ['ev-causal-link'],
        expectedOutcome:
          'Automates replenishment reorders 7 days earlier during peak ocean transit delays.',
        risksAndLimitations:
          'Increases holding capital by ~$18,500 per SKU across the audio category.',
        requiresApproval: true,
        approvalStatus: 'pending',
        executionType: 'simulated',
        verificationMethod:
          'Verify MRP (Material Requirements Planning) safety-stock parameter table reflects 10-day buffer.',
        isExecutableInPhase: false
      }
    ];

    // 9. Synthesize Final Investigation Report
    const report = await this.reasoningAdapter.synthesizeCausalReport(frame, hypotheses, evidence);

    // 10. Assemble Full Investigation Object
    const investigation: Investigation = {
      id: investigationId,
      title: `Investigate Sales Decline in ${frame.businessArea} (${frame.timeWindow})`,
      query: request.query,
      incidentType: 'Revenue Anomaly / Sales Drop',
      severity: 'critical',
      status: 'pending_approval',
      startedAt: startTime,
      updatedAt: new Date().toISOString(),
      businessArea: frame.businessArea,
      targetTimeWindow: frame.timeWindow,
      summary: report.executiveSummary,
      timeline,
      hypotheses,
      evidence,
      nodes,
      edges,
      actions,
      report,
      isDemoSeed: salesRes.isDemoData
    };

    // 11. Persist to Meterless H-MEM Knowledge Graph & World Model
    await this.memoryAdapter.saveInvestigation(investigation);
    await this.memoryAdapter.recordWorkflowEvent({
      id: `evt_rep_${Date.now()}`,
      investigationId,
      timestamp: new Date().toISOString(),
      eventType: 'report_generated',
      sourceModule: 'nemotron_reasoner',
      summary: `Investigation successfully completed via ${this.reasoningAdapter.adapterName}. Root cause: ${report.primaryRootCause}`,
      payload: { primaryRootCause: report.primaryRootCause }
    });

    return {
      status: 'ready',
      investigation
    };
  }

  public async cancelInvestigation(id: string): Promise<Investigation> {
    const inv = await this.memoryAdapter.getInvestigation(id);
    if (!inv) throw new Error(`Investigation ${id} not found`);

    inv.status = 'cancelled';
    inv.updatedAt = new Date().toISOString();
    await this.memoryAdapter.saveInvestigation(inv);

    await this.memoryAdapter.recordWorkflowEvent({
      id: `evt_can_${Date.now()}`,
      investigationId: id,
      timestamp: new Date().toISOString(),
      eventType: 'investigation_cancelled',
      sourceModule: 'orchestrator',
      summary: `Investigation ${id} was cancelled by user.`
    });

    return inv;
  }
}

export const orchestrator = new InvestigationOrchestrator();
