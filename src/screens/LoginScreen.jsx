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
  const keyboardOffset = Platform.OS === "ios" ? 0 : StatusBar.currentHeight || 0;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  const handleLogin = async () => {
    if (!username.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập username");
      return;
    }
    if (!password) {
      Alert.alert("Lỗi", "Vui lòng nhập mật khẩu");
      return;
    }

    setLoading(true);

    const result = await login(username, password);

    setLoading(false);

    if (result.success) {
      navigation.reset({ index: 0, routes: [{ name: "Main" }] });
    } else {
      Alert.alert("Đăng nhập thất bại", result.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#E53935" />

      {/* Back */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={keyboardOffset}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={styles.heroBlock}>
            <Text style={styles.logoText}>
              PC<Text style={styles.logoAccent}>Shop</Text>
            </Text>
            <Text style={styles.heroTitle}>Chào mừng bạn quay lại</Text>
            <Text style={styles.heroSubTitle}>
              Đăng nhập để xem đơn hàng và nhận ưu đãi mới nhất
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.title}>Đăng nhập tài khoản</Text>

            <Text style={styles.fieldLabel}>Username</Text>
            <View
              style={[
                styles.inputWrap,
                focusedField === "username" && styles.inputWrapFocused,
              ]}
            >
              <Text style={styles.inputPrefix}>@</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập username"
                placeholderTextColor="#a9a9a9"
                value={username}
                onChangeText={setUsername}
                onFocus={() => setFocusedField("username")}
                onBlur={() => setFocusedField("")}
                autoCapitalize="none"
              />
            </View>

            <Text style={styles.fieldLabel}>Mật khẩu</Text>
            <View
              style={[
                styles.inputWrap,
                focusedField === "password" && styles.inputWrapFocused,
              ]}
            >
              <Text style={styles.inputPrefix}>*</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu"
                placeholderTextColor="#a9a9a9"
                secureTextEntry={!showPass}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField("")}
              />

              <TouchableOpacity
                onPress={() => setShowPass(!showPass)}
                style={styles.eyeBtn}
              >
                <Text style={styles.eyeIcon}>{showPass ? "Ẩn" : "Hiện"}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.submitText}>
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Text>
            </TouchableOpacity>

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.switchLink}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.badgeRow}>
              <View style={styles.badgeItem}>
                <Text style={styles.badgeDot}>•</Text>
                <Text style={styles.badgeText}>Bảo mật token JWT</Text>
              </View>
              <View style={styles.badgeItem}>
                <Text style={styles.badgeDot}>•</Text>
                <Text style={styles.badgeText}>Theo dõi đơn hàng realtime</Text>
              </View>
            </View>
          </View>

          <View style={styles.bottomSpacer}>
            <Text style={styles.bottomText}>
              Hệ thống mua sắm công nghệ chính hãng
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7F8FB" },

  backBtn: {
    marginTop: 8,
    marginLeft: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(229, 57, 53, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  backIcon: { fontSize: 20, color: "#E53935", fontWeight: "900" },

  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 28,
  },

  heroBlock: {
    backgroundColor: "#E53935",
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 20,
    marginTop: -8,
    marginBottom: 16,
  },
  logoText: { fontSize: 28, fontWeight: "900", color: "#fff" },
  logoAccent: { color: "#FFD700" },
  heroTitle: {
    marginTop: 10,
    fontSize: 19,
    color: "#fff",
    fontWeight: "800",
  },
  heroSubTitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: "#FFEAEA",
  },

  formCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: "#F2D3D2",
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },

  title: {
    fontSize: 20,
    fontWeight: "900",
    color: "#1F2937",
    marginBottom: 16,
  },

  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
    marginBottom: 8,
  },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  inputWrapFocused: {
    borderColor: "#E53935",
    backgroundColor: "#FFF7F7",
  },
  inputPrefix: {
    fontSize: 16,
    fontWeight: "800",
    color: "#E53935",
    marginRight: 8,
  },

  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 12,
    color: "#1a1a1a",
  },

  eyeBtn: {
    paddingHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
  },

  eyeIcon: {
    fontSize: 13,
    color: "#E53935",
    fontWeight: "800",
  },

  submitBtn: {
    width: "100%",
    backgroundColor: "#E53935",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },

  submitBtnDisabled: {
    backgroundColor: "#ccc",
  },

  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },

  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  switchText: {
    fontSize: 13,
    color: "#6B7280",
  },
  switchLink: {
    fontSize: 13,
    color: "#E53935",
    fontWeight: "800",
  },

  badgeRow: {
    marginTop: 6,
    gap: 4,
  },
  badgeItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  badgeDot: {
    color: "#E53935",
    fontSize: 16,
    marginRight: 6,
    lineHeight: 16,
  },
  badgeText: {
    fontSize: 12,
    color: "#4B5563",
  },
  bottomSpacer: {
    marginTop: 16,
    alignItems: "center",
  },
  bottomText: {
    color: "#9CA3AF",
    fontSize: 12,
  },
});