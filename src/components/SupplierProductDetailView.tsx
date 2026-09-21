import React, { useState } from 'react';
import { SupplierProductRecord } from '../data/supplierProductsMockData';
import { ExportButton } from './ExportButton';
import { exportDetailToWord, exportElementToPdf } from '../utils/exportUtils';
import {
  X,
  Package,
  Building2,
  Calendar,
  Layers,
  CreditCard,
  Truck,
  FileText,
  Clock,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  RotateCw,
} from 'lucide-react';

interface SupplierProductDetailViewProps {
  product: SupplierProductRecord;
  onBack: () => void;
}

export const SupplierProductDetailView: React.FC<SupplierProductDetailViewProps> = ({
  product,
  onBack,
}) => {
  // 销售指标与订单记录时间切换: 'week' | 'month' | 'year'
  const [salesTimeTab, setSalesTimeTab] = useState<'week' | 'month' | 'year'>('year');

  const activeStats = product.statsByRange[salesTimeTab];
  const timeLabel = salesTimeTab === 'year' ? '近一年' : salesTimeTab === 'month' ? '近一月' : '近一周';

  const handleExportWord = () => {
    exportDetailToWord(
      {
        title: `产商品详情档案 - ${product.productName}`,
        subtitle: `产品编码：${product.productCode} | 签约供应商：${product.supplierName}`,
        tags: [product.subType],
        metaInfo: [
          { label: '产品编码', value: product.productCode },
          { label: '产品类别', value: `${product.category} / ${product.subType}` },
          { label: '供应商', value: `${product.supplierName} (${product.supplierCode})` },
          { label: '上架日期', value: product.launchDate },
        ],
        sections: [
          {
            title: '基本参数与规格说明',
            fields: [
              { label: '产商品名称', value: product.productName, highlight: true },
              { label: '产商品编码', value: product.productCode },
              { label: '所属大类', value: product.category },
              { label: '二级子类', value: product.subType },
              { label: '计费定价', value: product.unitPrice, highlight: true },
              { label: '交付履约方式', value: product.deliveryType },
              { label: '规格型号', value: product.specs },
              { label: '上线时间', value: product.launchDate },
              { label: '产品描述', value: product.description },
            ],
          },
          {
            title: '销售表现汇总',
            fields: [
              { label: '累计销售订单', value: `${product.totalOrders} 笔`, highlight: true },
              { label: '累计销售成交额', value: `¥${product.totalSalesAmount.toFixed(2)} 万元`, highlight: true },
              { label: '最后交易时间', value: product.lastTxDate },
              { label: '近一周新增订单', value: `${product.statsByRange.week.newOrders} 笔` },
              { label: '近一周销售额', value: `¥${product.statsByRange.week.salesAmount.toFixed(2)} 万元` },
              { label: '近一月销售额', value: `¥${product.statsByRange.month.salesAmount.toFixed(2)} 万元` },
              { label: '近一年销售额', value: `¥${product.statsByRange.year.salesAmount.toFixed(2)} 万元` },
            ],
          },
          {
            title: `最近交易记录明细 (共 ${product.recentOrders.length} 笔)`,
            table: {
              headers: ['订单编号', '下单时间', '采购客户', '采购规格', '交易金额(万元)', '履约状态'],
              rows: product.recentOrders.map((o) => [
                o.orderId,
                o.orderDate,
                o.customerName,
                o.specs,
                `¥${o.amount.toFixed(2)}`,
                o.status,
              ]),
            },
          },
        ],
      },
      `产商品档案_${product.productName}`
    );
  };

  const handleExportPdf = async () => {
    await exportElementToPdf('supplier-product-detail-page', `产商品档案_${product.productName}`);
  };

  return (
    <div id="supplier-product-detail-page" className="space-y-4">
      {/* 顶部导航与关闭操作栏 */}
      <div className="bg-white rounded-md border border-slate-200/90 shadow-xs px-4 py-3 flex items-center justify-between">
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <span>供应商运营</span>
          <span>/</span>
          <span>供应商产商品</span>
          <span>/</span>
          <span className="text-slate-800 font-semibold">{product.productName}</span>
        </nav>

        <div className="flex items-center gap-2.5">
          <ExportButton onExportWord={handleExportWord} onExportPdf={handleExportPdf} />
          <div className="h-4 w-px bg-slate-200" />
          <button
            type="button"
            id="btn-close-supplier-product-detail"
            onClick={onBack}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer border border-transparent hover:border-slate-200 shrink-0"
            title="关闭详情页"
            aria-label="关闭详情页"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 产商品头部概览信息卡 */}
      <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
                {product.productCode}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500 font-medium">二级子类：{product.subType}</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              {product.productName}
            </h1>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 rounded-lg p-3">
            <div className="w-9 h-9 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-800">{product.supplierName}</div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                供应商编号：{product.supplierCode}
              </div>
            </div>
          </div>
        </div>

        {/* 基础参数属性网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
              计费定价说明
            </span>
            <p className="font-semibold text-slate-800">{product.unitPrice}</p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-slate-400" />
              交付方式
            </span>
            <p className="font-medium text-slate-700">{product.deliveryType}</p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              上架日期
            </span>
            <p className="font-mono text-slate-700">{product.launchDate}</p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              最近交易时间
            </span>
            <p className="font-mono text-slate-700">{product.lastTxDate}</p>
          </div>
        </div>

        {/* 技术规格与服务描述 */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50/70 border border-slate-200/70 rounded p-3 space-y-1">
            <div className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              核心技术规格与配置
            </div>
            <p className="text-slate-600 leading-relaxed font-mono text-[11.5px]">{product.specs}</p>
          </div>
          <div className="bg-slate-50/70 border border-slate-200/70 rounded p-3 space-y-1">
            <div className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              产商品介绍与应用场景
            </div>
            <p className="text-slate-600 leading-relaxed">{product.description}</p>
          </div>
        </div>
      </div>

      {/* 产商品独立销售表现面板 */}
      <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-blue-600 rounded-xs" />
            <h2 className="text-sm font-bold text-slate-800 tracking-wide flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              本产品销售表现
            </h2>
          </div>

          <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setSalesTimeTab('week')}
              className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
                salesTimeTab === 'week'
                  ? 'bg-white font-semibold text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              近一周
            </button>
            <button
              type="button"
              onClick={() => setSalesTimeTab('month')}
              className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
                salesTimeTab === 'month'
                  ? 'bg-white font-semibold text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              近一月
            </button>
            <button
              type="button"
              onClick={() => setSalesTimeTab('year')}
              className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
                salesTimeTab === 'year'
                  ? 'bg-white font-semibold text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              近一年
            </button>
          </div>
        </div>

        {/* 销售指标卡行 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div className="bg-slate-50/60 border border-slate-200/80 rounded-md p-3.5">
            <div className="text-xs text-slate-500 mb-1 flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5 text-blue-600" />
              本产品销售订单总数
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono text-slate-900">
                {product.totalOrders.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500">笔</span>
            </div>
            <span className="inline-block mt-1 text-[11px] text-slate-400">累计有效订单</span>
          </div>

          <div className="bg-slate-50/60 border border-slate-200/80 rounded-md p-3.5">
            <div className="text-xs text-slate-500 mb-1 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-blue-600" />
              本产品销售金额总数
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono text-slate-900">
                {product.totalSalesAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}
              </span>
              <span className="text-xs text-slate-500">万元</span>
            </div>
            <span className="inline-block mt-1 text-[11px] text-slate-400">累计销售总额</span>
          </div>

          <div className="bg-slate-50/60 border border-slate-200/80 rounded-md p-3.5">
            <div className="text-xs text-slate-500 mb-1 flex items-center gap-1.5">
              <RotateCw className="w-3.5 h-3.5 text-blue-600" />
              复购率
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono text-slate-900">
                {product.repeatPurchaseRate || '36.8%'}
              </span>
            </div>
          </div>

          <div className="bg-blue-50/40 border border-blue-100 rounded-md p-3.5">
            <div className="text-xs text-blue-700 font-medium mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShoppingCart className="w-3.5 h-3.5 text-blue-600" />
                本产品新增销售订单数
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                {timeLabel}
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono text-blue-700">
                {activeStats.newOrders.toLocaleString()}
              </span>
              <span className="text-xs text-blue-600">笔</span>
            </div>
            <span className="inline-block mt-1 text-[11px] text-blue-500">
              周期内新增有效订单
            </span>
          </div>

          <div className="bg-blue-50/40 border border-blue-100 rounded-md p-3.5">
            <div className="text-xs text-blue-700 font-medium mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                本产品销售金额
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                {timeLabel}
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono text-blue-700">
                {activeStats.salesAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="text-xs text-blue-600">万元</span>
            </div>
            <span className="inline-block mt-1 text-[11px] text-blue-500">
              周期内累计实现销售收入
            </span>
          </div>
        </div>

        {/* 最近交易记录列表 */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              本产品最近交易记录
            </h3>
            <span className="text-[11px] text-slate-400">
              共 {product.recentOrders.length} 笔近期交易明细
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200/80 rounded-md">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/90 text-slate-600 border-b border-slate-200/80 font-medium">
                <tr>
                  <th className="py-2.5 px-3">订单编号</th>
                  <th className="py-2.5 px-3">下单时间</th>
                  <th className="py-2.5 px-3">采购客户</th>
                  <th className="py-2.5 px-3">采购规格</th>
                  <th className="py-2.5 px-3 text-right">交易金额</th>
                  <th className="py-2.5 px-3 text-center">履约状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {product.recentOrders.map((ord) => (
                  <tr key={ord.orderId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-blue-600">{ord.orderId}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{ord.orderDate}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{ord.customerName}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">{ord.specs}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                      ¥{ord.amount.toFixed(2)} 万元
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                          ord.status === '已完成'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
