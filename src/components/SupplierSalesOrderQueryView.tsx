import React, { useState, useMemo } from 'react';
import {
  Search,
  RotateCcw,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { SupplierSalesOrderRecord } from '../types';
import {
  ALL_SUPPLIER_SALES_ORDERS,
  ORDER_BUSINESS_TYPE_OPTIONS,
  ORDER_PRODUCT_CATEGORY_OPTIONS,
  SALES_ORDER_STATUS_OPTIONS,
} from '../data/supplierQueryMockData';

export const SupplierSalesOrderQueryView: React.FC = () => {
  // 查询表单输入状态（严格按照规范）
  const [selectedBusinessType, setSelectedBusinessType] = useState('全部');
  const [orderIdInput, setOrderIdInput] = useState('');
  const [supplierNameInput, setSupplierNameInput] = useState('');
  const [supplierCodeInput, setSupplierCodeInput] = useState('');
  const [customerNameInput, setCustomerNameInput] = useState('');
  const [customerCodeInput, setCustomerCodeInput] = useState('');
  const [selectedProductCategory, setSelectedProductCategory] = useState('全部');
  const [productNameInput, setProductNameInput] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('全部');
  const [orderStartTime, setOrderStartTime] = useState('');
  const [orderEndTime, setOrderEndTime] = useState('');

  // 实际生效的筛选条件
  const [appliedFilters, setAppliedFilters] = useState({
    businessType: '全部',
    orderId: '',
    supplierName: '',
    supplierCode: '',
    customerName: '',
    customerCode: '',
    productCategory: '全部',
    productName: '',
    status: '全部',
    orderStartTime: '',
    orderEndTime: '',
  });

  // 分页状态 (每页 10 条)
  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpPageInput, setJumpPageInput] = useState('');

  // 执行查询
  const handleSearch = () => {
    setAppliedFilters({
      businessType: selectedBusinessType,
      orderId: orderIdInput.trim(),
      supplierName: supplierNameInput.trim(),
      supplierCode: supplierCodeInput.trim(),
      customerName: customerNameInput.trim(),
      customerCode: customerCodeInput.trim(),
      productCategory: selectedProductCategory,
      productName: productNameInput.trim(),
      status: selectedStatus,
      orderStartTime: orderStartTime.trim(),
      orderEndTime: orderEndTime.trim(),
    });
    setCurrentPage(1);
  };

  // 重置筛选
  const handleReset = () => {
    setSelectedBusinessType('全部');
    setOrderIdInput('');
    setSupplierNameInput('');
    setSupplierCodeInput('');
    setCustomerNameInput('');
    setCustomerCodeInput('');
    setSelectedProductCategory('全部');
    setProductNameInput('');
    setSelectedStatus('全部');
    setOrderStartTime('');
    setOrderEndTime('');
    setAppliedFilters({
      businessType: '全部',
      orderId: '',
      supplierName: '',
      supplierCode: '',
      customerName: '',
      customerCode: '',
      productCategory: '全部',
      productName: '',
      status: '全部',
      orderStartTime: '',
      orderEndTime: '',
    });
    setCurrentPage(1);
  };

  // 过滤后的数据
  const filteredRecords = useMemo(() => {
    return ALL_SUPPLIER_SALES_ORDERS.filter((record) => {
      // 1. 订单业务类型
      const bizType = record.orderBusinessType || (record.serviceCategory.includes('智能体') ? '智能体' : record.serviceCategory.includes('模型') ? '模型' : '算力');
      if (
        appliedFilters.businessType !== '全部' &&
        bizType !== appliedFilters.businessType
      ) {
        return false;
      }
      // 2. 订单编号
      if (
        appliedFilters.orderId &&
        !record.orderId.toLowerCase().includes(appliedFilters.orderId.toLowerCase())
      ) {
        return false;
      }
      // 3. 供应商名称
      if (
        appliedFilters.supplierName &&
        record.supplierName !== '—' &&
        !record.supplierName.includes(appliedFilters.supplierName)
      ) {
        return false;
      }
      // 4. 供应商编号
      if (
        appliedFilters.supplierCode &&
        record.supplierCode !== '—' &&
        !record.supplierCode.toLowerCase().includes(appliedFilters.supplierCode.toLowerCase())
      ) {
        return false;
      }
      // 5. 需求方名称 (智能体订单为“—”)
      if (
        appliedFilters.customerName &&
        record.customerName !== '—' &&
        !record.customerName.includes(appliedFilters.customerName)
      ) {
        return false;
      }
      // 6. 需求方编号
      if (
        appliedFilters.customerCode &&
        !record.customerCode.toLowerCase().includes(appliedFilters.customerCode.toLowerCase())
      ) {
        return false;
      }
      // 7. 产品类别
      if (
        appliedFilters.productCategory !== '全部' &&
        record.serviceCategory !== appliedFilters.productCategory
      ) {
        return false;
      }
      // 8. 产品名称
      if (
        appliedFilters.productName &&
        !record.productName.toLowerCase().includes(appliedFilters.productName.toLowerCase())
      ) {
        return false;
      }
      // 9. 订单状态
      if (
        appliedFilters.status !== '全部' &&
        record.status !== appliedFilters.status
      ) {
        return false;
      }
      // 10. 下单时间
      if (appliedFilters.orderStartTime && record.orderTime.slice(0, 10) < appliedFilters.orderStartTime) {
        return false;
      }
      if (appliedFilters.orderEndTime && record.orderTime.slice(0, 10) > appliedFilters.orderEndTime) {
        return false;
      }

      return true;
    });
  }, [appliedFilters]);

  // 分页计算
  const totalItems = filteredRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pagedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // 页码跳转
  const handleJumpPage = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(jumpPageInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setJumpPageInput('');
    }
  };

  // 业务类型 Badge 样式
  const getBusinessTypeBadgeClass = (type: string) => {
    switch (type) {
      case '智能体':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
      case '算力':
        return 'bg-blue-50 text-blue-700 border-blue-200/80';
      case '模型':
        return 'bg-purple-50 text-purple-700 border-purple-200/80';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200/80';
    }
  };

  return (
    <div className="space-y-4">
      {/* ========================================================================= */}
      {/* 1. 顶部查询区域 */}
      {/* 调整字段：订单业务类型、订单编号、供应商名称、供应商编号、需求方名称、需求方编号、产品类别、产品名称、订单状态、下单时间 */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
          <span className="w-1.5 h-3.5 bg-blue-600 rounded-xs" />
          <h3 className="text-xs font-semibold text-slate-800 tracking-wide">
            查询条件
          </h3>
        </div>

        {/* 筛选表单区域 */}
        <div className="space-y-3.5 text-xs">
          {/* 第一行：订单业务类型、订单编号、供应商名称、供应商编号 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
            {/* 订单业务类型 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-600 font-medium">订单业务类型</label>
              <select
                value={selectedBusinessType}
                onChange={(e) => setSelectedBusinessType(e.target.value)}
                className="h-8.5 px-2 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-colors cursor-pointer"
              >
                {ORDER_BUSINESS_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* 订单编号 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-600 font-medium">订单编号</label>
              <input
                type="text"
                placeholder="请输入订单编号"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                className="h-8.5 px-2.5 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            {/* 供应商名称 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-600 font-medium">供应商名称</label>
              <input
                type="text"
                placeholder="请输入供应商名称"
                value={supplierNameInput}
                onChange={(e) => setSupplierNameInput(e.target.value)}
                className="h-8.5 px-2.5 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            {/* 供应商编号 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-600 font-medium">供应商编号</label>
              <input
                type="text"
                placeholder="请输入供应商编号"
                value={supplierCodeInput}
                onChange={(e) => setSupplierCodeInput(e.target.value)}
                className="h-8.5 px-2.5 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* 第二行：需求方名称、需求方编号、产品类别、产品名称 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
            {/* 需求方名称 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-600 font-medium">需求方名称</label>
              <input
                type="text"
                placeholder="请输入需求方名称"
                value={customerNameInput}
                onChange={(e) => setCustomerNameInput(e.target.value)}
                className="h-8.5 px-2.5 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            {/* 需求方编号 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-600 font-medium">需求方编号</label>
              <input
                type="text"
                placeholder="请输入需求方编号"
                value={customerCodeInput}
                onChange={(e) => setCustomerCodeInput(e.target.value)}
                className="h-8.5 px-2.5 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            {/* 产品类别 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-600 font-medium">产品类别</label>
              <select
                value={selectedProductCategory}
                onChange={(e) => setSelectedProductCategory(e.target.value)}
                className="h-8.5 px-2 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-colors cursor-pointer"
              >
                {ORDER_PRODUCT_CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* 产品名称 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-600 font-medium">产品名称</label>
              <input
                type="text"
                placeholder="请输入产品名称"
                value={productNameInput}
                onChange={(e) => setProductNameInput(e.target.value)}
                className="h-8.5 px-2.5 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* 第三行：订单状态 与 下单时间 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-slate-100">
            {/* 订单状态 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-600 font-medium">订单状态</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-8.5 px-2 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-colors cursor-pointer"
              >
                {SALES_ORDER_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* 下单时间 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-600 font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>下单时间</span>
                </label>
                {(orderStartTime || orderEndTime) && (
                  <button
                    type="button"
                    onClick={() => {
                      setOrderStartTime('');
                      setOrderEndTime('');
                    }}
                    className="text-[11px] text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    清空时间
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="date"
                    value={orderStartTime}
                    onChange={(e) => setOrderStartTime(e.target.value)}
                    className="w-full h-8.5 px-3 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                <span className="text-slate-400 text-xs font-medium px-1 shrink-0">至</span>
                <div className="relative flex-1">
                  <input
                    type="date"
                    value={orderEndTime}
                    onChange={(e) => setOrderEndTime(e.target.value)}
                    className="w-full h-8.5 px-3 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 查询与重置按钮栏 */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              className="h-8 px-3.5 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              重置
            </button>
            <button
              type="button"
              onClick={handleSearch}
              className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer text-xs"
            >
              <Search className="w-3.5 h-3.5" />
              查询
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 销售订单列表表格 */}
      {/* 调整字段：订单编号、订单业务类型、供应商名称、供应商编号、需求方名称、需求方编号、产品类别、产品名称、订单总金额、订单状态、下单时间、操作 */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-md border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-blue-600 rounded-xs" />
            <h3 className="text-xs font-semibold text-slate-800 tracking-wide">
              销售订单列表
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-medium">
                <th className="py-2.5 px-3 whitespace-nowrap">订单编号</th>
                <th className="py-2.5 px-3 whitespace-nowrap">订单业务类型</th>
                <th className="py-2.5 px-3 min-w-[170px]">供应商名称</th>
                <th className="py-2.5 px-3 whitespace-nowrap">供应商编号</th>
                <th className="py-2.5 px-3 min-w-[170px]">需求方名称</th>
                <th className="py-2.5 px-3 whitespace-nowrap">需求方编号</th>
                <th className="py-2.5 px-3 whitespace-nowrap">产品类别</th>
                <th className="py-2.5 px-3 min-w-[180px]">产品名称</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">订单总金额</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">订单状态</th>
                <th className="py-2.5 px-3 whitespace-nowrap">下单时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {pagedRecords.length > 0 ? (
                pagedRecords.map((record) => {
                  const bizType = record.orderBusinessType || (record.serviceCategory.includes('智能体') ? '智能体' : record.serviceCategory.includes('模型') ? '模型' : '算力');
                  // 模型订单没有明确的供应商编号和供应商名称，显示“—”
                  const displaySupplierName = bizType === '模型' ? '—' : record.supplierName;
                  const displaySupplierCode = bizType === '模型' ? '—' : record.supplierCode;
                  // 智能体订单没有完整的需求方名称来源，显示“—”
                  const displayCustomerName = bizType === '智能体' ? '—' : (record.customerName === '—' ? '—' : record.customerName);

                  return (
                    <tr key={record.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-blue-600 font-medium whitespace-nowrap">
                        {record.orderId}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium border ${getBusinessTypeBadgeClass(
                            bizType
                          )}`}
                        >
                          {bizType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">
                        {displaySupplierName}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                        {displaySupplierCode}
                      </td>
                      <td className="py-2.5 px-3 text-slate-800 font-medium">
                        {displayCustomerName}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                        {record.customerCode}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-50 text-slate-700 border border-slate-200">
                          {record.serviceCategory}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {record.productName}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                        <span className="font-semibold text-slate-900">
                          ¥{record.orderAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium ${
                            record.status === '履约中'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : record.status === '已完成'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : record.status === '已支付'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : record.status === '待支付'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {record.orderTime}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400 text-xs">
                    暂无匹配的销售订单数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 分页控制栏 */}
        {totalItems > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <span>第</span>
              <span className="font-semibold text-slate-800 font-mono">
                {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalItems)}
              </span>
              <span>条，共</span>
              <span className="font-semibold text-slate-800 font-mono">{totalItems}</span>
              <span>条记录</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                title="上一页"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>

              <span className="px-2 font-mono text-slate-700">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                title="下一页"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>

              <form onSubmit={handleJumpPage} className="flex items-center gap-1 ml-2">
                <span>跳至</span>
                <input
                  type="text"
                  value={jumpPageInput}
                  onChange={(e) => setJumpPageInput(e.target.value)}
                  className="w-10 h-7 text-center rounded border border-slate-200 text-xs font-mono focus:border-blue-500 focus:outline-none"
                />
                <span>页</span>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
