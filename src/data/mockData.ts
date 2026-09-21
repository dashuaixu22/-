import {
  ChartDataItem,
  FunnelData,
  LineChartPoint,
  MenuItem,
  MetricItem,
  PresetTimeRangeType,
  SectionOverviewData,
  TimeRangeType,
} from '../types';

export const TODAY = '2026-08-28';

export const MENU_ITEMS: MenuItem[] = [
  { key: 'home', label: '首页' },
  { key: 'supplier', label: '供应商运营' },
  { key: 'product', label: '产商品运营' },
  { key: 'transaction_value', label: '交易价值运营' },
];

// 格式化函数
export function formatCurrency(val: number): string {
  return '¥' + val.toLocaleString('zh-CN');
}

export function formatNumber(val: number): string {
  return val.toLocaleString('zh-CN');
}

// 辅助日期位移计算函数
export function shiftDate(dateStr: string, amount: number, unit: TimeRangeType): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const d = new Date(year, month, day);
  if (isNaN(d.getTime())) return dateStr;

  if (unit === 'year') {
    d.setFullYear(d.getFullYear() + amount);
  } else if (unit === 'month') {
    d.setMonth(d.getMonth() + amount);
  } else if (unit === 'week') {
    d.setDate(d.getDate() + amount * 7);
  } else if (unit === 'today') {
    d.setDate(d.getDate() + amount);
  }

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// 第一行：4个核心卡片（供应商总数、供应商销售额、订单数、平台收入）
export const FOUR_CARDS_DATA_BY_RANGE: Record<
  PresetTimeRangeType,
  {
    supplierCount: MetricItem;
    supplierSales: MetricItem;
    orderCount: MetricItem;
    platformIncome: MetricItem;
  }
> = {
  year: {
    supplierCount: { label: '供应商总数', value: '1,480', momText: '8.6%', isUp: true },
    supplierSales: { label: '供应商销售额', value: '¥78,520,000', momText: '12.6%', isUp: true },
    orderCount: { label: '订单数', value: '13,100', momText: '10.4%', isUp: true },
    platformIncome: { label: '平台收入', value: '¥7,178,000', momText: '10.7%', isUp: true },
  },
  month: {
    supplierCount: { label: '供应商总数', value: '1,480', momText: '2.1%', isUp: true },
    supplierSales: { label: '供应商销售额', value: '¥6,670,000', momText: '6.7%', isUp: true },
    orderCount: { label: '订单数', value: '1,171', momText: '5.6%', isUp: true },
    platformIncome: { label: '平台收入', value: '¥606,500', momText: '5.6%', isUp: true },
  },
  week: {
    supplierCount: { label: '供应商总数', value: '1,480', momText: '0.5%', isUp: true },
    supplierSales: { label: '供应商销售额', value: '¥1,630,000', momText: '2.8%', isUp: true },
    orderCount: { label: '订单数', value: '297', momText: '3.4%', isUp: true },
    platformIncome: { label: '平台收入', value: '¥149,000', momText: '2.3%', isUp: true },
  },
  today: {
    supplierCount: { label: '供应商总数', value: '1,480', momText: '0.1%', isUp: true },
    supplierSales: { label: '供应商销售额', value: '¥245,000', momText: '1.2%', isUp: true },
    orderCount: { label: '订单数', value: '46', momText: '1.5%', isUp: true },
    platformIncome: { label: '平台收入', value: '¥21,800', momText: '1.1%', isUp: true },
  },
};

// 第二行：基础服务卡片与增值服务卡片
export const SERVICE_CARDS_DATA_BY_RANGE: Record<
  PresetTimeRangeType,
  {
    basic: {
      title: string;
      orderCount: MetricItem;
      txAmount: MetricItem;
    };
    vas: {
      title: string;
      orderCount: MetricItem;
      txAmount: MetricItem;
    };
  }
> = {
  year: {
    basic: {
      title: '基础服务',
      orderCount: { label: '基础服务订单数', value: '9,240', momText: '12.5%', isUp: true },
      txAmount: { label: '基础服务交易总金额', value: '¥56,840,000', momText: '14.2%', isUp: true },
    },
    vas: {
      title: '增值服务',
      orderCount: { label: '增值服务订单数', value: '3,860', momText: '5.4%', isUp: true },
      txAmount: { label: '增值服务交易总金额', value: '¥21,680,000', momText: '8.5%', isUp: true },
    },
  },
  month: {
    basic: {
      title: '基础服务',
      orderCount: { label: '基础服务订单数', value: '846', momText: '6.2%', isUp: true },
      txAmount: { label: '基础服务交易总金额', value: '¥4,850,000', momText: '7.6%', isUp: true },
    },
    vas: {
      title: '增值服务',
      orderCount: { label: '增值服务订单数', value: '325', momText: '4.1%', isUp: true },
      txAmount: { label: '增值服务交易总金额', value: '¥1,820,000', momText: '4.3%', isUp: true },
    },
  },
  week: {
    basic: {
      title: '基础服务',
      orderCount: { label: '基础服务订单数', value: '215', momText: '3.8%', isUp: true },
      txAmount: { label: '基础服务交易总金额', value: '¥1,180,000', momText: '3.2%', isUp: true },
    },
    vas: {
      title: '增值服务',
      orderCount: { label: '增值服务订单数', value: '82', momText: '2.5%', isUp: false },
      txAmount: { label: '增值服务交易总金额', value: '¥450,000', momText: '1.8%', isUp: false },
    },
  },
  today: {
    basic: {
      title: '基础服务',
      orderCount: { label: '基础服务订单数', value: '32', momText: '1.8%', isUp: true },
      txAmount: { label: '基础服务交易总金额', value: '¥178,000', momText: '1.5%', isUp: true },
    },
    vas: {
      title: '增值服务',
      orderCount: { label: '增值服务订单数', value: '14', momText: '0.8%', isUp: true },
      txAmount: { label: '增值服务交易总金额', value: '¥67,000', momText: '0.9%', isUp: true },
    },
  },
};

// 第三行：整行卡片（平台总收入、基础服务佣金收入、增值服务收入）
export const PLATFORM_REVENUE_DATA_BY_RANGE: Record<
  PresetTimeRangeType,
  {
    title: string;
    totalIncome: MetricItem;
    basicCommission: MetricItem;
    vasIncome: MetricItem;
  }
> = {
  year: {
    title: '平台收入',
    totalIncome: { label: '平台总收入', value: '¥7,178,000', momText: '10.7%', isUp: true },
    basicCommission: { label: '基础服务佣金收入', value: '¥2,842,000', momText: '14.2%', isUp: true },
    vasIncome: { label: '增值服务收入', value: '¥4,336,000', momText: '8.5%', isUp: true },
  },
  month: {
    title: '平台收入',
    totalIncome: { label: '平台总收入', value: '¥606,500', momText: '5.6%', isUp: true },
    basicCommission: { label: '基础服务佣金收入', value: '¥242,500', momText: '7.6%', isUp: true },
    vasIncome: { label: '增值服务收入', value: '¥364,000', momText: '4.3%', isUp: true },
  },
  week: {
    title: '平台收入',
    totalIncome: { label: '平台总收入', value: '¥149,000', momText: '2.3%', isUp: true },
    basicCommission: { label: '基础服务佣金收入', value: '¥59,000', momText: '3.2%', isUp: true },
    vasIncome: { label: '增值服务收入', value: '¥90,000', momText: '1.8%', isUp: false },
  },
  today: {
    title: '平台收入',
    totalIncome: { label: '平台总收入', value: '¥21,800', momText: '1.1%', isUp: true },
    basicCommission: { label: '基础服务佣金收入', value: '¥8,900', momText: '1.5%', isUp: true },
    vasIncome: { label: '增值服务收入', value: '¥12,900', momText: '0.9%', isUp: true },
  },
};

// 第一行：客户模块与订单模块 (支持近一年/近一月/近一周切换)
export const CUSTOMER_DATA_BY_RANGE: Record<PresetTimeRangeType, SectionOverviewData> = {
  year: {
    title: '客户',
    metrics: [
      { label: '平台入驻总数', value: '1,480', momText: '8.6%', isUp: true },
      { label: '新增客户数', value: '156', momText: '3.2%', isUp: false },
    ],
  },
  month: {
    title: '客户',
    metrics: [
      { label: '平台入驻总数', value: '1,480', momText: '2.1%', isUp: true },
      { label: '新增客户数', value: '38', momText: '5.8%', isUp: true },
    ],
  },
  week: {
    title: '客户',
    metrics: [
      { label: '平台入驻总数', value: '1,480', momText: '0.5%', isUp: true },
      { label: '新增客户数', value: '12', momText: '14.3%', isUp: true },
    ],
  },
  today: {
    title: '客户',
    metrics: [
      { label: '平台入驻总数', value: '1,480', momText: '0.1%', isUp: true },
      { label: '新增客户数', value: '3', momText: '5.0%', isUp: true },
    ],
  },
};

export const ORDER_DATA_BY_RANGE: Record<PresetTimeRangeType, SectionOverviewData> = {
  year: {
    title: '订单',
    metrics: [
      { label: '基础服务订单数', value: '9,240', momText: '12.5%', isUp: true },
      { label: '增值服务订单数', value: '3,860', momText: '5.4%', isUp: true },
    ],
  },
  month: {
    title: '订单',
    metrics: [
      { label: '基础服务订单数', value: '846', momText: '6.2%', isUp: true },
      { label: '增值服务订单数', value: '325', momText: '4.1%', isUp: true },
    ],
  },
  week: {
    title: '订单',
    metrics: [
      { label: '基础服务订单数', value: '215', momText: '3.8%', isUp: true },
      { label: '增值服务订单数', value: '82', momText: '2.5%', isUp: false },
    ],
  },
  today: {
    title: '订单',
    metrics: [
      { label: '基础服务订单数', value: '32', momText: '1.8%', isUp: true },
      { label: '增值服务订单数', value: '14', momText: '0.8%', isUp: true },
    ],
  },
};

// 第二行：交易模块与收入模块 (支持近一年/近一月/近一周切换)
export const TRANSACTION_DATA_BY_RANGE: Record<PresetTimeRangeType, SectionOverviewData> = {
  year: {
    title: '交易',
    metrics: [
      { label: '基础服务交易总金额', value: '¥56,840,000', momText: '14.2%', isUp: true },
      { label: '增值服务交易总金额', value: '¥21,680,000', momText: '8.5%', isUp: true },
    ],
  },
  month: {
    title: '交易',
    metrics: [
      { label: '基础服务交易总金额', value: '¥4,850,000', momText: '7.6%', isUp: true },
      { label: '增值服务交易总金额', value: '¥1,820,000', momText: '4.3%', isUp: true },
    ],
  },
  week: {
    title: '交易',
    metrics: [
      { label: '基础服务交易总金额', value: '¥1,180,000', momText: '3.2%', isUp: true },
      { label: '增值服务交易总金额', value: '¥450,000', momText: '1.8%', isUp: false },
    ],
  },
  today: {
    title: '交易',
    metrics: [
      { label: '基础服务交易总金额', value: '¥178,000', momText: '1.5%', isUp: true },
      { label: '增值服务交易总金额', value: '¥67,000', momText: '0.9%', isUp: true },
    ],
  },
};

export const INCOME_DATA_BY_RANGE: Record<PresetTimeRangeType, SectionOverviewData> = {
  year: {
    title: '收入',
    metrics: [
      { label: '撮合服务收入', value: '¥2,842,000', momText: '14.2%', isUp: true },
      { label: '增值服务收入', value: '¥4,336,000', momText: '8.5%', isUp: true },
    ],
  },
  month: {
    title: '收入',
    metrics: [
      { label: '撮合服务收入', value: '¥242,500', momText: '7.6%', isUp: true },
      { label: '增值服务收入', value: '¥364,000', momText: '4.3%', isUp: true },
    ],
  },
  week: {
    title: '收入',
    metrics: [
      { label: '撮合服务收入', value: '¥59,000', momText: '3.2%', isUp: true },
      { label: '增值服务收入', value: '¥90,000', momText: '1.8%', isUp: false },
    ],
  },
  today: {
    title: '收入',
    metrics: [
      { label: '撮合服务收入', value: '¥8,900', momText: '1.5%', isUp: true },
      { label: '增值服务收入', value: '¥12,900', momText: '0.9%', isUp: true },
    ],
  },
};

// 第三行：客单价类别与演示数值 (支持近一年/近一月/近一周切换)
export const ARPU_CATEGORIES = [
  '汇总',
  '客户分析服务',
  '营销服务',
  '销售服务',
  '售后服务',
  '维系服务',
  '广告服务',
  '发票代理',
  '产品推荐',
  '会员服务（商户）',
  '产品分析',
] as const;

export const ARPU_VALUES_BY_RANGE: Record<PresetTimeRangeType, Record<string, number>> = {
  year: {
    汇总: 18500,
    客户分析服务: 24600,
    营销服务: 19800,
    销售服务: 16500,
    售后服务: 12300,
    维系服务: 14200,
    广告服务: 28000,
    发票代理: 8900,
    产品推荐: 15600,
    '会员服务（商户）': 32000,
    产品分析: 21400,
  },
  month: {
    汇总: 17200,
    客户分析服务: 23100,
    营销服务: 18600,
    销售服务: 15200,
    售后服务: 11500,
    维系服务: 13000,
    广告服务: 26500,
    发票代理: 7800,
    产品推荐: 14200,
    '会员服务（商户）': 29800,
    产品分析: 19800,
  },
  week: {
    汇总: 16800,
    客户分析服务: 22400,
    营销服务: 17900,
    销售服务: 14800,
    售后服务: 11000,
    维系服务: 12500,
    广告服务: 25800,
    发票代理: 7200,
    产品推荐: 13600,
    '会员服务（商户）': 28600,
    产品分析: 18900,
  },
  today: {
    汇总: 16500,
    客户分析服务: 22100,
    营销服务: 17600,
    销售服务: 14500,
    售后服务: 10800,
    维系服务: 12200,
    广告服务: 25400,
    发票代理: 7000,
    产品推荐: 13400,
    '会员服务（商户）': 28200,
    产品分析: 18600,
  },
};

// 第三行：转化漏斗数据 (支持近一年/近一月/近一周切换)
export const FUNNEL_DATA_BY_RANGE: Record<PresetTimeRangeType, FunnelData> = {
  year: {
    signedCount: 1480,
    orderedCount: 978,
    conversionRate: 66.1,
  },
  month: {
    signedCount: 1480,
    orderedCount: 512,
    conversionRate: 34.6,
  },
  week: {
    signedCount: 1480,
    orderedCount: 196,
    conversionRate: 13.2,
  },
  today: {
    signedCount: 1480,
    orderedCount: 38,
    conversionRate: 2.6,
  },
};

// 第四行：基础服务交易额 (支持近一年/近一月/近一周切换)
export const BASIC_SERVICE_TRANSACTIONS_BY_RANGE: Record<PresetTimeRangeType, ChartDataItem[]> = {
  year: [
    { name: '算力', fullName: '算力', value: 18500000 },
    { name: '模型', fullName: '模型', value: 12400000 },
    { name: '智能体', fullName: '智能体', value: 8600000 },
    { name: '终端', fullName: '终端', value: 5800000 },
    { name: '开发工具', fullName: '开发工具', value: 4500000 },
    { name: '运行服务', fullName: '运行服务', value: 3840000 },
    { name: '运营服务', fullName: '运营服务', value: 3200000 },
  ],
  month: [
    { name: '算力', fullName: '算力', value: 1620000 },
    { name: '模型', fullName: '模型', value: 1080000 },
    { name: '智能体', fullName: '智能体', value: 750000 },
    { name: '终端', fullName: '终端', value: 490000 },
    { name: '开发工具', fullName: '开发工具', value: 380000 },
    { name: '运行服务', fullName: '运行服务', value: 290000 },
    { name: '运营服务', fullName: '运营服务', value: 240000 },
  ],
  week: [
    { name: '算力', fullName: '算力', value: 390000 },
    { name: '模型', fullName: '模型', value: 260000 },
    { name: '智能体', fullName: '智能体', value: 180000 },
    { name: '终端', fullName: '终端', value: 120000 },
    { name: '开发工具', fullName: '开发工具', value: 95000 },
    { name: '运行服务', fullName: '运行服务', value: 75000 },
    { name: '运营服务', fullName: '运营服务', value: 60000 },
  ],
  today: [
    { name: '算力', fullName: '算力', value: 58000 },
    { name: '模型', fullName: '模型', value: 39000 },
    { name: '智能体', fullName: '智能体', value: 27000 },
    { name: '终端', fullName: '终端', value: 18000 },
    { name: '开发工具', fullName: '开发工具', value: 14000 },
    { name: '运行服务', fullName: '运行服务', value: 12000 },
    { name: '运营服务', fullName: '运营服务', value: 10000 },
  ],
};

// 第四行：增值服务交易额 - 增值服务类别 (支持近一年/近一月/近一周切换)
export const VAS_CATEGORY_TRANSACTIONS_BY_RANGE: Record<PresetTimeRangeType, ChartDataItem[]> = {
  year: [
    { name: '客户分析服务', fullName: '客户分析服务', value: 3200000 },
    { name: '营销服务', fullName: '营销服务', value: 2850000 },
    { name: '销售服务', fullName: '销售服务', value: 2400000 },
    { name: '售后服务', fullName: '售后服务', value: 1850000 },
    { name: '维系服务', fullName: '维系服务', value: 1600000 },
    { name: '广告服务', fullName: '广告服务', value: 3680000 },
    { name: '发票代理', fullName: '发票代理', value: 1180000 },
    { name: '产品推荐', fullName: '产品推荐', value: 1920000 },
    { name: '会员服务(商户)', fullName: '会员服务（商户）', value: 1750000 },
    { name: '产品分析', fullName: '产品分析', value: 1250000 },
  ],
  month: [
    { name: '客户分析服务', fullName: '客户分析服务', value: 270000 },
    { name: '营销服务', fullName: '营销服务', value: 240000 },
    { name: '销售服务', fullName: '销售服务', value: 200000 },
    { name: '售后服务', fullName: '售后服务', value: 155000 },
    { name: '维系服务', fullName: '维系服务', value: 135000 },
    { name: '广告服务', fullName: '广告服务', value: 310000 },
    { name: '发票代理', fullName: '发票代理', value: 98000 },
    { name: '产品推荐', fullName: '产品推荐', value: 162000 },
    { name: '会员服务(商户)', fullName: '会员服务（商户）', value: 145000 },
    { name: '产品分析', fullName: '产品分析', value: 105000 },
  ],
  week: [
    { name: '客户分析服务', fullName: '客户分析服务', value: 68000 },
    { name: '营销服务', fullName: '营销服务', value: 59000 },
    { name: '销售服务', fullName: '销售服务', value: 50000 },
    { name: '售后服务', fullName: '售后服务', value: 38000 },
    { name: '维系服务', fullName: '维系服务', value: 33000 },
    { name: '广告服务', fullName: '广告服务', value: 76000 },
    { name: '发票代理', fullName: '发票代理', value: 24000 },
    { name: '产品推荐', fullName: '产品推荐', value: 40000 },
    { name: '会员服务(商户)', fullName: '会员服务（商户）', value: 36000 },
    { name: '产品分析', fullName: '产品分析', value: 26000 },
  ],
  today: [
    { name: '客户分析服务', fullName: '客户分析服务', value: 10200 },
    { name: '营销服务', fullName: '营销服务', value: 8900 },
    { name: '销售服务', fullName: '销售服务', value: 7500 },
    { name: '售后服务', fullName: '售后服务', value: 5700 },
    { name: '维系服务', fullName: '维系服务', value: 4900 },
    { name: '广告服务', fullName: '广告服务', value: 11400 },
    { name: '发票代理', fullName: '发票代理', value: 3600 },
    { name: '产品推荐', fullName: '产品推荐', value: 6000 },
    { name: '会员服务(商户)', fullName: '会员服务（商户）', value: 5400 },
    { name: '产品分析', fullName: '产品分析', value: 3900 },
  ],
};

// 第四行：增值服务交易额 - 客户类别 (支持近一年/近一月/近一周切换)
export const VAS_CUSTOMER_TRANSACTIONS_BY_RANGE: Record<PresetTimeRangeType, ChartDataItem[]> = {
  year: [
    { name: 'A类客户', fullName: 'A类客户', value: 9540000 },
    { name: 'B类客户', fullName: 'B类客户', value: 6280000 },
    { name: 'C类客户', fullName: 'C类客户', value: 3720000 },
    { name: 'D类客户', fullName: 'D类客户', value: 2140000 },
  ],
  month: [
    { name: 'A类客户', fullName: 'A类客户', value: 800000 },
    { name: 'B类客户', fullName: 'B类客户', value: 530000 },
    { name: 'C类客户', fullName: 'C类客户', value: 310000 },
    { name: 'D类客户', fullName: 'D类客户', value: 180000 },
  ],
  week: [
    { name: 'A类客户', fullName: 'A类客户', value: 198000 },
    { name: 'B类客户', fullName: 'B类客户', value: 130000 },
    { name: 'C类客户', fullName: 'C类客户', value: 77000 },
    { name: 'D类客户', fullName: 'D类客户', value: 45000 },
  ],
  today: [
    { name: 'A类客户', fullName: 'A类客户', value: 29500 },
    { name: 'B类客户', fullName: 'B类客户', value: 19500 },
    { name: 'C类客户', fullName: 'C类客户', value: 11500 },
    { name: 'D类客户', fullName: 'D类客户', value: 6500 },
  ],
};

// 第五行：基础服务金额增长率类别
export const BASIC_GROWTH_CATEGORIES = [
  '汇总',
  '算力',
  '模型',
  '智能体',
  '终端',
  '开发工具',
  '运行服务',
  '运营服务',
] as const;

// 12个月的时间节点（截止2026年8月）
export const YEAR_MONTHS = [
  '2025-09', '2025-10', '2025-11', '2025-12',
  '2026-01', '2026-02', '2026-03', '2026-04',
  '2026-05', '2026-06', '2026-07', '2026-08'
];

export const BASIC_GROWTH_DATA: Record<string, LineChartPoint[]> = {
  汇总: [
    { month: '2025-09', rate: 9.4 }, { month: '2025-10', rate: -1.8 },
    { month: '2025-11', rate: 11.3 }, { month: '2025-12', rate: 14.2 },
    { month: '2026-01', rate: 10.2 }, { month: '2026-02', rate: 14.5 },
    { month: '2026-03', rate: 8.8 }, { month: '2026-04', rate: -2.4 },
    { month: '2026-05', rate: 6.5 }, { month: '2026-06', rate: 18.2 },
    { month: '2026-07', rate: 15.6 }, { month: '2026-08', rate: 12.1 },
  ],
  算力: [
    { month: '2025-09', rate: 13.5 }, { month: '2025-10', rate: 2.1 },
    { month: '2025-11', rate: 17.6 }, { month: '2025-12', rate: 19.8 },
    { month: '2026-01', rate: 15.4 }, { month: '2026-02', rate: 18.2 },
    { month: '2026-03', rate: 12.0 }, { month: '2026-04', rate: 4.5 },
    { month: '2026-05', rate: 14.2 }, { month: '2026-06', rate: 24.6 },
    { month: '2026-07', rate: 21.0 }, { month: '2026-08', rate: 16.8 },
  ],
  模型: [
    { month: '2025-09', rate: 8.2 }, { month: '2025-10', rate: -3.6 },
    { month: '2025-11', rate: 9.8 }, { month: '2025-12', rate: 13.1 },
    { month: '2026-01', rate: 8.2 }, { month: '2026-02', rate: 12.6 },
    { month: '2026-03', rate: 7.1 }, { month: '2026-04', rate: -4.2 },
    { month: '2026-05', rate: 5.8 }, { month: '2026-06', rate: 16.4 },
    { month: '2026-07', rate: 14.0 }, { month: '2026-08', rate: 10.5 },
  ],
  智能体: [
    { month: '2025-09', rate: 11.0 }, { month: '2025-10', rate: 0.5 },
    { month: '2025-11', rate: 13.6 }, { month: '2025-12', rate: 16.5 },
    { month: '2026-01', rate: 12.0 }, { month: '2026-02', rate: 16.5 },
    { month: '2026-03', rate: 10.4 }, { month: '2026-04', rate: 1.2 },
    { month: '2026-05', rate: 9.6 }, { month: '2026-06', rate: 20.8 },
    { month: '2026-07', rate: 18.2 }, { month: '2026-08', rate: 14.4 },
  ],
  终端: [
    { month: '2025-09', rate: 6.2 }, { month: '2025-10', rate: -4.8 },
    { month: '2025-11', rate: 7.5 }, { month: '2025-12', rate: 10.2 },
    { month: '2026-01', rate: 6.4 }, { month: '2026-02', rate: 9.8 },
    { month: '2026-03', rate: 5.2 }, { month: '2026-04', rate: -5.6 },
    { month: '2026-05', rate: 3.1 }, { month: '2026-06', rate: 12.4 },
    { month: '2026-07', rate: 10.8 }, { month: '2026-08', rate: 8.0 },
  ],
  开发工具: [
    { month: '2025-09', rate: 7.0 }, { month: '2025-10', rate: -2.9 },
    { month: '2025-11', rate: 8.4 }, { month: '2025-12', rate: 11.5 },
    { month: '2026-01', rate: 7.8 }, { month: '2026-02', rate: 11.2 },
    { month: '2026-03', rate: 6.4 }, { month: '2026-04', rate: -3.8 },
    { month: '2026-05', rate: 4.5 }, { month: '2026-06', rate: 14.0 },
    { month: '2026-07', rate: 12.6 }, { month: '2026-08', rate: 9.1 },
  ],
  运行服务: [
    { month: '2025-09', rate: 5.1 }, { month: '2025-10', rate: -5.4 },
    { month: '2025-11', rate: 6.2 }, { month: '2025-12', rate: 8.9 },
    { month: '2026-01', rate: 5.5 }, { month: '2026-02', rate: 8.6 },
    { month: '2026-03', rate: 4.8 }, { month: '2026-04', rate: -6.2 },
    { month: '2026-05', rate: 2.4 }, { month: '2026-06', rate: 10.8 },
    { month: '2026-07', rate: 9.2 }, { month: '2026-08', rate: 6.8 },
  ],
  运营服务: [
    { month: '2025-09', rate: 4.3 }, { month: '2025-10', rate: -6.0 },
    { month: '2025-11', rate: 5.4 }, { month: '2025-12', rate: 7.8 },
    { month: '2026-01', rate: 4.9 }, { month: '2026-02', rate: 7.5 },
    { month: '2026-03', rate: 3.9 }, { month: '2026-04', rate: -7.1 },
    { month: '2026-05', rate: 1.8 }, { month: '2026-06', rate: 9.5 },
    { month: '2026-07', rate: 8.0 }, { month: '2026-08', rate: 5.9 },
  ],
};

// 第六行：增值服务金额增长率类别
export const VAS_GROWTH_CATEGORIES = [
  '汇总',
  '客户分析服务',
  '营销服务',
  '销售服务',
  '售后服务',
  '维系服务',
  '广告服务',
  '发票代理',
  '产品推荐',
  '会员服务（商户）',
  '产品分析',
] as const;

export const VAS_GROWTH_DATA: Record<string, LineChartPoint[]> = {
  汇总: [
    { month: '2025-09', rate: 6.9 }, { month: '2025-10', rate: -2.1 },
    { month: '2025-11', rate: 7.8 }, { month: '2025-12', rate: 8.5 },
    { month: '2026-01', rate: 6.8 }, { month: '2026-02', rate: 9.2 },
    { month: '2026-03', rate: 5.4 }, { month: '2026-04', rate: -3.5 },
    { month: '2026-05', rate: 4.2 }, { month: '2026-06', rate: 12.8 },
    { month: '2026-07', rate: 11.4 }, { month: '2026-08', rate: 8.6 },
  ],
  客户分析服务: [
    { month: '2025-09', rate: 8.2 }, { month: '2025-10', rate: -1.2 },
    { month: '2025-11', rate: 9.5 }, { month: '2025-12', rate: 11.2 },
    { month: '2026-01', rate: 8.4 }, { month: '2026-02', rate: 11.5 },
    { month: '2026-03', rate: 6.8 }, { month: '2026-04', rate: -2.1 },
    { month: '2026-05', rate: 5.6 }, { month: '2026-06', rate: 14.8 },
    { month: '2026-07', rate: 13.2 }, { month: '2026-08', rate: 10.1 },
  ],
  营销服务: [
    { month: '2025-09', rate: 7.4 }, { month: '2025-10', rate: -1.8 },
    { month: '2025-11', rate: 8.6 }, { month: '2025-12', rate: 9.8 },
    { month: '2026-01', rate: 7.2 }, { month: '2026-02', rate: 10.1 },
    { month: '2026-03', rate: 5.9 }, { month: '2026-04', rate: -3.0 },
    { month: '2026-05', rate: 4.8 }, { month: '2026-06', rate: 13.5 },
    { month: '2026-07', rate: 12.0 }, { month: '2026-08', rate: 9.0 },
  ],
  销售服务: [
    { month: '2025-09', rate: 5.8 }, { month: '2025-10', rate: -2.8 },
    { month: '2025-11', rate: 6.9 }, { month: '2025-12', rate: 8.0 },
    { month: '2026-01', rate: 6.1 }, { month: '2026-02', rate: 8.5 },
    { month: '2026-03', rate: 4.7 }, { month: '2026-04', rate: -4.2 },
    { month: '2026-05', rate: 3.6 }, { month: '2026-06', rate: 11.8 },
    { month: '2026-07', rate: 10.2 }, { month: '2026-08', rate: 7.5 },
  ],
  售后服务: [
    { month: '2025-09', rate: 4.6 }, { month: '2025-10', rate: -3.5 },
    { month: '2025-11', rate: 5.8 }, { month: '2025-12', rate: 6.9 },
    { month: '2026-01', rate: 5.0 }, { month: '2026-02', rate: 7.2 },
    { month: '2026-03', rate: 3.8 }, { month: '2026-04', rate: -5.0 },
    { month: '2026-05', rate: 2.8 }, { month: '2026-06', rate: 10.2 },
    { month: '2026-07', rate: 8.8 }, { month: '2026-08', rate: 6.2 },
  ],
  维系服务: [
    { month: '2025-09', rate: 4.0 }, { month: '2025-10', rate: -4.1 },
    { month: '2025-11', rate: 5.0 }, { month: '2025-12', rate: 6.2 },
    { month: '2026-01', rate: 4.5 }, { month: '2026-02', rate: 6.5 },
    { month: '2026-03', rate: 3.2 }, { month: '2026-04', rate: -5.8 },
    { month: '2026-05', rate: 2.1 }, { month: '2026-06', rate: 9.4 },
    { month: '2026-07', rate: 8.0 }, { month: '2026-08', rate: 5.5 },
  ],
  广告服务: [
    { month: '2025-09', rate: 10.8 }, { month: '2025-10', rate: 1.5 },
    { month: '2025-11', rate: 12.8 }, { month: '2025-12', rate: 14.5 },
    { month: '2026-01', rate: 11.2 }, { month: '2026-02', rate: 14.8 },
    { month: '2026-03', rate: 9.5 }, { month: '2026-04', rate: 0.8 },
    { month: '2026-05', rate: 8.2 }, { month: '2026-06', rate: 18.6 },
    { month: '2026-07', rate: 16.5 }, { month: '2026-08', rate: 13.2 },
  ],
  发票代理: [
    { month: '2025-09', rate: 3.2 }, { month: '2025-10', rate: -4.8 },
    { month: '2025-11', rate: 4.2 }, { month: '2025-12', rate: 5.1 },
    { month: '2026-01', rate: 3.8 }, { month: '2026-02', rate: 5.4 },
    { month: '2026-03', rate: 2.5 }, { month: '2026-04', rate: -6.5 },
    { month: '2026-05', rate: 1.5 }, { month: '2026-06', rate: 8.0 },
    { month: '2026-07', rate: 6.8 }, { month: '2026-08', rate: 4.5 },
  ],
  产品推荐: [
    { month: '2025-09', rate: 6.2 }, { month: '2025-10', rate: -2.4 },
    { month: '2025-11', rate: 7.4 }, { month: '2025-12', rate: 8.6 },
    { month: '2026-01', rate: 6.5 }, { month: '2026-02', rate: 9.0 },
    { month: '2026-03', rate: 5.1 }, { month: '2026-04', rate: -3.8 },
    { month: '2026-05', rate: 4.0 }, { month: '2026-06', rate: 12.2 },
    { month: '2026-07', rate: 10.8 }, { month: '2026-08', rate: 7.9 },
  ],
  '会员服务（商户）': [
    { month: '2025-09', rate: 8.9 }, { month: '2025-10', rate: -0.8 },
    { month: '2025-11', rate: 10.2 }, { month: '2025-12', rate: 12.0 },
    { month: '2026-01', rate: 9.0 }, { month: '2026-02', rate: 12.2 },
    { month: '2026-03', rate: 7.5 }, { month: '2026-04', rate: -1.5 },
    { month: '2026-05', rate: 6.4 }, { month: '2026-06', rate: 15.6 },
    { month: '2026-07', rate: 14.1 }, { month: '2026-08', rate: 11.0 },
  ],
  产品分析: [
    { month: '2025-09', rate: 5.4 }, { month: '2025-10', rate: -3.0 },
    { month: '2025-11', rate: 6.5 }, { month: '2025-12', rate: 7.6 },
    { month: '2026-01', rate: 5.8 }, { month: '2026-02', rate: 8.0 },
    { month: '2026-03', rate: 4.2 }, { month: '2026-04', rate: -4.6 },
    { month: '2026-05', rate: 3.2 }, { month: '2026-06', rate: 11.0 },
    { month: '2026-07', rate: 9.5 }, { month: '2026-08', rate: 7.0 },
  ],
};

// 第七行：撮合服务佣金增长率类别
export const COMMISSION_GROWTH_CATEGORIES = [
  '汇总',
  '算力',
  '模型',
  '智能体',
  '终端',
  '开发工具',
  '运行服务',
  '运营服务',
] as const;

export const COMMISSION_GROWTH_DATA: Record<string, LineChartPoint[]> = {
  汇总: [
    { month: '2025-09', rate: 10.1 }, { month: '2025-10', rate: -1.2 },
    { month: '2025-11', rate: 12.0 }, { month: '2025-12', rate: 14.2 },
    { month: '2026-01', rate: 11.0 }, { month: '2026-02', rate: 15.2 },
    { month: '2026-03', rate: 9.2 }, { month: '2026-04', rate: -1.8 },
    { month: '2026-05', rate: 7.0 }, { month: '2026-06', rate: 19.5 },
    { month: '2026-07', rate: 16.8 }, { month: '2026-08', rate: 13.0 },
  ],
  算力: [
    { month: '2025-09', rate: 14.5 }, { month: '2025-10', rate: 3.0 },
    { month: '2025-11', rate: 18.8 }, { month: '2025-12', rate: 21.0 },
    { month: '2026-01', rate: 16.2 }, { month: '2026-02', rate: 19.5 },
    { month: '2026-03', rate: 13.1 }, { month: '2026-04', rate: 5.0 },
    { month: '2026-05', rate: 15.0 }, { month: '2026-06', rate: 26.0 },
    { month: '2026-07', rate: 22.4 }, { month: '2026-08', rate: 17.9 },
  ],
  模型: [
    { month: '2025-09', rate: 9.0 }, { month: '2025-10', rate: -2.8 },
    { month: '2025-11', rate: 10.6 }, { month: '2025-12', rate: 13.8 },
    { month: '2026-01', rate: 9.0 }, { month: '2026-02', rate: 13.5 },
    { month: '2026-03', rate: 7.8 }, { month: '2026-04', rate: -3.5 },
    { month: '2026-05', rate: 6.5 }, { month: '2026-06', rate: 17.5 },
    { month: '2026-07', rate: 15.0 }, { month: '2026-08', rate: 11.4 },
  ],
  智能体: [
    { month: '2025-09', rate: 12.1 }, { month: '2025-10', rate: 1.2 },
    { month: '2025-11', rate: 14.8 }, { month: '2025-12', rate: 17.6 },
    { month: '2026-01', rate: 13.2 }, { month: '2026-02', rate: 17.8 },
    { month: '2026-03', rate: 11.5 }, { month: '2026-04', rate: 2.0 },
    { month: '2026-05', rate: 10.8 }, { month: '2026-06', rate: 22.0 },
    { month: '2026-07', rate: 19.5 }, { month: '2026-08', rate: 15.6 },
  ],
  终端: [
    { month: '2025-09', rate: 6.9 }, { month: '2025-10', rate: -3.8 },
    { month: '2025-11', rate: 8.2 }, { month: '2025-12', rate: 11.0 },
    { month: '2026-01', rate: 7.0 }, { month: '2026-02', rate: 10.5 },
    { month: '2026-03', rate: 5.8 }, { month: '2026-04', rate: -4.8 },
    { month: '2026-05', rate: 3.8 }, { month: '2026-06', rate: 13.5 },
    { month: '2026-07', rate: 11.8 }, { month: '2026-08', rate: 8.8 },
  ],
  开发工具: [
    { month: '2025-09', rate: 7.8 }, { month: '2025-10', rate: -2.1 },
    { month: '2025-11', rate: 9.2 }, { month: '2025-12', rate: 12.4 },
    { month: '2026-01', rate: 8.5 }, { month: '2026-02', rate: 12.0 },
    { month: '2026-03', rate: 7.1 }, { month: '2026-04', rate: -3.0 },
    { month: '2026-05', rate: 5.2 }, { month: '2026-06', rate: 15.0 },
    { month: '2026-07', rate: 13.5 }, { month: '2026-08', rate: 10.0 },
  ],
  运行服务: [
    { month: '2025-09', rate: 5.8 }, { month: '2025-10', rate: -4.5 },
    { month: '2025-11', rate: 7.0 }, { month: '2025-12', rate: 9.6 },
    { month: '2026-01', rate: 6.0 }, { month: '2026-02', rate: 9.2 },
    { month: '2026-03', rate: 5.4 }, { month: '2026-04', rate: -5.5 },
    { month: '2026-05', rate: 3.0 }, { month: '2026-06', rate: 11.8 },
    { month: '2026-07', rate: 10.0 }, { month: '2026-08', rate: 7.5 },
  ],
  运营服务: [
    { month: '2025-09', rate: 4.9 }, { month: '2025-10', rate: -5.0 },
    { month: '2025-11', rate: 6.0 }, { month: '2026-12', rate: 8.5 },
    { month: '2026-01', rate: 5.5 }, { month: '2026-02', rate: 8.2 },
    { month: '2026-03', rate: 4.5 }, { month: '2026-04', rate: -6.2 },
    { month: '2026-05', rate: 2.5 }, { month: '2026-06', rate: 10.5 },
    { month: '2026-07', rate: 9.0 }, { month: '2026-08', rate: 6.5 },
  ],
};

// 近一月与近一周的横坐标定义 (截止 2026-08-28)
export const MONTH_DAYS = [
  '07-28', '07-31', '08-03', '08-06', '08-09', '08-12',
  '08-15', '08-18', '08-21', '08-24', '08-26', '08-28',
];

export const WEEK_DAYS = [
  '08-22', '08-23', '08-24', '08-25', '08-26', '08-27', '08-28',
];

// 根据时间范围生成或获取数据
export function getGrowthDataByRange(
  baseDataMap: Record<string, LineChartPoint[]>,
  category: string,
  range: TimeRangeType
): LineChartPoint[] {
  const yearData = baseDataMap[category] || baseDataMap['汇总'] || [];
  if (range === 'year') {
    return yearData;
  }

  // 生成稳定的月度日波动数据
  if (range === 'month') {
    const seed = (category.charCodeAt(0) || 10) + (category.charCodeAt(1) || 5);
    return MONTH_DAYS.map((day, idx) => {
      const baseVal = yearData[idx % yearData.length]?.rate || 5;
      const sinOffset = Math.sin(idx * 0.8 + seed) * 4.5;
      const cosOffset = Math.cos(idx * 0.5 + seed) * 2.2;
      const rate = Number((baseVal * 0.5 + sinOffset + cosOffset).toFixed(1));
      return { month: day, rate };
    });
  }

  // 生成稳定的一周7天波动数据 (若为 'today' 当日，按要求增长率无法有当日数据时展示近一周增长率)
  const seed = (category.charCodeAt(0) || 8) * 2;
  return WEEK_DAYS.map((day, idx) => {
    const baseVal = yearData[(idx + 4) % yearData.length]?.rate || 6;
    const offset = Math.sin(idx * 1.2 + seed) * 3.8;
    const rate = Number((baseVal * 0.4 + offset).toFixed(1));
    return { month: day, rate };
  });
}
