import { IReasoningAdapter, ProblemFrame } from './interfaces';
import { RuleBasedNemotronAdapter } from './ruleBasedNemotronAdapter';
import { EvidenceItem, Hypothesis, InvestigationReport } from '../types/schemas';

export interface NemotronConfig {
  apiKey?: string;
  baseUrl?: string;
  modelName?: string;
  timeoutMs?: number;
}

export class NemotronLiveAdapter implements IReasoningAdapter {
  public adapterName = 'NVIDIA Nemotron Reasoning Engine';
  public provider: 'NVIDIA Nemotron' = 'NVIDIA Nemotron';
  public isLiveConnected = false;

  private config: NemotronConfig;
  private fallbackAdapter: RuleBasedNemotronAdapter;
  private lastTestedAt: string | null = null;
  private lastError: string | null = null;
  private activeModelRoute: string = 'Rule-based Causal Evaluator (Demo Fallback)';

  constructor(config?: NemotronConfig) {
    this.config = {
      apiKey: config?.apiKey || process.env.NVIDIA_API_KEY,
      baseUrl: config?.baseUrl || process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
      modelName: config?.modelName || process.env.NVIDIA_MODEL || 'nvidia/llama-3.1-nemotron-70b-instruct',
      timeoutMs: config?.timeoutMs || (process.env.NVIDIA_TIMEOUT_MS ? parseInt(process.env.NVIDIA_TIMEOUT_MS) : 12000)
    };
    this.fallbackAdapter = new RuleBasedNemotronAdapter();
  }

  public async testConnection(): Promise<{ connected: boolean; status: string; error?: string; model?: string }> {
    this.lastTestedAt = new Date().toISOString();

    if (!this.config.apiKey) {
      this.isLiveConnected = false;
      this.lastError = 'Missing NVIDIA_API_KEY environment variable. Real model inference requires NVIDIA NIM API key.';
      this.activeModelRoute = 'Rule-based Causal Evaluator (Demo Fallback: Missing NVIDIA_API_KEY)';
      return {
        connected: false,
        status: 'blocked',
        error: this.lastError
      };
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);

      const res = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.modelName,
          messages: [{ role: 'user', content: 'Ping health check. Reply with "OK".' }],
          max_tokens: 5,
          temperature: 0.1
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (res.ok) {
        this.isLiveConnected = true;
        this.lastError = null;
        this.activeModelRoute = `${this.config.modelName} via NVIDIA NIM API`;
        return {
          connected: true,
          status: 'connected',
          model: this.config.modelName
        };
      } else {
        this.isLiveConnected = false;
        this.lastError = `NVIDIA NIM API responded with HTTP ${res.status}: ${res.statusText}`;
        this.activeModelRoute = `Rule-based Evaluator (Fallback: ${this.lastError})`;
        return {
          connected: false,
          status: 'blocked',
          error: this.lastError
        };
      }
    } catch (err: any) {
      this.isLiveConnected = false;
      this.lastError = `NVIDIA Nemotron connection failed: ${err.message || 'Network error'}`;
      this.activeModelRoute = `Rule-based Evaluator (Fallback: ${this.lastError})`;
      return {
        connected: false,
        status: 'blocked',
        error: this.lastError
      };
    }
  }

  public getStatus() {
    if (this.isLiveConnected) {
      return {
        status: 'connected',
        details: `Live connected to ${this.config.modelName} at ${this.config.baseUrl}. Active for causal reasoning, hypothesis ranking, and tool routing.`,
        lastSync: this.lastTestedAt || new Date().toISOString()
      };
    }
    return {
      status: this.config.apiKey ? 'blocked' : 'demo_seeded',
      details: this.lastError || 'NVIDIA_API_KEY not configured. Running deterministic rule-based causal evaluator (explicitly labelled Demo Mode).',
      lastSync: this.lastTestedAt || new Date().toISOString()
    };
  }

  public async extractProblemFrame(query: string, businessAreaHint?: string): Promise<ProblemFrame> {
    // If live connected, we can query Nemotron with JSON prompt
    if (this.isLiveConnected && this.config.apiKey) {
      try {
        const prompt = `Analyze this business incident inquiry: "${query}".
Return a JSON object with:
{
  "businessArea": string,
  "metricShortfall": string,
  "timeWindow": string,
  "detectedAnomaly": string,
  "needsClarification": boolean,
  "clarificationReason": string (if needsClarification is true),
  "clarificationOptions": string[] (if needsClarification is true)
}`;

        const json = await this.callNemotronChat(prompt);
        if (json && json.businessArea) {
          return json as ProblemFrame;
        }
      } catch (err: any) {
        console.warn(`[NemotronLiveAdapter] Live extraction failed: ${err.message}. Using fallback.`);
      }
    }

    return this.fallbackAdapter.extractProblemFrame(query, businessAreaHint);
  }

  public async generateAndRankHypotheses(frame: ProblemFrame, evidence: EvidenceItem[]): Promise<Hypothesis[]> {
    if (this.isLiveConnected && this.config.apiKey) {
      try {
        const evidenceSummary = evidence.map((e) => `[${e.id}] (${e.category.toUpperCase()}) ${e.title}: ${e.description}`).join('\n');
        const prompt = `You are an autonomous root-cause investigation agent.
Incident: ${frame.businessArea} - ${frame.metricShortfall} (${frame.timeWindow}).
Retrieved Evidence:
${evidenceSummary}

Task: Generate 4 competing hypotheses (Stockouts, Supplier Delays, Demand Drop, Promotional Anomaly).
For each hypothesis:
- Assign plausibility: 'High Plausibility' | 'Supported Inference' | 'Unlikely / Contradicted' | 'Ruled Out'
- Cite supportingEvidenceIds and contradictingEvidenceIds.
- Include unresolvedQuestions.
- Designate isPrimaryCause: true for the single root cause backed by data.
Respond ONLY with a JSON array of hypotheses.`;

        const json = await this.callNemotronChat(prompt);
        if (Array.isArray(json) && json.length > 0) {
          return json as Hypothesis[];
        }
      } catch (err: any) {
        console.warn(`[NemotronLiveAdapter] Live hypothesis ranking failed: ${err.message}. Using fallback.`);
      }
    }

    return this.fallbackAdapter.generateAndRankHypotheses(frame, evidence);
  }

  public async synthesizeCausalReport(
    frame: ProblemFrame,
    hypotheses: Hypothesis[],
    evidence: EvidenceItem[]
  ): Promise<InvestigationReport> {
    if (this.isLiveConnected && this.config.apiKey) {
      try {
        const primary = hypotheses.find((h) => h.isPrimaryCause) || hypotheses[0];
        const prompt = `Synthesize an investigation report.
Problem: ${frame.businessArea} during ${frame.timeWindow}.
Proven Root Cause: ${primary.title} (${primary.summary}).
Return a JSON object with:
{
  "executiveSummary": string,
  "timeWindow": "${frame.timeWindow}",
  "affectedBusinessArea": "${frame.businessArea}",
  "metricsSummary": [ { "label": string, "value": string, "delta": string } ],
  "primaryRootCause": string,
  "plausibilityRationale": string,
  "limitationsAndMissingData": string[],
  "calculatedBusinessImpact": string,
  "recommendedNextSteps": string[]
}`;

        const json = await this.callNemotronChat(prompt);
        if (json && json.executiveSummary) {
          return json as InvestigationReport;
        }
      } catch (err: any) {
        console.warn(`[NemotronLiveAdapter] Live report synthesis failed: ${err.message}. Using fallback.`);
      }
    }

    return this.fallbackAdapter.synthesizeCausalReport(frame, hypotheses, evidence);
  }

  private async callNemotronChat(prompt: string, maxRetries: number = 2): Promise<any> {
    let attempts = 0;
    while (attempts <= maxRetries) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);

        const res = await fetch(`${this.config.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: this.config.modelName,
            messages: [
              {
                role: 'system',
                content: 'You are SignalTrace AI root-cause investigator. Respond strictly with valid JSON without markdown code fences or conversational prose.'
              },
              { role: 'user', content: prompt }
            ],
            temperature: 0.2,
            max_tokens: 1500
          }),
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (!res.ok) {
          throw new Error(`Nemotron NIM API HTTP ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (!content) throw new Error('Empty response from Nemotron');

        // Clean potential markdown tags if returned
        const cleaned = content.replace(/```json/gi, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
      } catch (err: any) {
        attempts++;
        if (attempts > maxRetries) throw err;
        await new Promise((r) => setTimeout(r, 600 * attempts));
      }
    }
  }
}
