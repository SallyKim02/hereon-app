import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const BG = "#F2F0EE";
const CARD = "#FFFFFF";
const LINE = "rgba(17,17,17,0.12)";
const TEXT = "#111111";
const SUB = "rgba(17,17,17,0.55)";

function shadow(elevation = 4) {
  return Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
    },
    android: { elevation },
    default: {},
  });
}

function AccordionRow({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.accRow}>
      <Pressable onPress={onToggle} style={styles.accHead} hitSlop={10}>
        <Text style={styles.accTitle}>{title}</Text>
        <Text style={styles.accChev}>{expanded ? "˄" : "˅"}</Text>
      </Pressable>
      {expanded && <View style={styles.accBody}>{children}</View>}
    </View>
  );
}

export default function EmergencyContactsScreen() {
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.screen}>
        {/* Top */}
        <View style={styles.topBar}>
          {/* ✅ 뒤로가기 유지 */}
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>

          <Text style={styles.title}>비상 연락처</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          <Text style={styles.sectionTitle}>비상 연락처</Text>

          <View style={[styles.card, shadow(2)]}>
            <AccordionRow
              title="지인 연락처"
              expanded={open === "friends"}
              onToggle={() => setOpen(open === "friends" ? null : "friends")}
            >
              <Text style={styles.bodyText}>• 엄마: 010-1234-5678</Text>
              <Text style={styles.bodyText}>• 친구 A: 010-0000-0000</Text>
            </AccordionRow>

            <View style={styles.divider} />

            <AccordionRow
              title="지역 도움 자원"
              expanded={open === "local"}
              onToggle={() => setOpen(open === "local" ? null : "local")}
            >
              <Text style={styles.bodyText}>• 정신건강복지센터: 000-000-0000</Text>
              <Text style={styles.bodyText}>• 보건소: 000-000-0000</Text>
            </AccordionRow>

            <View style={styles.divider} />

            <AccordionRow
              title="위기 핫라인"
              expanded={open === "hotline"}
              onToggle={() => setOpen(open === "hotline" ? null : "hotline")}
            >
              <Text style={styles.bodyText}>• 자살예방 상담전화: 1393</Text>
              <Text style={styles.bodyText}>• 정신건강 위기상담: 1577-0199</Text>
            </AccordionRow>

            <View style={styles.divider} />

            <AccordionRow
              title="즐겨찾기"
              expanded={open === "fav"}
              onToggle={() => setOpen(open === "fav" ? null : "fav")}
            >
              <Text style={styles.bodyText}>• 유성병원</Text>
              <Text style={styles.bodyText}>• 충남대병원</Text>
            </AccordionRow>
          </View>

          <View style={styles.hr} />

          <Text style={styles.sectionTitle}>기기 연계</Text>

          <View style={[styles.card, shadow(2)]}>
            <AccordionRow
              title="애플 워치"
              expanded={open === "watch"}
              onToggle={() => setOpen(open === "watch" ? null : "watch")}
            >
              <Text style={styles.bodyText}>• 응급 연락처 동기화</Text>
              <Text style={styles.bodyText}>• SOS 설정 안내</Text>
            </AccordionRow>
          </View>

          {/* ✅ 여기서 편집 화면으로 이동 */}
          <Pressable
            style={[styles.editBtn, shadow(3)]}
            onPress={() => router.push("/emergency/edit")}
          >
            <Text style={styles.editText}>편집하기</Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  screen: { flex: 1, backgroundColor: BG, paddingHorizontal: 18 },

  topBar: {
    paddingTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backArrow: { fontSize: 34, color: TEXT, width: 28 },
  title: { fontSize: 22, fontWeight: "900", color: TEXT },

  sectionTitle: { marginTop: 14, fontSize: 18, fontWeight: "900", color: TEXT },

  card: {
    marginTop: 12,
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: LINE,
    overflow: "hidden",
  },

  accRow: {},
  accHead: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  accTitle: { fontSize: 16, fontWeight: "900", color: TEXT },
  accChev: { fontSize: 18, fontWeight: "900", color: SUB },

  accBody: { paddingHorizontal: 16, paddingBottom: 14 },
  bodyText: { marginTop: 8, color: TEXT, fontWeight: "700" },

  divider: { height: 1, backgroundColor: "rgba(17,17,17,0.10)" },
  hr: { height: 1, backgroundColor: "rgba(17,17,17,0.20)", marginTop: 18 },

  editBtn: {
    marginTop: 26,
    alignSelf: "center",
    height: 48,
    paddingHorizontal: 26,
    borderRadius: 14,
    backgroundColor: "#2F2F2F",
    alignItems: "center",
    justifyContent: "center",
  },
  editText: { color: "#fff", fontWeight: "900", fontSize: 16 },
});