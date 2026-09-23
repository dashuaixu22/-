import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Package,
  Search,
  RotateCcw,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers,
  BarChart3,
  PieChart as PieChartIcon,
  Check,
  ExternalLink,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import { EChartWrapper } from '../EChartWrapper';
import {
  DemandOrderRecord,
  ALL_DEMAND_ORDERS,
  FIXED_PRODUCT_CATEGORIES,
  FixedProductCategory,
} from '../../data/demandMockData';
import {
  ALL_SUPPLIER_PRODUCTS,
  CATEGORY_COLORS,
  SupplierProductRecord,
} from '../../data/supplierProductsMockData';
import { TimeRangeType } from '../../types';
import { TODAY } from '../../data/mockData';

interface DemandTradeViewProps {
  onViewOrderDetail: (order: DemandOrderRecord) => void;
  onViewProductDetail?: (product: SupplierProductRecord) => void;
  // 支持从详情返回时恢复原查询状态
  initialSearchState?: {
    orderBusinessType?: string;
    orderId?: string;
    customerKey?: string;
    customerName?: string;
    customerCode?: string;
    customerType?: string;
    supplierKey?: string;
    supplierName?: string;
    supplierCode?: string;
    productName?: string;
    category?: string;
    status?: string;
    startTime?: string;
    endTime?: string;
    page?: number;
  };
  onSaveSearchState?: (state: any) => void;
  activeTab?: 'analysis' | 'products' | 'orders';
  onActiveTabChange?: (tab: 'analysis' | 'products' | 'orders') => void;
  timeRange?: TimeRangeType;
  startDate?: string;
  endDate?: string;
  onTimeRangeChange?: (range: TimeRangeType) => void;
  onStartDateChange?: (date: string) => void;
  onEndDateChange?: (date: string) => void;
}

function parseDateStr(str: string): Date {
  const parts = str.split('-');
  return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
}

function formatMMDD(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${m}-${day}`;
}

export interface TradeTrendResult {
  dates: string[];
  orderData: number[];
  amountData: number[];
  isOverLimit: boolean;
  diffDays: number;
  subLabel: string;
  unitLabel: string;
  xAxisType: 'hour' | 'day' | 'month';
  totalOrders: number;
  totalAmount: number;
  newProducts: number;
}

/**
 * 需求方交易趋势计算（严格遵守 5 大核心展示规则）：
 * 1. 选择当日：展示 24 个小时（0:00 至 23:00），逐小时统计
 * 2. 选择近一周：返回 7 日每日
 * 3. 选择近一月：返回近 30 日的每日
 * 4. 选择近一年：返回从上个月往前推 12 个月的数据，每个月都是对应月份的总计
 * 5. 自选时间段：展示全部，如果时间大于 30 天，那么不展示折线图
 */
export function computeDemandTradeTrendData(
  timeRange: TimeRangeType,
  startDateStr?: string,
  endDateStr?: string,
  customerType: 'all' | 'company' | 'individual' = 'all'
): TradeTrendResult {
  const refEnd = endDateStr || TODAY;
  const refStart = startDateStr || '2026-08-15';
  const orderMul = customerType === 'all' ? 1 : customerType === 'company' ? 0.77 : 0.23;
  const amountMul = customerType === 'all' ? 1 : customerType === 'company' ? 0.95 : 0.05;

  // 1. 当日：24个小时（0:00 至 23:00），逐小时统计
  if (timeRange === 'today') {
    const dates = [
      '0:00', '1:00', '2:00', '3:00', '4:00', '5:00',
      '6:00', '7:00', '8:00', '9:00', '10:00', '11:00',
      '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
      '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
    ];
    // 58笔订单在24小时的分布
    const rawOrders = [
      0, 0, 1, 0, 0, 1,
      1, 2, 4, 6, 7, 5,
      4, 5, 6, 5, 4, 3,
      2, 1, 1, 0, 0, 0
    ];
    // 42.6万元在24小时的分布
    const rawAmounts = [
      0, 0, 0.4, 0, 0, 0.6,
      0.8, 1.8, 3.2, 4.8, 5.5, 4.2,
      3.5, 4.2, 4.9, 3.8, 2.8, 1.8,
      1.1, 0.7, 0.6, 0, 0, 0
    ];
    const orderData = rawOrders.map(v => Math.round(v * orderMul));
    const amountData = rawAmounts.map(v => +(v * amountMul).toFixed(1));
    const totalOrders = orderData.reduce((a, b) => a + b, 0);
    const totalAmount = +(amountData.reduce((a, b) => a + b, 0)).toFixed(1);

    return {
      dates,
      orderData,
      amountData,
      isOverLimit: false,
      diffDays: 1,
      subLabel: '当日 24 小时交易走势（共 24 个时段，逐小时统计）',
      unitLabel: '时段交易',
      xAxisType: 'hour',
      totalOrders: totalOrders || (customerType === 'company' ? 44 : customerType === 'individual' ? 14 : 58),
      totalAmount: totalAmount || (customerType === 'company' ? 40.5 : customerType === 'individual' ? 2.1 : 42.6),
      newProducts: 1,
    };
  }

  // 2. 近一周：返回 7 日每日
  if (timeRange === 'week') {
    const end = parseDateStr(refEnd);
    const dates: string[] = [];
    const rawOrders = [48, 62, 75, 68, 82, 45, 32];
    const rawAmounts = [34.0, 45.5, 52.0, 48.0, 58.5, 26.5, 20.0];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(end.getDate() - i);
      dates.push(formatMMDD(d));
    }
    const orderData = rawOrders.map(v => Math.round(v * orderMul));
    const amountData = rawAmounts.map(v => +(v * amountMul).toFixed(1));
    return {
      dates,
      orderData,
      amountData,
      isOverLimit: false,
      diffDays: 7,
      subLabel: `近一周每日交易走势（共 7 日，${dates[0]} 至 ${dates[dates.length - 1]}）`,
      unitLabel: '每日交易',
      xAxisType: 'day',
      totalOrders: customerType === 'company' ? 310 : customerType === 'individual' ? 102 : 412,
      totalAmount: customerType === 'company' ? 272.0 : customerType === 'individual' ? 12.5 : 284.5,
      newProducts: 4,
    };
  }

  // 3. 近一月：返回近 30 日每日
  if (timeRange === 'month') {
    const end = parseDateStr(refEnd);
    const dates: string[] = [];
    const rawOrders: number[] = [
      55, 62, 58, 65, 70, 48, 52,
      60, 68, 72, 64, 59, 61, 73,
      66, 60, 58, 63, 67, 71, 55,
      59, 64, 69, 58, 62, 66, 70,
      57, 60
    ];
    const rawAmounts: number[] = [
      38.0, 42.5, 39.0, 45.0, 48.5, 32.0, 36.5,
      41.0, 46.5, 49.0, 43.5, 40.0, 42.0, 50.0,
      45.0, 41.0, 39.5, 43.0, 46.0, 48.5, 37.0,
      40.5, 44.0, 47.0, 39.5, 42.5, 45.0, 48.0,
      39.0, 41.0
    ];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(end.getDate() - i);
      dates.push(formatMMDD(d));
    }
    const orderData = rawOrders.map(v => Math.round(v * orderMul));
    const amountData = rawAmounts.map(v => +(v * amountMul).toFixed(1));
    return {
      dates,
      orderData,
      amountData,
      isOverLimit: false,
      diffDays: 30,
      subLabel: `近一月每日交易走势（共 30 日，${dates[0]} 至 ${dates[dates.length - 1]}）`,
      unitLabel: '每日交易',
      xAxisType: 'day',
      totalOrders: customerType === 'company' ? 1420 : customerType === 'individual' ? 430 : 1850,
      totalAmount: customerType === 'company' ? 1205.0 : customerType === 'individual' ? 55.0 : 1260.0,
      newProducts: 12,
    };
  }

  // 4. 近一年：从上个月往前推 12 个月的数据，每个月都是对应月份总计
  if (timeRange === 'year') {
    const end = parseDateStr(refEnd);
    const endYear = end.getFullYear();
    const endMonth = end.getMonth();

    const dates: string[] = [];
    const rawOrders = [650, 720, 780, 810, 850, 890, 840, 920, 880, 960, 910, 950];
    const rawAmounts = [460.0, 510.0, 560.0, 580.0, 610.0, 640.0, 600.0, 660.0, 630.0, 690.0, 650.0, 680.0];

    for (let i = 11; i >= 0; i--) {
      const targetDate = new Date(endYear, endMonth - 1 - i, 1);
      const y = targetDate.getFullYear();
      const m = String(targetDate.getMonth() + 1).padStart(2, '0');
      dates.push(`${y}-${m}`);
    }
    const orderData = rawOrders.map(v => Math.round(v * orderMul));
    const amountData = rawAmounts.map(v => +(v * amountMul).toFixed(1));

    return {
      dates,
      orderData,
      amountData,
      isOverLimit: false,
      diffDays: 365,
      subLabel: `近一年月度总计交易走势（从上月往前推 12 个月：${dates[0]} 至 ${dates[dates.length - 1]}）`,
      unitLabel: '月度总计',
      xAxisType: 'month',
      totalOrders: customerType === 'company' ? 7560 : customerType === 'individual' ? 2060 : 9620,
      totalAmount: customerType === 'company' ? 6540.0 : customerType === 'individual' ? 310.0 : 6850.0,
      newProducts: 48,
    };
  }

  // 5. 自选时间段：展示全部，如果时间大于30天，那么不展示
  const sDate = parseDateStr(refStart);
  const eDate = parseDateStr(refEnd);
  const diffMs = eDate.getTime() - sDate.getTime();
  const diffDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);

  if (diffDays > 30) {
    return {
      dates: [],
      orderData: [],
      amountData: [],
      isOverLimit: true,
      diffDays,
      subLabel: `自选时间段（${refStart} 至 ${refEnd}，共 ${diffDays} 天）`,
      unitLabel: '每日交易',
      xAxisType: 'day',
      totalOrders: Math.round(diffDays * 60 * orderMul),
      totalAmount: +(diffDays * 42.0 * amountMul).toFixed(1),
      newProducts: Math.max(1, Math.round(diffDays * 0.4)),
    };
  }

  // <= 30天：展示全部每日明细
  const dates: string[] = [];
  const orderData: number[] = [];
  const amountData: number[] = [];
  let totalO = 0;
  let totalA = 0;

  for (let i = 0; i < diffDays; i++) {
    const cur = new Date(sDate);
    cur.setDate(sDate.getDate() + i);
    dates.push(formatMMDD(cur));
    const oVal = Math.round((50 + ((i * 7) % 25)) * orderMul);
    const aVal = +((35 + ((i * 4.8) % 18)) * amountMul).toFixed(1);
    orderData.push(oVal);
    amountData.push(aVal);
    totalO += oVal;
    totalA += aVal;
  }

  return {
    dates,
    orderData,
    amountData,
    isOverLimit: false,
    diffDays,
    subLabel: `自选时间段每日交易走势（${refStart} 至 ${refEnd}，共 ${diffDays} 天全部展示）`,
    unitLabel: '每日交易',
    xAxisType: 'day',
    totalOrders: totalO,
    totalAmount: +totalA.toFixed(1),
    newProducts: Math.max(1, Math.round(diffDays * 0.4)),
  };
}

export const DemandTradeView: React.FC<DemandTradeViewProps> = ({
  onViewOrderDetail,
  onViewProductDetail,
  initialSearchState,
  onSaveSearchState,
  activeTab: controlledTab,
  onActiveTabChange,
  timeRange,
  startDate,
  endDate,
  onTimeRangeChange,
  onStartDateChange,
  onEndDateChange,
}) => {
  // 页面顶层Tab: 消费分析 (analysis) | 产品订购 (products) | 消费订单查询 (orders)
  const [internalTab, setInternalTab] = useState<'analysis' | 'products' | 'orders'>('analysis');
  const activeTab = controlledTab !== undefined ? controlledTab : internalTab;

  const setActiveTab = (tab: 'analysis' | 'products' | 'orders') => {
    setInternalTab(tab);
    if (onActiveTabChange) {
      onActiveTabChange(tab);
    }
  };

  // =========================================================================
  // 1. 消费分析部分状态与逻辑 (统一时间Tab，放在右上角)
  // =========================================================================
  // 客户范围切换: 全部 | 企业 | 个人用户
  const [analysisCustomerType, setAnalysisCustomerType] = useState<'all' | 'company' | 'individual'>('all');

  // 统一时间与自选时间段状态（支持外部 props 驱动和内部受控）
  const [localTimeRange, setLocalTimeRange] = useState<TimeRangeType>('year');
  const [localStartDate, setLocalStartDate] = useState<string>('2025-08-28');
  const [localEndDate, setLocalEndDate] = useState<string>(TODAY);

  const effectiveTimeRange: TimeRangeType = timeRange !== undefined ? timeRange : localTimeRange;
  const effectiveStartDate: string = startDate !== undefined ? startDate : localStartDate;
  const effectiveEndDate: string = endDate !== undefined ? endDate : localEndDate;

  const handleTimeRangeChange = (range: TimeRangeType) => {
    if (onTimeRangeChange) onTimeRangeChange(range);
    else setLocalTimeRange(range);

    if (range === 'today') {
      if (onStartDateChange) onStartDateChange(TODAY);
      else setLocalStartDate(TODAY);
      if (onEndDateChange) onEndDateChange(TODAY);
      else setLocalEndDate(TODAY);
    } else if (range === 'year') {
      if (onStartDateChange) onStartDateChange('2025-08-28');
      else setLocalStartDate('2025-08-28');
      if (onEndDateChange) onEndDateChange(TODAY);
      else setLocalEndDate(TODAY);
    } else if (range === 'month') {
      if (onStartDateChange) onStartDateChange('2026-07-30');
      else setLocalStartDate('2026-07-30');
      if (onEndDateChange) onEndDateChange(TODAY);
      else setLocalEndDate(TODAY);
    } else if (range === 'week') {
      if (onStartDateChange) onStartDateChange('2026-08-22');
      else setLocalStartDate('2026-08-22');
      if (onEndDateChange) onEndDateChange(TODAY);
      else setLocalEndDate(TODAY);
    } else if (range === 'custom') {
      if (!effectiveStartDate) {
        if (onStartDateChange) onStartDateChange('2026-08-15');
        else setLocalStartDate('2026-08-15');
      }
      if (!effectiveEndDate) {
        if (onEndDateChange) onEndDateChange(TODAY);
        else setLocalEndDate(TODAY);
      }
    }
  };

  const handleStartDateChange = (val: string) => {
    if (onStartDateChange) onStartDateChange(val);
    else setLocalStartDate(val);
    if (onTimeRangeChange) onTimeRangeChange('custom');
    else setLocalTimeRange('custom');
  };

  const handleEndDateChange = (val: string) => {
    if (onEndDateChange) onEndDateChange(val);
    else setLocalEndDate(val);
    if (onTimeRangeChange) onTimeRangeChange('custom');
    else setLocalTimeRange('custom');
  };

  // 计算交易趋势数据与超期判定 (与 O-S 规则一致)
  const tradeTrendResult = useMemo(() => {
    return computeDemandTradeTrendData(
      effectiveTimeRange,
      effectiveStartDate,
      effectiveEndDate,
      analysisCustomerType
    );
  }, [effectiveTimeRange, effectiveStartDate, effectiveEndDate, analysisCustomerType]);

  // 指标数据
  const analysisOrderData = {
    all: {
      total: 18460,
      todayNew: 58,
      weekNew: 412,
      monthNew: 1850,
      yearNew: 9620,
      todayGrowth: '+5.2%',
      weekGrowth: '+14.2%',
      monthGrowth: '+16.8%',
      yearGrowth: '+52.4%',
    },
    company: {
      total: 14280,
      todayNew: 44,
      weekNew: 310,
      monthNew: 1420,
      yearNew: 7560,
      todayGrowth: '+5.4%',
      weekGrowth: '+15.1%',
      monthGrowth: '+17.4%',
      yearGrowth: '+54.0%',
    },
    individual: {
      total: 4180,
      todayNew: 14,
      weekNew: 102,
      monthNew: 430,
      yearNew: 2060,
      todayGrowth: '+4.8%',
      weekGrowth: '+11.5%',
      monthGrowth: '+14.6%',
      yearGrowth: '+47.2%',
    },
  }[analysisCustomerType];

  const analysisAmountData = {
    all: {
      total: 12480.5,
      todayNew: 42.6,
      weekNew: 284.5,
      monthNew: 1260.0,
      yearNew: 6850.0,
      todayGrowth: '+6.8%',
      weekGrowth: '+11.8%',
      monthGrowth: '+15.6%',
      yearGrowth: '+48.2%',
    },
    company: {
      total: 11950.0,
      todayNew: 40.5,
      weekNew: 272.0,
      monthNew: 1205.0,
      yearNew: 6540.0,
      todayGrowth: '+7.0%',
      weekGrowth: '+12.0%',
      monthGrowth: '+16.1%',
      yearGrowth: '+49.5%',
    },
    individual: {
      total: 530.5,
      todayNew: 2.1,
      weekNew: 12.5,
      monthNew: 55.0,
      yearNew: 310.0,
      todayGrowth: '+5.2%',
      weekGrowth: '+8.4%',
      monthGrowth: '+10.2%',
      yearGrowth: '+32.8%',
    },
  }[analysisCustomerType];

  // 动态结算当前周期新增金额指标
  const currentPeriodAmount = useMemo(() => {
    if (effectiveTimeRange === 'custom') {
      return tradeTrendResult.totalAmount;
    }
    const map = {
      today: analysisAmountData.todayNew,
      week: analysisAmountData.weekNew,
      month: analysisAmountData.monthNew,
      year: analysisAmountData.yearNew,
    };
    return map[effectiveTimeRange as 'today' | 'week' | 'month' | 'year'] || map.year;
  }, [effectiveTimeRange, tradeTrendResult, analysisAmountData]);

  // 动态结算当前周期新增订单指标
  const currentPeriodOrders = useMemo(() => {
    if (effectiveTimeRange === 'custom') {
      return tradeTrendResult.totalOrders;
    }
    const map = {
      today: analysisOrderData.todayNew,
      week: analysisOrderData.weekNew,
      month: analysisOrderData.monthNew,
      year: analysisOrderData.yearNew,
    };
    return map[effectiveTimeRange as 'today' | 'week' | 'month' | 'year'] || map.year;
  }, [effectiveTimeRange, tradeTrendResult, analysisOrderData]);

  // 订单趋势图 (独立折线图)
  const orderTrendOption = useMemo(() => {
    const months = tradeTrendResult.dates;
    const data = tradeTrendResult.orderData;

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          if (!Array.isArray(params) || params.length === 0) return '';
          const title = tradeTrendResult.xAxisType === 'hour'
            ? `时段：当日 ${params[0].name}`
            : tradeTrendResult.xAxisType === 'month'
            ? `月份：${params[0].name}`
            : `日期：${params[0].name}`;
          return `<div style="font-size:12px;font-weight:600;color:#1e293b;margin-bottom:4px;">${title}</div>
            <div style="font-size:12px;color:#475569;display:flex;justify-content:space-between;gap:16px;">
              <span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background-color:${params[0].color};margin-right:6px;"></span>订单数:</span>
              <strong>${params[0].value} 笔</strong>
            </div>`;
        },
      },
      grid: { top: 28, left: '2%', right: '3%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: months,
        axisLine: { lineStyle: { color: '#CBD5E1' } },
        axisLabel: {
          color: '#64748B',
          fontSize: tradeTrendResult.xAxisType === 'hour' ? 10 : 11,
          interval: tradeTrendResult.xAxisType === 'hour' ? 0 : (months.length > 25 ? 1 : 0),
        },
      },
      yAxis: {
        type: 'value',
        name: '订单数 (笔)',
        nameTextStyle: { color: '#94A3B8', fontSize: 11 },
        splitLine: { lineStyle: { type: 'dashed', color: '#F1F5F9' } },
        axisLabel: { color: '#64748B', fontSize: 11 },
      },
      series: [
        {
          name: '订单趋势',
          type: 'line',
          smooth: false,
          data,
          itemStyle: { color: '#2563EB' },
          lineStyle: { width: 3 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(37, 99, 235, 0.2)' },
                { offset: 1, color: 'rgba(37, 99, 235, 0.01)' },
              ],
            },
          },
        },
      ],
    };
  }, [tradeTrendResult]);

  // 消费金额趋势图 (独立折线图，不与订单混排坐标轴)
  const amountTrendOption = useMemo(() => {
    const months = tradeTrendResult.dates;
    const data = tradeTrendResult.amountData;

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          if (!Array.isArray(params) || params.length === 0) return '';
          const title = tradeTrendResult.xAxisType === 'hour'
            ? `时段：当日 ${params[0].name}`
            : tradeTrendResult.xAxisType === 'month'
            ? `月份：${params[0].name}`
            : `日期：${params[0].name}`;
          return `<div style="font-size:12px;font-weight:600;color:#1e293b;margin-bottom:4px;">${title}</div>
            <div style="font-size:12px;color:#475569;display:flex;justify-content:space-between;gap:16px;">
              <span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background-color:${params[0].color};margin-right:6px;"></span>消费金额:</span>
              <strong>${params[0].value} 万元</strong>
            </div>`;
        },
      },
      grid: { top: 28, left: '2%', right: '3%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: months,
        axisLine: { lineStyle: { color: '#CBD5E1' } },
        axisLabel: {
          color: '#64748B',
          fontSize: tradeTrendResult.xAxisType === 'hour' ? 10 : 11,
          interval: tradeTrendResult.xAxisType === 'hour' ? 0 : (months.length > 25 ? 1 : 0),
        },
      },
      yAxis: {
        type: 'value',
        name: '消费金额 (万元)',
        nameTextStyle: { color: '#94A3B8', fontSize: 11 },
        splitLine: { lineStyle: { type: 'dashed', color: '#F1F5F9' } },
        axisLabel: { color: '#64748B', fontSize: 11 },
      },
      series: [
        {
          name: '消费金额趋势',
          type: 'line',
          smooth: false,
          data,
          itemStyle: { color: '#0EA5E9' },
          lineStyle: { width: 3 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(14, 165, 233, 0.2)' },
                { offset: 1, color: 'rgba(14, 165, 233, 0.01)' },
              ],
            },
          },
        },
      ],
    };
  }, [tradeTrendResult]);

  // =========================================================================
  // 2. 产品订购部分状态与逻辑
  // =========================================================================
  const newProductCount = useMemo(() => {
    if (effectiveTimeRange === 'custom') {
      return tradeTrendResult.newProducts;
    }
    const map = {
      today: 1,
      week: 6,
      month: 22,
      year: 94,
    };
    return map[effectiveTimeRange as 'today' | 'week' | 'month' | 'year'] || map.year;
  }, [effectiveTimeRange, tradeTrendResult]);

  // 筛选：需求方类型与产品类别
  const [productOrderCustType, setProductOrderCustType] = useState<'全部' | '企业' | '个人用户'>('全部');
  const [productOrderCategory, setProductOrderCategory] = useState<string>('全部');

  // 分类订购表现：订单数 vs 消费金额
  const [metricMode, setMetricMode] = useState<'orders' | 'amount'>('orders');

  // 分类订购表现数据与图表
  const categoryChartData = useMemo(() => {
    if (productOrderCategory === '全部') {
      // 比较七类产品
      const categories = FIXED_PRODUCT_CATEGORIES;
      const orderValues = [5420, 3980, 2860, 2140, 1820, 1260, 980];
      const amountValues = [5420.0, 3120.0, 1640.0, 980.0, 650.0, 420.0, 250.5];
      const currentValues = metricMode === 'orders' ? orderValues : amountValues;

      return {
        categories,
        values: currentValues,
        pieData: categories.map((cat, i) => ({
          name: cat,
          value: currentValues[i],
        })),
      };
    } else {
      // 展示具体类别下的代表产商品
      const subItems = [
        `${productOrderCategory}-高阶旗舰包`,
        `${productOrderCategory}-企业标准版`,
        `${productOrderCategory}-轻量体验实例`,
        `${productOrderCategory}-专属定制节点`,
        `${productOrderCategory}-开发者专业版`,
      ];
      const orderValues = [840, 620, 480, 310, 220];
      const amountValues = [420.0, 280.0, 110.0, 95.0, 45.0];
      const currentValues = metricMode === 'orders' ? orderValues : amountValues;

      return {
        categories: subItems,
        values: currentValues,
        pieData: subItems.map((name, i) => ({
          name,
          value: currentValues[i],
        })),
      };
    }
  }, [productOrderCategory, metricMode]);

  // 横向柱状图
  const categoryBarOption = useMemo(() => {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      grid: { top: 20, left: '3%', right: '8%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'value',
        name: metricMode === 'orders' ? '订单数 (笔)' : '消费金额 (万元)',
        nameTextStyle: { color: '#94A3B8', fontSize: 11 },
        splitLine: { lineStyle: { type: 'dashed', color: '#F1F5F9' } },
        axisLabel: { color: '#64748B', fontSize: 11 },
      },
      yAxis: {
        type: 'category',
        data: [...categoryChartData.categories].reverse(),
        axisLine: { lineStyle: { color: '#CBD5E1' } },
        axisLabel: { color: '#475569', fontSize: 11 },
      },
      series: [
        {
          name: metricMode === 'orders' ? '订单数' : '消费金额',
          type: 'bar',
          data: [...categoryChartData.values].reverse(),
          barWidth: 14,
          itemStyle: {
            color: '#2563EB',
            borderRadius: [0, 3, 3, 0],
          },
        },
      ],
    };
  }, [categoryChartData, metricMode]);

  // 右侧构成环形图
  const categoryPieOption = useMemo(() => {
    return {
      tooltip: {
        trigger: 'item',
        formatter: `{b}: {c} ${metricMode === 'orders' ? '笔' : '万元'} ({d}%)`,
      },
      legend: {
        bottom: '2%',
        left: 'center',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { fontSize: 11, color: '#64748B' },
      },
      series: [
        {
          name: '订购构成',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['50%', '42%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 4,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: '{d}%',
            fontSize: 11,
            color: '#334155',
          },
          data: categoryChartData.pieData,
        },
      ],
    };
  }, [categoryChartData, metricMode]);

  // 热销TOP5产商品数据 (严格按要求：只展示产品名称、所属类别、所属供应商、订单数、消费金额)
  const topProducts = useMemo(() => {
    const rawList = [
      {
        productName: '昇腾910B高算力集群(64卡月租实例)',
        category: '算力' as FixedProductCategory,
        supplierName: '武汉光谷智能计算科技有限公司',
        orderCount: 420,
        amount: 2840.0,
      },
      {
        productName: '鲲鹏+昇腾混合算力节点(包年)',
        category: '算力' as FixedProductCategory,
        supplierName: '长江计算系统有限公司',
        orderCount: 310,
        amount: 3250.0,
      },
      {
        productName: '星火医学多模态推理大模型API调用包',
        category: '模型' as FixedProductCategory,
        supplierName: '科大讯飞华中总部（武汉）科技有限公司',
        orderCount: 860,
        amount: 1920.0,
      },
      {
        productName: '高速公路路网智能应急处置智能体',
        category: '智能体' as FixedProductCategory,
        supplierName: '武汉光谷智能体创新研发中心',
        orderCount: 280,
        amount: 1450.0,
      },
      {
        productName: '统信UOS桌面/服务器自动化构建编译套件',
        category: '开发工具' as FixedProductCategory,
        supplierName: '统信软件技术（武汉）有限公司',
        orderCount: 540,
        amount: 890.0,
      },
      {
        productName: 'V2X车路协同路侧边缘算力终端单元(20套)',
        category: '终端' as FixedProductCategory,
        supplierName: '湖北省智能网联终端创新科技有限公司',
        orderCount: 190,
        amount: 1180.0,
      },
    ];

    // 严格按消费金额排序并截取 TOP5 (仅保留按消费金额口径)
    const sorted = [...rawList].sort((a, b) => b.amount - a.amount);
    return sorted.slice(0, 5);
  }, []);

  // 点击产商品进入“供应商产商品详情”
  const handleJumpToProduct = (productName: string) => {
    if (!onViewProductDetail) return;
    const found = ALL_SUPPLIER_PRODUCTS.find((p) => p.productName === productName);
    if (found) {
      onViewProductDetail(found);
    } else {
      const fallback: SupplierProductRecord = {
        id: `gen-${productName}`,
        productCode: 'PROD-WH-001',
        productName,
        category: '算力',
        subType: '通用算力',
        supplierId: '1',
        supplierName: '武汉光谷智能计算科技有限公司',
        supplierCode: 'SUP-WH-20240101',
        status: '正常在架',
        unitPrice: '120元/机时',
        deliveryType: '实时在线交付',
        specs: '64核 / 256GB / 昇腾910B',
        launchDate: '2025-06-01',
        description: '高性能智算集群实例',
        totalOrders: 1420,
        totalSalesAmount: 780.0,
        lastTxDate: '2026-08-28 16:45',
        statsByRange: {
          today: { newOrders: 4, salesAmount: 1.2 },
          week: { newOrders: 28, salesAmount: 14.5 },
          month: { newOrders: 120, salesAmount: 64.0 },
          year: { newOrders: 1420, salesAmount: 780.0 },
        },
        recentOrders: [],
      };
      onViewProductDetail(fallback);
    }
  };

  // =========================================================================
  // 3. 消费订单查询部分状态与逻辑
  // =========================================================================
  const [orderBusinessTypeQuery, setOrderBusinessTypeQuery] = useState(initialSearchState?.orderBusinessType || '全部');
  const [orderIdQuery, setOrderIdQuery] = useState(initialSearchState?.orderId || '');
  const [customerNameQuery, setCustomerNameQuery] = useState(initialSearchState?.customerName || initialSearchState?.customerKey || '');
  const [customerCodeQuery, setCustomerCodeQuery] = useState(initialSearchState?.customerCode || '');
  const [customerTypeQuery, setCustomerTypeQuery] = useState(initialSearchState?.customerType || '全部');
  const [supplierNameQuery, setSupplierNameQuery] = useState(initialSearchState?.supplierName || initialSearchState?.supplierKey || '');
  const [supplierCodeQuery, setSupplierCodeQuery] = useState(initialSearchState?.supplierCode || '');
  const [productNameQuery, setProductNameQuery] = useState(initialSearchState?.productName || '');
  const [categoryQuery, setCategoryQuery] = useState(initialSearchState?.category || '全部');
  const [statusQuery, setStatusQuery] = useState(initialSearchState?.status || '全部');
  const [startTimeQuery, setStartTimeQuery] = useState(initialSearchState?.startTime || '');
  const [endTimeQuery, setEndTimeQuery] = useState(initialSearchState?.endTime || '');

  const [appliedOrderFilters, setAppliedOrderFilters] = useState({
    orderBusinessType: initialSearchState?.orderBusinessType || '全部',
    orderId: initialSearchState?.orderId || '',
    customerName: initialSearchState?.customerName || initialSearchState?.customerKey || '',
    customerCode: initialSearchState?.customerCode || '',
    customerType: initialSearchState?.customerType || '全部',
    supplierName: initialSearchState?.supplierName || initialSearchState?.supplierKey || '',
    supplierCode: initialSearchState?.supplierCode || '',
    productName: initialSearchState?.productName || '',
    category: initialSearchState?.category || '全部',
    status: initialSearchState?.status || '全部',
    startTime: initialSearchState?.startTime || '',
    endTime: initialSearchState?.endTime || '',
  });

  const [orderCurrentPage, setOrderCurrentPage] = useState(initialSearchState?.page || 1);
  const orderPageSize = 20;

  const handleOrderSearch = () => {
    const nextFilters = {
      orderBusinessType: orderBusinessTypeQuery,
      orderId: orderIdQuery.trim(),
      customerName: customerNameQuery.trim(),
      customerCode: customerCodeQuery.trim(),
      customerType: customerTypeQuery,
      supplierName: supplierNameQuery.trim(),
      supplierCode: supplierCodeQuery.trim(),
      productName: productNameQuery.trim(),
      category: categoryQuery,
      status: statusQuery,
      startTime: startTimeQuery,
      endTime: endTimeQuery,
    };
    setAppliedOrderFilters(nextFilters);
    setOrderCurrentPage(1);
    if (onSaveSearchState) {
      onSaveSearchState({ ...nextFilters, page: 1 });
    }
  };

  const handleOrderReset = () => {
    setOrderBusinessTypeQuery('全部');
    setOrderIdQuery('');
    setCustomerNameQuery('');
    setCustomerCodeQuery('');
    setCustomerTypeQuery('全部');
    setSupplierNameQuery('');
    setSupplierCodeQuery('');
    setProductNameQuery('');
    setCategoryQuery('全部');
    setStatusQuery('全部');
    setStartTimeQuery('');
    setEndTimeQuery('');
    const defaultFilters = {
      orderBusinessType: '全部',
      orderId: '',
      customerName: '',
      customerCode: '',
      customerType: '全部',
      supplierName: '',
      supplierCode: '',
      productName: '',
      category: '全部',
      status: '全部',
      startTime: '',
      endTime: '',
    };
    setAppliedOrderFilters(defaultFilters);
    setOrderCurrentPage(1);
    if (onSaveSearchState) {
      onSaveSearchState({ ...defaultFilters, page: 1 });
    }
  };

  // 过滤消费订单列表 (统一基础数据)
  const filteredOrders = useMemo(() => {
    return ALL_DEMAND_ORDERS.filter((ord) => {
      // 1. 订单业务类型 (全部、智能体、算力、模型)
      const bizType = ord.orderBusinessType || (ord.category.includes('智能体') ? '智能体' : ord.category.includes('模型') ? '模型' : '算力');
      if (appliedOrderFilters.orderBusinessType !== '全部' && bizType !== appliedOrderFilters.orderBusinessType) {
        return false;
      }
      // 2. 订单编号
      if (appliedOrderFilters.orderId) {
        if (!ord.orderId.toLowerCase().includes(appliedOrderFilters.orderId.toLowerCase())) {
          return false;
        }
      }
      // 3. 需求方名称 (智能体订单无需求方名称，显示“—”)
      if (appliedOrderFilters.customerName) {
        if (bizType === '智能体') return false;
        if (!ord.customerName || ord.customerName === '—' || !ord.customerName.toLowerCase().includes(appliedOrderFilters.customerName.toLowerCase())) {
          return false;
        }
      }
      // 4. 需求方编号
      if (appliedOrderFilters.customerCode) {
        if (!ord.customerCode.toLowerCase().includes(appliedOrderFilters.customerCode.toLowerCase())) {
          return false;
        }
      }
      // 5. 需求方类型 (取值“企业”与“个人”，智能体订单无需求方类型)
      if (appliedOrderFilters.customerType !== '全部') {
        if (bizType === '智能体') return false;
        if (ord.customerType !== appliedOrderFilters.customerType) return false;
      }
      // 6. 供应商名称 (模型订单无供应商信息)
      if (appliedOrderFilters.supplierName) {
        if (bizType === '模型') return false;
        if (!ord.supplierName || ord.supplierName === '—' || !ord.supplierName.toLowerCase().includes(appliedOrderFilters.supplierName.toLowerCase())) {
          return false;
        }
      }
      // 7. 供应商编号 (模型订单无供应商信息)
      if (appliedOrderFilters.supplierCode) {
        if (bizType === '模型') return false;
        if (!ord.supplierCode || ord.supplierCode === '—' || !ord.supplierCode.toLowerCase().includes(appliedOrderFilters.supplierCode.toLowerCase())) {
          return false;
        }
      }
      // 8. 商品名称
      if (appliedOrderFilters.productName) {
        if (!ord.productName.toLowerCase().includes(appliedOrderFilters.productName.toLowerCase())) {
          return false;
        }
      }
      // 9. 产品类别 (保留算力、模型、智能体三类展示)
      if (appliedOrderFilters.category !== '全部') {
        if (ord.category !== appliedOrderFilters.category) return false;
      }
      // 10. 订单状态
      if (appliedOrderFilters.status !== '全部') {
        if (ord.status !== appliedOrderFilters.status) return false;
      }
      // 11. 下单时间
      if (appliedOrderFilters.startTime) {
        if (ord.orderTime.slice(0, 10) < appliedOrderFilters.startTime) return false;
      }
      if (appliedOrderFilters.endTime) {
        if (ord.orderTime.slice(0, 10) > appliedOrderFilters.endTime) return false;
      }
      return true;
    });
  }, [appliedOrderFilters]);

  const orderTotalPages = Math.max(1, Math.ceil(filteredOrders.length / orderPageSize));
  const paginatedOrders = useMemo(() => {
    const start = (orderCurrentPage - 1) * orderPageSize;
    return filteredOrders.slice(start, start + orderPageSize);
  }, [filteredOrders, orderCurrentPage]);

  return (
    <div className="space-y-4">
      {/* ======================= Tab 1: 消费分析 ======================= */}
      {activeTab === 'analysis' && (
        <div className="space-y-4">
          {/* 客群范围切换 (全部 / 企业 / 个人用户) */}
          <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-3 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              分析客群范围切换
            </span>
            <div className="inline-flex rounded border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium text-slate-600">
              <button
                type="button"
                onClick={() => setAnalysisCustomerType('all')}
                className={`px-3 py-1 rounded transition-all cursor-pointer ${
                  analysisCustomerType === 'all' ? 'bg-white font-semibold text-blue-600 shadow-2xs' : ''
                }`}
              >
                全部客群 (B+C)
              </button>
              <button
                type="button"
                onClick={() => setAnalysisCustomerType('company')}
                className={`px-3 py-1 rounded transition-all cursor-pointer ${
                  analysisCustomerType === 'company' ? 'bg-white font-semibold text-blue-600 shadow-2xs' : ''
                }`}
              >
                企业需求方 (B端)
              </button>
              <button
                type="button"
                onClick={() => setAnalysisCustomerType('individual')}
                className={`px-3 py-1 rounded transition-all cursor-pointer ${
                  analysisCustomerType === 'individual' ? 'bg-white font-semibold text-blue-600 shadow-2xs' : ''
                }`}
              >
                个人需求方 (C端)
              </button>
            </div>
          </div>

          {/* 指标卡片区域：累计卡片放在最左边，新增与增速卡片放在右边 */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            {/* 最左边：累计消费与订单卡片 */}
            <div className="xl:col-span-5 flex flex-col justify-between space-y-2">
              <div className="flex items-center gap-2 px-1">
                <span className="w-1.5 h-3.5 bg-slate-700 rounded-xs" />
                <h2 className="text-xs font-bold text-slate-800 tracking-wide">
                  累计交易指标
                </h2>
                <span className="text-[11px] text-slate-400 font-normal">
                  (全平台历史达成存量)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                {/* 累计卡片 1: 消费总金额 */}
                <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-medium text-xs text-slate-700 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                      消费总金额
                    </span>
                    <span className="text-[11px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60">
                      累计结算
                    </span>
                  </div>
                  <div className="py-2.5">
                    <div className="text-2xl font-bold text-slate-900 tracking-tight">
                      {analysisAmountData.total.toLocaleString()}
                      <span className="text-xs font-normal text-slate-500 ml-1">万元</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      展示截至筛选结束日需求方在平台实际达成消费总流水
                    </div>
                  </div>
                </div>

                {/* 累计卡片 2: 订单总数 */}
                <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-medium text-xs text-slate-700 flex items-center gap-1.5">
                      <ShoppingCart className="w-3.5 h-3.5 text-blue-600" />
                      订单总数
                    </span>
                    <span className="text-[11px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60">
                      有效订单
                    </span>
                  </div>
                  <div className="py-2.5">
                    <div className="text-2xl font-bold text-slate-900 tracking-tight">
                      {analysisOrderData.total.toLocaleString()}
                      <span className="text-xs font-normal text-slate-500 ml-1">笔</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      展示全平台需求端已达成有效履约订单总量
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 右边：周期新增指标 (联动右上角统一时间Tab，只保留新增消费金额和新增订单数) */}
            <div className="xl:col-span-7 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-3.5 bg-blue-600 rounded-xs" />
                  <h2 className="text-xs font-bold text-slate-800 tracking-wide">
                    周期新增指标
                  </h2>
                  <span className="text-[11px] text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                    {effectiveTimeRange === 'today'
                      ? '当日'
                      : effectiveTimeRange === 'week'
                      ? '近一周'
                      : effectiveTimeRange === 'month'
                      ? '近一月'
                      : effectiveTimeRange === 'year'
                      ? '近一年'
                      : `自选(${tradeTrendResult.diffDays}天)`}统计
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                {/* 新增卡片 1: 新增消费金额 */}
                <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-medium text-xs text-slate-700 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                      新增消费金额
                    </span>
                    <span className="text-[11px] text-blue-600 font-medium">
                      {effectiveTimeRange === 'today'
                        ? '当日'
                        : effectiveTimeRange === 'week'
                        ? '近一周'
                        : effectiveTimeRange === 'month'
                        ? '近一月'
                        : effectiveTimeRange === 'year'
                        ? '近一年'
                        : '自选'}
                    </span>
                  </div>
                  <div className="py-2.5">
                    <div className="text-2xl font-bold text-slate-900 tracking-tight">
                      {currentPeriodAmount.toLocaleString()}
                      <span className="text-xs font-normal text-slate-500 ml-1">万元</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      展示当前筛选周期（{effectiveTimeRange === 'today' ? '当日' : effectiveTimeRange === 'week' ? '近一周' : effectiveTimeRange === 'month' ? '近一月' : effectiveTimeRange === 'year' ? '近一年' : `${effectiveStartDate} 至 ${effectiveEndDate}`}）内新产生结算消费金额
                    </div>
                  </div>
                </div>

                {/* 新增卡片 2: 新增订单数 */}
                <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-medium text-xs text-slate-700 flex items-center gap-1.5">
                      <ShoppingCart className="w-3.5 h-3.5 text-blue-600" />
                      新增订单数
                    </span>
                    <span className="text-[11px] text-blue-600 font-medium">
                      {effectiveTimeRange === 'today'
                        ? '当日'
                        : effectiveTimeRange === 'week'
                        ? '近一周'
                        : effectiveTimeRange === 'month'
                        ? '近一月'
                        : effectiveTimeRange === 'year'
                        ? '近一年'
                        : '自选'}
                    </span>
                  </div>
                  <div className="py-2.5">
                    <div className="text-2xl font-bold text-slate-900 tracking-tight">
                      {currentPeriodOrders.toLocaleString()}
                      <span className="text-xs font-normal text-slate-500 ml-1">笔</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      展示当前筛选周期（{effectiveTimeRange === 'today' ? '当日' : effectiveTimeRange === 'week' ? '近一周' : effectiveTimeRange === 'month' ? '近一月' : effectiveTimeRange === 'year' ? '近一年' : `${effectiveStartDate} 至 ${effectiveEndDate}`}）内新创建生效订单笔数
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 独立展示两个趋势图：按用户要求分两行展示，避免一行并排显得过于拥挤 */}
          <div className="space-y-4">
            {/* 第一行：订单趋势图 (全宽展示) */}
            <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-blue-600 rounded-xs" />
                  <span className="text-xs font-bold text-slate-800 tracking-wide">
                    订单趋势 ({effectiveTimeRange === 'today' ? '按时段' : effectiveTimeRange === 'year' ? '按月' : '按日'})
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {tradeTrendResult.subLabel}
                </span>
              </div>
              {tradeTrendResult.isOverLimit ? (
                <div className="h-[280px] w-full flex flex-col items-center justify-center bg-slate-50/70 rounded-md border border-dashed border-slate-200 p-6 text-center">
                  <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mb-2.5 text-amber-600">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">
                    自选时间段跨度超过 30 天，折线图已隐藏
                  </p>
                  <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                    您当前选择的时间跨度为 <span className="font-semibold text-amber-600">{tradeTrendResult.diffDays}</span> 天（{effectiveStartDate} 至 {effectiveEndDate}）。
                    根据展示规则，时间跨度大于 30 天时不展示走势折线图；如需查看每日趋势，请将时间跨度缩短至 30 天以内。
                  </p>
                </div>
              ) : (
                <div className="h-[280px] w-full">
                  <EChartWrapper option={orderTrendOption} height="100%" />
                </div>
              )}
            </div>

            {/* 第二行：消费金额趋势图 (全宽展示) */}
            <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-blue-600 rounded-xs" />
                  <span className="text-xs font-bold text-slate-800 tracking-wide">
                    消费金额趋势 ({effectiveTimeRange === 'today' ? '按时段' : effectiveTimeRange === 'year' ? '按月' : '按日'})
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {tradeTrendResult.subLabel}
                </span>
              </div>
              {tradeTrendResult.isOverLimit ? (
                <div className="h-[280px] w-full flex flex-col items-center justify-center bg-slate-50/70 rounded-md border border-dashed border-slate-200 p-6 text-center">
                  <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mb-2.5 text-amber-600">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">
                    自选时间段跨度超过 30 天，折线图已隐藏
                  </p>
                  <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                    您当前选择的时间跨度为 <span className="font-semibold text-amber-600">{tradeTrendResult.diffDays}</span> 天（{effectiveStartDate} 至 {effectiveEndDate}）。
                    根据展示规则，时间跨度大于 30 天时不展示走势折线图；如需查看每日趋势，请将时间跨度缩短至 30 天以内。
                  </p>
                </div>
              ) : (
                <div className="h-[280px] w-full">
                  <EChartWrapper option={amountTrendOption} height="100%" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================= Tab 2: 产品订购 ======================= */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* 顶部两个指标卡：累计卡片在最左边，新增卡片在右边 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 左边卡片: B/C订购产品总数 (累计去重产品数量，不设置时间Tab) */}
            <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-medium text-xs text-slate-700 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-blue-600" />
                  B/C订购产品总数
                </span>
                <span className="text-[11px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60">
                  累计去重产商品
                </span>
              </div>
              <div className="py-2.5">
                <div className="text-2xl font-bold text-slate-900 tracking-tight">
                  168
                  <span className="text-xs font-normal text-slate-500 ml-1">款</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  展示平台被需求方至少下单订购过一次的去重产商品总数
                </div>
              </div>
            </div>

            {/* 右边卡片: B/C新增订购产品数 (由右上角统一时间选择Tab联动) */}
            <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-medium text-xs text-slate-700 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-blue-600" />
                  B/C新增订购产品数
                </span>
                <span className="text-[11px] text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                  {effectiveTimeRange === 'today'
                    ? '当日'
                    : effectiveTimeRange === 'week'
                    ? '近一周'
                    : effectiveTimeRange === 'month'
                    ? '近一月'
                    : effectiveTimeRange === 'year'
                    ? '近一年'
                    : `自选(${tradeTrendResult.diffDays}天)`}
                </span>
              </div>
              <div className="py-2.5">
                <div className="text-2xl font-bold text-slate-900 tracking-tight">
                  {newProductCount}
                  <span className="text-xs font-normal text-slate-500 ml-1">款</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  展示当前筛选周期（{effectiveTimeRange === 'today' ? '当日' : effectiveTimeRange === 'week' ? '近一周' : effectiveTimeRange === 'month' ? '近一月' : effectiveTimeRange === 'year' ? '近一年' : `${effectiveStartDate} 至 ${effectiveEndDate}`}）首次获需求方下单订购的去重产商品数
                </div>
              </div>
            </div>
          </div>

          {/* 下方筛选区域 */}
          <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4 flex-wrap">
              {/* 需求方类型筛选 */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">需求方类型:</span>
                <div className="inline-flex rounded border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium text-slate-600">
                  <button
                    type="button"
                    onClick={() => setProductOrderCustType('全部')}
                    className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                      productOrderCustType === '全部' ? 'bg-white font-semibold text-blue-600 shadow-2xs' : ''
                    }`}
                  >
                    全部
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductOrderCustType('企业')}
                    className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                      productOrderCustType === '企业' ? 'bg-white font-semibold text-blue-600 shadow-2xs' : ''
                    }`}
                  >
                    企业 (B端)
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductOrderCustType('个人用户')}
                    className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                      productOrderCustType === '个人用户' ? 'bg-white font-semibold text-blue-600 shadow-2xs' : ''
                    }`}
                  >
                    个人用户 (C端)
                  </button>
                </div>
              </div>
            </div>

            {/* 指标维度切换 (订单数 vs 消费金额) */}
            <div className="inline-flex rounded border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium text-slate-600">
              <button
                type="button"
                onClick={() => setMetricMode('orders')}
                className={`px-3 py-1 rounded transition-all cursor-pointer ${
                  metricMode === 'orders' ? 'bg-white font-semibold text-blue-600 shadow-2xs' : ''
                }`}
              >
                按订单数统计
              </button>
              <button
                type="button"
                onClick={() => setMetricMode('amount')}
                className={`px-3 py-1 rounded transition-all cursor-pointer ${
                  metricMode === 'amount' ? 'bg-white font-semibold text-blue-600 shadow-2xs' : ''
                }`}
              >
                按消费金额统计
              </button>
            </div>
          </div>

          {/* “分类订购表现”模块 (横向柱状图，全宽展示) */}
          <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3 bg-blue-600 rounded-xs" />
                <span className="text-xs font-bold text-slate-800 tracking-wide">
                  分类订购表现 (七大业务类别对比)
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                当前维度: {metricMode === 'orders' ? '订单数' : '消费金额'}
              </span>
            </div>
            <div className="h-[280px] w-full">
              <EChartWrapper option={categoryBarOption} height="100%" />
            </div>
          </div>

          {/* “热销TOP5产商品”模块 */}
          <div className="bg-white rounded-md border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3 bg-blue-600 rounded-xs" />
                <span className="text-xs font-bold text-slate-800">
                  热销 TOP5 产商品
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/80">
                  <tr>
                    <th className="py-2.5 px-3.5 text-center w-12">排名</th>
                    <th className="py-2.5 px-3.5">商品名称</th>
                    <th className="py-2.5 px-3.5">所属类别</th>
                    <th className="py-2.5 px-3.5">所属供应商</th>
                    <th className="py-2.5 px-3.5 text-right">订单数</th>
                    <th className="py-2.5 px-3.5 text-right">消费金额</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topProducts.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3.5 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                            idx === 0
                              ? 'bg-amber-100 text-amber-800'
                              : idx === 1
                              ? 'bg-slate-200 text-slate-700'
                              : idx === 2
                              ? 'bg-amber-50 text-amber-700'
                              : 'text-slate-400'
                          }`}
                        >
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 font-medium">
                        <button
                          type="button"
                          onClick={() => handleJumpToProduct(p.productName)}
                          className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 cursor-pointer text-left"
                          title="点击查看供应商产商品详情"
                        >
                          <span>{p.productName}</span>
                          <ExternalLink className="w-3 h-3 text-blue-400" />
                        </button>
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-medium text-white"
                          style={{ backgroundColor: CATEGORY_COLORS[p.category] || '#2563EB' }}
                        >
                          {p.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-600">
                        {p.supplierName}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-semibold text-slate-900">
                        {p.orderCount.toLocaleString()} 笔
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-semibold text-blue-600">
                        {p.amount.toFixed(1)} 万元
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================= Tab 3: 消费订单查询 ======================= */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* 查询表单区域 */}
          <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-3.5">
              <span className="w-1.5 h-3.5 bg-blue-600 rounded-xs" />
              <h3 className="text-xs font-semibold text-slate-800 tracking-wide">
                查询条件
              </h3>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* 第一行：订单业务类型、订单编号、需求方名称、需求方编号 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                {/* 订单业务类型 */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600 font-medium">订单业务类型</label>
                  <select
                    value={orderBusinessTypeQuery}
                    onChange={(e) => setOrderBusinessTypeQuery(e.target.value)}
                    className="h-8.5 px-2 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="全部">全部</option>
                    <option value="智能体">智能体</option>
                    <option value="算力">算力</option>
                    <option value="模型">模型</option>
                  </select>
                </div>

                {/* 订单编号 */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600 font-medium">订单编号</label>
                  <input
                    type="text"
                    placeholder="请输入订单编号"
                    value={orderIdQuery}
                    onChange={(e) => setOrderIdQuery(e.target.value)}
                    className="h-8.5 px-2.5 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* 需求方名称 */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600 font-medium">需求方名称</label>
                  <input
                    type="text"
                    placeholder="请输入需求方名称"
                    value={customerNameQuery}
                    onChange={(e) => setCustomerNameQuery(e.target.value)}
                    className="h-8.5 px-2.5 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* 需求方编号 */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600 font-medium">需求方编号</label>
                  <input
                    type="text"
                    placeholder="请输入需求方编号"
                    value={customerCodeQuery}
                    onChange={(e) => setCustomerCodeQuery(e.target.value)}
                    className="h-8.5 px-2.5 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* 第二行：需求方类型、供应商名称、供应商编号、商品名称 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                {/* 需求方类型 */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600 font-medium">需求方类型</label>
                  <select
                    value={customerTypeQuery}
                    onChange={(e) => setCustomerTypeQuery(e.target.value)}
                    className="h-8.5 px-2 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="全部">全部</option>
                    <option value="企业">企业</option>
                    <option value="个人">个人</option>
                  </select>
                </div>

                {/* 供应商名称 */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600 font-medium">供应商名称</label>
                  <input
                    type="text"
                    placeholder="请输入供应商名称"
                    value={supplierNameQuery}
                    onChange={(e) => setSupplierNameQuery(e.target.value)}
                    className="h-8.5 px-2.5 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* 供应商编号 */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600 font-medium">供应商编号</label>
                  <input
                    type="text"
                    placeholder="请输入供应商编号"
                    value={supplierCodeQuery}
                    onChange={(e) => setSupplierCodeQuery(e.target.value)}
                    className="h-8.5 px-2.5 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* 商品名称 */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600 font-medium">商品名称</label>
                  <input
                    type="text"
                    placeholder="请输入商品名称"
                    value={productNameQuery}
                    onChange={(e) => setProductNameQuery(e.target.value)}
                    className="h-8.5 px-2.5 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* 第三行：产品类别、订单状态、下单时间 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 pt-3 border-t border-slate-100">
                {/* 产品类别 */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600 font-medium">产品类别</label>
                  <select
                    value={categoryQuery}
                    onChange={(e) => setCategoryQuery(e.target.value)}
                    className="h-8.5 px-2 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="全部">全部</option>
                    <option value="智能体">智能体</option>
                    <option value="算力">算力</option>
                    <option value="模型">模型</option>
                  </select>
                </div>

                {/* 订单状态 */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600 font-medium">订单状态</label>
                  <select
                    value={statusQuery}
                    onChange={(e) => setStatusQuery(e.target.value)}
                    className="h-8.5 px-2 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="全部">全部</option>
                    <option value="履约中">履约中</option>
                    <option value="已完成">已完成</option>
                    <option value="待支付">待支付</option>
                    <option value="已取消">已取消</option>
                    <option value="已支付">已支付</option>
                  </select>
                </div>

                {/* 下单时间 */}
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-600 font-medium flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>下单时间</span>
                    </label>
                    {(startTimeQuery || endTimeQuery) && (
                      <button
                        type="button"
                        onClick={() => {
                          setStartTimeQuery('');
                          setEndTimeQuery('');
                        }}
                        className="text-[11px] text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        清空时间
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="date"
                        value={startTimeQuery}
                        onChange={(e) => setStartTimeQuery(e.target.value)}
                        className="w-full h-8.5 px-3 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <span className="text-slate-400 text-xs font-medium px-1 shrink-0">至</span>
                    <div className="relative flex-1">
                      <input
                        type="date"
                        value={endTimeQuery}
                        onChange={(e) => setEndTimeQuery(e.target.value)}
                        className="w-full h-8.5 px-3 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 查询与重置按钮栏 */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  id="btn-demand-order-reset"
                  onClick={handleOrderReset}
                  className="h-8 px-3.5 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  重置
                </button>
                <button
                  type="button"
                  id="btn-demand-order-search"
                  onClick={handleOrderSearch}
                  className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer text-xs"
                >
                  <Search className="w-3.5 h-3.5" />
                  查询
                </button>
              </div>
            </div>
          </div>

          {/* 订单列表 */}
          <div className="bg-white rounded-md border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-blue-600 rounded-xs" />
                <h3 className="text-xs font-semibold text-slate-800 tracking-wide">
                  消费订单列表
                </h3>
              </div>
              <div className="text-xs text-slate-500">
                共检索到 <strong className="text-blue-600 font-mono font-semibold">{filteredOrders.length}</strong> 笔消费订单
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-medium">
                    <th className="py-2.5 px-3 whitespace-nowrap">订单编号</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">订单业务类型</th>
                    <th className="py-2.5 px-3 min-w-[170px]">需求方名称</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">需求方编号</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">需求方类型</th>
                    <th className="py-2.5 px-3 min-w-[170px]">供应商名称</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">供应商编号</th>
                    <th className="py-2.5 px-3 min-w-[180px]">商品名称</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">产品类别</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap">订单总金额</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap">订单状态</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">下单时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {paginatedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-12 text-center text-slate-400 text-xs">
                        未匹配到符合条件的消费订单
                      </td>
                    </tr>
                  ) : (
                    paginatedOrders.map((ord) => {
                      const bizType = ord.orderBusinessType || (ord.category.includes('智能体') ? '智能体' : ord.category.includes('模型') ? '模型' : '算力');
                      // 模型订单目前没有明确的供应商信息，对应字段显示“—”
                      const displaySupplierName = bizType === '模型' ? '—' : (ord.supplierName === '—' ? '—' : ord.supplierName);
                      const displaySupplierCode = bizType === '模型' ? '—' : (ord.supplierCode === '—' ? '—' : ord.supplierCode);
                      // 智能体订单目前没有明确的需求方名称和需求方类型来源，对应字段显示“—”
                      const displayCustomerName = bizType === '智能体' ? '—' : (ord.customerName === '—' ? '—' : ord.customerName);
                      // 只有数据源中存在明确类型字段时才显示；无法确定的记录显示“—”
                      const displayCustomerType = (bizType === '智能体' || ord.customerType === '—' || !['企业', '个人'].includes(ord.customerType)) ? '—' : ord.customerType;

                      return (
                        <tr key={ord.orderId} className="hover:bg-blue-50/30 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-blue-600 font-medium whitespace-nowrap">
                            {ord.orderId}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium border ${
                                bizType === '智能体'
                                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
                                  : bizType === '算力'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200/80'
                                  : 'bg-purple-50 text-purple-700 border-purple-200/80'
                              }`}
                            >
                              {bizType}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-900">
                            {displayCustomerName}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                            {ord.customerCode}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            {displayCustomerType === '—' ? (
                              <span className="text-slate-400 font-mono">—</span>
                            ) : (
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium border ${
                                  displayCustomerType === '企业'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-teal-50 text-teal-700 border-teal-200'
                                }`}
                              >
                                {displayCustomerType}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700">
                            {displaySupplierName}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                            {displaySupplierCode}
                          </td>
                          <td className="py-2.5 px-3 text-slate-800">
                            {ord.productName}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-50 text-slate-700 border border-slate-200">
                              {ord.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                            <span className="font-semibold text-slate-900">
                              ¥{ord.orderAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium ${
                                ord.status === '履约中'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : ord.status === '已完成'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : ord.status === '已支付'
                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                  : ord.status === '待支付'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                            {ord.orderTime}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* 分页控制栏 */}
            {orderTotalPages > 1 && (
              <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>
                  第 {orderCurrentPage} / {orderTotalPages} 页
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={orderCurrentPage === 1}
                    onClick={() => setOrderCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="上一页"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: orderTotalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setOrderCurrentPage(page)}
                      className={`px-2.5 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                        orderCurrentPage === page
                          ? 'bg-blue-600 font-semibold text-white'
                          : 'border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={orderCurrentPage === orderTotalPages}
                    onClick={() => setOrderCurrentPage((p) => Math.min(orderTotalPages, p + 1))}
                    className="p-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="下一页"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
