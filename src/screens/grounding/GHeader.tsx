import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

const BG = "#F2F0EE";
const DARK = "#111";

export default function GHeader({
  title = "그라운딩",
  onPrev,
  onNext,
  showNav = true,
  disablePrev,
  disableNext,
}: {
  title?: string;
  onPrev?: () => void;
  onNext?: () => void;
  showNav?: boolean;          // GPage1에서는 false
  disablePrev?: boolean;
  disableNext?: boolean;
}) {
  return (
    <View style={styles.wrap}>
      {showNav ? (
        <Pressable
          onPress={onPrev}
          disabled={!onPrev || disablePrev}
          style={[styles.circleBtn, (!onPrev || disablePrev) && styles.off]}
          hitSlop={12}
        >
          <Text style={styles.arrow}>←</Text>
        </Pressable>
      ) : (
        <View style={{ width: 40 }} />
      )}

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {showNav ? (
        <Pressable
          onPress={onNext}
          disabled={!onNext || disableNext}
          style={[styles.circleBtn, (!onNext || disableNext) && styles.off]}
          hitSlop={12}
        >
          <Text style={styles.arrow}>→</Text>
        </Pressable>
      ) : (
        <View style={{ width: 40 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: BG,
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 20,          // ✅ “그라운딩” 더 크게
    fontWeight: "900",
    color: DARK,
    textAlign: "center",
    flex: 1,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  arrow: { fontSize: 18, fontWeight: "900", color: DARK },
  off: { opacity: 0.35 },
});
