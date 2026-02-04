import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function GPage7_Outro({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [text, setText] = useState("");

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.screen}>
        <Text style={styles.h1}>수고하셨습니다</Text>
        <Text style={styles.desc}>스스로 느낀 변화를 짧게 적어보세요</Text>

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="예: 마음이 조금 가라앉았어요 / 호흡이 편해졌어요"
          style={styles.input}
          multiline
        />

        <View style={styles.row}>
          <Pressable style={styles.secondary} onPress={() => router.replace("/")}>
            <Text style={styles.secondaryText}>메인으로</Text>
          </Pressable>
          <Pressable style={styles.secondary} onPress={onDone}>
            <Text style={styles.secondaryText}>Back to Menu</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const BG = "#F2F0EE";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  screen: { flex: 1, backgroundColor: BG, paddingHorizontal: 20, paddingTop: 12 },

  h1: { fontSize: 24, fontWeight: "900", color: "#111", marginTop: 8 },
  desc: { marginTop: 8, fontSize: 14, color: "#333" },

  input: {
    marginTop: 14,
    minHeight: 140,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E0DEDB",
    padding: 14,
    backgroundColor: "#FFF",
  },

  row: { flexDirection: "row", gap: 10, marginTop: "auto", marginBottom: 18 },
  secondary: {
    flex: 1,
    height: 54,
    borderRadius: 999,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: { fontSize: 14, fontWeight: "900", color: "#111" },
});
