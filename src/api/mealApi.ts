import { defaultFetch } from './defaultFetch';

// --- 타입 정의 ---

// GET /api/meal/log
export interface FoodItem {
  mealLogId: number;
  memberId: number;
  foodId: number;
  foodName: string;
  intakeAmount: number;
  intakeKcal: number;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  createdDate: string;
  modifiedDate: string;
}

// PATCH /api/meal/log/{id}
export interface UpdateMealLogPayload {
  intakeAmount: number;
  intakeKcal: number;
  carbohydrate: number;
  protein: number;
  fat: number;
}

// GET /api/calendar/month
export interface CalendarMonthItem {
  date: string; // 'YYYY-MM-DD'
  kcal: number | null;
  weight: number | null;
  water: number | null;
  achieved: boolean;
}

export interface CalendarMonthResponse {
  year: number;
  month: number;
  items: CalendarMonthItem[];
}

// GET /api/meal/day/log
type MealKey = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
export interface MealDayLogResponse {
  date: string;
  meals: Record<MealKey, { totalKcal: number | null; takeMeal: boolean | null }>;
  water: number | null;
  weight: number | null;
}

// POST /api/meal/log
export interface CreateMealLogPayload {
  foodId: number;
  mealLogDate: string;
  intakeAmount: number;
  intakeKcal: number;
  carbohydrate: number;
  protein: number;
  fat: number;
  mealType: MealKey;
}

// POST /api/meal/weight
export interface SaveWeightPayload {
  date: string;
  weight: number;
}

// GET /api/meal/day/insights
export interface DayInsights {
  memberId: number;
  nickname: string | null;
  age: number;
  bmi: number | null;
  bmr: number | null;
  tdee: number | null;
  recommendedCalories: number | null;
  totalProtein: number;
  totalCarbohydrate: number;
  totalFat: number;
  totalWater: number;
  totalKcal: number;
}


// --- API 함수들 ---

/**
 * 특정 날짜의 식단 로그를 가져옵니다. (MealDetail.tsx)
 * @param mealType - 'BREAKFAST', 'LUNCH' 등
 * @param date - 'YYYY-MM-DD'
 */
export const getMealLog = (mealType: string, date: string): Promise<FoodItem[]> => {
  const url = `/api/meal/log?mealType=${mealType.toUpperCase()}&date=${encodeURIComponent(date)}`;
  return defaultFetch<FoodItem[]>(url, { method: 'GET' });
};

/**
 * 특정 식단 기록을 삭제합니다. (MealDetail.tsx)
 * @param mealLogId - 삭제할 식단 로그의 ID
 */
export const deleteMealLog = (mealLogId: number): Promise<void> => {
  return defaultFetch(`/api/meal/log/${mealLogId}`, { method: 'DELETE' });
};

/**
 * 특정 식단 기록을 수정합니다. (MealDetail.tsx)
 * @param mealLogId - 수정할 식단 로그의 ID
 * @param payload - 수정할 데이터
 */
export const updateMealLog = (mealLogId: number, payload: UpdateMealLogPayload): Promise<void> => {
  return defaultFetch(`/api/meal/log/${mealLogId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};

/**
 * 특정 월의 캘린더 데이터를 가져옵니다. (RecordCalendar.tsx)
 * @param year - 년도
 * @param month - 월 (1-12)
 */
export const getCalendarForMonth = (year: number, month: number): Promise<CalendarMonthResponse> => {
  return defaultFetch(`/api/calendar/month?year=${year}&month=${month}`, { method: 'GET' });
};

/**
 * 특정 날짜의 식사/물/체중 요약 정보를 가져옵니다. (WhatIAteTab.tsx)
 * @param date - 'YYYY-MM-DD'
 */
export const getMealDayLog = (date: string): Promise<MealDayLogResponse> => {
  const reqUrl = `/api/meal/day/log?date=${encodeURIComponent(date)}`;
  return defaultFetch(reqUrl, { method: "GET" });
};

/**
 * 새로운 식단 기록(안먹었어요 포함)을 생성합니다. (WhatIAteTab.tsx)
 * @param data - 생성할 식단 데이터
 */
export const createMealLog = (data: CreateMealLogPayload): Promise<void> => {
  return defaultFetch("/api/meal/log", { method: "POST", body: data });
};

/**
 * 오늘의 체중을 저장합니다. (WhatIAteTab.tsx)
 * @param data - 날짜와 체중 데이터
 */
export const saveWeight = (data: SaveWeightPayload): Promise<void> => {
  return defaultFetch("/api/meal/weight", { method: "POST", body: data });
};

/**
 * 특정 날짜의 건강 지표(insights)를 가져옵니다. (MealRecord.tsx)
 * @param date - 'YYYY-MM-DD'
 */
export const getInsightsForDay = (date: string): Promise<DayInsights> => {
  return defaultFetch(`/api/meal/day/insights?date=${date}`, { method: 'GET' });
};
