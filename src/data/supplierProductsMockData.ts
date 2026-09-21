import { ALL_SUPPLIER_RECORDS } from './supplierQueryMockData';
import { SupplierRecord } from '../types';

// 固定的 7 大供应商产商品类别
export const FIXED_PRODUCT_CATEGORIES = [
  '算力',
  '模型',
  '智能体',
  '终端',
  '开发工具',
  '运行服务',
  '运营服务',
] as const;

export type FixedProductCategory = typeof FIXED_PRODUCT_CATEGORIES[number];

// 类别主题颜色映射
export const CATEGORY_COLORS: Record<FixedProductCategory, string> = {
  算力: '#2563EB',     // 科技蓝
  模型: '#0284C7',     // 天空蓝
  智能体: '#10B981',   // 翠绿色
  终端: '#F59E0B',     // 琥珀黄
  开发工具: '#8B5CF6', // 紫色
  运行服务: '#06B6D4', // 青色
  运营服务: '#6366F1', // 靛青色
};

// 供应商及其供应的产商品分类
export interface SupplierOption {
  id: string;
  code: string;
  name: string;
  creditCode: string;
  categories: FixedProductCategory[];
}

// 映射供应商与其提供的产商品类型（严格基于各供应商的主营业务与资质精准生成）
export const SUPPLIER_OPTIONS: SupplierOption[] = ALL_SUPPLIER_RECORDS.map((s) => {
  const categories: FixedProductCategory[] = [];
  const type = s.supplierType;

  if (type === '算力') {
    categories.push('算力', '运行服务');
  } else if (type === '模型') {
    categories.push('模型', '智能体');
  } else if (type === '智能体') {
    categories.push('智能体', '模型');
  } else if (type === '终端') {
    categories.push('终端', '运行服务');
  } else if (type === '开发工具') {
    categories.push('开发工具', '运行服务');
  } else if (type === '运行服务') {
    categories.push('运行服务', '算力');
  } else if (type === '运营服务') {
    categories.push('运营服务');
  } else {
    categories.push('算力');
  }

  // 重点供应商补充其核心能力门类
  if (s.id === '1') {
    // 武汉光谷智能计算科技：算力、运行服务、开发工具
    if (!categories.includes('开发工具')) categories.push('开发工具');
  } else if (s.id === '12') {
    // 武汉人工智能研究院（紫东太初）：模型、智能体、开发工具
    if (!categories.includes('开发工具')) categories.push('开发工具');
  } else if (s.id === '6') {
    // 中国电子云：算力、运行服务
    if (!categories.includes('运行服务')) categories.push('运行服务');
  }

  return {
    id: s.id,
    code: s.supplierCode,
    name: s.supplierName,
    creditCode: s.creditCode,
    categories,
  };
});

// 7大类别的宏观基准数据（用于全平台或单品类宏观基准计算，确保每个指标都严丝合缝、真实可信）
export interface CategoryBenchmark {
  name: FixedProductCategory;
  productCount: number;
  totalOrders: number;
  totalSalesAmount: number; // 万元
  newOrders: {
    today: number;
    week: number;
    month: number;
    year: number;
  };
  salesAmount: {
    today: number;
    week: number;
    month: number;
    year: number;
  };
  subTypes: {
    name: string;
    productCount: number;
    ordersRatio: number;
    salesRatio: number;
  }[];
}

export const PLATFORM_CATEGORY_BENCHMARKS: Record<FixedProductCategory, CategoryBenchmark> = {
  算力: {
    name: '算力',
    productCount: 486,
    totalOrders: 74180,
    totalSalesAmount: 114027.0,
    newOrders: { today: 58, week: 382, month: 1532, year: 17058 },
    salesAmount: { today: 96.5, week: 656.7, month: 2599.0, year: 28204.0 },
    subTypes: [
      { name: 'AI分布式训练集群', productCount: 168, ordersRatio: 0.38, salesRatio: 0.44 },
      { name: '通用密集计算实例', productCount: 142, ordersRatio: 0.32, salesRatio: 0.28 },
      { name: '低延迟推理加速节点', productCount: 88, ordersRatio: 0.16, salesRatio: 0.14 },
      { name: '相变液冷超算机时', productCount: 52, ordersRatio: 0.08, salesRatio: 0.09 },
      { name: '国产GPU异构算力池', productCount: 36, ordersRatio: 0.06, salesRatio: 0.05 },
    ],
  },
  模型: {
    name: '模型',
    productCount: 268,
    totalOrders: 43050,
    totalSalesAmount: 66181.5,
    newOrders: { today: 34, week: 222, month: 889, year: 9901 },
    salesAmount: { today: 56.8, week: 381.2, month: 1508.4, year: 16370.0 },
    subTypes: [
      { name: '时序认知预测大模型', productCount: 82, ordersRatio: 0.31, salesRatio: 0.33 },
      { name: '工业视觉质检大模型', productCount: 64, ordersRatio: 0.25, salesRatio: 0.24 },
      { name: '政务语言认知大模型', productCount: 52, ordersRatio: 0.20, salesRatio: 0.21 },
      { name: '多模态图文生成大模型', productCount: 42, ordersRatio: 0.15, salesRatio: 0.14 },
      { name: '行业垂直决策大模型', productCount: 28, ordersRatio: 0.09, salesRatio: 0.08 },
    ],
  },
  智能体: {
    name: '智能体',
    productCount: 195,
    totalOrders: 29450,
    totalSalesAmount: 45267.0,
    newOrders: { today: 23, week: 152, month: 608, year: 6772 },
    salesAmount: { today: 38.5, week: 260.7, month: 1031.7, year: 11197.0 },
    subTypes: [
      { name: '城市交通动态调度Agent', productCount: 58, ordersRatio: 0.30, salesRatio: 0.32 },
      { name: '智慧园区低空巡检Agent', productCount: 46, ordersRatio: 0.24, salesRatio: 0.23 },
      { name: '金融风控审批决策Agent', productCount: 38, ordersRatio: 0.20, salesRatio: 0.21 },
      { name: '政务智能咨询问答Agent', productCount: 32, ordersRatio: 0.16, salesRatio: 0.15 },
      { name: '工业数字孪生控制Agent', productCount: 21, ordersRatio: 0.10, salesRatio: 0.09 },
    ],
  },
  终端: {
    name: '终端',
    productCount: 132,
    totalOrders: 17900,
    totalSalesAmount: 27504.0,
    newOrders: { today: 14, week: 92, month: 370, year: 4115 },
    salesAmount: { today: 24.2, week: 158.4, month: 626.9, year: 6803.0 },
    subTypes: [
      { name: '车路协同边缘智算终端', productCount: 42, ordersRatio: 0.32, salesRatio: 0.34 },
      { name: '工业物联网高通量网关', productCount: 36, ordersRatio: 0.28, salesRatio: 0.26 },
      { name: '智算工控一体机', productCount: 24, ordersRatio: 0.18, salesRatio: 0.19 },
      { name: '机载低空AI边缘计算盒', productCount: 18, ordersRatio: 0.13, salesRatio: 0.12 },
      { name: '边缘视觉AI感知终端', productCount: 12, ordersRatio: 0.09, salesRatio: 0.09 },
    ],
  },
  开发工具: {
    name: '开发工具',
    productCount: 96,
    totalOrders: 10810,
    totalSalesAmount: 16617.0,
    newOrders: { today: 9, week: 56, month: 223, year: 2486 },
    salesAmount: { today: 14.6, week: 95.7, month: 378.7, year: 4110.0 },
    subTypes: [
      { name: '国产数据库调优调试工具', productCount: 32, ordersRatio: 0.34, salesRatio: 0.36 },
      { name: '工业多协议实时解析中间件', productCount: 26, ordersRatio: 0.27, salesRatio: 0.26 },
      { name: '大模型轻量化量化压缩套件', productCount: 18, ordersRatio: 0.19, salesRatio: 0.18 },
      { name: '算网统一调度API与SDK', productCount: 12, ordersRatio: 0.12, salesRatio: 0.12 },
      { name: '低代码智能体编排开发环境', productCount: 8, ordersRatio: 0.08, salesRatio: 0.08 },
    ],
  },
  运行服务: {
    name: '运行服务',
    productCount: 62,
    totalOrders: 6150,
    totalSalesAmount: 9454.5,
    newOrders: { today: 5, week: 32, month: 127, year: 1414 },
    salesAmount: { today: 8.3, week: 54.5, month: 215.5, year: 2339.0 },
    subTypes: [
      { name: 'CIM底座高可用运行托管', productCount: 20, ordersRatio: 0.33, salesRatio: 0.36 },
      { name: '智算机房7×24小时巡检运维', productCount: 16, ordersRatio: 0.26, salesRatio: 0.25 },
      { name: '容器集群弹性扩容保障', productCount: 12, ordersRatio: 0.19, salesRatio: 0.18 },
      { name: '同城双活容灾与数据冷备', productCount: 8, ordersRatio: 0.13, salesRatio: 0.13 },
      { name: '算网全链路安全态势感知', productCount: 6, ordersRatio: 0.09, salesRatio: 0.08 },
    ],
  },
  运营服务: {
    name: '运营服务',
    productCount: 45,
    totalOrders: 4860,
    totalSalesAmount: 7449.0,
    newOrders: { today: 4, week: 24, month: 101, year: 1114 },
    salesAmount: { today: 6.5, week: 42.8, month: 169.8, year: 1842.0 },
    subTypes: [
      { name: '模型全生命周期合规运营', productCount: 15, ordersRatio: 0.33, salesRatio: 0.34 },
      { name: '算网商城撮合交易与结算运营', productCount: 12, ordersRatio: 0.27, salesRatio: 0.28 },
      { name: '工业数据资产合规治理入表', productCount: 8, ordersRatio: 0.18, salesRatio: 0.17 },
      { name: '跨域算力调度与算力券运营', productCount: 6, ordersRatio: 0.13, salesRatio: 0.12 },
      { name: '算力交易清分多方对账服务', productCount: 4, ordersRatio: 0.09, salesRatio: 0.09 },
    ],
  },
};

// 产商品条目结构
export interface SupplierProductRecord {
  id: string;
  productCode: string;
  productName: string;
  category: FixedProductCategory;
  subType: string;
  supplierId: string;
  supplierName: string;
  supplierCode: string;
  status: '正常在架' | '已下架' | '维护中';
  unitPrice: string;
  deliveryType: string;
  specs: string;
  launchDate: string;
  description: string;
  totalOrders: number; // 累计有效销售订单总数
  totalSalesAmount: number; // 累计销售金额 (万元)
  repeatPurchaseRate?: string; // 累计复购率 (单纯累计值，不随时间变)
  lastTxDate: string; // 最近交易时间
  statsByRange: {
    today: { newOrders: number; salesAmount: number };
    week: { newOrders: number; salesAmount: number };
    month: { newOrders: number; salesAmount: number };
    year: { newOrders: number; salesAmount: number };
  };
  // 详情页关联的最近订单记录
  recentOrders: {
    orderId: string;
    orderDate: string;
    customerName: string;
    specs: string;
    amount: number; // 万元
    status: '履约中' | '已完成' | '待生效';
  }[];
}

interface RawProductRecord extends Omit<SupplierProductRecord, 'statsByRange'> {
  statsByRange: {
    today?: { newOrders: number; salesAmount: number };
    week: { newOrders: number; salesAmount: number };
    month: { newOrders: number; salesAmount: number };
    year: { newOrders: number; salesAmount: number };
  };
}

// 预置详尽的核心产商品展示样例（覆盖重点代表性供应商及7大类）
const BASE_DETAILED_PRODUCTS: RawProductRecord[] = [
  // ================= 1. 算力类 =================
  {
    id: 'prod-001',
    productCode: 'PROD-CP-001',
    productName: '昇腾910B 高性能AI训练集群算力节点',
    category: '算力',
    subType: 'AI分布式训练集群',
    supplierId: '1',
    supplierName: '武汉光谷智能计算科技有限公司',
    supplierCode: 'SUP-WH-20240101',
    status: '正常在架',
    unitPrice: '168.0 元/GPU·小时 (按机时计费)',
    deliveryType: '云端裸金属租用 / 弹性专线直连',
    specs: '8*Ascend 910B 64GB HBM2e, 2TB DDR5, 800Gbps RoCEv2 RDMA高速互联',
    launchDate: '2024-03-20',
    description: '面向千亿级多模态大模型、大规模时序决策模型的分布式深度学习并行预训练与全参数微调任务。',
    totalOrders: 2840,
    totalSalesAmount: 4320.0,
    lastTxDate: '2026-08-28 14:32',
    statsByRange: {
      week: { newOrders: 18, salesAmount: 42.5 },
      month: { newOrders: 76, salesAmount: 182.0 },
      year: { newOrders: 890, salesAmount: 1450.0 },
    },
    recentOrders: [
      { orderId: 'ORD-20260828-091', orderDate: '2026-08-28 14:32', customerName: '武汉智能网联汽车创新中心', specs: '8卡节点*120机时', amount: 20.16, status: '履约中' },
      { orderId: 'ORD-20260825-044', orderDate: '2026-08-25 10:15', customerName: '华中科技大学国家重点实验室', specs: '16卡集群*200机时', amount: 67.2, status: '已完成' },
      { orderId: 'ORD-20260821-018', orderDate: '2026-08-21 16:40', customerName: '烽火通信科技股份有限公司', specs: '8卡节点*80机时', amount: 13.44, status: '已完成' },
    ],
  },
  {
    id: 'prod-002',
    productCode: 'PROD-CP-002',
    productName: '鲲鹏920 通用密集计算型云服务器实例',
    category: '算力',
    subType: '通用密集计算实例',
    supplierId: '2',
    supplierName: '长江计算系统有限公司',
    supplierCode: 'SUP-WH-20240102',
    status: '正常在架',
    unitPrice: '1200.0 元/月·节点',
    deliveryType: '云主机实例 / VPC私有网络接入',
    specs: '64核 ARMv8 Kunpeng 920 2.6GHz, 256GB ECC RAM, 2TB NVMe SSD',
    launchDate: '2024-04-15',
    description: '适用于城市大数据批处理、政务空间底座计算、高并发微服务后端与云原生数据库托管。',
    totalOrders: 3620,
    totalSalesAmount: 3150.0,
    lastTxDate: '2026-08-28 11:20',
    statsByRange: {
      week: { newOrders: 24, salesAmount: 28.8 },
      month: { newOrders: 92, salesAmount: 110.4 },
      year: { newOrders: 1120, salesAmount: 960.0 },
    },
    recentOrders: [
      { orderId: 'ORD-20260828-032', orderDate: '2026-08-28 11:20', customerName: '武汉市水务集团智慧调度中心', specs: '鲲鹏920标准型*20节点/年', amount: 24.0, status: '履约中' },
      { orderId: 'ORD-20260823-087', orderDate: '2026-08-23 09:30', customerName: '东湖高新区政务云运营中心', specs: '密集型节点*30节点/半年', amount: 18.0, status: '已完成' },
    ],
  },
  {
    id: 'prod-003',
    productCode: 'PROD-CP-003',
    productName: '中国电子云信创安全专属云算力节点',
    category: '算力',
    subType: '国产GPU异构算力池',
    supplierId: '6',
    supplierName: '中国电子云数据中心（武汉）有限公司',
    supplierCode: 'SUP-WH-20240106',
    status: '正常在架',
    unitPrice: '145.0 元/机时',
    deliveryType: '国资专网直连 / 等保三级专属算力池',
    specs: '飞腾S2500 64核处理器, 飞腾专用加速引擎, 512GB DDR4, 安全可信TPM2.0',
    launchDate: '2024-05-08',
    description: '面向信创政务系统、金融敏感业务、国企数字化转型提供高等级物理隔离的算力底座。',
    totalOrders: 2150,
    totalSalesAmount: 2460.0,
    lastTxDate: '2026-08-28 10:45',
    statsByRange: {
      week: { newOrders: 14, salesAmount: 20.3 },
      month: { newOrders: 56, salesAmount: 81.2 },
      year: { newOrders: 680, salesAmount: 780.0 },
    },
    recentOrders: [
      { orderId: 'ORD-20260828-011', orderDate: '2026-08-28 10:45', customerName: '武汉市大数据中心', specs: '信创专属云单元*2套', amount: 16.5, status: '履约中' },
    ],
  },
  {
    id: 'prod-004',
    productCode: 'PROD-CP-004',
    productName: '曙光浸没式相变液冷超算算力单元机时',
    category: '算力',
    subType: '相变液冷超算机时',
    supplierId: '11',
    supplierName: '中科曙光信息技术（武汉）有限公司',
    supplierCode: 'SUP-WH-20250111',
    status: '正常在架',
    unitPrice: '210.0 元/超算机时',
    deliveryType: 'SLURM调度作业提交 / 批量任务通道',
    specs: 'PUE ≤ 1.05, 双精度浮点峰值 120 TFLOPS/节点, 全相变无水冷板架构',
    launchDate: '2024-06-01',
    description: '为流体力学气象模拟、分子动力学计算、复杂电磁场求解提供高稳定度超算运算支持。',
    totalOrders: 1250,
    totalSalesAmount: 1860.0,
    lastTxDate: '2026-08-26 15:40',
    statsByRange: {
      week: { newOrders: 8, salesAmount: 16.8 },
      month: { newOrders: 35, salesAmount: 73.5 },
      year: { newOrders: 410, salesAmount: 580.0 },
    },
    recentOrders: [
      { orderId: 'ORD-20260826-056', orderDate: '2026-08-26 15:40', customerName: '长江水利委员会水文局', specs: '流体力学作业*400机时', amount: 8.4, status: '已完成' },
    ],
  },

  // ================= 2. 模型类 =================
  {
    id: 'prod-005',
    productCode: 'PROD-MD-001',
    productName: '城市供水管网泄漏预测时序认知大模型',
    category: '模型',
    subType: '时序认知预测大模型',
    supplierId: '4',
    supplierName: '科大讯飞华中总部（武汉）科技有限公司',
    supplierCode: 'SUP-WH-20240104',
    status: '正常在架',
    unitPrice: '38.0 万元/套 (含1年升级与私有部署)',
    deliveryType: '私有镜像容器交付 / 边缘推理服务包',
    specs: '70B参数混合注意力时序预测架构, 支持10万个传感器点位毫秒级异常捕捉',
    launchDate: '2024-06-18',
    description: '通过管网水压、流量、水质突变反演微小泄漏源头，预测准确率超 96.8%。',
    totalOrders: 380,
    totalSalesAmount: 2150.0,
    lastTxDate: '2026-08-28 10:15',
    statsByRange: {
      week: { newOrders: 4, salesAmount: 38.0 },
      month: { newOrders: 16, salesAmount: 152.0 },
      year: { newOrders: 140, salesAmount: 820.0 },
    },
    recentOrders: [
      { orderId: 'ORD-20260828-024', orderDate: '2026-08-28 10:15', customerName: '武汉水务防汛监测处', specs: '管网预测模型专业版*1套', amount: 38.0, status: '履约中' },
    ],
  },
  {
    id: 'prod-006',
    productCode: 'PROD-MD-002',
    productName: '紫东太初全模态大模型行业微调版本',
    category: '模型',
    subType: '多模态图文生成大模型',
    supplierId: '12',
    supplierName: '武汉人工智能研究院（紫东太初）',
    supplierCode: 'SUP-WH-20250112',
    status: '正常在架',
    unitPrice: '50.0 万元/套',
    deliveryType: '本地化容器镜像部署 / 算网API订阅',
    specs: '图文音三模态融合千亿参数, 支持少样本问答与语义对齐微调',
    launchDate: '2024-07-01',
    description: '支持智能政务问答、司法卷宗归纳剖析、医学病理报告结构化图文多模态推理。',
    totalOrders: 290,
    totalSalesAmount: 2680.0,
    lastTxDate: '2026-08-27 16:30',
    statsByRange: {
      week: { newOrders: 3, salesAmount: 50.0 },
      month: { newOrders: 12, salesAmount: 200.0 },
      year: { newOrders: 110, salesAmount: 980.0 },
    },
    recentOrders: [
      { orderId: 'ORD-20260827-088', orderDate: '2026-08-27 16:30', customerName: '武汉市第一医院信息中心', specs: '全模态医疗版*1套', amount: 50.0, status: '履约中' },
    ],
  },
  {
    id: 'prod-007',
    productCode: 'PROD-MD-003',
    productName: '光通信网络故障自愈与光路径规划认知模型',
    category: '模型',
    subType: '行业垂直决策大模型',
    supplierId: '18',
    supplierName: '武汉烽火集成智算模型技术有限公司',
    supplierCode: 'SUP-WH-20250118',
    status: '正常在架',
    unitPrice: '28.0 万元/套',
    deliveryType: '嵌入式软件引擎 / 网管网元组件',
    specs: '毫秒级光衰耗劣化感知, 自动化拓扑重新路由计算, 准确率 99.4%',
    launchDate: '2024-08-10',
    description: '针对省际骨干网和城域光缆亚健康隐患智能预警并自适应切换冗余光通道。',
    totalOrders: 340,
    totalSalesAmount: 1850.0,
    lastTxDate: '2026-08-25 14:20',
    statsByRange: {
      week: { newOrders: 3, salesAmount: 28.0 },
      month: { newOrders: 10, salesAmount: 84.0 },
      year: { newOrders: 105, salesAmount: 640.0 },
    },
    recentOrders: [
      { orderId: 'ORD-20260825-019', orderDate: '2026-08-25 14:20', customerName: '中国电信湖北分公司网管中心', specs: '光网规划模型*1套', amount: 28.0, status: '已完成' },
    ],
  },

  // ================= 3. 智能体类 =================
  {
    id: 'prod-008',
    productCode: 'PROD-AG-001',
    productName: '城市轨道交通客流动态预测与安检调度智能体',
    category: '智能体',
    subType: '城市交通动态调度Agent',
    supplierId: '8',
    supplierName: '武汉光谷智能体创新研发中心',
    supplierCode: 'SUP-WH-20240108',
    status: '正常在架',
    unitPrice: '8.2 万元/季度',
    deliveryType: '云边协同Agent端到端工作流托管',
    specs: '多智能体自协作协同体系, 全线网400+站点客流峰值预判延迟 < 3秒',
    launchDate: '2024-05-15',
    description: '连接地铁进出闸机感知流与安检机视频流，实现客流激增预警与安检通道弹性增配。',
    totalOrders: 580,
    totalSalesAmount: 1820.0,
    lastTxDate: '2026-08-28 09:20',
    statsByRange: {
      week: { newOrders: 5, salesAmount: 24.6 },
      month: { newOrders: 20, salesAmount: 98.4 },
      year: { newOrders: 180, salesAmount: 620.0 },
    },
    recentOrders: [
      { orderId: 'ORD-20260828-005', orderDate: '2026-08-28 09:20', customerName: '武汉地铁运营有限公司', specs: '轨道客流智能体*1季度', amount: 8.2, status: '履约中' },
    ],
  },
  {
    id: 'prod-009',
    productCode: 'PROD-AG-002',
    productName: '城市防汛排涝数字孪生动态推演智能体',
    category: '智能体',
    subType: '工业数字孪生控制Agent',
    supplierId: '14',
    supplierName: '武汉数字孪生智能体网络创新有限公司',
    supplierCode: 'SUP-WH-20250114',
    status: '正常在架',
    unitPrice: '12.5 万元/年·泵站集群',
    deliveryType: '孪生控制中枢部署 / 水动力推演Agent',
    specs: '支持长江汉江武汉段超标洪水暴雨叠加推演, 泵站闸门联动优化控制',
    launchDate: '2024-06-20',
    description: '结合气象雷达回波与涵闸水力模型，提前2小时自动给出最优排渍抽排策略。',
    totalOrders: 420,
    totalSalesAmount: 1450.0,
    lastTxDate: '2026-08-27 15:10',
    statsByRange: {
      week: { newOrders: 4, salesAmount: 25.0 },
      month: { newOrders: 14, salesAmount: 87.5 },
      year: { newOrders: 130, salesAmount: 510.0 },
    },
    recentOrders: [
      { orderId: 'ORD-20260827-043', orderDate: '2026-08-27 15:10', customerName: '武汉市防汛抗旱指挥部办公室', specs: '防汛孪生Agent*1年', amount: 12.5, status: '已完成' },
    ],
  },
  {
    id: 'prod-010',
    productCode: 'PROD-AG-003',
    productName: '智慧政务市民热线工单智能流转Agent',
    category: '智能体',
    subType: '政务智能咨询问答Agent',
    supplierId: '4',
    supplierName: '科大讯飞华中总部（武汉）科技有限公司',
    supplierCode: 'SUP-WH-20240104',
    status: '正常在架',
    unitPrice: '15.0 万元/套',
    deliveryType: '政务云微服务镜像交付 / 开放API',
    specs: '自然意图解析准确率 98.2%, 12345市民工单秒级智能派发与回访闭环',
    launchDate: '2024-07-15',
    description: '赋能城市便民政务热线，自动提炼诉求要点并分派至对应职能局委办。',
    totalOrders: 460,
    totalSalesAmount: 1680.0,
    lastTxDate: '2026-08-26 11:40',
    statsByRange: {
      week: { newOrders: 4, salesAmount: 30.0 },
      month: { newOrders: 16, salesAmount: 120.0 },
      year: { newOrders: 150, salesAmount: 620.0 },
    },
    recentOrders: [
      { orderId: 'ORD-20260826-077', orderDate: '2026-08-26 11:40', customerName: '武汉市市民热线服务中心', specs: '政务热线智能体*1套', amount: 15.0, status: '已完成' },
    ],
  },

  // ================= 4. 终端类 =================
  {
    id: 'prod-011',
    productCode: 'PROD-TM-001',
    productName: '车路协同5G-V2X路侧超感知边缘智算终端',
    category: '终端',
    subType: '车路协同边缘智算终端',
    supplierId: '9',
    supplierName: '湖北省智能网联终端创新科技有限公司',
    supplierCode: 'SUP-WH-20240109',
    status: '正常在架',
    unitPrice: '4.8 万元/台 (支持全国批量集采)',
    deliveryType: '标准工业硬件成品交付 / 现场调测',
    specs: '64 TOPS INT8端侧算力, 工业级宽温 -40℃~85℃, 支持8路4K高清视频硬件硬解',
    launchDate: '2024-03-25',
    description: '赋能武汉国家智能网联汽车测试区十字路口，融合毫米波雷达与激光点云实时上云。',
    totalOrders: 620,
    totalSalesAmount: 1840.0,
    lastTxDate: '2026-08-28 11:05',
    statsByRange: {
      week: { newOrders: 6, salesAmount: 28.8 },
      month: { newOrders: 24, salesAmount: 115.2 },
      year: { newOrders: 210, salesAmount: 680.0 },
    },
    recentOrders: [
      { orderId: 'ORD-20260828-018', orderDate: '2026-08-28 11:05', customerName: '武汉车网智联科技有限公司', specs: 'V2X路侧终端*5台', amount: 24.0, status: '履约中' },
    ],
  },
  {
    id: 'prod-012',
    productCode: 'PROD-TM-002',
    productName: '重载工业机器人激光定位智算终端',
    category: '终端',
    subType: '智算工控一体机',
    supplierId: '19',
    supplierName: '武汉华工智能装备智算终端有限公司',
    supplierCode: 'SUP-WH-20250119',
    status: '正常在架',
    unitPrice: '7.5 万元/套 (含端侧控制系统)',
    deliveryType: '整机交付 / 产线联调',
    specs: '微米级激光定位纠偏, 3D视觉高速成像, IP67防水防尘工业封装',
    launchDate: '2024-06-10',
    description: '用于重型装备高精度激光切割、三维激光焊接的高实时性端侧智能控制。',
    totalOrders: 480,
    totalSalesAmount: 1560.0,
    lastTxDate: '2026-08-27 14:15',
    statsByRange: {
      week: { newOrders: 3, salesAmount: 22.5 },
      month: { newOrders: 12, salesAmount: 90.0 },
      year: { newOrders: 130, salesAmount: 520.0 },
    },
    recentOrders: [
      { orderId: 'ORD-20260827-062', orderDate: '2026-08-27 14:15', customerName: '武汉重工铸锻有限责任公司', specs: '激光智算终端*2套', amount: 15.0, status: '已完成' },
    ],
  },

  // ================= 5. 开发工具类 =================
  {
    id: 'prod-013',
    productCode: 'PROD-DV-001',
    productName: '达梦DM8分布式数据库开发调试工具链',
    category: '开发工具',
    subType: '国产数据库调优调试工具',
    supplierId: '7',
    supplierName: '武汉达梦数据库股份有限公司',
    supplierCode: 'SUP-WH-20240107',
    status: '正常在架',
    unitPrice: '2.5 万元/套 (包含SQL调优分析模块)',
    deliveryType: '开发者客户端 / IDE插件集成',
    specs: '图形化执行计划剖析、锁阻塞智能排查、大表跨机重分布模拟仿真引擎',
    launchDate: '2024-04-22',
    description: '专为金融核心交易系统与城市政务大并发系统量身打造的国产数据库敏捷开发调试利器。',
    totalOrders: 940,
    totalSalesAmount: 1680.0,
    lastTxDate: '2026-08-28 13:50',
    statsByRange: {
      week: { newOrders: 9, salesAmount: 22.5 },
      month: { newOrders: 32, salesAmount: 80.0 },
      year: { newOrders: 360, salesAmount: 580.0 },
    },
    recentOrders: [
      { orderId: 'ORD-20260828-068', orderDate: '2026-08-28 13:50', customerName: '武汉住房公积金管理中心信息科', specs: 'DM8调试工具高级版*1套', amount: 2.5, status: '已完成' },
    ],
  },
  {
    id: 'prod-014',
    productCode: 'PROD-DV-002',
    productName: '统信UOS桌面/服务器系统开发调试套件',
    category: '开发工具',
    subType: '国产数据库调优调试工具',
    supplierId: '3',
    supplierName: '统信软件技术（武汉）有限公司',
    supplierCode: 'SUP-WH-20240103',
    status: '正常在架',
    unitPrice: '1.8 万元/企业授权包',
    deliveryType: '在线许可授权 / 专用软件仓库接入',
    specs: '跨架构ARM/x86编译链, 核心转储智能诊断, 驱动自动化签名部署',
    launchDate: '2024-05-15',
    description: '支持信创软件一键跨架构迁移适配与深层系统性能分析，提速软硬件适配周期50%以上。',
    totalOrders: 820,
    totalSalesAmount: 1240.0,
    lastTxDate: '2026-08-27 16:45',
    statsByRange: {
      week: { newOrders: 8, salesAmount: 14.4 },
      month: { newOrders: 28, salesAmount: 50.4 },
      year: { newOrders: 310, salesAmount: 420.0 },
    },
    recentOrders: [
      { orderId: 'ORD-20260827-095', orderDate: '2026-08-27 16:45', customerName: '长江鲲鹏生态创新中心', specs: '多架构编译套件*2套', amount: 3.6, status: '已完成' },
    ],
  },
  {
    id: 'prod-015',
    productCode: 'PROD-DV-003',
    productName: '工业多协议实时解析转换开发中间件',
    category: '开发工具',
    subType: '工业多协议实时解析中间件',
    supplierId: '3',
    supplierName: '统信软件技术（武汉）有限公司',
    supplierCode: 'SUP-WH-20240103',
    status: '正常在架',
    unitPrice: '9800.0 元/网关实例',
    deliveryType: '嵌入式C++ SDK / Docker容器镜像',
    specs: '原生支持OPC UA、Modbus TCP、Profinet、IEC61850等50+种工业现场总线零丢失转换',
    launchDate: '2024-06-12',
    description: '攻克制造业异构设备联网通信壁垒，实现工控底层数据一键转换为标准JSON/MQTT时序流。',
    totalOrders: 650,
    totalSalesAmount: 580.0,
    lastTxDate: '2026-08-26 10:20',
    statsByRange: {
      week: { newOrders: 6, salesAmount: 5.88 },
      month: { newOrders: 22, salesAmount: 21.56 },
      year: { newOrders: 240, salesAmount: 210.0 },
    },
    recentOrders: [
      { orderId: 'ORD-20260826-022', orderDate: '2026-08-26 10:20', customerName: '武汉华工激光工程有限责任公司', specs: '协议转换中间件*5实例', amount: 4.9, status: '已完成' },
    ],
  },

  // ================= 6. 运行服务类 =================
  {
    id: 'prod-016',
    productCode: 'PROD-RT-001',
    productName: '城市CIM时空大数据底座高可用运行托管服务',
    category: '运行服务',
    subType: 'CIM底座高可用运行托管',
    supplierId: '10',
    supplierName: '武汉楚天智能运管科技有限公司',
    supplierCode: 'SUP-WH-20240110',
    status: '正常在架',
    unitPrice: '68.0 万元/年度保障',
    deliveryType: '全天候SLA驻场运维 / 灾备演练服务',
    specs: '服务可用性 ≥ 99.99%, RTO < 5分钟, RPO = 0, 涵盖同城双活容灾与自动化负载调度',
    launchDate: '2024-04-01',
    description: '为武汉市自然资源与规划局CIM底座平台提供全生命周期运行状态监控与容灾容错保障。',
    totalOrders: 180,
    totalSalesAmount: 1840.0,
    lastTxDate: '2026-08-27 11:30',
    statsByRange: {
      week: { newOrders: 2, salesAmount: 68.0 },
      month: { newOrders: 6, salesAmount: 204.0 },
      year: { newOrders: 68, salesAmount: 760.0 },
    },
    recentOrders: [
      { orderId: 'ORD-20260827-029', orderDate: '2026-08-27 11:30', customerName: '武汉市自然资源和规划信息中心', specs: '年度高可用托管保障*1期', amount: 68.0, status: '履约中' },
    ],
  },
  {
    id: 'prod-017',
    productCode: 'PROD-RT-002',
    productName: '智算基础设施7×24小时全天候巡检运行保障',
    category: '运行服务',
    subType: '智算机房7×24小时巡检运维',
    supplierId: '1',
    supplierName: '武汉光谷智能计算科技有限公司',
    supplierCode: 'SUP-WH-20240101',
    status: '正常在架',
    unitPrice: '32.0 万元/机房集群·年',
    deliveryType: '专业ITIL认证运维工程师队伍驻场服务',
    specs: '15分钟故障快速到达现场响应, 动环电力/精密空调/网络链路多维度无死角智能值守',
    launchDate: '2024-05-10',
    description: '保障算力中心成套高密度机架、配电与制冷系统连续安全无故障运转。',
    totalOrders: 240,
    totalSalesAmount: 1220.0,
    lastTxDate: '2026-08-25 14:20',
    statsByRange: {
      week: { newOrders: 3, salesAmount: 32.0 },
      month: { newOrders: 8, salesAmount: 96.0 },
      year: { newOrders: 85, salesAmount: 510.0 },
    },
    recentOrders: [
      { orderId: 'ORD-20260825-061', orderDate: '2026-08-25 14:20', customerName: '武汉超算中心运维保障部', specs: '机房全天候巡检保障*1年', amount: 32.0, status: '已完成' },
    ],
  },

  // ================= 7. 运营服务类 =================
  {
    id: 'prod-018',
    productCode: 'PROD-OP-001',
    productName: '金融风险大模型全生命周期运营与监控服务',
    category: '运营服务',
    subType: '模型全生命周期合规运营',
    supplierId: '5',
    supplierName: '武汉数智云链运营服务有限公司',
    supplierCode: 'SUP-WH-20240105',
    status: '正常在架',
    unitPrice: '25.0 万元/年·模型实例',
    deliveryType: '云端持续运营看板 / 定期数据漂移回流迭代',
    specs: '覆盖概念漂移检测、数据偏见校准、对抗样本攻防验证、监管合规归档审计全流程',
    launchDate: '2024-07-20',
    description: '确保生产环境运行的AI大模型推理稳定、符合中国人民银行金融科技伦理规范。',
    totalOrders: 310,
    totalSalesAmount: 1260.0,
    lastTxDate: '2026-08-27 15:10',
    statsByRange: {
      week: { newOrders: 4, salesAmount: 25.0 },
      month: { newOrders: 12, salesAmount: 100.0 },
      year: { newOrders: 95, salesAmount: 480.0 },
    },
    recentOrders: [
      { orderId: 'ORD-20260827-080', orderDate: '2026-08-27 15:10', customerName: '湖北省农村信用社联合社科技部', specs: '模型合规运营监控服务*1年', amount: 25.0, status: '履约中' },
    ],
  },
  {
    id: 'prod-019',
    productCode: 'PROD-OP-002',
    productName: '智能算力商城撮合交易与结算运营服务',
    category: '运营服务',
    subType: '算网商城撮合交易与结算运营',
    supplierId: '13',
    supplierName: '武汉光谷数字产业运营服务有限公司',
    supplierCode: 'SUP-WH-20250113',
    status: '正常在架',
    unitPrice: '18.0 万元/年度基础运营托管',
    deliveryType: '专业清结算运营团队对接 / 资金双向托管支持',
    specs: '支持算力券精准核销、供需双向智能竞价撮合、T+1全自动交易对账与发票核验',
    launchDate: '2024-06-01',
    description: '为区域算网统一市场提供标准化产品上架审核、合同履约跟进与资金多方对账服务。',
    totalOrders: 360,
    totalSalesAmount: 1390.0,
    lastTxDate: '2026-08-28 16:00',
    statsByRange: {
      week: { newOrders: 3, salesAmount: 18.0 },
      month: { newOrders: 11, salesAmount: 72.0 },
      year: { newOrders: 120, salesAmount: 490.0 },
    },
    recentOrders: [
      { orderId: 'ORD-20260828-112', orderDate: '2026-08-28 16:00', customerName: '武汉市经济和信息化局大数据处', specs: '算力商城结算运营*1年', amount: 18.0, status: '履约中' },
    ],
  },
  {
    id: 'prod-020',
    productCode: 'PROD-OP-003',
    productName: '城市数据要素可信流通与智能合约运营服务',
    category: '运营服务',
    subType: '工业数据资产合规治理入表',
    supplierId: '20',
    supplierName: '武汉东湖大数据交易中心股份有限公司',
    supplierCode: 'SUP-WH-20250120',
    status: '正常在架',
    unitPrice: '16.0 万元/年度方案',
    deliveryType: '数据要素流通合规评估 / 入表辅导',
    specs: '符合数据安全法与个人信息保护法要求, 数据脱敏失真率 < 0.1%, 产出合法性审查报告',
    launchDate: '2024-07-25',
    description: '助力武汉规上制造企业摸清工业数据资产底数，完成要素确权登记与可信入表流通。',
    totalOrders: 280,
    totalSalesAmount: 980.0,
    lastTxDate: '2026-08-26 09:15',
    statsByRange: {
      week: { newOrders: 3, salesAmount: 16.0 },
      month: { newOrders: 9, salesAmount: 48.0 },
      year: { newOrders: 90, salesAmount: 360.0 },
    },
    recentOrders: [
      { orderId: 'ORD-20260826-003', orderDate: '2026-08-26 09:15', customerName: '长飞光纤光缆股份有限公司', specs: '数据合规治理运营*1年', amount: 16.0, status: '已完成' },
    ],
  },
];

// 为所有20家供应商自动补全每个覆盖门类的高质量在架产商品
function generateComprehensiveProducts(): SupplierProductRecord[] {
  const result: SupplierProductRecord[] = BASE_DETAILED_PRODUCTS.map((p) => ({
    ...p,
    statsByRange: {
      today: p.statsByRange.today || {
        newOrders: Math.max(1, Math.round(p.statsByRange.week.newOrders * 0.15)),
        salesAmount: Number((p.statsByRange.week.salesAmount * 0.15).toFixed(1)),
      },
      week: p.statsByRange.week,
      month: p.statsByRange.month,
      year: p.statsByRange.year,
    },
  }));
  const coveredSupplierIds = new Set(result.map((p) => p.supplierId));

  // 针对尚未在精选列表中有充足产商品的供应商，按照其主营类别自动生成贴合其实际业务的产商品
  ALL_SUPPLIER_RECORDS.forEach((s) => {
    const opt = SUPPLIER_OPTIONS.find((o) => o.id === s.id);
    if (!opt) return;

    opt.categories.forEach((cat, catIdx) => {
      // 检查当前供应商在该类别下是否已有记录
      const exists = result.some((p) => p.supplierId === s.id && p.category === cat);
      if (!exists) {
        // 生成 1-2 条贴合该供应商背景的产商品记录
        const bench = PLATFORM_CATEGORY_BENCHMARKS[cat];
        const subTypeItem = bench.subTypes[catIdx % bench.subTypes.length];
        const baseAmount = s.basicOrderAmount / (opt.categories.length * 1.5);
        const baseOrders = Math.round(s.basicOrderCount / (opt.categories.length * 1.5));

        const itemCodeNum = 100 + parseInt(s.id) * 3 + catIdx;
        const prefixMap: Record<FixedProductCategory, string> = {
          算力: 'CP',
          模型: 'MD',
          智能体: 'AG',
          终端: 'TM',
          开发工具: 'DV',
          运行服务: 'RT',
          运营服务: 'OP',
        };

        const prodRecord: SupplierProductRecord = {
          id: `prod-gen-${s.id}-${catIdx}`,
          productCode: `PROD-${prefixMap[cat]}-${itemCodeNum}`,
          productName: `${s.supplierName.replace(/(有限公司|股份有限公司|科技|技术)/g, '')}${subTypeItem.name}`,
          category: cat,
          subType: subTypeItem.name,
          supplierId: s.id,
          supplierName: s.supplierName,
          supplierCode: s.supplierCode,
          status: '正常在架',
          unitPrice: `${(baseAmount / Math.max(1, baseOrders)).toFixed(2)} 万元/套`,
          deliveryType: '平台统一调度部署 / SLA协议交付',
          specs: `标准信创认证规范, 适配武汉算力网二级调度协议`,
          launchDate: s.contractDate,
          description: `为区域政企客户提供高可靠的${cat}级产品与技术赋能服务。`,
          totalOrders: baseOrders,
          totalSalesAmount: Number(baseAmount.toFixed(1)),
          lastTxDate: s.lastTxDate,
          statsByRange: {
            today: {
              newOrders: Math.max(1, Math.round(baseOrders * 0.005)),
              salesAmount: Number((baseAmount * 0.006).toFixed(1)),
            },
            week: {
              newOrders: Math.max(1, Math.round(baseOrders * 0.03)),
              salesAmount: Number((baseAmount * 0.035).toFixed(1)),
            },
            month: {
              newOrders: Math.max(2, Math.round(baseOrders * 0.12)),
              salesAmount: Number((baseAmount * 0.13).toFixed(1)),
            },
            year: {
              newOrders: Math.max(5, Math.round(baseOrders * 0.65)),
              salesAmount: Number((baseAmount * 0.7).toFixed(1)),
            },
          },
          recentOrders: [
            {
              orderId: `ORD-${s.id}-${catIdx}-01`,
              orderDate: s.lastTxDate,
              customerName: '武汉城市算网协同单位',
              specs: `${subTypeItem.name}标准包*1期`,
              amount: Number((baseAmount * 0.1).toFixed(1)),
              status: '履约中',
            },
          ],
        };

        result.push(prodRecord);
      }
    });
  });

  return result;
}

export const ALL_SUPPLIER_PRODUCTS: SupplierProductRecord[] = generateComprehensiveProducts();
