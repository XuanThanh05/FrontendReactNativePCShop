// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CartProvider } from '../context/CartContext';
import CartScreen from '../screens/CartScreen';
// import HomeScreen    from '../screens/HomeScreen';    
// import ProductScreen from '../screens/ProductScreen'; 

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    // CartProvider bọc ngoài để mọi màn hình dùng được giỏ hàng
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Cart"
          screenOptions={{ headerShown: false }}
        >
          {/* Màn hình giỏ hàng — đặt initialRouteName="Cart" để test */}
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