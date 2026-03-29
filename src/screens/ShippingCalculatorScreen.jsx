import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { calculateShipping } from "../services/api";
import { COLORS, GOONG_API_KEY } from "../constants/mapTheme";

const ShippingCalculatorScreen = () => {
  const [address, setAddress] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [useGPS, setUseGPS] = useState(true);

  const geocodeAddress = async (inputAddress) => {
    if (!GOONG_API_KEY) {
      throw new Error("Chưa cấu hình GOONG_API_KEY");
    }

    const response = await fetch(
      `https://rsapi.goong.io/geocode?address=${encodeURIComponent(inputAddress)}&api_key=${GOONG_API_KEY}`
    );
    const data = await response.json();

    if (!data?.results?.length) {
      throw new Error("Không tìm thấy địa chỉ");
    }

    const location = data.results[0].geometry.location;
    return { latitude: location.lat, longitude: location.lng };
  };

  const calculate = async () => {
    setLoading(true);

    try {
      let coords;

      if (useGPS) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          throw new Error("Bạn chưa cấp quyền GPS");
        }

        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        coords = current.coords;
      } else {
        if (!address.trim()) {
          throw new Error("Vui lòng nhập địa chỉ");
        }

        coords = await geocodeAddress(address);
      }

      const response = await calculateShipping({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      setResult(response.data);
    } catch (e) {
      Alert.alert("Không tính được phí ship", e.message || "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Tính phí vận chuyển</Text>

      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, !useGPS && styles.toggleActive]}
          onPress={() => setUseGPS(false)}
        >
          <Text style={[styles.toggleText, !useGPS && styles.toggleTextActive]}>Nhập địa chỉ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleBtn, useGPS && styles.toggleActive]}
          onPress={() => setUseGPS(true)}
        >
          <Text style={[styles.toggleText, useGPS && styles.toggleTextActive]}>Dùng GPS</Text>
        </TouchableOpacity>
      </View>

      {!useGPS && (
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="VD: 25 Hàng Bài, Hoàn Kiếm, Hà Nội"
          placeholderTextColor={COLORS.textSecondary}
        />
      )}

      {useGPS && (
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>Ứng dụng sẽ dùng vị trí hiện tại để tính phí ship.</Text>
        </View>
      )}

      <TouchableOpacity style={styles.btn} onPress={calculate} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Tính phí ship</Text>
        )}
      </TouchableOpacity>

      {result && (
        <View style={styles.resultCard}>
          <Row label="Khu vực" value={result.zone} />
          <Divider />
          <Row label="Khoảng cách" value={`${result.distanceKm} km`} />
          <Divider />
          <Row label="Thời gian dự kiến" value={`${result.estimatedDays} ngày`} />
          <Divider />
          <Row
            label="Phí vận chuyển"
            value={`${Number(result.fee).toLocaleString("vi-VN")}đ`}
            isFee
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const Row = ({ label, value, isFee = false }) => (
  <View style={styles.row}>
    <Text style={isFee ? styles.feeLabel : styles.label}>{label}</Text>
    <Text style={isFee ? styles.feeValue : styles.value}>{value}</Text>
  </View>
);

const Divider = () => <View style={styles.divider} />;

export default ShippingCalculatorScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 18,
  },
  toggleRow: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 4,
    marginBottom: 14,
  },
  toggleBtn: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 8 },
  toggleActive: { backgroundColor: COLORS.primary },
  toggleText: { fontWeight: "700", color: COLORS.textSecondary },
  toggleTextActive: { color: "#fff" },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: COLORS.textPrimary,
    marginBottom: 14,
  },
  noteBox: {
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FFCDD2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  noteText: { color: COLORS.primary },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 14,
    marginBottom: 18,
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  resultCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 11 },
  divider: { height: 1, backgroundColor: COLORS.border },
  label: { color: COLORS.textSecondary },
  value: { color: COLORS.textPrimary, fontWeight: "700" },
  feeLabel: { color: COLORS.textPrimary, fontWeight: "800" },
  feeValue: { color: COLORS.primary, fontSize: 18, fontWeight: "800" },
});
