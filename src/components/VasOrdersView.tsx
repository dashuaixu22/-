import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
  AlertCircle,
  X,
} from 'lucide-react';
import { TimeRangeType } from '../types';
import { EChartWrapper } from './EChartWrapper';
import {
  VAS_ORDER_TOTAL_STATIC_COUNT,
  VAS_ORDER_BY_SERVICE_TYPE_STATIC,
  VAS_ORDER_BY_SUPPLIER_TYPE_STATIC,
  VAS_ORDER_NEW_BY_RANGE,
} from '../data/vasMockData';
import { TODAY } from '../data/mockData';
import * as echarts from 'echarts';

interface VasOrdersViewProps {
  timeRange?: TimeRangeType;
}

export const VasOrdersView: React.FC<VasOrdersViewProps> = () => {
  // 第一行分类 Tab 切换: 'vas_service' | 'supplier_service'
  const [activeCategoryTab, setActiveCategoryTab] = useState<'vas_service' | 'supplier_service'>('vas_service');

  // 第二行专属时间周期与自选时间段（由 header 移动到增值服务新增订单分析模块）
  const [localTimeRange, setLocalTimeRange] = useState<TimeRangeType>('year');
  const [localStartDate, setLocalStartDate] = useState<string>('2025-08-28');
  const [localEndDate, setLocalEndDate] = useState<string>(TODAY);
  const [dateWarning, setDateWarning] = useState<string | null>(null);

  // 第一行静态数据（不随时间切换）
  const staticCategoryList = activeCategoryTab === 'vas_service'
    ? VAS_ORDER_BY_SERVICE_TYPE_STATIC
    : VAS_ORDER_BY_SUPPLIER_TYPE_STATIC;

  // 第二行新增数据（随 localTimeRange 切换）
  const currentNewMetrics = VAS_ORDER_NEW_BY_RANGE[localTimeRange] || VAS_ORDER_NEW_BY_RANGE.month;

  const timeRangeLabel = localTimeRange === 'year' ? '近一年' : localTimeRange === 'month' ? '近一月' : '近一周';

  // 快捷 Tab 切换
  const handleRangeClick = (range: TimeRangeType) => {
    setLocalTimeRange(range);
    setDateWarning(null);
    if (range === 'year') {
      setLocalStartDate('2025-08-28');
      setLocalEndDate(TODAY);
    } else if (range === 'month') {
      setLocalStartDate('2026-07-28');
      setLocalEndDate(TODAY);
    } else if (range === 'week') {
      setLocalStartDate('2026-08-21');
      setLocalEndDate(TODAY);
    }
  };

  const handleStartDateChange = (val: string) => {
    if (val > TODAY) {
      setDateWarning('开始时间不能超过今日 (2026-08-28)');
      return;
    }
    setDateWarning(null);
    setLocalStartDate(val);
  };

  const handleEndDateChange = (val: string) => {
    if (val > TODAY) {
      setDateWarning('结束时间不能超过今日 (2026-08-28)');
      return;
    }
    setDateWarning(null);
    setLocalEndDate(val);
  };

  // 柱状图配置
  const barChartOption: echarts.EChartsOption = useMemo(() => {
    const data = currentNewMetrics.barData;
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
          shadowStyle: { color: 'rgba(59, 130, 246, 0.08)' },
        },
        formatter: (params: any) => {
          const item = Array.isArray(params) ? params[0] : params;
          return `
            <div style="font-size: 12px; font-weight: 600; color: #1e293b; margin-bottom: 4px;">
              ${item.name}
            </div>
            <div style="font-size: 12px; color: #475569; display: flex; justify-content: space-between; gap: 16px;">
              <span>${timeRangeLabel}新增订单:</span>
              <strong style="color: #2563eb;">${Number(item.value).toLocaleString()} 笔</strong>
            </div>
          `;
        },
      },
      grid: {
        top: 24,
        right: 16,
        bottom: 50,
        left: 50,
      },
      xAxis: {
        type: 'category',
        data: data.map((d) => d.name),
        axisLine: { lineStyle: { color: '#E2E8F0' } },
        axisTick: { show: false },
        axisLabel: {
          color: '#64748B',
          fontSize: 10.5,
          interval: 0,
          rotate: 22,
        },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#F1F5F9' } },
        axisLabel: {
          color: '#94A3B8',
          fontSize: 10,
          formatter: '{value} 笔',
        },
      },
      series: [
        {
          name: '新增订单数',
          type: 'bar',
          barWidth: '38%',
          data: data.map((d) => d.value),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#3B82F6' },
              { offset: 1, color: '#93C5FD' },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
          label: {
            show: true,
            position: 'top',
            color: '#64748B',
            fontSize: 10,
            formatter: '{c}',
          },
        },
      ],
    };
  }, [currentNewMetrics, timeRangeLabel]);

  // 环形图配置
  const pieChartOption: echarts.EChartsOption = useMemo(() => {
    const data = currentNewMetrics.pieData;
    const colors = [
      '#3B82F6', '#06B6D4', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#6366F1', '#14B8A6', '#F97316', '#64748B'
    ];
    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `
            <div style="font-size: 12px; font-weight: 600; color: #1e293b; margin-bottom: 4px;">
              ${params.name}
            </div>
            <div style="font-size: 12px; color: #475569; display: flex; justify-content: space-between; gap: 16px;">
              <span>新增订单:</span>
              <strong style="color: #2563eb;">${params.value.toLocaleString()} 笔 (${params.percent}%)</strong>
            </div>
          `;
        },
      },
      legend: {
        orient: 'vertical',
        right: 8,
        top: 'middle',
        itemWidth: 8,
        itemHeight: 8,
        icon: 'circle',
        textStyle: {
          fontSize: 11,
          color: '#475569',
        },
        itemGap: 6,
        formatter: (name: string) => {
          const item = data.find((d) => d.name === name);
          return `${name.length > 5 ? name.slice(0, 5) + '..' : name}  ${item ? item.value : 0}`;
        },
      },
      series: [
        {
          name: '增值服务新增构成',
          type: 'pie',
          radius: ['45%', '72%'],
          center: ['36%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 3,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 12,
              fontWeight: 'bold',
              formatter: '{b}\n{d}%',
            },
          },
          data: data.map((d, index) => ({
            name: d.name,
            value: d.value,
            itemStyle: { color: colors[index % colors.length] },
          })),
        },
      ],
    };
  }, [currentNewMetrics]);

  return (
    <div className="space-y-4">
      {/* ========================================================================= */}
      {/* 第一行：总数卡片 + 分类总数 (静态指标) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-md border border-slate-200/80 shadow-xs p-4 transition-all">
        {/* 行头部与 Tab 切换 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-blue-600 rounded-xs" />
            <h2 className="text-xs font-semibold text-slate-800 tracking-wide">
              增值服务订单总览
            </h2>
          </div>

          {/* 分类维度切换 Tab */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200/80 text-xs">
            <button
              type="button"
              onClick={() => setActiveCategoryTab('vas_service')}
              className={`px-3 py-1 font-medium rounded transition-all cursor-pointer ${
                activeCategoryTab === 'vas_service'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              按增值服务类型分类
            </button>
            <button
              type="button"
              onClick={() => setActiveCategoryTab('supplier_service')}
              className={`px-3 py-1 font-medium rounded transition-all cursor-pointer ${
                activeCategoryTab === 'supplier_service'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              按供应商类型分类
            </button>
          </div>
        </div>

        {/* 第一行主体布局：左侧总数卡片 + 右侧各项分类总数网格 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* 左侧：增值服务订单总数卡片 (占 3 列) - 无多余描述/履约有效率 */}
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-md p-4 flex flex-col justify-center">
            <div className="text-xs text-slate-500 mb-1.5">
              <span className="font-medium text-slate-600">增值服务订单总数</span>
            </div>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
                {VAS_ORDER_TOTAL_STATIC_COUNT.toLocaleString()}
              </span>
              <span className="text-xs font-medium text-slate-500">笔</span>
            </div>
          </div>

          {/* 右侧：分类各项总数卡片网格 (占 9 列) */}
          <div className="lg:col-span-9 flex flex-col justify-center">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {staticCategoryList.map((item, idx) => (
                <div
                  key={item.name}
                  className="bg-slate-50/80 hover:bg-blue-50/40 border border-slate-200/70 hover:border-blue-200/80 rounded p-2.5 transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[11px] font-medium text-slate-600 group-hover:text-blue-700 truncate" title={item.name}>
                      {item.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      #{idx + 1}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-auto">
                    <span className="text-sm font-bold font-mono text-slate-800 group-hover:text-blue-600">
                      {item.count.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 bg-white px-1 py-0.2 rounded border border-slate-100">
                      {item.ratio}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 第二行：新增订单数 + 增值服务类型新增数 + 柱状图 + 环形图 (包含内部时间周期选择器) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-md border border-slate-200/80 shadow-xs p-4">
        {/* 行头部：包含标题以及迁移过来的 近一年/近一月/近一周 和自选时间段 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-blue-600 rounded-xs" />
            <h2 className="text-xs font-semibold text-slate-800 tracking-wide">
              增值服务新增订单分析
            </h2>
          </div>

          {/* 右侧：Tab选择 (近一年、近一月、近一周) + 时间选择框 (开始时间 - 结束时间) */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Tab选择 */}
            <div
              id="vas-new-time-tabs"
              className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium text-slate-600"
            >
              <button
                type="button"
                id="vas-tab-range-year"
                onClick={() => handleRangeClick('year')}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  localTimeRange === 'year'
                    ? 'bg-white text-blue-600 font-semibold shadow-xs'
                    : 'hover:text-slate-900 text-slate-600'
                }`}
              >
                近一年
              </button>
              <button
                type="button"
                id="vas-tab-range-month"
                onClick={() => handleRangeClick('month')}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  localTimeRange === 'month'
                    ? 'bg-white text-blue-600 font-semibold shadow-xs'
                    : 'hover:text-slate-900 text-slate-600'
                }`}
              >
                近一月
              </button>
              <button
                type="button"
                id="vas-tab-range-week"
                onClick={() => handleRangeClick('week')}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  localTimeRange === 'week'
                    ? 'bg-white text-blue-600 font-semibold shadow-xs'
                    : 'hover:text-slate-900 text-slate-600'
                }`}
              >
                近一周
              </button>
            </div>

            {/* 时间选择框：开始时间 - 结束时间 */}
            <div
              id="vas-date-picker"
              className={`flex items-center bg-white border ${
                dateWarning ? 'border-amber-400 ring-1 ring-amber-300' : 'border-slate-200'
              } rounded-md px-2.5 py-1 text-xs text-slate-700 hover:border-slate-300 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all shadow-xs`}
            >
              <input
                type="date"
                id="vas-date-picker-start"
                value={localStartDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="border-none bg-transparent p-0 text-xs text-slate-700 focus:outline-none cursor-pointer w-[110px]"
                title="开始时间"
              />
              <span className="text-slate-400 mx-1 font-medium">-</span>
              <input
                type="date"
                id="vas-date-picker-end"
                value={localEndDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="border-none bg-transparent p-0 text-xs text-slate-700 focus:outline-none cursor-pointer w-[110px]"
                title="结束时间"
              />
            </div>
          </div>
        </div>

        {/* 超过今日提醒横幅 */}
        {dateWarning && (
          <div
            id="vas-date-warning-banner"
            className="mb-3 bg-amber-50 border border-amber-200 rounded px-3 py-1.5 flex items-center justify-between text-xs text-amber-800"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{dateWarning}</span>
            </div>
            <button
              type="button"
              onClick={() => setDateWarning(null)}
              className="p-0.5 rounded text-amber-600 hover:bg-amber-100 hover:text-amber-900 cursor-pointer"
              title="关闭提示"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 顶部新增卡片行：左侧新增总数 (无绿色/无填充色) + 右侧各增值服务类型新增数 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch mb-4">
          {/* 左侧：新增订单总数卡片 (无背景填充色，标准白色卡片) */}
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-md p-4 flex flex-col justify-center">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span className="font-medium text-slate-600">{timeRangeLabel}新增订单总数</span>
                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-700 rounded flex items-center gap-0.5 border border-slate-200/60">
                  <TrendingUp className="w-3 h-3 text-blue-600" />
                  环比 +{currentNewMetrics.momRate}
                </span>
              </div>
              <div className="flex items-baseline gap-1 my-1">
                <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
                  {currentNewMetrics.totalNewCount.toLocaleString()}
                </span>
                <span className="text-xs font-medium text-slate-500">笔</span>
              </div>
            </div>
          </div>

          {/* 右侧：每个增值服务类型的新增数 (占 9 列) */}
          <div className="lg:col-span-9 bg-slate-50/60 border border-slate-200/70 rounded-md p-3 flex flex-col justify-center">
            <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center justify-between">
              <span>各增值服务类型新增明细</span>
              <span className="text-[11px] font-normal text-slate-400">
                10 项增值服务类别
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {currentNewMetrics.categoryBreakdown.map((cat) => (
                <div
                  key={cat.name}
                  className="bg-white border border-slate-200/80 rounded p-2 flex flex-col justify-between hover:shadow-2xs transition-shadow"
                >
                  <span className="text-[11px] text-slate-600 truncate font-medium" title={cat.name}>
                    {cat.name}
                  </span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xs font-bold font-mono text-slate-800">
                      +{cat.count}
                    </span>
                    <span className="text-[10px] text-blue-600 font-medium">
                      {cat.ratio}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 下方图表区：柱状图 (7列) + 环形图 (5列) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* 柱状图：各增值服务类型新增分布对比 */}
          <div className="lg:col-span-7 bg-slate-50/40 border border-slate-200/80 rounded-md p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                <h3 className="text-xs font-semibold text-slate-800">
                  增值服务类型新增订单对比柱状图
                </h3>
              </div>
              <span className="text-[10px] text-slate-400">单位：笔</span>
            </div>
            <div className="h-60">
              <EChartWrapper option={barChartOption} height="100%" />
            </div>
          </div>

          {/* 环形图：新增订单构成与占比 */}
          <div className="lg:col-span-5 bg-slate-50/40 border border-slate-200/80 rounded-md p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <PieChartIcon className="w-3.5 h-3.5 text-cyan-600" />
                <h3 className="text-xs font-semibold text-slate-800">
                  增值服务类型新增占比环形图
                </h3>
              </div>
              <span className="text-[10px] text-slate-400">
                总新增: {currentNewMetrics.totalNewCount.toLocaleString()} 笔
              </span>
            </div>
            <div className="h-60">
              <EChartWrapper option={pieChartOption} height="100%" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
