import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Plus,
  Sun,
  Mountain,
  Moon,
  Apple,
  Minus,
} from 'lucide-react';
import { defaultFetch } from '@/api/defaultFetch';

interface FoodItem {
  mealLogId: number;
  memberId: number;
  foodId: number;
  foodName: string;
  intakeAmount: number;
  intakeKcal: number;
  mealType: string; // LUNCH 등 대문자
  createdDate: string;
  modifiedDate: string;
}

interface MealData {
  mealType: string;  // lunch 등 소문자 UI용
  totalKcal: number;
  foods: FoodItem[];
}

interface EditFoodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  food: FoodItem | null;
  onSave: (foodItem: FoodItem) => void;
}

const EditFoodDialog = ({ open, onOpenChange, food, onSave }: EditFoodDialogProps) => {
  const [gramsAmount, setGramsAmount] = useState(100);

  useEffect(() => {
    if (food) setGramsAmount(food.intakeAmount);
  }, [food]);

  if (!food) return null;
  const round1 = (n: number) => Math.round(n * 10) / 10;
  const fmt1 = (n: number) => round1(n).toFixed(1); // 항상 한 자리 표시
  const kcalPerGram = food.intakeAmount > 0 ? food.intakeKcal / food.intakeAmount : 0;
  const calculateKcal = () => round1(kcalPerGram * gramsAmount);

  // UI 미리보기(임시 계산)
  const carbs = round1(calculateKcal() * 0.5 / 4 * 10) / 10;
  const protein = round1(calculateKcal() * 0.2 / 4 * 10) / 10;
  const fat = round1(calculateKcal() * 0.3 / 9 * 10) / 10;

  const adjustGrams = (inc: number) => setGramsAmount(prev => Math.max(1, Math.min(2000, prev + inc)));

  const handleSave = () => {
    const updated: FoodItem = {
      ...food,
      intakeAmount: gramsAmount,
      intakeKcal: calculateKcal(),
    };
    onSave(updated);
    onOpenChange(false);
  };

  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[90%] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">{food.foodName}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* 100g 기준 정보 */}
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                100g 당 {Math.round(kcalPerGram * 100)}kcal
              </p>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="bg-red-50 dark:bg-red-950/20 p-2 rounded">
                  <div className="text-red-600 dark:text-red-400 font-medium">탄수화물</div>
                  <div className="text-foreground">{fmt1(kcalPerGram * 100 * 0.5 / 4)}g</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded">
                  <div className="text-yellow-600 dark:text-yellow-400 font-medium">단백질</div>
                  <div className="text-foreground">{fmt1(kcalPerGram * 100 * 0.2 / 4)}g</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded">
                  <div className="text-blue-600 dark:text-blue-400 font-medium">지방</div>
                  <div className="text-foreground">{fmt1(kcalPerGram * 100 * 0.3 / 9)}g</div>
                </div>
              </div>
            </div>

            {/* g 입력 */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">그람 (g)</label>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => adjustGrams(-10)} disabled={gramsAmount <= 10}>
                  <Minus size={16} />
                </Button>
                <div className="flex-1 text-center">
                  <Input
                      type="number"
                      value={gramsAmount}
                      onChange={(e) => setGramsAmount(Math.max(1, Math.min(2000, parseInt(e.target.value) || 1)))}
                      className="text-center text-lg font-medium"
                      min={1}
                      max={2000}
                  />
                </div>
                <Button variant="outline" size="sm" onClick={() => adjustGrams(10)} disabled={gramsAmount >= 2000}>
                  <Plus size={16} />
                </Button>
              </div>
              <div className="flex gap-2">
                {[50, 100, 200].map(v => (
                    <Button key={v} variant="outline" size="sm" onClick={() => setGramsAmount(v)} className="flex-1">
                      {v}g
                    </Button>
                ))}
              </div>
            </div>

            {/* 산출 미리보기 */}
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-foreground mb-1">{calculateKcal()}kcal</div>
                <div className="text-sm text-muted-foreground">예상 칼로리</div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs text-center">
                <div className="bg-red-50 dark:bg-red-950/20 p-2 rounded">
                  <div className="text-red-600 dark:text-red-400 font-medium">탄수화물</div>
                  <div className="text-foreground font-bold">{fmt1(carbs)}g</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded">
                  <div className="text-yellow-600 dark:text-yellow-400 font-medium">단백질</div>
                  <div className="text-foreground font-bold">{fmt1(protein)}g</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded">
                  <div className="text-blue-600 dark:text-blue-400 font-medium">지방</div>
                  <div className="text-foreground font-bold">{fmt1(fat)}g</div>
                </div>
              </div>
            </div>

            <Button className="w-full" onClick={handleSave} disabled={gramsAmount < 1}>
              수정하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
  );
};

const toApiMealType = (t: string | undefined) => {
  const u = (t || 'lunch').toUpperCase();
  return ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'].includes(u) ? u : 'LUNCH';
};
const toUiMealType = (t: string | undefined) => (t || 'lunch').toLowerCase();

const MealDetail = () => {
  const navigate = useNavigate();
  const { mealType } = useParams<{ mealType: string }>();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [mealData, setMealData] = useState<MealData | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  // 날짜: ?d=YYYY-MM-DD 우선, 없으면 오늘
  const selectedDate = useMemo(() => {
    const d = searchParams.get('d');
    if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, [searchParams]);

  const handleBack = () => {
    // SPA 히스토리가 있는 경우엔 진짜 "앞 화면"으로
    if (window.history.length > 1) {
      navigate(-2);
    } else {
      // 직접 진입 등 히스토리가 없으면 먹었어요 탭으로 안전 복귀
      navigate(`/record?tab=whatIAte&d=${selectedDate}`);
    }
  };

  const apiMealType = toApiMealType(mealType);
  const uiMealType = toUiMealType(mealType);

  useEffect(() => {
    fetchMealDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiMealType, selectedDate]);

  const fetchMealDetail = async () => {
    try {
      setLoading(true);
      const url = `/api/meal/log?mealType=${apiMealType}&date=${encodeURIComponent(selectedDate)}`;
      const list = await defaultFetch(url, { method: 'GET' }) as FoodItem[]; // 응답: 배열
      const foods = Array.isArray(list) ? list : [];
      const totalKcal = foods.reduce((sum, f) => sum + (f.intakeKcal || 0), 0);

      setMealData({
        mealType: uiMealType,
        totalKcal,
        foods,
      });
    } catch (e) {
      console.error('Failed to fetch meal detail:', e);
      toast({ title: '오류', description: '식단 정보를 불러오는데 실패했습니다.', variant: 'destructive' });
      // 실패 시에도 비어있는 상태로 렌더되도록
      setMealData({ mealType: uiMealType, totalKcal: 0, foods: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleAddFood = () => {
    // 음식 검색으로 이동 (선택 후 이 페이지로 돌아오면 refetch)
    navigate(`/food-search?mealType=${uiMealType}&d=${selectedDate}`);
  };

  const handleEditFood = (food: FoodItem) => {
    setSelectedFood(food);
    setEditDialogOpen(true);
  };

  const handleDeleteFood = async (mealLogId: number) => {
    try {
      await defaultFetch(`/api/meal/log/${mealLogId}`, { method: 'DELETE' });
      toast({ title: '삭제 완료', description: '음식이 삭제되었습니다.' });
      await fetchMealDetail(); // 최신 상태 반영
    } catch (e) {
      console.error('Failed to delete food:', e);
      toast({ title: '오류', description: '음식 삭제에 실패했습니다.', variant: 'destructive' });
    }
  };

  const handleEditSave = async (updatedFood: FoodItem) => {
    // 낙관적 업데이트
    const prev = mealData;
    if (prev) {
      const nextFoods = prev.foods.map(f => (f.mealLogId === updatedFood.mealLogId ? updatedFood : f));
      const nextTotal = nextFoods.reduce((s, f) => s + (f.intakeKcal || 0), 0);
      setMealData({ ...prev, foods: nextFoods, totalKcal: nextTotal });
    }

    // 예상 영양소(임시 비율 탄50/단20/지30) – 백엔드에 개별 영양 정보가 있으면 여기 대체
    const kcal = updatedFood.intakeKcal || 0;
    const payload = {
      intakeAmount: updatedFood.intakeAmount,
      intakeKcal: updatedFood.intakeKcal,
      carbohydrate: Math.round(((kcal * 0.5) / 4) * 10) / 10,
      protein: Math.round(((kcal * 0.2) / 4) * 10) / 10,
      fat: Math.round(((kcal * 0.3) / 9) * 10) / 10,
    };

    try {
      await defaultFetch(`/api/meal/log/${updatedFood.mealLogId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          intakeAmount: updatedFood.intakeAmount,
          intakeKcal: updatedFood.intakeKcal,
          carbohydrate: Math.round(((kcal * 0.5) / 4) * 10) / 10,
          protein: Math.round(((kcal * 0.2) / 4) * 10) / 10,
          fat: Math.round(((kcal * 0.3) / 9) * 10) / 10,
        }),
      });
      toast({ title: '수정 완료', description: '음식 정보가 수정되었습니다.' });
    } catch (e) {
      console.error('Failed to update food:', e);
      if (prev) setMealData(prev); // 롤백
      toast({ title: '오류', description: '음식 수정에 실패했습니다.', variant: 'destructive' });
    }
  };

  const handleComplete = () => {
    navigate(`/meal-record?tab=whatIAte&d=${selectedDate}`);
  };

  // 대략적 영양소 퍼센트 (UI 미리보기용)
  const nutrients = useMemo(() => {
    const total = mealData?.totalKcal || 0;
    if (!total) return { carbs: 0, protein: 0, fat: 0 };
    return {
      carbs: Math.round(total * 0.5 / 4),
      protein: Math.round(total * 0.2 / 4),
      fat: Math.round(total * 0.3 / 9),
    };
  }, [mealData?.totalKcal]);

  const carbsPercentage = mealData?.totalKcal ? (nutrients.carbs * 4 / mealData.totalKcal) * 100 : 0;
  const proteinPercentage = mealData?.totalKcal ? (nutrients.protein * 4 / mealData.totalKcal) * 100 : 0;
  const fatPercentage = mealData?.totalKcal ? (nutrients.fat * 9 / mealData.totalKcal) * 100 : 0;

  const getMealTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      breakfast: '아침',
      lunch: '점심',
      dinner: '저녁',
      snack: '간식',
    };
    return labels[type] || type;
  };

  const getMealIcon = (type: string) => {
    const icons: Record<string, any> = {
      breakfast: Sun,
      lunch: Mountain,
      dinner: Moon,
      snack: Apple,
    };
    const IconComponent = icons[type] || Sun;
    return <IconComponent size={24} />;
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">식단 정보를 불러오는 중...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        {/* Header */}
        <div className="bg-background border-b px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="text-primary">{getMealIcon(uiMealType)}</div>
            <h1 className="text-lg font-semibold text-foreground">
              {getMealTypeLabel(uiMealType)}
            </h1>
          </div>
        </div>

        <div className="flex-1 px-4 py-6 space-y-6" style={{ paddingBottom: '25vh' }}>
          {/* Added Foods Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">추가한 음식</h2>
              <span className="text-sm text-muted-foreground">
              {mealData?.foods.length || 0}개
            </span>
            </div>

            {mealData && mealData.foods.length > 0 ? (
                <div className="space-y-3">
                  {mealData.foods.map((food) => (
                      <Card key={food.mealLogId} className="border border-border/50">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-medium text-foreground mb-1">{food.foodName}</h3>
                              <p className="text-sm text-muted-foreground">{food.intakeAmount}g</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="font-bold text-lg text-foreground">{food.intakeKcal}kcal</div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditFood(food)}
                                    className="p-2"
                                >
                                  수정
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteFood(food.mealLogId)}
                                    className="p-2 text-red-600 hover:text-red-700"
                                >
                                  삭제
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                  ))}
                </div>
            ) : (
                <Card className="border border-dashed border-border/50">
                  <CardContent className="p-8 text-center">
                    <div className="text-muted-foreground mb-4">
                      <Plus size={48} className="mx-auto mb-2 opacity-50" />
                      <p>추가된 음식이 없습니다</p>
                      <p className="text-sm">음식을 추가해보세요</p>
                    </div>
                  </CardContent>
                </Card>
            )}
          </div>
        </div>

        {/* Fixed bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 space-y-4" style={{ height: '30vh' }}>
          {mealData && mealData.foods.length > 0 && (
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-foreground">총 {mealData.totalKcal}kcal</div>
                </div>

                {/* Macronutrient Bar */}
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-3 flex">
                  <div className="bg-orange-400 h-full" style={{ width: `${carbsPercentage}%` }}></div>
                  <div className="bg-blue-500 h-full" style={{ width: `${proteinPercentage}%` }}></div>
                  <div className="bg-green-500 h-full" style={{ width: `${fatPercentage}%` }}></div>
                </div>

                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                    <span className="text-muted-foreground">탄수화물</span>
                    <span className="font-bold text-foreground">{nutrients.carbs}g</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-muted-foreground">단백질</span>
                    <span className="font-bold text-foreground">{nutrients.protein}g</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-muted-foreground">지방</span>
                    <span className="font-bold text-foreground">{nutrients.fat}g</span>
                  </div>
                </div>
              </div>
          )}

          <div className="flex gap-3">
            <Button className="flex-1 py-3" onClick={handleAddFood}>
              <Plus size={20} className="mr-2" />
              음식 추가하기
            </Button>

            <Button variant="outline" className="flex-1 py-3" onClick={handleComplete}>
              완료
            </Button>
          </div>
        </div>

        {/* Edit Food Dialog */}
        <EditFoodDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            food={selectedFood}
            onSave={handleEditSave}
        />
      </div>
  );
};

export default MealDetail;