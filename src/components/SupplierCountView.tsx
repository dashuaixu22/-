import React, { useMemo } from 'react';
import { TimeRangeType } from '../types';
import { EChartWrapper } from './EChartWrapper';
import { SUPPLIER_COUNT_DATA } from '../data/supplierAnalysisMockData';
import { TODAY } from '../data/mockData';
import * as echarts from 'echarts';
import {
  Users,
  LineChart as LineChartIcon,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  AlertCircle,
} from 'lucide-react';

interface SupplierCountViewProps {
  timeRange?: TimeRangeType;
  startDate?: string;
  endDate?: string;
}

// 解析 YYYY-MM-DD
function parseDateStr(str: string): Date {
  const parts = str.split('-');
  return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
}

// 格式化日期 MM-DD
function formatMMDD(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${m}-${day}`;
}

interface SupplierTrendResult {
  dates: string[];
  counts: number[];
  isOverLimit: boolean;
  diffDays: number;
  subLabel: string;
  unitLabel: string;
  xAxisType: 'hour' | 'day' | 'month';
  totalCount: number;
}

/**
 * 供应商数 - 新增供应商趋势展示规则（与经营总览统一）：
 * 1. 选择当日：展示 24 个小时（0:00 至 23:00），逐小时统计
 * 2. 选择近一周：返回7日每日
 * 3. 选择近一月：返回近30日的每日
 * 4. 选择近一年：返回从上个月往前推12个月的数据，每个月都是对应月份的总计
 * 5. 自选时间段：展示全部，如果时间大于30天，那么不展示
 */
function computeSupplierTrendData(
  timeRange: TimeRangeType,
  startDateStr?: string,
  endDateStr?: string
): SupplierTrendResult {
  const refEnd = endDateStr || TODAY;
  const refStart = startDateStr || '2026-08-15';

  // 1. 选择当日：展示 24 个小时（0:00 至 23:00，共 24 个横坐标）
  if (timeRange === 'today') {
    const dates = [
      '0:00', '1:00', '2:00', '3:00', '4:00', '5:00',
      '6:00', '7:00', '8:00', '9:00', '10:00', '11:00',
      '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
      '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
    ];
    // 24小时新增供应商数（整数），合计 2 家（分别在 10:00 与 16:00 各新增 1 家）
    const counts = [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      1, 0, 0, 0, 0, 0, 1, 0, 0, 0,
      0, 0, 0, 0
    ];
    return {
      dates,
      counts,
      isOverLimit: false,
      diffDays: 1,
      subLabel: '当日 24 小时新增走势（共 24 个时段，逐小时统计）',
      unitLabel: '时段新增',
      xAxisType: 'hour',
      totalCount: 2,
    };
  }

  // 2. 选择近一周：返回7日每日
  if (timeRange === 'week') {
    const end = parseDateStr(refEnd);
    const dates: string[] = [];
    const counts = [1, 2, 0, 1, 2, 1, 1]; // 合计 8 家
    for (let i = 6; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(end.getDate() - i);
      dates.push(formatMMDD(d));
    }
    return {
      dates,
      counts,
      isOverLimit: false,
      diffDays: 7,
      subLabel: `近一周每日新增走势（共 7 日，${dates[0]} 至 ${dates[dates.length - 1]}）`,
      unitLabel: '每日新增',
      xAxisType: 'day',
      totalCount: 8,
    };
  }

  // 3. 选择近一月：返回近30日的每日
  if (timeRange === 'month') {
    const end = parseDateStr(refEnd);
    const dates: string[] = [];
    // 30天每日新增（整数0~2家，合计28家）
    const counts: number[] = [
      1, 1, 0, 2, 1, 0, 1, 1, 2, 0,
      1, 1, 0, 1, 2, 1, 0, 1, 1, 2,
      0, 1, 1, 2, 0, 1, 2, 1, 1, 1,
    ];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(end.getDate() - i);
      dates.push(formatMMDD(d));
    }
    return {
      dates,
      counts,
      isOverLimit: false,
      diffDays: 30,
      subLabel: `近一月每日新增走势（共 30 日，${dates[0]} 至 ${dates[dates.length - 1]}）`,
      unitLabel: '每日新增',
      xAxisType: 'day',
      totalCount: 28,
    };
  }

  // 4. 选择近一年：返回从上个月往前推12个月的数据，每个月都是对应月份的总计
  if (timeRange === 'year') {
    const end = parseDateStr(refEnd);
    const endYear = end.getFullYear();
    const endMonth = end.getMonth();

    const dates: string[] = [];
    // 12个月各月总计新增供应商数（整数，合计 142 家）
    const counts = [8, 10, 12, 11, 14, 9, 13, 15, 12, 16, 10, 12];

    for (let i = 11; i >= 0; i--) {
      const targetDate = new Date(endYear, endMonth - 1 - i, 1);
      const y = targetDate.getFullYear();
      const m = String(targetDate.getMonth() + 1).padStart(2, '0');
      dates.push(`${y}-${m}`);
    }

    return {
      dates,
      counts,
      isOverLimit: false,
      diffDays: 365,
      subLabel: `近一年月度总计走势（从上月往前推 12 个月：${dates[0]} 至 ${dates[dates.length - 1]}）`,
      unitLabel: '月度总计',
      xAxisType: 'month',
      totalCount: 142,
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
      counts: [],
      isOverLimit: true,
      diffDays,
      subLabel: `自选时间段（${refStart} 至 ${refEnd}，共 ${diffDays} 天）`,
      unitLabel: '每日新增',
      xAxisType: 'day',
      totalCount: Math.round(diffDays * 0.93),
    };
  }

  // <= 30天：展示全部每日明细
  const dates: string[] = [];
  const counts: number[] = [];
  let total = 0;
  for (let i = 0; i < diffDays; i++) {
    const cur = new Date(sDate);
    cur.setDate(sDate.getDate() + i);
    dates.push(formatMMDD(cur));
    // 整数0~2家
    const val = (i % 3 === 0) ? 2 : (i % 2 === 0 ? 0 : 1);
    counts.push(val);
    total += val;
  }

  return {
    dates,
    counts,
    isOverLimit: false,
    diffDays,
    subLabel: `自选时间段每日新增走势（${refStart} 至 ${refEnd}，共 ${diffDays} 天全部展示）`,
    unitLabel: '每日新增',
    xAxisType: 'day',
    totalCount: total,
  };
}

export const SupplierCountView: React.FC<SupplierCountViewProps> = ({
  timeRange = 'year',
  startDate,
  endDate,
}) => {
  // 计算趋势图展示数据及规则判断
  const trendResult = useMemo(() => {
    return computeSupplierTrendData(timeRange, startDate, endDate);
  }, [timeRange, startDate, endDate]);

  const timeLabel = useMemo(() => {
    if (timeRange === 'year') return '近一年';
    if (timeRange === 'month') return '近一月';
    if (timeRange === 'today') return '当日';
    if (timeRange === 'week') return '近一周';
    return `自选(${trendResult.diffDays}天)`;
  }, [timeRange, trendResult.diffDays]);

  // =========================================================================
  // 折线图：新增供应商趋势 (折线图，时间由右上角全局时间选择器驱动，纯整数无小数)
  // =========================================================================
  const newLineOption: echarts.EChartsOption = useMemo(() => {
    if (trendResult.isOverLimit) {
      return {};
    }

    const { dates, counts, xAxisType, unitLabel } = trendResult;

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: '#2563EB',
            width: 1.5,
            type: 'dashed',
          },
        },
        formatter: (params: any) => {
          const item = Array.isArray(params) ? params[0] : params;
          const timeTitle =
            xAxisType === 'hour'
              ? `时段：当日 ${item.name}`
              : xAxisType === 'month'
              ? `月份：${item.name}`
              : `日期：${item.name}`;

          return `
            <div style="font-size: 12px; font-weight: 600; color: #1e293b; margin-bottom: 4px;">
              ${timeTitle}
            </div>
            <div style="font-size: 12px; color: #475569; display: flex; justify-content: space-between; gap: 16px;">
              <span>${unitLabel}:</span>
              <strong style="color: #2563EB;">${Math.round(item.value)} 家</strong>
            </div>
          `;
        },
      },
      grid: {
        top: 24,
        right: 28,
        bottom: 28,
        left: 50,
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: { lineStyle: { color: '#E2E8F0' } },
        axisTick: { show: false },
        axisLabel: {
          color: '#64748B',
          fontSize: xAxisType === 'hour' ? 10 : 11,
          interval: xAxisType === 'hour' ? 0 : (dates.length > 25 ? 1 : 0),
        },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#F1F5F9' } },
        axisLabel: {
          color: '#94A3B8',
          fontSize: 11,
          formatter: '{value} 家',
        },
      },
      series: [
        {
          name: '新增供应商数',
          type: 'line',
          smooth: false,
          showSymbol: true,
          symbolSize: dates.length > 15 ? 4 : 6,
          data: counts,
          itemStyle: {
            color: '#2563EB',
            borderWidth: 2,
            borderColor: '#FFFFFF',
          },
          lineStyle: {
            width: 2.5,
            color: '#2563EB',
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(37, 99, 235, 0.22)' },
              { offset: 1, color: 'rgba(37, 99, 235, 0.01)' },
            ]),
          },
        },
      ],
    };
  }, [trendResult]);

  // =========================================================================
  // 供应商分类分析：全部只保留累计分布 (算力、模型、智能体、终端、开发工具、运行服务、运营服务)
  // =========================================================================
  // 柱状图配置：7大类累计有效供应商分布
  const categoryBarOption: echarts.EChartsOption = useMemo(() => {
    const categories = SUPPLIER_COUNT_DATA.categoryData;

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
              <span>累计有效供应商:</span>
              <strong style="color: ${item.color};">${item.value} 家</strong>
            </div>
          `;
        },
      },
      grid: {
        top: 28,
        right: 24,
        bottom: 28,
        left: 50,
      },
      xAxis: {
        type: 'category',
        data: categories.map((c) => c.name),
        axisLine: { lineStyle: { color: '#E2E8F0' } },
        axisTick: { show: false },
        axisLabel: {
          color: '#475569',
          fontSize: 11,
          interval: 0,
        },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#F1F5F9' } },
        axisLabel: {
          color: '#94A3B8',
          fontSize: 11,
          formatter: '{value} 家',
        },
      },
      series: [
        {
          name: '累计供应商',
          type: 'bar',
          barWidth: 28,
          data: categories.map((c) => ({
            value: c.count,
            itemStyle: {
              color: c.color,
              borderRadius: [4, 4, 0, 0],
            },
          })),
          label: {
            show: true,
            position: 'top',
            color: '#475569',
            fontSize: 11,
            fontWeight: 600,
            formatter: '{c} 家',
          },
        },
      ],
    };
  }, []);

  // 环形图配置：7大类累计有效供应商结构占比
  const categoryPieOption: echarts.EChartsOption = useMemo(() => {
    const categories = SUPPLIER_COUNT_DATA.categoryData;
    const pieData = categories.map((c) => ({
      name: c.name,
      value: c.count,
      itemStyle: { color: c.color },
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
              <span>累计有效供应商:</span>
              <strong style="color: #2563EB;">${Number(params.value).toLocaleString()} 家 (${params.percent}%)</strong>
            </div>
          `;
        },
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'middle',
        itemWidth: 8,
        itemHeight: 8,
        icon: 'circle',
        textStyle: { fontSize: 11, color: '#475569' },
        itemGap: 6,
        formatter: (name: string) => {
          const item = categories.find((c) => c.name === name);
          const val = item ? item.count : 0;
          return `${name}  ${val} 家`;
        },
      },
      series: [
        {
          name: '供应商分类结构',
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
  }, []);

  return (
    <div className="space-y-4">
      {/* ========================================================================= */}
      {/* 第一行：两个核心指标卡 (总数在最左边，新增供应商数放右边) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 指标卡 1：供应商总数 (最左边) */}
        <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium text-slate-700 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              供应商总数
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
              截至累计
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
              {SUPPLIER_COUNT_DATA.totalCount.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-slate-500">家</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            展示截至筛选结束日的累计有效供应商总数
          </div>
        </div>

        {/* 指标卡 2：新增供应商数 (右边，随右上角时间周期联动) */}
        <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium text-slate-700 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              新增供应商数
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
              {timeLabel}新增
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl font-bold font-mono text-blue-600 tracking-tight">
              {trendResult.totalCount.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-slate-500">家</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            展示当前筛选周期（{timeLabel}）内新增供应商总数
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 第二行：新增供应商趋势 (折线图，独立卡片展示走势，按经营总览规则展示) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-blue-600 rounded-xs" />
            <h3 className="text-xs font-semibold text-slate-800 tracking-wide flex items-center gap-1.5">
              <LineChartIcon className="w-3.5 h-3.5 text-blue-600" />
              新增供应商趋势
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {trendResult.subLabel}
          </span>
        </div>

        {/* 核心规则5：自选时间段如果时间大于30天，那么不展示 */}
        {trendResult.isOverLimit ? (
          <div
            id="supplier-trend-chart-over-limit"
            className="h-64 flex flex-col items-center justify-center bg-slate-50/70 border border-dashed border-slate-200 rounded-md p-6 text-center"
          >
            <div className="w-11 h-11 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mb-3">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800 mb-1.5">
              自选时间段跨度为 {trendResult.diffDays} 天（大于 30 天上限）
            </h4>
            <p className="text-xs text-slate-500 max-w-md leading-relaxed mb-3">
              根据业务规则，趋势图仅支持展示不超过 30 天的每日明细走势。当前所选时间跨度较大，暂不绘制每日折线趋势图。
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200 rounded px-3 py-1.5 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>
                建议：将右上角时间段调整至 30 天以内查看每日走势，或切换至
                <span className="font-semibold text-blue-600 ml-1">【近一年】</span>
                查看月度汇总走势。
              </span>
            </div>
          </div>
        ) : (
          <div className="h-72">
            <EChartWrapper option={newLineOption} height="100%" />
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 第三行：供应商分类分析 (全部只保留累计分布) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-blue-600 rounded-xs" />
            <h3 className="text-xs font-semibold text-slate-800 tracking-wide">
              供应商分类分析
            </h3>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              (算力、模型、智能体、终端、开发工具、运行服务、运营服务)
            </span>
          </div>

          <span className="text-[11px] text-slate-400">
            统计口径：累计有效供应商分布
          </span>
        </div>

        {/* 左右双图表 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* 左侧：7大类数量分布柱状图 (7列) */}
          <div className="lg:col-span-7 bg-slate-50/40 border border-slate-200/80 rounded-md p-3.5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                <h4 className="text-xs font-semibold text-slate-800">
                  供应商分类数量分布
                </h4>
              </div>
              <span className="text-[10px] text-slate-400">
                统计口径：累计有效供应商
              </span>
            </div>
            <div className="h-72">
              <EChartWrapper option={categoryBarOption} height="100%" />
            </div>
          </div>

          {/* 右侧：7大类结构环形图 (5列) */}
          <div className="lg:col-span-5 bg-slate-50/40 border border-slate-200/80 rounded-md p-3.5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <PieChartIcon className="w-3.5 h-3.5 text-blue-600" />
                <h4 className="text-xs font-semibold text-slate-800">
                  供应商分类结构占比
                </h4>
              </div>
              <span className="text-[10px] text-slate-400">
                共 7 大服务分类
              </span>
            </div>
            <div className="h-72">
              <EChartWrapper option={categoryPieOption} height="100%" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
