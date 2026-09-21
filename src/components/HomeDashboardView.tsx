import React, { useState, useMemo } from 'react';
import {
  Building2,
  Users,
  Package,
  CreditCard,
  ShoppingBag,
  Boxes,
  ArrowUpRight,
} from 'lucide-react';
import * as echarts from 'echarts';
import { EChartWrapper } from './EChartWrapper';

type SubTimeTab = 'week' | 'month' | 'year';

export const HomeDashboardView: React.FC = () => {
  // =========================================================================
  // 第一行：平台总收入内部时间 Tab (近一周 / 近一月 / 近一年)
  // 只控制新增平台收入和平台收入增长率，不影响平台总收入及构成累计值
  // =========================================================================
  const [revenueTab, setRevenueTab] = useState<SubTimeTab>('year');

  const revenueDataByTab = {
    week: {
      newIncome: '86.40',
      newIncomeRaw: '¥864,000',
      growthRate: '9.8%',
    },
    month: {
      newIncome: '345.80',
      newIncomeRaw: '¥3,458,000',
      growthRate: '14.2%',
    },
    year: {
      newIncome: '3,820.50',
      newIncomeRaw: '¥38,205,000',
      growthRate: '18.6%',
    },
  };

  // =========================================================================
  // 第三行：平台交易趋势 (交易金额与订单数量放在一张表/图里，双Y轴：左侧交易金额，右侧订单数量)
  // 近一周 / 近一月 / 近一年，默认近一年
  // =========================================================================
  const [txTimeTab, setTxTimeTab] = useState<SubTimeTab>('year');

  const txTrendOption: echarts.EChartsOption = useMemo(() => {
    const dataConfig = {
      week: {
        dates: ['08-22', '08-23', '08-24', '08-25', '08-26', '08-27', '08-28'],
        amount: [215.0, 228.0, 235.0, 246.0, 252.0, 240.0, 234.0],
        orders: [128, 135, 142, 150, 156, 148, 141],
      },
      month: {
        dates: ['08-01', '08-05', '08-09', '08-13', '08-17', '08-21', '08-25', '08-28'],
        amount: [760.0, 790.0, 815.0, 830.0, 825.0, 840.0, 835.0, 835.0],
        orders: [460, 475, 490, 505, 500, 510, 505, 505],
      },
      year: {
        dates: ['25-09', '25-10', '25-11', '25-12', '26-01', '26-02', '26-03', '26-04', '26-05', '26-06', '26-07', '26-08'],
        amount: [5100.0, 5350.0, 5600.0, 5920.0, 5800.0, 6050.0, 6200.0, 6380.0, 6450.0, 6600.0, 6530.0, 6585.0],
        orders: [3120, 3250, 3400, 3620, 3550, 3700, 3810, 3920, 3980, 4080, 4050, 4120],
      },
    }[txTimeTab];

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross', lineStyle: { color: '#94a3b8' } },
        formatter: (params: any) => {
          if (!Array.isArray(params)) return '';
          let tip = `<div style="font-weight:600;color:#1e293b;margin-bottom:4px;">${params[0]?.axisValue}</div>`;
          params.forEach((p) => {
            const unit = p.seriesName === '供需交易金额' ? '万元' : '笔';
            tip += `<div style="display:flex;justify-content:space-between;gap:20px;font-size:12px;color:#475569;">
              <span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};margin-right:6px;"></span>${p.seriesName}:</span>
              <strong style="color:#0f172a;">${p.value.toLocaleString()} ${unit}</strong>
            </div>`;
          });
          return tip;
        },
      },
      legend: {
        data: ['供需交易金额', '供需订单数量'],
        right: 16,
        top: 0,
        textStyle: { color: '#64748b', fontSize: 11 },
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
      },
      grid: {
        top: 36,
        right: 48,
        bottom: 24,
        left: 56,
      },
      xAxis: {
        type: 'category',
        data: dataConfig.dates,
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisLabel: { color: '#64748b', fontSize: 11 },
      },
      yAxis: [
        {
          type: 'value',
          name: '交易金额(万元)',
          nameTextStyle: { color: '#94a3b8', fontSize: 10.5, padding: [0, 0, 0, 12] },
          splitLine: { lineStyle: { color: '#f1f5f9' } },
          axisLabel: { color: '#64748b', fontSize: 10.5 },
        },
        {
          type: 'value',
          name: '订单数量(笔)',
          nameTextStyle: { color: '#94a3b8', fontSize: 10.5, padding: [0, 12, 0, 0] },
          splitLine: { show: false },
          axisLabel: { color: '#64748b', fontSize: 10.5 },
        },
      ],
      series: [
        {
          name: '供需交易金额',
          type: 'line',
          smooth: false,
          data: dataConfig.amount,
          yAxisIndex: 0,
          itemStyle: { color: '#1D4ED8' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(29,78,216,0.18)' },
              { offset: 1, color: 'rgba(29,78,216,0.01)' },
            ]),
          },
        },
        {
          name: '供需订单数量',
          type: 'line',
          smooth: false,
          data: dataConfig.orders,
          yAxisIndex: 1,
          itemStyle: { color: '#0284C7' },
          lineStyle: { width: 2.5 },
        },
      ],
    };
  }, [txTimeTab]);

  // =========================================================================
  // 第四行：平台主体增长趋势 (整行宽度折线图)
  // 新增供应商数 + 需求方新增用户数 (企业+个人用户合计)
  // =========================================================================
  const [entityTimeTab, setEntityTimeTab] = useState<SubTimeTab>('year');

  const entityTrendOption: echarts.EChartsOption = useMemo(() => {
    const dataConfig = {
      week: {
        dates: ['08-22', '08-23', '08-24', '08-25', '08-26', '08-27', '08-28'],
        suppliers: [2, 3, 2, 4, 3, 2, 2],
        users: [25, 32, 36, 29, 38, 27, 23],
      },
      month: {
        dates: ['08-01', '08-05', '08-09', '08-13', '08-17', '08-21', '08-25', '08-28'],
        suppliers: [5, 6, 5, 4, 6, 5, 5, 5],
        users: [88, 96, 102, 108, 95, 104, 92, 93],
      },
      year: {
        dates: ['25-09', '25-10', '25-11', '25-12', '26-01', '26-02', '26-03', '26-04', '26-05', '26-06', '26-07', '26-08'],
        suppliers: [11, 13, 14, 15, 12, 14, 16, 15, 17, 18, 16, 15],
        users: [448, 495, 594, 559, 712, 778, 620, 680, 710, 740, 760, 780],
      },
    }[entityTimeTab];

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'line', lineStyle: { color: '#94a3b8' } },
        formatter: (params: any) => {
          if (!Array.isArray(params)) return '';
          let tip = `<div style="font-weight:600;color:#1e293b;margin-bottom:4px;">${params[0]?.axisValue}</div>`;
          params.forEach((p) => {
            const unit = p.seriesName === '新增供应商数' ? '家' : '个';
            tip += `<div style="display:flex;justify-content:space-between;gap:20px;font-size:12px;color:#475569;">
              <span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};margin-right:6px;"></span>${p.seriesName}:</span>
              <strong style="color:#0f172a;">${p.value} ${unit}</strong>
            </div>`;
          });
          return tip;
        },
      },
      legend: {
        data: ['新增供应商数', '需求方新增用户数'],
        right: 16,
        top: 0,
        textStyle: { color: '#64748b', fontSize: 11 },
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
      },
      grid: {
        top: 36,
        right: 32,
        bottom: 24,
        left: 48,
      },
      xAxis: {
        type: 'category',
        data: dataConfig.dates,
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisLabel: { color: '#64748b', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#f1f5f9' } },
        axisLabel: { color: '#64748b', fontSize: 10.5 },
      },
      series: [
        {
          name: '新增供应商数',
          type: 'line',
          smooth: false,
          data: dataConfig.suppliers,
          itemStyle: { color: '#2563EB' },
          lineStyle: { width: 2.5 },
        },
        {
          name: '需求方新增用户数',
          type: 'line',
          smooth: false,
          data: dataConfig.users,
          itemStyle: { color: '#0284C7' },
          lineStyle: { width: 2.5 },
        },
      ],
    };
  }, [entityTimeTab]);

  // =========================================================================
  // 增值服务经营结构 (整行宽度卡片)
  // 顶部三个指标 + 左横向柱状图 + 右环形图 (收入 / 订单数 Tab)
  // 10类增值服务，环形图清晰展现颜色对应的类别与占比
  // =========================================================================
  const [vasMetric, setVasMetric] = useState<'income' | 'orders'>('income');

  const VAS_DATA = useMemo(
    () => [
      { name: '客户分析服务', income: 820.0, orders: 6420, color: '#0891B2' },
      { name: '营销服务', income: 740.0, orders: 5890, color: '#06B6D4' },
      { name: '销售服务', income: 615.0, orders: 5120, color: '#0E7490' },
      { name: '售后服务', income: 512.0, orders: 4680, color: '#14B8A6' },
      { name: '维系服务', income: 450.0, orders: 4210, color: '#0D9488' },
      { name: '广告服务', income: 405.0, orders: 3950, color: '#22D3EE' },
      { name: '发票代理', income: 330.0, orders: 3840, color: '#2DD4BF' },
      { name: '产品推荐', income: 258.0, orders: 3360, color: '#0284C7' },
      { name: '会员服务（商户）', income: 185.0, orders: 2980, color: '#155E75' },
      { name: '产品分析', income: 115.0, orders: 2400, color: '#047857' },
    ],
    []
  );

  // 增值服务结构 - 横向柱状图
  const vasBarOption: echarts.EChartsOption = useMemo(() => {
    const isIncome = vasMetric === 'income';
    const reversed = [...VAS_DATA].reverse();
    const categories = reversed.map((d) => d.name);
    const values = reversed.map((d) => (isIncome ? d.income : d.orders));
    const unit = isIncome ? '万元' : '笔';

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const item = Array.isArray(params) ? params[0] : params;
          return `<div style="font-weight:600;color:#1e293b;margin-bottom:4px;">${item.name}</div>
            <div style="font-size:12px;color:#475569;">
              ${isIncome ? '增值服务收入' : '增值服务订单数'}: <strong style="color:#0891B2;">${item.value.toLocaleString()} ${unit}</strong>
            </div>`;
        },
      },
      grid: {
        top: 10,
        right: 64,
        bottom: 16,
        left: 110,
      },
      xAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#f1f5f9' } },
        axisLabel: { color: '#94a3b8', fontSize: 10.5 },
      },
      yAxis: {
        type: 'category',
        data: categories,
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisTick: { show: false },
        axisLabel: { color: '#475569', fontSize: 11 },
      },
      series: [
        {
          name: isIncome ? '增值服务收入' : '增值服务订单数',
          type: 'bar',
          barWidth: 14,
          data: values.map((val, idx) => ({
            value: val,
            itemStyle: {
              color: reversed[idx].color,
              borderRadius: [0, 3, 3, 0],
            },
          })),
          label: {
            show: true,
            position: 'right',
            color: '#64748b',
            fontSize: 10.5,
            formatter: (p: any) => `${p.value.toLocaleString()}`,
          },
        },
      ],
    };
  }, [vasMetric, VAS_DATA]);

  // 增值服务结构 - 环形图 (显示颜色对应的类别与占比图例，确保图文颜色鲜明对应)
  const vasPieOption: echarts.EChartsOption = useMemo(() => {
    const isIncome = vasMetric === 'income';
    const unit = isIncome ? '万元' : '笔';
    const totalVal = isIncome ? 4430.0 : 42850;
    const pieData = VAS_DATA.map((d) => ({
      name: d.name,
      value: isIncome ? d.income : d.orders,
      itemStyle: { color: d.color },
    }));

    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `<div style="font-weight:600;color:#1e293b;margin-bottom:4px;">
            <span style="display:inline-block;width:9px;height:9px;border-radius:2px;background:${params.color};margin-right:6px;"></span>${params.name}
          </div>
          <div style="font-size:12px;color:#475569;">
            ${isIncome ? '增值服务收入' : '订购订单数'}: <strong style="color:#0891B2;">${params.value.toLocaleString()} ${unit}</strong> (${params.percent}%)
          </div>`;
        },
      },
      legend: {
        type: 'scroll',
        orient: 'vertical',
        right: '4%',
        top: 'middle',
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 8,
        textStyle: {
          fontSize: 11.5,
          color: '#334155',
        },
        formatter: (name: string) => {
          const item = VAS_DATA.find((d) => d.name === name);
          if (!item) return name;
          const val = isIncome ? item.income : item.orders;
          const pct = ((val / totalVal) * 100).toFixed(1);
          return `${name.padEnd(8, ' ')}  ${pct}% (${val.toLocaleString()}${unit})`;
        },
      },
      series: [
        {
          name: isIncome ? '增值服务收入' : '增值服务订单数',
          type: 'pie',
          radius: ['42%', '70%'],
          center: ['28%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderColor: '#ffffff',
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
          data: pieData,
        },
      ],
    };
  }, [vasMetric, VAS_DATA]);

  return (
    <div id="home-refactored-view" className="max-w-[1440px] mx-auto space-y-4 pb-6">
      {/* ========================================================================= */}
      {/* 第一行：平台总收入卡片 (整行宽度，深蓝色科技渐变背景) */}
      {/* ========================================================================= */}
      <div
        id="home-row1-platform-revenue"
        className="rounded-md p-5 bg-gradient-to-r from-[#0a1936] via-[#0f2d6b] to-[#1d4ed8] text-white shadow-xs border border-blue-900/50 relative overflow-hidden"
      >
        {/* 背景轻微科技网纹感装饰 */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-400/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-stretch justify-between gap-5">
          {/* 左侧：平台总收入累计核心数值及收入构成 (占比约 56%) */}
          <div className="lg:w-[56%] flex flex-col justify-between py-1">
            {/* 平台总收入核心指标区：往下放、放中间一点、字体大一点、无(XX万元)备注 */}
            <div className="my-auto py-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-blue-200 flex items-center gap-1.5 tracking-wide">
                  <CreditCard className="w-4 h-4 text-blue-300" />
                  平台总收入
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/20 text-blue-200 border border-blue-400/30">
                  累计数值
                </span>
              </div>
              <div className="flex items-baseline">
                <span className="text-4xl md:text-5xl lg:text-[46px] font-black font-mono tracking-tight text-white drop-shadow-md">
                  ¥126,800,000
                </span>
              </div>
            </div>

            {/* 累计构成拆解：平台撮合服务总收入 + 增值服务总收入 */}
            <div className="mt-3 pt-3 border-t border-blue-400/20 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-6 bg-blue-400 rounded-full shrink-0" />
                <div>
                  <div className="text-[11px] text-blue-200">平台撮合服务总收入 (累计)</div>
                  <div className="text-lg font-bold font-mono text-white">
                    ¥82,500,000
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-6 bg-cyan-300 rounded-full shrink-0" />
                <div>
                  <div className="text-[11px] text-blue-200">增值服务总收入 (累计)</div>
                  <div className="text-lg font-bold font-mono text-white">
                    ¥44,300,000
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：周期新增收入与增长率 (占比约 44%，双列平铺不再拥挤) */}
          <div className="lg:w-[44%] shrink-0 bg-blue-950/40 rounded-md p-4 border border-blue-400/20 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-blue-400/20">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-3.5 bg-cyan-400 rounded-xs" />
                <span className="text-xs font-bold text-white tracking-wide">周期动态表现</span>
              </div>
              {/* Tab 切换：近一周 / 近一月 / 近一年 */}
              <div className="inline-flex rounded bg-blue-900/60 p-0.5 text-xs font-medium border border-blue-400/30">
                {(['week', 'month', 'year'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setRevenueTab(tab)}
                    className={`px-2.5 py-0.5 rounded transition-all cursor-pointer ${
                      revenueTab === tab
                        ? 'bg-blue-600 text-white shadow-xs font-semibold'
                        : 'text-blue-200 hover:text-white'
                    }`}
                  >
                    {tab === 'week' ? '近一周' : tab === 'month' ? '近一月' : '近一年'}
                  </button>
                ))}
              </div>
            </div>

            {/* 左右双列排布两个动态指标，空间充裕、层次分明 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-auto py-1">
              <div className="bg-blue-900/30 rounded p-2.5 border border-blue-400/15">
                <div className="text-[11px] text-blue-200 font-medium">新增平台收入</div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold font-mono text-white tracking-tight">
                    {revenueDataByTab[revenueTab].newIncome}
                  </span>
                  <span className="text-xs text-blue-200">万元</span>
                </div>
              </div>

              <div className="bg-blue-900/30 rounded p-2.5 border border-blue-400/15">
                <div className="text-[11px] text-blue-200 font-medium">平台收入增长率</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <ArrowUpRight className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">
                    +{revenueDataByTab[revenueTab].growthRate}
                  </span>
                </div>
                <div className="text-[10px] text-blue-200/90 mt-1">
                  同期环比持续增长
                </div>
              </div>
            </div>

            <div className="text-[10px] text-blue-300/80 pt-2 border-t border-blue-400/20">
              数据口径：平台总收入＝平台撮合服务总收入＋增值服务总收入
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 第二行：全局核心指标卡 (6张等宽白色指标卡，同一行排列) */}
      {/* ========================================================================= */}
      <div id="home-row2-global-metrics" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* 指标卡 1: 供应商总数 */}
        <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-1.5 border-b border-slate-100">
            <span className="font-medium text-slate-700 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              供应商总数
            </span>
            <span className="text-[10px] text-slate-400 bg-slate-50 px-1 py-0.5 rounded border border-slate-200/60">
              累计
            </span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">1,480</span>
              <span className="text-xs text-slate-500">家</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">平台累计入驻供应商</div>
          </div>
        </div>

        {/* 指标卡 2: 需求方用户总数 */}
        <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-1.5 border-b border-slate-100">
            <span className="font-medium text-slate-700 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              需求方用户总数
            </span>
            <span className="text-[10px] text-slate-400 bg-slate-50 px-1 py-0.5 rounded border border-slate-200/60">
              累计
            </span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">8,720</span>
              <span className="text-xs text-slate-500">个</span>
            </div>
            {/* 需求方总数下面显示企业用户和个人用户占比条 */}
            <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">用户类型占比</span>
                <span className="font-mono text-slate-700 text-[10px]">17% : 83%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex p-0.5 border border-slate-200/60">
                <div
                  className="bg-blue-600 h-full rounded-l-full transition-all"
                  style={{ width: '17.0%' }}
                  title="企业用户 1,486个 (17.0%)"
                />
                <div
                  className="bg-cyan-500 h-full rounded-r-full transition-all"
                  style={{ width: '83.0%' }}
                  title="个人用户 7,234个 (83.0%)"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-600 pt-0.5">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />
                  企业 1,486 (17%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 inline-block" />
                  个人 7,234 (83%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 指标卡 3: 供应商产商品总数 */}
        <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-1.5 border-b border-slate-100">
            <span className="font-medium text-slate-700 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-blue-600" />
              供应商产商品总数
            </span>
            <span className="text-[10px] text-slate-400 bg-slate-50 px-1 py-0.5 rounded border border-slate-200/60">
              累计
            </span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">1,284</span>
              <span className="text-xs text-slate-500">款</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              覆盖7类产商品
            </div>
          </div>
        </div>

        {/* 指标卡 4: 平台交易总金额 */}
        <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-1.5 border-b border-slate-100">
            <span className="font-medium text-slate-700 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              平台交易总金额
            </span>
            <span className="text-[10px] text-slate-400 bg-slate-50 px-1 py-0.5 rounded border border-slate-200/60">
              累计
            </span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">28.65</span>
              <span className="text-xs text-slate-500">亿元</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              ¥2,865,000,000
            </div>
          </div>
        </div>

        {/* 指标卡 5: 供需交易订单总数 */}
        <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-1.5 border-b border-slate-100">
            <span className="font-medium text-slate-700 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
              供需交易订单总数
            </span>
            <span className="text-[10px] text-slate-400 bg-slate-50 px-1 py-0.5 rounded border border-slate-200/60">
              累计
            </span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">186,400</span>
              <span className="text-xs text-slate-500">笔</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              O-S与O-B/C统一供需订单
            </div>
          </div>
        </div>

        {/* 指标卡 6: 增值服务订单总数 */}
        <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-1.5 border-b border-slate-100">
            <span className="font-medium text-slate-700 flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5 text-blue-600" />
              增值服务订单总数
            </span>
            <span className="text-[10px] text-slate-400 bg-slate-50 px-1 py-0.5 rounded border border-slate-200/60">
              累计
            </span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">42,850</span>
              <span className="text-xs text-slate-500">笔</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              10类增值服务累计订购
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 第三行：平台交易趋势 (交易金额与订单数量放在一张表/图里，整行宽度) */}
      {/* ========================================================================= */}
      <div id="home-row3-trends" className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-blue-600 rounded-xs" />
            <h2 className="text-xs font-bold text-slate-800 tracking-wide">
              平台交易趋势
            </h2>
            <span className="text-[11px] text-slate-400 ml-1">
              (交易金额与订单数量综合走势)
            </span>
          </div>

          {/* 内部时间 Tab：近一周 / 近一月 / 近一年 */}
          <div className="inline-flex rounded bg-slate-100 p-0.5 text-xs font-medium text-slate-600 border border-slate-200/80">
            {(['week', 'month', 'year'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setTxTimeTab(tab)}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                  txTimeTab === tab
                    ? 'bg-white text-blue-600 shadow-xs font-semibold'
                    : 'hover:text-slate-900'
                }`}
              >
                {tab === 'week' ? '近一周' : tab === 'month' ? '近一月' : '近一年'}
              </button>
            ))}
          </div>
        </div>

        {/* 顶部指标摘要条 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3 bg-slate-50/80 p-2.5 rounded border border-slate-200/60">
          <div className="flex items-center justify-between px-3">
            <span className="text-xs text-slate-500">周期交易总金额:</span>
            <span className="text-sm font-bold font-mono text-slate-900">
              {txTimeTab === 'week'
                ? '¥1,650.00 万元'
                : txTimeTab === 'month'
                ? '¥6,530.00 万元'
                : '¥70,565.00 万元 (7.06亿元)'}
            </span>
          </div>
          <div className="flex items-center justify-between px-3 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0">
            <span className="text-xs text-slate-500">周期交易总订单数:</span>
            <span className="text-sm font-bold font-mono text-slate-900">
              {txTimeTab === 'week'
                ? '1,006 笔'
                : txTimeTab === 'month'
                ? '3,950 笔'
                : '44,600 笔'}
            </span>
          </div>
          <div className="flex items-center justify-between px-3 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0">
            <span className="text-xs text-slate-500">平均订单金额:</span>
            <span className="text-sm font-bold font-mono text-blue-600">
              {txTimeTab === 'week'
                ? '¥1.64 万元/笔'
                : txTimeTab === 'month'
                ? '¥1.65 万元/笔'
                : '¥1.58 万元/笔'}
            </span>
          </div>
        </div>

        <div className="h-[270px] w-full pt-1">
          <EChartWrapper option={txTrendOption} height="100%" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 第四行：平台主体增长趋势 (整行宽度折线图) */}
      {/* 新增供应商数 + 需求方新增用户数 (合计) */}
      {/* ========================================================================= */}
      <div id="home-row4-entity-growth" className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-blue-600 rounded-xs" />
            <h2 className="text-xs font-bold text-slate-800 tracking-wide">
              平台主体增长趋势
            </h2>
            <span className="text-[11px] text-slate-400 ml-1">
              (展示新增供应商数与需求方新增用户数)
            </span>
          </div>

          {/* 内部时间 Tab */}
          <div className="inline-flex rounded bg-slate-100 p-0.5 text-xs font-medium text-slate-600 border border-slate-200/80">
            {(['week', 'month', 'year'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setEntityTimeTab(tab)}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                  entityTimeTab === tab
                    ? 'bg-white text-blue-600 shadow-xs font-semibold'
                    : 'hover:text-slate-900'
                }`}
              >
                {tab === 'week' ? '近一周' : tab === 'month' ? '近一月' : '近一年'}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[250px] w-full pt-2">
          <EChartWrapper option={entityTrendOption} height="100%" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 第五行：增值服务经营结构 (整行宽度卡片) */}
      {/* 顶部三个小型汇总指标 + 左横向柱状图 + 右环形图 (清晰体现颜色对应的类别与占比) */}
      {/* ========================================================================= */}
      <div id="home-row5-vas-structure" className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-blue-600 rounded-xs" />
            <h2 className="text-xs font-bold text-slate-800 tracking-wide">
              增值服务经营结构
            </h2>
          </div>

          {/* 指标切换 Tab：收入 / 订单数 */}
          <div className="inline-flex rounded bg-slate-100 p-0.5 text-xs font-medium text-slate-600 border border-slate-200/80">
            <button
              type="button"
              onClick={() => setVasMetric('income')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                vasMetric === 'income'
                  ? 'bg-white text-blue-600 shadow-xs font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              收入
            </button>
            <button
              type="button"
              onClick={() => setVasMetric('orders')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                vasMetric === 'orders'
                  ? 'bg-white text-blue-600 shadow-xs font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              订单数
            </button>
          </div>
        </div>

        {/* 顶部三个小型汇总指标 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3 bg-slate-50/80 p-3 rounded border border-slate-200/60">
          <div className="flex items-center justify-between px-3">
            <span className="text-xs text-slate-500">增值服务总收入:</span>
            <span className="text-sm font-bold font-mono text-slate-900">
              ¥4,430.00 万元
            </span>
          </div>
          <div className="flex items-center justify-between px-3 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0">
            <span className="text-xs text-slate-500">增值服务订单总数:</span>
            <span className="text-sm font-bold font-mono text-slate-900">
              42,850 笔
            </span>
          </div>
          <div className="flex items-center justify-between px-3 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0">
            <span className="text-xs text-slate-500">付费供应商总数:</span>
            <span className="text-sm font-bold font-mono text-slate-900">
              118 家
            </span>
          </div>
        </div>

        {/* 模块主体：左侧横向柱状图 (50%) + 右侧环形图与颜色类别图例 (50%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          <div className="lg:col-span-6 h-[290px] w-full">
            <EChartWrapper option={vasBarOption} height="100%" />
          </div>
          <div className="lg:col-span-6 h-[290px] w-full relative">
            <EChartWrapper option={vasPieOption} height="100%" />
            <div className="absolute top-2 left-2 text-[10px] text-slate-400 bg-white/80 px-1.5 py-0.5 rounded border border-slate-100">
              增值门类占比与颜色对照
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
