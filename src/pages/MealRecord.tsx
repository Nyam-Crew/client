import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import WaterIntakeDialog from '@/components/water/WaterIntakeDialog';
import CalendarViewDialog from '@/components/meal-log/CalendarViewDialog';
import { useToast } from '@/hooks/use-toast';
import { defaultFetch } from '@/api/defaultFetch';
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

const MealRecord = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('myDay');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [mealDialogOpen, setMealDialogOpen] = useState(false);
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
  const [waterDialogOpen, setWaterDialogOpen] = useState(false);
  const [waterAmount, setWaterAmount] = useState(1200);
  const [weight, setWeight] = useState(65.5);
  const [weightLoading, setWeightLoading] = useState(false);
  const [dayData, setDayData] = useState<DayMealData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailyMissions, setDailyMissions] = useState<any[]>([]);
  const [missionsLoading, setMissionsLoading] = useState(false);

  const userInfo = {
    name: "김건강",
    height: 170,
    weight: 65.5,
    age: 25,
    gender: "male",
    activityLevel: 1.375
  };

  const calculateBMI = (weight: number, height: number) => {
    const heightInM = height / 100;
    return weight / (heightInM * heightInM);
  };

  const selectedDateStr = selectedDate.toISOString().split('T')[0];

  const calculateBMR = (weight: number, height: number, age: number, gender: string) => {
    if (gender === "male") {
      return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
  };

  const calculateTDEE = (bmr: number, activityLevel: number) => {
    return bmr * activityLevel;
  };

  const bmi = calculateBMI(userInfo.weight, userInfo.height);
  const bmr = calculateBMR(userInfo.weight, userInfo.height, userInfo.age, userInfo.gender);
  const tdee = calculateTDEE(bmr, userInfo.activityLevel);

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { text: "저체중", color: "text-blue-600" };
    if (bmi < 23) return { text: "정상", color: "text-green-600" };
    if (bmi < 25) return { text: "과체중", color: "text-yellow-600" };
    return { text: "비만", color: "text-red-600" };
  };

  const bmiCategory = getBMICategory(bmi);

  useEffect(() => {
    fetchDayData();
  }, [selectedDate]);

  useEffect(() => {
    if (activeTab === 'dailyMissions') {
      fetchDailyMissions();
    }
  }, [activeTab]);

  const fetchDayData = async () => {
    setLoading(true);
    const dateStr = selectedDate.toISOString().split('T')[0];
    const mockData: DayMealData = {
      date: dateStr,
      meals: {
        BREAKFAST: { totalKcal: 0, items: [] },
        LUNCH: { totalKcal: 499, items: [{ id: '1', name: '당근라페 샌드위치', amount: '1인분 (283g)', kcal: 499 }] },
        DINNER: { totalKcal: 0, items: [] },
        SNACK: { totalKcal: 145, items: [{ id: '2', name: '아몬드', amount: '1줌 (28g)', kcal: 145 }] }
      },
      water: 1200,
      weight: 65.4,
      summaryTotalKcal: 644
    };
    setDayData(mockData);
    setWaterAmount(mockData.water);
    if (mockData.weight) {
      setWeight(mockData.weight);
    }
    setLoading(false);
  };

  const handleMealClick = (mealId: string) => navigate(`/meal-detail/${mealId}`);
  const handleAddFood = (mealType: string) => navigate(`/food-search?mealType=${mealType}`);
  const handleWaterClick = () => setWaterDialogOpen(true);

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
      const data = await defaultFetch('/api/missions/today');
      setDailyMissions(data);
    } catch (error) {
      console.error(error);
      toast({ title: "오류", description: "데일리 미션을 불러오는데 실패했습니다.", variant: "destructive" });
    } finally {
      setMissionsLoading(false);
    }
  };

  const handleMissionComplete = async (dailyMissionId: number) => {
    try {
      await defaultFetch(`/api/missions/${dailyMissionId}/complete`, {
        method: 'POST',
        body: { complete: true }, // 미션 완료 요청이므로 true를 보냅니다.
      });

      setDailyMissions(prev => prev.map(m => m.dailyMissionId === dailyMissionId ? { ...m, completed: true } : m));
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

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  const generateDateRange = () => {
    const dates = [];
    for (let i = -3; i <= 3; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };
  const dateRange = generateDateRange();

  const todayStats = dayData ? {
    calories: { current: dayData.summaryTotalKcal, target: Math.round(tdee), remaining: Math.round(tdee - dayData.summaryTotalKcal) },
    carbs: { percentage: 46, current: 78, target: 163 },
    protein: { percentage: 14, current: 23, target: 51 },
    fat: { percentage: 40, current: 30, target: 32 }
  } : {
    calories: { current: 0, target: Math.round(tdee), remaining: Math.round(tdee) },
    carbs: { percentage: 0, current: 0, target: 163 },
    protein: { percentage: 0, current: 0, target: 51 },
    fat: { percentage: 0, current: 0, target: 32 }
  };

  const mealCards = dayData ? [
    { id: 'breakfast', name: '아침', icon: Sun, totalKcal: dayData.meals.BREAKFAST.totalKcal, foods: dayData.meals.BREAKFAST.items || [] },
    { id: 'lunch', name: '점심', icon: Mountain, totalKcal: dayData.meals.LUNCH.totalKcal, foods: dayData.meals.LUNCH.items || [] },
    { id: 'dinner', name: '저녁', icon: Moon, totalKcal: dayData.meals.DINNER.totalKcal, foods: dayData.meals.DINNER.items || [] },
    { id: 'snack', name: '간식', icon: Apple, totalKcal: dayData.meals.SNACK.totalKcal, foods: dayData.meals.SNACK.items || [] }
  ] : [];

  return (
      <div className="min-h-screen bg-gray-50" style={{ backgroundColor: '#fffff5' }}>
        <div className="bg-white px-4 py-3 border-b">
          <div className="flex items-center justify-between mb-3">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1}월</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={() => navigate('/record/calendar')} className="p-2">
              <Calendar size={24} className="text-gray-600" />
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <ChevronLeft size={24} className="text-gray-600" />
            <div className="flex gap-1 overflow-x-auto">
              {dateRange.map((date, index) => {
                const isToday = date.toDateString() === new Date().toDateString();
                const isSelected = date.toDateString() === selectedDate.toDateString();
                const isDisabled = activeTab === 'dailyMissions' && !isToday;
                return (
                    <button
                        key={index}
                        onClick={() => !isDisabled && setSelectedDate(date)}
                        disabled={isDisabled}
                        className={`flex flex-col items-center px-3 py-2 rounded-lg min-w-[50px] ${
                            isDisabled ? 'text-gray-300 cursor-not-allowed' : isSelected ? 'bg-gray-800 text-white' : isToday ? 'bg-gray-200 text-gray-800' : 'text-gray-600'
                        }`}>
                      <span className="text-xs">{weekDays[date.getDay()]}</span>
                      <span className="text-sm font-semibold">{date.getDate()}</span>
                    </button>
                );
              })}
            </div>
            <ChevronRight size={24} className="text-gray-600" />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="myDay" className="flex items-center gap-2">
              <ClipboardList size={16} />
              <span>나의 하루</span>
            </TabsTrigger>
            <TabsTrigger value="whatIAte" className="flex items-center gap-2">
              <Utensils size={16} />
              <span>먹었어요</span>
            </TabsTrigger>
            <TabsTrigger value="dailyMissions" className="flex items-center gap-2">
              <Target size={16} />
              <span>데일리 미션</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="myDay">
            <MyDayTab userInfo={userInfo} bmi={bmi} bmiCategory={bmiCategory} bmr={bmr} tdee={tdee} todayStats={todayStats} />
          </TabsContent>
          <TabsContent value="whatIAte">
            <WhatIAteTab dateKey={selectedDate.toISOString().split('T')[0]} weight={weight} setWeight={setWeight} handleWeightSave={handleWeightSave} weightLoading={weightLoading} loading={loading} mealCards={mealCards} handleMealCardClick={handleMealCardClick} handleAddFood={handleAddFood} handleSkipMeal={handleSkipMeal} waterAmount={waterAmount} handleWaterClick={handleWaterClick} onWaterAmountFetched={setWaterAmount} />
          </TabsContent>
          <TabsContent value="dailyMissions">
            <DailyMissionsTab dailyMissions={dailyMissions} missionsLoading={missionsLoading} handleMissionComplete={handleMissionComplete} />
          </TabsContent>
        </Tabs>

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
                <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-3" onClick={() => { setMealDialogOpen(false); handleAddFood(selectedMeal || ''); }} disabled={!selectedMeal || (dayData && hasFoodItems(dayData.meals[selectedMeal.toUpperCase() as keyof typeof dayData.meals]?.items || []))}>
                  음식 등록
                </Button>
                <Button variant="outline" className="px-4 py-3 border-muted text-muted-foreground hover:bg-muted/10" onClick={() => handleSkipMeal(selectedMeal || '')} disabled={!selectedMeal || (dayData && hasFoodItems(dayData.meals[selectedMeal.toUpperCase() as keyof typeof dayData.meals]?.items || []))}>
                  안먹었어요
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <WaterIntakeDialog open={waterDialogOpen} onOpenChange={setWaterDialogOpen} currentAmount={waterAmount} selectedDate={selectedDateStr} onSave={handleWaterSave} />
        <CalendarViewDialog open={calendarDialogOpen} onOpenChange={setCalendarDialogOpen} />
      </div>
  );
};

export default MealRecord;
