import React, { useState, useMemo } from 'react';
import { TimeRangeType } from '../types';
import { EChartWrapper } from './EChartWrapper';
import { PRODUCT_INFO_DATA } from '../data/productAnalysisMockData';
import { VAS_SERVICE_COLORS } from '../data/overviewMockData';
import * as echarts from 'echarts';
import {
  Layers,
  ShoppingBag,
  TrendingUp,
  PackageCheck,
  ChevronDown,
  ChevronUp,
  Boxes,
} from 'lucide-react';

export const ProductInfoView: React.FC = () => {
  // 1. 卡片 2 (新增订单数) 内部的独立时间 Tab
  const [newOrdersTab, setNewOrdersTab] = useState<TimeRangeType>('year');

  // 2. 第二行“增值服务类别”模块的模式切换：'new' (新增订单) | 'total' (累计订单)
  const [categoryMode, setCategoryMode] = useState<'new' | 'total'>('new');
  // 仅在新增订单模式下的时间 Tab
  const [categoryTimeRange, setCategoryTimeRange] = useState<TimeRangeType>('year');

  // 3. 第三行折叠分类列表状态（默认展开前4个或全部展开）
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    '客户分析服务': true,
    '营销服务': true,
    '销售服务': true,
    '售后服务': true,
  });

  const toggleCategoryExpand = (catName: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catName]: !prev[catName],
    }));
  };

  const toggleExpandAll = () => {
    const allExpanded = PRODUCT_INFO_DATA.categoryProductList.every(
      (c) => expandedCategories[c.categoryName]
    );
    const nextState: Record<string, boolean> = {};
    PRODUCT_INFO_DATA.categoryProductList.forEach((c) => {
      nextState[c.categoryName] = !allExpanded;
    });
    setExpandedCategories(nextState);
  };

  // 卡片 2 数值计算
  const newOrdersCardData = PRODUCT_INFO_DATA.newOrdersByRange[newOrdersTab];

  // 第二行图表数据计算
  const currentChartData = useMemo(() => {
    return PRODUCT_INFO_DATA.categoriesOrders.map((item) => {
      let value = item.totalCount;
      if (categoryMode === 'new') {
        if (categoryTimeRange === 'today') value = item.todayCount || 0;
        else if (categoryTimeRange === 'week') value = item.weekCount;
        else if (categoryTimeRange === 'month') value = item.monthCount;
        else value = item.yearCount;
      }
      return {
        name: item.name,
        value,
      };
    });
  }, [categoryMode, categoryTimeRange]);

  const currentTotalOrders = useMemo(() => {
    return currentChartData.reduce((sum, item) => sum + item.value, 0);
  }, [currentChartData]);

  const timeRangeLabel =
    categoryMode === 'total'
      ? '累计'
      : categoryTimeRange === 'year'
      ? '近一年'
      : categoryTimeRange === 'month'
      ? '近一月'
      : categoryTimeRange === 'week'
      ? '近一周'
      : '当日';

  // 图表 1: 横向柱状图 (不同增值服务类别的订单数量)
  const barChartOption: echarts.EChartsOption = useMemo(() => {
    const sortedData = [...currentChartData].reverse();
    const yNames = sortedData.map((d) => d.name);
    const values = sortedData.map((d) => d.value);

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
              <span>${timeRangeLabel}订单数:</span>
              <strong style="color: #0891B2;">${Number(item.value).toLocaleString()} 笔</strong>
            </div>
          `;
        },
      },
      grid: {
        top: 20,
        right: 55,
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
          formatter: '{value}',
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
          name: '订单数',
          type: 'bar',
          barWidth: 14,
          data: sortedData.map((c) => ({
            value: c.value,
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
            formatter: (p: any) => `${Number(p.value).toLocaleString()}`,
          },
        },
      ],
    };
  }, [currentChartData, timeRangeLabel]);

  // 图表 2: 环形饼图 (各类别订单构成)
  const pieChartOption: echarts.EChartsOption = useMemo(() => {
    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `
            <div style="font-size: 12px; font-weight: 600; color: #1e293b; margin-bottom: 4px;">
              ${params.name}
            </div>
            <div style="font-size: 12px; color: #475569; display: flex; justify-content: space-between; gap: 16px;">
              <span>${timeRangeLabel}订单数:</span>
              <strong style="color: #0891B2;">${Number(params.value).toLocaleString()} 笔 (${params.percent}%)</strong>
            </div>
          `;
        },
      },
      legend: {
        orient: 'vertical',
        right: '4%',
        top: 'middle',
        itemWidth: 10,
        itemHeight: 10,
        icon: 'circle',
        textStyle: {
          color: '#475569',
          fontSize: 11,
        },
      },
      series: [
        {
          name: '订单构成',
          type: 'pie',
          radius: ['45%', '72%'],
          center: ['36%', '50%'],
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
              fontSize: 12,
              fontWeight: 'bold',
              formatter: '{b}\n{d}%',
            },
          },
          data: currentChartData.map((d) => ({
            name: d.name,
            value: d.value,
            itemStyle: {
              color: VAS_SERVICE_COLORS[d.name] || '#06B6D4',
            },
          })),
        },
      ],
    };
  }, [currentChartData, timeRangeLabel]);

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. 第一行：三个统一规格指标卡 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 卡片 1: 产品类别（增值服务）- 无时间Tab */}
        <div
          id="product-info-card-category-count"
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-slate-700">
                产品类别（增值服务）
              </span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono">
                {PRODUCT_INFO_DATA.categoryCount}
              </span>
              <span className="text-sm text-slate-500 font-medium">类</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              覆盖 10 个增值业务方向，共 40 项产品
            </p>
          </div>
        </div>

        {/* 卡片 2: 新增订单数（增值服务）- 内部设置近一周、近一月、近一年Tab */}
        <div
          id="product-info-card-new-orders"
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-slate-700">
                新增订单数（增值服务）
              </span>
            </div>
            <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium text-slate-600">
              <button
                type="button"
                onClick={() => setNewOrdersTab('today')}
                className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                  newOrdersTab === 'today'
                    ? 'bg-white font-semibold text-cyan-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                当日
              </button>
              <button
                type="button"
                onClick={() => setNewOrdersTab('week')}
                className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                  newOrdersTab === 'week'
                    ? 'bg-white font-semibold text-cyan-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                近一周
              </button>
              <button
                type="button"
                onClick={() => setNewOrdersTab('month')}
                className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                  newOrdersTab === 'month'
                    ? 'bg-white font-semibold text-cyan-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                近一月
              </button>
              <button
                type="button"
                onClick={() => setNewOrdersTab('year')}
                className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                  newOrdersTab === 'year'
                    ? 'bg-white font-semibold text-cyan-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                近一年
              </button>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono">
                {newOrdersCardData.newOrders.toLocaleString()}
              </span>
              <span className="text-sm text-slate-500 font-medium">笔</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              <span className="text-slate-400">环比增长:</span>
              <span className="font-semibold text-emerald-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                {newOrdersCardData.growthRate}
              </span>
            </div>
          </div>
        </div>

        {/* 卡片 3: 订单总数（增值服务）- 无时间Tab */}
        <div
          id="product-info-card-total-orders"
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600">
                <PackageCheck className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-slate-700">
                订单总数（增值服务）
              </span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono">
                {PRODUCT_INFO_DATA.totalOrders.toLocaleString()}
              </span>
              <span className="text-sm text-slate-500 font-medium">笔</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              截至当前的累计有效增值服务订单数
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 第二行：“增值服务类别”模块 (新增/累计切换，柱状图 + 环形图) */}
      {/* ========================================================================= */}
      <div
        id="product-info-vas-categories-section"
        className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-cyan-600" />
              增值服务类别
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              各增值服务类别订单规模与构成占比（当前总计：
              <span className="font-semibold text-cyan-700">
                {currentTotalOrders.toLocaleString()} 笔
              </span>
              ）
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* 新增订单 / 累计订单 切换 */}
            <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium text-slate-600">
              <button
                type="button"
                onClick={() => setCategoryMode('new')}
                className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
                  categoryMode === 'new'
                    ? 'bg-white font-semibold text-cyan-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                新增订单
              </button>
              <button
                type="button"
                onClick={() => setCategoryMode('total')}
                className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
                  categoryMode === 'total'
                    ? 'bg-white font-semibold text-cyan-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                累计订单
              </button>
            </div>

            {/* 仅在选择“新增订单”时显示 当日/近一周/近一月/近一年 Tab */}
            {categoryMode === 'new' && (
              <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium text-slate-600">
                <button
                  type="button"
                  onClick={() => setCategoryTimeRange('today')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                    categoryTimeRange === 'today'
                      ? 'bg-cyan-600 font-medium text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  当日
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryTimeRange('week')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                    categoryTimeRange === 'week'
                      ? 'bg-cyan-600 font-medium text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  近一周
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryTimeRange('month')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                    categoryTimeRange === 'month'
                      ? 'bg-cyan-600 font-medium text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  近一月
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryTimeRange('year')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                    categoryTimeRange === 'year'
                      ? 'bg-cyan-600 font-medium text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  近一年
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 左侧柱状图 + 右侧环形图 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 items-center">
          <div className="lg:col-span-7">
            <div className="text-xs font-medium text-slate-500 mb-1">
              各类别订单数量分布 ({timeRangeLabel})
            </div>
            <div className="h-[320px] w-full">
              <EChartWrapper option={barChartOption} />
            </div>
          </div>
          <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
            <div className="text-xs font-medium text-slate-500 mb-1">
              各类别订单构成占比 ({timeRangeLabel})
            </div>
            <div className="h-[320px] w-full">
              <EChartWrapper option={pieChartOption} />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. 第三行：增值服务类别及其包含的具体产品 */}
      {/* ========================================================================= */}
      <div
        id="product-info-category-product-list"
        className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-600" />
              增值服务类别及具体产品清单
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              展示现有系统中 10 大增值服务类别及其包含的具体产品名称
            </p>
          </div>
          <button
            type="button"
            onClick={toggleExpandAll}
            className="text-xs font-medium text-cyan-600 hover:text-cyan-700 transition-colors flex items-center gap-1 cursor-pointer"
          >
            {PRODUCT_INFO_DATA.categoryProductList.every(
              (c) => expandedCategories[c.categoryName]
            )
              ? '全部折叠'
              : '全部展开'}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRODUCT_INFO_DATA.categoryProductList.map((categoryGroup, index) => {
            const isExpanded = Boolean(expandedCategories[categoryGroup.categoryName]);
            return (
              <div
                key={categoryGroup.categoryName}
                className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50"
              >
                {/* 类别标题行 */}
                <div
                  onClick={() => toggleCategoryExpand(categoryGroup.categoryName)}
                  className="px-4 py-3 bg-white flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors select-none"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          VAS_SERVICE_COLORS[categoryGroup.categoryName] || '#06B6D4',
                      }}
                    />
                    <span className="text-xs font-bold text-slate-800">
                      {index + 1}. {categoryGroup.categoryName}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                      {categoryGroup.products.length} 个产品
                    </span>
                  </div>
                  <div className="text-slate-400">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>

                {/* 包含的具体产品列表 */}
                {isExpanded && (
                  <div className="p-3 border-t border-slate-100 bg-slate-50/30">
                    <ul className="space-y-1.5">
                      {categoryGroup.products.map((productName, pIndex) => (
                        <li
                          key={productName}
                          className="flex items-center gap-2 text-xs text-slate-700 bg-white px-3 py-2 rounded border border-slate-200/80"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                          <span className="font-medium text-slate-800">{productName}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
