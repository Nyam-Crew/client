import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Camera, 
  Search, 
  Plus, 
  Clock,
  Utensils,
  Zap,
  Activity
} from 'lucide-react';

const MealRecord = () => {
  const [selectedMeal, setSelectedMeal] = useState('breakfast');

  const mealTypes = [
    { id: 'breakfast', label: '아침', icon: '🌅' },
    { id: 'lunch', label: '점심', icon: '☀️' },
    { id: 'dinner', label: '저녁', icon: '🌙' },
    { id: 'snack', label: '간식', icon: '🍪' },
  ];

  const recentMeals = [
    { name: '현미밥', calories: 280, amount: '1공기' },
    { name: '된장찌개', calories: 120, amount: '1그릇' },
    { name: '계란후라이', calories: 180, amount: '2개' },
    { name: '김구이', calories: 25, amount: '3장' },
  ];

  const recommendedFoods = [
    { name: '닭가슴살 샐러드', calories: 320, protein: 35, carbs: 15, fat: 8 },
    { name: '연어 구이', calories: 280, protein: 25, carbs: 0, fat: 18 },
    { name: '퀴노아 볼', calories: 350, protein: 12, carbs: 45, fat: 12 },
    { name: '그릭 요거트', calories: 150, protein: 15, carbs: 8, fat: 5 },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">식단 기록</h1>
          <p className="text-muted-foreground">오늘의 식사를 기록해보세요</p>
        </div>

        {/* 식사 시간 선택 */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock size={20} />
              언제 드셨나요?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {mealTypes.map((meal) => (
                <Button
                  key={meal.id}
                  variant={selectedMeal === meal.id ? "default" : "outline"}
                  className="h-16 flex-col gap-2"
                  onClick={() => setSelectedMeal(meal.id)}
                >
                  <span className="text-2xl">{meal.icon}</span>
                  <span>{meal.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 음식 검색 및 추가 */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Utensils size={20} />
              무엇을 드셨나요?
            </h2>
            
            <div className="space-y-4">
              {/* 검색바 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                <Input 
                  placeholder="음식 이름을 검색하세요 (예: 현미밥, 닭가슴살)"
                  className="pl-10"
                />
              </div>

              {/* 빠른 추가 버튼들 */}
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" className="gap-2">
                  <Camera size={16} />
                  사진으로 추가
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus size={16} />
                  직접 입력
                </Button>
              </div>

              {/* 추천 음식 */}
              <div>
                <h3 className="font-medium mb-3">추천 음식</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {recommendedFoods.map((food, index) => (
                    <Card key={index} className="cursor-pointer hover:bg-accent/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{food.name}</h4>
                          <Badge variant="secondary">{food.calories}kcal</Badge>
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>단백질 {food.protein}g</span>
                          <span>탄수화물 {food.carbs}g</span>
                          <span>지방 {food.fat}g</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 최근 기록 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity size={20} />
              최근 기록한 음식
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMeals.map((meal, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                  <div>
                    <p className="font-medium">{meal.name}</p>
                    <p className="text-sm text-muted-foreground">{meal.amount}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{meal.calories}kcal</p>
                    <Button variant="ghost" size="sm">
                      추가
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 오늘의 영양소 요약 */}
        <Card className="bg-gradient-to-r from-brand-light to-brand-cream">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap size={20} />
              오늘의 영양소 현황
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">1,245</p>
                <p className="text-sm text-muted-foreground">칼로리</p>
                <p className="text-xs text-success">목표의 65%</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-success">45g</p>
                <p className="text-sm text-muted-foreground">단백질</p>
                <p className="text-xs text-success">목표의 75%</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">120g</p>
                <p className="text-sm text-muted-foreground">탄수화물</p>
                <p className="text-xs text-warning">목표의 80%</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-destructive">35g</p>
                <p className="text-sm text-muted-foreground">지방</p>
                <p className="text-xs text-success">목표의 58%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 저장 버튼 */}
        <div className="flex gap-3">
          <Button size="lg" className="flex-1">
            식단 저장하기
          </Button>
          <Button variant="outline" size="lg">
            임시저장
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MealRecord;