/*
import HomeMenuScreen from "../screens/HomeMenuScreen";

export default function Index() {
  return <HomeMenuScreen />;
}
  */

import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/auth/login" />;
}
