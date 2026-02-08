export function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickN<T>(arr: T[], n: number) {
  return shuffle(arr).slice(0, Math.min(n, arr.length));
}

export function buildChoices(params: {
  correctPool: string[];   // 해당 이미지에 실제 있는 사물
  globalDecoys: string[];  // 다른 장면들 사물(오답용)
  totalChoices?: number;   // 후보 총 개수
  correctChoices?: number; // 그 중 정답 개수
}) {
  const total = params.totalChoices ?? 18;
  const correctCount = params.correctChoices ?? 12;

  const correct = pickN(params.correctPool, correctCount);

  // 디코이는 correctPool에 없는 것만
  const decoyPool = params.globalDecoys.filter((x) => !params.correctPool.includes(x));
  const decoys = pickN(decoyPool, Math.max(0, total - correct.length));

  return shuffle([...correct, ...decoys]);
}

export function gradeSelection(params: {
  selected: string[];
  correctPool: string[];
}) {
  const correctSet = new Set(params.correctPool);
  const picked = params.selected;

  const correctPicked = picked.filter((x) => correctSet.has(x));
  const wrongPicked = picked.filter((x) => !correctSet.has(x));

  return {
    correctCount: correctPicked.length,
    wrongCount: wrongPicked.length,
    correctPicked,
    wrongPicked,
  };
}
