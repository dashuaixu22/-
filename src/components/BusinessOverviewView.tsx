import React, { useMemo } from 'react';
import { TimeRangeType } from '../types';
import { EChartWrapper } from './EChartWrapper';
import {
  BUSINESS_OVERVIEW_DATA,
  SUPPLY_DEMAND_TX_DATA,
  VAS_OPERATIONS_DATA,
  BASIC_SERVICE_COLORS,
  VAS_SERVICE_COLORS,
} from '../data/overviewMockData';
import { TODAY } from '../data/mockData';
import * as echarts from 'echarts';
import {
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  BarChart3,
  Calendar,
  AlertCircle,
} from 'lucide-react';

interface BusinessOverviewViewProps {
  timeRange: TimeRangeType;
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

interface TrendResult {
  dates: string[];
  incomes: number[];
  isOverLimit: boolean;
  diffDays: number;
  subLabel: string;
  unitLabel: string;
  xAxisType: 'hour' | 'day' | 'month';
}

/**
 * 核心图表对应展示规则：
 * 1. 选择当日：展示 24 个小时（0:00 至 23:00），逐小时统计
 * 2. 选择近一周：返回7日每日
 * 3. 选择近一月：返回近30日的每日
 * 4. 选择近一年：返回从上个月往前推12个月的数据，每个月都是对应月份的总计
 * 5. 自选时间段：展示全部，如果时间大于30天，那么不展示
 */
function computeTrendData(
  timeRange: TimeRangeType,
  startDateStr?: string,
  endDateStr?: string
): TrendResult {
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
    // 24小时各小时收入（万元），合计 12.8 万元
    const incomes = [
      0.2, 0.1, 0.1, 0.1, 0.1, 0.2, 0.3, 0.5, 0.7, 0.9, 1.0, 1.1,
      1.2, 1.1, 0.9, 0.8, 0.8, 0.9, 0.8, 0.5, 0.3, 0.2, 0.1, 0.0
    ];
    return {
      dates,
      incomes,
      isOverLimit: false,
      diffDays: 1,
      subLabel: '当日 24 小时收入金额走势（共 24 个时段，逐小时统计）',
      unitLabel: '时段收入',
      xAxisType: 'hour',
    };
  }

  // 2. 选择近一周：返回7日每日
  if (timeRange === 'week') {
    const end = parseDateStr(refEnd);
    const dates: string[] = [];
    // 7日每日收入（万元）
    const incomes = [11.2, 11.8, 12.0, 12.6, 13.1, 12.9, 12.8];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(end.getDate() - i);
      dates.push(formatMMDD(d));
    }
    return {
      dates,
      incomes,
      isOverLimit: false,
      diffDays: 7,
      subLabel: `近一周每日收入金额走势（共 7 日，${dates[0]} 至 ${dates[dates.length - 1]}）`,
      unitLabel: '每日收入',
      xAxisType: 'day',
    };
  }

  // 3. 选择近一月：返回近30日的每日
  if (timeRange === 'month') {
    const end = parseDateStr(refEnd);
    const dates: string[] = [];
    const incomes: number[] = [
      10.2, 10.5, 10.8, 11.1, 10.9, 11.4, 11.2, 11.6, 11.3, 11.8,
      11.5, 12.0, 11.7, 12.2, 11.9, 12.4, 12.1, 12.5, 12.2, 12.6,
      12.3, 12.8, 12.4, 11.2, 11.8, 12.0, 12.6, 13.1, 12.9, 12.8,
    ];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(end.getDate() - i);
      dates.push(formatMMDD(d));
    }
    return {
      dates,
      incomes,
      isOverLimit: false,
      diffDays: 30,
      subLabel: `近一月每日收入金额走势（共 30 日，${dates[0]} 至 ${dates[dates.length - 1]}）`,
      unitLabel: '每日收入',
      xAxisType: 'day',
    };
  }

  // 4. 选择近一年：返回从上个月往前推12个月的数据，每个月都是对应月份的总计
  if (timeRange === 'year') {
    const end = parseDateStr(refEnd);
    const endYear = end.getFullYear();
    const endMonth = end.getMonth(); // 0 表示1月，7 表示8月

    const dates: string[] = [];
    // 12个月各月总计收入（万元）
    const incomes = [
      265.0, 280.5, 298.0, 312.0, 305.0, 318.0,
      326.0, 335.0, 342.0, 348.0, 345.0, 352.0
    ];

    // 上个月是 endMonth - 1，从上个月往前推 12 个月（即共 12 个月，最后一个月为上个月）
    for (let i = 11; i >= 0; i--) {
      const targetDate = new Date(endYear, endMonth - 1 - i, 1);
      const y = targetDate.getFullYear();
      const m = String(targetDate.getMonth() + 1).padStart(2, '0');
      dates.push(`${y}-${m}`);
    }

    return {
      dates,
      incomes,
      isOverLimit: false,
      diffDays: 365,
      subLabel: `近一年月度总计收入走势（从上月往前推 12 个月：${dates[0]} 至 ${dates[dates.length - 1]}）`,
      unitLabel: '月度总计',
      xAxisType: 'month',
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
      incomes: [],
      isOverLimit: true,
      diffDays,
      subLabel: `自选时间段（${refStart} 至 ${refEnd}，共 ${diffDays} 天）`,
      unitLabel: '每日收入',
      xAxisType: 'day',
    };
  }

  // <= 30天：展示全部每日明细
  const dates: string[] = [];
  const incomes: number[] = [];
  for (let i = 0; i < diffDays; i++) {
    const cur = new Date(sDate);
    cur.setDate(sDate.getDate() + i);
    dates.push(formatMMDD(cur));
    // 模拟每日收入平滑波动 (10.0 ~ 13.5 万元)
    const val = 11.2 + Math.sin(i * 0.7) * 1.4 + ((i % 4) * 0.3);
    incomes.push(Number(val.toFixed(1)));
  }

  return {
    dates,
    incomes,
    isOverLimit: false,
    diffDays,
    subLabel: `自选时间段每日收入走势（${refStart} 至 ${refEnd}，共 ${diffDays} 天全部展示）`,
    unitLabel: '每日收入',
    xAxisType: 'day',
  };
}

export const BusinessOverviewView: React.FC<BusinessOverviewViewProps> = ({
  timeRange,
  startDate,
  endDate,
}) => {
  const data = BUSINESS_OVERVIEW_DATA[timeRange] || BUSINESS_OVERVIEW_DATA.month;
  const supplyData = SUPPLY_DEMAND_TX_DATA[timeRange] || SUPPLY_DEMAND_TX_DATA.month;
  const vasData = VAS_OPERATIONS_DATA[timeRange] || VAS_OPERATIONS_DATA.month;

  // 计算趋势图展示数据及规则判断
  const trendResult = useMemo(() => {
    return computeTrendData(timeRange, startDate, endDate);
  }, [timeRange, startDate, endDate]);

  // 当前周期标签
  const timeLabel = useMemo(() => {
    if (timeRange === 'year') return '近一年';
    if (timeRange === 'month') return '近一月';
    if (timeRange === 'week') return '近一周';
    if (timeRange === 'today') return '当日';
    return `自选(${trendResult.diffDays}天)`;
  }, [timeRange, trendResult.diffDays]);

  // 自选周期时动态计算新增收入与新增交易额
  const newIncomeDisplay = useMemo(() => {
    if (timeRange === 'custom') {
      return (trendResult.diffDays * 11.8).toFixed(1);
    }
    return data.newIncome.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }, [timeRange, trendResult.diffDays, data.newIncome]);

  const newTxAmountDisplay = useMemo(() => {
    if (timeRange === 'custom') {
      return (trendResult.diffDays * 218.0).toFixed(1);
    }
    return supplyData.newTxAmount.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }, [timeRange, trendResult.diffDays, supplyData.newTxAmount]);

  // 1. 横向堆叠柱状图：基础服务与增值服务各类别收入构成
  const stackedHorizontalBarOption: echarts.EChartsOption = useMemo(() => {
    const basicCats = supplyData.categories;
    const vasCats = vasData.categories;

    // 自选时间段时的缩放因子
    const scaleFactor = timeRange === 'custom' ? trendResult.diffDays / 30 : 1;

    const series: any[] = [];

    // 基础服务类别堆叠项 (在基础服务柱上展示金额，在增值服务柱上为 0)
    basicCats.forEach((cat) => {
      const val = Number((cat.newCommission * scaleFactor).toFixed(1));
      series.push({
        name: cat.name,
        type: 'bar',
        stack: 'income',
        barWidth: 26,
        data: [0, val],
        itemStyle: {
          color: BASIC_SERVICE_COLORS[cat.name] || '#2563EB',
        },
      });
    });

    // 增值服务类别堆叠项 (在增值服务柱上展示金额，在基础服务柱上为 0)
    vasCats.forEach((cat) => {
      const val = Number((cat.newIncome * scaleFactor).toFixed(1));
      series.push({
        name: cat.name,
        type: 'bar',
        stack: 'income',
        barWidth: 26,
        data: [val, 0],
        itemStyle: {
          color: VAS_SERVICE_COLORS[cat.name] || '#06B6D4',
        },
      });
    });

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          if (!Array.isArray(params) || params.length === 0) return '';
          const axisName = params[0].axisValue;
          const activeItems = params.filter((p: any) => Number(p.value) > 0);
          const total = activeItems.reduce((sum: number, p: any) => sum + Number(p.value), 0);

          let html = `
            <div style="font-size: 12px; font-weight: 600; color: #1e293b; margin-bottom: 6px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">
              ${axisName} - 各类别收入明细 (合计: ${total.toFixed(1)} 万元)
            </div>
            <div style="max-height: 220px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px;">
          `;

          activeItems.forEach((item: any) => {
            const ratio = total > 0 ? ((Number(item.value) / total) * 100).toFixed(1) : '0.0';
            html += `
              <div style="font-size: 11px; color: #475569; display: flex; justify-content: space-between; align-items: center; gap: 16px;">
                <span style="display: flex; align-items: center; gap: 6px;">
                  <span style="display: inline-block; width: 8px; height: 8px; border-radius: 2px; background-color: ${item.color};"></span>
                  ${item.seriesName}
                </span>
                <strong style="color: #1e293b; font-family: monospace;">${Number(item.value).toFixed(1)} 万元 (${ratio}%)</strong>
              </div>
            `;
          });

          html += `</div>`;
          return html;
        },
      },
      grid: {
        top: 24,
        right: 40,
        bottom: 24,
        left: 80,
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
        data: ['增值服务', '基础服务'],
        axisLine: { lineStyle: { color: '#E2E8F0' } },
        axisTick: { show: false },
        axisLabel: {
          color: '#1E293B',
          fontWeight: 600,
          fontSize: 12,
        },
      },
      series,
    };
  }, [supplyData, vasData, timeRange, trendResult.diffDays]);

  // 2. 环形图配置：平台收入构成
  const pieOption: echarts.EChartsOption = useMemo(() => {
    const scaleFactor = timeRange === 'custom' ? trendResult.diffDays / 30 : 1;
    const basicVal = Number((data.incomeComposition.basicCommission * scaleFactor).toFixed(1));
    const vasVal = Number((data.incomeComposition.vasIncome * scaleFactor).toFixed(1));
    const total = basicVal + vasVal;

    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `
            <div style="font-size: 12px; font-weight: 600; color: #1e293b; margin-bottom: 4px;">
              ${params.name}
            </div>
            <div style="font-size: 12px; color: #475569; display: flex; justify-content: space-between; gap: 16px;">
              <span>收入金额:</span>
              <strong style="color: ${params.color};">${params.value.toLocaleString()} 万元 (${params.percent}%)</strong>
            </div>
          `;
        },
      },
      legend: {
        orient: 'horizontal',
        bottom: 10,
        left: 'center',
        itemWidth: 10,
        itemHeight: 10,
        icon: 'circle',
        textStyle: {
          fontSize: 12,
          color: '#475569',
        },
        formatter: (name: string) => {
          const val = name === '基础服务佣金收入' ? basicVal : vasVal;
          const ratio = total > 0 ? ((val / total) * 100).toFixed(1) : '0.0';
          return `${name}  ${val} 万元 (${ratio}%)`;
        },
      },
      series: [
        {
          name: '平台收入构成',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['50%', '42%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 4,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 13,
              fontWeight: 'bold',
              formatter: '{b}\n{d}%',
            },
          },
          data: [
            {
              name: '基础服务佣金收入',
              value: basicVal,
              itemStyle: { color: '#2563EB' },
            },
            {
              name: '增值服务收入',
              value: vasVal,
              itemStyle: { color: '#06B6D4' },
            },
          ],
        },
      ],
    };
  }, [data, timeRange, trendResult.diffDays]);

  // 3. 折线图配置：收入增长趋势（根据对应展示规则生成坐标与数据）
  const lineOption: echarts.EChartsOption = useMemo(() => {
    if (trendResult.isOverLimit) {
      return {};
    }

    const { dates, incomes, xAxisType, unitLabel } = trendResult;

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: '#3B82F6',
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
              <strong style="color: #2563EB;">${Number(item.value).toFixed(1)} 万元</strong>
            </div>
          `;
        },
      },
      grid: {
        top: 24,
        right: 28,
        bottom: 28,
        left: 56,
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
          name: '收入金额',
          type: 'line',
          smooth: false,
          showSymbol: true,
          symbolSize: dates.length > 15 ? 4 : 6,
          data: incomes,
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

  return (
    <div className="space-y-4">
      {/* ========================================================================= */}
      {/* 第一行：两个总收入/累计卡片 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 指标卡 1：平台总收入 (截至累计) */}
        <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium text-slate-700">平台总收入</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
              截至累计
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
              {data.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
            <span className="text-xs font-medium text-slate-500">万元</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            截止到2026/09/01的平台累计总收入
          </div>
        </div>

        {/* 指标卡 2：平台交易总金额 (截至累计) */}
        <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium text-slate-700">平台交易总金额</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
              截至累计
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
              {(data.totalTxAmount / 10000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-medium text-slate-500">亿元</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            截止到2026/09/01的平台供需与增值交易累计总额
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 第二行：两个随周期变化的卡片 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 指标卡 3：平台新增收入 (当前周期) */}
        <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium text-slate-700">平台新增收入</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
              {timeLabel}新增
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
              {newIncomeDisplay}
            </span>
            <span className="text-xs font-medium text-slate-500">万元</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            展示当前筛选周期内新增的平台总收入
          </div>
        </div>

        {/* 指标卡 4：平台新增交易金额 (当前周期) */}
        <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium text-slate-700">平台新增交易金额</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
              {timeLabel}新增
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
              {newTxAmountDisplay}
            </span>
            <span className="text-xs font-medium text-slate-500">万元</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            展示当前筛选周期内新增的平台供需交易总金额
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 第三行：平台收入横向堆叠柱状图 + 平台收入构成环形图 (同一行) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 左侧：平台收入横向堆叠柱状图 (分基础服务、增值服务两个柱，由对应类别构成) */}
        <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-blue-600 rounded-xs" />
              <h3 className="text-xs font-semibold text-slate-800 tracking-wide flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                平台业务类别收入构成
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              {timeLabel}基础与增值各类别细分
            </span>
          </div>
          <div className="h-72">
            <EChartWrapper option={stackedHorizontalBarOption} height="100%" />
          </div>
        </div>

        {/* 右侧：平台收入构成 (环形图) */}
        <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-blue-600 rounded-xs" />
              <h3 className="text-xs font-semibold text-slate-800 tracking-wide flex items-center gap-1.5">
                <PieChartIcon className="w-3.5 h-3.5 text-blue-600" />
                平台收入构成
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              当前周期收入构成分布
            </span>
          </div>
          <div className="h-72">
            <EChartWrapper option={pieOption} height="100%" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 第四行：收入增长趋势 (折线图，独占一行整宽) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-blue-600 rounded-xs" />
            <h3 className="text-xs font-semibold text-slate-800 tracking-wide flex items-center gap-1.5">
              <LineChartIcon className="w-3.5 h-3.5 text-blue-600" />
              收入增长趋势
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {trendResult.subLabel}
          </span>
        </div>

        {/* 核心规则5：自选时间段如果时间大于30天，那么不展示 */}
        {trendResult.isOverLimit ? (
          <div
            id="trend-chart-over-limit"
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
          <div className="h-64">
            <EChartWrapper option={lineOption} height="100%" />
          </div>
        )}
      </div>
    </div>
  );
};
