import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Check,
  Sun,
  Mountain,
  Moon,
  Apple,
  Droplets,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const MealRecord = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('myDay');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [mealDialogOpen, setMealDialogOpen] = useState(false);

  const handleMealClick = (mealId: string) => {
    navigate(`/meal/${mealId}`);
  };

  const handleAddFoodClick = () => {
    navigate('/food-search');
  };

  const handleMealCardClick = (mealId: string, status: string) => {
    if (status === 'empty') {
      setSelectedMeal(mealId);
      setMealDialogOpen(true);
    } else {
      handleMealClick(mealId);
    }
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

  // 오늘의 영양소 데이터
  const todayStats = {
    calories: { current: 644, target: 1144 },
    carbs: { percentage: 46, current: 78, target: 163 },
    protein: { percentage: 14, current: 23, target: 51 },
    fat: { percentage: 40, current: 30, target: 32 }
  };

  // 식사별 데이터 (물 섭취 추가)
  const meals = [
    { id: 'breakfast', name: '아침', icon: Sun, status: 'completed', calories: null },
    { id: 'lunch', name: '점심', icon: Mountain, status: 'completed', calories: 499 },
    { id: 'dinner', name: '저녁', icon: Moon, status: 'empty', calories: null },
    { id: 'snack', name: '간식', icon: Apple, status: 'completed', calories: 145 },
    { id: 'water', name: '물', icon: Droplets, status: 'completed', amount: '1200ml' }
  ];

  const caloriePercentage = (todayStats.calories.current / todayStats.calories.target) * 100;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ffffe1' }}>
      {/* 상단 날짜 선택 바 */}
      <div className="bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <ChevronLeft size={24} className="text-gray-600" />
          <div className="flex gap-1 overflow-x-auto">
            {dateRange.map((date, index) => {
              const isToday = date.toDateString() === new Date().toDateString();
              const isSelected = date.toDateString() === selectedDate.toDateString();
              
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`flex flex-col items-center px-3 py-2 rounded-lg min-w-[50px] ${
                    isSelected 
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
        <div style={{ backgroundColor: '#fef1c1' }} className="px-4">
          <TabsList className="w-full bg-transparent border-none">
            <TabsTrigger 
              value="myDay" 
              className="flex-1 text-gray-800 bg-transparent data-[state=active]:bg-gray-800 data-[state=active]:text-white rounded-lg"
            >
              나의 하루
            </TabsTrigger>
            <TabsTrigger 
              value="whatIAte" 
              className="flex-1 text-gray-800 bg-transparent data-[state=active]:bg-gray-800 data-[state=active]:text-white rounded-lg"
            >
              먹었어요
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 나의 하루 탭 */}
        <TabsContent value="myDay" className="px-4 pt-6 space-y-6" style={{ backgroundColor: '#ffffe1' }}>

          {/* 칼로리 메인 표시 */}
          <div className="text-center text-gray-800">
            <div className="text-5xl font-bold mb-4 text-gray-800">
              {todayStats.calories.current}
              <span className="text-2xl text-gray-600">/{todayStats.calories.target}kcal</span>
            </div>
            
            {/* 매크로 영양소 퍼센트 */}
            <div className="flex justify-center gap-8 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-400 rounded-full"></div>
                <span className="text-gray-800 font-medium">탄 {todayStats.carbs.percentage}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                <span className="text-gray-800 font-medium">단 {todayStats.protein.percentage}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                <span className="text-gray-800 font-medium">지 {todayStats.fat.percentage}%</span>
              </div>
            </div>

            {/* 캐릭터 이미지 영역 (이미지 대신 이모지 사용) */}
            <div className="mb-6 py-8">
              <div className="text-6xl">💪</div>
            </div>

            {/* 칼로리 정보 */}
            <div className="text-center mb-6 text-gray-800">
              <div className="flex justify-center items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  🔥 {todayStats.calories.target - todayStats.calories.current}kcal 소모
                </span>
                <span>|</span>
                <span className="text-green-700">
                  {todayStats.calories.target - todayStats.calories.current}kcal 더 먹을 수 있어요
                </span>
              </div>
            </div>

            {/* 상세 영양소 */}
            <div className="space-y-4 text-gray-800">
              <div className="flex justify-between items-center">
                <span>순탄수</span>
                <div className="text-right flex items-center gap-3">
                  <span className="font-bold">{todayStats.carbs.current}/{todayStats.carbs.target}g</span>
                  <Progress value={todayStats.carbs.percentage} className="w-24 h-2" />
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span>단백질</span>
                <div className="text-right flex items-center gap-3">
                  <span className="font-bold">{todayStats.protein.current}/{todayStats.protein.target}g</span>
                  <Progress value={todayStats.protein.percentage} className="w-24 h-2" />
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span>지방</span>
                <div className="text-right flex items-center gap-3">
                  <span className="font-bold">{todayStats.fat.current}/{todayStats.fat.target}g</span>
                  <Progress value={todayStats.fat.percentage} className="w-24 h-2" />
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span>물 섭취</span>
                <div className="text-right flex items-center gap-3">
                  <span className="font-bold">1200ml</span>
                  <div className="w-24 h-2 bg-blue-100 rounded-full">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* 먹었어요 탭 */}
        <TabsContent value="whatIAte" className="px-4 pt-6 space-y-6" style={{ backgroundColor: '#ffffe1' }}>

          {/* 식사별 카드 - 2x2 그리드에 물까지 5개 */}
          <div className="space-y-4">
            {/* 첫 번째 줄: 아침, 점심 */}
            <div className="grid grid-cols-2 gap-4">
              {meals.slice(0, 2).map((meal) => {
                const IconComponent = meal.icon;
                
                return (
                  <Card 
                    key={meal.id} 
                    className="border-none cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-lg" 
                    style={{ backgroundColor: '#fef1c1' }}
                    onClick={() => handleMealCardClick(meal.id, meal.status)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="flex justify-between items-start mb-4">
                        <div className="text-amber-600">
                          <IconComponent size={32} />
                        </div>
                        {meal.status === 'completed' ? (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Check size={16} className="text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                            <Plus size={16} className="text-gray-600" />
                          </div>
                        )}
                      </div>
                      
                      <div className="text-gray-800 mb-3 font-semibold text-lg">{meal.name}</div>
                      
                      {meal.status === 'completed' && meal.calories ? (
                        <div className="text-gray-700 font-bold text-lg">{meal.calories}kcal</div>
                      ) : meal.status === 'completed' ? (
                        <div className="text-sm text-gray-600 bg-gray-100 rounded-full px-3 py-1 inline-block">✓ 단식했어요</div>
                      ) : (
                        <div className="text-sm text-gray-500">+ 추가하기</div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {/* 두 번째 줄: 저녁, 간식 */}
            <div className="grid grid-cols-2 gap-4">
              {meals.slice(2, 4).map((meal) => {
                const IconComponent = meal.icon;
                
                return (
                  <Card 
                    key={meal.id} 
                    className="border-none cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-lg" 
                    style={{ backgroundColor: '#fef1c1' }}
                    onClick={() => handleMealCardClick(meal.id, meal.status)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="flex justify-between items-start mb-4">
                        <div className="text-amber-600">
                          <IconComponent size={32} />
                        </div>
                        {meal.status === 'completed' ? (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Check size={16} className="text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                            <Plus size={16} className="text-gray-600" />
                          </div>
                        )}
                      </div>
                      
                      <div className="text-gray-800 mb-3 font-semibold text-lg">{meal.name}</div>
                      
                      {meal.status === 'completed' && meal.calories ? (
                        <div className="text-gray-700 font-bold text-lg">{meal.calories}kcal</div>
                      ) : meal.status === 'completed' ? (
                        <div className="text-sm text-gray-600 bg-gray-100 rounded-full px-3 py-1 inline-block">✓ 단식했어요</div>
                      ) : (
                        <div className="text-sm text-gray-500">+ 추가하기</div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {/* 세 번째 줄: 물 (전체 폭) */}
            <div className="w-full">
              {(() => {
                const waterMeal = meals[4]; // 물 데이터
                const IconComponent = waterMeal.icon;
                
                return (
                  <Card 
                    className="border-none cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-lg" 
                    style={{ backgroundColor: '#c2d595' }}
                    onClick={() => waterMeal.status === 'empty' ? handleAddFoodClick() : handleMealClick(waterMeal.id)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="flex justify-between items-start mb-4">
                        <div className="text-blue-600">
                          <IconComponent size={32} />
                        </div>
                        {waterMeal.status === 'completed' ? (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check size={16} className="text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                            <Plus size={16} className="text-gray-600" />
                          </div>
                        )}
                      </div>
                      
                      <div className="text-gray-800 mb-3 font-semibold text-lg">{waterMeal.name}</div>
                      
                      {waterMeal.status === 'completed' && waterMeal.amount ? (
                        <div className="text-gray-700 font-bold text-lg">{waterMeal.amount}</div>
                      ) : (
                        <div className="text-sm text-gray-500">+ 추가하기</div>
                      )}
                    </CardContent>
                  </Card>
                );
              })()}
            </div>
          </div>

        </TabsContent>
      </Tabs>

      {/* 식사 등록 팝업 */}
      <Dialog open={mealDialogOpen} onOpenChange={setMealDialogOpen}>
        <DialogContent className="w-[90%] max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedMeal === 'breakfast' && '아침'}
              {selectedMeal === 'lunch' && '점심'}
              {selectedMeal === 'dinner' && '저녁'}
              {selectedMeal === 'snack' && '간식'}
              {' '}등록
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="food-name">음식명</Label>
              <Input 
                id="food-name" 
                placeholder="음식명을 입력하세요" 
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="calories">칼로리</Label>
              <Input 
                id="calories" 
                type="number" 
                placeholder="칼로리를 입력하세요" 
                className="w-full"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setMealDialogOpen(false)}
              >
                취소
              </Button>
              <Button 
                className="flex-1"
                onClick={() => {
                  setMealDialogOpen(false);
                  // 여기에 저장 로직 추가
                }}
              >
                저장
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MealRecord;