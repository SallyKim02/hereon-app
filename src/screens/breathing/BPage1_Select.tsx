import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Mode = "circle" | "bar";
type Phase = "inhale" | "hold" | "exhale";
type PresetKey = "7428" | "425";

type Preset = {
  key: PresetKey;
  label: string;
  inhale: number;
  hold: number;
  exhale: number;
};

const BG = "#F2F0EE";
const TEXT = "#111111";
const SUB = "rgba(17,17,17,0.65)";
const LINE = "rgba(17,17,17,0.18)";
const DARK_BTN = "#2F2F2F";

const PRESETS: Preset[] = [
  { key: "425", label: "4-2-5", inhale: 4, hold: 2, exhale: 5 },
  { key: "7428", label: "7-4-8", inhale: 7, hold: 4, exhale: 8 },
];

const MIN_INHALE = 1;
const MIN_HOLD = 0;
const MIN_EXHALE = 2;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function shadow(elevation = 3) {
  return Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
    },
    android: { elevation },
    default: {},
  });
}

function Segmented({
  value,
  onChange,
}: {
  value: Mode;
  onChange: (v: Mode) => void;
}) {
  return (
    <View style={[styles.segmentWrap, shadow(2)]}>
      <Pressable
        onPress={() => onChange("circle")}
        style={[styles.segmentItem, value === "circle" && styles.segmentOn]}
        hitSlop={8}
      >
        <Text
          style={[styles.segmentText, value === "circle" && styles.segmentTextOn]}
        >
          원
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onChange("bar")}
        style={[styles.segmentItem, value === "bar" && styles.segmentOn]}
        hitSlop={8}
      >
        <Text style={[styles.segmentText, value === "bar" && styles.segmentTextOn]}>
          막대
        </Text>
      </Pressable>
    </View>
  );
}

function StepperBox({
  label,
  value,
  onInc,
  onDec,
}: {
  label: string;
  value: number;
  onInc: () => void;
  onDec: () => void;
}) {
  return (
    <View style={styles.stepCol}>
      <Text style={styles.smallLabel}>{label}</Text>

      {/* ✅ 숫자 "진짜" 중앙정렬: 가운데 텍스트 + 좌우 버튼 absolute */}
      <View style={styles.stepBox}>
        <Pressable
          onPress={onDec}
          hitSlop={10}
          style={({ pressed }) => [
            styles.lrBtn,
            { left: 0 },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={styles.lrArrow}>‹</Text>
        </Pressable>

        <Text style={styles.stepValue}>{value}</Text>

        <Pressable
          onPress={onInc}
          hitSlop={10}
          style={({ pressed }) => [
            styles.lrBtn,
            { right: 0 },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={styles.lrArrow}>›</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function BPage1_Select() {
  const [mode, setMode] = useState<Mode>("circle");
  const [presetKey, setPresetKey] = useState<PresetKey>("425");

  const preset = useMemo(
    () => PRESETS.find((p) => p.key === presetKey) ?? PRESETS[0],
    [presetKey]
  );

  const [dur, setDur] = useState<{ inhale: number; hold: number; exhale: number }>(
    () => ({
      inhale: preset.inhale,
      hold: preset.hold,
      exhale: preset.exhale,
    })
  );

  useEffect(() => {
    setDur({ inhale: preset.inhale, hold: preset.hold, exhale: preset.exhale });
  }, [preset.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>("inhale");
  const [remaining, setRemaining] = useState(0);

  // 원 변화폭 유지: 0.76 -> 1.06
  const scale = useRef(new Animated.Value(0.76)).current;
  const bar = useRef(new Animated.Value(0)).current;

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (phaseRef.current) clearTimeout(phaseRef.current);
    tickRef.current = null;
    phaseRef.current = null;
  };

  const secondsFor = (p: Phase) =>
    p === "inhale" ? dur.inhale : p === "hold" ? dur.hold : dur.exhale;

  const animatePhase = (p: Phase, sec: number) => {
    const ms = Math.max(0, sec) * 1000;

    if (mode === "circle") {
      if (p === "inhale") {
        Animated.timing(scale, {
          toValue: 1.06,
          duration: ms,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }).start();
      } else if (p === "hold") {
        scale.setValue(1.06);
      } else {
        Animated.timing(scale, {
          toValue: 0.76,
          duration: ms,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }).start();
      }
    } else {
      if (p === "inhale") {
        Animated.timing(bar, {
          toValue: 1,
          duration: ms,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false,
        }).start();
      } else if (p === "hold") {
        bar.setValue(1);
      } else {
        Animated.timing(bar, {
          toValue: 0,
          duration: ms,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false,
        }).start();
      }
    }
  };

  const nextPhase = (p: Phase): Phase =>
    p === "inhale" ? "hold" : p === "hold" ? "exhale" : "inhale";

  const runPhase = (p: Phase) => {
    const sec = secondsFor(p);
    setPhase(p);
    setRemaining(sec);

    if (mode === "circle") {
      if (p === "inhale") scale.setValue(0.76);
      if (p === "hold") scale.setValue(1.06);
      if (p === "exhale") scale.setValue(1.06);
    } else {
      if (p === "inhale") bar.setValue(0);
      if (p === "hold") bar.setValue(1);
      if (p === "exhale") bar.setValue(1);
    }

    animatePhase(p, sec);

    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      setRemaining((r) => (r <= 0 ? 0 : r - 1));
    }, 1000);

    if (phaseRef.current) clearTimeout(phaseRef.current);
    phaseRef.current = setTimeout(
      () => runPhase(nextPhase(p)),
      Math.max(0, sec) * 1000
    );
  };

  useEffect(() => {
    if (running) {
      clearTimers();
      runPhase("inhale");
      return;
    }
    clearTimers();
    setRemaining(0);
    scale.stopAnimation();
    bar.stopAnimation();
    scale.setValue(0.76);
    bar.setValue(0);
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (running) setRunning(false);
    scale.setValue(0.76);
    bar.setValue(0);
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!running) return;
    setRunning(false);
    const t = setTimeout(() => setRunning(true), 0);
    return () => clearTimeout(t);
  }, [dur.inhale, dur.hold, dur.exhale]); // eslint-disable-line react-hooks/exhaustive-deps

  const change = (key: Phase, delta: number) => {
    setDur((prev) => {
      let inhale = prev.inhale;
      let hold = prev.hold;
      let exhale = prev.exhale;

      if (key === "inhale") inhale = clamp(inhale + delta, MIN_INHALE, 60);
      if (key === "hold") hold = clamp(hold + delta, MIN_HOLD, 60);
      if (key === "exhale") exhale = clamp(exhale + delta, MIN_EXHALE, 60);

      // exhale >= inhale + 1
      if (exhale < inhale + 1) exhale = inhale + 1;

      return { inhale, hold, exhale };
    });
  };

  const barWidth = 280;
  const barHeight = 10;

  const barFillW = bar.interpolate({
    inputRange: [0, 1],
    outputRange: [0, barWidth],
  });

  const onBack = () => {
    // expo-router라면 여기서 router.back()으로 연결하면 됨
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.wrap}>
        <View style={styles.topBar}>
          <Pressable
            onPress={onBack}
            hitSlop={12}
            style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>
          <Text style={styles.topTitle}>호흡 조절</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.segmentCenter}>
          <Segmented value={mode} onChange={setMode} />
        </View>

        <View style={styles.visualArea}>
          {mode === "circle" ? (
            <View style={styles.circleWrap}>
              <Animated.View style={[styles.circle, { transform: [{ scale }] }]} />
              <View style={styles.circleCenterText}>
                <Text style={styles.circleNum}>
                  {remaining > 0 ? String(remaining) : ""}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.barWrap}>
              <View style={[styles.barTrack, { width: barWidth, height: barHeight }]}>
                <Animated.View
                  style={[styles.barFill, { width: barFillW, height: barHeight }]}
                />
              </View>
              <Text style={styles.circleNum}>{remaining > 0 ? String(remaining) : ""}</Text>
            </View>
          )}
        </View>

        {/* 원-상태 안내 간격 더 벌림 유지 */}
        <Text style={styles.phaseLabel}>
          {phase === "inhale" ? "들이마시기" : phase === "hold" ? "정지" : "내쉬기"}
        </Text>

        <View style={styles.stepRow}>
          <StepperBox
            label="들이마시기"
            value={dur.inhale}
            onInc={() => change("inhale", +1)}
            onDec={() => change("inhale", -1)}
          />
          <StepperBox
            label="정지"
            value={dur.hold}
            onInc={() => change("hold", +1)}
            onDec={() => change("hold", -1)}
          />
          <StepperBox
            label="내쉬기"
            value={dur.exhale}
            onInc={() => change("exhale", +1)}
            onDec={() => change("exhale", -1)}
          />
        </View>

        <View style={styles.presetRow}>
          <Pressable
            onPress={() => setPresetKey("425")}
            style={[styles.presetBtn, presetKey === "425" && styles.presetBtnOn, shadow(2)]}
          >
            <Text style={[styles.presetText, presetKey === "425" && styles.presetTextOn]}>
              4-2-5
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setPresetKey("7428")}
            style={[styles.presetBtn, presetKey === "7428" && styles.presetBtnOn, shadow(2)]}
          >
            <Text style={[styles.presetText, presetKey === "7428" && styles.presetTextOn]}>
              7-4-8
            </Text>
          </Pressable>
        </View>

        <View style={styles.bottomArea}>
          <Pressable
            onPress={() => setRunning((v) => !v)}
            style={({ pressed }) => [
              styles.mainBtn,
              { backgroundColor: DARK_BTN },
              shadow(4),
              pressed && { opacity: 0.95, transform: [{ scale: 0.995 }] },
            ]}
          >
            <Text style={styles.mainBtnText}>{running ? "STOP" : "START"}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  wrap: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 6,
    backgroundColor: BG,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  backArrow: {
    fontSize: 34,
    color: TEXT,
    lineHeight: 34,
    marginTop: -2,
    width: 24,
    textAlign: "left",
  },
  topTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: TEXT,
  },

  segmentCenter: {
    marginTop: 18,
    alignItems: "center",
  },

  segmentWrap: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    padding: 4,
    borderWidth: 1,
    borderColor: "rgba(17,17,17,0.12)",
  },
  segmentItem: {
    minWidth: 84,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentOn: {
    backgroundColor: "rgba(17,17,17,0.14)",
  },
  segmentText: {
    color: "rgba(17,17,17,0.55)",
    fontWeight: "800",
  },
  segmentTextOn: {
    color: TEXT,
  },

  visualArea: {
    marginTop: 26,
    alignItems: "center",
    justifyContent: "center",
    height: 300,
  },

  circleWrap: {
    width: 280,
    height: 280,
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    width: 260,
    height: 260,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: LINE,
    backgroundColor: "transparent",
  },
  circleCenterText: {
    position: "absolute",
    width: 280,
    height: 280,
    alignItems: "center",
    justifyContent: "center",
  },
  circleNum: {
    fontSize: 18,
    fontWeight: "500",
    color: TEXT,
  },

  barWrap: {
    width: 280,
    height: 280,
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
  },
  barTrack: {
    backgroundColor: "rgba(17,17,17,0.10)",
    borderRadius: 999,
    overflow: "hidden",
  },
  barFill: {
    backgroundColor: "rgba(17,17,17,0.22)",
    borderRadius: 999,
  },

  phaseLabel: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "700",
    color: TEXT,
    textAlign: "center",
  },

  stepRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  stepCol: {
    width: 92,
    alignItems: "center",
    gap: 10,
  },

  smallLabel: {
    color: SUB,
    fontWeight: "700",
  },

  // ✅ 그림자 없음
  // ✅ 숫자 중앙정렬(absolute 버튼이라 항상 정중앙)
  stepBox: {
    width: 92,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(17,17,17,0.10)",
    justifyContent: "center",
    alignItems: "center",
  },

  stepValue: {
    color: "#111111",
    fontWeight: "900",
    fontSize: 18,
    lineHeight: 20,
    textAlign: "center",
    includeFontPadding: false,
    textAlignVertical: "center",
  },

  lrBtn: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  lrArrow: {
    color: "#111111",
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 22,
    marginTop: -1,
  },

  presetRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  presetBtn: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 12,
    backgroundColor: "rgba(17,17,17,0.35)",
  },
  presetBtnOn: {
    backgroundColor: "rgba(17,17,17,0.55)",
  },
  presetText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  presetTextOn: {
    color: "#FFFFFF",
  },

  bottomArea: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 26,
  },

  mainBtn: {
    alignSelf: "center",
    minWidth: 320,
    paddingVertical: 19,
    paddingHorizontal: 44,
    borderRadius: 12,
  },
  mainBtnText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
});
