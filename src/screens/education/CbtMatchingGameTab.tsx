import { useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Pair = { id: string; auto: string; alt: string };

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Banner =
  | { type: "ok"; text: string }
  | { type: "bad"; text: string };

export default function CbtMatchingGameTab() {
  const PAIRS: Pair[] = useMemo(
    () => [
      {
        id: "p1",
        auto: "심장이 빨리 뛰니 큰일이야",
        alt: "심박 상승은 생리적 반응일 뿐, 위험 신호가 아닐 수 있어",
      },
      {
        id: "p2",
        auto: "또 분명 발작이 올 거야",
        alt: "이번에는 다를 수도 있어. 호흡과 현재 행동에 집중해보자",
      },
      {
        id: "p3",
        auto: "나는 불안하면 안 돼",
        alt: "불안은 경험할 수 있는 감정이야. 조절 연습을 하면 돼",
      },
    ],
    []
  );

  // 라운드(지금은 1라운드 MVP). 나중에 3라운드로 확장 가능.
  const [round] = useState(1);

  const [autoOrder, setAutoOrder] = useState(() => shuffle(PAIRS.map((p) => p.id)));
  const [altOrder, setAltOrder] = useState(() => shuffle(PAIRS.map((p) => p.id)));

  const [pickedAuto, setPickedAuto] = useState<string | null>(null);
  const [pickedAlt, setPickedAlt] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);

  // 게임성 상태(점수/콤보/피드백)
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [banner, setBanner] = useState<Banner | null>(null);
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showBanner = (b: Banner) => {
    setBanner(b);
    if (bannerTimer.current) clearTimeout(bannerTimer.current);
    bannerTimer.current = setTimeout(() => setBanner(null), 1200);
  };

  const resetRound = () => {
    setAutoOrder(shuffle(PAIRS.map((p) => p.id)));
    setAltOrder(shuffle(PAIRS.map((p) => p.id)));
    setPickedAuto(null);
    setPickedAlt(null);
    setMatched([]);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setBanner(null);
  };

  const onShuffle = () => {
    setAutoOrder(shuffle(PAIRS.map((p) => p.id)));
    setAltOrder(shuffle(PAIRS.map((p) => p.id)));
    setPickedAuto(null);
    setPickedAlt(null);
    showBanner({ type: "ok", text: "카드를 섞었어요" });
  };

  const applyCorrect = () => {
    setCombo((prevCombo) => {
      const nextCombo = prevCombo + 1;
      setBestCombo((b) => Math.max(b, nextCombo));

      // 점수 규칙: 기본 +10, 콤보 보너스(2콤보부터 +2씩)
      const bonus = nextCombo >= 2 ? (nextCombo - 1) * 2 : 0;
      const gain = 10 + bonus;
      setScore((s) => s + gain);

      showBanner({ type: "ok", text: `정답! +${gain} (콤보 ${nextCombo})` });
      return nextCombo;
    });
  };

  const applyWrong = () => {
    setScore((s) => Math.max(0, s - 2));
    setCombo(0);
    showBanner({ type: "bad", text: "다시 시도해요 (점수 -2)" });
  };

  const tryMatch = (a: string | null, b: string | null) => {
    if (!a || !b) return;

    if (a === b) {
      setMatched((prev) => (prev.includes(a) ? prev : [...prev, a]));
      setPickedAuto(null);
      setPickedAlt(null);
      applyCorrect();
    } else {
      // 오답일 때: 선택 흐름은 유지하되, 사용자가 바로 다시 고를 수 있게 alt만 해제
      setPickedAlt(null);
      applyWrong();
    }
  };

  const done = matched.length === PAIRS.length;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.topRow}>
        <Text style={styles.progress}>라운드 {round} / 1</Text>

        <View style={styles.scoreBox}>
          <Text style={styles.scoreText}>점수 {score}</Text>
          <Text style={styles.comboText}>콤보 {combo} (최고 {bestCombo})</Text>
        </View>

        <Pressable onPress={onShuffle} style={styles.shuffleBtn}>
          <Text style={styles.shuffleText}>카드 섞기</Text>
        </Pressable>
      </View>

      {!!banner && (
        <View style={[styles.banner, banner.type === "ok" ? styles.bannerOk : styles.bannerBad]}>
          <Text style={styles.bannerText}>{banner.text}</Text>
        </View>
      )}

      <Text style={styles.hint}>자동적 사고(왼쪽)와 대안적 사고(오른쪽)를 맞춰보세요.</Text>

      <View style={styles.grid}>
        <View style={styles.col}>
          <Text style={styles.colTitle}>자동적 사고</Text>
          {autoOrder.map((id, i) => {
            const p = PAIRS.find((x) => x.id === id)!;
            const locked = matched.includes(id);
            const on = pickedAuto === id;

            return (
              <Pressable
                key={`${id}-${i}`}
                disabled={locked}
                onPress={() => {
                  setPickedAuto(id);
                  tryMatch(id, pickedAlt);
                }}
                style={[styles.card, on && styles.cardOn, locked && styles.cardLocked]}
              >
                <Text style={[styles.cardText, on && styles.cardTextOn]}>{p.auto}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.col}>
          <Text style={styles.colTitle}>대안적 사고</Text>
          {altOrder.map((id, i) => {
            const p = PAIRS.find((x) => x.id === id)!;
            const locked = matched.includes(id);
            const on = pickedAlt === id;

            return (
              <Pressable
                key={`${id}-${i}`}
                disabled={locked}
                onPress={() => {
                  setPickedAlt(id);
                  tryMatch(pickedAuto, id);
                }}
                style={[styles.card, on && styles.cardOn, locked && styles.cardLocked]}
              >
                <Text style={[styles.cardText, on && styles.cardTextOn]}>{p.alt}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {done ? (
        <View style={styles.doneBox}>
          <Text style={styles.doneTitle}>완료!</Text>
          <Text style={styles.doneDesc}>총점 {score}점 · 최고 콤보 {bestCombo}</Text>

          <Pressable onPress={resetRound} style={styles.retryBtn}>
            <Text style={styles.retryText}>한 번 더 하기</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.footerHint}>
          맞춘 카드: {matched.length} / {PAIRS.length}
        </Text>
      )}
    </View>
  );
}

const DARK = "#3B3B3B";
const CARD = "#FFFFFF";

const styles = StyleSheet.create({
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  progress: { color: DARK, fontWeight: "900" },

  scoreBox: { alignItems: "center" },
  scoreText: { color: DARK, fontWeight: "900" },
  comboText: { color: "rgba(0,0,0,0.55)", fontWeight: "800", fontSize: 12, marginTop: 2 },

  shuffleBtn: { backgroundColor: "rgba(0,0,0,0.06)", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999 },
  shuffleText: { color: DARK, fontWeight: "900" },

  banner: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  bannerOk: { backgroundColor: "rgba(59,59,59,0.12)" },
  bannerBad: { backgroundColor: "rgba(255,0,0,0.10)" },
  bannerText: { color: DARK, fontWeight: "900", textAlign: "center" },

  hint: { color: "rgba(0,0,0,0.55)", fontWeight: "700", marginBottom: 10 },

  grid: { flexDirection: "row", gap: 10, flex: 1 },
  col: { flex: 1, gap: 10 },
  colTitle: { color: DARK, fontWeight: "900", marginBottom: 2 },

  card: { backgroundColor: CARD, borderRadius: 18, padding: 12 },
  cardOn: { backgroundColor: DARK },
  cardLocked: { opacity: 0.45 },
  cardText: { color: DARK, fontWeight: "800", lineHeight: 18 },
  cardTextOn: { color: "#fff" },

  footerHint: { marginTop: 10, color: "rgba(0,0,0,0.55)", fontWeight: "800" },

  doneBox: {
    marginTop: 12,
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
  },
  doneTitle: { color: DARK, fontWeight: "900", fontSize: 16 },
  doneDesc: { marginTop: 6, color: "rgba(0,0,0,0.55)", fontWeight: "800" },

  retryBtn: {
    marginTop: 12,
    backgroundColor: DARK,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 999,
  },
  retryText: { color: "#fff", fontWeight: "900" },
});
