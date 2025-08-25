/**
 * getDailyComments.ts
 * ------------------------------------------------------------
 * 목적
 *  - 백엔드 변경 없이, 클라이언트에서 "하루 코칭 코멘트"를 생성하는
 *    가벼운 규칙 엔진.
 *
 * 입력 (Inputs)
 *  - API로 받은 일일 요약값(총 kcal, 탄/단/지 g, 물 ml, 권장칼로리, TDEE 등)을
 *    그대로 넣습니다. (null/undefined 허용)
 *
 * 동작 개요
 *  1) 각 규칙은 "카테고리"를 가집니다. (kcal/protein/water/carb/fat/tdee)
 *  2) 규칙 평가 시 Comment를 생성하여 카테고리별 버킷에 후보로 넣습니다.
 *  3) 같은 카테고리 내에서는 "우선순위"에 따라 1개만 남깁니다.
 *     - 우선순위: warn(3) > neutral(2) > good(1)
 *  4) 모든 카테고리에서 1개씩 모은 뒤, 노출 우선순위(CATEGORY_ORDER)를 적용하고
 *     최대 3개까지만 반환합니다.
 *
 * 왜 이렇게?
 *  - 같은 주제에서 경고와 칭찬이 동시에 뜨지 않게 하고,
 *    사용자에게 과도한 텍스트를 보여주지 않기 위해서입니다.
 *
 * 확장 포인트
 *  - Comment 타입에 i18nKey/args, action(바로가기) 등을 추가해도 됩니다.
 *  - CATEGORY_ORDER/PRIORITY를 사용자 설정으로 바꿀 수 있습니다.
 */

export type Tone = "good" | "warn" | "neutral";

/** 주제(카테고리) 정의 */
export type Category = "kcal" | "protein" | "water" | "carb" | "fat" | "tdee";

/** 코멘트 구조: 카테고리/톤/우선순위 포함 */
export type Comment = {
  id: string;
  text: string;
  tone?: Tone;
  category: Category;
  /** 내부 우선순위 숫자 (warn 3, neutral 2, good 1) */
  priority: number;
};

type Inputs = {
  kcal: number;                 // insights.totalKcal
  kcalTarget?: number | null;   // insights.recommendedCalories
  proteinG?: number;            // insights.totalProtein
  carbsG?: number;              // insights.totalCarbohydrate
  fatG?: number;                // insights.totalFat
  waterMl?: number;             // insights.totalWater
  tdee?: number | null;         // insights.tdee
  weightKg?: number | null;     // 오늘 체중 (옵션)
  targetWeightKg?: number | null; // 목표체중(옵션: 있으면 축하 코멘트)
  goals?: {
    waterGoalMl?: number;       // 기본 1000
    proteinGoalG?: number;      // 없으면 weight*1.2 로 추정
  };
};

/** 우선순위 테이블: warn(3) > neutral(2) > good(1) */
const PRIORITY: Record<Tone, number> = {
  warn: 3,
  neutral: 2,
  good: 1,
};

/** 카테고리 노출 순서 (앞일수록 먼저 보여줌) */
const CATEGORY_ORDER: Category[] = ["kcal", "protein", "water", "carb", "fat", "tdee"];

/** 안전한 퍼센트 계산 */
const pctOf = (part: number, total: number) => (total > 0 ? (part / total) * 100 : 0);

/** 후보 코멘트를 카테고리별로 1개만 남기도록 선택 */
function pickBestByCategory(candidates: Comment[]): Comment[] {
  const bucket = new Map<Category, Comment>();
  for (const c of candidates) {
    const existing = bucket.get(c.category);
    if (!existing || c.priority > existing.priority) {
      bucket.set(c.category, c);
    }
  }
  // 카테고리 노출 순서대로 정렬
  const ordered = Array.from(bucket.values()).sort((a, b) => {
    const ca = CATEGORY_ORDER.indexOf(a.category);
    const cb = CATEGORY_ORDER.indexOf(b.category);
    if (ca !== cb) return ca - cb;
    // 같은 카테고리라면 우선순위가 높은(숫자 큰) 것 먼저
    return b.priority - a.priority;
  });
  return ordered;
}

export function getDailyComments(i: Inputs): Comment[] {
  const out: Comment[] = [];
  const kcalTarget = i.kcalTarget ?? 0;
  const waterGoal = i.goals?.waterGoalMl ?? 1000;
  const proteinGoal =
    i.goals?.proteinGoalG ??
    (i.weightKg && i.weightKg > 0 ? Math.round(i.weightKg * 1.2) : undefined);

  // 매크로 kcal 환산
  const kcalFrom = {
    carbs: (i.carbsG ?? 0) * 4,
    protein: (i.proteinG ?? 0) * 4,
    fat: (i.fatG ?? 0) * 9,
  };
  const carbsPct = pctOf(kcalFrom.carbs, i.kcal);
  const proteinPct = pctOf(kcalFrom.protein, i.kcal);
  const fatPct = pctOf(kcalFrom.fat, i.kcal);

  // 🔹 칼로리
  if (kcalTarget > 0) {
    if (i.kcal < kcalTarget * 0.5) {
      out.push({
        id: "kcal-low",
        text: "아직 많이 남았어요. 저녁은 든든하게 챙겨보세요 🍚",
        tone: "neutral",
        category: "kcal",
        priority: PRIORITY.neutral,
      });
    } else if (i.kcal > kcalTarget) {
      out.push({
        id: "kcal-high",
        text: "오늘은 칼로리를 조금 초과했네요 ⚠️ 내일은 가볍게!",
        tone: "warn",
        category: "kcal",
        priority: PRIORITY.warn,
      });
    } else {
      out.push({
        id: "kcal-ok",
        text: "칼로리 밸런스 좋아요 💚 지금 페이스 유지해요!",
        tone: "good",
        category: "kcal",
        priority: PRIORITY.good,
      });
    }
  }

  // 🔹 단백질
  if (i.proteinG != null && proteinGoal) {
    if (i.proteinG < proteinGoal * 0.7) {
      out.push({
        id: "protein-low",
        text: "단백질이 부족해요 🥚 저녁에 보충해보세요!",
        tone: "warn",
        category: "protein",
        priority: PRIORITY.warn,
      });
    } else if (i.proteinG >= proteinGoal) {
      out.push({
        id: "protein-ok",
        text: "단백질 충분히 섭취했어요 💪 좋아요!",
        tone: "good",
        category: "protein",
        priority: PRIORITY.good,
      });
    }
  }

  // 🔹 물
  if (i.waterMl != null) {
    if (i.waterMl < 500) {
      out.push({
        id: "water-low",
        text: "물 섭취가 부족해요 💧 한 잔 더 마셔볼까요?",
        tone: "warn",
        category: "water",
        priority: PRIORITY.warn,
      });
    } else if (waterGoal && i.waterMl >= waterGoal) {
      out.push({
        id: "water-ok",
        text: "오늘 물은 충분히 드셨어요 👍",
        tone: "good",
        category: "water",
        priority: PRIORITY.good,
      });
    }
  }

  // 🔹 탄수화물 / 지방 비율
  if (i.kcal > 0) {
    if (carbsPct > 60) {
      out.push({
        id: "carb-high",
        text: "탄수화물이 다소 많아요 🍞 단백질·채소를 곁들여보세요.",
        tone: "neutral",
        category: "carb",
        priority: PRIORITY.neutral,
      });
    } else if (carbsPct < 40) {
      out.push({
        id: "carb-low",
        text: "탄수화물이 적어요 🍚 곡류를 조금 추가해보세요.",
        tone: "neutral",
        category: "carb",
        priority: PRIORITY.neutral,
      });
    }

    if (fatPct > 35) {
      out.push({
        id: "fat-high",
        text: "지방 섭취가 많아요 🧈 가벼운 메뉴로 조절해봐요.",
        tone: "neutral",
        category: "fat",
        priority: PRIORITY.neutral,
      });
    } else if (fatPct < 15) {
      out.push({
        id: "fat-low",
        text: "건강한 지방이 부족해요 🥑 견과류·생선을 더!",
        tone: "neutral",
        category: "fat",
        priority: PRIORITY.neutral,
      });
    }
  }

  // 🔹 TDEE 대비
  if (i.tdee && i.tdee > 0) {
    if (i.kcal < i.tdee * 0.7) {
      out.push({
        id: "tdee-low",
        text: "활동량 대비 섭취가 적어요 ⚡ 에너지가 부족할 수 있어요.",
        tone: "warn",
        category: "tdee",
        priority: PRIORITY.warn,
      });
    } else if (i.kcal > i.tdee * 1.1) {
      out.push({
        id: "tdee-high",
        text: "활동량보다 많이 섭취했어요. 내일은 균형을!",
        tone: "neutral",
        category: "tdee",
        priority: PRIORITY.neutral,
      });
    }
  }

  // 카테고리별로 1개만 남기고, 노출 순서/우선순위 적용
  const picked = pickBestByCategory(out);

  // 보기 좋게 최대 3개만 노출
  return picked.slice(0, 3);
}