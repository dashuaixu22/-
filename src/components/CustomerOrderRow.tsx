import React from 'react';
import { TimeRangeType } from '../types';
import { CUSTOMER_DATA_BY_RANGE, ORDER_DATA_BY_RANGE } from '../data/mockData';
import { Users, ClipboardList } from 'lucide-react';

interface CustomerOrderRowProps {
  timeRange: TimeRangeType;
}

interface MetricDisplayProps {
  label: string;
  value: string;
  momText: string;
  isUp: boolean;
  idPrefix: string;
}

const MetricDisplay: React.FC<MetricDisplayProps> = ({
  label,
  value,
  momText,
  isUp,
  idPrefix,
}) => {
  return (
    <div id={`${idPrefix}-metric`} className="flex-1">
      <div className="text-xs text-slate-500 font-medium mb-1">{label}</div>
      <div className="text-2xl font-bold text-slate-800 tracking-tight mb-1 font-sans">
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

export const CustomerOrderRow: React.FC<CustomerOrderRowProps> = ({ timeRange }) => {
  const customerData = CUSTOMER_DATA_BY_RANGE[timeRange];
  const orderData = ORDER_DATA_BY_RANGE[timeRange];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 客户模块 */}
      <div
        id="card-customer-overview"
        className="bg-white rounded-lg border border-slate-200 py-3.5 px-4.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
      >
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
          <h2 className="text-[13.5px] font-bold text-slate-800 tracking-wide flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-600" />
            <span>{customerData.title}</span>
          </h2>
        </div>
        <div className="flex items-center justify-between divide-x divide-slate-100">
          <div className="pr-5 flex-1">
            <MetricDisplay
              idPrefix="cust-total"
              label={customerData.metrics[0].label}
              value={customerData.metrics[0].value}
              momText={customerData.metrics[0].momText}
              isUp={customerData.metrics[0].isUp}
            />
          </div>
          <div className="pl-5 flex-1">
            <MetricDisplay
              idPrefix="cust-new"
              label={customerData.metrics[1].label}
              value={customerData.metrics[1].value}
              momText={customerData.metrics[1].momText}
              isUp={customerData.metrics[1].isUp}
            />
          </div>
        </div>
      </div>

      {/* 订单模块 */}
      <div
        id="card-order-overview"
        className="bg-white rounded-lg border border-slate-200 py-3.5 px-4.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
      >
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
          <h2 className="text-[13.5px] font-bold text-slate-800 tracking-wide flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4 text-blue-600" />
            <span>{orderData.title}</span>
          </h2>
        </div>
        <div className="flex items-center justify-between divide-x divide-slate-100">
          <div className="pr-5 flex-1">
            <MetricDisplay
              idPrefix="order-basic"
              label={orderData.metrics[0].label}
              value={orderData.metrics[0].value}
              momText={orderData.metrics[0].momText}
              isUp={orderData.metrics[0].isUp}
            />
          </div>
          <div className="pl-5 flex-1">
            <MetricDisplay
              idPrefix="order-vas"
              label={orderData.metrics[1].label}
              value={orderData.metrics[1].value}
              momText={orderData.metrics[1].momText}
              isUp={orderData.metrics[1].isUp}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
