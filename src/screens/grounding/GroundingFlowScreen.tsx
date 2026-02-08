import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import GPage1_Intro from "./GPage1_Intro";
import GPage2_Visual from "./GPage2_Visual";
import GPage3_Touch from "./GPage3_Touch";
import GPage4_Sound from "./GPage4_Sound";
import GPage5_Smell from "./GPage5_Smell";
import GPage6_Taste from "./GPage6_Taste";
import GPage7_Outro from "./GPage7_Outro";

const BG = "#F2F0EE";

export default function GroundingFlowScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const prev = () => setStep((s) => Math.max(1, s - 1));
  const next = () => setStep((s) => Math.min(7, s + 1));

  const doneToHome = () => {
    // ✅ 완료하면 홈 메뉴로
    router.replace("/");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={["top"]}>
      {step === 1 && <GPage1_Intro onContinue={next} />}

      {step === 2 && <GPage2_Visual onPrev={prev} onContinue={next} />}
      {step === 3 && <GPage3_Touch onPrev={prev} onContinue={next} />}
      {step === 4 && <GPage4_Sound onPrev={prev} onContinue={next} />}
      {step === 5 && <GPage5_Smell onPrev={prev} onContinue={next} />}
      {step === 6 && <GPage6_Taste onPrev={prev} onContinue={next} />}
      {step === 7 && <GPage7_Outro onPrev={prev} onDone={doneToHome} />}
    </SafeAreaView>
  );
}
