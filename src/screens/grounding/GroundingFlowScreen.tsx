import { useState } from "react";
import GPage1_Intro from "./GPage1_Intro";
import GPage2_Visual from "./GPage2_Visual";
import GPage3_Touch from "./GPage3_Touch";
import GPage4_Sound from "./GPage4_Sound";
import GPage5_Smell from "./GPage5_Smell";
import GPage6_Taste from "./GPage6_Taste";
import GPage7_Outro from "./GPage7_Outro";

type Step = "intro" | "visual" | "touch" | "sound" | "smell" | "taste" | "outro";

export default function GroundingFlowScreen() {
  const [step, setStep] = useState<Step>("intro");

  if (step === "intro") return <GPage1_Intro onContinue={() => setStep("visual")} />;
  if (step === "visual") return <GPage2_Visual onContinue={() => setStep("touch")} />;
  if (step === "touch") return <GPage3_Touch onContinue={() => setStep("sound")} />;
  if (step === "sound") return <GPage4_Sound onContinue={() => setStep("smell")} />;
  if (step === "smell") return <GPage5_Smell onContinue={() => setStep("taste")} />;
  if (step === "taste") return <GPage6_Taste onContinue={() => setStep("outro")} />;
  return <GPage7_Outro onDone={() => setStep("intro")} />;
}
