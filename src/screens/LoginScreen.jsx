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

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

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
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Back */}
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

          <Text style={styles.title}>Đăng nhập</Text>

          {/* USERNAME */}
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="Nhập username"
              placeholderTextColor="#bbb"
              value={username}
              onChangeText={setUsername}
            />
          </View>

          {/* PASSWORD */}
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
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
              <Text style={styles.eyeIcon}>
                {showPass ? "🙈" : "👁"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* BUTTON */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.submitText}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

  backBtn: { padding: 16, paddingBottom: 0 },
  backIcon: { fontSize: 32, color: "#1a1a1a" },

  container: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  logoEmoji: { fontSize: 52, marginTop: 20 },
  logoText: { fontSize: 28, fontWeight: "900" },
  logoAccent: { color: "#E53935" },

  title: { fontSize: 22, fontWeight: "800", marginVertical: 20 },

  // ✅ FIX CHÍNH Ở ĐÂY
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: 20,
  },

  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
    color: "#1a1a1a",
  },

  eyeBtn: {
    paddingHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  eyeIcon: {
    fontSize: 18,
  },

  submitBtn: {
    width: "100%",
    backgroundColor: "#E53935",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  submitBtnDisabled: {
    backgroundColor: "#ccc",
  },

  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});