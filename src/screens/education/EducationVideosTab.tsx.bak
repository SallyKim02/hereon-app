import { useEffect, useMemo, useState } from "react";
import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { loadFavoriteIds, saveFavoriteIds } from "./educationStorage";

type VideoItem = {
  id: string;
  title: string;
  url: string;
  tags: string[];
};

export default function EducationVideosTab() {
  const ITEMS: VideoItem[] = useMemo(
    () => [
      {
        id: "v1",
        title: "스트레스 이해하기 (예시)",
        url: "https://www.youtube.com/",
        tags: ["TED", "스트레스"],
      },
      {
        id: "v2",
        title: "불안 완화를 위한 가이드 (예시)",
        url: "https://www.youtube.com/",
        tags: ["CBT", "불안"],
      },
      {
        id: "v3",
        title: "마음챙김 명상 (예시)",
        url: "https://www.youtube.com/",
        tags: ["명상", "호흡"],
      },
    ],
    []
  );

  const [fav, setFav] = useState<string[]>([]);

  useEffect(() => {
    (async () => setFav(await loadFavoriteIds()))();
  }, []);

  const toggleFav = async (id: string) => {
    const next = fav.includes(id) ? fav.filter((x) => x !== id) : [...fav, id];
    setFav(next);
    await saveFavoriteIds(next);
  };

  const open = async (url: string) => {
    const ok = await Linking.canOpenURL(url);
    if (!ok) {
      Alert.alert("열 수 없음", "링크를 열 수 없어요.");
      return;
    }
    Linking.openURL(url);
  };

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.hint}>
        추천 콘텐츠를 골라 시청해보세요. (1차: 외부 링크로 열림)
      </Text>

      <View style={styles.list}>
        {ITEMS.map((it) => {
          const isFav = fav.includes(it.id);
          return (
            <View key={it.id} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title} numberOfLines={2}>
                  {it.title}
                </Text>
                <Text style={styles.tags} numberOfLines={1}>
                  {it.tags.map((t) => `#${t}`).join("  ")}
                </Text>
              </View>

              <View style={styles.actions}>
                <Pressable onPress={() => toggleFav(it.id)} style={[styles.iconBtn, isFav && styles.iconBtnOn]}>
                  <Text style={[styles.iconText, isFav && styles.iconTextOn]}>{isFav ? "★" : "☆"}</Text>
                </Pressable>
                <Pressable onPress={() => open(it.url)} style={styles.watchBtn}>
                  <Text style={styles.watchText}>시청</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const DARK = "#3B3B3B";
const CARD = "#FFFFFF";

const styles = StyleSheet.create({
  hint: { color: "rgba(0,0,0,0.55)", fontWeight: "700", marginBottom: 10 },

  list: { gap: 10 },
  card: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  title: { color: DARK, fontWeight: "900", fontSize: 15, marginBottom: 8 },
  tags: { color: "rgba(0,0,0,0.45)", fontWeight: "800" },

  actions: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnOn: { backgroundColor: DARK },
  iconText: { fontSize: 18, fontWeight: "900", color: DARK },
  iconTextOn: { color: "#fff" },

  watchBtn: { backgroundColor: DARK, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 999 },
  watchText: { color: "#fff", fontWeight: "900" },
});
