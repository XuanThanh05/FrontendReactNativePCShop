// src/screens/StatisticsScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, useColorScheme, StatusBar, Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  getSummaryStatistics, getOrderStatusDistribution,
  getTopProducts, getWarehouseReport,
} from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BAR_AREA_WIDTH = SCREEN_WIDTH - 48 - 40; // padding + label

// ============================================================
// Theme
// ============================================================
const darkTheme = {
  bg:          '#0d1117',
  card:        '#161b22',
  card2:       '#1c2333',
  border:      '#30363d',
  text:        '#e6edf3',
  muted:       '#8b949e',
  blue:        '#58a6ff',
  green:       '#3fb950',
  yellow:      '#e3b341',
  red:         '#f85149',
  purple:      '#bc8cff',
};

const lightTheme = {
  bg:          '#f6f8fa',
  card:        '#ffffff',
  card2:       '#f0f2f5',
  border:      '#d0d7de',
  text:        '#1f2328',
  muted:       '#636c76',
  blue:        '#0969da',
  green:       '#1a7f37',
  yellow:      '#9a6700',
  red:         '#cf222e',
  purple:      '#8250df',
};

// ============================================================
// Sub-components
// ============================================================

/** Hàm format VND */
const formatVND = (val) => {
  if (!val) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
};

/** 4 card tổng quan */
const SummaryCards = ({ stats, lowStockCount, t }) => {
  const cards = [
    {
      icon: '💰', label: 'Doanh Thu',
      value: formatVND(stats?.totalRevenue || 0),
      color: '#3b82f6',
    },
    {
      icon: '🛒', label: 'Đơn Hàng',
      value: stats?.totalOrders || 0,
      color: '#10b981',
    },
    {
      icon: '👥', label: 'Khách Hàng',
      value: stats?.totalCustomers || 0,
      color: '#8b5cf6',
    },
    {
      icon: '⚠️', label: 'Hàng Tồn Kho Thấp',
      value: lowStockCount || 0,
      color: '#f59e0b',
    },
  ];

  return (
    <View style={styles.cardGrid}>
      {cards.map((c, i) => (
        <View key={i} style={[styles.summaryCard]}>
          <View style={[styles.cardAccent, { backgroundColor: c.color }]} />
          <Text style={styles.cardIcon}>{c.icon}</Text>
          <Text style={styles.cardLabel}>{c.label}</Text>
          <Text style={styles.cardValue}>{c.value}</Text>
        </View>
      ))}
    </View>
  );
};

/** Bar chart doanh thu — tự vẽ bằng View */
const RevenueChart = ({ t }) => {
  const maxVal = Math.max(...revenueByMonth.map(d => d.revenue));

  return (
    <View style={[styles.section]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle]}>Doanh Thu Theo Tháng</Text>
        <View style={[styles.badge, { backgroundColor: '#dbeafe' }]}>
          <Text style={[styles.badgeText, { color: '#3b82f6' }]}>2024</Text>
        </View>
      </View>

      <View style={styles.barChart}>
        {revenueByMonth.map((d, i) => {
          const heightPercent = d.revenue / maxVal;
          const barHeight = Math.max(heightPercent * 120, 4);
          return (
            <View key={i} style={styles.barItem}>
              <Text style={[styles.barValue, { color: '#9ca3af' }]}>
                {d.revenue >= 50 ? `${d.revenue}` : ''}
              </Text>
              <View style={styles.barWrap}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: i === revenueByMonth.length - 1 ? '#3b82f6' : '#93c5fd',
                    },
                  ]}
                />
              </View>
              <Text style={[styles.barLabel, { color: '#9ca3af' }]}>{d.month}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.chartNote}>
        <Text style={[styles.chartNoteText, { color: '#9ca3af' }]}>Đơn vị: triệu đồng</Text>
      </View>
    </View>
  );
};

/** Trạng thái đơn hàng — horizontal bar */
const OrderStatus = ({ orderStatusData, t }) => {
  const statusColors = {
    PAID: { color: '#10b981' },
    PENDING: { color: '#f59e0b' },
    PROCESSING: { color: '#3b82f6' },
    SHIPPING: { color: '#8b5cf6' },
    COMPLETED: { color: '#06b6d4' },
    CANCELLED: { color: '#ef4444' },
  };

  const totalOrders = orderStatusData.reduce((sum, item) => sum + item.count, 0);

  return (
    <View style={[styles.section]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle]}>Trạng Thái Đơn Hàng</Text>
        <View style={[styles.badge, { backgroundColor: '#d1fae5' }]}>
          <Text style={[styles.badgeText, { color: '#10b981' }]}>{totalOrders} đơn</Text>
        </View>
      </View>

      {orderStatusData.map((item, i) => {
        const config = statusColors[item.status] || { color: '#6b7280' };
        const percent = totalOrders > 0 ? (item.count / totalOrders) * 100 : 0;

        return (
          <View key={i} style={styles.orderRow}>
            <View style={styles.orderLeft}>
              <View style={[styles.dot, { backgroundColor: config.color }]} />
              <Text style={[styles.orderName, { color: '#0f172a' }]}>{item.status}</Text>
            </View>
            <View style={styles.orderBarWrap}>
              <View style={[styles.orderBarBg, { backgroundColor: '#f3f4f6' }]}>
                <View
                  style={[
                    styles.orderBarFill,
                    { width: `${percent}%`, backgroundColor: config.color },
                  ]}
                />
              </View>
            </View>
            <Text style={[styles.orderCount, { color: '#0f172a' }]}>{item.count}</Text>
          </View>
        );
      })}
    </View>
  );
};

/** Top sản phẩm bán chạy */
const TopProducts = ({ topProducts, t }) => {
  const maxSold = topProducts.length > 0 ? Math.max(...topProducts.map(p => p.quantity)) : 1;

  return (
    <View style={[styles.section]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle]}>Sản Phẩm Bán Chạy</Text>
        <View style={[styles.badge, { backgroundColor: '#ede9fe' }]}>
          <Text style={[styles.badgeText, { color: '#8b5cf6' }]}>Top {topProducts.length}</Text>
        </View>
      </View>

      {topProducts.map((p, i) => (
        <View key={i} style={styles.productRow}>
          <Text style={[styles.productRank, { color: '#9ca3af' }]}>#{i + 1}</Text>
          <View style={styles.productInfo}>
            <Text style={[styles.productName, { color: '#0f172a' }]} numberOfLines={1}>
              {p.name}
            </Text>
            <View style={[styles.productBarBg, { backgroundColor: '#f3f4f6' }]}>
              <View
                style={[
                  styles.productBarFill,
                  { width: `${(p.quantity / maxSold) * 100}%` },
                ]}
              />
            </View>
          </View>
          <Text style={[styles.productSold, { color: '#3b82f6' }]}>{p.quantity}</Text>
        </View>
      ))}
    </View>
  );
};

/** Báo cáo kho hàng */
const WarehouseReport = ({ warehouseData, sortColumn, sortDirection, onSort, t }) => {
  const statusConfig = (stock) => {
    if (stock === 0) {
      return { label: 'Hết hàng', color: '#ef4444', bg: '#fee2e2' };
    } else if (stock < 10) {
      return { label: 'Sắp hết', color: '#f59e0b', bg: '#fef3c7' };
    } else {
      return { label: 'Còn hàng', color: '#10b981', bg: '#d1fae5' };
    }
  };

  const lowStockCount = warehouseData.filter(i => i.stockQuantity > 0 && i.stockQuantity < 10).length;
  const outOfStockCount = warehouseData.filter(i => i.stockQuantity === 0).length;

  const getSortArrow = (col) => {
    if (sortColumn !== col) return '';
    // For text columns (name, category): asc=A→Z show ↓, desc=Z→A show ↑
    // For number columns (stockQuantity): asc show ↑, desc show ↓
    if (col === 'name' || col === 'category') {
      return sortDirection === 'asc' ? '↓' : '↑';
    }
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <View style={[styles.section]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle]}>📦 Báo Cáo Kho Hàng</Text>
        <View style={[styles.badge, { backgroundColor: '#fef3c7' }]}>
          <Text style={[styles.badgeText, { color: '#f59e0b' }]}>{lowStockCount + outOfStockCount} cần nhập</Text>
        </View>
      </View>

      {/* Table Header với Sort */}
      <View style={[styles.tableHeader]}>
        <TouchableOpacity onPress={() => onSort('name')} style={{ flex: 1 }}>
          <Text style={[styles.tableHeaderText, { color: sortColumn === 'name' ? '#3b82f6' : '#6b7280' }]}>
            Tên {getSortArrow('name')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onSort('category')} style={{ width: 80, marginLeft: 12 }}>
          <Text style={[styles.tableHeaderText, { color: sortColumn === 'category' ? '#3b82f6' : '#6b7280' }]}>
            Danh Mục {getSortArrow('category')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onSort('stockQuantity')} style={{ width: 60, marginLeft: 16, alignItems: 'flex-start' }}>
          <Text style={[styles.tableHeaderText, { color: sortColumn === 'stockQuantity' ? '#3b82f6' : '#6b7280' }]}>
            Tồn Kho {getSortArrow('stockQuantity')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Table Rows */}
      {warehouseData.map((item, i) => {
        const cfg = statusConfig(item.stockQuantity);
        return (
          <View
            key={item.id}
            style={[
              styles.warehouseRow,
              i < warehouseData.length - 1 && { borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.warehouseName]} numberOfLines={1}>
                {item.name}
              </Text>
            </View>
            <View style={{ width: 80, marginLeft: 12 }}>
              <View style={[styles.categoryBadge]}>
                <Text style={[styles.categoryBadgeText]} numberOfLines={1}>
                  {item.category}
                </Text>
              </View>
            </View>
            <View style={{ width: 60, marginLeft: 16, alignItems: 'flex-start' }}>
              <Text style={[styles.warehouseStock, { color: cfg.color }]}>
                {item.stockQuantity}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

// ============================================================
// Main Screen
// ============================================================
export default function StatisticsScreen({ navigation }) {
  const scheme = useColorScheme();
  const t = scheme === 'dark' ? darkTheme : lightTheme;
  const insets = useSafeAreaInsets();

  // State
  const [stats, setStats] = useState(null);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [topProductsData, setTopProductsData] = useState([]);
  const [warehouseData, setWarehouseData] = useState([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Sort state
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Fetch data từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [summaryRes, orderStatusRes, topProductsRes, warehouseRes] = await Promise.all([
          getSummaryStatistics(),
          getOrderStatusDistribution(),
          getTopProducts(),
          getWarehouseReport(),
        ]);

        // Set summary stats
        setStats({
          totalRevenue: summaryRes.data?.totalRevenue || 0,
          totalOrders: summaryRes.data?.totalOrders || 0,
          totalCustomers: summaryRes.data?.totalCustomers || 0,
        });

        // Set order status
        setOrderStatusData(orderStatusRes.data || []);

        // Set top products
        setTopProductsData(topProductsRes.data || []);

        // Set warehouse + calculate low stock
        const warehouse = warehouseRes.data || [];
        setWarehouseData(warehouse);
        
        const lowStock = warehouse.filter(
          item => item.stockQuantity > 0 && item.stockQuantity < 10
        ).length;
        setLowStockCount(lowStock);

      } catch (err) {
        console.error('Error fetching statistics:', err);
        setError(err.message || 'Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Hàm sort warehouse data
  const getSortedWarehouse = () => {
    if (!warehouseData.length) return [];

    const sorted = [...warehouseData].sort((a, b) => {
      let compareA, compareB;

      switch (sortColumn) {
        case 'name':
          compareA = a.name?.toLowerCase() || '';
          compareB = b.name?.toLowerCase() || '';
          break;
        case 'category':
          compareA = a.category?.toLowerCase() || '';
          compareB = b.category?.toLowerCase() || '';
          break;
        case 'stockQuantity':
          compareA = a.stockQuantity || 0;
          compareB = b.stockQuantity || 0;
          break;
        default:
          compareA = a.name?.toLowerCase() || '';
          compareB = b.name?.toLowerCase() || '';
      }

      if (compareA < compareB) return sortDirection === 'asc' ? -1 : 1;
      if (compareA > compareB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  // Hàm xử lý sort
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Loading
  if (loading) {
    return (
      <View style={[styles.root, { backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={[{ color: '#0f172a', marginTop: 12 }]}>Đang tải...</Text>
      </View>
    );
  }

  // Error
  if (error) {
    return (
      <View style={[styles.root, { backgroundColor: '#f5f5f5' }]}>
        <View style={[styles.header, { backgroundColor: '#E53935' }]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.backIcon]}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle]}>📊 Thống Kê & Báo Cáo</Text>
          </View>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={[{ color: '#ef4444', fontSize: 14, textAlign: 'center' }]}>
            Lỗi: {error}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginTop: 20, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#3b82f6', borderRadius: 8 }}
          >
            <Text style={[{ color: '#fff' }]}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: '#f5f5f5' }]}>
      <StatusBar barStyle="light-content" backgroundColor="#E53935" />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#E53935', paddingTop: 8 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backIcon]}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle]}>📊 Thống Kê & Báo Cáo</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SummaryCards t={t} stats={stats} lowStockCount={lowStockCount} />
        <OrderStatus t={t} orderStatusData={orderStatusData} />
        <TopProducts t={t} topProducts={topProductsData} />
        <WarehouseReport 
          t={t} 
          warehouseData={getSortedWarehouse()} 
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================
// Styles
// ============================================================
const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#f5f5f5' },
  header:      { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#E53935', paddingHorizontal: 20, paddingVertical: 12 },
  backBtn:     { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  backIcon:    { fontSize: 28, fontWeight: '700', color: '#fff' },
  headerContent: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3, color: '#fff' },
  headerSub:   { fontSize: 12, marginTop: 2 },
  scroll:      { flex: 1 },
  scrollContent:{ padding: 16, gap: 12, backgroundColor: '#f5f5f5' },

  // Summary cards — 2 cột
  cardGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },
  summaryCard: {
    width: (SCREEN_WIDTH - 42) / 2,
    borderRadius: 12, borderWidth: 1,
    padding: 16, overflow: 'hidden', position: 'relative',
    backgroundColor: '#fff',
    borderColor: '#e5e7eb',
  },
  cardAccent:  { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  cardIcon:    { fontSize: 22, marginBottom: 8 },
  cardLabel:   { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3, color: '#6b7280' },
  cardValue:   { fontSize: 20, fontWeight: '700', marginTop: 4, fontVariant: ['tabular-nums'], color: '#0f172a' },
  cardGrowth:  { fontSize: 11, marginTop: 4, fontWeight: '500' },

  // Section chung
  section:     { borderRadius: 12, borderWidth: 1, padding: 16, backgroundColor: '#fff', borderColor: '#e5e7eb' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle:  { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  badge:       { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText:   { fontSize: 11, fontWeight: '700' },

  // Bar chart
  barChart:    { flexDirection: 'row', alignItems: 'flex-end', height: 150, gap: 3 },
  barItem:     { flex: 1, alignItems: 'center' },
  barValue:    { fontSize: 8, marginBottom: 2 },
  barWrap:     { width: '100%', alignItems: 'center', justifyContent: 'flex-end', height: 120 },
  bar:         { width: '80%', borderRadius: 3, minHeight: 4 },
  barLabel:    { fontSize: 9, marginTop: 4 },
  chartNote:   { alignItems: 'flex-end', marginTop: 8 },
  chartNoteText:{ fontSize: 10 },

  // Order status
  orderRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  orderLeft:   { flexDirection: 'row', alignItems: 'center', gap: 8, width: 120 },
  dot:         { width: 8, height: 8, borderRadius: 4 },
  orderName:   { fontSize: 12, flex: 1 },
  orderBarWrap:{ flex: 1 },
  orderBarBg:  { height: 6, borderRadius: 3, overflow: 'hidden' },
  orderBarFill:{ height: '100%', borderRadius: 3 },
  orderCount:  { fontSize: 13, fontWeight: '700', width: 32, textAlign: 'right', fontVariant: ['tabular-nums'] },

  // Top products
  productRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  productRank: { fontSize: 12, width: 24 },
  productInfo: { flex: 1 },
  productName: { fontSize: 12, fontWeight: '500', marginBottom: 4 },
  productBarBg:{ height: 4, borderRadius: 2, overflow: 'hidden' },
  productBarFill: {
    height: '100%', borderRadius: 2,
    backgroundColor: '#58a6ff',
  },
  productSold: { fontSize: 13, fontWeight: '700', width: 28, textAlign: 'right', fontVariant: ['tabular-nums'] },

  // Warehouse
  warehouseRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  tableHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tableHeaderText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  warehouseLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingRight: 12 },
  warehouseId:   { fontSize: 11, width: 28 },
  warehouseName: { fontSize: 13, flex: 1, fontWeight: '500', color: '#0f172a' },
  warehouseCategory: { fontSize: 12, color: '#9ca3af' },
  warehouseRight:{ alignItems: 'flex-end', gap: 4 },
  warehouseStock:{ fontSize: 12, fontWeight: '700', fontVariant: ['tabular-nums'] },
  statusBadge:   { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  statusText:    { fontSize: 10, fontWeight: '700' },
});
