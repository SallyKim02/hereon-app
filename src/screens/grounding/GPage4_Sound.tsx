import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SoundMission = {
  key: string;
  options: string[];
};

const MISSIONS: SoundMission[] = [
  { key: "m1", options: ["튀김", "빗방울", "삼겹살 굽기"] },
  { key: "m2", options: ["새", "새", "교통음"] },
  { key: "m3", options: ["분무기", "머리 빗기", "먼지 제거"] },
];

export default function GPage4_Sound({ onContinue }: { onContinue: () => void }) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  const remaining = Math.max(0, (MISSIONS.length - 1) - idx);
  const isLast = idx >= MISSIONS.length - 1;

  const next = () => {
    if (!picked) return;
    if (isLast) onContinue();
    else {
      setIdx((v) => v + 1);
      setPicked(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.screen}>
        <Text style={styles.h1}>무엇이 들리나요?</Text>
        <Text style={styles.desc}>가장 비슷한 소리를 선택해주세요</Text>

        <Text style={styles.progress}>남은 미션 {remaining} / 3</Text>

        <View style={styles.playerCard}>
          <Text style={styles.playerTitle}>소리 재생(추후 오디오 연결)</Text>
          <Pressable style={styles.secondary} onPress={() => {}}>
            <Text style={styles.secondaryText}>다시 듣기</Text>
          </Pressable>
        </View>

        <View style={styles.options}>
            {MISSIONS[idx].options.map((opt, i) => {
            const id = `${idx}-${i}-${opt}`;
            const on = picked === id;

            return (
                <Pressable
                key={id}
                onPress={() => setPicked(id)}
                style={[styles.opt, on && styles.optOn]}
                >
                <Text style={[styles.optText, on && styles.optTextOn]}>{opt}</Text>
                </Pressable>
            );
            })}
        </View>

        <Pressable
          onPress={next}
          disabled={!picked}
          style={[styles.cta, !picked && styles.ctaDisabled]}
        >
          <Text style={[styles.ctaText, !picked && styles.ctaTextDisabled]}>
            {isLast ? "Continue" : "다음 미션"}
          </Text>
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
  progress: { marginTop: 12, fontSize: 13, fontWeight: "700", color: "#111" },

  playerCard: { marginTop: 14, backgroundColor: "#FFF", borderRadius: 18, padding: 16, gap: 10 },
  playerTitle: { fontSize: 14, fontWeight: "800", color: "#111" },

  secondary: {
    height: 44,
    borderRadius: 999,
    backgroundColor: "#F2F0EE",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: { fontSize: 14, fontWeight: "800", color: "#111" },

  options: { marginTop: 14, gap: 10 },
  opt: { backgroundColor: "#FFF", paddingVertical: 14, borderRadius: 999, alignItems: "center" },
  optOn: { backgroundColor: DARK },
  optText: { fontSize: 14, fontWeight: "800", color: "#111" },
  optTextOn: { color: "#FFF" },

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
