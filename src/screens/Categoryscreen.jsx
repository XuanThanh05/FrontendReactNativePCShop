import {
    Ionicons,
    MaterialCommunityIcons,
    MaterialIcons,
} from "@expo/vector-icons";
import { useMemo, useState } from "react";
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
import { categoryDetail, categoryList } from "../constants/Categorydata";
import { formatPrice, hotProducts } from "../constants/mockData";
import { useCart } from "../context/CartContext";

const { width } = Dimensions.get("window");

const PRODUCT_CARD_WIDTH = (width - 28) / 2;

const CATEGORY_ICON_CONFIG = {
  laptop: { lib: MaterialCommunityIcons, name: "laptop", color: "#58A8FF" },
  cpu: { lib: MaterialCommunityIcons, name: "chip", color: "#B39DDB" },
  ram: { lib: MaterialCommunityIcons, name: "memory", color: "#A4D65E" },
  storage: { lib: MaterialCommunityIcons, name: "harddisk", color: "#8C7CC3" },
  gpu: {
    lib: MaterialCommunityIcons,
    name: "expansion-card-variant",
    color: "#5C6BC0",
  },
  mainboard: {
    lib: MaterialCommunityIcons,
    name: "developer-board",
    color: "#C8C2DB",
  },
  psu: { lib: MaterialCommunityIcons, name: "power-plug", color: "#7B5E47" },
  cooling: { lib: MaterialCommunityIcons, name: "fan", color: "#4FC3F7" },
  monitor: { lib: MaterialIcons, name: "monitor", color: "#90A4AE" },
  keyboard: { lib: MaterialCommunityIcons, name: "keyboard", color: "#607D8B" },
  mouse: { lib: MaterialCommunityIcons, name: "mouse", color: "#78909C" },
  headset: { lib: Ionicons, name: "headset", color: "#455A64" },
};

const CategoryScreen = ({ navigation }) => {
  const [activeId, setActiveId] = useState("laptop");
  const [search, setSearch] = useState("");
  const { addToCart } = useCart();

  const detail =
    categoryDetail[activeId] ?? categoryDetail[categoryList[0]?.id];
  const isSearching = search.trim().length > 0;

  const searchResults = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return [];

    return hotProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(keyword) ||
        p.brand.toLowerCase().includes(keyword) ||
        p.specs.toLowerCase().includes(keyword),
    );
  }, [search]);

  const renderCategoryIcon = (catId) => {
    const fallback = {
      lib: MaterialCommunityIcons,
      name: "shape-outline",
      color: "#9E9E9E",
    };
    const config = CATEGORY_ICON_CONFIG[catId] || fallback;
    const IconComponent = config.lib;

    return <IconComponent name={config.name} size={24} color={config.color} />;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#EB2D2D" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh mục</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons
            name="search"
            size={18}
            color="#222"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Bạn muốn mua gì hôm nay?"
            placeholderTextColor="#A3A3A3"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {isSearching && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close" size={18} color="#9A9A9A" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isSearching ? (
        <View style={styles.searchResultContainer}>
          <Text style={styles.searchResultTitle}>
            Kết quả cho{" "}
            <Text style={styles.searchKeyword}>&quot;{search}&quot;</Text> (
            {searchResults.length} sản phẩm)
          </Text>

          {searchResults.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="search" size={46} color="#B6B6B6" />
              <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.productList}
              columnWrapperStyle={styles.productRow}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.productCard}
                  activeOpacity={0.9}
                  onPress={() =>
                    navigation.navigate("Product", { product: item })
                  }
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
                    <Text style={styles.productName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.productSpecs} numberOfLines={1}>
                      {item.specs}
                    </Text>
                    <Text style={styles.productPrice}>
                      {formatPrice(item.price)}
                    </Text>
                    {item.originalPrice > item.price && (
                      <Text style={styles.productOriginalPrice}>
                        {formatPrice(item.originalPrice)}
                      </Text>
                    )}
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => addToCart(item)}
                    >
                      <Text style={styles.addButtonText}>+ Thêm vào giỏ</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      ) : (
        <View style={styles.body}>
          <ScrollView
            style={styles.leftColumn}
            contentContainerStyle={styles.leftColumnContent}
            showsVerticalScrollIndicator={false}
          >
            {categoryList.map((cat) => {
              const isActive = activeId === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  activeOpacity={0.9}
                  style={[
                    styles.categoryItem,
                    isActive && styles.categoryItemActive,
                  ]}
                  onPress={() => setActiveId(cat.id)}
                >
                  {isActive && <View style={styles.activeIndicator} />}
                  <View style={styles.categoryIconWrap}>
                    {renderCategoryIcon(cat.id)}
                  </View>
                  <Text
                    numberOfLines={2}
                    style={[
                      styles.categoryName,
                      isActive && styles.categoryNameActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
            <View style={styles.bottomSpacer} />
          </ScrollView>

          <ScrollView
            style={styles.rightColumn}
            contentContainerStyle={styles.rightColumnContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.sectionTitleCard}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>{detail.title}</Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setSearch(detail.title)}
                >
                  <Text style={styles.seeAll}>Xem tất cả &gt;</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionLabel}>Hãng sản xuất</Text>
              <View style={styles.chipWrap}>
                {detail.brands.map((brand, index) => (
                  <TouchableOpacity
                    key={`${brand}-${index}`}
                    style={styles.chip}
                    activeOpacity={0.8}
                    onPress={() => setSearch(brand)}
                  >
                    <Text style={styles.chipText}>{brand}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionLabel}>Phân khúc giá</Text>
              <View style={styles.chipWrap}>
                {detail.priceRanges.map((range, index) => (
                  <TouchableOpacity
                    key={`${range.label}-${index}`}
                    style={styles.chip}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.chipText}>{range.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionLabel}>{detail.title} HOT ⚡</Text>
              <View style={styles.hotWrap}>
                {detail.hotItems.map((item, index) => (
                  <TouchableOpacity
                    key={`${item.label}-${index}`}
                    style={styles.hotChip}
                    activeOpacity={0.8}
                    onPress={() => setSearch(item.label)}
                  >
                    <Text style={styles.hotChipText}>{item.label}</Text>
                    {item.tag !== "" && (
                      <View
                        style={[
                          styles.hotBadge,
                          item.tag === "HOT"
                            ? styles.badgeHot
                            : styles.badgeNew,
                        ]}
                      >
                        <Text style={styles.hotBadgeText}>{item.tag}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Render Category Products to test */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionLabel}>Sản phẩm gợi ý</Text>
              <View style={{ gap: 12 }}>
                {hotProducts.filter((p) => p.category === activeId).length ===
                0 ? (
                  <Text
                    style={{ fontSize: 13, color: "#888", fontStyle: "italic" }}
                  >
                    Chưa có sản phẩm demo cho danh mục này.
                  </Text>
                ) : (
                  hotProducts
                    .filter((p) => p.category === activeId)
                    .slice(0, 5)
                    .map((product) => (
                      <TouchableOpacity
                        key={product.id}
                        style={styles.miniProductCard}
                        activeOpacity={0.8}
                        onPress={() =>
                          navigation.navigate("Product", { product })
                        }
                      >
                        <Image
                          source={{ uri: product.image }}
                          style={styles.miniProductImg}
                        />
                        <View style={styles.miniProductInfo}>
                          <Text
                            style={styles.miniProductName}
                            numberOfLines={2}
                          >
                            {product.name}
                          </Text>
                          <Text style={styles.miniProductPrice}>
                            {formatPrice(product.price)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))
                )}
              </View>
            </View>

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
    width: 1,
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
  chipText: {
    color: "#333",
    fontSize: 12,
    fontWeight: "500",
  },

  hotWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  hotChip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  hotChipText: {
    color: "#333",
    fontSize: 12,
    fontWeight: "600",
  },
  hotBadge: {
    marginLeft: 8,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeHot: { backgroundColor: "#EB2D2D" },
  badgeNew: { backgroundColor: "#43A047" },
  hotBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },

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
  addButton: {
    marginTop: 8,
    backgroundColor: "#FFF0F0",
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: "center",
  },
  addButtonText: {
    color: "#EB2D2D",
    fontSize: 12,
    fontWeight: "700",
  },
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
  },
});
