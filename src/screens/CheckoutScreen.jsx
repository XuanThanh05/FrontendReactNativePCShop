// src/screens/CheckoutScreen.js
import { useState } from "react";
import {
    Alert,
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
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const CheckoutScreen = ({ route, navigation }) => {
  const { product } = route.params || {};
  const { currentUser } = useAuth();
  const { selectedItems, totalPrice, clearCart } = useCart();

  const checkoutItems = product ? [{ ...product, quantity: 1 }] : selectedItems;

  const subtotal = product ? product.price : totalPrice;

  // ── State form ───────────────────────────────────────────────
  const [buyerName, setBuyerName] = useState(currentUser?.fullName || "");
  const [buyerPhone, setBuyerPhone] = useState(currentUser?.phone || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [receiveEmail, setReceive] = useState(false);
  const [deliveryType, setDelivery] = useState("store");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");

  const shippingFee = deliveryType === "ship" ? 50000 : 0;
  const finalTotal = subtotal + shippingFee;

  // ── Validate ─────────────────────────────────────────────────
  const validate = () => {
    if (!buyerName.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập họ và tên");
      return false;
    }
    if (!buyerPhone.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập số điện thoại");
      return false;
    }
    if (buyerPhone.length < 10) {
      Alert.alert("Lỗi", "Số điện thoại không hợp lệ");
      return false;
    }
    if (deliveryType === "ship") {
      if (!city.trim()) {
        Alert.alert("Thiếu thông tin", "Vui lòng nhập tỉnh/thành phố");
        return false;
      }
      if (!address.trim()) {
        Alert.alert("Thiếu thông tin", "Vui lòng nhập địa chỉ cụ thể");
        return false;
      }
    }
    return true;
  };

  // ── Xác nhận đặt hàng ────────────────────────────────────────
  const handleOrder = () => {
    if (!validate()) return;

    const deliveryInfo =
      deliveryType === "store"
        ? "Nhận tại cửa hàng PCShop"
        : `Giao đến: ${address}${district ? ", " + district : ""}, ${city}`;

    Alert.alert(
      "Xác nhận đặt hàng",
      `Họ tên: ${buyerName}\nSĐT: ${buyerPhone}\n${deliveryInfo}\n\nTổng tiền: ${formatPrice(finalTotal)}\n\nBạn có chắc muốn đặt hàng không?`,
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xác nhận đặt hàng",
          onPress: () => {
            setTimeout(() => {
              if (!product) clearCart();
              navigation.reset({
                index: 1,
                routes: [
                  { name: "Main" },
                  { name: "OrderSuccess", params: { buyerName, buyerPhone } },
                ],
              });
            }, 300);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── Header ─────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin thanh toán</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Sản phẩm ─────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sản phẩm đặt mua</Text>
          {checkoutItems.map((item, i) => (
            <View
              key={i}
              style={[
                styles.productRow,
                i < checkoutItems.length - 1 && styles.productRowBorder,
              ]}
            >
              <Image
                source={{ uri: item.image }}
                style={styles.productThumb}
                resizeMode="contain"
              />
              <View style={styles.productMeta}>
                <Text style={styles.productName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.productPrice}>
                  {formatPrice(item.price)}
                </Text>
                {item.originalPrice > item.price && (
                  <Text style={styles.originalPrice}>
                    {formatPrice(item.originalPrice)}
                  </Text>
                )}
                <Text style={styles.productQty}>
                  {"Số lượng: "}
                  <Text style={styles.productQtyBold}>
                    {String(item.quantity).padStart(2, "0")}
                  </Text>
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Thông tin người mua ──────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin người mua</Text>

          <Text style={styles.fieldLabel}>
            {"Họ và tên "}
            <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="Nhập họ và tên"
              placeholderTextColor="#bbb"
              value={buyerName}
              onChangeText={setBuyerName}
            />
          </View>

          <Text style={styles.fieldLabel}>
            {"Số điện thoại "}
            <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="Nhập số điện thoại"
              placeholderTextColor="#bbb"
              keyboardType="phone-pad"
              value={buyerPhone}
              onChangeText={setBuyerPhone}
              maxLength={11}
            />
          </View>

          <Text style={styles.fieldLabel}>Email nhận hoá đơn</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="Nhập email (không bắt buộc)"
              placeholderTextColor="#bbb"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
            {email.length > 0 && (
              <TouchableOpacity onPress={() => setEmail("")}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.fieldHint}>
            (*) Hoá đơn VAT sẽ được gửi qua email này
          </Text>

          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => setReceive(!receiveEmail)}
          >
            <View
              style={[styles.checkbox, receiveEmail && styles.checkboxChecked]}
            >
              {receiveEmail && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkLabel}>
              Nhận email thông báo và ưu đãi từ PCShop
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Hình thức nhận hàng ──────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hình thức nhận hàng</Text>

          <View style={styles.deliveryToggle}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                deliveryType === "store" && styles.toggleActive,
              ]}
              onPress={() => setDelivery("store")}
            >
              <Text
                style={[
                  styles.toggleText,
                  deliveryType === "store" && styles.toggleTextActive,
                ]}
              >
                Nhận tại cửa hàng
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                deliveryType === "ship" && styles.toggleActive,
              ]}
              onPress={() => setDelivery("ship")}
            >
              <Text
                style={[
                  styles.toggleText,
                  deliveryType === "ship" && styles.toggleTextActive,
                ]}
              >
                Giao hàng tận nơi
              </Text>
            </TouchableOpacity>
          </View>

          {/* Nhận tại cửa hàng */}
          {deliveryType === "store" && (
            <View style={styles.storeInfoBox}>
              <Text style={styles.storeInfoTitle}>📍 Thông tin cửa hàng</Text>
              <Text style={styles.storeInfoText}>
                PCShop - 123 Nguyễn Văn A
              </Text>
              <Text style={styles.storeInfoText}>Quận 1, TP. Hồ Chí Minh</Text>
              <Text style={styles.storeInfoText}>📞 0901 234 567</Text>
              <Text style={styles.storeInfoText}>
                🕐 8:00 - 21:00 (Thứ 2 - CN)
              </Text>
              <Text style={styles.storeNote}>
                💡 Vui lòng mang theo CMND/CCCD khi đến nhận hàng
              </Text>
            </View>
          )}

          {/* Giao tận nơi */}
          {deliveryType === "ship" && (
            <View>
              <Text style={styles.fieldLabel}>
                {"Tỉnh / Thành phố "}
                <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  placeholder="VD: Hà Nội, TP. Hồ Chí Minh..."
                  placeholderTextColor="#bbb"
                  value={city}
                  onChangeText={setCity}
                />
              </View>

              <Text style={styles.fieldLabel}>Quận / Huyện</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  placeholder="VD: Quận 1, Hoàn Kiếm..."
                  placeholderTextColor="#bbb"
                  value={district}
                  onChangeText={setDistrict}
                />
              </View>

              <Text style={styles.fieldLabel}>
                {"Địa chỉ cụ thể "}
                <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  placeholder="Số nhà, tên đường..."
                  placeholderTextColor="#bbb"
                  value={address}
                  onChangeText={setAddress}
                />
              </View>

              <View style={styles.shippingFeeNote}>
                <Text style={styles.shippingFeeText}>🚚 Phí vận chuyển: </Text>
                <Text style={styles.shippingFeeValue}>
                  {formatPrice(50000)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* ── Tóm tắt ──────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính</Text>
            <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
            {shippingFee === 0 ? (
              <Text style={styles.freeShip}>Miễn phí</Text>
            ) : (
              <Text style={styles.summaryValue}>
                {formatPrice(shippingFee)}
              </Text>
            )}
          </View>
          <View style={styles.dividerH} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>{formatPrice(finalTotal)}</Text>
          </View>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── Nút đặt hàng ─────────────────────────────────── */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomTotal}>{formatPrice(finalTotal)}</Text>
          <Text style={styles.bottomShip}>
            {deliveryType === "store"
              ? "🏪 Nhận tại cửa hàng"
              : "🚚 Giao tận nơi"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.orderBtn}
          onPress={handleOrder}
          activeOpacity={0.85}
        >
          <Text style={styles.orderBtnText}>Đặt hàng</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f5f5f5" },

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
  backIcon: { fontSize: 30, color: "#1a1a1a", lineHeight: 32 },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#1a1a1a" },

  section: { backgroundColor: "#fff", marginTop: 10, padding: 16 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 14,
  },

  productRow: { flexDirection: "row", gap: 12, paddingVertical: 8 },
  productRowBorder: { borderBottomWidth: 1, borderBottomColor: "#f5f5f5" },
  productThumb: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#f8f8f8",
  },
  productMeta: { flex: 1 },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
    lineHeight: 20,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: "#E53935",
    marginTop: 4,
  },
  originalPrice: {
    fontSize: 12,
    color: "#bbb",
    textDecorationLine: "line-through",
    marginTop: 2,
  },
  productQty: { fontSize: 13, color: "#666", marginTop: 4 },
  productQtyBold: { fontWeight: "700", color: "#1a1a1a" },

  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
    marginTop: 12,
  },
  fieldHint: {
    fontSize: 11,
    color: "#aaa",
    fontStyle: "italic",
    marginBottom: 8,
  },
  required: { color: "#E53935" },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  input: { flex: 1, fontSize: 14, color: "#1a1a1a" },
  clearIcon: { fontSize: 14, color: "#bbb", padding: 4 },

  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: "#E53935", borderColor: "#E53935" },
  checkmark: { color: "#fff", fontSize: 11, fontWeight: "bold" },
  checkLabel: { fontSize: 13, color: "#444", flex: 1 },

  deliveryToggle: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  toggleActive: { borderBottomColor: "#E53935" },
  toggleText: { fontSize: 14, color: "#aaa", fontWeight: "600" },
  toggleTextActive: { color: "#E53935", fontWeight: "700" },

  storeInfoBox: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: "#E53935",
  },
  storeInfoTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  storeInfoText: { fontSize: 13, color: "#444", lineHeight: 24 },
  storeNote: {
    fontSize: 12,
    color: "#FF6F00",
    marginTop: 10,
    backgroundColor: "#FFF8E1",
    padding: 8,
    borderRadius: 8,
  },

  shippingFeeNote: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "#f0f9f0",
    padding: 10,
    borderRadius: 8,
  },
  shippingFeeText: { fontSize: 13, color: "#555" },
  shippingFeeValue: { fontSize: 13, color: "#43A047", fontWeight: "700" },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: { fontSize: 14, color: "#666" },
  summaryValue: { fontSize: 14, color: "#333", fontWeight: "600" },
  freeShip: { fontSize: 14, color: "#43A047", fontWeight: "700" },
  dividerH: { height: 1, backgroundColor: "#f0f0f0", marginVertical: 10 },
  totalLabel: { fontSize: 15, fontWeight: "700", color: "#1a1a1a" },
  totalValue: { fontSize: 18, fontWeight: "900", color: "#E53935" },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 10,
  },
  bottomTotal: { fontSize: 18, fontWeight: "900", color: "#E53935" },
  bottomShip: { fontSize: 12, color: "#888", marginTop: 2 },
  orderBtn: {
    backgroundColor: "#E53935",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 13,
  },
  orderBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});
