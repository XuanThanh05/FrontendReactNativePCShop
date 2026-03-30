import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { getAuthMe, loginApi, registerApi } from "../services/api";

const AuthContext = createContext();

const parseRegisterErrorMessage = (err) => {
  const rawMessage =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    "";
  const message = String(rawMessage).toLowerCase();

  if (message.includes("phone") && (message.includes("exists") || message.includes("duplicate"))) {
    return "Số điện thoại đã tồn tại. Vui lòng dùng số khác.";
  }
  if (message.includes("email") && (message.includes("exists") || message.includes("duplicate"))) {
    return "Email đã tồn tại. Vui lòng dùng email khác.";
  }
  if (message.includes("username") && (message.includes("exists") || message.includes("duplicate"))) {
    return "Username đã tồn tại. Vui lòng chọn username khác.";
  }

  if (message.includes("phone number format is invalid")) {
    return "Số điện thoại không đúng định dạng. Vui lòng nhập 8-20 ký tự số.";
  }
  if (message.includes("email is invalid")) {
    return "Email không hợp lệ. Vui lòng kiểm tra lại.";
  }
  if (message.includes("password must be between")) {
    return "Mật khẩu phải có từ 8 đến 64 ký tự.";
  }
  if (message.includes("username must be between")) {
    return "Username phải có từ 4 đến 50 ký tự.";
  }
  if (message.includes("full name is required")) {
    return "Vui lòng nhập họ và tên.";
  }

  if (err?.response?.status === 409) {
    return "Thông tin đăng ký đã tồn tại. Vui lòng kiểm tra username, số điện thoại hoặc email.";
  }

  return rawMessage || "Đăng ký thất bại. Vui lòng thử lại.";
};

const parseLoginErrorMessage = (err) => {
  const status = err?.response?.status;
  const rawMessage =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    "";
  const normalized = String(rawMessage).toLowerCase();

  if (
    status === 401 ||
    normalized.includes("unauthorized") ||
    normalized.includes("invalid") ||
    normalized.includes("bad credentials") ||
    normalized.includes("wrong password") ||
    normalized.includes("incorrect")
  ) {
    return "Sai tài khoản hoặc mật khẩu. Vui lòng kiểm tra lại.";
  }

  if (status === 403) {
    return "Tài khoản của bạn không có quyền đăng nhập.";
  }

  if (status >= 500) {
    return "Hệ thống đang bận. Vui lòng thử lại sau ít phút.";
  }

  if (normalized.includes("network") || normalized.includes("timeout")) {
    return "Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.";
  }

  return rawMessage || "Đăng nhập thất bại";
};

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
  const login = async (identifier, password) => {
    try {
      const res = await loginApi({ identifier: identifier?.trim(), password });

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
        message: parseLoginErrorMessage(err),
      };
    }
  };

  const register = async ({ username, email, password, fullName, phone, address }) => {
    try {
      const payload = {
        username: username.trim(),
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        phone: phone?.trim() || "",
        address: address?.trim() || "",
      };

      const res = await registerApi(payload);
      const data = res.data || {};

      const normalizedRole = (data.role || "ROLE_CUSTOMER")
        .toLowerCase()
        .replace("role_", "");

      const user = {
        username: data.username || payload.username,
        role: normalizedRole,
        customerId: data.customerId || "",
        token: data.accessToken,
        fullName: data.fullName || payload.fullName,
        phone: data.phone || payload.phone,
        email: data.email || payload.email,
        address: data.address || payload.address,
      };

      setCurrentUser(user);
      await AsyncStorage.setItem("currentUser", JSON.stringify(user));

      return {
        success: true,
        user,
        message: data.message || "Đăng ký thành công",
      };
    } catch (err) {
      console.log("Register error:", err.response?.data || err.message);

      return {
        success: false,
        message: parseRegisterErrorMessage(err),
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