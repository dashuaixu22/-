import { ALL_VAS_ORDER_RECORDS } from './vasMockData';
import { PRODUCT_QUALITY_DATA } from './productAnalysisMockData';
import { ALL_SUPPLIER_RECORDS } from './supplierQueryMockData';

// 增值服务10大类别（严格使用系统现有类别）
export const VAS_CATEGORIES = [
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

export type VasCategoryType = (typeof VAS_CATEGORIES)[number];

// 购买当前增值产品的订单明细记录
export interface VasProductOrderItem {
  id: string; // 订单编号
  supplierName: string; // 供应商名称
  supplierCode: string; // 供应商编号或统一社会信用代码
  supplierType: string; // 供应商类别
  orderTime: string; // 下单时间
  amount: number; // 订单金额 (元)
  status: '履约中' | '已完成' | '待生效' | '已取消' | '已退订'; // 订单状态
  contactPerson?: string;
  contactPhone?: string;
  serviceDuration?: string;
  remark?: string;
}

// 增值产品模型
export interface VasProductItem {
  id: string;
  productName: string;
  categoryName: VasCategoryType;
  // 综合评分 (使用现有质量数据)
  rating: number;
  
  // 累计指标
  totalOrders: number; // 订单总数
  totalRevenue: number; // 增值服务总收入 (元)
  
  // 周期指标 (当日 / 周 / 月 / 年)
  metricsByRange: {
    today: {
      newOrders: number;
      newRevenue: number; // 元
    };
    week: {
      newOrders: number;
      newRevenue: number; // 元
    };
    month: {
      newOrders: number;
      newRevenue: number; // 元
    };
    year: {
      newOrders: number;
      newRevenue: number; // 元
    };
  };

  // 销售表现 - 客单价及趋势
  arpuPerformance: {
    arpuValues: {
      today: number;
      week: number;
      month: number;
      year: number;
      total: number;
    };
    // 客单价折线趋势 (today: 当天小时采样; week: 7天; month: 8个采样点; year: 12个月; total: 历史近两年季度)
    trendData: {
      today: { dates: string[]; values: number[] };
      week: { dates: string[]; values: number[] };
      month: { dates: string[]; values: number[] };
      year: { dates: string[]; values: number[] };
      total: { dates: string[]; values: number[] };
    };
    // 客单价增长率及折线趋势
    growthRates: {
      today: { rate: string; isUp: boolean; dates: string[]; values: number[] };
      week: { rate: string; isUp: boolean; dates: string[]; values: number[] };
      month: { rate: string; isUp: boolean; dates: string[]; values: number[] };
      year: { rate: string; isUp: boolean; dates: string[]; values: number[] };
    };
  };

  // 购买情况 - 客户均价与平均订单数
  purchasePerformance: {
    customerAvgPrice: {
      today: number;
      week: number;
      month: number;
      year: number;
    };
    customerAvgOrders: {
      today: number;
      week: number;
      month: number;
      year: number;
    };
  };

  // 使用与质量
  qualityPerformance: {
    rating: number;
    avgDuration: number; // 小时
    usageCount: number; // 万次
    trendDates: string[];
    trendUsage: number[];
  };

  // 购买当前增值产品的供应商及订单列表
  orders: VasProductOrderItem[];
}

// 基础配置：现有增值服务产品按分类组织
const RAW_CATEGORY_PRODUCTS: { category: VasCategoryType; products: string[] }[] = [
  {
    category: '客户分析服务',
    products: [
      '客户画像分析套件',
      '客户流失预测模型',
      '客户算力消费行为洞察',
      '潜客价值评估报告',
    ],
  },
  {
    category: '营销服务',
    products: [
      '精准算力营销推广包',
      '大模型营销获客助手',
      '多渠道联合获客方案',
      '算力优惠券营销投放',
    ],
  },
  {
    category: '销售服务',
    products: [
      '商机智能撮合推荐',
      '智能销售辅助线索包',
      '销售转化加速套件',
      '大客户采购对接服务',
    ],
  },
  {
    category: '售后服务',
    products: [
      '7x24小时专属技术售后支持',
      '专家巡检与故障排查服务',
      'SLA履约保障增强包',
      '模型部署售后调优服务',
    ],
  },
  {
    category: '维系服务',
    products: [
      '客户健康度监控服务',
      '高净值供应商专属顾问服务',
      '客户续约激活关怀包',
      '定期运维巡检回访',
    ],
  },
  {
    category: '广告服务',
    products: [
      '算力商城首页横幅推广位',
      '精准弹窗广告投放',
      '搜索置顶竞价推荐位',
      '行业专题推介展位',
    ],
  },
  {
    category: '发票代理',
    products: [
      '电子发票自动化批量开具',
      '增值税专用发票托管代办',
      '财税合规对账审核服务',
      '发票智能验真系统',
    ],
  },
  {
    category: '产品推荐',
    products: [
      '算力模型智能推荐引擎',
      '终端适配智能选型服务',
      '工具链交叉推荐组件',
      '热销服务置顶推荐',
    ],
  },
  {
    category: '会员服务（商户）',
    products: [
      '企业黄金商户会员权益',
      '钻石供应商专属特权',
      '生态伙伴认证权益包',
      '开发者认证特权通道',
    ],
  },
  {
    category: '产品分析',
    products: [
      '产品运营转化深度分析',
      '算力产品用量热力分析',
      '产品留存与流失归因',
      '竞品价格对标分析报告',
    ],
  },
];

// 获取分类基准质量评分
const getCategoryRating = (categoryName: string): number => {
  const item = PRODUCT_QUALITY_DATA.vasServiceList.find((v) => v.name === categoryName);
  return item ? item.score : 4.85;
};

// 获取分类基准使用时长与次数
const getCategoryQuality = (categoryName: string) => {
  const item = PRODUCT_QUALITY_DATA.vasServiceList.find((v) => v.name === categoryName);
  return {
    duration: item ? item.duration : 45.0,
    usage: item ? item.usageCount : 25.0,
  };
};

// 生成 40 个增值产品的具体数据
export const ALL_VAS_PRODUCTS: VasProductItem[] = (() => {
  const list: VasProductItem[] = [];
  let productIdx = 1;

  RAW_CATEGORY_PRODUCTS.forEach(({ category, products }) => {
    const baseScore = getCategoryRating(category);
    const baseQuality = getCategoryQuality(category);

    products.forEach((productName, pIndex) => {
      const id = `VAS-P-${String(productIdx).padStart(3, '0')}`;
      productIdx++;

      // 为每个产品设定合理的指标差异
      const varianceFactor = 1.0 - (pIndex * 0.15) + ((productIdx % 3) * 0.05);

      // 基准累计订单与收入
      const totalOrders = Math.round(1050 * varianceFactor);
      const totalRevenue = Math.round(totalOrders * (2800 + (pIndex * 350) + (productIdx % 5) * 120));

      // 周期订单与收入
      const todayOrders = Math.max(1, Math.round(totalOrders * 0.0016));
      const todayRevenue = Math.round(todayOrders * (2550 + (pIndex * 280)));

      const weekOrders = Math.max(3, Math.round(totalOrders * 0.008));
      const weekRevenue = Math.round(weekOrders * (2600 + (pIndex * 300)));

      const monthOrders = Math.max(12, Math.round(totalOrders * 0.035));
      const monthRevenue = Math.round(monthOrders * (2750 + (pIndex * 320)));

      const yearOrders = Math.max(60, Math.round(totalOrders * 0.32));
      const yearRevenue = Math.round(yearOrders * (2900 + (pIndex * 340)));

      // 客单价计算
      const todayArpu = Math.round(todayRevenue / todayOrders);
      const weekArpu = Math.round(weekRevenue / weekOrders);
      const monthArpu = Math.round(monthRevenue / monthOrders);
      const yearArpu = Math.round(yearRevenue / yearOrders);
      const totalArpu = Math.round(totalRevenue / totalOrders);

      // 客单价增长率
      const todayRate = Number((0.8 + (productIdx % 3) * 0.3).toFixed(1));
      const weekRate = 2.1 + (productIdx % 4) * 0.4;
      const monthRate = 4.8 + (productIdx % 5) * 0.5;
      const yearRate = 12.5 + (productIdx % 7) * 0.7;

      // 关联订单生成（从现有的真实订单库与供应商库中按分类和产品映射）
      const relatedVasOrders = ALL_VAS_ORDER_RECORDS.filter(
        (o) => o.vasCategory === category
      );

      const productOrders: VasProductOrderItem[] = [];
      
      // 取相关订单或补充构建 5~8 条真实订单
      const orderCount = 5 + ((productIdx + pIndex) % 4);
      for (let i = 0; i < orderCount; i++) {
        const baseOrder = relatedVasOrders[i % relatedVasOrders.length];
        const supplier = ALL_SUPPLIER_RECORDS[(productIdx * 3 + i) % ALL_SUPPLIER_RECORDS.length];

        const daysAgo = i * 4 + 1;
        const dateObj = new Date(2026, 7, 28 - daysAgo); // 2026-08基准
        const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(
          2,
          '0'
        )}-${String(dateObj.getDate()).padStart(2, '0')} 10:${String(15 + i * 5).padStart(
          2,
          '0'
        )}:00`;

        const amt = baseOrder
          ? Math.round(baseOrder.amount * (0.8 + (i % 3) * 0.15))
          : Math.round(weekArpu * (0.9 + (i % 4) * 0.1));

        productOrders.push({
          id: `VAS202608${String(28 - i).padStart(2, '0')}-${String(1000 + productIdx * 20 + i)}`,
          supplierName: supplier ? supplier.supplierName : baseOrder ? baseOrder.supplierName : '武汉长江计算技术有限公司',
          supplierCode: supplier ? supplier.creditCode : baseOrder ? baseOrder.supplierCode : '91420100MA4K983X5R',
          supplierType: supplier ? supplier.supplierType : baseOrder ? baseOrder.supplierType : '算力',
          orderTime: dateStr,
          amount: amt,
          status: i === 0 ? '履约中' : i === 1 ? '已完成' : i === 2 ? '待生效' : '已完成',
          contactPerson: supplier ? supplier.contactPerson || '张主管' : '李经理',
          contactPhone: supplier ? supplier.contactPhone || '138****5621' : '139****8821',
          serviceDuration: '1个月',
          remark: `${productName}专属运营支持服务包`,
        });
      }

      // 客户均价与平均订单数
      const customerAvgPrice = {
        today: Math.round(todayArpu * 1.05),
        week: Math.round(weekArpu * 1.15),
        month: Math.round(monthArpu * 1.35),
        year: Math.round(yearArpu * 2.2),
      };

      const customerAvgOrders = {
        today: 1.0,
        week: parseFloat((1.1 + (productIdx % 3) * 0.1).toFixed(1)),
        month: parseFloat((1.6 + (productIdx % 4) * 0.2).toFixed(1)),
        year: parseFloat((3.8 + (productIdx % 5) * 0.3).toFixed(1)),
      };

      // 综合评分：在类别基准评分基础上微调 ±0.03
      const productRating = parseFloat(
        (baseScore + ((productIdx % 5) - 2) * 0.02).toFixed(2)
      );

      // 客单价折线趋势数据生成
      const todayDates = ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00'];
      const todayArpuTrend = todayDates.map((_, idx) => Math.round(todayArpu * (0.95 + idx * 0.015)));

      const weekDates = ['08-22', '08-23', '08-24', '08-25', '08-26', '08-27', '08-28'];
      const weekArpuTrend = weekDates.map((_, idx) => Math.round(weekArpu * (0.94 + idx * 0.015)));

      const monthDates = ['08-01', '08-05', '08-09', '08-13', '08-17', '08-21', '08-25', '08-28'];
      const monthArpuTrend = monthDates.map((_, idx) => Math.round(monthArpu * (0.91 + idx * 0.02)));

      const yearDates = [
        '2025-09', '2025-10', '2025-11', '2025-12',
        '2026-01', '2026-02', '2026-03', '2026-04',
        '2026-05', '2026-06', '2026-07', '2026-08',
      ];
      const yearArpuTrend = yearDates.map((_, idx) => Math.round(yearArpu * (0.82 + idx * 0.025)));

      const totalDates = ['2024-Q3', '2024-Q4', '2025-Q1', '2025-Q2', '2025-Q3', '2025-Q4', '2026-Q1', '2026-Q2'];
      const totalArpuTrend = totalDates.map((_, idx) => Math.round(totalArpu * (0.75 + idx * 0.035)));

      // 增长率趋势
      const todayGrowthTrend = [0.2, 0.4, 0.5, 0.6, 0.7, 0.75, todayRate];
      const weekGrowthTrend = [1.2, 1.5, 1.8, 2.0, 2.3, 2.6, weekRate];
      const monthGrowthTrend = [2.5, 2.9, 3.2, 3.6, 4.0, 4.3, 4.6, monthRate];
      const yearGrowthTrend = [6.5, 7.2, 8.0, 8.8, 9.4, 10.1, 10.8, 11.4, 11.8, 12.1, 12.3, yearRate];

      list.push({
        id,
        productName,
        categoryName: category,
        rating: productRating,
        totalOrders,
        totalRevenue,
        metricsByRange: {
          today: {
            newOrders: todayOrders,
            newRevenue: todayRevenue,
          },
          week: {
            newOrders: weekOrders,
            newRevenue: weekRevenue,
          },
          month: {
            newOrders: monthOrders,
            newRevenue: monthRevenue,
          },
          year: {
            newOrders: yearOrders,
            newRevenue: yearRevenue,
          },
        },
        arpuPerformance: {
          arpuValues: {
            today: todayArpu,
            week: weekArpu,
            month: monthArpu,
            year: yearArpu,
            total: totalArpu,
          },
          trendData: {
            today: { dates: todayDates, values: todayArpuTrend },
            week: { dates: weekDates, values: weekArpuTrend },
            month: { dates: monthDates, values: monthArpuTrend },
            year: { dates: yearDates, values: yearArpuTrend },
            total: { dates: totalDates, values: totalArpuTrend },
          },
          growthRates: {
            today: {
              rate: `+${todayRate.toFixed(1)}%`,
              isUp: true,
              dates: todayDates,
              values: todayGrowthTrend,
            },
            week: {
              rate: `+${weekRate.toFixed(1)}%`,
              isUp: true,
              dates: weekDates,
              values: weekGrowthTrend,
            },
            month: {
              rate: `+${monthRate.toFixed(1)}%`,
              isUp: true,
              dates: monthDates,
              values: monthGrowthTrend,
            },
            year: {
              rate: `+${yearRate.toFixed(1)}%`,
              isUp: true,
              dates: yearDates,
              values: yearGrowthTrend,
            },
          },
        },
        purchasePerformance: {
          customerAvgPrice,
          customerAvgOrders,
        },
        qualityPerformance: {
          rating: productRating,
          avgDuration: parseFloat((baseQuality.duration * varianceFactor).toFixed(1)),
          usageCount: parseFloat((baseQuality.usage * varianceFactor).toFixed(1)),
          trendDates: ['08-22', '08-23', '08-24', '08-25', '08-26', '08-27', '08-28'],
          trendUsage: [
            parseFloat((baseQuality.usage * varianceFactor * 0.12).toFixed(2)),
            parseFloat((baseQuality.usage * varianceFactor * 0.13).toFixed(2)),
            parseFloat((baseQuality.usage * varianceFactor * 0.14).toFixed(2)),
            parseFloat((baseQuality.usage * varianceFactor * 0.145).toFixed(2)),
            parseFloat((baseQuality.usage * varianceFactor * 0.15).toFixed(2)),
            parseFloat((baseQuality.usage * varianceFactor * 0.155).toFixed(2)),
            parseFloat((baseQuality.usage * varianceFactor * 0.16).toFixed(2)),
          ],
        },
        orders: productOrders,
      });
    });
  });

  return list;
})();

// 产品概览卡片统计数据
export const VAS_PRODUCT_OVERVIEW_DATA = {
  // 增值产品类别数 (展示当前累计值，不设置时间Tab)
  categoryCount: 10,
  // 订单总数（增值服务） (展示当前累计值，不设置时间Tab)
  totalOrders: 42850,
  // 新增订单数（增值服务） (内部设置当日、近一周、近一月、近一年Tab)
  newOrdersByRange: {
    today: {
      count: 48,
      momText: '较昨日 +3.2%',
      isUp: true,
    },
    week: {
      count: 315,
      momText: '环比上周 +4.2%',
      isUp: true,
    },
    month: {
      count: 1280,
      momText: '环比上月 +8.5%',
      isUp: true,
    },
    year: {
      count: 13420,
      momText: '同比去年 +16.8%',
      isUp: true,
    },
  },
};
