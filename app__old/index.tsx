
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

type CategoryItem = {
  key: string;
  label: string;
  href: string;
};

const ITEMS: CategoryItem[] = [
  { key: "grounding", label: "그라운딩", href: "/grounding" },
  { key: "breathing", label: "호흡 조절", href: "/breathing" },
  { key: "cbt", label: "CBT 카드", href: "/cbt" },
  { key: "videos", label: "영상 시청", href: "/videos" },
  { key: "emergency", label: "응급 키트", href: "/emergency" },
];

export default function CategoryScreen() {
  const router = useRouter();
  const selectedKey = "grounding";

  return (
    <View style={styles.screen}>
      <View style={styles.topRow}>
        <View style={styles.progressPill}>
          <Text style={styles.progressIcon}>▦</Text>
          <Text style={styles.progressText}>1/48</Text>
        </View>

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
                pressed && { transform: [{ scale: 0.99 }], opacity: 0.95 },
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
  );
}

const BG = "#F2F0EE";
const DARK = "#3B3B3B";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  progressPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  progressIcon: { fontSize: 14, color: "#111" },
  progressText: { fontSize: 14, color: "#111", fontWeight: "600" },

  menuBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  menuIcon: { fontSize: 26, color: "#111" },

  title: {
    marginTop: 28,
    marginBottom: 22,
    textAlign: "center",
    fontSize: 28,
    fontWeight: "800",
    color: "#111",
    letterSpacing: -0.5,
  },

  list: {
    marginTop: 6,
    gap: 18,
  },

  card: {
    height: 76,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  cardDefault: { backgroundColor: "#FFFFFF" },
  cardSelected: { backgroundColor: DARK },

  cardText: { fontSize: 18, fontWeight: "700", color: "#111" },
  cardTextSelected: { color: "#FFFFFF" },
});

