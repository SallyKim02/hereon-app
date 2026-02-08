import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

type MultiKey = "category" | "emotion" | "body" | "year" | "month";

const BG = "#F2F0EE";
const CARD = "#FFFFFF";
const TEXT = "#111111";
const PLACEHOLDER = "rgba(17,17,17,0.35)";
const LINE = "rgba(17,17,17,0.10)";
const BTN = "#2F2F2F";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function weekdayKo(d: Date) {
  return ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
}

// ✅ 변경: YYYY년 MM월 D일 요일 HH:mm
function formatAutoStampKorean(d: Date) {
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = String(d.getDate()); // 1~31 (요청은 DDD였지만 실제 일(day)은 가변이 자연스러움)
  const w = weekdayKo(d);
  const hh = pad2(d.getHours());
  const min = pad2(d.getMinutes());
  return `${yyyy}년 ${mm}월 ${dd}일 ${w}요일 ${hh}:${min}`;
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr));
}

function PillFilter({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.filterPill} hitSlop={8}>
      <Text style={styles.filterText}>{label}</Text>
      <Text style={styles.filterCaret}>▾</Text>
    </Pressable>
  );
}

function MultiSelectBox({
  valueText,
  placeholder,
  onPress,
}: {
  valueText: string;
  placeholder: string;
  onPress: () => void;
}) {
  const isEmpty = valueText.trim().length === 0;
  return (
    <Pressable onPress={onPress} style={styles.ddInput} hitSlop={8}>
      <Text style={[styles.ddValue, isEmpty && { color: PLACEHOLDER }]}>
        {isEmpty ? placeholder : valueText}
      </Text>
      <Text style={styles.ddCaret}>▾</Text>
    </Pressable>
  );
}

export default function CbtEditScreen() {
  const router = useRouter();

  // ✅ 변경: 날짜/시간 매 분 자동 갱신
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const autoStamp = useMemo(() => formatAutoStampKorean(now), [now]);

  // 입력값
  const [situation, setSituation] = useState("");
  const [automaticThought, setAutomaticThought] = useState("");
  const [alternativeThought, setAlternativeThought] = useState("");

  // 복수 선택 옵션
  const CATEGORIES = useMemo(
    () => ["대인관계", "학업", "직장", "건강", "정서", "불안", "자존감", "기타"],
    []
  );
  const EMOTIONS = useMemo(
    () => ["불안", "두려움", "긴장", "우울", "슬픔", "무기력", "분노", "죄책감", "수치심"],
    []
  );
  const BODY = useMemo(
    () => [
      "심장이 빨리 뜀",
      "가슴이 답답하거나 조이는 느낌",
      "숨이 가빠짐",
      "어지러움",
      "멍함",
      "손발이 차가워짐",
      "땀이 남",
      "근육이 긴장됨",
      "몸에 힘이 빠짐",
      "속이 안 좋음",
      "얼굴이 달아오름",
    ],
    []
  );

  const [pickedCategories, setPickedCategories] = useState<string[]>([]);
  const [pickedEmotions, setPickedEmotions] = useState<string[]>([]);
  const [pickedBody, setPickedBody] = useState<string[]>([]);

  const [open, setOpen] = useState<MultiKey | null>(null);

  const valueText = (arr: string[]) => arr.join(", ");

  const togglePick = (
    _key: MultiKey,
    item: string,
    getter: () => string[],
    setter: (v: string[]) => void
  ) => {
    const cur = getter();
    const has = cur.includes(item);
    const next = has ? cur.filter((x) => x !== item) : uniq([...cur, item]);
    setter(next);
  };

  const onSave = () => {
    const payload = {
      createdAt: new Date().toISOString(),
      autoStamp, // ✅ 한국어 포맷 자동 기록
      categories: pickedCategories,
      emotions: pickedEmotions,
      bodyReactions: pickedBody,
      situation,
      automaticThought,
      alternativeThought,
    };
    // eslint-disable-next-line no-console
    console.log("[CBT SAVE]", payload);

    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.screen}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>

          <Text style={styles.topTitle}>CBT 카드</Text>

          {/* 우측 공간 맞춤용 */}
          <View style={{ width: 28 }} />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* ✅ 날짜: 카테고리 박스와 같은 "폭(=한 줄 전체)" + 같은 모양의 박스 */}
          <View style={styles.datePillRow}>
            <View style={styles.datePill}>
              <Text style={styles.datePillText}>{autoStamp}</Text>
            </View>
          </View>

          {/* ✅ 카테고리 박스(폭 유지) */}
          <View style={styles.filterRow}>
            <PillFilter label="카테고리" onPress={() => setOpen("category")} />
          </View>

          <Text style={styles.sectionTitle}>상황</Text>
          <View style={styles.textArea}>
            <TextInput
              value={situation}
              onChangeText={setSituation}
              placeholder="어디에서, 누구와, 어떤 상황이었나요?"
              placeholderTextColor={PLACEHOLDER}
              multiline
              style={styles.textAreaInput}
            />
          </View>

          {/* 감정 / 신체 반응 2열 */}
          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>감정</Text>
              <MultiSelectBox
                valueText={valueText(pickedEmotions)}
                placeholder="선택하기"
                onPress={() => setOpen("emotion")}
              />
            </View>

            <View style={{ width: 14 }} />

            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>신체 반응</Text>
              <MultiSelectBox
                valueText={valueText(pickedBody)}
                placeholder="선택하기"
                onPress={() => setOpen("body")}
              />
            </View>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 18 }]}>자동적 사고</Text>
          <View style={styles.textArea}>
            <TextInput
              value={automaticThought}
              onChangeText={setAutomaticThought}
              placeholder="떠오른 생각을 그대로 적어주세요"
              placeholderTextColor={PLACEHOLDER}
              multiline
              style={styles.textAreaInput}
            />
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 18 }]}>대안적 사고</Text>
          <View style={styles.textArea}>
            <TextInput
              value={alternativeThought}
              onChangeText={setAlternativeThought}
              placeholder="증거를 검토해, 보다 균형 잡힌 생각을 적어주세요"
              placeholderTextColor={PLACEHOLDER}
              multiline
              style={styles.textAreaInput}
            />
          </View>

          <View style={{ height: 22 }} />

          <Pressable
            onPress={onSave}
            style={({ pressed }) => [
              styles.saveBtn,
              pressed && { opacity: 0.96, transform: [{ scale: 0.995 }] },
            ]}
          >
            <Text style={styles.saveText}>저장하기</Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Multi-select dropdown modal */}
      <Modal
        transparent
        visible={open !== null}
        animationType="fade"
        onRequestClose={() => setOpen(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setOpen(null)}>
          <View />
        </Pressable>

        <View style={styles.modalSheet}>
          <ScrollView>
            {open === "category" &&
              CATEGORIES.map((x) => {
                const on = pickedCategories.includes(x);
                return (
                  <Pressable
                    key={x}
                    onPress={() =>
                      togglePick(
                        "category",
                        x,
                        () => pickedCategories,
                        setPickedCategories
                      )
                    }
                    style={styles.modalItem}
                  >
                    <Text style={styles.modalText}>{x}</Text>
                    <Text style={[styles.check, on && styles.checkOn]}>
                      {on ? "✓" : ""}
                    </Text>
                  </Pressable>
                );
              })}

            {open === "emotion" &&
              EMOTIONS.map((x) => {
                const on = pickedEmotions.includes(x);
                return (
                  <Pressable
                    key={x}
                    onPress={() =>
                      togglePick("emotion", x, () => pickedEmotions, setPickedEmotions)
                    }
                    style={styles.modalItem}
                  >
                    <Text style={styles.modalText}>{x}</Text>
                    <Text style={[styles.check, on && styles.checkOn]}>
                      {on ? "✓" : ""}
                    </Text>
                  </Pressable>
                );
              })}

            {open === "body" &&
              BODY.map((x) => {
                const on = pickedBody.includes(x);
                return (
                  <Pressable
                    key={x}
                    onPress={() => togglePick("body", x, () => pickedBody, setPickedBody)}
                    style={styles.modalItem}
                  >
                    <Text style={styles.modalText}>{x}</Text>
                    <Text style={[styles.check, on && styles.checkOn]}>
                      {on ? "✓" : ""}
                    </Text>
                  </Pressable>
                );
              })}
          </ScrollView>

          {/* 하단 닫기(복수 선택이라 필요) */}
          {(open === "category" || open === "emotion" || open === "body") && (
            <Pressable onPress={() => setOpen(null)} style={styles.modalDone}>
              <Text style={styles.modalDoneText}>완료</Text>
            </Pressable>
          )}
        </View>
      </Modal>
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
    marginBottom: 6,
  },
  backArrow: { fontSize: 34, color: TEXT, width: 28 },
  topTitle: { fontSize: 22, fontWeight: "800", color: TEXT },

  // ✅ 날짜 pill: 카테고리 박스와 같은 폭(=한 줄 전체) + 중앙정렬 텍스트
  datePillRow: {
    marginTop: 14,
    marginBottom: 10,
  },
  datePill: {
    height: 40,
    borderRadius: 999,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: LINE,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch", // ✅ 한 줄 전체 폭
  },
  datePillText: {
    fontSize: 15, // ✅ 날짜 정보 크기 조금 키움
    fontWeight: "900",
    color: TEXT,
    textAlign: "center",
  },

  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  filterPill: {
    flex: 1,
    height: 40,
    borderRadius: 999,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: LINE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  filterText: { fontWeight: "900", color: TEXT },
  filterCaret: {
    color: "rgba(17,17,17,0.55)",
    fontWeight: "900",
    fontSize: 18, // ✅ 화살표 조금 더 크게
    lineHeight: 18,
  },

  sectionTitle: { fontWeight: "900", color: TEXT, marginBottom: 8 },

  // ✅ 그림자 제거: border만
  textArea: {
    backgroundColor: CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: LINE,
    padding: 12,
    minHeight: 92,
  },
  textAreaInput: {
    color: TEXT,
    fontWeight: "700",
    minHeight: 72,
    textAlignVertical: "top",
  },

  twoCol: { flexDirection: "row", alignItems: "flex-start", marginTop: 14 },

  ddInput: {
    backgroundColor: CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: LINE,
    height: 44,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ddValue: { fontWeight: "800", color: TEXT, flex: 1, paddingRight: 10 },
  ddCaret: {
    color: "rgba(17,17,17,0.55)",
    fontWeight: "900",
    fontSize: 18, // ✅ 화살표 조금 더 크게
    lineHeight: 18,
  },

  saveBtn: {
    alignSelf: "center",
    backgroundColor: BTN,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 38,
    minWidth: 160,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "900", fontSize: 16 },

  modalBackdrop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  modalSheet: {
    position: "absolute",
    left: 18,
    right: 18,
    top: 220,
    backgroundColor: CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: LINE,
    maxHeight: 320,
    overflow: "hidden",
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(17,17,17,0.08)",
  },
  modalText: { color: TEXT, fontWeight: "800", flex: 1, paddingRight: 12 },
  check: {
    width: 18,
    textAlign: "right",
    color: "rgba(17,17,17,0.55)",
    fontWeight: "900",
  },
  checkOn: { color: TEXT },

  modalDone: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(17,17,17,0.06)",
  },
  modalDoneText: { fontWeight: "900", color: TEXT },
});
