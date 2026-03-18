// src/screens/ProductDetailScreen.js
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar,
  Image, Dimensions,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../constants/mockData';

const { width } = Dimensions.get('window');

const ProductDetailScreen = ({ route, navigation }) => {
  const { product } = route.params;
  const { addToCart, totalItems } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    navigation.navigate('Checkout', { product });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── Header ─────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Text style={styles.headerBtnIcon}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>Thông tin sản phẩm</Text>

        <TouchableOpacity
          style={styles.headerCartBtn}
          onPress={() => navigation.navigate('Cart')}
        >
          <Text style={styles.headerBtnIcon}>🛒</Text>
          {totalItems > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Ảnh sản phẩm ───────────────────────────────────── */}
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: product.image }}
            style={styles.productImage}
            resizeMode="contain"
          />
          {product.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{product.discount}%</Text>
            </View>
          )}
        </View>

        {/* ── Tên & thương hiệu ───────────────────────────────── */}
        <View style={styles.infoSection}>
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={styles.productName}>{product.name}</Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.ratingText}>{product.rating}</Text>
            <Text style={styles.reviewText}>({product.reviews} đánh giá)</Text>
            <TouchableOpacity style={styles.likeBtn}>
              <Text style={styles.likeIcon}>🤍</Text>
              <Text style={styles.likeText}>Yêu thích</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Giá ────────────────────────────────────────────── */}
        <View style={styles.priceSection}>
          <View style={styles.priceRow}>
            <Text style={styles.currentPrice}>{formatPrice(product.price)}</Text>
            {product.originalPrice > product.price && (
              <Text style={styles.originalPrice}>{formatPrice(product.originalPrice)}</Text>
            )}
          </View>
          {product.originalPrice > product.price && (
            <Text style={styles.savedText}>
              Tiết kiệm: {formatPrice(product.originalPrice - product.price)}
            </Text>
          )}
        </View>

        {/* ── Thông số kỹ thuật ───────────────────────────────── */}
        <View style={styles.specsSection}>
          <Text style={styles.sectionTitle}>Thông số kỹ thuật</Text>
          {product.specs.split(' | ').map((spec, i) => (
            <View key={i} style={styles.specRow}>
              <Text style={styles.specDot}>•</Text>
              <Text style={styles.specText}>{spec}</Text>
            </View>
          ))}
        </View>

        {/* ── Tình trạng kho ──────────────────────────────────── */}
        <View style={styles.stockSection}>
          <Text style={styles.stockLabel}>Tình trạng: </Text>
          <Text style={[
            styles.stockValue,
            product.stock > 0 ? styles.inStock : styles.outOfStock,
          ]}>
            {product.stock > 0 ? `Còn hàng (${product.stock} sản phẩm)` : 'Hết hàng'}
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Thanh hành động cố định dưới cùng ──────────────── */}
      <View style={styles.actionBar}>
        {/* Thêm vào giỏ */}
        <TouchableOpacity
          style={[styles.addCartBtn, added && styles.addCartBtnAdded]}
          onPress={handleAddToCart}
          disabled={product.stock === 0}
          activeOpacity={0.8}
        >
          <Text style={styles.addCartIcon}>🛒</Text>
          <Text style={styles.addCartText}>
            {added ? 'Đã thêm ✓' : 'Thêm vào giỏ'}
          </Text>
        </TouchableOpacity>

        {/* Mua ngay */}
        <TouchableOpacity
          style={[styles.buyNowBtn, product.stock === 0 && styles.btnDisabled]}
          onPress={handleBuyNow}
          disabled={product.stock === 0}
          activeOpacity={0.85}
        >
          <Text style={styles.buyNowText}>
            {product.stock === 0 ? 'Hết hàng' : 'Mua ngay'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProductDetailScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  headerBtn: { padding: 4 },
  headerCartBtn: { padding: 4, position: 'relative' },
  headerBtnIcon: { fontSize: 28, color: '#1a1a1a', lineHeight: 30 },
  headerTitle: {
    flex: 1, textAlign: 'center',
    fontSize: 16, fontWeight: '700', color: '#1a1a1a',
    marginHorizontal: 10,
  },
  cartBadge: {
    position: 'absolute', top: -2, right: -4,
    backgroundColor: '#E53935', borderRadius: 10,
    minWidth: 16, height: 16,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: { fontSize: 9, color: '#fff', fontWeight: '900' },

  // Image
  imageWrap: {
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    paddingVertical: 20,
    position: 'relative',
  },
  productImage: { width: width * 0.7, height: 220 },
  discountBadge: {
    position: 'absolute', top: 12, left: 12,
    backgroundColor: '#E53935', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  discountText: { color: '#fff', fontSize: 13, fontWeight: '800' },

  // Info
  infoSection: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  brand: {
    fontSize: 12, color: '#E53935',
    fontWeight: '700', textTransform: 'uppercase',
    letterSpacing: 0.8, marginBottom: 4,
  },
  productName: { fontSize: 18, fontWeight: '800', color: '#1a1a1a', lineHeight: 26 },
  ratingRow: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 10, gap: 6,
  },
  star: { fontSize: 16 },
  ratingText: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  reviewText: { fontSize: 13, color: '#888' },
  likeBtn: {
    flexDirection: 'row', alignItems: 'center',
    marginLeft: 'auto', gap: 4,
  },
  likeIcon: { fontSize: 18 },
  likeText: { fontSize: 13, color: '#E53935', fontWeight: '600' },

  // Price
  priceSection: {
    padding: 16,
    backgroundColor: '#fff9f9',
    borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  currentPrice: { fontSize: 22, fontWeight: '900', color: '#E53935' },
  originalPrice: {
    fontSize: 15, color: '#bbb',
    textDecorationLine: 'line-through',
  },
  savedText: { fontSize: 13, color: '#43A047', marginTop: 4, fontWeight: '600' },

  // Specs
  specsSection: {
    padding: 16,
    borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1a1a1a', marginBottom: 10 },
  specRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  specDot: { color: '#E53935', fontSize: 14, marginTop: 1 },
  specText: { fontSize: 14, color: '#444', flex: 1, lineHeight: 20 },

  // Stock
  stockSection: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  stockLabel: { fontSize: 14, color: '#555', fontWeight: '600' },
  stockValue: { fontSize: 14, fontWeight: '700' },
  inStock: { color: '#43A047' },
  outOfStock: { color: '#E53935' },

  // Action bar
  actionBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 12, paddingVertical: 10,
    paddingBottom: 16,
    borderTopWidth: 1, borderTopColor: '#f0f0f0',
    gap: 10,
    shadowColor: '#000', shadowOpacity: 0.08,
    shadowRadius: 10, elevation: 10,
  },
  addCartBtn: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#E53935',
    borderRadius: 12, paddingVertical: 13, gap: 6,
  },
  addCartBtnAdded: { backgroundColor: '#FFF0F0' },
  addCartIcon: { fontSize: 18 },
  addCartText: { fontSize: 14, fontWeight: '700', color: '#E53935' },
  buyNowBtn: {
    flex: 1.2,
    backgroundColor: '#E53935',
    borderRadius: 12, paddingVertical: 13,
    alignItems: 'center',
  },
  buyNowText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  btnDisabled: { backgroundColor: '#ccc' },
});