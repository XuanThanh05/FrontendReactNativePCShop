// src/screens/RegisterScreen.js
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

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirm] = useState("");
  const [isStudent, setIsStudent] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = () => {
    if (!fullName.trim()) return Alert.alert("Lỗi", "Vui lòng nhập họ và tên");
    if (!phone.trim()) return Alert.alert("Lỗi", "Vui lòng nhập số điện thoại");
    if (phone.length < 10)
      return Alert.alert("Lỗi", "Số điện thoại không hợp lệ");
    if (!password) return Alert.alert("Lỗi", "Vui lòng nhập mật khẩu");
    if (password.length < 6)
      return Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
    if (password !== confirmPassword)
      return Alert.alert("Lỗi", "Mật khẩu nhập lại không khớp");
    if (!agreeTerms)
      return Alert.alert("Lỗi", "Vui lòng đồng ý với điều khoản bảo mật");

    setLoading(true);
    setTimeout(async () => {
      const result = await register({
        fullName,
        phone,
        email,
        birthday,
        password,
        confirmPassword,
        isStudent,
      });
      setLoading(false);
      if (result.success) {
        Alert.alert(
          "Thành công! 🎉",
          `Chào mừng ${result.user.fullName} đến với PCShop!`,
          [
            {
              text: "OK",
              onPress: () =>
                navigation.reset({ index: 0, routes: [{ name: "Main" }] }),
            },
          ],
        );
      } else {
        Alert.alert("Đăng ký thất bại", result.message);
      }
    }, 600);
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

          {/* Số điện thoại */}
          <InputField
            placeholder="Nhập số điện thoại"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          {/* Email */}
          <InputField
            placeholder="Nhập email (không bắt buộc)"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            hint="Hoá đơn VAT khi mua hàng sẽ được gửi qua email này"
          />

          {/* Ngày sinh */}
          <InputField
            placeholder="Ngày sinh (dd/mm/yyyy)"
            value={birthday}
            onChangeText={setBirthday}
            keyboardType="numeric"
            rightElement={<Text style={styles.calendarIcon}>📅</Text>}
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
});
