import axios from "axios";

// ⚠️ QUAN TRỌNG:'
// Đây là Backend, tuỳ thuộc vào cách mở app expo mà chỉnh baseURL cho phù hợp:
// Android Emulator mặc định chơi → 10.0.2.2
// iOS Simulator → localhost
// Điện thoại vật lí thì sử dụng IP máy tính (localhost không nhận) (vd: 192.168.1.10) 
// (Dùng ipconfig trên cmd hoặc trực tiếp xem wifi settings)
// http://161.118.200.236/api

const API_BASE_URL = "http://161.118.200.236/api";

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
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

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = `${error?.config?.baseURL || ""}${error?.config?.url || ""}`;
    console.log("API error:", { status, requestUrl, message: error?.message });
    return Promise.reject(error);
  }
);

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

// ========== STATISTICS API ==========
export const getSummaryStatistics = () => 
  API.get("/admin/statistics/summary");

export const getOrderStatusDistribution = () => 
  API.get("/admin/statistics/order-status");

export const getTopProducts = () => 
  API.get("/admin/statistics/top-products");

export const getWarehouseReport = () => 
  API.get("/admin/statistics/warehouse-report");
export const getCategories = () => API.get("/products/categories");

// Top sản phẩm hot theo category
export const getTopByCategory = (category) =>
  API.get("/products/top-by-category", { params: { category } });

// Lấy sản phẩm theo category (đã có, nhưng thêm filter brand + price)
export const getProductsByCategoryFiltered = (category, brand, minPrice, maxPrice) =>
  API.get(`/products/category/${category}`, { params: { brand, minPrice, maxPrice } });

// ========== MAP / SHIPPING / TRACKING API ==========
export const getNearbyStores = (lat, lon, radius = 20) =>
  API.get("/stores/nearby", { params: { lat, lon, radius } });

export const calculateShipping = (location) =>
  API.post("/shipping/calculate", location);

export const getOrderTracking = (orderId) =>
  API.get(`/orders/${orderId}/tracking`);

export const updateShipperLocation = (orderId, location) =>
  API.put(`/orders/${orderId}/shipper-location`, location);

export default API;