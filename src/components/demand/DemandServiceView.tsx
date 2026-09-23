import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Clock,
  Filter,
  Info,
  Layers,
  Building2,
  User,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { EChartWrapper } from '../EChartWrapper';
import {
  ALL_DEMAND_FEEDBACKS,
  DemandFeedbackRecord,
  FIXED_PRODUCT_CATEGORIES,
  FixedProductCategory,
} from '../../data/demandMockData';
import { CATEGORY_COLORS } from '../../data/supplierProductsMockData';
import { TimeRangeType } from '../../types';

interface DemandServiceViewProps {
  activeTab?: 'feedback' | 'usage';
  onActiveTabChange?: (tab: 'feedback' | 'usage') => void;
  timeRange?: TimeRangeType;
  startDate?: string;
  endDate?: string;
  onTimeRangeChange?: (range: TimeRangeType) => void;
  onStartDateChange?: (date: string) => void;
  onEndDateChange?: (date: string) => void;
}

export const DemandServiceView: React.FC<DemandServiceViewProps> = ({
  activeTab: controlledTab,
  onActiveTabChange,
  timeRange: controlledTimeRange,
  startDate: controlledStartDate,
  endDate: controlledEndDate,
  onTimeRangeChange,
  onStartDateChange,
  onEndDateChange,
}) => {
  // 页面内部Tab: 反馈与投诉 (feedback) | 平台使用情况 (usage)
  const [internalTab, setInternalTab] = useState<'feedback' | 'usage'>('feedback');
  const activeTab = controlledTab !== undefined ? controlledTab : internalTab;

  const setActiveTab = (tab: 'feedback' | 'usage') => {
    setInternalTab(tab);
    if (onActiveTabChange) {
      onActiveTabChange(tab);
    }
  };

  // =========================================================================
  // 1. 反馈与投诉部分状态与逻辑 (统一时间Tab，包含当日与自选时间段)
  // =========================================================================
  const [localTimeRange, setLocalTimeRange] = useState<TimeRangeType>('year');
  const [localStartDate, setLocalStartDate] = useState<string>('2025-09-01');
  const [localEndDate, setLocalEndDate] = useState<string>('2026-09-22');

  const effectiveTimeRange = controlledTimeRange !== undefined ? controlledTimeRange : localTimeRange;
  const effectiveStartDate = controlledStartDate !== undefined ? controlledStartDate : localStartDate;
  const effectiveEndDate = controlledEndDate !== undefined ? controlledEndDate : localEndDate;

  const handleTimeRangeChange = (range: TimeRangeType) => {
    setLocalTimeRange(range);
    if (onTimeRangeChange) {
      onTimeRangeChange(range);
    }
    const end = '2026-09-22';
    let start = '2025-09-01';
    if (range === 'today') start = '2026-09-22';
    else if (range === 'week') start = '2026-09-16';
    else if (range === 'month') start = '2026-08-23';
    else if (range === 'year') start = '2025-09-01';
    setLocalStartDate(start);
    setLocalEndDate(end);
    if (onStartDateChange) onStartDateChange(start);
    if (onEndDateChange) onEndDateChange(end);
  };

  const handleStartDateChange = (val: string) => {
    setLocalStartDate(val);
    if (onStartDateChange) onStartDateChange(val);
    setLocalTimeRange('custom');
    if (onTimeRangeChange) onTimeRangeChange('custom');
  };

  const handleEndDateChange = (val: string) => {
    setLocalEndDate(val);
    if (onEndDateChange) onEndDateChange(val);
    setLocalTimeRange('custom');
    if (onTimeRangeChange) onTimeRangeChange('custom');
  };

  // 计算自选天数与限制
  const customDays = useMemo(() => {
    if (effectiveTimeRange !== 'custom' || !effectiveStartDate || !effectiveEndDate) {
      return 1;
    }
    const startMs = new Date(effectiveStartDate).getTime();
    const endMs = new Date(effectiveEndDate).getTime();
    const diff = Math.round((endMs - startMs) / (1000 * 3600 * 24)) + 1;
    return diff > 0 ? diff : 1;
  }, [effectiveTimeRange, effectiveStartDate, effectiveEndDate]);

  const isOverLimit = effectiveTimeRange === 'custom' && customDays > 30;

  const feedbackVolumeData = useMemo(() => {
    let count = 342;
    let rate = '-14.5%';
    let label = '近一年';

    if (effectiveTimeRange === 'today') {
      count = 2;
      rate = '-12.5%';
      label = '当日';
    } else if (effectiveTimeRange === 'week') {
      count = 18;
      rate = '-10.0%';
      label = '近一周';
    } else if (effectiveTimeRange === 'month') {
      count = 76;
      rate = '-6.2%';
      label = '近一月';
    } else if (effectiveTimeRange === 'year') {
      count = 342;
      rate = '-14.5%';
      label = '近一年';
    } else {
      count = Math.max(1, Math.round(customDays * 2.5));
      rate = '-8.3%';
      label = `自选(${customDays}天)`;
    }

    return {
      totalCumulative: 1248,
      currentCount: count,
      currentRate: rate,
      label,
    };
  }, [effectiveTimeRange, customDays]);

  // 下方筛选条件
  const [feedbackCustType, setFeedbackCustType] = useState<'全部' | '企业' | '个人用户'>('全部');
  const [feedbackCategory, setFeedbackCategory] = useState<string>('全部');

  // 柱状图展示不同类别的反馈/投诉数量及企业和个人用户构成
  const feedbackBarOption = useMemo(() => {
    const categories =
      feedbackCategory === '全部' ? FIXED_PRODUCT_CATEGORIES : [feedbackCategory as FixedProductCategory];

    // 针对每个类别构造企业与个人用户的反馈数量，按时间周期动态适配
    const countMultipliers =
      effectiveTimeRange === 'today'
        ? 0.12
        : effectiveTimeRange === 'week'
        ? 1
        : effectiveTimeRange === 'month'
        ? 4.2
        : effectiveTimeRange === 'year'
        ? 19
        : Math.max(0.2, (customDays / 7) * 1.0);

    const baseCompany = [6, 4, 3, 2, 2, 1, 1];
    const baseIndividual = [4, 5, 2, 1, 3, 0, 1];

    const companyCounts = baseCompany.map((v) => Math.max(Math.round(v * countMultipliers), 0));
    const individualCounts = baseIndividual.map((v) => Math.max(Math.round(v * countMultipliers), 0));
    if (effectiveTimeRange === 'today') {
      companyCounts[0] = 1;
      companyCounts[1] = 1;
      individualCounts[1] = 1;
    }

    let series: any[] = [];
    if (feedbackCustType === '全部') {
      series = [
        {
          name: '企业反馈/投诉',
          type: 'bar',
          stack: 'total',
          barWidth: 20,
          data: feedbackCategory === '全部' ? companyCounts : [companyCounts[0]],
          itemStyle: { color: '#2563EB', borderRadius: [0, 0, 0, 0] },
        },
        {
          name: '个人用户反馈/投诉',
          type: 'bar',
          stack: 'total',
          barWidth: 20,
          data: feedbackCategory === '全部' ? individualCounts : [individualCounts[0]],
          itemStyle: { color: '#06B6D4', borderRadius: [3, 3, 0, 0] },
        },
      ];
    } else if (feedbackCustType === '企业') {
      series = [
        {
          name: '企业反馈/投诉',
          type: 'bar',
          barWidth: 20,
          data: feedbackCategory === '全部' ? companyCounts : [companyCounts[0]],
          itemStyle: { color: '#2563EB', borderRadius: [3, 3, 0, 0] },
        },
      ];
    } else {
      series = [
        {
          name: '个人用户反馈/投诉',
          type: 'bar',
          barWidth: 20,
          data: feedbackCategory === '全部' ? individualCounts : [individualCounts[0]],
          itemStyle: { color: '#06B6D4', borderRadius: [3, 3, 0, 0] },
        },
      ];
    }

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      legend: {
        right: 12,
        top: 0,
        textStyle: { fontSize: 12, color: '#64748B' },
      },
      grid: { top: 36, left: '2%', right: '3%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: categories,
        axisLine: { lineStyle: { color: '#CBD5E1' } },
        axisLabel: { color: '#475569', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        name: '反馈/投诉量 (件)',
        nameTextStyle: { color: '#94A3B8', fontSize: 11 },
        splitLine: { lineStyle: { type: 'dashed', color: '#F1F5F9' } },
        axisLabel: { color: '#64748B', fontSize: 11 },
      },
      series,
    };
  }, [feedbackCategory, feedbackCustType, effectiveTimeRange, customDays]);

  // 过滤后的明细列表 (严格遵守：不展示处理状态、责任人、处理进度等未要求字段)
  const filteredFeedbacks = useMemo(() => {
    return ALL_DEMAND_FEEDBACKS.filter((item) => {
      if (feedbackCustType !== '全部' && item.customerType !== feedbackCustType) return false;
      if (feedbackCategory !== '全部' && item.category !== feedbackCategory) return false;
      return true;
    });
  }, [feedbackCustType, feedbackCategory]);

  // =========================================================================
  // 2. 平台使用情况部分 (演示口径)
  // =========================================================================
  const usageStats = useMemo(() => {
    if (effectiveTimeRange === 'today') {
      return { company: '44.8', individual: '29.2', unit: '分钟/次' };
    }
    if (effectiveTimeRange === 'week') {
      return { company: '42.5', individual: '28.4', unit: '分钟/次' };
    }
    if (effectiveTimeRange === 'month') {
      return { company: '38.6', individual: '26.1', unit: '分钟/次' };
    }
    if (effectiveTimeRange === 'year') {
      return { company: '35.2', individual: '24.8', unit: '分钟/次' };
    }
    return { company: '39.4', individual: '26.8', unit: '分钟/次' };
  }, [effectiveTimeRange]);

  // 演示趋势折线图 (当日按24小时统计，自选超30天隐藏)
  const usageTrendOption = useMemo(() => {
    let categories: string[] = [];
    let companyData: number[] = [];
    let individualData: number[] = [];

    if (effectiveTimeRange === 'today') {
      categories = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
      companyData = [
        18, 15, 12, 10, 11, 14, 22, 32, 42, 46, 48, 45,
        38, 44, 47, 49, 46, 42, 38, 35, 32, 28, 24, 20
      ];
      individualData = [
        12, 10, 8, 7, 7, 9, 15, 22, 28, 31, 32, 30,
        25, 29, 31, 33, 30, 27, 25, 23, 21, 18, 16, 14
      ];
    } else if (effectiveTimeRange === 'week') {
      categories = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
      companyData = [38.2, 41.5, 45.0, 44.2, 46.8, 36.5, 35.0];
      individualData = [25.0, 27.2, 28.5, 29.0, 30.5, 32.0, 31.5];
    } else if (effectiveTimeRange === 'month') {
      categories = ['第1周', '第2周', '第3周', '第4周'];
      companyData = [36.5, 38.2, 40.1, 39.5];
      individualData = [24.5, 25.8, 27.0, 26.8];
    } else if (effectiveTimeRange === 'year') {
      categories = ['2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09'];
      companyData = [32.0, 32.8, 33.5, 34.0, 34.8, 35.5, 36.2, 36.8, 37.5, 38.0, 38.6, 39.2];
      individualData = [22.0, 22.5, 23.1, 23.6, 24.2, 24.6, 25.0, 25.4, 26.0, 26.3, 26.5, 27.0];
    } else {
      // 自选时间段 (小于等于30天)
      const days = Math.min(customDays, 30);
      categories = [];
      companyData = [];
      individualData = [];
      const startMs = new Date(effectiveStartDate).getTime();
      for (let i = 0; i < days; i++) {
        const d = new Date(startMs + i * 86400000);
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        categories.push(`${mm}-${dd}`);
        const pseudo = Math.sin(i * 0.8) * 4;
        companyData.push(Number((38 + pseudo).toFixed(1)));
        individualData.push(Number((26 + pseudo * 0.7).toFixed(1)));
      }
    }

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any[]) => {
          return `${params[0].name}<br/>${params
            .map((p) => `${p.marker} ${p.seriesName}: <b>${p.value} 分钟</b>`)
            .join('<br/>')}`;
        },
      },
      legend: {
        right: 12,
        top: 0,
        textStyle: { fontSize: 12, color: '#64748B' },
      },
      grid: { top: 36, left: '2%', right: '3%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: categories,
        axisLine: { lineStyle: { color: '#CBD5E1' } },
        axisLabel: {
          color: '#475569',
          fontSize: effectiveTimeRange === 'today' ? 10 : 11,
          interval: effectiveTimeRange === 'today' ? 0 : categories.length > 20 ? 1 : 0,
        },
      },
      yAxis: {
        type: 'value',
        name: '平均单次时长 (分钟)',
        nameTextStyle: { color: '#94A3B8', fontSize: 11 },
        splitLine: { lineStyle: { type: 'dashed', color: '#F1F5F9' } },
        axisLabel: { color: '#64748B', fontSize: 11 },
      },
      series: [
        {
          name: '企业用户',
          type: 'line',
          smooth: false,
          data: companyData,
          itemStyle: { color: '#2563EB' },
          lineStyle: { width: 2.5 },
        },
        {
          name: '个人用户',
          type: 'line',
          smooth: false,
          data: individualData,
          itemStyle: { color: '#06B6D4' },
          lineStyle: { width: 2.5 },
        },
      ],
    };
  }, [effectiveTimeRange, customDays, effectiveStartDate]);

  return (
    <div className="space-y-4">
      {/* 顶部统计周期工具栏 */}
      <div className="bg-white rounded-md border border-slate-200/90 shadow-xs px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-3.5 bg-blue-600 rounded-xs" />
          <span className="text-xs font-bold text-slate-800">
            {activeTab === 'feedback' ? '服务反馈与投诉监测' : '平台使用活跃情况'}
          </span>
        </div>

        {/* 右上角统一时间选择Tab与自选时间段 */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">统计周期:</span>
          <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium text-slate-600 shadow-2xs">
            <button
              type="button"
              id="btn-service-time-today"
              onClick={() => handleTimeRangeChange('today')}
              className={`px-3 py-1 rounded transition-all cursor-pointer ${
                effectiveTimeRange === 'today'
                  ? 'bg-white font-semibold text-blue-600 shadow-2xs'
                  : 'hover:text-slate-900 text-slate-600'
              }`}
            >
              当日
            </button>
            <button
              type="button"
              id="btn-service-time-week"
              onClick={() => handleTimeRangeChange('week')}
              className={`px-3 py-1 rounded transition-all cursor-pointer ${
                effectiveTimeRange === 'week'
                  ? 'bg-white font-semibold text-blue-600 shadow-2xs'
                  : 'hover:text-slate-900 text-slate-600'
              }`}
            >
              近一周
            </button>
            <button
              type="button"
              id="btn-service-time-month"
              onClick={() => handleTimeRangeChange('month')}
              className={`px-3 py-1 rounded transition-all cursor-pointer ${
                effectiveTimeRange === 'month'
                  ? 'bg-white font-semibold text-blue-600 shadow-2xs'
                  : 'hover:text-slate-900 text-slate-600'
              }`}
            >
              近一月
            </button>
            <button
              type="button"
              id="btn-service-time-year"
              onClick={() => handleTimeRangeChange('year')}
              className={`px-3 py-1 rounded transition-all cursor-pointer ${
                effectiveTimeRange === 'year'
                  ? 'bg-white font-semibold text-blue-600 shadow-2xs'
                  : 'hover:text-slate-900 text-slate-600'
              }`}
            >
              近一年
            </button>
          </div>

          {/* 时间选择框：开始时间 - 结束时间（自选时间段） */}
          <div
            className={`flex items-center bg-white border ${
              effectiveTimeRange === 'custom'
                ? 'border-blue-500 ring-2 ring-blue-400/30 shadow-xs'
                : 'border-slate-200'
            } rounded px-2.5 py-1 text-xs text-slate-700 hover:border-slate-300 focus-within:ring-2 focus-within:ring-blue-500 transition-all`}
            title="选择开始与结束时间，自动生效自选时间段"
          >
            <Calendar
              className={`w-3.5 h-3.5 mr-1.5 shrink-0 ${
                effectiveTimeRange === 'custom' ? 'text-blue-600' : 'text-slate-400'
              }`}
            />
            <input
              type="date"
              value={effectiveStartDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className={`border-none bg-transparent p-0 text-xs focus:outline-none cursor-pointer w-[105px] ${
                effectiveTimeRange === 'custom' ? 'text-blue-900 font-medium' : 'text-slate-700'
              }`}
              title="开始时间"
            />
            <span className="text-slate-400 mx-1 font-medium">-</span>
            <input
              type="date"
              value={effectiveEndDate}
              onChange={(e) => handleEndDateChange(e.target.value)}
              className={`border-none bg-transparent p-0 text-xs focus:outline-none cursor-pointer w-[105px] ${
                effectiveTimeRange === 'custom' ? 'text-blue-900 font-medium' : 'text-slate-700'
              }`}
              title="结束时间"
            />
          </div>
        </div>
      </div>

      {/* ======================= Tab 1: 反馈与投诉 ======================= */}
      {activeTab === 'feedback' && (
        <div className="space-y-4">
          {/* 指标卡区域：累计卡片放在最左边，新增卡片放在右边 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 最左边：累计卡片 */}
            <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-medium text-xs text-slate-700 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  累计反馈与投诉总量
                </span>
                <span className="text-[11px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60">
                  全平台历史累计
                </span>
              </div>
              <div className="py-2.5">
                <div className="text-2xl font-bold text-slate-900 tracking-tight">
                  {feedbackVolumeData.totalCumulative.toLocaleString()}
                  <span className="text-xs font-normal text-slate-500 ml-1">件</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  展示平台历史接收并归集的需求端功能意见、服务工单与投诉总量
                </div>
              </div>
            </div>

            {/* 最右边：周期新增反馈/投诉量 (由右上角统一时间Tab控制) */}
            <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-medium text-xs text-slate-700 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  周期新增反馈与投诉量
                </span>
                <span className="text-[11px] text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                  {feedbackVolumeData.label}
                </span>
              </div>
              <div className="py-2.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900 tracking-tight">
                    {feedbackVolumeData.currentCount}
                  </span>
                  <span className="text-xs text-slate-500">件</span>
                  <span className="text-xs text-emerald-600 font-medium ml-2">
                    同比 {feedbackVolumeData.currentRate}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  展示当前筛选周期（{effectiveTimeRange === 'custom' ? `${effectiveStartDate} 至 ${effectiveEndDate}` : feedbackVolumeData.label}）内新增归集的服务反馈总数
                </div>
              </div>
            </div>
          </div>

          {/* 下方筛选区域 */}
          <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">需求方类型:</span>
                <div className="inline-flex rounded border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium text-slate-600">
                  <button
                    type="button"
                    onClick={() => setFeedbackCustType('全部')}
                    className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                      feedbackCustType === '全部' ? 'bg-white font-semibold text-blue-600 shadow-2xs' : ''
                    }`}
                  >
                    全部
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackCustType('企业')}
                    className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                      feedbackCustType === '企业' ? 'bg-white font-semibold text-blue-600 shadow-2xs' : ''
                    }`}
                  >
                    企业 (B端)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackCustType('个人用户')}
                    className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                      feedbackCustType === '个人用户' ? 'bg-white font-semibold text-blue-600 shadow-2xs' : ''
                    }`}
                  >
                    个人用户 (C端)
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">产品类别:</span>
                <select
                  value={feedbackCategory}
                  onChange={(e) => setFeedbackCategory(e.target.value)}
                  className="h-7 px-2 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:border-blue-500 focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="全部">全部七类产品</option>
                  {FIXED_PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-xs text-slate-400">
              数据来源于用户服务工单通道与意见箱
            </div>
          </div>

          {/* 柱状图展示不同产品类别的反馈/投诉数量及构成 */}
          <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3 bg-blue-600 rounded-xs" />
                <span className="text-xs font-bold text-slate-800 tracking-wide">
                  各产品类别反馈/投诉量分布
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                展示企业与个人用户分布构成
              </span>
            </div>
            <div className="h-[280px] w-full">
              <EChartWrapper option={feedbackBarOption} height="100%" />
            </div>
          </div>

          {/* 简洁明细列表 (严格遵照要求：展示反馈编号、提交时间、需求方名称、需求方类型、关联产品/类别、反馈简述，不生成多余未要求字段) */}
          <div className="bg-white rounded-md border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3 bg-blue-600 rounded-xs" />
                <span className="text-xs font-bold text-slate-800">
                  反馈明细记录
                </span>
              </div>
              <span className="text-xs text-slate-400">
                共 {filteredFeedbacks.length} 条记录
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/80">
                  <tr>
                    <th className="py-2.5 px-3.5 w-36">反馈编号</th>
                    <th className="py-2.5 px-3.5 w-40">提交时间</th>
                    <th className="py-2.5 px-3.5 w-52">需求方名称</th>
                    <th className="py-2.5 px-3.5 w-24">需求方类型</th>
                    <th className="py-2.5 px-3.5 w-56">关联产品 / 类别</th>
                    <th className="py-2.5 px-3.5">反馈简述</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFeedbacks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        未匹配到反馈明细
                      </td>
                    </tr>
                  ) : (
                    filteredFeedbacks.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3.5 font-mono text-[11px] font-semibold text-slate-800 whitespace-nowrap">
                          {item.id}
                        </td>
                        <td className="py-2.5 px-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {item.submitTime}
                        </td>
                        <td className="py-2.5 px-3.5 font-medium text-slate-900">
                          {item.customerName}
                        </td>
                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium ${
                              item.customerType === '企业'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                            }`}
                          >
                            {item.customerType}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className="px-1.5 py-0.2 rounded text-[10px] font-medium text-white"
                              style={{ backgroundColor: CATEGORY_COLORS[item.category] || '#2563EB' }}
                            >
                              {item.category}
                            </span>
                            <span className="text-slate-800 text-[11px] truncate max-w-[180px]" title={item.productName}>
                              {item.productName}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-600 leading-relaxed">
                          {item.content}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================= Tab 2: 平台使用情况 ======================= */}
      {activeTab === 'usage' && (
        <div className="space-y-4">
          {/* 两个指标卡：企业用户与个人用户平均单次使用时长 (由右上角统一时间Tab控制) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 卡片 1 (左): 企业用户平均单次平台使用时长 */}
            <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-medium text-xs text-slate-700 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  企业用户平均单次平台使用时长
                </span>
                <span className="text-[11px] text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                  {effectiveTimeRange === 'today'
                    ? '当日实时'
                    : effectiveTimeRange === 'week'
                    ? '近一周'
                    : effectiveTimeRange === 'month'
                    ? '近一月'
                    : effectiveTimeRange === 'year'
                    ? '近一年'
                    : `自选(${customDays}天)`}
                </span>
              </div>
              <div className="py-2.5">
                <div className="text-2xl font-bold text-slate-900 tracking-tight">
                  {usageStats.company}
                  <span className="text-xs font-normal text-slate-500 ml-1">分钟/次</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  展示企业账号登录后在算力调配、报表核对与订单管理界面的平均操作停留时长
                </div>
              </div>
            </div>

            {/* 卡片 2 (右): 个人用户平均单次平台使用时长 */}
            <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-medium text-xs text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-600" />
                  个人用户平均单次平台使用时长
                </span>
                <span className="text-[11px] text-cyan-600 font-medium bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-100">
                  {effectiveTimeRange === 'today'
                    ? '当日实时'
                    : effectiveTimeRange === 'week'
                    ? '近一周'
                    : effectiveTimeRange === 'month'
                    ? '近一月'
                    : effectiveTimeRange === 'year'
                    ? '近一年'
                    : `自选(${customDays}天)`}
                </span>
              </div>
              <div className="py-2.5">
                <div className="text-2xl font-bold text-slate-900 tracking-tight">
                  {usageStats.individual}
                  <span className="text-xs font-normal text-slate-500 ml-1">分钟/次</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  展示个人开发者与创作者在API调试、算力体验等界面的平均操作停留时长
                </div>
              </div>
            </div>
          </div>

          {/* 趋势折线图 */}
          <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3 bg-blue-600 rounded-xs" />
                <span className="text-xs font-bold text-slate-800 tracking-wide">
                  平台平均使用时长趋势
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                单位: 分钟/次 (区分企业与个人)
              </span>
            </div>
            {isOverLimit ? (
              <div className="h-[280px] w-full flex flex-col items-center justify-center bg-slate-50/70 rounded border border-dashed border-slate-200 text-slate-500">
                <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
                <p className="text-xs font-semibold text-slate-700">自选时间段跨度超过 30 天</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  为保障图表展示清晰度，日级趋势折线图仅支持展示 30 天以内的数据，请缩短筛选区间
                </p>
              </div>
            ) : (
              <div className="h-[280px] w-full">
                <EChartWrapper option={usageTrendOption} height="100%" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
