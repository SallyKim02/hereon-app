import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen name="grounding" options={{ title: "그라운딩" }} />
      <Tabs.Screen name="breathing" options={{ title: "호흡 연습" }} />
      <Tabs.Screen name="cbt" options={{ title: "CBT" }} />
      <Tabs.Screen name="videos" options={{ title: "영상" }} />
      <Tabs.Screen name="emergency" options={{ title: "응급키트" }} />
      <Tabs.Screen name="my" options={{ title: "마이" }} />
    </Tabs>
  );
}
