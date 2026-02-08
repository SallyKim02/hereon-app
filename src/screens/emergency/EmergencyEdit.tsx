import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
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

type SectionKey = "friends" | "local" | "hotline" | "fav" | "watch";

type Item = {
  id: string;
  title: string;
  detail?: string; // 전화번호/설명 등
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.card, shadow(2)]}>
      <View style={styles.cardHead}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{title}</Text>
          {!!subtitle && <Text style={styles.cardSub}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.cardBody}>{children}</View>
    </View>
  );
}

function RowItem({
  item,
  onEdit,
  onDelete,
}: {
  item: Item;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.itemRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        {!!item.detail && <Text style={styles.itemDetail}>{item.detail}</Text>}
      </View>

      <View style={styles.itemBtns}>
        <Pressable onPress={onEdit} hitSlop={10} style={styles.smallBtn}>
          <Text style={styles.smallBtnText}>수정</Text>
        </Pressable>
        <Pressable
          onPress={onDelete}
          hitSlop={10}
          style={[styles.smallBtn, styles.smallBtnDanger]}
        >
          <Text style={[styles.smallBtnText, styles.smallBtnTextDanger]}>삭제</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function EmergencyEdit() {
  const router = useRouter();

  // ✅ 일단은 "화면 스텁": 로컬 state로만 편집 (저장은 다음 단계에서 storage 연결)
  const [friends, setFriends] = useState<Item[]>([
    { id: uid(), title: "엄마", detail: "010-1234-5678" },
    { id: uid(), title: "친구 A", detail: "010-0000-0000" },
  ]);
  const [local, setLocal] = useState<Item[]>([
    { id: uid(), title: "정신건강복지센터", detail: "000-000-0000" },
    { id: uid(), title: "보건소", detail: "000-000-0000" },
  ]);
  const [hotline, setHotline] = useState<Item[]>([
    { id: uid(), title: "자살예방 상담전화", detail: "1393" },
    { id: uid(), title: "정신건강 위기상담", detail: "1577-0199" },
  ]);
  const [fav, setFav] = useState<Item[]>([
    { id: uid(), title: "유성병원" },
    { id: uid(), title: "충남대병원" },
  ]);
  const [watch, setWatch] = useState<Item[]>([
    { id: uid(), title: "응급 연락처 동기화" },
    { id: uid(), title: "SOS 설정 안내" },
  ]);

  const store = useMemo(() => {
    return {
      friends: { label: "지인 연락처", list: friends, set: setFriends },
      local: { label: "지역 도움 자원", list: local, set: setLocal },
      hotline: { label: "위기 핫라인", list: hotline, set: setHotline },
      fav: { label: "즐겨찾기", list: fav, set: setFav },
      watch: { label: "애플 워치", list: watch, set: setWatch },
    } as const;
  }, [friends, local, hotline, fav, watch]);

  const [active, setActive] = useState<SectionKey>("friends");

  // 편집 폼 state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");

  const activeLabel = store[active].label;
  const activeList = store[active].list;

  const startAdd = () => {
    setEditingId(null);
    setTitle("");
    setDetail("");
  };

  const startEdit = (it: Item) => {
    setEditingId(it.id);
    setTitle(it.title);
    setDetail(it.detail ?? "");
  };

  const save = () => {
    const t = title.trim();
    const d = detail.trim();

    if (!t) {
      Alert.alert("입력 필요", "이름/기관명을 입력해주세요.");
      return;
    }

    const setter = store[active].set;

    if (editingId) {
      setter((prev) =>
        prev.map((x) => (x.id === editingId ? { ...x, title: t, detail: d || undefined } : x))
      );
    } else {
      setter((prev) => [{ id: uid(), title: t, detail: d || undefined }, ...prev]);
    }

    // 폼 초기화
    setEditingId(null);
    setTitle("");
    setDetail("");
  };

  const remove = (id: string) => {
    Alert.alert("삭제할까요?", "이 항목을 삭제합니다.", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => store[active].set((prev) => prev.filter((x) => x.id !== id)),
      },
    ]);
  };

  const done = () => {
    // ✅ 지금은 스텁이라 저장 없이 뒤로가기
    // 다음 단계: AsyncStorage/Zustand로 저장 연결하면 여기서 persist
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.screen}>
        {/* Top */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>
          <Text style={styles.title}>편집하기</Text>
          <Pressable onPress={done} hitSlop={10} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
            <Text style={styles.done}>완료</Text>
          </Pressable>
        </View>

        {/* Section Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {(
            [
              ["friends", "지인"],
              ["local", "지역자원"],
              ["hotline", "핫라인"],
              ["fav", "즐겨찾기"],
              ["watch", "워치"],
            ] as Array<[SectionKey, string]>
          ).map(([k, label]) => {
            const on = k === active;
            return (
              <Pressable
                key={k}
                onPress={() => {
                  setActive(k);
                  startAdd();
                }}
                style={[styles.tab, on && styles.tabOn]}
                hitSlop={8}
              >
                <Text style={[styles.tabText, on && styles.tabTextOn]}>{label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          <SectionCard
            title={activeLabel}
            subtitle="추가/수정/삭제는 지금 화면에서만 반영되는 스텁입니다. (저장은 다음 단계에서 연결)"
          >
            {/* List */}
            {activeList.length === 0 ? (
              <Text style={styles.empty}>아직 항목이 없어요.</Text>
            ) : (
              activeList.map((it) => (
                <RowItem
                  key={it.id}
                  item={it}
                  onEdit={() => startEdit(it)}
                  onDelete={() => remove(it.id)}
                />
              ))
            )}
          </SectionCard>

          {/* Form */}
          <View style={[styles.card, shadow(2)]}>
            <View style={styles.cardHead}>
              <Text style={styles.cardTitle}>
                {editingId ? "항목 수정" : "항목 추가"}
              </Text>
              <Pressable onPress={startAdd} hitSlop={10} style={styles.ghostBtn}>
                <Text style={styles.ghostText}>초기화</Text>
              </Pressable>
            </View>

            <View style={styles.formRow}>
              <Text style={styles.label}>이름/기관</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="예: 유성병원 / 엄마"
                placeholderTextColor="rgba(17,17,17,0.35)"
                style={styles.input}
              />
            </View>

            <View style={styles.formRow}>
              <Text style={styles.label}>전화/설명</Text>
              <TextInput
                value={detail}
                onChangeText={setDetail}
                placeholder="예: 042-000-0000 / 메모"
                placeholderTextColor="rgba(17,17,17,0.35)"
                style={styles.input}
              />
            </View>

            <Pressable
              onPress={save}
              style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.9 }]}
            >
              <Text style={styles.saveText}>{editingId ? "수정 저장" : "추가하기"}</Text>
            </Pressable>
          </View>
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
  done: { fontSize: 16, fontWeight: "900", color: TEXT },

  tabsRow: { paddingTop: 10, paddingBottom: 8, gap: 10 },
  tab: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(17,17,17,0.12)",
    backgroundColor: "rgba(255,255,255,0.60)",
    alignItems: "center",
    justifyContent: "center",
  },
  tabOn: { backgroundColor: CARD, borderColor: "rgba(17,17,17,0.10)" },
  tabText: { fontWeight: "900", color: "rgba(17,17,17,0.55)" },
  tabTextOn: { color: TEXT },

  card: {
    marginTop: 12,
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: LINE,
    overflow: "hidden",
    padding: 14,
  },
  cardHead: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  cardTitle: { fontSize: 16, fontWeight: "900", color: TEXT },
  cardSub: { marginTop: 4, fontWeight: "700", color: SUB },

  cardBody: { marginTop: 10 },

  itemRow: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(17,17,17,0.10)",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  itemTitle: { fontWeight: "900", color: TEXT, fontSize: 15 },
  itemDetail: { marginTop: 4, fontWeight: "700", color: "rgba(17,17,17,0.70)" },

  itemBtns: { flexDirection: "row", gap: 8 },
  smallBtn: {
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(17,17,17,0.15)",
    backgroundColor: "rgba(17,17,17,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  smallBtnText: { fontWeight: "900", color: "rgba(17,17,17,0.80)" },
  smallBtnDanger: { backgroundColor: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.25)" },
  smallBtnTextDanger: { color: "rgba(239,68,68,0.95)" },

  empty: { fontWeight: "800", color: SUB, paddingVertical: 8 },

  formRow: { marginTop: 12 },
  label: { fontWeight: "900", color: TEXT, marginBottom: 8 },
  input: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(17,17,17,0.12)",
    backgroundColor: "rgba(255,255,255,0.70)",
    paddingHorizontal: 12,
    fontWeight: "800",
    color: TEXT,
  },

  saveBtn: {
    marginTop: 14,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#2F2F2F",
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: { color: "#fff", fontWeight: "900", fontSize: 16 },

  ghostBtn: {
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(17,17,17,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  ghostText: { fontWeight: "900", color: "rgba(17,17,17,0.70)" },
});