import React from 'react';
import { TimeRangeType } from '../types';
import { TRANSACTION_DATA_BY_RANGE, INCOME_DATA_BY_RANGE } from '../data/mockData';
import { ArrowLeftRight, TrendingUp } from 'lucide-react';

interface TransactionIncomeRowProps {
  timeRange: TimeRangeType;
}

interface MetricDisplayProps {
  label: string;
  value: string;
  momText: string;
  isUp: boolean;
  idPrefix: string;
  badgeLabel?: string;
}

const MetricDisplay: React.FC<MetricDisplayProps> = ({
  label,
  value,
  momText,
  isUp,
  idPrefix,
  badgeLabel,
}) => {
  return (
    <div id={`${idPrefix}-metric`} className="flex-1">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-xs text-slate-500 font-medium">{label}</span>
        {badgeLabel && (
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-normal">
            {badgeLabel}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-800 tracking-tight mb-1 font-mono">
        {value}
      </div>
      <div className="flex items-center text-xs gap-1.5 font-medium">
        <span className="text-slate-400">环比</span>
        <span
          className={`inline-flex items-center gap-0.5 font-semibold ${
            isUp ? 'text-red-500' : 'text-emerald-600'
          }`}
        >
          <span>{isUp ? '↑' : '↓'}</span>
          <span>{momText}</span>
        </span>
      </div>
    </div>
  );
};

export const TransactionIncomeRow: React.FC<TransactionIncomeRowProps> = ({ timeRange }) => {
  const transactionData = TRANSACTION_DATA_BY_RANGE[timeRange];
  const incomeData = INCOME_DATA_BY_RANGE[timeRange];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 交易模块 (平台流水) */}
      <div
        id="card-transaction-overview"
        className="bg-white rounded-lg border border-slate-200 py-3.5 px-4.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
      >
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
          <h2 className="text-[13.5px] font-bold text-slate-800 tracking-wide flex items-center gap-1.5">
            <ArrowLeftRight className="w-4 h-4 text-blue-600" />
            <span>{transactionData.title}</span>
          </h2>
        </div>
        <div className="flex items-center justify-between divide-x divide-slate-100">
          <div className="pr-5 flex-1">
            <MetricDisplay
              idPrefix="tx-basic"
              label={transactionData.metrics[0].label}
              value={transactionData.metrics[0].value}
              momText={transactionData.metrics[0].momText}
              isUp={transactionData.metrics[0].isUp}
            />
          </div>
          <div className="pl-5 flex-1">
            <MetricDisplay
              idPrefix="tx-vas"
              label={transactionData.metrics[1].label}
              value={transactionData.metrics[1].value}
              momText={transactionData.metrics[1].momText}
              isUp={transactionData.metrics[1].isUp}
            />
          </div>
        </div>
      </div>

      {/* 收入模块 (运营端实际收入) */}
      <div
        id="card-income-overview"
        className="bg-white rounded-lg border border-slate-200 py-3.5 px-4.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
      >
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
          <h2 className="text-[13.5px] font-bold text-slate-800 tracking-wide flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>{incomeData.title}</span>
          </h2>
        </div>
        <div className="flex items-center justify-between divide-x divide-slate-100">
          <div className="pr-5 flex-1">
            <MetricDisplay
              idPrefix="inc-match"
              label={incomeData.metrics[0].label}
              value={incomeData.metrics[0].value}
              momText={incomeData.metrics[0].momText}
              isUp={incomeData.metrics[0].isUp}
            />
          </div>
          <div className="pl-5 flex-1">
            <MetricDisplay
              idPrefix="inc-vas"
              label={incomeData.metrics[1].label}
              value={incomeData.metrics[1].value}
              momText={incomeData.metrics[1].momText}
              isUp={incomeData.metrics[1].isUp}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
