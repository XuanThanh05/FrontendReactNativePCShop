// src/components/CartItem.js
import React from 'react';
import {
  View, Text, Image, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../constants/mockData';

const CartItem = ({ item }) => {
  const { increaseQuantity, decreaseQuantity, removeFromCart, toggleSelect } = useCart();

  const handleDecrease = () => {
    if (item.quantity === 1) {
      Alert.alert(
        'Xóa sản phẩm',
        `Bạn có muốn xóa "${item.name}" khỏi giỏ hàng?`,
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Xóa', style: 'destructive', onPress: () => removeFromCart(item.id) },
        ]
      );
    } else {
      decreaseQuantity(item.id);
    }
  };

  return (
    <View style={styles.container}>
      {/* Checkbox chọn */}
      <TouchableOpacity onPress={() => toggleSelect(item.id)} style={styles.checkbox}>
        <View style={[styles.checkboxInner, item.selected && styles.checkboxChecked]}>
          {item.selected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>

      {/* Ảnh sản phẩm */}
      <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />

      {/* Thông tin sản phẩm */}
      <View style={styles.info}>
        <Text style={styles.brand}>{item.brand}</Text>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.specs} numberOfLines={1}>{item.specs}</Text>

        <View style={styles.bottomRow}>
          {/* Giá */}
          <Text style={styles.price}>{formatPrice(item.price)}</Text>

          {/* Bộ điều chỉnh số lượng */}
          <View style={styles.quantityControl}>
            <TouchableOpacity onPress={handleDecrease} style={styles.qtyBtn}>
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.quantity}>{item.quantity}</Text>
            <TouchableOpacity
              onPress={() => increaseQuantity(item.id)}
              style={[styles.qtyBtn, item.quantity >= item.stock && styles.qtyBtnDisabled]}
              disabled={item.quantity >= item.stock}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cảnh báo sắp hết hàng */}
        {item.stock <= 3 && (
          <Text style={styles.stockWarning}>⚠ Chỉ còn {item.stock} sản phẩm</Text>
        )}
      </View>

      {/* Nút xóa */}
      <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.deleteBtn}>
        <Text style={styles.deleteIcon}>🗑</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CartItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  checkbox: {
    marginRight: 10,
  },
  checkboxInner: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#E53935',
    borderColor: '#E53935',
  },
  checkmark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  image: {
    width: 80,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  brand: {
    fontSize: 11,
    color: '#E53935',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 2,
    lineHeight: 18,
  },
  specs: {
    fontSize: 11,
    color: '#888',
    marginTop: 3,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: '800',
    color: '#E53935',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  qtyBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  qtyBtnDisabled: {
    backgroundColor: '#fafafa',
  },
  qtyBtnText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  quantity: {
    width: 30,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  stockWarning: {
    fontSize: 11,
    color: '#FF6F00',
    marginTop: 4,
  },
  deleteBtn: {
    padding: 6,
    marginLeft: 6,
  },
  deleteIcon: {
    fontSize: 18,
  },
});