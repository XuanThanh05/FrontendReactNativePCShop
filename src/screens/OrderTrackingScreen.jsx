import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getOrderTracking } from "../services/api";
import { COLORS } from "../constants/mapTheme";

let MapsModule = null;
try {
  MapsModule = require("react-native-maps");
} catch (e) {
  MapsModule = null;
}

const MapView = MapsModule?.default;
const Marker = MapsModule?.Marker;
const Polyline = MapsModule?.Polyline;

const STATUS_STEPS = ["PENDING", "CONFIRMED", "PICKING", "DELIVERING", "DELIVERED"];

const OrderTrackingScreen = ({ route }) => {
  const { orderId } = route.params;
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  const fetchTracking = async () => {
    try {
      const response = await getOrderTracking(orderId);
      setTracking(response.data);
      setLoading(false);

      if (response.data?.status === "DELIVERED" && timerRef.current) {
        clearInterval(timerRef.current);
      }
    } catch (e) {
      console.log("get tracking error", e?.response?.data || e.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
    timerRef.current = setInterval(fetchTracking, 15000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [orderId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (!tracking) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.emptyText}>Không lấy được thông tin đơn hàng.</Text>
      </SafeAreaView>
    );
  }

  const currentStep = Math.max(0, STATUS_STEPS.indexOf(tracking.status));
  const hasDeliveryPoint = tracking.deliveryLat && tracking.deliveryLng;
  const hasShipper = tracking.status === "DELIVERING" && tracking.shipperLat && tracking.shipperLng;

  return (
    <SafeAreaView style={styles.container}>
      {hasDeliveryPoint && MapView && Marker ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: tracking.deliveryLat,
            longitude: tracking.deliveryLng,
            latitudeDelta: 0.04,
            longitudeDelta: 0.04,
          }}
        >
          <Marker
            coordinate={{ latitude: tracking.deliveryLat, longitude: tracking.deliveryLng }}
            title="Điểm giao hàng"
            pinColor={COLORS.primary}
          />

          {hasShipper && Polyline ? (
            <>
              <Marker
                coordinate={{ latitude: tracking.shipperLat, longitude: tracking.shipperLng }}
                title="Shipper"
              />
              <Polyline
                coordinates={[
                  { latitude: tracking.shipperLat, longitude: tracking.shipperLng },
                  { latitude: tracking.deliveryLat, longitude: tracking.deliveryLng },
                ]}
                strokeColor={COLORS.primary}
                strokeWidth={3}
                lineDashPattern={[6, 4]}
              />
            </>
          ) : null}
        </MapView>
      ) : hasDeliveryPoint ? (
        <View style={styles.mapFallback}>
          <Text style={styles.fallbackTitle}>Không tải được map native trong runtime hiện tại</Text>
          <Text style={styles.fallbackText}>
            Bạn vẫn theo dõi được trạng thái và ETA bên dưới.
          </Text>
        </View>
      ) : null}

      <View style={styles.statusCard}>
        {tracking.estimatedTime ? (
          <View style={styles.etaBox}>
            <Text style={styles.etaText}>Shipper cách bạn khoảng {tracking.estimatedTime}</Text>
          </View>
        ) : null}

        <Text style={styles.statusLabel}>{tracking.statusLabel}</Text>

        <View style={styles.stepsRow}>
          {STATUS_STEPS.map((step, index) => (
            <View key={step} style={styles.stepWrap}>
              <View
                style={[
                  styles.stepDot,
                  index <= currentStep && styles.stepDotActive,
                  index === currentStep && styles.stepDotCurrent,
                ]}
              />
              {index < STATUS_STEPS.length - 1 && (
                <View
                  style={[styles.stepLine, index < currentStep && styles.stepLineActive]}
                />
              )}
            </View>
          ))}
        </View>

        <View style={styles.labelsRow}>
          {["Chờ", "Xác nhận", "Lấy hàng", "Đang giao", "Hoàn tất"].map((label, index) => (
            <Text
              key={label}
              style={[styles.stepLabel, index <= currentStep && styles.stepLabelActive]}
            >
              {label}
            </Text>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OrderTrackingScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: COLORS.textSecondary },
  map: { flex: 1 },
  mapFallback: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  fallbackTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  fallbackText: {
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
  statusCard: {
    backgroundColor: "#fff",
    padding: 18,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  etaBox: {
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FFCDD2",
    borderRadius: 10,
    padding: 11,
    marginBottom: 12,
  },
  etaText: { color: COLORS.primary, fontWeight: "700", textAlign: "center" },
  statusLabel: {
    textAlign: "center",
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 14,
  },
  stepsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  stepWrap: { flex: 1, flexDirection: "row", alignItems: "center" },
  stepDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.border,
  },
  stepDotActive: { backgroundColor: COLORS.primary },
  stepDotCurrent: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.primaryDark,
  },
  stepLine: { flex: 1, height: 3, backgroundColor: COLORS.border },
  stepLineActive: { backgroundColor: COLORS.primary },
  labelsRow: { flexDirection: "row", justifyContent: "space-between" },
  stepLabel: { flex: 1, textAlign: "center", fontSize: 10, color: COLORS.textSecondary },
  stepLabelActive: { color: COLORS.primary, fontWeight: "700" },
});
