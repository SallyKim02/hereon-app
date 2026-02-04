import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GPage1_Intro({ onContinue }: { onContinue: () => void }) {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.screen}>
        <Text style={styles.title}>그라운딩이란?</Text>

        <Text style={styles.body}>
          그라운딩은 지금 이 순간에 집중하도록 도와서 불안/긴장을 낮추는 연습이에요.
          {"\n\n"}
          주변에서 보고, 느끼고, 듣는 것에 주의를 옮겨보세요.
        </Text>

        <Pressable style={styles.cta} onPress={onContinue}>
          <Text style={styles.ctaText}>Continue</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const BG = "#F2F0EE";
const DARK = "#3B3B3B";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  screen: { flex: 1, backgroundColor: BG, paddingHorizontal: 24, paddingTop: 18 },
  title: { fontSize: 26, fontWeight: "800", color: "#111", marginTop: 14 },
  body: { marginTop: 14, fontSize: 15, lineHeight: 22, color: "#222" },

  cta: {
    marginTop: "auto",
    marginBottom: 18,
    height: 54,
    borderRadius: 999,
    backgroundColor: DARK,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
});
