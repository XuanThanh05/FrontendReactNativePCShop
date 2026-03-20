// src/screens/AccountScreen.js
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";

const MenuItem = ({ emoji, label, onPress }) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.menuLeft}>
      <Text style={styles.menuEmoji}>{emoji}</Text>
      <Text style={styles.menuLabel}>{label}</Text>
    </View>
    <Text style={styles.menuArrow}>›</Text>
  </TouchableOpacity>
);

const MenuSection = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionLabel}>{title}</Text>
    <View style={styles.sectionCard}>{children}</View>
  </View>
);

const AccountScreen = ({ navigation }) => {
  const { currentUser, isLoggedIn, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: "Main" }] });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#E53935" />

      {/* ── Header ─────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tài khoản</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Chào mừng / chưa đăng nhập ─────────────────── */}
        <View style={styles.welcomeCard}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <View style={styles.welcomeInfo}>
            <Text style={styles.welcomeTitle}>
              {isLoggedIn
                ? `Chào ${currentUser.fullName}`
                : "Chào mừng bạn đến với PCShop"}
            </Text>
            <Text style={styles.welcomeSub}>
              {isLoggedIn
                ? currentUser.phone
                : "Đăng nhập để không bỏ lỡ các ưu đãi hấp dẫn."}
            </Text>
          </View>
        </View>

        {/* ── Nút đăng nhập / đăng ký ────────────────────── */}
        {!isLoggedIn && (
          <View style={styles.authRow}>
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => navigation?.navigate("Login")}
              activeOpacity={0.85}
            >
              <Text style={styles.loginBtnText}>Đăng nhập</Text>
            </TouchableOpacity>

            <Text style={styles.orText}>hoặc</Text>

            <TouchableOpacity
              style={styles.registerBtn}
              onPress={() => navigation?.navigate("Register")}
              activeOpacity={0.85}
            >
              <Text style={styles.registerBtnText}>Đăng ký</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Lịch sử ────────────────────────────────────── */}
        <MenuSection title="Lịch sử">
          <MenuItem
            emoji="🧾"
            label="Lịch sử mua hàng"
            onPress={() => {
              if (isLoggedIn) {
                navigation?.navigate("UserStatisticsReport");
              } else {
                navigation?.navigate("Login");
              }
            }}
          />
        </MenuSection>

        {isLoggedIn && (
          <>
            {/* ── Ưu đãi ─────────────────────────────────────── */}
            <MenuSection title="Ưu đãi">
              <MenuItem emoji="💎" label="Hạng thành viên" onPress={() => {}} />
              <View style={styles.divider} />
              <MenuItem emoji="🏷️" label="Mã giảm giá" onPress={() => {}} />
            </MenuSection>

            {/* ── Tài khoản ──────────────────────────────────── */}
            <MenuSection title="Tài khoản">
              <MenuItem
                emoji="👤"
                label="Thông tin cá nhân"
                onPress={() => {}}
              />
              <View style={styles.divider} />
              <MenuItem emoji="🔒" label="Đổi mật khẩu" onPress={() => {}} />
            </MenuSection>

            {/* ── Đăng xuất ──────────────────────────────────── */}
            <View style={{ marginHorizontal: 12, marginTop: 12 }}>
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={handleLogout}
                activeOpacity={0.85}
              >
                <Text style={styles.logoutBtnText}>Đăng xuất</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AccountScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f5f5f5" },

  // Header
  header: {
    backgroundColor: "#E53935",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#fff" },

  // Welcome card
  welcomeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#fff",
    margin: 12,
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#eee",
  },
  avatarEmoji: { fontSize: 32 },
  welcomeInfo: { flex: 1 },
  welcomeTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 4,
    lineHeight: 20,
  },
  welcomeSub: { fontSize: 12, color: "#888", lineHeight: 17 },

  // Auth buttons
  authRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
    marginBottom: 12,
    gap: 10,
  },
  loginBtn: {
    flex: 1,
    backgroundColor: "#E53935",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },
  loginBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  orText: { fontSize: 13, color: "#888" },
  registerBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#E53935",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  registerBtnText: { color: "#E53935", fontSize: 15, fontWeight: "800" },

  // Section
  section: { marginHorizontal: 12, marginBottom: 12 },
  sectionLabel: {
    fontSize: 13,
    color: "#888",
    fontWeight: "600",
    marginBottom: 6,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },

  // Menu item
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  menuLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  menuEmoji: { fontSize: 20 },
  menuLabel: { fontSize: 15, color: "#1a1a1a", fontWeight: "500" },
  menuArrow: { fontSize: 22, color: "#bbb", fontWeight: "300" },

  // Divider
  divider: {
    height: 1,
    backgroundColor: "#f5f5f5",
    marginLeft: 52,
  },

  // Logout button
  logoutBtn: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#E53935",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutBtnText: {
    color: "#E53935",
    fontSize: 15,
    fontWeight: "800",
  },
});
