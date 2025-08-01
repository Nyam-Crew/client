import { useState } from 'react';
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
  Apple
} from 'lucide-react';

const MealRecord = () => {
  const [activeTab, setActiveTab] = useState('myDay');

  // 오늘의 영양소 데이터
  const todayStats = {
    calories: { current: 644, target: 1144 },
    carbs: { percentage: 46, current: 78, target: 163 },
    protein: { percentage: 14, current: 23, target: 51 },
    fat: { percentage: 40, current: 30, target: 32 }
  };

  // 식사별 데이터
  const meals = [
    { id: 'breakfast', name: '아침', icon: Sun, status: 'completed', calories: null },
    { id: 'lunch', name: '점심', icon: Mountain, status: 'completed', calories: 499 },
    { id: 'dinner', name: '저녁', icon: Moon, status: 'empty', calories: null },
    { id: 'snack', name: '간식', icon: Apple, status: 'completed', calories: 145 }
  ];

  const caloriePercentage = (todayStats.calories.current / todayStats.calories.target) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-300 to-blue-600">
      {/* 헤더 */}
      <div className="bg-red-300 px-4 py-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-sm text-white/80">간단</span>
            <span className="text-sm text-white/80">상세</span>
            <span className="text-sm text-white/80">한눈에</span>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-blue-600 px-4">
          <TabsList className="w-full bg-transparent border-none">
            <TabsTrigger 
              value="myDay" 
              className="flex-1 text-white bg-transparent data-[state=active]:bg-white/20 data-[state=active]:text-white"
            >
              나의 하루
            </TabsTrigger>
            <TabsTrigger 
              value="whatIAte" 
              className="flex-1 text-white bg-transparent data-[state=active]:bg-white/20 data-[state=active]:text-white"
            >
              먹었어요
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 나의 하루 탭 */}
        <TabsContent value="myDay" className="px-4 pt-8 space-y-6">
          {/* 칼로리 메인 표시 */}
          <div className="text-center text-white">
            <div className="text-5xl font-bold mb-2">
              {todayStats.calories.current}
              <span className="text-2xl text-white/60">/{todayStats.calories.target}kcal</span>
            </div>
            
            {/* 매크로 영양소 퍼센트 */}
            <div className="flex justify-center gap-6 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-400 rounded-full"></div>
                <span className="text-white">탄 {todayStats.carbs.percentage}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                <span className="text-white">단 {todayStats.protein.percentage}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-800 rounded-full"></div>
                <span className="text-white">지 {todayStats.fat.percentage}%</span>
              </div>
            </div>

            {/* 캐릭터 이미지 자리 */}
            <div className="w-40 h-40 mx-auto mb-8 bg-white/10 rounded-full flex items-center justify-center">
              <div className="text-6xl">🏋️</div>
            </div>

            {/* 칼로리 남은량 표시 */}
            <div className="text-center mb-8">
              <span className="text-orange-300">🔥 {todayStats.calories.target - todayStats.calories.current}kcal 소모</span>
              <span className="text-white mx-2">|</span>
              <span className="text-green-300">{todayStats.calories.target - todayStats.calories.current}kcal 더 먹을 수 있어요</span>
            </div>

            {/* 상세 영양소 */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white">순탄수</span>
                <div className="text-right">
                  <div className="text-white font-bold">{todayStats.carbs.current}/{todayStats.carbs.target}g</div>
                  <Progress value={todayStats.carbs.percentage} className="w-24 h-2 bg-white/20" />
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-white">단백질</span>
                <div className="text-right">
                  <div className="text-white font-bold">{todayStats.protein.current}/{todayStats.protein.target}g</div>
                  <Progress value={todayStats.protein.percentage} className="w-24 h-2 bg-white/20" />
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-white">지방</span>
                <div className="text-right">
                  <div className="text-white font-bold">{todayStats.fat.current}/{todayStats.fat.target}g</div>
                  <Progress value={todayStats.fat.percentage} className="w-24 h-2 bg-white/20" />
                </div>
              </div>
            </div>
          </div>

          {/* 하단 배너 */}
          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs">🏃</span>
                </div>
                <div>
                  <div className="font-semibold text-blue-600">웰컴 미션 진행 중 D-1</div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check size={16} className="text-white" />
                </div>
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check size={16} className="text-white" />
                </div>
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-500 text-xs">3</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 먹었어요 탭 */}
        <TabsContent value="whatIAte" className="px-4 pt-8 space-y-4">
          <div className="text-white text-right mb-6">
            <span className="text-sm">식단 물 섭취 영양제</span>
          </div>

          {/* 식사별 카드 */}
          <div className="grid grid-cols-2 gap-4">
            {meals.map((meal) => {
              const IconComponent = meal.icon;
              
              return (
                <Card key={meal.id} className="bg-blue-800/50 backdrop-blur border-none">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-yellow-400">
                        <IconComponent size={24} />
                      </div>
                      {meal.status === 'completed' ? (
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                          <Check size={16} className="text-blue-600" />
                        </div>
                      ) : (
                        <Plus size={24} className="text-white" />
                      )}
                    </div>
                    
                    <div className="text-white mb-2 font-medium">{meal.name}</div>
                    
                    {meal.status === 'completed' && meal.calories ? (
                      <div className="text-white font-bold">{meal.calories}kcal</div>
                    ) : meal.status === 'completed' ? (
                      <div className="text-sm text-white">✓ 단식했어요</div>
                    ) : (
                      <div className="text-sm text-white/60">✓ 단식했어요</div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* 하단 버튼들 */}
          <div className="flex gap-3 pt-8">
            <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white border-none">
              🍎 기록 보상
            </Button>
            <Button variant="outline" className="flex-1 bg-green-500 hover:bg-green-600 text-white border-none">
              🏔️ 식단 앨범
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MealRecord;