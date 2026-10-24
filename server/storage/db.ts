import fs from 'fs';
import path from 'path';
import { Investigation, WorkflowEvent } from '../types/schemas';

interface DatabaseSchema {
  investigations: Record<string, Investigation>;
  workflowEvents: WorkflowEvent[];
  generatedArtifacts: Record<string, any>;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'signaltrace_db.json');

export class DatabaseStore {
  private inMemoryCache: DatabaseSchema | null = null;

  constructor() {
    this.ensureDataDir();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial: DatabaseSchema = {
        investigations: {},
        workflowEvents: [],
        generatedArtifacts: {}
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    }
  }

  public read(): DatabaseSchema {
    try {
      this.ensureDataDir();
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      this.inMemoryCache = JSON.parse(raw);
      return this.inMemoryCache!;
    } catch (err) {
      console.error('[DatabaseStore] Error reading store file, falling back to cache:', err);
      if (this.inMemoryCache) return this.inMemoryCache;
      return { investigations: {}, workflowEvents: [], generatedArtifacts: {} };
    }
  }

  public write(data: DatabaseSchema): void {
    try {
      this.ensureDataDir();
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
      this.inMemoryCache = data;
    } catch (err) {
      console.error('[DatabaseStore] Error writing store file:', err);
      this.inMemoryCache = data;
    }
  }

  public getInvestigation(id: string): Investigation | null {
    const db = this.read();
    return db.investigations[id] || null;
  }

  public saveInvestigation(investigation: Investigation): void {
    const db = this.read();
    db.investigations[investigation.id] = {
      ...investigation,
      updatedAt: new Date().toISOString()
    };
    this.write(db);
  }

  public getAllInvestigations(): Investigation[] {
    const db = this.read();
    return Object.values(db.investigations);
  }

  public addWorkflowEvent(event: WorkflowEvent): void {
    const db = this.read();
    db.workflowEvents.unshift(event);
    this.write(db);
  }

  public getWorkflowEvents(investigationId?: string): WorkflowEvent[] {
    const db = this.read();
    if (!investigationId) return db.workflowEvents;
    return db.workflowEvents.filter((e) => e.investigationId === investigationId);
  }

  public saveArtifact(key: string, artifact: any): void {
    const db = this.read();
    db.generatedArtifacts[key] = {
      ...artifact,
      savedAt: new Date().toISOString()
    };
    this.write(db);
  }

  public getArtifact(key: string): any | null {
    const db = this.read();
    return db.generatedArtifacts[key] || null;
  }
}

export const dbStore = new DatabaseStore();
