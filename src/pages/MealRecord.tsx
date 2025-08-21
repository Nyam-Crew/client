import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MealCard from '@/components/meal/MealCard';
import WaterIntakeDialog from '@/components/water/WaterIntakeDialog';
import CalendarViewDialog from '@/components/meal/CalendarViewDialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Check,
  Sun,
  Mountain,
  Moon,
  Apple,
  Droplets,
  ChevronLeft,
  ChevronRight,
  X,
  Utensils,
  Calendar,
  Target,
  CheckCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [waterDialogOpen, setWaterDialogOpen] = useState(false);
  const [waterAmount, setWaterAmount] = useState(1200);
  const [weight, setWeight] = useState(65.5);
  const [weightLoading, setWeightLoading] = useState(false);
  const [dayData, setDayData] = useState<DayMealData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailyMissions, setDailyMissions] = useState<any[]>([]);
  const [missionsLoading, setMissionsLoading] = useState(false);

  // Fetch daily meal data
  useEffect(() => {
    fetchDayData();
  }, [selectedDate]);

  // Fetch daily missions when tab is active
  useEffect(() => {
    if (activeTab === 'dailyMissions') {
      fetchDailyMissions();
    }
  }, [activeTab]);

  const fetchDayData = async () => {
    try {
      setLoading(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      // TODO: Replace with actual API call
      // const response = await fetch(`http://localhost:8080/api/meal/day?date=${dateStr}`);
      // const data = await response.json();
      
      // Mock data for now
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
    } catch (error) {
      console.error('Failed to fetch day data:', error);
      toast({
        title: "오류",
        description: "데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMealClick = (mealId: string) => {
    navigate(`/meal-detail/${mealId}`);
  };

  const handleAddFoodClick = () => {
    navigate('/food-search');
  };

  const handleAddFood = (mealType: string) => {
    navigate(`/food-search?mealType=${mealType}`);
  };

  const handleToggleExpand = (mealId: string) => {
    setExpandedMeal(expandedMeal === mealId ? null : mealId);
  };

  const handleEditFood = (foodId: string) => {
    console.log('Edit food:', foodId);
    // TODO: Implement edit functionality
  };

  const handleDeleteFood = (foodId: string) => {
    console.log('Delete food:', foodId);
    // TODO: Implement delete functionality with confirmation
  };

  const handleWaterClick = () => {
    setWaterDialogOpen(true);
  };

  const handleWaterSave = async (amount: number) => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/meal/water', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ date: dateStr, amount })
      // });
      
      setWaterAmount(amount);
      
      toast({
        title: "저장 완료",
        description: "물 섭취량이 저장되었습니다.",
      });
    } catch (error) {
      console.error('Failed to save water:', error);
      toast({
        title: "오류",
        description: "물 섭취량 저장에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleWeightSave = async () => {
    if (!weight || weight <= 0) {
      toast({
        title: "오류",
        description: "올바른 체중을 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    try {
      setWeightLoading(true);
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/meal/weight', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ weight })
      // });
      
      toast({
        title: "저장하였습니다",
        description: `체중 ${weight}kg이 저장되었습니다.`,
      });
      
      // Optionally refetch day data
      // await fetchDayData();
    } catch (error) {
      console.error('Failed to save weight:', error);
      toast({
        title: "오류",
        description: "저장에 실패했어요. 잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setWeightLoading(false);
    }
  };

  const fetchDailyMissions = async () => {
    try {
      setMissionsLoading(true);
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/missions/today');
      // const data = await response.json();
      
      // Mock data for now
      const mockMissions = [
        {
          "dailyMissionId": 1,
          "missionId": 9,
          "category": "ACTIVITY",
          "title": "요가 15분",
          "type": "MANUAL",
          "missionDate": "2025-08-21",
          "completed": false,
          "completedBy": "NONE"
        },
        {
          "dailyMissionId": 2,
          "missionId": 6,
          "category": "ACTIVITY",
          "title": "푸쉬업 20개",
          "type": "MANUAL",
          "missionDate": "2025-08-21",
          "completed": false,
          "completedBy": "NONE"
        },
        {
          "dailyMissionId": 3,
          "missionId": 5,
          "category": "ACTIVITY",
          "title": "계단 오르내리기 10분",
          "type": "MANUAL",
          "missionDate": "2025-08-21",
          "completed": true,
          "completedBy": "NONE"
        },
        {
          "dailyMissionId": 4,
          "missionId": 8,
          "category": "ACTIVITY",
          "title": "스트레칭 5분",
          "type": "MANUAL",
          "missionDate": "2025-08-21",
          "completed": false,
          "completedBy": "NONE"
        },
        {
          "dailyMissionId": 5,
          "missionId": 4,
          "category": "ACTIVITY",
          "title": "자전거 타기 20분",
          "type": "MANUAL",
          "missionDate": "2025-08-21",
          "completed": false,
          "completedBy": "NONE"
        }
      ];
      
      setDailyMissions(mockMissions);
    } catch (error) {
      console.error('Failed to fetch daily missions:', error);
      toast({
        title: "오류",
        description: "데일리 미션을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setMissionsLoading(false);
    }
  };

  const handleMissionComplete = async (dailyMissionId: number) => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/missions/${dailyMissionId}/complete`, {
      //   method: 'POST'
      // });
      
      setDailyMissions(prev => 
        prev.map(mission => 
          mission.dailyMissionId === dailyMissionId 
            ? { ...mission, completed: true }
            : mission
        )
      );
      
      toast({
        title: "완료",
        description: "미션이 완료되었습니다!",
      });
    } catch (error) {
      console.error('Failed to complete mission:', error);
      toast({
        title: "오류",
        description: "미션 완료 처리에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleSkipMeal = async (mealType: string) => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      // TODO: Replace with actual API call
      // const response = await fetch('http://localhost:8080/api/meal/log', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     foodId: 1,
      //     mealLogDate: dateStr,
      //     intakeAmount: 0,
      //     intakeKcal: 0.0,
      //     carbohydrate: 0.0,
      //     protein: 0.0,
      //     fat: 0.0,
      //     mealType: mealType.toUpperCase()
      //   })
      // });
      
      setMealDialogOpen(false);
      
      toast({
        title: "등록 완료",
        description: "안먹었어요가 등록되었습니다.",
      });
      
      // Refetch day data
      await fetchDayData();
    } catch (error) {
      console.error('Failed to skip meal:', error);
      toast({
        title: "오류", 
        description: "등록에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleMealCardClick = (mealId: string, status: string) => {
    if (status === 'empty') {
      setSelectedMeal(mealId);
      setMealDialogOpen(true);
    } else {
      handleMealClick(mealId);
    }
  };

  const hasFoodItems = (foods: any[]) => {
    return foods && foods.length > 0;
  };

  // 요일 배열
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  
  // 날짜 배열 생성 (오늘 기준 ±3일)
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

  // Calculate today's stats from dayData
  const todayStats = dayData ? {
    calories: { current: dayData.summaryTotalKcal, target: 1800 },
    carbs: { percentage: 46, current: 78, target: 163 },
    protein: { percentage: 14, current: 23, target: 51 },
    fat: { percentage: 40, current: 30, target: 32 }
  } : {
    calories: { current: 0, target: 1800 },
    carbs: { percentage: 0, current: 0, target: 163 },
    protein: { percentage: 0, current: 0, target: 51 },
    fat: { percentage: 0, current: 0, target: 32 }
  };

  // 식사별 데이터 - API 데이터 기반
  const mealCards = dayData ? [
    { 
      id: 'breakfast', 
      name: '아침', 
      icon: Sun, 
      totalKcal: dayData.meals.BREAKFAST.totalKcal,
      foods: dayData.meals.BREAKFAST.items || []
    },
    { 
      id: 'lunch', 
      name: '점심', 
      icon: Mountain, 
      totalKcal: dayData.meals.LUNCH.totalKcal,
      foods: dayData.meals.LUNCH.items || []
    },
    { 
      id: 'dinner', 
      name: '저녁', 
      icon: Moon, 
      totalKcal: dayData.meals.DINNER.totalKcal,
      foods: dayData.meals.DINNER.items || []
    },
    { 
      id: 'snack', 
      name: '간식', 
      icon: Apple, 
      totalKcal: dayData.meals.SNACK.totalKcal,
      foods: dayData.meals.SNACK.items || []
    }
  ] : [];

  const caloriePercentage = (todayStats.calories.current / todayStats.calories.target) * 100;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fffff5' }}>
      {/* 상단 월 선택 및 캘린더 바 */}
      <div className="bg-white px-4 py-3 border-b">
        <div className="flex items-center justify-between mb-3">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {i + 1}월
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/record/calendar')}
            className="p-2"
          >
            <Calendar size={24} className="text-gray-600" />
          </Button>
        </div>
        
        {/* 날짜 선택 바 */}
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
                    isDisabled
                      ? 'text-gray-300 cursor-not-allowed'
                      : isSelected 
                        ? 'bg-gray-800 text-white' 
                        : isToday 
                          ? 'bg-gray-200 text-gray-800' 
                          : 'text-gray-600'
                  }`}
                >
                  <span className="text-xs">{weekDays[date.getDay()]}</span>
                  <span className="text-sm font-semibold">{date.getDate()}</span>
                </button>
              );
            })}
          </div>
          <ChevronRight size={24} className="text-gray-600" />
        </div>
      </div>

      {/* 탭 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div style={{ backgroundColor: '#fffff5' }} className="px-4">
          <TabsList className="w-full bg-transparent border-none">
            <TabsTrigger 
              value="myDay" 
              className="flex-1 text-gray-600 rounded-lg transition-all duration-200 hover:text-gray-800 data-[state=active]:text-black"
              style={{ backgroundColor: activeTab === 'myDay' ? '#fffff5' : '#f8f7ec' }}
            >
              나의 하루
            </TabsTrigger>
            <TabsTrigger 
              value="whatIAte" 
              className="flex-1 text-gray-600 rounded-lg transition-all duration-200 hover:text-gray-800 data-[state=active]:text-black"
              style={{ backgroundColor: activeTab === 'whatIAte' ? '#fffff5' : '#f8f7ec' }}
            >
              먹었어요
            </TabsTrigger>
            <TabsTrigger 
              value="dailyMissions" 
              className="flex-1 text-gray-600 rounded-lg transition-all duration-200 hover:text-gray-800 data-[state=active]:text-black"
              style={{ backgroundColor: activeTab === 'dailyMissions' ? '#fffff5' : '#f8f7ec' }}
            >
              데일리 미션
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 나의 하루 탭 - 리디자인된 깔끔한 레이아웃 */}
        <TabsContent value="myDay" className="px-4 pt-6 pb-8 min-h-screen" style={{ backgroundColor: '#fffff5' }}>
          
          {/* 히어로 칼로리 카드 */}
          <Card className="mb-6 shadow-sm border-0 bg-white">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="text-5xl font-bold text-primary mb-2">{todayStats.calories.current}</div>
                <div className="text-lg text-muted-foreground">/ {todayStats.calories.target}kcal</div>
                <div className="text-sm text-muted-foreground mt-1">오늘 섭취한 칼로리</div>
              </div>
              
              {/* 진행바 */}
              <div className="mb-4">
                <Progress 
                  value={caloriePercentage} 
                  className="w-full h-2"
                />
              </div>
              
              {/* 남은 칼로리 배지 */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 rounded-full">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-success font-semibold text-sm">
                  {todayStats.calories.target - todayStats.calories.current}kcal 더 먹을 수 있어요
                </span>
              </div>
            </CardContent>
          </Card>
          
          {/* 영양소 비율 카드 */}
          <Card className="shadow-sm border-0 bg-white">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6 text-center">영양소 현황</h3>
              
              {/* 영양소별 정보 */}
              <div className="space-y-4">
                {/* 탄수화물 */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-warning rounded-full"></div>
                      <span className="text-sm font-medium text-foreground">탄수화물</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      {todayStats.carbs.current}/{todayStats.carbs.target}g
                    </span>
                  </div>
                  <Progress 
                    value={todayStats.carbs.percentage} 
                    className="w-full h-2"
                  />
                </div>
                
                {/* 단백질 */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-destructive rounded-full"></div>
                      <span className="text-sm font-medium text-foreground">단백질</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      {todayStats.protein.current}/{todayStats.protein.target}g
                    </span>
                  </div>
                  <Progress 
                    value={todayStats.protein.percentage} 
                    className="w-full h-2"
                  />
                </div>
                
                {/* 지방 */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <span className="text-sm font-medium text-foreground">지방</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      {todayStats.fat.current}/{todayStats.fat.target}g
                    </span>
                  </div>
                  <Progress 
                    value={todayStats.fat.percentage} 
                    className="w-full h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
        </TabsContent>

        {/* 먹었어요 탭 */}
        <TabsContent value="whatIAte" className="px-4 pt-6 pb-8 space-y-6" style={{ backgroundColor: '#fffff5' }}>
          
          {/* 체중 입력 카드 */}
          <Card className="shadow-sm border border-border/50 bg-gradient-to-r from-primary/5 to-secondary/10">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">오늘의 체중</h3>
                  <p className="text-sm text-muted-foreground">매일 체중을 기록해보세요</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                      className="w-20 text-center text-lg font-semibold border-primary/20 focus:border-primary"
                      step="0.1"
                      min="0"
                      max="500"
                      placeholder="65.5"
                      aria-label="오늘의 체중"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleWeightSave();
                        }
                      }}
                    />
                    <span className="text-sm font-medium text-foreground">kg</span>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4"
                    onClick={handleWeightSave}
                    disabled={weightLoading}
                    aria-label="저장"
                  >
                    {weightLoading ? '저장중...' : '저장'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 식사별 카드 - 2x2 그리드 */}
          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1,2,3,4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4 h-32">
                    <div className="bg-muted rounded h-full"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {mealCards.map((meal) => (
                <Card
                  key={meal.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border border-border/50"
                  onClick={() => handleMealCardClick(meal.id, meal.foods.length > 0 ? 'filled' : 'empty')}
                >
                  <CardContent className="p-4 text-center">
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-primary">
                        <meal.icon size={24} />
                      </div>
                      {meal.foods.length > 0 && (
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="text-foreground font-semibold text-sm mb-2">{meal.name}</div>
                    
                     {meal.foods.length > 0 ? (
                      <div className="text-foreground font-bold text-lg">{meal.totalKcal} kcal</div>
                    ) : (
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
                            }}
                          >
                            음식 등록
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-full text-xs py-1 text-muted-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSkipMeal(meal.id);
                            }}
                          >
                            안먹었어요
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* 물 섭취 카드 (전체 폭) */}
          <div className="w-full">
            <Card 
              className="border-none cursor-pointer transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl" 
              style={{ backgroundColor: '#c2d595' }}
              onClick={() => handleWaterClick()}
            >
              <CardContent className="p-6 text-center">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-blue-600">
                    <Droplets size={32} />
                  </div>
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
                    <Check size={16} className="text-white" />
                  </div>
                </div>
                
                <div className="text-gray-800 mb-3 font-semibold text-lg">물</div>
                <div className="text-gray-700 font-bold text-lg">{waterAmount}ml</div>
              </CardContent>
            </Card>
          </div>

        </TabsContent>

        {/* 데일리 미션 탭 */}
        <TabsContent value="dailyMissions" className="px-4 pt-6 pb-8 space-y-4" style={{ backgroundColor: '#fffff5' }}>
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-foreground mb-2">오늘의 미션</h2>
            <p className="text-sm text-muted-foreground">
              완료한 미션: {dailyMissions.filter(m => m.completed).length} / {dailyMissions.length}
            </p>
          </div>

          {missionsLoading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map((i) => (
                <Card key={i} className="animate-pulse border border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-muted"></div>
                        <div className="h-4 bg-muted rounded w-32"></div>
                      </div>
                      <div className="h-8 bg-muted rounded w-16"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {dailyMissions.map((mission) => (
                <Card key={mission.dailyMissionId} className="border border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          mission.completed 
                            ? 'bg-green-500 text-white' 
                            : 'border-2 border-gray-300'
                        }`}>
                          {mission.completed && <Check size={16} />}
                        </div>
                        <span className={`font-medium ${
                          mission.completed 
                            ? 'text-green-600 line-through' 
                            : 'text-foreground'
                        }`}>
                          {mission.title}
                        </span>
                      </div>
                      <Button
                        variant={mission.completed ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleMissionComplete(mission.dailyMissionId)}
                        disabled={mission.completed}
                        className={mission.completed ? "text-green-600 border-green-200" : ""}
                      >
                        {mission.completed ? '완료됨' : '완료'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* 미션 완료 현황 */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-6 text-center">
              <Target className="mx-auto mb-3 text-green-600" size={32} />
              <h3 className="font-semibold text-lg mb-2">
                {dailyMissions.filter(m => m.completed).length === dailyMissions.length 
                  ? '🎉 모든 미션 완료!' 
                  : '오늘도 화이팅!'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {dailyMissions.filter(m => m.completed).length === dailyMissions.length
                  ? '모든 미션을 완료했습니다. 정말 대단해요!'
                  : `${dailyMissions.length - dailyMissions.filter(m => m.completed).length}개의 미션이 남았어요.`}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 식사 등록 팝업 */}
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMealDialogOpen(false)}
              className="p-2"
            >
              <X size={20} />
            </Button>
          </DialogHeader>

          {/* 추가한 음식 리스트 영역 */}
          <div className="flex-1 py-6">
            {/* 빈 상태 */}
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Utensils size={32} className="text-gray-400" />
              </div>
              <div className="text-gray-500 text-sm">음식 사진 추가</div>
            </div>

            {/* 추가한 음식 정보 */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-blue-600 font-medium">추가한 음식 1</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-sm">시간 입력</Button>
                  <Button variant="outline" size="sm" className="text-sm">세트 저장</Button>
                </div>
              </div>

              {/* 샘플 음식 항목 */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-800">당근라페 샌드위치</div>
                    <div className="text-sm text-gray-600">1인분 (283g)</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">499 kcal</span>
                    <Button variant="ghost" size="sm" className="p-1">
                      <X size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 하단 총 칼로리 및 영양소 정보 */}
          <div className="border-t pt-4 pb-6">
            {/* 총 칼로리 */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-bold">총 499kcal</span>
              <Button variant="ghost" size="sm" className="text-blue-600">
                영양소 상세 →
              </Button>
            </div>

            {/* 영양소 비율 바 */}
            <div className="mb-4">
              <div className="flex gap-1 h-2 rounded-full overflow-hidden mb-2">
                <div className="bg-black flex-[45]"></div>
                <div className="bg-yellow-400 flex-[16]"></div>
                <div className="bg-blue-600 flex-[39]"></div>
              </div>
              <div className="flex justify-between text-sm">
                <span>• 순탄수 59g</span>
                <span>• 단백질 21g</span>
                <span>• 지방 23g</span>
              </div>
            </div>

            {/* 음식 추가 및 안먹었어요 버튼 */}
            <div className="flex gap-2">
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-3"
                onClick={() => {
                  setMealDialogOpen(false);
                  handleAddFood(selectedMeal || '');
                }}
                disabled={!selectedMeal || (dayData && hasFoodItems(dayData.meals[selectedMeal.toUpperCase() as keyof typeof dayData.meals]?.items || []))}
              >
                음식 등록
              </Button>
              <Button 
                variant="outline"
                className="px-4 py-3 border-muted text-muted-foreground hover:bg-muted/10"
                onClick={() => handleSkipMeal(selectedMeal || '')}
                disabled={!selectedMeal || (dayData && hasFoodItems(dayData.meals[selectedMeal.toUpperCase() as keyof typeof dayData.meals]?.items || []))}
              >
                안먹었어요
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 물 섭취량 다이얼로그 */}
      <WaterIntakeDialog
        open={waterDialogOpen}
        onOpenChange={setWaterDialogOpen}
        currentAmount={waterAmount}
        onSave={handleWaterSave}
      />

      {/* 캘린더 뷰 다이얼로그 */}
      <CalendarViewDialog
        open={calendarDialogOpen}
        onOpenChange={setCalendarDialogOpen}
      />
    </div>
  );
};

export default MealRecord;