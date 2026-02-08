import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { signOut, deleteUser } from "firebase/auth";
import { auth } from "../../shared/lib/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const BG = "#F2F0EE";
const CARD = "#FFFFFF";
const DARK = "#111111";
const MUTED = "#6B7280";

type Item = { label: string; danger?: boolean; onPress?: () => void };

function Section({ title, items }: { title: string; items: Item[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <View style={styles.box}>
        {items.map((it, idx) => (
          <Pressable
            key={`${title}-${it.label}-${idx}`}
            onPress={it.onPress}
            style={[styles.row, idx !== items.length - 1 && styles.rowDivider]}
          >
            <Text style={[styles.rowText, it.danger && styles.rowDanger]}>
              {it.label}
            </Text>
            <Text style={styles.rowArrow}>›</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/** ✅ ProfileEditScreen과 동일한 저장 키 */
const KEY_NICKNAME = "profile_nickname";
const KEY_PHOTO_URI = "profile_photo_uri";

export default function MyPageScreen() {
  const router = useRouter();

  // ✅ 프로필 표시용 상태
  const [nickname, setNickname] = useState("Username");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [handle, setHandle] = useState("@ID");

  /** ✅ 로컬 프로필 로드 (ProfileEdit에서 저장한 값 반영) */
  const loadProfile = useCallback(async () => {
    try {
      const [n, p] = await Promise.all([
        AsyncStorage.getItem(KEY_NICKNAME),
        AsyncStorage.getItem(KEY_PHOTO_URI),
      ]);

      setNickname(n?.trim() ? n.trim() : "Username");
      setPhotoUri(p ?? null);
    } catch {
      // 실패해도 화면은 떠야 함
    }
  }, []);

  /** ✅ Firebase 유저 핸들 표시(@이메일 or @uid 일부) */
  const syncHandleFromAuth = useCallback(() => {
    const u = auth.currentUser;
    if (!u) {
      setHandle("@ID");
      return;
    }
    if (u.email) {
      setHandle(`@${u.email}`);
      return;
    }
    setHandle(u.uid ? `@${u.uid.slice(0, 8)}` : "@ID");
  }, []);

  /** ✅ 최초 1회 로드 */
  useEffect(() => {
    loadProfile();
    syncHandleFromAuth();
  }, [loadProfile, syncHandleFromAuth]);

  /** ✅ 프로필 수정 화면에서 "뒤로 돌아올 때"마다 자동으로 다시 로드 */
  useFocusEffect(
    useCallback(() => {
      loadProfile();
      syncHandleFromAuth();
      return () => {};
    }, [loadProfile, syncHandleFromAuth])
  );

  const onLogout = () => {
    Alert.alert("로그아웃", "로그아웃하시겠어요?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
            router.replace("/auth/login");
          } catch (e: any) {
            Alert.alert("오류", e?.message ?? "로그아웃에 실패했어요.");
          }
        },
      },
    ]);
  };

  const onDeleteAccount = () => {
    Alert.alert(
      "회원탈퇴",
      "정말로 회원탈퇴 하시겠어요?\n이 작업은 되돌릴 수 없어요.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "탈퇴",
          style: "destructive",
          onPress: async () => {
            try {
              const user = auth.currentUser;
              if (!user) {
                Alert.alert("안내", "로그인 상태가 아니에요.");
                router.replace("/auth/login");
                return;
              }

              await deleteUser(user); // 계정 삭제
              router.replace("/auth/login");
            } catch (e: any) {
              const code = e?.code ?? "";
              if (code === "auth/requires-recent-login") {
                Alert.alert(
                  "재인증 필요",
                  "보안을 위해 최근에 다시 로그인한 뒤에만 탈퇴할 수 있어요.\n로그아웃 후 다시 로그인한 다음 시도해 주세요."
                );
                return;
              }
              Alert.alert("오류", e?.message ?? "회원탈퇴에 실패했어요.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <Text style={styles.h1}>마이페이지</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* ✅ 프로필: (ProfileEdit 저장값 반영) */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarPlaceholder} />
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{nickname}</Text>
            <Text style={styles.handle}>{handle}</Text>
          </View>
        </View>

        <Section
          title="계정"
          items={[
            { label: "프로필 수정", onPress: () => router.push("/mypage/edit") },
            {
              label: "비밀번호 변경",
              onPress: () =>
                Alert.alert("준비중", "비밀번호 변경 화면은 다음 단계에서 붙여요."),
            },
          ]}
        />

        <Section
          title="기타"
          items={[
            { label: "회원탈퇴", danger: true, onPress: onDeleteAccount },
            { label: "로그아웃", danger: true, onPress: onLogout },
          ]}
        />
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
    marginTop: 20,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  backText: { fontSize: 20, fontWeight: "900", color: DARK },
  h1: { fontSize: 20, fontWeight: "900", color: DARK },

  profileCard: {
    marginTop: 20,
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },

  // ✅ 동그란 아바타
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: "#E6E2DE",
  },
  avatarImg: { width: "100%", height: "100%" },
  avatarPlaceholder: { flex: 1, backgroundColor: "#E6E2DE" },

  name: { fontSize: 18, fontWeight: "900", color: DARK },
  handle: { marginTop: 4, fontSize: 12, fontWeight: "700", color: MUTED },

  section: { marginTop: 14 },
  sectionTitle: { fontSize: 13, fontWeight: "900", color: DARK, marginBottom: 10 },

  box: { backgroundColor: CARD, borderRadius: 18, overflow: "hidden" },
  row: {
    paddingHorizontal: 16,
    height: 54,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: "#EFEDEB" },
  rowText: { fontSize: 14, fontWeight: "800", color: DARK },
  rowDanger: { color: "#DC2626" },
  rowArrow: { fontSize: 22, color: "#9CA3AF", fontWeight: "900" },
});