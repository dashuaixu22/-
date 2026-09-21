import React from 'react';
import {
  X,
  FileText,
  Building2,
  User,
  Clock,
  Calendar,
  Layers,
  Package,
  CreditCard,
  CheckCircle2,
  ExternalLink,
  DollarSign,
} from 'lucide-react';
import { DemandOrderRecord, DemandCustomerRecord, ALL_DEMAND_CUSTOMERS } from '../../data/demandMockData';
import { CATEGORY_COLORS, ALL_SUPPLIER_PRODUCTS, SupplierProductRecord } from '../../data/supplierProductsMockData';
import { ALL_SUPPLIER_RECORDS } from '../../data/supplierQueryMockData';
import { SupplierRecord } from '../../types';
import { ExportButton } from '../ExportButton';
import { exportDetailToWord, exportElementToPdf } from '../../utils/exportUtils';

interface DemandOrderDetailViewProps {
  order: DemandOrderRecord;
  onBack: () => void;
  onViewCustomerDetail?: (customer: DemandCustomerRecord) => void;
  onViewSupplierDetail?: (supplier: SupplierRecord) => void;
  onViewProductDetail?: (product: SupplierProductRecord) => void;
}

export const DemandOrderDetailView: React.FC<DemandOrderDetailViewProps> = ({
  order,
  onBack,
  onViewCustomerDetail,
  onViewSupplierDetail,
  onViewProductDetail,
}) => {
  // 查找对应需求方实体
  const bizType = order.orderBusinessType || (order.category.includes('智能体') ? '智能体' : order.category.includes('模型') ? '模型' : '算力');
  const displayCustomerName = bizType === '智能体' ? '—' : (order.customerName === '—' ? '—' : order.customerName);
  const displayCustomerType = (bizType === '智能体' || order.customerType === '—' || !['企业', '个人'].includes(order.customerType)) ? '—' : order.customerType;
  const displaySupplierName = bizType === '模型' ? '—' : (order.supplierName === '—' ? '—' : order.supplierName);
  const displaySupplierCode = bizType === '模型' ? '—' : (order.supplierCode === '—' ? '—' : order.supplierCode);

  const handleCustomerClick = () => {
    if (!onViewCustomerDetail || displayCustomerName === '—') return;
    const found = ALL_DEMAND_CUSTOMERS.find(
      (c) => c.customerCode === order.customerCode || c.customerName === order.customerName
    );
    if (found) {
      onViewCustomerDetail(found);
    } else {
      const fallback: DemandCustomerRecord = {
        id: `gen-${order.customerCode}`,
        customerCode: order.customerCode,
        customerName: order.customerName,
        customerType: order.customerType === '个人' ? '个人用户' : '企业',
        totalOrders: 1,
        totalConsumption: order.orderAmount / 10000,
        orderedProductsCount: 1,
        lastLoginTime: order.orderTime,
        lastTxDate: order.orderTime,
        orderedCategories: [order.category],
        consumptionStats: {
          week: { newOrders: 1, newAmount: order.orderAmount / 10000 },
          month: { newOrders: 1, newAmount: order.orderAmount / 10000 },
          year: { newOrders: 1, newAmount: order.orderAmount / 10000 },
        },
        monthlyTrends: [
          { month: '2026-08', orders: 1, amount: order.orderAmount / 10000 },
        ],
      };
      onViewCustomerDetail(fallback);
    }
  };

  // 查找对应供应商实体
  const handleSupplierClick = () => {
    if (!onViewSupplierDetail || displaySupplierName === '—') return;
    const found = ALL_SUPPLIER_RECORDS.find(
      (s) => s.supplierCode === order.supplierCode || s.supplierName === order.supplierName
    );
    if (found) {
      onViewSupplierDetail(found);
    } else {
      const fallback: SupplierRecord = {
        id: '1',
        supplierCode: order.supplierCode,
        creditCode: '91420100MA4K12AB34',
        supplierName: order.supplierName,
        supplierType: order.category,
        productCategory: `${order.category}服务`,
        contractDate: '2024-03-15',
        basicOrderCount: 120,
        basicOrderAmount: 480.0,
        vasOrderCount: 15,
        vasOrderAmount: 24.0,
        lastTxDate: order.orderTime,
        contactPerson: '李经理',
        contactPhone: '138****0001',
      };
      onViewSupplierDetail(fallback);
    }
  };

  // 查找对应产商品实体
  const handleProductClick = () => {
    if (!onViewProductDetail) return;
    const found = ALL_SUPPLIER_PRODUCTS.find((p) => p.productName === order.productName);
    if (found) {
      onViewProductDetail(found);
    } else {
      const fallback: SupplierProductRecord = {
        id: `gen-${order.productName}`,
        productCode: 'PROD-WH-001',
        productName: order.productName,
        category: order.category,
        subType: '通用服务',
        supplierId: '1',
        supplierName: order.supplierName,
        supplierCode: order.supplierCode,
        status: '正常在架',
        unitPrice: '150元/次',
        deliveryType: '实时在线交付',
        specs: '标准企业级规格',
        launchDate: '2025-06-01',
        description: '算网高可用服务实例',
        totalOrders: 780,
        totalSalesAmount: 268.0,
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

  // 导出文档方法
  const handleExportWord = () => {
    exportDetailToWord(
      {
        title: `消费订单详情 - ${order.orderId}`,
        subtitle: `订购产品：${order.productName} (${order.category})`,
        tags: [order.status, order.category, displayCustomerType],
        metaInfo: [
          { label: '订单编号', value: order.orderId },
          { label: '订单业务类型', value: bizType },
          { label: '下单时间', value: order.orderTime },
          { label: '支付时间', value: order.payTime || (order.status === '待支付' || order.status === '已取消' ? '—' : order.orderTime) },
        ],
        sections: [
          {
            title: '订单周期与履约状态',
            fields: [
              { label: '订单编号', value: order.orderId, highlight: true },
              { label: '订单业务类型', value: bizType },
              { label: '订单状态', value: order.status },
              { label: '产品类别', value: order.category },
              { label: '下单时间', value: order.orderTime },
              { label: '支付时间', value: order.payTime || (order.status === '待支付' || order.status === '已取消' ? '—' : order.orderTime) },
              { label: '截止履约时间', value: order.endTime },
            ],
          },
          {
            title: '产商品与订购规格',
            fields: [
              { label: '产品名称', value: order.productName, highlight: true },
              { label: '产品类别', value: order.category },
              { label: '订购规格', value: order.specifications || '标准配置规格' },
            ],
          },
          {
            title: '需求方客户信息',
            fields: [
              { label: '需求方名称', value: displayCustomerName, highlight: true },
              { label: '需求方编号', value: order.customerCode },
              { label: '需求方类型', value: displayCustomerType },
            ],
          },
          {
            title: '履约供应商信息',
            fields: [
              { label: '供应商名称', value: displaySupplierName, highlight: true },
              { label: '供应商编号', value: displaySupplierCode },
              { label: '业务类别', value: order.category },
            ],
          },
          {
            title: '交易结算明细',
            fields: [
              { label: '订单总金额', value: `¥${order.orderAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 元`, highlight: true },
              { label: '实付金额', value: order.actualAmount !== undefined ? `¥${order.actualAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 元` : (order.status === '待支付' || order.status === '已取消' ? '—' : `¥${order.orderAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 元`) },
              { label: '计费方式', value: order.billingPeriod || '周期计费' },
              { label: '结算归属', value: '平台撮合交易订单' },
            ],
          },
        ],
      },
      `消费订单_${order.orderId}`
    );
  };

  const handleExportPdf = async () => {
    await exportElementToPdf('demand-order-detail-card', `消费订单_${order.orderId}`);
  };

  return (
    <div className="space-y-4">
      {/* 顶部导航与关闭操作栏 */}
      <div className="bg-white rounded-md border border-slate-200/90 shadow-xs px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <span>交易消费</span>
          <span>/</span>
          <span>消费订单详情</span>
          <span>/</span>
          <span className="text-slate-800 font-semibold font-mono">{order.orderId}</span>
        </nav>

        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
              bizType === '智能体'
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
                : bizType === '算力'
                ? 'bg-blue-50 text-blue-700 border-blue-200/80'
                : 'bg-purple-50 text-purple-700 border-purple-200/80'
            }`}
          >
            {bizType}
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
              order.status === '履约中'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : order.status === '已完成'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : order.status === '待支付'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {order.status}
          </span>
          <span
            className="px-2.5 py-0.5 rounded text-xs font-medium text-white shadow-xs"
            style={{ backgroundColor: CATEGORY_COLORS[order.category] || '#2563EB' }}
          >
            {order.category}
          </span>
          <ExportButton onExportWord={handleExportWord} onExportPdf={handleExportPdf} />
          <div className="h-4 w-px bg-slate-200" />
          <button
            type="button"
            id="btn-close-demand-order-detail"
            onClick={onBack}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer border border-transparent hover:border-slate-200 shrink-0"
            title="关闭详情页"
            aria-label="关闭详情页"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 订单详情主卡片 (严格按照要求展示所有字段与互联跳转) */}
      <div id="demand-order-detail-card" className="bg-white rounded-md border border-slate-200/90 shadow-xs p-6 space-y-6">
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="text-xs text-slate-400">交易订单编号</div>
            <div className="text-xl font-bold text-slate-900 font-mono tracking-tight mt-0.5">
              {order.orderId}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">订单总金额</div>
            <div className="text-2xl font-bold text-blue-600 tracking-tight mt-0.5">
              ¥{order.orderAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* 核心信息网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 左侧：交易时间与履约周期及金额 */}
          <div className="space-y-3 bg-slate-50/70 p-4 rounded-md border border-slate-200/70">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 pb-2 border-b border-slate-200/60">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              订单周期与履约状态
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">订单业务类型</span>
                <span className="font-semibold text-slate-800">{bizType}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">订单状态</span>
                <span className="font-semibold text-slate-800">{order.status}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">产品类别</span>
                <span className="font-semibold text-slate-800">{order.category}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">下单时间</span>
                <span className="font-mono text-slate-700">{order.orderTime}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">支付时间</span>
                <span className="font-mono text-slate-700">
                  {order.payTime || (order.status === '待支付' || order.status === '已取消' ? '—' : order.orderTime)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">截止履约时间</span>
                <span className="font-mono text-slate-700">{order.endTime}</span>
              </div>
              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-slate-400 block mb-0.5">订单总金额</span>
                <span className="font-semibold font-mono text-slate-900 text-sm">
                  ¥{order.orderAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-slate-400 block mb-0.5">实付金额</span>
                <span className="font-semibold font-mono text-blue-600 text-sm">
                  {order.actualAmount !== undefined
                    ? `¥${order.actualAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : (order.status === '待支付' || order.status === '已取消'
                        ? '—'
                        : `¥${order.orderAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)}
                </span>
              </div>
            </div>
            {order.billingPeriod && (
              <div className="pt-2 border-t border-slate-200/60 text-xs">
                <span className="text-slate-400 block mb-0.5">结算周期 / 计费模式</span>
                <span className="text-slate-700">{order.billingPeriod}</span>
              </div>
            )}
          </div>

          {/* 右侧：产商品信息 (可跳转产商品详情) */}
          <div className="space-y-3 bg-slate-50/70 p-4 rounded-md border border-slate-200/70">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 pb-2 border-b border-slate-200/60">
              <Package className="w-3.5 h-3.5 text-blue-600" />
              交易产商品档案
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">商品名称 (点击进入档案)</span>
                <button
                  type="button"
                  onClick={handleProductClick}
                  className="font-medium text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 text-left cursor-pointer"
                  title="点击进入供应商产商品详情"
                >
                  <span className="text-sm font-semibold">{order.productName}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">产品类别</span>
                <span className="text-slate-700">{order.category}</span>
              </div>
              {order.specifications && (
                <div>
                  <span className="text-slate-400 block mb-0.5">规格配置说明</span>
                  <span className="text-slate-600">{order.specifications}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 关联双方：需求方与供应商 (支持跨模块互联互通跳转) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 需求方卡片 */}
          <div className="p-4 rounded-md border border-blue-100 bg-blue-50/30 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-blue-100">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                需求方主体信息
              </div>
              {displayCustomerType !== '—' ? (
                <span className="text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-medium">
                  {displayCustomerType}
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 font-mono">—</span>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">需求方名称</span>
                {displayCustomerName === '—' ? (
                  <span className="font-mono text-slate-400 text-sm font-semibold">—</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleCustomerClick}
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 text-left cursor-pointer"
                    title="点击进入需求方详情"
                  >
                    <span className="font-semibold text-slate-900">{displayCustomerName}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-slate-400 block mb-0.5">需求方编号</span>
                  <span className="font-mono text-slate-700">{order.customerCode}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">主体分类</span>
                  <span className="text-slate-700">{displayCustomerType}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 供应商卡片 */}
          <div className="p-4 rounded-md border border-slate-200 bg-slate-50/40 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                履约供应商主体信息
              </div>
              <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                供需撮合
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">供应商名称</span>
                {displaySupplierName === '—' ? (
                  <span className="font-mono text-slate-400 text-sm font-semibold">—</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSupplierClick}
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 text-left cursor-pointer"
                    title="点击进入供应商详情"
                  >
                    <span className="font-semibold text-slate-900">{displaySupplierName}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-slate-400 block mb-0.5">供应商编号</span>
                  <span className="font-mono text-slate-700">{displaySupplierCode}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">数据一致性校验</span>
                  <span className="text-emerald-600 font-medium">统一订单底座</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
