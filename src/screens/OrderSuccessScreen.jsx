import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
    Animated,
    Easing,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const OrderSuccessScreen = ({ navigation, route }) => {
  const { buyerName, buyerPhone } = route.params || {};

  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 4,
        tension: 5,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.iconContainer,
            { transform: [{ scale: scaleValue }], opacity: opacityValue },
          ]}
        >
          <Ionicons name="checkmark-circle" size={100} color="#4CAF50" />
        </Animated.View>

        <Animated.Text style={[styles.title, { opacity: opacityValue }]}>
          Đặt hàng thành công! 🎉
        </Animated.Text>

        <Animated.Text style={[styles.message, { opacity: opacityValue }]}>
          Cảm ơn <Text style={styles.highlight}>{buyerName || "bạn"}</Text> đã
          mua hàng tại PCShop!{"\n"}
          Chúng tôi sẽ liên hệ qua SĐT{" "}
          <Text style={styles.highlight}>{buyerPhone || ""}</Text> trong thời
          gian sớm nhất để xác nhận đơn hàng.
        </Animated.Text>

        <Animated.View style={[styles.btnContainer, { opacity: opacityValue }]}>
          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() =>
              navigation.reset({ index: 0, routes: [{ name: "Main" }] })
            }
            activeOpacity={0.8}
          >
            <Text style={styles.homeBtnText}>Tiếp tục mua sắm</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export default OrderSuccessScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 24,
    backgroundColor: "#E8F5E9",
    borderRadius: 80,
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 16,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  highlight: {
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  btnContainer: {
    width: "100%",
  },
  homeBtn: {
    backgroundColor: "#E53935",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#E53935",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  homeBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
