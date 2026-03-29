// src/screens/CategoryScreen.js
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useState, useEffect } from "react";
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
import { formatPrice } from "../constants/mockData";
import {
  getCategories,
  getProductsByCategory,
  getTopByCategory,
} from "../services/api";
import { useCart } from "../context/CartContext";
import { useComparison } from "../context/ComparisonContext";

const { width } = Dimensions.get("window");
const PRODUCT_CARD_WIDTH = (width - 28) / 2;

const CATEGORY_ICON_CONFIG = {
  laptop:    { lib: MaterialCommunityIcons, name: "laptop",                 color: "#58A8FF" },
  cpu:       { lib: MaterialCommunityIcons, name: "chip",                   color: "#B39DDB" },
  ram:       { lib: MaterialCommunityIcons, name: "memory",                 color: "#A4D65E" },
  ssd:       { lib: MaterialCommunityIcons, name: "harddisk",               color: "#8C7CC3" },
  storage:   { lib: MaterialCommunityIcons, name: "harddisk",               color: "#8C7CC3" },
  gpu:       { lib: MaterialCommunityIcons, name: "expansion-card-variant", color: "#5C6BC0" },
  mainboard: { lib: MaterialCommunityIcons, name: "developer-board",        color: "#C8C2DB" },
  psu:       { lib: MaterialCommunityIcons, name: "power-plug",             color: "#7B5E47" },
  cooling:   { lib: MaterialCommunityIcons, name: "fan",                    color: "#4FC3F7" },
  monitor:   { lib: MaterialIcons,          name: "monitor",                color: "#90A4AE" },
  keyboard:  { lib: MaterialCommunityIcons, name: "keyboard",               color: "#607D8B" },
  mouse:     { lib: MaterialCommunityIcons, name: "mouse",                  color: "#78909C" },
  headset:   { lib: Ionicons,               name: "headset",                color: "#455A64" },
};

const PRICE_RANGES = [
  { label: "Dưới 5 triệu",   min: 0,          max: 5_000_000 },
  { label: "5 - 15 triệu",   min: 5_000_000,  max: 15_000_000 },
  { label: "15 - 30 triệu",  min: 15_000_000, max: 30_000_000 },
  { label: "Trên 30 triệu",  min: 30_000_000, max: Infinity },
];

const CategoryScreen = ({ navigation, route }) => {
  const { addToCart } = useCart();
  const { addToComparison, removeFromComparison, isInComparison, count: comparisonCount } = useComparison();

  const [dbCategories, setDbCategories]         = useState([]);
  const [activeCategory, setActiveCategory]     = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [hotItems, setHotItems]                 = useState([]);
  const [brands, setBrands]                     = useState([]);
  const [loadingCats, setLoadingCats]           = useState(true);
  const [loadingProducts, setLoadingProducts]   = useState(false);
  const [search, setSearch]                     = useState("");
  const [priceFilter, setPriceFilter]           = useState(null);

  // 1. Fetch categories từ DB
  useEffect(() => {
    setLoadingCats(true);
    getCategories()
      .then(res => {
        const cats = res.data;
        setDbCategories(cats);
        if (route?.params?.categoryKey) {
          const matched = cats.find(
            c => c.toLowerCase() === route.params.categoryKey.toLowerCase()
          );
          setActiveCategory(matched ?? cats[0] ?? null);
        } else {
          setActiveCategory(cats[0] ?? null);
        }
      })
      .catch(err => console.error("Lỗi fetch categories:", err))
      .finally(() => setLoadingCats(false));
  }, []);

  // 2. Cập nhật active khi navigate lại từ Home
  useEffect(() => {
    if (!route?.params?.categoryKey || dbCategories.length === 0) return;
    const matched = dbCategories.find(
      c => c.toLowerCase() === route.params.categoryKey.toLowerCase()
    );
    if (matched) setActiveCategory(matched);
  }, [route?.params?.categoryKey, dbCategories]);

  // 3. Fetch sản phẩm khi đổi category
  useEffect(() => {
    if (!activeCategory) return;
    setLoadingProducts(true);
    setSearch("");
    setPriceFilter(null);
    Promise.all([
      getProductsByCategory(activeCategory),
      getTopByCategory(activeCategory),
    ])
      .then(([prodRes, hotRes]) => {
        const prods = prodRes.data;
        setCategoryProducts(prods);
        setHotItems(hotRes.data);
        const uniqueBrands = [...new Set(prods.map(p => p.brand).filter(Boolean))];
        setBrands(uniqueBrands);
      })
      .catch(err => console.error("Lỗi fetch sản phẩm category:", err))
      .finally(() => setLoadingProducts(false));
  }, [activeCategory]);

  // 4. Filter local
  const filteredProducts = (() => {
    let result = categoryProducts;
    if (search.trim()) {
      const kw = search.trim().toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(kw) ||
        p.brand?.toLowerCase().includes(kw) ||
        p.description?.toLowerCase().includes(kw)
      );
    }
    if (priceFilter) {
      result = result.filter(p => p.price >= priceFilter.min && p.price <= priceFilter.max);
    }
    return result;
  })();

  const isFiltering = search.trim().length > 0 || priceFilter !== null;

  const renderCategoryIcon = (catName) => {
    const key     = catName?.toLowerCase() ?? "";
    const cfg     = CATEGORY_ICON_CONFIG[key] ?? { lib: MaterialCommunityIcons, name: "shape-outline", color: "#9E9E9E" };
    const IconLib = cfg.lib;
    return <IconLib name={cfg.name} size={24} color={cfg.color} />;
  };

  const renderProductCard = ({ item }) => {
    if (item._placeholder) return <View style={{ width: PRODUCT_CARD_WIDTH }} />;
    const inComparison = isInComparison(item.id);

    const handleComparisonToggle = () => {
      if (inComparison) {
        removeFromComparison(item.id);
      } else {
        addToComparison(item);
      }
    };

    return (
      <TouchableOpacity
        style={styles.productCard}
        activeOpacity={0.9}
        onPress={() => navigation.navigate("Product", { product: item })}
      >
        {item.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{item.discount}%</Text>
          </View>
        )}
        <Image source={{ uri: item.imageUrl }} style={styles.productImage} resizeMode="cover" />
        <View style={styles.productInfo}>
          <Text style={styles.productBrand}>{item.brand}</Text>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.productSpecs} numberOfLines={1}>{item.description}</Text>
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.addButton} onPress={() => addToCart(item)}>
              <Ionicons name="cart-outline" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.comparisonBtn, inComparison && styles.comparisonBtnActive]}
              onPress={handleComparisonToggle}
            >
              <Text style={[styles.comparisonBtnText, inComparison && styles.comparisonBtnTextActive]}>
                {inComparison ? "Đã thêm so sánh" : "So sánh"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const displayFiltered = filteredProducts.length % 2 !== 0
    ? [...filteredProducts, { id: "__ph__", _placeholder: true }]
    : filteredProducts;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#EB2D2D" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh mục</Text>
        {comparisonCount > 0 && (
          <TouchableOpacity
            style={styles.headerComparisonBtn}
            onPress={() => navigation.navigate("Comparison")}
          >
            <Text style={styles.headerComparisonIcon}>⚖️</Text>
            <View style={styles.comparisonBadge}>
              <Text style={styles.comparisonBadgeText}>{comparisonCount}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#222" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Bạn muốn mua gì hôm nay?"
            placeholderTextColor="#A3A3A3"
            value={search}
            onChangeText={t => { setSearch(t); setPriceFilter(null); }}
            returnKeyType="search"
          />
          {isFiltering && (
            <TouchableOpacity onPress={() => { setSearch(""); setPriceFilter(null); }}>
              <Ionicons name="close" size={18} color="#9A9A9A" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loadingCats ? (
        <ActivityIndicator size="large" color="#EB2D2D" style={{ flex: 1, alignSelf: "center" }} />
      ) : isFiltering ? (
        /* ══ KẾT QUẢ LỌC ══ */
        <View style={styles.searchResultContainer}>
          <Text style={styles.searchResultTitle}>
            {priceFilter
              ? <>Giá: <Text style={styles.searchKeyword}>{priceFilter.label}</Text></>
              : <>Kết quả: <Text style={styles.searchKeyword}>"{search}"</Text></>
            }
            {"  "}({filteredProducts.length} sản phẩm)
          </Text>
          {filteredProducts.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="search" size={46} color="#B6B6B6" />
              <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
            </View>
          ) : (
            <FlatList
              data={displayFiltered}
              keyExtractor={item => item.id.toString()}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.productList}
              columnWrapperStyle={styles.productRow}
              renderItem={renderProductCard}
            />
          )}
        </View>
      ) : (
        /* ══ LAYOUT 2 CỘT ══ */
        <View style={styles.body}>
          {/* Cột trái */}
          <ScrollView
            style={styles.leftColumn}
            contentContainerStyle={styles.leftColumnContent}
            showsVerticalScrollIndicator={false}
          >
            {dbCategories.map(cat => {
              const isActive = activeCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  activeOpacity={0.9}
                  style={[styles.categoryItem, isActive && styles.categoryItemActive]}
                  onPress={() => { setActiveCategory(cat); setSearch(""); setPriceFilter(null); }}
                >
                  {isActive && <View style={styles.activeIndicator} />}
                  <View style={styles.categoryIconWrap}>{renderCategoryIcon(cat)}</View>
                  <Text numberOfLines={2} style={[styles.categoryName, isActive && styles.categoryNameActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
            <View style={styles.bottomSpacer} />
          </ScrollView>

          {/* Cột phải */}
          <ScrollView
            style={styles.rightColumn}
            contentContainerStyle={styles.rightColumnContent}
            showsVerticalScrollIndicator={false}
          >
            {loadingProducts ? (
              <ActivityIndicator color="#EB2D2D" style={{ marginTop: 30 }} />
            ) : (
              <>
                {/* Title + Xem tất cả */}
                <View style={styles.sectionTitleCard}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>{activeCategory}</Text>
                    <TouchableOpacity onPress={() => { setSearch(activeCategory ?? ""); setPriceFilter(null); }}>
                      <Text style={styles.seeAll}>Xem tất cả &gt;</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Hãng sản xuất từ DB */}
                {brands.length > 0 && (
                  <View style={styles.sectionCard}>
                    <Text style={styles.sectionLabel}>Hãng sản xuất</Text>
                    <View style={styles.chipWrap}>
                      {brands.map(brand => (
                        <TouchableOpacity
                          key={brand}
                          style={styles.chip}
                          activeOpacity={0.8}
                          onPress={() => { setSearch(brand); setPriceFilter(null); }}
                        >
                          <Text style={styles.chipText}>{brand}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Phân khúc giá */}
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionLabel}>Phân khúc giá</Text>
                  <View style={styles.chipWrap}>
                    {PRICE_RANGES.map(range => {
                      const isActive = priceFilter?.label === range.label;
                      return (
                        <TouchableOpacity
                          key={range.label}
                          style={[styles.chip, isActive && styles.chipActive]}
                          activeOpacity={0.8}
                          onPress={() => {
                            setSearch("");
                            setPriceFilter(prev => prev?.label === range.label ? null : range);
                          }}
                        >
                          <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                            {range.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Sản phẩm HOT từ API */}
                {hotItems.length > 0 && (
                  <View style={styles.sectionCard}>
                    <Text style={styles.sectionLabel}>{activeCategory} HOT ⚡</Text>
                    <View style={{ gap: 12 }}>
                      {hotItems.map(product => (
                        <TouchableOpacity
                          key={product.id}
                          style={styles.miniProductCard}
                          activeOpacity={0.8}
                          onPress={() => navigation.navigate("Product", { product })}
                        >
                          <Image
                            source={{ uri: product.imageUrl }}
                            style={styles.miniProductImg}
                            resizeMode="cover"
                          />
                          <View style={styles.miniProductInfo}>
                            <Text style={styles.miniProductName} numberOfLines={2}>
                              {product.name}
                            </Text>
                            <Text style={styles.miniProductPrice}>
                              {formatPrice(product.price)}
                            </Text>
                            <TouchableOpacity
                              style={styles.miniAddBtn}
                              onPress={() => addToCart(product)}
                            >
                              <Text style={styles.miniAddBtnText}>+ Thêm</Text>
                            </TouchableOpacity>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </>
            )}
            <View style={styles.bottomSpacer} />
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
};

export default CategoryScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ECECEC" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#EB2D2D",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
  },

  searchContainer: {
    backgroundColor: "#EB2D2D",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBox: {
    height: 44,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 6 },
  searchInput: {
    flex: 1,
    color: "#222",
    fontSize: 15,
  },

  body: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#ECECEC",
  },

  leftColumn: {
    width: 80,
    flexShrink: 0,
    backgroundColor: "#F2F2F2",
  },
  leftColumnContent: { paddingBottom: 14 },
  categoryItem: {
    minHeight: 90,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
    paddingHorizontal: 4,
    position: "relative",
  },
  categoryItemActive: {
    backgroundColor: "#FFFFFF",
  },
  activeIndicator: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: "#EB2D2D",
  },
  categoryIconWrap: { marginBottom: 6 },
  categoryName: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
    fontWeight: "500",
  },
  categoryNameActive: {
    color: "#111",
    fontWeight: "700",
  },

  rightColumn: {
    width: 250,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  rightColumnContent: { paddingBottom: 14 },

  sectionTitleCard: {
    backgroundColor: "#F8F8F8",
    borderWidth: 1,
    borderColor: "#EBEBEB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#111",
    fontSize: 15,
    fontWeight: "800",
  },
  seeAll: {
    color: "#0066CC",
    fontSize: 13,
    fontWeight: "500",
  },

  sectionCard: {
    backgroundColor: "#F8F8F8",
    borderWidth: 1,
    borderColor: "#EBEBEB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 14,
    marginBottom: 10,
  },
  sectionLabel: {
    color: "#111",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
  },

  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: "#EB2D2D", borderColor: "#EB2D2D" },
  chipText: {
    color: "#333",
    fontSize: 12,
    fontWeight: "500",
  },
  chipTextActive: { color: "#fff" },

  bottomSpacer: { height: 20 },

  searchResultContainer: { flex: 1, backgroundColor: "#F5F5F5" },
  searchResultTitle: {
    fontSize: 13,
    color: "#666",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchKeyword: { color: "#EB2D2D", fontWeight: "700" },

  emptyWrap: {
    alignItems: "center",
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 10,
    color: "#8B8B8B",
    fontSize: 15,
  },

  productList: { paddingTop: 4, paddingBottom: 20 },
  productRow: { paddingHorizontal: 8, gap: 8, marginBottom: 8 },
  productCard: {
    width: PRODUCT_CARD_WIDTH,
    backgroundColor: "#FFF",
    borderRadius: 14,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    position: "relative",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    zIndex: 2,
    backgroundColor: "#EB2D2D",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  discountText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "800",
  },
  productImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#F0F0F0",
  },
  productInfo: { padding: 10 },
  productBrand: {
    fontSize: 10,
    color: "#EB2D2D",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  productName: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  productSpecs: {
    marginTop: 2,
    fontSize: 10,
    color: "#999",
  },
  productPrice: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "800",
    color: "#EB2D2D",
  },
  productOriginalPrice: {
    marginTop: 1,
    fontSize: 11,
    color: "#BBB",
    textDecorationLine: "line-through",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
    alignItems: "center",
  },
  addButton: {
    width: 46,
    height: 36,
    backgroundColor: "#FFB300",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#EB2D2D",
    fontSize: 12,
    fontWeight: "700",
  },
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

  headerComparisonBtn: { position: "relative", paddingHorizontal: 10, paddingVertical: 6 },
  headerComparisonIcon: { fontSize: 20, color: "#fff" },
  comparisonBadge: { position: "absolute", top: -6, right: -8, backgroundColor: "#FFD700", borderRadius: 10, minWidth: 20, height: 20, alignItems: "center", justifyContent: "center" },
  comparisonBadgeText: { fontSize: 11, fontWeight: "700", color: "#333" },

  miniProductCard: {
    flexDirection: "row",
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    padding: 8,
    alignItems: "center",
    gap: 12,
  },
  miniProductImg: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#FFF",
  },
  miniProductInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  miniProductName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    lineHeight: 18,
    marginBottom: 4,
  },
  miniProductPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#EB2D2D",
    marginBottom: 6,
  },
  miniAddBtn: {
    backgroundColor: "#EB2D2D",
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
  },
  miniAddBtnText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
});