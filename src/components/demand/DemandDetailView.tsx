import React, { useState, useMemo } from 'react';
import {
  X,
  Building2,
  User,
  Clock,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Package,
  Layers,
  Calendar,
  Eye,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { EChartWrapper } from '../EChartWrapper';
import {
  DemandCustomerRecord,
  DemandOrderRecord,
  ALL_DEMAND_ORDERS,
  FixedProductCategory,
} from '../../data/demandMockData';
import {
  ALL_SUPPLIER_PRODUCTS,
  CATEGORY_COLORS,
  SupplierProductRecord,
} from '../../data/supplierProductsMockData';
import { ExportButton } from '../ExportButton';
import { exportDetailToWord, exportElementToPdf } from '../../utils/exportUtils';

interface DemandDetailViewProps {
  customer: DemandCustomerRecord;
  onBack: () => void;
  onViewOrderDetail: (order: DemandOrderRecord) => void;
  onViewProductDetail?: (product: SupplierProductRecord) => void;
}

export const DemandDetailView: React.FC<DemandDetailViewProps> = ({
  customer,
  onBack,
  onViewOrderDetail,
  onViewProductDetail,
}) => {
  // 详情页内部三个Tab：消费情况 | 订购产品 | 消费订单
  const [activeTab, setActiveTab] = useState<'consumption' | 'products' | 'orders'>('consumption');

  // 消费情况Tab内部时间Tab：'week' | 'month' | 'year'
  const [newOrderTimeTab, setNewOrderTimeTab] = useState<'week' | 'month' | 'year'>('year');
  const [newAmountTimeTab, setNewAmountTimeTab] = useState<'week' | 'month' | 'year'>('year');

  // 获取该客户关联的所有消费订单
  const customerOrders = useMemo(() => {
    return ALL_DEMAND_ORDERS.filter(
      (ord) =>
        ord.customerCode === customer.customerCode ||
        ord.customerName === customer.customerName
    );
  }, [customer]);

  // 从客户订单中提取出订购过的产品聚合列表
  const orderedProducts = useMemo(() => {
    const map = new Map<
      string,
      {
        productName: string;
        category: FixedProductCategory;
        supplierName: string;
        orderCount: number;
        totalAmount: number;
        lastOrderTime: string;
      }
    >();

    customerOrders.forEach((ord) => {
      const existing = map.get(ord.productName);
      if (existing) {
        existing.orderCount += 1;
        existing.totalAmount += ord.orderAmount;
        if (ord.orderTime > existing.lastOrderTime) {
          existing.lastOrderTime = ord.orderTime;
        }
      } else {
        map.set(ord.productName, {
          productName: ord.productName,
          category: ord.category,
          supplierName: ord.supplierName,
          orderCount: 1,
          totalAmount: ord.orderAmount,
          lastOrderTime: ord.orderTime,
        });
      }
    });

    return Array.from(map.values());
  }, [customerOrders]);

  // 消费走势图配置 (订单数折线 + 消费金额柱状)
  const trendOption = useMemo(() => {
    const months = customer.monthlyTrends.map((t) => t.month);
    const orders = customer.monthlyTrends.map((t) => t.orders);
    const amounts = customer.monthlyTrends.map((t) => t.amount);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
      },
      legend: {
        top: 0,
        right: 12,
        textStyle: { fontSize: 12, color: '#64748B' },
      },
      grid: {
        top: 36,
        left: '2%',
        right: '3%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: months,
        axisLine: { lineStyle: { color: '#CBD5E1' } },
        axisLabel: { color: '#64748B', fontSize: 11 },
      },
      yAxis: [
        {
          type: 'value',
          name: '消费金额 (万元)',
          splitLine: { lineStyle: { type: 'dashed', color: '#F1F5F9' } },
          axisLabel: { color: '#64748B', fontSize: 11 },
          nameTextStyle: { color: '#94A3B8', fontSize: 11 },
        },
        {
          type: 'value',
          name: '订单数 (笔)',
          splitLine: { show: false },
          axisLabel: { color: '#64748B', fontSize: 11 },
          nameTextStyle: { color: '#94A3B8', fontSize: 11 },
        },
      ],
      series: [
        {
          name: '消费金额',
          type: 'bar',
          barWidth: 18,
          itemStyle: {
            color: '#2563EB',
            borderRadius: [3, 3, 0, 0],
          },
          data: amounts,
        },
        {
          name: '订单数',
          type: 'line',
          yAxisIndex: 1,
          smooth: false,
          lineStyle: { width: 3, color: '#0EA5E9' },
          itemStyle: { color: '#0EA5E9' },
          data: orders,
        },
      ],
    };
  }, [customer]);

  // 处理点击产商品名称进入“供应商产商品详情”
  const handleProductClick = (productName: string) => {
    if (!onViewProductDetail) return;
    const found = ALL_SUPPLIER_PRODUCTS.find(
      (p) => p.productName.toLowerCase() === productName.toLowerCase()
    );
    if (found) {
      onViewProductDetail(found);
    } else {
      // 构造基础产商品档案以供展示
      const fallback: SupplierProductRecord = {
        id: `gen-${productName}`,
        productCode: 'PROD-WH-001',
        productName: productName,
        category: '算力',
        subType: '通用算力',
        supplierId: '1',
        supplierName: customerOrders[0]?.supplierName || '武汉光谷智能计算科技有限公司',
        supplierCode: 'SUP-WH-20240101',
        status: '正常在架',
        unitPrice: '120元/机时',
        deliveryType: '实时在线交付',
        specs: '64核 / 256GB / 昇腾910B',
        launchDate: '2025-06-01',
        description: '高性能智算集群实例',
        totalOrders: 120,
        totalSalesAmount: 64.0,
        lastTxDate: '2026-08-28 16:45',
        statsByRange: {
          today: { newOrders: 2, salesAmount: 0.8 },
          week: { newOrders: 14, salesAmount: 4.8 },
          month: { newOrders: 65, salesAmount: 22.4 },
          year: { newOrders: 780, salesAmount: 268.0 },
        },
        recentOrders: [],
      };
      onViewProductDetail(fallback);
    }
  };

  // 导出文档操作 (Word / PDF)
  const handleExportWord = () => {
    exportDetailToWord(
      {
        title: `需求方客户详情档案 - ${customer.customerName}`,
        subtitle: `客户编号：${customer.customerCode} | 类别：${customer.customerType}`,
        tags: [customer.customerType, `累计订单 ${customer.totalOrders} 笔`, `累计消费 ¥${customer.totalConsumption.toFixed(2)} 万元`],
        metaInfo: [
          { label: '需求方编号', value: customer.customerCode },
          { label: '客户类型', value: customer.customerType },
          { label: '最近登录时间', value: customer.lastLoginTime },
          { label: '最后交易时间', value: customer.lastTxDate },
          { label: '覆盖业务类别', value: customer.orderedCategories.join('、') },
        ],
        sections: [
          {
            title: '核心消费指标统计',
            fields: [
              { label: '累计订单总数', value: `${customer.totalOrders} 笔`, highlight: true },
              { label: '累计消费总金额', value: `¥${customer.totalConsumption.toFixed(2)} 万元`, highlight: true },
              { label: '已订购产品款数', value: `${customer.orderedProductsCount} 款` },
              { label: '近一周新增订单', value: `${customer.consumptionStats.week.newOrders} 笔` },
              { label: '近一周新增金额', value: `¥${customer.consumptionStats.week.newAmount.toFixed(2)} 万元` },
              { label: '近一月新增金额', value: `¥${customer.consumptionStats.month.newAmount.toFixed(2)} 万元` },
              { label: '近一年新增金额', value: `¥${customer.consumptionStats.year.newAmount.toFixed(2)} 万元` },
            ],
          },
          {
            title: `已订购产商品列表 (共 ${orderedProducts.length} 款)`,
            table: {
              headers: ['产品名称', '所属大类', '签约供应商', '订购笔数', '累计消费金额(万元)', '最后订购时间'],
              rows: orderedProducts.map((p) => [
                p.productName,
                p.category,
                p.supplierName,
                p.orderCount,
                p.totalAmount.toFixed(2),
                p.lastOrderTime,
              ]),
            },
          },
          {
            title: `关联消费订单记录 (共 ${customerOrders.length} 笔)`,
            table: {
              headers: ['订单编号', '订购产品', '产品类别', '签约供应商', '订单金额(元)', '履约状态', '下单时间'],
              rows: customerOrders.map((o) => [
                o.orderId,
                o.productName,
                o.category,
                o.supplierName,
                `¥${o.orderAmount.toLocaleString()}`,
                o.status,
                o.orderTime,
              ]),
            },
          },
        ],
      },
      `需求方客户档案_${customer.customerName}`
    );
  };

  const handleExportPdf = async () => {
    await exportElementToPdf('demand-customer-detail-page', `需求方客户档案_${customer.customerName}`);
  };

  return (
    <div id="demand-customer-detail-page" className="space-y-4">
      {/* 顶部导航与关闭操作栏 */}
      <div className="bg-white rounded-md border border-slate-200/90 shadow-xs px-4 py-3 flex items-center justify-between">
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <span>需求方运营</span>
          <span>/</span>
          <span>需求方主体详情</span>
          <span>/</span>
          <span className="text-slate-800 font-semibold">{customer.customerName}</span>
        </nav>

        <div className="flex items-center gap-2.5">
          <ExportButton onExportWord={handleExportWord} onExportPdf={handleExportPdf} />
          <div className="h-4 w-px bg-slate-200" />
          <button
            type="button"
            id="btn-close-demand-customer-detail"
            onClick={onBack}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer border border-transparent hover:border-slate-200 shrink-0"
            title="关闭详情页"
            aria-label="关闭详情页"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 需求方主体信息栏与内部切换Tab */}
      <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start md:items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                {customer.customerName}
              </h1>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  customer.customerType === '企业'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                }`}
              >
                {customer.customerType}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 flex-wrap">
              <span>
                需求方编号: <strong className="font-mono text-slate-700">{customer.customerCode}</strong>
              </span>
              <span>•</span>
              <span>
                主体类型: <strong className="text-slate-700">{customer.customerType === '企业' ? '企业客户 (B端)' : '个人开发者/客户 (C端)'}</strong>
              </span>
              <span>•</span>
              <span>
                最近登录时间: <strong className="font-mono text-slate-700">{customer.lastLoginTime}</strong>
              </span>
              <span>•</span>
              <span>
                最后交易时间: <strong className="font-mono text-slate-700">{customer.lastTxDate}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* 详情页内部Tab切换 */}
        <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium text-slate-600 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('consumption')}
            className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
              activeTab === 'consumption'
                ? 'bg-white font-semibold text-blue-600 shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            消费情况
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-white font-semibold text-blue-600 shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            订购产品 ({orderedProducts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-white font-semibold text-blue-600 shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            消费订单 ({customerOrders.length})
          </button>
        </div>
      </div>

      {/* ======================= Tab 1: 消费情况 ======================= */}
      {activeTab === 'consumption' && (
        <div className="space-y-4">
          {/* 四个指标卡：订单总数和消费总金额放左边，新增订单数和新增消费金额都放在右侧 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 卡片 1 (左1): 订单总数 (累计指标，不设置时间Tab) */}
            <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-medium text-xs text-slate-700 flex items-center gap-1.5">
                  <ShoppingCart className="w-3.5 h-3.5 text-blue-600" />
                  订单总数
                </span>
                <span className="text-[11px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60">
                  历史累计
                </span>
              </div>
              <div className="py-2.5">
                <div className="text-2xl font-bold text-slate-900 tracking-tight">
                  {customer.totalOrders.toLocaleString()}
                  <span className="text-xs font-normal text-slate-500 ml-1">笔</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  展示该客户自签约入驻以来的全量有效订购订单总数
                </div>
              </div>
            </div>

            {/* 卡片 2 (左2): 消费总金额 (累计指标，不设置时间Tab) */}
            <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-medium text-xs text-slate-700 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                  消费总金额
                </span>
                <span className="text-[11px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60">
                  历史累计
                </span>
              </div>
              <div className="py-2.5">
                <div className="text-2xl font-bold text-slate-900 tracking-tight">
                  {customer.totalConsumption.toFixed(1)}
                  <span className="text-xs font-normal text-slate-500 ml-1">万元</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  展示该客户平台累计结算履约的交易总规模
                </div>
              </div>
            </div>

            {/* 卡片 3 (右1): 新增订单数 (内部设置近一周、近一月、近一年Tab) */}
            <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-medium text-xs text-slate-700 flex items-center gap-1.5">
                  <ShoppingCart className="w-3.5 h-3.5 text-blue-600" />
                  新增订单数
                </span>
                <div className="inline-flex rounded border border-slate-200 bg-slate-50 p-0.5 text-[11px] font-medium text-slate-600">
                  <button
                    type="button"
                    onClick={() => setNewOrderTimeTab('week')}
                    className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                      newOrderTimeTab === 'week' ? 'bg-white font-semibold text-blue-600 shadow-2xs' : ''
                    }`}
                  >
                    近一周
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewOrderTimeTab('month')}
                    className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                      newOrderTimeTab === 'month' ? 'bg-white font-semibold text-blue-600 shadow-2xs' : ''
                    }`}
                  >
                    近一月
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewOrderTimeTab('year')}
                    className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                      newOrderTimeTab === 'year' ? 'bg-white font-semibold text-blue-600 shadow-2xs' : ''
                    }`}
                  >
                    近一年
                  </button>
                </div>
              </div>
              <div className="py-2.5">
                <div className="text-2xl font-bold text-slate-900 tracking-tight">
                  {customer.consumptionStats[newOrderTimeTab].newOrders}
                  <span className="text-xs font-normal text-slate-500 ml-1">笔</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  展示该客户在选定周期（{newOrderTimeTab === 'year' ? '近一年' : newOrderTimeTab === 'month' ? '近一月' : '近一周'}）内新产生的有效订单笔数
                </div>
              </div>
            </div>

            {/* 卡片 4 (右2): 新增消费金额 (内部设置近一周、近一月、近一年Tab) */}
            <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-medium text-xs text-slate-700 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                  新增消费金额
                </span>
                <div className="inline-flex rounded border border-slate-200 bg-slate-50 p-0.5 text-[11px] font-medium text-slate-600">
                  <button
                    type="button"
                    onClick={() => setNewAmountTimeTab('week')}
                    className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                      newAmountTimeTab === 'week' ? 'bg-white font-semibold text-blue-600 shadow-2xs' : ''
                    }`}
                  >
                    近一周
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAmountTimeTab('month')}
                    className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                      newAmountTimeTab === 'month' ? 'bg-white font-semibold text-blue-600 shadow-2xs' : ''
                    }`}
                  >
                    近一月
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAmountTimeTab('year')}
                    className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                      newAmountTimeTab === 'year' ? 'bg-white font-semibold text-blue-600 shadow-2xs' : ''
                    }`}
                  >
                    近一年
                  </button>
                </div>
              </div>
              <div className="py-2.5">
                <div className="text-2xl font-bold text-blue-600 tracking-tight">
                  {customer.consumptionStats[newAmountTimeTab].newAmount.toFixed(1)}
                  <span className="text-xs font-normal text-slate-500 ml-1">万元</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  展示该客户在选定周期（{newAmountTimeTab === 'year' ? '近一年' : newAmountTimeTab === 'month' ? '近一月' : '近一周'}）内新增的订单结算流水
                </div>
              </div>
            </div>
          </div>

          {/* 消费走势图 */}
          <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3 bg-blue-600 rounded-xs" />
                <span className="text-xs font-bold text-slate-800 tracking-wide">
                  月度消费走势
                </span>
              </div>
              <span className="text-[11px] text-slate-400">近6个月消费与订单频次</span>
            </div>
            <div className="h-[280px] w-full">
              <EChartWrapper option={trendOption} height="100%" />
            </div>
          </div>
        </div>
      )}

      {/* ======================= Tab 2: 订购产品 ======================= */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-md border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-3 bg-blue-600 rounded-xs" />
              <span className="text-xs font-bold text-slate-800">
                已订购产品列表
              </span>
            </div>
            <span className="text-xs text-slate-400">
              共订购 {orderedProducts.length} 种产商品
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="py-2.5 px-3.5">商品名称</th>
                  <th className="py-2.5 px-3.5">七类产品类别</th>
                  <th className="py-2.5 px-3.5">所属供应商</th>
                  <th className="py-2.5 px-3.5 text-right">订购订单数</th>
                  <th className="py-2.5 px-3.5 text-right">消费金额</th>
                  <th className="py-2.5 px-3.5">最近订购时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orderedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      暂无订购产品记录
                    </td>
                  </tr>
                ) : (
                  orderedProducts.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3.5 font-medium">
                        <button
                          type="button"
                          onClick={() => handleProductClick(item.productName)}
                          className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 cursor-pointer text-left"
                          title="点击查看供应商产商品详情"
                        >
                          <span>{item.productName}</span>
                          <ExternalLink className="w-3 h-3 text-blue-400" />
                        </button>
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-medium text-white"
                          style={{ backgroundColor: CATEGORY_COLORS[item.category] || '#2563EB' }}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-600">
                        {item.supplierName}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-medium text-slate-800">
                        {item.orderCount} 笔
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-semibold text-blue-600">
                        ¥{item.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {item.lastOrderTime}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================= Tab 3: 消费订单 ======================= */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-md border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-3 bg-blue-600 rounded-xs" />
              <span className="text-xs font-bold text-slate-800">
                需求方消费订单记录
              </span>
            </div>
            <span className="text-xs text-slate-400">
              共 {customerOrders.length} 笔订单
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="py-2.5 px-3.5">订单编号</th>
                  <th className="py-2.5 px-3.5">供应商</th>
                  <th className="py-2.5 px-3.5">产商品</th>
                  <th className="py-2.5 px-3.5">类别</th>
                  <th className="py-2.5 px-3.5 text-right">订单金额</th>
                  <th className="py-2.5 px-3.5 text-center">订单状态</th>
                  <th className="py-2.5 px-3.5">下单时间</th>
                  <th className="py-2.5 px-3.5 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customerOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      暂无订单记录
                    </td>
                  </tr>
                ) : (
                  customerOrders.map((ord) => (
                    <tr key={ord.orderId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3.5 font-mono text-[11px] font-semibold text-slate-900">
                        {ord.orderId}
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-600">
                        {ord.supplierName}
                      </td>
                      <td className="py-2.5 px-3.5 font-medium text-slate-800">
                        {ord.productName}
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-medium text-white"
                          style={{ backgroundColor: CATEGORY_COLORS[ord.category] || '#2563EB' }}
                        >
                          {ord.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-semibold text-blue-600">
                        ¥{ord.orderAmount.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                            ord.status === '履约中'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : ord.status === '已完成'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : ord.status === '待支付'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {ord.orderTime}
                      </td>
                      <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onViewOrderDetail(ord)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          查看详情
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
