import { useEffect, useState } from "react";
import * as Location from "expo-location";

export const useUserLocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          if (mounted) {
            setError("Vui long cap quyen vi tri de su dung tinh nang nay");
            setLoading(false);
          }
          return;
        }

        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (mounted) {
          setLocation(current.coords);
          setLoading(false);
        }
      } catch (e) {
        if (mounted) {
          setError("Khong the lay vi tri hien tai");
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return { location, error, loading };
};
