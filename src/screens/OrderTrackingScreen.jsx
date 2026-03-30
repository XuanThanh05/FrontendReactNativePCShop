import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getOrderTracking } from "../services/api";
import { COLORS, GOONG_API_KEY } from "../constants/mapTheme";

let MapsModule = null;
try {
  MapsModule = require("react-native-maps");
} catch (e) {
  MapsModule = null;
}

const MapView = MapsModule?.default;
const Marker = MapsModule?.Marker;
const Polyline = MapsModule?.Polyline;

const STATUS_STEPS = ["PENDING", "DELIVERING", "DELIVERED"];

const decodePolyline = (encoded) => {
  if (!encoded) return [];

  let index = 0;
  let lat = 0;
  let lng = 0;
  const coordinates = [];

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    coordinates.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return coordinates;
};

const normalizeStatus = (status) => {
  if (status === "DELIVERED") return "DELIVERED";
  if (status === "DELIVERING" || status === "PICKING" || status === "CONFIRMED") {
    return "DELIVERING";
  }
  return "PENDING";
};

const OrderTrackingScreen = ({ route }) => {
  const routeOrderId = route?.params?.orderId;
  const [orderId, setOrderId] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeEtaText, setRouteEtaText] = useState(null);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  const getGoongRoute = async (origin, destination) => {
    if (!GOONG_API_KEY) {
      return null;
    }

    const endpoint =
      `https://rsapi.goong.io/Direction?origin=${origin.latitude},${origin.longitude}` +
      `&destination=${destination.latitude},${destination.longitude}&vehicle=car&api_key=${GOONG_API_KEY}`;

    const response = await fetch(endpoint);
    const data = await response.json();

    const route = data?.routes?.[0];
    const encoded = route?.overview_polyline?.points;
    if (!encoded) {
      return null;
    }

    const durationSeconds = route?.legs?.[0]?.duration?.value ?? null;

    return {
      coordinates: decodePolyline(encoded),
      durationSeconds,
    };
  };

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
    const resolveOrderId = async () => {
      const parsedRouteOrderId = Number(routeOrderId);
      if (Number.isFinite(parsedRouteOrderId) && parsedRouteOrderId > 0) {
        setOrderId(parsedRouteOrderId);
        await AsyncStorage.setItem("lastTrackingOrderId", String(parsedRouteOrderId));
        return;
      }

      const savedOrderId = await AsyncStorage.getItem("lastTrackingOrderId");
      const parsedSavedOrderId = Number(savedOrderId);
      if (Number.isFinite(parsedSavedOrderId) && parsedSavedOrderId > 0) {
        setOrderId(parsedSavedOrderId);
      } else {
        setLoading(false);
      }
    };

    resolveOrderId();
  }, [routeOrderId]);

  useEffect(() => {
    if (!orderId) {
      return undefined;
    }

    setLoading(true);
    fetchTracking();
    timerRef.current = setInterval(fetchTracking, 10000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [orderId]);

  useEffect(() => {
    const syncRoute = async () => {
      if (
        tracking?.shipperLat == null ||
        tracking?.shipperLng == null ||
        tracking?.deliveryLat == null ||
        tracking?.deliveryLng == null
      ) {
        setRouteCoordinates([]);
        setRouteEtaText(null);
        return;
      }

      try {
        const directions = await getGoongRoute(
          { latitude: tracking.shipperLat, longitude: tracking.shipperLng },
          { latitude: tracking.deliveryLat, longitude: tracking.deliveryLng }
        );

        if (directions?.coordinates?.length > 1) {
          setRouteCoordinates(directions.coordinates);
        } else {
          setRouteCoordinates([]);
        }

        if (directions?.durationSeconds != null) {
          const durationMin = Math.max(1, Math.round(directions.durationSeconds / 60));
          setRouteEtaText(`${durationMin} phút`);
        } else {
          setRouteEtaText(null);
        }
      } catch (e) {
        console.log("goong tracking route error", e?.message || e);
        setRouteCoordinates([]);
        setRouteEtaText(null);
      }
    };

    syncRoute();
  }, [tracking]);

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
        <Text style={styles.emptyText}>
          {orderId
            ? "Không lấy được thông tin đơn hàng."
            : "Chưa có đơn hàng để theo dõi. Hãy đặt đơn mới để xem tracking."}
        </Text>
      </SafeAreaView>
    );
  }

  const normalizedStatus = normalizeStatus(tracking.status);
  const currentStep = Math.max(0, STATUS_STEPS.indexOf(normalizedStatus));
  const hasDeliveryPoint = tracking.deliveryLat != null && tracking.deliveryLng != null;
  const hasShipper = tracking.shipperLat != null && tracking.shipperLng != null;
  const etaToShow = routeEtaText || tracking.estimatedTime;

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
                coordinates={
                  routeCoordinates.length > 1
                    ? routeCoordinates
                    : [
                        { latitude: tracking.shipperLat, longitude: tracking.shipperLng },
                        { latitude: tracking.deliveryLat, longitude: tracking.deliveryLng },
                      ]
                }
                strokeColor={COLORS.primary}
                strokeWidth={3}
                lineDashPattern={routeCoordinates.length > 1 ? undefined : [6, 4]}
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
        {etaToShow ? (
          <View style={styles.etaBox}>
            <Text style={styles.etaText}>Shipper cách bạn khoảng {etaToShow}</Text>
          </View>
        ) : null}

        <Text style={styles.orderCode}>Đơn #{tracking.orderId}</Text>

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
          {["Chờ xác nhận", "Đang giao", "Hoàn tất"].map((label, index) => (
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
  orderCode: {
    textAlign: "center",
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
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
