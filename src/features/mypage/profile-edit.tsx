import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

const BG = "#F2F0EE";
const CARD = "#FFFFFF";
const LINE = "rgba(17,17,17,0.12)";
const TEXT = "#111111";
const SUB = "rgba(17,17,17,0.55)";

/** ✅ 로컬 저장 키(AsyncStorage) */
const KEY_NICKNAME = "profile_nickname";
const KEY_BIRTHDAY = "profile_birthday"; // 저장형식: YYYY-MM-DD
const KEY_SYMPTOMS = "profile_symptoms"; // 저장형식: JSON string array
const KEY_PHOTO_URI = "profile_photo_uri";

/** ✅ YYYY-MM-DD 유효성 체크(달력까지 검증) */
function isValidDateYYYYMMDD(s: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return false;

  const y = Number(m[1]);
  const mm = Number(m[2]);
  const d = Number(m[3]);

  if (mm < 1 || mm > 12) return false;
  if (d < 1 || d > 31) return false;

  const dt = new Date(y, mm - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === mm - 1 && dt.getDate() === d;
}

/** ✅ 숫자만 남기기 */
function onlyDigits(s: string) {
  return (s ?? "").replace(/\D/g, "");
}

/** ✅ digits(최대 8자리) -> 표시용 "YYYY년 MM월 DD일" (입력 중에도 자연스럽게) */
function formatBirthdayKoFromDigits(digits: string) {
  const d = onlyDigits(digits).slice(0, 8);
  const y = d.slice(0, 4);
  const m = d.slice(4, 6);
  const day = d.slice(6, 8);

  if (d.length <= 4) return y; // 2026
  if (d.length <= 6) return `${y}년 ${m}`; // 2026년 02
  return `${y}년 ${m}월 ${day}일`; // 2026년 02월 08일
}

/** ✅ digits(8자리) -> 저장용 "YYYY-MM-DD" */
function digitsToISO(digits: string) {
  const d = onlyDigits(digits).slice(0, 8);
  if (d.length !== 8) return "";
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
}

/** ✅ 저장값 "YYYY-MM-DD" -> digits(8자리) */
function isoToDigits(iso: string) {
  return onlyDigits(iso).slice(0, 8);
}

export default function ProfileEditScreen() {
  const router = useRouter();

  /** ✅ 폼 상태 */
  const [nickname, setNickname] = useState("");
  const [birthdayDigits, setBirthdayDigits] = useState(""); // 입력은 숫자만 받기 위한 내부값
  const [symInput, setSymInput] = useState(""); // 증상 입력용(콤마/줄바꿈 허용)
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  /** ✅ 초기 로드: AsyncStorage에서 저장된 프로필 불러오기 */
  useEffect(() => {
    (async () => {
      try {
        const [n, b, s, p] = await Promise.all([
          AsyncStorage.getItem(KEY_NICKNAME),
          AsyncStorage.getItem(KEY_BIRTHDAY),
          AsyncStorage.getItem(KEY_SYMPTOMS),
          AsyncStorage.getItem(KEY_PHOTO_URI),
        ]);

        if (n) setNickname(n);

        // 생일은 저장형식(YYYY-MM-DD)을 digits로 바꿔서 입력창에 표시
        if (b) setBirthdayDigits(isoToDigits(b));

        if (p) setPhotoUri(p);

        if (s) {
          const arr = JSON.parse(s);
          if (Array.isArray(arr)) setSymptoms(arr.filter(Boolean));
        }
      } catch {
        // 로컬 로드 실패해도 화면은 떠야 함
      }
    })();
  }, []);

  /** ✅ 증상: 입력창(콤마/줄바꿈) -> 칩으로 추가 */
  const addSymptomsFromInput = () => {
    const raw = symInput.trim();
    if (!raw) return;

    const parts = raw
      .split(/[,\n]/g)
      .map((x) => x.trim())
      .filter(Boolean);

    if (parts.length === 0) return;

    setSymptoms((prev) => {
      const set = new Set(prev);
      parts.forEach((p) => set.add(p));
      return Array.from(set);
    });
    setSymInput("");
  };

  /** ✅ 증상: 칩 삭제 */
  const removeSymptom = (s: string) => {
    setSymptoms((prev) => prev.filter((x) => x !== s));
  };

  /** ✅ 프로필 사진: 갤러리에서 선택 */
  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert("권한 필요", "프로필 사진을 선택하려면 사진 접근 권한이 필요해요.");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });

    if (res.canceled) return;
    const uri = res.assets?.[0]?.uri;
    if (!uri) return;
    setPhotoUri(uri);
  };

  /** ✅ 생일: 입력은 숫자만 받되, 표시 형식은 자동으로 "YYYY년 MM월 DD일" */
  const onChangeBirthday = (text: string) => {
    const digits = onlyDigits(text).slice(0, 8);
    setBirthdayDigits(digits);
  };

  /** ✅ 저장 버튼 활성화 조건 */
  const canSave = useMemo(() => {
    if (!nickname.trim()) return false;

    // 생일은 "입력했으면" (8자리일 때) 유효성 체크
    if (birthdayDigits.trim()) {
      const iso = digitsToISO(birthdayDigits);
      if (birthdayDigits.length === 8 && !isValidDateYYYYMMDD(iso)) return false;
    }
    return true;
  }, [nickname, birthdayDigits]);

  /** ✅ 저장: AsyncStorage에 프로필 저장 후 뒤로 */
  const onSave = async () => {
    if (!nickname.trim()) {
      Alert.alert("입력 필요", "닉네임을 입력해주세요.");
      return;
    }

    // 8자리면 저장용 ISO로 변환 + 유효성 체크
    const isoBirthday = birthdayDigits.length === 8 ? digitsToISO(birthdayDigits) : "";
    if (birthdayDigits.length === 8 && !isValidDateYYYYMMDD(isoBirthday)) {
      Alert.alert("형식 확인", "올바른 날짜인지 확인해주세요. (예: 2001년 07월 28일)");
      return;
    }

    try {
      await Promise.all([
        AsyncStorage.setItem(KEY_NICKNAME, nickname.trim()),
        // 생일은 비워두면 빈 문자열로 저장(원하시면 remove로 바꿔드릴게요)
        AsyncStorage.setItem(KEY_BIRTHDAY, isoBirthday),
        AsyncStorage.setItem(KEY_SYMPTOMS, JSON.stringify(symptoms)),
        photoUri
          ? AsyncStorage.setItem(KEY_PHOTO_URI, photoUri)
          : AsyncStorage.removeItem(KEY_PHOTO_URI),
      ]);

      Alert.alert("저장 완료", "프로필이 저장되었어요.");
      router.back();
    } catch (e: any) {
      Alert.alert("저장 실패", e?.message ?? "저장에 실패했어요.");
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.screen}>
        {/* ✅ 상단 헤더(뒤로가기 + 타이틀) */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <Text style={styles.h1}>프로필 수정</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
          {/* ✅ 프로필 사진 섹션 */}
          <View style={styles.card}>
            <Text style={styles.label}>프로필 사진</Text>
            <View style={styles.photoRow}>
              <View style={styles.photoCircle}>
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.photoImg} />
                ) : (
                  <View style={styles.photoPlaceholder} />
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Pressable onPress={pickImage} style={styles.photoBtn} hitSlop={10}>
                  <Text style={styles.photoBtnText}>사진 선택</Text>
                </Pressable>
                <Text style={styles.hint}>갤러리에서 1:1로 잘라서 저장해요.</Text>
              </View>
            </View>
          </View>

          {/* ✅ 닉네임 섹션 */}
          <View style={styles.card}>
            <Text style={styles.label}>닉네임</Text>
            <TextInput
              value={nickname}
              onChangeText={setNickname}
              placeholder="Username"
              placeholderTextColor="rgba(17,17,17,0.35)"
              style={styles.input}
            />
          </View>

          {/* ✅ 생일 섹션(숫자만 입력 → 자동으로 “YYYY년 MM월 DD일” 표시) */}
          <View style={styles.card}>
            <Text style={styles.label}>생일</Text>
            <TextInput
              value={formatBirthdayKoFromDigits(birthdayDigits)}
              onChangeText={onChangeBirthday}
              placeholder="YYYY년 MM월 DD일 (예: 20010728)"
              placeholderTextColor="rgba(17,17,17,0.35)"
              style={styles.input}
              keyboardType="number-pad"
            />
            <Text style={styles.hint}>비워둬도 됩니다. 숫자만 입력하세요.</Text>
          </View>

          {/* ✅ 내 증상 섹션(입력 → 칩 추가/삭제) */}
          <View style={styles.card}>
            <Text style={styles.label}>내 증상</Text>

            <View style={styles.symInputRow}>
              <TextInput
                value={symInput}
                onChangeText={setSymInput}
                placeholder="예: 불안, 우울, 불면"
                placeholderTextColor="rgba(17,17,17,0.35)"
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                onSubmitEditing={addSymptomsFromInput}
                returnKeyType="done"
              />
              <Pressable onPress={addSymptomsFromInput} style={styles.addBtn} hitSlop={10}>
                <Text style={styles.addBtnText}>추가</Text>
              </Pressable>
            </View>

            <View style={styles.symChips}>
              {symptoms.length === 0 ? (
                <Text style={styles.hint}>아직 등록된 증상이 없어요.</Text>
              ) : (
                symptoms.map((s) => (
                  <Pressable key={s} onPress={() => removeSymptom(s)} style={styles.chip} hitSlop={8}>
                    <Text style={styles.chipText}>{s}</Text>
                    <Text style={styles.chipX}>×</Text>
                  </Pressable>
                ))
              )}
            </View>
          </View>

          {/* ✅ 저장 버튼 */}
          <Pressable
            onPress={onSave}
            disabled={!canSave}
            style={[styles.saveBtn, !canSave && { opacity: 0.55 }]}
          >
            <Text style={styles.saveText}>저장</Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  screen: { flex: 1, backgroundColor: BG, paddingHorizontal: 20, paddingTop: 12 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    marginBottom: 10,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  backText: { fontSize: 20, fontWeight: "900", color: TEXT },
  h1: { fontSize: 20, fontWeight: "900", color: TEXT },

  card: {
    marginTop: 12,
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: LINE,
    padding: 16,
  },
  label: { fontSize: 14, fontWeight: "900", color: TEXT, marginBottom: 10 },

  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(17,17,17,0.12)",
    paddingHorizontal: 14, // ✅ 입력창 안쪽 패딩
    color: TEXT,
    fontWeight: "800",
    backgroundColor: "rgba(255,255,255,0.75)",
    marginBottom: 8,
  },
  hint: { color: SUB, fontWeight: "700", marginTop: 6 },

  photoRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  photoCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(17,17,17,0.12)",
    backgroundColor: "#E6E2DE",
  },
  photoImg: { width: "100%", height: "100%" },
  photoPlaceholder: { flex: 1, backgroundColor: "#E6E2DE" },
  photoBtn: {
    height: 42,
    borderRadius: 14,
    backgroundColor: "#2F2F2F",
    alignItems: "center",
    justifyContent: "center",
  },
  photoBtnText: { color: "#fff", fontWeight: "900" },

  symInputRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  addBtn: {
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "rgba(17,17,17,0.08)",
    borderWidth: 1,
    borderColor: "rgba(17,17,17,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: { fontWeight: "900", color: TEXT },

  symChips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 999,
    backgroundColor: "rgba(17,17,17,0.06)",
    borderWidth: 1,
    borderColor: "rgba(17,17,17,0.10)",
  },
  chipText: { fontWeight: "900", color: TEXT },
  chipX: { fontWeight: "900", color: "rgba(17,17,17,0.55)" },

  saveBtn: {
    marginTop: 16,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#2F2F2F",
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: { color: "#fff", fontWeight: "900", fontSize: 16 },
});