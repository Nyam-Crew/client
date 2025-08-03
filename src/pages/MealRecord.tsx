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
  ChevronRight,
  X,
  Utensils
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
    <div className="min-h-screen bg-white">
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
        <TabsContent value="myDay" className="px-4 pt-6 space-y-6 bg-white">

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

            {/* 탄단지 비율 도넛 차트 */}
            <div className="mb-6 py-8 flex justify-center">
              <div className="relative w-32 h-32">
                {/* 도넛 차트 배경 */}
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                  {/* 배경 원 */}
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth="3"
                  />
                  
                  {/* 탄수화물 (빨강) */}
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f87171"
                    strokeWidth="3"
                    strokeDasharray={`${todayStats.carbs.percentage} ${100 - todayStats.carbs.percentage}`}
                    strokeDashoffset="0"
                  />
                  
                  {/* 단백질 (노랑) */}
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="3"
                    strokeDasharray={`${todayStats.protein.percentage} ${100 - todayStats.protein.percentage}`}
                    strokeDashoffset={`-${todayStats.carbs.percentage}`}
                  />
                  
                  {/* 지방 (파랑) */}
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeDasharray={`${todayStats.fat.percentage} ${100 - todayStats.fat.percentage}`}
                    strokeDashoffset={`-${todayStats.carbs.percentage + todayStats.protein.percentage}`}
                  />
                </svg>
                
                {/* 중앙 텍스트 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800">탄단지</div>
                    <div className="text-xs text-gray-600">균형</div>
                  </div>
                </div>
              </div>
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
        <TabsContent value="whatIAte" className="px-4 pt-6 space-y-6 bg-white">

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

            {/* 음식 추가 버튼 */}
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              onClick={() => {
                setMealDialogOpen(false);
                handleAddFoodClick();
              }}
            >
              음식 추가
            </Button>

            {/* 수정 완료 버튼 */}
            <Button 
              className="w-full mt-2 bg-black hover:bg-gray-800 text-white py-3"
              onClick={() => {
                setMealDialogOpen(false);
                // 저장 로직
              }}
            >
              수정 완료
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MealRecord;