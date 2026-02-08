import React from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BG = "#F2F0EE";

export function GroundingShell({
  children,
  onPrev,
  onNext,
  disableNext,
}: {
  children: React.ReactNode;
  onPrev?: () => void;
  onNext?: () => void;
  disableNext?: boolean;
}) {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>그라운딩</Text>
        </View>

        <View style={styles.body}>{children}</View>
      </View>

      <View style={styles.bottomNav}>
        <Pressable
          onPress={onPrev}
          disabled={!onPrev}
          style={[styles.navBtn, !onPrev && styles.navBtnOff]}
          hitSlop={12}
        >
          <Text style={styles.navText}>← 이전</Text>
        </Pressable>

        <Pressable
          onPress={onNext}
          disabled={!onNext || !!disableNext}
          style={[styles.navBtn, (!onNext || !!disableNext) && styles.navBtnOff]}
          hitSlop={12}
        >
          <Text style={styles.navText}>다음 →</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  screen: { flex: 1, backgroundColor: BG },
  header: {
    paddingTop: 6,
    paddingBottom: 8,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  headerTitle: { fontSize: 16, fontWeight: "900", color: "#111" },

  // ✅ 하단 네비에 안 가리게 공간 확보
  body: { flex: 1, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 120 },

  // ✅ 여기 paddingBottom을 올리면 "조금 위로"
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 22, // 👈 18 → 22 추천(조금 위로)
    backgroundColor: BG,
    flexDirection: "row",
    gap: 12,
  },

  navBtn: {
    flex: 1,
    height: 54,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 1 },
    }),
  },
  navBtnOff: { opacity: 0.45 },
  navText: { fontSize: 14, fontWeight: "900", color: "#111" },
});
