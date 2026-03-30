import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatPrice } from "../constants/mockData";
import { useAuth } from "../context/AuthContext";
import { getMyOrderHistory, getProductById } from "../services/api";

const UserStatisticsReport = ({ navigation }) => {
  const { isLoggedIn } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // Tháng 3/2026 (0-indexed)
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  const formatDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const mapStatus = (item) => {
    const tracking = String(item?.trackingStatus || "").toUpperCase();
    if (tracking === "DELIVERING" || tracking === "PICKING") return "Đang giao";
    if (tracking === "DELIVERED" || tracking === "CONFIRMED") return "Đã thanh toán";

    const orderStatus = String(item?.status || "").toUpperCase();
    if (orderStatus === "PAID") return "Đã thanh toán";
    if (orderStatus === "PENDING") return "Chờ xử lý";
    return item?.status || "Chưa xác định";
  };

  const getDeliveryMethod = (item) => {
    const tracking = String(item?.trackingStatus || "").toUpperCase();
    if (tracking === "CONFIRMED") return "Nhận tại cửa hàng";
    if (tracking === "DELIVERING" || tracking === "PICKING" || tracking === "DELIVERED") {
      return "Giao tận nơi";
    }
    return "Không xác định";
  };

  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      if (!isLoggedIn) {
        setPurchaseHistory([]);
        return;
      }

      setLoading(true);
      setErrorText("");
      try {
        const res = await getMyOrderHistory();
        const rows = Array.isArray(res?.data) ? res.data : [];
        const normalized = rows.map((item, index) => ({
          id: `${item.orderId}-${item.productId}-${index}`,
          orderId: item.orderId,
          productId: item.productId,
          name: item.productName || "Sản phẩm",
          image: item.productImage || "",
          discount: Number(item.productDiscount || 0),
          date: formatDate(item.createdAt),
          status: mapStatus(item),
          deliveryMethod: getDeliveryMethod(item),
          price: Number(item.unitPrice || 0),
          quantity: Number(item.quantity || 0),
          lineTotal: Number(item.lineTotal || 0),
          createdAt: item.createdAt,
        }));

        if (!cancelled) {
          setPurchaseHistory(normalized);
        }
      } catch (error) {
        if (!cancelled) {
          console.log("load order history error", error?.response?.data || error?.message || error);
          setErrorText("Không tải được lịch sử mua hàng. Vui lòng thử lại.");
          setPurchaseHistory([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadHistory();

    const unsubscribe = navigation.addListener("focus", loadHistory);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [isLoggedIn, navigation]);

  const monthString = `${String(currentDate.getMonth() + 1).padStart(2, "0")}/${currentDate.getFullYear()}`;

  const filteredHistory = purchaseHistory.filter((item) =>
    item.date.endsWith(monthString),
  );

  // Tính tổng chi tiêu và tổng đơn của toàn bộ lịch sử (cố định)
  const totalSpent = purchaseHistory.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);
  const totalOrders = useMemo(() => {
    const orderSet = new Set(purchaseHistory.map((item) => item.orderId));
    return orderSet.size;
  }, [purchaseHistory]);

  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );

  const handleOpenProduct = async (item) => {
    if (!item?.productId) {
      return;
    }

    try {
      const res = await getProductById(item.productId);
      const product = res?.data;
      if (product?.id) {
        navigation.navigate("Product", { product });
      }
    } catch (error) {
      console.log("open product from history error", error?.response?.data || error?.message || error);
    }
  };

  const renderProductItem = ({ item }) => (
    <TouchableOpacity style={styles.productCard} onPress={() => handleOpenProduct(item)} activeOpacity={0.85}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        {item.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{item.discount}%</Text>
          </View>
        )}
      </View>

      <View style={styles.productInfo}>
        <View style={styles.productHeader}>
          <Text style={styles.productDate}>{item.date}</Text>
          <Text
            style={[
              styles.productStatus,
              item.status === "Đang giao"
                ? styles.statusPending
                : styles.statusDone,
            ]}
          >
            {item.status}
          </Text>
        </View>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productMeta}>{item.deliveryMethod}</Text>
        <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack?.()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử giao dịch</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.overviewContainer}>
          <View style={[styles.card, styles.overviewCard]}>
            <Text style={styles.cardLabel}>Tổng chi tiêu</Text>
            <Text style={styles.cardValueHighlight}>
              {formatPrice(totalSpent)}
            </Text>
          </View>
          <View style={styles.overviewRow}>
            <View style={[styles.card, styles.halfCard]}>
              <Text style={styles.cardLabel}>Đã mua</Text>
              <Text style={styles.cardValue}>{totalOrders} đơn</Text>
            </View>
            <View style={[styles.card, styles.halfCard]}>
              <Text style={styles.cardLabel}>Thành viên</Text>
              <Text style={styles.cardValue}>S-Member</Text>
            </View>
          </View>
        </View>

        <View style={styles.historyContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Đơn hàng</Text>
            <View style={styles.monthFilter}>
              <TouchableOpacity
                onPress={prevMonth}
                style={styles.filterBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.filterBtnText}>{"<"}</Text>
              </TouchableOpacity>
              <Text style={styles.filterMonthText}>{monthString}</Text>
              <TouchableOpacity
                onPress={nextMonth}
                style={styles.filterBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.filterBtnText}>{">"}</Text>
              </TouchableOpacity>
            </View>
          </View>
          {loading ? (
            <View style={[styles.cardList, styles.emptyContainer]}>
              <ActivityIndicator size="small" color="#D70018" />
              <Text style={styles.emptyText}>Đang tải lịch sử mua hàng...</Text>
            </View>
          ) : errorText ? (
            <View style={[styles.cardList, styles.emptyContainer]}>
              <Text style={styles.emptyText}>{errorText}</Text>
            </View>
          ) : filteredHistory.length > 0 ? (
            <View style={styles.cardList}>
              <FlatList
                data={filteredHistory}
                keyExtractor={(item) => item.id}
                renderItem={renderProductItem}
                scrollEnabled={false}
              />
            </View>
          ) : (
            <View style={[styles.cardList, styles.emptyContainer]}>
              <Text style={styles.emptyText}>Chưa có đơn hàng nào trong tháng {monthString}.</Text>
            </View>
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#D70018",
  },
  backButton: {
    marginRight: 16,
    padding: 6,
  },
  backIcon: {
    fontSize: 22,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    textTransform: "uppercase",
  },

  container: {
    padding: 16,
  },

  overviewContainer: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  overviewCard: {
    alignItems: "center",
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  overviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfCard: {
    width: "48%",
    alignItems: "center",
    marginBottom: 0,
  },
  cardLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 6,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
  },
  cardValueHighlight: {
    fontSize: 28,
    fontWeight: "900",
    color: "#D70018",
  },

  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1F2937",
    textTransform: "uppercase",
  },
  monthFilter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterBtnText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#D70018",
  },
  filterMonthText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1F2937",
    marginHorizontal: 8,
  },
  historyContainer: {
    marginBottom: 20,
  },

  productCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  imageContainer: {
    position: "relative",
    marginRight: 14,
  },
  productImage: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    resizeMode: "contain",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  discountBadge: {
    position: "absolute",
    top: -6,
    left: -6,
    backgroundColor: "#D70018",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    zIndex: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  discountText: { color: "#fff", fontSize: 10, fontWeight: "800" },

  productInfo: {
    flex: 1,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    alignItems: "center",
  },
  productDate: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  productStatus: {
  productMeta: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
    fontWeight: "600",
  },
    fontSize: 10,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    textTransform: "uppercase",
  },
  statusDone: {
    backgroundColor: "#DEF7EC",
    color: "#03543F",
    borderWidth: 1,
    borderColor: "#31C48D",
  },
  statusPending: {
    backgroundColor: "#FEF3C7",
    color: "#D97706",
    borderWidth: 1,
    borderColor: "#FACA15",
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 6,
    lineHeight: 20,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: "#D70018",
  },

  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 15,
    fontWeight: "600",
  },
});

export default UserStatisticsReport;
