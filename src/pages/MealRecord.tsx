import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import WaterIntakeDialog from '@/components/water/WaterIntakeDialog';
import CalendarViewDialog from '@/components/meal-log/CalendarViewDialog';
import { useToast } from '@/hooks/use-toast';
import { getInsightsForDay, DayInsights } from '@/api/mealApi';
import { getTodayMissions, completeMission, Mission } from '@/api/missions';
import {
  Sun,
  Mountain,
  Moon,
  Apple,
  ChevronLeft,
  ChevronRight,
  X,
  Utensils,
  Calendar,
  ClipboardList,
  Target
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MyDayTab from '@/components/meal-log/MyDayTab';
import WhatIAteTab from '@/components/meal-log/WhatIAteTab';
import DailyMissionsTab from '@/components/meal-log/DailyMissionsTab';
import { useNavigate, useSearchParams } from 'react-router-dom';


interface DayMealData {
  date: string;
  meals: {
    BREAKFAST: { totalKcal: number; items?: any[] };
    LUNCH: { totalKcal: number; items?: any[] };
    DINNER: { totalKcal: number; items?: any[] };
    SNACK: { totalKcal: number; items?: any[] };
  };
  water: number;
  weight?: number;
  summaryTotalKcal: number;
  meta?: {
    updatedAt: string;
    etag: string;
  };
}

const addDays = (d: Date, days: number) => {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + days);
  return nd;
};
const clampToMonth = (year: number, monthIndex0: number, day: number) => {
  const last = new Date(year, monthIndex0 + 1, 0).getDate();
  return Math.min(day, last);
};

const MealRecord = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // 탭/날짜/주 네비 상태
  const [activeTab, setActiveTab] = useState('myDay');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekAnchor, setWeekAnchor] = useState(new Date()); // 주(7일) 뷰의 기준일
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [searchParams, setSearchParams] = useSearchParams();

  // 기타 상태
  const [selectedMeal] = useState<string | null>(null);
  const [mealDialogOpen, setMealDialogOpen] = useState(false);
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
  const [waterDialogOpen, setWaterDialogOpen] = useState(false);
  const [waterAmount, setWaterAmount] = useState(1200);
  const [weight, setWeight] = useState(65.5);
  const [weightLoading, setWeightLoading] = useState(false);
  const [dayData, setDayData] = useState<DayMealData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailyMissions, setDailyMissions] = useState<Mission[]>([]);
  const [missionsLoading, setMissionsLoading] = useState(false);
  const [insights, setInsights] = useState<DayInsights | null>(null);

  const selectedDateStr = useMemo(
      () => selectedDate.toISOString().split('T')[0],
      [selectedDate]
  );

  useEffect(() => {
    fetchDayData();
  }, [selectedDate]);

  useEffect(() => {
    if (activeTab === 'dailyMissions') fetchDailyMissions();
  }, [activeTab]);

  useEffect(() => {
    setWeekAnchor(selectedDate);
    setSelectedYear(String(selectedDate.getFullYear()));
    setSelectedMonth(String(selectedDate.getMonth() + 1));
  }, [selectedDate]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    const d = searchParams.get('d');

    if (tab && ['myDay', 'whatIAte', 'dailyMissions'].includes(tab) && tab !== activeTab) {
      setActiveTab(tab);
    }
    if (d) {
      const parsed = new Date(d);
      if (!isNaN(parsed.getTime())) setSelectedDate(parsed);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', activeTab);
    params.set('d', selectedDateStr);
    setSearchParams(params, { replace: true });
  }, [activeTab, selectedDateStr]);

  useEffect(() => {
    const y = Number(selectedYear);
    const mIdx = Number(selectedMonth) - 1;
    const d = clampToMonth(y, mIdx, selectedDate.getDate());

    if (
        selectedDate.getFullYear() !== y ||
        selectedDate.getMonth() !== mIdx ||
        selectedDate.getDate() !== d
    ) {
      setSelectedDate(new Date(y, mIdx, d));
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const data = await getInsightsForDay(selectedDateStr);
        setInsights(data);
      } catch (e) {
        console.error('failed to fetch insights', e);
        setInsights(null);
      }
    };
    fetchInsights();
  }, [selectedDateStr]);

  const fetchDayData = async () => {
    setLoading(true);
    const dateStr = selectedDate.toISOString().split('T')[0];
    // TODO: This is mock data. Replace with a real API call if available.
    const mockData: DayMealData = {
      date: dateStr,
      meals: {
        BREAKFAST: { totalKcal: 0, items: [] },
        LUNCH: {
          totalKcal: 499,
          items: [{ id: '1', name: '당근라페 샌드위치', amount: '1인분 (283g)', kcal: 499 }]
        },
        DINNER: { totalKcal: 0, items: [] },
        SNACK: {
          totalKcal: 145,
          items: [{ id: '2', name: '아몬드', amount: '1줌 (28g)', kcal: 145 }]
        }
      },
      water: 1200,
      weight: 65.4,
      summaryTotalKcal: 644
    };
    setDayData(mockData);
    setWaterAmount(mockData.water);
    if (mockData.weight) setWeight(mockData.weight);
    setLoading(false);
  };

  const handleMealClick = (mealId: string) =>
      navigate(`/meal-detail/${mealId}?d=${selectedDateStr}`);
  const handleAddFood = (mealType: string) =>
      navigate(`/food-search?mealType=${mealType}&d=${selectedDateStr}`);

  const handleWaterSave = async (amount: number) => {
    setWaterAmount(amount);
    toast({ title: "저장 완료", description: "물 섭취량이 저장되었습니다." });
  };
  const handleWeightSave = async () => {
    if (!weight || weight <= 0) {
      toast({ title: "오류", description: "올바른 체중을 입력해주세요", variant: "destructive" });
      return;
    }
    setWeightLoading(true);
    toast({ title: "저장하였습니다", description: `체중 ${weight}kg이 저장되었습니다.` });
    setWeightLoading(false);
  };

  const fetchDailyMissions = async () => {
    setMissionsLoading(true);
    try {
      const data = await getTodayMissions();
      setDailyMissions(data);
    } catch (error) {
      console.error(error);
      toast({
        title: "오류",
        description: "데일리 미션을 불러오는데 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setMissionsLoading(false);
    }
  };

  const handleMissionComplete = async (dailyMissionId: number) => {
    try {
      await completeMission(dailyMissionId);
      setDailyMissions(prev =>
          prev.map(m => (m.dailyMissionId === dailyMissionId ? { ...m, completed: true } : m))
      );
      toast({ title: "완료", description: "미션이 완료되었습니다!" });
    } catch (error) {
      console.error(error);
      toast({ title: "오류", description: "미션 완료에 실패했습니다.", variant: "destructive" });
    }
  };

  const handleSkipMeal = async (mealType: string) => {
    setMealDialogOpen(false);
    toast({ title: "등록 완료", description: "'안먹었어요'가 등록되었습니다." });
    await fetchDayData();
  };

  const handleMealCardClick = (mealId: string, status: string) => {
    if (status !== 'empty') handleMealClick(mealId);
  };

  const hasFoodItems = (foods: any[]) => foods && foods.length > 0;

  const dateRange = (() => {
    const arr: Date[] = [];
    for (let i = -3; i <= 3; i++) arr.push(addDays(weekAnchor, i));
    return arr;
  })();
  const goPrevWeek = () => setWeekAnchor(addDays(weekAnchor, -7));
  const goNextWeek = () => setWeekAnchor(addDays(weekAnchor, +7));

  const consumedKcal = insights?.totalKcal ?? 0;
  const targetKcal   = insights?.recommendedCalories ?? 0;

  const remainingKcal = targetKcal > 0 ? Math.round(targetKcal - consumedKcal) : 0;

  const carbsPct =
      consumedKcal > 0 && insights
          ? (insights.totalCarbohydrate * 4 * 100) / consumedKcal
          : 0;
  const proteinPct =
      consumedKcal > 0 && insights
          ? (insights.totalProtein * 4 * 100) / consumedKcal
          : 0;
  const fatPct =
      consumedKcal > 0 && insights
          ? (insights.totalFat * 9 * 100) / consumedKcal
          : 0;
  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { text: "저체중", color: "text-blue-500" };
    if (bmi < 23) return { text: "정상", color: "text-green-500" };
    if (bmi < 25) return { text: "과체중", color: "text-yellow-500" };
    return { text: "비만", color: "text-red-500" };
  };

  const todayStats = {
    calories: {
      current: consumedKcal,
      target: targetKcal,
      remaining: remainingKcal,
    },
    carbs:   { percentage: Math.max(0, Math.min(100, carbsPct)),   current: insights?.totalCarbohydrate ?? 0, target: 0 },
    protein: { percentage: Math.max(0, Math.min(100, proteinPct)), current: insights?.totalProtein ?? 0,      target: 0 },
    fat:     { percentage: Math.max(0, Math.min(100, fatPct)),     current: insights?.totalFat ?? 0,          target: 0 },
  };

  const mealCards = dayData
      ? [
        { id: 'breakfast', name: '아침', icon: Sun, totalKcal: dayData.meals.BREAKFAST.totalKcal, foods: dayData.meals.BREAKFAST.items || [] },
        { id: 'lunch', name: '점심', icon: Mountain, totalKcal: dayData.meals.LUNCH.totalKcal, foods: dayData.meals.LUNCH.items || [] },
        { id: 'dinner', name: '저녁', icon: Moon, totalKcal: dayData.meals.DINNER.totalKcal, foods: dayData.meals.DINNER.items || [] },
        { id: 'snack', name: '간식', icon: Apple, totalKcal: dayData.meals.SNACK.totalKcal, foods: dayData.meals.SNACK.items || [] }
      ]
      : [];

  return (
      <div className="min-h-screen bg-gray-50" style={{ backgroundColor: '#fffff5' }}>
        {/* 상단 바 */}
        <div className="px-4 py-3 border-b" style={{ backgroundColor: '#fffff5' }}>
          {/* 연/월 셀렉트 + 캘린더 버튼 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {/* 연도 */}
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 11 }, (_, i) => {
                    const year = new Date().getFullYear() - 5 + i;
                    return (
                        <SelectItem key={year} value={String(year)}>
                          {year}년
                        </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {/* 월 */}
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>
                        {i + 1}월
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 오늘 버튼 */}
              <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const today = new Date();
                    setSelectedDate(today);
                    setWeekAnchor(today);
                  }}
              >
                오늘
              </Button>
            </div>

            <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/record/calendar')}
                className="p-2"
            >
              <Calendar size={24} className="text-gray-600" />
            </Button>
          </div>

          {/* 주 단위 네비게이션 */}
          <div className="flex items-center justify-between">
            <button onClick={goPrevWeek} className="p-2 hover:opacity-80">
              <ChevronLeft size={24} className="text-gray-600" />
            </button>

            <div className="flex gap-1 overflow-x-auto">
              {dateRange.map((date, idx) => {
                const isToday = date.toDateString() === new Date().toDateString();
                const isSelected = date.toDateString() === selectedDate.toDateString();
                const isDisabled = activeTab === 'dailyMissions' && !isToday;
                return (
                    <button
                        key={idx}
                        onClick={() => !isDisabled && setSelectedDate(date)}
                        disabled={isDisabled}
                        className={`flex flex-col items-center px-3 py-2 rounded-lg min-w-[50px] ${
                            isDisabled
                                ? 'text-gray-300 cursor-not-allowed'
                                : isSelected
                                    ? 'bg-gray-800 text-white'
                                    : isToday
                                        ? 'bg-gray-200 text-gray-800'
                                        : 'text-gray-600'
                        }`}
                    >
                      <span className="text-xs">{['일','월','화','수','목','금','토'][date.getDay()]}</span>
                      <span className="text-sm font-semibold">{date.getDate()}</span>
                    </button>
                );
              })}
            </div>

            <button onClick={goNextWeek} className="p-2 hover:opacity-80">
              <ChevronRight size={24} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* 탭 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="myDay" className="flex items-center gap-2">
              <ClipboardList size={16} />
              <span>나의 하루</span>
            </TabsTrigger>
            <TabsTrigger value="whatIAte" className="flex items-center gap-2">
              <Utensils size={16} />
              <span>기록</span>
            </TabsTrigger>
            <TabsTrigger value="dailyMissions" className="flex items-center gap-2">
              <Target size={16} />
              <span>데일리 미션</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="myDay">
            <MyDayTab
                userInfo={{ name: insights?.nickname ?? '사용자' }}
                bmi={insights?.bmi ?? null}
                bmiCategory={insights?.bmi ? getBmiCategory(insights.bmi) : { text: "", color: "text-gray-400" }}
                bmr={insights?.bmr ?? null}
                tdee={insights?.tdee ?? null}
                todayStats={todayStats}

                waterMl={insights?.totalWater ?? null}   // 서버에서 주는 총 물(ml)
                waterGoalMl={1000}                       // 목표 물(원하면 1000 고정 또는 사용자 설정값)
                profileWeightKg={insights?.profileWeight ?? null}
                todayWeightKg={insights?.todayWeight ?? null}
            />
          </TabsContent>

          <TabsContent value="whatIAte">
            <WhatIAteTab
                dateKey={selectedDateStr}
                weight={weight}
                setWeight={setWeight}
                handleWeightSave={handleWeightSave}
                weightLoading={weightLoading}
                loading={loading}
                mealCards={mealCards}
                handleMealCardClick={handleMealCardClick}
                handleAddFood={handleAddFood}
                handleSkipMeal={handleSkipMeal}
                waterAmount={waterAmount}
                handleWaterClick={(date, current) => {
                  setWaterAmount(current);
                  setWaterDialogOpen(true);
                }}
                onWaterAmountFetched={setWaterAmount}
            />
          </TabsContent>

          <TabsContent value="dailyMissions">
            <DailyMissionsTab
                dailyMissions={dailyMissions}
                missionsLoading={missionsLoading}
                handleMissionComplete={handleMissionComplete}
            />
          </TabsContent>
        </Tabs>

        {/* 식사 등록 다이얼로그 */}
        <Dialog open={mealDialogOpen} onOpenChange={setMealDialogOpen}>
          <DialogContent className="w-[90%] max-w-md h-[80vh] flex flex-col">
            <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  {selectedMeal === 'lunch' && <Mountain size={20} className="text-green-600" />}
                  {selectedMeal === 'breakfast' && <Sun size={20} className="text-green-600" />}
                  {selectedMeal === 'dinner' && <Moon size={20} className="text-green-600" />}
                  {selectedMeal === 'snack' && <Apple size={20} className="text-green-600" />}
                </div>
                <DialogTitle className="text-lg font-semibold">
                  {selectedMeal === 'breakfast' && '아침'}
                  {selectedMeal === 'lunch' && '점심'}
                  {selectedMeal === 'dinner' && '저녁'}
                  {selectedMeal === 'snack' && '간식'}
                </DialogTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setMealDialogOpen(false)} className="p-2">
                <X size={20} />
              </Button>
            </DialogHeader>

            <div className="flex-1 py-6">
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Utensils size={32} className="text-gray-400" />
                </div>
                <div className="text-gray-500 text-sm">음식 사진 추가</div>
              </div>
            </div>

            <div className="border-t pt-4 pb-6">
              <div className="flex gap-2">
                <Button
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-3"
                    onClick={() => {
                      setMealDialogOpen(false);
                      if (selectedMeal) navigate(`/food-search?mealType=${selectedMeal}&d=${selectedDateStr}`);
                    }}
                    disabled={
                        !selectedMeal ||
                        (dayData && hasFoodItems(dayData.meals[selectedMeal.toUpperCase() as keyof typeof dayData.meals]?.items || []))
                    }
                >
                  음식 등록
                </Button>

                <Button
                    variant="outline"
                    className="px-4 py-3 border-muted text-muted-foreground hover:bg-muted/10"
                    onClick={() => selectedMeal && handleSkipMeal(selectedMeal)}
                    disabled={
                        !selectedMeal ||
                        (dayData && hasFoodItems(dayData.meals[selectedMeal.toUpperCase() as keyof typeof dayData.meals]?.items || []))
                    }
                >
                  안먹었어요
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* 물/캘린더 다이얼로그 */}
        <WaterIntakeDialog
            open={waterDialogOpen}
            onOpenChange={setWaterDialogOpen}
            currentAmount={waterAmount}
            selectedDate={selectedDateStr}
            onSave={handleWaterSave}
        />
        <CalendarViewDialog
            open={calendarDialogOpen}
            onOpenChange={setCalendarDialogOpen}
        />
      </div>
  );
};

export default MealRecord;