import React, { useState, useMemo } from 'react';
import { ChevronDown, Info } from 'lucide-react';
import { EChartWrapper } from './EChartWrapper';
import { LineChartPoint, TimeRangeType } from '../types';
import { getGrowthDataByRange } from '../data/mockData';
import * as echarts from 'echarts';

interface GrowthRateCardProps {
  id: string;
  title: string;
  categories: readonly string[];
  dataMap: Record<string, LineChartPoint[]>;
  themeColor?: string;
  timeRange: TimeRangeType;
}

export const GrowthRateCard: React.FC<GrowthRateCardProps> = ({
  id,
  title,
  categories,
  dataMap,
  themeColor = '#1677FF',
  timeRange,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('汇总');

  const currentPoints = useMemo(() => {
    return getGrowthDataByRange(dataMap, selectedCategory, timeRange);
  }, [dataMap, selectedCategory, timeRange]);

  const option: echarts.EChartsOption = useMemo(() => {
    const xData = currentPoints.map((p) => p.month);
    const yData = currentPoints.map((p) => p.rate);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          lineStyle: { color: '#94A3B8', type: 'dashed' },
        },
        formatter: (params: any) => {
          if (!Array.isArray(params) || params.length === 0) return '';
          const item = params[0];
          if (!item) return '';
          const rawVal = item.value;
          const numVal = typeof rawVal === 'number' ? rawVal : Number(rawVal || 0);
          const isPositive = numVal >= 0;
          return `
            <div style="padding: 3px 6px; font-size: 12px; font-family: sans-serif;">
              <div style="color: #64748b; margin-bottom: 2px;">${item.name || ''} · ${selectedCategory}</div>
              <div style="font-weight: 700; color: ${isPositive ? '#ef4444' : '#10b981'}; font-family: monospace; font-size: 13px;">
                增长率: ${isPositive ? '+' : ''}${numVal.toFixed(1)}%
              </div>
            </div>
          `;
        },
      },
      grid: {
        top: 25,
        right: 25,
        bottom: 30,
        left: 55,
      },
      xAxis: {
        type: 'category',
        data: xData,
        boundaryGap: false,
        axisLine: { lineStyle: { color: '#E2E8F0' } },
        axisTick: { lineStyle: { color: '#CBD5E1' } },
        axisLabel: {
          color: '#64748B',
          fontSize: 11,
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
          formatter: '{value}%',
        },
      },
      series: [
        {
          name: title,
          type: 'line',
          data: yData,
          smooth: false,
          showSymbol: true,
          symbolSize: 6,
          itemStyle: {
            color: themeColor,
          },
          lineStyle: {
            width: 2,
            color: themeColor,
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: themeColor === '#1677FF' ? 'rgba(22,119,255,0.15)' : 'rgba(0,163,224,0.15)' },
              { offset: 1, color: 'rgba(255,255,255,0.0)' },
            ]),
          },
          markLine: {
            symbol: 'none',
            silent: true,
            data: [
              {
                yAxis: 0,
                lineStyle: {
                  color: '#94A3B8',
                  width: 1.2,
                  type: 'solid',
                },
                label: {
                  show: true,
                  position: 'insideEndTop',
                  formatter: '0% 基准线',
                  fontSize: 10,
                  color: '#94A3B8',
                },
              },
            ],
          },
        },
      ],
    };
  }, [currentPoints, selectedCategory, themeColor, title]);

  return (
    <div
      id={`card-${id}`}
      className="bg-white rounded-lg border border-slate-200 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
    >
      <div className="flex items-center justify-between pb-3.5 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-bold text-slate-800 tracking-wide flex items-center gap-2">
            <span className="w-1.5 h-3.5 rounded-xs" style={{ backgroundColor: themeColor }} />
            {title}
          </h2>
          {timeRange === 'today' && (
            <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded font-normal flex items-center gap-1">
              <Info className="w-3 h-3 text-amber-600 shrink-0" />
              当日无前后对比数据，已展示近一周
            </span>
          )}
        </div>

        {/* 类别下拉框 */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              id={`${id}-category-select`}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded px-2.5 py-1 pr-6 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer hover:border-slate-300"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <EChartWrapper option={option} height="100%" />
      </div>

      {timeRange === 'today' && (
        <div className="mt-1.5 text-[11px] text-amber-600 text-right">
          * 增长率需对比周期数据，当日暂无独立对比数据，已呈现近一周走势
        </div>
      )}
    </div>
  );
};
