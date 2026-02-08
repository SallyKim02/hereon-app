import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";

const BG = "#F2F0EE";
const CARD = "#FFFFFF";
const LINE = "rgba(17,17,17,0.12)";
const TEXT = "#111111";
const SUB = "rgba(17,17,17,0.55)";

// ✅ 탭 순서: 심리전문가 | 응급실 | 약국 | 병원
type TabKey = "psy_pro" | "er" | "pharmacy" | "psy_hospital";

type PlaceLite = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  distanceKm: number;
  rating?: number;
  userRatingCount?: number;
  phone?: string;
  // 스텁용 분류
  kind: TabKey;
};

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

function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

function Chip({
  label,
  active,
  icon,
  onPress,
}: {
  label: string;
  active: boolean;
  icon?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        active ? styles.chipOn : styles.chipOff,
        active && shadow(2),
      ]}
      hitSlop={8}
    >
      {!!icon && (
        <Text style={[styles.chipIcon, active && styles.chipIconOn]}>
          {icon}
        </Text>
      )}
      <Text style={[styles.chipText, active && styles.chipTextOn]}>
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * ✅ API 없이 보여줄 스텁 데이터
 * - 좌표는 "현재 내 위치" 기준으로 동적으로 살짝 오프셋해서 생성합니다 (실제 근처처럼 보이게)
 * - 지도는 계속 뜨고, 마커/리스트만 스텁으로 표시
 */
function makeStubPlaces(center: { lat: number; lng: number }): PlaceLite[] {
  const mk = (
    id: string,
    name: string,
    dLat: number,
    dLng: number,
    kind: TabKey
  ): PlaceLite => {
    const lat = center.lat + dLat;
    const lng = center.lng + dLng;
    return {
      id,
      name,
      lat,
      lng,
      kind,
      address: "예시 주소(스텁)",
      distanceKm: haversineKm(center, { lat, lng }),
      rating: 4.4,
      userRatingCount: 128,
      phone: "000-0000-0000",
    };
  };

  // 대략 0.003 ~ 0.01 정도면 300m~1km대 느낌
  return [
    mk("psy1", "마음온 심리상담센터", 0.004, 0.002, "psy_pro"),
    mk("psy2", "여기온 상담센터", -0.003, 0.005, "psy_pro"),
    mk("psy3", "햇살 심리클리닉", 0.006, -0.004, "psy_pro"),

    mk("er1", "OO대학교병원 응급실", 0.008, 0.001, "er"),
    mk("er2", "OO종합병원 응급의료센터", -0.007, -0.002, "er"),

    mk("ph1", "바로약국", 0.002, -0.006, "pharmacy"),
    mk("ph2", "온누리약국", -0.002, 0.007, "pharmacy"),
    mk("ph3", "행복약국", 0.005, 0.006, "pharmacy"),

    mk("hos1", "OO정신건강의학과의원", -0.006, 0.003, "psy_hospital"),
    mk("hos2", "OO신경정신과", 0.003, 0.009, "psy_hospital"),
  ].sort((a, b) => a.distanceKm - b.distanceKm);
}

export default function EmergencyKitScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);

  const [tab, setTab] = useState<TabKey>("psy_pro");
  const [q, setQ] = useState("");

  // 길찾기 (네이버지도 URL scheme)
  const NAVER_APPNAME = "com.your.bundleid"; // TODO: 번들ID/패키지명으로 변경

  const [my, setMy] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingLoc, setLoadingLoc] = useState(true);

  // ✅ 스텁이므로 places 로딩 개념만 남김
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [places, setPlaces] = useState<PlaceLite[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 1) 위치만 가져오기 (지도 유지)
  useEffect(() => {
    (async () => {
      try {
        setLoadingLoc(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "위치 권한 필요",
            "현재 위치 기반 지도를 사용하려면 위치 권한을 허용해주세요."
          );
          return;
        }

        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setMy({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      } catch (e: any) {
        Alert.alert("위치 오류", e?.message ?? "현재 위치를 가져오지 못했어요.");
      } finally {
        setLoadingLoc(false);
      }
    })();
  }, []);

  // 2) ✅ API 호출 제거: 탭/위치 바뀌면 스텁 places 세팅
  useEffect(() => {
    if (!my) return;

    setLoadingPlaces(true);
    const all = makeStubPlaces(my);
    const list = all.filter((p) => p.kind === tab).sort((a, b) => a.distanceKm - b.distanceKm);
    setPlaces(list);
    setSelectedId(list[0]?.id ?? null);

    if (list[0] && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: list[0].lat,
          longitude: list[0].lng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        250
      );
    }

    const t = setTimeout(() => setLoadingPlaces(false), 250); // 살짝 로딩 느낌
    return () => clearTimeout(t);
  }, [tab, my]);

  const shownPlaces = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return places;
    return places.filter((p) =>
      (p.name + " " + (p.address ?? "")).toLowerCase().includes(qq)
    );
  }, [places, q]);

  const selected = useMemo(
    () => shownPlaces.find((p) => p.id === selectedId) ?? shownPlaces[0] ?? null,
    [shownPlaces, selectedId]
  );

  const region: Region | undefined = useMemo(() => {
    if (!my) return undefined;
    return {
      latitude: my.lat,
      longitude: my.lng,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03,
    };
  }, [my]);

  const openNaverDirections = async () => {
    if (!my || !selected) return;

    const dname = encodeURIComponent(selected.name);
    const url =
      `nmap://route/public?` +
      `slat=${my.lat}&slng=${my.lng}&sname=${encodeURIComponent("내 위치")}` +
      `&dlat=${selected.lat}&dlng=${selected.lng}&dname=${dname}` +
      `&appname=${encodeURIComponent(NAVER_APPNAME)}`;

    const can = await Linking.canOpenURL(url);
    if (can) return Linking.openURL(url);

    Alert.alert("네이버지도 앱 없음", "네이버지도 앱이 설치되어 있어야 길찾기가 열려요.");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.screen}>
        {/* Top */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>

          <Text style={styles.title}>마음 SOS</Text>

          <Pressable onPress={() => router.push("/emergency/contacts")} hitSlop={10}>
            <Text style={styles.menuIcon}>≡</Text>
          </Pressable>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="장소, 주소, 버스 검색"
            placeholderTextColor="rgba(17,17,17,0.40)"
            style={styles.searchInput}
          />
        </View>

        {/* Chips (✅ 여기~지도 사이를 “확” 줄이기) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          <Chip label="심리전문가" icon="🧠" active={tab === "psy_pro"} onPress={() => setTab("psy_pro")} />
          <Chip label="응급실" icon="🚑" active={tab === "er"} onPress={() => setTab("er")} />
          <Chip label="약국" icon="💊" active={tab === "pharmacy"} onPress={() => setTab("pharmacy")} />
          <Chip label="병원" icon="🏥" active={tab === "psy_hospital"} onPress={() => setTab("psy_hospital")} />
        </ScrollView>

        {/* Map */}
        <View style={[styles.mapCard, shadow(4)]}>
          {loadingLoc || !region ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator />
              <Text style={styles.loadingText}>현재 위치 불러오는 중...</Text>
            </View>
          ) : (
            <MapView
              ref={mapRef as any}
              style={StyleSheet.absoluteFill}
              initialRegion={region}
              provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
              showsUserLocation
              showsMyLocationButton={false}
            >
              {shownPlaces.map((p) => {
                const on = p.id === selected?.id;
                return (
                  <Marker
                    key={p.id}
                    coordinate={{ latitude: p.lat, longitude: p.lng }}
                    onPress={() => setSelectedId(p.id)}
                    title={p.name}
                    description={p.address}
                  >
                    <View style={[styles.pin, on && styles.pinOn]} />
                  </Marker>
                );
              })}
            </MapView>
          )}

          {/* 현위치 이동 */}
          <Pressable
            style={[styles.locBtn, shadow(2)]}
            hitSlop={10}
            onPress={() => {
              if (!my || !mapRef.current) return;
              mapRef.current.animateToRegion(
                {
                  latitude: my.lat,
                  longitude: my.lng,
                  latitudeDelta: 0.03,
                  longitudeDelta: 0.03,
                },
                250
              );
            }}
          >
            <Text style={styles.locText}>◎</Text>
          </Pressable>
        </View>

        {/* Bottom card */}
        <View style={styles.bottom}>
          <View style={styles.pillsRow}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 18, gap: 10 }}
            >
              {shownPlaces.slice(0, 10).map((p) => {
                const on = p.id === selected?.id;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => {
                      setSelectedId(p.id);
                      if (mapRef.current) {
                        mapRef.current.animateToRegion(
                          {
                            latitude: p.lat,
                            longitude: p.lng,
                            latitudeDelta: 0.02,
                            longitudeDelta: 0.02,
                          },
                          200
                        );
                      }
                    }}
                    style={[styles.placePill, on && styles.placePillOn]}
                    hitSlop={8}
                  >
                    <Text style={[styles.placePillText, on && styles.placePillTextOn]}>
                      {p.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={[styles.placeCard, shadow(6)]}>
            {loadingPlaces ? (
              <View style={{ paddingVertical: 18, alignItems: "center", gap: 10 }}>
                <ActivityIndicator />
                <Text style={{ fontWeight: "800", color: SUB }}>근처 장소(스텁) 불러오는 중...</Text>
              </View>
            ) : !selected ? (
              <Text style={{ fontWeight: "800", color: SUB }}>근처 결과가 없어요.</Text>
            ) : (
              <>
                <Text style={styles.placeName}>{selected.name}</Text>

                <Text style={styles.placeMeta}>
                  {selected.distanceKm.toFixed(1)} km
                  {typeof selected.rating === "number"
                    ? `  ·  ${selected.rating.toFixed(1)} (${selected.userRatingCount ?? 0})`
                    : ""}
                </Text>

                {!!selected.address && <Text style={styles.placeLine}>{selected.address}</Text>}
                {!!selected.phone && <Text style={styles.placeLine}>{selected.phone}</Text>}

                <Pressable style={styles.goBtn} onPress={openNaverDirections}>
                  <Text style={styles.goText}>길찾기 (네이버지도)</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  screen: { flex: 1, backgroundColor: BG },

  topBar: {
    paddingHorizontal: 18,
    paddingTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backArrow: { fontSize: 34, color: TEXT, width: 28 },
  title: { fontSize: 22, fontWeight: "900", color: TEXT },
  menuIcon: { fontSize: 26, fontWeight: "900", color: TEXT, width: 28, textAlign: "right" },

  searchWrap: {
    marginTop: 10,
    marginHorizontal: 18,
    height: 42,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(17,17,17,0.18)",
    backgroundColor: "rgba(255,255,255,0.55)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  searchIcon: { color: "rgba(17,17,17,0.50)", fontSize: 16, marginRight: 10 },
  searchInput: { flex: 1, color: TEXT, fontWeight: "700" },

  /**
   * ✅ “안 줄어드는 빈 공간”을 강제로 없애는 포인트
   * - paddingBottom/marginBottom 0
   * - height를 고정(=칩 영역이 이상하게 커지는 것 방지)
   */
  chipsRow: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 0,
    marginBottom: 0,
    gap: 10,
    height: 46, // ✅ 중요: 칩 영역 자체가 커지지 않게 고정
    alignItems: "center",
  },

  chip: {
    height: 36,
    borderRadius: 999,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
  },
  chipOff: { backgroundColor: "rgba(255,255,255,0.65)", borderColor: "rgba(17,17,17,0.12)" },
  chipOn: { backgroundColor: CARD, borderColor: "rgba(17,17,17,0.10)" },
  chipIcon: { fontSize: 7, color: "rgba(17,17,17,0.55)" },
  chipIconOn: { color: TEXT },
  chipText: { fontWeight: "900", color: "rgba(17,17,17,0.55)" },
  chipTextOn: { color: TEXT },

  mapCard: {
    marginTop: 0,
    marginBottom: -20,
    marginHorizontal: 18,
    borderRadius: 24,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: LINE,
    overflow: "hidden",
    height: 420,
  },

  loadingBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  loadingText: { fontWeight: "800", color: SUB },

  locBtn: {
    position: "absolute",
    right: 14,
    bottom: 14,
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: "rgba(17,17,17,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  locText: { fontSize: 20, fontWeight: "900", color: TEXT },

  pin: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 4,
    borderColor: TEXT,
    backgroundColor: CARD,
  },
  pinOn: { backgroundColor: TEXT },

  bottom: { marginTop: 0, paddingBottom: 12 },
  pillsRow: { paddingBottom: 6 },

  placePill: {
    height: 32,
    borderRadius: 999,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(17,17,17,0.12)",
    backgroundColor: "rgba(255,255,255,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  placePillOn: { backgroundColor: CARD },
  placePillText: { fontWeight: "900", color: "rgba(17,17,17,0.60)" },
  placePillTextOn: { color: TEXT },

  placeCard: {
    marginHorizontal: 18,
    borderRadius: 22,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: LINE,
    padding: 16,
  },
  placeName: { fontSize: 22, fontWeight: "900", color: TEXT },
  placeMeta: { marginTop: 6, fontWeight: "900", color: "rgba(17,17,17,0.75)" },
  placeLine: { marginTop: 6, fontWeight: "700", color: TEXT },

  goBtn: {
    marginTop: 12,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#2F2F2F",
    alignItems: "center",
    justifyContent: "center",
  },
  goText: { color: "#fff", fontWeight: "900" },
});