import React, { useMemo } from 'react';
import { EChartWrapper } from './EChartWrapper';
import {
  PRODUCT_QUALITY_DATA,
} from '../data/productAnalysisMockData';
import { VAS_SERVICE_COLORS } from '../data/overviewMockData';
import * as echarts from 'echarts';
import {
  Clock,
  Activity,
  Star,
  CheckCircle2,
  Award,
} from 'lucide-react';

export const ProductQualityView: React.FC = () => {
  // 增值服务数据列表
  const usageDataList = PRODUCT_QUALITY_DATA.vasServiceList;
  const evaluationDataList = PRODUCT_QUALITY_DATA.vasServiceList;

  // =========================================================================
  // 左侧：服务使用时长独立图表 (横向柱状图)
  // =========================================================================
  const durationBarOption: echarts.EChartsOption = useMemo(() => {
    const sorted = [...usageDataList].reverse();
    const yNames = sorted.map((d) => d.name);
    const themeColor = '#06B6D4';

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
              <span>服务使用时长:</span>
              <strong style="color: ${themeColor};">${item.value} 小时</strong>
            </div>
          `;
        },
      },
      grid: {
        top: 10,
        right: 50,
        bottom: 20,
        left: 130,
      },
      xAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#F1F5F9' } },
        axisLabel: {
          color: '#94A3B8',
          fontSize: 10,
          formatter: '{value}h',
        },
      },
      yAxis: {
        type: 'category',
        data: yNames,
        axisLine: { lineStyle: { color: '#E2E8F0' } },
        axisTick: { show: false },
        axisLabel: {
          color: '#475569',
          fontSize: 10.5,
        },
      },
      series: [
        {
          name: '使用时长',
          type: 'bar',
          barWidth: 11,
          data: sorted.map((c) => ({
            value: c.duration,
            itemStyle: {
              color: VAS_SERVICE_COLORS[c.name] || '#06B6D4',
              borderRadius: [0, 3, 3, 0],
            },
          })),
          label: {
            show: true,
            position: 'right',
            color: '#64748B',
            fontSize: 10,
            formatter: (p: any) => `${p.value}h`,
          },
        },
      ],
    };
  }, [usageDataList]);

  // =========================================================================
  // 左侧：服务使用次数独立图表 (横向柱状图)
  // =========================================================================
  const countBarOption: echarts.EChartsOption = useMemo(() => {
    const sorted = [...usageDataList].reverse();
    const yNames = sorted.map((d) => d.name);
    const themeColor = '#06B6D4';

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
              <span>服务使用次数:</span>
              <strong style="color: ${themeColor};">${item.value} 万次</strong>
            </div>
          `;
        },
      },
      grid: {
        top: 10,
        right: 50,
        bottom: 20,
        left: 130,
      },
      xAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#F1F5F9' } },
        axisLabel: {
          color: '#94A3B8',
          fontSize: 10,
          formatter: '{value}万',
        },
      },
      yAxis: {
        type: 'category',
        data: yNames,
        axisLine: { lineStyle: { color: '#E2E8F0' } },
        axisTick: { show: false },
        axisLabel: {
          color: '#475569',
          fontSize: 10.5,
        },
      },
      series: [
        {
          name: '使用次数',
          type: 'bar',
          barWidth: 11,
          data: sorted.map((c) => ({
            value: c.usageCount,
            itemStyle: {
              color: VAS_SERVICE_COLORS[c.name] || '#0891B2',
              borderRadius: [0, 3, 3, 0],
            },
          })),
          label: {
            show: true,
            position: 'right',
            color: '#64748B',
            fontSize: 10,
            formatter: (p: any) => `${p.value}万次`,
          },
        },
      ],
    };
  }, [usageDataList]);

  // =========================================================================
  // 右侧：服务质量评价横向柱状图 (评分 5.0 分制)
  // =========================================================================
  const scoreBarOption: echarts.EChartsOption = useMemo(() => {
    const sorted = [...evaluationDataList].reverse();
    const yNames = sorted.map((d) => d.name);
    const themeColor = '#06B6D4';

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
              <span>服务质量综合评分:</span>
              <strong style="color: ${themeColor};">${Number(item.value).toFixed(2)} 分 (满分 5.0)</strong>
            </div>
          `;
        },
      },
      grid: {
        top: 20,
        right: 60,
        bottom: 24,
        left: 130,
      },
      xAxis: {
        type: 'value',
        min: 4.5,
        max: 5.0,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#F1F5F9' } },
        axisLabel: {
          color: '#94A3B8',
          fontSize: 10.5,
          formatter: '{value}分',
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
          name: '综合评分',
          type: 'bar',
          barWidth: 14,
          data: sorted.map((c) => ({
            value: c.score,
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
            formatter: (p: any) => `${Number(p.value).toFixed(2)}分`,
          },
          // 4.80 标杆参考线
          markLine: {
            silent: false,
            symbol: 'none',
            lineStyle: {
              color: '#10B981',
              type: 'dashed',
              width: 1.5,
            },
            data: [
              {
                xAxis: 4.8,
                label: {
                  formatter: '达标线 4.80',
                  position: 'middle',
                  color: '#059669',
                  fontSize: 10,
                  backgroundColor: '#ECFDF5',
                  padding: [2, 4],
                  borderRadius: 2,
                },
              },
            ],
          },
        },
      ],
    };
  }, [evaluationDataList]);

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. 第一行：三个统一规格指标卡 (不设时间Tab) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 卡片 1: 服务使用时长 */}
        <div
          id="product-quality-card-duration"
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-slate-700">
                服务使用时长（平均）
              </span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono">
                {PRODUCT_QUALITY_DATA.avgDuration}
              </span>
              <span className="text-sm text-slate-500 font-medium">小时</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              各服务平均持续运行或调阅响应时长
            </p>
          </div>
        </div>

        {/* 卡片 2: 服务使用次数 */}
        <div
          id="product-quality-card-usage-count"
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-slate-700">
                服务使用次数
              </span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono">
                {PRODUCT_QUALITY_DATA.totalUsageCount}
              </span>
              <span className="text-sm text-slate-500 font-medium">万次</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              全平台各类算力与增值服务累计调用总频次
            </p>
          </div>
        </div>

        {/* 卡片 3: 服务质量评价 */}
        <div
          id="product-quality-card-score"
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <Star className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-slate-700">
                服务质量评价（综合评分）
              </span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono text-amber-700">
                {PRODUCT_QUALITY_DATA.compositeScore.toFixed(2)}
              </span>
              <span className="text-sm text-slate-500 font-medium">分 / 5.00</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              履约质量、稳定性与客户评价综合加权得分
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 第二行：两个等宽模块 (左: 服务使用情况; 右: 服务质量评价) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧模块：服务使用情况 (分别展示使用时长与使用次数独立图表) */}
        <div
          id="product-quality-usage-section"
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4"
        >
          <div className="pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                服务使用情况
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                服务使用时长与使用次数独立分别展示（无混合坐标轴）
              </p>
            </div>
          </div>

          {/* 独立图表 1: 各类别服务使用时长 (小时) */}
          <div className="border border-slate-100 rounded-lg p-3 bg-slate-50/40">
            <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              各类别服务使用时长 (小时)
            </div>
            <div className="h-[200px] w-full">
              <EChartWrapper option={durationBarOption} />
            </div>
          </div>

          {/* 独立图表 2: 各类别服务使用次数 (万次) */}
          <div className="border border-slate-100 rounded-lg p-3 bg-slate-50/40">
            <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
              <Activity className="w-3.5 h-3.5 text-slate-500" />
              各类别服务使用次数 (万次)
            </div>
            <div className="h-[200px] w-full">
              <EChartWrapper option={countBarOption} />
            </div>
          </div>
        </div>

        {/* 右侧模块：服务质量评价 (横向条形图展示不同服务类别的综合评分) */}
        <div
          id="product-quality-evaluation-section"
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between"
        >
          <div>
            <div className="pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  服务质量评价
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  各服务类别的综合质量评分（5.00 分制）
                </p>
              </div>
            </div>

            {/* 评分说明与标杆提示 */}
            <div className="mt-3 flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg px-3.5 py-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>综合评分达标线: <strong>4.80 分</strong></span>
              </div>
              <span className="text-slate-400">评分区间: 4.50 - 5.00</span>
            </div>

            {/* 综合评分横向条形图 */}
            <div className="mt-2 h-[380px] w-full">
              <EChartWrapper option={scoreBarOption} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
