import React, { useState, useMemo } from 'react';
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  FileText,
  Layers,
  Package,
  ShoppingBag,
  TrendingUp,
  X,
  Info,
} from 'lucide-react';
import * as echarts from 'echarts';
import { SupplierRecord, SupplierSalesOrderRecord } from '../types';
import { EChartWrapper } from './EChartWrapper';
import {
  FIXED_PRODUCT_CATEGORIES,
  CATEGORY_COLORS,
  VAS_COLORS,
  getSupplierProvidedCategories,
  getSupplierProductsList,
  getSupplierCategoryProductCounts,
  getSupplierSalesPerformance,
  getSupplierSalesOrders,
  getSupplierVasPerformance,
  getSupplierVasOrders,
  SupplierProductItem,
  SupplierVasOrderItem,
  FixedProductCategoryType,
} from '../data/supplierDetailMockData';
import { ExportButton } from './ExportButton';
import { exportDetailToWord, exportElementToPdf } from '../utils/exportUtils';

interface SupplierDetailViewProps {
  supplier: SupplierRecord;
  onBack: () => void;
  onViewProducts?: (supplierId: string) => void;
}

export const SupplierDetailView: React.FC<SupplierDetailViewProps> = ({
  supplier,
  onBack,
  onViewProducts,
}) => {
  // 主 Tab 切换：销售视图 vs 付费视图
  const [activeMainTab, setActiveMainTab] = useState<'sales' | 'payment'>('sales');

  // =========================================================================
  // 基础数据派生
  // =========================================================================
  const providedCategories = useMemo(() => getSupplierProvidedCategories(supplier), [supplier]);
  const productList = useMemo(() => getSupplierProductsList(supplier), [supplier]);
  const categoryProductCounts = useMemo(
    () => getSupplierCategoryProductCounts(productList),
    [productList]
  );
  const salesPerformance = useMemo(() => getSupplierSalesPerformance(supplier), [supplier]);
  const salesOrders = useMemo(() => getSupplierSalesOrders(supplier), [supplier]);
  const vasPerformance = useMemo(() => getSupplierVasPerformance(supplier), [supplier]);
  const vasOrders = useMemo(() => getSupplierVasOrders(supplier), [supplier]);

  // 入驻时间 (默认推算为签约日前 14 天)
  const joinDate = useMemo(() => {
    if (!supplier.contractDate) return '2024-03-01';
    const parts = supplier.contractDate.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      return `${year}-${String(Math.max(1, month - 1)).padStart(2, '0')}-01`;
    }
    return '2024-03-01';
  }, [supplier.contractDate]);

  // =========================================================================
  // 销售表现时间选择与指标状态
  // =========================================================================
  // 销售表现总体右侧时间选择模块（含当日、近一周、近一月、近一年），统一控制新增指标卡
  const [salesSectionTimeTab, setSalesSectionTimeTab] = useState<'today' | 'week' | 'month' | 'year'>('year');

  // =========================================================================
  // 付费视图时间选择状态
  // =========================================================================
  // 消费概况总体右侧时间选择模块（含当日、近一周、近一月、近一年），统一控制卡片
  const [paymentSectionTimeTab, setPaymentSectionTimeTab] = useState<'today' | 'week' | 'month' | 'year'>('year');

  // =========================================================================
  // 分页状态 (销售订单明细、增值服务订单明细，默认 10 笔翻页)
  // =========================================================================
  const [salesOrdersPage, setSalesOrdersPage] = useState(1);
  const salesOrdersPageSize = 10;
  const totalSalesPages = Math.ceil(salesOrders.length / salesOrdersPageSize) || 1;
  const paginatedSalesOrders = useMemo(() => {
    const start = (salesOrdersPage - 1) * salesOrdersPageSize;
    return salesOrders.slice(start, start + salesOrdersPageSize);
  }, [salesOrders, salesOrdersPage]);

  const [vasOrdersPage, setVasOrdersPage] = useState(1);
  const vasOrdersPageSize = 10;
  const totalVasPages = Math.ceil(vasOrders.length / vasOrdersPageSize) || 1;
  const paginatedVasOrders = useMemo(() => {
    const start = (vasOrdersPage - 1) * vasOrdersPageSize;
    return vasOrders.slice(start, start + vasOrdersPageSize);
  }, [vasOrders, vasOrdersPage]);

  // =========================================================================
  // 图表配置：付费视图 - 已购增值服务横向柱状图 (仅展示累计，保留单一清晰图表)
  // =========================================================================
  const vasBarOption: echarts.EChartsOption = useMemo(() => {
    const list = vasPerformance.categoriesData.total;
    // 取各增值服务分类累计消费金额由低到高显示，形成横向条形图
    const sorted = [...list].sort((a, b) => a.amount - b.amount);
    const yNames = sorted.map((s) => s.name);
    const seriesData = sorted.map((s) => ({
      value: s.amount,
      itemStyle: {
        color: s.amount > 0 ? VAS_COLORS[s.name] || '#1677FF' : '#CBD5E1',
        borderRadius: [0, 4, 4, 0],
      },
    }));

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const p = params[0];
          return `
            <div style="font-size:12px; font-weight:600; color:#1E293B; margin-bottom:4px;">${p.name}</div>
            <div style="font-size:12px; color:#475569;">累计消费金额: <strong style="color:#0284C7;">${p.value} 万元</strong></div>
          `;
        },
      },
      grid: { top: 16, right: 60, bottom: 20, left: 120 },
      xAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#F1F5F9' } },
        axisLabel: { color: '#94A3B8', fontSize: 11, formatter: '{value}万' },
      },
      yAxis: {
        type: 'category',
        data: yNames,
        axisLine: { lineStyle: { color: '#E2E8F0' } },
        axisTick: { show: false },
        axisLabel: { color: '#475569', fontSize: 11 },
      },
      series: [
        {
          name: '累计消费金额',
          type: 'bar',
          barWidth: 16,
          data: seriesData,
          label: {
            show: true,
            position: 'right',
            color: '#64748B',
            fontSize: 11,
            formatter: '{c} 万元',
          },
        },
      ],
    };
  }, [vasPerformance]);

  // =========================================================================
  // 导出文档操作 (Word / PDF)
  // =========================================================================
  const handleExportWord = () => {
    exportDetailToWord(
      {
        title: `供应商详情档案 - ${supplier.supplierName}`,
        subtitle: `统一社会信用代码：${supplier.creditCode} | 供应商编号：${supplier.supplierCode}`,
        tags: [supplier.serviceStatus || '正常合作', supplier.supplierType, ...providedCategories],
        metaInfo: [
          { label: '供应商编号', value: supplier.supplierCode },
          { label: '统一信用代码', value: supplier.creditCode },
          { label: '入驻时间', value: joinDate },
          { label: '签约日期', value: supplier.contractDate },
          { label: '联系人', value: `${supplier.contactPerson} (${supplier.contactPhone})` },
        ],
        sections: [
          {
            title: '供应商基本信息',
            fields: [
              { label: '供应商名称', value: supplier.supplierName, highlight: true },
              { label: '供应商编号', value: supplier.supplierCode },
              { label: '统一信用代码', value: supplier.creditCode },
              { label: '供应商类别', value: supplier.supplierType },
              { label: '合作状态', value: supplier.serviceStatus || '正常合作' },
              { label: '签约日期', value: supplier.contractDate },
              { label: '入驻时间', value: joinDate },
              { label: '联系人及电话', value: `${supplier.contactPerson} ${supplier.contactPhone}` },
              { label: '实际覆盖大类', value: providedCategories.join('、') },
            ],
          },
          {
            title: '运营业务表现概览',
            fields: [
              { label: '累计基础产商品订单量', value: `${supplier.basicOrderCount} 笔`, highlight: true },
              { label: '累计基础产商品销售额', value: `¥${supplier.basicOrderAmount.toFixed(2)} 万元`, highlight: true },
              { label: '增值服务订单量', value: `${supplier.vasOrderCount} 笔` },
              { label: '增值服务销售额', value: `¥${supplier.vasOrderAmount.toFixed(2)} 万元` },
              { label: '最后交易时间', value: supplier.lastTxDate },
            ],
          },
          {
            title: `旗下产商品列表 (共 ${productList.length} 款)`,
            table: {
              headers: ['产商品名称', '所属大类', '二级子类', '供应状态'],
              rows: productList.map((p) => [
                p.productName,
                p.category,
                p.subType,
                '正常在架',
              ]),
            },
          },
          {
            title: `销售订单明细记录 (共 ${salesOrders.length} 笔)`,
            table: {
              headers: ['订单编号', '产商品名称', '所属类别', '客户名称', '订单金额(元)', '平台佣金(元)', '订单状态', '下单时间'],
              rows: salesOrders.map((o) => [
                o.orderId,
                o.productName,
                o.serviceCategory,
                o.customerName,
                `¥${o.orderAmount.toLocaleString()}`,
                `¥${o.commissionAmount.toLocaleString()}`,
                o.status,
                o.orderTime,
              ]),
            },
          },
          ...(vasOrders.length > 0
            ? [
                {
                  title: `采购增值服务记录 (共 ${vasOrders.length} 笔)`,
                  table: {
                    headers: ['订单编号', '增值服务名称', '服务类别', '消费金额(元)', '状态', '购买时间'],
                    rows: vasOrders.map((v) => [
                      v.orderId,
                      v.vasName,
                      v.vasCategory,
                      `¥${v.amount.toLocaleString()}`,
                      v.status,
                      v.purchaseTime,
                    ]),
                  },
                },
              ]
            : []),
        ],
      },
      `供应商详情档案_${supplier.supplierName}`
    );
  };

  const handleExportPdf = async () => {
    await exportElementToPdf('supplier-detail-page', `供应商详情档案_${supplier.supplierName}`);
  };

  return (
    <div id="supplier-detail-page" className="space-y-4 pb-12">
      {/* ========================================================================= */}
      {/* 顶部导航与关闭操作栏 */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-lg border border-slate-200 px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <span>供应商运营</span>
          <span>/</span>
          <span>供应商主体详情</span>
          <span>/</span>
          <span className="text-slate-800 font-semibold">{supplier.supplierName}</span>
        </nav>

        <div className="flex items-center gap-2.5">
          <ExportButton onExportWord={handleExportWord} onExportPdf={handleExportPdf} />

          <div className="h-4 w-px bg-slate-200 mx-0.5" />

          {/* 右上角打叉关闭详情页 */}
          <button
            type="button"
            id="btn-close-supplier-detail"
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
      {/* 供应商基本信息卡 (信息栏) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  {supplier.supplierName}
                </h1>
                <span className="font-mono text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded">
                  {supplier.supplierCode}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {supplier.serviceStatus || '正常合作'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 二、供应商基本信息网格 */}
        <div className="pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-2.5 gap-x-6 text-xs">
            <div className="flex items-baseline gap-2">
              <span className="text-slate-400 shrink-0">供应商名称：</span>
              <span className="text-slate-800 font-medium truncate" title={supplier.supplierName}>
                {supplier.supplierName}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-slate-400 shrink-0">供应商编号：</span>
              <span className="text-slate-800 font-mono font-medium">{supplier.supplierCode}</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-slate-400 shrink-0">统一社会信用代码：</span>
              <span className="text-slate-800 font-mono font-medium text-blue-900 bg-blue-50/70 px-1.5 py-0.5 rounded border border-blue-200/50">
                {supplier.creditCode || '-'}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-slate-400 shrink-0">供应商类别：</span>
              <span className="text-slate-800 font-medium px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                {supplier.supplierType}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-slate-400 shrink-0">入驻时间：</span>
              <span className="text-slate-800 font-mono">{joinDate}</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-slate-400 shrink-0">签约时间：</span>
              <span className="text-slate-800 font-mono">{supplier.contractDate || '-'}</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-slate-400 shrink-0">当前状态：</span>
              <span className="text-emerald-700 font-medium">{supplier.serviceStatus || '正常合作'}</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-slate-400 shrink-0">最近交易时间：</span>
              <span className="text-slate-800 font-mono">{supplier.lastTxDate || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 顶部主 Tab 切换：1. 销售视图 | 2. 付费视图 (保持当前供应商不变) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-lg border border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="inline-flex rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveMainTab('sales')}
            className={`px-5 py-2 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-2 ${
              activeMainTab === 'sales'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            销售视图
          </button>
          <button
            type="button"
            onClick={() => setActiveMainTab('payment')}
            className={`px-5 py-2 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-2 ${
              activeMainTab === 'payment'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            付费视图
          </button>
        </div>

        <div className="text-xs text-slate-500 hidden sm:flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-500" />
          <span>
            {activeMainTab === 'sales'
              ? '销售视图展示供应商出售产商品的经营与订单表现'
              : '付费视图展示供应商向平台购买增值服务的消费数据'}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 三、销售视图内容 */}
      {/* ========================================================================= */}
      {activeMainTab === 'sales' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* ------------------------------------------------------------------- */}
          {/* 1. 产商品概况 */}
          {/* ------------------------------------------------------------------- */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-1 h-3.5 bg-blue-600 rounded-xs" />
                <h3 className="text-sm font-bold text-slate-800">产商品概况</h3>
                <span className="text-xs text-slate-400 font-mono">（共 {productList.length} 项）</span>
              </div>
            </div>

            {/* 产商品列表，严格只包含产商品名称与产商品类别 */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5 w-16 text-center">序号</th>
                    <th className="px-4 py-2.5">产商品名称</th>
                    <th className="px-4 py-2.5 w-44">产商品类别（一级分类）</th>
                    <th className="px-4 py-2.5 w-44">子类型（二级分类）</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {productList.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-2.5 text-center font-mono text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-slate-800">
                        {item.productName}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold"
                          style={{
                            backgroundColor: `${CATEGORY_COLORS[item.category]}15`,
                            color: CATEGORY_COLORS[item.category] || '#1677FF',
                            border: `1px solid ${CATEGORY_COLORS[item.category]}40`,
                          }}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {item.subType}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* 2. 销售表现 */}
          {/* ------------------------------------------------------------------- */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-1 h-3.5 bg-blue-600 rounded-xs" />
                <h3 className="text-sm font-bold text-slate-800">销售表现</h3>
              </div>

              {/* 销售表现总体右侧时间选择模块（含当日、近一周、近一月、近一年） */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">统计周期：</span>
                <div className="inline-flex rounded bg-slate-100 p-0.5 text-xs font-medium text-slate-600">
                  {(['today', 'week', 'month', 'year'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSalesSectionTimeTab(r)}
                      className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                        salesSectionTimeTab === r
                          ? 'bg-white text-blue-600 font-semibold shadow-2xs'
                          : 'hover:text-slate-900'
                      }`}
                    >
                      {r === 'today' ? '当日' : r === 'week' ? '近一周' : r === 'month' ? '近一月' : '近一年'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 四个统一规格的指标卡：前两个为累计值（不随时间tab变化），后两个为新增值（由时间选择模块控制） */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 卡片 1: 供应商销售订单总数 (展示累计有效订单数，不设置时间 Tab) */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 font-medium">供应商销售订单总数</span>
                  <span className="text-[11px] text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded">
                    累计有效
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-slate-900">
                    {salesPerformance.totalOrders}
                  </span>
                  <span className="text-xs text-slate-500">笔</span>
                </div>
              </div>

              {/* 卡片 2: 供应商累计销售金额总数 (展示累计有效金额，不随时间 Tab 变化) */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 font-medium">供应商累计销售金额总数</span>
                  <span className="text-[11px] text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded">
                    累计有效
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-slate-900">
                    {salesPerformance.salesAmount.total.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-500">万元</span>
                </div>
              </div>

              {/* 卡片 3: 供应商新增销售订单数 (由销售表现总体右侧时间模块控制) */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 font-medium">供应商新增销售订单数</span>
                  <span className="text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-medium">
                    {salesSectionTimeTab === 'today' ? '当日' : salesSectionTimeTab === 'week' ? '近一周' : salesSectionTimeTab === 'month' ? '近一月' : '近一年'}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-slate-900">
                    {salesPerformance.newOrders[salesSectionTimeTab]}
                  </span>
                  <span className="text-xs text-slate-500">笔</span>
                </div>
              </div>

              {/* 卡片 4: 供应商新增销售金额 (由销售表现总体右侧时间模块控制) */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 font-medium">供应商新增销售金额</span>
                  <span className="text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-medium">
                    {salesSectionTimeTab === 'today' ? '当日' : salesSectionTimeTab === 'week' ? '近一周' : salesSectionTimeTab === 'month' ? '近一月' : '近一年'}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-blue-600">
                    {salesPerformance.salesAmount[salesSectionTimeTab].toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-500">万元</span>
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* 3. 销售订单明细 */}
          {/* ------------------------------------------------------------------- */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-1 h-3.5 bg-blue-600 rounded-xs" />
                <h3 className="text-sm font-bold text-slate-800">销售订单明细</h3>
                <span className="text-xs text-slate-400 font-mono">({salesOrders.length} 笔)</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-3.5 py-2.5">订单编号</th>
                    <th className="px-3.5 py-2.5">下单时间</th>
                    <th className="px-3.5 py-2.5">客户名称</th>
                    <th className="px-3.5 py-2.5">客户编号</th>
                    <th className="px-3.5 py-2.5">产商品类别</th>
                    <th className="px-3.5 py-2.5">产品名称</th>
                    <th className="px-3.5 py-2.5 text-right">订单金额</th>
                    <th className="px-3.5 py-2.5 text-right">平台佣金金额</th>
                    <th className="px-3.5 py-2.5 text-center">订单状态</th>
                    <th className="px-3.5 py-2.5">结束时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {paginatedSalesOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-3.5 py-2.5 font-mono font-medium text-blue-600">
                        {ord.orderId}
                      </td>
                      <td className="px-3.5 py-2.5 font-mono text-slate-600">{ord.orderTime}</td>
                      <td className="px-3.5 py-2.5 font-medium text-slate-800 max-w-[180px] truncate">
                        {ord.customerName}
                      </td>
                      <td className="px-3.5 py-2.5 font-mono text-slate-500">{ord.customerCode}</td>
                      <td className="px-3.5 py-2.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {ord.serviceCategory.replace('供需撮合服务', '').replace('撮合服务', '').replace('撮合', '')}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-slate-800 max-w-[200px] truncate" title={ord.productName}>
                        {ord.productName}
                      </td>
                      <td className="px-3.5 py-2.5 font-mono font-bold text-slate-900 text-right">
                        ¥{ord.orderAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3.5 py-2.5 font-mono text-indigo-600 font-semibold text-right">
                        ¥{ord.commissionAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3.5 py-2.5 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                            ord.status === '履约中'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : ord.status === '已完成'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : ord.status === '待支付'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 font-mono text-slate-500">{ord.endTime || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分页控制 (默认 10 笔每页) */}
            {totalSalesPages > 1 && (
              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 flex-wrap gap-2">
                <div>
                  共 <span className="font-medium font-mono text-slate-800">{salesOrders.length}</span> 笔订单，
                  第 <span className="font-medium font-mono text-slate-800">{salesOrdersPage}</span> / {totalSalesPages} 页
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={salesOrdersPage <= 1}
                    onClick={() => setSalesOrdersPage((p) => Math.max(1, p - 1))}
                    className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    上一页
                  </button>
                  {Array.from({ length: totalSalesPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setSalesOrdersPage(pageNum)}
                      className={`w-7 h-7 rounded border text-xs font-medium cursor-pointer transition-colors ${
                        salesOrdersPage === pageNum
                          ? 'border-blue-600 bg-blue-600 text-white font-semibold'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={salesOrdersPage >= totalSalesPages}
                    onClick={() => setSalesOrdersPage((p) => Math.min(totalSalesPages, p + 1))}
                    className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 四、付费视图内容 */}
      {/* ========================================================================= */}
      {activeMainTab === 'payment' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* ------------------------------------------------------------------- */}
          {/* 1. 消费概况 */}
          {/* ------------------------------------------------------------------- */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-1 h-3.5 bg-cyan-600 rounded-xs" />
                <h3 className="text-sm font-bold text-slate-800">消费概况</h3>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                {/* 指标卡旁展示最近一次购买时间 */}
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>最近一次购买时间：</span>
                  <strong className="font-mono text-slate-700">{vasPerformance.lastPurchaseTime}</strong>
                </div>

                {/* 消费概况总体右侧时间选择模块（含当日、近一周、近一月、近一年） */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">统计周期：</span>
                  <div className="inline-flex rounded bg-slate-100 p-0.5 text-xs font-medium text-slate-600">
                    {(['today', 'week', 'month', 'year'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setPaymentSectionTimeTab(r)}
                        className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                          paymentSectionTimeTab === r
                            ? 'bg-white text-cyan-700 font-semibold shadow-2xs'
                            : 'hover:text-slate-900'
                        }`}
                      >
                        {r === 'today' ? '当日' : r === 'week' ? '近一周' : r === 'month' ? '近一月' : '近一年'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 四个统一规格的指标卡：前两个为累计值（不随时间tab变化），后两个为新增值（由时间选择模块控制） */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 卡片 1: 供应商增值服务订单总数 (累计有效订单数，不随时间 Tab 变化) */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 font-medium">
                    供应商增值服务订单总数
                  </span>
                  <span className="text-[11px] text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded">
                    累计有效
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-slate-900">
                    {vasPerformance.totalVasOrders || 12}
                  </span>
                  <span className="text-xs text-slate-500">笔</span>
                </div>
              </div>

              {/* 卡片 2: 供应商累计消费金额 (累计消费金额，不随时间 Tab 变化) */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 font-medium">
                    供应商累计消费金额
                  </span>
                  <span className="text-[11px] text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded">
                    累计有效
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-cyan-700">
                    {vasPerformance.totalVasAmount.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-500">万元</span>
                </div>
              </div>

              {/* 卡片 3: 增值服务新增订单数 (由消费概况总体右侧时间模块控制) */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 font-medium">增值服务新增订单数</span>
                  <span className="text-[11px] text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100 font-medium">
                    {paymentSectionTimeTab === 'today' ? '当日' : paymentSectionTimeTab === 'week' ? '近一周' : paymentSectionTimeTab === 'month' ? '近一月' : '近一年'}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-slate-900">
                    {vasPerformance.vasOrders[paymentSectionTimeTab]}
                  </span>
                  <span className="text-xs text-slate-500">笔</span>
                </div>
              </div>

              {/* 卡片 4: 新增消费金额（增值服务） (由消费概况总体右侧时间模块控制) */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 font-medium">新增消费金额（增值服务）</span>
                  <span className="text-[11px] text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100 font-medium">
                    {paymentSectionTimeTab === 'today' ? '当日' : paymentSectionTimeTab === 'week' ? '近一周' : paymentSectionTimeTab === 'month' ? '近一月' : '近一年'}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-cyan-700">
                    {vasPerformance.newVasAmount[paymentSectionTimeTab].toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-500">万元</span>
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* 2. 已购增值服务（仅保留单一图表分析：各增值服务类别消费金额条形图） */}
          {/* ------------------------------------------------------------------- */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-1 h-3.5 bg-cyan-600 rounded-xs" />
                <h3 className="text-sm font-bold text-slate-800">已购增值服务分析</h3>
                <span className="text-xs text-slate-400">（各增值服务类别累计消费金额分布）</span>
              </div>
            </div>

            {/* 单一清晰图表分析 */}
            <div className="h-[320px]">
              <EChartWrapper option={vasBarOption} height="100%" />
            </div>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* 3. 增值服务订单明细（已删除查看详情操作） */}
          {/* ------------------------------------------------------------------- */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-1 h-3.5 bg-cyan-600 rounded-xs" />
                <h3 className="text-sm font-bold text-slate-800">增值服务订单明细</h3>
                <span className="text-xs text-slate-400 font-mono">({vasOrders.length} 笔)</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-3.5 py-2.5">订单编号</th>
                    <th className="px-3.5 py-2.5">增值服务类别</th>
                    <th className="px-3.5 py-2.5">增值服务名称</th>
                    <th className="px-3.5 py-2.5">购买时间</th>
                    <th className="px-3.5 py-2.5 text-right">订单金额</th>
                    <th className="px-3.5 py-2.5 text-center">订单状态</th>
                    <th className="px-3.5 py-2.5">服务开始时间</th>
                    <th className="px-3.5 py-2.5">服务结束时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {paginatedVasOrders.map((ord) => (
                    <tr key={ord.orderId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-3.5 py-2.5 font-mono font-medium text-cyan-700">
                        {ord.orderId}
                      </td>
                      <td className="px-3.5 py-2.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-cyan-50 text-cyan-700 border border-cyan-200">
                          {ord.vasCategory}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-slate-800 font-medium max-w-[260px] truncate" title={ord.vasName}>
                        {ord.vasName}
                      </td>
                      <td className="px-3.5 py-2.5 font-mono text-slate-600">{ord.purchaseTime}</td>
                      <td className="px-3.5 py-2.5 font-mono font-bold text-slate-900 text-right">
                        ¥{ord.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3.5 py-2.5 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                            ord.status === '履约中'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : ord.status === '已完成'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : ord.status === '待生效'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 font-mono text-slate-500">{ord.startTime}</td>
                      <td className="px-3.5 py-2.5 font-mono text-slate-500">{ord.endTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分页控制 (默认 10 笔每页) */}
            {totalVasPages > 1 && (
              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 flex-wrap gap-2">
                <div>
                  共 <span className="font-medium font-mono text-slate-800">{vasOrders.length}</span> 笔增值服务订单，
                  第 <span className="font-medium font-mono text-slate-800">{vasOrdersPage}</span> / {totalVasPages} 页
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={vasOrdersPage <= 1}
                    onClick={() => setVasOrdersPage((p) => Math.max(1, p - 1))}
                    className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    上一页
                  </button>
                  {Array.from({ length: totalVasPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setVasOrdersPage(pageNum)}
                      className={`w-7 h-7 rounded border text-xs font-medium cursor-pointer transition-colors ${
                        vasOrdersPage === pageNum
                          ? 'border-cyan-600 bg-cyan-600 text-white font-semibold'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={vasOrdersPage >= totalVasPages}
                    onClick={() => setVasOrdersPage((p) => Math.min(totalVasPages, p + 1))}
                    className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
