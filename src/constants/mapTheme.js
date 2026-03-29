import API from "../services/api";

export const COLORS = {
  primary: "#E53935",
  primaryDark: "#B71C1C",
  background: "#FFFFFF",
  surface: "#F5F5F5",
  textPrimary: "#212121",
  textSecondary: "#757575",
  border: "#E0E0E0",
};

// Derive the host from axios baseURL (e.g. http://ip:8080/api -> http://ip:8080)
export const API_BASE = (API.defaults.baseURL || "").replace(/\/api\/?$/, "");

export const GOONG_API_KEY = "";
