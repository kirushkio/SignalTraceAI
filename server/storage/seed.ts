import fs from 'fs';
import path from 'path';
import { dbStore } from './db';
import { FLAGSHIP_INVESTIGATION, INVESTIGATION_HISTORY_SEED } from '../../src/data/mockData';

export function seedInitialData() {
  const existing = dbStore.getAllInvestigations();
  if (existing.length === 0) {
    for (const inv of INVESTIGATION_HISTORY_SEED) {
      dbStore.saveInvestigation(inv as any);
    }
    dbStore.addWorkflowEvent({
      id: 'evt_init_01',
      investigationId: FLAGSHIP_INVESTIGATION.id,
      timestamp: new Date().toISOString(),
      eventType: 'query_received',
      sourceModule: 'orchestrator',
      summary: 'Initial Seed: Audio Category Sales Decline Flagship incident populated in local persistent storage.'
    });
    console.log('[DatabaseStore] Seeded initial database with flagship scenario.');
  }
}

seedInitialData();
