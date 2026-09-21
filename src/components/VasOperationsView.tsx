import React, { useState, useMemo } from 'react';
import { TimeRangeType } from '../types';
import { EChartWrapper } from './EChartWrapper';
import {
  VAS_OPERATIONS_DATA,
  VAS_SERVICE_COLORS,
} from '../data/overviewMockData';
import * as echarts from 'echarts';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';

interface VasOperationsViewProps {
  timeRange: TimeRangeType;
}

export const VasOperationsView: React.FC<VasOperationsViewProps> = ({ timeRange }) => {
  const data = VAS_OPERATIONS_DATA[timeRange] || VAS_OPERATIONS_DATA.month;
  const timeLabel =
    timeRange === 'year'
      ? '近一年'
      : timeRange === 'month'
      ? '近一月'
      : timeRange === 'today'
      ? '当日'
      : '近一周';

  // 收入分类模式切换：'new' (新增收入) | 'total' (累计收入)
  const [incomeMode, setIncomeMode] = useState<'new' | 'total'>('new');

  // =========================================================================
  // 图表配置：增值服务收入分类 (统一青蓝色系)
  // =========================================================================
  // 左侧：横向柱状图 (不同增值服务类别收入比较)
  const horizontalBarOption: echarts.EChartsOption = useMemo(() => {
    const isNew = incomeMode === 'new';
    const categories = [...data.categories].reverse(); // 自下而上
    const yNames = categories.map((c) => c.name);

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
              <span>${isNew ? timeLabel + '新增收入' : '累计收入'}:</span>
              <strong style="color: #0891B2;">${Number(item.value).toLocaleString()} 万元</strong>
            </div>
          `;
        },
      },
      grid: {
        top: 20,
        right: 48,
        bottom: 24,
        left: 130,
      },
      xAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#F1F5F9' } },
        axisLabel: {
          color: '#94A3B8',
          fontSize: 10.5,
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
          fontSize: 11,
        },
      },
      series: [
        {
          name: isNew ? '新增收入' : '累计收入',
          type: 'bar',
          barWidth: 14,
          data: categories.map((c) => ({
            value: isNew ? c.newIncome : c.totalIncome,
            itemStyle: {
              color: VAS_SERVICE_COLORS[c.name] || '#06B6D4',
              borderRadius: [0, 4, 4, 0],
            },
          })),
          label: {
            show: true,
            position: 'right',
            color: '#64748B',
            fontSize: 10.5,
            formatter: (p: any) => `${p.value}万`,
          },
        },
      ],
    };
  }, [data, incomeMode, timeLabel]);

  // 右侧：环形图 (不同增值服务类别收入构成)
  const pieOption: echarts.EChartsOption = useMemo(() => {
    const isNew = incomeMode === 'new';
    const pieData = data.categories.map((c) => ({
      name: c.name,
      value: isNew ? c.newIncome : c.totalIncome,
      itemStyle: { color: VAS_SERVICE_COLORS[c.name] || '#06B6D4' },
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
              <span>${isNew ? timeLabel + '新增收入' : '累计收入'}:</span>
              <strong style="color: #0891B2;">${Number(params.value).toLocaleString()} 万元 (${params.percent}%)</strong>
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
        textStyle: { fontSize: 11, color: '#475569' },
        itemGap: 6,
        formatter: (name: string) => {
          const item = data.categories.find((c) => c.name === name);
          const val = item ? (isNew ? item.newIncome : item.totalIncome) : 0;
          return `${name.length > 7 ? name.slice(0, 7) + '..' : name}  ${val} 万`;
        },
      },
      series: [
        {
          name: '增值服务收入构成',
          type: 'pie',
          radius: ['45%', '72%'],
          center: ['36%', '50%'],
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
              fontSize: 12,
              fontWeight: 'bold',
              formatter: '{b}\n{d}%',
            },
          },
          data: pieData,
        },
      ],
    };
  }, [data, incomeMode, timeLabel]);

  return (
    <div className="space-y-4">
      {/* ========================================================================= */}
      {/* 第一行：两个同等大小的核心指标卡 (总收入在左，新增收入在右) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 指标卡 1：增值服务总收入 (截至筛选结束日累计值 - 放左边) */}
        <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium text-slate-700">增值服务总收入</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
              截至累计
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
              {data.totalVasIncome.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
            <span className="text-xs font-medium text-slate-500">万元</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            截止到2026/09/01的增值服务累计总收入
          </div>
        </div>

        {/* 指标卡 2：新增增值服务收入 (当前筛选周期数据 - 放右边) */}
        <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium text-slate-700">新增增值服务收入</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-cyan-50 text-cyan-700 border border-cyan-100">
              {timeLabel}新增
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl font-bold font-mono text-cyan-700 tracking-tight">
              {data.newVasIncome.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
            <span className="text-xs font-medium text-slate-500">万元</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            展示当前筛选周期内增值服务的新增收入
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 第二行：“增值服务收入分类”模块 */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4">
        {/* 模块头部与新增/累计切换按钮 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-cyan-600 rounded-xs" />
            <h3 className="text-xs font-semibold text-slate-800 tracking-wide">
              增值服务收入分类分析
            </h3>
          </div>

          {/* 新增收入 / 累计收入 切换 */}
          <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setIncomeMode('new')}
              className={`px-3 py-1 rounded transition-all cursor-pointer ${
                incomeMode === 'new'
                  ? 'bg-white text-cyan-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              新增收入
            </button>
            <button
              type="button"
              onClick={() => setIncomeMode('total')}
              className={`px-3 py-1 rounded transition-all cursor-pointer ${
                incomeMode === 'total'
                  ? 'bg-white text-cyan-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              累计收入
            </button>
          </div>
        </div>

        {/* 左右双图表 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* 左侧：柱状图 (7列) */}
          <div className="lg:col-span-7 bg-slate-50/40 border border-slate-200/80 rounded-md p-3.5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-cyan-600" />
                <h4 className="text-xs font-semibold text-slate-800">
                  增值服务类别收入比较
                </h4>
              </div>
              <span className="text-[10px] text-slate-400">
                当前视图：{incomeMode === 'new' ? timeLabel + '新增收入' : '累计总收入'}
              </span>
            </div>
            <div className="h-80">
              <EChartWrapper option={horizontalBarOption} height="100%" />
            </div>
          </div>

          {/* 右侧：环形图 (5列) */}
          <div className="lg:col-span-5 bg-slate-50/40 border border-slate-200/80 rounded-md p-3.5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <PieChartIcon className="w-3.5 h-3.5 text-cyan-600" />
                <h4 className="text-xs font-semibold text-slate-800">
                  增值服务类别收入构成
                </h4>
              </div>
              <span className="text-[10px] text-slate-400">
                共 10 类增值服务
              </span>
            </div>
            <div className="h-80">
              <EChartWrapper option={pieOption} height="100%" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
