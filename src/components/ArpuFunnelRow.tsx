import React, { useState } from 'react';
import { TimeRangeType } from '../types';
import {
  ARPU_CATEGORIES,
  ARPU_VALUES_BY_RANGE,
  FUNNEL_DATA_BY_RANGE,
  formatCurrency,
  formatNumber,
} from '../data/mockData';
import { ArrowRight, ChevronDown } from 'lucide-react';

interface ArpuFunnelRowProps {
  timeRange: TimeRangeType;
}

export const ArpuFunnelRow: React.FC<ArpuFunnelRowProps> = ({ timeRange }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('汇总');

  const currentArpuMap = ARPU_VALUES_BY_RANGE[timeRange] || ARPU_VALUES_BY_RANGE.month;
  const currentArpu = currentArpuMap[selectedCategory] || currentArpuMap['汇总'] || 17200;
  const funnelData = FUNNEL_DATA_BY_RANGE[timeRange] || FUNNEL_DATA_BY_RANGE.month;

  return (
    <div
      id="card-arpu-funnel"
      className="bg-white rounded-lg border border-slate-200 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:divide-x lg:divide-slate-100">
        {/* 左侧：整体客单价 (约占28%) */}
        <div className="lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-800 tracking-wide flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-blue-600 rounded-xs" />
                整体客单价
              </h2>
              {/* 类别下拉框 */}
              <div className="relative">
                <select
                  id="arpu-category-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded px-2.5 py-1 pr-6 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer hover:border-slate-300"
                >
                  {ARPU_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 客单价重点卡片 */}
            <div className="bg-slate-50/80 rounded-lg p-5 border border-slate-100">
              <div className="text-xs text-slate-500 font-medium mb-1">
                {selectedCategory === '汇总' ? '全部服务平均客单价 (ARPU)' : `${selectedCategory} 客单价`}
              </div>
              <div className="text-3xl lg:text-4xl font-bold text-slate-900 font-mono tracking-tight my-2">
                {formatCurrency(currentArpu)}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
                <span>基于当期有效订单与商户基数测算</span>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：签约至订购转化 (约占72%) */}
        <div className="lg:col-span-8 lg:pl-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 tracking-wide flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-blue-600 rounded-xs" />
              签约至订购转化
            </h2>
          </div>

          {/* 简洁科技感转化漏斗 (两阶段) */}
          <div className="flex-1 flex flex-col justify-center py-2">
            <div className="grid grid-cols-1 md:grid-cols-11 items-center gap-3">
              {/* 阶段 1: 签约商户 */}
              <div className="md:col-span-4 bg-gradient-to-r from-blue-50 to-blue-50/40 rounded-lg p-4 border border-blue-100 flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-blue-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    阶段一：签约商户
                  </span>
                  <span className="text-[11px] font-mono text-blue-600 bg-blue-100/60 px-1.5 py-0.5 rounded">
                    基数 100%
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl lg:text-3xl font-bold text-slate-900 font-sans">
                    {formatNumber(funnelData.signedCount)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">家</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-2">
                  平台已完成入驻协议签署的商户
                </div>
              </div>

              {/* 转化中转指示区 */}
              <div className="md:col-span-3 flex flex-col items-center justify-center p-2 text-center">
                <div className="text-[11px] text-slate-500 font-medium mb-1">签约至订购转化率</div>
                <div className="text-xl lg:text-2xl font-bold text-blue-600 font-mono tracking-tight">
                  {funnelData.conversionRate}%
                </div>
                <div className="w-full flex items-center justify-center gap-1 text-blue-500 my-1">
                  <div className="h-0.5 w-8 bg-blue-300 rounded" />
                  <ArrowRight className="w-4 h-4 text-blue-600 shrink-0" />
                  <div className="h-0.5 w-8 bg-blue-300 rounded" />
                </div>
                <div className="text-[10px] text-slate-400">
                  {formatNumber(funnelData.orderedCount)} / {formatNumber(funnelData.signedCount)}
                </div>
              </div>

              {/* 阶段 2: 订购商户 */}
              <div className="md:col-span-4 bg-gradient-to-r from-cyan-50 to-blue-50/30 rounded-lg p-4 border border-cyan-100 flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-cyan-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-600" />
                    阶段二：订购商户
                  </span>
                  <span className="text-[11px] font-mono text-cyan-700 bg-cyan-100/60 px-1.5 py-0.5 rounded">
                    转化达成
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl lg:text-3xl font-bold text-slate-900 font-sans">
                    {formatNumber(funnelData.orderedCount)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">家</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-2">
                  已产生实际服务订购交易的商户
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
