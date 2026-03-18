// src/screens/CategoryScreen.js
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, TextInput,
} from 'react-native';
import { categoryList, categoryDetail } from '../constants/Categorydata';

const CategoryScreen = ({ navigation }) => {
  const [activeId, setActiveId] = useState('laptop');
  const [search, setSearch] = useState('');
  const detail = categoryDetail[activeId];

  // Lọc danh mục theo tìm kiếm
  const filteredCategories = categoryList.filter(cat =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  // Lọc nội dung bên phải theo tìm kiếm
  const filteredBrands = detail.brands.filter(b =>
    b.toLowerCase().includes(search.toLowerCase())
  );
  const filteredHotItems = detail.hotItems.filter(item =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#E53935" />

      {/* ── Header ─────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh mục</Text>
      </View>

      {/* ── Thanh tìm kiếm ─────────────────────────────────── */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Bạn muốn mua gì hôm nay?"
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearSearch}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Layout 2 cột ───────────────────────────────────── */}
      <View style={styles.body}>

        {/* ── Cột trái: danh mục (hẹp, sát trái) ───────────── */}
        <ScrollView
          style={styles.leftCol}
          showsVerticalScrollIndicator={false}
        >
          {filteredCategories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.catItem,
                activeId === cat.id && styles.catItemActive,
              ]}
              onPress={() => {
                setActiveId(cat.id);
                setSearch('');
              }}
            >
              {/* Thanh đỏ bên trái khi active */}
              {activeId === cat.id && <View style={styles.activeBar} />}

              <Text style={styles.catEmoji}>{cat.emoji}</Text>
              <Text
                style={[
                  styles.catName,
                  activeId === cat.id && styles.catNameActive,
                ]}
                numberOfLines={2}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
          <View style={{ height: 30 }} />
        </ScrollView>

        {/* ── Cột phải: nội dung danh mục ───────────────────── */}
        <ScrollView
          style={styles.rightCol}
          showsVerticalScrollIndicator={false}
        >
          {/* Tiêu đề */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{detail.title}</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Xem tất cả {'>'}</Text>
            </TouchableOpacity>
          </View>

          {/* Hãng sản xuất */}
          <Text style={styles.groupLabel}>Hãng sản xuất</Text>
          <View style={styles.tagWrap}>
            {filteredBrands.map((brand, i) => (
              <TouchableOpacity key={i} style={styles.tag}>
                <Text style={styles.tagText}>{brand}</Text>
              </TouchableOpacity>
            ))}
            {filteredBrands.length === 0 && (
              <Text style={styles.emptyText}>Không tìm thấy</Text>
            )}
          </View>

          {/* Phân khúc giá */}
          <Text style={styles.groupLabel}>Phân khúc giá</Text>
          <View style={styles.tagWrap}>
            {detail.priceRanges.map((range, i) => (
              <TouchableOpacity key={i} style={styles.tag}>
                <Text style={styles.tagText}>{range.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Sản phẩm HOT */}
          <Text style={styles.groupLabel}>{detail.title} HOT ⚡</Text>
          <View style={styles.hotWrap}>
            {filteredHotItems.map((item, i) => (
              <TouchableOpacity key={i} style={styles.hotTag}>
                <Text style={styles.hotTagText}>{item.label}</Text>
                {item.tag !== '' && (
                  <View style={[
                    styles.badge,
                    item.tag === 'HOT' ? styles.badgeHot : styles.badgeNew,
                  ]}>
                    <Text style={styles.badgeText}>{item.tag}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
            {filteredHotItems.length === 0 && (
              <Text style={styles.emptyText}>Không tìm thấy</Text>
            )}
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default CategoryScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f5f5' },

  // Header
  header: {
    backgroundColor: '#E53935',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },

  // Search
  searchWrap: {
    backgroundColor: '#E53935',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10, paddingHorizontal: 12, height: 44,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#1a1a1a' },
  clearSearch: { fontSize: 16, color: '#aaa', paddingLeft: 8 },

  // Layout
  body: { flex: 1, flexDirection: 'row' },

  // ── Cột trái: hẹp, sát trái ────────────────────────────────
  leftCol: {
    width: 76,
    backgroundColor: '#f0f0f0',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  catItem: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    position: 'relative',
    backgroundColor: '#f0f0f0',
  },
  catItemActive: { backgroundColor: '#fff' },
  catEmoji: { fontSize: 26, marginBottom: 4 },
  catName: {
    fontSize: 10, color: '#666',
    textAlign: 'center', fontWeight: '600',
    lineHeight: 14,
  },
  catNameActive: { color: '#E53935', fontWeight: '700' },
  activeBar: {
    position: 'absolute',
    left: 0, top: 8, bottom: 8,
    width: 3,
    backgroundColor: '#E53935',
    borderRadius: 2,
  },

  // ── Cột phải: rộng, nội dung ────────────────────────────────
  rightCol: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#1a1a1a' },
  seeAll: { fontSize: 13, color: '#E53935', fontWeight: '600' },

  // Groups
  groupLabel: {
    fontSize: 14, fontWeight: '700',
    color: '#333', marginBottom: 10, marginTop: 16,
  },

  // Tags hãng + giá (wrap nhiều cột)
  tagWrap: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
  },
  tag: {
    borderWidth: 1.5, borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: '#fff',
  },
  tagText: { fontSize: 13, color: '#333', fontWeight: '500' },

  // Hot items (mỗi item 1 hàng riêng)
  hotWrap: { gap: 8 },
  hotTag: {
    borderWidth: 1.5, borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hotTagText: { fontSize: 13, color: '#1a1a1a', fontWeight: '600', flex: 1 },

  // Badge HOT / Mới
  badge: {
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 4, marginLeft: 8,
  },
  badgeHot: { backgroundColor: '#E53935' },
  badgeNew: { backgroundColor: '#43A047' },
  badgeText: { fontSize: 10, color: '#fff', fontWeight: '800' },

  // Empty
  emptyText: { fontSize: 13, color: '#aaa', fontStyle: 'italic' },
});