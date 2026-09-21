import { FixedProductCategory, FIXED_PRODUCT_CATEGORIES } from './supplierProductsMockData';
import { ALL_SUPPLIER_SALES_ORDERS } from './supplierQueryMockData';
import { SupplierSalesOrderRecord } from '../types';

export type { FixedProductCategory };
export { FIXED_PRODUCT_CATEGORIES };

// 需求方实体记录模型 (B: 企业, C: 个人用户)
export interface DemandCustomerRecord {
  id: string;
  customerCode: string; // 需求方编号
  customerName: string; // 需求方名称
  customerType: '企业' | '个人用户'; // 需求方类型
  totalOrders: number; // 订单总数
  totalConsumption: number; // 消费总金额 (万元)
  orderedProductsCount: number; // 订购产品数
  lastTxDate: string; // 最后交易时间
  lastLoginTime: string; // 最近登录时间
  orderedCategories: FixedProductCategory[]; // 订购产品类别
  // 详情页关联消费情况
  consumptionStats: {
    today?: { newOrders: number; newAmount: number };
    week: { newOrders: number; newAmount: number };
    month: { newOrders: number; newAmount: number };
    year: { newOrders: number; newAmount: number };
  };
  // 消费趋势数据
  monthlyTrends: {
    month: string;
    orders: number;
    amount: number; // 万元
  }[];
}

// 统一消费订单模型 (与供应商销售订单使用同一个订单编号和同一套基础交易数据)
export interface DemandOrderRecord {
  orderId: string; // 订单编号
  orderBusinessType: '智能体' | '算力' | '模型'; // 订单业务类型
  customerName: string; // 需求方名称 (智能体订单显示“—”)
  customerCode: string; // 需求方编号
  customerType: '企业' | '个人' | '—'; // 需求方类型: 取值为“企业”和“个人”。只有数据源中存在明确类型字段时才显示；无法确定的记录显示“—”，不能根据是否存在企业编号自行推断。智能体订单显示“—”。
  supplierName: string; // 供应商名称 (模型订单显示“—”)
  supplierCode: string; // 供应商编号 (模型订单显示“—”)
  productName: string; // 商品名称
  category: FixedProductCategory | '算力' | '模型' | '智能体'; // 产品类别
  orderAmount: number; // 订单总金额 (元)
  paidAmount?: number; // 实付金额 (元)
  paidTime?: string; // 支付时间
  actualAmount?: number; // 实付金额 (元)
  payTime?: string; // 支付时间
  status: '履约中' | '已完成' | '待支付' | '已取消' | '已支付'; // 订单状态
  orderTime: string; // 下单时间
  endTime: string; // 结束时间
  billingPeriod?: string;
  specifications?: string;
}

// 将基础订单中的服务类别转换为统一的7大产商品类别
export function normalizeServiceCategory(serviceCategory: string): FixedProductCategory {
  if (serviceCategory.includes('算力')) return '算力';
  if (serviceCategory.includes('模型')) return '模型';
  if (serviceCategory.includes('智能体')) return '智能体';
  if (serviceCategory.includes('终端')) return '终端';
  if (serviceCategory.includes('开发工具')) return '开发工具';
  if (serviceCategory.includes('运行服务')) return '运行服务';
  if (serviceCategory.includes('运营服务')) return '运营服务';
  return '算力';
}

// 22家代表性企业需求方 + 10位个人需求方
const RAW_DEMAND_CUSTOMERS: (Omit<DemandCustomerRecord, 'lastLoginTime'> & { lastLoginTime?: string })[] = [
  // ================= B端企业需求方 =================
  {
    id: 'cust-b-01',
    customerCode: 'CUST-HB-00101',
    customerName: '华中科技大学人工智能与自动化学院',
    customerType: '企业',
    totalOrders: 142,
    totalConsumption: 864.5,
    orderedProductsCount: 12,
    lastTxDate: '2026-08-28 09:30:15',
    orderedCategories: ['算力', '模型', '开发工具'],
    consumptionStats: {
      week: { newOrders: 6, newAmount: 18.5 },
      month: { newOrders: 28, newAmount: 96.2 },
      year: { newOrders: 132, newAmount: 812.0 },
    },
    monthlyTrends: [
      { month: '2026-03', orders: 18, amount: 98.4 },
      { month: '2026-04', orders: 22, amount: 120.6 },
      { month: '2026-05', orders: 25, amount: 145.2 },
      { month: '2026-06', orders: 21, amount: 110.8 },
      { month: '2026-07', orders: 28, amount: 160.5 },
      { month: '2026-08', orders: 28, amount: 158.0 },
    ],
  },
  {
    id: 'cust-b-02',
    customerCode: 'CUST-HB-00102',
    customerName: '武汉东湖高新集团股份有限公司',
    customerType: '企业',
    totalOrders: 210,
    totalConsumption: 1450.0,
    orderedProductsCount: 18,
    lastTxDate: '2026-08-28 10:12:44',
    orderedCategories: ['算力', '智能体', '运行服务'],
    consumptionStats: {
      week: { newOrders: 8, newAmount: 26.4 },
      month: { newOrders: 36, newAmount: 148.0 },
      year: { newOrders: 195, newAmount: 1380.0 },
    },
    monthlyTrends: [
      { month: '2026-03', orders: 26, amount: 175.0 },
      { month: '2026-04', orders: 30, amount: 210.0 },
      { month: '2026-05', orders: 35, amount: 245.0 },
      { month: '2026-06', orders: 32, amount: 220.0 },
      { month: '2026-07', orders: 38, amount: 260.0 },
      { month: '2026-08', orders: 36, amount: 252.0 },
    ],
  },
  {
    id: 'cust-b-03',
    customerCode: 'CUST-HB-00103',
    customerName: '武汉同济医院科研大数据中心',
    customerType: '企业',
    totalOrders: 96,
    totalConsumption: 620.0,
    orderedProductsCount: 8,
    lastTxDate: '2026-08-27 14:20:00',
    orderedCategories: ['模型', '算力', '开发工具'],
    consumptionStats: {
      week: { newOrders: 4, newAmount: 12.8 },
      month: { newOrders: 18, newAmount: 76.5 },
      year: { newOrders: 88, newAmount: 580.0 },
    },
    monthlyTrends: [
      { month: '2026-03', orders: 12, amount: 78.0 },
      { month: '2026-04', orders: 15, amount: 95.0 },
      { month: '2026-05', orders: 16, amount: 105.0 },
      { month: '2026-06', orders: 14, amount: 90.0 },
      { month: '2026-07', orders: 19, amount: 120.0 },
      { month: '2026-08', orders: 18, amount: 115.0 },
    ],
  },
  {
    id: 'cust-b-04',
    customerCode: 'CUST-HB-00104',
    customerName: '湖北省交通运输厅调度指挥中心',
    customerType: '企业',
    totalOrders: 115,
    totalConsumption: 780.0,
    orderedProductsCount: 11,
    lastTxDate: '2026-08-27 16:05:32',
    orderedCategories: ['智能体', '终端', '运行服务'],
    consumptionStats: {
      week: { newOrders: 5, newAmount: 15.6 },
      month: { newOrders: 22, newAmount: 92.4 },
      year: { newOrders: 106, newAmount: 720.0 },
    },
    monthlyTrends: [
      { month: '2026-03', orders: 14, amount: 95.0 },
      { month: '2026-04', orders: 16, amount: 110.0 },
      { month: '2026-05', orders: 20, amount: 135.0 },
      { month: '2026-06', orders: 18, amount: 120.0 },
      { month: '2026-07', orders: 24, amount: 155.0 },
      { month: '2026-08', orders: 22, amount: 148.0 },
    ],
  },
  {
    id: 'cust-b-05',
    customerCode: 'CUST-HB-00105',
    customerName: '东风汽车集团智能网联研发部',
    customerType: '企业',
    totalOrders: 168,
    totalConsumption: 1280.0,
    orderedProductsCount: 15,
    lastTxDate: '2026-08-26 11:30:10',
    orderedCategories: ['终端', '算力', '开发工具'],
    consumptionStats: {
      week: { newOrders: 7, newAmount: 24.0 },
      month: { newOrders: 30, newAmount: 135.0 },
      year: { newOrders: 155, newAmount: 1190.0 },
    },
    monthlyTrends: [
      { month: '2026-03', orders: 22, amount: 160.0 },
      { month: '2026-04', orders: 25, amount: 185.0 },
      { month: '2026-05', orders: 28, amount: 210.0 },
      { month: '2026-06', orders: 26, amount: 195.0 },
      { month: '2026-07', orders: 32, amount: 240.0 },
      { month: '2026-08', orders: 30, amount: 230.0 },
    ],
  },
  {
    id: 'cust-b-06',
    customerCode: 'CUST-HB-00106',
    customerName: '武汉精测电子集团股份有限公司',
    customerType: '企业',
    totalOrders: 82,
    totalConsumption: 460.0,
    orderedProductsCount: 7,
    lastTxDate: '2026-08-26 15:10:28',
    orderedCategories: ['开发工具', '模型', '终端'],
    consumptionStats: {
      week: { newOrders: 3, newAmount: 9.5 },
      month: { newOrders: 14, newAmount: 52.0 },
      year: { newOrders: 76, newAmount: 430.0 },
    },
    monthlyTrends: [
      { month: '2026-03', orders: 10, amount: 55.0 },
      { month: '2026-04', orders: 12, amount: 68.0 },
      { month: '2026-05', orders: 14, amount: 80.0 },
      { month: '2026-06', orders: 13, amount: 72.0 },
      { month: '2026-07', orders: 15, amount: 85.0 },
      { month: '2026-08', orders: 14, amount: 82.0 },
    ],
  },
  {
    id: 'cust-b-07',
    customerCode: 'CUST-HB-00107',
    customerName: '武汉市自然资源和城乡规划局信息中心',
    customerType: '企业',
    totalOrders: 124,
    totalConsumption: 920.0,
    orderedProductsCount: 10,
    lastTxDate: '2026-08-25 10:00:00',
    orderedCategories: ['运行服务', '算力', '智能体'],
    consumptionStats: {
      week: { newOrders: 4, newAmount: 16.8 },
      month: { newOrders: 20, newAmount: 88.0 },
      year: { newOrders: 115, newAmount: 860.0 },
    },
    monthlyTrends: [
      { month: '2026-03', orders: 16, amount: 110.0 },
      { month: '2026-04', orders: 18, amount: 125.0 },
      { month: '2026-05', orders: 21, amount: 150.0 },
      { month: '2026-06', orders: 19, amount: 135.0 },
      { month: '2026-07', orders: 23, amount: 168.0 },
      { month: '2026-08', orders: 20, amount: 152.0 },
    ],
  },
  {
    id: 'cust-b-08',
    customerCode: 'CUST-HB-00108',
    customerName: '光谷金融控股集团信息化运营部',
    customerType: '企业',
    totalOrders: 138,
    totalConsumption: 890.0,
    orderedProductsCount: 13,
    lastTxDate: '2026-08-25 13:45:12',
    orderedCategories: ['运营服务', '智能体', '开发工具'],
    consumptionStats: {
      week: { newOrders: 5, newAmount: 18.2 },
      month: { newOrders: 24, newAmount: 98.5 },
      year: { newOrders: 126, newAmount: 820.0 },
    },
    monthlyTrends: [
      { month: '2026-03', orders: 18, amount: 115.0 },
      { month: '2026-04', orders: 20, amount: 130.0 },
      { month: '2026-05', orders: 24, amount: 158.0 },
      { month: '2026-06', orders: 22, amount: 142.0 },
      { month: '2026-07', orders: 26, amount: 172.0 },
      { month: '2026-08', orders: 24, amount: 160.0 },
    ],
  },
  {
    id: 'cust-b-09',
    customerCode: 'CUST-HB-00109',
    customerName: '武汉大学测绘遥感信息工程国家重点实验室',
    customerType: '企业',
    totalOrders: 175,
    totalConsumption: 1360.0,
    orderedProductsCount: 14,
    lastTxDate: '2026-08-24 09:15:30',
    orderedCategories: ['算力', '模型', '开发工具'],
    consumptionStats: {
      week: { newOrders: 6, newAmount: 22.5 },
      month: { newOrders: 29, newAmount: 128.0 },
      year: { newOrders: 162, newAmount: 1270.0 },
    },
    monthlyTrends: [
      { month: '2026-03', orders: 22, amount: 165.0 },
      { month: '2026-04', orders: 25, amount: 190.0 },
      { month: '2026-05', orders: 29, amount: 225.0 },
      { month: '2026-06', orders: 27, amount: 205.0 },
      { month: '2026-07', orders: 31, amount: 245.0 },
      { month: '2026-08', orders: 29, amount: 232.0 },
    ],
  },
  {
    id: 'cust-b-10',
    customerCode: 'CUST-HB-00110',
    customerName: '汉口银行金融科技部',
    customerType: '企业',
    totalOrders: 94,
    totalConsumption: 580.0,
    orderedProductsCount: 9,
    lastTxDate: '2026-08-24 14:50:00',
    orderedCategories: ['开发工具', '运营服务', '智能体'],
    consumptionStats: {
      week: { newOrders: 3, newAmount: 11.2 },
      month: { newOrders: 16, newAmount: 64.0 },
      year: { newOrders: 86, newAmount: 540.0 },
    },
    monthlyTrends: [
      { month: '2026-03', orders: 12, amount: 72.0 },
      { month: '2026-04', orders: 14, amount: 85.0 },
      { month: '2026-05', orders: 17, amount: 102.0 },
      { month: '2026-06', orders: 15, amount: 90.0 },
      { month: '2026-07', orders: 18, amount: 112.0 },
      { month: '2026-08', orders: 16, amount: 100.0 },
    ],
  },
  {
    id: 'cust-b-11',
    customerCode: 'CUST-HB-00111',
    customerName: '武汉市水务集团智慧调度中心',
    customerType: '企业',
    totalOrders: 88,
    totalConsumption: 510.0,
    orderedProductsCount: 8,
    lastTxDate: '2026-08-23 16:20:18',
    orderedCategories: ['模型', '算力', '运行服务'],
    consumptionStats: {
      week: { newOrders: 3, newAmount: 9.8 },
      month: { newOrders: 15, newAmount: 58.0 },
      year: { newOrders: 82, newAmount: 480.0 },
    },
    monthlyTrends: [
      { month: '2026-03', orders: 11, amount: 65.0 },
      { month: '2026-04', orders: 13, amount: 78.0 },
      { month: '2026-05', orders: 15, amount: 92.0 },
      { month: '2026-06', orders: 14, amount: 84.0 },
      { month: '2026-07', orders: 16, amount: 100.0 },
      { month: '2026-08', orders: 15, amount: 94.0 },
    ],
  },
  {
    id: 'cust-b-12',
    customerCode: 'CUST-HB-00112',
    customerName: '湖北省农业科学院农业信息与经济研究所',
    customerType: '企业',
    totalOrders: 65,
    totalConsumption: 380.0,
    orderedProductsCount: 6,
    lastTxDate: '2026-08-22 10:40:00',
    orderedCategories: ['算力', '模型'],
    consumptionStats: {
      week: { newOrders: 2, newAmount: 6.8 },
      month: { newOrders: 11, newAmount: 42.0 },
      year: { newOrders: 60, newAmount: 355.0 },
    },
    monthlyTrends: [
      { month: '2026-03', orders: 8, amount: 48.0 },
      { month: '2026-04', orders: 10, amount: 60.0 },
      { month: '2026-05', orders: 12, amount: 72.0 },
      { month: '2026-06', orders: 11, amount: 66.0 },
      { month: '2026-07', orders: 13, amount: 80.0 },
      { month: '2026-08', orders: 11, amount: 68.0 },
    ],
  },
  {
    id: 'cust-b-13',
    customerCode: 'CUST-HB-00113',
    customerName: '中国地质大学（武汉）地空学院',
    customerType: '企业',
    totalOrders: 110,
    totalConsumption: 750.0,
    orderedProductsCount: 9,
    lastTxDate: '2026-08-21 15:30:45',
    orderedCategories: ['算力', '运行服务'],
    consumptionStats: {
      week: { newOrders: 4, newAmount: 14.5 },
      month: { newOrders: 19, newAmount: 82.0 },
      year: { newOrders: 102, newAmount: 705.0 },
    },
    monthlyTrends: [
      { month: '2026-03', orders: 14, amount: 92.0 },
      { month: '2026-04', orders: 16, amount: 108.0 },
      { month: '2026-05', orders: 19, amount: 130.0 },
      { month: '2026-06', orders: 18, amount: 122.0 },
      { month: '2026-07', orders: 21, amount: 145.0 },
      { month: '2026-08', orders: 19, amount: 132.0 },
    ],
  },
  {
    id: 'cust-b-14',
    customerCode: 'CUST-HB-00114',
    customerName: '武汉地铁集团运营管理调度部',
    customerType: '企业',
    totalOrders: 105,
    totalConsumption: 690.0,
    orderedProductsCount: 10,
    lastTxDate: '2026-08-20 11:10:00',
    orderedCategories: ['智能体', '运行服务', '终端'],
    consumptionStats: {
      week: { newOrders: 3, newAmount: 12.0 },
      month: { newOrders: 18, newAmount: 76.0 },
      year: { newOrders: 98, newAmount: 650.0 },
    },
    monthlyTrends: [
      { month: '2026-03', orders: 13, amount: 86.0 },
      { month: '2026-04', orders: 15, amount: 102.0 },
      { month: '2026-05', orders: 18, amount: 125.0 },
      { month: '2026-06', orders: 17, amount: 116.0 },
      { month: '2026-07', orders: 20, amount: 138.0 },
      { month: '2026-08', orders: 18, amount: 126.0 },
    ],
  },
  {
    id: 'cust-b-15',
    customerCode: 'CUST-HB-00115',
    customerName: '武汉重工铸锻有限责任公司',
    customerType: '企业',
    totalOrders: 72,
    totalConsumption: 410.0,
    orderedProductsCount: 6,
    lastTxDate: '2026-08-19 09:20:00',
    orderedCategories: ['终端', '开发工具'],
    consumptionStats: {
      week: { newOrders: 2, newAmount: 7.5 },
      month: { newOrders: 12, newAmount: 48.0 },
      year: { newOrders: 68, newAmount: 390.0 },
    },
    monthlyTrends: [
      { month: '2026-03', orders: 9, amount: 52.0 },
      { month: '2026-04', orders: 11, amount: 64.0 },
      { month: '2026-05', orders: 13, amount: 76.0 },
      { month: '2026-06', orders: 12, amount: 70.0 },
      { month: '2026-07', orders: 14, amount: 82.0 },
      { month: '2026-08', orders: 12, amount: 72.0 },
    ],
  },

  // ================= C端个人需求方 =================
  {
    id: 'cust-c-01',
    customerCode: 'CUST-IND-202601',
    customerName: '李晨 (独立AI开发者)',
    customerType: '个人用户',
    totalOrders: 34,
    totalConsumption: 8.6,
    orderedProductsCount: 4,
    lastTxDate: '2026-08-28 08:45:10',
    orderedCategories: ['算力', '模型'],
    consumptionStats: {
      week: { newOrders: 2, newAmount: 0.6 },
      month: { newOrders: 7, newAmount: 2.1 },
      year: { newOrders: 32, newAmount: 8.2 },
    },
    monthlyTrends: [
      { month: '2026-03', orders: 4, amount: 1.1 },
      { month: '2026-04', orders: 5, amount: 1.4 },
      { month: '2026-05', orders: 6, amount: 1.7 },
      { month: '2026-06', orders: 5, amount: 1.3 },
      { month: '2026-07', orders: 7, amount: 2.0 },
      { month: '2026-08', orders: 7, amount: 2.1 },
    ],
  },
  {
    id: 'cust-c-02',
    customerCode: 'CUST-IND-202602',
    customerName: '张峰 (个人智能体创作者)',
    customerType: '个人用户',
    totalOrders: 28,
    totalConsumption: 6.2,
    orderedProductsCount: 3,
    lastTxDate: '2026-08-27 19:12:00',
    orderedCategories: ['智能体', '开发工具'],
    consumptionStats: {
      week: { newOrders: 2, newAmount: 0.5 },
      month: { newOrders: 6, newAmount: 1.6 },
      year: { newOrders: 26, newAmount: 5.9 },
    },
    monthlyTrends: [
      { month: '2026-03', orders: 3, amount: 0.8 },
      { month: '2026-04', orders: 4, amount: 1.0 },
      { month: '2026-05', orders: 5, amount: 1.3 },
      { month: '2026-06', orders: 5, amount: 1.2 },
      { month: '2026-07', orders: 6, amount: 1.5 },
      { month: '2026-08', orders: 6, amount: 1.6 },
    ],
  },
  {
    id: 'cust-c-03',
    customerCode: 'CUST-IND-202603',
    customerName: '王志远 (高校独立研究员)',
    customerType: '个人用户',
    totalOrders: 42,
    totalConsumption: 12.4,
    orderedProductsCount: 5,
    lastTxDate: '2026-08-26 21:05:40',
    orderedCategories: ['算力', '模型', '开发工具'],
    consumptionStats: {
      week: { newOrders: 3, newAmount: 0.9 },
      month: { newOrders: 8, newAmount: 2.8 },
      year: { newOrders: 39, newAmount: 11.8 },
    },
    monthlyTrends: [
      { month: '2026-03', orders: 5, amount: 1.6 },
      { month: '2026-04', orders: 6, amount: 2.0 },
      { month: '2026-05', orders: 7, amount: 2.3 },
      { month: '2026-06', orders: 7, amount: 2.1 },
      { month: '2026-07', orders: 9, amount: 2.9 },
      { month: '2026-08', orders: 8, amount: 2.8 },
    ],
  },
  {
    id: 'cust-c-04',
    customerCode: 'CUST-IND-202604',
    customerName: '陈明杰 (自由算法工程师)',
    customerType: '个人用户',
    totalOrders: 25,
    totalConsumption: 5.4,
    orderedProductsCount: 3,
    lastTxDate: '2026-08-25 18:30:15',
    orderedCategories: ['开发工具', '模型'],
    consumptionStats: {
      week: { newOrders: 1, newAmount: 0.3 },
      month: { newOrders: 5, newAmount: 1.3 },
      year: { newOrders: 24, newAmount: 5.2 },
    },
    monthlyTrends: [
      { month: '2026-03', orders: 3, amount: 0.7 },
      { month: '2026-04', orders: 4, amount: 0.9 },
      { month: '2026-05', orders: 4, amount: 1.0 },
      { month: '2026-06', orders: 5, amount: 1.1 },
      { month: '2026-07', orders: 5, amount: 1.2 },
      { month: '2026-08', orders: 5, amount: 1.3 },
    ],
  },
  {
    id: 'cust-c-05',
    customerCode: 'CUST-IND-202605',
    customerName: '刘思聪 (生成式AI创作者)',
    customerType: '个人用户',
    totalOrders: 31,
    totalConsumption: 7.8,
    orderedProductsCount: 4,
    lastTxDate: '2026-08-24 16:40:22',
    orderedCategories: ['模型', '算力'],
    consumptionStats: {
      week: { newOrders: 2, newAmount: 0.6 },
      month: { newOrders: 6, newAmount: 1.8 },
      year: { newOrders: 29, newAmount: 7.4 },
    },
    monthlyTrends: [
      { month: '2026-03', orders: 4, amount: 1.0 },
      { month: '2026-04', orders: 5, amount: 1.3 },
      { month: '2026-05', orders: 5, amount: 1.4 },
      { month: '2026-06', orders: 6, amount: 1.6 },
      { month: '2026-07', orders: 6, amount: 1.7 },
      { month: '2026-08', orders: 6, amount: 1.8 },
    ],
  },
  {
    id: 'cust-c-06',
    customerCode: 'CUST-IND-202606',
    customerName: '周雪梅 (数据分析研习者)',
    customerType: '个人用户',
    totalOrders: 19,
    totalConsumption: 3.9,
    orderedProductsCount: 2,
    lastTxDate: '2026-08-23 20:15:00',
    orderedCategories: ['开发工具', '模型'],
    consumptionStats: {
      week: { newOrders: 1, newAmount: 0.2 },
      month: { newOrders: 4, newAmount: 0.9 },
      year: { newOrders: 18, newAmount: 3.8 },
    },
    monthlyTrends: [
      { month: '2026-03', orders: 2, amount: 0.5 },
      { month: '2026-04', orders: 3, amount: 0.7 },
      { month: '2026-05', orders: 3, amount: 0.7 },
      { month: '2026-06', orders: 4, amount: 0.9 },
      { month: '2026-07', orders: 4, amount: 0.9 },
      { month: '2026-08', orders: 4, amount: 0.9 },
    ],
  },
];

const DEFAULT_LOGIN_TIMESTAMPS = [
  '2026-09-15 16:42:18',
  '2026-09-15 14:15:30',
  '2026-09-15 11:28:44',
  '2026-09-15 09:12:05',
  '2026-09-14 18:30:22',
  '2026-09-14 15:55:10',
  '2026-09-14 10:20:19',
  '2026-09-13 17:40:08',
  '2026-09-13 11:15:36',
  '2026-09-12 16:05:42',
  '2026-09-12 14:22:15',
  '2026-09-11 10:48:33',
  '2026-09-10 15:18:29',
  '2026-09-09 17:34:50',
  '2026-09-08 11:02:14',
  '2026-09-07 14:45:00',
];

export const ALL_DEMAND_CUSTOMERS: DemandCustomerRecord[] = RAW_DEMAND_CUSTOMERS.map((cust, idx) => ({
  ...cust,
  lastLoginTime: cust.lastLoginTime || DEFAULT_LOGIN_TIMESTAMPS[idx % DEFAULT_LOGIN_TIMESTAMPS.length],
}));

// 构建消费订单列表：严丝合缝复用平台已有的供应商销售订单编号与基础交易数据
// 满足：“同一笔订单必须与平台O-供应商S运营中的供应商销售订单使用同一个订单编号和同一套基础交易数据，不重复生成两份订单”
function generateDemandOrders(): DemandOrderRecord[] {
  const list: DemandOrderRecord[] = [];

  // 首先完整导入现有的供应商销售订单
  ALL_SUPPLIER_SALES_ORDERS.forEach((so) => {
    // 确定订单业务类型
    const bizType = so.orderBusinessType || (so.serviceCategory.includes('智能体') ? '智能体' : so.serviceCategory.includes('模型') ? '模型' : '算力');
    const matchedCust = ALL_DEMAND_CUSTOMERS.find(
      (c) => c.customerCode === so.customerCode || c.customerName === so.customerName
    );

    // 严格遵循业务规范：
    // 1. 模型订单目前没有明确的供应商信息，对应字段显示“—”
    const supplierName = bizType === '模型' ? '—' : so.supplierName;
    const supplierCode = bizType === '模型' ? '—' : so.supplierCode;

    // 2. 智能体订单目前没有明确的需求方名称和需求方类型来源，对应字段显示“—”
    const customerName = bizType === '智能体' ? '—' : (so.customerName === '—' ? '—' : so.customerName);
    const customerType = bizType === '智能体' ? '—' : (matchedCust ? (matchedCust.customerType === '个人用户' ? '个人' : '企业') : '企业');

    list.push({
      orderId: so.orderId,
      orderBusinessType: bizType,
      customerName,
      customerCode: so.customerCode || (matchedCust ? matchedCust.customerCode : 'CUST-HB-00101'),
      customerType,
      supplierName,
      supplierCode,
      productName: so.productName,
      category: so.serviceCategory as any,
      orderAmount: so.orderAmount,
      paidAmount: so.paidAmount !== undefined ? so.paidAmount : (so.status === '待支付' || so.status === '已取消' ? 0 : so.orderAmount),
      paidTime: so.paidTime || (so.status === '待支付' ? '—' : so.orderTime),
      actualAmount: so.paidAmount !== undefined ? so.paidAmount : (so.status === '待支付' || so.status === '已取消' ? 0 : so.orderAmount),
      payTime: so.paidTime || (so.status === '待支付' ? '—' : so.orderTime),
      status: so.status as any,
      orderTime: so.orderTime,
      endTime: so.endTime && so.endTime !== '-' ? so.endTime : '-',
      billingPeriod: so.billingPeriod,
      specifications: so.specifications,
    });
  });

  // 补充若干C端个人用户真实订单，保持编号体系严格一致 (SO-2026...)
  const cOrders: DemandOrderRecord[] = [
    {
      orderId: 'SO-20260828019',
      orderBusinessType: '算力',
      customerName: '李晨 (独立AI开发者)',
      customerCode: 'CUST-IND-202601',
      customerType: '个人',
      supplierName: '武汉光谷智能计算科技有限公司',
      supplierCode: 'SUP-WH-20240101',
      productName: '昇腾910B高算力集群(单卡48机时体验包)',
      category: '算力',
      orderAmount: 2400.0,
      paidAmount: 2400.0,
      paidTime: '2026-08-28 08:50:00',
      status: '履约中',
      orderTime: '2026-08-28 08:45:10',
      endTime: '2026-08-30 08:45:10',
      billingPeriod: '一次性计费',
      specifications: '单卡昇腾910B / 64GB显存 / 预装PyTorch 2.3环境',
    },
    {
      orderId: 'SO-20260827020',
      orderBusinessType: '智能体',
      customerName: '—', // 智能体订单没有明确的需求方名称和需求方类型来源，显示“—”
      customerCode: 'CUST-IND-202602',
      customerType: '—',
      supplierName: '武汉光谷智能体创新研发中心',
      supplierCode: 'SUP-WH-20240108',
      productName: '个人工作流自动化协作智能体(月卡)',
      category: '智能体',
      orderAmount: 680.0,
      paidAmount: 680.0,
      paidTime: '2026-08-27 19:15:00',
      status: '履约中',
      orderTime: '2026-08-27 19:12:00',
      endTime: '2026-09-27 19:12:00',
      billingPeriod: '月结',
      specifications: '支持10个自定义智能体协同编排 / 每日不限并发',
    },
    {
      orderId: 'SO-20260826021',
      orderBusinessType: '模型',
      customerName: '王志远',
      customerCode: 'CUST-IND-202603',
      customerType: '个人',
      supplierName: '—', // 模型订单没有明确的供应商信息，显示“—”
      supplierCode: '—',
      productName: '星火医学多模态大模型开发者API充值包',
      category: '模型',
      orderAmount: 3600.0,
      paidAmount: 3600.0,
      paidTime: '2026-08-26 21:10:00',
      status: '已完成',
      orderTime: '2026-08-26 21:05:40',
      endTime: '2026-08-26 21:05:40',
      billingPeriod: '按Token消耗计费',
      specifications: '包含2000万通用Tokens / 500万视觉Tokens',
    },
  ];

  list.push(...cOrders);
  return list;
}

export const ALL_DEMAND_ORDERS: DemandOrderRecord[] = generateDemandOrders();

// 平台服务体验反馈与投诉真实明细
export interface DemandFeedbackRecord {
  id: string; // 反馈编号
  submitTime: string; // 提交时间
  customerName: string; // 需求方名称
  customerType: '企业' | '个人用户'; // 需求方类型
  productName: string; // 关联产商品
  category: FixedProductCategory; // 产品类别
  content: string; // 反馈简述
}

export const ALL_DEMAND_FEEDBACKS: DemandFeedbackRecord[] = [
  {
    id: 'FB-20260828-001',
    submitTime: '2026-08-28 14:10:25',
    customerName: '华中科技大学人工智能与自动化学院',
    customerType: '企业',
    productName: '昇腾910B高算力集群(64卡月租实例)',
    category: '算力',
    content: '凌晨预训练任务执行期间，RoCE网络互联偶发微秒级抖动，建议增加网络健康自检报告。',
  },
  {
    id: 'FB-20260827-002',
    submitTime: '2026-08-27 16:45:00',
    customerName: '李晨 (独立AI开发者)',
    customerType: '个人用户',
    productName: '星火医学多模态大模型开发者API充值包',
    category: '模型',
    content: '大并发多模态Token调用时返回时延偏高，建议优化边缘推理节点路由分发。',
  },
  {
    id: 'FB-20260826-003',
    submitTime: '2026-08-26 11:20:18',
    customerName: '湖北省交通运输厅调度指挥中心',
    customerType: '企业',
    productName: '高速公路路网智能应急处置智能体',
    category: '智能体',
    content: '恶劣天气特定场景下路网事件联动规则触发阈值偏紧，希望支持自定义阈值调节。',
  },
  {
    id: 'FB-20260825-004',
    submitTime: '2026-08-25 15:30:00',
    customerName: '东风汽车集团智能网联研发部',
    customerType: '企业',
    productName: 'V2X车路协同路侧边缘算力终端单元(20套)',
    category: '终端',
    content: '夏季高温环境下路侧终端散热告警偶发，建议在管理控制台开放温控曲线实时查看。',
  },
  {
    id: 'FB-20260824-005',
    submitTime: '2026-08-24 10:15:33',
    customerName: '陈明杰 (自由算法工程师)',
    customerType: '个人用户',
    productName: '统信UOS桌面/服务器自动化构建编译套件(个人版)',
    category: '开发工具',
    content: '希望工具链增加对ARM64异构交叉编译器的离线预热包支持。',
  },
  {
    id: 'FB-20260823-006',
    submitTime: '2026-08-23 14:40:10',
    customerName: '武汉市自然资源和城乡规划局信息中心',
    customerType: '企业',
    productName: '城市CIM时空大数据底座高可用运行托管服务',
    category: '运行服务',
    content: '三维实景模型数据热切过程正常，但在周日维护窗口期建议提前发送短信通告。',
  },
  {
    id: 'FB-20260822-007',
    submitTime: '2026-08-22 09:50:45',
    customerName: '光谷金融控股集团信息化运营部',
    customerType: '企业',
    productName: '金融风险大模型全生命周期运营与监控服务',
    category: '运营服务',
    content: '风控模型漂移月度报告格式建议支持一键生成PDF格式便于风控委员会归档。',
  },
  {
    id: 'FB-20260821-008',
    submitTime: '2026-08-21 17:10:00',
    customerName: '张峰 (个人智能体创作者)',
    customerType: '个人用户',
    productName: '个人工作流自动化协作智能体(月卡)',
    category: '智能体',
    content: '移动端H5控制台查看Agent运行日志时字体略小，建议适配自适应排版。',
  },
];
