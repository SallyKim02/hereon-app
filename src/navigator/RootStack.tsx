import { Stack } from "expo-router";

export default function RootStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* 필요하면 여기서 화면별 옵션 지정 가능 */}
      {/* <Stack.Screen name="index" options={{ headerShown: false }} /> */}
    </Stack>
  );
}
