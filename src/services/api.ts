import {
  Investigation,
  DataSourceStatus,
  CorrectiveAction,
  WorkflowEvent,
  QueryInvestigationResponse
} from '../types';

const API_BASE = '/api';

export class ApiService {
  public static async queryInvestigation(
    query: string,
    businessArea?: string
  ): Promise<QueryInvestigationResponse> {
    const res = await fetch(`${API_BASE}/investigations/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, businessArea })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to run investigation: HTTP ${res.status}`);
    }
    return res.json();
  }

  public static async getInvestigations(): Promise<Investigation[]> {
    const res = await fetch(`${API_BASE}/investigations`);
    if (!res.ok) throw new Error('Failed to fetch investigations');
    return res.json();
  }

  public static async getInvestigationById(id: string): Promise<Investigation> {
    const res = await fetch(`${API_BASE}/investigations/${id}`);
    if (!res.ok) throw new Error(`Investigation ${id} not found`);
    return res.json();
  }

  public static async cancelInvestigation(id: string): Promise<Investigation> {
    const res = await fetch(`${API_BASE}/investigations/${id}/cancel`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to cancel investigation');
    return res.json();
  }

  public static async approveAction(
    investigationId: string,
    actionId: string,
    userRole: string = 'business_owner',
    reason?: string
  ): Promise<{ action: CorrectiveAction; event: WorkflowEvent }> {
    const res = await fetch(
      `${API_BASE}/investigations/${investigationId}/actions/${actionId}/approve`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userRole, reason })
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to approve action');
    }
    return res.json();
  }

  public static async rejectAction(
    investigationId: string,
    actionId: string,
    userRole: string = 'business_owner',
    reason?: string
  ): Promise<{ action: CorrectiveAction; event: WorkflowEvent }> {
    const res = await fetch(
      `${API_BASE}/investigations/${investigationId}/actions/${actionId}/reject`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userRole, reason })
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to reject action');
    }
    return res.json();
  }

  public static async executeAction(
    investigationId: string,
    actionId: string,
    userRole: string = 'business_owner'
  ): Promise<{
    success: boolean;
    action: CorrectiveAction;
    auditEvent: WorkflowEvent;
    generatedArtifactPath?: string;
    message: string;
  }> {
    const res = await fetch(
      `${API_BASE}/investigations/${investigationId}/actions/${actionId}/execute`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userRole })
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to execute action');
    }
    return res.json();
  }

  public static async verifyAction(
    investigationId: string,
    actionId: string
  ): Promise<{ action: CorrectiveAction; event: WorkflowEvent }> {
    const res = await fetch(
      `${API_BASE}/investigations/${investigationId}/actions/${actionId}/verify`,
      {
        method: 'POST'
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to verify action');
    }
    return res.json();
  }

  public static async getDataSources(): Promise<DataSourceStatus[]> {
    const res = await fetch(`${API_BASE}/data-sources`);
    if (!res.ok) throw new Error('Failed to fetch data sources');
    return res.json();
  }

  public static async testSponsorConnections(): Promise<{
    zetaris: { connected: boolean; status: string; error?: string };
    nemotron: { connected: boolean; status: string; error?: string };
    meterless: { connected: boolean; status: string; engine: string };
  }> {
    const res = await fetch(`${API_BASE}/data-sources/test`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to test sponsor connections');
    return res.json();
  }

  public static async getWorkflowEvents(investigationId?: string): Promise<WorkflowEvent[]> {
    const url = investigationId
      ? `${API_BASE}/events?investigationId=${encodeURIComponent(investigationId)}`
      : `${API_BASE}/events`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch workflow events');
    return res.json();
  }
}
