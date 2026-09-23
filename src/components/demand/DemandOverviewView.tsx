import React, { useState, useMemo } from 'react';
import {
  Users,
  Building2,
  TrendingUp,
  Clock,
  Search,
  RotateCcw,
  Eye,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers,
  PieChart as PieChartIcon,
  BarChart3,
  Check,
  ShoppingCart,
  DollarSign,
  ArrowRight,
  LogIn,
  ShoppingBag,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { EChartWrapper } from '../EChartWrapper';
import {
  ALL_DEMAND_CUSTOMERS,
  DemandCustomerRecord,
  FIXED_PRODUCT_CATEGORIES,
  FixedProductCategory,
} from '../../data/demandMockData';
import { CATEGORY_COLORS } from '../../data/supplierProductsMockData';
import { TimeRangeType } from '../../types';
import { TODAY } from '../../data/mockData';

interface DemandOverviewViewProps {
  onViewCustomerDetail: (customer: DemandCustomerRecord) => void;
  // 支持从详情返回时恢复原查询状态
  initialSearchState?: {
    keyword: string;
    code: string;
    customerType: string;
    category: string;
    startDate: string;
    endDate: string;
    page: number;
  };
  onSaveSearchState?: (state: any) => void;
  activeTab?: 'scale' | 'query';
  onActiveTabChange?: (tab: 'scale' | 'query') => void;
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

export interface ScaleTrendResult {
  dates: string[];
  companyData: number[];
  individualData: number[];
  isOverLimit: boolean;
  diffDays: number;
  subLabel: string;
  unitLabel: string;
  xAxisType: 'hour' | 'day' | 'month';
  totalCompany: number;
  totalIndividual: number;
}

/**
 * 需求方规模新增走势计算（严格遵守 5 大核心展示规则）：
 * 1. 选择当日：展示 24 个小时（0:00 至 23:00），逐小时统计
 * 2. 选择近一周：返回 7 日每日
 * 3. 选择近一月：返回近 30 日的每日
 * 4. 选择近一年：返回从上个月往前推 12 个月的数据，每个月都是对应月份的总计
 * 5. 自选时间段：展示全部，如果时间大于 30 天，那么不展示折线图
 */
export function computeDemandScaleTrendData(
  timeRange: TimeRangeType,
  startDateStr?: string,
  endDateStr?: string
): ScaleTrendResult {
  const refEnd = endDateStr || TODAY;
  const refStart = startDateStr || '2026-08-15';

  // 1. 当日：展示 24 个小时（0:00 至 23:00），逐小时统计
  if (timeRange === 'today') {
    const dates = [
      '0:00', '1:00', '2:00', '3:00', '4:00', '5:00',
      '6:00', '7:00', '8:00', '9:00', '10:00', '11:00',
      '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
      '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
    ];
    // 当日新增企业 4 家 (在 9:00, 11:00, 14:00, 16:00 各1家)
    const companyData = [
      0, 0, 0, 0, 0, 0,
      0, 0, 0, 1, 0, 1,
      0, 0, 1, 0, 1, 0,
      0, 0, 0, 0, 0, 0
    ];
    // 当日新增个人用户 32 人 (逐小时分布)
    const individualData = [
      0, 0, 0, 0, 0, 1,
      1, 2, 3, 4, 3, 2,
      2, 3, 3, 2, 2, 1,
      1, 1, 1, 0, 0, 0
    ];
    return {
      dates,
      companyData,
      individualData,
      isOverLimit: false,
      diffDays: 1,
      subLabel: '当日 24 小时新增走势（共 24 个时段，逐小时统计）',
      unitLabel: '时段新增',
      xAxisType: 'hour',
      totalCompany: 4,
      totalIndividual: 32,
    };
  }

  // 2. 近一周：返回 7 日每日
  if (timeRange === 'week') {
    const end = parseDateStr(refEnd);
    const dates: string[] = [];
    const companyData = [3, 4, 5, 3, 4, 3, 2]; // 合计 24 家
    const individualData = [22, 28, 31, 26, 34, 24, 21]; // 合计 186 人
    for (let i = 6; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(end.getDate() - i);
      dates.push(formatMMDD(d));
    }
    return {
      dates,
      companyData,
      individualData,
      isOverLimit: false,
      diffDays: 7,
      subLabel: `近一周每日新增走势（共 7 日，${dates[0]} 至 ${dates[dates.length - 1]}）`,
      unitLabel: '每日新增',
      xAxisType: 'day',
      totalCompany: 24,
      totalIndividual: 186,
    };
  }

  // 3. 近一月：返回近 30 日每日
  if (timeRange === 'month') {
    const end = parseDateStr(refEnd);
    const dates: string[] = [];
    // 30天新增企业合计 98 家
    const companyData: number[] = [
      3, 4, 3, 2, 4, 3, 5, 3, 4, 2,
      3, 4, 3, 4, 2, 3, 5, 3, 4, 3,
      2, 4, 3, 3, 4, 5, 3, 4, 3, 2
    ];
    // 30天新增个人合计 680 人
    const individualData: number[] = [
      20, 24, 22, 19, 25, 23, 28, 21, 24, 18,
      22, 26, 21, 25, 20, 23, 27, 22, 25, 21,
      19, 26, 23, 22, 25, 28, 22, 25, 21, 18
    ];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(end.getDate() - i);
      dates.push(formatMMDD(d));
    }
    return {
      dates,
      companyData,
      individualData,
      isOverLimit: false,
      diffDays: 30,
      subLabel: `近一月每日新增走势（共 30 日，${dates[0]} 至 ${dates[dates.length - 1]}）`,
      unitLabel: '每日新增',
      xAxisType: 'day',
      totalCompany: 98,
      totalIndividual: 680,
    };
  }

  // 4. 近一年：从上个月往前推 12 个月的数据，每个月都是对应月份总计
  if (timeRange === 'year') {
    const end = parseDateStr(refEnd);
    const endYear = end.getFullYear();
    const endMonth = end.getMonth();

    const dates: string[] = [];
    const companyData = [28, 32, 35, 30, 38, 42, 40, 45, 43, 48, 41, 38]; // 合计 460 家
    const individualData = [190, 210, 240, 220, 270, 310, 290, 340, 320, 360, 300, 290]; // 合计 3240 人

    for (let i = 11; i >= 0; i--) {
      const targetDate = new Date(endYear, endMonth - 1 - i, 1);
      const y = targetDate.getFullYear();
      const m = String(targetDate.getMonth() + 1).padStart(2, '0');
      dates.push(`${y}-${m}`);
    }

    return {
      dates,
      companyData,
      individualData,
      isOverLimit: false,
      diffDays: 365,
      subLabel: `近一年月度总计走势（从上月往前推 12 个月：${dates[0]} 至 ${dates[dates.length - 1]}）`,
      unitLabel: '月度总计',
      xAxisType: 'month',
      totalCompany: 460,
      totalIndividual: 3240,
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
      companyData: [],
      individualData: [],
      isOverLimit: true,
      diffDays,
      subLabel: `自选时间段（${refStart} 至 ${refEnd}，共 ${diffDays} 天）`,
      unitLabel: '每日新增',
      xAxisType: 'day',
      totalCompany: Math.round(diffDays * 3.2),
      totalIndividual: Math.round(diffDays * 22.5),
    };
  }

  // <= 30天：展示全部每日明细
  const dates: string[] = [];
  const companyData: number[] = [];
  const individualData: number[] = [];
  let totalComp = 0;
  let totalIndi = 0;

  for (let i = 0; i < diffDays; i++) {
    const cur = new Date(sDate);
    cur.setDate(sDate.getDate() + i);
    dates.push(formatMMDD(cur));
    const cVal = 2 + (i % 4 === 0 ? 2 : i % 3 === 0 ? 1 : 0);
    const iVal = 18 + ((i * 3) % 11);
    companyData.push(cVal);
    individualData.push(iVal);
    totalComp += cVal;
    totalIndi += iVal;
  }

  return {
    dates,
    companyData,
    individualData,
    isOverLimit: false,
    diffDays,
    subLabel: `自选时间段每日新增走势（${refStart} 至 ${refEnd}，共 ${diffDays} 天全部展示）`,
    unitLabel: '每日新增',
    xAxisType: 'day',
    totalCompany: totalComp,
    totalIndividual: totalIndi,
  };
}

export const DemandOverviewView: React.FC<DemandOverviewViewProps> = ({
  onViewCustomerDetail,
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
  // 页面顶层 Tab: 规模概览 (scale) | 需求方查询 (query)
  const [internalTab, setInternalTab] = useState<'scale' | 'query'>('scale');
  const activeTab = controlledTab !== undefined ? controlledTab : internalTab;

  const setActiveTab = (tab: 'scale' | 'query') => {
    setInternalTab(tab);
    if (onActiveTabChange) {
      onActiveTabChange(tab);
    }
  };

  // =========================================================================
  // 1. 规模概览部分状态与逻辑 (支持当日24h、周、月、年及自选时间段<=30天展示全部每日)
  // =========================================================================
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

  const [customerRecentTimeTab, setCustomerRecentTimeTab] = useState<'week' | 'month' | 'year'>('year');
  // 新增趋势图切换类型: 全部 | 企业 | 个人用户
  const [trendTarget, setTrendTarget] = useState<'all' | 'company' | 'individual'>('all');

  // 计算趋势图展示数据及规则判断 (与 O-S 规则一致)
  const scaleTrendResult = useMemo(() => {
    return computeDemandScaleTrendData(effectiveTimeRange, effectiveStartDate, effectiveEndDate);
  }, [effectiveTimeRange, effectiveStartDate, effectiveEndDate]);

  // 规模概览各卡片指标数据（支持自选时间段与标准周期）
  const newCompanyMetric = useMemo(() => {
    if (effectiveTimeRange === 'custom') {
      return {
        count: scaleTrendResult.totalCompany,
        label: `自选(${scaleTrendResult.diffDays}天)新增`,
        rate: `+${(Math.min(99.9, scaleTrendResult.diffDays * 1.5)).toFixed(1)}%`,
        growthLabel: `自选周期累计`,
      };
    }
    const map = {
      today: { count: 4, label: '当日新增', rate: '+2.1%', growthLabel: '当日环比' },
      week: { count: 24, label: '近一周新增', rate: '+12.4%', growthLabel: '近一周环比' },
      month: { count: 98, label: '近一月新增', rate: '+14.8%', growthLabel: '近一月环比' },
      year: { count: 460, label: '近一年新增', rate: '+45.2%', growthLabel: '近一年同比' },
    };
    return map[effectiveTimeRange as 'today' | 'week' | 'month' | 'year'] || map.year;
  }, [effectiveTimeRange, scaleTrendResult]);

  const newUserMetric = useMemo(() => {
    if (effectiveTimeRange === 'custom') {
      return {
        count: scaleTrendResult.totalIndividual,
        label: `自选(${scaleTrendResult.diffDays}天)新增`,
        rate: `+${(Math.min(99.9, scaleTrendResult.diffDays * 1.2)).toFixed(1)}%`,
        growthLabel: `自选周期累计`,
      };
    }
    const map = {
      today: { count: 32, label: '当日新增', rate: '+1.8%', growthLabel: '当日环比' },
      week: { count: 186, label: '近一周新增', rate: '+8.5%', growthLabel: '近一周环比' },
      month: { count: 680, label: '近一月新增', rate: '+11.2%', growthLabel: '近一月环比' },
      year: { count: 3240, label: '近一年新增', rate: '+38.6%', growthLabel: '近一年同比' },
    };
    return map[effectiveTimeRange as 'today' | 'week' | 'month' | 'year'] || map.year;
  }, [effectiveTimeRange, scaleTrendResult]);

  const enterpriseConversionMetric = useMemo(() => {
    if (effectiveTimeRange === 'custom') {
      const consuming = Math.round(scaleTrendResult.totalCompany * 0.7);
      const rate = scaleTrendResult.totalCompany > 0 
        ? ((consuming / scaleTrendResult.totalCompany) * 100).toFixed(1) + '%' 
        : '0.0%';
      return {
        total: scaleTrendResult.totalCompany,
        consuming,
        rate,
        label: `自选(${scaleTrendResult.diffDays}天)新增`,
      };
    }
    const map = {
      today: { total: 4, consuming: 2, rate: '50.0%', label: '当日新增' },
      week: { total: 24, consuming: 15, rate: '62.5%', label: '近一周新增' },
      month: { total: 98, consuming: 68, rate: '69.4%', label: '近一月新增' },
      year: { total: 460, consuming: 342, rate: '74.3%', label: '近一年新增' },
    };
    return map[effectiveTimeRange as 'today' | 'week' | 'month' | 'year'] || map.year;
  }, [effectiveTimeRange, scaleTrendResult]);

  const activeUserMetric = useMemo(() => {
    if (effectiveTimeRange === 'custom') {
      const days = scaleTrendResult.diffDays;
      const recentLogin = Math.min(7234, Math.round(days * 180 + 800));
      const recentOrder = Math.min(4210, Math.round(days * 75 + 110));
      const orderRatio = ((recentOrder / Math.max(1, recentLogin)) * 100).toFixed(1) + '%';
      return {
        recentLogin,
        recentOrder,
        orderRatio,
        loginLabel: `自选(${days}天)活跃登录`,
        orderLabel: `自选(${days}天)下单活跃`,
        periodLabel: `自选(${days}天)统计`,
      };
    }
    const map = {
      today: {
        recentLogin: 892,
        recentOrder: 116,
        orderRatio: '13.0%',
        loginLabel: '当日活跃登录',
        orderLabel: '当日下单活跃',
        periodLabel: '当日统计',
      },
      week: {
        recentLogin: 2480,
        recentOrder: 548,
        orderRatio: '22.1%',
        loginLabel: '周内活跃登录',
        orderLabel: '周内下单活跃',
        periodLabel: '近一周统计',
      },
      month: {
        recentLogin: 4350,
        recentOrder: 1890,
        orderRatio: '43.4%',
        loginLabel: '月度活跃登录 (MAU)',
        orderLabel: '月度下单活跃 (MAU)',
        periodLabel: '近一月统计',
      },
      year: {
        recentLogin: 7180,
        recentOrder: 4210,
        orderRatio: '58.6%',
        loginLabel: '年度活跃登录',
        orderLabel: '年度下单活跃',
        periodLabel: '近一年统计',
      },
    };
    return map[effectiveTimeRange as 'today' | 'week' | 'month' | 'year'] || map.year;
  }, [effectiveTimeRange, scaleTrendResult]);

  // 新增企业与新增用户趋势折线图
  const trendLineOption = useMemo(() => {
    const months = scaleTrendResult.dates;
    const companyData = scaleTrendResult.companyData;
    const individualData = scaleTrendResult.individualData;
    const allData = companyData.map((v, i) => v + (individualData[i] || 0));

    let series: any[] = [];
    if (trendTarget === 'all') {
      series = [
        {
          name: '全部新增用户',
          type: 'line',
          smooth: false,
          data: allData,
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
                { offset: 0, color: 'rgba(37, 99, 235, 0.25)' },
                { offset: 1, color: 'rgba(37, 99, 235, 0.01)' },
              ],
            },
          },
        },
        {
          name: '新增企业',
          type: 'line',
          smooth: false,
          data: companyData,
          itemStyle: { color: '#0EA5E9' },
          lineStyle: { width: 2, type: 'dashed' },
        },
        {
          name: '新增个人用户',
          type: 'line',
          smooth: false,
          data: individualData,
          itemStyle: { color: '#10B981' },
          lineStyle: { width: 2 },
        },
      ];
    } else if (trendTarget === 'company') {
      series = [
        {
          name: '新增企业',
          type: 'line',
          smooth: false,
          data: companyData,
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
                { offset: 0, color: 'rgba(14, 165, 233, 0.25)' },
                { offset: 1, color: 'rgba(14, 165, 233, 0.01)' },
              ],
            },
          },
        },
      ];
    } else {
      series = [
        {
          name: '新增个人用户',
          type: 'line',
          smooth: false,
          data: individualData,
          itemStyle: { color: '#10B981' },
          lineStyle: { width: 3 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(16, 185, 129, 0.25)' },
                { offset: 1, color: 'rgba(16, 185, 129, 0.01)' },
              ],
            },
          },
        },
      ];
    }

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        formatter: (params: any) => {
          if (!Array.isArray(params) || params.length === 0) return '';
          const title = scaleTrendResult.xAxisType === 'hour'
            ? `时段：当日 ${params[0].name}`
            : scaleTrendResult.xAxisType === 'month'
            ? `月份：${params[0].name}`
            : `日期：${params[0].name}`;
          let html = `<div style="font-size:12px;font-weight:600;color:#1e293b;margin-bottom:4px;">${title}</div>`;
          params.forEach((p: any) => {
            html += `<div style="font-size:12px;color:#475569;display:flex;justify-content:space-between;gap:16px;">
              <span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background-color:${p.color};margin-right:6px;"></span>${p.seriesName}:</span>
              <strong>${p.value}</strong>
            </div>`;
          });
          return html;
        },
      },
      legend: {
        right: 12,
        top: 0,
        textStyle: { fontSize: 12, color: '#64748B' },
      },
      grid: {
        top: 36,
        left: '2%',
        right: '3%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: months,
        axisLine: { lineStyle: { color: '#CBD5E1' } },
        axisLabel: {
          color: '#64748B',
          fontSize: scaleTrendResult.xAxisType === 'hour' ? 10 : 11,
          interval: scaleTrendResult.xAxisType === 'hour' ? 0 : (months.length > 25 ? 1 : 0),
        },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { type: 'dashed', color: '#F1F5F9' } },
        axisLabel: { color: '#64748B', fontSize: 11 },
      },
      series,
    };
  }, [trendTarget, scaleTrendResult]);

  // 企业与个人用户构成环形图
  const compositionPieOption = useMemo(() => {
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} 个 ({d}%)',
      },
      legend: {
        bottom: '5%',
        left: 'center',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { fontSize: 12, color: '#475569' },
      },
      color: ['#2563EB', '#06B6D4'],
      series: [
        {
          name: '用户构成',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 4,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: '{b}\n{d}%',
            fontSize: 11,
            color: '#334155',
          },
          data: [
            { value: 7234, name: '个人用户账号' },
            { value: 1486, name: '企业用户账号' },
          ],
        },
      ],
    };
  }, []);

  // =========================================================================
  // 2. 需求方查询部分状态与逻辑
  // =========================================================================
  const [keywordInput, setKeywordInput] = useState(initialSearchState?.keyword || '');
  const [codeInput, setCodeInput] = useState(initialSearchState?.code || '');
  const [typeInput, setTypeInput] = useState(initialSearchState?.customerType || '全部');
  const [categoryInput, setCategoryInput] = useState(initialSearchState?.category || '全部');
  const [startDateInput, setStartDateInput] = useState(initialSearchState?.startDate || '');
  const [endDateInput, setEndDateInput] = useState(initialSearchState?.endDate || '');

  // 实际生效的筛选条件
  const [appliedFilters, setAppliedFilters] = useState({
    keyword: initialSearchState?.keyword || '',
    code: initialSearchState?.code || '',
    customerType: initialSearchState?.customerType || '全部',
    category: initialSearchState?.category || '全部',
    startDate: initialSearchState?.startDate || '',
    endDate: initialSearchState?.endDate || '',
  });

  const [currentPage, setCurrentPage] = useState(initialSearchState?.page || 1);
  const pageSize = 10;

  // 执行查询
  const handleSearch = () => {
    const nextFilters = {
      keyword: keywordInput.trim(),
      code: codeInput.trim(),
      customerType: typeInput,
      category: categoryInput,
      startDate: startDateInput,
      endDate: endDateInput,
    };
    setAppliedFilters(nextFilters);
    setCurrentPage(1);
    if (onSaveSearchState) {
      onSaveSearchState({ ...nextFilters, page: 1 });
    }
  };

  // 重置查询
  const handleReset = () => {
    setKeywordInput('');
    setCodeInput('');
    setTypeInput('全部');
    setCategoryInput('全部');
    setStartDateInput('');
    setEndDateInput('');
    const defaultFilters = {
      keyword: '',
      code: '',
      customerType: '全部',
      category: '全部',
      startDate: '',
      endDate: '',
    };
    setAppliedFilters(defaultFilters);
    setCurrentPage(1);
    if (onSaveSearchState) {
      onSaveSearchState({ ...defaultFilters, page: 1 });
    }
  };

  // 过滤需求方列表
  const filteredCustomers = useMemo(() => {
    return ALL_DEMAND_CUSTOMERS.filter((item) => {
      if (appliedFilters.keyword) {
        const kw = appliedFilters.keyword.toLowerCase();
        if (!item.customerName.toLowerCase().includes(kw)) {
          return false;
        }
      }
      if (appliedFilters.code) {
        const code = appliedFilters.code.toLowerCase();
        if (!item.customerCode.toLowerCase().includes(code)) {
          return false;
        }
      }
      if (appliedFilters.customerType !== '全部') {
        if (item.customerType !== appliedFilters.customerType) {
          return false;
        }
      }
      if (appliedFilters.category !== '全部') {
        if (!item.orderedCategories.includes(appliedFilters.category as FixedProductCategory)) {
          return false;
        }
      }
      if (appliedFilters.startDate) {
        if (item.lastTxDate.slice(0, 10) < appliedFilters.startDate) {
          return false;
        }
      }
      if (appliedFilters.endDate) {
        if (item.lastTxDate.slice(0, 10) > appliedFilters.endDate) {
          return false;
        }
      }
      return true;
    });
  }, [appliedFilters]);

  // 分页数据
  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage]);

  const handleGoToDetail = (customer: DemandCustomerRecord) => {
    if (onSaveSearchState) {
      onSaveSearchState({
        ...appliedFilters,
        page: currentPage,
      });
    }
    onViewCustomerDetail(customer);
  };

  return (
    <div className="space-y-4">
      {/* ======================= Tab 1: 规模概览 ======================= */}
      {activeTab === 'scale' && (
        <div className="space-y-4">
          {/* 指标卡片区域：累计存量卡片放左边，周期新增卡片放右边 */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            {/* 最左边：累计规模指标 (只保留用户总数) */}
            <div className="xl:col-span-4 flex flex-col justify-between space-y-2">
              <div className="flex items-center gap-2 px-1">
                <span className="w-1.5 h-3.5 bg-slate-700 rounded-xs" />
                <h2 className="text-xs font-bold text-slate-800 tracking-wide">
                  累计规模指标
                </h2>
                <span className="text-[11px] text-slate-400 font-normal">
                  (历史全量有效存量)
                </span>
              </div>
              <div className="flex-1 flex flex-col">
                {/* 累计卡片: 用户总数 */}
                <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between flex-1">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-medium text-xs text-slate-700 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      用户总数
                    </span>
                    <span className="text-[11px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60">
                      账号累计
                    </span>
                  </div>
                  <div className="py-2.5">
                    <div className="text-2xl font-bold text-slate-900 tracking-tight">
                      8,720
                      <span className="text-xs font-normal text-slate-500 ml-1">个账号</span>
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                        <span>企业用户: 1,486 (17.0%)</span>
                        <span>个人用户: 7,234 (83.0%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
                        <div className="bg-blue-600 h-full" style={{ width: '17.0%' }} />
                        <div className="bg-cyan-400 h-full" style={{ width: '83.0%' }} />
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      展示平台全量注册用户数，含企业认证账号与个人开发者账号
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 右边：周期新增指标 (联动右上角统一时间Tab，保留新增企业数与新增用户数) */}
            <div className="xl:col-span-8 flex flex-col justify-between space-y-2">
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
                      : `自选(${scaleTrendResult.diffDays}天)`}统计
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                {/* 新增卡片 1: 新增企业数 */}
                <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-medium text-xs text-slate-700 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      新增企业数
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
                        : `自选(${scaleTrendResult.diffDays}天)`}
                    </span>
                  </div>
                  <div className="py-2.5">
                    <div className="text-2xl font-bold text-slate-900 tracking-tight">
                      {newCompanyMetric.count}
                      <span className="text-xs font-normal text-slate-500 ml-1">家</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      展示当前筛选周期（{newCompanyMetric.label}）内平台新入驻企业总数
                    </div>
                  </div>
                </div>

                {/* 新增卡片 2: 新增用户数 */}
                <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-medium text-xs text-slate-700 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      新增用户数
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
                        : `自选(${scaleTrendResult.diffDays}天)`}
                    </span>
                  </div>
                  <div className="py-2.5">
                    <div className="text-2xl font-bold text-slate-900 tracking-tight">
                      {newUserMetric.count}
                      <span className="text-xs font-normal text-slate-500 ml-1">个</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      展示当前筛选周期（{newUserMetric.label}）内平台B/C新增注册用户数
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 周期转化率指标与月活活跃指标卡片区域 (联动周期统计) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 卡片 1: 近期企业数 -> 消费企业数转化指标 (箭头上为转化率) */}
            <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-3.5 bg-blue-600 rounded-xs" />
                  <h3 className="text-xs font-bold text-slate-800 tracking-wide">
                    企业数转化指标
                  </h3>
                </div>
                <span className="text-[11px] text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {effectiveTimeRange === 'today'
                    ? '当日'
                    : effectiveTimeRange === 'week'
                    ? '近一周'
                    : effectiveTimeRange === 'month'
                    ? '近一月'
                    : effectiveTimeRange === 'year'
                    ? '近一年'
                    : `自选(${scaleTrendResult.diffDays}天)`}统计
                </span>
              </div>

              {/* 企业数 -> 消费企业数 转化流转视图 */}
              <div className="py-3.5 flex items-center justify-between gap-2 sm:gap-4">
                {/* 左侧：企业数 */}
                <div className="flex-1 bg-slate-50/90 border border-slate-200/80 rounded-md p-3">
                  <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-600" />
                    企业数
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-1">
                    {enterpriseConversionMetric.total}
                    <span className="text-xs font-normal text-slate-500 ml-1">家</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">周期内主体企业</div>
                </div>

                {/* 中间：箭头与转化率 */}
                <div className="flex flex-col items-center justify-center px-1 sm:px-2 shrink-0">
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full shadow-2xs whitespace-nowrap mb-1">
                    转化率 {enterpriseConversionMetric.rate}
                  </span>
                  <div className="flex items-center text-blue-500">
                    <div className="w-8 sm:w-16 h-0.5 bg-blue-300 rounded-full" />
                    <ArrowRight className="w-4 h-4 -ml-1 text-blue-600" />
                  </div>
                </div>

                {/* 右侧：消费企业数 */}
                <div className="flex-1 bg-blue-50/40 border border-blue-200/80 rounded-md p-3">
                  <div className="text-[11px] text-blue-700 font-medium flex items-center gap-1.5">
                    <ShoppingCart className="w-3.5 h-3.5 text-blue-600" />
                    消费企业数
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-blue-700 mt-1">
                    {enterpriseConversionMetric.consuming}
                    <span className="text-xs font-normal text-blue-500 ml-1">家</span>
                  </div>
                  <div className="text-[10px] text-blue-400 mt-0.5">产生实际订购消费</div>
                </div>
              </div>
            </div>

            {/* 卡片 2: 月活指标 (以最近下单和最近登录两个维度进行统计，也是按周期) */}
            <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-3.5 bg-blue-600 rounded-xs" />
                  <h3 className="text-xs font-bold text-slate-800 tracking-wide flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-blue-600" />
                    月活指标
                  </h3>
                </div>
                <span className="text-[11px] text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {effectiveTimeRange === 'today'
                    ? '当日'
                    : effectiveTimeRange === 'week'
                    ? '近一周'
                    : effectiveTimeRange === 'month'
                    ? '近一月'
                    : effectiveTimeRange === 'year'
                    ? '近一年'
                    : `自选(${scaleTrendResult.diffDays}天)`}统计
                </span>
              </div>

              {/* 两个维度展示：最近登录 vs 最近下单 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3.5">
                {/* 维度 1: 最近登录 */}
                <div className="bg-slate-50/90 border border-slate-200/80 rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
                      <LogIn className="w-3.5 h-3.5 text-blue-600" />
                      最近登录
                    </span>
                    <span className="text-[10px] text-slate-400">登录活跃</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-1.5">
                    {activeUserMetric.recentLogin.toLocaleString()}
                    <span className="text-xs font-normal text-slate-500 ml-1">人</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {activeUserMetric.loginLabel}
                  </div>
                </div>

                {/* 维度 2: 最近下单 */}
                <div className="bg-blue-50/40 border border-blue-200/80 rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-blue-700 font-medium flex items-center gap-1">
                      <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                      最近下单
                    </span>
                    <span className="text-[10px] text-blue-600 font-medium bg-blue-100/70 px-1.5 py-0.5 rounded">
                      占比 {activeUserMetric.orderRatio}
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-blue-700 mt-1.5">
                    {activeUserMetric.recentOrder.toLocaleString()}
                    <span className="text-xs font-normal text-blue-500 ml-1">人</span>
                  </div>
                  <div className="text-[10px] text-blue-500 mt-0.5">
                    {activeUserMetric.orderLabel}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 新增企业与新增用户趋势 (折线图，支持切换全部/企业/个人用户，全宽展示) */}
          <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3 bg-blue-600 rounded-xs" />
                <span className="text-xs font-bold text-slate-800 tracking-wide">
                  新增企业与新增用户趋势
                </span>
                <span className="text-[11px] text-slate-400">
                  （{scaleTrendResult.subLabel}）
                </span>
              </div>

              <div className="inline-flex rounded border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium text-slate-600">
                <button
                  type="button"
                  onClick={() => setTrendTarget('all')}
                  className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                    trendTarget === 'all' ? 'bg-white font-semibold text-blue-600 shadow-2xs' : ''
                  }`}
                >
                  全部
                </button>
                <button
                  type="button"
                  onClick={() => setTrendTarget('company')}
                  className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                    trendTarget === 'company' ? 'bg-white font-semibold text-blue-600 shadow-2xs' : ''
                  }`}
                >
                  企业
                </button>
                <button
                  type="button"
                  onClick={() => setTrendTarget('individual')}
                  className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                    trendTarget === 'individual' ? 'bg-white font-semibold text-blue-600 shadow-2xs' : ''
                  }`}
                >
                  个人用户
                </button>
              </div>
            </div>

            {/* 趋势图展示区：自选时间段大于 30 天时展示友好提示，不绘制折线图 */}
            {scaleTrendResult.isOverLimit ? (
              <div
                id="demand-scale-trend-chart-over-limit"
                className="h-64 flex flex-col items-center justify-center bg-slate-50/70 border border-dashed border-slate-200 rounded-md p-6 text-center"
              >
                <div className="w-11 h-11 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mb-3">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <h4 className="text-sm font-semibold text-slate-800 mb-1.5">
                  自选时间段跨度为 {scaleTrendResult.diffDays} 天（大于 30 天上限）
                </h4>
                <p className="text-xs text-slate-500 max-w-md leading-relaxed mb-3">
                  根据业务规则，趋势图仅支持展示不超过 30 天的每日明细走势。当前所选时间跨度较大，暂不绘制每日折线趋势图。
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200 rounded px-3 py-1.5 shadow-2xs">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    建议：将时间段调整至 30 天以内查看每日走势，或切换至
                    <span className="font-semibold text-blue-600 ml-1">【近一年】</span>
                    查看月度汇总走势。
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-[280px] w-full">
                <EChartWrapper option={trendLineOption} height="100%" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================= Tab 2: 需求方查询 ======================= */}
      {activeTab === 'query' && (
        <div className="space-y-4">
          {/* 需求方查询指标总览卡片：订单总数和消费总金额放左边，新增订单数和新增消费金额放在右侧 */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            {/* 左侧：累计订单总数与累计消费总金额 */}
            <div className="xl:col-span-6 flex flex-col justify-between space-y-2">
              <div className="flex items-center gap-2 px-1">
                <span className="w-1.5 h-3.5 bg-slate-700 rounded-xs" />
                <h2 className="text-xs font-bold text-slate-800 tracking-wide">
                  累计消费概览
                </h2>
                <span className="text-[11px] text-slate-400 font-normal">
                  (已匹配需求方累计汇总)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                {/* 订单总数 */}
                <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-medium text-xs text-slate-700 flex items-center gap-1.5">
                      <ShoppingCart className="w-3.5 h-3.5 text-blue-600" />
                      订单总数
                    </span>
                    <span className="text-[11px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60">
                      累计订单
                    </span>
                  </div>
                  <div className="py-2.5">
                    <div className="text-2xl font-bold text-slate-900 tracking-tight">
                      {filteredCustomers.reduce((sum, c) => sum + c.totalOrders, 0).toLocaleString()}
                      <span className="text-xs font-normal text-slate-500 ml-1">笔</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      当前检索结果中所有需求方历史累计达成的订单总量
                    </div>
                  </div>
                </div>

                {/* 消费总金额 */}
                <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-medium text-xs text-slate-700 flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                      消费总金额
                    </span>
                    <span className="text-[11px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60">
                      累计消费
                    </span>
                  </div>
                  <div className="py-2.5">
                    <div className="text-2xl font-bold text-blue-600 tracking-tight">
                      {filteredCustomers.reduce((sum, c) => sum + c.totalConsumption, 0).toFixed(1)}
                      <span className="text-xs font-normal text-slate-500 ml-1">万元</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      当前检索结果中所有需求方平台实际结算消费总规模
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧：新增订单数与新增消费金额 */}
            <div className="xl:col-span-6 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-3.5 bg-blue-600 rounded-xs" />
                  <h2 className="text-xs font-bold text-slate-800 tracking-wide">
                    近期新增动态
                  </h2>
                </div>
                <div className="inline-flex rounded border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium text-slate-600">
                  <button
                    type="button"
                    onClick={() => setCustomerRecentTimeTab('week')}
                    className={`px-2 py-0.5 rounded text-[11px] cursor-pointer transition-colors ${
                      customerRecentTimeTab === 'week' ? 'bg-white font-semibold text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    近一周
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerRecentTimeTab('month')}
                    className={`px-2 py-0.5 rounded text-[11px] cursor-pointer transition-colors ${
                      customerRecentTimeTab === 'month' ? 'bg-white font-semibold text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    近一月
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerRecentTimeTab('year')}
                    className={`px-2 py-0.5 rounded text-[11px] cursor-pointer transition-colors ${
                      customerRecentTimeTab === 'year' ? 'bg-white font-semibold text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    近一年
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                {/* 新增订单数 */}
                <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-medium text-xs text-slate-700 flex items-center gap-1.5">
                      <ShoppingCart className="w-3.5 h-3.5 text-blue-600" />
                      新增订单数
                    </span>
                    <span className="text-[11px] text-blue-600 font-medium">
                      {customerRecentTimeTab === 'year' ? '近一年' : customerRecentTimeTab === 'month' ? '近一月' : '近一周'}
                    </span>
                  </div>
                  <div className="py-2.5">
                    <div className="text-2xl font-bold text-slate-900 tracking-tight">
                      {filteredCustomers.reduce((sum, c) => sum + (c.consumptionStats[customerRecentTimeTab]?.newOrders || 0), 0).toLocaleString()}
                      <span className="text-xs font-normal text-slate-500 ml-1">笔</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {customerRecentTimeTab === 'year' ? '近一年' : customerRecentTimeTab === 'month' ? '近一月' : '近一周'}内筛选出的需求方新产生的有效订购订单数
                    </div>
                  </div>
                </div>

                {/* 新增消费金额 */}
                <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-medium text-xs text-slate-700 flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                      新增消费金额
                    </span>
                    <span className="text-[11px] text-blue-600 font-medium">
                      {customerRecentTimeTab === 'year' ? '近一年' : customerRecentTimeTab === 'month' ? '近一月' : '近一周'}
                    </span>
                  </div>
                  <div className="py-2.5">
                    <div className="text-2xl font-bold text-blue-600 tracking-tight">
                      {filteredCustomers.reduce((sum, c) => sum + (c.consumptionStats[customerRecentTimeTab]?.newAmount || 0), 0).toFixed(1)}
                      <span className="text-xs font-normal text-slate-500 ml-1">万元</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {customerRecentTimeTab === 'year' ? '近一年' : customerRecentTimeTab === 'month' ? '近一月' : '近一周'}内筛选出的需求方新增的结算流水总金额
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* 查询表单区域 */}
          <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              {/* 需求方名称或用户名称 */}
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  需求方名称 / 用户名称
                </label>
                <input
                  type="text"
                  placeholder="如：华中科技大学、李晨"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              {/* 需求方编号 */}
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  需求方编号
                </label>
                <input
                  type="text"
                  placeholder="如：CUST-HB-00101"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              {/* 需求方类型 */}
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  需求方类型
                </label>
                <select
                  value={typeInput}
                  onChange={(e) => setTypeInput(e.target.value)}
                  className="w-full h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:border-blue-500 focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="全部">全部类型</option>
                  <option value="企业">企业 (B端)</option>
                  <option value="个人用户">个人用户 (C端)</option>
                </select>
              </div>

              {/* 订购产品类别 */}
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  订购产品类别
                </label>
                <select
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  className="w-full h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:border-blue-500 focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="全部">全部七类产品</option>
                  {FIXED_PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* 最后交易时间 (开始日期) */}
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  最后交易时间 (起)
                </label>
                <input
                  type="date"
                  value={startDateInput}
                  onChange={(e) => setStartDateInput(e.target.value)}
                  className="w-full h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:border-blue-500 focus:outline-none transition-colors cursor-pointer"
                />
              </div>

              {/* 最后交易时间 (止) */}
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  最后交易时间 (止)
                </label>
                <input
                  type="date"
                  value={endDateInput}
                  onChange={(e) => setEndDateInput(e.target.value)}
                  className="w-full h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:border-blue-500 focus:outline-none transition-colors cursor-pointer"
                />
              </div>
            </div>

            {/* 查询与重置按钮 */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                id="btn-demand-reset"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                重置
              </button>
              <button
                type="button"
                id="btn-demand-search"
                onClick={handleSearch}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                查询
              </button>
            </div>
          </div>

          {/* 查询结果列表 */}
          <div className="bg-white rounded-md border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                共检索到 <strong className="text-blue-600">{filteredCustomers.length}</strong> 位需求方
              </span>
              <span>每页显示 {pageSize} 条</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/80 select-none">
                  <tr>
                    <th className="py-2.5 px-3.5">需求方名称</th>
                    <th className="py-2.5 px-3.5">需求方编号</th>
                    <th className="py-2.5 px-3.5">需求方类型</th>
                    <th className="py-2.5 px-3.5 text-right">订单总数</th>
                    <th className="py-2.5 px-3.5 text-right">消费总金额</th>
                    <th className="py-2.5 px-3.5 text-center">订购产品数</th>
                    <th className="py-2.5 px-3.5">最近登录时间</th>
                    <th className="py-2.5 px-3.5">最后交易时间</th>
                    <th className="py-2.5 px-3.5 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-slate-400">
                        未匹配到符合条件的需求方
                      </td>
                    </tr>
                  ) : (
                    paginatedCustomers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3.5 font-medium text-slate-900">
                          {cust.customerName}
                        </td>
                        <td className="py-2.5 px-3.5 font-mono text-[11px] text-slate-500">
                          {cust.customerCode}
                        </td>
                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                              cust.customerType === '企业'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                            }`}
                          >
                            {cust.customerType}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-semibold text-slate-800">
                          {cust.totalOrders.toLocaleString()} 笔
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-semibold text-blue-600">
                          {cust.totalConsumption.toFixed(1)} 万元
                        </td>
                        <td className="py-2.5 px-3.5 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                            {cust.orderedProductsCount} 种
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {cust.lastLoginTime}
                        </td>
                        <td className="py-2.5 px-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {cust.lastTxDate}
                        </td>
                        <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleGoToDetail(cust)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            查看详情
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 分页控制栏 */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>
                  第 {currentPage} / {totalPages} 页
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="上一页"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`px-2.5 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                        currentPage === page
                          ? 'bg-blue-600 font-semibold text-white'
                          : 'border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
