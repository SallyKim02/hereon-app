import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BG = "#F2F0EE";
const DARK = "#3B3B3B";

export default function GPage1_Intro({ onContinue }: { onContinue: () => void }) {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.screen}>
        <Text style={styles.title}>그라운딩이란?</Text>

        {/* ✅ 설명 카드 */}
        <View style={styles.bodyCard}>
          <Text style={styles.body}>
            그라운딩은 지금 이 순간에 집중하도록 도와
            {"\n\n"}
            불안하거나 긴장된 상태에서
            {"\n\n"}
            몸과 마음을 안정시키는 연습이에요
            {"\n\n"}
            지금 보이는 것, 들리는 소리, 느껴지는 감각에
            {"\n\n"}
            하나씩 집중하며 지금-여기를 느껴보세요 
          </Text>
        </View>

        <Pressable style={styles.cta} onPress={onContinue}>
          <Text style={styles.ctaText}>Continue</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  screen: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: 24,
    paddingTop: 12,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111",
    marginTop: 64,
    textAlign: "center",
  },

  bodyCard: {
    marginTop: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },

  body: {
    fontSize: 15,
    lineHeight: 15,
    color: "#222",
    textAlign: "center",
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
  ctaText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
});