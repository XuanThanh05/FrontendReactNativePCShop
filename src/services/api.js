import axios from "axios";

// ⚠️ QUAN TRỌNG:
// Android Emulator → 10.0.2.2
// iOS Simulator → localhost
// Máy thật → IP máy tính (vd: 192.168.1.10)

const API = axios.create({
  baseURL: "http://192.168.x.x:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Gắn token vào header nếu có
API.interceptors.request.use(async (config) => {
  try {
    const storedUser = await import("@react-native-async-storage/async-storage")
      .then((m) => m.default.getItem("currentUser"));

    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
  } catch (e) {
    console.log("Token error:", e);
  }
  return config;
});

// API login
export const loginApi = (data) => {
  return API.post("/auth/login", data);
};
// Lấy sản phẩm có phân trang
export const getProductsPaged = (page = 0, size = 10) => {
  return API.get("/products/paged", { params: { page, size } });
};

// Tìm kiếm sản phẩm
export const searchProducts = (keyword) => {
  return API.get("/products/search", { params: { keyword } });
};

// Lấy sản phẩm theo danh mục
export const getProductsByCategory = (category) => {
  return API.get(`/products/category/${category}`);
};
// Lấy giỏ hàng của user
export const getCart = () => API.get("/cart");

// Thêm sản phẩm vào giỏ
export const addToCart = (data) => API.post("/cart/items", data);

// Cập nhật số lượng sản phẩm
export const updateCartItem = (cartItemId, quantity) =>
  API.put(`/cart/items/${cartItemId}`, null, { params: { quantity } });

// Xóa 1 sản phẩm khỏi giỏ
export const removeCartItem = (cartItemId) =>
  API.delete(`/cart/items/${cartItemId}`);

// Xóa toàn bộ giỏ hàng
export const clearCart = () => API.delete("/cart");
export default API;