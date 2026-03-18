// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CartProvider } from '../context/CartContext';
import CartScreen from '../screens/CartScreen';
import StatisticsScreen from '../components/statistics/StatisticsScreen'; // ← thêm mới
// import HomeScreen    from '../screens/HomeScreen';    
// import ProductScreen from '../screens/ProductScreen'; 

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    // CartProvider bọc ngoài để mọi màn hình dùng được giỏ hàng
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Statistics"  // ← đổi thành "Cart" khi test giỏ hàng
          screenOptions={{ headerShown: false }}
        >
          {/* Màn hình thống kê admin */}
          <Stack.Screen name="Statistics" component={StatisticsScreen} />

          {/* Màn hình giỏ hàng */}
          <Stack.Screen name="Cart" component={CartScreen} />

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
