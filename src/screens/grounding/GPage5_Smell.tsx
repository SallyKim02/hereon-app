import { useState } from "react";
import { View, Text, Pressable, TextInput, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GHeader from "./GHeader";

const BG = "#F2F0EE";
const DARK = "#3B3B3B";

export default function GPage5_Smell({ onPrev, onContinue }: { onPrev?: () => void; onContinue: () => void }) {
  const [value, setValue] = useState("");

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <GHeader title="그라운딩" onPrev={onPrev} onNext={onContinue} />

      <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
        <Text style={styles.h1}>후각에 집중해보세요</Text>
        <Text style={styles.desc}>어떤 냄새를 맡을 수 있나요?</Text>
        <Text style={styles.example}>예: 커피향, 비누향, 풀내음…</Text>

        <Text style={styles.progress}>남은 항목 1 / 2</Text>

        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder="느껴지는 것을 짧게 적어보세요"
          style={styles.input}
          returnKeyType="done"
        />

        <Pressable onPress={onContinue} style={styles.cta}>
          <Text style={styles.ctaText}>입력</Text>
        </Pressable>

        <View style={{ height: 18 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  screen: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 22 },

  h1: { fontSize: 24, fontWeight: "800", color: "#111", marginTop: 6 },
  desc: { marginTop: 8, fontSize: 14, color: "#333" },
  example: { marginTop: 6, fontSize: 13, color: "#666" },
  progress: { marginTop: 12, fontSize: 13, fontWeight: "700", color: "#111" },

  input: {
    marginTop: 14,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E0DEDB",
    paddingHorizontal: 12,
    backgroundColor: "#FFF",
  },

  cta: { marginTop: 16, height: 54, borderRadius: 999, backgroundColor: DARK, alignItems: "center", justifyContent: "center" },
  ctaText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
});
