import React, { useState, useMemo } from 'react';
import {
  Search,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { ALL_VAS_ORDER_RECORDS } from '../data/vasMockData';
import { VasOrderRecord } from '../types';

const SUPPLIER_TYPES = [
  '全部',
  '算力',
  '模型',
  '智能体',
  '终端',
  '开发工具',
  '运行服务',
  '运营服务',
];

const VAS_CATEGORIES = [
  '全部',
  '客户分析服务',
  '营销服务',
  '销售服务',
  '售后服务',
  '维系服务',
  '广告服务',
  '发票代理',
  '产品推荐',
  '会员服务（商户）',
  '产品分析',
];

const STATUS_LIST = ['全部', '履约中', '已完成', '待生效', '已退订', '已取消'];

const AMOUNT_RANGES = [
  { label: '全部', value: 'all' },
  { label: '3万元以下', value: 'under30k' },
  { label: '3万 - 6万元', value: '30k-60k' },
  { label: '6万 - 10万元', value: '60k-100k' },
  { label: '10万元以上', value: 'above100k' },
];

export const VasOrderQueryView: React.FC = () => {
  // 是否展开更多查询条件 (默认展示常用查询项)
  const [isExpanded, setIsExpanded] = useState(false);

  // 查询表单输入状态
  const [orderIdInput, setOrderIdInput] = useState('');
  const [supplierNameInput, setSupplierNameInput] = useState('');
  const [supplierCodeInput, setSupplierCodeInput] = useState('');
  const [selectedSupplierType, setSelectedSupplierType] = useState('全部');
  const [selectedVasCategory, setSelectedVasCategory] = useState('全部');
  const [createStartTime, setCreateStartTime] = useState('');
  const [createEndTime, setCreateEndTime] = useState('');
  const [endStartTime, setEndStartTime] = useState('');
  const [endEndTime, setEndEndTime] = useState('');
  const [selectedAmountRange, setSelectedAmountRange] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('全部');

  // 实际生效的筛选条件
  const [appliedFilters, setAppliedFilters] = useState({
    orderId: '',
    supplierName: '',
    supplierCode: '',
    supplierType: '全部',
    vasCategory: '全部',
    createStartTime: '',
    createEndTime: '',
    endStartTime: '',
    endEndTime: '',
    amountRange: 'all',
    status: '全部',
  });

  // 分页状态 (每页 10 条，与供应商查询、销售订单查询保持一致)
  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpPageInput, setJumpPageInput] = useState('');

  // 执行查询
  const handleSearch = () => {
    setAppliedFilters({
      orderId: orderIdInput.trim(),
      supplierName: supplierNameInput.trim(),
      supplierCode: supplierCodeInput.trim(),
      supplierType: selectedSupplierType,
      vasCategory: selectedVasCategory,
      createStartTime: createStartTime.trim(),
      createEndTime: createEndTime.trim(),
      endStartTime: endStartTime.trim(),
      endEndTime: endEndTime.trim(),
      amountRange: selectedAmountRange,
      status: selectedStatus,
    });
    setCurrentPage(1);
  };

  // 重置筛选
  const handleReset = () => {
    setOrderIdInput('');
    setSupplierNameInput('');
    setSupplierCodeInput('');
    setSelectedSupplierType('全部');
    setSelectedVasCategory('全部');
    setCreateStartTime('');
    setCreateEndTime('');
    setEndStartTime('');
    setEndEndTime('');
    setSelectedAmountRange('all');
    setSelectedStatus('全部');
    setAppliedFilters({
      orderId: '',
      supplierName: '',
      supplierCode: '',
      supplierType: '全部',
      vasCategory: '全部',
      createStartTime: '',
      createEndTime: '',
      endStartTime: '',
      endEndTime: '',
      amountRange: 'all',
      status: '全部',
    });
    setCurrentPage(1);
  };

  // 过滤后的数据
  const filteredRecords = useMemo(() => {
    return ALL_VAS_ORDER_RECORDS.filter((record) => {
      // 1. 订单编号
      if (
        appliedFilters.orderId &&
        !record.id.toLowerCase().includes(appliedFilters.orderId.toLowerCase())
      ) {
        return false;
      }
      // 2. 供应商名称
      if (
        appliedFilters.supplierName &&
        !record.supplierName.includes(appliedFilters.supplierName)
      ) {
        return false;
      }
      // 3. 供应商编号或统一社会信用代码
      if (
        appliedFilters.supplierCode &&
        !record.supplierCode.toLowerCase().includes(appliedFilters.supplierCode.toLowerCase())
      ) {
        return false;
      }
      // 4. 供应商类别
      if (
        appliedFilters.supplierType !== '全部' &&
        record.supplierType !== appliedFilters.supplierType
      ) {
        return false;
      }
      // 5. 增值服务类别
      if (
        appliedFilters.vasCategory !== '全部' &&
        record.vasCategory !== appliedFilters.vasCategory
      ) {
        return false;
      }
      // 6. 订单创建时间
      if (appliedFilters.createStartTime && record.startTime.slice(0, 10) < appliedFilters.createStartTime) {
        return false;
      }
      if (appliedFilters.createEndTime && record.startTime.slice(0, 10) > appliedFilters.createEndTime) {
        return false;
      }
      // 7. 订单结束时间
      if (appliedFilters.endStartTime && record.endTime.slice(0, 10) < appliedFilters.endStartTime) {
        return false;
      }
      if (appliedFilters.endEndTime && record.endTime.slice(0, 10) > appliedFilters.endEndTime) {
        return false;
      }
      // 8. 订单金额
      if (appliedFilters.amountRange === 'under30k' && record.amount >= 30000) return false;
      if (
        appliedFilters.amountRange === '30k-60k' &&
        (record.amount < 30000 || record.amount > 60000)
      )
        return false;
      if (
        appliedFilters.amountRange === '60k-100k' &&
        (record.amount < 60000 || record.amount > 100000)
      )
        return false;
      if (appliedFilters.amountRange === 'above100k' && record.amount <= 100000) return false;

      // 9. 订单状态
      if (appliedFilters.status !== '全部' && record.status !== appliedFilters.status) {
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

  // 状态颜色徽章渲染
  const renderStatusBadge = (status: VasOrderRecord['status']) => {
    switch (status) {
      case '履约中':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
            履约中
          </span>
        );
      case '已完成':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            已完成
          </span>
        );
      case '待生效':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            待生效
          </span>
        );
      case '已退订':
      case '已取消':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            {status}
          </span>
        );
      default:
        return <span className="text-xs text-slate-600">{status}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* ========================================================================= */}
      {/* 1. 顶部查询区域 */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-blue-600 rounded-xs" />
            <h3 className="text-xs font-semibold text-slate-800 tracking-wide">
              查询条件
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium cursor-pointer"
          >
            {isExpanded ? (
              <>
                <span>收起更多</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>展开更多</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {/* 筛选表单栅格 */}
        <div className="space-y-3.5 text-xs">
          {/* 第一排：常用查询项 (默认展示) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* 1. 订单编号 */}
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

            {/* 2. 供应商名称 */}
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

            {/* 3. 供应商编号或统一社会信用代码 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-600 font-medium">供应商编号或统一社会信用代码</label>
              <input
                type="text"
                placeholder="请输入编号或信用代码"
                value={supplierCodeInput}
                onChange={(e) => setSupplierCodeInput(e.target.value)}
                className="h-8.5 px-2.5 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            {/* 4. 供应商类别 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-600 font-medium">供应商类别</label>
              <select
                value={selectedSupplierType}
                onChange={(e) => setSelectedSupplierType(e.target.value)}
                className="h-8.5 px-2 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-colors cursor-pointer"
              >
                {SUPPLIER_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. 增值服务类别 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-600 font-medium">增值服务类别</label>
              <select
                value={selectedVasCategory}
                onChange={(e) => setSelectedVasCategory(e.target.value)}
                className="h-8.5 px-2 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-colors cursor-pointer"
              >
                {VAS_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 第二排：更多查询条件 (展开时展示) */}
          {isExpanded && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 pt-2 border-t border-dashed border-slate-200/80 animate-in fade-in duration-150">
              {/* 6. 订单创建时间 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-600 font-medium">订单创建时间</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    value={createStartTime}
                    onChange={(e) => setCreateStartTime(e.target.value)}
                    className="w-full h-8.5 px-2 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-[11px] focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  <span className="text-slate-400 text-xs">-</span>
                  <input
                    type="date"
                    value={createEndTime}
                    onChange={(e) => setCreateEndTime(e.target.value)}
                    className="w-full h-8.5 px-2 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-[11px] focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* 7. 订单结束时间 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-600 font-medium">订单结束时间</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    value={endStartTime}
                    onChange={(e) => setEndStartTime(e.target.value)}
                    className="w-full h-8.5 px-2 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-[11px] focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  <span className="text-slate-400 text-xs">-</span>
                  <input
                    type="date"
                    value={endEndTime}
                    onChange={(e) => setEndEndTime(e.target.value)}
                    className="w-full h-8.5 px-2 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-[11px] focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* 8. 订单金额 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-600 font-medium">订单金额</label>
                <select
                  value={selectedAmountRange}
                  onChange={(e) => setSelectedAmountRange(e.target.value)}
                  className="h-8.5 px-2 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-colors cursor-pointer"
                >
                  {AMOUNT_RANGES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 9. 订单状态 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-600 font-medium">订单状态</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="h-8.5 px-2 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-colors cursor-pointer"
                >
                  {STATUS_LIST.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* 查询与重置按钮栏 */}
          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleSearch}
              className="h-8.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              查询
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="h-8.5 px-3.5 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              重置
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 增值订单列表表格 */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-md border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-blue-600 rounded-xs" />
            <h3 className="text-xs font-semibold text-slate-800 tracking-wide">
              增值订单列表
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            共 <strong className="text-slate-800 font-mono">{totalItems}</strong> 笔符合条件的增值订单
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-medium">
                <th className="py-2.5 px-3 whitespace-nowrap">订单编号</th>
                <th className="py-2.5 px-3 min-w-[180px]">供应商名称</th>
                <th className="py-2.5 px-3 whitespace-nowrap">供应商编号或统一社会信用代码</th>
                <th className="py-2.5 px-3 whitespace-nowrap">供应商类别</th>
                <th className="py-2.5 px-3 whitespace-nowrap">增值服务类别</th>
                <th className="py-2.5 px-3 whitespace-nowrap">订单创建时间</th>
                <th className="py-2.5 px-3 whitespace-nowrap">订单结束时间</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">订单金额</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">订单状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {pagedRecords.length > 0 ? (
                pagedRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-blue-600 font-medium whitespace-nowrap">
                      {record.id}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {record.supplierName}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                      {record.supplierCode}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {record.supplierType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200/80">
                        {record.vasCategory}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-slate-500">
                      {record.startTime}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-slate-500">
                      {record.endTime}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                      <span className="font-semibold text-slate-900">
                        ¥{record.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      {renderStatusBadge(record.status)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                    暂无匹配的增值订单数据
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

