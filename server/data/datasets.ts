export interface SalesRecord {
  transactionId: string;
  sku: string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  timestamp: string;
  channel: 'direct_web' | 'mobile_app' | 'b2b_wholesale';
  status: 'completed' | 'abandoned_oos';
}

export interface InventoryRecord {
  warehouseCode: string;
  warehouseName: string;
  sku: string;
  productName: string;
  availableStock: number;
  reservedStock: number;
  safetyStockThreshold: number;
  bufferDays: number;
  lastInventoryAudit: string;
  stockoutDate?: string;
}

export interface SupplierRecord {
  poNumber: string;
  supplierId: string;
  supplierName: string;
  skuList: { sku: string; quantity: number }[];
  orderedDate: string;
  scheduledArrival: string;
  actualArrival?: string;
  delayDays: number;
  currentStatus: 'in_transit' | 'customs_hold' | 'cleared_crossdock' | 'delivered';
  transportMode: 'ocean_freight' | 'air_priority';
  portLocation: string;
  customsReleaseDate?: string;
}

export interface StorefrontTrafficRecord {
  date: string;
  category: string;
  sessions: number;
  productImpressions: number;
  cartAdditions: number;
  conversionRate: number;
  bounceRate: number;
  yearOverYearDelta: string;
}

export interface PromoAuditRecord {
  campaignId: string;
  campaignName: string;
  discountPercentage: number;
  validFrom: string;
  validTo: string;
  couponUptimePercent: number;
  adSpendDollars: number;
  status: 'active_healthy' | 'degraded';
}

export const SEEDED_SALES_RECORDS: SalesRecord[] = [
  {
    transactionId: 'TX-994818',
    sku: 'SKU-409',
    productName: 'Apex Pro ANC Headphones',
    category: 'Audio Hardware',
    quantity: 2,
    unitPrice: 299,
    totalAmount: 598,
    timestamp: '2026-10-15T10:14:00Z',
    channel: 'direct_web',
    status: 'completed'
  },
  {
    transactionId: 'TX-994822',
    sku: 'SKU-409',
    productName: 'Apex Pro ANC Headphones',
    category: 'Audio Hardware',
    quantity: 1,
    unitPrice: 299,
    totalAmount: 299,
    timestamp: '2026-10-16T14:20:00Z',
    channel: 'direct_web',
    status: 'completed'
  },
  {
    transactionId: 'TX-994825',
    sku: 'SKU-409',
    productName: 'Apex Pro ANC Headphones',
    category: 'Audio Hardware',
    quantity: 1,
    unitPrice: 299,
    totalAmount: 0,
    timestamp: '2026-10-16T14:24:00Z',
    channel: 'direct_web',
    status: 'abandoned_oos'
  },
  {
    transactionId: 'TX-994830',
    sku: 'SKU-412',
    productName: 'Ultra Soundbar Gen 2',
    category: 'Audio Hardware',
    quantity: 1,
    unitPrice: 399,
    totalAmount: 399,
    timestamp: '2026-10-17T08:10:00Z',
    channel: 'direct_web',
    status: 'completed'
  },
  {
    transactionId: 'TX-994834',
    sku: 'SKU-412',
    productName: 'Ultra Soundbar Gen 2',
    category: 'Audio Hardware',
    quantity: 1,
    unitPrice: 399,
    totalAmount: 0,
    timestamp: '2026-10-17T08:18:00Z',
    channel: 'direct_web',
    status: 'abandoned_oos'
  },
  {
    transactionId: 'TX-994840',
    sku: 'SKU-301',
    productName: 'Standard Wired Earbuds',
    category: 'Audio Hardware',
    quantity: 4,
    unitPrice: 29,
    totalAmount: 116,
    timestamp: '2026-10-19T11:00:00Z',
    channel: 'direct_web',
    status: 'completed'
  }
];

export const SEEDED_INVENTORY_RECORDS: InventoryRecord[] = [
  {
    warehouseCode: 'US-WEST-DC1',
    warehouseName: 'West Coast Regional Fulfillment Hub (Ontario, CA)',
    sku: 'SKU-409',
    productName: 'Apex Pro ANC Headphones',
    availableStock: 0,
    reservedStock: 14,
    safetyStockThreshold: 450,
    bufferDays: 3,
    lastInventoryAudit: '2026-10-21T06:00:00Z',
    stockoutDate: '2026-10-16T14:22:10Z'
  },
  {
    warehouseCode: 'US-MIDWEST-DC2',
    warehouseName: 'Midwest Distribution Center (Plainfield, IN)',
    sku: 'SKU-412',
    productName: 'Ultra Soundbar Gen 2',
    availableStock: 0,
    reservedStock: 8,
    safetyStockThreshold: 220,
    bufferDays: 3,
    lastInventoryAudit: '2026-10-21T06:00:00Z',
    stockoutDate: '2026-10-17T08:15:00Z'
  },
  {
    warehouseCode: 'US-EAST-DC3',
    warehouseName: 'East Coast DC (Allentown, PA)',
    sku: 'SKU-409',
    productName: 'Apex Pro ANC Headphones',
    availableStock: 0,
    reservedStock: 2,
    safetyStockThreshold: 350,
    bufferDays: 3,
    lastInventoryAudit: '2026-10-21T06:00:00Z',
    stockoutDate: '2026-10-16T16:00:00Z'
  },
  {
    warehouseCode: 'US-WEST-DC1',
    warehouseName: 'West Coast Regional Fulfillment Hub',
    sku: 'SKU-301',
    productName: 'Standard Wired Earbuds',
    availableStock: 1840,
    reservedStock: 120,
    safetyStockThreshold: 300,
    bufferDays: 14,
    lastInventoryAudit: '2026-10-21T06:00:00Z'
  }
];

export const SEEDED_SUPPLIER_RECORDS: SupplierRecord[] = [
  {
    poNumber: 'PO-88321',
    supplierId: 'SUP-SHENZHEN-01',
    supplierName: 'Shenzhen Acoustics Component Co.',
    skuList: [
      { sku: 'SKU-409', quantity: 3000 },
      { sku: 'SKU-412', quantity: 1500 }
    ],
    orderedDate: '2026-09-14T00:00:00Z',
    scheduledArrival: '2026-10-11T00:00:00Z',
    actualArrival: '2026-10-20T18:00:00Z',
    delayDays: 9,
    currentStatus: 'cleared_crossdock',
    transportMode: 'ocean_freight',
    portLocation: 'Port of Long Beach, Terminal B',
    customsReleaseDate: '2026-10-19T14:30:00Z'
  },
  {
    poNumber: 'PO-88190',
    supplierId: 'SUP-TAIPEI-02',
    supplierName: 'Taipei Silicon Microcontrollers Ltd.',
    skuList: [
      { sku: 'SKU-301', quantity: 10000 }
    ],
    orderedDate: '2026-09-01T00:00:00Z',
    scheduledArrival: '2026-10-04T00:00:00Z',
    actualArrival: '2026-10-04T12:00:00Z',
    delayDays: 0,
    currentStatus: 'delivered',
    transportMode: 'air_priority',
    portLocation: 'San Francisco International Air Cargo'
  }
];

export const SEEDED_TRAFFIC_RECORDS: StorefrontTrafficRecord[] = [
  {
    date: '2026-10-18',
    category: 'Audio Hardware',
    sessions: 26400,
    productImpressions: 98400,
    cartAdditions: 4200,
    conversionRate: 0.85,
    bounceRate: 52.4,
    yearOverYearDelta: '+4.2%'
  },
  {
    date: '2026-10-19',
    category: 'Audio Hardware',
    sessions: 27100,
    productImpressions: 102300,
    cartAdditions: 3950,
    conversionRate: 0.78,
    bounceRate: 54.1,
    yearOverYearDelta: '+4.5%'
  }
];

export const SEEDED_PROMO_RECORDS: PromoAuditRecord[] = [
  {
    campaignId: 'CMP-AUTUMN-AUDIO',
    campaignName: 'Autumn Audio 15% VIP Promotion',
    discountPercentage: 15,
    validFrom: '2026-10-01T00:00:00Z',
    validTo: '2026-10-31T23:59:59Z',
    couponUptimePercent: 99.98,
    adSpendDollars: 24500,
    status: 'active_healthy'
  }
];
