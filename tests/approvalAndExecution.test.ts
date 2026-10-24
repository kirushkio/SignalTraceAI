import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import { ActionExecutor } from '../server/actions/executor';
import { InvestigationOrchestrator } from '../server/engine/orchestrator';
import { dbStore } from '../server/storage/db';

describe('Human Approval Gate & Action Execution', () => {
  const orchestrator = new InvestigationOrchestrator();
  const executor = new ActionExecutor();
  let testInvId: string;

  beforeEach(async () => {
    const res = await orchestrator.runInvestigation({
      query: 'Investigate -32.4% Audio Category sales drop in Week 42'
    });
    testInvId = res.investigation!.id;
  });

  it('prevents execution of consequential actions without human authorization', async () => {
    const actionId = 'act-01'; // requires approval

    await expect(
      executor.executeAction(testInvId, actionId, 'business_owner')
    ).rejects.toThrow(/Safety gate blocked: Consequential action .* requires human approval/);
  });

  it('allows execution after human approval and creates real purchase order artifact', async () => {
    const actionId = 'act-01';

    // 1. Grant human approval
    const { action: approvedAction, event: approvalEvent } = await executor.approveAction(
      testInvId,
      actionId,
      'business_owner',
      'Authorized by Elena Rostova'
    );
    expect(approvedAction.approvalStatus).toBe('approved');
    expect(approvalEvent.eventType).toBe('approval_granted');

    // 2. Execute safe real testable action
    const execRes = await executor.executeAction(testInvId, actionId, 'business_owner');
    expect(execRes.success).toBe(true);
    expect(execRes.action.executionType).toBe('real');
    expect(execRes.generatedArtifactPath).toBeDefined();

    // Verify artifact file actually exists on disk!
    expect(fs.existsSync(execRes.generatedArtifactPath!)).toBe(true);
    const artifactContent = JSON.parse(
      fs.readFileSync(execRes.generatedArtifactPath!, 'utf-8')
    );
    expect(artifactContent.poNumber).toBe('PO-88322-EXPEDITE');
    expect(artifactContent.items.length).toBe(2);

    // 3. Verify Outcome
    const verifyRes = await executor.verifyActionOutcome(testInvId, actionId);
    expect(verifyRes.action.verificationStatus).toBe('verified_improved');

    // 4. Verify Duplicate Execution is Blocked
    await expect(
      executor.executeAction(testInvId, actionId, 'business_owner')
    ).rejects.toThrow(/Duplicate action blocked/);
  });

  it('allows safe cancellation of an active investigation', async () => {
    const cancelled = await orchestrator.cancelInvestigation(testInvId);
    expect(cancelled.status).toBe('cancelled');

    const stored = dbStore.getInvestigation(testInvId);
    expect(stored?.status).toBe('cancelled');
  });
});
