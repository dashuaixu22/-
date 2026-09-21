import { PresetTimeRangeType } from '../types';

// ==========================================
// 1. 供应商数 (supplier_count) 模拟数据
// ==========================================
export interface SupplierCategoryItem {
  name: string;
  count: number;
  color: string;
  newCount: number;
}

export interface SupplierCountData {
  newCount: number; // 新增供应商数 (家)
  growthRate: number; // 供应商增长率 (%)
  trendDates: string[]; // 折线图时间
  trendValues: number[]; // 折线图新增数 (家)
  growthRateDates: string[]; // 增长率折线图时间
  growthRateValues: number[]; // 增长率折线图数值 (%)
}

export const SUPPLIER_COUNT_DATA: {
  totalCount: number; // 供应商总数 (累计有效供应商总数)
  byRange: Record<PresetTimeRangeType, SupplierCountData>;
  categoryData: SupplierCategoryItem[];
} = {
  totalCount: 368, // 累计有效供应商总数
  byRange: {
    year: {
      newCount: 142,
      growthRate: 38.6,
      trendDates: ['2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08'],
      trendValues: [8, 10, 12, 11, 14, 9, 13, 15, 12, 16, 10, 12],
      growthRateDates: ['2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08'],
      growthRateValues: [24.5, 26.2, 28.0, 27.4, 30.1, 29.5, 32.0, 35.2, 34.6, 37.8, 36.5, 38.6],
    },
    month: {
      newCount: 28,
      growthRate: 12.4,
      trendDates: ['08-01', '08-05', '08-09', '08-13', '08-17', '08-21', '08-25', '08-28'],
      trendValues: [3, 4, 2, 5, 3, 4, 3, 4],
      growthRateDates: ['08-01', '08-05', '08-09', '08-13', '08-17', '08-21', '08-25', '08-28'],
      growthRateValues: [8.2, 9.1, 8.8, 10.4, 9.8, 11.2, 11.8, 12.4],
    },
    week: {
      newCount: 8,
      growthRate: 5.2,
      trendDates: ['08-22', '08-23', '08-24', '08-25', '08-26', '08-27', '08-28'],
      trendValues: [1, 2, 0, 1, 2, 1, 1],
      growthRateDates: ['08-22', '08-23', '08-24', '08-25', '08-26', '08-27', '08-28'],
      growthRateValues: [3.8, 4.2, 4.0, 4.5, 4.9, 5.0, 5.2],
    },
    today: {
      newCount: 2,
      growthRate: 5.2, // 增长率无法有当日数据展示近一周增长率
      trendDates: ['08-22', '08-23', '08-24', '08-25', '08-26', '08-27', '08-28'],
      trendValues: [1, 2, 0, 1, 2, 1, 2],
      growthRateDates: ['08-22', '08-23', '08-24', '08-25', '08-26', '08-27', '08-28'],
      growthRateValues: [3.8, 4.2, 4.0, 4.5, 4.9, 5.0, 5.2],
    },
  },
  // 供应商分类：算力、模型、智能体、终端、开发工具、运行服务、运营服务
  categoryData: [
    { name: '算力', count: 82, newCount: 6, color: '#1D4ED8' },
    { name: '模型', count: 68, newCount: 5, color: '#2563EB' },
    { name: '智能体', count: 54, newCount: 5, color: '#3B82F6' },
    { name: '终端', count: 46, newCount: 4, color: '#06B6D4' },
    { name: '开发工具', count: 42, newCount: 3, color: '#0284C7' },
    { name: '运行服务', count: 40, newCount: 3, color: '#4F46E5' },
    { name: '运营服务', count: 36, newCount: 2, color: '#6366F1' },
  ],
};

// ==========================================
// 2. 供应商消费 (supplier_consumption) 模拟数据
// ==========================================
export interface SupplierConsumptionRangeData {
  paidSuppliers: number; // 付费供应商数 (增值服务)
  newAmount: number; // 新增消费金额 (万元)
  newOrders: number; // 新增消费订单数 (笔)
  categories: {
    name: string;
    newAmount: number; // 新增消费金额 (万元)
    totalAmount: number; // 累计金额 (万元)
  }[];
}

export const SUPPLIER_CONSUMPTION_DATA: {
  totalOrders: number; // 供应商消费总订单 (累计订单数)
  totalAmount: number; // 供应商消费总金额 (累计金额, 万元)
  totalPaidSuppliers: number; // 累计付费供应商数
  byRange: Record<PresetTimeRangeType, SupplierConsumptionRangeData>;
} = {
  totalOrders: 15480,
  totalAmount: 4430.0,
  totalPaidSuppliers: 118,
  byRange: {
    year: {
      paidSuppliers: 104,
      newAmount: 1340.2,
      newOrders: 3820,
      categories: [
        { name: '客户分析服务', newAmount: 245.0, totalAmount: 820.0 },
        { name: '营销服务', newAmount: 218.0, totalAmount: 740.0 },
        { name: '销售服务', newAmount: 182.5, totalAmount: 615.0 },
        { name: '售后服务', newAmount: 154.2, totalAmount: 512.0 },
        { name: '维系服务', newAmount: 136.0, totalAmount: 450.0 },
        { name: '广告服务', newAmount: 122.0, totalAmount: 405.0 },
        { name: '发票代理', newAmount: 98.5, totalAmount: 330.0 },
        { name: '产品推荐', newAmount: 78.0, totalAmount: 258.0 },
        { name: '会员服务（商户）', newAmount: 62.0, totalAmount: 185.0 },
        { name: '产品分析', newAmount: 44.0, totalAmount: 115.0 },
      ],
    },
    month: {
      paidSuppliers: 68,
      newAmount: 117.2,
      newOrders: 380,
      categories: [
        { name: '客户分析服务', newAmount: 21.5, totalAmount: 820.0 },
        { name: '营销服务', newAmount: 19.2, totalAmount: 740.0 },
        { name: '销售服务', newAmount: 16.0, totalAmount: 615.0 },
        { name: '售后服务', newAmount: 13.5, totalAmount: 512.0 },
        { name: '维系服务', newAmount: 11.8, totalAmount: 450.0 },
        { name: '广告服务', newAmount: 10.6, totalAmount: 405.0 },
        { name: '发票代理', newAmount: 8.6, totalAmount: 330.0 },
        { name: '产品推荐', newAmount: 6.8, totalAmount: 258.0 },
        { name: '会员服务（商户）', newAmount: 5.4, totalAmount: 185.0 },
        { name: '产品分析', newAmount: 3.8, totalAmount: 115.0 },
      ],
    },
    week: {
      paidSuppliers: 32,
      newAmount: 28.6,
      newOrders: 95,
      categories: [
        { name: '客户分析服务', newAmount: 5.2, totalAmount: 820.0 },
        { name: '营销服务', newAmount: 4.7, totalAmount: 740.0 },
        { name: '销售服务', newAmount: 3.9, totalAmount: 615.0 },
        { name: '售后服务', newAmount: 3.3, totalAmount: 512.0 },
        { name: '维系服务', newAmount: 2.9, totalAmount: 450.0 },
        { name: '广告服务', newAmount: 2.6, totalAmount: 405.0 },
        { name: '发票代理', newAmount: 2.1, totalAmount: 330.0 },
        { name: '产品推荐', newAmount: 1.7, totalAmount: 258.0 },
        { name: '会员服务（商户）', newAmount: 1.3, totalAmount: 185.0 },
        { name: '产品分析', newAmount: 0.9, totalAmount: 115.0 },
      ],
    },
    today: {
      paidSuppliers: 8,
      newAmount: 4.2,
      newOrders: 15,
      categories: [
        { name: '客户分析服务', newAmount: 0.78, totalAmount: 820.0 },
        { name: '营销服务', newAmount: 0.69, totalAmount: 740.0 },
        { name: '销售服务', newAmount: 0.58, totalAmount: 615.0 },
        { name: '售后服务', newAmount: 0.49, totalAmount: 512.0 },
        { name: '维系服务', newAmount: 0.43, totalAmount: 450.0 },
        { name: '广告服务', newAmount: 0.39, totalAmount: 405.0 },
        { name: '发票代理', newAmount: 0.31, totalAmount: 330.0 },
        { name: '产品推荐', newAmount: 0.25, totalAmount: 258.0 },
        { name: '会员服务（商户）', newAmount: 0.19, totalAmount: 185.0 },
        { name: '产品分析', newAmount: 0.13, totalAmount: 115.0 },
      ],
    },
  },
};

// ==========================================
// 2.1 消费增值服务金额 Top 10 的商家 (供应商)
// ==========================================
export interface VasSupplierTopItem {
  rank: number;
  supplierId: string;
  supplierName: string;
  category: string;
  orderCount: number; // 增值服务订单笔数
  amountByRange: Record<PresetTimeRangeType | 'total', number>; // 增值服务消费金额 (万元)
  mainVasService: string; // 主要订购的增值服务类别
}

export const TOP10_VAS_CONSUMPTION_SUPPLIERS: VasSupplierTopItem[] = [
  {
    rank: 1,
    supplierId: 'SUP-2024-001',
    supplierName: '火山引擎云计算技术有限公司',
    category: '算力',
    orderCount: 428,
    amountByRange: {
      today: 0.85,
      week: 5.4,
      month: 22.8,
      year: 256.0,
      total: 348.5,
    },
    mainVasService: '客户分析服务',
  },
  {
    rank: 2,
    supplierId: 'SUP-2024-002',
    supplierName: '百度智能云技术有限公司',
    category: '模型',
    orderCount: 395,
    amountByRange: {
      today: 0.72,
      week: 4.8,
      month: 19.5,
      year: 228.0,
      total: 312.0,
    },
    mainVasService: '营销服务',
  },
  {
    rank: 3,
    supplierId: 'SUP-2024-003',
    supplierName: '商汤科技开发有限公司',
    category: '模型',
    orderCount: 340,
    amountByRange: {
      today: 0.65,
      week: 4.2,
      month: 17.2,
      year: 195.0,
      total: 268.0,
    },
    mainVasService: '销售服务',
  },
  {
    rank: 4,
    supplierId: 'SUP-2024-004',
    supplierName: '科大讯飞股份有限公司',
    category: '智能体',
    orderCount: 312,
    amountByRange: {
      today: 0.58,
      week: 3.6,
      month: 15.0,
      year: 178.0,
      total: 242.0,
    },
    mainVasService: '售后服务',
  },
  {
    rank: 5,
    supplierId: 'SUP-2024-005',
    supplierName: '优刻得科技股份有限公司',
    category: '算力',
    orderCount: 285,
    amountByRange: {
      today: 0.45,
      week: 3.1,
      month: 13.5,
      year: 162.0,
      total: 218.0,
    },
    mainVasService: '维系服务',
  },
  {
    rank: 6,
    supplierId: 'SUP-2024-006',
    supplierName: '第四范式人工智能科技公司',
    category: '开发工具',
    orderCount: 246,
    amountByRange: {
      today: 0.38,
      week: 2.7,
      month: 11.8,
      year: 145.0,
      total: 195.0,
    },
    mainVasService: '广告服务',
  },
  {
    rank: 7,
    supplierId: 'SUP-2024-007',
    supplierName: '中科曙光信息产业股份有限公司',
    category: '算力',
    orderCount: 220,
    amountByRange: {
      today: 0.32,
      week: 2.3,
      month: 10.2,
      year: 132.0,
      total: 180.0,
    },
    mainVasService: '发票代理',
  },
  {
    rank: 8,
    supplierId: 'SUP-2024-008',
    supplierName: '智谱华章科技有限公司',
    category: '模型',
    orderCount: 198,
    amountByRange: {
      today: 0.28,
      week: 1.9,
      month: 9.0,
      year: 118.0,
      total: 165.0,
    },
    mainVasService: '产品推荐',
  },
  {
    rank: 9,
    supplierId: 'SUP-2024-009',
    supplierName: '浪潮电子信息产业股份有限公司',
    category: '运行服务',
    orderCount: 175,
    amountByRange: {
      today: 0.22,
      week: 1.6,
      month: 7.8,
      year: 105.0,
      total: 148.0,
    },
    mainVasService: '会员服务（商户）',
  },
  {
    rank: 10,
    supplierId: 'SUP-2024-010',
    supplierName: '百川智能科技有限公司',
    category: '模型',
    orderCount: 160,
    amountByRange: {
      today: 0.18,
      week: 1.4,
      month: 6.5,
      year: 92.0,
      total: 135.0,
    },
    mainVasService: '产品分析',
  },
];

// ==========================================
// 3. 供应商产商品 (supplier_products) 模拟数据
// ==========================================
export interface SupplierProductsData {
  // Tab 1: 产商品概况 (不设置时间筛选)
  overview: {
    totalProducts: number; // 供应商产商品总数
    categories: {
      name: string;
      count: number;
    }[];
  };
  // Tab 2: 销售表现
  sales: {
    byRange: Record<
      PresetTimeRangeType,
      {
        newOrders: number; // 供应商新增销售订单数
        totalOrders: number; // 供应商销售订单总数
        salesAmount: number; // 供应商销售金额 (万元)
        categoryOrders: {
          name: string;
          orders: number; // 销售订单数量
        }[];
      }
    >;
    totalSalesAmount: number; // 累计供应商销售金额 (万元)
  };
}

export const SUPPLIER_PRODUCTS_DATA: SupplierProductsData = {
  overview: {
    totalProducts: 1284,
    categories: [
      { name: '算力', count: 486 },
      { name: '模型', count: 268 },
      { name: '智能体', count: 195 },
      { name: '终端', count: 132 },
      { name: '开发工具', count: 96 },
      { name: '运行服务', count: 62 },
      { name: '运营服务', count: 45 },
    ],
  },
  sales: {
    totalSalesAmount: 286500.0,
    byRange: {
      year: {
        newOrders: 42860,
        totalOrders: 186400,
        salesAmount: 70865.0,
        categoryOrders: [
          { name: '算力', orders: 16500 },
          { name: '模型', orders: 9800 },
          { name: '智能体', orders: 6900 },
          { name: '终端', orders: 4200 },
          { name: '开发工具', orders: 2800 },
          { name: '运行服务', orders: 1560 },
          { name: '运营服务', orders: 1100 },
        ],
      },
      month: {
        newOrders: 3850,
        totalOrders: 186400,
        salesAmount: 6530.0,
        categoryOrders: [
          { name: '算力', orders: 1480 },
          { name: '模型', orders: 890 },
          { name: '智能体', orders: 620 },
          { name: '终端', orders: 380 },
          { name: '开发工具', orders: 250 },
          { name: '运行服务', orders: 135 },
          { name: '运营服务', orders: 95 },
        ],
      },
      week: {
        newOrders: 960,
        totalOrders: 186400,
        salesAmount: 1650.0,
        categoryOrders: [
          { name: '算力', orders: 370 },
          { name: '模型', orders: 220 },
          { name: '智能体', orders: 155 },
          { name: '终端', orders: 95 },
          { name: '开发工具', orders: 62 },
          { name: '运行服务', orders: 35 },
          { name: '运营服务', orders: 23 },
        ],
      },
      today: {
        newOrders: 145,
        totalOrders: 186400,
        salesAmount: 245.0,
        categoryOrders: [
          { name: '算力', orders: 56 },
          { name: '模型', orders: 34 },
          { name: '智能体', orders: 23 },
          { name: '终端', orders: 14 },
          { name: '开发工具', orders: 9 },
          { name: '运行服务', orders: 5 },
          { name: '运营服务', orders: 4 },
        ],
      },
    },
  },
};
