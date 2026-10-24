import { Investigation, DataSourceStatus, UserSession } from '../types';

export const CURRENT_DEMO_USER: UserSession = {
  id: 'usr_demo_01',
  name: 'Elena Rostova',
  email: 'elena.rostova@apexretail.io',
  role: 'business_owner',
  workspaceName: 'Apex Electronics [Demo Workspace]',
  isDemoMode: true
};

export const INITIAL_DATA_SOURCES: DataSourceStatus[] = [
  {
    id: 'src_zetaris',
    name: 'Zetaris Cross-Source Data Virtualizer',
    provider: 'Zetaris',
    category: 'Federated Data',
    status: 'demo_seeded',
    description: 'Unified cross-source SQL abstraction over Postgres Sales DB, SAP Inventory, and Supplier EDI.',
    lastSync: '10 mins ago',
    recordsCount: 42800,
    notes: 'Phase 1: Seeded demo data mimicking multi-source joins. Live connector scheduled for Phase 3.'
  },
  {
    id: 'src_meterless',
    name: 'Meterless Workflow Continuity & H-MEM',
    provider: 'Meterless',
    category: 'Context & Memory',
    status: 'phase3_pending',
    description: 'Investigation graph state preservation and workflow memory across browser reloads.',
    lastSync: 'Awaiting Phase 3',
    notes: 'Local state persistence active for Phase 1 UI demo; Meterless engine hooks ready for Phase 3.'
  },
  {
    id: 'src_nemotron',
    name: 'NVIDIA Nemotron Reasoning Engine',
    provider: 'NVIDIA Nemotron',
    category: 'Reasoning LLM',
    status: 'phase3_pending',
    description: 'Structured causal hypothesis evaluation, fact vs inference classification, and tool routing.',
    lastSync: 'Awaiting Phase 3',
    notes: 'Phase 1 runs deterministic demo reasoning graph. Nemotron 70B API integration connects in Phase 3.'
  },
  {
    id: 'src_postgres',
    name: 'Transactional Store (Sales & Orders)',
    provider: 'PostgreSQL',
    category: 'Storage',
    status: 'demo_seeded',
    description: 'Local snapshot of weekly sales receipts, unit volumes, and regional fulfillment hubs.',
    lastSync: '22 mins ago',
    recordsCount: 14250,
    notes: 'Seeded test dataset covering Weeks 40-43 sales and return logs.'
  }
];

export const FLAGSHIP_INVESTIGATION: Investigation = {
  id: 'inv-2026-0881',
  title: 'Investigate -32.4% Sales Decline in Audio Category (Week 42)',
  incidentType: 'Revenue Anomaly / Sales Drop',
  severity: 'critical',
  status: 'pending_approval',
  startedAt: '2026-10-24 09:15:00 UTC',
  updatedAt: '2026-10-24 09:42:30 UTC',
  businessArea: 'Consumer Electronics / Audio Hardware',
  targetTimeWindow: 'October 14 - October 21, 2026 (Week 42)',
  summary: 'Sales dropped $248,500 (-32.4% WoW). Agent evaluated 4 competing hypotheses. Root cause proven: Stockout of flagship SKU-409 & SKU-412 caused by 9-day port delay on Supplier PO-88321, not demand drop or marketing channel failure.',
  isDemoSeed: true,
  timeline: [
    {
      id: 'step-1',
      title: 'Incident Detected & Problem Frame Defined',
      description: 'Identified -32.4% sales drop in Audio category between Oct 14-21 compared to 6-week rolling baseline.',
      status: 'completed',
      timestamp: '09:15:02 UTC',
      sourceTool: 'InternalEngine'
    },
    {
      id: 'step-2',
      title: 'Cross-Source Schema Mapping via Zetaris',
      description: 'Federated query across Sales Transactions, Warehouse Inventory (WMS), and Supplier EDI.',
      status: 'completed',
      timestamp: '09:15:18 UTC',
      sourceTool: 'Zetaris'
    },
    {
      id: 'step-3',
      title: 'Competing Hypotheses Generated',
      description: 'Structured 4 hypotheses: (1) Out of Stock, (2) Supplier Delivery Failure, (3) Demand Collapse, (4) Promo Anomaly.',
      status: 'completed',
      timestamp: '09:15:35 UTC',
      sourceTool: 'Nemotron'
    },
    {
      id: 'step-4',
      title: 'Evidence Gathering & Fact Distinction',
      description: 'Extracted 6 source records. Verified traffic did not decline (+4.2% visits), eliminating demand collapse hypothesis.',
      status: 'completed',
      timestamp: '09:16:10 UTC',
      sourceTool: 'Zetaris'
    },
    {
      id: 'step-5',
      title: 'Causal Chain Grounding & Action Formulation',
      description: 'Correlated Supplier PO-88321 delay (+9 days) directly to inventory depletion on Oct 16. Formulated mitigation.',
      status: 'completed',
      timestamp: '09:16:45 UTC',
      sourceTool: 'Nemotron'
    },
    {
      id: 'step-6',
      title: 'Human Review & Action Approval Gate',
      description: 'Recommended expedited supplier shipment and regional safety-stock redistribution awaiting human sign-off.',
      status: 'in_progress',
      timestamp: '09:17:00 UTC',
      sourceTool: 'Meterless'
    }
  ],
  hypotheses: [
    {
      id: 'hyp-1',
      title: 'Critical Stockout of Top-Tier Revenue Drivers',
      category: 'Stockouts',
      plausibility: 'High Plausibility',
      summary: 'SKU-409 (Apex Pro ANC Headphones) and SKU-412 (Ultra Soundbar Gen 2) reached 0 available units on Oct 16. These two items represent 41% of category revenue.',
      supportingEvidenceIds: ['ev-1', 'ev-2'],
      contradictingEvidenceIds: [],
      unresolvedQuestions: ['Why did reorder point fail to trigger automatic buffer stock safety alert?'],
      isPrimaryCause: true
    },
    {
      id: 'hyp-2',
      title: 'Supplier Delay on Component PO-88321',
      category: 'Supplier Delays',
      plausibility: 'Supported Inference',
      summary: 'PO-88321 from Shenzhen Acoustics was scheduled for delivery on Oct 11, delayed 9 days to Oct 20 due to transshipment customs inspection in Long Beach.',
      supportingEvidenceIds: ['ev-3', 'ev-4'],
      contradictingEvidenceIds: [],
      unresolvedQuestions: ['Did the freight forwarder give advance notice before the carrier departed?']
    },
    {
      id: 'hyp-3',
      title: 'Consumer Demand Drop / Macro Market Shift',
      category: 'Demand Drop',
      plausibility: 'Unlikely / Contradicted',
      summary: 'Storefront sessions and product page impressions for the Audio category remained steady (+4.2% YoY). Cart-add conversion dropped sharply only after stockout badges appeared.',
      supportingEvidenceIds: [],
      contradictingEvidenceIds: ['ev-5'],
      unresolvedQuestions: []
    },
    {
      id: 'hyp-4',
      title: 'Promotional or Discounting Malfunction',
      category: 'Promotional Anomaly',
      plausibility: 'Ruled Out',
      summary: 'Marketing campaigns were active and coupon codes functioned properly. Paid search spend was unchanged.',
      supportingEvidenceIds: [],
      contradictingEvidenceIds: ['ev-6'],
      unresolvedQuestions: []
    }
  ],
  evidence: [
    {
      id: 'ev-1',
      title: 'Category Revenue Waterfall (Week 42)',
      category: 'fact',
      sourceId: 'src_zetaris',
      sourceName: 'Zetaris / Postgres Sales DB',
      sourceUri: 'zetaris://sales_db/trans_2026_w42_summary',
      timestamp: '2026-10-21 23:59:00 UTC',
      description: 'Audio category gross merchandise volume dropped from $767,000 (W41) to $518,500 (W42). 84% of the dollar shortfall is concentrated on SKU-409 and SKU-412.',
      metrics: [
        { label: 'Weekly Revenue', value: '$518,500', delta: '-32.4%' },
        { label: 'Lost Units', value: '1,420 units', delta: '-68%' },
        { label: 'Direct Shortfall', value: '$208,740', delta: '84% of drop' }
      ],
      isDemoSeed: true,
      confidenceBasis: 'Direct transactional reconciliation across 4,210 verified checkout logs.'
    },
    {
      id: 'ev-2',
      title: 'WMS Inventory Depletion Timeline',
      category: 'fact',
      sourceId: 'src_zetaris',
      sourceName: 'Zetaris / Manhattan WMS',
      sourceUri: 'zetaris://wms_db/inventory_levels/skus/409_412',
      timestamp: '2026-10-16 14:22:10 UTC',
      description: 'SKU-409 reached zero inventory at 14:22 UTC on Wednesday Oct 16. SKU-412 ran out on Oct 17 08:15 UTC across all 3 US regional fulfillment hubs.',
      metrics: [
        { label: 'SKU-409 Stock', value: '0 units', delta: 'Stockout Oct 16' },
        { label: 'SKU-412 Stock', value: '0 units', delta: 'Stockout Oct 17' },
        { label: 'Backorder Queue', value: '382 orders', delta: 'Unfulfilled' }
      ],
      isDemoSeed: true,
      confidenceBasis: 'Physical warehouse scanned counts and inventory ledger balance logs.'
    },
    {
      id: 'ev-3',
      title: 'Supplier EDI Delivery Exception PO-88321',
      category: 'fact',
      sourceId: 'src_zetaris',
      sourceName: 'Zetaris / EDI 856 ASN Gateway',
      sourceUri: 'zetaris://edi_gateway/pos/88321/events',
      timestamp: '2026-10-12 04:00:00 UTC',
      description: 'Shenzhen Acoustics shipment containing 3,000 units of SKU-409 and 1,500 units of SKU-412 held at Port of Long Beach. Original ETA was Oct 11; revised arrival Oct 20.',
      metrics: [
        { label: 'Delay Duration', value: '9 Days', delta: 'Late' },
        { label: 'Delayed Units', value: '4,500 units', delta: 'In Transit' },
        { label: 'Port Status', value: 'Customs Hold', delta: 'Released Oct 19' }
      ],
      isDemoSeed: true,
      confidenceBasis: 'Direct carrier EDI 856 advance ship notice status updates.'
    },
    {
      id: 'ev-4',
      title: 'Causal Linkage: Inbound Delay to Stockout Duration',
      category: 'inference',
      sourceId: 'src_nemotron',
      sourceName: 'Nemotron Causal Analysis',
      sourceUri: 'nemotron://reasoning/eval/causal_chain_0881',
      timestamp: '2026-10-24 09:16:30 UTC',
      description: 'Given average daily sales velocity of 180 units/day, safety stock was only sized for a 3-day buffer. A 9-day supplier delay mathematically guarantees a 5 to 6 day complete stockout.',
      metrics: [
        { label: 'Safety Buffer', value: '3 Days', delta: 'Under-provisioned' },
        { label: 'Exposure Window', value: '6 Days', delta: 'Zero-revenue period' }
      ],
      isDemoSeed: true,
      confidenceBasis: 'Deterministic inventory burn rate vs actual delivery delta calculation.'
    },
    {
      id: 'ev-5',
      title: 'Digital Storefront Traffic & Search Volume',
      category: 'fact',
      sourceId: 'src_zetaris',
      sourceName: 'Zetaris / Clickstream Analytics',
      sourceUri: 'zetaris://web_analytics/events/audio_catalog',
      timestamp: '2026-10-21 23:59:00 UTC',
      description: 'Total user visits to the Audio collection page rose +4.2% WoW. Bounce rate increased exclusively on out-of-stock product detail pages, proving high underlying demand.',
      metrics: [
        { label: 'Collection Traffic', value: '184,200 visits', delta: '+4.2% WoW' },
        { label: 'Search Queries', value: '42,100 queries', delta: '+6.1% WoW' }
      ],
      isDemoSeed: true,
      confidenceBasis: 'Raw web server access logs and telemetry events.'
    },
    {
      id: 'ev-6',
      title: 'Promotional Campaign Audit & Discount Verification',
      category: 'fact',
      sourceId: 'src_zetaris',
      sourceName: 'Zetaris / Marketing DB',
      sourceUri: 'zetaris://promo_engine/campaigns/autumn_audio',
      timestamp: '2026-10-20 18:00:00 UTC',
      description: 'Autumn Audio 15% discount code remained active with 99.98% coupon API uptime. No pricing errors or broken links detected.',
      metrics: [
        { label: 'Campaign Uptime', value: '99.98%', delta: 'Healthy' },
        { label: 'Ad Spend', value: '$24,500', delta: 'On budget' }
      ],
      isDemoSeed: true,
      confidenceBasis: 'Coupon gateway server logs and Google Ads spend reconciliation.'
    }
  ],
  nodes: [
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
        description: 'Revenue anomaly in Audio Category between Oct 14-21, 2026.',
        sourceUri: 'zetaris://sales_db/trans_2026_w42_summary',
        metrics: { 'Drop': '-32.4%', 'Lost Revenue': '$248.5K' }
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
        sourceUri: 'zetaris://wms_db/inventory_levels/skus/409',
        metrics: { 'Revenue Share': '28%', 'Price': '$299' }
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
        sourceUri: 'zetaris://wms_db/inventory_levels/skus/412',
        metrics: { 'Revenue Share': '13%', 'Price': '$399' }
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
        sourceUri: 'zetaris://wms_db/inventory_levels/skus/409_412',
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
        sourceUri: 'zetaris://edi_gateway/pos/88321/events',
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
        title: 'Market Demand Collapse (Rejected)',
        description: 'Contradicted by web analytics: traffic rose +4.2% WoW with high intent.',
        sourceUri: 'zetaris://web_analytics/events/audio_catalog',
        metrics: { 'Traffic': '+4.2%', 'Verdict': 'Contradicted' }
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
        metrics: { 'Recovery ETA': '48 Hours', 'Approval': 'Pending' }
      }
    }
  ],
  edges: [
    { id: 'e1', source: 'node-inc', target: 'node-p409', label: 'Primary Contributor (-$152k)', isKeyPath: true },
    { id: 'e2', source: 'node-inc', target: 'node-p412', label: 'Secondary Contributor (-$56k)', isKeyPath: true },
    { id: 'e3', source: 'node-p409', target: 'node-inv-stock', label: 'Triggered By 0-Stock', isKeyPath: true },
    { id: 'e4', source: 'node-p412', target: 'node-inv-stock', label: 'Triggered By 0-Stock', isKeyPath: true },
    { id: 'e5', source: 'node-inv-stock', target: 'node-supp-del', label: 'Direct Causal Root', isKeyPath: true },
    { id: 'e6', source: 'node-inc', target: 'node-hyp-demand', label: 'Tested Explanation', isInferred: true },
    { id: 'e7', source: 'node-supp-del', target: 'node-act-rec', label: 'Resolution Target', isKeyPath: true }
  ],
  actions: [
    {
      id: 'act-01',
      title: 'Expedite Air-Freight Transit for Inbound PO-88321 Cross-Dock',
      actionType: 'supplier_escalation',
      rationale: 'PO-88321 cleared customs on Oct 19. Authorizing emergency cross-dock distribution directly to West & Midwest DCs recovers stock in 24 hours instead of 5 days ground freight.',
      supportingEvidence: ['ev-1', 'ev-2', 'ev-3'],
      expectedOutcome: 'Restores 4,500 active units of SKU-409 & SKU-412 across fulfillment centers, preventing an estimated $42,000/day in continued lost sales.',
      risksAndLimitations: 'Expedited cross-dock fee costs $6,400. Reclaims estimated $84,000 in net gross margin over 48 hours.',
      requiresApproval: true,
      approvalStatus: 'pending',
      verificationMethod: 'Monitor WMS available-to-promise inventory levels within 24 hours of cross-dock delivery scan.',
      isExecutableInPhase: false
    },
    {
      id: 'act-02',
      title: 'Update Dynamic Safety Stock Threshold from 3 to 10 Days in ERP',
      actionType: 'inventory_reallocation',
      rationale: 'Current 3-day buffer assumption failed when port lead-times fluctuated. Expanding buffer prevents future single-supplier vulnerability.',
      supportingEvidence: ['ev-4'],
      expectedOutcome: 'Automates replenishment reorders 7 days earlier during peak ocean transit delays.',
      risksAndLimitations: 'Increases holding capital by ~$18,500 per SKU across the audio category.',
      requiresApproval: true,
      approvalStatus: 'pending',
      verificationMethod: 'Verify MRP (Material Requirements Planning) safety-stock parameter table reflects 10-day buffer.',
      isExecutableInPhase: false
    }
  ]
};

export const INVESTIGATION_HISTORY_SEED: Investigation[] = [
  FLAGSHIP_INVESTIGATION,
  {
    id: 'inv-2026-0842',
    title: 'Late Supplier Delivery Spike from East Asia Freight Forwarder',
    incidentType: 'Supply Chain Friction',
    severity: 'high',
    status: 'completed',
    startedAt: '2026-10-10 14:00:00 UTC',
    updatedAt: '2026-10-12 11:30:00 UTC',
    businessArea: 'Global Logistics / Inbound Ports',
    targetTimeWindow: 'October 1 - October 10, 2026',
    summary: 'Investigated average transit lead-time expansion from 14 to 26 days across 8 container shipments. Identified carrier schedule cancellation and redirected backup allocations.',
    isDemoSeed: true,
    timeline: [],
    hypotheses: [],
    evidence: [],
    nodes: [],
    edges: [],
    actions: [
      {
        id: 'act-hist-01',
        title: 'Switch Secondary Routing to Pacific North Direct Carrier',
        actionType: 'supplier_escalation',
        rationale: 'Bypasses congested Southern transshipment hub.',
        supportingEvidence: ['ev-hist-1'],
        expectedOutcome: 'Cut lead time by 8 days.',
        risksAndLimitations: 'Higher container spot rate (+8%).',
        requiresApproval: true,
        approvalStatus: 'approved',
        verificationMethod: 'Container GPS telemetry check.',
        isExecutableInPhase: false
      }
    ]
  },
  {
    id: 'inv-2026-0799',
    title: 'Surge in Return Rate on High-End Smart Display SKU-204',
    incidentType: 'Product Quality / Return Rate',
    severity: 'medium',
    status: 'completed',
    startedAt: '2026-09-28 08:30:00 UTC',
    updatedAt: '2026-09-30 16:45:00 UTC',
    businessArea: 'Smart Home / Hardware Quality',
    targetTimeWindow: 'September 15 - September 28, 2026',
    summary: 'Return rate escalated to 14.8%. Correlated customer complaint transcripts with firmware patch v2.4.1 Wi-Fi pairing timeout. Resolved via OTA firmware fix.',
    isDemoSeed: true,
    timeline: [],
    hypotheses: [],
    evidence: [],
    nodes: [],
    edges: [],
    actions: [
      {
        id: 'act-hist-02',
        title: 'Emergency Rollback to Firmware v2.4.0',
        actionType: 'discount_hold',
        rationale: 'Stop pairing failure loop for newly unboxed units.',
        supportingEvidence: ['ev-hist-2'],
        expectedOutcome: 'Returns decrease back to 2.1%.',
        risksAndLimitations: 'Temporary loss of new Bluetooth widget.',
        requiresApproval: true,
        approvalStatus: 'approved',
        verificationMethod: 'Customer return RMA dashboard monitoring.',
        isExecutableInPhase: false
      }
    ]
  }
];

export const STARTER_QUESTIONS = [
  {
    category: 'Sales Decline (Flagship)',
    query: 'Why did our sales drop by 30% this week in the audio hardware category?',
    description: 'Investigate $248k sales shortfall, compare stockouts vs demand drop vs promo issues.'
  },
  {
    category: 'Stockouts & Inventory',
    query: 'Which high-demand products are experiencing stockouts and why did reorders fail?',
    description: 'Trace warehouse inventory levels and reorder buffer depletion across fulfillment hubs.'
  },
  {
    category: 'Supplier Delays',
    query: 'Are supplier delivery delays affecting our North American product distribution?',
    description: 'Inspect EDI carrier notifications, customs holds, and inbound freight lead times.'
  }
];
