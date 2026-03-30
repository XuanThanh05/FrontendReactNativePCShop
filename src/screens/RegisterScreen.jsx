// src/screens/RegisterScreen.js
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
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

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const keyboardOffset = Platform.OS === "ios" ? 0 : StatusBar.currentHeight || 0;
  const modalAnim = useRef(new Animated.Value(0)).current;
  const autoCloseTimerRef = useRef(null);

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirm] = useState("");
  const [isStudent, setIsStudent] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("Đăng ký thành công");

  const handleFinishRegister = useCallback(() => {
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
    setShowSuccessModal(false);
    navigation.reset({ index: 0, routes: [{ name: "Main" }] });
  }, [navigation]);

  useEffect(() => {
    if (!showSuccessModal) return;

    modalAnim.setValue(0);
    Animated.parallel([
      Animated.timing(modalAnim, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }),
    ]).start();

    autoCloseTimerRef.current = setTimeout(() => {
      handleFinishRegister();
    }, 2000);

    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
    };
  }, [showSuccessModal, modalAnim, handleFinishRegister]);

  const handleRegister = async () => {
    if (!fullName.trim()) return Alert.alert("Lỗi", "Vui lòng nhập họ và tên");
    if (!username.trim()) return Alert.alert("Lỗi", "Vui lòng nhập username");
    if (username.trim().length < 4)
      return Alert.alert("Lỗi", "Username phải có ít nhất 4 ký tự");
    if (!phone.trim()) return Alert.alert("Lỗi", "Vui lòng nhập số điện thoại");
    if (phone.trim().length < 8)
      return Alert.alert("Lỗi", "Số điện thoại không hợp lệ");
    if (!email.trim()) return Alert.alert("Lỗi", "Vui lòng nhập email");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return Alert.alert("Lỗi", "Email không hợp lệ");
    if (!password) return Alert.alert("Lỗi", "Vui lòng nhập mật khẩu");
    if (password.length < 8)
      return Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 8 ký tự");
    if (password !== confirmPassword)
      return Alert.alert("Lỗi", "Mật khẩu nhập lại không khớp");
    if (!agreeTerms)
      return Alert.alert("Lỗi", "Vui lòng đồng ý với điều khoản bảo mật");

    setLoading(true);
    const result = await register({
      username,
      fullName,
      phone,
      email,
      password,
      isStudent,
    });
    setLoading(false);

    if (result.success) {
      setSuccessMessage(
        result.message || `Chào mừng ${result.user.fullName} đến với PCShop!`,
      );
      setShowSuccessModal(true);
    } else {
      Alert.alert("Đăng ký thất bại", result.message);
    }
  };

  const InputField = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType,
    secureTextEntry,
    hint,
    rightElement,
  }) => (
    <View style={styles.fieldWrap}>
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          placeholder={placeholder || label}
          placeholderTextColor="#bbb"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType || "default"}
          secureTextEntry={secureTextEntry || false}
          autoCapitalize="none"
        />
        {rightElement}
      </View>
      {hint && <Text style={styles.inputHint}>{hint}</Text>}
    </View>
  );

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
          {/* Logo */}
          <Text style={styles.logoEmoji}>🖥️</Text>
          <Text style={styles.logoText}>
            PC<Text style={styles.logoAccent}>Shop</Text>
          </Text>

          <Text style={styles.title}>Đăng ký với</Text>

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

          {/* Họ và tên */}
          <InputField
            placeholder="Nhập họ và tên"
            value={fullName}
            onChangeText={setFullName}
          />

          <InputField
            placeholder="Nhập username"
            value={username}
            onChangeText={setUsername}
          />

          {/* Số điện thoại */}
          <InputField
            placeholder="Nhập số điện thoại"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          {/* Email */}
          <InputField
            placeholder="Nhập email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            hint="Hoá đơn VAT khi mua hàng sẽ được gửi qua email này"
          />

          {/* Mật khẩu */}
          <InputField
            placeholder="Nhập mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
            rightElement={
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                <Text style={styles.eyeIcon}>{showPass ? "🙈" : "👁"}</Text>
              </TouchableOpacity>
            }
          />

          {/* Nhập lại mật khẩu */}
          <InputField
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChangeText={setConfirm}
            secureTextEntry={!showConfirm}
            rightElement={
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                <Text style={styles.eyeIcon}>{showConfirm ? "🙈" : "👁"}</Text>
              </TouchableOpacity>
            }
          />

          {/* Checkbox điều khoản */}
          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => setAgreeTerms(!agreeTerms)}
            activeOpacity={0.7}
          >
            <View
              style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}
            >
              {agreeTerms && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkLabel}>
              Tôi đồng ý với các{" "}
              <Text style={styles.linkText}>điều khoản bảo mật cá nhân</Text>
            </Text>
          </TouchableOpacity>

          {/* Checkbox học sinh - sinh viên */}
          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => setIsStudent(!isStudent)}
            activeOpacity={0.7}
          >
            <View
              style={[styles.checkbox, isStudent && styles.checkboxChecked]}
            >
              {isStudent && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.checkLabel}>
                Tôi là Học sinh - Sinh viên{" "}
                <Text style={styles.helpIcon}>(?)</Text>
              </Text>
              <Text style={styles.checkSub}>
                (nhận thêm ưu đãi tới 500k/ sản phẩm)
              </Text>
            </View>
          </TouchableOpacity>

          {/* Nút đăng ký */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.submitText}>
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </Text>
          </TouchableOpacity>

          {/* Link đăng nhập */}
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Bạn đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.switchLink}>Đăng nhập ngay</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showSuccessModal}
        transparent
        animationType="none"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <Animated.View
          style={[
            styles.modalOverlay,
            {
              opacity: modalAnim,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.modalCard,
              {
                opacity: modalAnim,
                transform: [
                  {
                    scale: modalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.86, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.modalBadge}>
              <Text style={styles.modalBadgeIcon}>✓</Text>
            </View>
            <Text style={styles.modalTitle}>Đăng ký hoàn tất</Text>
            <Text style={styles.modalDescription}>{successMessage}</Text>
            <Text style={styles.modalCountdown}>Đang chuyển về trang chủ...</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleFinishRegister}
              activeOpacity={0.85}
            >
              <Text style={styles.modalButtonText}>Bắt đầu mua sắm</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

  backBtn: { padding: 16, paddingBottom: 0 },
  backIcon: { fontSize: 32, color: "#1a1a1a", lineHeight: 34 },

  container: {
    alignItems: "center",
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 72,
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

  // Google
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
    marginBottom: 16,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#e8e8e8" },
  dividerText: { fontSize: 14, color: "#aaa" },

  // Input
  fieldWrap: { width: "100%", marginBottom: 16 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1.5,
    borderBottomColor: "#e0e0e0",
    paddingBottom: 8,
  },
  input: { flex: 1, fontSize: 15, color: "#1a1a1a", paddingVertical: 4 },
  inputHint: { fontSize: 11, color: "#aaa", marginTop: 5, fontStyle: "italic" },
  eyeIcon: { fontSize: 18, paddingLeft: 8 },
  calendarIcon: { fontSize: 18, paddingLeft: 8 },

  // Checkbox
  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
    marginBottom: 14,
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: "#E53935", borderColor: "#E53935" },
  checkmark: { color: "#fff", fontSize: 13, fontWeight: "bold" },
  checkLabel: { fontSize: 14, color: "#333", flex: 1, lineHeight: 20 },
  checkSub: { fontSize: 12, color: "#888", marginTop: 2 },
  linkText: { color: "#E53935", textDecorationLine: "underline" },
  helpIcon: { color: "#aaa" },

  // Submit
  submitBtn: {
    width: "100%",
    backgroundColor: "#E53935",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  submitBtnDisabled: { backgroundColor: "#ccc" },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "800" },

  // Switch
  switchRow: { flexDirection: "row", alignItems: "center" },
  switchText: { fontSize: 14, color: "#555" },
  switchLink: { fontSize: 14, color: "#E53935", fontWeight: "700" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(229, 57, 53, 0.22)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FAD2D1",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: "center",
    shadowColor: "#E53935",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  modalBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FCEAEA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  modalBadgeIcon: {
    fontSize: 30,
    color: "#E53935",
    fontWeight: "900",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#E53935",
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 6,
  },
  modalCountdown: {
    fontSize: 12,
    color: "#B91C1C",
    fontStyle: "italic",
    marginBottom: 18,
  },
  modalButton: {
    width: "100%",
    borderRadius: 12,
    backgroundColor: "#E53935",
    paddingVertical: 14,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
});
