import { useMemo, useState } from "react";
import { StyleSheet, Text, View, Pressable, ScrollView } from "react-native";
import type { CbtRecord } from "./cbtTypes";

type Props = {
  loading: boolean;
  records: CbtRecord[];
};

function ymdKey(ms: number) {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function fmtKoreanMonth(year: number, monthIndex0: number) {
  return `${year}년 ${monthIndex0 + 1}월`;
}

function fmtDateTime(ms: number) {
  const d = new Date(ms);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yy}.${mm}.${dd} ${hh}:${mi}`;
}

export default function CbtCalendarView({ loading, records }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month0, setMonth0] = useState(now.getMonth());
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const monthRecordsByDay = useMemo(() => {
    const map = new Map<string, CbtRecord[]>();
    records.forEach((r) => {
      const d = new Date(r.happenedAt);
      if (d.getFullYear() !== year) return;
      if (d.getMonth() !== month0) return;
      const key = ymdKey(r.happenedAt);
      const arr = map.get(key) ?? [];
      arr.push(r);
      map.set(key, arr);
    });

    // 최신순 정렬(상세 영역)
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => b.happenedAt - a.happenedAt);
      map.set(k, arr);
    }
    return map;
  }, [records, year, month0]);

  const { cells, monthTitle } = useMemo(() => {
    const first = new Date(year, month0, 1);
    const last = new Date(year, month0 + 1, 0);
    const firstDow = first.getDay(); // 0(Sun)~6
    const days = last.getDate();

    const tmp: Array<{ label: string; key: string | null; hasRecord: boolean }> = [];

    // 앞 공백
    for (let i = 0; i < firstDow; i++) tmp.push({ label: "", key: null, hasRecord: false });

    for (let day = 1; day <= days; day++) {
      const d = new Date(year, month0, day);
      const key = ymdKey(d.getTime());
      tmp.push({ label: String(day), key, hasRecord: monthRecordsByDay.has(key) });
    }

    return { cells: tmp, monthTitle: fmtKoreanMonth(year, month0) };
  }, [year, month0, monthRecordsByDay]);

  const selectedRecords = useMemo(() => {
    if (!selectedKey) return [];
    return monthRecordsByDay.get(selectedKey) ?? [];
  }, [monthRecordsByDay, selectedKey]);

  const prevMonth = () => {
    const d = new Date(year, month0 - 1, 1);
    setYear(d.getFullYear());
    setMonth0(d.getMonth());
    setSelectedKey(null);
  };

  const nextMonth = () => {
    const d = new Date(year, month0 + 1, 1);
    setYear(d.getFullYear());
    setMonth0(d.getMonth());
    setSelectedKey(null);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.monthRow}>
        <Pressable onPress={prevMonth} style={styles.navBtn}>
          <Text style={styles.navText}>‹</Text>
        </Pressable>
        <Text style={styles.monthTitle}>{monthTitle}</Text>
        <Pressable onPress={nextMonth} style={styles.navBtn}>
          <Text style={styles.navText}>›</Text>
        </Pressable>
      </View>

      <View style={styles.dowRow}>
        {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
          <Text key={d} style={styles.dow}>{d}</Text>
        ))}
      </View>

      {loading ? (
        <Text style={styles.dim}>불러오는 중…</Text>
      ) : (
        <View style={styles.grid}>
          {cells.map((c, idx) => {
            if (!c.key) return <View key={`empty-${idx}`} style={styles.cell} />;

            const on = selectedKey === c.key;
            return (
              <Pressable
                key={c.key}
                onPress={() => setSelectedKey(c.key)}
                style={[styles.cell, styles.cellBtn, on && styles.cellOn]}
              >
                <Text style={[styles.cellText, on && styles.cellTextOn]}>{c.label}</Text>
                {c.hasRecord ? <View style={[styles.dot, on && styles.dotOn]} /> : <View style={styles.dotGhost} />}
              </Pressable>
            );
          })}
        </View>
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 12 }}>
        {!selectedKey ? (
          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>날짜를 선택하세요</Text>
            <Text style={styles.detailDesc}>선택한 날짜의 기록이 아래에 표시돼요.</Text>
          </View>
        ) : selectedRecords.length === 0 ? (
          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>기록이 없어요</Text>
            <Text style={styles.detailDesc}>다른 날짜를 선택해보세요.</Text>
          </View>
        ) : (
          selectedRecords.map((r) => (
            <View key={r.id} style={styles.detailCard}>
              <Text style={styles.detailMeta}>{fmtDateTime(r.happenedAt)} · #{r.category}</Text>

              <Text style={styles.fieldLabel}>상황</Text>
              <Text style={styles.fieldText}>{r.situation || "—"}</Text>

              <Text style={styles.fieldLabel}>자동적 사고</Text>
              <Text style={styles.fieldText}>{r.automaticThought || "—"}</Text>

              <Text style={styles.fieldLabel}>대안적 사고</Text>
              <Text style={styles.fieldText}>{r.alternativeThought || "—"}</Text>

              <Text style={styles.fieldLabel}>감정 · 신체반응</Text>
              <Text style={styles.fieldText}>
                {(r.emotion || "—") + (r.physicalReactions?.length ? ` · ${r.physicalReactions.join(", ")}` : "")}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const BG = "#F2F0EE";
const DARK = "#3B3B3B";
const CARD = "#FFFFFF";

const styles = StyleSheet.create({
  wrap: { flex: 1 },

  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  navBtn: {
    width: 42,
    height: 38,
    borderRadius: 12,
    backgroundColor: CARD,
    alignItems: "center",
    justifyContent: "center",
  },
  navText: { fontSize: 22, fontWeight: "900", color: DARK },
  monthTitle: { fontSize: 16, fontWeight: "900", color: DARK },

  dowRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  dow: { width: "14.285%", textAlign: "center", color: "rgba(0,0,0,0.45)", fontWeight: "800" },

  dim: { color: "rgba(0,0,0,0.45)", fontWeight: "700" },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 10,
    marginBottom: 12,
  },
  cell: {
    width: "14.285%",
    aspectRatio: 1,
    padding: 6,
  },
  cellBtn: {
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cellOn: { backgroundColor: DARK },
  cellText: { fontWeight: "900", color: DARK },
  cellTextOn: { color: "#fff" },
  dot: { width: 6, height: 6, borderRadius: 999, backgroundColor: DARK, marginTop: 6 },
  dotOn: { backgroundColor: "#fff" },
  dotGhost: { width: 6, height: 6, borderRadius: 999, backgroundColor: "transparent", marginTop: 6 },

  detailCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },
  detailTitle: { fontSize: 15, fontWeight: "900", color: DARK },
  detailDesc: { marginTop: 6, color: "rgba(0,0,0,0.55)", fontWeight: "700" },

  detailMeta: { color: "rgba(0,0,0,0.55)", fontWeight: "900", marginBottom: 10 },

  fieldLabel: { marginTop: 10, color: DARK, fontWeight: "900" },
  fieldText: { marginTop: 6, color: "rgba(0,0,0,0.70)", fontWeight: "700", lineHeight: 18 },
});
