import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check, Droplets } from "lucide-react";
import { defaultFetch } from "@/api/defaultFetch.ts";

/** 식사 카드 템플릿 데이터 */
interface MealCardData {
  id: string;                // 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'
  name: string;
  icon: React.ElementType;
  totalKcal: number;
  foods: any[];              // 요약 화면에서는 사용하지 않지만 타입 유지
  takeMeal?: boolean | null; // true=먹음, false=안먹음, null=미기록
}

/** 상위에서 내려주는 prop */
interface WhatIAteTabProps {
  /** 상위에서 YYYY-MM-DD 형태로 내려주면 이 값을 우선 사용 */
  dateKey?: string;

  // 체중
  weight: number;
  setWeight: (weight: number) => void;
  handleWeightSave: () => void;    // (선택) 상위 저장 콜백이 있다면 병행 사용 가능
  weightLoading: boolean;

  // 로딩
  loading: boolean;

  // 식사 카드 템플릿
  mealCards: MealCardData[];

  // 이벤트 콜백
  handleMealCardClick: (mealId: string, status: string) => void;
  handleAddFood: (mealType: string) => void;
  handleSkipMeal: (mealType: string) => void;

  // 물
  waterAmount: number;
  handleWaterClick: (date: string, currentAmount: number) => void;
  onWaterAmountFetched: (amount: number) => void;
}

/** API 타입 */
type MealKey = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

const normalizeMealTypeForApi = (val: string): MealKey => {
  const u = val.toUpperCase();
  if (u === "BREAKFAST" || u === "LUNCH" || u === "DINNER" || u === "SNACK") return u as MealKey;
  console.warn("[WhatIAteTab] Unknown mealType, fallback to SNACK:", val);
  return "SNACK";
};

interface MealDayResponse {
  /** ISO 또는 'YYYY-MM-DD' */
  date: string;
  meals: Record<MealKey, { totalKcal: number | null; takeMeal: boolean | null }>;
  water: number | null;   // ml
  weight: number | null;  // kg
}

const WhatIAteTab = ({
                       dateKey,
                       weight,
                       setWeight,
                       handleWeightSave,
                       weightLoading,
                       loading,
                       mealCards,
                       handleMealCardClick,
                       handleAddFood,
                       handleSkipMeal,
                       waterAmount,
                       handleWaterClick,
                       onWaterAmountFetched,
                     }: WhatIAteTabProps) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  /** 상태 계산: takeMeal만으로 결정 */
  type MealStatus = "empty" | "skipped" | "filled";
  const getMealStatus = (meal: MealCardData): MealStatus => {
    if (meal.takeMeal === false) return "skipped";
    if (meal.takeMeal === true) return "filled";
    return "empty";
  };

  /** URL ?d=YYYY-MM-DD → 없으면 오늘 날짜 */
  const dFromURL = searchParams.get("d");
  const effectiveDate = useMemo(() => {
    if (dateKey && /^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return dateKey;
    if (dFromURL && /^\d{4}-\d{2}-\d{2}$/.test(dFromURL)) return dFromURL;
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, [dateKey, dFromURL]);

  /** API 상태 */
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [cardsFromApi, setCardsFromApi] = useState<MealCardData[] | null>(null);
  const [waterFromApi, setWaterFromApi] = useState<number | null>(null);

  /** 식사/물/체중 요약 재조회 */
  const refetchMealDay = useCallback(async () => {
    setApiLoading(true);
    setApiError(null);

    const reqUrl = `/api/meal/day?date=${encodeURIComponent(effectiveDate)}`;
    try {
      const data = await defaultFetch(reqUrl, { method: "GET" });
      const res = data as MealDayResponse | undefined;
      if (!res || !res.meals) throw new Error("응답 형식이 올바르지 않습니다.");

      // 템플릿 유지 + API merge (키 대문자 보정, null → 기본값)
      const merged = mealCards.map((mc) => {
        const key = String(mc.id).toUpperCase() as MealKey;
        const fromApi = (res.meals as any)[key] as
            | { totalKcal: number | null; takeMeal: boolean | null | string | undefined }
            | undefined;

        const totalKcal = typeof fromApi?.totalKcal === "number" ? fromApi.totalKcal : 0;

        // takeMeal: 문자열/undefined → boolean|null 정규화
        let takeMeal: boolean | null = null;
        const raw = fromApi?.takeMeal;
        if (typeof raw === "boolean") takeMeal = raw;
        else if (typeof raw === "string") {
          if (raw.toLowerCase() === "true") takeMeal = true;
          else if (raw.toLowerCase() === "false") takeMeal = false;
          else takeMeal = null;
        } else {
          takeMeal = raw ?? null;
        }

        return { ...mc, totalKcal, takeMeal, foods: [] };
      });

      const waterVal = typeof res.water === "number" ? res.water : 0;
      const weightVal = typeof res.weight === "number" ? res.weight : 0;

      setCardsFromApi(merged);
      setWaterFromApi(waterVal);
      setWeight(weightVal);
      onWaterAmountFetched(waterVal);
    } catch (e: any) {
      console.error("[WhatIAteTab] /api/meal/day 실패:", e);
      setApiError(e?.message ?? "불러오기 실패");
    } finally {
      setApiLoading(false);
    }
  }, [effectiveDate, JSON.stringify(mealCards), setWeight, onWaterAmountFetched]);

  /** 최초/날짜 변경 시 재조회 */
  useEffect(() => {
    refetchMealDay();
  }, [refetchMealDay]);

  /** 디버그: 상태 테이블 */
  useEffect(() => {
    if (cardsFromApi) {
      console.table(
          cardsFromApi.map((c) => ({
            id: c.id,
            totalKcal: c.totalKcal,
            takeMeal: c.takeMeal,
            status: c.takeMeal === false ? "skipped" : c.takeMeal === true ? "filled" : "empty",
          }))
      );
    }
  }, [cardsFromApi]);

  /** 렌더 소스(보정) */
  const isLoading = loading || apiLoading;
  const cardsToShow = (cardsFromApi ?? mealCards).map((c) => ({
    ...c,
    totalKcal: typeof c.totalKcal === "number" ? c.totalKcal : 0,
    foods: Array.isArray(c.foods) ? c.foods : [],
  }));
  const waterToShow =
      typeof (waterFromApi ?? waterAmount) === "number" ? (waterFromApi ?? waterAmount) : 0;

  /** “안먹었어요” 등록 → POST /api/meal/log 후 재조회 */
  const [skipPosting, setSkipPosting] = useState<string | null>(null);
  const handleMarkSkipped = async (mealType: string) => {
    try {
      setSkipPosting(mealType);
      const body = {
        foodId: 1,
        mealLogDate: effectiveDate,
        intakeAmount: 0,
        intakeKcal: 0.0,
        carbohydrate: 0.0,
        protein: 0.0,
        fat: 0.0,
        mealType: normalizeMealTypeForApi(mealType),
      };
      await defaultFetch("/api/meal/log", { method: "POST", body });
      await refetchMealDay();
    } catch (e) {
      console.error("[WhatIAteTab] 안먹었어요 등록 실패:", e);
    } finally {
      setSkipPosting(null);
    }
  };

  /** 체중 저장: POST /api/meal/weight */
  const [savingWeight, setSavingWeight] = useState(false);
  const saveTodayWeight = useCallback(async () => {
    try {
      setSavingWeight(true);
      await defaultFetch("/api/meal/weight", {
        method: "POST",
        body: {
          date: effectiveDate,     // 'YYYY-MM-DD'
          weight: Number(weight),  // ex) 64.2
        },
      });
      // (선택) 상위 콜백이 있는 경우 함께 호출하고 싶다면 아래 주석 해제
      // await Promise.resolve(handleWeightSave?.());
      await refetchMealDay();
    } catch (e: any) {
      console.error("[WhatIAteTab] 체중 저장 실패:", e);
      setApiError(e?.message ?? "체중 저장에 실패했습니다.");
    } finally {
      setSavingWeight(false);
    }
  }, [effectiveDate, weight, refetchMealDay /*, handleWeightSave */]);

  /** 상세 이동 경로(일관화) */
  const goDetail = (mealId: string) => {
    navigate(`/meal-detail/${mealId}`);
    //navigate(`/record/meal/detail?type=${mealId}&date=${effectiveDate}`);
  };

  return (
      <div className="px-4 pt-6 pb-8 space-y-6" style={{ backgroundColor: "#fffff5" }}>
        {/* 체중 입력 카드 */}
        <Card className="shadow-sm border border-border/50 bg-gradient-to-r from-primary/5 to-secondary/10">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-foreground mb-1">오늘의 체중</h3>
                <p className="text-sm text-muted-foreground">매일 체중을 기록해보세요</p>
                <p className="text-xs text-muted-foreground mt-1">기준일: {effectiveDate}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Input
                      type="number"
                      value={weight ?? 0}
                      onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                      className="w-20 text-center text-lg font-semibold border-primary/20 focus:border-primary"
                      step="0.1"
                      min="0"
                      max="500"
                      placeholder="65.5"
                      aria-label="오늘의 체중"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveTodayWeight();
                      }}
                  />
                  <span className="text-sm font-medium text-foreground">kg</span>
                </div>

                <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4"
                    onClick={saveTodayWeight}
                    disabled={weightLoading || savingWeight}
                    aria-label="저장"
                >
                  {weightLoading || savingWeight ? "저장중..." : "저장"}
                </Button>
              </div>
            </div>

            {apiError && <p className="text-sm text-red-600 mt-2">불러오기 오류: {apiError}</p>}
          </CardContent>
        </Card>

        {/* 식사별 카드 - 2x2 그리드 */}
        {isLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4 h-32">
                      <div className="bg-muted rounded h-full" />
                    </CardContent>
                  </Card>
              ))}
            </div>
        ) : (
            <div className="grid grid-cols-2 gap-4">
              {cardsToShow.map((meal) => {
                const status = getMealStatus(meal);

                return (
                    <Card
                        key={meal.id}
                        className="cursor-pointer hover:shadow-md transition-shadow border border-border/50"
                        onClick={() => {
                          handleMealCardClick(meal.id, status);
                          if (status === "filled") goDetail(meal.id);
                        }}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="flex justify-between items-start mb-3">
                          <div className="text-primary">
                            <meal.icon size={24} />
                          </div>

                          {/* 기록됨 배지: takeMeal이 null이 아니면 표시 (true/false 모두) */}
                          {meal.takeMeal !== null && meal.takeMeal !== undefined && (
                              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                <Check size={12} className="text-white" />
                              </div>
                          )}
                        </div>

                        <div className="text-foreground font-semibold text-sm mb-2">{meal.name}</div>

                        {/* 상태별 컨텐츠 */}
                        {status === "skipped" && (
                            <div className="py-4">
                              <p className="text-muted-foreground text-sm">안먹었어요</p>
                            </div>
                        )}

                        {status === "filled" && (
                            <div className="space-y-2">
                              <div className="text-foreground font-bold text-lg">
                                {meal.totalKcal.toLocaleString()} kcal
                              </div>
                              <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full text-xs py-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddFood(meal.id);
                                    goDetail(meal.id);
                                  }}
                              >
                                음식 등록
                              </Button>
                            </div>
                        )}

                        {status === "empty" && (
                            <div className="space-y-2">
                              <p className="text-muted-foreground text-xs mb-3">아직 기록이 없어요</p>
                              <div className="space-y-1">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full text-xs py-1"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddFood(meal.id);
                                      goDetail(meal.id);
                                    }}
                                >
                                  음식 등록
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="w-full text-xs py-1 text-muted-foreground"
                                    disabled={skipPosting === meal.id}
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      await handleMarkSkipped(meal.id);
                                    }}
                                >
                                  {skipPosting === meal.id ? "등록중…" : "안먹었어요"}
                                </Button>
                              </div>
                            </div>
                        )}
                      </CardContent>
                    </Card>
                );
              })}
            </div>
        )}

        {/* 물 섭취 카드 (전체 폭) */}
        <div className="w-full">
          <Card
              className="border-none cursor-pointer transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
              style={{ backgroundColor: "#c2d595" }}
              onClick={() => handleWaterClick(effectiveDate, waterToShow)}
          >
            <CardContent className="p-6 text-center">
              <div className="flex justify-between items-start mb-4">
                <div className="text-blue-600">
                  <Droplets size={32} />
                </div>
                {waterToShow > 0 && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
                      <Check size={16} className="text-white" />
                    </div>
                )}
              </div>

              <div className="text-gray-800 mb-3 font-semibold text-lg">물</div>
              <div className="text-gray-700 font-bold text-lg">{waterToShow}ml</div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
};

export default WhatIAteTab;