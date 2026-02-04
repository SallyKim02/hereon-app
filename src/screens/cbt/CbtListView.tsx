import { useMemo, useState } from "react";
import { StyleSheet, Text, View, Pressable, FlatList } from "react-native";
import type { CbtCategory, CbtRecord } from "./cbtTypes";
import { CBT_CATEGORIES } from "./cbtTypes";

type Props = {
  loading: boolean;
  records: CbtRecord[];
  onPressAdd: () => void;
};

type FilterKey = "전체" | CbtCategory;

function fmtDate(ms: number) {
  const d = new Date(ms);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}.${mm}.${dd}`;
}

export default function CbtListView({ loading, records, onPressAdd }: Props) {
  const [filter, setFilter] = useState<FilterKey>("전체");

  const filtered = useMemo(() => {
    const sorted = [...records].sort((a, b) => b.happenedAt - a.happenedAt);
    if (filter === "전체") return sorted;
    return sorted.filter((r) => r.category === filter);
  }, [records, filter]);

  return (
    <View style={styles.wrap}>
      <View style={styles.filters}>
        <FilterChip label="전체" on={filter === "전체"} onPress={() => setFilter("전체")} />
        {CBT_CATEGORIES.map((c) => (
          <FilterChip key={c} label={c} on={filter === c} onPress={() => setFilter(c)} />
        ))}
      </View>

      {loading ? (
        <Text style={styles.dim}>불러오는 중…</Text>
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>아직 기록이 없어요</Text>
          <Text style={styles.emptyDesc}>첫 CBT 카드를 작성해볼까요?</Text>
          <Pressable onPress={onPressAdd} style={styles.cta}>
            <Text style={styles.ctaText}>기록 추가</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 12 }}
          renderItem={({ item }) => {
            const phys = item.physicalReactions?.length ? ` · ${item.physicalReactions.join(", ")}` : "";
            return (
              <View style={styles.card}>
                <Text style={styles.date}>{fmtDate(item.happenedAt)}</Text>
                <Text style={styles.cat}>#{item.category}</Text>
                <Text style={styles.sum} numberOfLines={2}>
                  {item.emotion || "감정(미입력)"}{phys}
                </Text>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

function FilterChip({
  label,
  on,
  onPress,
}: {
  label: string;
  on: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, on && styles.chipOn]}>
      <Text style={[styles.chipText, on && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

const BG = "#F2F0EE";
const DARK = "#3B3B3B";
const CARD = "#FFFFFF";

const styles = StyleSheet.create({
  wrap: { flex: 1 },

  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    backgroundColor: CARD,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
  },
  chipOn: {
    backgroundColor: DARK,
  },
  chipText: { color: DARK, fontWeight: "700", fontSize: 13 },
  chipTextOn: { color: "#fff" },

  dim: { color: "rgba(0,0,0,0.45)", fontWeight: "700" },

  empty: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: DARK },
  emptyDesc: { marginTop: 6, color: "rgba(0,0,0,0.55)", fontWeight: "700" },
  cta: {
    marginTop: 14,
    backgroundColor: DARK,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 999,
  },
  ctaText: { color: "#fff", fontWeight: "800" },

  card: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },
  date: { color: "rgba(0,0,0,0.55)", fontWeight: "800", marginBottom: 6 },
  cat: { color: DARK, fontWeight: "900", marginBottom: 6 },
  sum: { color: "rgba(0,0,0,0.70)", fontWeight: "700", lineHeight: 18 },
});
