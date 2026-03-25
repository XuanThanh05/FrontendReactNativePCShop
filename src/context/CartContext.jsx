// src/context/CartContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform, ToastAndroid } from 'react-native';
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartItem,
  removeCartItem,
  clearCart as apiClearCart,
} from '../services/api';

// Hiện toast trên Android, silent trên iOS (không dùng Alert để không chặn UX)
const showToast = (message) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  }
  // iOS: có thể tích hợp thư viện react-native-toast-message nếu cần
};

const CartContext = createContext();

// ── Normalize CartItemResponse (flat) → shape CartItem.js expect ─────────────
// Backend CartItemResponse:
//   { cartItemId, productId, productName, productImageUrl, productPrice,
//     discount, quantity, stockQuantity, subtotal }
// CartItem.js expects:
//   { id, quantity, selected, name, brand, price, image, stock, specs }
const normalizeItem = (item, selected = true) => ({
  id:       item.cartItemId,         // cartItemId — dùng cho mọi API call
  productId: item.productId,
  quantity:  item.quantity,
  selected,
  name:  item.productName     ?? '',
  brand: item.brand           ?? '',  // backend chưa expose → bổ sung vào CartItemResponse nếu cần
  price: item.productPrice    ?? 0,
  image: item.productImageUrl ?? '',
  stock: item.stockQuantity   ?? 999,
  specs: item.specs           ?? '',  // backend chưa expose → bổ sung vào CartItemResponse nếu cần
  discount: item.discount     ?? 0,
  subtotal:  item.subtotal    ?? 0,
});

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading]     = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  // Backend CartResponse: { cartId, items: Page<CartItemResponse>, totalAmount, totalItems }
  // items là Spring Page object: { content: [...], totalElements, ... }
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const res  = await getCart();
      const data = res.data;

      // Lấy mảng items từ Page object: data.items.content
      // Fallback thêm các shape khác phòng backend thay đổi
      let raw = [];
      if (data?.items?.content && Array.isArray(data.items.content)) {
        raw = data.items.content;               // ✅ CartResponse với Page
      } else if (Array.isArray(data?.items)) {
        raw = data.items;                       // fallback: items là mảng thẳng
      } else if (Array.isArray(data?.cartItems)) {
        raw = data.cartItems;
      } else if (Array.isArray(data)) {
        raw = data;
      } else {
        console.warn('fetchCart: unrecognized shape:', JSON.stringify(data));
      }

      setCartItems(prev => {
        const selectedMap = Object.fromEntries(prev.map(i => [i.id, i.selected]));
        return raw.map(item => normalizeItem(item, selectedMap[item.cartItemId] ?? true));
      });
    } catch (err) {
      console.error('fetchCart error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  // ── ADD — nhận product object từ HomeScreen ───────────────────────────────
  const addToCart = async (product) => {
    try {
      await apiAddToCart({ productId: product.id, quantity: 1 });
      await fetchCart();
      showToast(`✓ Đã thêm "${product.name}" vào giỏ hàng`);
    } catch (err) {
      console.error('addToCart error:', err);
      showToast('Thêm vào giỏ thất bại, thử lại sau');
    }
  };

  // ── INCREASE ──────────────────────────────────────────────────────────────
  const increaseQuantity = async (cartItemId) => {
    const item = cartItems.find(i => i.id === cartItemId);
    if (!item || item.quantity >= item.stock) return;
    const newQty = item.quantity + 1;
    setCartItems(prev => prev.map(i => i.id === cartItemId ? { ...i, quantity: newQty } : i));
    try {
      await updateCartItem(cartItemId, newQty);
    } catch (err) {
      console.error('increaseQuantity error:', err);
      await fetchCart();
    }
  };

  // ── DECREASE — CartItem.js xử lý Alert khi qty=1, chỉ gọi khi qty>1 ──────
  const decreaseQuantity = async (cartItemId) => {
    const item = cartItems.find(i => i.id === cartItemId);
    if (!item || item.quantity <= 1) return;
    const newQty = item.quantity - 1;
    setCartItems(prev => prev.map(i => i.id === cartItemId ? { ...i, quantity: newQty } : i));
    try {
      await updateCartItem(cartItemId, newQty);
    } catch (err) {
      console.error('decreaseQuantity error:', err);
      await fetchCart();
    }
  };

  // ── REMOVE 1 ──────────────────────────────────────────────────────────────
  const removeFromCart = async (cartItemId) => {
    setCartItems(prev => prev.filter(i => i.id !== cartItemId));
    try {
      await removeCartItem(cartItemId);
    } catch (err) {
      console.error('removeFromCart error:', err);
      await fetchCart();
    }
  };

  // ── CLEAR ALL ─────────────────────────────────────────────────────────────
  const clearCart = async () => {
    setCartItems([]);
    try {
      await apiClearCart();
    } catch (err) {
      console.error('clearCart error:', err);
      await fetchCart();
    }
  };

  // ── REMOVE SELECTED ───────────────────────────────────────────────────────
  const removeSelected = async () => {
    const ids = cartItems.filter(i => i.selected).map(i => i.id);
    if (!ids.length) return;
    setCartItems(prev => prev.filter(i => !i.selected));
    try {
      await Promise.all(ids.map(id => removeCartItem(id)));
    } catch (err) {
      console.error('removeSelected error:', err);
      await fetchCart();
    }
  };

  // ── SELECT (local only, không cần API) ────────────────────────────────────
  const toggleSelect = (cartItemId) =>
    setCartItems(prev => prev.map(i => i.id === cartItemId ? { ...i, selected: !i.selected } : i));

  const toggleSelectAll = () => {
    const allSelected = cartItems.length > 0 && cartItems.every(i => i.selected);
    setCartItems(prev => prev.map(i => ({ ...i, selected: !allSelected })));
  };

  // ── Computed ──────────────────────────────────────────────────────────────
  const totalItems    = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const selectedItems = cartItems.filter(i => i.selected);
  const totalPrice    = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const allSelected   = cartItems.length > 0 && cartItems.every(i => i.selected);

  return (
    <CartContext.Provider value={{
      cartItems, totalItems, totalPrice, allSelected, selectedItems, loading,
      addToCart, removeFromCart, increaseQuantity, decreaseQuantity,
      toggleSelect, toggleSelectAll, removeSelected, clearCart, fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart phải dùng trong CartProvider');
  return ctx;
};