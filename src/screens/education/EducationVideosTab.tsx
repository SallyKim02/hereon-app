import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Image,
  Linking,
} from "react-native";

type EducationVideo = {
  id: string;
  category: string;
  title: string; // 유튜브 제목 그대로 넣기
  url: string;
  keywords: string[]; // 검색용으로만 유지(화면에 표시 X)
};

function getYoutubeId(url: string) {
  try {
    if (url.includes("youtu.be/")) {
      const part = url.split("youtu.be/")[1] ?? "";
      return part.split("?")[0].split("&")[0];
    }
    const u = new URL(url);
    const v = u.searchParams.get("v");
    if (v) return v;
    if (u.pathname.startsWith("/shorts/")) {
      return u.pathname.replace("/shorts/", "").split("/")[0];
    }
  } catch {}
  return null;
}

function getThumbUrl(videoUrl: string) {
  const id = getYoutubeId(videoUrl);
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export default function EducationVideosTab() {
  const SEED: EducationVideo[] = useMemo(
    () => [
      // 호흡/명상/바디스캔 (여기 title을 “유튜브 제목 그대로”로 넣어줘)
      {
        id: "b1",
        category: "호흡/명상/바디스캔",
        title: "마음 안정화를 위한 복식훈련 기법", // 예시: 유튜브 제목 그대로
        url: "https://youtu.be/qkDjMJkLxIo?si=GlRprD2IaP1hG2_6",
        keywords: ["호흡", "복식호흡", "마음안정"],
      },
      {
        id: "b2",
        category: "호흡/명상/바디스캔",
        title: "짧은 호흡 명상",
        url: "https://youtu.be/j6ICKnpn054?si=LGdccO3ZUK9bQvtM",
        keywords: ["명상", "호흡"],
      },
      {
        id: "b3",
        category: "호흡/명상/바디스캔",
        title: "바디스캔 안내",
        url: "https://youtu.be/inxAScz0PTM?si=dLlyHxqRemzADNHU",
        keywords: ["바디스캔", "긴장완화"],
      },
      {
        id: "b4",
        category: "호흡/명상/바디스캔",
        title: "마음챙김 가이드",
        url: "https://youtu.be/bsK04WFrvNU?si=gGaFA-SVGE36uW_R",
        keywords: ["마음챙김"],
      },

      // 인지행동치료
      {
        id: "c1",
        category: "인지행동치료",
        title: "인지행동치료 CBT 강의",
        url: "https://youtu.be/NUKKHsgD3rc?si=vjyfI-tkfRsyQw1-",
        keywords: ["CBT", "강의"],
      },
      {
        id: "c2",
        category: "인지행동치료",
        title: "생각 재구성 연습",
        url: "https://youtu.be/v1IizJ0SLdM?si=AEnSgB5FUXfsTAlF",
        keywords: ["재구성", "생각"],
      },
      {
        id: "c3",
        category: "인지행동치료",
        title: "대안적 사고 만들기",
        url: "https://youtu.be/JxKpUBo5_9E?si=AQHz4AGq3Wn9ulfh",
        keywords: ["대안적사고"],
      },

      // 불안 교육
      {
        id: "a1",
        category: "불안 교육",
        title: "불안을 이해하는 방법",
        url: "https://youtu.be/8bnXglOQp60?si=x4cArEfntQM0areT",
        keywords: ["불안", "교육"],
      },
      {
        id: "a2",
        category: "불안 교육",
        title: "불안 대처 팁",
        url: "https://youtu.be/BNEOKti4BkE?si=4kYK2mWN7i-xiicX",
        keywords: ["불안", "대처"],
      },
      {
        id: "a3",
        category: "불안 교육",
        title: "불안 완화 연습",
        url: "https://youtu.be/J2V1AHu5wfU?si=8uqj_oCGHctbb1MG",
        keywords: ["불안", "완화"],
      },

      // 심리장애 설명
      {
        id: "d1",
        category: "심리장애 설명",
        title: "심리장애 설명",
        url: "https://youtu.be/b6DAguJDI-8?si=28Z1JM0IWT5vv8oh",
        keywords: ["설명"],
      },
      {
        id: "d2",
        category: "심리장애 설명",
        title: "심리장애 이해",
        url: "https://youtu.be/H2XvNgt8rBQ?si=BpyO1BNKBVJcolc-",
        keywords: ["이해"],
      },
      {
        id: "d3",
        category: "심리장애 설명",
        title: "심리장애 이야기",
        url: "https://youtu.be/bpjtsREKQ1A?si=QRjgNOg1R0v8zQTs",
        keywords: ["이야기"],
      },
      {
        id: "d4",
        category: "심리장애 설명",
        title: "심리장애 개요",
        url: "https://youtu.be/WSDBEXllDto?si=yz7wxUxLpAN5v7Up",
        keywords: ["개요"],
      },

      // 자동적 사고
      {
        id: "t1",
        category: "자동적 사고",
        title: "자동적 사고란",
        url: "https://youtu.be/9MtO0M26KJA?si=_7XuqYhx-Uv66_JR",
        keywords: ["자동적사고"],
      },
      {
        id: "t2",
        category: "자동적 사고",
        title: "생각 기록하기",
        url: "https://youtu.be/6_IPDTSRIBU?si=-pvoO4t1DQL969ZR",
        keywords: ["기록", "생각"],
      },
      {
        id: "t3",
        category: "자동적 사고",
        title: "생각 바꾸기 연습",
        url: "https://youtu.be/MJIP6CS5n4c?si=VQ2EP4BfPxWL4ERZ",
        keywords: ["재구성", "대안"],
      },
    ],
    []
  );

  const categories = useMemo(() => Array.from(new Set(SEED.map((v) => v.category))), [SEED]);

  const [q, setQ] = useState("");
  const [favIds, setFavIds] = useState<string[]>([]);
  const [favMode, setFavMode] = useState(false);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return SEED.filter((v) => {
      if (favMode && !favIds.includes(v.id)) return false;
      if (!query) return true;
      const hay = `${v.title} ${v.category} ${v.keywords.join(" ")}`.toLowerCase();
      return hay.includes(query);
    });
  }, [SEED, q, favIds, favMode]);

  const byCategory = useMemo(() => {
    const map = new Map<string, EducationVideo[]>();
    for (const c of categories) map.set(c, []);
    for (const v of filtered) {
      if (!map.has(v.category)) map.set(v.category, []);
      map.get(v.category)!.push(v);
    }
    return map;
  }, [filtered, categories]);

  function toggleFav(id: string) {
    setFavIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function openVideo(url: string) {
    try {
      await Linking.openURL(url);
    } catch {}
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="키워드로 검색"
          placeholderTextColor="#9CA3AF"
          style={styles.search}
        />

        <Pressable
          style={[styles.fab, favMode && styles.fabActive]}
          onPress={() => setFavMode((v) => !v)}
          hitSlop={12}
        >
          <Text style={styles.fabText}>★</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
        {Array.from(byCategory.entries()).map(([category, items]) => {
          if (!items.length) return null;

          return (
            <View key={category} style={styles.section}>
              <Text style={styles.sectionTitle}>{category}</Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
                {items.map((v) => {
                  const thumb = getThumbUrl(v.url);
                  const isFav = favIds.includes(v.id);

                  return (
                    <Pressable key={v.id} onPress={() => openVideo(v.url)} style={styles.card}>
                      <View style={styles.thumbWrap}>
                        {thumb ? (
                          <Image source={{ uri: thumb }} style={styles.thumb} />
                        ) : (
                          <View style={[styles.thumb, styles.thumbFallback]}>
                            <Text style={{ color: "#6B7280" }}>thumbnail</Text>
                          </View>
                        )}

                        <View style={styles.playBadge}>
                          <Text style={styles.playText}>▶</Text>
                        </View>

                        <Pressable
                          onPress={() => toggleFav(v.id)}
                          style={styles.favBadge}
                          hitSlop={10}
                        >
                          <Text style={[styles.favText, isFav ? styles.favOn : styles.favOff]}>★</Text>
                        </Pressable>
                      </View>

                      <Text style={styles.videoTitle} numberOfLines={2}>
                        {v.title}
                      </Text>

                      {/* 태그/키워드 칩(타일) 화면 표시 제거 요청 반영: 아무것도 렌더링 안 함 */}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          );
        })}

        {!filtered.length && (
          <View style={{ padding: 16 }}>
            <Text style={{ color: "#6B7280" }}>검색 결과가 없어</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const CARD_W = 260;

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 8 },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  search: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: "#F7F8FA",
    borderWidth: 1,
    borderColor: "#E6E8EE",
    color: "#111827",
    fontWeight: "600",
  },

  fab: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  fabActive: { backgroundColor: "#4C7DFF" },
  fabText: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },

  section: { marginTop: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "800", marginBottom: 10 },

  hRow: { paddingRight: 16, gap: 12 },

  card: { width: CARD_W },

  thumbWrap: {
    position: "relative",
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },
  thumb: { width: "100%", aspectRatio: 16 / 9 },
  thumbFallback: { alignItems: "center", justifyContent: "center" },

  playBadge: {
    position: "absolute",
    left: 12,
    bottom: 10,
    width: 36,
    height: 28,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  playText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },

  // 즐겨찾기 버튼: "채워진 별"만 쓰고 색으로 상태 표현
  favBadge: {
    position: "absolute",
    right: 10,
    top: 10,
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  favText: { fontSize: 18, fontWeight: "900" },
  favOff: { color: "#FFFFFF" },     // 즐겨찾기 전: 흰색 채워진 별
  favOn: { color: "#FACC15" },      // 즐겨찾기 후: 노란색 채워진 별

  videoTitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
    lineHeight: 18,
  },
});
