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
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // Tháng 3/2026
  const [activeTab, setActiveTab] = useState("Tất cả"); // State cho Tab
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Danh sách các Tab chuẩn
  const TABS = ["Tất cả", "Chờ xử lý", "Đang giao", "Thành công", "Đã hủy"];

  const formatDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    let cancelled = false;

    const fetchOrders = async () => {
      if (!isLoggedIn) {
        setPurchaseHistory([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await getMyOrderHistory();
        const rawData = Array.isArray(res?.data) ? res.data : [];
        
        // Nhóm các sản phẩm lẻ thành từng đơn hàng (dựa trên orderId)
        const groupedOrders = {};
        rawData.forEach(item => {
          if (!groupedOrders[item.orderId]) {
            groupedOrders[item.orderId] = {
              id: item.orderId,
              date: formatDate(item.createdAt),
              rawStatus: String(item.status || "").toUpperCase(),
              trackingStatus: String(item.trackingStatus || "").toUpperCase(),
              items: [],
              totalAmount: 0
            };
          }
          groupedOrders[item.orderId].items.push(item);
          groupedOrders[item.orderId].totalAmount += Number(item.lineTotal || 0);
        });

        const mappedOrders = Object.values(groupedOrders).map(order => {
          const firstItem = order.items[0] || {};
          const extraCount = order.items.length > 1 ? order.items.length - 1 : 0;

          // Map chuẩn Status Backend sang Text hiển thị trên UI
          let displayStatus = "Thành công";
          const rawStatus = order.rawStatus;
          const tracking = order.trackingStatus;

          if (tracking === "DELIVERING" || tracking === "PICKING") displayStatus = "Đang giao";
          else if (tracking === "DELIVERED" || tracking === "CONFIRMED") displayStatus = "Thành công";
          else if (rawStatus === "PAID") displayStatus = "Thành công";
          else if (rawStatus === "PENDING" || rawStatus === "PROCESSING") displayStatus = "Chờ xử lý";
          else if (rawStatus === "CANCELLED") displayStatus = "Đã hủy";

          return {
            id: order.id,
            price: order.totalAmount,
            date: order.date,
            status: displayStatus,
            name: firstItem.productName || `Đơn hàng #${order.id}`,
            image: firstItem.productImage || "https://via.placeholder.com/150",
            extraCount: extraCount,
            discount: Number(firstItem.productDiscount || 0),
            productId: firstItem.productId // Dùng để mở chi tiết SP
          };
        });

        // Sắp xếp đơn mới nhất trên cùng
        mappedOrders.sort((a, b) => b.id - a.id);
        
        if (!cancelled) {
          setPurchaseHistory(mappedOrders);
        }
      } catch (error) {
        console.log("Lỗi lấy lịch sử mua hàng:", error?.response?.data || error?.message || error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    const unsubscribe = navigation.addListener("focus", fetchOrders);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [isLoggedIn, navigation]);

  const monthString = `${String(currentDate.getMonth() + 1).padStart(2, "0")}/${currentDate.getFullYear()}`;

  // 1. Lọc theo tháng
  const filteredByMonth = purchaseHistory.filter((item) =>
    item.date.endsWith(monthString),
  );

  // 2. Lọc theo Tab (Từ list đã lọc tháng)
  const filteredHistory = filteredByMonth.filter((item) => {
    if (activeTab === "Tất cả") return true;
    return item.status === activeTab;
  });

  // Tính tổng chi tiêu của toàn bộ lịch sử (Thực tế)
  const totalSpent = purchaseHistory.reduce((sum, item) => sum + item.price, 0);
  const totalOrders = purchaseHistory.length;

  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );

  const handleOpenProduct = async (item) => {
    if (!item?.productId) return;
    try {
      const res = await getProductById(item.productId);
      if (res?.data?.id) {
        navigation.navigate("Product", { product: res.data });
      }
    } catch (error) {
      console.log("Lỗi mở chi tiết sản phẩm:", error);
    }
  };

  const renderProductItem = ({ item }) => {
    const isSuccess = item.status === "Đã giao" || item.status === "Thành công" || item.status === "Đã nhận hàng";

    return (
      <View style={styles.orderCard}>
        {/* Header: Đơn hàng & Trạng thái */}
        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderLeft}>
            <Text style={styles.orderIdText}>
              Đơn hàng: <Text style={styles.orderIdHighlight}>#{item.id}</Text>
            </Text>
            <Text style={styles.orderDate}>{item.date}</Text>
          </View>
          <Text
            style={[
              styles.orderStatus,
              isSuccess ? styles.statusSuccess : styles.statusWarning,
            ]}
          >
            {item.status}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Body: Hình ảnh & Tên sản phẩm */}
        <View style={styles.orderBody}>
          <View style={styles.imageWrapper}>
            <Image source={{ uri: item.image }} style={styles.productImage} />
            {item.discount > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{item.discount}%</Text>
              </View>
            )}
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>
            {item.extraCount > 0 && (
              <Text style={styles.extraItemsText}>
                + {item.extraCount} sản phẩm khác
              </Text>
            )}
            <Text style={styles.productPriceRow}>
              Tổng tiền: <Text style={styles.productPriceValue}>{formatPrice(item.price)}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Footer: Tổng tiền & Nút Xem chi tiết */}
        <View style={styles.orderFooter}>
          <TouchableOpacity 
            style={styles.btnDetailFullWidth} 
            activeOpacity={0.7} 
            onPress={() => handleOpenProduct(item)}
          >
            <Text style={styles.btnDetailTextBlue}>Xem chi tiết</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
        <View style={styles.modernOverview}>
          <View style={styles.modernOverviewItem}>
            <Text style={styles.modernOverviewLabel}>TỔNG CHI TIÊU</Text>
            <Text style={styles.modernOverviewValueHighlight}>
              {formatPrice(totalSpent)}
            </Text>
          </View>
          <View style={styles.modernOverviewDivider} />
          <View style={styles.modernOverviewItem}>
            <Text style={styles.modernOverviewLabel}>SỐ ĐƠN</Text>
            <Text style={styles.modernOverviewValue}>
              {totalOrders}
            </Text>
          </View>
        </View>

        <View style={styles.historyContainer}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>ĐƠN HÀNG ĐÃ MUA</Text>
            </View>
            <View style={styles.monthFilter}>
              <TouchableOpacity onPress={prevMonth} style={styles.filterBtn}><Text style={styles.filterBtnText}>{"<"}</Text></TouchableOpacity>
              <Text style={styles.filterMonthText}>Th{currentDate.getMonth() + 1}.{currentDate.getFullYear()}</Text>
              <TouchableOpacity onPress={nextMonth} style={styles.filterBtn}><Text style={styles.filterBtnText}>{">"}</Text></TouchableOpacity>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16, flexDirection: 'row' }}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {loading ? (
            <ActivityIndicator size="large" color="#D70018" style={{ marginTop: 20 }} />
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

  modernOverview: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    flexDirection: "row",
    paddingVertical: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  modernOverviewItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modernOverviewDivider: {
    width: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 4,
  },
  modernOverviewLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "700",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  modernOverviewValueHighlight: {
    fontSize: 18,
    fontWeight: "800",
    color: "#D70018",
  },
  modernOverviewValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
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
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterBtnText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1E3A8A",
  },
  filterMonthText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4B5563",
  },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBtnActive: {
    borderColor: '#1E3A8A',
  },
  tabBtnText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  tabBtnTextActive: {
    fontSize: 13,
    color: '#1E3A8A',
    fontWeight: '700',
  },
  historyContainer: {
    marginBottom: 20,
  },

  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 14,
  },
  orderHeaderLeft: {
    flex: 1,
    marginRight: 8,
  },
  orderIdText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  orderIdHighlight: {
    color: "#111827",
    fontWeight: "700",
  },
  orderDate: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  orderStatus: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    alignSelf: "flex-start",
  },
  statusSuccess: {
    color: "#059669", // Xanh lá
  },
  statusWarning: {
    color: "#EA580C", // Cam
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginHorizontal: 14,
  },
  orderBody: {
    flexDirection: "row",
    padding: 14,
  },
  imageWrapper: {
    position: "relative",
    marginRight: 14,
  },
  productImage: {
    width: 68,
    height: 68,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    resizeMode: "contain",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  discountBadge: {
    position: "absolute",
    top: -6,
    left: -6,
    backgroundColor: "#DC2626", // Đỏ chuẩn
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    zIndex: 1,
    elevation: 1,
  },
  discountText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  productInfo: {
    flex: 1,
    justifyContent: "center",
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
    lineHeight: 20,
  },
  extraItemsText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 6,
    fontStyle: "italic",
  },
  productPriceRow: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 8,
  },
  productPriceValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2937',
  },
  orderFooter: {
    padding: 0,
    backgroundColor: "#FFFFFF",
  },
  btnDetailFullWidth: {
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDetailTextBlue: {
    fontSize: 14,
    color: "#1E3A8A", // Màu xanh TGDĐ
    fontWeight: "600",
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
