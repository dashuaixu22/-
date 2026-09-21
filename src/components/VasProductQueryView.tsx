import React, { useState, useMemo } from 'react';
import {
  Search,
  RotateCcw,
  Eye,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Layers,
  ShoppingBag,
  PackageCheck,
  Star,
} from 'lucide-react';
import {
  ALL_VAS_PRODUCTS,
  VAS_CATEGORIES,
  VAS_PRODUCT_OVERVIEW_DATA,
  VasProductItem,
} from '../data/vasProductMockData';

interface VasProductQueryViewProps {
  onViewDetail?: (product: VasProductItem) => void;
}

export const VasProductQueryView: React.FC<VasProductQueryViewProps> = ({ onViewDetail }) => {
  // 1. 查询表单输入状态
  const [nameInput, setNameInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');

  // 已生效的过滤条件
  const [appliedFilters, setAppliedFilters] = useState<{
    name: string;
    category: string;
  }>({
    name: '',
    category: '',
  });

  // 2. 产品概览 - 新增订单数卡片内部的时间 Tab (当日 / 近一周 / 近一月 / 近一年)
  const [overviewTimeTab, setOverviewTimeTab] = useState<'today' | 'week' | 'month' | 'year'>('year');

  // 3. 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpPageInput, setJumpPageInput] = useState('');
  const pageSize = 10;

  // 执行查询
  const handleSearch = () => {
    setAppliedFilters({
      name: nameInput.trim(),
      category: categoryInput,
    });
    setCurrentPage(1);
  };

  // 重置查询
  const handleReset = () => {
    setNameInput('');
    setCategoryInput('');
    setAppliedFilters({
      name: '',
      category: '',
    });
    setCurrentPage(1);
  };

  // 根据已应用的筛选条件过滤产品列表
  const filteredProducts = useMemo(() => {
    return ALL_VAS_PRODUCTS.filter((item) => {
      // 增值产品名称过滤 (模糊匹配)
      if (
        appliedFilters.name &&
        !item.productName.toLowerCase().includes(appliedFilters.name.toLowerCase())
      ) {
        return false;
      }
      // 增值服务类别过滤
      if (appliedFilters.category && item.categoryName !== appliedFilters.category) {
        return false;
      }
      return true;
    });
  }, [appliedFilters]);

  // 分页计算
  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // 当前页数据
  const currentTableData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredProducts.slice(startIndex, startIndex + pageSize);
  }, [filteredProducts, currentPage]);

  // 处理页码跳转
  const handleJumpPage = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(jumpPageInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setJumpPageInput('');
    }
  };

  // 概览卡片 - 当前选定周期的新增订单数据
  const currentOverviewNewOrders = VAS_PRODUCT_OVERVIEW_DATA.newOrdersByRange[overviewTimeTab];

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

  return (
    <div className="space-y-4">
      {/* ========================================================================= */}
      {/* 1. 产品概览指标卡 (增值产品类别数、新增订单数、订单总数放在最上面) */}
      {/* 严格顺序：订单总数（最左边） -> 增值产品类别数（第二个） -> 新增订单数（第三个） */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 卡片 1 (最左边): 订单总数（增值服务） (展示当前累计值，不设置时间Tab) */}
        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <div className="flex items-center gap-1.5">
              <PackageCheck className="w-4 h-4 text-indigo-600" />
              <span>订单总数（增值服务）</span>
            </div>
            <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              当前累计
            </span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono text-slate-800 tracking-tight">
              {VAS_PRODUCT_OVERVIEW_DATA.totalOrders.toLocaleString()}
              <span className="text-xs font-normal text-slate-500 ml-1 font-sans">笔</span>
            </div>
            <div className="text-xs text-slate-500">累计有效订单</div>
          </div>
        </div>

        {/* 卡片 2 (第二个): 增值产品类别数 (展示当前累计值，不设置时间Tab) */}
        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>增值产品类别数</span>
            </div>
            <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              当前累计
            </span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono text-slate-800 tracking-tight">
              {VAS_PRODUCT_OVERVIEW_DATA.categoryCount}
              <span className="text-xs font-normal text-slate-500 ml-1 font-sans">个类别</span>
            </div>
            <div className="text-xs text-slate-500">覆盖系统全部增值体系</div>
          </div>
        </div>

        {/* 卡片 3 (第三个): 新增订单数（增值服务） (内部设置当日、近一周、近一月、近一年Tab) */}
        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <div className="flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span>新增订单数（增值服务）</span>
            </div>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200/80">
              {(['today', 'week', 'month', 'year'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setOverviewTimeTab(tab)}
                  className={`px-2 py-0.5 text-[11px] rounded transition-all cursor-pointer font-medium ${
                    overviewTimeTab === tab
                      ? 'bg-white text-blue-600 font-semibold shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab === 'today' ? '当日' : tab === 'week' ? '近一周' : tab === 'month' ? '近一月' : '近一年'}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono text-slate-800 tracking-tight">
              {currentOverviewNewOrders.count.toLocaleString()}
              <span className="text-xs font-normal text-slate-500 ml-1 font-sans">笔</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{currentOverviewNewOrders.momText}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 查询功能和增值服务列表放在一起 (纯净查询列表，无统计周期Tab，无综合评分) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        {/* 顶部查询区域 */}
        <div className="p-4 border-b border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex flex-wrap items-center gap-4 text-xs"
          >
            {/* 增值产品名称 */}
            <div className="flex items-center gap-2">
              <label className="text-slate-600 font-medium whitespace-nowrap">
                增值产品名称:
              </label>
              <input
                type="text"
                placeholder="请输入产品名称关键字"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-56 px-3 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-800 placeholder:text-slate-400"
              />
            </div>

            {/* 增值服务类别 */}
            <div className="flex items-center gap-2">
              <label className="text-slate-600 font-medium whitespace-nowrap">
                增值服务类别:
              </label>
              <select
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                className="w-48 px-3 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-800 bg-white"
              >
                <option value="">全部类别</option>
                {VAS_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#1677FF] hover:bg-blue-600 text-white rounded-md font-medium shadow-xs transition-colors cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                查询
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-md font-medium transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                重置
              </button>
            </div>
          </form>
        </div>

        {/* 列表标题栏 (不做统计周期，做成标准查询列表) */}
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-800">增值产品列表</h3>
            <span className="text-xs text-slate-400 font-normal">
              （共 <strong className="font-mono text-blue-600">{totalItems}</strong> 项产品）
            </span>
          </div>
        </div>

        {/* 表格内容 (无统计周期，无综合评分) */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 select-none">
                <th className="py-2.5 px-3 text-center w-12">序号</th>
                <th className="py-2.5 px-3 min-w-[180px]">增值产品名称</th>
                <th className="py-2.5 px-3 whitespace-nowrap">增值服务类别</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">订单总数</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">增值服务总收入</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">增值服务客单价</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">购买供应商数</th>
                <th className="py-2.5 px-3 text-center w-24 whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {currentTableData.length > 0 ? (
                currentTableData.map((item, index) => {
                  const seq = (currentPage - 1) * pageSize + index + 1;
                  // 增值服务客单价 = 累计总收入 / 订单总数
                  const arpu = item.totalOrders > 0 ? Math.round(item.totalRevenue / item.totalOrders) : 0;
                  const supplierCount = new Set(item.orders.map((o) => o.supplierName)).size;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      {/* 序号 */}
                      <td className="py-2.5 px-3 text-center font-mono text-slate-400">
                        {seq}
                      </td>

                      {/* 增值产品名称 */}
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        <button
                          type="button"
                          onClick={() => onViewDetail && onViewDetail(item)}
                          className="text-left font-medium text-slate-800 hover:text-blue-600 transition-colors cursor-pointer hover:underline"
                        >
                          {item.productName}
                        </button>
                      </td>

                      {/* 增值服务类别 */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${getCategoryBadgeClass(
                            item.categoryName
                          )}`}
                        >
                          {item.categoryName}
                        </span>
                      </td>

                      {/* 订单总数 */}
                      <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-800 whitespace-nowrap">
                        {item.totalOrders.toLocaleString()} 笔
                      </td>

                      {/* 增值服务总收入 */}
                      <td className="py-2.5 px-3 text-right font-mono font-medium text-emerald-600 whitespace-nowrap">
                        ¥{item.totalRevenue.toLocaleString()}
                      </td>

                      {/* 增值服务客单价 */}
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-blue-600 whitespace-nowrap">
                        ¥{arpu.toLocaleString()}
                      </td>

                      {/* 购买供应商数 */}
                      <td className="py-2.5 px-3 text-center font-mono text-slate-600 whitespace-nowrap">
                        {supplierCount} 家
                      </td>

                      {/* 操作 (只保留“查看详情”) */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onViewDetail && onViewDetail(item)}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors cursor-pointer px-2 py-0.5 rounded hover:bg-blue-50"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>查看详情</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    未找到匹配的增值产品数据，请调整筛选条件后重试
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 分页控制栏 */}
        {totalItems > 0 && (
          <div className="px-4 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span>
                显示第 {(currentPage - 1) * pageSize + 1} 至{' '}
                {Math.min(currentPage * pageSize, totalItems)} 条，共 {totalItems} 条
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* 上一页 / 下一页 */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 border border-slate-200 rounded hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="上一页"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-[26px] h-[26px] flex items-center justify-center rounded text-xs font-mono font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-[#1677FF] text-white'
                          : 'hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 border border-slate-200 rounded hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="下一页"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* 跳页 */}
              <form onSubmit={handleJumpPage} className="flex items-center gap-1.5">
                <span className="text-slate-500">前往</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={jumpPageInput}
                  onChange={(e) => setJumpPageInput(e.target.value)}
                  className="w-12 px-1.5 py-1 text-center font-mono border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                />
                <span className="text-slate-500">页</span>
                <button
                  type="submit"
                  className="px-2 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded text-slate-700 transition-colors cursor-pointer"
                >
                  确定
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
