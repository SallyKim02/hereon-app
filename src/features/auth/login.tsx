import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../shared/lib/firebase";

const BG = "#F2F0EE";
const CARD = "#FFFFFF";
const LINE = "rgba(17,17,17,0.12)";
const TEXT = "#111111";

const KEY_REMEMBER_ID = "auth_remember_id";
const KEY_SAVED_ID = "auth_saved_id";
const KEY_KEEP_LOGIN = "auth_keep_login";

const { height: H, width: W } = Dimensions.get("window");

// ✅ 공주님 요구: 입력/버튼 폭 “더 좁게”
const FORM_W = Math.min(340, W - 56);

function shadow(elevation = 4) {
  return Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOpacity: 0.10,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
    },
    android: { elevation },
    default: {},
  });
}

function CheckRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Pressable onPress={() => onChange(!value)} style={styles.checkRow} hitSlop={10}>
      <View style={[styles.checkbox, value && styles.checkboxOn]}>
        {value && <Text style={styles.checkboxTick}>✓</Text>}
      </View>
      <Text style={styles.checkLabel}>{label}</Text>
    </Pressable>
  );
}

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  const [rememberId, setRememberId] = useState(false);
  const [keepLogin, setKeepLogin] = useState(false);

  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => email.trim().length > 0 && pw.length >= 1, [email, pw]);

  // ✅ 저장된 설정/아이디 불러오기
  useEffect(() => {
    (async () => {
      try {
        const [r, k, saved] = await Promise.all([
          AsyncStorage.getItem(KEY_REMEMBER_ID),
          AsyncStorage.getItem(KEY_KEEP_LOGIN),
          AsyncStorage.getItem(KEY_SAVED_ID),
        ]);

        const rOn = r === "1";
        setRememberId(rOn);
        setKeepLogin(k === "1");

        if (rOn && saved) setEmail(saved);
      } catch {}
    })();
  }, []);

  // ✅ 토글 저장
  useEffect(() => {
    AsyncStorage.setItem(KEY_REMEMBER_ID, rememberId ? "1" : "0").catch(() => {});
    if (!rememberId) {
      AsyncStorage.removeItem(KEY_SAVED_ID).catch(() => {});
    } else {
      if (email.trim()) AsyncStorage.setItem(KEY_SAVED_ID, email.trim()).catch(() => {});
    }
  }, [rememberId, email]);

  useEffect(() => {
    AsyncStorage.setItem(KEY_KEEP_LOGIN, keepLogin ? "1" : "0").catch(() => {});
  }, [keepLogin]);

  const onLogin = async () => {
    if (!canSubmit) return;

    try {
      setLoading(true);

      const e = email.trim();
      if (rememberId) await AsyncStorage.setItem(KEY_SAVED_ID, e);

      await signInWithEmailAndPassword(auth, e, pw);

      router.replace("/home");
    } catch (err: any) {
      Alert.alert("로그인 실패", err?.message ?? "로그인에 실패했어요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.screen}>
        {/* ✅ 공주님 요구: “아주 조금 위” + “3/1 근처” */}
        <View style={styles.wrap}>
          {/* 1) HereOn 더 크게 + 살짝 위 */}
          <Text style={styles.brand}>HereOn</Text>

          {/* 2) 입력 가로 폭 줄이기 */}
          <View style={[styles.formCard, shadow(3)]}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="아이디(이메일)"
              placeholderTextColor="rgba(17,17,17,0.32)"
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />

            <View style={styles.divider} />

            <TextInput
              value={pw}
              onChangeText={setPw}
              placeholder="비밀번호"
              placeholderTextColor="rgba(17,17,17,0.32)"
              secureTextEntry
              style={styles.input}
            />
          </View>

          {/* 3) 체크 두 개 더 붙이기 */}
          <View style={styles.checksRow}>
            <CheckRow label="아이디 기억" value={rememberId} onChange={setRememberId} />
            <CheckRow label="로그인 유지" value={keepLogin} onChange={setKeepLogin} />
          </View>

          {/* 4) 로그인 버튼 폭 입력과 동일 */}
          <Pressable
            onPress={onLogin}
            disabled={!canSubmit || loading}
            style={[
              styles.loginBtn,
              (!canSubmit || loading) && { opacity: 0.55 },
              shadow(3),
            ]}
          >
            {loading ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.loginText}>로그인 중...</Text>
              </View>
            ) : (
              <Text style={styles.loginText}>로그인</Text>
            )}
          </Pressable>

          {/* 5) 텍스트 클릭 + 아래 선(밑줄) */}
          <View style={styles.linksRow}>
            <Pressable onPress={() => router.push("/auth/signup")} hitSlop={10}>
              <Text style={styles.linkText}>회원가입</Text>
            </Pressable>

            <View style={styles.dot} />

            <Pressable
              onPress={() => Alert.alert("준비중", "아이디 찾기 화면은 다음 단계에서 붙여요.")}
              hitSlop={10}
            >
              <Text style={styles.linkText}>아이디 찾기</Text>
            </Pressable>

            <View style={styles.dot} />

            <Pressable
              onPress={() => Alert.alert("준비중", "비밀번호 찾기 화면은 다음 단계에서 붙여요.")}
              hitSlop={10}
            >
              <Text style={styles.linkText}>비밀번호 재설정</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  screen: { flex: 1, backgroundColor: BG },

  // ✅ “3/1 근처” 느낌 + 여기서 살짝 위로(-)
  wrap: {
    paddingTop: Math.max(18, Math.floor(H * 0.18)), // 이전보다 위로
    alignItems: "center",
  },

  // 1) HereOn 더 크게 + 위쪽 간격 줄이기
  brand: {
    fontSize: 50,
    fontWeight: "900",
    color: TEXT,
    marginBottom: 14,
    marginTop: 0, // 살짝 위로
    textAlign: "center",
  },

  // 2) 입력 폭 좁게
  formCard: {
    marginTop:10,
    width: 320,
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: LINE,
    overflow: "hidden",
  },
  input: {
    height: 60,
    paddingHorizontal: 20,
    color: TEXT,
    fontWeight: "800",
    fontSize: 15,
  },
  divider: { height: 1, backgroundColor: "rgba(17,17,17,0.10)" },

  // 3) 체크 두 개 더 붙이기: gap 줄이고, 좌측 정렬로 모아두기
  checksRow: {
    width: FORM_W,
    marginTop: 7,
    flexDirection: "row",
    justifyContent: "flex-end",
    marginRight:30,
    alignItems: "center",
    gap: 14,
  },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  checkbox: {
    width: 15,
    height: 15,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: "rgba(17,17,17,0.35)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  checkboxOn: { backgroundColor: "#111", borderColor: "#111" },
  checkboxTick: { color: "#fff", fontWeight: "900", marginTop: -1, fontSize: 11 },
  checkLabel: { color: "rgba(17,17,17,0.62)", fontWeight: "800", fontSize: 12 },

  // 4) 로그인 버튼 
  loginBtn: {
    marginTop: 30,
    width: 310,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#2F2F2F",
    alignItems: "center",
    justifyContent: "center",
  },
  loginText: { color: "#fff", fontWeight: "900", fontSize: 15 },

  // 5) 텍스트 링크 
  linksRow: {
    marginTop: 14,
    width: FORM_W,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  linkText: {
    fontSize: 13,
    fontWeight: "800",
    color: "rgba(17,17,17,0.62)",
    textDecorationLine: "underline", // ✅ 아래 선
    textDecorationStyle: "solid",
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(17,17,17,0.28)",
  },
});