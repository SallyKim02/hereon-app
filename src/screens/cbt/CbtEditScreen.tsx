import { useMemo, useState } from "react";
import { SafeAreaView, StyleSheet, Text, View, TextInput, Pressable, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { CBT_CATEGORIES, PHYSICAL_REACTIONS, type CbtCategory, type CbtRecord } from "./cbtTypes";
import { loadCbtRecords, saveCbtRecords } from "./cbtStorage";

function uuid() {
  // RN에서 crypto가 없을 수 있어서 간단 대체(나중에 uuid 패키지로 교체 추천)
  return `cbt_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function CbtEditScreen() {
  const [category, setCategory] = useState<CbtCategory>("불안");
  const [situation, setSituation] = useState("");
  const [emotion, setEmotion] = useState("");
  const [automaticThought, setAutomaticThought] = useState("");
  const [alternativeThought, setAlternativeThought] = useState("");
  const [pickedPhys, setPickedPhys] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const happenedAt = useMemo(() => Date.now(), []);

  const togglePhys = (label: string) => {
    setPickedPhys((prev) => (prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]));
  };

  const onSave = async () => {
    if (!situation.trim()) {
      Alert.alert("입력 필요", "상황을 먼저 작성해 주세요.");
      return;
    }
    if (!automaticThought.trim()) {
      Alert.alert("입력 필요", "자동적 사고를 작성해 주세요.");
      return;
    }
    if (!alternativeThought.trim()) {
      Alert.alert("입력 필요", "대안적 사고를 작성해 주세요.");
      return;
    }

    setSaving(true);
    try {
      const now = Date.now();
      const record: CbtRecord = {
        id: uuid(),
        createdAt: now,
        updatedAt: now,
        happenedAt,
        category,
        situation: situation.trim(),
        emotion: emotion.trim(),
        physicalReactions: pickedPhys,
        automaticThought: automaticThought.trim(),
        alternativeThought: alternativeThought.trim(),
      };

      const prev = await loadCbtRecords();
      await saveCbtRecords([record, ...prev]);
      router.replace("/cbt"); // 저장 후 홈으로
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <Text style={styles.title}>CBT 작성</Text>
          <View style={{ width: 44 }} />
        </View>

        <Text style={styles.label}>카테고리</Text>
        <View style={styles.chips}>
          {CBT_CATEGORIES.map((c) => {
            const on = category === c;
            return (
              <Pressable key={c} onPress={() => setCategory(c)} style={[styles.chip, on && styles.chipOn]}>
                <Text style={[styles.chipText, on && styles.chipTextOn]}>{c}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>상황</Text>
        <TextInput
          value={situation}
          onChangeText={setSituation}
          placeholder="어디에서, 누구와, 어떤 상황이었나요?"
          placeholderTextColor="rgba(0,0,0,0.35)"
          style={[styles.input, styles.textArea]}
          multiline
        />

        <Text style={styles.label}>감정</Text>
        <TextInput
          value={emotion}
          onChangeText={setEmotion}
          placeholder="예: 불안함, 초조함, 두려움…"
          placeholderTextColor="rgba(0,0,0,0.35)"
          style={styles.input}
        />

        <Text style={styles.label}>신체 반응(복수 선택)</Text>
        <View style={styles.chips}>
          {PHYSICAL_REACTIONS.map((p) => {
            const on = pickedPhys.includes(p);
            return (
              <Pressable key={p} onPress={() => togglePhys(p)} style={[styles.chip, on && styles.chipOn]}>
                <Text style={[styles.chipText, on && styles.chipTextOn]}>{p}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>자동적 사고</Text>
        <TextInput
          value={automaticThought}
          onChangeText={setAutomaticThought}
          placeholder="떠오른 생각을 그대로 적어주세요"
          placeholderTextColor="rgba(0,0,0,0.35)"
          style={[styles.input, styles.textArea]}
          multiline
        />

        <Text style={styles.label}>대안적 사고</Text>
        <TextInput
          value={alternativeThought}
          onChangeText={setAlternativeThought}
          placeholder="증거를 검토해, 보다 균형 잡힌 생각을 적어주세요"
          placeholderTextColor="rgba(0,0,0,0.35)"
          style={[styles.input, styles.textArea]}
          multiline
        />

        <Pressable onPress={onSave} disabled={saving} style={[styles.saveBtn, saving && styles.saveBtnOff]}>
          <Text style={styles.saveText}>{saving ? "저장 중…" : "저장하기"}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const BG = "#F2F0EE";
const DARK = "#3B3B3B";
const CARD = "#FFFFFF";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { padding: 18, paddingBottom: 28 },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  backBtn: {
    width: 44,
    height: 40,
    borderRadius: 12,
    backgroundColor: CARD,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { fontSize: 18, fontWeight: "900", color: DARK },
  title: { fontSize: 18, fontWeight: "900", color: DARK },

  label: { marginTop: 14, marginBottom: 8, fontWeight: "900", color: DARK },

  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: CARD,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
  },
  chipOn: { backgroundColor: DARK },
  chipText: { color: DARK, fontWeight: "800", fontSize: 13 },
  chipTextOn: { color: "#fff" },

  input: {
    backgroundColor: CARD,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: DARK,
    fontWeight: "700",
  },
  textArea: { minHeight: 100, textAlignVertical: "top" },

  saveBtn: {
    marginTop: 18,
    backgroundColor: DARK,
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
  },
  saveBtnOff: { opacity: 0.6 },
  saveText: { color: "#fff", fontWeight: "900", fontSize: 16 },
});
