// src/screens/CategoryScreen.js
import React, { useState } from 'react';
import {
  View, Text, ScrollView, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, TextInput, Image,
  Dimensions,
} from 'react-native';
import { categoryList, categoryDetail } from '../constants/Categorydata';
import { hotProducts, formatPrice } from '../constants/mockData';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');

const CategoryScreen = ({ navigation }) => {
  const [activeId, setActiveId]   = useState('laptop');
  const [search, setSearch]       = useState('');
  const { addToCart }             = useCart();
  const detail                    = categoryDetail[activeId];

  // Khi có từ khoá → hiện sản phẩm giống trang chủ
  const searchResults = hotProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase()) ||
    p.specs.toLowerCase().includes(search.toLowerCase())
  );

  const isSearching = search.length > 0;

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
          {isSearching && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearSearch}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Khi đang tìm kiếm: hiện grid sản phẩm ─────────── */}
      {isSearching ? (
        <View style={styles.searchResultWrap}>
          <Text style={styles.resultTitle}>
            Kết quả cho "<Text style={styles.resultKeyword}>{search}</Text>"
            {' '}({searchResults.length} sản phẩm)
          </Text>

          {searchResults.length === 0 ? (
            <View style={styles.noResult}>
              <Text style={styles.noResultIcon}>🔍</Text>
              <Text style={styles.noResultText}>Không tìm thấy sản phẩm</Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={item => item.id}
              numColumns={2}
              columnWrapperStyle={styles.row}
              contentContainerStyle={styles.productGrid}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.productCard}
                  onPress={() => navigation.navigate('Product', { product: item })}
                  activeOpacity={0.85}
                >
                  {item.discount > 0 && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>-{item.discount}%</Text>
                    </View>
                  )}
                  <Image
                    source={{ uri: item.image }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                  <View style={styles.productInfo}>
                    <Text style={styles.productBrand}>{item.brand}</Text>
                    <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.productSpecs} numberOfLines={1}>{item.specs}</Text>
                    <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
                    {item.originalPrice > item.price && (
                      <Text style={styles.originalPrice}>{formatPrice(item.originalPrice)}</Text>
                    )}
                    <TouchableOpacity
                      style={styles.addBtn}
                      onPress={() => addToCart(item)}
                    >
                      <Text style={styles.addBtnText}>+ Thêm vào giỏ</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

      ) : (
        /* ── Khi không tìm kiếm: hiện layout danh mục ─────── */
        <View style={styles.body}>

          {/* Cột trái */}
          <ScrollView style={styles.leftCol} showsVerticalScrollIndicator={false}>
            {categoryList.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catItem, activeId === cat.id && styles.catItemActive]}
                onPress={() => setActiveId(cat.id)}
              >
                {activeId === cat.id && <View style={styles.activeBar} />}
                <Text style={styles.catEmoji}>{cat.emoji}</Text>
                <Text style={[styles.catName, activeId === cat.id && styles.catNameActive]}
                  numberOfLines={2}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={{ height: 30 }} />
          </ScrollView>

          {/* Cột phải */}
          <ScrollView style={styles.rightCol} showsVerticalScrollIndicator={false}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{detail.title}</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>Xem tất cả {'>'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.groupLabel}>Hãng sản xuất</Text>
            <View style={styles.tagWrap}>
              {detail.brands.map((brand, i) => (
                <TouchableOpacity key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{brand}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.groupLabel}>Phân khúc giá</Text>
            <View style={styles.tagWrap}>
              {detail.priceRanges.map((range, i) => (
                <TouchableOpacity key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{range.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.groupLabel}>{detail.title} HOT ⚡</Text>
            <View style={styles.hotWrap}>
              {detail.hotItems.map((item, i) => (
                <TouchableOpacity key={i} style={styles.hotTag}>
                  <Text style={styles.hotTagText}>{item.label}</Text>
                  {item.tag !== '' && (
                    <View style={[styles.badge, item.tag === 'HOT' ? styles.badgeHot : styles.badgeNew]}>
                      <Text style={styles.badgeText}>{item.tag}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ height: 30 }} />
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
};

export default CategoryScreen;

const CARD_WIDTH = (width - 28) / 2;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f5f5' },

  header: { backgroundColor: '#E53935', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },

  searchWrap: { backgroundColor: '#E53935', paddingHorizontal: 12, paddingBottom: 12 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 10,
    paddingHorizontal: 12, height: 44,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#1a1a1a' },
  clearSearch: { fontSize: 16, color: '#aaa', paddingLeft: 8 },

  // ── Kết quả tìm kiếm ──────────────────────────────────────────
  searchResultWrap: { flex: 1, backgroundColor: '#f5f5f5' },
  resultTitle: {
    fontSize: 13, color: '#666',
    paddingHorizontal: 12, paddingVertical: 10,
  },
  resultKeyword: { color: '#E53935', fontWeight: '700' },

  row: { paddingHorizontal: 8, gap: 8, marginBottom: 8 },
  productGrid: { paddingTop: 4, paddingBottom: 20 },

  productCard: {
    width: CARD_WIDTH, backgroundColor: '#fff',
    borderRadius: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.06,
    shadowRadius: 8, elevation: 3,
    position: 'relative',
  },
  discountBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: '#E53935', borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 3, zIndex: 1,
  },
  discountText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  productImage: { width: '100%', height: 120, backgroundColor: '#f0f0f0' },
  productInfo: { padding: 10 },
  productBrand: { fontSize: 10, color: '#E53935', fontWeight: '700', textTransform: 'uppercase' },
  productName: { fontSize: 13, fontWeight: '700', color: '#1a1a1a', marginTop: 3, lineHeight: 18 },
  productSpecs: { fontSize: 10, color: '#999', marginTop: 2 },
  productPrice: { fontSize: 14, fontWeight: '800', color: '#E53935', marginTop: 6 },
  originalPrice: { fontSize: 11, color: '#bbb', textDecorationLine: 'line-through', marginTop: 1 },
  addBtn: { backgroundColor: '#FFF0F0', borderRadius: 8, paddingVertical: 7, alignItems: 'center', marginTop: 8 },
  addBtnText: { fontSize: 12, color: '#E53935', fontWeight: '700' },

  noResult: { alignItems: 'center', paddingVertical: 60 },
  noResultIcon: { fontSize: 48, marginBottom: 12 },
  noResultText: { fontSize: 15, color: '#888' },

  // ── Layout danh mục ───────────────────────────────────────────
  body: { flex: 1, flexDirection: 'row' },

  leftCol: { width: 76, backgroundColor: '#f0f0f0', borderRightWidth: 1, borderRightColor: '#e0e0e0' },
  catItem: { alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4, position: 'relative', backgroundColor: '#f0f0f0' },
  catItemActive: { backgroundColor: '#fff' },
  catEmoji: { fontSize: 26, marginBottom: 4 },
  catName: { fontSize: 10, color: '#666', textAlign: 'center', fontWeight: '600', lineHeight: 14 },
  catNameActive: { color: '#E53935', fontWeight: '700' },
  activeBar: { position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, backgroundColor: '#E53935', borderRadius: 2 },

  rightCol: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 14, paddingTop: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#1a1a1a' },
  seeAll: { fontSize: 13, color: '#E53935', fontWeight: '600' },
  groupLabel: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 10, marginTop: 16 },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#fff' },
  tagText: { fontSize: 13, color: '#333', fontWeight: '500' },
  hotWrap: { gap: 8 },
  hotTag: { borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hotTagText: { fontSize: 13, color: '#1a1a1a', fontWeight: '600', flex: 1 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
  badgeHot: { backgroundColor: '#E53935' },
  badgeNew: { backgroundColor: '#43A047' },
  badgeText: { fontSize: 10, color: '#fff', fontWeight: '800' },
});