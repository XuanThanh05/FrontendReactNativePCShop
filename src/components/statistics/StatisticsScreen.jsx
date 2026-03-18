// src/screens/StatisticsScreen.jsx
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, useColorScheme, StatusBar, Dimensions,
} from 'react-native';

import {
  summaryStats, revenueByMonth, orderStatusData,
  topProducts, warehouseReport, formatVND,
} from '../../constants/statisticsMockData';

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

/** 4 card tổng quan */
const SummaryCards = ({ t }) => {
  const cards = [
    {
      icon: '💰', label: 'Doanh Thu',
      value: formatVND(summaryStats.totalRevenue),
      growth: `▲ ${summaryStats.revenueGrowth}%`, color: t.blue,
    },
    {
      icon: '🛒', label: 'Đơn Hàng',
      value: summaryStats.totalOrders,
      growth: `▲ ${summaryStats.orderGrowth}%`, color: t.green,
    },
    {
      icon: '👥', label: 'Khách Hàng',
      value: summaryStats.totalCustomers,
      growth: `▲ ${summaryStats.customerGrowth}%`, color: t.purple,
    },
    {
      icon: '📦', label: 'Sắp Hết Hàng',
      value: summaryStats.lowStockItems,
      growth: '⚠ Cần nhập thêm', color: t.yellow,
    },
  ];

  return (
    <View style={styles.cardGrid}>
      {cards.map((c, i) => (
        <View key={i} style={[styles.summaryCard, { backgroundColor: t.card, borderColor: t.border }]}>
          <View style={[styles.cardAccent, { backgroundColor: c.color }]} />
          <Text style={styles.cardIcon}>{c.icon}</Text>
          <Text style={[styles.cardLabel, { color: t.muted }]}>{c.label}</Text>
          <Text style={[styles.cardValue, { color: t.text }]}>{c.value}</Text>
          <Text style={[styles.cardGrowth, { color: c.color }]}>{c.growth}</Text>
        </View>
      ))}
    </View>
  );
};

/** Bar chart doanh thu — tự vẽ bằng View */
const RevenueChart = ({ t }) => {
  const maxVal = Math.max(...revenueByMonth.map(d => d.revenue));

  return (
    <View style={[styles.section, { backgroundColor: t.card, borderColor: t.border }]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: t.text }]}>Doanh Thu Theo Tháng</Text>
        <View style={[styles.badge, { backgroundColor: t.blue + '25' }]}>
          <Text style={[styles.badgeText, { color: t.blue }]}>2024</Text>
        </View>
      </View>

      <View style={styles.barChart}>
        {revenueByMonth.map((d, i) => {
          const heightPercent = d.revenue / maxVal;
          const barHeight = Math.max(heightPercent * 120, 4);
          return (
            <View key={i} style={styles.barItem}>
              <Text style={[styles.barValue, { color: t.muted }]}>
                {d.revenue >= 50 ? `${d.revenue}` : ''}
              </Text>
              <View style={styles.barWrap}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: i === revenueByMonth.length - 1 ? t.blue : t.blue + '70',
                    },
                  ]}
                />
              </View>
              <Text style={[styles.barLabel, { color: t.muted }]}>{d.month}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.chartNote}>
        <Text style={[styles.chartNoteText, { color: t.muted }]}>Đơn vị: triệu đồng</Text>
      </View>
    </View>
  );
};

/** Trạng thái đơn hàng — horizontal bar */
const OrderStatus = ({ t }) => (
  <View style={[styles.section, { backgroundColor: t.card, borderColor: t.border }]}>
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: t.text }]}>Trạng Thái Đơn Hàng</Text>
      <View style={[styles.badge, { backgroundColor: t.green + '25' }]}>
        <Text style={[styles.badgeText, { color: t.green }]}>342 đơn</Text>
      </View>
    </View>

    {orderStatusData.map((item, i) => (
      <View key={i} style={styles.orderRow}>
        <View style={styles.orderLeft}>
          <View style={[styles.dot, { backgroundColor: item.color }]} />
          <Text style={[styles.orderName, { color: t.text }]}>{item.name}</Text>
        </View>
        <View style={styles.orderBarWrap}>
          <View style={[styles.orderBarBg, { backgroundColor: t.card2 }]}>
            <View
              style={[
                styles.orderBarFill,
                { width: `${item.percent}%`, backgroundColor: item.color },
              ]}
            />
          </View>
        </View>
        <Text style={[styles.orderCount, { color: t.text }]}>{item.value}</Text>
      </View>
    ))}
  </View>
);

/** Top sản phẩm bán chạy */
const TopProducts = ({ t }) => {
  const maxSold = Math.max(...topProducts.map(p => p.sold));
  return (
    <View style={[styles.section, { backgroundColor: t.card, borderColor: t.border }]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: t.text }]}>Sản Phẩm Bán Chạy</Text>
        <View style={[styles.badge, { backgroundColor: t.purple + '25' }]}>
          <Text style={[styles.badgeText, { color: t.purple }]}>Top {topProducts.length}</Text>
        </View>
      </View>

      {topProducts.map((p, i) => (
        <View key={i} style={styles.productRow}>
          <Text style={[styles.productRank, { color: t.muted }]}>#{i + 1}</Text>
          <View style={styles.productInfo}>
            <Text style={[styles.productName, { color: t.text }]} numberOfLines={1}>
              {p.name}
            </Text>
            <View style={[styles.productBarBg, { backgroundColor: t.card2 }]}>
              <View
                style={[
                  styles.productBarFill,
                  { width: `${(p.sold / maxSold) * 100}%` },
                ]}
              />
            </View>
          </View>
          <Text style={[styles.productSold, { color: t.blue }]}>{p.sold}</Text>
        </View>
      ))}
    </View>
  );
};

/** Báo cáo kho hàng */
const WarehouseReport = ({ t }) => {
  const statusConfig = {
    ok:     { label: 'Còn hàng', color: t.green,  bg: t.green  + '20' },
    warn:   { label: 'Sắp hết',  color: t.yellow, bg: t.yellow + '20' },
    danger: { label: 'Hết hàng', color: t.red,    bg: t.red    + '20' },
  };

  const needRestock = warehouseReport.filter(i => i.status !== 'ok').length;

  return (
    <View style={[styles.section, { backgroundColor: t.card, borderColor: t.border }]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: t.text }]}>📦 Báo Cáo Kho Hàng</Text>
        <View style={[styles.badge, { backgroundColor: t.yellow + '25' }]}>
          <Text style={[styles.badgeText, { color: t.yellow }]}>{needRestock} cần nhập</Text>
        </View>
      </View>

      {warehouseReport.map((item, i) => {
        const cfg = statusConfig[item.status];
        return (
          <View
            key={item.id}
            style={[
              styles.warehouseRow,
              i < warehouseReport.length - 1 && { borderBottomWidth: 1, borderBottomColor: t.border },
            ]}
          >
            <View style={styles.warehouseLeft}>
              <Text style={[styles.warehouseId, { color: t.muted }]}>
                #{String(item.id).padStart(2, '0')}
              </Text>
              <Text style={[styles.warehouseName, { color: t.text }]} numberOfLines={1}>
                {item.name}
              </Text>
            </View>
            <View style={styles.warehouseRight}>
              <Text style={[styles.warehouseStock, { color: cfg.color }]}>
                {item.stock}/{item.minStock}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
              </View>
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
export default function StatisticsScreen() {
  const scheme = useColorScheme();
  const t = scheme === 'dark' ? darkTheme : lightTheme;

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <StatusBar
        barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={t.bg}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: t.card, borderBottomColor: t.border }]}>
        <Text style={[styles.headerTitle, { color: t.text }]}>📊 Thống Kê & Báo Cáo</Text>
        <Text style={[styles.headerSub, { color: t.muted }]}>Tổng quan hoạt động kinh doanh</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SummaryCards t={t} />
        <RevenueChart t={t} />
        <OrderStatus t={t} />
        <TopProducts t={t} />
        <WarehouseReport t={t} />
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

// ============================================================
// Styles
// ============================================================
const styles = StyleSheet.create({
  root:        { flex: 1 },
  header:      { paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 1 },
  headerTitle: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  headerSub:   { fontSize: 12, marginTop: 2 },
  scroll:      { flex: 1 },
  scrollContent:{ padding: 16, gap: 12 },

  // Summary cards — 2 cột
  cardGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },
  summaryCard: {
    width: (SCREEN_WIDTH - 42) / 2,
    borderRadius: 12, borderWidth: 1,
    padding: 16, overflow: 'hidden', position: 'relative',
  },
  cardAccent:  { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  cardIcon:    { fontSize: 22, marginBottom: 8 },
  cardLabel:   { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  cardValue:   { fontSize: 20, fontWeight: '700', marginTop: 4, fontVariant: ['tabular-nums'] },
  cardGrowth:  { fontSize: 11, marginTop: 4, fontWeight: '500' },

  // Section chung
  section:     { borderRadius: 12, borderWidth: 1, padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle:  { fontSize: 15, fontWeight: '600' },
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
  warehouseLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingRight: 12 },
  warehouseId:   { fontSize: 11, width: 28 },
  warehouseName: { fontSize: 13, flex: 1, fontWeight: '500' },
  warehouseRight:{ alignItems: 'flex-end', gap: 4 },
  warehouseStock:{ fontSize: 12, fontWeight: '700', fontVariant: ['tabular-nums'] },
  statusBadge:   { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  statusText:    { fontSize: 10, fontWeight: '700' },
});
