import fs from 'fs';
import path from 'path';
import { CorrectiveAction, WorkflowEvent, ActionExecutionResponse } from '../types/schemas';
import { dbStore } from '../storage/db';

export class ActionExecutor {
  private artifactsDir = path.resolve(process.cwd(), 'data', 'artifacts');

  constructor() {
    if (!fs.existsSync(this.artifactsDir)) {
      fs.mkdirSync(this.artifactsDir, { recursive: true });
    }
  }

  public async approveAction(
    investigationId: string,
    actionId: string,
    userRole: string = 'business_owner',
    reason: string = 'Approved by authorized operator'
  ): Promise<{ action: CorrectiveAction; event: WorkflowEvent }> {
    const inv = dbStore.getInvestigation(investigationId);
    if (!inv) throw new Error(`Investigation ${investigationId} not found`);

    const actionIndex = inv.actions.findIndex((a) => a.id === actionId);
    if (actionIndex === -1) throw new Error(`Action ${actionId} not found in investigation`);

    const action = inv.actions[actionIndex];
    action.approvalStatus = 'approved';

    const event: WorkflowEvent = {
      id: `evt_appr_${Date.now()}`,
      investigationId,
      timestamp: new Date().toISOString(),
      eventType: 'approval_granted',
      sourceModule: 'action_executor',
      summary: `Human Approval Granted: ${action.title} by role [${userRole}]`,
      payload: { actionId, userRole, reason }
    };

    inv.updatedAt = new Date().toISOString();
    dbStore.saveInvestigation(inv);
    dbStore.addWorkflowEvent(event);

    return { action, event };
  }

  public async rejectAction(
    investigationId: string,
    actionId: string,
    userRole: string = 'business_owner',
    reason: string = 'Action deferred or rejected'
  ): Promise<{ action: CorrectiveAction; event: WorkflowEvent }> {
    const inv = dbStore.getInvestigation(investigationId);
    if (!inv) throw new Error(`Investigation ${investigationId} not found`);

    const actionIndex = inv.actions.findIndex((a) => a.id === actionId);
    if (actionIndex === -1) throw new Error(`Action ${actionId} not found in investigation`);

    const action = inv.actions[actionIndex];
    action.approvalStatus = 'rejected';

    const event: WorkflowEvent = {
      id: `evt_rej_${Date.now()}`,
      investigationId,
      timestamp: new Date().toISOString(),
      eventType: 'approval_rejected',
      sourceModule: 'action_executor',
      summary: `Action Rejected: ${action.title} by role [${userRole}]`,
      payload: { actionId, userRole, reason }
    };

    inv.updatedAt = new Date().toISOString();
    dbStore.saveInvestigation(inv);
    dbStore.addWorkflowEvent(event);

    return { action, event };
  }

  public async executeAction(
    investigationId: string,
    actionId: string,
    userRole: string = 'business_owner'
  ): Promise<ActionExecutionResponse> {
    const inv = dbStore.getInvestigation(investigationId);
    if (!inv) throw new Error(`Investigation ${investigationId} not found`);

    const actionIndex = inv.actions.findIndex((a) => a.id === actionId);
    if (actionIndex === -1) throw new Error(`Action ${actionId} not found in investigation`);

    const action = inv.actions[actionIndex];

    // Prevent duplicate action executions on retries
    if (action.executedAt) {
      throw new Error(
        `Duplicate action blocked: Action '${action.title}' has already been executed at ${action.executedAt}. Duplicate dispatches are strictly prevented.`
      );
    }

    if (action.approvalStatus === 'rejected') {
      throw new Error(
        `Execution blocked: Action '${action.title}' was rejected by human operator.`
      );
    }

    // Enforce human approval requirement
    if (action.requiresApproval && action.approvalStatus !== 'approved') {
      throw new Error(
        `Safety gate blocked: Consequential action '${action.title}' requires human approval before execution.`
      );
    }

    let generatedArtifactPath: string | undefined;
    let executionDetails: string;
    let isRealExecution = false;

    // Check action type: Safe Real Action vs Simulated Action
    if (action.actionType === 'supplier_escalation' || action.actionType === 'purchase_order') {
      // Safe, real testable workspace action: write real purchase order / escalation record
      isRealExecution = true;
      const poArtifact = {
        artifactType: 'PURCHASE_ORDER_REPLENISHMENT',
        poNumber: 'PO-88322-EXPEDITE',
        vendor: 'Shenzhen Acoustics Component Co.',
        referenceIncident: investigationId,
        authorizedBy: userRole,
        generatedTimestamp: new Date().toISOString(),
        items: [
          { sku: 'SKU-409', name: 'Apex Pro ANC Headphones', quantity: 3000, priority: 'Air Express' },
          { sku: 'SKU-412', name: 'Ultra Soundbar Gen 2', quantity: 1500, priority: 'Air Express' }
        ],
        destinationHubs: ['US-WEST-DC1', 'US-MIDWEST-DC2'],
        status: 'DISPATCHED_TO_LOCAL_PURCHASE_LEDGER'
      };

      const filename = `replenishment_po_${investigationId}_${Date.now()}.json`;
      const fullPath = path.join(this.artifactsDir, filename);
      fs.writeFileSync(fullPath, JSON.stringify(poArtifact, null, 2), 'utf-8');
      generatedArtifactPath = fullPath;

      executionDetails = `[REAL WORKSPACE ACTION]: Generated and committed PO-88322-EXPEDITE to local procurement ledger. 4,500 units allocated for West/Midwest DCs.`;
      action.executionType = 'real';
      action.isExecutableInPhase = true;
      action.verificationStatus = 'in_progress';
      action.verificationOutcome = 'Pending arrival scan verification within 24 hours.';
    } else {
      // Simulation Action
      executionDetails = `[SIMULATION]: Simulated logistics cross-dock algorithm. Estimated carrier turnaround: 24h.`;
      action.executionType = 'simulated';
      action.verificationStatus = 'verified_improved';
      action.verificationOutcome = 'Simulation indicated 98% stock recovery probability.';
    }

    action.executedAt = new Date().toISOString();
    action.executionDetails = executionDetails;

    const auditEvent: WorkflowEvent = {
      id: `evt_exec_${Date.now()}`,
      investigationId,
      timestamp: new Date().toISOString(),
      eventType: 'action_executed',
      sourceModule: 'action_executor',
      summary: `Action Executed (${action.executionType.toUpperCase()}): ${action.title}`,
      payload: {
        actionId,
        executionType: action.executionType,
        details: executionDetails,
        artifactPath: generatedArtifactPath
      }
    };

    inv.updatedAt = new Date().toISOString();
    dbStore.saveInvestigation(inv);
    dbStore.addWorkflowEvent(auditEvent);

    return {
      success: true,
      action,
      auditEvent,
      generatedArtifactPath,
      message: executionDetails
    };
  }

  public async verifyActionOutcome(
    investigationId: string,
    actionId: string
  ): Promise<{ action: CorrectiveAction; event: WorkflowEvent }> {
    const inv = dbStore.getInvestigation(investigationId);
    if (!inv) throw new Error(`Investigation ${investigationId} not found`);

    const action = inv.actions.find((a) => a.id === actionId);
    if (!action) throw new Error(`Action ${actionId} not found`);

    action.verificationStatus = 'verified_improved';
    action.verificationOutcome =
      'Outcome verified via simulated telemetry: Available units recovered from 0 to 4,500 across US fulfillment hubs. Daily sales velocity normalized.';

    const event: WorkflowEvent = {
      id: `evt_verif_${Date.now()}`,
      investigationId,
      timestamp: new Date().toISOString(),
      eventType: 'verification_completed',
      sourceModule: 'action_executor',
      summary: `Outcome Verified: ${action.title} - ${action.verificationOutcome}`,
      payload: { actionId, outcome: action.verificationOutcome }
    };

    inv.updatedAt = new Date().toISOString();
    dbStore.saveInvestigation(inv);
    dbStore.addWorkflowEvent(event);

    return { action, event };
  }
}

export const actionExecutor = new ActionExecutor();
