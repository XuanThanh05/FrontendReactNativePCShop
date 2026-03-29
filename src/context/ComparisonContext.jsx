// src/context/ComparisonContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COMPARISON_KEY = '@comparison_products';
const COMPARISON_DOCK_KEY = '@comparison_dock_collapsed';

const loadComparison = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(COMPARISON_KEY);
    return jsonValue ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('loadComparison error', e);
    return [];
  }
};

const saveComparison = async (items) => {
  try {
    await AsyncStorage.setItem(COMPARISON_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('saveComparison error', e);
  }
};

const clearComparison = async () => {
  try {
    await AsyncStorage.removeItem(COMPARISON_KEY);
  } catch (e) {
    console.error('clearComparison error', e);
  }
};

const loadDockCollapsed = async () => {
  try {
    const value = await AsyncStorage.getItem(COMPARISON_DOCK_KEY);
    return value === 'true';
  } catch (e) {
    console.error('loadDockCollapsed error', e);
    return false;
  }
};

const saveDockCollapsed = async (collapsed) => {
  try {
    await AsyncStorage.setItem(COMPARISON_DOCK_KEY, String(collapsed));
  } catch (e) {
    console.error('saveDockCollapsed error', e);
  }
};

const ComparisonContext = createContext();

const normalizeComparisonItem = (product) => ({
  id: product?.id,
  name: product?.name ?? '',
  price: product?.price ?? 0,
  brand: product?.brand ?? '',
  discount: product?.discount ?? 0,
  image: product?.image ?? product?.imageUrl ?? '',
  imageUrl: product?.imageUrl ?? product?.image ?? '',
  specs: product?.specs ?? product?.description ?? '',
  description: product?.description ?? '',
});

export const ComparisonProvider = ({ children }) => {
  const [comparisonItems, setComparisonItems] = useState([]);
  const [dockCollapsed, setDockCollapsed] = useState(false);

  const comparisonItemsRef = useRef(comparisonItems);

  useEffect(() => {
    comparisonItemsRef.current = comparisonItems;
  }, [comparisonItems]);

  // Load comparison từ storage khi app start
  useEffect(() => {
    (async () => {
      const saved = await loadComparison();
      setComparisonItems(Array.isArray(saved) ? saved.map(normalizeComparisonItem) : []);

      const collapsed = await loadDockCollapsed();
      setDockCollapsed(collapsed);
    })();
  }, []);

  // Auto save mỗi khi comparison thay đổi
  useEffect(() => {
    saveComparison(comparisonItems).catch(console.error);
  }, [comparisonItems]);

  useEffect(() => {
    saveDockCollapsed(dockCollapsed).catch(console.error);
  }, [dockCollapsed]);

  const addToComparison = (product) => {
    const normalized = normalizeComparisonItem(product);
    if (!normalized.id) return;

    const exists = comparisonItems.find(p => p.id === normalized.id);
    if (!exists) {
      setComparisonItems([...comparisonItems, normalized]);
    }
  };

  const removeFromComparison = (productId) => {
    setComparisonItems(prev => prev.filter(p => p.id !== productId));
  };

  const isInComparison = (productId) => {
    return comparisonItems.some(p => p.id === productId);
  };

  const clearAll = () => {
    setComparisonItems([]);
    setDockCollapsed(false);
  };

  const expandDock = () => setDockCollapsed(false);
  const collapseDock = () => setDockCollapsed(true);
  const toggleDock = () => setDockCollapsed(prev => !prev);

  const count = comparisonItems.length;

  return (
    <ComparisonContext.Provider
      value={{
        comparisonItems,
        addToComparison,
        removeFromComparison,
        isInComparison,
        clearAll,
        count,
        dockCollapsed,
        expandDock,
        collapseDock,
        toggleDock,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => {
  const ctx = useContext(ComparisonContext);
  if (!ctx) throw new Error('useComparison phải dùng trong ComparisonProvider');
  return ctx;
};
