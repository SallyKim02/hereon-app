import React, { useMemo, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

type Pair = { id: string; automatic: string; alternative: string };

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type FlashTone = "hint" | "good";
type Banner = { tone: FlashTone; text: string } | null;

type MatchState = "idle" | "selected" | "matched" | "wrong";

export default function CbtMatchingGameTab() {
  const SEED: Pair[] = useMemo(
    () => [
      { id: "p1", automatic: "나는 분명 망할 거야", alternative: "실수할 수도 있지만, 준비한 만큼 해볼 수 있어" },
      { id: "p2", automatic: "사람들이 다 나를 이상하게 볼 거야", alternative: "사람들은 각자 바쁘고, 모두가 나를 보진 않아" },
      { id: "p3", automatic: "이 불안은 절대 안 사라질 거야", alternative: "지금은 불편하지만, 감정은 시간이 지나면 변해" },
      { id: "p4", automatic: "나는 항상 이런 식이야", alternative: "항상은 아니야, 잘 해낸 경험도 있어" },
      { id: "p5", automatic: "이번엔 완벽해야 해", alternative: "완벽보다 충분히 괜찮게 하는 게 목표야" },
      { id: "p6", automatic: "내가 약해서 이런 거야", alternative: "지금 힘든 건 약함이 아니라 스트레스 반응일 수 있어" },
      { id: "p7", automatic: "지금 도망치면 끝이야", alternative: "잠깐 쉬고 다시 시도해도 괜찮아" },
      { id: "p8", automatic: "상대가 나를 싫어하는 게 분명해", alternative: "확실하지 않아, 다른 가능성도 있어" },
    ],
    []
  );

  const ROUNDS = 4;
  const PAIRS_PER_ROUND = 3;

  const [roundIndex, setRoundIndex] = useState(0);
  const [banner, setBanner] = useState<Banner>(null);

  // 라운드마다 3쌍 (seed로부터 뽑기)
  const roundPairs = useMemo(() => {
    const base = shuffle(SEED);
    const start = (roundIndex * PAIRS_PER_ROUND) % Math.max(1, base.length);
    return [...base, ...base].slice(start, start + PAIRS_PER_ROUND);
  }, [SEED, roundIndex]);

  const leftCards = useMemo(() => roundPairs.map((p) => ({ id: p.id, text: p.automatic })), [roundPairs]);

  // 오른쪽은 섞어서 보여주기(하지만 정답 id는 유지)
  const rightCards = useMemo(
    () => shuffle(roundPairs.map((p) => ({ id: p.id, text: p.alternative }))),
    [roundPairs]
  );

  // row 단위 렌더링 (좌우 줄맞춤)
  const rows = useMemo(() => {
    const max = Math.max(leftCards.length, rightCards.length);
    return Array.from({ length: max }).map((_, i) => ({
      left: leftCards[i],
      right: rightCards[i],
    }));
  }, [leftCards, rightCards]);

  const [leftPickedId, setLeftPickedId] = useState<string | null>(null);
  const [rightPickedId, setRightPickedId] = useState<string | null>(null);

  // 맞춘 쌍(초록 고정)
  const [matchedIds, setMatchedIds] = useState<Set<string>>(() => new Set());

  // 틀린 순간(빨강 1.5초) 표시용
  const [wrongPair, setWrongPair] = useState<{ leftId: string; rightId: string } | null>(null);
  const wrongTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function flash(tone: FlashTone, text: string) {
    setBanner({ tone, text });
    setTimeout(() => setBanner(null), 900);
  }

  function resetWrongSoon() {
    if (wrongTimer.current) clearTimeout(wrongTimer.current);
    wrongTimer.current = setTimeout(() => {
      setWrongPair(null);
      setLeftPickedId(null);
      setRightPickedId(null);
    }, 1500);
  }

  function onPickLeft(id: string) {
    if (matchedIds.has(id)) return; // 이미 맞춘 쌍은 잠금
    if (wrongPair) return; // 빨강 표시 중에는 입력 막기(원하면 제거 가능)

    setLeftPickedId((prev) => (prev === id ? null : id));
    setRightPickedId(null); // 왼쪽 새로 고르면 오른쪽은 리셋하는 편이 UX 안정적
  }

  function onPickRight(id: string) {
    if (matchedIds.has(id)) return;
    if (wrongPair) return;

    if (!leftPickedId) {
      flash("hint", "먼저 자동적 사고를 하나 골라줘");
      return;
    }

    // 오른쪽 선택 순간 매칭 판정
    const ok = leftPickedId === id;
    if (ok) {
      setMatchedIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      setLeftPickedId(null);
      setRightPickedId(null);
      flash("good", "좋아! 이 짝이 맞아");
      return;
    }

    // 틀렸으면 빨강 1.5초 → 리셋
    setRightPickedId(id);
    setWrongPair({ leftId: leftPickedId, rightId: id });
    resetWrongSoon();
  }

  function prevRound() {
    if (wrongTimer.current) clearTimeout(wrongTimer.current);
    setBanner(null);
    setWrongPair(null);
    setLeftPickedId(null);
    setRightPickedId(null);
    setMatchedIds(new Set());
    setRoundIndex((r) => (r - 1 + ROUNDS) % ROUNDS);
  }

  function nextRound() {
    if (wrongTimer.current) clearTimeout(wrongTimer.current);
    setBanner(null);
    setWrongPair(null);
    setLeftPickedId(null);
    setRightPickedId(null);
    setMatchedIds(new Set());
    setRoundIndex((r) => (r + 1) % ROUNDS);
  }

  function getCardVisualState(side: "left" | "right", id: string): MatchState {
    if (matchedIds.has(id)) return "matched";

    if (wrongPair) {
      if (side === "left" && wrongPair.leftId === id) return "wrong";
      if (side === "right" && wrongPair.rightId === id) return "wrong";
    }

    if (side === "left" && leftPickedId === id) return "selected";
    // 오른쪽은 “선택 표시”를 굳이 안 해도 되지만, 틀렸을 때 빨강을 보여주려면 rightPickedId를 유지
    if (side === "right" && rightPickedId === id) return "selected";

    return "idle";
  }

  const progress = (roundIndex + 1) / ROUNDS;

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.title}>CBT 매칭</Text>
        <Text style={styles.sub}>Round {roundIndex + 1} / {ROUNDS}</Text>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>

        {!!banner && (
          <View style={[styles.banner, banner.tone === "good" ? styles.bannerGood : styles.bannerHint]}>
            <Text style={styles.bannerText}>{banner.text}</Text>
          </View>
        )}
      </View>

      <View style={styles.headers}>
        <Text style={styles.colHeader}>자동적 사고</Text>
        <Text style={styles.colHeader}>대안적 사고</Text>
      </View>

      <View style={styles.grid}>
        {rows.map((row, idx) => {
          const left = row.left;
          const right = row.right;

          return (
            <View key={`row-${idx}`} style={styles.row}>
              <View style={styles.cell}>
                {left ? (
                  <Pressable
                    onPress={() => onPickLeft(left.id)}
                    style={[
                      styles.card,
                      getStyleByState(getCardVisualState("left", left.id), "left"),
                    ]}
                  >
                    <Text style={styles.cardText} numberOfLines={3}>
                      {left.text}
                    </Text>
                  </Pressable>
                ) : (
                  <View style={styles.cardPlaceholder} />
                )}
              </View>

              <View style={styles.cell}>
                {right ? (
                  <Pressable
                    onPress={() => onPickRight(right.id)}
                    style={[
                      styles.card,
                      getStyleByState(getCardVisualState("right", right.id), "right"),
                    ]}
                  >
                    <Text style={styles.cardText} numberOfLines={3}>
                      {right.text}
                    </Text>
                  </Pressable>
                ) : (
                  <View style={styles.cardPlaceholder} />
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* 버튼: 이전 | 다음 (크기/위치 동일 유지) */}
      <View style={styles.actions}>
        <Pressable style={[styles.btn, styles.btnGhost]} onPress={prevRound}>
          <Text style={[styles.btnText, styles.btnGhostText]}>이전</Text>
        </Pressable>

        <Pressable style={[styles.btn, styles.btnGhost]} onPress={nextRound}>
          <Text style={[styles.btnText, styles.btnGhostText]}>다음</Text>
        </Pressable>
      </View>

      <Text style={styles.help}>자동적 사고와 대안적 사고를 배워봐요 페이지.</Text>
    </View>
  );
}

const CARD_MIN_H = 96;

function getStyleByState(state: MatchState, side: "left" | "right") {
  if (state === "matched") return side === "left" ? styles.cardMatched : styles.cardMatched;
  if (state === "wrong") return styles.cardWrong;
  if (state === "selected") return styles.cardSelectedBlue;
  return null;
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 12 },
  top: { marginBottom: 10 },
  title: { fontSize: 18, fontWeight: "700" },
  sub: { marginTop: 4, color: "#666" },

  progressTrack: {
    marginTop: 10,
    height: 8,
    borderRadius: 99,
    backgroundColor: "#E9EEF5",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4C7DFF",
    borderRadius: 99,
  },

  banner: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  bannerGood: { backgroundColor: "#E8F7EF" },
  bannerHint: { backgroundColor: "#EEF3FF" },
  bannerText: { color: "#1E1E1E", fontWeight: "600" },

  headers: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
    marginBottom: 8,
  },
  colHeader: { flex: 1, color: "#666", fontWeight: "700" },

  grid: {},
  row: { flexDirection: "row", gap: 12, marginBottom: 12 },
  cell: { flex: 1 },

  card: {
    minHeight: CARD_MIN_H,
    borderRadius: 14,
    padding: 12,
    backgroundColor: "#F7F8FA",
    borderWidth: 1,
    borderColor: "#E6E8EE",
    justifyContent: "center",
  },
  cardText: { color: "#1E1E1E", fontSize: 14, lineHeight: 19 },

  cardSelectedBlue: { borderColor: "#4C7DFF", backgroundColor: "#EEF3FF" },
  cardMatched: { borderColor: "#27AE60", backgroundColor: "#E8F7EF" },
  cardWrong: { borderColor: "#EF4444", backgroundColor: "#FEE2E2" },

  cardPlaceholder: {
    minHeight: CARD_MIN_H,
    borderRadius: 14,
    backgroundColor: "transparent",
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
    alignItems: "center",
  },
  btn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnGhost: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E6E8EE" },
  btnText: { color: "#FFFFFF", fontWeight: "800" },
  btnGhostText: { color: "#111827" },

  help: { marginTop: 10, color: "#6B7280", fontSize: 12 },
});
