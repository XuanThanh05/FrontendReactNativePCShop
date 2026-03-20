// src/screens/LoginScreen.js
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!phone.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại");
      return;
    }
    if (!password) {
      Alert.alert("Lỗi", "Vui lòng nhập mật khẩu");
      return;
    }

    setLoading(true);
    // Giả lập delay như gọi API
    setTimeout(async () => {
      const result = await login(phone, password);
      setLoading(false);
      if (result.success) {
        // Admin → Statistics, User → Main
        if (result.isAdmin) {
          navigation.reset({ index: 0, routes: [{ name: "Statistics" }] });
        } else {
          navigation.reset({ index: 0, routes: [{ name: "Main" }] });
        }
      } else {
        Alert.alert("Đăng nhập thất bại", result.message);
      }
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Nút back */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backIcon}>‹</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <Text style={styles.logoEmoji}>🖥️</Text>
          <Text style={styles.logoText}>
            PC<Text style={styles.logoAccent}>Shop</Text>
          </Text>

          <Text style={styles.title}>Đăng nhập với</Text>

          {/* Nút Google (UI only) */}
          <TouchableOpacity style={styles.googleBtn} activeOpacity={0.8}>
            <Text style={styles.googleIcon}>G</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>hoặc</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Số điện thoại */}
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="Nhập số điện thoại"
              placeholderTextColor="#bbb"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={11}
            />
          </View>

          {/* Mật khẩu */}
          <View style={styles.inputWrap}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Nhập mật khẩu"
              placeholderTextColor="#bbb"
              secureTextEntry={!showPass}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPass(!showPass)}
              style={styles.eyeBtn}
            >
              <Text style={styles.eyeIcon}>{showPass ? "🙈" : "👁"}</Text>
            </TouchableOpacity>
          </View>

          {/* Quên mật khẩu */}
          <TouchableOpacity style={styles.forgotWrap}>
            <Text style={styles.forgotText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          {/* Nút đăng nhập */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.submitText}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Text>
          </TouchableOpacity>

          {/* Link đăng ký */}
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Bạn chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.switchLink}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>

          {/* Gợi ý tài khoản test */}
          <View style={styles.hintBox}>
            <Text style={styles.hintTitle}>💡 Tài khoản test:</Text>
            <Text style={styles.hintText}>📱 0901234567 🔑 123456</Text>
            <Text style={styles.hintText}>📱 0912345678 🔑 abcdef</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

  backBtn: { padding: 16, paddingBottom: 0 },
  backIcon: { fontSize: 32, color: "#1a1a1a", lineHeight: 34 },

  container: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  // Logo
  logoEmoji: { fontSize: 52, marginTop: 10, marginBottom: 4 },
  logoText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#1a1a1a",
    marginBottom: 20,
  },
  logoAccent: { color: "#E53935" },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 20,
  },

  // Google button
  googleBtn: {
    width: 120,
    height: 52,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  googleIcon: {
    fontSize: 26,
    fontWeight: "900",
    color: "#E53935",
    fontStyle: "italic",
  },

  // Divider
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#e8e8e8" },
  dividerText: { fontSize: 14, color: "#aaa" },

  // Input
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderBottomWidth: 1.5,
    borderBottomColor: "#e0e0e0",
    marginBottom: 20,
    paddingBottom: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1a1a1a",
    paddingVertical: 4,
  },
  eyeBtn: { padding: 4 },
  eyeIcon: { fontSize: 18 },

  // Quên mật khẩu
  forgotWrap: { alignSelf: "flex-end", marginBottom: 24 },
  forgotText: { fontSize: 14, color: "#1a1a1a", fontWeight: "700" },

  // Submit
  submitBtn: {
    width: "100%",
    backgroundColor: "#E53935",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  submitBtnDisabled: { backgroundColor: "#ccc" },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "800" },

  // Switch
  switchRow: { flexDirection: "row", alignItems: "center" },
  switchText: { fontSize: 14, color: "#555" },
  switchLink: { fontSize: 14, color: "#E53935", fontWeight: "700" },

  // Hint box
  hintBox: {
    marginTop: 24,
    width: "100%",
    backgroundColor: "#FFF8E1",
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: "#FFD700",
  },
  hintTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#555",
    marginBottom: 6,
  },
  hintText: { fontSize: 13, color: "#777", marginBottom: 2 },
});
