import { TimeRangeType } from '../types';

// ==========================================
// 基础服务统一色彩定义 (7类 纯蓝系)
// ==========================================
export const BASIC_SERVICE_COLORS: Record<string, string> = {
  // 简写规范名称（7大类）
  '算力': '#1D4ED8',
  '模型': '#2563EB',
  '智能体': '#3B82F6',
  '终端': '#60A5FA',
  '开发工具': '#93C5FD',
  '运行服务': '#1E40AF',
  '运营服务': '#38BDF8',
};

// ==========================================
// 增值服务统一色彩定义 (10类 青蓝系)
// ==========================================
export const VAS_SERVICE_COLORS: Record<string, string> = {
  '客户分析服务': '#0891B2',
  '营销服务': '#06B6D4',
  '销售服务': '#0E7490',
  '售后服务': '#14B8A6',
  '维系服务': '#0D9488',
  '广告服务': '#22D3EE',
  '发票代理': '#2DD4BF',
  '产品推荐': '#0284C7',
  '会员服务（商户）': '#155E75',
  '产品分析': '#047857',
};

// ==========================================
// 1. 经营总览数据
// ==========================================
export interface BusinessOverviewData {
  newIncome: number; // 平台新增收入 (万元)
  totalIncome: number; // 平台总收入 (截至累计, 万元)
  growthRate: number; // 收入增长率 (%)
  totalTxAmount: number; // 平台交易总金额 (截至累计, 亿元/万元)
  incomeComposition: {
    basicCommission: number; // 基础服务佣金收入 (万元)
    vasIncome: number; // 增值服务收入 (万元)
  };
  growthTrend: {
    dates: string[];
    rates: number[];
    incomes: number[];
  };
}

export const BUSINESS_OVERVIEW_DATA: Record<TimeRangeType, BusinessOverviewData> = {
  year: {
    newIncome: 3820.5,
    totalIncome: 12680.0,
    growthRate: 18.6,
    totalTxAmount: 362400.0,
    incomeComposition: {
      basicCommission: 2480.3,
      vasIncome: 1340.2,
    },
    growthTrend: {
      dates: ['2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08'],
      rates: [12.4, 13.8, 15.2, 14.6, 16.0, 15.5, 17.2, 16.8, 17.9, 18.2, 18.5, 18.6],
      incomes: [265.0, 280.5, 298.0, 312.0, 305.0, 318.0, 326.0, 335.0, 342.0, 348.0, 345.0, 346.0],
    },
  },
  month: {
    newIncome: 345.8,
    totalIncome: 12680.0,
    growthRate: 14.2,
    totalTxAmount: 362400.0,
    incomeComposition: {
      basicCommission: 228.6,
      vasIncome: 117.2,
    },
    growthTrend: {
      // 近一月：返回近30日的每日
      dates: [
        '07-30', '07-31', '08-01', '08-02', '08-03', '08-04', '08-05', '08-06', '08-07', '08-08',
        '08-09', '08-10', '08-11', '08-12', '08-13', '08-14', '08-15', '08-16', '08-17', '08-18',
        '08-19', '08-20', '08-21', '08-22', '08-23', '08-24', '08-25', '08-26', '08-27', '08-28',
      ],
      rates: [
        10.8, 11.0, 11.2, 11.5, 11.4, 11.8, 11.9, 12.2, 12.4, 12.6,
        12.8, 13.0, 13.1, 13.3, 13.2, 13.5, 13.4, 13.6, 13.7, 13.9,
        13.8, 14.0, 13.9, 13.8, 13.9, 14.0, 14.1, 14.2, 14.1, 14.2,
      ],
      incomes: [
        10.2, 10.5, 10.8, 11.1, 10.9, 11.4, 11.2, 11.6, 11.3, 11.8,
        11.5, 12.0, 11.7, 12.2, 11.9, 12.4, 12.1, 12.5, 12.2, 12.6,
        12.3, 12.8, 12.4, 11.2, 11.8, 12.0, 12.6, 13.1, 12.9, 12.8,
      ],
    },
  },
  week: {
    newIncome: 86.4,
    totalIncome: 12680.0,
    growthRate: 9.8,
    totalTxAmount: 362400.0,
    incomeComposition: {
      basicCommission: 57.8,
      vasIncome: 28.6,
    },
    growthTrend: {
      // 近一周：返回7日每日
      dates: ['08-22', '08-23', '08-24', '08-25', '08-26', '08-27', '08-28'],
      rates: [8.5, 8.8, 9.1, 9.3, 9.5, 9.6, 9.8],
      incomes: [11.2, 11.8, 12.0, 12.6, 13.1, 12.9, 12.8],
    },
  },
  today: {
    newIncome: 12.8,
    totalIncome: 12680.0,
    growthRate: 9.8,
    totalTxAmount: 362400.0,
    incomeComposition: {
      basicCommission: 8.6,
      vasIncome: 4.2,
    },
    growthTrend: {
      // 当日：展示 24 个小时（0:00 至 23:00），逐小时统计
      dates: [
        '0:00', '1:00', '2:00', '3:00', '4:00', '5:00',
        '6:00', '7:00', '8:00', '9:00', '10:00', '11:00',
        '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
        '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
      ],
      rates: [
        5.0, 4.8, 5.2, 5.0, 4.9, 5.5, 6.2, 7.5, 8.2, 9.0, 9.5, 10.1,
        10.5, 10.2, 9.8, 9.6, 9.7, 10.4, 9.9, 9.5, 9.2, 8.8, 8.5, 8.2
      ],
      incomes: [
        0.2, 0.1, 0.1, 0.1, 0.1, 0.2, 0.3, 0.5, 0.7, 0.9, 1.0, 1.1,
        1.2, 1.1, 0.9, 0.8, 0.8, 0.9, 0.8, 0.5, 0.3, 0.2, 0.1, 0.0
      ],
    },
  },
  custom: {
    newIncome: 115.0,
    totalIncome: 12680.0,
    growthRate: 11.5,
    totalTxAmount: 362400.0,
    incomeComposition: {
      basicCommission: 76.0,
      vasIncome: 39.0,
    },
    growthTrend: {
      dates: ['08-20', '08-21', '08-22', '08-23', '08-24', '08-25', '08-26', '08-27', '08-28'],
      rates: [9.0, 9.2, 9.5, 9.6, 9.8, 10.1, 10.5, 10.8, 11.2],
      incomes: [11.0, 11.5, 11.8, 12.0, 12.6, 13.1, 12.9, 12.8, 13.2],
    },
  },
};

// ==========================================
// 2. 供需交易数据
// ==========================================
export interface BasicServiceTxCategoryItem {
  name: string;
  newAmount: number; // 新增交易金额 (万元)
  totalAmount: number; // 累计交易金额 (万元)
  newCommission: number; // 新增佣金收入 (万元)
  totalCommission: number; // 累计佣金收入 (万元)
  commissionRate: number; // 佣金率 (%)
}

export interface SupplyDemandTxData {
  newTxAmount: number; // 平台新增供需交易金额 (万元)
  totalTxAmount: number; // 平台供需交易总金额 (万元)
  newCommission: number; // 新增平台佣金收入 (万元)
  totalCommission: number; // 平台佣金总收入 (万元)
  commissionRate: number; // 平台供需交易佣金率 (%)
  categories: BasicServiceTxCategoryItem[];
}

export const SUPPLY_DEMAND_TX_DATA: Record<TimeRangeType, SupplyDemandTxData> = {
  year: {
    newTxAmount: 70865.0,
    totalTxAmount: 286500.0,
    newCommission: 2480.3,
    totalCommission: 8250.0,
    commissionRate: 3.5,
    categories: [
      { name: '算力', newAmount: 26850.0, totalAmount: 108500.0, newCommission: 939.8, totalCommission: 3255.0, commissionRate: 3.5 },
      { name: '模型', newAmount: 15600.0, totalAmount: 64200.0, newCommission: 546.0, totalCommission: 1926.0, commissionRate: 3.5 },
      { name: '智能体', newAmount: 11200.0, totalAmount: 43800.0, newCommission: 403.2, totalCommission: 1357.8, commissionRate: 3.6 },
      { name: '终端', newAmount: 6850.0, totalAmount: 28600.0, newCommission: 232.9, totalCommission: 858.0, commissionRate: 3.4 },
      { name: '开发工具', newAmount: 4620.0, totalAmount: 19200.0, newCommission: 161.7, totalCommission: 576.0, commissionRate: 3.5 },
      { name: '运行服务', newAmount: 3425.0, totalAmount: 13400.0, newCommission: 116.5, totalCommission: 402.0, commissionRate: 3.4 },
      { name: '运营服务', newAmount: 2320.0, totalAmount: 8800.0, newCommission: 80.2, totalCommission: 275.2, commissionRate: 3.45 },
    ],
  },
  month: {
    newTxAmount: 6530.0,
    totalTxAmount: 286500.0,
    newCommission: 228.6,
    totalCommission: 8250.0,
    commissionRate: 3.5,
    categories: [
      { name: '算力', newAmount: 2480.0, totalAmount: 108500.0, newCommission: 86.8, totalCommission: 3255.0, commissionRate: 3.5 },
      { name: '模型', newAmount: 1450.0, totalAmount: 64200.0, newCommission: 50.8, totalCommission: 1926.0, commissionRate: 3.5 },
      { name: '智能体', newAmount: 1020.0, totalAmount: 43800.0, newCommission: 36.7, totalCommission: 1357.8, commissionRate: 3.6 },
      { name: '终端', newAmount: 640.0, totalAmount: 28600.0, newCommission: 21.8, totalCommission: 858.0, commissionRate: 3.4 },
      { name: '开发工具', newAmount: 430.0, totalAmount: 19200.0, newCommission: 15.1, totalCommission: 576.0, commissionRate: 3.5 },
      { name: '运行服务', newAmount: 310.0, totalAmount: 13400.0, newCommission: 10.5, totalCommission: 402.0, commissionRate: 3.4 },
      { name: '运营服务', newAmount: 200.0, totalAmount: 8800.0, newCommission: 6.9, totalCommission: 275.2, commissionRate: 3.45 },
    ],
  },
  week: {
    newTxAmount: 1650.0,
    totalTxAmount: 286500.0,
    newCommission: 57.8,
    totalCommission: 8250.0,
    commissionRate: 3.5,
    categories: [
      { name: '算力', newAmount: 630.0, totalAmount: 108500.0, newCommission: 22.1, totalCommission: 3255.0, commissionRate: 3.5 },
      { name: '模型', newAmount: 365.0, totalAmount: 64200.0, newCommission: 12.8, totalCommission: 1926.0, commissionRate: 3.5 },
      { name: '智能体', newAmount: 260.0, totalAmount: 43800.0, newCommission: 9.4, totalCommission: 1357.8, commissionRate: 3.6 },
      { name: '终端', newAmount: 160.0, totalAmount: 28600.0, newCommission: 5.4, totalCommission: 858.0, commissionRate: 3.4 },
      { name: '开发工具', newAmount: 110.0, totalAmount: 19200.0, newCommission: 3.9, totalCommission: 576.0, commissionRate: 3.5 },
      { name: '运行服务', newAmount: 75.0, totalAmount: 13400.0, newCommission: 2.6, totalCommission: 402.0, commissionRate: 3.4 },
      { name: '运营服务', newAmount: 50.0, totalAmount: 8800.0, newCommission: 1.6, totalCommission: 275.2, commissionRate: 3.45 },
    ],
  },
  today: {
    newTxAmount: 245.0,
    totalTxAmount: 286500.0,
    newCommission: 8.6,
    totalCommission: 8250.0,
    commissionRate: 3.51,
    categories: [
      { name: '算力', newAmount: 93.5, totalAmount: 108500.0, newCommission: 3.27, totalCommission: 3255.0, commissionRate: 3.5 },
      { name: '模型', newAmount: 54.2, totalAmount: 64200.0, newCommission: 1.90, totalCommission: 1926.0, commissionRate: 3.5 },
      { name: '智能体', newAmount: 38.6, totalAmount: 43800.0, newCommission: 1.39, totalCommission: 1357.8, commissionRate: 3.6 },
      { name: '终端', newAmount: 23.8, totalAmount: 28600.0, newCommission: 0.81, totalCommission: 858.0, commissionRate: 3.4 },
      { name: '开发工具', newAmount: 16.3, totalAmount: 19200.0, newCommission: 0.57, totalCommission: 576.0, commissionRate: 3.5 },
      { name: '运行服务', newAmount: 11.2, totalAmount: 13400.0, newCommission: 0.38, totalCommission: 402.0, commissionRate: 3.4 },
      { name: '运营服务', newAmount: 7.4, totalAmount: 8800.0, newCommission: 0.26, totalCommission: 275.2, commissionRate: 3.45 },
    ],
  },
  custom: {
    newTxAmount: 2180.0,
    totalTxAmount: 286500.0,
    newCommission: 76.0,
    totalCommission: 8250.0,
    commissionRate: 3.49,
    categories: [
      { name: '算力', newAmount: 820.0, totalAmount: 108500.0, newCommission: 28.7, totalCommission: 3255.0, commissionRate: 3.5 },
      { name: '模型', newAmount: 480.0, totalAmount: 64200.0, newCommission: 16.8, totalCommission: 1926.0, commissionRate: 3.5 },
      { name: '智能体', newAmount: 340.0, totalAmount: 43800.0, newCommission: 12.2, totalCommission: 1357.8, commissionRate: 3.6 },
      { name: '终端', newAmount: 210.0, totalAmount: 28600.0, newCommission: 7.1, totalCommission: 858.0, commissionRate: 3.4 },
      { name: '开发工具', newAmount: 145.0, totalAmount: 19200.0, newCommission: 5.1, totalCommission: 576.0, commissionRate: 3.5 },
      { name: '运行服务', newAmount: 110.0, totalAmount: 13400.0, newCommission: 3.7, totalCommission: 402.0, commissionRate: 3.4 },
      { name: '运营服务', newAmount: 75.0, totalAmount: 8800.0, newCommission: 2.4, totalCommission: 275.2, commissionRate: 3.45 },
    ],
  },
};

// ==========================================
// 3. 增值服务经营数据 (10类)
// ==========================================
export interface VasCategoryIncomeItem {
  name: string;
  newIncome: number; // 新增收入 (万元)
  totalIncome: number; // 累计收入 (万元)
}

export interface VasOperationsData {
  newVasIncome: number; // 新增增值服务收入 (万元)
  totalVasIncome: number; // 增值服务总收入 (万元)
  categories: VasCategoryIncomeItem[];
}

export const VAS_OPERATIONS_DATA: Record<TimeRangeType, VasOperationsData> = {
  year: {
    newVasIncome: 1340.2,
    totalVasIncome: 4430.0,
    categories: [
      { name: '客户分析服务', newIncome: 245.0, totalIncome: 820.0 },
      { name: '营销服务', newIncome: 218.0, totalIncome: 740.0 },
      { name: '销售服务', newIncome: 182.5, totalIncome: 615.0 },
      { name: '售后服务', newIncome: 154.2, totalIncome: 512.0 },
      { name: '维系服务', newIncome: 136.0, totalIncome: 450.0 },
      { name: '广告服务', newIncome: 122.0, totalIncome: 405.0 },
      { name: '发票代理', newIncome: 98.5, totalIncome: 330.0 },
      { name: '产品推荐', newIncome: 78.0, totalIncome: 258.0 },
      { name: '会员服务（商户）', newIncome: 62.0, totalIncome: 185.0 },
      { name: '产品分析', newIncome: 44.0, totalIncome: 115.0 },
    ],
  },
  month: {
    newVasIncome: 117.2,
    totalVasIncome: 4430.0,
    categories: [
      { name: '客户分析服务', newIncome: 21.5, totalIncome: 820.0 },
      { name: '营销服务', newIncome: 19.2, totalIncome: 740.0 },
      { name: '销售服务', newIncome: 16.0, totalIncome: 615.0 },
      { name: '售后服务', newIncome: 13.5, totalIncome: 512.0 },
      { name: '维系服务', newIncome: 11.8, totalIncome: 450.0 },
      { name: '广告服务', newIncome: 10.6, totalIncome: 405.0 },
      { name: '发票代理', newIncome: 8.6, totalIncome: 330.0 },
      { name: '产品推荐', newIncome: 6.8, totalIncome: 258.0 },
      { name: '会员服务（商户）', newIncome: 5.4, totalIncome: 185.0 },
      { name: '产品分析', newIncome: 3.8, totalIncome: 115.0 },
    ],
  },
  week: {
    newVasIncome: 28.6,
    totalVasIncome: 4430.0,
    categories: [
      { name: '客户分析服务', newIncome: 5.2, totalIncome: 820.0 },
      { name: '营销服务', newIncome: 4.7, totalIncome: 740.0 },
      { name: '销售服务', newIncome: 3.9, totalIncome: 615.0 },
      { name: '售后服务', newIncome: 3.3, totalIncome: 512.0 },
      { name: '维系服务', newIncome: 2.9, totalIncome: 450.0 },
      { name: '广告服务', newIncome: 2.6, totalIncome: 405.0 },
      { name: '发票代理', newIncome: 2.1, totalIncome: 330.0 },
      { name: '产品推荐', newIncome: 1.7, totalIncome: 258.0 },
      { name: '会员服务（商户）', newIncome: 1.3, totalIncome: 185.0 },
      { name: '产品分析', newIncome: 0.9, totalIncome: 115.0 },
    ],
  },
  today: {
    newVasIncome: 4.2,
    totalVasIncome: 4430.0,
    categories: [
      { name: '客户分析服务', newIncome: 0.78, totalIncome: 820.0 },
      { name: '营销服务', newIncome: 0.69, totalIncome: 740.0 },
      { name: '销售服务', newIncome: 0.58, totalIncome: 615.0 },
      { name: '售后服务', newIncome: 0.49, totalIncome: 512.0 },
      { name: '维系服务', newIncome: 0.43, totalIncome: 450.0 },
      { name: '广告服务', newIncome: 0.39, totalIncome: 405.0 },
      { name: '发票代理', newIncome: 0.31, totalIncome: 330.0 },
      { name: '产品推荐', newIncome: 0.25, totalIncome: 258.0 },
      { name: '会员服务（商户）', newIncome: 0.19, totalIncome: 185.0 },
      { name: '产品分析', newIncome: 0.13, totalIncome: 115.0 },
    ],
  },
  custom: {
    newVasIncome: 39.0,
    totalVasIncome: 4430.0,
    categories: [
      { name: '客户分析服务', newIncome: 7.2, totalIncome: 820.0 },
      { name: '营销服务', newIncome: 6.4, totalIncome: 740.0 },
      { name: '销售服务', newIncome: 5.3, totalIncome: 615.0 },
      { name: '售后服务', newIncome: 4.5, totalIncome: 512.0 },
      { name: '维系服务', newIncome: 3.9, totalIncome: 450.0 },
      { name: '广告服务', newIncome: 3.5, totalIncome: 405.0 },
      { name: '发票代理', newIncome: 2.8, totalIncome: 330.0 },
      { name: '产品推荐', newIncome: 2.3, totalIncome: 258.0 },
      { name: '会员服务（商户）', newIncome: 1.8, totalIncome: 185.0 },
      { name: '产品分析', newIncome: 1.3, totalIncome: 115.0 },
    ],
  },
};
