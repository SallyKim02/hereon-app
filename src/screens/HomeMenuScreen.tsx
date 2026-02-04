import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

type CategoryItem = { key: string; label: string; href: string };

const ITEMS: CategoryItem[] = [
  { key: "grounding", label: "그라운딩", href: "/grounding" },
  { key: "breathing", label: "호흡 조절", href: "/breathing" },
  { key: "cbt", label: "CBT 카드", href: "/cbt" },
  { key: "videos", label: "영상 시청", href: "/videos" },
  { key: "emergency", label: "응급 키트", href: "/emergency" },
];

export default function HomeMenuScreen() {
  const router = useRouter();
  const selectedKey = "grounding";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.screen}>
        {/* Top row */}
        <View style={styles.topRow}>
          {/* pill: icon 제거하고 1/48만 */}

          <Pressable
            onPress={() => router.push("/my")}
            style={({ pressed }) => [styles.menuBtn, pressed && { opacity: 0.6 }]}
            hitSlop={10}
          >
            <Text style={styles.menuIcon}>≡</Text>
          </Pressable>
        </View>

        <Text style={styles.title}>카테고리</Text>

        <View style={styles.list}>
          {ITEMS.map((it) => {
            const selected = it.key === selectedKey;
            return (
              <Pressable
                key={it.key}
                onPress={() => router.push(it.href)}
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
    paddingTop: 10, // safeArea 아래에서 살짝만
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 6,
  },

  progressPill: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 1 },
    }),
  },
  progressText: { fontSize: 14, color: "#111", fontWeight: "600" },

  menuBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  menuIcon: { fontSize: 26, color: "#111" },

  title: {
    marginTop: 24,
    marginBottom: 18,
    textAlign: "center",
    fontSize: 28,
    fontWeight: "800",
    color: "#111",
    letterSpacing: -0.5,
  },

  list: { marginTop: 8, gap: 18 },

  card: {
    height: 76,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.10,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 10 },
      },
      android: { elevation: 3 },
    }),
  },
  cardDefault: { backgroundColor: "#FFFFFF" },
  cardSelected: { backgroundColor: DARK },

  cardText: { fontSize: 18, fontWeight: "700", color: "#111" },
  cardTextSelected: { color: "#FFFFFF" },
});
