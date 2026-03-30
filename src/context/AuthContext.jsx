import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { getAuthMe, loginApi } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user khi app mở
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("currentUser");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUser(parsedUser);

          // Hydrate profile fields if app has token but stale local data.
          if (parsedUser?.token) {
            try {
              const meRes = await getAuthMe();
              const meData = meRes?.data || {};
              const hydratedUser = {
                ...parsedUser,
                fullName: meData.fullName || parsedUser.fullName || parsedUser.username || "",
                phone: meData.phone || parsedUser.phone || "",
                email: meData.email || parsedUser.email || "",
                address: meData.address || parsedUser.address || "",
                customerId: meData.customerId || parsedUser.customerId || "",
              };
              setCurrentUser(hydratedUser);
              await AsyncStorage.setItem("currentUser", JSON.stringify(hydratedUser));
            } catch (e) {
              console.log("Hydrate profile error:", e?.response?.data || e?.message || e);
            }
          }
        }
      } catch (error) {
        console.error("Load user error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // 🔐 LOGIN REAL API
  const login = async (username, password) => {
    try {
      const res = await loginApi({ username, password });

      const data = res.data;

      // Normalize role: convert "ROLE_ADMIN" -> "admin", "ROLE_CUSTOMER" -> "customer"
      let normalizedRole = data.role.toLowerCase().replace("role_", "");

      const user = {
        username: data.username,
        role: normalizedRole,
        customerId: data.customerId,
        token: data.accessToken,
        fullName: data.fullName || data.username || "",
        phone: data.phone || "",
        email: data.email || "",
        address: data.address || "",
      };

      setCurrentUser(user);
      await AsyncStorage.setItem("currentUser", JSON.stringify(user));

      return { success: true, user };
    } catch (err) {
      console.log("Login error:", err.response?.data || err.message);

      return {
        success: false,
        message: err.response?.data?.message || "Đăng nhập thất bại",
      };
    }
  };

  // 🚪 LOGOUT
  const logout = async () => {
    setCurrentUser(null);
    await AsyncStorage.removeItem("currentUser");
  };

  const isLoggedIn = !!currentUser;

  return (
    <AuthContext.Provider
      value={{ currentUser, isLoggedIn, login, logout, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải dùng trong AuthProvider");
  return ctx;
};