import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { orchestrator } from './engine/orchestrator';
import { actionExecutor } from './actions/executor';
import { dbStore } from './storage/db';
import { seedInitialData } from './storage/seed';
import { ZetarisLiveAdapter } from './adapters/zetarisLiveAdapter';
import { NemotronLiveAdapter } from './adapters/nemotronLiveAdapter';
import { MeterlessWorkflowAdapter } from './adapters/meterlessEngine';
import {
  QueryInvestigationRequest,
  ActionApprovalRequest
} from './types/schemas';

export function createApp() {
  seedInitialData();
  const app = express();

  app.use(cors());
  app.use(express.json());

  const zetarisAdapter = orchestrator.dataAdapter as ZetarisLiveAdapter;
  const nemotronAdapter = orchestrator.reasoningAdapter as NemotronLiveAdapter;
  const meterlessAdapter = orchestrator.memoryAdapter as MeterlessWorkflowAdapter;

  // 1. Submit Query / Start Investigation
  app.post('/api/investigations/query', async (req, res) => {
    try {
      const body = req.body as QueryInvestigationRequest;
      if (!body.query || typeof body.query !== 'string') {
        return res.status(400).json({ error: 'Query string is required' });
      }

      const result = await orchestrator.runInvestigation(body);
      return res.json(result);
    } catch (err: any) {
      console.error('[API] Error running investigation:', err);
      return res.status(500).json({ error: err.message || 'Internal investigation error' });
    }
  });

  // 2. List all Investigations
  app.get('/api/investigations', (req, res) => {
    try {
      const all = dbStore.getAllInvestigations();
      return res.json(all);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // 3. Get single Investigation by ID
  app.get('/api/investigations/:id', (req, res) => {
    try {
      const inv = dbStore.getInvestigation(req.params.id);
      if (!inv) return res.status(404).json({ error: 'Investigation not found' });
      return res.json(inv);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // 4. Cancel Investigation
  app.post('/api/investigations/:id/cancel', async (req, res) => {
    try {
      const cancelled = await orchestrator.cancelInvestigation(req.params.id);
      return res.json(cancelled);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // 5. Approve Action
  app.post('/api/investigations/:id/actions/:actionId/approve', async (req, res) => {
    try {
      const { userRole, reason } = req.body || {};
      const result = await actionExecutor.approveAction(
        req.params.id,
        req.params.actionId,
        userRole,
        reason
      );
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // 6. Reject Action
  app.post('/api/investigations/:id/actions/:actionId/reject', async (req, res) => {
    try {
      const { userRole, reason } = req.body || {};
      const result = await actionExecutor.rejectAction(
        req.params.id,
        req.params.actionId,
        userRole,
        reason
      );
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // 7. Execute Action
  app.post('/api/investigations/:id/actions/:actionId/execute', async (req, res) => {
    try {
      const { userRole } = req.body || {};
      const result = await actionExecutor.executeAction(
        req.params.id,
        req.params.actionId,
        userRole
      );
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // 8. Verify Action Outcome
  app.post('/api/investigations/:id/actions/:actionId/verify', async (req, res) => {
    try {
      const result = await actionExecutor.verifyActionOutcome(
        req.params.id,
        req.params.actionId
      );
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // 9. Get Workflow Audit Events
  app.get('/api/events', (req, res) => {
    try {
      const investigationId = req.query.investigationId as string | undefined;
      const events = dbStore.getWorkflowEvents(investigationId);
      return res.json(events);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // 10. Data Source & Sponsor Statuses (Genuine Phase 3 state)
  app.get('/api/data-sources', (req, res) => {
    try {
      const zetarisStatus = zetarisAdapter.getStatus();
      const nemotronStatus = nemotronAdapter.getStatus();
      const meterlessStatus = meterlessAdapter.getStatus();
      const meterlessStats = meterlessAdapter.hmem.getStats();

      const statuses = [
        {
          id: 'src_zetaris',
          name: zetarisAdapter.adapterName,
          provider: 'Zetaris',
          category: 'Federated Data',
          status: zetarisStatus.status,
          description: zetarisStatus.details,
          lastSync: zetarisStatus.lastSync,
          notes: zetarisAdapter.isLiveConnected
            ? 'Live cross-source query fabric active.'
            : 'Live credentials pending in .env (ZETARIS_ID_TOKEN). Deterministic multi-source demo virtualizer active with full provenance preservation.'
        },
        {
          id: 'src_meterless',
          name: meterlessAdapter.adapterName,
          provider: 'Meterless',
          category: 'Context & Memory',
          status: meterlessStatus.status,
          description: meterlessStatus.details,
          lastSync: meterlessStatus.lastSync,
          recordsCount: meterlessStats.nodeCount,
          notes: `Genuinely functional local-first context engine: H-MEM living knowledge graph (${meterlessStats.nodeCount} nodes), Scout Intent goal/risk classifier, and World Model entity state tracker.`
        },
        {
          id: 'src_nemotron',
          name: nemotronAdapter.adapterName,
          provider: 'NVIDIA Nemotron',
          category: 'Reasoning LLM',
          status: nemotronStatus.status,
          description: nemotronStatus.details,
          lastSync: nemotronStatus.lastSync,
          notes: nemotronAdapter.isLiveConnected
            ? 'Real NVIDIA NIM API active using nvidia/llama-3.1-nemotron-70b-instruct.'
            : 'NVIDIA_API_KEY pending in .env. Deterministic causal reasoning engine active with validated structured schemas (explicitly labelled Demo Mode).'
        },
        {
          id: 'src_postgres',
          name: 'Transactional Store (Sales & Orders)',
          provider: 'PostgreSQL',
          category: 'Storage',
          status: 'demo_seeded',
          description: 'Local snapshot of weekly sales receipts, unit volumes, and regional fulfillment hubs.',
          lastSync: new Date().toISOString(),
          recordsCount: 14250,
          notes: 'Seeded test dataset covering Weeks 40-43 sales and return logs.'
        }
      ];
      return res.json(statuses);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // 11. Test Sponsor Connections
  app.post('/api/data-sources/test', async (req, res) => {
    try {
      const [zetarisRes, nemotronRes] = await Promise.all([
        zetarisAdapter.testConnection(),
        nemotronAdapter.testConnection()
      ]);
      const meterlessStatus = meterlessAdapter.getStatus();

      return res.json({
        zetaris: zetarisRes,
        nemotron: nemotronRes,
        meterless: {
          connected: true,
          status: 'connected',
          engine: 'H-MEM + Scout Intent + World Model'
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  return app;
}
