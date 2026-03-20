// src/screens/ProductDetailScreen.js
import { Feather, Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatPrice } from "../constants/mockData";
import { useCart } from "../context/CartContext";

const UU_DAI = [
  "Gói 15 ngày bao test.",
  "Balo hoặc túi chống sốc.",
  "Chuột quang gaming và bàn di chuột.",
  "Gói cài đặt Windows và phần mềm trọn đời.",
];

const TRO_GIA = [
  "Khi mua phụ kiện theo máy.",
  "Khi mua RAM và SSD nâng cấp thêm.",
  "Khi sử dụng dịch vụ sửa chữa sau bảo hành (tùy từng khung giá).",
];

const FLASH_COUNTDOWN = [
  { key: "day", label: "NGÀY", value: "11" },
  { key: "hour", label: "GIỜ", value: "13" },
  { key: "minute", label: "PHÚT", value: "28" },
  { key: "second", label: "GIÂY", value: "25" },
];

const RELATED = [
  {
    id: 1,
    name: "Lenovo IdeaPad Gaming 3 i5-12500H RTX 3050",
    price: 22490000,
    discount: 10,
    emoji: "💻",
  },
  {
    id: 2,
    name: "ASUS TUF Gaming F15 i7-12700H RTX 4060",
    price: 29990000,
    discount: 8,
    emoji: "💻",
  },
  {
    id: 3,
    name: "MSI Cyborg 15 A13VF i7-13620H RTX 4060",
    price: 26490000,
    discount: 15,
    emoji: "💻",
  },
  {
    id: 4,
    name: "Acer Nitro 5 AN515 i7-12700H RTX 3060",
    price: 27990000,
    discount: 5,
    emoji: "💻",
  },
];

const SPEC_LABELS = [
  "CPU (Bộ vi xử lý)",
  "Ram (Bộ nhớ trong)",
  "Storage (Ổ cứng)",
  "Màn hình",
  "Card đồ họa",
];

const SPEC_DEFAULTS = [
  "Intel Core i7 13650HX (14 nhân 20 luồng, xung nhịp cơ bản 2.6GHz, turbo boost 4.9GHz, 24MB Intel Smart Cache).",
  "16GB DDR5 có thể nâng cấp được.",
  "512GB SSD M.2 PCIe NVMe (hỗ trợ nâng cấp thêm khe SSD tùy cấu hình).",
  "15.6 inch FHD (1920x1080) IPS, 300 nits, 144Hz, 100% sRGB, G-SYNC.",
  "NVIDIA GeForce RTX 5050 8GB GDDR7, Boost Clock 2370MHz, TGP 100W, 440 AI TOPS.",
];

const ACTION_ICON_BLUE = "#5AA8FF";

const parseSpecs = (specString = "") => {
  const values = specString
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

  return SPEC_LABELS.map((label, index) => ({
    label,
    value: values[index] || SPEC_DEFAULTS[index],
  }));
};

const CheckCircle = () => (
  <View style={styles.checkCircle}>
    <Text style={styles.checkTick}>✓</Text>
  </View>
);

const BenefitRow = ({ text }) => (
  <View style={styles.benefitRow}>
    <CheckCircle />
    <Text style={styles.benefitText}>{text}</Text>
  </View>
);

const Checkbox = ({ checked }) => (
  <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
    {checked && <Text style={styles.checkboxTick}>✓</Text>}
  </View>
);

const ComboItem = ({ item, isLast }) => (
  <View style={[styles.comboItem, isLast && { borderBottomWidth: 0 }]}>
    <Checkbox checked={item.checked} />
    <View style={styles.comboImageBox}>
      <Text style={styles.comboEmoji}>{item.emoji}</Text>
    </View>
    <View style={styles.comboInfo}>
      <Text style={styles.comboName} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.comboPrice}>{formatPrice(item.price)}</Text>
    </View>
  </View>
);

const SpecRow = ({ label, value, isLast, index }) => (
  <View
    style={[
      styles.specRow,
      index % 2 === 0 && styles.specRowAlt,
      isLast && { borderBottomWidth: 0 },
    ]}
  >
    <Text style={styles.specLabel}>{label}</Text>
    <Text style={styles.specValue}>{value}</Text>
  </View>
);

const RelatedCard = ({ item }) => (
  <TouchableOpacity activeOpacity={0.8} style={styles.relatedCard}>
    <View style={styles.relatedImageBox}>
      <View style={styles.smallDiscountBadge}>
        <Text style={styles.smallDiscountBadgeText}>-{item.discount}%</Text>
      </View>
      <Text style={styles.relatedEmoji}>{item.emoji}</Text>
    </View>
    <View style={styles.relatedBody}>
      <Text style={styles.relatedName} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.relatedPrice}>{formatPrice(item.price)}</Text>
    </View>
  </TouchableOpacity>
);

const THUMBNAIL_IMAGES = [
  "https://trungtran.vn/upload_images/images/products/legion-pro/large/legion_pro_5_r9000p_16adr10_2025%20(1).jpg",
  "https://trungtran.vn/upload_images/images/products/legion-pro/large/legion_pro_5_r9000p_16adr10_2025%20(3).jpg",
  "https://trungtran.vn/upload_images/images/products/legion-pro/large/legion_pro_5_r9000p_16adr10_2025%20(5).jpg",
  "https://trungtran.vn/upload_images/images/products/legion-pro/large/legion_pro_5_r9000p_16adr10_2025%20(6).jpg",
  "https://trungtran.vn/upload_images/images/products/legion-pro/large/legion_pro_5_r9000p_16adr10_2025%20(7).jpg",
  "https://trungtran.vn/upload_images/images/products/legion-pro/large/legion_pro_5_r9000p_16adr10_2025%20(11).jpg",
  "https://trungtran.vn/upload_images/images/products/legion-pro/large/legion_pro_5_r9000p_16adr10_2025%20(14).jpg",
];

const FlashTimeBox = ({ value, label }) => (
  <View style={styles.flashTimeBox}>
    <Text style={styles.flashTimeValue}>{value}</Text>
    <Text style={styles.flashTimeLabel}>{label}</Text>
  </View>
);

const ProductDetailScreen = ({ route, navigation }) => {
  const { product } = route.params;
  const { addToCart, totalItems } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [combos, setCombos] = useState([
    {
      id: 1,
      name: "Chuột gaming Logitech G305 Lightspeed Wireless",
      price: 790000,
      listPrice: 890000,
      emoji: "🖱️",
      checked: true,
    },
    {
      id: 2,
      name: "Tai nghe gaming Logitech G335 Wired",
      price: 990000,
      listPrice: 1190000,
      emoji: "🎧",
      checked: false,
    },
  ]);

  const specs = parseSpecs(product.specs);

  const toggleCombo = (id) => {
    setCombos((prevCombos) => {
      const nextCombos = prevCombos.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            checked: !item.checked,
          };
        }

        return item;
      });

      return nextCombos;
    });
  };

  const getComboSummary = () => {
    // Tổng tiền luôn bao gồm sản phẩm chính hiện tại
    let total = product.price;

    // Tiết kiệm chỉ tính từ phụ kiện trong combo
    let saving = 0;

    for (let i = 0; i < combos.length; i += 1) {
      const item = combos[i];
      if (item.checked) {
        total += item.price;
        const itemListPrice = item.listPrice || item.price;
        saving += Math.max(0, itemListPrice - item.price);
      }
    }

    return {
      total,
      saving,
    };
  };

  const comboSummary = getComboSummary();
  const comboTotal = comboSummary.total;
  const comboSaving = comboSummary.saving;

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleBuyNow = () => {
    navigation.navigate("Checkout", { product });
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => {
      if (prevIndex === 0) {
        return THUMBNAIL_IMAGES.length - 1;
      }

      return prevIndex - 1;
    });
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => {
      const lastIndex = THUMBNAIL_IMAGES.length - 1;

      if (prevIndex === lastIndex) {
        return 0;
      }

      return prevIndex + 1;
    });
  };

  const currentImage = THUMBNAIL_IMAGES[currentImageIndex] || product.image;
  const rating = Math.round(product.rating || 0);
  const outOfStock = product.stock === 0;
  const stockLabel = outOfStock ? "Hết hàng" : "Sẵn hàng";

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}
        >
          <Text style={styles.headerBtnIcon}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          Thông tin sản phẩm
        </Text>

        <TouchableOpacity
          style={styles.headerCartBtn}
          onPress={() => navigation.navigate("Main", { screen: "Cart" })}
        >
          <Text style={styles.headerBtnIcon}>🛒</Text>
          {totalItems > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.topSection}>
          <Text style={styles.topProductName}>{product.name}</Text>

          <View style={styles.topRatingRow}>
            <Text style={styles.topStars}>{"★".repeat(rating)}</Text>
            <Text style={styles.topReviewCount}> {rating} |</Text>
            <View
              style={[
                styles.saleStatusBadge,
                outOfStock && styles.saleStatusBadgeOut,
              ]}
            >
              <Text
                style={[
                  styles.saleStatusText,
                  outOfStock && styles.saleStatusTextOut,
                ]}
              >
                {stockLabel}
              </Text>
            </View>
          </View>

          <View style={styles.mainImageContainer}>
            <TouchableOpacity onPress={handlePrevImage} style={styles.arrowBtn}>
              <Text style={styles.arrowText}>‹</Text>
            </TouchableOpacity>
            <View style={styles.mainImageWrap}>
              <Image
                source={{ uri: currentImage }}
                style={styles.mainImage}
                resizeMode="contain"
              />
            </View>
            <TouchableOpacity onPress={handleNextImage} style={styles.arrowBtn}>
              <Text style={styles.arrowText}>›</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailScroll}
          >
            {THUMBNAIL_IMAGES.map((img, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setCurrentImageIndex(idx)}
                style={[
                  styles.thumbnail,
                  currentImageIndex === idx && styles.thumbnailActive,
                ]}
              >
                <Image
                  source={{ uri: img }}
                  style={styles.thumbnailImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.actionBtn}>
              <View style={styles.videoIconBox}>
                <Ionicons
                  name="play"
                  size={14}
                  color="#FFFFFF"
                  style={styles.videoPlay}
                />
              </View>
              <Text style={styles.actionLabel}>Video review</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Feather name="plus-square" size={22} color={ACTION_ICON_BLUE} />
              <Text style={styles.actionLabel}>So sánh</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="heart-outline" size={25} color="#F97316" />
              <Text style={styles.actionLabel}>Yêu thích</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleAddToCart}
            >
              <Text style={styles.headerBtnIcon}>🛒</Text>
              <Text style={styles.actionLabel}>Thêm giỏ hàng</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.dividerTop} />

        <View style={styles.section}>
          <View style={styles.flashBanner}>
            <View style={styles.flashLeft}>
              <Text style={styles.flashTitle}>F⚡ASH SALE</Text>
              <Text style={styles.flashSubTitle}>KẾT THÚC TRONG</Text>
            </View>
            <View style={styles.flashTimeRow}>
              {FLASH_COUNTDOWN.map((item) => (
                <FlashTimeBox
                  key={item.key}
                  value={item.value}
                  label={item.label}
                />
              ))}
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            {product.originalPrice > product.price && (
              <Text style={styles.originalPrice}>
                {formatPrice(product.originalPrice)}
              </Text>
            )}
            <Text style={styles.vatText}>(Đã bao gồm VAT)</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <Text style={styles.blockTitle}>ƯU ĐÃI</Text>
          </View>
          <View style={styles.infoCardDivider} />
          <View style={styles.infoCardContent}>
            {UU_DAI.map((text, i) => (
              <BenefitRow key={i} text={text} />
            ))}
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <Text style={styles.blockTitle}>TRỢ GIÁ 5%</Text>
          </View>
          <View style={styles.infoCardDivider} />
          <View style={styles.infoCardContent}>
            {TRO_GIA.map((text, i) => (
              <BenefitRow key={i} text={text} />
            ))}
          </View>
        </View>

        <View style={styles.serviceRow}>
          <View style={styles.serviceItem}>
            <Text style={styles.serviceIcon}>🛡️</Text>
            <Text style={styles.serviceText}>Bảo hành toàn diện</Text>
          </View>
          <View style={styles.serviceDivider} />
          <View style={styles.serviceItem}>
            <Text style={styles.serviceIcon}>🚚</Text>
            <Text style={styles.serviceText}>Giao hàng toàn quốc</Text>
          </View>
        </View>

        <View style={styles.ctaWrap}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.btnMain, outOfStock && styles.btnDisabled]}
            onPress={handleBuyNow}
            disabled={outOfStock}
          >
            <Text style={styles.btnMainText}>
              {outOfStock ? "HẾT HÀNG" : "MUA NGAY"}
            </Text>
            <Text style={styles.btnMainSub}>
              ( Giao tận nơi hoặc nhận tại cửa hàng )
            </Text>
          </TouchableOpacity>

          <View style={styles.btnRow}>
            <TouchableOpacity activeOpacity={0.85} style={styles.btnOutline}>
              <Text style={styles.btnOutlineText}>TRẢ GÓP</Text>
              <Text style={styles.btnOutlineSub}>
                ( Thủ tục nhanh chóng nhận máy ngay )
              </Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85} style={styles.btnOutline}>
              <Text style={styles.btnOutlineText}>TRẢ GÓP QUA THẺ</Text>
              <Text style={styles.btnOutlineSub}>
                Visa, Mastercard, JCB, Amex
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mua theo combo</Text>
          {combos.map((item, i) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => toggleCombo(item.id)}
            >
              <ComboItem item={item} isLast={i === combos.length - 1} />
            </TouchableOpacity>
          ))}
          <View style={styles.comboTotalRow}>
            <Text style={styles.comboTotalLabel}>Tổng tiền combo:</Text>
            <Text style={styles.comboTotalValue}>
              {formatPrice(comboTotal)}
            </Text>
          </View>
          <Text style={styles.comboSavingText}>
            Tiết kiệm {formatPrice(comboSaving)} (so với mua lẻ)
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông số kỹ thuật</Text>
          {specs.map((s, i) => (
            <SpecRow
              key={i}
              label={s.label}
              value={s.value}
              isLast={i === specs.length - 1}
              index={i}
            />
          ))}
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Điểm giá trị nổi bật</Text>
          <View style={styles.productImageBox}>
            <Image
              source={{ uri: product.image }}
              style={styles.highlightImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.expertTitle}>
            {product.brand} - Hiệu năng mạnh mẽ cho học tập và gaming
          </Text>
          <Text style={styles.expertBody}>
            Sản phẩm được tối ưu hiệu năng để đáp ứng tốt nhu cầu học tập, làm
            việc lẫn giải trí. Tản nhiệt ổn định, thiết kế hiện đại và cấu hình
            cân bằng giúp máy hoạt động mượt mà trong thời gian dài.
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đánh giá từ khách hàng</Text>
          <View style={styles.ratingOverview}>
            <View style={styles.ratingLeft}>
              <Text style={styles.ratingBig}>
                {(product.rating || 0).toFixed(1)}
              </Text>
              <Text style={[styles.stars, { fontSize: 18 }]}>
                {"★".repeat(Math.round(product.rating || 0))}
              </Text>
              <Text style={styles.reviewCountSub}>
                {product.reviews || 0} đánh giá
              </Text>
            </View>
            <View style={styles.ratingBars}>
              {[5, 4, 3, 2, 1].map((star) => (
                <View key={star} style={styles.ratingBarRow}>
                  <Text style={styles.ratingBarLabel}>{star}★</Text>
                  <View style={styles.ratingBarTrack}>
                    <View style={styles.ratingBarFill} />
                  </View>
                  <Text style={styles.ratingBarCount}>0</Text>
                </View>
              ))}
            </View>
          </View>
          <TouchableOpacity activeOpacity={0.8} style={styles.btnReview}>
            <Text style={styles.btnReviewText}>Viết đánh giá</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sản phẩm tương tự</Text>
          <View style={styles.relatedGrid}>
            {RELATED.map((item) => (
              <RelatedCard key={item.id} item={item} />
            ))}
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductDetailScreen;

const ORANGE = "#E8580A";
const ORANGE_LIGHT = "#FEF0E7";
const DIVIDER_COLOR = "#EBEBEB";
const TEXT_MAIN = "#1A1A1A";
const TEXT_MUTED = "#888888";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  headerBtn: { padding: 4 },
  headerCartBtn: { padding: 4, position: "relative" },
  headerBtnIcon: { fontSize: 28, color: "#1a1a1a", lineHeight: 30 },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginHorizontal: 10,
  },
  cartBadge: {
    position: "absolute",
    top: -2,
    right: -4,
    backgroundColor: "#E53935",
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  cartBadgeText: { fontSize: 9, color: "#fff", fontWeight: "900" },
  topSection: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  topProductName: {
    fontSize: 13,
    color: TEXT_MAIN,
    lineHeight: 18,
    marginBottom: 10,
    fontWeight: "600",
  },
  topRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 4,
  },
  topStars: { color: "#CCCCCC", fontSize: 14, letterSpacing: 2 },
  topReviewCount: { fontSize: 12, color: TEXT_MUTED, marginHorizontal: 4 },
  saleStatusBadge: {
    backgroundColor: ORANGE_LIGHT,
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 4,
  },
  saleStatusBadgeOut: { backgroundColor: "#FEE2E2" },
  saleStatusText: { fontSize: 10, color: ORANGE, fontWeight: "600" },
  saleStatusTextOut: { color: "#DC2626" },
  mainImageContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  arrowBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
  },
  arrowText: { fontSize: 20, color: TEXT_MAIN, fontWeight: "600" },
  mainImageWrap: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
    height: 240,
    alignItems: "center",
    justifyContent: "center",
  },
  mainImage: { width: "90%", height: "90%" },
  thumbnailScroll: { marginBottom: 12 },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: "#EBEBEB",
  },
  thumbnailActive: { borderColor: ORANGE, backgroundColor: "#FFF8F3" },
  thumbnailImage: { width: "85%", height: "85%" },
  actionButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 10,
  },
  actionBtn: { flex: 1, alignItems: "center", gap: 6, paddingVertical: 8 },
  videoIconBox: {
    width: 42,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#FF1F1F",
    alignItems: "center",
    justifyContent: "center",
  },
  videoPlay: { marginLeft: 2 },
  actionLabel: { fontSize: 12, color: "#4B5563", textAlign: "center" },
  dividerTop: { height: 8, backgroundColor: "#F2F2F2" },
  container: { flex: 1, backgroundColor: "#F2F2F2" },
  section: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  divider: { height: 8, backgroundColor: "#F2F2F2" },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_MAIN,
    marginBottom: 12,
  },
  stars: { color: "#F5A623", fontSize: 13, letterSpacing: 1 },
  flashBanner: {
    backgroundColor: "#F24A1E",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  flashLeft: { flex: 1 },
  flashTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
    lineHeight: 24,
  },
  flashSubTitle: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  flashTimeRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  flashTimeBox: {
    width: 36,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    paddingVertical: 4,
  },
  flashTimeValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F24A1E",
    lineHeight: 16,
  },
  flashTimeLabel: {
    fontSize: 8,
    fontWeight: "700",
    color: "#F24A1E",
    lineHeight: 10,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 8,
  },
  price: { fontSize: 26, fontWeight: "700", color: ORANGE },
  originalPrice: {
    fontSize: 13,
    color: TEXT_MUTED,
    textDecorationLine: "line-through",
  },
  vatText: { fontSize: 13, color: ORANGE, fontWeight: "500" },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F2C2AD",
    borderRadius: 10,
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 8,
    overflow: "hidden",
  },
  infoCardHeader: {
    backgroundColor: ORANGE_LIGHT,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  infoCardDivider: { height: 1, backgroundColor: "#F2C2AD" },
  infoCardContent: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  blockTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: ORANGE,
    letterSpacing: 0.4,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingVertical: 4,
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    flexShrink: 0,
  },
  checkTick: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 13,
  },
  benefitText: { flex: 1, fontSize: 13, color: "#5D2E0A", lineHeight: 20 },
  serviceRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flex: 1,
    justifyContent: "center",
  },
  serviceIcon: { fontSize: 14 },
  serviceText: { fontSize: 12, color: TEXT_MUTED },
  serviceDivider: {
    width: 1,
    height: 18,
    backgroundColor: DIVIDER_COLOR,
    marginHorizontal: 8,
  },
  ctaWrap: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 4,
  },
  btnMain: {
    backgroundColor: ORANGE,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 8,
  },
  btnMainText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  btnMainSub: { color: "rgba(255,255,255,0.85)", fontSize: 11, marginTop: 2 },
  btnRow: { flexDirection: "row", gap: 8 },
  btnOutline: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: ORANGE,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  btnOutlineText: {
    color: ORANGE,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  btnOutlineSub: {
    color: TEXT_MUTED,
    fontSize: 10,
    marginTop: 2,
    textAlign: "center",
  },
  comboItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: DIVIDER_COLOR,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#CCCCCC",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: ORANGE, borderColor: ORANGE },
  checkboxTick: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 14,
  },
  comboImageBox: {
    width: 52,
    height: 52,
    borderRadius: 6,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    borderWidth: 0.5,
    borderColor: DIVIDER_COLOR,
  },
  comboEmoji: { fontSize: 22 },
  comboInfo: { flex: 1 },
  comboName: {
    fontSize: 12,
    color: TEXT_MAIN,
    lineHeight: 17,
    marginBottom: 4,
  },
  comboPrice: { fontSize: 13, color: ORANGE, fontWeight: "600" },
  comboTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: DIVIDER_COLOR,
    marginTop: 2,
  },
  comboTotalLabel: { fontSize: 13, color: TEXT_MUTED },
  comboTotalValue: { fontSize: 16, fontWeight: "700", color: ORANGE },
  comboSavingText: {
    marginTop: 6,
    fontSize: 12,
    color: "#16A34A",
    fontWeight: "600",
  },
  specRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: DIVIDER_COLOR,
  },
  specRowAlt: { backgroundColor: "#F3F4F6" },
  specLabel: {
    width: "38%",
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "700",
    lineHeight: 20,
  },
  specValue: { flex: 1, fontSize: 13, color: "#6B7280", lineHeight: 20 },
  productImageBox: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  highlightImage: { width: "90%", height: "90%" },
  expertTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_MAIN,
    marginBottom: 6,
  },
  expertBody: { fontSize: 13, color: TEXT_MUTED, lineHeight: 21 },
  ratingOverview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 8,
    marginBottom: 12,
  },
  ratingLeft: { alignItems: "center", gap: 4 },
  ratingBig: {
    fontSize: 40,
    fontWeight: "700",
    color: TEXT_MAIN,
    lineHeight: 46,
  },
  reviewCountSub: { fontSize: 11, color: TEXT_MUTED },
  ratingBars: { flex: 1, gap: 5 },
  ratingBarRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  ratingBarLabel: { fontSize: 11, color: TEXT_MUTED, width: 22 },
  ratingBarTrack: {
    flex: 1,
    height: 4,
    backgroundColor: "#EBEBEB",
    borderRadius: 2,
  },
  ratingBarFill: {
    height: 4,
    width: 0,
    backgroundColor: "#F5A623",
    borderRadius: 2,
  },
  ratingBarCount: {
    fontSize: 11,
    color: TEXT_MUTED,
    width: 14,
    textAlign: "right",
  },
  btnReview: {
    borderWidth: 1.5,
    borderColor: ORANGE,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  btnReviewText: { color: ORANGE, fontSize: 14, fontWeight: "600" },
  relatedGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  relatedCard: {
    width: "48.5%",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: DIVIDER_COLOR,
    overflow: "hidden",
  },
  relatedImageBox: {
    backgroundColor: "#F5F5F5",
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  smallDiscountBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: ORANGE,
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  smallDiscountBadgeText: { fontSize: 10, color: "#FFFFFF", fontWeight: "600" },
  relatedEmoji: { fontSize: 32 },
  relatedBody: { padding: 8 },
  relatedName: {
    fontSize: 11,
    color: TEXT_MAIN,
    lineHeight: 16,
    marginBottom: 5,
  },
  relatedPrice: { fontSize: 13, color: ORANGE, fontWeight: "600" },
  btnDisabled: { backgroundColor: "#ccc" },
});
