// src/components/CartSummary.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../constants/mockData';

const CartSummary = ({ navigation }) => {
  const { selectedItems, totalPrice, totalItems } = useCart();

  const selectedCount  = selectedItems.reduce((sum, i) => sum + i.quantity, 0);
  const shippingFee    = totalPrice > 10000000 ? 0 : 50000; // miễn ship > 10tr
  const finalPrice     = totalPrice + shippingFee;

  const handleCheckout = () => {
    if (selectedCount === 0) return;
    // navigation.navigate('Checkout');  ← mở khi có màn hình Checkout
    alert('Chuyển sang màn hình thanh toán!');
  };

  return (
    <View style={styles.container}>
      {/* Phí vận chuyển */}
      <View style={styles.row}>
        <Text style={styles.label}>Tạm tính ({selectedCount} sản phẩm)</Text>
        <Text style={styles.value}>{formatPrice(totalPrice)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Phí vận chuyển</Text>
        {shippingFee === 0
          ? <Text style={styles.freeShip}>Miễn phí</Text>
          : <Text style={styles.value}>{formatPrice(shippingFee)}</Text>
        }
      </View>

      {shippingFee > 0 && (
        <Text style={styles.shippingNote}>
          🚚 Mua thêm {formatPrice(10000000 - totalPrice)} để được miễn phí vận chuyển
        </Text>
      )}

      <View style={styles.divider} />

      {/* Tổng cộng */}
      <View style={styles.row}>
        <Text style={styles.totalLabel}>Tổng cộng</Text>
        <Text style={styles.totalPrice}>{formatPrice(finalPrice)}</Text>
      </View>

      {/* Nút thanh toán */}
      <TouchableOpacity
        style={[styles.checkoutBtn, selectedCount === 0 && styles.checkoutBtnDisabled]}
        onPress={handleCheckout}
        disabled={selectedCount === 0}
        activeOpacity={0.85}
      >
        <Text style={styles.checkoutText}>
          Thanh toán ({selectedCount})
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CartSummary;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    color: '#666',
  },
  value: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  freeShip: {
    fontSize: 13,
    color: '#43A047',
    fontWeight: '700',
  },
  shippingNote: {
    fontSize: 11,
    color: '#FF6F00',
    marginBottom: 8,
    backgroundColor: '#FFF8E1',
    padding: 8,
    borderRadius: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#E53935',
  },
  checkoutBtn: {
    backgroundColor: '#E53935',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  checkoutBtnDisabled: {
    backgroundColor: '#ccc',
  },
  checkoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});