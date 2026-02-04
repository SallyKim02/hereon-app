import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  Animated,
  Easing,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export type VisualGuide = "circle" | "bar";
export type Preset = "425" | "478" | "custom";
type Phase = "ready" | "inhale" | "hold" | "exhale";
type BreathConfig = { inhale: number; hold: number; exhale: number };

const presets: Record<Exclude<Preset, "custom">, BreathConfig> = {
  "425": { inhale: 4, hold: 2, exhale: 5 },
  "478": { inhale: 4, hold: 7, exhale: 8 },
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function BPage1_Select({
  guide,
  onChangeGuide,
}: {
  guide: VisualGuide;
  onChangeGuide: (g: VisualGuide) => void;
}) {
  // ✅ 가이드가 위 / 호흡법(프리셋+커스텀)이 아래
  const [preset, setPreset] = useState<Preset>("425");
  const [config, setConfig] = useState<BreathConfig>(presets["425"]);

  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>("ready");
  const [left, setLeft] = useState(0);

  // 부드러운 애니메이션 진행률(0~1)
  const prog = useRef(new Animated.Value(0)).current;
  const tickRef = useRef<NodeJS.Timeout | null>(null);

  const phaseLabel =
    phase === "ready"
      ? "준비"
      : phase === "inhale"
        ? "들이마시기"
        : phase === "hold"
          ? "멈추기"
          : "내쉬기";

  const currentPhaseSeconds = useMemo(() => {
    if (phase === "inhale") return config.inhale;
    if (phase === "hold") return config.hold;
    if (phase === "exhale") return config.exhale;
    return 0;
  }, [phase, config]);

  const startPhase = (next: Exclude<Phase, "ready">) => {
    setPhase(next);
    const seconds = next === "inhale" ? config.inhale : next === "hold" ? config.hold : config.exhale;
    setLeft(seconds);

    // ✅ 부드러운 애니메이션: 0 -> 1을 단계 시간만큼
    prog.setValue(0);
    Animated.timing(prog, {
      toValue: 1,
      duration: seconds * 1000,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: guide === "circle", // circle은 transform이라 native driver OK
    }).start();
  };

  const stop = () => {
    setRunning(false);
    setPhase("ready");
    setLeft(0);
    prog.stopAnimation();
    prog.setValue(0);
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = null;
  };

  const start = () => {
    setRunning(true);
    startPhase("inhale");
  };

  const goNextPhase = () => {
    if (phase === "inhale") return startPhase("hold");
    if (phase === "hold") return startPhase("exhale");
    return startPhase("inhale"); // 한 세트 끝나면 반복(기본)
  };

  // 1초 카운트다운(텍스트 숫자만)
  useEffect(() => {
    if (!running) return;

    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      setLeft((v) => {
        if (v <= 1) {
          setTimeout(goNextPhase, 0);
          return 0;
        }
        return v - 1;
      });
    }, 1000);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phase, config, guide]);

  // preset 바뀌면 config 갱신 + 리셋
  useEffect(() => {
    if (preset === "custom") return;
    setConfig(presets[preset]);
    stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset]);

  // guide 바뀌면 애니메이션 드라이버 조건 때문에 리셋(안전)
  useEffect(() => {
    stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guide]);

  const setCustom = (partial: Partial<BreathConfig>) => {
    setPreset("custom");
    setConfig((prev) => ({
      inhale: clamp(partial.inhale ?? prev.inhale, 1, 20),
      hold: clamp(partial.hold ?? prev.hold, 0, 20),
      exhale: clamp(partial.exhale ?? prev.exhale, 1, 30),
    }));
    stop();
  };

  // ✅ 원/막대 크게 + 카드 크게
  const circleScale = prog.interpolate({
    inputRange: [0, 1],
    outputRange:
      phase === "exhale" ? [1.15, 0.75] : [0.75, 1.15], // 내쉬기는 줄어드는 느낌
  });

  // bar는 width가 native driver 불가. Animated.View width로 처리.
  const barWidth = prog.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.screen}>
        <Text style={styles.h1}>호흡 조절</Text>
        <Text style={styles.desc}>원을 따라 호흡해보세요</Text>

        {/* ✅ 1) 가이드 선택 (위) */}
        <Text style={styles.sectionTitle}>가이드</Text>
        <View style={styles.rowCompact}>
          <Pressable
            onPress={() => onChangeGuide("circle")}
            style={[styles.pillSmall, guide === "circle" && styles.pillOn]}
          >
            <Text style={[styles.pillText, guide === "circle" && styles.pillTextOn]}>
              원(circles)
            </Text>
          </Pressable>

          <Pressable
            onPress={() => onChangeGuide("bar")}
            style={[styles.pillSmall, guide === "bar" && styles.pillOn]}
          >
            <Text style={[styles.pillText, guide === "bar" && styles.pillTextOn]}>
              막대(bars)
            </Text>
          </Pressable>
        </View>

        {/* ✅ 2) 호흡법 선택 (아래) + 커스텀 */}
        <Text style={styles.sectionTitle}>호흡법</Text>
        <View style={styles.rowCompact}>
          <Pressable
            onPress={() => setPreset("425")}
            style={[styles.pillSmall, preset === "425" && styles.pillOn]}
          >
            <Text style={[styles.pillText, preset === "425" && styles.pillTextOn]}>
              4-2-5
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setPreset("478")}
            style={[styles.pillSmall, preset === "478" && styles.pillOn]}
          >
            <Text style={[styles.pillText, preset === "478" && styles.pillTextOn]}>
              4-7-8
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setPreset("custom")}
            style={[styles.pillSmall, preset === "custom" && styles.pillOn]}
          >
            <Text style={[styles.pillText, preset === "custom" && styles.pillTextOn]}>
              직접 설정
            </Text>
          </Pressable>
        </View>

        {/* 커스텀 컨트롤(작게) */}
        {preset === "custom" && (
          <View style={styles.customBox}>
            <CustomRow
              label="들이마시기"
              value={config.inhale}
              onChange={(v) => setCustom({ inhale: v })}
            />
            <CustomRow
              label="멈추기"
              value={config.hold}
              onChange={(v) => setCustom({ hold: v })}
              allowZero
            />
            <CustomRow
              label="내쉬기"
              value={config.exhale}
              onChange={(v) => setCustom({ exhale: v })}
            />
          </View>
        )}

        {/* ✅ 3) 미리보기(크게) */}
        <View style={styles.previewCardBig}>
          <View style={styles.previewTop}>
            <Text style={styles.previewTitle}>{running ? phaseLabel : "준비"}</Text>
            <Text style={styles.previewCount}>
              {running ? left : `${config.inhale}  ${config.hold}  ${config.exhale}`}
            </Text>
          </View>

          {guide === "circle" ? (
            <View style={styles.circleWrapBig}>
              <Animated.View
                style={[
                  styles.circleBig,
                  { transform: [{ scale: running ? circleScale : 0.85 }], opacity: running ? 1 : 0.6 },
                ]}
              />
            </View>
          ) : (
            <View style={styles.barWrapBig}>
              <View style={styles.barBgBig}>
                <Animated.View style={[styles.barFillBig, { width: running ? barWidth : "25%" }]} />
              </View>
            </View>
          )}

          <Text style={styles.previewHint}>
            들이마시기 {config.inhale}초 · 멈추기 {config.hold}초 · 내쉬기 {config.exhale}초
          </Text>
        </View>

        {/* ✅ 시작/정지 */}
        <Pressable style={styles.cta} onPress={() => (running ? stop() : start())}>
          <Text style={styles.ctaText}>{running ? "정지" : "시작하기"}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function CustomRow({
  label,
  value,
  onChange,
  allowZero,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  allowZero?: boolean;
}) {
  return (
    <View style={cr.row}>
      <Text style={cr.label}>{label}</Text>
      <View style={cr.controls}>
        <Pressable onPress={() => onChange(Math.max(allowZero ? 0 : 1, value - 1))} style={cr.btn}>
          <Text style={cr.btnText}>−</Text>
        </Pressable>

        <TextInput value={String(value)} editable={false} style={cr.value} />

        <Pressable onPress={() => onChange(value + 1)} style={cr.btn}>
          <Text style={cr.btnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const BG = "#F2F0EE";
const DARK = "#3B3B3B";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  screen: { flex: 1, backgroundColor: BG, paddingHorizontal: 20, paddingTop: 12 },

  h1: { fontSize: 24, fontWeight: "900", color: "#111", marginTop: 8 },
  desc: { marginTop: 8, fontSize: 14, color: "#333" },

  sectionTitle: { marginTop: 16, fontSize: 14, fontWeight: "900", color: "#111" },
  rowCompact: { flexDirection: "row", gap: 10, marginTop: 10 },

  pillSmall: {
    flex: 1,
    height: 44,
    borderRadius: 999,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  pillOn: { backgroundColor: DARK },
  pillText: { fontSize: 13, fontWeight: "900", color: "#111" },
  pillTextOn: { color: "#FFF" },

  customBox: {
    marginTop: 10,
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 12,
  },

  previewCardBig: {
    marginTop: 16,
    backgroundColor: "#FFF",
    borderRadius: 22,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
      },
      android: { elevation: 2 },
    }),
  },
  previewTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  previewTitle: { fontSize: 16, fontWeight: "900", color: "#111" },
  previewCount: { fontSize: 16, fontWeight: "900", color: "#111" },

  circleWrapBig: { marginTop: 14, alignItems: "center", justifyContent: "center", height: 220 },
  circleBig: { width: 180, height: 180, borderRadius: 90, backgroundColor: DARK },

  barWrapBig: { marginTop: 22, height: 220, justifyContent: "center" },
  barBgBig: { height: 22, borderRadius: 999, backgroundColor: "#E1DDDA", overflow: "hidden" },
  barFillBig: { height: "100%", backgroundColor: DARK },

  previewHint: { marginTop: 14, fontSize: 13, color: "#444" },

  cta: {
    marginTop: "auto",
    marginBottom: 18,
    height: 54,
    borderRadius: 999,
    backgroundColor: DARK,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { color: "#FFF", fontSize: 16, fontWeight: "900" },
});

const cr = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 },
  label: { fontSize: 13, fontWeight: "900", color: "#111" },
  controls: { flexDirection: "row", alignItems: "center", gap: 8 },
  btn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F2F0EE",
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { fontSize: 18, fontWeight: "900", color: "#111" },
  value: {
    width: 48,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#FAF9F8",
    borderWidth: 1,
    borderColor: "#E0DEDB",
    textAlign: "center",
    paddingTop: 6,
    fontWeight: "900",
    color: "#111",
  },
});
