import { useMemo, useState } from "react";
import { SafeAreaView, StyleSheet, Text, View, Pressable } from "react-native";
import EducationVideosTab from "./EducationVideosTab";
import CbtMatchingGameTab from "./CbtMatchingGameTab";

type TabKey = "videos" | "game";

export default function EducationScreen() {
  const [tab, setTab] = useState<TabKey>("videos");

  const title = useMemo(() => "교육", []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.tabsRow}>
          <Pressable
            onPress={() => setTab("videos")}
            style={[styles.tabBtn, tab === "videos" && styles.tabBtnOn]}
          >
            <Text style={[styles.tabText, tab === "videos" && styles.tabTextOn]}>영상</Text>
          </Pressable>

          <Pressable
            onPress={() => setTab("game")}
            style={[styles.tabBtn, tab === "game" && styles.tabBtnOn]}
          >
            <Text style={[styles.tabText, tab === "game" && styles.tabTextOn]}>매칭게임</Text>
          </Pressable>
        </View>

        {tab === "videos" ? <EducationVideosTab /> : <CbtMatchingGameTab />}
      </View>
    </SafeAreaView>
  );
}

const BG = "#F2F0EE";
const DARK = "#3B3B3B";
const CARD = "#FFFFFF";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 10 },
  title: { fontSize: 22, fontWeight: "900", color: DARK, marginBottom: 12 },

  tabsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.04)",
    borderRadius: 999,
    padding: 6,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  tabBtnOn: { backgroundColor: CARD },
  tabText: { color: DARK, fontWeight: "800" },
  tabTextOn: { color: DARK, fontWeight: "900" },
});
