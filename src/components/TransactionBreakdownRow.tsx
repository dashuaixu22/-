import React, { useMemo } from 'react';
import { EChartWrapper } from './EChartWrapper';
import { TimeRangeType } from '../types';
import {
  BASIC_SERVICE_TRANSACTIONS_BY_RANGE,
  VAS_CATEGORY_TRANSACTIONS_BY_RANGE,
  formatCurrency,
} from '../data/mockData';
import * as echarts from 'echarts';

const TECH_PALETTE = [
  '#1677FF',
  '#00A3E0',
  '#36CFC9',
  '#597EF7',
  '#9254DE',
  '#F759AB',
  '#FFA940',
  '#FFC53D',
  '#73D13D',
  '#4096FF',
];

interface TransactionBreakdownRowProps {
  timeRange: TimeRangeType;
}

export const TransactionBreakdownRow: React.FC<TransactionBreakdownRowProps> = ({ timeRange }) => {
  const basicData = BASIC_SERVICE_TRANSACTIONS_BY_RANGE[timeRange] || BASIC_SERVICE_TRANSACTIONS_BY_RANGE.month;
  const basicTotal = useMemo(() => basicData.reduce((sum, item) => sum + item.value, 0), [basicData]);

  const vasCategoryData = VAS_CATEGORY_TRANSACTIONS_BY_RANGE[timeRange] || VAS_CATEGORY_TRANSACTIONS_BY_RANGE.month;
  const currentVasData = vasCategoryData;
  const currentVasTotal = useMemo(() => currentVasData.reduce((sum, item) => sum + item.value, 0), [currentVasData]);

  // 基础服务图表配置
  const basicBarOption: echarts.EChartsOption = useMemo(() => {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const item = params[0];
          const full = basicData[item.dataIndex]?.fullName || item.name;
          return `
            <div style="padding: 2px 4px; font-size: 12px; font-family: sans-serif;">
              <div style="color: #64748b; margin-bottom: 4px;">${full}</div>
              <div style="font-weight: 700; color: #1e293b; font-family: monospace;">¥${item.value.toLocaleString()}</div>
            </div>
          `;
        },
      },
      grid: {
        top: 20,
        right: 15,
        bottom: 56,
        left: 55,
      },
      xAxis: {
        type: 'category',
        data: basicData.map((d) => d.name),
        axisLine: { lineStyle: { color: '#E2E8F0' } },
        axisTick: { alignWithLabel: true, lineStyle: { color: '#CBD5E1' } },
        axisLabel: {
          color: '#64748B',
          fontSize: 10,
          interval: 0,
          rotate: 28,
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
          formatter: (val: number) => `¥${(val / 10000).toFixed(0)}万`,
        },
      },
      series: [
        {
          name: '交易额',
          type: 'bar',
          barWidth: '32%',
          data: basicData.map((d) => d.value),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#1677FF' },
              { offset: 1, color: '#4096FF' },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
        },
      ],
    };
  }, [basicData]);

  const basicDonutOption: echarts.EChartsOption = useMemo(() => {
    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const full = basicData[params.dataIndex]?.fullName || params.name;
          return `
            <div style="padding: 2px 4px; font-size: 12px; font-family: sans-serif;">
              <div style="color: #64748b; margin-bottom: 2px;">${full}</div>
              <div style="font-weight: 700; color: #1e293b; font-family: monospace;">¥${params.value.toLocaleString()} (${params.percent}%)</div>
            </div>
          `;
        },
      },
      legend: { show: false },
      series: [
        {
          name: '基础服务占比',
          type: 'pie',
          radius: ['52%', '72%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 3,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            position: 'center',
            formatter: () => `{total|${(basicTotal / 10000).toFixed(0)}万}\n{label|总交易额}`,
            rich: {
              total: {
                fontSize: 16,
                fontWeight: 'bold',
                color: '#1e293b',
                fontFamily: 'monospace',
                lineHeight: 22,
              },
              label: {
                fontSize: 11,
                color: '#94a3b8',
                lineHeight: 16,
              },
            },
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold',
            },
          },
          data: basicData.map((d, index) => ({
            value: d.value,
            name: d.name,
            itemStyle: { color: TECH_PALETTE[index % TECH_PALETTE.length] },
          })),
        },
      ],
    };
  }, [basicData, basicTotal]);

  // 增值服务图表配置
  const vasBarOption: echarts.EChartsOption = useMemo(() => {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const item = params[0];
          const full = currentVasData[item.dataIndex]?.fullName || item.name;
          return `
            <div style="padding: 2px 4px; font-size: 12px; font-family: sans-serif;">
              <div style="color: #64748b; margin-bottom: 4px;">${full}</div>
              <div style="font-weight: 700; color: #1e293b; font-family: monospace;">¥${item.value.toLocaleString()}</div>
            </div>
          `;
        },
      },
      grid: {
        top: 20,
        right: 15,
        bottom: 56,
        left: 55,
      },
      xAxis: {
        type: 'category',
        data: currentVasData.map((d) => d.name),
        axisLine: { lineStyle: { color: '#E2E8F0' } },
        axisTick: { alignWithLabel: true, lineStyle: { color: '#CBD5E1' } },
        axisLabel: {
          color: '#64748B',
          fontSize: 10,
          interval: 0,
          rotate: 28,
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
          formatter: (val: number) => `¥${(val / 10000).toFixed(0)}万`,
        },
      },
      series: [
        {
          name: '交易额',
          type: 'bar',
          barWidth: '32%',
          data: currentVasData.map((d) => d.value),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#00A3E0' },
              { offset: 1, color: '#36CFC9' },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
        },
      ],
    };
  }, [currentVasData]);

  const vasDonutOption: echarts.EChartsOption = useMemo(() => {
    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const full = currentVasData[params.dataIndex]?.fullName || params.name;
          return `
            <div style="padding: 2px 4px; font-size: 12px; font-family: sans-serif;">
              <div style="color: #64748b; margin-bottom: 2px;">${full}</div>
              <div style="font-weight: 700; color: #1e293b; font-family: monospace;">¥${params.value.toLocaleString()} (${params.percent}%)</div>
            </div>
          `;
        },
      },
      legend: { show: false },
      series: [
        {
          name: '增值服务占比',
          type: 'pie',
          radius: ['52%', '72%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 3,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            position: 'center',
            formatter: () => `{total|${(currentVasTotal / 10000).toFixed(0)}万}\n{label|总交易额}`,
            rich: {
              total: {
                fontSize: 16,
                fontWeight: 'bold',
                color: '#1e293b',
                fontFamily: 'monospace',
                lineHeight: 22,
              },
              label: {
                fontSize: 11,
                color: '#94a3b8',
                lineHeight: 16,
              },
            },
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold',
            },
          },
          data: currentVasData.map((d, index) => ({
            value: d.value,
            name: d.name,
            itemStyle: { color: TECH_PALETTE[index % TECH_PALETTE.length] },
          })),
        },
      ],
    };
  }, [currentVasData, currentVasTotal]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* 基础服务交易额模块 (70% 柱状图 + 30% 环形图) */}
      <div
        id="card-basic-service-tx"
        className="bg-white rounded-lg border border-slate-200 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
      >
        <div className="flex items-center justify-between pb-3.5 mb-2 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800 tracking-wide flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-blue-600 rounded-xs" />
            基础服务交易额
          </h2>
        </div>

        <div className="grid grid-cols-10 gap-2 h-64 items-center">
          {/* 左侧柱状图 (70%) */}
          <div className="col-span-7 h-full">
            <EChartWrapper option={basicBarOption} height="100%" />
          </div>
          {/* 右侧环形图 (30%) */}
          <div className="col-span-3 h-full">
            <EChartWrapper option={basicDonutOption} height="100%" />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>
            基础服务总额：
            <strong className="text-slate-800 font-mono font-bold ml-1">
              {formatCurrency(basicTotal)}
            </strong>
          </span>
        </div>
      </div>

      {/* 增值服务交易额模块 (70% 柱状图 + 30% 环形图) */}
      <div
        id="card-vas-service-tx"
        className="bg-white rounded-lg border border-slate-200 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
      >
        <div className="flex items-center justify-between pb-3.5 mb-2 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800 tracking-wide flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-cyan-600 rounded-xs" />
            增值服务交易额
          </h2>
        </div>

        <div className="grid grid-cols-10 gap-2 h-64 items-center">
          {/* 左侧柱状图 (70%) */}
          <div className="col-span-7 h-full">
            <EChartWrapper option={vasBarOption} height="100%" />
          </div>
          {/* 右侧环形图 (30%) */}
          <div className="col-span-3 h-full">
            <EChartWrapper option={vasDonutOption} height="100%" />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>
            增值服务总额：
            <strong className="text-slate-800 font-mono font-bold ml-1">
              {formatCurrency(currentVasTotal)}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
};
