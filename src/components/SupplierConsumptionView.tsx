import React, { useState, useMemo } from 'react';
import { TimeRangeType } from '../types';
import { EChartWrapper } from './EChartWrapper';
import {
  SUPPLIER_CONSUMPTION_DATA,
  TOP10_VAS_CONSUMPTION_SUPPLIERS,
} from '../data/supplierAnalysisMockData';
import { VAS_SERVICE_COLORS } from '../data/overviewMockData';
import * as echarts from 'echarts';
import {
  Users,
  ShoppingBag,
  DollarSign,
  BarChart3,
  PieChart as PieChartIcon,
  Trophy,
  Building2,
} from 'lucide-react';

interface SupplierConsumptionViewProps {
  timeRange?: TimeRangeType;
}

export const SupplierConsumptionView: React.FC<SupplierConsumptionViewProps> = ({ timeRange = 'year' }) => {
  const timeLabel =
    timeRange === 'year'
      ? '近一年'
      : timeRange === 'month'
      ? '近一月'
      : timeRange === 'today'
      ? '当日'
      : '近一周';
  const rangeData = SUPPLIER_CONSUMPTION_DATA.byRange[timeRange] || SUPPLIER_CONSUMPTION_DATA.byRange.week;

  // 增值服务消费分类查看模式：'new' (周期新增消费) | 'total' (累计消费)
  const [viewMode, setViewMode] = useState<'new' | 'total'>('new');
  const isNew = viewMode === 'new';

  // =========================================================================
  // 图表 1：横向柱状图 (不同增值服务类别消费金额比较)
  // =========================================================================
  const horizontalBarOption: echarts.EChartsOption = useMemo(() => {
    const rawCategories = rangeData.categories;
    // 逆序以让大值排在最上方
    const categories = [...rawCategories].reverse();
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
              <span>${isNew ? timeLabel + '新增消费' : '累计消费'}:</span>
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
          name: isNew ? '新增消费金额' : '累计消费金额',
          type: 'bar',
          barWidth: 14,
          data: categories.map((c) => ({
            value: isNew ? c.newAmount : c.totalAmount,
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
  }, [rangeData, isNew, timeLabel]);

  // =========================================================================
  // 图表 2：环形图 (不同增值服务类别的金额构成)
  // =========================================================================
  const pieOption: echarts.EChartsOption = useMemo(() => {
    const pieData = rangeData.categories.map((c) => ({
      name: c.name,
      value: isNew ? c.newAmount : c.totalAmount,
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
              <span>${isNew ? timeLabel + '消费' : '累计消费'}:</span>
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
          const item = rangeData.categories.find((c) => c.name === name);
          const val = item ? (isNew ? item.newAmount : item.totalAmount) : 0;
          return `${name.length > 7 ? name.slice(0, 7) + '..' : name}  ${val} 万`;
        },
      },
      series: [
        {
          name: '消费金额构成',
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
  }, [rangeData, isNew, timeLabel]);

  // =========================================================================
  // 图表 3：消费增值服务金额 Top 10 商家 (横向柱状图，按金额降序排布)
  // =========================================================================
  const top10BarOption: echarts.EChartsOption = useMemo(() => {
    // 逆序排列以让 Top 1 排在图表最顶端
    const reversed = [...TOP10_VAS_CONSUMPTION_SUPPLIERS].reverse();
    const yNames = reversed.map((s) => s.supplierName);
    const amounts = reversed.map((s) => s.amountByRange[timeRange] || s.amountByRange.year);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const item = Array.isArray(params) ? params[0] : params;
          const sup = TOP10_VAS_CONSUMPTION_SUPPLIERS.find((s) => s.supplierName === item.name);
          return `
            <div style="font-size: 12px; font-weight: 600; color: #1e293b; margin-bottom: 4px;">
              第 ${sup?.rank} 名: ${item.name}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">
              类别: ${sup?.category} | 订购门类: ${sup?.mainVasService}
            </div>
            <div style="font-size: 12px; color: #475569; display: flex; justify-content: space-between; gap: 16px;">
              <span>${timeLabel}增值服务消费:</span>
              <strong style="color: #0891B2;">${Number(item.value).toLocaleString()} 万元</strong>
            </div>
          `;
        },
      },
      grid: {
        top: 16,
        right: 64,
        bottom: 20,
        left: 200,
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
          color: '#334155',
          fontSize: 11,
          formatter: (value: string) => {
            return value.length > 12 ? value.slice(0, 12) + '…' : value;
          },
        },
      },
      series: [
        {
          name: '增值服务消费金额',
          type: 'bar',
          barWidth: 14,
          data: amounts.map((val, idx) => {
            const originalRank = reversed[idx].rank;
            // 前三名使用醒目的渐变色强调
            const barColor =
              originalRank === 1
                ? '#0891B2'
                : originalRank === 2
                ? '#06B6D4'
                : originalRank === 3
                ? '#0284C7'
                : '#38BDF8';
            return {
              value: val,
              itemStyle: {
                color: barColor,
                borderRadius: [0, 4, 4, 0],
              },
            };
          }),
          label: {
            show: true,
            position: 'right',
            color: '#64748B',
            fontSize: 10.5,
            formatter: (p: any) => `${p.value} 万元`,
          },
        },
      ],
    };
  }, [timeRange, timeLabel]);

  return (
    <div className="space-y-4">
      {/* ========================================================================= */}
      {/* 第一行：两个同等大小的核心指标卡 (总数放在最左边，新增数放到右边) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 指标卡 1：供应商消费总金额 (截至筛选结束日累计值 - 放最左边) */}
        <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium text-slate-700 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-cyan-600" />
              增值服务消费总金额
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
              截至累计
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
              {SUPPLIER_CONSUMPTION_DATA.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
            <span className="text-xs font-medium text-slate-500">万元</span>
          </div>

          {/* 辅助细分指标：累计付费供应商数与累计订单数 */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>累计付费供应商:</span>
              <strong className="text-slate-700 font-mono font-medium">
                {SUPPLIER_CONSUMPTION_DATA.totalPaidSuppliers} 家
              </strong>
            </span>
            <span className="flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
              <span>累计消费订单:</span>
              <strong className="text-slate-700 font-mono font-medium">
                {SUPPLIER_CONSUMPTION_DATA.totalOrders.toLocaleString()} 笔
              </strong>
            </span>
          </div>
        </div>

        {/* 指标卡 2：新增消费金额 (当前筛选周期数据 - 放右边) */}
        <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium text-slate-700 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-cyan-600" />
              新增消费金额
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-cyan-50 text-cyan-700 border border-cyan-100">
              {timeLabel}新增
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl font-bold font-mono text-cyan-700 tracking-tight">
              {rangeData.newAmount.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
            <span className="text-xs font-medium text-slate-500">万元</span>
          </div>

          {/* 辅助细分指标：本期付费供应商数与新增订单数 */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-600" />
              <span>本期付费供应商:</span>
              <strong className="text-cyan-700 font-mono font-medium">
                {rangeData.paidSuppliers} 家
              </strong>
            </span>
            <span className="flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-cyan-600" />
              <span>本期新增订单:</span>
              <strong className="text-cyan-700 font-mono font-medium">
                {rangeData.newOrders.toLocaleString()} 笔
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 第二行：“增值服务消费分类”模块 (左侧柱状图 + 右侧环形图) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4">
        {/* 模块头部：标题与新增/累计切换按钮 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-cyan-600 rounded-xs" />
            <h3 className="text-xs font-semibold text-slate-800 tracking-wide">
              增值服务消费分类
            </h3>
          </div>

          {/* 新增消费 / 累计消费 切换按钮 */}
          <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setViewMode('new')}
              className={`px-3 py-1 rounded transition-all cursor-pointer ${
                isNew
                  ? 'bg-white text-cyan-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {timeLabel}新增消费
            </button>
            <button
              type="button"
              onClick={() => setViewMode('total')}
              className={`px-3 py-1 rounded transition-all cursor-pointer ${
                !isNew
                  ? 'bg-white text-cyan-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              累计消费
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
                  增值服务消费金额比较
                </h4>
              </div>
              <span className="text-[10px] text-slate-400">
                当前视图：{isNew ? timeLabel + '新增消费' : '累计消费'}
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
                  增值服务消费金额构成
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

      {/* ========================================================================= */}
      {/* 第三行：消费增值服务金额 Top 10 的商家 (柱状图 + 排行明细) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4">
        {/* 模块头部 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-cyan-600 rounded-xs" />
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-semibold text-slate-800 tracking-wide">
                消费增值服务金额 Top 10 商家
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              ({timeLabel}增值服务消费排名)
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            按消费金额降序排列
          </span>
        </div>

        {/* 左右结构：左侧横向柱状图 (60%)，右侧精炼排行榜明细卡片 (40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* 左侧横向柱状图 */}
          <div className="lg:col-span-7 bg-slate-50/40 border border-slate-200/80 rounded-md p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700">商家增值服务消费对比</span>
              <span className="text-[10px] text-slate-400">单位：万元</span>
            </div>
            <div className="h-96">
              <EChartWrapper option={top10BarOption} height="100%" />
            </div>
          </div>

          {/* 右侧明细排行榜列表 */}
          <div className="lg:col-span-5 border border-slate-200/80 rounded-md overflow-hidden">
            <div className="bg-slate-50 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-semibold">
              <span>商家名称 / 主营类别</span>
              <span>消费金额</span>
            </div>
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {TOP10_VAS_CONSUMPTION_SUPPLIERS.map((s) => {
                const amount = s.amountByRange[timeRange] || s.amountByRange.year;
                return (
                  <div
                    key={s.supplierId}
                    className="p-2.5 px-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0 ${
                          s.rank === 1
                            ? 'bg-amber-400 text-white shadow-xs'
                            : s.rank === 2
                            ? 'bg-slate-300 text-slate-800 shadow-xs'
                            : s.rank === 3
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {s.rank}
                      </span>
                      <div className="min-w-0">
                        <div className="text-slate-800 font-medium truncate max-w-[190px]" title={s.supplierName}>
                          {s.supplierName}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <span className="bg-slate-100 px-1 py-0.2 rounded border border-slate-200 text-slate-600">
                            {s.category}
                          </span>
                          <span>· 偏好: {s.mainVasService}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-cyan-700 text-xs">
                        ¥{amount.toLocaleString(undefined, { minimumFractionDigits: 1 })} 万
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {s.orderCount} 笔订单
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
