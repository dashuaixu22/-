import React from 'react';
import { TimeRangeType } from '../types';
import {
  FOUR_CARDS_DATA_BY_RANGE,
  SERVICE_CARDS_DATA_BY_RANGE,
  PLATFORM_REVENUE_DATA_BY_RANGE,
} from '../data/mockData';
import {
  Building2,
  BadgeDollarSign,
  ShoppingCart,
  Wallet,
  Server,
  Layers,
  CircleDollarSign,
} from 'lucide-react';

interface OverviewCardsRowProps {
  timeRange: TimeRangeType;
}

export const OverviewCardsRow: React.FC<OverviewCardsRowProps> = ({ timeRange }) => {
  const fourCards = FOUR_CARDS_DATA_BY_RANGE[timeRange];
  const serviceCards = SERVICE_CARDS_DATA_BY_RANGE[timeRange];
  const platformRevenue = PLATFORM_REVENUE_DATA_BY_RANGE[timeRange];

  return (
    <div className="space-y-4">
      {/* 第一行：4个核心卡片 (供应商总数、供应商销售额、订单数、平台收入) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. 供应商总数 */}
        <div
          id="card-supplier-count"
          className="bg-white rounded-lg border border-slate-200 py-3 px-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-blue-200 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>{fourCards.supplierCount.label}</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 tracking-tight mb-1.5 font-sans">
            {fourCards.supplierCount.value}
          </div>
          <div className="flex items-center text-xs gap-1.5 font-medium pt-1 border-t border-slate-50">
            <span className="text-slate-400">环比</span>
            <span
              className={`inline-flex items-center gap-0.5 font-semibold ${
                fourCards.supplierCount.isUp ? 'text-red-500' : 'text-emerald-600'
              }`}
            >
              <span>{fourCards.supplierCount.isUp ? '↑' : '↓'}</span>
              <span>{fourCards.supplierCount.momText}</span>
            </span>
          </div>
        </div>

        {/* 2. 供应商销售额 */}
        <div
          id="card-supplier-sales"
          className="bg-white rounded-lg border border-slate-200 py-3 px-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-blue-200 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <BadgeDollarSign className="w-3.5 h-3.5 text-blue-600" />
              <span>{fourCards.supplierSales.label}</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 tracking-tight mb-1.5 font-mono">
            {fourCards.supplierSales.value}
          </div>
          <div className="flex items-center text-xs gap-1.5 font-medium pt-1 border-t border-slate-50">
            <span className="text-slate-400">环比</span>
            <span
              className={`inline-flex items-center gap-0.5 font-semibold ${
                fourCards.supplierSales.isUp ? 'text-red-500' : 'text-emerald-600'
              }`}
            >
              <span>{fourCards.supplierSales.isUp ? '↑' : '↓'}</span>
              <span>{fourCards.supplierSales.momText}</span>
            </span>
          </div>
        </div>

        {/* 3. 订单数 */}
        <div
          id="card-order-count"
          className="bg-white rounded-lg border border-slate-200 py-3 px-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-blue-200 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5 text-blue-600" />
              <span>{fourCards.orderCount.label}</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 tracking-tight mb-1.5 font-sans">
            {fourCards.orderCount.value}
          </div>
          <div className="flex items-center text-xs gap-1.5 font-medium pt-1 border-t border-slate-50">
            <span className="text-slate-400">环比</span>
            <span
              className={`inline-flex items-center gap-0.5 font-semibold ${
                fourCards.orderCount.isUp ? 'text-red-500' : 'text-emerald-600'
              }`}
            >
              <span>{fourCards.orderCount.isUp ? '↑' : '↓'}</span>
              <span>{fourCards.orderCount.momText}</span>
            </span>
          </div>
        </div>

        {/* 4. 平台收入 */}
        <div
          id="card-platform-income"
          className="bg-white rounded-lg border border-slate-200 py-3 px-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-blue-200 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-blue-600" />
              <span>{fourCards.platformIncome.label}</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 tracking-tight mb-1.5 font-mono">
            {fourCards.platformIncome.value}
          </div>
          <div className="flex items-center text-xs gap-1.5 font-medium pt-1 border-t border-slate-50">
            <span className="text-slate-400">环比</span>
            <span
              className={`inline-flex items-center gap-0.5 font-semibold ${
                fourCards.platformIncome.isUp ? 'text-red-500' : 'text-emerald-600'
              }`}
            >
              <span>{fourCards.platformIncome.isUp ? '↑' : '↓'}</span>
              <span>{fourCards.platformIncome.momText}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 第二行：两个卡片 (基础服务、增值服务) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 基础服务卡片 */}
        <div
          id="card-service-basic"
          className="bg-white rounded-lg border border-slate-200 pt-2.5 pb-3 px-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-100/80">
            <h2 className="text-xs font-semibold text-slate-700 tracking-wide flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-blue-600" />
              <span>{serviceCards.basic.title}</span>
            </h2>
          </div>
          <div className="flex items-center justify-between divide-x divide-slate-100">
            {/* 基础服务订单数 */}
            <div className="pr-5 flex-1">
              <div className="text-xs text-slate-500 font-medium mb-0.5">
                {serviceCards.basic.orderCount.label}
              </div>
              <div className="text-2xl font-bold text-slate-800 tracking-tight mb-1 font-sans">
                {serviceCards.basic.orderCount.value}
              </div>
              <div className="flex items-center text-xs gap-1.5 font-medium">
                <span className="text-slate-400">环比</span>
                <span
                  className={`inline-flex items-center gap-0.5 font-semibold ${
                    serviceCards.basic.orderCount.isUp ? 'text-red-500' : 'text-emerald-600'
                  }`}
                >
                  <span>{serviceCards.basic.orderCount.isUp ? '↑' : '↓'}</span>
                  <span>{serviceCards.basic.orderCount.momText}</span>
                </span>
              </div>
            </div>

            {/* 基础服务交易总金额 */}
            <div className="pl-5 flex-1">
              <div className="text-xs text-slate-500 font-medium mb-0.5">
                {serviceCards.basic.txAmount.label}
              </div>
              <div className="text-2xl font-bold text-slate-800 tracking-tight mb-1 font-mono">
                {serviceCards.basic.txAmount.value}
              </div>
              <div className="flex items-center text-xs gap-1.5 font-medium">
                <span className="text-slate-400">环比</span>
                <span
                  className={`inline-flex items-center gap-0.5 font-semibold ${
                    serviceCards.basic.txAmount.isUp ? 'text-red-500' : 'text-emerald-600'
                  }`}
                >
                  <span>{serviceCards.basic.txAmount.isUp ? '↑' : '↓'}</span>
                  <span>{serviceCards.basic.txAmount.momText}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 增值服务卡片 */}
        <div
          id="card-service-vas"
          className="bg-white rounded-lg border border-slate-200 pt-2.5 pb-3 px-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-100/80">
            <h2 className="text-xs font-semibold text-slate-700 tracking-wide flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>{serviceCards.vas.title}</span>
            </h2>
          </div>
          <div className="flex items-center justify-between divide-x divide-slate-100">
            {/* 增值服务订单数 */}
            <div className="pr-5 flex-1">
              <div className="text-xs text-slate-500 font-medium mb-0.5">
                {serviceCards.vas.orderCount.label}
              </div>
              <div className="text-2xl font-bold text-slate-800 tracking-tight mb-1 font-sans">
                {serviceCards.vas.orderCount.value}
              </div>
              <div className="flex items-center text-xs gap-1.5 font-medium">
                <span className="text-slate-400">环比</span>
                <span
                  className={`inline-flex items-center gap-0.5 font-semibold ${
                    serviceCards.vas.orderCount.isUp ? 'text-red-500' : 'text-emerald-600'
                  }`}
                >
                  <span>{serviceCards.vas.orderCount.isUp ? '↑' : '↓'}</span>
                  <span>{serviceCards.vas.orderCount.momText}</span>
                </span>
              </div>
            </div>

            {/* 增值服务交易总金额 */}
            <div className="pl-5 flex-1">
              <div className="text-xs text-slate-500 font-medium mb-0.5">
                {serviceCards.vas.txAmount.label}
              </div>
              <div className="text-2xl font-bold text-slate-800 tracking-tight mb-1 font-mono">
                {serviceCards.vas.txAmount.value}
              </div>
              <div className="flex items-center text-xs gap-1.5 font-medium">
                <span className="text-slate-400">环比</span>
                <span
                  className={`inline-flex items-center gap-0.5 font-semibold ${
                    serviceCards.vas.txAmount.isUp ? 'text-red-500' : 'text-emerald-600'
                  }`}
                >
                  <span>{serviceCards.vas.txAmount.isUp ? '↑' : '↓'}</span>
                  <span>{serviceCards.vas.txAmount.momText}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 第三行：整行卡片 (平台总收入、基础服务佣金收入、增值服务收入) */}
      <div
        id="card-platform-total-revenue"
        className="bg-white rounded-lg border border-slate-200 pt-2.5 pb-3 px-4.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
      >
        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-100/80">
          <h2 className="text-xs font-semibold text-slate-700 tracking-wide flex items-center gap-1.5">
            <CircleDollarSign className="w-3.5 h-3.5 text-blue-600" />
            <span>{platformRevenue.title}</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 gap-3 sm:gap-0">
          {/* 1. 平台总收入 */}
          <div className="sm:pr-6 flex-1">
            <div className="text-xs text-slate-500 font-medium mb-0.5">
              {platformRevenue.totalIncome.label}
            </div>
            <div className="text-2xl font-bold text-blue-600 tracking-tight mb-1 font-mono">
              {platformRevenue.totalIncome.value}
            </div>
            <div className="flex items-center text-xs gap-1.5 font-medium">
              <span className="text-slate-400">环比</span>
              <span
                className={`inline-flex items-center gap-0.5 font-semibold ${
                  platformRevenue.totalIncome.isUp ? 'text-red-500' : 'text-emerald-600'
                }`}
              >
                <span>{platformRevenue.totalIncome.isUp ? '↑' : '↓'}</span>
                <span>{platformRevenue.totalIncome.momText}</span>
              </span>
            </div>
          </div>

          {/* 2. 基础服务佣金收入 */}
          <div className="pt-2 sm:pt-0 sm:px-6 flex-1">
            <div className="text-xs text-slate-500 font-medium mb-0.5">
              {platformRevenue.basicCommission.label}
            </div>
            <div className="text-2xl font-bold text-slate-800 tracking-tight mb-1 font-mono">
              {platformRevenue.basicCommission.value}
            </div>
            <div className="flex items-center text-xs gap-1.5 font-medium">
              <span className="text-slate-400">环比</span>
              <span
                className={`inline-flex items-center gap-0.5 font-semibold ${
                  platformRevenue.basicCommission.isUp ? 'text-red-500' : 'text-emerald-600'
                }`}
              >
                <span>{platformRevenue.basicCommission.isUp ? '↑' : '↓'}</span>
                <span>{platformRevenue.basicCommission.momText}</span>
              </span>
            </div>
          </div>

          {/* 3. 增值服务收入 */}
          <div className="pt-2 sm:pt-0 sm:pl-6 flex-1">
            <div className="text-xs text-slate-500 font-medium mb-0.5">
              {platformRevenue.vasIncome.label}
            </div>
            <div className="text-2xl font-bold text-slate-800 tracking-tight mb-1 font-mono">
              {platformRevenue.vasIncome.value}
            </div>
            <div className="flex items-center text-xs gap-1.5 font-medium">
              <span className="text-slate-400">环比</span>
              <span
                className={`inline-flex items-center gap-0.5 font-semibold ${
                  platformRevenue.vasIncome.isUp ? 'text-red-500' : 'text-emerald-600'
                }`}
              >
                <span>{platformRevenue.vasIncome.isUp ? '↑' : '↓'}</span>
                <span>{platformRevenue.vasIncome.momText}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
