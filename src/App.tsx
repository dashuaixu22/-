/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TimeRangeType } from './types';
import { GlobalTopBar } from './components/GlobalTopBar';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { HomeDashboardView } from './components/HomeDashboardView';
import { OverviewCardsRow } from './components/OverviewCardsRow';
import { ArpuFunnelRow } from './components/ArpuFunnelRow';
import { TransactionBreakdownRow } from './components/TransactionBreakdownRow';
import { GrowthRateCard } from './components/GrowthRateCard';
import { BusinessOverviewView } from './components/BusinessOverviewView';
import { SupplyDemandTxView } from './components/SupplyDemandTxView';
import { VasOperationsView } from './components/VasOperationsView';
import { SupplierCountView } from './components/SupplierCountView';
import { SupplierConsumptionView } from './components/SupplierConsumptionView';
import { SupplierProductsView } from './components/SupplierProductsView';
import { SupplierQueryView } from './components/SupplierQueryView';
import { SupplierDetailView } from './components/SupplierDetailView';
import { SupplierSalesOrderQueryView } from './components/SupplierSalesOrderQueryView';
import { VasProductQueryView } from './components/VasProductQueryView';
import { VasProductDetailView } from './components/VasProductDetailView';
import { ProductValueView } from './components/ProductValueView';
import { ProductQualityView } from './components/ProductQualityView';
import { VasOrderQueryView } from './components/VasOrderQueryView';
import { SupplierProductDetailView } from './components/SupplierProductDetailView';
import { DemandOverviewView } from './components/demand/DemandOverviewView';
import { DemandDetailView } from './components/demand/DemandDetailView';
import { DemandTradeView } from './components/demand/DemandTradeView';
import { DemandOrderDetailView } from './components/demand/DemandOrderDetailView';
import { DemandServiceView } from './components/demand/DemandServiceView';
import { ALL_SUPPLIER_RECORDS } from './data/supplierQueryMockData';
import { ALL_VAS_PRODUCTS, VasProductItem } from './data/vasProductMockData';
import { ALL_SUPPLIER_PRODUCTS, SupplierProductRecord } from './data/supplierProductsMockData';
import {
  ALL_DEMAND_CUSTOMERS,
  DemandCustomerRecord,
  ALL_DEMAND_ORDERS,
  DemandOrderRecord,
} from './data/demandMockData';
import {
  TODAY,
  BASIC_GROWTH_CATEGORIES,
  BASIC_GROWTH_DATA,
  VAS_GROWTH_CATEGORIES,
  VAS_GROWTH_DATA,
  COMMISSION_GROWTH_CATEGORIES,
  COMMISSION_GROWTH_DATA,
} from './data/mockData';

export default function App() {
  const [activeMenu, setActiveMenu] = useState<string>('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<TimeRangeType>('year');
  const [startDate, setStartDate] = useState<string>('2025-08-28');
  const [endDate, setEndDate] = useState<string>(TODAY);
  const [productsSupplierId, setProductsSupplierId] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<any>(ALL_SUPPLIER_RECORDS[0]);
  const [selectedVasProduct, setSelectedVasProduct] = useState<VasProductItem>(ALL_VAS_PRODUCTS[0]);

  // B/C需求端运营状态
  const [selectedDemandCustomer, setSelectedDemandCustomer] = useState<DemandCustomerRecord>(ALL_DEMAND_CUSTOMERS[0]);
  const [selectedDemandOrder, setSelectedDemandOrder] = useState<DemandOrderRecord>(ALL_DEMAND_ORDERS[0]);
  const [selectedSupplierProduct, setSelectedSupplierProduct] = useState<SupplierProductRecord>(ALL_SUPPLIER_PRODUCTS[0]);
  const [productDetailBackMenu, setProductDetailBackMenu] = useState<string>('demand_consumption');
  const [demandCustomerSearchState, setDemandCustomerSearchState] = useState<any>(null);
  const [demandOrderSearchState, setDemandOrderSearchState] = useState<any>(null);

  return (
    <div className="h-screen overflow-hidden bg-[#F5F7FA] flex flex-col text-slate-800 antialiased font-sans">
      {/* 顶部全局固定状态栏：延伸整个页面 */}
      <GlobalTopBar userName="ProUser" userRole="运营管理员" />

      {/* 主体工作区（位于全局状态栏下方） */}
      <div className="flex-1 flex min-w-0 pt-12 h-screen overflow-hidden">
        {/* 左侧一二三级层级菜单导航 */}
        <Sidebar
          activeKey={activeMenu}
          onSelect={setActiveMenu}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* 右侧主业务看板 */}
        <div className="flex-1 flex flex-col min-w-0 h-[calc(100vh-48px)] overflow-hidden">
          {/* 二级顶部工具栏（运营数据分析标题 + 周期切换） */}
          <Header
            activeMenu={activeMenu}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            startDate={startDate}
            onStartDateChange={setStartDate}
            endDate={endDate}
            onEndDateChange={setEndDate}
          />

          {/* 看板主内容区域 */}
          <main className="flex-1 p-3.5 md:p-4 overflow-y-auto">
            {activeMenu === 'home' ? (
              <HomeDashboardView />
            ) : activeMenu === 'business_overview' ? (
              <div id="business-overview-page" className="max-w-[1440px] mx-auto">
                <BusinessOverviewView
                  timeRange={timeRange}
                  startDate={startDate}
                  endDate={endDate}
                />
              </div>
            ) : activeMenu === 'supply_demand_tx' || activeMenu === 'overview_domain' ? (
              <div id="supply-demand-tx-page" className="w-full">
                <SupplyDemandTxView timeRange={timeRange} />
              </div>
            ) : activeMenu === 'vas_operations' ? (
              <div id="vas-operations-page" className="max-w-[1440px] mx-auto">
                <VasOperationsView timeRange={timeRange} />
              </div>
            ) : activeMenu === 'supplier_count' ? (
              <div id="supplier-count-page" className="max-w-[1440px] mx-auto">
                <SupplierCountView
                  timeRange={timeRange}
                  startDate={startDate}
                  endDate={endDate}
                />
              </div>
            ) : activeMenu === 'supplier_query' ? (
              <div id="supplier-query-page" className="max-w-[1440px] mx-auto">
                <SupplierQueryView
                  onViewDetail={(supplier) => {
                    setSelectedSupplier(supplier);
                    setActiveMenu('supplier_detail');
                  }}
                  onViewProducts={(supplier) => {
                    setProductsSupplierId(supplier.id);
                    setActiveMenu('supplier_products');
                  }}
                />
              </div>
            ) : activeMenu === 'supplier_detail' ? (
              <div id="supplier-detail-page-container" className="max-w-[1440px] mx-auto">
                <SupplierDetailView
                  supplier={selectedSupplier || ALL_SUPPLIER_RECORDS[0]}
                  onBack={() => setActiveMenu('supplier_query')}
                  onViewProducts={(supplierId) => {
                    setProductsSupplierId(supplierId);
                    setActiveMenu('supplier_products');
                  }}
                />
              </div>
            ) : activeMenu === 'supplier_consumption' ? (
              <div id="supplier-consumption-page" className="max-w-[1440px] mx-auto">
                <SupplierConsumptionView timeRange={timeRange} />
              </div>
            ) : activeMenu === 'supplier_products' ? (
              <div id="supplier-products-page" className="max-w-[1440px] mx-auto">
                <SupplierProductsView
                  timeRange={timeRange}
                  initialSupplierId={productsSupplierId}
                  onSupplierChange={setProductsSupplierId}
                  onViewProductDetail={(prod) => {
                    setSelectedSupplierProduct(prod);
                    setProductDetailBackMenu('supplier_products');
                    setActiveMenu('supplier_product_detail');
                  }}
                />
              </div>
            ) : activeMenu === 'supplier_sales_order_query' ? (
              <div id="supplier-sales-order-query-page" className="max-w-[1440px] mx-auto">
                <SupplierSalesOrderQueryView />
              </div>
            ) : activeMenu === 'product_info' ? (
              <div id="vas-product-query-page" className="max-w-[1440px] mx-auto">
                <VasProductQueryView
                  onViewDetail={(product) => {
                    setSelectedVasProduct(product);
                    setActiveMenu('vas_product_detail');
                  }}
                />
              </div>
            ) : activeMenu === 'vas_product_detail' ? (
              <div id="vas-product-detail-page" className="max-w-[1440px] mx-auto">
                <VasProductDetailView
                  product={selectedVasProduct || ALL_VAS_PRODUCTS[0]}
                  onBack={() => setActiveMenu('product_info')}
                />
              </div>
            ) : activeMenu === 'product_value' ? (
              <div id="product-value-page" className="max-w-[1440px] mx-auto">
                <ProductValueView />
              </div>
            ) : activeMenu === 'product_quality' ? (
              <div id="product-quality-page" className="max-w-[1440px] mx-auto">
                <ProductQualityView />
              </div>
            ) : activeMenu === 'vas_order_query' ? (
              <div id="vas-order-query-page" className="max-w-[1440px] mx-auto">
                <VasOrderQueryView />
              </div>
            ) : activeMenu === 'demand_scale' ||
              activeMenu === 'demand_query' ||
              activeMenu === 'demand_overview' ||
              activeMenu === 'platform_demand_ops' ? (
              <div id="demand-overview-page" className="max-w-[1440px] mx-auto">
                <DemandOverviewView
                  activeTab={activeMenu === 'demand_query' ? 'query' : 'scale'}
                  onActiveTabChange={(tab) => {
                    setActiveMenu(tab === 'query' ? 'demand_query' : 'demand_scale');
                  }}
                  timeRange={timeRange}
                  startDate={startDate}
                  endDate={endDate}
                  onTimeRangeChange={setTimeRange}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                  onViewCustomerDetail={(customer) => {
                    setSelectedDemandCustomer(customer);
                    setActiveMenu('demand_customer_detail');
                  }}
                  initialSearchState={demandCustomerSearchState}
                  onSaveSearchState={setDemandCustomerSearchState}
                />
              </div>
            ) : activeMenu === 'demand_customer_detail' ? (
              <div id="demand-customer-detail-page" className="max-w-[1440px] mx-auto">
                <DemandDetailView
                  customer={selectedDemandCustomer || ALL_DEMAND_CUSTOMERS[0]}
                  onBack={() => setActiveMenu('demand_query')}
                  onViewOrderDetail={(order) => {
                    setSelectedDemandOrder(order);
                    setActiveMenu('demand_order_detail');
                  }}
                  onViewProductDetail={(prod) => {
                    setSelectedSupplierProduct(prod);
                    setProductDetailBackMenu('demand_customer_detail');
                    setActiveMenu('supplier_product_detail');
                  }}
                />
              </div>
            ) : activeMenu === 'demand_trade_analysis' ||
              activeMenu === 'demand_trade_products' ||
              activeMenu === 'demand_trade_orders' ||
              activeMenu === 'demand_consumption' ? (
              <div id="demand-consumption-page" className="max-w-[1440px] mx-auto">
                <DemandTradeView
                  activeTab={
                    activeMenu === 'demand_trade_products'
                      ? 'products'
                      : activeMenu === 'demand_trade_orders'
                      ? 'orders'
                      : 'analysis'
                  }
                  onActiveTabChange={(tab) => {
                    setActiveMenu(
                      tab === 'products'
                        ? 'demand_trade_products'
                        : tab === 'orders'
                        ? 'demand_trade_orders'
                        : 'demand_trade_analysis'
                    );
                  }}
                  timeRange={timeRange}
                  startDate={startDate}
                  endDate={endDate}
                  onTimeRangeChange={setTimeRange}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                  onViewOrderDetail={(order) => {
                    setSelectedDemandOrder(order);
                    setActiveMenu('demand_order_detail');
                  }}
                  onViewProductDetail={(prod) => {
                    setSelectedSupplierProduct(prod);
                    setProductDetailBackMenu(
                      activeMenu === 'demand_consumption' ? 'demand_trade_products' : activeMenu
                    );
                    setActiveMenu('supplier_product_detail');
                  }}
                  initialSearchState={demandOrderSearchState}
                  onSaveSearchState={setDemandOrderSearchState}
                />
              </div>
            ) : activeMenu === 'demand_order_detail' ? (
              <div id="demand-order-detail-page" className="max-w-[1440px] mx-auto">
                <DemandOrderDetailView
                  order={selectedDemandOrder || ALL_DEMAND_ORDERS[0]}
                  onBack={() => setActiveMenu('demand_trade_orders')}
                  onViewCustomerDetail={(cust) => {
                    setSelectedDemandCustomer(cust);
                    setActiveMenu('demand_customer_detail');
                  }}
                  onViewSupplierDetail={(sup) => {
                    setSelectedSupplier(sup);
                    setActiveMenu('supplier_detail');
                  }}
                  onViewProductDetail={(prod) => {
                    setSelectedSupplierProduct(prod);
                    setProductDetailBackMenu('demand_order_detail');
                    setActiveMenu('supplier_product_detail');
                  }}
                />
              </div>
            ) : activeMenu === 'demand_service_feedback' ||
              activeMenu === 'demand_service_usage' ||
              activeMenu === 'demand_service' ? (
              <div id="demand-service-page" className="max-w-[1440px] mx-auto">
                <DemandServiceView
                  activeTab={activeMenu === 'demand_service_usage' ? 'usage' : 'feedback'}
                  onActiveTabChange={(tab) => {
                    setActiveMenu(tab === 'usage' ? 'demand_service_usage' : 'demand_service_feedback');
                  }}
                />
              </div>
            ) : activeMenu === 'supplier_product_detail' ? (
              <div id="supplier-product-detail-page" className="max-w-[1440px] mx-auto">
                <SupplierProductDetailView
                  product={selectedSupplierProduct || ALL_SUPPLIER_PRODUCTS[0]}
                  onBack={() => setActiveMenu(productDetailBackMenu)}
                />
              </div>
            ) : (
              <div id="empty-content-container" className="h-full min-h-[500px]" />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
