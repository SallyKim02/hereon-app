import { useMemo, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { VISUAL_SCENES } from "../../features/grounding/visualScenes";
import GHeader from "./GHeader";

type Props = { onPrev?: () => void; onContinue?: () => void };

function randIndex(max: number, exclude?: number) {
  if (max <= 1) return 0;
  let n = Math.floor(Math.random() * max);
  if (exclude !== undefined && n === exclude) n = (n + 1) % max;
  return n;
}

const BG = "#F2F0EE";
const DARK = "#3B3B3B";
const CARD = "#FFFFFF";
const W = Dimensions.get("window").width;

export default function GPage2_Visual({ onPrev, onContinue }: Props) {
  // ✅ sceneIndex를 실제로 사용
  const [sceneIndex, setSceneIndex] = useState(0);
  const scene = VISUAL_SCENES[sceneIndex];

  const [selected, setSelected] = useState<string[]>([]);
  const [zoomOpen, setZoomOpen] = useState(false);

  const remaining = 5 - selected.length;
  const tiles = useMemo(() => scene.tiles20, [scene]);

  const toggle = (label: string) => {
    setSelected((prev) => {
      if (prev.includes(label)) return prev.filter((x) => x !== label);
      if (prev.length >= 5) return prev;
      return [...prev, label];
    });
  };

  // ✅ 여기만 수정됨: "이미지 교체" = scene 교체
  const randomScene = () => {
    const next = randIndex(VISUAL_SCENES.length, sceneIndex);
    setSceneIndex(next);
    setSelected([]); // 타일 선택 초기화
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <GHeader title="그라운딩" onPrev={onPrev} onNext={onContinue} />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <Text style={styles.title}>무엇이 보이나요?</Text>
          <Pressable onPress={randomScene} style={styles.ghostBtn} hitSlop={10}>
            <Text style={styles.ghostText}>이미지 교체</Text>
          </Pressable>
        </View>

        <Text style={styles.desc}>
          지금 사진에서 보이는 물건 5개를 선택해보세요. (남은 선택 {remaining}/5)
        </Text>

        <Pressable onPress={() => setZoomOpen(true)} style={styles.imageCard}>
          <Image source={scene.image} style={styles.image} resizeMode="cover" />
          <View style={styles.zoomHint}>
            <Text style={styles.zoomHintText}>탭해서 확대</Text>
          </View>
        </Pressable>

        <View style={styles.grid}>
          {tiles.map((label) => {
            const on = selected.includes(label);
            const disabled = !on && selected.length >= 5;
            return (
              <Pressable
                key={label}
                onPress={() => toggle(label)}
                disabled={disabled}
                style={[styles.tile, on && styles.tileOn, disabled && styles.tileDisabled]}
              >
                <Text style={[styles.tileText, on && styles.tileTextOn]} numberOfLines={1}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable onPress={() => onContinue?.()} style={styles.primaryBtn}>
          <Text style={styles.primaryText}>완료</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={zoomOpen} animationType="fade" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBody}>
            <ScrollView
              style={styles.modalScroll}
              maximumZoomScale={3}
              minimumZoomScale={1}
              contentContainerStyle={styles.modalContent}
            >
              <Image source={scene.image} style={styles.modalImage} resizeMode="contain" />
            </ScrollView>
          </View>

          <View style={styles.modalBottomBar}>
            <Pressable onPress={() => setZoomOpen(false)} style={styles.modalCloseBtn} hitSlop={10}>
              <Text style={styles.modalCloseText}>닫기</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* styles 그대로 */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 24 },

  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  title: { fontSize: 20, fontWeight: "900", color: DARK },
  desc: { color: "rgba(0,0,0,0.60)", fontWeight: "700", marginBottom: 12 },

  ghostBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, backgroundColor: "rgba(0,0,0,0.06)" },
  ghostText: { color: DARK, fontWeight: "900" },

  imageCard: { backgroundColor: CARD, borderRadius: 18, padding: 10, marginBottom: 12 },
  image: { width: "100%", height: 240, borderRadius: 14 },
  zoomHint: { position: "absolute", right: 16, bottom: 16, backgroundColor: "rgba(0,0,0,0.55)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  zoomHintText: { color: "#fff", fontWeight: "900", fontSize: 12 },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 14,
  },
  tile: {
    width: (W - 18 * 2 - 8 * 4) / 5,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: CARD,
    alignItems: "center",
    justifyContent: "center",
  },
  tileOn: { backgroundColor: DARK },
  tileDisabled: { opacity: 0.5 },
  tileText: { color: DARK, fontWeight: "900", fontSize: 12 },
  tileTextOn: { color: "#fff" },

  primaryBtn: { backgroundColor: DARK, paddingVertical: 14, borderRadius: 18, alignItems: "center" },
  primaryText: { color: "#fff", fontWeight: "900", fontSize: 16 },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.92)" },
  modalBody: { flex: 1, paddingTop: 8 },
  modalScroll: { flex: 1 },
  modalContent: { padding: 12, alignItems: "center", justifyContent: "center" },
  modalImage: { width: "100%", height: 520 },

  modalBottomBar: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    paddingTop: 10,
    backgroundColor: "rgba(0,0,0,0.92)",
  },
  modalCloseBtn: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalCloseText: { color: "#fff", fontWeight: "900", fontSize: 16 },
});