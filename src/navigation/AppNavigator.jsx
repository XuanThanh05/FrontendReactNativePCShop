// src/navigation/AppNavigator.js
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import StatisticsScreen from "../components/statistics/StatisticsScreen"; // ← thêm mới
import { CartProvider, useCart } from "../context/CartContext";
import AccountScreen from "../screens/Accountscreen";
import CartScreen from "../screens/CartScreen";
import CategoryScreen from "../screens/Categoryscreen";
import HomeScreen from "../screens/HomeScreen";
// import ProductScreen from '../screens/ProductScreen';
import { AuthProvider } from "../context/AuthContext";
import CheckoutScreen from "../screens/CheckoutScreen";
import LoginScreen from "../screens/LoginScreen";
import OrderSuccessScreen from "../screens/OrderSuccessScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import RegisterScreen from "../screens/RegisterScreen";
import UserStatisticsReport from "../screens/UserStatisticsReport";
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ── Tab bar icon ────────────────────────────────────────────────
const TabIcon = ({ icon, label, focused }) => (
  <View style={tabStyles.wrap}>
    <Ionicons name={icon} size={20} color={focused ? "#E53935" : "#9CA3AF"} />
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
        <Ionicons
          name={focused ? "cart" : "cart-outline"}
          size={20}
          color={focused ? "#E53935" : "#9CA3AF"}
        />
        {totalItems > 0 && (
          <View style={tabStyles.badge}>
            <Text style={tabStyles.badgeText}>
              {totalItems > 99 ? "99+" : totalItems}
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

// ── Bottom Tab Navigator (Chỉnh dài rộng cái navigation phía dưới ở đây) ────────────────────────────────────────
const TabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          height: 65 + insets.bottom,
          paddingTop: 10,
          paddingBottom: Math.max(insets.bottom, 8),
          elevation: 8,
          shadowColor: "#111827",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={focused ? "home" : "home-outline"}
              label="Trang chủ"
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Category"
        component={CategoryScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={focused ? "grid" : "grid-outline"}
              label="Danh mục"
              focused={focused}
            />
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
        component={AccountScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={focused ? "person" : "person-outline"}
              label="Tài khoản"
              focused={focused}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
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
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            {<Stack.Screen name="Product" component={ProductDetailScreen} />}
            {<Stack.Screen name="Checkout" component={CheckoutScreen} />}
            <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
            <Stack.Screen
              name="UserStatisticsReport"
              component={UserStatisticsReport}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
};

export default AppNavigator;
const tabStyles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    minWidth: 70,
  },
  label: { fontSize: 14, color: "#9CA3AF", fontWeight: "500" },
  labelActive: { color: "#E53935" },
  cartWrap: { position: "relative" },
  badge: {
    position: "absolute",
    top: -6,
    right: -10,
    backgroundColor: "#E53935",
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: { fontSize: 9, fontWeight: "900", color: "#fff" },
});
