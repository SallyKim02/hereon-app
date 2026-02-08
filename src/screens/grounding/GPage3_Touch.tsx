import { useMemo, useState } from "react";
import { View, Text, Pressable, TextInput, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GHeader from "./GHeader";

type TouchMission = { key: string; title: string; prompt: string; helper: string };

const ALL_MISSIONS: TouchMission[] = [
  { key: "cold", title: "차가운 것을 하나 찾아 만져보세요", prompt: "느껴지는 것을 짧게 적어보세요", helper: "얼마나 차갑나요? 습기가 있나요?" },
  { key: "soft", title: "부드러운 것을 하나 찾아 만져보세요", prompt: "느껴지는 것을 짧게 적어보세요", helper: "손가락 사이의 감각은 어떤가요?" },
  { key: "hard", title: "딱딱한 것을 하나 찾아 만져보세요", prompt: "느껴지는 것을 짧게 적어보세요", helper: "어떤 재질인가요? 온도는 어떤가요?" },
  { key: "tap", title: "손등을 반대 손가락으로 톡톡 두드려보세요", prompt: "느껴지는 것을 짧게 적어보세요", helper: "얼마나 탄력이 있나요?" },
];

const BG = "#F2F0EE";

export default function GPage3_Touch({ onPrev, onContinue }: { onPrev?: () => void; onContinue: () => void }) {
  const missions = useMemo(() => ALL_MISSIONS, []);
  const [idx, setIdx] = useState(0);
  const [note, setNote] = useState("");

  const remaining = Math.max(0, missions.length - 1 - idx);
  const isLast = idx >= missions.length - 1;
  const mission = missions[idx];

  const next = () => {
    if (isLast) onContinue();
    else {
      setIdx((v) => v + 1);
      setNote("");
    }
  };

  const reshuffle = () => {
    const nextIdx = Math.floor(Math.random() * missions.length);
    setIdx(nextIdx);
    setNote("");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <GHeader title="그라운딩" onPrev={onPrev} onNext={next} />

      <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
        <Text style={styles.h1}>촉각에 집중해보세요</Text>
        <Text style={styles.sub}>안전하고 통증 없는 범위에서 천천히 진행합니다.</Text>

        <Text style={styles.progress}>남은 미션 {remaining} / 4</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{mission.title}</Text>
          <Text style={styles.cardPrompt}>{mission.prompt}</Text>
          <Text style={styles.cardHelper}>{mission.helper}</Text>

          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="예: 차갑고 약간 습해요"
            style={styles.input}
            multiline
            textAlignVertical="top"
          />

          <View style={styles.row}>
            <Pressable style={styles.secondary} onPress={reshuffle}>
              <Text style={styles.secondaryText}>다시 뽑기</Text>
            </Pressable>

            <Pressable style={styles.secondary} onPress={next}>
              <Text style={styles.secondaryText}>{isLast ? "Continue" : "다음"}</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ height: 14 }} />
        <Text style={styles.altTitle}>주변에 물건이 없으면 이렇게 해도 돼요</Text>
        <Text style={styles.altText}>손등 톡톡 · 팔 쓸어내리기 · 귓불 비비기</Text>

        <View style={{ height: 18 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  screen: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 22 },

  h1: { fontSize: 24, fontWeight: "800", color: "#111", marginTop: 6 },
  sub: { marginTop: 8, fontSize: 13, color: "#444" },
  progress: { marginTop: 12, fontSize: 13, fontWeight: "700", color: "#111" },

  card: { marginTop: 14, backgroundColor: "#FFF", borderRadius: 18, padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: "800", color: "#111" },
  cardPrompt: { marginTop: 8, fontSize: 14, fontWeight: "700", color: "#222" },
  cardHelper: { marginTop: 6, fontSize: 13, color: "#555" },

  input: { marginTop: 12, minHeight: 88, borderRadius: 14, borderWidth: 1, borderColor: "#E0DEDB", padding: 12, backgroundColor: "#FAF9F8" },

  row: { flexDirection: "row", gap: 10, marginTop: 12 },
  secondary: { flex: 1, height: 44, borderRadius: 999, backgroundColor: "#F2F0EE", alignItems: "center", justifyContent: "center" },
  secondaryText: { fontSize: 14, fontWeight: "800", color: "#111" },

  altTitle: { marginTop: 6, fontSize: 13, fontWeight: "800", color: "#111" },
  altText: { marginTop: 6, fontSize: 13, color: "#333" },
});
