import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useComparison } from "../../context/ComparisonContext";

const ComparisonDock = ({ navigation }) => {
  const {
    comparisonItems,
    removeFromComparison,
    count,
    dockCollapsed,
    expandDock,
    collapseDock,
  } = useComparison();

  if (count === 0) return null;

  if (dockCollapsed) {
    return (
      <View style={styles.collapsedWrap}>
        <TouchableOpacity
          style={styles.collapsedButton}
          onPress={expandDock}
          activeOpacity={0.9}
        >
          <View style={styles.collapsedIconWrap}>
            <Text style={styles.collapsedIcon}>⇄</Text>
          </View>
          <Text style={styles.collapsedText}>So sánh ({count})</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.panelWrap}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>So sánh ({count})</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={collapseDock}>
            <Text style={styles.collapseText}>Thu gọn</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.compareNowBtn}
            onPress={() => navigation.navigate("Comparison")}
          >
            <Text style={styles.compareNowText}>So sánh ngay</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.itemsRow}
      >
        {comparisonItems.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            {item.image || item.imageUrl ? (
              <Image source={{ uri: item.image || item.imageUrl }} style={styles.itemImage} resizeMode="cover" />
            ) : (
              <View style={[styles.itemImage, styles.imagePlaceholder]}>
                <Text style={styles.placeholderText}>+</Text>
              </View>
            )}

            <Text style={styles.itemName} numberOfLines={1} ellipsizeMode="tail">
              {item.name}
            </Text>

            <TouchableOpacity
              onPress={() => removeFromComparison(item.id)}
              style={styles.removeBtn}
            >
              <Text style={styles.removeText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default ComparisonDock;

const styles = StyleSheet.create({
  panelWrap: {
    backgroundColor: "#f3f4f6",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
    paddingBottom: 10,
    paddingHorizontal: 12,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  panelTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#1f2937",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  collapseText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
  },
  compareNowBtn: {
    backgroundColor: "#1f80e0",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  compareNowText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  itemsRow: {
    gap: 10,
    paddingRight: 10,
  },
  itemCard: {
    width: 180,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    position: "relative",
  },
  itemImage: {
    width: 34,
    height: 34,
    borderRadius: 4,
    marginRight: 8,
    backgroundColor: "#f3f4f6",
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#9ca3af",
    fontWeight: "700",
  },
  itemName: {
    flex: 1,
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
    paddingRight: 16,
  },
  removeBtn: {
    position: "absolute",
    right: 8,
    top: 6,
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: {
    color: "#9ca3af",
    fontSize: 13,
    fontWeight: "700",
  },
  collapsedWrap: {
    position: "absolute",
    left: 12,
    bottom: 90,
    zIndex: 50,
  },
  collapsedButton: {
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  collapsedIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#2f855a",
    alignItems: "center",
    justifyContent: "center",
  },
  collapsedIcon: {
    fontSize: 14,
    color: "#2f855a",
    fontWeight: "800",
    lineHeight: 16,
  },
  collapsedText: {
    fontSize: 18,
    color: "#2f855a",
    fontWeight: "700",
  },
});
