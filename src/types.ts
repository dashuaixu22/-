import React from 'react';

export type PresetTimeRangeType = 'year' | 'month' | 'week' | 'today';
export type TimeRangeType = PresetTimeRangeType | 'custom';

export interface MenuItem {
  key: string;
  label: string;
}

export interface MenuItemConfig {
  key: string;
  label: string;
  icon?: React.FC<{ className?: string }>;
  children?: MenuItemConfig[];
}

export interface MetricItem {
  label: string;
  value: string;
  prefix?: string;
  suffix?: string;
  momText: string;
  isUp: boolean;
}

export interface SectionOverviewData {
  title: string;
  metrics: [MetricItem, MetricItem];
}

export interface FunnelData {
  signedCount: number;
  orderedCount: number;
  conversionRate: number;
}

export interface ChartDataItem {
  name: string;
  fullName?: string;
  value: number;
}

export interface LineChartPoint {
  month: string;
  rate: number; // percentage, e.g. 12.4
}

// 增值服务订单相关类型
export interface VasOrderCategoryItem {
  name: string;
  count: number;
  ratio?: string;
}

export interface VasOrderNewMetrics {
  totalNewCount: number;
  momRate: string;
  isUp: boolean;
  categoryBreakdown: VasOrderCategoryItem[];
  barData: { name: string; value: number }[];
  pieData: { name: string; value: number }[];
}

// 增值订单查询记录模型
export interface VasOrderRecord {
  id: string; // 订单编号
  supplierName: string; // 供应商名称
  supplierCode: string; // 供应商编号 (信用代码)
  supplierType: string; // 供应商类别
  vasCategory: string; // 增值服务类别
  startTime: string; // 订单创建时间
  endTime: string; // 订单结束时间
  amount: number; // 金额
  status: '履约中' | '已完成' | '待生效' | '已取消' | '已退订'; // 状态
  contactPerson?: string;
  contactPhone?: string;
  remark?: string;
}

// 供应商查询记录模型
export interface SupplierRecord {
  id: string; // 内部ID
  supplierCode: string; // 供应商编号
  creditCode?: string; // 统一社会信用代码
  supplierName: string; // 供应商名称
  supplierType: '智能体供应商' | '算力供应商' | string; // 供应商类型
  productCategory?: string; // 产商品类别
  contractDate?: string; // 签约时间 (兼容)
  createTime?: string; // 创建时间 (YYYY-MM-DD)
  basicOrderCount: number; // 供需交易订单数
  basicOrderAmount: number; // 供需交易总金额 (万元)
  vasOrderCount?: number; // 增值服务订单数
  vasOrderAmount?: number; // 增值服务金额 (万元)
  lastTxDate: string; // 最近交易时间 (YYYY-MM-DD HH:mm)
  contactPerson?: string;
  contactPhone?: string;
  legalRepresentative?: string;
  registeredCapital?: string;
  registeredAddress?: string;
  statusCode?: string; // 状态码
  statusName?: string; // 转换后的状态名称
  serviceStatus?: '正常合作' | '待审核' | '已暂停' | string;
}

// 供应商销售订单查询记录模型
export interface SupplierSalesOrderRecord {
  id: string; // 内部ID
  orderId: string; // 订单编号
  orderBusinessType?: '智能体' | '算力' | '模型'; // 订单业务类型
  supplierName: string; // 供应商名称 (模型订单为 "—")
  supplierCode: string; // 供应商编号 (模型订单为 "—")
  customerName: string; // 需求方名称 (智能体订单无数据时为 "—")
  customerCode: string; // 需求方编号
  serviceCategory: string; // 产品类别 (保留算力、模型、智能体三类)
  productName: string; // 产品名称
  orderAmount: number; // 订单总金额 (元)
  paidAmount?: number; // 实付金额 (元)
  paidTime?: string; // 支付时间
  commissionAmount?: number; // 佣金金额 (元)
  commissionRate?: string; // 佣金比例
  status: '履约中' | '已完成' | '已支付' | '待支付' | '已取消'; // 订单状态
  orderTime: string; // 下单时间 (YYYY-MM-DD HH:mm:ss)
  endTime?: string; // 结束时间 (YYYY-MM-DD HH:mm:ss)
  billingPeriod?: string; // 计费周期/计费方式
  specifications?: string; // 规格配置
  remark?: string;
}

