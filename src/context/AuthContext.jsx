// src/context/AuthContext.js
import React, { createContext, useContext, useState } from 'react';
import { loginUser, registerUser, checkPhoneExists } from '../constants/mockUsers';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // null = chưa đăng nhập

  // ── Đăng nhập ───────────────────────────────────────────────
  const login = (phone, password) => {
    const user = loginUser(phone, password);
    if (user) {
      setCurrentUser(user);
      return { success: true, user };
    }
    return { success: false, message: 'Số điện thoại hoặc mật khẩu không đúng' };
  };

  // ── Đăng ký ─────────────────────────────────────────────────
  const register = (userData) => {
    if (checkPhoneExists(userData.phone)) {
      return { success: false, message: 'Số điện thoại này đã được đăng ký' };
    }
    if (userData.password !== userData.confirmPassword) {
      return { success: false, message: 'Mật khẩu nhập lại không khớp' };
    }
    const newUser = registerUser(userData);
    setCurrentUser(newUser);
    return { success: true, user: newUser };
  };

  // ── Đăng xuất ───────────────────────────────────────────────
  const logout = () => setCurrentUser(null);

  const isLoggedIn = !!currentUser;

  return (
    <AuthContext.Provider value={{ currentUser, isLoggedIn, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải dùng trong AuthProvider');
  return ctx;
};