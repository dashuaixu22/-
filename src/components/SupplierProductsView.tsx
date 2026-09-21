import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  FIXED_PRODUCT_CATEGORIES,
  FixedProductCategory,
  CATEGORY_COLORS,
  SUPPLIER_OPTIONS,
  ALL_SUPPLIER_PRODUCTS,
  SupplierProductRecord,
  PLATFORM_CATEGORY_BENCHMARKS,
} from '../data/supplierProductsMockData';
import {
  Package,
  ShoppingCart,
  Search,
  RotateCcw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Building2,
  Filter,
  X,
  Layers,
  Eye,
} from 'lucide-react';
import { SupplierProductDetailView } from './SupplierProductDetailView';

interface SupplierProductsViewProps {
  timeRange?: any;
  activeTab?: 'overview' | 'sales';
  onActiveTabChange?: (tab: 'overview' | 'sales') => void;
  initialSupplierId?: string;
  onSupplierChange?: (supplierId: string) => void;
  onViewProductDetail?: (product: SupplierProductRecord) => void;
}

export const SupplierProductsView: React.FC<SupplierProductsViewProps> = ({
  initialSupplierId,
  onSupplierChange,
  onViewProductDetail,
}) => {
  // 弹窗查看产商品详情（当无外层路由导航时的降级处理）
  const [selectedProductForModal, setSelectedProductForModal] = useState<SupplierProductRecord | null>(null);

  const handleViewDetail = (prod: SupplierProductRecord) => {
    if (onViewProductDetail) {
      onViewProductDetail(prod);
    } else {
      setSelectedProductForModal(prod);
    }
  };

  // =========================================================================
  // 1. 产商品概况数据 (固定展示全平台在架产商品概况，无供应商筛选入口)
  // =========================================================================
  const overviewStats = useMemo(() => {
    const categories = FIXED_PRODUCT_CATEGORIES.map((cat) => {
      const benchmark = PLATFORM_CATEGORY_BENCHMARKS[cat];
      return {
        name: cat,
        count: benchmark ? benchmark.productCount : 0,
        color: CATEGORY_COLORS[cat] || '#2563EB',
      };
    });
    const totalProducts = categories.reduce((acc, c) => acc + c.count, 0); // 1284
    return {
      totalProducts,
      coveredCategoryCount: FIXED_PRODUCT_CATEGORIES.length,
      categories,
    };
  }, []);

  // =========================================================================
  // 2. 产商品销售明细筛选条件：类型、供应商名称、产商品名称
  // =========================================================================
  // 选中的表单控件状态
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(initialSupplierId || 'all');
  const [productNameInput, setProductNameInput] = useState<string>('');

  // 实际已应用的生效筛选状态
  const [appliedCategory, setAppliedCategory] = useState<string>('all');
  const [appliedSupplierId, setAppliedSupplierId] = useState<string>(initialSupplierId || 'all');
  const [appliedProductName, setAppliedProductName] = useState<string>('');

  // 供应商名称下拉搜索弹层状态
  const [isSupplierDropdownOpen, setIsSupplierDropdownOpen] = useState(false);
  const [supplierSearchKeyword, setSupplierSearchKeyword] = useState('');
  const supplierDropdownRef = useRef<HTMLDivElement>(null);

  // 分页状态 (默认 20 条/页)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 20;
  const [jumpPageInput, setJumpPageInput] = useState<string>('');

  // 点击外部关闭供应商下拉框
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        supplierDropdownRef.current &&
        !supplierDropdownRef.current.contains(e.target as Node)
      ) {
        setIsSupplierDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 监听外部传入的 initialSupplierId
  useEffect(() => {
    if (initialSupplierId && initialSupplierId !== appliedSupplierId) {
      setSelectedSupplierId(initialSupplierId);
      setAppliedSupplierId(initialSupplierId);
      setCurrentPage(1);
    }
  }, [initialSupplierId]);

  // 当前选中的供应商对象展示文本
  const currentSupplierOption = useMemo(() => {
    if (selectedSupplierId === 'all') return null;
    return SUPPLIER_OPTIONS.find((s) => s.id === selectedSupplierId) || null;
  }, [selectedSupplierId]);

  // 按关键词模糊过滤供应商下拉列表
  const filteredSupplierOptions = useMemo(() => {
    const kw = supplierSearchKeyword.trim().toLowerCase();
    if (!kw) return SUPPLIER_OPTIONS;
    return SUPPLIER_OPTIONS.filter(
      (s) =>
        s.name.toLowerCase().includes(kw) || s.code.toLowerCase().includes(kw)
    );
  }, [supplierSearchKeyword]);

  // 选择供应商
  const handleSelectSupplier = (supplierId: string) => {
    setSelectedSupplierId(supplierId);
    setIsSupplierDropdownOpen(false);
    setSupplierSearchKeyword('');
  };

  // 点击“查询”执行筛选
  const handleQuery = () => {
    setAppliedCategory(selectedCategory);
    setAppliedSupplierId(selectedSupplierId);
    setAppliedProductName(productNameInput.trim());
    setCurrentPage(1);

    if (onSupplierChange) {
      onSupplierChange(selectedSupplierId);
    }
  };

  // 点击“重置”清空所有筛选条件
  const handleReset = () => {
    setSelectedCategory('all');
    setSelectedSupplierId('all');
    setProductNameInput('');
    setAppliedCategory('all');
    setAppliedSupplierId('all');
    setAppliedProductName('');
    setSupplierSearchKeyword('');
    setIsSupplierDropdownOpen(false);
    setCurrentPage(1);

    if (onSupplierChange) {
      onSupplierChange('all');
    }
  };

  // =========================================================================
  // 3. 全量产商品明细过滤逻辑（不按时间过滤，展示全量明细）
  // =========================================================================
  const filteredProducts = useMemo(() => {
    return ALL_SUPPLIER_PRODUCTS.filter((prod) => {
      // 1. 类型筛选
      if (appliedCategory !== 'all' && prod.category !== appliedCategory) {
        return false;
      }
      // 2. 供应商筛选
      if (appliedSupplierId !== 'all' && prod.supplierId !== appliedSupplierId) {
        return false;
      }
      // 3. 产商品名称关键词搜索
      if (appliedProductName) {
        const kw = appliedProductName.toLowerCase();
        const matchesName = prod.productName.toLowerCase().includes(kw);
        const matchesCode = prod.productCode.toLowerCase().includes(kw);
        if (!matchesName && !matchesCode) {
          return false;
        }
      }
      return true;
    });
  }, [appliedCategory, appliedSupplierId, appliedProductName]);

  // 分页计算
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const pagedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage]);

  const handleJumpPage = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(jumpPageInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
    setJumpPageInput('');
  };

  return (
    <div className="space-y-4">
      {/* ========================================================================= */}
      {/* 模块一：产商品概况 (已删除根据供应商名称和供应商编号筛选的入口，展示全平台概况) */}
      {/* ========================================================================= */}
      <div id="section-product-overview" className="space-y-3">
        {/* 概况统计顶部卡片：全平台在架产商品全景 */}
        <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-blue-600 rounded-xs" />
                <h3 className="text-sm font-bold text-slate-900">
                  全平台供应商在架产商品概况
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200/70">
                  全网在架
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                <span>
                  产商品总数：
                  <strong className="font-mono font-bold text-slate-900 text-sm ml-0.5">
                    {overviewStats.totalProducts.toLocaleString()}
                  </strong>{' '}
                  款
                </span>
                <span className="text-slate-300">|</span>
                <span>
                  当前覆盖类别：
                  <strong className="font-mono font-bold text-blue-600 text-sm ml-0.5">
                    {overviewStats.coveredCategoryCount}
                  </strong>{' '}
                  类
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-400">
                  已汇总全平台算力、模型、智能体等各门类产商品供应数据
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 产商品概况：各产商品类别分布明细 */}
        <div className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-blue-600 rounded-xs" />
              <h3 className="text-xs font-semibold text-slate-800 tracking-wide flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                各产商品类别分布明细
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              数据单位：款（在架产商品）
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {overviewStats.categories.map((cat) => {
              const percent =
                overviewStats.totalProducts > 0
                  ? ((cat.count / overviewStats.totalProducts) * 100).toFixed(1)
                  : '0.0';

              return (
                <div
                  key={cat.name}
                  className="p-3 rounded-md border border-slate-200/80 bg-white hover:border-slate-300 transition-colors shadow-2xs flex flex-col justify-between gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-xs font-semibold text-slate-800">
                        {cat.name}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {cat.count}{' '}
                      <span className="text-[10px] font-normal text-slate-500">
                        款
                      </span>
                    </span>
                  </div>

                  {/* 占比进度条 */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full transition-all duration-300"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>全平台占比</span>
                      <span className="font-mono text-slate-600 font-medium">
                        {percent}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-100 mt-3.5">
            <span>涵盖 7 大产商品基础与增值分类</span>
            <div>
              合计在架产商品：
              <strong className="text-slate-700 font-mono font-bold ml-1">
                {overviewStats.totalProducts}
              </strong>{' '}
              款
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 模块二：销售表现 - 产商品销售明细 (放在同一页，只保留明细，增加类型与供应商筛选，全量展示) */}
      {/* ========================================================================= */}
      <div id="section-product-sales-detail" className="bg-white rounded-md border border-slate-200/90 shadow-xs p-4 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-blue-600 rounded-xs" />
            <h3 className="text-xs font-semibold text-slate-800 tracking-wide flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5 text-blue-600" />
              销售表现 · 产商品销售明细
              <span className="text-slate-400 font-normal">
                {appliedCategory !== 'all' || appliedSupplierId !== 'all' || appliedProductName
                  ? `(筛选出 ${filteredProducts.length} / ${ALL_SUPPLIER_PRODUCTS.length} 款产商品)`
                  : `(共 ${filteredProducts.length} 款产商品)`}
              </span>
            </h3>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span>全量统计 · 不受时间周期限制</span>
          </div>
        </div>

        {/* 筛选工具栏：类型、供应商名称、产商品名称筛选入口 */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-md p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* 1. 产商品类型筛选 */}
              <div className="flex items-center gap-1.5">
                <label
                  htmlFor="filter-product-type"
                  className="text-xs font-medium text-slate-600 shrink-0 flex items-center gap-1"
                >
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  类型:
                </label>
                <select
                  id="filter-product-type"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-8 bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-xs rounded px-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">全部类型 (默认)</option>
                  {FIXED_PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. 供应商名称筛选 (带下拉关键词搜索) */}
              <div
                className="flex items-center gap-1.5 relative"
                ref={supplierDropdownRef}
              >
                <label className="text-xs font-medium text-slate-600 shrink-0 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  供应商名称:
                </label>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsSupplierDropdownOpen((prev) => !prev)}
                    className="w-52 sm:w-60 h-8 bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-xs rounded px-2.5 flex items-center justify-between transition-colors text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <span className="truncate">
                      {currentSupplierOption
                        ? currentSupplierOption.name
                        : '全部供应商 (默认)'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                  </button>

                  {/* 供应商搜索弹层 */}
                  {isSupplierDropdownOpen && (
                    <div className="absolute left-0 top-full mt-1 w-72 sm:w-80 bg-white border border-slate-200 rounded-md shadow-lg z-50 p-2 space-y-1.5 animate-in fade-in zoom-in-95 duration-100">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="搜索供应商名称或编号..."
                          value={supplierSearchKeyword}
                          onChange={(e) => setSupplierSearchKeyword(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded text-xs pl-8 pr-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                          autoFocus
                        />
                      </div>

                      <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 text-xs custom-scrollbar">
                        <button
                          type="button"
                          onClick={() => handleSelectSupplier('all')}
                          className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                            selectedSupplierId === 'all'
                              ? 'bg-blue-50/70 text-blue-700 font-semibold'
                              : 'text-slate-700'
                          }`}
                        >
                          <span>全部供应商 (默认)</span>
                          {selectedSupplierId === 'all' && (
                            <Check className="w-3.5 h-3.5 text-blue-600" />
                          )}
                        </button>

                        {filteredSupplierOptions.map((s) => {
                          const isSelected = selectedSupplierId === s.id;
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => handleSelectSupplier(s.id)}
                              className={`w-full text-left px-2.5 py-1.5 rounded flex flex-col gap-0.5 hover:bg-slate-50 cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-50/70 text-blue-700 font-semibold'
                                  : 'text-slate-700'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="truncate pr-2 font-medium">
                                  {s.name}
                                </span>
                                {isSelected && (
                                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                <span className="font-mono">{s.code}</span>
                                <span>·</span>
                                <span>主供: {s.categories.join('、')}</span>
                              </div>
                            </button>
                          );
                        })}

                        {filteredSupplierOptions.length === 0 && (
                          <div className="py-3 text-center text-slate-400 text-xs">
                            未查找到对应供应商
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. 产商品名称搜索 */}
              <div className="flex items-center gap-1.5">
                <label
                  htmlFor="input-search-product-name"
                  className="text-xs font-medium text-slate-600 shrink-0 flex items-center gap-1"
                >
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  产商品名称:
                </label>
                <div className="relative w-48 sm:w-60">
                  <input
                    id="input-search-product-name"
                    type="text"
                    placeholder="输入产商品名称搜索..."
                    value={productNameInput}
                    onChange={(e) => setProductNameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleQuery();
                      }
                    }}
                    className="w-full h-8 pl-3 pr-7 text-xs bg-white border border-slate-200 rounded focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  {productNameInput && (
                    <button
                      type="button"
                      onClick={() => setProductNameInput('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                      title="清空输入"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 4. 查询与重置按钮 */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleQuery}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors shadow-xs cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>查询</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 rounded text-xs font-medium transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>重置</span>
              </button>
            </div>
          </div>
        </div>

        {/* 产商品销售明细表格：全量明细，展示累计指标，不按时间切分 */}
        {filteredProducts.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs">
            <Package className="w-8 h-8 text-slate-300 mb-2" />
            <span>未查找到符合当前筛选条件的产商品销售明细</span>
            <button
              type="button"
              onClick={handleReset}
              className="mt-2 text-xs text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
            >
              重置所有筛选条件
            </button>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto border border-slate-200/80 rounded-md">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/90 text-slate-600 border-b border-slate-200/80 font-medium">
                  <tr>
                    <th className="py-2.5 px-3 whitespace-nowrap">产商品名称</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">类型</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">供应商名称</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">供应商编号</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap">
                      销售订单总数 (累计)
                    </th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap">
                      销售金额 (累计)
                    </th>
                    <th className="py-2.5 px-3 whitespace-nowrap">最近交易时间</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {pagedProducts.map((prod) => {
                    const catColor = CATEGORY_COLORS[prod.category] || '#2563EB';

                    return (
                      <tr
                        key={`${prod.supplierCode}-${prod.id}`}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td
                          className="py-2.5 px-3 font-medium text-slate-900 max-w-[280px] truncate whitespace-nowrap align-middle"
                          title={prod.productName}
                        >
                          {prod.productName}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap align-middle">
                          <span
                            className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-medium text-white whitespace-nowrap leading-tight shrink-0 select-none shadow-2xs"
                            style={{ backgroundColor: catColor }}
                          >
                            {prod.category}
                          </span>
                        </td>
                        <td
                          className="py-2.5 px-3 text-slate-700 max-w-[240px] truncate whitespace-nowrap align-middle"
                          title={prod.supplierName}
                        >
                          {prod.supplierName}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap align-middle">
                          {prod.supplierCode}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-blue-700 whitespace-nowrap align-middle">
                          {prod.totalOrders.toLocaleString()} 笔
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 whitespace-nowrap align-middle">
                          ¥
                          {prod.totalSalesAmount.toLocaleString(undefined, {
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 1,
                          })}{' '}
                          万元
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px] whitespace-nowrap align-middle">
                          {prod.lastTxDate}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap align-middle">
                          <button
                            type="button"
                            onClick={() => handleViewDetail(prod)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                            title="查看产商品详情"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            查看详情
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 分页控制栏 (默认每页 20 条，展示全量统计) */}
            {filteredProducts.length > 0 && (
              <div className="mt-3.5 px-1 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <span>第</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {(currentPage - 1) * pageSize + 1} -{' '}
                    {Math.min(currentPage * pageSize, filteredProducts.length)}
                  </span>
                  <span>款，共</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {filteredProducts.length}
                  </span>
                  <span>款产商品 (每页 20 条)</span>
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
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                    title="下一页"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>

                  <form
                    onSubmit={handleJumpPage}
                    className="flex items-center gap-1 ml-2"
                  >
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
        )}
      </div>

      {/* 弹窗查看产商品详情（降级弹窗支持） */}
      {selectedProductForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-slate-100 rounded-lg max-w-6xl w-full max-h-[92vh] overflow-y-auto p-4 relative shadow-2xl">
            <SupplierProductDetailView
              product={selectedProductForModal}
              onBack={() => setSelectedProductForModal(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
