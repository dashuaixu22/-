import { PresetTimeRangeType } from '../types';

// =========================================================================
// 1. 产商品分析 - 产品信息 (product_info) 模拟数据
// =========================================================================

export interface ProductInfoData {
  categoryCount: number; // 现有增值服务类别总数 (10类)
  totalOrders: number; // 累计有效订单总数 (42,850笔)
  newOrdersByRange: Record<
    PresetTimeRangeType,
    {
      newOrders: number;
      growthRate: string;
      isUp: boolean;
    }
  >;
  // 各增值服务类别的订单数据 (支持新增订单 today/week/month/year 与 累计订单 total)
  categoriesOrders: {
    name: string;
    totalCount: number;
    todayCount: number;
    weekCount: number;
    monthCount: number;
    yearCount: number;
  }[];
  // 增值服务类别及其包含的具体产品 (来自现有系统)
  categoryProductList: {
    categoryName: string;
    products: string[];
  }[];
}

export const PRODUCT_INFO_DATA: ProductInfoData = {
  categoryCount: 10,
  totalOrders: 42850,
  newOrdersByRange: {
    today: { newOrders: 48, growthRate: '+1.5%', isUp: true },
    week: { newOrders: 315, growthRate: '+4.2%', isUp: true },
    month: { newOrders: 1280, growthRate: '+8.5%', isUp: true },
    year: { newOrders: 13420, growthRate: '+16.8%', isUp: true },
  },
  categoriesOrders: [
    { name: '客户分析服务', totalCount: 6420, todayCount: 8, weekCount: 52, monthCount: 210, yearCount: 2150 },
    { name: '营销服务', totalCount: 5890, todayCount: 7, weekCount: 48, monthCount: 195, yearCount: 1980 },
    { name: '销售服务', totalCount: 5120, todayCount: 6, weekCount: 39, monthCount: 160, yearCount: 1650 },
    { name: '售后服务', totalCount: 4680, todayCount: 5, weekCount: 35, monthCount: 140, yearCount: 1480 },
    { name: '维系服务', totalCount: 4210, todayCount: 5, weekCount: 31, monthCount: 125, yearCount: 1320 },
    { name: '广告服务', totalCount: 3950, todayCount: 4, weekCount: 28, monthCount: 115, yearCount: 1210 },
    { name: '发票代理', totalCount: 3840, todayCount: 4, weekCount: 26, monthCount: 105, yearCount: 1150 },
    { name: '产品推荐', totalCount: 3360, todayCount: 4, weekCount: 23, monthCount: 95, yearCount: 990 },
    { name: '会员服务（商户）', totalCount: 2980, todayCount: 3, weekCount: 18, monthCount: 75, yearCount: 830 },
    { name: '产品分析', totalCount: 2400, todayCount: 2, weekCount: 15, monthCount: 60, yearCount: 660 },
  ],
  categoryProductList: [
    {
      categoryName: '客户分析服务',
      products: [
        '客户画像分析套件',
        '客户流失预测模型',
        '客户算力消费行为洞察',
        '潜客价值评估报告',
      ],
    },
    {
      categoryName: '营销服务',
      products: [
        '精准算力营销推广包',
        '大模型营销获客助手',
        '多渠道联合获客方案',
        '算力优惠券营销投放',
      ],
    },
    {
      categoryName: '销售服务',
      products: [
        '商机智能撮合推荐',
        '智能销售辅助线索包',
        '销售转化加速套件',
        '大客户采购对接服务',
      ],
    },
    {
      categoryName: '售后服务',
      products: [
        '7x24小时专属技术售后支持',
        '专家巡检与故障排查服务',
        'SLA履约保障增强包',
        '模型部署售后调优服务',
      ],
    },
    {
      categoryName: '维系服务',
      products: [
        '客户健康度监控服务',
        '高净值供应商专属顾问服务',
        '客户续约激活关怀包',
        '定期运维巡检回访',
      ],
    },
    {
      categoryName: '广告服务',
      products: [
        '算力商城首页横幅推广位',
        '精准弹窗广告投放',
        '搜索置顶竞价推荐位',
        '行业专题推介展位',
      ],
    },
    {
      categoryName: '发票代理',
      products: [
        '电子发票自动化批量开具',
        '增值税专用发票托管代办',
        '财税合规对账审核服务',
        '发票智能验真系统',
      ],
    },
    {
      categoryName: '产品推荐',
      products: [
        '算力模型智能推荐引擎',
        '终端适配智能选型服务',
        '工具链交叉推荐组件',
        '热销服务置顶推荐',
      ],
    },
    {
      categoryName: '会员服务（商户）',
      products: [
        '企业黄金商户会员权益',
        '钻石供应商专属特权',
        '生态伙伴认证权益包',
        '开发者认证特权通道',
      ],
    },
    {
      categoryName: '产品分析',
      products: [
        '产品运营转化深度分析',
        '算力产品用量热力分析',
        '产品留存与流失归因',
        '竞品价格对标分析报告',
      ],
    },
  ],
};

// =========================================================================
// 2. 产商品分析 - 产品价值 (product_value) 模拟数据
// =========================================================================

export interface ProductValueData {
  // Tab 1: 客单价表现
  arpuPerformance: {
    // 增值服务客单价指标卡 (支持 week, month, year, total)
    arpuValues: Record<PresetTimeRangeType | 'total', number>;
    overallArpu: number; // 整体客单价基准参考线 (元)
    // 各类别客单价比较
    categoryArpu: {
      name: string;
      arpu: number; // 元
    }[];
    // 客单价增长率模块 (支持 week, month, year)
    growthRateByRange: Record<
      PresetTimeRangeType,
      {
        rate: string;
        isUp: boolean;
        trendDates: string[];
        trendRates: number[];
      }
    >;
  };
  // Tab 2: 客户与产品价值
  customerAndProductValue: {
    // 增值服务客户均价 (元/人)
    customerAvgPrice: Record<PresetTimeRangeType, number>;
    // 增值服务产品均价 (元/个)
    productAvgPrice: Record<PresetTimeRangeType, number>;
    // 客户平均订单数 (笔/人)
    customerAvgOrders: Record<PresetTimeRangeType, number>;
    // 下方单坐标轴横向柱状图按类别对比数据
    byCategoryMetrics: {
      name: string;
      customerAvgPrice: number; // 客户均价 (元)
      productAvgPrice: number; // 产品均价 (元)
      customerAvgOrders: number; // 平均订单数 (笔)
    }[];
  };
}

export const PRODUCT_VALUE_DATA: ProductValueData = {
  arpuPerformance: {
    arpuValues: {
      today: 2420,
      week: 2580,
      month: 2850,
      year: 3120,
      total: 2980,
    },
    overallArpu: 2980,
    categoryArpu: [
      { name: '客户分析服务', arpu: 3820 },
      { name: '营销服务', arpu: 3740 },
      { name: '销售服务', arpu: 3560 },
      { name: '售后服务', arpu: 3290 },
      { name: '维系服务', arpu: 3230 },
      { name: '广告服务', arpu: 3090 },
      { name: '发票代理', arpu: 2560 },
      { name: '产品推荐', arpu: 2320 },
      { name: '会员服务（商户）', arpu: 2080 },
      { name: '产品分析', arpu: 1910 },
    ],
    growthRateByRange: {
      year: {
        rate: '+14.6%',
        isUp: true,
        trendDates: ['2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08'],
        trendRates: [8.2, 9.1, 9.8, 10.5, 11.2, 10.8, 11.9, 12.6, 13.1, 13.8, 14.2, 14.6],
      },
      month: {
        rate: '+5.8%',
        isUp: true,
        trendDates: ['08-01', '08-05', '08-09', '08-13', '08-17', '08-21', '08-25', '08-28'],
        trendRates: [3.8, 4.2, 4.0, 4.6, 4.9, 5.2, 5.5, 5.8],
      },
      week: {
        rate: '+3.2%',
        isUp: true,
        trendDates: ['08-22', '08-23', '08-24', '08-25', '08-26', '08-27', '08-28'],
        trendRates: [2.1, 2.3, 2.5, 2.7, 2.9, 3.0, 3.2],
      },
      today: {
        // 增长率无当日数据，展示近一周增长率
        rate: '+3.2%',
        isUp: true,
        trendDates: ['08-22', '08-23', '08-24', '08-25', '08-26', '08-27', '08-28'],
        trendRates: [2.1, 2.3, 2.5, 2.7, 2.9, 3.0, 3.2],
      },
    },
  },
  customerAndProductValue: {
    customerAvgPrice: {
      today: 780,
      week: 2600,
      month: 9800,
      year: 38500,
    },
    productAvgPrice: {
      today: 420,
      week: 1350,
      month: 4600,
      year: 16800,
    },
    customerAvgOrders: {
      today: 1.05,
      week: 1.2,
      month: 1.8,
      year: 4.2,
    },
    byCategoryMetrics: [
      { name: '客户分析服务', customerAvgPrice: 42000, productAvgPrice: 19500, customerAvgOrders: 4.8 },
      { name: '营销服务', customerAvgPrice: 39500, productAvgPrice: 18200, customerAvgOrders: 4.5 },
      { name: '销售服务', customerAvgPrice: 36200, productAvgPrice: 16900, customerAvgOrders: 4.2 },
      { name: '售后服务', customerAvgPrice: 33800, productAvgPrice: 15400, customerAvgOrders: 3.9 },
      { name: '维系服务', customerAvgPrice: 32000, productAvgPrice: 14800, customerAvgOrders: 3.8 },
      { name: '广告服务', customerAvgPrice: 30500, productAvgPrice: 14100, customerAvgOrders: 3.6 },
      { name: '发票代理', customerAvgPrice: 26800, productAvgPrice: 12500, customerAvgOrders: 3.4 },
      { name: '产品推荐', customerAvgPrice: 24500, productAvgPrice: 11200, customerAvgOrders: 3.1 },
      { name: '会员服务（商户）', customerAvgPrice: 21000, productAvgPrice: 9800, customerAvgOrders: 2.8 },
      { name: '产品分析', customerAvgPrice: 19200, productAvgPrice: 8900, customerAvgOrders: 2.5 },
    ],
  },
};

// =========================================================================
// 2.1 增值服务销售 Top 10 的产品 (按销售金额排序)
// =========================================================================
export interface TopVasProductItem {
  rank: number;
  productName: string;
  categoryName: string;
  salesAmount: number; // 销售金额 (万元)
  orderCount: number; // 销售订单笔数
  avgPrice: number; // 产品均价 (元)
}

export const TOP10_VAS_SALES_PRODUCTS: TopVasProductItem[] = [
  {
    rank: 1,
    productName: '客户画像分析套件',
    categoryName: '客户分析服务',
    salesAmount: 385.0,
    orderCount: 1840,
    avgPrice: 20924,
  },
  {
    rank: 2,
    productName: '精准算力营销推广包',
    categoryName: '营销服务',
    salesAmount: 342.5,
    orderCount: 1620,
    avgPrice: 21142,
  },
  {
    rank: 3,
    productName: '商机智能撮合推荐',
    categoryName: '销售服务',
    salesAmount: 295.0,
    orderCount: 1450,
    avgPrice: 20345,
  },
  {
    rank: 4,
    productName: '客户流失预测模型',
    categoryName: '客户分析服务',
    salesAmount: 268.0,
    orderCount: 1380,
    avgPrice: 19420,
  },
  {
    rank: 5,
    productName: '7x24小时专属技术售后支持',
    categoryName: '售后服务',
    salesAmount: 245.5,
    orderCount: 1210,
    avgPrice: 20289,
  },
  {
    rank: 6,
    productName: '大模型营销获客助手',
    categoryName: '营销服务',
    salesAmount: 228.0,
    orderCount: 1150,
    avgPrice: 19826,
  },
  {
    rank: 7,
    productName: '客户健康度监控服务',
    categoryName: '维系服务',
    salesAmount: 210.0,
    orderCount: 1080,
    avgPrice: 19444,
  },
  {
    rank: 8,
    productName: '算力商城首页横幅推广位',
    categoryName: '广告服务',
    salesAmount: 195.0,
    orderCount: 960,
    avgPrice: 20312,
  },
  {
    rank: 9,
    productName: '增值税专用发票托管代办',
    categoryName: '发票代理',
    salesAmount: 178.0,
    orderCount: 890,
    avgPrice: 20000,
  },
  {
    rank: 10,
    productName: '算力模型智能推荐引擎',
    categoryName: '产品推荐',
    salesAmount: 156.0,
    orderCount: 820,
    avgPrice: 19024,
  },
];

// =========================================================================
// 3. 产商品分析 - 产品质量 (product_quality) 模拟数据
// =========================================================================

export interface ServiceQualityCategoryItem {
  name: string;
  duration: number; // 使用时长 (小时)
  usageCount: number; // 使用次数 (万次)
  score: number; // 综合评分 (满分5.0)
}

export interface ProductQualityData {
  // 第一行 3 个统一规格指标卡 (不设置时间Tab)
  avgDuration: number; // 服务使用时长 (平均, 小时)
  totalUsageCount: number; // 服务使用次数 (万次)
  compositeScore: number; // 服务质量评价综合评分 (满分5.0)

  // 基础服务类别质量数据 (7大基础类别)
  basicServiceList: ServiceQualityCategoryItem[];

  // 增值服务类别质量数据 (10大增值类别)
  vasServiceList: ServiceQualityCategoryItem[];
}

export const PRODUCT_QUALITY_DATA: ProductQualityData = {
  avgDuration: 58.6,
  totalUsageCount: 286.5,
  compositeScore: 4.86,

  basicServiceList: [
    { name: '算力', duration: 142.5, usageCount: 98.4, score: 4.92 },
    { name: '模型', duration: 96.8, usageCount: 68.2, score: 4.89 },
    { name: '智能体', duration: 78.4, usageCount: 45.6, score: 4.87 },
    { name: '开发工具', duration: 52.1, usageCount: 32.8, score: 4.85 },
    { name: '运行服务', duration: 44.6, usageCount: 22.4, score: 4.83 },
    { name: '终端', duration: 36.2, usageCount: 19.5, score: 4.81 },
    { name: '运营服务', duration: 28.5, usageCount: 14.2, score: 4.78 },
  ],

  vasServiceList: [
    { name: '客户分析服务', duration: 64.2, usageCount: 38.5, score: 4.90 },
    { name: '营销服务', duration: 58.6, usageCount: 34.2, score: 4.88 },
    { name: '销售服务', duration: 52.4, usageCount: 30.1, score: 4.86 },
    { name: '售后服务', duration: 48.2, usageCount: 26.8, score: 4.87 },
    { name: '维系服务', duration: 43.5, usageCount: 24.5, score: 4.84 },
    { name: '广告服务', duration: 39.8, usageCount: 22.1, score: 4.82 },
    { name: '发票代理', duration: 35.6, usageCount: 20.4, score: 4.83 },
    { name: '产品推荐', duration: 31.2, usageCount: 17.8, score: 4.79 },
    { name: '会员服务（商户）', duration: 26.8, usageCount: 15.2, score: 4.77 },
    { name: '产品分析', duration: 22.4, usageCount: 12.6, score: 4.75 },
  ],
};
