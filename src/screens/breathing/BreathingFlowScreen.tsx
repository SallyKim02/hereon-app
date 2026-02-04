import { useState } from "react";
import BPage1_Select, { VisualGuide } from "./BPage1_Select";

export default function BreathingFlowScreen() {
  const [guide, setGuide] = useState<VisualGuide>("circle");

  return <BPage1_Select guide={guide} onChangeGuide={setGuide} />;
}
