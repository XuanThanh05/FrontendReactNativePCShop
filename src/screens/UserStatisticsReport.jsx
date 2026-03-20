import { useMemo, useState } from "react";
import {
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatPrice, hotProducts } from "../constants/mockData";

const UserStatisticsReport = ({ navigation }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // Tháng 3/2026 (0-indexed)

  const purchaseHistory = useMemo(() => {
    if (!hotProducts || hotProducts.length < 5) return [];

    return [
      {
        ...hotProducts[0],
        date: "15/03/2026",
        status: "Đã giao",
      },
      {
        ...hotProducts[4],
        date: "18/03/2026",
        status: "Đang giao",
      },
      {
        ...hotProducts[1],
        date: "10/02/2026",
        status: "Đã giao",
      },
      {
        ...hotProducts[3],
        date: "02/02/2026",
        status: "Đã giao",
      },
      {
        ...hotProducts[5],
        date: "05/01/2026",
        status: "Đã giao",
      },
      {
        ...hotProducts[6],
        date: "20/12/2025",
        status: "Đã giao",
      },
    ];
  }, [hotProducts]);

  const monthString = `${String(currentDate.getMonth() + 1).padStart(2, "0")}/${currentDate.getFullYear()}`;

  const filteredHistory = purchaseHistory.filter((item) =>
    item.date.endsWith(monthString),
  );

  // Tính tổng chi tiêu và tổng đơn của toàn bộ lịch sử (cố định)
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

  const renderProductItem = ({ item }) => (
    <View style={styles.productCard}>
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
        <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
      </View>
    </View>
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
          {filteredHistory.length > 0 ? (
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
              <Text style={styles.emptyText}>Chưa có đơn hàng nào.</Text>
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
