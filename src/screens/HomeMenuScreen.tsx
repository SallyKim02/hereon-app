import { useCallback, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";

type CategoryItem = { key: string; label: string; href: string };

const ITEMS: CategoryItem[] = [
  { key: "grounding", label: "그라운딩", href: "/grounding" },
  { key: "breathing", label: "호흡 연습", href: "/breathing" },
  { key: "cbt", label: "CBT", href: "/cbt" },
  { key: "education", label: "마음 알아보기", href: "/education" },
  { key: "emergency", label: "SOS", href: "/emergency" },
];

const HIGHLIGHT_MS = 1500;

export default function HomeMenuScreen() {
  const router = useRouter();

  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHighlight = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setPressedKey(null);
  }, []);

  useFocusEffect(
    useCallback(() => {
      clearHighlight();
      return () => clearHighlight();
    }, [clearHighlight])
  );

  const go = (it: CategoryItem) => {
    setPressedKey(it.key);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setPressedKey(null);
      timerRef.current = null;
    }, HIGHLIGHT_MS);
    router.push(it.href);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.screen}>
        {/* Top row */}
        <View style={styles.topRow}>
          <Pressable
            // ✅ 햄버거 → 마이페이지(/mypage)
            onPress={() => router.push("/mypage")}
            style={({ pressed }) => [styles.menuBtn, pressed && { opacity: 0.6 }]}
            hitSlop={10}
          >
            <Text style={styles.menuIcon}>≡</Text>
          </Pressable>
        </View>

        <Text style={styles.title}>HereOn</Text>

        <View style={styles.list}>
          {ITEMS.map((it) => {
            const selected = it.key === pressedKey;

            return (
              <Pressable
                key={it.key}
                onPress={() => go(it)}
                style={({ pressed }) => [
                  styles.card,
                  selected ? styles.cardSelected : styles.cardDefault,
                  pressed && { transform: [{ scale: 0.99 }], opacity: 0.96 },
                ]}
              >
                <Text style={[styles.cardText, selected && styles.cardTextSelected]}>
                  {it.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const BG = "#F2F0EE";
const DARK = "#3B3B3B";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  screen: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: 24,
    paddingTop: 10,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 6,
  },

  menuBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  menuIcon: { fontSize: 26, color: "#111" },

  title: {
    marginTop: 54,
    marginBottom: 18,
    textAlign: "center",
    fontSize: 45,
    fontWeight: "800",
    color: "#111",
    letterSpacing: -0.5,
  },

  list: { marginTop: 20, gap: 15, alignItems:"center" },

  card: {
    height: 72,
    width:300,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  cardDefault: { backgroundColor: "#FFFFFF" },
  cardSelected: { backgroundColor: DARK },

  cardText: { fontSize: 18, fontWeight: "700", color: "#111" },
  cardTextSelected: { color: "#FFFFFF" },
});
