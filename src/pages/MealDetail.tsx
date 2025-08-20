import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  X,
  Plus,
  Utensils,
  Camera,
  Edit,
  Trash2
} from 'lucide-react';

interface FoodItem {
  id: string;
  name: string;
  amount: string;
  kcal: number;
  carbs?: number;
  protein?: number;
  fat?: number;
}

interface MealData {
  mealType: string;
  totalKcal: number;
  items: FoodItem[];
}

const MealDetail = () => {
  const navigate = useNavigate();
  const { mealType } = useParams<{ mealType: string }>();
  const { toast } = useToast();
  const [mealData, setMealData] = useState<MealData | null>(null);
  const [loading, setLoading] = useState(true);

  const mealTypeNames: { [key: string]: string } = {
    'breakfast': '아침',
    'lunch': '점심', 
    'dinner': '저녁',
    'snack': '간식'
  };

  useEffect(() => {
    fetchMealDetail();
  }, [mealType]);

  const fetchMealDetail = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/meal/${mealType}?date=${selectedDate}`);
      // const data = await response.json();
      
      // Mock data for now
      const mockData: MealData = {
        mealType: mealType || 'lunch',
        totalKcal: mealType === 'lunch' ? 499 : 0,
        items: mealType === 'lunch' ? [
          {
            id: '1',
            name: '당근라페 샌드위치',
            amount: '1인분 (283g)',
            kcal: 499,
            carbs: 59,
            protein: 21,
            fat: 23
          }
        ] : []
      };
      
      setMealData(mockData);
    } catch (error) {
      console.error('Failed to fetch meal detail:', error);
      toast({
        title: "오류",
        description: "식사 정보를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddFood = () => {
    navigate(`/food-search?mealType=${mealType}`);
  };

  const handleEditFood = (foodId: string) => {
    // TODO: Navigate to food edit page
    console.log('Edit food:', foodId);
  };

  const handleDeleteFood = async (foodId: string) => {
    try {
      // TODO: API call to delete food
      // await fetch(`/api/meal/food/${foodId}`, { method: 'DELETE' });
      
      if (mealData) {
        const updatedItems = mealData.items.filter(item => item.id !== foodId);
        const newTotalKcal = updatedItems.reduce((sum, item) => sum + item.kcal, 0);
        
        setMealData({
          ...mealData,
          items: updatedItems,
          totalKcal: newTotalKcal
        });
        
        toast({
          title: "삭제 완료",
          description: "음식이 삭제되었습니다.",
        });
      }
    } catch (error) {
      console.error('Failed to delete food:', error);
      toast({
        title: "오류",
        description: "음식 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleComplete = () => {
    navigate('/meal-record');
  };

  const calculateNutrients = () => {
    if (!mealData?.items.length) return { carbs: 0, protein: 0, fat: 0 };
    
    return mealData.items.reduce((acc, item) => ({
      carbs: acc.carbs + (item.carbs || 0),
      protein: acc.protein + (item.protein || 0),
      fat: acc.fat + (item.fat || 0)
    }), { carbs: 0, protein: 0, fat: 0 });
  };

  const nutrients = calculateNutrients();
  const totalNutrients = nutrients.carbs + nutrients.protein + nutrients.fat;
  const carbsPercentage = totalNutrients > 0 ? (nutrients.carbs / totalNutrients) * 100 : 0;
  const proteinPercentage = totalNutrients > 0 ? (nutrients.protein / totalNutrients) * 100 : 0;
  const fatPercentage = totalNutrients > 0 ? (nutrients.fat / totalNutrients) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-primary">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/meal-record')}
          className="text-white hover:bg-white/10"
        >
          <X size={24} />
        </Button>
        <h1 className="text-lg font-semibold flex items-center gap-2">
          <Utensils size={20} className="text-yellow-400" />
          {mealTypeNames[mealType || 'lunch']}
        </h1>
        <div className="w-10" />
      </div>

      {/* Food Photo Section */}
      <div className="px-4 mb-6">
        <Card className="bg-primary-foreground/10 border-white/20">
          <CardContent className="p-8 text-center">
            <Camera size={48} className="text-white/60 mx-auto mb-4" />
            <p className="text-white/80 text-lg">음식 사진 추가</p>
          </CardContent>
        </Card>
      </div>

      {/* Food List */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            추가한 음식 {mealData?.items.length || 0}
          </h2>
        </div>

        {mealData?.items.length === 0 ? (
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-6 text-center">
              <Utensils size={32} className="text-white/60 mx-auto mb-3" />
              <p className="text-white/80 mb-4">등록된 음식이 없습니다</p>
              <Button
                onClick={handleAddFood}
                className="bg-white text-primary hover:bg-white/90"
              >
                <Plus size={16} className="mr-2" />
                음식 추가
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {mealData?.items.map((food) => (
              <Card key={food.id} className="bg-white/10 border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{food.name}</h3>
                      <p className="text-sm text-white/70 mb-2">{food.amount}</p>
                      <div className="flex items-center gap-4 text-sm text-white/80">
                        <span className="text-lg font-bold text-white">{food.kcal} kcal</span>
                        <X size={16} className="text-white/40" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditFood(food.id)}
                        className="text-white/70 hover:bg-white/10"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteFood(food.id)}
                        className="text-white/70 hover:bg-white/10"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Summary */}
      <div className="bg-white rounded-t-3xl px-4 py-6 mt-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-foreground">총 {mealData?.totalKcal || 0}kcal</span>
            <span className="text-sm text-muted-foreground">영양소 상세 ›</span>
          </div>
          
          {/* Nutrient Breakdown */}
          {mealData?.items.length > 0 && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <div 
                  className="h-2 bg-orange-400 rounded-full" 
                  style={{ width: `${carbsPercentage}%` }}
                />
                <div 
                  className="h-2 bg-blue-400 rounded-full" 
                  style={{ width: `${proteinPercentage}%` }}
                />
                <div 
                  className="h-2 bg-green-400 rounded-full" 
                  style={{ width: `${fatPercentage}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-400 rounded-full" />
                  <span className="text-muted-foreground">탄수화물 {Math.round(nutrients.carbs)}g</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  <span className="text-muted-foreground">단백질 {Math.round(nutrients.protein)}g</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-muted-foreground">지방 {Math.round(nutrients.fat)}g</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleAddFood}
            variant="outline"
            className="flex-1 border-primary text-primary hover:bg-primary hover:text-white"
          >
            음식 추가
          </Button>
          <Button
            onClick={handleComplete}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            수정 완료
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MealDetail;