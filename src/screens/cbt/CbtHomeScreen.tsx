import { useCallback, useEffect, useMemo, useState } from "react";
import { SafeAreaView, StyleSheet, Text, View, Pressable, Platform } from "react-native";
import { router } from "expo-router";
import type { CbtRecord } from "./cbtTypes";
import { loadCbtRecords, saveCbtRecords } from "./cbtStorage";
import CbtListView from "./CbtListView";
import CbtCalendarView from "./CbtCalendarView";

type TabKey = "list" | "calendar";

export default function CbtHomeScreen() {
  const [tab, setTab] = useState<TabKey>("list");
  const [records, setRecords] = useState<CbtRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await loadCbtRecords();
    setRecords(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onPressAdd = useCallback(() => {
    router.push("/cbt/edit");
  }, []);

  const onDeleteAll = useCallback(async () => {
    // 개발 중 테스트용: 전체 삭제
    await saveCbtRecords([]);
    await refresh();
  }, [refresh]);

  const headerRightHint = useMemo(() => {
    // 디버그 용. 필요 없으면 UI에서 지워도 됨.
    return Platform.OS === "ios" ? "iOS" : "Android";
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>CBT 카드</Text>
          <Pressable onPress={onPressAdd} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ 추가</Text>
          </Pressable>
        </View>

        <View style={styles.toggleRow}>
          <Pressable
            onPress={() => setTab("list")}
            style={[styles.toggleBtn, tab === "list" && styles.toggleBtnOn]}
          >
            <Text style={[styles.toggleText, tab === "list" && styles.toggleTextOn]}>기록</Text>
          </Pressable>
          <Pressable
            onPress={() => setTab("calendar")}
            style={[styles.toggleBtn, tab === "calendar" && styles.toggleBtnOn]}
          >
            <Text style={[styles.toggleText, tab === "calendar" && styles.toggleTextOn]}>캘린더</Text>
          </Pressable>

          <View style={{ flex: 1 }} />
          <Text style={styles.miniHint}>{headerRightHint}</Text>
        </View>

        {tab === "list" ? (
          <CbtListView loading={loading} records={records} onPressAdd={onPressAdd} />
        ) : (
          <CbtCalendarView loading={loading} records={records} />
        )}

        {/* 개발 중에만 쓰고 나중에 삭제해도 됨 */}
        <Pressable onPress={onDeleteAll} style={styles.devDanger}>
          <Text style={styles.devDangerText}>DEV: 전체 삭제</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const BG = "#F2F0EE";
const DARK = "#3B3B3B";
const CARD = "#FFFFFF";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 8 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: "800", color: DARK },
  addBtn: {
    backgroundColor: DARK,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
  },
  addBtnText: { color: "#fff", fontWeight: "700" },

  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.04)",
    borderRadius: 999,
    padding: 6,
    marginBottom: 12,
  },
  toggleBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "transparent",
  },
  toggleBtnOn: { backgroundColor: CARD },
  toggleText: { color: DARK, fontWeight: "700" },
  toggleTextOn: { color: DARK },

  miniHint: { color: "rgba(0,0,0,0.35)", fontSize: 12, fontWeight: "700", paddingRight: 8 },

  devDanger: {
    marginTop: 10,
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,0,0,0.08)",
  },
  devDangerText: { color: "rgba(150,0,0,0.85)", fontWeight: "700" },
});
