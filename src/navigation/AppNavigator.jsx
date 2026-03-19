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
import CategoryScreen from '../screens/Categoryscreen';
import AccountScreen  from '../screens/Accountscreen';
// import ProductScreen from '../screens/ProductScreen'; 
import LoginScreen    from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { AuthProvider }            from '../context/AuthContext';
import ProductDetailScreen  from '../screens/ProductDetailScreen';
import CheckoutScreen       from '../screens/CheckoutScreen';
import UserStatisticsReport from '../screens/UserStatisticsReport';
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
        paddingBottom: 70,
        paddingTop: 6,
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
      component={CategoryScreen}  // thay bằng CategoryScreen sau
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
      component={AccountScreen}  // thay bằng AccountScreen sau
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
    <AuthProvider>
      {/* CartProvider bọc ngoài để mọi màn hình dùng được giỏ hàng */}
      <CartProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Main"
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="Statistics" component={StatisticsScreen} />
            <Stack.Screen name="Main"       component={TabNavigator} />
            <Stack.Screen name="Login"      component={LoginScreen} />
            <Stack.Screen name="Register"   component={RegisterScreen} />
            { <Stack.Screen name="Product"  component={ProductDetailScreen } /> }
            { <Stack.Screen name="Checkout" component={CheckoutScreen} /> }
            <Stack.Screen name="UserStatisticsReport" component={UserStatisticsReport} />
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
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
