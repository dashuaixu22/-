import React, { useState, useMemo } from 'react';
import { TimeRangeType } from '../types';
import { EChartWrapper } from './EChartWrapper';
import {
  PRODUCT_VALUE_DATA,
  TOP10_VAS_SALES_PRODUCTS,
} from '../data/productAnalysisMockData';
import { VAS_SERVICE_COLORS } from '../data/overviewMockData';
import * as echarts from 'echarts';
import {
  DollarSign,
  Users,
  Package,
  ShoppingBag,
  BarChart2,
  Trophy,
} from 'lucide-react';

export const ProductValueView: React.FC = () => {
  // 整体时间选择: 'today' | 'week' | 'month' | 'year' | 'total'
  const [globalTimeTab, setGlobalTimeTab] = useState<TimeRangeType | 'total'>('year');

  // 下方横向柱状图的指标切换
  const [selectedCategoryMetric, setSelectedCategoryMetric] = useState<
    'arpu' | 'customerAvgPrice' | 'productAvgPrice' | 'customerAvgOrders'
  >('arpu');

  // 映射时间周期（customerAndProductValue 仅有 today/week/month/year）
  const periodKey: TimeRangeType = globalTimeTab === 'total' ? 'year' : globalTimeTab;

  // 1. 客单价
  const currentArpuValue = PRODUCT_VALUE_DATA.arpuPerformance.arpuValues[globalTimeTab];

  // 2. 客户均价
  const customerAvgPriceValue =
    PRODUCT_VALUE_DATA.customerAndProductValue.customerAvgPrice[periodKey];

  // 3. 产品均价
  const productAvgPriceValue =
    PRODUCT_VALUE_DATA.customerAndProductValue.productAvgPrice[periodKey];

  // 4. 客户平均订单数
  const customerAvgOrdersValue =
    PRODUCT_VALUE_DATA.customerAndProductValue.customerAvgOrders[periodKey];

  // 综合横向柱状图 (不同增值服务类别的价值对比)
  const categoryMetricBarOption: echarts.EChartsOption = useMemo(() => {
    let metricName = '增值服务客单价';
    let unit = '元';
    let prefix = '¥';
    let yNames: string[] = [];
    let values: number[] = [];

    if (selectedCategoryMetric === 'arpu') {
      metricName = '增值服务客单价';
      unit = '元';
      prefix = '¥';
      const list = [...PRODUCT_VALUE_DATA.arpuPerformance.categoryArpu].reverse();
      yNames = list.map((d) => d.name);
      values = list.map((d) => d.arpu);
    } else {
      const list = [...PRODUCT_VALUE_DATA.customerAndProductValue.byCategoryMetrics].reverse();
      yNames = list.map((d) => d.name);
      if (selectedCategoryMetric === 'customerAvgPrice') {
        metricName = '增值服务客户均价';
        unit = '元';
        prefix = '¥';
        values = list.map((d) => d.customerAvgPrice);
      } else if (selectedCategoryMetric === 'productAvgPrice') {
        metricName = '增值服务产品均价';
        unit = '元';
        prefix = '¥';
        values = list.map((d) => d.productAvgPrice);
      } else {
        metricName = '客户平均订单数';
        unit = '笔/人';
        prefix = '';
        values = list.map((d) => d.customerAvgOrders);
      }
    }

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
              <span>${metricName}:</span>
              <strong style="color: #0891B2;">${prefix}${Number(item.value).toLocaleString()} ${unit}</strong>
            </div>
          `;
        },
      },
      grid: {
        top: 20,
        right: 65,
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
          formatter: (val: any) => `${prefix}${val}`,
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
          name: metricName,
          type: 'bar',
          barWidth: 14,
          data: yNames.map((name, i) => ({
            value: values[i],
            itemStyle: {
              color: VAS_SERVICE_COLORS[name] || '#06B6D4',
              borderRadius: [0, 4, 4, 0],
            },
          })),
          label: {
            show: true,
            position: 'right',
            color: '#64748B',
            fontSize: 10.5,
            formatter: (p: any) =>
              `${prefix}${Number(p.value).toLocaleString()} ${unit}`,
          },
        },
      ],
    };
  }, [selectedCategoryMetric]);

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 顶部：整体时间选择器 */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">统计周期：</span>
          <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setGlobalTimeTab('today')}
              className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
                globalTimeTab === 'today'
                  ? 'bg-white font-semibold text-cyan-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              当日
            </button>
            <button
              type="button"
              onClick={() => setGlobalTimeTab('week')}
              className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
                globalTimeTab === 'week'
                  ? 'bg-white font-semibold text-cyan-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              近一周
            </button>
            <button
              type="button"
              onClick={() => setGlobalTimeTab('month')}
              className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
                globalTimeTab === 'month'
                  ? 'bg-white font-semibold text-cyan-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              近一月
            </button>
            <button
              type="button"
              onClick={() => setGlobalTimeTab('year')}
              className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
                globalTimeTab === 'year'
                  ? 'bg-white font-semibold text-cyan-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              近一年
            </button>
            <button
              type="button"
              onClick={() => setGlobalTimeTab('total')}
              className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
                globalTimeTab === 'total'
                  ? 'bg-white font-semibold text-cyan-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              累计
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 核心指标卡行：客单价、客户均价、产品均价、客户平均订单数 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 卡片 1: 增值服务客单价 */}
        <div
          id="card-product-value-arpu"
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600">
              <DollarSign className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-700">
              增值服务客单价
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-1">
              <span className="text-sm text-slate-500 font-medium">¥</span>
              <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono">
                {currentArpuValue.toLocaleString()}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              选定周期内每笔增值订单的平均销售金额
            </p>
          </div>
        </div>

        {/* 卡片 2: 增值服务客户均价 */}
        <div
          id="card-customer-avg-price"
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-700">
              增值服务客户均价
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-1">
              <span className="text-sm text-slate-500 font-medium">¥</span>
              <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono">
                {customerAvgPriceValue.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 font-normal ml-1">
                / 人
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              单一客户在选定周期内的平均增值服务消费
            </p>
          </div>
        </div>

        {/* 卡片 3: 增值服务产品均价 */}
        <div
          id="card-product-avg-price"
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600">
              <Package className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-700">
              增值服务产品均价
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-1">
              <span className="text-sm text-slate-500 font-medium">¥</span>
              <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono">
                {productAvgPriceValue.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 font-normal ml-1">
                / 项
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              各项增值服务产品平均单项产出价值
            </p>
          </div>
        </div>

        {/* 卡片 4: 客户平均订单数 */}
        <div
          id="card-customer-avg-orders"
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-700">
              客户平均订单数
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono">
                {customerAvgOrdersValue}
              </span>
              <span className="text-sm text-slate-500 font-medium">笔 / 人</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              选定周期内平均每位付费客户订购服务频次
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 类别价值对比图表 (单坐标轴横向条形图) */}
      {/* ========================================================================= */}
      <div
        id="product-value-category-metrics-section"
        className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-600" />
              各增值服务类别价值对比
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              切换查看不同指标在各增值服务类别中的表现差异（单坐标轴）
            </p>
          </div>

          {/* 指标单选切换 */}
          <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setSelectedCategoryMetric('arpu')}
              className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
                selectedCategoryMetric === 'arpu'
                  ? 'bg-cyan-600 font-medium text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              增值服务客单价
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategoryMetric('customerAvgPrice')}
              className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
                selectedCategoryMetric === 'customerAvgPrice'
                  ? 'bg-cyan-600 font-medium text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              增值服务客户均价
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategoryMetric('productAvgPrice')}
              className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
                selectedCategoryMetric === 'productAvgPrice'
                  ? 'bg-cyan-600 font-medium text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              增值服务产品均价
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategoryMetric('customerAvgOrders')}
              className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
                selectedCategoryMetric === 'customerAvgOrders'
                  ? 'bg-cyan-600 font-medium text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              客户平均订单数
            </button>
          </div>
        </div>

        <div className="h-[380px] w-full">
          <EChartWrapper option={categoryMetricBarOption} />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 第四行：增值服务销售 Top 10 的产品 (只按金额排序，无对比图，仅保留信息列表) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
          <span className="w-1.5 h-3.5 bg-cyan-600 rounded-xs" />
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold text-slate-800 tracking-wide">
              增值服务销售 Top 10 的产品
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            (按销售金额降序排列)
          </span>
        </div>

        {/* 精炼排行榜明细信息列表 */}
        <div className="border border-slate-200/80 rounded-md overflow-hidden">
          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-semibold">
            <span className="w-1/2">产品名称 / 类别</span>
            <span className="w-1/4 text-center">产品单价 / 订单笔数</span>
            <span className="w-1/4 text-right">销售金额</span>
          </div>
          <div className="divide-y divide-slate-100">
            {TOP10_VAS_SALES_PRODUCTS.map((prod) => (
              <div
                key={prod.productName}
                className="p-3 px-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-xs"
              >
                {/* 排名 + 产品名 + 类别 */}
                <div className="flex items-center gap-3 min-w-0 w-1/2">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0 ${
                      prod.rank === 1
                        ? 'bg-amber-400 text-white shadow-xs'
                        : prod.rank === 2
                        ? 'bg-slate-300 text-slate-800 shadow-xs'
                        : prod.rank === 3
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {prod.rank}
                  </span>
                  <div className="min-w-0">
                    <div className="text-slate-800 font-medium truncate" title={prod.productName}>
                      {prod.productName}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span className="bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 text-slate-600">
                        {prod.categoryName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 单价与订单笔数 */}
                <div className="w-1/4 text-center">
                  <div className="font-mono text-slate-700">¥{prod.avgPrice.toLocaleString()} 元/笔</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">{prod.orderCount.toLocaleString()} 笔订单</div>
                </div>

                {/* 销售金额 */}
                <div className="w-1/4 text-right shrink-0">
                  <div className="font-mono font-bold text-cyan-700 text-sm">
                    ¥{prod.salesAmount.toLocaleString(undefined, { minimumFractionDigits: 1 })} 万元
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
