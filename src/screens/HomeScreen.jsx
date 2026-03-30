// src/screens/HomeScreen.js
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import ComparisonDock from "../components/comparison/ComparisonDock";
import { banners, formatPrice } from "../constants/mockData";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useComparison } from "../context/ComparisonContext";
import {
  getCategories,
  getProductsPaged,
  searchProducts,
} from "../services/api";

const { width } = Dimensions.get("window");
const BANNER_WIDTH = width - 24;

// Map category name (lowercase) → emoji
const CATEGORY_ICON_MAP = {
  laptop: "💻",
  cpu: "🔲",
  gpu: "🎮",
  ram: "🧠",
  ssd: "💾",
  storage: "🗄️",
  mainboard: "🖥️",
  psu: "🔌",
  cooling: "❄️",
  monitor: "🖥️",
  keyboard: "⌨️",
  mouse: "🖱️",
  headset: "🎧",
};

const HomeScreen = ({ navigation }) => {
  const [search, setSearch] = useState("");
  const { addToCart } = useCart();
  const {
    addToComparison,
    removeFromComparison,
    isInComparison,
    count: comparisonCount,
  } = useComparison();
  const { currentUser } = useAuth();
  const [activeBanner, setActiveBanner] = useState(0);

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Categories từ DB
  const [dbCategories, setDbCategories] = useState([]);

  // Fetch categories từ DB (chỉ hiển thị category thực sự có sản phẩm)
  useEffect(() => {
    getCategories()
      .then((res) => setDbCategories(res.data)) // ["Laptop", "CPU", "GPU", ...]
      .catch((err) => console.error("Lỗi fetch categories:", err));
  }, []);

  useEffect(() => {
    fetchProducts(0);
  }, []);

  const fetchProducts = async (pageNum = 0) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await getProductsPaged(pageNum, 6);
      const data = res.data;
      setProducts(data.content ?? []);
      setPage(data.number);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      console.error("Lỗi fetch sản phẩm:", err);
    } finally {
      setLoading(false);
    }
  };

  const goToPrevPage = () => {
    if (loading || page <= 0) return;
    fetchProducts(page - 1);
  };

  const goToNextPage = () => {
    if (loading || page >= totalPages - 1) return;
    fetchProducts(page + 1);
  };

  // Debounced search
  useEffect(() => {
    if (search.length === 0) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchProducts(search);
        setSearchResults(res.data);
      } catch (err) {
        console.error("Lỗi tìm kiếm:", err);
      } finally {
        setSearching(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Build danh sách category từ DB
  const filteredCategories = dbCategories.map((catName) => ({
    id: catName,
    key: catName,
    name: catName,
    icon: CATEGORY_ICON_MAP[catName.toLowerCase()] ?? "📦",
  }));

  // Bấm category → navigate sang CategoryScreen với categoryKey
  const handleCategoryPress = (categoryName) => {
    navigation.navigate("Category", { categoryKey: categoryName });
  };

  const rawProducts = search.length > 0 ? searchResults : products;
  const displayProducts =
    rawProducts.length % 2 !== 0
      ? [...rawProducts, { id: "__placeholder__", _placeholder: true }]
      : rawProducts;

  const renderProduct = ({ item: product }) => {
    if (product._placeholder) {
      return (
        <View
          style={[
            styles.productCard,
            { backgroundColor: "transparent", elevation: 0, shadowOpacity: 0 },
          ]}
        />
      );
    }

    const imageUri = product.imageUrl ?? product.image ?? "";
    const outOfStock = (product.stockQuantity ?? product.stock ?? 1) === 0;
    const inComparison = isInComparison(product.id);

    const handleComparisonToggle = () => {
      if (inComparison) {
        removeFromComparison(product.id);
      } else {
        addToComparison(product);
      }
    };

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate("Product", { product })}
        activeOpacity={0.85}
      >
        {product.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{product.discount}%</Text>
          </View>
        )}
        {outOfStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Hết hàng</Text>
          </View>
        )}

        <Image
          source={{ uri: imageUri }}
          style={styles.productImage}
          resizeMode="cover"
        />

        <View style={styles.productInfo}>
          <Text style={styles.productBrand}>{product.brand}</Text>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.productSpecs} numberOfLines={1}>
            {product.description}
          </Text>
          <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.addBtn, outOfStock && styles.addBtnDisabled]}
              onPress={() => !outOfStock && addToCart(product)}
              disabled={outOfStock}
            >
              <Ionicons name="cart-outline" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.comparisonBtn,
                inComparison && styles.comparisonBtnActive,
              ]}
              onPress={handleComparisonToggle}
            >
              <Text
                style={[
                  styles.comparisonBtnText,
                  inComparison && styles.comparisonBtnTextActive,
                ]}
              >
                {inComparison ? "Đã thêm so sánh" : "So sánh"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (search.length > 0 || totalPages <= 1) return null;
    return (
      <View style={styles.paginationWrap}>
        <TouchableOpacity
          style={[styles.pageBtn, page === 0 && styles.pageBtnDisabled]}
          onPress={goToPrevPage}
          disabled={page === 0 || loading}
        >
          <Text style={styles.pageBtnText}>Trước</Text>
        </TouchableOpacity>

        <Text style={styles.pageInfo}>
          Trang {page + 1}/{totalPages}
        </Text>

        <TouchableOpacity
          style={[
            styles.pageBtn,
            page >= totalPages - 1 && styles.pageBtnDisabled,
          ]}
          onPress={goToNextPage}
          disabled={page >= totalPages - 1 || loading}
        >
          <Text style={styles.pageBtnText}>Sau</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => (
    <>
      {search.length === 0 && (
        <>
          {/* Banner */}
          <ScrollView
            horizontal
            pagingEnabled={false}
            snapToInterval={BANNER_WIDTH}
            snapToAlignment="start"
            decelerationRate="fast"
            disableIntervalMomentum
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(
                e.nativeEvent.contentOffset.x / BANNER_WIDTH,
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
                  { backgroundColor: banner.bg, width: BANNER_WIDTH },
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
                    <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
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

          {/* Danh mục — render từ DB */}
          <Text style={styles.sectionTitle}>Danh mục</Text>
          {filteredCategories.length === 0 ? (
            <ActivityIndicator
              size="small"
              color="#E53935"
              style={{ marginBottom: 8, marginLeft: 12 }}
            />
          ) : (
            <FlatList
              data={filteredCategories}
              keyExtractor={(i) => i.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryItem}
                  onPress={() => handleCategoryPress(item.key)}
                >
                  <View style={styles.categoryIcon}>
                    <Text style={styles.categoryEmoji}>{item.icon}</Text>
                  </View>
                  <Text style={styles.categoryName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {search.length > 0 ? `Kết quả "${search}"` : "🔥 Sản phẩm hot"}
        </Text>
      </View>

      {(loading || searching) && (
        <ActivityIndicator
          size="large"
          color="#E53935"
          style={{ marginTop: 40 }}
        />
      )}

      {!loading &&
        search.length > 0 &&
        !searching &&
        searchResults.length === 0 && (
          <View style={styles.noResult}>
            <Text style={styles.noResultIcon}>🔍</Text>
            <Text style={styles.noResultText}>Không tìm thấy sản phẩm</Text>
          </View>
        )}
    </>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#E53935" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.logo}>
            PC<Text style={styles.logoAccent}>Shop</Text>
          </Text>
        </View>
        <View style={styles.headerRight}>
          {comparisonCount > 0 && (
            <TouchableOpacity
              style={styles.headerComparisonBtn}
              onPress={() => navigation.navigate("Comparison")}
            >
              <Text style={styles.headerComparisonIcon}>⚖️</Text>
              <View style={styles.comparisonBadge}>
                <Text style={styles.comparisonBadgeText}>
                  {comparisonCount}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          {currentUser?.role === "admin" && (
            <TouchableOpacity
              style={styles.adminBtn}
              onPress={() => navigation.navigate("Statistics")}
            >
              <Text style={styles.adminBtnText}>📊</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Bạn muốn mua gì hôm nay?"
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
            autoCapitalize="none"
            autoComplete="off"
            spellCheck={false}
            textContentType="none"
            importantForAutofill="no"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Text style={styles.clearSearch}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={displayProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={styles.productGrid}
        ListHeaderComponent={renderHeader()}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <ComparisonDock navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E53935",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  logo: { fontSize: 22, fontWeight: "900", color: "#fff" },
  logoAccent: { color: "#FFD700" },
  adminBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  adminBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  searchWrap: {
    backgroundColor: "#E53935",
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: "#333" },
  clearSearch: { fontSize: 16, color: "#999", paddingLeft: 8 },

  bannerScroll: {
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  banner: {
    borderRadius: 12,
    padding: 20,
    justifyContent: "center",
    height: 120,
  },
  bannerContent: { flexDirection: "row", alignItems: "center", gap: 16 },
  bannerEmoji: { fontSize: 48 },
  bannerTitle: { fontSize: 20, fontWeight: "800" },
  bannerSubtitle: { fontSize: 13, color: "#ccc", marginTop: 4 },

  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#ccc" },
  dotActive: {
    width: 18,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E53935",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1a1a1a",
    marginHorizontal: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: 12,
  },

  categoryList: { paddingHorizontal: 12, gap: 12 },
  categoryItem: { alignItems: "center", width: 68 },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  categoryEmoji: { fontSize: 26 },
  categoryName: {
    fontSize: 11,
    color: "#444",
    marginTop: 6,
    textAlign: "center",
    fontWeight: "600",
  },

  productGrid: { paddingHorizontal: 8, gap: 8 },
  productCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    margin: 4,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    zIndex: 1,
    backgroundColor: "#E53935",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  discountText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  outOfStockOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  outOfStockText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  productImage: { width: "100%", height: 140 },
  productInfo: { padding: 10 },
  productBrand: {
    fontSize: 11,
    color: "#E53935",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  productName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1a1a1a",
    marginTop: 2,
  },
  productSpecs: { fontSize: 11, color: "#888", marginTop: 3 },
  productPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: "#E53935",
    marginTop: 6,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
    alignItems: "center",
  },
  addBtn: {
    width: 46,
    height: 36,
    backgroundColor: "#FFB300",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnDisabled: { backgroundColor: "#ccc" },
  addBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  comparisonBtn: {
    flex: 1,
    height: 36,
    backgroundColor: "#FF5A1F",
    borderRadius: 8,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  comparisonBtnActive: { backgroundColor: "#FF5A1F" },
  comparisonBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  comparisonBtnTextActive: { color: "#fff" },

  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerComparisonBtn: {
    position: "relative",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  headerComparisonIcon: { fontSize: 20, color: "#fff" },
  comparisonBadge: {
    position: "absolute",
    top: -6,
    right: -8,
    backgroundColor: "#FFD700",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  comparisonBadgeText: { fontSize: 11, fontWeight: "700", color: "#333" },

  paginationWrap: {
    marginTop: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pageBtn: {
    backgroundColor: "#E53935",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pageBtnDisabled: { backgroundColor: "#d7d7d7" },
  pageBtnText: { color: "#fff", fontWeight: "700" },
  pageInfo: { fontSize: 13, fontWeight: "700", color: "#333" },

  noResult: { alignItems: "center", paddingVertical: 60 },
  noResultIcon: { fontSize: 48 },
  noResultText: { fontSize: 16, color: "#999", marginTop: 12 },
});

export default HomeScreen;
