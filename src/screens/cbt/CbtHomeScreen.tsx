import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

type TabKey = "record" | "calendar";
type CategoryKey =
  | "전체"
  | "대인관계"
  | "학업/일"
  | "건강"
  | "불안"
  | "자존감"
  | "기타";

type CbtEntry = {
  id: string;
  createdAt: string; // ISO
  category: Exclude<CategoryKey, "전체">;
  situation: string;
  automaticThought: string;
  alternativeThought: string;
  emotion?: string;
  body?: string;
};

const BG = "#F2F0EE";
const CARD = "#FFFFFF";
const LINE = "rgba(17,17,17,0.10)";
const SUB = "rgba(17,17,17,0.65)";
const FAB = "#2F2F2F";

function shadow(elevation = 0) {
  return Platform.select({
    ios: {
      shadowColor: "#000000ff",
      shadowOpacity: 0.0,
      shadowRadius: 0,
      shadowOffset: { width: 0, height: 0 },
    },
    android: { elevation },
    default: {},
  });
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatKoreanDateTime(iso: string) {
  const d = new Date(iso);
  const yy = d.getFullYear() % 100;
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const hr = d.getHours();
  const min = d.getMinutes();
  const isPM = hr >= 12;
  const hr12 = hr % 12 === 0 ? 12 : hr % 12;
  return `${yy}. ${m}. ${day} ${isPM ? "오후" : "오전"} ${hr12}:${pad2(min)}`;
}

/**
 * ✅ 캘린더: "필요한 주만" 렌더 (6주 강제 X)
 * - 이전달은 공백(0)
 * - 다음달은 마지막 주를 채우는 만큼만 1,2,3... 표시(inMonth=false)
 */
function monthMatrix(year: number, month1to12: number) {
  const first = new Date(year, month1to12 - 1, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month1to12, 0).getDate();

  const cells: Array<{ day: number; inMonth: boolean }> = [];

  // 이전달 공백 (숫자 안 보이게 0)
  for (let i = 0; i < startDay; i++) cells.push({ day: 0, inMonth: false });

  // 이번달
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, inMonth: true });

  // 다음달 숫자 채우기(마지막 주만)
  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ day: nextDay++, inMonth: false });
  }

  const weeks: typeof cells[] = [];
  const weekCount = Math.ceil(cells.length / 7);
  for (let i = 0; i < weekCount; i++) weeks.push(cells.slice(i * 7, i * 7 + 7));
  return weeks;
}

function SegmentedTabs({
  value,
  onChange,
}: {
  value: TabKey;
  onChange: (v: TabKey) => void;
}) {
  return (
    <View style={[styles.segmentWrap, shadow(2)]}>
      <Pressable
        onPress={() => onChange("record")}
        style={[styles.segmentItem, value === "record" && styles.segmentOn]}
      >
        <Text
          style={[styles.segmentText, value === "record" && styles.segmentTextOn]}
        >
          기록
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onChange("calendar")}
        style={[styles.segmentItem, value === "calendar" && styles.segmentOn]}
      >
        <Text
          style={[
            styles.segmentText,
            value === "calendar" && styles.segmentTextOn,
          ]}
        >
          캘린더
        </Text>
      </Pressable>
    </View>
  );
}

/**
 * ✅ 공통 AccordionCard는 "기록 탭"에서 기존 그대로(그림자 O)
 * ✅ 캘린더 탭에서는 flat=true로 그림자 제거
 */
function AccordionCard({
  headerLeft,
  expanded,
  onToggle,
  children,
  flat = false,
}: {
  headerLeft: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  flat?: boolean;
}) {
  return (
    <View style={[styles.accordion, !flat && shadow(2), flat && styles.accordionFlat]}>
      <Pressable onPress={onToggle} style={styles.accordionHead} hitSlop={8}>
        <View style={{ flex: 1 }}>
          <Text style={styles.accordionTitle}>{headerLeft}</Text>
        </View>
        <Text style={styles.chev}>{expanded ? "˄" : "˅"}</Text>
      </Pressable>
      {expanded && <View style={styles.accordionBody}>{children}</View>}
    </View>
  );
}

function CategoryTabs({
  value,
  onChange,
}: {
  value: CategoryKey;
  onChange: (v: CategoryKey) => void;
}) {
  const tabs: CategoryKey[] = [
    "전체",
    "대인관계",
    "학업/일",
    "건강",
    "불안",
    "자존감",
    "기타",
  ];

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catTabsRow}
      >
        {tabs.map((t) => {
          const on = t === value;
          return (
            <Pressable
              key={t}
              onPress={() => onChange(t)}
              style={styles.catTabBtn}
              hitSlop={8}
            >
              <Text style={[styles.catTabText, on && styles.catTabTextOn]}>
                {t}
              </Text>
              {on && <View style={styles.catUnderline} />}
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={styles.catDivider} />
    </View>
  );
}

export default function CbtHomeScreen() {
  const router = useRouter();

  // ✅ "기록"이 기본 탭이었던 원본 유지
  const [tab, setTab] = useState<TabKey>("record");

  // ✅ 원본 예시 데이터 유지 + (캘린더 데모용) 1/9 데이터 추가 (원하시면 삭제 가능)
  const [entries] = useState<CbtEntry[]>([
    {
      id: "1",
      createdAt: new Date(2026, 0, 9, 19, 56).toISOString(),
      category: "대인관계",
      situation:
        "Answer the frequently asked question in a simple sentence, a longish paragraph, or even in a list.",
      automaticThought: "상대가 날 싫어할 거야",
      alternativeThought: "상대의 반응에는 여러 이유가 있을 수 있어",
      emotion: "불안",
      body: "가슴 답답함",
    },
    {
      id: "2",
      createdAt: new Date(2026, 0, 18, 16, 6).toISOString(),
      category: "불안",
      situation: "갑자기 숨이 가빠짐",
      automaticThought: "큰일 난 것 같아",
      alternativeThought: "호흡을 천천히 하면 괜찮아질 수 있어",
      emotion: "불안",
      body: "호흡이 가빠짐",
    },
    {
      id: "3",
      createdAt: new Date(2026, 0, 15, 16, 6).toISOString(),
      category: "자존감",
      situation: "내가 부족하다고 느낌",
      automaticThought: "나는 항상 실패할 거야",
      alternativeThought: "지금까지 해낸 것도 많아",
      emotion: "슬픔",
      body: "무기력",
    },
  ]);

  const [cat, setCat] = useState<CategoryKey>("전체");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const byCat =
      cat === "전체" ? entries : entries.filter((e) => e.category === cat);
    const qq = q.trim();
    if (!qq) return byCat;
    const lower = qq.toLowerCase();
    return byCat.filter((e) => {
      const blob =
        `${e.situation}\n${e.automaticThought}\n${e.alternativeThought}\n${e.emotion ?? ""}\n${e.body ?? ""}`.toLowerCase();
      return blob.includes(lower);
    });
  }, [entries, cat, q]);

  // Calendar state
  const [year, setYear] = useState<number>(2026);
  const [month, setMonth] = useState<number>(1);
  const [selectedDay, setSelectedDay] = useState<number>(9);
  const weeks = useMemo(() => monthMatrix(year, month), [year, month]);

  const selectedIsoStart = useMemo(
    () => new Date(year, month - 1, selectedDay),
    [year, month, selectedDay]
  );

  const selectedEntries = useMemo(() => {
    const start = new Date(selectedIsoStart);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return entries.filter((e) => {
      const t = new Date(e.createdAt).getTime();
      return t >= start.getTime() && t < end.getTime();
    });
  }, [entries, selectedIsoStart]);

  const [openId, setOpenId] = useState<string | null>(entries[0]?.id ?? null);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.screen}>
        {/* ✅ Top bar: 공주님 원본 유지 (우측 + 제거, 자리만 유지) */}
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>

          <Text style={styles.topTitle}>CBT 카드</Text>

          {/* 우측 공간 유지(정렬용) */}
          <View style={{ width: 36 }} />
        </View>

        <View style={{ alignItems: "center", marginTop: 6 }}>
          <SegmentedTabs value={tab} onChange={setTab} />
        </View>

        {tab === "record" ? (
          <View style={{ flex: 1 }}>
            <CategoryTabs value={cat} onChange={setCat} />

            <View style={styles.searchWrap}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                value={q}
                onChangeText={setQ}
                placeholder="상황, 감정, 자동적&대안적 사고 등..."
                placeholderTextColor="rgba(17,17,17,0.35)"
                style={styles.searchInput}
              />
            </View>

            <ScrollView
              contentContainerStyle={{ paddingBottom: 110 }}
              showsVerticalScrollIndicator={false}
            >
              {filtered.map((e) => {
                const expanded = openId === e.id;
                return (
                  <AccordionCard
                    key={e.id}
                    headerLeft={`${formatKoreanDateTime(e.createdAt)}   # ${e.category}`}
                    expanded={expanded}
                    onToggle={() => setOpenId(expanded ? null : e.id)}
                  >
                    <Text style={styles.bullet}>• 상황</Text>
                    <Text style={styles.bodyText}>{e.situation}</Text>

                    <Text style={styles.bullet}>• 자동적 사고</Text>
                    <Text style={styles.bodyText}>{e.automaticThought}</Text>

                    <Text style={styles.bullet}>• 대안적 사고</Text>
                    <Text style={styles.bodyText}>{e.alternativeThought}</Text>

                    <Text style={styles.bullet}>• 감정 & 신체반응</Text>
                    <Text style={styles.bodyText}>
                      {`${e.emotion ?? "-"}, ${e.body ?? "-"}`}
                    </Text>
                  </AccordionCard>
                );
              })}
              {filtered.length === 0 && <Text style={styles.empty}>기록이 없어요.</Text>}
            </ScrollView>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{ paddingBottom: 110 }}
            showsVerticalScrollIndicator={false}
          >
            {/* ✅ 캘린더 카드: 그림자 완전 제거 */}
            <View style={styles.calendarCard}>
              <View style={styles.calTopRow}>
                <Pressable
                  onPress={() => {
                    const d = new Date(year, month - 2, 1);
                    setYear(d.getFullYear());
                    setMonth(d.getMonth() + 1);
                    setSelectedDay(1);
                  }}
                  hitSlop={10}
                >
                  <Text style={styles.navArrow}>‹</Text>
                </Pressable>

                <View style={styles.ymRow}>
                  <View style={styles.dd}>
                    <Text style={styles.ddText}>{year}</Text>
                    <Text style={styles.ddCaret}>▾</Text>
                  </View>
                  <View style={styles.dd}>
                    <Text style={styles.ddText}>{month}월</Text>
                    <Text style={styles.ddCaret}>▾</Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => {
                    const d = new Date(year, month, 1);
                    setYear(d.getFullYear());
                    setMonth(d.getMonth() + 1);
                    setSelectedDay(1);
                  }}
                  hitSlop={10}
                >
                  <Text style={styles.navArrow}>›</Text>
                </Pressable>
              </View>

              <View style={styles.weekRow}>
                {["일", "월", "화", "수", "목", "금", "토"].map((w) => (
                  <Text key={w} style={styles.weekText}>
                    {w}
                  </Text>
                ))}
              </View>

              {/* ✅ 캘린더 그리드: 원본 방식(깔끔하게 숫자만) + 선택일만 검정 라운드 */}
              <View style={styles.grid}>
                {weeks.flat().map((c, idx) => {
                  const isSel = c.inMonth && c.day === selectedDay;

                  return (
                    <Pressable
                      key={idx}
                      disabled={!c.inMonth && c.day === 0}
                      onPress={() => c.inMonth && setSelectedDay(c.day)}
                      style={[
                        styles.cell,
                        isSel && styles.cellSel,
                        !c.inMonth && c.day !== 0 && { opacity: 0.35 },
                        !c.inMonth && c.day === 0 && { opacity: 0.0 },
                      ]}
                      hitSlop={8}
                    >
                      <Text style={[styles.cellText, isSel && styles.cellTextSel]}>
                        {c.day ? c.day : ""}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* ✅ 사진2처럼: 메타 1줄 + (그림자 없는) 아코디언 3개 */}
            {selectedEntries.map((e) => (
              <View key={e.id} style={styles.calDetailWrap}>
                <Text style={styles.calDetailMeta}>
                  {formatKoreanDateTime(e.createdAt)} &nbsp; # {e.category}
                </Text>

                <AccordionCard
                  headerLeft={"상황"}
                  expanded={openId === `situation-${e.id}`}
                  onToggle={() =>
                    setOpenId(openId === `situation-${e.id}` ? null : `situation-${e.id}`)
                  }
                  flat
                >
                  <Text style={styles.bodyText}>{e.situation}</Text>
                </AccordionCard>

                <AccordionCard
                  headerLeft={"자동적 사고"}
                  expanded={openId === `auto-${e.id}`}
                  onToggle={() =>
                    setOpenId(openId === `auto-${e.id}` ? null : `auto-${e.id}`)
                  }
                  flat
                >
                  <Text style={styles.bodyText}>{e.automaticThought}</Text>
                </AccordionCard>

                <AccordionCard
                  headerLeft={"대안적 사고"}
                  expanded={openId === `alt-${e.id}`}
                  onToggle={() =>
                    setOpenId(openId === `alt-${e.id}` ? null : `alt-${e.id}`)
                  }
                  flat
                >
                  <Text style={styles.bodyText}>{e.alternativeThought}</Text>
                </AccordionCard>
              </View>
            ))}

            {selectedEntries.length === 0 && (
              <Text style={styles.empty}>선택한 날짜에 기록이 없어요.</Text>
            )}
          </ScrollView>
        )}

        {/* ✅ FAB: 공주님 원본 유지 */}
        <Pressable
          onPress={() => router.push("/cbt/edit")}
          style={({ pressed }) => [
            styles.fab,
            shadow(6),
            pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
          ]}
          hitSlop={12}
        >
          <Text style={styles.fabText}>＋</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  screen: { flex: 1, backgroundColor: BG, paddingHorizontal: 18, paddingTop: 6 },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
    marginTop: 6,
  },
  backArrow: { fontSize: 34, color: "#111", width: 28 },
  topTitle: { fontSize: 22, fontWeight: "800", color: "#111" },

  segmentWrap: {
    flexDirection: "row",
    backgroundColor: "rgba(17,17,17,0.08)",
    borderRadius: 999,
    padding: 3,
    width: 210,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentOn: { backgroundColor: CARD },
  segmentText: { fontWeight: "800", color: "rgba(17,17,17,0.45)" },
  segmentTextOn: { color: "#111" },

  catTabsRow: { paddingTop: 14, paddingBottom: 10, gap: 18, paddingHorizontal: 2 },
  catTabBtn: { alignItems: "center", justifyContent: "center" },
  catTabText: { fontSize: 14, fontWeight: "800", color: "rgba(17,17,17,0.55)" },
  catTabTextOn: { color: "#111" },
  catUnderline: {
    marginTop: 6,
    height: 3,
    width: 28,
    borderRadius: 999,
    backgroundColor: "#111",
  },
  catDivider: { height: 1, backgroundColor: "rgba(17,17,17,0.18)" },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(17,17,17,0.08)",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 38,
    marginTop: 10,
    marginBottom: 12,
  },
  searchIcon: { fontSize: 16, color: "rgba(17,17,17,0.45)", marginRight: 8 },
  searchInput: { flex: 1, color: "#111", fontWeight: "700" },

  accordion: {
    backgroundColor: CARD,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: LINE,
  },

  // ✅ 캘린더 탭 전용: 아코디언 그림자 제거
  accordionFlat: {
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },

  accordionHead: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  accordionTitle: { fontWeight: "900", color: "#111" },
  chev: { fontSize: 18, fontWeight: "900", color: "rgba(17,17,17,0.55)" },
  accordionBody: { paddingHorizontal: 14, paddingBottom: 14, paddingTop: 2 },

  bullet: { marginTop: 10, fontWeight: "900", color: "#111" },
  bodyText: { marginTop: 6, color: "#111", fontWeight: "700" },
  empty: { textAlign: "center", color: SUB, marginTop: 14, fontWeight: "700" },

  // ✅ 캘린더 카드: 그림자 완전 제거 + 레퍼런스 톤
  calendarCard: {
    marginTop: 14,
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: LINE,
    paddingHorizontal: 14,
    paddingVertical: 14,

    shadowOpacity: 0,
    shadowRadius: 0,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  calTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  navArrow: { fontSize: 26, fontWeight: "900", color: "#111", width: 20 },

  ymRow: { flexDirection: "row", gap: 10 },
  dd: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 38,
    gap: 8,
  },
  ddText: { fontWeight: "900", color: "#111", fontSize: 16 },
  ddCaret: { color: "rgba(17,17,17,0.55)", fontWeight: "900", fontSize: 18 },

  weekRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12, paddingHorizontal: 2 },
  weekText: { width: 24, textAlign: "center", color: SUB, fontWeight: "800" },

  grid: { marginTop: 10, flexDirection: "row", flexWrap: "wrap" },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  cellSel: { backgroundColor: "#111" },
  cellText: { color: "#111", fontWeight: "800", fontSize: 16 },
  cellTextSel: { color: "#fff" },

  calDetailWrap: { marginTop: 12 },
  calDetailMeta: {
    color: "rgba(17,17,17,0.85)",
    fontWeight: "900",
    marginBottom: 10,
    fontSize: 16,
  },

  fab: {
    position: "absolute",
    right: 18,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: FAB,
    alignItems: "center",
    justifyContent: "center",
  },
  fabText: { color: "#fff", fontWeight: "900", fontSize: 28, marginTop: -2 },
});