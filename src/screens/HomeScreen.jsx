// src/screens/HomeScreen.js
import { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  banners,
  categories,
  formatPrice,
  hotProducts,
} from "../constants/mockData";
import { useCart } from "../context/CartContext";

const { width } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  const [search, setSearch] = useState("");
  const { totalItems, addToCart } = useCart();
  const [activeBanner, setActiveBanner] = useState(0);

  const filteredProducts = hotProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#E53935" />

      {/* ── Header ─────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.logo}>
          PC<Text style={styles.logoAccent}>Shop</Text>
        </Text>
        {/* <TouchableOpacity
          style={styles.cartBtn}
          onPress={() => navigation.navigate("Cart")}
        >
          <Text style={styles.cartIcon}>🛒</Text>
          {totalItems > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {totalItems > 99 ? "99+" : totalItems}
              </Text>
            </View>
          )}
        </TouchableOpacity> */}
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
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Text style={styles.clearSearch}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Banner ─────────────────────────────────────────── */}
        {search.length === 0 && (
          <>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(
                  e.nativeEvent.contentOffset.x / (width - 24),
                );
                setActiveBanner(idx);
              }}
              style={styles.bannerScroll}
            >
              {banners.map((banner) => (
                <View
                  key={banner.id}
                  style={[
                    styles.banner,
                    { backgroundColor: banner.bg, width: width - 24 },
                  ]}
                >
                  <View style={styles.bannerContent}>
                    <Text style={styles.bannerEmoji}>{banner.emoji}</Text>
                    <View>
                      <Text
                        style={[styles.bannerTitle, { color: banner.accent }]}
                      >
                        {banner.title}
                      </Text>
                      <Text style={styles.bannerSubtitle}>
                        {banner.subtitle}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
            {/* Dots */}
            <View style={styles.dots}>
              {banners.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, activeBanner === i && styles.dotActive]}
                />
              ))}
            </View>

            {/* ── Danh mục ───────────────────────────────────── */}
            <Text style={styles.sectionTitle}>Danh mục</Text>
            <FlatList
              data={categories}
              keyExtractor={(i) => i.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryItem}
                  onPress={() =>
                    navigation.navigate("Category", { key: item.key })
                  }
                >
                  <View style={styles.categoryIcon}>
                    <Text style={styles.categoryEmoji}>{item.icon}</Text>
                  </View>
                  <Text style={styles.categoryName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </>
        )}

        {/* ── Sản phẩm hot ───────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {search.length > 0 ? `Kết quả "${search}"` : "🔥 Sản phẩm hot"}
          </Text>
          {search.length === 0 && (
            <TouchableOpacity>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          )}
        </View>

        {filteredProducts.length === 0 ? (
          <View style={styles.noResult}>
            <Text style={styles.noResultIcon}>🔍</Text>
            <Text style={styles.noResultText}>Không tìm thấy sản phẩm</Text>
          </View>
        ) : (
          <View style={styles.productGrid}>
            {filteredProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() => navigation.navigate("Product", { product })}
                activeOpacity={0.85}
              >
                {/* Badge giảm giá */}
                {product.discount > 0 && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>
                      -{product.discount}%
                    </Text>
                  </View>
                )}

                <Image
                  source={{ uri: product.image }}
                  style={styles.productImage}
                  resizeMode="cover"
                />

                <View style={styles.productInfo}>
                  <Text style={styles.productBrand}>{product.brand}</Text>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.productSpecs} numberOfLines={1}>
                    {product.specs}
                  </Text>

                  <View style={styles.ratingRow}>
                    <Text style={styles.star}>⭐</Text>
                    <Text style={styles.rating}>{product.rating}</Text>
                    <Text style={styles.reviews}>({product.reviews})</Text>
                  </View>

                  <Text style={styles.productPrice}>
                    {formatPrice(product.price)}
                  </Text>
                  {product.originalPrice > product.price && (
                    <Text style={styles.originalPrice}>
                      {formatPrice(product.originalPrice)}
                    </Text>
                  )}

                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => addToCart(product)}
                  >
                    <Text style={styles.addBtnText}>+ Thêm vào giỏ</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f5f5f5" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E53935",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logo: { fontSize: 22, fontWeight: "900", color: "#fff" },
  logoAccent: { color: "#FFD700" },
  cartBtn: { position: "relative", padding: 4 },
  cartIcon: { fontSize: 26 },
  badge: {
    position: "absolute",
    top: -2,
    right: -4,
    backgroundColor: "#FFD700",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { fontSize: 10, fontWeight: "900", color: "#1a1a1a" },

  // Search
  searchWrap: {
    backgroundColor: "#E53935",
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: "#1a1a1a" },
  clearSearch: { fontSize: 16, color: "#aaa", paddingLeft: 8 },

  // Banner
  bannerScroll: { marginHorizontal: 12, marginTop: 12, borderRadius: 14 },
  banner: {
    borderRadius: 14,
    padding: 20,
    marginRight: 0,
    height: 110,
    justifyContent: "center",
  },
  bannerContent: { flexDirection: "row", alignItems: "center", gap: 16 },
  bannerEmoji: { fontSize: 42 },
  bannerTitle: { fontSize: 20, fontWeight: "900" },
  bannerSubtitle: { fontSize: 12, color: "#ccc", marginTop: 2 },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#ddd" },
  dotActive: { backgroundColor: "#E53935", width: 18 },

  // Section
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1a1a1a",
    paddingHorizontal: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  seeAll: { fontSize: 13, color: "#E53935", fontWeight: "600" },

  // Categories
  categoryList: { paddingHorizontal: 12, gap: 10 },
  categoryItem: { alignItems: "center", width: 70 },
  categoryIcon: {
    width: 56,
    height: 56,
    backgroundColor: "#fff",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 6,
  },
  categoryEmoji: { fontSize: 26 },
  categoryName: {
    fontSize: 11,
    color: "#444",
    textAlign: "center",
    fontWeight: "600",
  },

  // Product Grid
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 8,
    gap: 8,
  },
  productCard: {
    width: (width - 28) / 2,
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    position: "relative",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#E53935",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    zIndex: 1,
  },
  discountText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  productImage: { width: "100%", height: 120, backgroundColor: "#f0f0f0" },
  productInfo: { padding: 10 },
  productBrand: {
    fontSize: 10,
    color: "#E53935",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1a1a1a",
    marginTop: 3,
    lineHeight: 18,
  },
  productSpecs: { fontSize: 10, color: "#999", marginTop: 2 },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 3,
  },
  star: { fontSize: 11 },
  rating: { fontSize: 11, color: "#555", fontWeight: "700" },
  reviews: { fontSize: 11, color: "#aaa" },
  productPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: "#E53935",
    marginTop: 6,
  },
  originalPrice: {
    fontSize: 11,
    color: "#bbb",
    textDecorationLine: "line-through",
    marginTop: 1,
  },
  addBtn: {
    backgroundColor: "#FFF0F0",
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: "center",
    marginTop: 8,
  },
  addBtnText: { fontSize: 12, color: "#E53935", fontWeight: "700" },

  // No result
  noResult: { alignItems: "center", paddingVertical: 40 },
  noResultIcon: { fontSize: 48, marginBottom: 12 },
  noResultText: { fontSize: 15, color: "#888" },
});
