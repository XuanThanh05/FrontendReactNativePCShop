// src/navigation/AppNavigator.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CartProvider, useCart } from '../context/CartContext';
import CartScreen from '../screens/CartScreen';
import StatisticsScreen from '../components/statistics/StatisticsScreen'; // ← thêm mới
import HomeScreen    from '../screens/HomeScreen';    
// import ProductScreen from '../screens/ProductScreen'; 

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ── Tab bar icon ────────────────────────────────────────────────
const TabIcon = ({ emoji, label, focused }) => (
  <View style={tabStyles.wrap}>
    <Text style={tabStyles.emoji}>{emoji}</Text>
    <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>
      {label}
    </Text>
  </View>
);

// ── Giỏ hàng icon có badge ──────────────────────────────────────
const CartTabIcon = ({ focused }) => {
  const { totalItems } = useCart();
  return (
    <View style={tabStyles.wrap}>
      <View style={tabStyles.cartWrap}>
        <Text style={tabStyles.emoji}>🛒</Text>
        {totalItems > 0 && (
          <View style={tabStyles.badge}>
            <Text style={tabStyles.badgeText}>
              {totalItems > 99 ? '99+' : totalItems}
            </Text>
          </View>
        )}
      </View>
      <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>
        Giỏ hàng
      </Text>
    </View>
  );
};

// ── Bottom Tab Navigator ────────────────────────────────────────
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        height: 60,
        paddingBottom: 6,
      },
      tabBarShowLabel: false,
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon emoji="🏠" label="Trang chủ" focused={focused} />
        ),
      }}
    />
    <Tab.Screen
      name="Category"
      component={HomeScreen}  // thay bằng CategoryScreen sau
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon emoji="📋" label="Danh mục" focused={focused} />
        ),
      }}
    />
    <Tab.Screen
      name="Cart"
      component={CartScreen}
      options={{
        tabBarIcon: ({ focused }) => <CartTabIcon focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Account"
      component={HomeScreen}  // thay bằng AccountScreen sau
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon emoji="👤" label="Tài khoản" focused={focused} />
        ),
      }}
    />
  </Tab.Navigator>
);
const AppNavigator = () => {
  return (
    // CartProvider bọc ngoài để mọi màn hình dùng được giỏ hàng
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Main"  // ← đổi thành "Cart" khi test giỏ hàng
          screenOptions={{ headerShown: false }}
        >
          {/* Màn hình thống kê admin */}
          <Stack.Screen name="Statistics" component={StatisticsScreen} />

       
 {/* Tab bar (Home, Category, Cart, Account) */}
          <Stack.Screen name="Main" component={TabNavigator} />
          {/* Thêm các màn hình khác vào đây sau */}
          {/* <Stack.Screen name="Home"     component={HomeScreen} />    */}
          {/* <Stack.Screen name="Product"  component={ProductScreen} /> */}
          {/* <Stack.Screen name="Checkout" component={CheckoutScreen} />*/}
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
};

export default AppNavigator;
const tabStyles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', gap: 2 },
  emoji: { fontSize: 22 },
  label: { fontSize: 10, color: '#aaa', fontWeight: '600' },
  labelActive: { color: '#E53935' },
  cartWrap: { position: 'relative' },
  badge: {
    position: 'absolute',
    top: -4, right: -8,
    backgroundColor: '#E53935',
    borderRadius: 10,
    minWidth: 16, height: 16,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { fontSize: 9, fontWeight: '900', color: '#fff' },
});