// src/context/AuthContext.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import {
    checkPhoneExists,
    loginUser,
    registerUser,
} from "../constants/mockUsers";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // null = chưa đăng nhập
  const [loading, setLoading] = useState(true);

  // Load user data on startup
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("currentUser");
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to load user", error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // ── Đăng nhập ───────────────────────────────────────────────
  const login = async (phone, password) => {
    const user = loginUser(phone, password);
    if (user) {
      setCurrentUser(user);
      await AsyncStorage.setItem("currentUser", JSON.stringify(user));
      return { success: true, user, isAdmin: user.role === "admin" };
    }
    return {
      success: false,
      message: "Số điện thoại hoặc mật khẩu không đúng",
    };
  };

  // ── Đăng ký ─────────────────────────────────────────────────
  const register = async (userData) => {
    if (checkPhoneExists(userData.phone)) {
      return { success: false, message: "Số điện thoại này đã được đăng ký" };
    }
    if (userData.password !== userData.confirmPassword) {
      return { success: false, message: "Mật khẩu nhập lại không khớp" };
    }
    const newUser = registerUser(userData);
    setCurrentUser(newUser);
    await AsyncStorage.setItem("currentUser", JSON.stringify(newUser));
    return { success: true, user: newUser };
  };

  // ── Đăng xuất ───────────────────────────────────────────────
  const logout = async () => {
    setCurrentUser(null);
    await AsyncStorage.removeItem("currentUser");
  };

  const isLoggedIn = !!currentUser;

  return (
    <AuthContext.Provider
      value={{ currentUser, isLoggedIn, login, register, logout, loading }}
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
