import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
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

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultType, setResultType] = useState("success");
  const [resultMessage, setResultMessage] = useState("");
  const resultAnim = useRef(new Animated.Value(0)).current;
  const autoCloseTimerRef = useRef(null);

  const handleCloseResultModal = useCallback((navigateToMain = false) => {
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
    setShowResultModal(false);
    if (navigateToMain) {
      navigation.reset({ index: 0, routes: [{ name: "Main" }] });
    }
  }, [navigation]);

  useEffect(() => {
    if (!showResultModal) return;

    resultAnim.setValue(0);
    Animated.timing(resultAnim, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start();

    if (resultType === "success") {
      autoCloseTimerRef.current = setTimeout(() => {
        handleCloseResultModal(true);
      }, 1600);
    }

    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
    };
  }, [showResultModal, resultType, resultAnim, handleCloseResultModal]);

  const openResultModal = (type, message) => {
    setResultType(type);
    setResultMessage(message);
    setShowResultModal(true);
  };

  const handleLogin = async () => {
    if (!identifier.trim()) {
      openResultModal("error", "Vui lòng nhập username, số điện thoại hoặc email");
      return;
    }
    if (!password) {
      openResultModal("error", "Vui lòng nhập mật khẩu");
      return;
    }

    setLoading(true);

    const result = await login(identifier, password);

    setLoading(false);

    if (result.success) {
      openResultModal("success", "Đăng nhập thành công, đang chuyển trang...");
    } else {
      openResultModal("error", result.message || "Đăng nhập thất bại");
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

            <Text style={styles.fieldLabel}>Username / SĐT / Email</Text>
            <View
              style={[
                styles.inputWrap,
                focusedField === "username" && styles.inputWrapFocused,
              ]}
            >
              <Text style={styles.inputPrefix}>@</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập username, số điện thoại hoặc email"
                placeholderTextColor="#a9a9a9"
                value={identifier}
                onChangeText={setIdentifier}
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

      <Modal
        visible={showResultModal}
        transparent
        animationType="none"
        onRequestClose={() => handleCloseResultModal(false)}
      >
        <Animated.View
          style={[
            styles.modalOverlay,
            {
              opacity: resultAnim,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.modalCard,
              {
                opacity: resultAnim,
                transform: [
                  {
                    scale: resultAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.88, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View
              style={[
                styles.modalBadge,
                resultType === "success"
                  ? styles.modalBadgeSuccess
                  : styles.modalBadgeError,
              ]}
            >
              <Text style={styles.modalBadgeIcon}>
                {resultType === "success" ? "✓" : "!"}
              </Text>
            </View>
            <Text
              style={[
                styles.modalTitle,
                resultType === "success"
                  ? styles.modalTitleSuccess
                  : styles.modalTitleError,
              ]}
            >
              {resultType === "success" ? "Đăng nhập thành công" : "Đăng nhập thất bại"}
            </Text>
            <Text style={styles.modalMessage}>{resultMessage}</Text>

            <TouchableOpacity
              style={[
                styles.modalButton,
                resultType === "success"
                  ? styles.modalButtonSuccess
                  : styles.modalButtonError,
              ]}
              onPress={() => handleCloseResultModal(resultType === "success")}
            >
              <Text style={styles.modalButtonText}>
                {resultType === "success" ? "Vào trang chủ" : "Đóng"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>
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

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.38)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 18,
    alignItems: "center",
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 8,
  },
  modalBadge: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  modalBadgeSuccess: { backgroundColor: "#FCEAEA" },
  modalBadgeError: { backgroundColor: "#FDECEC" },
  modalBadgeIcon: {
    fontSize: 30,
    color: "#E53935",
    fontWeight: "900",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 8,
  },
  modalTitleSuccess: { color: "#E53935" },
  modalTitleError: { color: "#B91C1C" },
  modalMessage: {
    fontSize: 14,
    lineHeight: 21,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 16,
  },
  modalButton: {
    width: "100%",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },
  modalButtonSuccess: { backgroundColor: "#E53935" },
  modalButtonError: { backgroundColor: "#EF4444" },
  modalButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
});