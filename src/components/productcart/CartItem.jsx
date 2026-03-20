// src/components/CartItem.js
import { Ionicons } from "@expo/vector-icons";
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { formatPrice } from "../../constants/mockData";
import { useCart } from "../../context/CartContext";

const CartItem = ({ item }) => {
  const { increaseQuantity, decreaseQuantity, removeFromCart, toggleSelect } =
    useCart();

  const handleDecrease = () => {
    if (item.quantity === 1) {
      Alert.alert(
        "Xóa sản phẩm",
        `Bạn có muốn xóa "${item.name}" khỏi giỏ hàng?`,
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Xóa",
            style: "destructive",
            onPress: () => removeFromCart(item.id),
          },
        ],
      );
    } else {
      decreaseQuantity(item.id);
    }
  };

  return (
    <View style={styles.container}>
      {/* Checkbox chọn */}
      <TouchableOpacity
        onPress={() => toggleSelect(item.id)}
        style={styles.checkbox}
      >
        <View
          style={[
            styles.checkboxInner,
            item.selected && styles.checkboxChecked,
          ]}
        >
          {item.selected && (
            <Ionicons name="checkmark" size={14} color="#fff" />
          )}
        </View>
      </TouchableOpacity>

      {/* Ảnh sản phẩm */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Thông tin sản phẩm */}
      <View style={styles.info}>
        <View style={styles.topInfoRow}>
          <Text style={styles.brand}>{item.brand}</Text>
          {/* Nút xóa */}
          <TouchableOpacity
            onPress={() => removeFromCart(item.id)}
            style={styles.deleteBtn}
          >
            <Ionicons name="trash-outline" size={18} color="#999" />
          </TouchableOpacity>
        </View>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.specs} numberOfLines={1}>
          {item.specs}
        </Text>

        <View style={styles.bottomRow}>
          {/* Giá */}
          <Text style={styles.price}>{formatPrice(item.price)}</Text>

          {/* Bộ điều chỉnh số lượng */}
          <View style={styles.quantityControl}>
            <TouchableOpacity onPress={handleDecrease} style={styles.qtyBtn}>
              <Ionicons name="remove" size={16} color="#333" />
            </TouchableOpacity>
            <Text style={styles.quantity}>{item.quantity}</Text>
            <TouchableOpacity
              onPress={() => increaseQuantity(item.id)}
              style={[
                styles.qtyBtn,
                item.quantity >= item.stock && styles.qtyBtnDisabled,
              ]}
              disabled={item.quantity >= item.stock}
            >
              <Ionicons name="add" size={16} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Cảnh báo sắp hết hàng */}
        {item.stock <= 3 && (
          <View style={styles.warningBox}>
            <Ionicons name="alert-circle" size={12} color="#FF6F00" />
            <Text style={styles.stockWarning}>
              {" "}
              Chỉ còn {item.stock} sản phẩm
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default CartItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f5f5f5",
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#E53935",
    borderColor: "#E53935",
  },
  imageContainer: {
    width: 85,
    height: 85,
    borderRadius: 12,
    backgroundColor: "#f8f8f8",
    marginRight: 12,
    padding: 4,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  info: {
    flex: 1,
  },
  topInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  brand: {
    fontSize: 12,
    color: "#E53935",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  deleteBtn: {
    padding: 4,
    marginTop: -4,
    marginRight: -4,
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
    marginTop: 2,
    lineHeight: 20,
  },
  specs: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
    backgroundColor: "#f5f5f5",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  price: {
    fontSize: 16,
    fontWeight: "800",
    color: "#E53935",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    overflow: "hidden",
  },
  qtyBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
  },
  qtyBtnDisabled: {
    opacity: 0.5,
  },
  quantity: {
    width: 36,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  stockWarning: {
    fontSize: 12,
    color: "#FF6F00",
    fontWeight: "500",
  },
});
