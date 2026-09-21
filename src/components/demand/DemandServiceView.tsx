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
} from 'lucide-react';
import { EChartWrapper } from '../EChartWrapper';
import {
  ALL_DEMAND_FEEDBACKS,
  DemandFeedbackRecord,
  FIXED_PRODUCT_CATEGORIES,
  FixedProductCategory,
} from '../../data/demandMockData';
import { CATEGORY_COLORS } from '../../data/supplierProductsMockData';

interface DemandServiceViewProps {
  activeTab?: 'feedback' | 'usage';
  onActiveTabChange?: (tab: 'feedback' | 'usage') => void;
}

export const DemandServiceView: React.FC<DemandServiceViewProps> = ({
  activeTab: controlledTab,
  onActiveTabChange,
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
  // 1. 反馈与投诉部分状态与逻辑 (统一时间Tab，包含当日)
  // =========================================================================
  // 统一时间Tab: 当日 | 近一周 | 近一月 | 近一年
  const [serviceTimeRange, setServiceTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('year');

  const feedbackVolumeData = {
    totalCumulative: 1248,
    today: { count: 2, rate: '-12.5%', label: '当日新增' },
    week: { count: 18, rate: '-10.0%', label: '近一周新增' },
    month: { count: 76, rate: '-6.2%', label: '近一月新增' },
    year: { count: 342, rate: '-14.5%', label: '近一年新增' },
  };

  // 下方筛选条件
  const [feedbackCustType, setFeedbackCustType] = useState<'全部' | '企业' | '个人用户'>('全部');
  const [feedbackCategory, setFeedbackCategory] = useState<string>('全部');

  // 柱状图展示不同类别的反馈/投诉数量及企业和个人用户构成
  const feedbackBarOption = useMemo(() => {
    const categories =
      feedbackCategory === '全部' ? FIXED_PRODUCT_CATEGORIES : [feedbackCategory as FixedProductCategory];

    // 针对每个类别构造企业与个人用户的反馈数量，按时间周期动态适配
    const countMultipliers =
      serviceTimeRange === 'today' ? 0.12 : serviceTimeRange === 'week' ? 1 : serviceTimeRange === 'month' ? 4.2 : 19;
    const baseCompany = [6, 4, 3, 2, 2, 1, 1];
    const baseIndividual = [4, 5, 2, 1, 3, 0, 1];

    const companyCounts = baseCompany.map((v) => Math.max(Math.round(v * countMultipliers), 0));
    const individualCounts = baseIndividual.map((v) => Math.max(Math.round(v * countMultipliers), 0));
    if (serviceTimeRange === 'today') {
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
  }, [feedbackCategory, feedbackCustType, serviceTimeRange]);

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
  const usageStats = {
    today: { company: '44.8', individual: '29.2', unit: '分钟/次' },
    week: { company: '42.5', individual: '28.4', unit: '分钟/次' },
    month: { company: '38.6', individual: '26.1', unit: '分钟/次' },
    year: { company: '35.2', individual: '24.8', unit: '分钟/次' },
  }[serviceTimeRange];

  // 演示趋势折线图
  const usageTrendOption = useMemo(() => {
    let categories: string[] = [];
    let companyData: number[] = [];
    let individualData: number[] = [];

    if (serviceTimeRange === 'today') {
      categories = ['02:00', '06:00', '10:00', '14:00', '18:00', '22:00'];
      companyData = [36.0, 39.5, 46.2, 48.0, 47.5, 42.0];
      individualData = [23.5, 26.0, 29.8, 31.0, 30.5, 28.0];
    } else if (serviceTimeRange === 'week') {
      categories = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
      companyData = [38.2, 41.5, 45.0, 44.2, 46.8, 36.5, 35.0];
      individualData = [25.0, 27.2, 28.5, 29.0, 30.5, 32.0, 31.5];
    } else if (serviceTimeRange === 'month') {
      categories = ['第1周', '第2周', '第3周', '第4周'];
      companyData = [36.5, 38.2, 40.1, 39.5];
      individualData = [24.5, 25.8, 27.0, 26.8];
    } else {
      categories = ['2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08'];
      companyData = [32.0, 33.5, 34.8, 36.2, 37.5, 38.6];
      individualData = [22.0, 23.1, 24.2, 25.0, 26.0, 26.5];
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
        axisLabel: { color: '#475569', fontSize: 11 },
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
          lineStyle: { width: 3 },
        },
        {
          name: '个人用户',
          type: 'line',
          smooth: false,
          data: individualData,
          itemStyle: { color: '#06B6D4' },
          lineStyle: { width: 3 },
        },
      ],
    };
  }, [serviceTimeRange]);

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

        {/* 右上角统一时间选择Tab (包含当日) */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">统计周期:</span>
          <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium text-slate-600 shadow-2xs">
            <button
              type="button"
              id="btn-service-time-today"
              onClick={() => setServiceTimeRange('today')}
              className={`px-3 py-1 rounded transition-all cursor-pointer ${
                serviceTimeRange === 'today'
                  ? 'bg-white font-semibold text-blue-600 shadow-2xs'
                  : 'hover:text-slate-900 text-slate-600'
              }`}
            >
              当日
            </button>
            <button
              type="button"
              id="btn-service-time-week"
              onClick={() => setServiceTimeRange('week')}
              className={`px-3 py-1 rounded transition-all cursor-pointer ${
                serviceTimeRange === 'week'
                  ? 'bg-white font-semibold text-blue-600 shadow-2xs'
                  : 'hover:text-slate-900 text-slate-600'
              }`}
            >
              近一周
            </button>
            <button
              type="button"
              id="btn-service-time-month"
              onClick={() => setServiceTimeRange('month')}
              className={`px-3 py-1 rounded transition-all cursor-pointer ${
                serviceTimeRange === 'month'
                  ? 'bg-white font-semibold text-blue-600 shadow-2xs'
                  : 'hover:text-slate-900 text-slate-600'
              }`}
            >
              近一月
            </button>
            <button
              type="button"
              id="btn-service-time-year"
              onClick={() => setServiceTimeRange('year')}
              className={`px-3 py-1 rounded transition-all cursor-pointer ${
                serviceTimeRange === 'year'
                  ? 'bg-white font-semibold text-blue-600 shadow-2xs'
                  : 'hover:text-slate-900 text-slate-600'
              }`}
            >
              近一年
            </button>
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
                  {feedbackVolumeData[serviceTimeRange].label}
                </span>
              </div>
              <div className="py-2.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900 tracking-tight">
                    {feedbackVolumeData[serviceTimeRange].count}
                  </span>
                  <span className="text-xs text-slate-500">件</span>
                  <span className="text-xs text-emerald-600 font-medium ml-2">
                    同比 {feedbackVolumeData[serviceTimeRange].rate}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  展示当前筛选周期（{feedbackVolumeData[serviceTimeRange].label}）内新增归集的服务反馈总数
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
                  {serviceTimeRange === 'today' ? '当日实时' : serviceTimeRange === 'week' ? '近一周' : serviceTimeRange === 'month' ? '近一月' : '近一年'}
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
                  {serviceTimeRange === 'today' ? '当日实时' : serviceTimeRange === 'week' ? '近一周' : serviceTimeRange === 'month' ? '近一月' : '近一年'}
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
            <div className="h-[280px] w-full">
              <EChartWrapper option={usageTrendOption} height="100%" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
