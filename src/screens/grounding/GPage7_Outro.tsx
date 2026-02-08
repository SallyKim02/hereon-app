import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import GHeader from "./GHeader";

const BG = "#F2F0EE";

export default function GPage7_Outro({
  onPrev,
  onDone,
}: {
  onPrev?: () => void;
  onDone: () => void;
}) {
  const router = useRouter();
  const [text, setText] = useState("");

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ✅ 완료는 언제든 가능 */}
      <GHeader title="그라운딩" onPrev={onPrev} onNext={onDone} />

      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: BG }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
          <Text style={styles.h1}>수고하셨습니다</Text>
          <Text style={styles.desc}>스스로 느낀 변화를 짧게 적어보세요</Text>

          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="예: 마음이 조금 가라앉았어요 / 호흡이 편해졌어요"
            style={styles.input}
            multiline
            textAlignVertical="top"
          />

          <View style={styles.row}>
            <Pressable style={styles.secondary} onPress={() => router.replace("/")}>
              <Text style={styles.secondaryText}>메인으로</Text>
            </Pressable>

            <Pressable style={styles.secondary} onPress={onDone}>
              <Text style={styles.secondaryText}>완료</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  screen: { flexGrow: 1, backgroundColor: BG, paddingHorizontal: 18, paddingTop: 10, paddingBottom: 18 },

  h1: { fontSize: 24, fontWeight: "900", color: "#111", marginTop: 8 },
  desc: { marginTop: 8, fontSize: 14, color: "#333" },

  input: {
    marginTop: 14,
    minHeight: 160,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E0DEDB",
    padding: 14,
    backgroundColor: "#FFF",
    fontSize: 14,
    lineHeight: 20,
  },

  row: { flexDirection: "row", gap: 10, marginTop: "auto", marginBottom: 18 },
  secondary: {
    flex: 1,
    height: 54,
    borderRadius: 999,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E8E6E3",
  },
  secondaryText: { fontSize: 14, fontWeight: "900", color: "#111" },
});
