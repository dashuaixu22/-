import React, { useState, useMemo } from 'react';
import {
  Package,
  Layers,
  Calendar,
  Clock,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Eye,
  Star,
  Activity,
  X,
  Building2,
  FileText,
  Info,
  Search,
} from 'lucide-react';
import * as echarts from 'echarts';
import { VasProductItem, VasProductOrderItem } from '../data/vasProductMockData';
import { EChartWrapper } from './EChartWrapper';
import { ExportButton } from './ExportButton';
import { exportDetailToWord, exportElementToPdf } from '../utils/exportUtils';

interface VasProductDetailViewProps {
  product: VasProductItem;
  onBack: () => void;
}

export const VasProductDetailView: React.FC<VasProductDetailViewProps> = ({
  product,
  onBack,
}) => {
  // 详情页三大核心 Tab：1. 销售表现 | 2. 购买情况 | 3. 使用与质量
  const [activeMainTab, setActiveMainTab] = useState<'sales' | 'purchase' | 'quality'>('sales');

  // =========================================================================
  // 详情页统一时间选择状态 (当日 / 近一周 / 近一月 / 近一年)
  // =========================================================================
  // 1. 销售表现：统一时间选择 Tab
  const [salesTimeTab, setSalesTimeTab] = useState<'today' | 'week' | 'month' | 'year'>('year');

  // 2. 购买情况：统一时间选择 Tab
  const [purchaseTimeTab, setPurchaseTimeTab] = useState<'today' | 'week' | 'month' | 'year'>('year');

  // 购买情况：本产品订单按供应商名称/供应商编号检索关键词
  const [orderSearchKeyword, setOrderSearchKeyword] = useState<string>('');

  // 购买订单明细弹窗状态 (只保留“查看详情”)
  const [activeOrderModal, setActiveOrderModal] = useState<VasProductOrderItem | null>(null);

  // 购买当前产品的独立供应商数量计算
  const uniqueSuppliersCount = useMemo(() => {
    return new Set(product.orders.map((o) => o.supplierName)).size || 1;
  }, [product.orders]);

  // 购买情况：按供应商名称 / 供应商编号检索过滤后的订单列表
  const filteredOrders = useMemo(() => {
    if (!orderSearchKeyword.trim()) {
      return product.orders;
    }
    const kw = orderSearchKeyword.trim().toLowerCase();
    return product.orders.filter(
      (order) =>
        order.supplierName.toLowerCase().includes(kw) ||
        order.supplierCode.toLowerCase().includes(kw)
    );
  }, [product.orders, orderSearchKeyword]);

  // 类别 Badge 样式映射
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case '客户分析服务':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case '营销服务':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case '销售服务':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case '售后服务':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case '维系服务':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case '广告服务':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      case '发票代理':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case '产品推荐':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case '会员服务（商户）':
        return 'bg-green-50 text-green-700 border-green-200';
      case '产品分析':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // =========================================================================
  // 折线图配置 1：本产品客单价变化折线图
  // =========================================================================
  const arpuLineOption: echarts.EChartsOption = useMemo(() => {
    const trendObj = product.arpuPerformance.trendData[salesTimeTab];
    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const item = params[0];
          return `
            <div style="font-size:12px; font-weight:600; color:#1E293B; margin-bottom:4px;">${item.name}</div>
            <div style="font-size:12px; color:#475569; display:flex; align-items:center; gap:6px;">
              <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:#1677FF;"></span>
              <span>本产品客单价:</span>
              <strong style="font-family:monospace; color:#1677FF;">¥${item.value.toLocaleString()}</strong>
            </div>
          `;
        },
      },
      grid: {
        top: 24,
        right: 20,
        bottom: 24,
        left: 56,
      },
      xAxis: {
        type: 'category',
        data: trendObj.dates,
        axisLine: { lineStyle: { color: '#E2E8F0' } },
        axisLabel: { color: '#64748B', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
        axisLabel: {
          color: '#64748B',
          fontSize: 11,
          formatter: (v: number) => `¥${v}`,
        },
      },
      series: [
        {
          name: '本产品客单价',
          type: 'line',
          data: trendObj.values,
          smooth: false,
          symbolSize: 6,
          itemStyle: { color: '#1677FF' },
          lineStyle: { width: 2.5, color: '#1677FF' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(22, 119, 255, 0.22)' },
              { offset: 1, color: 'rgba(22, 119, 255, 0.01)' },
            ]),
          },
        },
      ],
    };
  }, [product, salesTimeTab]);

  // =========================================================================
  // 折线图配置 2：本产品客单价增长率变化折线图
  // =========================================================================
  const growthRateLineOption: echarts.EChartsOption = useMemo(() => {
    // 增长率需要前后对比周期，当日无独立对比数据时展示近一周走势
    const effectiveGrowthTab = salesTimeTab === 'today' ? 'week' : salesTimeTab;
    const growthObj = product.arpuPerformance.growthRates[effectiveGrowthTab];
    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const item = params[0];
          return `
            <div style="font-size:12px; font-weight:600; color:#1E293B; margin-bottom:4px;">
              ${item.name}${salesTimeTab === 'today' ? ' (近一周参考)' : ''}
            </div>
            <div style="font-size:12px; color:#475569; display:flex; align-items:center; gap:6px;">
              <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:#00B96B;"></span>
              <span>本产品客单价增长率:</span>
              <strong style="font-family:monospace; color:#00B96B;">+${item.value}%</strong>
            </div>
          `;
        },
      },
      grid: {
        top: 24,
        right: 20,
        bottom: 24,
        left: 48,
      },
      xAxis: {
        type: 'category',
        data: growthObj.dates,
        axisLine: { lineStyle: { color: '#E2E8F0' } },
        axisLabel: { color: '#64748B', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
        axisLabel: {
          color: '#64748B',
          fontSize: 11,
          formatter: (v: number) => `${v}%`,
        },
      },
      series: [
        {
          name: '本产品客单价增长率',
          type: 'line',
          data: growthObj.values,
          smooth: false,
          symbolSize: 6,
          itemStyle: { color: '#00B96B' },
          lineStyle: { width: 2.5, color: '#00B96B' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(0, 185, 107, 0.22)' },
              { offset: 1, color: 'rgba(0, 185, 107, 0.01)' },
            ]),
          },
        },
      ],
    };
  }, [product, salesTimeTab]);

  // =========================================================================
  // 折线图配置 3：使用与质量 - 服务使用趋势折线图
  // =========================================================================
  const qualityUsageLineOption: echarts.EChartsOption = useMemo(() => {
    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const item = params[0];
          return `
            <div style="font-size:12px; font-weight:600; color:#1E293B; margin-bottom:4px;">${item.name}</div>
            <div style="font-size:12px; color:#475569; display:flex; align-items:center; gap:6px;">
              <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:#722ED1;"></span>
              <span>服务调用次数:</span>
              <strong style="font-family:monospace; color:#722ED1;">${item.value} 万次</strong>
            </div>
          `;
        },
      },
      grid: {
        top: 24,
        right: 20,
        bottom: 24,
        left: 48,
      },
      xAxis: {
        type: 'category',
        data: product.qualityPerformance.trendDates,
        axisLine: { lineStyle: { color: '#E2E8F0' } },
        axisLabel: { color: '#64748B', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
        axisLabel: {
          color: '#64748B',
          fontSize: 11,
          formatter: (v: number) => `${v}万`,
        },
      },
      series: [
        {
          name: '服务调用频次',
          type: 'line',
          data: product.qualityPerformance.trendUsage,
          smooth: false,
          symbolSize: 6,
          itemStyle: { color: '#722ED1' },
          lineStyle: { width: 2.5, color: '#722ED1' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(114, 46, 209, 0.20)' },
              { offset: 1, color: 'rgba(114, 46, 209, 0.01)' },
            ]),
          },
        },
      ],
    };
  }, [product]);

  // =========================================================================
  // 导出文档操作 (Word / PDF)
  // =========================================================================
  const handleExportWord = () => {
    exportDetailToWord(
      {
        title: `增值服务产商品档案 - ${product.productName}`,
        subtitle: `服务编码：${product.id} | 类别：${product.categoryName}`,
        tags: [product.categoryName, '正常在售', `评分 ${product.rating}`],
        metaInfo: [
          { label: '服务编码', value: product.id },
          { label: '服务类别', value: product.categoryName },
          { label: '综合评分', value: `${product.rating} 分` },
          { label: '累计销售金额', value: `¥${(product.totalRevenue / 10000).toFixed(2)} 万元` },
          { label: '已购供应商数', value: `${uniqueSuppliersCount} 家` },
        ],
        sections: [
          {
            title: '增值服务基本说明',
            fields: [
              { label: '服务产商品名称', value: product.productName, highlight: true },
              { label: '服务编码', value: product.id },
              { label: '服务类别', value: product.categoryName },
              { label: '服务状态', value: '正常在售' },
              { label: '综合质量评分', value: `${product.rating} 分 / 5.0 分`, highlight: true },
              { label: '计费模式', value: '按周期标准订阅 / 充值结算' },
            ],
          },
          {
            title: '核心运营表现',
            fields: [
              { label: '累计销售金额', value: `¥${(product.totalRevenue / 10000).toFixed(2)} 万元`, highlight: true },
              { label: '累计订购笔数', value: `${product.totalOrders} 笔`, highlight: true },
              { label: '合作供应商覆盖', value: `${uniqueSuppliersCount} 家` },
              { label: '服务可用率(SLA)', value: '99.98%' },
              { label: '平均响应时延', value: '42 ms' },
              { label: '综合评分', value: `${product.rating} 分` },
            ],
          },
          {
            title: `供应商订购明细列表 (共 ${product.orders.length} 笔)`,
            table: {
              headers: ['订单编号', '购买供应商', '供应商类别', '订单金额(元)', '下单时间', '服务周期', '订单状态'],
              rows: product.orders.map((o) => [
                o.id,
                o.supplierName,
                o.supplierType,
                `¥${o.amount.toLocaleString()}`,
                o.orderTime,
                o.serviceDuration || '1个月',
                o.status,
              ]),
            },
          },
        ],
      },
      `增值服务产商品档案_${product.productName}`
    );
  };

  const handleExportPdf = async () => {
    await exportElementToPdf('vas-product-detail-page', `增值服务产商品档案_${product.productName}`);
  };

  const handleExportOrderWord = () => {
    if (!activeOrderModal) return;
    exportDetailToWord(
      {
        title: `增值服务订购记录 - ${activeOrderModal.id}`,
        subtitle: `服务：${product.productName} | 采购供应商：${activeOrderModal.supplierName}`,
        tags: [activeOrderModal.status, product.categoryName],
        metaInfo: [
          { label: '订单编号', value: activeOrderModal.id },
          { label: '下单时间', value: activeOrderModal.orderTime },
        ],
        sections: [
          {
            title: '订购信息详情',
            fields: [
              { label: '订单编号', value: activeOrderModal.id, highlight: true },
              { label: '增值产品名称', value: product.productName },
              { label: '服务类别', value: product.categoryName },
              { label: '购买供应商', value: activeOrderModal.supplierName, highlight: true },
              { label: '供应商编号', value: activeOrderModal.supplierCode },
              { label: '供应商类别', value: activeOrderModal.supplierType },
              { label: '订购金额', value: `¥${activeOrderModal.amount.toLocaleString()} 元`, highlight: true },
              { label: '下单时间', value: activeOrderModal.orderTime },
              { label: '订单状态', value: activeOrderModal.status },
              { label: '服务周期', value: activeOrderModal.serviceDuration || '1个月' },
              { label: '联系人及电话', value: `${activeOrderModal.contactPerson || '-'} (${activeOrderModal.contactPhone || '-'})` },
              { label: '服务备注', value: activeOrderModal.remark || '-' },
            ],
          },
        ],
      },
      `增值服务订单_${activeOrderModal.id}`
    );
  };

  const handleExportOrderPdf = async () => {
    await exportElementToPdf('vas-product-order-modal-card', `增值服务订单_${activeOrderModal?.id}`);
  };

  return (
    <div id="vas-product-detail-page" className="space-y-4">
      {/* ========================================================================= */}
      {/* 顶部导航与关闭操作栏 */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-md border border-slate-200/90 shadow-xs px-4 py-3 flex items-center justify-between">
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <span>增值产品运营</span>
          <span>/</span>
          <span>增值产品详情</span>
          <span>/</span>
          <span className="text-slate-800 font-semibold">{product.productName}</span>
        </nav>

        <div className="flex items-center gap-2.5">
          <ExportButton onExportWord={handleExportWord} onExportPdf={handleExportPdf} />
          <div className="h-4 w-px bg-slate-200" />
          <button
            type="button"
            id="btn-close-vas-product-detail"
            onClick={onBack}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer border border-transparent hover:border-slate-200 shrink-0"
            title="关闭详情页"
            aria-label="关闭详情页"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 产品基本信息栏与三大核心 Tab 切换 (信息栏) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  {product.productName}
                </h2>
                {/* 增值服务类别 */}
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${getCategoryBadgeClass(
                    product.categoryName
                  )}`}
                >
                  {product.categoryName}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                增值产品服务档案 · 销售表现、购买分析与质量监控
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-mono hidden sm:block">
            产品详情视图
          </div>
        </div>

        {/* 核心三 Tab 切换：1. 销售表现 | 2. 购买情况 | 3. 使用与质量 */}
        <div className="flex items-center gap-3 pt-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveMainTab('sales')}
            className={`px-4 py-2 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMainTab === 'sales'
                ? 'bg-[#1677FF] text-white shadow-xs font-semibold'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-slate-200/60'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>销售表现</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('purchase')}
            className={`px-4 py-2 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMainTab === 'purchase'
                ? 'bg-[#1677FF] text-white shadow-xs font-semibold'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-slate-200/60'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>购买情况</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('quality')}
            className={`px-4 py-2 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMainTab === 'quality'
                ? 'bg-[#1677FF] text-white shadow-xs font-semibold'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-slate-200/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>使用与质量</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 核心内容区：按主 Tab 切换 */}
      {/* ========================================================================= */}

      {/* ------------------------------------------------------------------------- */}
      {/* Tab 1: 销售表现 */}
      {/* ------------------------------------------------------------------------- */}
      {activeMainTab === 'sales' && (
        <div className="space-y-4">
          {/* 销售表现统一时间控制栏 */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-lg border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-800">销售核心指标</span>
              <span className="text-[11px] text-slate-400">（左侧为累计指标，右侧为选定周期新增指标）</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">统计时间：</span>
              <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200">
                {(['today', 'week', 'month', 'year'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setSalesTimeTab(tab)}
                    className={`px-3 py-1 text-xs rounded transition-all cursor-pointer font-medium ${
                      salesTimeTab === tab
                        ? 'bg-[#1677FF] text-white font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab === 'today' ? '当日' : tab === 'week' ? '近一周' : tab === 'month' ? '近一月' : '近一年'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 第一行：统一规格指标卡 (累计值在左，新增值在右，针对本产品命名) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 卡片 1: 本产品累计订单数 (累计值在最左侧) */}
            <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
                <div className="flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-blue-600" />
                  <span>本产品累计订单数</span>
                </div>
                <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  累计值
                </span>
              </div>
              <div className="mt-1">
                <div className="text-2xl font-bold font-mono text-slate-800 tracking-tight">
                  {product.totalOrders.toLocaleString()}
                  <span className="text-xs font-normal text-slate-500 ml-1 font-sans">笔</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">本产品全周期已履约及有效订单</div>
              </div>
            </div>

            {/* 卡片 2: 本产品累计订单金额 (累计值在左侧第二位) */}
            <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-cyan-600" />
                  <span>本产品累计订单金额</span>
                </div>
                <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  累计值
                </span>
              </div>
              <div className="mt-1">
                <div className="text-2xl font-bold font-mono text-slate-800 tracking-tight">
                  ¥{product.totalRevenue.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">本产品全周期累计总流水</div>
              </div>
            </div>

            {/* 卡片 3: 本产品新增订单数 (新增值在右侧第三位) */}
            <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
                <div className="flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-indigo-600" />
                  <span>本产品新增订单数</span>
                </div>
                <span className="text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {salesTimeTab === 'today'
                    ? '当日'
                    : salesTimeTab === 'week'
                    ? '近一周'
                    : salesTimeTab === 'month'
                    ? '近一月'
                    : '近一年'}
                </span>
              </div>
              <div className="mt-1">
                <div className="text-2xl font-bold font-mono text-blue-600 tracking-tight">
                  {product.metricsByRange[salesTimeTab].newOrders.toLocaleString()}
                  <span className="text-xs font-normal text-slate-500 ml-1 font-sans">笔</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">本产品选定统计周期内新增订单</div>
              </div>
            </div>

            {/* 卡片 4: 本产品新增订单金额 (新增值在右侧第四位) */}
            <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>本产品新增订单金额</span>
                </div>
                <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {salesTimeTab === 'today'
                    ? '当日'
                    : salesTimeTab === 'week'
                    ? '近一周'
                    : salesTimeTab === 'month'
                    ? '近一月'
                    : '近一年'}
                </span>
              </div>
              <div className="mt-1">
                <div className="text-2xl font-bold font-mono text-emerald-600 tracking-tight">
                  ¥{product.metricsByRange[salesTimeTab].newRevenue.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">本产品选定统计周期内新增流水</div>
              </div>
            </div>
          </div>

          {/* 第二行：单一模块：本产品客单价走势 (去掉客单价增长率，只保留客单价走势) */}
          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-800">本产品客单价走势</h3>
                <span className="text-[11px] text-slate-400">单笔订单平均消费额变动趋势</span>
              </div>
              <span className="text-xs text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 font-medium">
                {salesTimeTab === 'today'
                  ? '当日'
                  : salesTimeTab === 'week'
                  ? '近一周'
                  : salesTimeTab === 'month'
                  ? '近一月'
                  : '近一年'}
              </span>
            </div>

            {/* 客单价指标展示卡 */}
            <div className="py-3 px-4 my-3 bg-blue-50/40 rounded-md border border-blue-100/80 flex items-center justify-between">
              <div>
                <div className="text-slate-500 text-[11px]">本产品客单价（当前周期）</div>
                <div className="text-2xl font-bold font-mono text-blue-600">
                  ¥{product.arpuPerformance.arpuValues[salesTimeTab].toLocaleString()}
                </div>
              </div>
              <div className="text-right text-xs text-slate-500 font-mono">
                {salesTimeTab === 'today'
                  ? '当日均值'
                  : salesTimeTab === 'week'
                  ? '近7日均值'
                  : salesTimeTab === 'month'
                  ? '近30日均值'
                  : '近12月均值'}
              </div>
            </div>

            {/* 下方客单价变化折线图 */}
            <div className="flex-1 min-h-[260px]">
              <div className="text-[11px] font-medium text-slate-500 mb-1">
                本产品客单价走势变化
              </div>
              <div className="h-[240px] w-full">
                <EChartWrapper option={arpuLineOption} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* Tab 2: 购买情况 */}
      {/* ------------------------------------------------------------------------- */}
      {activeMainTab === 'purchase' && (
        <div className="space-y-4">
          {/* 第一行：购买情况核心指标全部为累计值，不设置周期值 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 卡片 1: 本产品累计购买客户数 */}
            <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>本产品累计购买客户数</span>
                </div>
                <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  累计值
                </span>
              </div>
              <div className="mt-1">
                <div className="text-2xl font-bold font-mono text-slate-800 tracking-tight">
                  {uniqueSuppliersCount}
                  <span className="text-xs font-normal text-slate-500 ml-1 font-sans">家</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">全周期购买本产品的独立供应商总数</div>
              </div>
            </div>

            {/* 卡片 2: 本产品累计销售订单总数 */}
            <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
                <div className="flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-indigo-600" />
                  <span>本产品累计销售订单</span>
                </div>
                <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  累计值
                </span>
              </div>
              <div className="mt-1">
                <div className="text-2xl font-bold font-mono text-slate-800 tracking-tight">
                  {product.totalOrders.toLocaleString()}
                  <span className="text-xs font-normal text-slate-500 ml-1 font-sans">笔</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">全周期累计有效订购总笔数</div>
              </div>
            </div>

            {/* 卡片 3: 本产品累计销售金额 */}
            <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>本产品累计销售金额</span>
                </div>
                <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  累计值
                </span>
              </div>
              <div className="mt-1">
                <div className="text-2xl font-bold font-mono text-emerald-600 tracking-tight">
                  ¥{product.totalRevenue.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">全周期购买本产品的累计总流水</div>
              </div>
            </div>

            {/* 卡片 4: 本产品累计客户平均订单数 */}
            <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
                <div className="flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-purple-600" />
                  <span>本产品累计客户平均订单数</span>
                </div>
                <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  累计值
                </span>
              </div>
              <div className="mt-1">
                <div className="text-2xl font-bold font-mono text-purple-600 tracking-tight">
                  {(product.totalOrders / (uniqueSuppliersCount || 1)).toFixed(1)}
                  <span className="text-xs font-normal text-slate-500 ml-1 font-sans">笔 / 客户</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">全周期单客户平均订购总数</div>
              </div>
            </div>
          </div>

          {/* 下方：本产品订单列表 (去掉查看详情操作，支持按供应商名称/供应商编号检索) */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800">
                  本产品订单
                </h3>
                <span className="text-xs text-slate-400 font-normal">
                  （共 <strong className="font-mono text-blue-600">{product.orders.length}</strong> 笔关联订单
                  {orderSearchKeyword.trim() && (
                    <>，检索出 <strong className="font-mono text-emerald-600">{filteredOrders.length}</strong> 笔</>
                  )}）
                </span>
              </div>

              {/* 供应商检索输入框 */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={orderSearchKeyword}
                    onChange={(e) => setOrderSearchKeyword(e.target.value)}
                    placeholder="输入供应商名称 / 编号检索..."
                    className="w-56 sm:w-64 pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-md placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700"
                  />
                  {orderSearchKeyword && (
                    <button
                      type="button"
                      onClick={() => setOrderSearchKeyword('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      title="清空检索"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 select-none">
                    <th className="py-2.5 px-3">供应商名称</th>
                    <th className="py-2.5 px-3">供应商编号 / 统一社会信用代码</th>
                    <th className="py-2.5 px-3 text-center">供应商类别</th>
                    <th className="py-2.5 px-3 font-mono">订单编号</th>
                    <th className="py-2.5 px-3">下单时间</th>
                    <th className="py-2.5 px-3 text-right">订单金额</th>
                    <th className="py-2.5 px-3 text-center">订单状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-blue-50/30 transition-colors">
                        {/* 供应商名称 */}
                        <td className="py-2.5 px-3 font-medium text-slate-800">
                          {order.supplierName}
                        </td>

                        {/* 供应商编号或统一社会信用代码 */}
                        <td className="py-2.5 px-3 font-mono text-slate-600">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/80 text-[11px]">
                            {order.supplierCode}
                          </span>
                        </td>

                        {/* 供应商类别 */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            {order.supplierType}
                          </span>
                        </td>

                        {/* 订单编号 */}
                        <td className="py-2.5 px-3 font-mono text-blue-600 whitespace-nowrap">
                          {order.id}
                        </td>

                        {/* 下单时间 */}
                        <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                          {order.orderTime}
                        </td>

                        {/* 订单金额 */}
                        <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-800 whitespace-nowrap">
                          ¥{order.amount.toLocaleString()}
                        </td>

                        {/* 订单状态 */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              order.status === '履约中'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : order.status === '已完成'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : order.status === '待生效'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <Search className="w-5 h-5 text-slate-300" />
                          <span>未检索到匹配“{orderSearchKeyword}”的供应商订单</span>
                          <button
                            type="button"
                            onClick={() => setOrderSearchKeyword('')}
                            className="mt-1 text-xs text-blue-600 hover:underline cursor-pointer"
                          >
                            清除检索关键词
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* Tab 3: 使用与质量 */}
      {/* ------------------------------------------------------------------------- */}
      {activeMainTab === 'quality' && (
        <div className="space-y-4">
          {/* 第一行：统一规格指标卡 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 卡片 1: 本产品服务履约率 (替换综合评分) */}
            <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>本产品服务履约率</span>
                </div>
                <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  高可用保障
                </span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <div className="text-2xl font-bold font-mono text-emerald-600 tracking-tight">
                  99.98%
                </div>
                <div className="text-xs text-emerald-600 font-medium">稳定履约</div>
              </div>
            </div>

            {/* 卡片 2: 本产品平均使用时长 */}
            <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>本产品平均使用时长</span>
                </div>
                <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  累计均值
                </span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <div className="text-2xl font-bold font-mono text-slate-800 tracking-tight">
                  {product.qualityPerformance.avgDuration}
                  <span className="text-xs font-normal text-slate-500 ml-1 font-sans">小时</span>
                </div>
                <div className="text-xs text-slate-400">单笔订购服务生命周期</div>
              </div>
            </div>

            {/* 卡片 3: 本产品服务调用次数 */}
            <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-purple-600" />
                  <span>本产品服务调用次数</span>
                </div>
                <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  累计调用
                </span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <div className="text-2xl font-bold font-mono text-slate-800 tracking-tight">
                  {product.qualityPerformance.usageCount}
                  <span className="text-xs font-normal text-slate-500 ml-1 font-sans">万次</span>
                </div>
                <div className="text-xs text-slate-400">API接口与系统组件总调用</div>
              </div>
            </div>
          </div>

          {/* 第二行：当前增值产品使用趋势与质量详情 */}
          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-bold text-slate-800">
                  本产品服务调用与使用趋势
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">近 7 日调用频次监控</span>
            </div>

            <div className="h-[260px] w-full mt-3">
              <EChartWrapper option={qualityUsageLineOption} />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 订单明细只读查看弹窗 */}
      {/* ========================================================================= */}
      {activeOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div id="vas-product-order-modal-card" className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* 弹窗头部 */}
            <div className="px-5 py-3.5 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-800">增值产品订单详情</h4>
                <span className="text-xs text-blue-600 font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {activeOrderModal.id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveOrderModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/50 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 弹窗内容 */}
            <div className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
                <div>
                  <span className="text-slate-400">增值产品名称：</span>
                  <span className="text-slate-800 font-medium">{product.productName}</span>
                </div>
                <div>
                  <span className="text-slate-400">增值服务类别：</span>
                  <span className="text-slate-800 font-medium">{product.categoryName}</span>
                </div>
                <div>
                  <span className="text-slate-400">购买供应商：</span>
                  <span className="text-slate-800 font-medium">{activeOrderModal.supplierName}</span>
                </div>
                <div>
                  <span className="text-slate-400">信用代码/编号：</span>
                  <span className="text-slate-800 font-mono">{activeOrderModal.supplierCode}</span>
                </div>
                <div>
                  <span className="text-slate-400">供应商类别：</span>
                  <span className="text-slate-800">{activeOrderModal.supplierType}</span>
                </div>
                <div>
                  <span className="text-slate-400">订单金额：</span>
                  <span className="text-slate-800 font-mono font-bold text-sm text-blue-600">
                    ¥{activeOrderModal.amount.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">下单时间：</span>
                  <span className="text-slate-800 font-mono">{activeOrderModal.orderTime}</span>
                </div>
                <div>
                  <span className="text-slate-400">订单状态：</span>
                  <span className="text-emerald-600 font-medium">{activeOrderModal.status}</span>
                </div>
                <div>
                  <span className="text-slate-400">联系人及电话：</span>
                  <span className="text-slate-800">
                    {activeOrderModal.contactPerson || '-'} ({activeOrderModal.contactPhone || '-'})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">服务周期：</span>
                  <span className="text-slate-800">{activeOrderModal.serviceDuration || '1个月'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400">服务备注：</span>
                  <span className="text-slate-800">{activeOrderModal.remark || '-'}</span>
                </div>
              </div>
            </div>

            {/* 弹窗底部 */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <ExportButton onExportWord={handleExportOrderWord} onExportPdf={handleExportOrderPdf} />
              <button
                type="button"
                onClick={() => setActiveOrderModal(null)}
                className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 rounded hover:bg-slate-100 text-xs font-medium transition-colors cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
