// src/screens/ComparisonScreen.jsx
import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { useComparison } from '../context/ComparisonContext';
import { formatPrice } from '../constants/mockData';
import { parseProductSpecs, SPEC_LABELS } from '../constants/productSpecs';

const ComparisonScreen = ({ navigation }) => {
  const { comparisonItems, removeFromComparison, clearAll } = useComparison();

  if (comparisonItems.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>So sánh sản phẩm</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa chọn sản phẩm để so sánh</Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.navigate('Main', { screen: 'Home' })}
          >
            <Text style={styles.emptyBtnText}>Tiếp tục mua sắm</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleClear = () => {
    Alert.alert(
      'Xóa tất cả',
      'Bạn có chắc muốn xóa tất cả sản phẩm khỏi danh sách so sánh?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => clearAll(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>So sánh sản phẩm ({comparisonItems.length})</Text>
        <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
          <Text style={styles.clearIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        style={styles.horizontalScroll}
      >
        <View>
          {/* Column headers - product names */}
          <View style={styles.headerRow}>
            <View style={[styles.specColumn, styles.specLabel]}>
              <Text style={styles.specLabelText}>Thông số</Text>
            </View>
            {comparisonItems.map((item) => (
              <View key={item.id} style={styles.productColumn}>
                <TouchableOpacity
                  style={styles.productCard}
                  onPress={() =>
                    navigation.navigate('Product', { product: item })
                  }
                >
                  {item.image && (
                    <Image
                      source={{ uri: item.image }}
                      style={styles.productImage}
                      resizeMode="contain"
                    />
                  )}
                  <Text style={styles.productName} numberOfLines={3}>
                    {item.name}
                  </Text>
                  <Text style={styles.productPrice}>
                    {formatPrice(item.price)}
                  </Text>
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeFromComparison(item.id)}
                  >
                    <Text style={styles.removeBtnText}>✕ Xóa</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Specs rows */}
          {SPEC_LABELS.map((specLabel, idx) => (
            <View key={specLabel} style={[styles.specRow, idx % 2 === 0 && styles.specRowAlt]}>
              <View style={[styles.specColumn, styles.specLabel]}>
                <Text style={styles.specKeyText}>{specLabel}</Text>
              </View>
              {comparisonItems.map((item) => {
                const detailLikeSpecs = parseProductSpecs(item.specs);
                const value = detailLikeSpecs[idx]?.value || 'Chưa có thông tin';
                return (
                  <View key={item.id} style={styles.specValueColumn}>
                    <Text style={styles.specValueText}>{value}</Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ComparisonScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f5f5' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 30, color: '#1a1a1a', lineHeight: 32 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', flex: 1 },
  clearBtn: { padding: 4 },
  clearIcon: { fontSize: 20 },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: { fontSize: 16, color: '#666', marginBottom: 16 },
  emptyBtn: {
    backgroundColor: '#E53935',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 6,
  },
  emptyBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  horizontalScroll: { flex: 1 },

  headerRow: { flexDirection: 'row' },
  productColumn: { width: 220, paddingHorizontal: 8 },
  productCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  productImage: {
    width: 120,
    height: 100,
    marginBottom: 8,
  },
  productName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E53935',
    marginBottom: 8,
  },
  removeBtn: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
  },
  removeBtnText: {
    fontSize: 11,
    color: '#E53935',
    fontWeight: '600',
  },

  specColumn: {
    width: 220,
    paddingHorizontal: 8,
    justifyContent: 'flex-start',
  },
  specLabel: {
    backgroundColor: '#f9f9f9',
    paddingVertical: 12,
    paddingTop: 16,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  specLabelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a1a1a',
  },

  specRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  specRowAlt: {
    backgroundColor: '#fafafa',
  },

  specKeyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
  },
  specValueColumn: {
    width: 220,
    paddingHorizontal: 8,
    paddingVertical: 14,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    justifyContent: 'flex-start',
  },
  specValueText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
});
