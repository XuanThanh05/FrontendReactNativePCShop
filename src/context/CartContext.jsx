// src/context/CartContext.js
import React, { createContext, useContext, useReducer } from 'react';
import { initialCartItems } from '../constants/mockData';

// ── 1. Tạo Context ──────────────────────────────────────────────
const CartContext = createContext();

// ── 2. Reducer – xử lý các action ──────────────────────────────
const cartReducer = (state, action) => {
  switch (action.type) {

    // Thêm sản phẩm vào giỏ
    case 'ADD_TO_CART': {
      const exists = state.items.find(item => item.id === action.payload.id);
      if (exists) {
        // Nếu đã có → tăng số lượng (không vượt stock)
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) }
              : item
          ),
        };
      }
      // Chưa có → thêm mới với quantity = 1
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
      };
    }

    // Xóa sản phẩm khỏi giỏ
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };

    // Tăng số lượng
    case 'INCREASE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload
            ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) }
            : item
        ),
      };

    // Giảm số lượng (về 0 thì tự xóa)
    case 'DECREASE_QUANTITY':
      return {
        ...state,
        items: state.items
          .map(item =>
            item.id === action.payload
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
          .filter(item => item.quantity > 0),
      };

    // Chọn / bỏ chọn 1 sản phẩm
    case 'TOGGLE_SELECT':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload
            ? { ...item, selected: !item.selected }
            : item
        ),
      };

    // Chọn / bỏ chọn tất cả
    case 'TOGGLE_SELECT_ALL': {
      const allSelected = state.items.every(item => item.selected);
      return {
        ...state,
        items: state.items.map(item => ({ ...item, selected: !allSelected })),
      };
    }

    // Xóa những sản phẩm đã chọn
    case 'REMOVE_SELECTED':
      return {
        ...state,
        items: state.items.filter(item => !item.selected),
      };

    // Xóa toàn bộ giỏ hàng
    case 'CLEAR_CART':
      return { ...state, items: [] };

    default:
      return state;
  }
};

// ── 3. Provider ─────────────────────────────────────────────────
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    // Gán selected: true mặc định để test UI
    items: initialCartItems.map(item => ({ ...item, selected: true })),
  });

  // ── Các action helper ───────────────────────────────────────
  const addToCart        = (product)  => dispatch({ type: 'ADD_TO_CART',        payload: product });
  const removeFromCart   = (id)       => dispatch({ type: 'REMOVE_FROM_CART',   payload: id });
  const increaseQuantity = (id)       => dispatch({ type: 'INCREASE_QUANTITY',  payload: id });
  const decreaseQuantity = (id)       => dispatch({ type: 'DECREASE_QUANTITY',  payload: id });
  const toggleSelect     = (id)       => dispatch({ type: 'TOGGLE_SELECT',      payload: id });
  const toggleSelectAll  = ()         => dispatch({ type: 'TOGGLE_SELECT_ALL' });
  const removeSelected   = ()         => dispatch({ type: 'REMOVE_SELECTED' });
  const clearCart        = ()         => dispatch({ type: 'CLEAR_CART' });

  // ── Computed values ─────────────────────────────────────────
  const totalItems     = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const selectedItems  = state.items.filter(i => i.selected);
  const totalPrice     = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const allSelected    = state.items.length > 0 && state.items.every(i => i.selected);

  return (
    <CartContext.Provider
      value={{
        cartItems: state.items,
        totalItems,
        totalPrice,
        allSelected,
        selectedItems,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        toggleSelect,
        toggleSelectAll,
        removeSelected,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// ── 4. Custom hook để dùng ở bất kỳ đâu ────────────────────────
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart phải dùng trong CartProvider');
  return context;
};