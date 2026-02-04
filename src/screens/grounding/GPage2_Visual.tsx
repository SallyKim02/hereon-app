import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const OPTIONS = ["소파", "쿠션", "러그", "턴테이블", "스탠드", "식물", "테이블"];

export default function GPage2_VisualPick5({ onContinue }: { onContinue: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const remaining = Math.max(0, 5 - selected.length);
  const canContinue = selected.length >= 5;

  const toggle = (label: string) => {
    setSelected((prev) => {
      const exists = prev.includes(label);
      if (exists) return prev.filter((x) => x !== label);
      if (prev.length >= 5) return prev;
      return [...prev, label];
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.screen}>
        <Text style={styles.h1}>무엇이 보이나요?</Text>
        <Text style={styles.desc}>아래의 사진에서 보이는 5가지를 골라주세요</Text>

        <Text style={styles.remaining}>남은 항목 {remaining} / 5</Text>

        <View style={styles.imageStub}>
          <Text style={{ color: "#777" }}>이미지(추후)</Text>
        </View>

        <View style={styles.options}>
          {OPTIONS.map((label) => {
            const on = selected.includes(label);
            return (
              <Pressable
                key={label}
                onPress={() => toggle(label)}
                style={[styles.opt, on && styles.optOn]}
              >
                <Text style={[styles.optText, on && styles.optTextOn]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.row}>
          <Pressable style={styles.secondary} onPress={() => setSelected([])}>
            <Text style={styles.secondaryText}>새 이미지</Text>
          </Pressable>
          <Pressable style={styles.secondary} onPress={() => {}}>
            <Text style={styles.secondaryText}>직접 입력</Text>
          </Pressable>
        </View>

        <Pressable
          disabled={!canContinue}
          onPress={onContinue}
          style={[styles.cta, !canContinue && styles.ctaDisabled]}
        >
          <Text style={[styles.ctaText, !canContinue && styles.ctaTextDisabled]}>Continue</Text>
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
  remaining: { marginTop: 12, fontSize: 13, fontWeight: "700", color: "#111" },

  imageStub: {
    height: 180,
    borderRadius: 18,
    backgroundColor: "#E8E5E2",
    marginTop: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  options: { marginTop: 14, flexDirection: "row", flexWrap: "wrap", gap: 10 },
  opt: { backgroundColor: "#FFF", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999 },
  optOn: { backgroundColor: DARK },
  optText: { fontSize: 14, fontWeight: "700", color: "#111" },
  optTextOn: { color: "#FFF" },

  row: { flexDirection: "row", gap: 10, marginTop: 12 },
  secondary: {
    flex: 1,
    height: 44,
    borderRadius: 999,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: { fontSize: 14, fontWeight: "700", color: "#111" },

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
