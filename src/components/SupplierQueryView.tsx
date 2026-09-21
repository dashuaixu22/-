import React, { useState, useMemo } from 'react';
import {
  Search,
  RotateCcw,
  Eye,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { SupplierRecord } from '../types';
import {
  ALL_SUPPLIER_RECORDS,
  SUPPLIER_TYPES_OPTIONS,
  SUPPLIER_STATUS_OPTIONS,
  getConvertedSupplierStatus,
} from '../data/supplierQueryMockData';

interface SupplierQueryViewProps {
  onViewDetail?: (supplier: SupplierRecord) => void;
  onViewProducts?: (supplier: SupplierRecord) => void;
}

export const SupplierQueryView: React.FC<SupplierQueryViewProps> = ({
  onViewDetail,
  onViewProducts,
}) => {
  // 查询表单输入状态（严格按照规范）
  const [selectedSupplierType, setSelectedSupplierType] = useState('全部');
  const [supplierCodeInput, setSupplierCodeInput] = useState('');
  const [supplierNameInput, setSupplierNameInput] = useState('');
  const [selectedSupplierStatus, setSelectedSupplierStatus] = useState('全部');
  const [createStartDate, setCreateStartDate] = useState('');
  const [createEndDate, setCreateEndDate] = useState('');
  const [txStartDate, setTxStartDate] = useState('');
  const [txEndDate, setTxEndDate] = useState('');

  // 实际生效的筛选条件
  const [appliedFilters, setAppliedFilters] = useState({
    supplierType: '全部',
    supplierCode: '',
    supplierName: '',
    supplierStatus: '全部',
    createStartDate: '',
    createEndDate: '',
    txStartDate: '',
    txEndDate: '',
  });

  // 分页状态 (每页 10 条)
  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpPageInput, setJumpPageInput] = useState('');

  // 执行查询
  const handleSearch = () => {
    setAppliedFilters({
      supplierType: selectedSupplierType,
      supplierCode: supplierCodeInput.trim(),
      supplierName: supplierNameInput.trim(),
      supplierStatus: selectedSupplierStatus,
      createStartDate: createStartDate.trim(),
      createEndDate: createEndDate.trim(),
      txStartDate: txStartDate.trim(),
      txEndDate: txEndDate.trim(),
    });
    setCurrentPage(1);
  };

  // 重置筛选
  const handleReset = () => {
    setSelectedSupplierType('全部');
    setSupplierCodeInput('');
    setSupplierNameInput('');
    setSelectedSupplierStatus('全部');
    setCreateStartDate('');
    setCreateEndDate('');
    setTxStartDate('');
    setTxEndDate('');
    setAppliedFilters({
      supplierType: '全部',
      supplierCode: '',
      supplierName: '',
      supplierStatus: '全部',
      createStartDate: '',
      createEndDate: '',
      txStartDate: '',
      txEndDate: '',
    });
    setCurrentPage(1);
  };

  // 过滤后的数据
  const filteredRecords = useMemo(() => {
    return ALL_SUPPLIER_RECORDS.filter((record) => {
      // 1. 供应商类型 (智能体供应商 / 算力供应商)
      if (
        appliedFilters.supplierType !== '全部' &&
        record.supplierType !== appliedFilters.supplierType
      ) {
        return false;
      }
      // 2. 供应商编号
      if (
        appliedFilters.supplierCode &&
        !record.supplierCode.toLowerCase().includes(appliedFilters.supplierCode.toLowerCase())
      ) {
        return false;
      }
      // 3. 供应商名称
      if (
        appliedFilters.supplierName &&
        !record.supplierName.includes(appliedFilters.supplierName)
      ) {
        return false;
      }
      // 4. 供应商状态（根据转换后的状态名称筛选）
      if (appliedFilters.supplierStatus !== '全部') {
        const converted = getConvertedSupplierStatus(record);
        if (converted !== appliedFilters.supplierStatus) {
          return false;
        }
      }
      // 5. 创建时间 (采用 createTime 或 contractDate)
      const recordCreateTime = record.createTime || record.contractDate || '';
      if (appliedFilters.createStartDate && recordCreateTime < appliedFilters.createStartDate) {
        return false;
      }
      if (appliedFilters.createEndDate && recordCreateTime > appliedFilters.createEndDate) {
        return false;
      }
      // 6. 最近交易时间
      if (appliedFilters.txStartDate && record.lastTxDate.slice(0, 10) < appliedFilters.txStartDate) {
        return false;
      }
      if (appliedFilters.txEndDate && record.lastTxDate.slice(0, 10) > appliedFilters.txEndDate) {
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

  // 状态名称徽章样式
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case '正常接入':
      case '已上架':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case '接入联调':
      case '审核中':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case '已暂停':
      case '已下架':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* ========================================================================= */}
      {/* 1. 顶部查询区域 */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
          <span className="w-1.5 h-3.5 bg-blue-600 rounded-xs" />
          <h3 className="text-xs font-semibold text-slate-800 tracking-wide">
            查询条件
          </h3>
        </div>

        {/* 筛选表单区域 */}
        <div className="space-y-3.5">
          {/* 第一行：供应商类型、供应商编号、供应商名称、供应商状态 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 text-xs">
            {/* 供应商类型 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-600 font-medium">供应商类型</label>
              <select
                value={selectedSupplierType}
                onChange={(e) => setSelectedSupplierType(e.target.value)}
                className="h-8.5 px-2 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-colors cursor-pointer"
              >
                {SUPPLIER_TYPES_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
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

            {/* 供应商状态 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-600 font-medium">供应商状态</label>
              <select
                value={selectedSupplierStatus}
                onChange={(e) => setSelectedSupplierStatus(e.target.value)}
                className="h-8.5 px-2 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-colors cursor-pointer"
              >
                {SUPPLIER_STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 第二行：创建时间 与 最近交易时间 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs pt-3 border-t border-slate-100">
            {/* 创建时间 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-600 font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>创建时间</span>
                </label>
                {(createStartDate || createEndDate) && (
                  <button
                    type="button"
                    onClick={() => {
                      setCreateStartDate('');
                      setCreateEndDate('');
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
                    value={createStartDate}
                    onChange={(e) => setCreateStartDate(e.target.value)}
                    className="w-full h-8.5 px-3 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                <span className="text-slate-400 text-xs font-medium px-1 shrink-0">至</span>
                <div className="relative flex-1">
                  <input
                    type="date"
                    value={createEndDate}
                    onChange={(e) => setCreateEndDate(e.target.value)}
                    className="w-full h-8.5 px-3 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 最近交易时间 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-600 font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>最近交易时间</span>
                </label>
                {(txStartDate || txEndDate) && (
                  <button
                    type="button"
                    onClick={() => {
                      setTxStartDate('');
                      setTxEndDate('');
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
                    value={txStartDate}
                    onChange={(e) => setTxStartDate(e.target.value)}
                    className="w-full h-8.5 px-3 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                <span className="text-slate-400 text-xs font-medium px-1 shrink-0">至</span>
                <div className="relative flex-1">
                  <input
                    type="date"
                    value={txEndDate}
                    onChange={(e) => setTxEndDate(e.target.value)}
                    className="w-full h-8.5 px-3 rounded border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 第三行：操作按钮，靠右对齐 */}
          <div className="flex items-center justify-end gap-2.5 pt-2.5 border-t border-slate-100">
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
      {/* 2. 供应商列表表格 */}
      {/* 调整字段：供应商编号、供应商名称、供应商类型、供应商状态、创建时间、供需交易订单数、供需交易总金额、最近交易时间、操作 */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-md border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-blue-600 rounded-xs" />
            <h3 className="text-xs font-semibold text-slate-800 tracking-wide">
              供应商列表
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-medium">
                <th className="py-2.5 px-3 whitespace-nowrap">供应商编号</th>
                <th className="py-2.5 px-3 min-w-[200px]">供应商名称</th>
                <th className="py-2.5 px-3 whitespace-nowrap">供应商类型</th>
                <th className="py-2.5 px-3 whitespace-nowrap">供应商状态</th>
                <th className="py-2.5 px-3 whitespace-nowrap">创建时间</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">供需交易订单数</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">供需交易总金额</th>
                <th className="py-2.5 px-3 whitespace-nowrap">最近交易时间</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {pagedRecords.length > 0 ? (
                pagedRecords.map((record) => {
                  const statusName = getConvertedSupplierStatus(record);
                  return (
                    <tr key={record.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                        {record.supplierCode}
                      </td>
                      <td className="py-2.5 px-3 min-w-[200px]">
                        <button
                          type="button"
                          onClick={() => onViewDetail && onViewDetail(record)}
                          className="font-medium text-slate-900 hover:text-blue-600 text-left transition-colors cursor-pointer block"
                          title="点击查看该供应商详情"
                        >
                          {record.supplierName}
                        </button>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                            record.supplierType === '智能体供应商'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
                              : 'bg-blue-50 text-blue-700 border-blue-200/80'
                          }`}
                        >
                          {record.supplierType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${getStatusBadgeClass(
                            statusName
                          )}`}
                        >
                          {statusName}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {record.createTime || record.contractDate}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                        {record.basicOrderCount > 0 ? (
                          <span className="font-semibold text-slate-800">{record.basicOrderCount} 笔</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                        {record.basicOrderAmount > 0 ? (
                          <span className="font-semibold text-blue-600">
                            {record.basicOrderAmount.toFixed(1)} 万元
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {record.lastTxDate}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => onViewDetail && onViewDetail(record)}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors cursor-pointer px-2 py-0.5 rounded hover:bg-blue-50"
                            title="查看详情"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            查看详情
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                    暂无匹配的供应商数据
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
