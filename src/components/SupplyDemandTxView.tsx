import React, { useState, useMemo } from 'react';
import { TimeRangeType } from '../types';
import { EChartWrapper } from './EChartWrapper';
import {
  SUPPLY_DEMAND_TX_DATA,
  BASIC_SERVICE_COLORS,
} from '../data/overviewMockData';
import * as echarts from 'echarts';
import { BarChart3, PieChart as PieChartIcon, Percent } from 'lucide-react';

interface SupplyDemandTxViewProps {
  timeRange: TimeRangeType;
}

export const SupplyDemandTxView: React.FC<SupplyDemandTxViewProps> = ({ timeRange }) => {
  const data = SUPPLY_DEMAND_TX_DATA[timeRange] || SUPPLY_DEMAND_TX_DATA.month;
  const timeLabel =
    timeRange === 'year'
      ? '近一年'
      : timeRange === 'month'
      ? '近一月'
      : timeRange === 'today'
      ? '当日'
      : '近一周';

  // 基础服务类别交易金额分析模式：'new' (新增金额) | 'total' (累计金额)
  const [txAmountMode, setTxAmountMode] = useState<'new' | 'total'>('new');

  // 佣金与佣金率分析模式：'new' (新增佣金) | 'total' (累计佣金)
  const [commissionMode, setCommissionMode] = useState<'new' | 'total'>('new');

  // =========================================================================
  // Tab 1 图表配置：交易金额
  // =========================================================================
  // 左侧：横向柱状图 (类别比较)
  const horizontalBarOption: echarts.EChartsOption = useMemo(() => {
    const isNew = txAmountMode === 'new';
    const categories = [...data.categories].reverse(); // 自下而上显示
    const yNames = categories.map((c) => c.name);
    const xValues = categories.map((c) => (isNew ? c.newAmount : c.totalAmount));

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const item = Array.isArray(params) ? params[0] : params;
          return `
            <div style="font-size: 12px; font-weight: 600; color: #1e293b; margin-bottom: 4px;">
              ${item.name}
            </div>
            <div style="font-size: 12px; color: #475569; display: flex; justify-content: space-between; gap: 16px;">
              <span>${isNew ? timeLabel + '新增交易金额' : '累计交易金额'}:</span>
              <strong style="color: #1D4ED8;">${Number(item.value).toLocaleString()} 万元</strong>
            </div>
          `;
        },
      },
      grid: {
        top: 15,
        right: 60,
        bottom: 25,
        left: 140,
      },
      xAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#F1F5F9' } },
        axisLabel: {
          color: '#94A3B8',
          fontSize: 11,
          formatter: '{value} 万',
        },
      },
      yAxis: {
        type: 'category',
        data: yNames,
        axisLine: { lineStyle: { color: '#E2E8F0' } },
        axisTick: { show: false },
        axisLabel: {
          color: '#475569',
          fontSize: 12,
        },
      },
      series: [
        {
          name: isNew ? '新增金额' : '累计金额',
          type: 'bar',
          barWidth: 18,
          data: categories.map((c) => ({
            value: isNew ? c.newAmount : c.totalAmount,
            itemStyle: {
              color: BASIC_SERVICE_COLORS[c.name] || '#2563EB',
              borderRadius: [0, 4, 4, 0],
            },
          })),
          label: {
            show: true,
            position: 'right',
            color: '#64748B',
            fontSize: 11,
            formatter: (p: any) => `${Number(p.value).toLocaleString()} 万`,
          },
        },
      ],
    };
  }, [data, txAmountMode, timeLabel]);

  // 右侧：环形图 (金额构成)
  const pieOption: echarts.EChartsOption = useMemo(() => {
    const isNew = txAmountMode === 'new';
    const pieData = data.categories.map((c) => ({
      name: c.name,
      value: isNew ? c.newAmount : c.totalAmount,
      itemStyle: { color: BASIC_SERVICE_COLORS[c.name] || '#2563EB' },
    }));

    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `
            <div style="font-size: 12px; font-weight: 600; color: #1e293b; margin-bottom: 4px;">
              ${params.name}
            </div>
            <div style="font-size: 12px; color: #475569; display: flex; justify-content: space-between; gap: 16px;">
              <span>${isNew ? timeLabel + '新增金额' : '累计金额'}:</span>
              <strong style="color: #1D4ED8;">${Number(params.value).toLocaleString()} 万元 (${params.percent}%)</strong>
            </div>
          `;
        },
      },
      legend: {
        orient: 'vertical',
        right: 16,
        top: 'middle',
        itemWidth: 10,
        itemHeight: 10,
        icon: 'circle',
        textStyle: { fontSize: 12, color: '#475569' },
        itemGap: 12,
        formatter: (name: string) => {
          const item = data.categories.find((c) => c.name === name);
          const val = item ? (isNew ? item.newAmount : item.totalAmount) : 0;
          return `${name.length > 8 ? name.slice(0, 8) + '..' : name}  ${val.toLocaleString()} 万`;
        },
      },
      series: [
        {
          name: '交易金额构成',
          type: 'pie',
          radius: ['45%', '72%'],
          center: ['34%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 3,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: { show: false },
          emphasis: {
            label: {
              show: true,
              fontSize: 13,
              fontWeight: 'bold',
              formatter: '{b}\n{d}%',
            },
          },
          data: pieData,
        },
      ],
    };
  }, [data, txAmountMode, timeLabel]);

  // =========================================================================
  // Tab 2 图表配置：佣金与佣金率 (不要将金额和百分比放在同一个坐标轴中)
  // =========================================================================
  // 左侧：佣金金额柱状图
  const commissionBarOption: echarts.EChartsOption = useMemo(() => {
    const isNew = commissionMode === 'new';
    const categories = data.categories;

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const item = Array.isArray(params) ? params[0] : params;
          return `
            <div style="font-size: 12px; font-weight: 600; color: #1e293b; margin-bottom: 4px;">
              ${item.name}
            </div>
            <div style="font-size: 12px; color: #475569; display: flex; justify-content: space-between; gap: 16px;">
              <span>${isNew ? timeLabel + '新增佣金' : '累计佣金'}:</span>
              <strong style="color: #2563EB;">${Number(item.value).toLocaleString()} 万元</strong>
            </div>
          `;
        },
      },
      grid: {
        top: 25,
        right: 25,
        bottom: 45,
        left: 55,
      },
      xAxis: {
        type: 'category',
        data: categories.map((c) => c.name),
        axisLine: { lineStyle: { color: '#E2E8F0' } },
        axisTick: { show: false },
        axisLabel: {
          color: '#64748B',
          fontSize: 11,
          interval: 0,
          rotate: 15,
        },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#F1F5F9' } },
        axisLabel: {
          color: '#94A3B8',
          fontSize: 11,
          formatter: '{value} 万',
        },
      },
      series: [
        {
          name: isNew ? '新增佣金' : '累计佣金',
          type: 'bar',
          barWidth: '38%',
          data: categories.map((c) => ({
            value: isNew ? c.newCommission : c.totalCommission,
            itemStyle: {
              color: BASIC_SERVICE_COLORS[c.name] || '#2563EB',
              borderRadius: [4, 4, 0, 0],
            },
          })),
          label: {
            show: true,
            position: 'top',
            color: '#64748B',
            fontSize: 11,
            formatter: (p: any) => `${p.value}万`,
          },
        },
      ],
    };
  }, [data, commissionMode, timeLabel]);

  // 右侧：佣金率独立横向条形图 (独立百分比坐标轴)
  const rateBarOption: echarts.EChartsOption = useMemo(() => {
    const categories = [...data.categories].reverse();

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const item = Array.isArray(params) ? params[0] : params;
          return `
            <div style="font-size: 12px; font-weight: 600; color: #1e293b; margin-bottom: 4px;">
              ${item.name}
            </div>
            <div style="font-size: 12px; color: #475569; display: flex; justify-content: space-between; gap: 16px;">
              <span>佣金率:</span>
              <strong style="color: #2563EB;">${item.value}%</strong>
            </div>
          `;
        },
      },
      grid: {
        top: 15,
        right: 60,
        bottom: 25,
        left: 140,
      },
      xAxis: {
        type: 'value',
        min: 0,
        max: 5,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#F1F5F9' } },
        axisLabel: {
          color: '#94A3B8',
          fontSize: 11,
          formatter: '{value}%',
        },
      },
      yAxis: {
        type: 'category',
        data: categories.map((c) => c.name),
        axisLine: { lineStyle: { color: '#E2E8F0' } },
        axisTick: { show: false },
        axisLabel: {
          color: '#475569',
          fontSize: 12,
        },
      },
      series: [
        {
          name: '佣金率',
          type: 'bar',
          barWidth: 18,
          data: categories.map((c) => ({
            value: c.commissionRate,
            itemStyle: {
              color: '#3B82F6',
              borderRadius: [0, 4, 4, 0],
            },
          })),
          label: {
            show: true,
            position: 'right',
            color: '#2563EB',
            fontWeight: 'bold',
            fontSize: 11,
            formatter: '{c}%',
          },
        },
      ],
    };
  }, [data]);

  return (
    <div className="space-y-4 w-full">
      {/* ========================================================================= */}
      {/* 第一行：两个累计总额指标卡 (平台供需交易总金额 + 平台佣金总收入) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 指标 1：平台供需交易总金额 (截至累计) */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold text-sm text-slate-800 truncate" title="平台供需交易总金额">
              平台供需交易总金额
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
              截至累计
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 my-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tracking-tight">
              {(data.totalTxAmount / 10000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-sm font-medium text-slate-500">亿元</span>
          </div>
          <div className="text-xs text-slate-400 truncate">
            截止到2026/09/01的累计供需交易总额
          </div>
        </div>

        {/* 指标 2：平台佣金总收入 (截至累计) */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold text-sm text-slate-800 truncate" title="平台佣金总收入">
              平台佣金总收入
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
              截至累计
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 my-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tracking-tight">
              {data.totalCommission.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
            <span className="text-sm font-medium text-slate-500">万元</span>
          </div>
          <div className="text-xs text-slate-400 truncate">
            截止到2026/09/01的累计佣金收入
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 第二行：三个随周期变换的核心指标卡 (新增交易额 + 新增佣金 + 综合佣金率) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 指标 3：平台新增供需交易金额 (筛选期内新增值) */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold text-sm text-slate-800 truncate" title="平台新增供需交易金额">
              平台新增供需交易金额
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
              {timeLabel}新增
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 my-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tracking-tight">
              {data.newTxAmount.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
            <span className="text-sm font-medium text-slate-500">万元</span>
          </div>
          <div className="text-xs text-slate-400 truncate">
            筛选期内新增供需交易总额
          </div>
        </div>

        {/* 指标 4：新增平台佣金收入 (筛选期内新增值) */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold text-sm text-slate-800 truncate" title="新增平台佣金收入">
              新增平台佣金收入
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
              {timeLabel}新增
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 my-2">
            <span className="text-3xl font-bold font-mono text-blue-600 tracking-tight">
              {data.newCommission.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
            <span className="text-sm font-medium text-slate-500">万元</span>
          </div>
          <div className="text-xs text-slate-400 truncate">
            筛选期内新增佣金收入总额
          </div>
        </div>

        {/* 指标 5：平台供需交易佣金率 (所选时间段供需撮合服务综合佣金率) */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold text-sm text-slate-800 truncate" title="平台供需交易佣金率">
              平台供需交易佣金率
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
              综合费率
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 my-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tracking-tight">
              {data.commissionRate}%
            </span>
          </div>
          <div className="text-xs text-slate-400 truncate">
            所选时间段供需撮合服务综合佣金率
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 第三行：分析模块 1 - 基础服务类别交易金额分析 (独立模块) */}
      {/* ========================================================================= */}
      <div id="sd-tx-amount-analysis-section" className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5">
        {/* 顶部标题与模式切换按钮 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-blue-600 rounded-xs" />
            <h2 className="text-sm font-bold text-slate-800 tracking-wide">
              基础服务类别交易金额分析
            </h2>
          </div>

          {/* 模式切换按钮 (新增 / 累计) */}
          <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setTxAmountMode('new')}
              className={`px-3 py-1 rounded transition-all cursor-pointer ${
                txAmountMode === 'new'
                  ? 'bg-white text-blue-600 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {timeLabel}新增金额
            </button>
            <button
              type="button"
              onClick={() => setTxAmountMode('total')}
              className={`px-3 py-1 rounded transition-all cursor-pointer ${
                txAmountMode === 'total'
                  ? 'bg-white text-blue-600 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              累计金额
            </button>
          </div>
        </div>

        {/* 交易金额图表：左侧横向柱状图 + 右侧环形图 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* 左侧：横向柱状图 (7列) */}
          <div className="lg:col-span-7 bg-slate-50/40 border border-slate-200/80 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-slate-800">
                  基础服务类别交易金额比较
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                当前视图：{txAmountMode === 'new' ? timeLabel + '新增' : '截至累计'}
              </span>
            </div>
            <div className="h-[380px] xl:h-[420px]">
              <EChartWrapper option={horizontalBarOption} height="100%" />
            </div>
          </div>

          {/* 右侧：环形图 (5列) */}
          <div className="lg:col-span-5 bg-slate-50/40 border border-slate-200/80 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-slate-800">
                  基础服务交易金额构成
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                共 7 类基础服务
              </span>
            </div>
            <div className="h-[380px] xl:h-[420px]">
              <EChartWrapper option={pieOption} height="100%" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 第四行：分析模块 2 - 佣金与佣金率分析 (独立模块，与交易金额分析分开) */}
      {/* ========================================================================= */}
      <div id="sd-commission-analysis-section" className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5">
        {/* 顶部标题与模式切换按钮 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-indigo-600 rounded-xs" />
            <h2 className="text-sm font-bold text-slate-800 tracking-wide">
              佣金与佣金率分析
            </h2>
          </div>

          {/* 模式切换按钮 (新增 / 累计) */}
          <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setCommissionMode('new')}
              className={`px-3 py-1 rounded transition-all cursor-pointer ${
                commissionMode === 'new'
                  ? 'bg-white text-indigo-600 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {timeLabel}新增佣金
            </button>
            <button
              type="button"
              onClick={() => setCommissionMode('total')}
              className={`px-3 py-1 rounded transition-all cursor-pointer ${
                commissionMode === 'total'
                  ? 'bg-white text-indigo-600 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              累计佣金
            </button>
          </div>
        </div>

        {/* 佣金与佣金率图表：左侧佣金金额柱状图 + 右侧佣金率横向条形图 - 独立坐标轴 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* 左侧：佣金金额柱状图 (7列) */}
          <div className="lg:col-span-7 bg-slate-50/40 border border-slate-200/80 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-semibold text-slate-800">
                  基础服务类别佣金金额柱状图 (万元)
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                当前视图：{commissionMode === 'new' ? timeLabel + '新增' : '截至累计'}
              </span>
            </div>
            <div className="h-[380px] xl:h-[420px]">
              <EChartWrapper option={commissionBarOption} height="100%" />
            </div>
          </div>

          {/* 右侧：佣金率独立横向条形图 (5列) */}
          <div className="lg:col-span-5 bg-slate-50/40 border border-slate-200/80 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-semibold text-slate-800">
                  各类别佣金率横向比例图 (%)
                </h3>
              </div>
            </div>
            <div className="h-[380px] xl:h-[420px]">
              <EChartWrapper option={rateBarOption} height="100%" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
