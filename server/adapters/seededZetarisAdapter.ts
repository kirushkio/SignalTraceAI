import { IDataVirtualizerAdapter, VirtualizerQueryResult } from './interfaces';
import {
  SalesRecord,
  InventoryRecord,
  SupplierRecord,
  StorefrontTrafficRecord,
  PromoAuditRecord,
  SEEDED_SALES_RECORDS,
  SEEDED_INVENTORY_RECORDS,
  SEEDED_SUPPLIER_RECORDS,
  SEEDED_TRAFFIC_RECORDS,
  SEEDED_PROMO_RECORDS
} from '../data/datasets';

export class SeededZetarisAdapter implements IDataVirtualizerAdapter {
  public adapterName = 'Zetaris Cross-Source Data Virtualizer (Phase 2 Local Adapter)';
  public provider: 'Zetaris' = 'Zetaris';
  public isLiveConnected = false; // Truthful: running on seeded multi-source data until Phase 3

  public getStatus() {
    return {
      status: 'demo_seeded',
      details: 'Virtualized cross-source abstraction running against deterministic local sales, inventory, and EDI schemas. Phase 3 enables live JDBC/API connectors.',
      lastSync: new Date().toISOString()
    };
  }

  public async fetchSalesTransactions(
    category: string,
    timeWindow: string
  ): Promise<VirtualizerQueryResult<SalesRecord>> {
    // Simulate real cross-source query latency
    await new Promise((r) => setTimeout(r, 60));

    const records = SEEDED_SALES_RECORDS.filter(
      (r) => !category || r.category.toLowerCase().includes(category.toLowerCase())
    );

    return {
      sourceSystem: 'Zetaris Federated Virtualizer -> Postgres Sales DB',
      sourceUri: `zetaris://sales_db/transactions?category=${encodeURIComponent(category)}&window=${encodeURIComponent(timeWindow)}`,
      isDemoData: true,
      retrievedAt: new Date().toISOString(),
      records,
      executionTimeMs: 42
    };
  }

  public async fetchInventoryStatus(skus: string[]): Promise<VirtualizerQueryResult<InventoryRecord>> {
    await new Promise((r) => setTimeout(r, 50));

    const records = SEEDED_INVENTORY_RECORDS.filter(
      (inv) => skus.length === 0 || skus.includes(inv.sku)
    );

    return {
      sourceSystem: 'Zetaris Federated Virtualizer -> Manhattan WMS Ledger',
      sourceUri: `zetaris://wms_db/inventory_balances?skus=${skus.join(',')}`,
      isDemoData: true,
      retrievedAt: new Date().toISOString(),
      records,
      executionTimeMs: 38
    };
  }

  public async fetchSupplierShipments(supplierId?: string): Promise<VirtualizerQueryResult<SupplierRecord>> {
    await new Promise((r) => setTimeout(r, 65));

    const records = SEEDED_SUPPLIER_RECORDS.filter(
      (s) => !supplierId || s.supplierId === supplierId
    );

    return {
      sourceSystem: 'Zetaris Federated Virtualizer -> EDI 856 ASN Gateway',
      sourceUri: `zetaris://edi_gateway/asn_records${supplierId ? `?supplier=${supplierId}` : ''}`,
      isDemoData: true,
      retrievedAt: new Date().toISOString(),
      records,
      executionTimeMs: 51
    };
  }

  public async fetchTrafficAnalytics(category: string): Promise<VirtualizerQueryResult<StorefrontTrafficRecord>> {
    await new Promise((r) => setTimeout(r, 45));

    return {
      sourceSystem: 'Zetaris Federated Virtualizer -> Web Clickstream Lake',
      sourceUri: `zetaris://web_analytics/traffic?category=${encodeURIComponent(category)}`,
      isDemoData: true,
      retrievedAt: new Date().toISOString(),
      records: SEEDED_TRAFFIC_RECORDS,
      executionTimeMs: 33
    };
  }

  public async fetchPromoAudit(campaignId?: string): Promise<VirtualizerQueryResult<PromoAuditRecord>> {
    await new Promise((r) => setTimeout(r, 35));

    return {
      sourceSystem: 'Zetaris Federated Virtualizer -> Marketing Promo Engine',
      sourceUri: `zetaris://promo_engine/audits${campaignId ? `?id=${campaignId}` : ''}`,
      isDemoData: true,
      retrievedAt: new Date().toISOString(),
      records: SEEDED_PROMO_RECORDS,
      executionTimeMs: 29
    };
  }
}
