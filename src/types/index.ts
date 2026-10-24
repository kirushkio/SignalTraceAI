export type NavView = 'dashboard' | 'console' | 'workspace' | 'history' | 'datasources' | 'auth';

export type UserRole = 'business_owner' | 'supply_chain_manager' | 'business_analyst';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  workspaceName: string;
  isDemoMode: boolean;
}

export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';

export type InvestigationStatus = 'active' | 'in_progress' | 'completed' | 'pending_approval' | 'reopened' | 'cancelled';

export interface WorkflowEvent {
  id: string;
  investigationId: string;
  timestamp: string;
  eventType: 'query_received' | 'plan_created' | 'data_retrieved' | 'hypothesis_evaluated' | 'report_generated' | 'action_proposed' | 'approval_granted' | 'approval_rejected' | 'action_executed' | 'verification_completed' | 'investigation_cancelled' | 'error_logged';
  sourceModule: 'orchestrator' | 'zetaris_virtualizer' | 'nemotron_reasoner' | 'meterless_memory' | 'action_executor';
  summary: string;
  payload?: Record<string, any>;
  isError?: boolean;
}

export interface TimelineStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'pending' | 'failed';
  timestamp?: string;
  sourceTool?: 'Zetaris' | 'Nemotron' | 'Meterless' | 'InternalEngine';
}

export type EvidenceCategory = 'fact' | 'inference' | 'hypothesis' | 'unresolved';

export interface EvidenceItem {
  id: string;
  title: string;
  category: EvidenceCategory;
  sourceId: string;
  sourceName: string;
  sourceUri: string;
  timestamp: string;
  description: string;
  metrics?: { label: string; value: string; delta?: string }[];
  isDemoSeed: boolean;
  confidenceBasis?: string;
  rawRecordSnippet?: Record<string, any>;
}

export interface Hypothesis {
  id: string;
  title: string;
  category: 'Stockouts' | 'Supplier Delays' | 'Demand Drop' | 'Promotional Anomaly' | 'Pricing/Competitor';
  plausibility: 'High Plausibility' | 'Supported Inference' | 'Unlikely / Contradicted' | 'Ruled Out';
  summary: string;
  supportingEvidenceIds: string[];
  contradictingEvidenceIds: string[];
  unresolvedQuestions: string[];
  isPrimaryCause?: boolean;
  score?: number;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'incident' | 'product' | 'sales' | 'inventory' | 'supplier' | 'evidence' | 'hypothesis' | 'action';
  x: number;
  y: number;
  status?: 'confirmed' | 'inferred' | 'contradicted';
  isKeyFinding?: boolean;
  details: {
    title: string;
    description: string;
    timestamp?: string;
    sourceUri?: string;
    metrics?: Record<string, string>;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  isInferred?: boolean;
  isKeyPath?: boolean;
}

export interface CorrectiveAction {
  id: string;
  title: string;
  actionType: 'supplier_escalation' | 'inventory_reallocation' | 'purchase_order' | 'discount_hold';
  rationale: string;
  supportingEvidence: string[];
  expectedOutcome: string;
  risksAndLimitations: string;
  requiresApproval: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'simulated';
  executionType?: 'real' | 'simulated';
  executionDetails?: string;
  executedAt?: string;
  verificationMethod: string;
  verificationStatus?: 'unverified' | 'in_progress' | 'verified_improved' | 'verified_inconclusive';
  verificationOutcome?: string;
  isExecutableInPhase: boolean;
}

export interface InvestigationReport {
  executiveSummary: string;
  timeWindow: string;
  affectedBusinessArea: string;
  metricsSummary: { label: string; value: string; delta?: string }[];
  primaryRootCause: string;
  plausibilityRationale: string;
  limitationsAndMissingData: string[];
  calculatedBusinessImpact: string;
  recommendedNextSteps: string[];
}

export interface Investigation {
  id: string;
  title: string;
  query?: string;
  incidentType: string;
  severity: IncidentSeverity;
  status: InvestigationStatus;
  startedAt: string;
  updatedAt: string;
  businessArea: string;
  targetTimeWindow: string;
  summary: string;
  timeline: TimelineStep[];
  hypotheses: Hypothesis[];
  evidence: EvidenceItem[];
  nodes: GraphNode[];
  edges: GraphEdge[];
  actions: CorrectiveAction[];
  report?: InvestigationReport;
  workflowEvents?: WorkflowEvent[];
  isDemoSeed: boolean;
}

export interface QueryInvestigationResponse {
  status: 'ready' | 'clarification_needed';
  clarificationPrompt?: string;
  suggestedClarifications?: string[];
  investigation?: Investigation;
  workflowEvent?: WorkflowEvent;
}

export interface DataSourceStatus {
  id: string;
  name: string;
  provider: 'Zetaris' | 'Meterless' | 'NVIDIA Nemotron' | 'PostgreSQL' | 'Local Seed';
  category: 'Federated Data' | 'Context & Memory' | 'Reasoning LLM' | 'Storage';
  status: 'connected' | 'demo_seeded' | 'disconnected' | 'phase3_pending';
  description: string;
  lastSync: string;
  recordsCount?: number;
  notes: string;
}
