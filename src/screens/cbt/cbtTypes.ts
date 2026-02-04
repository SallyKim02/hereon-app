export type CbtCategory =
  | "대인관계"
  | "학업/일"
  | "건강"
  | "불안"
  | "자존감"
  | "기타";

export const CBT_CATEGORIES: CbtCategory[] = [
  "대인관계",
  "학업/일",
  "건강",
  "불안",
  "자존감",
  "기타",
];

export const PHYSICAL_REACTIONS: string[] = [
  "가슴이 답답함",
  "호흡이 가빠짐",
  "목 막힘",
  "어지러움",
  "머리가 멍함",
  "두근두근",
  "허기짐",
];

export type CbtRecord = {
  id: string;
  createdAt: number;
  updatedAt: number;

  happenedAt: number; // 캘린더에 찍히는 기준 날짜(epoch ms)
  category: CbtCategory;

  situation: string;
  emotion: string;
  physicalReactions: string[];

  automaticThought: string;
  alternativeThought: string;
};
