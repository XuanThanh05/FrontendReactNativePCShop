// src/context/CartContext.js
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Platform, ToastAndroid, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartItem,
  removeCartItem,
  clearCart as apiClearCart,
} from '../services/api';
import { useAuth } from './AuthContext';

const showToast = (message) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  }
};

const GUEST_CART_KEY = '@guest_cart';

const loadGuestCart = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(GUEST_CART_KEY);
    return jsonValue ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('loadGuestCart error', e);
    return [];
  }
};

const saveGuestCart = async (items) => {
  try {
    await AsyncStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('saveGuestCart error', e);
  }
};

const clearGuestCart = async () => {
  try {
    await AsyncStorage.removeItem(GUEST_CART_KEY);
  } catch (e) {
    console.error('clearGuestCart error', e);
  }
};

const CartContext = createContext();

const normalizeItem = (item, selected = true) => ({
  id:       item.cartItemId,
  productId: item.productId,
  quantity:  item.quantity,
  selected,
  name:  item.productName     ?? '',
  brand: item.brand           ?? '',
  price: item.productPrice    ?? 0,
  image: item.productImageUrl ?? '',
  stock: item.stockQuantity   ?? 999,
  specs: item.description     ?? '',
  discount: item.discount     ?? 0,
  subtotal:  item.subtotal    ?? 0,
});

export const CartProvider = ({ children }) => {
  const { isLoggedIn } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading]     = useState(false);

  const prevIsLoggedInRef = useRef(false);
  const cartItemsRef = useRef(cartItems);

  useEffect(() => {
    cartItemsRef.current = cartItems;
  }, [cartItems]);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      if (!isLoggedIn) {
        const localItems = await loadGuestCart();
        setCartItems(localItems);
        return;
      }

      const res  = await getCart();
      const data = res.data;

      let raw = [];
      if (data?.items?.content && Array.isArray(data.items.content)) {
        raw = data.items.content;
      } else if (Array.isArray(data?.items)) {
        raw = data.items;
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
      if (!isLoggedIn) setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  useEffect(() => {
    if (!isLoggedIn) {
      saveGuestCart(cartItems).catch(console.error);
    }
  }, [cartItems, isLoggedIn]);

  useEffect(() => {
    const wasLoggedIn = prevIsLoggedInRef.current;

    if (isLoggedIn && !wasLoggedIn) {
      const syncOnLogin = async () => {
        try {
          const localItems = await loadGuestCart();
          if (localItems.length > 0) {
            for (const item of localItems) {
              if (item.productId) {
                await apiAddToCart({ productId: item.productId, quantity: item.quantity });
              }
            }
            await clearGuestCart();
            showToast('✅ Giỏ hàng tạm thời đã được đồng bộ vào tài khoản');
          }
        } catch (err) {
          console.error('syncOnLogin error:', err);
        } finally {
          fetchCart();
        }
      };
      syncOnLogin();
    } else if (!isLoggedIn && wasLoggedIn) {
      saveGuestCart(cartItemsRef.current).catch(console.error);
    }

    prevIsLoggedInRef.current = isLoggedIn;
  }, [isLoggedIn, fetchCart]);

  // ==================== HÀM XÓA CÓ XÁC NHẬN (dùng cho icon thùng rác) ====================
  const removeFromCartWithConfirm = (cartItemId) => {
    const item = cartItems.find(i => i.id === cartItemId);
    if (!item) return;

    Alert.alert(
      'Xóa sản phẩm',
      `Bạn có chắc muốn xóa "${item.name}" khỏi giỏ hàng không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => removeFromCart(cartItemId),
        },
      ]
    );
  };

  // ==================== HÀM XÓA THẬT (dùng nội bộ) ====================
  const removeFromCart = async (cartItemId) => {
    if (isLoggedIn) {
      setCartItems(prev => prev.filter(i => i.id !== cartItemId));
      try {
        await removeCartItem(cartItemId);
      } catch (err) {
        console.error('removeFromCart error:', err);
        await fetchCart();
      }
    } else {
      const newItems = cartItems.filter(i => i.id !== cartItemId);
      setCartItems(newItems);
    }
  };

  // ==================== ADD TO CART ====================
  const addToCart = async (product) => {
    if (!isLoggedIn) {
      try {
        const existing = cartItems.find(i => i.productId === product.id);

        // ✅ Kiểm tra stock trước khi thêm (guest)
        if (existing) {
          const stock = product.stock ?? product.stockQuantity ?? 999;
          if (existing.quantity >= stock) {
            Alert.alert(
              'Không thể thêm',
              `"${product.name}" chỉ còn ${stock} sản phẩm trong kho.\nBạn đã có ${existing.quantity} sản phẩm trong giỏ hàng.`
            );
            return;
          }
        }

        let newItems;
        if (existing) {
          newItems = cartItems.map(i =>
            i.productId === product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          );
        } else {
          const newItem = {
            id: product.id,
            productId: product.id,
            quantity: 1,
            selected: true,
            name:     product.name ?? '',
            brand:    product.brand ?? '',
            price:    product.price ?? product.productPrice ?? 0,
            image:    product.image ?? product.imageUrl ?? product.productImageUrl ?? '',
            stock:    product.stock ?? product.stockQuantity ?? 999,
            specs:    product.description ?? product.specs ?? '',
            discount: product.discount ?? 0,
            subtotal: (product.price ?? product.productPrice ?? 0) * 1,
          };
          newItems = [...cartItems, newItem];
        }
        setCartItems(newItems);
        showToast(`✓ Đã thêm "${product.name}" vào giỏ hàng`);
      } catch (err) {
        console.error('addToCart guest error:', err);
        showToast('Thêm vào giỏ thất bại, thử lại sau');
      }
      return;
    }

    // ✅ Kiểm tra stock trước khi thêm (logged-in, dùng cartItems state hiện tại)
    try {
      const existing = cartItems.find(i => i.productId === product.id);
      if (existing) {
        const stock = existing.stock ?? 999;
        if (existing.quantity >= stock) {
          Alert.alert(
            'Không thể thêm',
            `"${product.name}" chỉ còn ${stock} sản phẩm trong kho.\nBạn đã có ${existing.quantity} sản phẩm trong giỏ hàng.`
          );
          return;
        }
      }

      await apiAddToCart({ productId: product.id, quantity: 1 });
      await fetchCart();
      showToast(`✓ Đã thêm "${product.name}" vào giỏ hàng`);
    } catch (err) {
      console.error('addToCart error:', err);
      showToast('Thêm vào giỏ thất bại, thử lại sau');
    }
  };

  // ==================== INCREASE QUANTITY ====================
  const increaseQuantity = async (cartItemId) => {
    const item = cartItems.find(i => i.id === cartItemId);
    if (!item) return;

    // ✅ Kiểm tra stock — đã chặn ở CartItem nhưng double-check ở đây
    if (item.quantity >= item.stock) return;

    const newQty = item.quantity + 1;

    if (isLoggedIn) {
      setCartItems(prev => prev.map(i => i.id === cartItemId ? { ...i, quantity: newQty } : i));
      try {
        await updateCartItem(cartItemId, newQty);
      } catch (err) {
        console.error('increaseQuantity error:', err);
        await fetchCart();
      }
    } else {
      const newItems = cartItems.map(i => i.id === cartItemId ? { ...i, quantity: newQty } : i);
      setCartItems(newItems);
    }
  };

  // ==================== DECREASE QUANTITY ====================
  const decreaseQuantity = async (cartItemId) => {
    const item = cartItems.find(i => i.id === cartItemId);
    if (!item || item.quantity <= 1) return;
    const newQty = item.quantity - 1;

    if (isLoggedIn) {
      setCartItems(prev => prev.map(i => i.id === cartItemId ? { ...i, quantity: newQty } : i));
      try {
        await updateCartItem(cartItemId, newQty);
      } catch (err) {
        console.error('decreaseQuantity error:', err);
        await fetchCart();
      }
    } else {
      const newItems = cartItems.map(i => i.id === cartItemId ? { ...i, quantity: newQty } : i);
      setCartItems(newItems);
    }
  };

  // ==================== CLEAR CART ====================
  const clearCart = async () => {
    if (isLoggedIn) {
      setCartItems([]);
      try {
        await apiClearCart();
      } catch (err) {
        console.error('clearCart error:', err);
        await fetchCart();
      }
    } else {
      setCartItems([]);
    }
  };

  // ==================== REMOVE SELECTED ====================
  const removeSelected = async () => {
    const ids = cartItems.filter(i => i.selected).map(i => i.id);
    if (!ids.length) return;

    if (isLoggedIn) {
      setCartItems(prev => prev.filter(i => !i.selected));
      try {
        await Promise.all(ids.map(id => removeCartItem(id)));
      } catch (err) {
        console.error('removeSelected error:', err);
        await fetchCart();
      }
    } else {
      const newItems = cartItems.filter(i => !i.selected);
      setCartItems(newItems);
    }
  };

  // ==================== TOGGLE SELECT ====================
  const toggleSelect = (cartItemId) =>
    setCartItems(prev => prev.map(i => i.id === cartItemId ? { ...i, selected: !i.selected } : i));

  const toggleSelectAll = () => {
    const allSelected = cartItems.length > 0 && cartItems.every(i => i.selected);
    setCartItems(prev => prev.map(i => ({ ...i, selected: !allSelected })));
  };

  // ==================== COMPUTED VALUES ====================
  const totalItems    = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const selectedItems = cartItems.filter(i => i.selected);
  const totalPrice    = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const allSelected   = cartItems.length > 0 && cartItems.every(i => i.selected);

  return (
    <CartContext.Provider value={{
      cartItems,
      totalItems,
      totalPrice,
      allSelected,
      selectedItems,
      loading,
      addToCart,
      removeFromCart,
      removeFromCartWithConfirm,
      increaseQuantity,
      decreaseQuantity,
      toggleSelect,
      toggleSelectAll,
      removeSelected,
      clearCart,
      fetchCart,
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