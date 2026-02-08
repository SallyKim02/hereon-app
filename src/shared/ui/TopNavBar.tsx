import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  title?: string;
  onPrev?: () => void;
  onNext?: () => void;
  prevLabel?: string;
  nextLabel?: string;
  disablePrev?: boolean;
  disableNext?: boolean;
};

export default function TopNavBar({
  title,
  onPrev,
  onNext,
  prevLabel = "이전",
  nextLabel = "다음",
  disablePrev,
  disableNext,
}: Props) {
  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onPrev}
        disabled={!onPrev || disablePrev}
        style={[styles.btn, (!onPrev || disablePrev) && styles.btnOff]}
        hitSlop={12}
      >
        <Text style={styles.btnText}>← {prevLabel}</Text>
      </Pressable>

      <Text style={styles.title} numberOfLines={1}>
        {title ?? ""}
      </Text>

      <Pressable
        onPress={onNext}
        disabled={!onNext || disableNext}
        style={[styles.btn, (!onNext || disableNext) && styles.btnOff]}
        hitSlop={12}
      >
        <Text style={styles.btnText}>{nextLabel} →</Text>
      </Pressable>
    </View>
  );
}

const DARK = "#3B3B3B";
const CARD = "#FFFFFF";

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },
  btn: {
    backgroundColor: CARD,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    minWidth: 82,
    alignItems: "center",
  },
  btnOff: { opacity: 0.45 },
  btnText: { color: DARK, fontWeight: "900" },
  title: { flex: 1, textAlign: "center", color: DARK, fontWeight: "900", fontSize: 16 },
});
