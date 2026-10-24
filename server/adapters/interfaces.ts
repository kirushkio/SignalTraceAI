import {
  EvidenceItem,
  Hypothesis,
  InvestigationReport,
  WorkflowEvent,
  Investigation
} from '../types/schemas';
import {
  SalesRecord,
  InventoryRecord,
  SupplierRecord,
  StorefrontTrafficRecord,
  PromoAuditRecord
} from '../data/datasets';

export interface VirtualizerQueryResult<T> {
  sourceSystem: string;
  sourceUri: string;
  isDemoData: boolean;
  retrievedAt: string;
  records: T[];
  executionTimeMs: number;
}

export interface IDataVirtualizerAdapter {
  adapterName: string;
  provider: 'Zetaris' | 'LocalSeed';
  isLiveConnected: boolean;
  getStatus(): { status: string; details: string; lastSync: string };
  fetchSalesTransactions(category: string, timeWindow: string): Promise<VirtualizerQueryResult<SalesRecord>>;
  fetchInventoryStatus(skus: string[]): Promise<VirtualizerQueryResult<InventoryRecord>>;
  fetchSupplierShipments(supplierId?: string): Promise<VirtualizerQueryResult<SupplierRecord>>;
  fetchTrafficAnalytics(category: string): Promise<VirtualizerQueryResult<StorefrontTrafficRecord>>;
  fetchPromoAudit(campaignId?: string): Promise<VirtualizerQueryResult<PromoAuditRecord>>;
}

export interface ProblemFrame {
  businessArea: string;
  metricShortfall: string;
  timeWindow: string;
  detectedAnomaly: string;
  needsClarification: boolean;
  clarificationReason?: string;
  clarificationOptions?: string[];
}

export interface IReasoningAdapter {
  adapterName: string;
  provider: 'NVIDIA Nemotron' | 'RuleEngine';
  isLiveConnected: boolean;
  getStatus(): { status: string; details: string };
  extractProblemFrame(query: string, businessAreaHint?: string): Promise<ProblemFrame>;
  generateAndRankHypotheses(frame: ProblemFrame, evidence: EvidenceItem[]): Promise<Hypothesis[]>;
  synthesizeCausalReport(frame: ProblemFrame, hypotheses: Hypothesis[], evidence: EvidenceItem[]): Promise<InvestigationReport>;
}

export interface IWorkflowMemoryAdapter {
  adapterName: string;
  provider: 'Meterless' | 'FilePersistent';
  isLiveConnected: boolean;
  getStatus(): { status: string; details: string };
  saveInvestigation(investigation: Investigation): Promise<void>;
  getInvestigation(id: string): Promise<Investigation | null>;
  getAllInvestigations(): Promise<Investigation[]>;
  recordWorkflowEvent(event: WorkflowEvent): Promise<void>;
  getWorkflowEvents(investigationId: string): Promise<WorkflowEvent[]>;
}
