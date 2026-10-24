import { IWorkflowMemoryAdapter } from './interfaces';
import { Investigation, WorkflowEvent } from '../types/schemas';
import { dbStore } from '../storage/db';

export class FilePersistentMemoryAdapter implements IWorkflowMemoryAdapter {
  public adapterName = 'Persistent Workflow Memory & Audit Store (Phase 2 Local Adapter)';
  public provider: 'FilePersistent' = 'FilePersistent';
  public isLiveConnected = false; // Phase 3 connects to Meterless H-MEM

  public getStatus() {
    return {
      status: 'phase3_pending',
      details: 'JSON persistent workflow continuity active in Phase 2. Ready for Meterless H-MEM graph state connectors in Phase 3.'
    };
  }

  public async saveInvestigation(investigation: Investigation): Promise<void> {
    dbStore.saveInvestigation(investigation);
  }

  public async getInvestigation(id: string): Promise<Investigation | null> {
    return dbStore.getInvestigation(id);
  }

  public async getAllInvestigations(): Promise<Investigation[]> {
    return dbStore.getAllInvestigations();
  }

  public async recordWorkflowEvent(event: WorkflowEvent): Promise<void> {
    dbStore.addWorkflowEvent(event);
  }

  public async getWorkflowEvents(investigationId: string): Promise<WorkflowEvent[]> {
    return dbStore.getWorkflowEvents(investigationId);
  }
}
