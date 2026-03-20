// src/screens/CartScreen.js
import {
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import CartItem from "../components/productcart/CartItem";
import CartSummary from "../components/productcart/CartSummary";
import { useCart } from "../context/CartContext";

const CartScreen = ({ navigation }) => {
  const {
    cartItems,
    totalItems,
    allSelected,
    toggleSelectAll,
    removeSelected,
    clearCart,
  } = useCart();

  const selectedCount = cartItems.filter((i) => i.selected).length;

  // ── Giỏ hàng trống ──────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={72} color="#ccc" style={{ marginBottom: 16 }} />
          <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
          <Text style={styles.emptySubtitle}>
            Thêm sản phẩm yêu thích vào giỏ hàng nhé!
          </Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => navigation?.navigate("Home")}
          >
            <Text style={styles.shopBtnText}>Mua sắm ngay</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── Header ─────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giỏ hàng ({totalItems})</Text>
        <TouchableOpacity onPress={clearCart} style={styles.clearBtn}>
          <Text style={styles.clearText}>Xóa tất cả</Text>
        </TouchableOpacity>
      </View>

      {/* ── Thanh chọn tất cả / xóa đã chọn ───────────────── */}
      <View style={styles.toolbar}>
        <TouchableOpacity onPress={toggleSelectAll} style={styles.selectAllBtn}>
          <View
            style={[styles.checkbox, allSelected && styles.checkboxChecked]}
          >
            {allSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <Text style={styles.selectAllText}>
            {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
          </Text>
        </TouchableOpacity>

        {selectedCount > 0 && (
          <TouchableOpacity
            onPress={removeSelected}
            style={styles.removeSelectedBtn}
          >
            <Text style={styles.removeSelectedText}>
              Xóa đã chọn ({selectedCount})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Danh sách sản phẩm ─────────────────────────────── */}
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CartItem item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* ── Tổng tiền + thanh toán ─────────────────────────── */}
      <CartSummary navigation={navigation} />
    </SafeAreaView>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 22, color: "#1a1a1a" },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1a1a1a",
  },
  clearBtn: { padding: 4 },
  clearText: { fontSize: 13, color: "#E53935" },

  // Toolbar
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectAllBtn: { flexDirection: "row", alignItems: "center", gap: 8 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#E53935",
    borderColor: "#E53935",
  },
  checkmark: { color: "#fff", fontSize: 13, fontWeight: "bold" },
  selectAllText: { fontSize: 14, color: "#333", fontWeight: "600" },
  removeSelectedBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#FFF0F0",
    borderRadius: 8,
  },
  removeSelectedText: { fontSize: 13, color: "#E53935", fontWeight: "600" },

  // List
  list: {
    paddingTop: 6,
    paddingBottom: 10,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: { fontSize: 72, marginBottom: 16 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  shopBtn: {
    backgroundColor: "#E53935",
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 12,
  },
  shopBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
});

