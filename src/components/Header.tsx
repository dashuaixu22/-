import React, { useState } from 'react';
import { TimeRangeType } from '../types';
import { TODAY } from '../data/mockData';
import { AlertCircle, Calendar, X } from 'lucide-react';

interface HeaderProps {
  activeMenu: string;
  timeRange: TimeRangeType;
  onTimeRangeChange: (range: TimeRangeType) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
}

// 对应各级菜单项的标题映射
const MENU_TITLE_MAP: Record<string, string> = {
  home: '运营数据分析',
  platform_supplier_ops: '平台O-供应商S运营',
  overview_domain: '总览（业务价值域）',
  business_overview: '经营总览',
  supply_demand_tx: '供需交易总览',
  vas_operations: '增值服务运营（示例）',
  supplier_analysis_domain: '供应商分析（客户域）',
  supplier_count: '供应商数',
  supplier_query: '供应商查询',
  supplier_consumption: '供应商消费（示例）',
  supplier_products: '供应商产商品',
  supplier_sales_order_query: '供应商销售订单查询',
  supplier_detail: '供应商详情',
  product_analysis_domain: '产商品分析（产品域）',
  product_info: '增值产品查询（示例）',
  vas_product_detail: '增值产品详情',
  product_value: '产品价值（示例）',
  product_quality: '产品质量（示例）',
  vas_order_query: '增值订单查询（示例）',
  platform_demand_ops: '平台O-需求端B/C运营',
  demand_overview: '需求方概览',
  demand_scale: '规模概览',
  demand_query: '需求方查询',
  demand_consumption: '交易消费',
  demand_trade_analysis: '消费分析',
  demand_trade_products: '产品订购',
  demand_trade_orders: '消费订单查询',
  demand_service: '服务体验',
  demand_service_feedback: '反馈与投诉（示例）',
  demand_service_usage: '平台使用情况（示例）',
  demand_customer_detail: '需求方详情',
  demand_order_detail: '消费订单详情',
};

export const Header: React.FC<HeaderProps> = ({
  activeMenu,
  timeRange,
  onTimeRangeChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
}) => {
  const [dateWarning, setDateWarning] = useState<string | null>(null);

  const title = MENU_TITLE_MAP[activeMenu] || '运营数据分析';

  const handleRangeClick = (range: TimeRangeType) => {
    onTimeRangeChange(range);
    setDateWarning(null);
    if (range === 'today') {
      onStartDateChange(TODAY);
      onEndDateChange(TODAY);
    } else if (range === 'year') {
      onStartDateChange('2025-08-28');
      onEndDateChange(TODAY);
    } else if (range === 'month') {
      onStartDateChange('2026-07-30');
      onEndDateChange(TODAY);
    } else if (range === 'week') {
      onStartDateChange('2026-08-22');
      onEndDateChange(TODAY);
    } else if (range === 'custom') {
      // 自选时间段保持当前日期，或若未设定则设为近两周
      if (!startDate) onStartDateChange('2026-08-15');
      if (!endDate) onEndDateChange(TODAY);
    }
  };

  // 用户自由修改开始时间：支持自选时间段自由选择，自动切换为 custom 模式
  const handleStartDateChange = (newStart: string) => {
    onStartDateChange(newStart);
    onTimeRangeChange('custom');
    if (!newStart) return;

    if (endDate && newStart > endDate) {
      setDateWarning('开始时间不能晚于结束时间，请重新选择。');
    } else if (newStart > TODAY) {
      setDateWarning(`所选开始时间 (${newStart}) 已超过今日 (${TODAY})，请注意数据统计截止至今日。`);
    } else {
      setDateWarning(null);
    }
  };

  // 用户自由修改结束时间：支持自选时间段自由选择，自动切换为 custom 模式
  const handleEndDateChange = (newEnd: string) => {
    onEndDateChange(newEnd);
    onTimeRangeChange('custom');
    if (!newEnd) return;

    if (startDate && startDate > newEnd) {
      setDateWarning('开始时间不能晚于结束时间，请重新选择。');
    } else if (newEnd > TODAY) {
      setDateWarning(`所选结束时间 (${newEnd}) 已超过今日 (${TODAY})，请注意数据统计截止至今日。`);
    } else {
      setDateWarning(null);
    }
  };

  return (
    <div className="flex flex-col shrink-0 z-20">
      <header
        id="app-header"
        className="h-14 bg-white border-b border-slate-200 px-6 md:px-8 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)] relative"
      >
        {/* 最左侧：当前菜单标题 */}
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            {title}
          </h1>
        </div>

        {/* 最右侧：Tab选择 (当日、近一周、近一月、近一年、自选时间段) + 时间选择框 (开始时间 - 结束时间) */}
        {['business_overview', 'supply_demand_tx', 'vas_operations', 'supplier_count', 'supplier_consumption'].includes(activeMenu) && (
          <div className="flex items-center gap-3 md:gap-4">
            {/* Tab选择 */}
            <div
              id="header-time-tabs"
              className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium text-slate-600"
            >
              <button
                type="button"
                id="tab-range-today"
                onClick={() => handleRangeClick('today')}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  timeRange === 'today'
                    ? 'bg-white text-blue-600 font-semibold shadow-xs'
                    : 'hover:text-slate-900 text-slate-600'
                }`}
              >
                当日
              </button>
              <button
                type="button"
                id="tab-range-week"
                onClick={() => handleRangeClick('week')}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  timeRange === 'week'
                    ? 'bg-white text-blue-600 font-semibold shadow-xs'
                    : 'hover:text-slate-900 text-slate-600'
                }`}
              >
                近一周
              </button>
              <button
                type="button"
                id="tab-range-month"
                onClick={() => handleRangeClick('month')}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  timeRange === 'month'
                    ? 'bg-white text-blue-600 font-semibold shadow-xs'
                    : 'hover:text-slate-900 text-slate-600'
                }`}
              >
                近一月
              </button>
              <button
                type="button"
                id="tab-range-year"
                onClick={() => handleRangeClick('year')}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  timeRange === 'year'
                    ? 'bg-white text-blue-600 font-semibold shadow-xs'
                    : 'hover:text-slate-900 text-slate-600'
                }`}
              >
                近一年
              </button>
            </div>

            {/* 时间选择框：开始时间 - 结束时间（自选时间段由右侧起止日期确定，自选时间段激活时此框高亮） */}
            <div
              id="header-date-picker"
              className={`flex items-center bg-white border ${
                dateWarning
                  ? 'border-amber-400 ring-2 ring-amber-300 shadow-sm'
                  : timeRange === 'custom'
                  ? 'border-blue-500 ring-2 ring-blue-400/30 shadow-xs'
                  : 'border-slate-200'
              } rounded-md px-2.5 py-1 text-xs text-slate-700 hover:border-slate-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all`}
              title="选择开始与结束时间，自动生效自选时间段"
            >
              <Calendar
                className={`w-3.5 h-3.5 mr-1.5 shrink-0 ${
                  timeRange === 'custom' ? 'text-blue-600' : 'text-slate-400'
                }`}
              />
              <input
                type="date"
                id="date-picker-start"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className={`border-none bg-transparent p-0 text-xs focus:outline-none cursor-pointer w-[110px] ${
                  timeRange === 'custom' ? 'text-blue-900 font-medium' : 'text-slate-700'
                }`}
                title="开始时间"
              />
              <span className="text-slate-400 mx-1 font-medium">-</span>
              <input
                type="date"
                id="date-picker-end"
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className={`border-none bg-transparent p-0 text-xs focus:outline-none cursor-pointer w-[110px] ${
                  timeRange === 'custom' ? 'text-blue-900 font-medium' : 'text-slate-700'
                }`}
                title="结束时间"
              />
            </div>
          </div>
        )}
      </header>

      {/* 提醒横幅（开始时间晚于结束时间或超过今日） */}
      {dateWarning && (
        <div
          id="date-warning-banner"
          className="bg-amber-50 border-b border-amber-200 px-6 py-1.5 flex items-center justify-between text-xs text-amber-800 transition-all animate-fadeIn"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{dateWarning}</span>
          </div>
          <button
            type="button"
            onClick={() => setDateWarning(null)}
            className="p-0.5 rounded text-amber-600 hover:bg-amber-100 hover:text-amber-900 cursor-pointer ml-4"
            title="关闭提示"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
