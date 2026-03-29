import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getNearbyStores } from "../services/api";
import { useUserLocation } from "../hooks/useUserLocation";
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

const defaultRegion = {
  latitude: 21.0285,
  longitude: 105.8542,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

const StoreMapScreen = ({ navigation, route }) => {
  const { location, error, loading } = useUserLocation();
  const mapRef = useRef(null);
  const selectMode = route?.params?.selectMode === true;
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeSummary, setRouteSummary] = useState(null);

  useEffect(() => {
    if (!location) return;

    getNearbyStores(location.latitude, location.longitude, 20)
      .then((res) => {
        setStores(res.data || []);
        if (res.data?.length) {
          setSelectedStore(res.data[0]);
        }
      })
      .catch((e) => {
        console.log("get nearby stores error", e?.response?.data || e.message);
      });
  }, [location]);

  const handleSelectStore = (store) => {
    setSelectedStore(store);
    setRouteCoordinates([]);
    setRouteSummary(null);
    if (!mapRef.current) return;

    mapRef.current.animateToRegion(
      {
        latitude: store.latitude,
        longitude: store.longitude,
        latitudeDelta: 0.06,
        longitudeDelta: 0.06,
      },
      600
    );
  };

  const decodePolyline = (encoded) => {
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

    const distanceMeters = route?.legs?.[0]?.distance?.value ?? null;
    const durationSeconds = route?.legs?.[0]?.duration?.value ?? null;

    return {
      coordinates: decodePolyline(encoded),
      distanceMeters,
      durationSeconds,
    };
  };

  const handleShowDirection = async () => {
    if (!mapRef.current || !location || !selectedStore) return;

    const origin = { latitude: location.latitude, longitude: location.longitude };
    const destination = { latitude: selectedStore.latitude, longitude: selectedStore.longitude };

    let directions = null;
    try {
      directions = await getGoongRoute(origin, destination);
    } catch (e) {
      console.log("goong directions error", e?.message || e);
    }

    const coordinates =
      directions?.coordinates?.length > 1 ? directions.coordinates : [origin, destination];

    setRouteCoordinates(coordinates);

    if (directions?.distanceMeters != null && directions?.durationSeconds != null) {
      setRouteSummary({
        distanceKm: Math.round((directions.distanceMeters / 1000) * 10) / 10,
        durationMin: Math.max(1, Math.round(directions.durationSeconds / 60)),
      });
    } else {
      setRouteSummary(null);
      if (!GOONG_API_KEY) {
        Alert.alert(
          "Chưa cấu hình Directions API",
          "Đang hiển thị đường thẳng. Thêm GOONG_API_KEY để dùng tuyến đường thực tế."
        );
      }
    }

    mapRef.current.fitToCoordinates(coordinates, {
      edgePadding: { top: 70, right: 50, bottom: 220, left: 50 },
      animated: true,
    });
  };

  const handleChooseStore = () => {
    if (!selectedStore) {
      Alert.alert("Chưa chọn cửa hàng", "Vui lòng chọn một cửa hàng trước khi tiếp tục.");
      return;
    }

    if (!location) {
      Alert.alert("Chưa có vị trí", "Vui lòng bật GPS để tiếp tục giao hàng tận nơi.");
      return;
    }

    const checkoutContext = route?.params?.checkoutContext || {};

    navigation.navigate("Checkout", {
      ...checkoutContext,
      selectedStoreFromMap: selectedStore,
      selectedUserLocationFromMap: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      fromMapPickAt: Date.now(),
    });
  };

  const region = useMemo(() => {
    if (!location) return defaultRegion;
    return {
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    };
  }, [location]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.helperText}>Đang lấy vị trí hiện tại...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Cửa hàng gần bạn</Text>
      </View>

      {MapView && Marker ? (
        <MapView ref={mapRef} style={styles.map} initialRegion={region}>
          {location && (
            <Marker
              coordinate={{ latitude: location.latitude, longitude: location.longitude }}
              title="Vị trí của bạn"
              pinColor={COLORS.primary}
            />
          )}

          {stores.map((store) => (
            <Marker
              key={store.id}
              coordinate={{ latitude: store.latitude, longitude: store.longitude }}
              title={store.name}
              description={store.address}
              onPress={() => handleSelectStore(store)}
            />
          ))}

          {routeCoordinates.length > 1 && Polyline ? (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor={COLORS.primary}
              strokeWidth={3}
              lineDashPattern={routeSummary ? undefined : [6, 4]}
            />
          ) : null}
        </MapView>
      ) : (
        <View style={styles.mapFallback}>
          <Text style={styles.fallbackTitle}>Map chưa sẵn sàng trong Expo Go hiện tại</Text>
          <Text style={styles.fallbackText}>
            Bạn vẫn có thể xem danh sách cửa hàng bên dưới. Khi map hoạt động đầy đủ,
            nút Chỉ đường sẽ hiển thị ngay trên màn hình này.
          </Text>
        </View>
      )}

      {selectedStore && (
        <View style={styles.selectedCard}>
          <View style={styles.selectedRow}>
            <Text style={styles.selectedName}>{selectedStore.name}</Text>
            <Text style={styles.selectedDist}>{selectedStore.distanceKm} km</Text>
          </View>
          <Text style={styles.selectedAddress}>{selectedStore.address}</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => {
                if (selectedStore.phone) {
                  Linking.openURL(`tel:${selectedStore.phone}`);
                }
              }}
            >
              <Text style={styles.primaryBtnText}>Gọi</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={handleShowDirection}
            >
              <Text style={styles.secondaryBtnText}>Chỉ đường</Text>
            </TouchableOpacity>
          </View>
          {selectMode && (
            <TouchableOpacity style={styles.pickStoreBtn} onPress={handleChooseStore}>
              <Text style={styles.pickStoreBtnText}>Chọn cửa hàng này để giao hàng</Text>
            </TouchableOpacity>
          )}
          {routeSummary && (
            <Text style={styles.routeSummary}>
              Tuyến đường thực tế: {routeSummary.distanceKm} km - khoảng {routeSummary.durationMin} phút
            </Text>
          )}
        </View>
      )}

      <FlatList
        style={styles.list}
        data={stores}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.storeItem, selectedStore?.id === item.id && styles.storeItemActive]}
            onPress={() => handleSelectStore(item)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.storeName}>{item.name}</Text>
              <Text style={styles.storeAddress}>{item.address}</Text>
            </View>
            <Text style={styles.storeDist}>{item.distanceKm} km</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

export default StoreMapScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: { fontSize: 18, fontWeight: "800", color: COLORS.textPrimary },
  map: { height: "42%" },
  mapFallback: {
    height: "42%",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 8,
  },
  fallbackText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  helperText: { marginTop: 8, color: COLORS.textSecondary },
  errorText: { color: COLORS.primary, paddingHorizontal: 20, textAlign: "center" },
  selectedCard: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  selectedRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  selectedName: { fontSize: 15, fontWeight: "700", color: COLORS.textPrimary, flex: 1 },
  selectedDist: { fontSize: 13, fontWeight: "700", color: COLORS.primary },
  selectedAddress: { color: COLORS.textSecondary, marginBottom: 10 },
  actionRow: { flexDirection: "row", gap: 10 },
  routeSummary: {
    marginTop: 10,
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  pickStoreBtn: {
    marginTop: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 10,
  },
  pickStoreBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 9,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 9,
  },
  secondaryBtnText: { color: COLORS.primary, fontWeight: "700" },
  list: { flex: 1, marginTop: 8 },
  storeItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  storeItemActive: { backgroundColor: "#FFF5F5" },
  storeName: { fontSize: 14, fontWeight: "700", color: COLORS.textPrimary },
  storeAddress: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  storeDist: { fontSize: 13, color: COLORS.primary, fontWeight: "700" },
});
