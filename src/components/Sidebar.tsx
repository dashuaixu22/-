import React, { useState } from 'react';
import {
  LayoutDashboard,
  Cpu,
  Building2,
  Users,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { MenuItemConfig } from '../types';

interface SidebarProps {
  activeKey: string;
  onSelect: (key: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

// 完整菜单结构：首页 + 平台O-供应商S运营 + 平台O-需求端B/C运营
export const NAVIGATION_MENU: MenuItemConfig[] = [
  {
    key: 'home',
    label: '首页',
    icon: LayoutDashboard,
  },
  {
    key: 'platform_supplier_ops',
    label: '平台O-供应商S运营',
    icon: Building2,
    children: [
      {
        key: 'overview_domain',
        label: '总览（业务价值域）',
        children: [
          { key: 'business_overview', label: '经营总览' },
          { key: 'supply_demand_tx', label: '供需交易总览' },
          { key: 'vas_operations', label: '增值服务运营（示例）' },
        ],
      },
      {
        key: 'supplier_analysis_domain',
        label: '供应商分析（客户域）',
        children: [
          { key: 'supplier_count', label: '供应商数' },
          { key: 'supplier_query', label: '供应商查询' },
          { key: 'supplier_consumption', label: '供应商消费（示例）' },
          { key: 'supplier_products', label: '供应商产商品' },
          { key: 'supplier_sales_order_query', label: '供应商销售订单查询' },
        ],
      },
      {
        key: 'product_analysis_domain',
        label: '产商品分析（产品域）',
        children: [
          { key: 'product_info', label: '增值产品查询（示例）' },
          { key: 'product_value', label: '产品价值（示例）' },
          { key: 'product_quality', label: '产品质量（示例）' },
          { key: 'vas_order_query', label: '增值订单查询（示例）' },
        ],
      },
    ],
  },
  {
    key: 'platform_demand_ops',
    label: '平台O-需求端B/C运营',
    icon: Users,
    children: [
      {
        key: 'demand_overview',
        label: '需求方概览',
        children: [
          { key: 'demand_scale', label: '规模概览' },
          { key: 'demand_query', label: '需求方查询' },
        ],
      },
      {
        key: 'demand_consumption',
        label: '交易消费',
        children: [
          { key: 'demand_trade_analysis', label: '消费分析' },
          { key: 'demand_trade_products', label: '产品订购' },
          { key: 'demand_trade_orders', label: '消费订单查询' },
        ],
      },
      {
        key: 'demand_service',
        label: '服务体验',
        children: [
          { key: 'demand_service_feedback', label: '反馈与投诉（示例）' },
          { key: 'demand_service_usage', label: '平台使用情况（示例）' },
        ],
      },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeKey,
  onSelect,
  collapsed,
  onToggleCollapse,
}) => {
  // 展开的一级和二级菜单 keys (默认展开)
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({
    platform_supplier_ops: true,
    platform_demand_ops: true,
    overview_domain: true,
    supplier_analysis_domain: true,
    product_analysis_domain: true,
    demand_overview: true,
    demand_consumption: true,
    demand_service: true,
  });

  const toggleExpand = (key: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleMenuClick = (item: MenuItemConfig, hasChildren: boolean) => {
    if (hasChildren) {
      // 拥有子菜单的父级：点击时切换展开/收起
      toggleExpand(item.key);
      // 如果从收起状态打开且子级未被激活，自动选中第一个三级子菜单
      if (item.children && item.children.length > 0) {
        const hasActiveChild = item.children.some((c) => c.key === activeKey);
        if (!hasActiveChild && !expandedKeys[item.key]) {
          onSelect(item.children[0].key);
        }
      }
    } else {
      // 叶子节点菜单：直接选中
      onSelect(item.key);
    }
  };

  return (
    <aside
      id="app-sidebar"
      className={`${
        collapsed ? 'w-[64px]' : 'w-[236px]'
      } shrink-0 bg-white flex flex-col select-none border-r border-slate-200/80 shadow-[4px_0_16px_rgba(11,31,58,0.08)] h-[calc(100vh-48px)] transition-all duration-200 ease-in-out relative z-30`}
    >
      {/* 侧边栏顶部工具栏/收起状态 */}
      <div
        className={`h-14 flex items-center ${
          collapsed ? 'justify-center px-1' : 'justify-between px-3.5'
        } border-b border-slate-100 shrink-0 text-slate-500`}
      >
        {!collapsed && (
          <span className="text-xs font-bold tracking-wider text-slate-700">
            功能导航
          </span>
        )}
        <button
          type="button"
          id="sidebar-top-toggle-btn"
          onClick={onToggleCollapse}
          className="p-1.5 rounded hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer text-slate-400"
          title={collapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* 菜单列表 */}
      <nav className="p-2 space-y-1 flex-1 overflow-y-auto overflow-x-hidden custom-sidebar-scroll">
        {NAVIGATION_MENU.map((level1) => {
          const hasL2 = Boolean(level1.children && level1.children.length > 0);
          const isL1Expanded = Boolean(expandedKeys[level1.key]);
          const isL1Active = activeKey === level1.key;
          const Icon = level1.icon;

          return (
            <div
              key={level1.key}
              className={`flex flex-col rounded-lg transition-all duration-150 ${
                isL1Expanded && hasL2
                  ? 'bg-slate-50/70 border border-slate-200/60 pb-1'
                  : ''
              }`}
            >
              {/* 一级菜单项 */}
              <button
                type="button"
                id={`menu-item-${level1.key}`}
                onClick={() => handleMenuClick(level1, hasL2)}
                title={collapsed ? level1.label : undefined}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-[13px] font-medium transition-all duration-150 text-left cursor-pointer relative ${
                  isL1Active && !hasL2
                    ? 'bg-[#1677FF] text-white font-semibold shadow-xs'
                    : isL1Expanded && hasL2
                    ? 'bg-slate-100/80 text-blue-900 font-semibold'
                    : 'text-slate-700 hover:text-blue-700 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {Icon && (
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isL1Active && !hasL2
                          ? 'text-white'
                          : isL1Expanded && hasL2
                          ? 'text-blue-600'
                          : 'text-slate-500'
                      }`}
                    />
                  )}
                  {!collapsed && (
                    <span className="truncate tracking-wide">{level1.label}</span>
                  )}
                </div>

                {/* 展开/收起指示箭头 */}
                {!collapsed && hasL2 && (
                  <ChevronRight
                    className={`w-3.5 h-3.5 shrink-0 transition-transform duration-150 ease-out ${
                      isL1Expanded
                        ? 'rotate-90 text-blue-600 font-bold'
                        : 'text-slate-400'
                    }`}
                  />
                )}
              </button>

              {/* 二级菜单容器 */}
              {!collapsed && hasL2 && isL1Expanded && (
                <div className="flex flex-col mt-0.5 px-1 space-y-0.5 transition-all duration-150 ease-in-out border-l border-blue-200 ml-4 pl-1">
                  {level1.children!.map((level2) => {
                    const hasL3 = Boolean(level2.children && level2.children.length > 0);
                    const isL2Expanded = Boolean(expandedKeys[level2.key]);
                    const isL2Active =
                      activeKey === level2.key ||
                      Boolean(level2.children && level2.children.some((c) => c.key === activeKey)) ||
                      (activeKey === 'demand_customer_detail' && level2.key === 'demand_overview') ||
                      (activeKey === 'demand_order_detail' && level2.key === 'demand_consumption') ||
                      (activeKey === 'supplier_detail' && level2.key === 'supplier_analysis_domain') ||
                      (activeKey === 'vas_product_detail' && level2.key === 'product_analysis_domain');

                    return (
                      <div
                        key={level2.key}
                        className={`flex flex-col rounded-md transition-all duration-150 ${
                          isL2Expanded && hasL3
                            ? 'bg-slate-100/60 pb-0.5'
                            : ''
                        }`}
                      >
                        {/* 二级菜单项 */}
                        <button
                          type="button"
                          id={`menu-item-${level2.key}`}
                          onClick={() => handleMenuClick(level2, hasL3)}
                          className={`w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded text-[12.5px] transition-all duration-150 text-left cursor-pointer relative ${
                            isL2Active && !hasL3
                              ? 'bg-[#1677FF] text-white font-semibold shadow-xs'
                              : isL2Expanded && hasL3
                              ? 'bg-blue-50/60 text-blue-800 font-semibold'
                              : 'text-slate-600 hover:text-blue-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate flex-1">
                            <span className="truncate">{level2.label}</span>
                          </div>
                          {hasL3 && (
                            <ChevronRight
                              className={`w-3 h-3 shrink-0 transition-transform duration-150 ease-out ${
                                isL2Expanded
                                  ? 'rotate-90 text-blue-600 font-bold'
                                  : 'text-slate-400'
                              }`}
                            />
                          )}
                        </button>

                        {/* 三级菜单容器 */}
                        {hasL3 && isL2Expanded && (
                          <div className="flex flex-col mt-0.5 space-y-0.5 transition-all duration-150 ease-in-out border-l border-slate-200 ml-3 pl-1">
                            {level2.children!.map((level3) => {
                              const isL3Active =
                                activeKey === level3.key ||
                                (activeKey === 'supplier_detail' && level3.key === 'supplier_query') ||
                                (activeKey === 'vas_product_detail' && level3.key === 'product_info') ||
                                (activeKey === 'demand_customer_detail' && level3.key === 'demand_query') ||
                                (activeKey === 'demand_order_detail' && level3.key === 'demand_trade_orders') ||
                                (activeKey === 'demand_overview' && level3.key === 'demand_scale') ||
                                (activeKey === 'demand_consumption' && level3.key === 'demand_trade_analysis') ||
                                (activeKey === 'demand_service' && level3.key === 'demand_service_feedback');
                              return (
                                <button
                                  key={level3.key}
                                  type="button"
                                  id={`menu-item-${level3.key}`}
                                  onClick={() => handleMenuClick(level3, false)}
                                  className={`w-full flex items-center pl-3 pr-2 py-1.5 rounded text-[12px] transition-all duration-150 text-left cursor-pointer ${
                                    isL3Active
                                      ? 'bg-[#1677FF] text-white font-semibold shadow-xs'
                                      : 'text-slate-600 hover:text-blue-700 hover:bg-slate-100'
                                  }`}
                                >
                                  <span className="truncate">{level3.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};
