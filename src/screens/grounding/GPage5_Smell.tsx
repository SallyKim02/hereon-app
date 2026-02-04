import { useState } from "react";
import { View, Text, Pressable, TextInput, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GPage5_Smell({ onContinue }: { onContinue: () => void }) {
  const [value, setValue] = useState("");

  const canContinue = value.trim().length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.screen}>
        <Text style={styles.h1}>후각에 집중해보세요</Text>
        <Text style={styles.desc}>어떤 냄새를 맡을 수 있나요?</Text>
        <Text style={styles.example}>예: 커피향, 비누향, 풀내음…</Text>

        <Text style={styles.progress}>남은 항목 1 / 2</Text>

        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder="느껴지는 것을 짧게 적어보세요"
          style={styles.input}
        />

        <Pressable
          onPress={onContinue}
          disabled={!canContinue}
          style={[styles.cta, !canContinue && styles.ctaDisabled]}
        >
          <Text style={[styles.ctaText, !canContinue && styles.ctaTextDisabled]}>입력</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const BG = "#F2F0EE";
const DARK = "#3B3B3B";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  screen: { flex: 1, backgroundColor: BG, paddingHorizontal: 20, paddingTop: 12 },

  h1: { fontSize: 24, fontWeight: "800", color: "#111", marginTop: 8 },
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

  cta: {
    marginTop: "auto",
    marginBottom: 18,
    height: 54,
    borderRadius: 999,
    backgroundColor: DARK,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaDisabled: { backgroundColor: "#B9B9B9" },
  ctaText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
  ctaTextDisabled: { color: "#F2F2F2" },
});
