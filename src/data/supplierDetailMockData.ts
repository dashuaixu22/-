import { SupplierRecord, SupplierSalesOrderRecord, TimeRangeType, VasOrderRecord } from '../types';
import { ALL_SUPPLIER_SALES_ORDERS } from './supplierQueryMockData';
import { ALL_VAS_ORDER_RECORDS } from './vasMockData';

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

export type FixedProductCategoryType = typeof FIXED_PRODUCT_CATEGORIES[number];

// 固定的 10 大平台增值服务类别 (切勿与7大产商品混淆)
export const FIXED_VAS_CATEGORIES = [
  '客户分析服务',
  '营销服务',
  '销售服务',
  '售后服务',
  '维系服务',
  '广告服务',
  '发票代理',
  '产品推荐',
  '会员服务（商户）',
  '产品分析',
] as const;

// 调色板映射：与平台科技蓝/青色调保持一致
export const CATEGORY_COLORS: Record<string, string> = {
  算力: '#1677FF',
  模型: '#00A3E0',
  智能体: '#52C41A',
  终端: '#FA8C16',
  开发工具: '#722ED1',
  运行服务: '#13C2C2',
  运营服务: '#2F54EB',
};

export const VAS_COLORS: Record<string, string> = {
  客户分析服务: '#1677FF',
  营销服务: '#00A3E0',
  销售服务: '#13C2C2',
  售后服务: '#52C41A',
  维系服务: '#FAAD14',
  广告服务: '#FA8C16',
  发票代理: '#722ED1',
  产品推荐: '#EB2F96',
  '会员服务（商户）': '#2F54EB',
  产品分析: '#8C8C8C',
};

// 产商品精简条目类型：包含产商品名称、产商品类别（一级分类）与子类型（二级分类）
export interface SupplierProductItem {
  productName: string;
  category: FixedProductCategoryType;
  subType: string;
}

// 增值服务订单详情类型
export interface SupplierVasOrderItem {
  orderId: string;
  vasCategory: string;
  vasName: string;
  purchaseTime: string;
  amount: number;
  status: '履约中' | '已完成' | '待生效' | '已取消';
  startTime: string;
  endTime: string;
  specifications?: string;
  remark?: string;
}

// 根据供应商生成对应的产商品列表与覆盖范围
export function getSupplierProvidedCategories(supplier: SupplierRecord): FixedProductCategoryType[] {
  const type = supplier.supplierType;
  if (type === '算力') return ['算力', '运行服务'];
  if (type === '模型') return ['模型', '智能体'];
  if (type === '智能体') return ['智能体', '模型'];
  if (type === '终端') return ['终端', '运行服务'];
  if (type === '开发工具') return ['开发工具', '运行服务'];
  if (type === '运行服务') return ['运行服务', '算力'];
  if (type === '运营服务') return ['运营服务'];
  
  // 默认从商品分类或名称推导
  const match = FIXED_PRODUCT_CATEGORIES.find((c) => supplier.supplierName.includes(c) || supplier.productCategory.includes(c));
  return match ? [match] : ['算力'];
}

// 获取该供应商的产商品清单（含一级分类与二级子类型）
export function getSupplierProductsList(supplier: SupplierRecord): SupplierProductItem[] {
  const categories = getSupplierProvidedCategories(supplier);
  const list: SupplierProductItem[] = [];

  categories.forEach((cat) => {
    if (cat === '算力') {
      list.push(
        { productName: '昇腾910B 高性能AI训练集群算力节点', category: '算力', subType: 'AI训练集群' },
        { productName: '鲲鹏920 通用密集计算型云服务器实例', category: '算力', subType: '通用计算实例' },
        { productName: '异构GPU分布式推理加速节点集群', category: '算力', subType: '分布式推理集群' },
        { productName: '浸没式相变液冷超算算力单元机时', category: '算力', subType: '超算机时' }
      );
    } else if (cat === '模型') {
      list.push(
        { productName: '城市供水管网泄漏预测时序认知大模型', category: '模型', subType: '时序认知模型' },
        { productName: '工业外观缺陷高精视觉检测多模态大模型', category: '模型', subType: '视觉多模态模型' },
        { productName: '金融智能风控反欺诈推理大模型接口', category: '模型', subType: '风控推理模型' }
      );
    } else if (cat === '智能体') {
      list.push(
        { productName: '城市轨道交通客流动态预测安检调度智能体', category: '智能体', subType: '调度决策智能体' },
        { productName: '电力巡检自主决策与智能派单Agent', category: '智能体', subType: '智能运维Agent' },
        { productName: '企业级全流程智能知识问答助手Agent', category: '智能体', subType: '智能问答Agent' }
      );
    } else if (cat === '终端') {
      list.push(
        { productName: '重载工业机器人激光定位智算终端单元', category: '终端', subType: '工业机器人终端' },
        { productName: 'V2X车路协同路侧边缘算力计算终端', category: '终端', subType: '路侧边缘算力终端' },
        { productName: '工业手持三维扫描激光智算分析终端', category: '终端', subType: '手持智算分析终端' }
      );
    } else if (cat === '开发工具') {
      list.push(
        { productName: '统信UOS桌面/服务器自动化构建编译套件', category: '开发工具', subType: '系统编译构建套件' },
        { productName: '达梦DM8分布式数据库开发调试工具链', category: '开发工具', subType: '数据库开发工具链' },
        { productName: '工业多协议实时解析转换开发中间件', category: '开发工具', subType: '工业协议中间件' }
      );
    } else if (cat === '运行服务') {
      list.push(
        { productName: '城市CIM时空大数据底座高可用运行托管服务', category: '运行服务', subType: '高可用托管服务' },
        { productName: '智算基础设施7×24小时全天候巡检运行保障', category: '运行服务', subType: '巡检运行保障服务' }
      );
    } else if (cat === '运营服务') {
      list.push(
        { productName: '金融风险大模型全生命周期运营与监控服务', category: '运营服务', subType: '模型生命周期运营' },
        { productName: '工业互联网平台数据合规治理与运营服务', category: '运营服务', subType: '数据合规治理运营' },
        { productName: '智能算力商城撮合交易与结算运营服务', category: '运营服务', subType: '平台撮合结算运营' }
      );
    }
  });

  return list;
}

// 获取各类别产商品数量
export function getSupplierCategoryProductCounts(
  products: SupplierProductItem[]
): Record<FixedProductCategoryType, number> {
  const counts: Record<FixedProductCategoryType, number> = {
    算力: 0,
    模型: 0,
    智能体: 0,
    终端: 0,
    开发工具: 0,
    运行服务: 0,
    运营服务: 0,
  };

  products.forEach((p) => {
    if (counts[p.category] !== undefined) {
      counts[p.category]++;
    }
  });

  return counts;
}

// 销售表现数据生成 (根据供应商的基础订单数与金额生成当日、近一周、近一月、近一年与累计)
export function getSupplierSalesPerformance(supplier: SupplierRecord) {
  const baseTotalOrders = Math.max(supplier.basicOrderCount, 12);
  const baseTotalAmount = Math.max(supplier.basicOrderAmount, 48.0);

  return {
    // 供应商新增销售订单数
    newOrders: {
      today: Math.max(1, Math.round(baseTotalOrders * 0.02)),
      week: Math.max(1, Math.round(baseTotalOrders * 0.08)),
      month: Math.max(3, Math.round(baseTotalOrders * 0.32)),
      year: baseTotalOrders,
    },
    // 供应商销售订单总数 (累计)
    totalOrders: baseTotalOrders,
    // 供应商销售金额 (万元)
    salesAmount: {
      today: Number((baseTotalAmount * 0.02).toFixed(1)),
      week: Number((baseTotalAmount * 0.09).toFixed(1)),
      month: Number((baseTotalAmount * 0.35).toFixed(1)),
      year: Number(baseTotalAmount.toFixed(1)),
      total: Number((baseTotalAmount * 1.35).toFixed(1)),
    },
    // 分类销售表现 (七大类别各自的订单数与金额)
    categoryPerformance: {
      today: generateCategoryMetrics(supplier, 0.02),
      week: generateCategoryMetrics(supplier, 0.09),
      month: generateCategoryMetrics(supplier, 0.35),
      year: generateCategoryMetrics(supplier, 1.0),
    },
  };
}

function generateCategoryMetrics(supplier: SupplierRecord, factor: number) {
  const provided = getSupplierProvidedCategories(supplier);
  const primaryCat = provided[0] || '算力';
  const secondaryCat = provided[1];

  const totalOrd = Math.max(1, Math.round(supplier.basicOrderCount * factor));
  const totalAmt = Math.max(1.0, supplier.basicOrderAmount * factor);

  return FIXED_PRODUCT_CATEGORIES.map((cat) => {
    if (cat === primaryCat) {
      const orders = secondaryCat ? Math.round(totalOrd * 0.7) : totalOrd;
      const amount = secondaryCat ? Number((totalAmt * 0.72).toFixed(1)) : Number(totalAmt.toFixed(1));
      return { category: cat, orders, amount };
    } else if (cat === secondaryCat) {
      const orders = Math.max(1, Math.round(totalOrd * 0.3));
      const amount = Number((totalAmt * 0.28).toFixed(1));
      return { category: cat, orders, amount };
    }
    return { category: cat, orders: 0, amount: 0 };
  });
}

// 获取供应商销售订单列表
export function getSupplierSalesOrders(supplier: SupplierRecord): SupplierSalesOrderRecord[] {
  // 先从系统库筛选匹配当前供应商编号或名称的订单
  const matched = ALL_SUPPLIER_SALES_ORDERS.filter(
    (o) => o.supplierCode === supplier.supplierCode || o.supplierName === supplier.supplierName
  );

  if (matched.length >= 3) {
    return matched;
  }

  // 若原有数据不足，基于当前供应商提供真实一致的演示订单
  const products = getSupplierProductsList(supplier);
  const results: SupplierSalesOrderRecord[] = [...matched];

  const templateClients = [
    { name: '武汉大学国家网络安全学院', code: 'CUST-HB-00101' },
    { name: '东风汽车集团智能网联研发部', code: 'CUST-HB-00105' },
    { name: '湖北省农业科学院农业经济研究所', code: 'CUST-HB-00112' },
    { name: '武汉地铁集团运营管理调度部', code: 'CUST-HB-00114' },
    { name: '中国地质大学（武汉）地空学院', code: 'CUST-HB-00113' },
    { name: '汉口银行金融科技部', code: 'CUST-HB-00110' },
  ];

  const statuses: Array<'履约中' | '已完成' | '待支付' | '已取消'> = ['履约中', '已完成', '已完成', '待支付', '履约中'];

  for (let i = matched.length; i < 6; i++) {
    const prod = products[i % products.length] || { productName: '智能计算服务', category: '算力' };
    const client = templateClients[i % templateClients.length];
    const amount = 35000 + (i * 18500);
    const commissionRate = '3.0%';
    const commission = amount * 0.03;

    results.push({
      id: `ord-gen-${supplier.id}-${i}`,
      orderId: `SO-202608${28 - i}0${10 + i}`,
      supplierName: supplier.supplierName,
      supplierCode: supplier.supplierCode,
      customerName: client.name,
      customerCode: client.code,
      serviceCategory: prod.category,
      productName: prod.productName,
      orderAmount: amount,
      commissionAmount: commission,
      commissionRate: commissionRate,
      status: statuses[i % statuses.length],
      orderTime: `2026-08-${28 - i} 14:32:${10 + i * 5}`,
      endTime: `2026-11-${28 - i} 14:32:${10 + i * 5}`,
      billingPeriod: '按季度分期结算',
      specifications: '企业级标准SLA保障 / 专属技术支持',
      remark: '重点产业智能化升级支撑采购',
    });
  }

  return results;
}

// 付费视图数据结构
export function getSupplierVasPerformance(supplier: SupplierRecord) {
  const baseVasOrders = Math.max(supplier.vasOrderCount, 6);
  const baseVasAmount = Math.max(supplier.vasOrderAmount, 12.0);

  return {
    // 增值服务订单数
    vasOrders: {
      today: Math.max(1, Math.round(baseVasOrders * 0.03)),
      week: Math.max(1, Math.round(baseVasOrders * 0.12)),
      month: Math.max(2, Math.round(baseVasOrders * 0.38)),
      year: baseVasOrders,
    },
    // 增值服务累计订单数 (不随时间变化)
    totalVasOrders: Math.round(baseVasOrders * 1.25),
    // 新增消费金额 (万元)
    newVasAmount: {
      today: Number((baseVasAmount * 0.03).toFixed(1)),
      week: Number((baseVasAmount * 0.14).toFixed(1)),
      month: Number((baseVasAmount * 0.42).toFixed(1)),
      year: Number(baseVasAmount.toFixed(1)),
    },
    // 供应商消费总金额 (万元，累计)
    totalVasAmount: Number((baseVasAmount * 1.25).toFixed(1)),
    // 最近一次购买时间
    lastPurchaseTime: supplier.lastTxDate || '2026-08-25 10:11:12',
    // 各时间周期的已购增值服务分类金额
    categoriesData: {
      today: generateVasCategoryData(baseVasAmount * 0.03),
      week: generateVasCategoryData(baseVasAmount * 0.14),
      month: generateVasCategoryData(baseVasAmount * 0.42),
      year: generateVasCategoryData(baseVasAmount),
      total: generateVasCategoryData(baseVasAmount * 1.25),
    },
  };
}

function generateVasCategoryData(totalAmount: number) {
  const ratios = [0.28, 0.22, 0.16, 0.12, 0.08, 0.05, 0.04, 0.03, 0.01, 0.01];
  return FIXED_VAS_CATEGORIES.map((cat, idx) => ({
    name: cat,
    amount: Number((totalAmount * ratios[idx]).toFixed(1)),
  }));
}

// 获取该供应商购买的增值服务订单列表
export function getSupplierVasOrders(supplier: SupplierRecord): SupplierVasOrderItem[] {
  // 查找原系统中属于该供应商名称或代码的订单
  const matched = ALL_VAS_ORDER_RECORDS.filter(
    (o) => o.supplierName === supplier.supplierName || o.supplierCode === supplier.supplierCode || o.supplierCode === supplier.creditCode
  );

  const results: SupplierVasOrderItem[] = matched.map((o) => ({
    orderId: o.id,
    vasCategory: o.vasCategory,
    vasName: o.remark || `${o.vasCategory}专业包`,
    purchaseTime: o.startTime,
    amount: o.amount,
    status: o.status === '待生效' ? '待生效' : o.status === '已完成' ? '已完成' : '履约中',
    startTime: o.startTime,
    endTime: o.endTime,
    specifications: '标准服务包 / 7x24运维支持',
    remark: o.remark,
  }));

  if (results.length >= 3) {
    return results;
  }

  // 补充高真实度增值服务订单
  const vasList = [
    {
      cat: '客户分析服务',
      name: '高性能算力需求精准画像与潜在客户分析月度服务包',
      amount: 42000,
      status: '履约中' as const,
      days: 3,
    },
    {
      cat: '营销服务',
      name: '算力商城首页焦点推荐与全渠道品牌联合推广服务',
      amount: 36000,
      status: '履约中' as const,
      days: 8,
    },
    {
      cat: '销售服务',
      name: '政企大客户算力招投标线索挖掘与销售撮合辅助',
      amount: 28000,
      status: '已完成' as const,
      days: 15,
    },
    {
      cat: '广告服务',
      name: '开屏广告位定向曝光与服务商专区Banner展示',
      amount: 15000,
      status: '已完成' as const,
      days: 22,
    },
    {
      cat: '售后服务',
      name: '企业级VIP专属运维客服与SLA高保障售后绿色通道',
      amount: 20000,
      status: '待生效' as const,
      days: 26,
    },
  ];

  vasList.forEach((item, idx) => {
    results.push({
      orderId: `VAS202608${28 - item.days}-${1000 + idx * 23}`,
      vasCategory: item.cat,
      vasName: item.name,
      purchaseTime: `2026-08-${28 - item.days} 10:15:30`,
      amount: item.amount,
      status: item.status,
      startTime: `2026-08-${28 - item.days} 10:15:30`,
      endTime: `2026-09-${28 - item.days} 10:15:30`,
      specifications: '标准增值服务规格包 / 运营平台专属服务',
      remark: item.name,
    });
  });

  return results;
}
