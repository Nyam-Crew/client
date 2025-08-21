import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Plus, 
  Edit3,
  Sun,
  Mountain,
  Moon,
  Apple,
  Minus,
  X
} from 'lucide-react';

interface FoodItem {
  mealLogId: number;
  memberId: number;
  foodId: number;
  foodName: string;
  intakeAmount: number;
  intakeKcal: number;
  mealType: string;
  createdDate: string;
  modifiedDate: string;
}

interface MealData {
  mealType: string;
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
    if (food) {
      setGramsAmount(food.intakeAmount);
    }
  }, [food]);

  const calculateKcal = () => {
    if (!food) return 0;
    return Math.round((food.intakeKcal / food.intakeAmount) * gramsAmount);
  };

  const calculateNutrients = () => {
    if (!food) return { carbohydrates: 0, protein: 0, fat: 0 };
    // Mock calculation - in real app, this would come from API
    const totalCarbs = Math.round(calculateKcal() * 0.5 / 4 * 10) / 10; // 50% carbs
    const totalProtein = Math.round(calculateKcal() * 0.2 / 4 * 10) / 10; // 20% protein  
    const totalFat = Math.round(calculateKcal() * 0.3 / 9 * 10) / 10; // 30% fat
    
    return {
      carbohydrates: totalCarbs,
      protein: totalProtein,
      fat: totalFat
    };
  };

  const adjustGrams = (increment: number) => {
    setGramsAmount(prev => Math.max(1, Math.min(2000, prev + increment)));
  };

  const handleSave = () => {
    if (!food) return;
    
    const updatedFood = {
      ...food,
      intakeAmount: gramsAmount,
      intakeKcal: calculateKcal()
    };
    
    onSave(updatedFood);
    onOpenChange(false);
  };

  if (!food) return null;

  const nutrients = calculateNutrients();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">{food.foodName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Food Info with 100g base */}
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              100g 당 {Math.round((food.intakeKcal / food.intakeAmount) * 100)}kcal
            </p>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-red-50 dark:bg-red-950/20 p-2 rounded">
                <div className="text-red-600 dark:text-red-400 font-medium">탄수화물</div>
                <div className="text-foreground">{Math.round((food.intakeKcal / food.intakeAmount) * 100 * 0.5 / 4)}g</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded">
                <div className="text-yellow-600 dark:text-yellow-400 font-medium">단백질</div>
                <div className="text-foreground">{Math.round((food.intakeKcal / food.intakeAmount) * 100 * 0.2 / 4)}g</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded">
                <div className="text-blue-600 dark:text-blue-400 font-medium">지방</div>
                <div className="text-foreground">{Math.round((food.intakeKcal / food.intakeAmount) * 100 * 0.3 / 9)}g</div>
              </div>
            </div>
          </div>

          {/* Gram Input */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">수량 (g)</label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustGrams(-10)}
                disabled={gramsAmount <= 10}
              >
                <Minus size={16} />
              </Button>
              <div className="flex-1 text-center">
                <Input
                  type="number"
                  value={gramsAmount}
                  onChange={(e) => setGramsAmount(Math.max(1, Math.min(2000, parseInt(e.target.value) || 1)))}
                  className="text-center text-lg font-medium"
                  min="1"
                  max="2000"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustGrams(10)}
                disabled={gramsAmount >= 2000}
              >
                <Plus size={16} />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGramsAmount(50)}
                className="flex-1"
              >
                50g
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGramsAmount(100)}
                className="flex-1"
              >
                100g
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGramsAmount(200)}
                className="flex-1"
              >
                200g
              </Button>
            </div>
          </div>

          {/* Calorie and Nutrients Preview */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-foreground mb-1">
                {calculateKcal()}kcal
              </div>
              <div className="text-sm text-muted-foreground">
                예상 칼로리
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-red-50 dark:bg-red-950/20 p-2 rounded text-center">
                <div className="text-red-600 dark:text-red-400 font-medium">탄수화물</div>
                <div className="text-foreground font-bold">{nutrients.carbohydrates}g</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded text-center">
                <div className="text-yellow-600 dark:text-yellow-400 font-medium">단백질</div>
                <div className="text-foreground font-bold">{nutrients.protein}g</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded text-center">
                <div className="text-blue-600 dark:text-blue-400 font-medium">지방</div>
                <div className="text-foreground font-bold">{nutrients.fat}g</div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <Button 
            className="w-full"
            onClick={handleSave}
            disabled={gramsAmount < 1}
          >
            추가하기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const MealDetail = () => {
  const navigate = useNavigate();
  const { mealType } = useParams<{ mealType: string }>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [mealData, setMealData] = useState<MealData | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  const selectedDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchMealDetail();
  }, [mealType]);

  const fetchMealDetail = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/meal/log?mealType=${mealType?.toUpperCase()}&date=${selectedDate}`);
      // const data = await response.json();
      
      // Mock data for now
      const mockData: FoodItem[] = [
        {
          mealLogId: 5,
          memberId: 1,
          foodId: 4,
          foodName: "순우리감자볼쑥라떼맛",
          intakeAmount: 100,
          intakeKcal: 200,
          mealType: mealType?.toUpperCase() || 'LUNCH',
          createdDate: "2025-08-20T16:40:36.498677",
          modifiedDate: "2025-08-20T16:57:02.517521"
        },
        {
          mealLogId: 4,
          memberId: 1,
          foodId: 3,
          foodName: "미니 군고구마",
          intakeAmount: 150,
          intakeKcal: 180,
          mealType: mealType?.toUpperCase() || 'LUNCH',
          createdDate: "2025-08-20T16:40:03.076384",
          modifiedDate: "2025-08-20T16:56:53.852033"
        }
      ];

      const totalKcal = mockData.reduce((sum, food) => sum + food.intakeKcal, 0);
      
      setMealData({
        mealType: mealType || 'lunch',
        totalKcal,
        foods: mockData
      });
    } catch (error) {
      console.error('Failed to fetch meal detail:', error);
      toast({
        title: "오류",
        description: "식단 정보를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddFood = () => {
    navigate(`/food-search?mealType=${mealType}`);
  };

  const handleEditFood = (food: FoodItem) => {
    setSelectedFood(food);
    setEditDialogOpen(true);
  };

  const handleDeleteFood = async (mealLogId: number) => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/meal/log/${mealLogId}`, {
      //   method: 'DELETE'
      // });
      
      // Update local state
      if (mealData) {
        const updatedFoods = mealData.foods.filter(food => food.mealLogId !== mealLogId);
        const totalKcal = updatedFoods.reduce((sum, food) => sum + food.intakeKcal, 0);
        
        setMealData({
          ...mealData,
          foods: updatedFoods,
          totalKcal
        });
      }
      
      toast({
        title: "삭제 완료",
        description: "음식이 삭제되었습니다.",
      });
    } catch (error) {
      console.error('Failed to delete food:', error);
      toast({
        title: "오류",
        description: "음식 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleEditSave = (updatedFood: FoodItem) => {
    if (mealData) {
      const updatedFoods = mealData.foods.map(food => 
        food.mealLogId === updatedFood.mealLogId ? updatedFood : food
      );
      const totalKcal = updatedFoods.reduce((sum, food) => sum + food.intakeKcal, 0);
      
      setMealData({
        ...mealData,
        foods: updatedFoods,
        totalKcal
      });
    }
    
    toast({
      title: "수정 완료",
      description: "음식 정보가 수정되었습니다.",
    });
  };

  const handleComplete = () => {
    navigate('/meal-record?tab=myDay');
  };

  const calculateNutrients = () => {
    if (!mealData || mealData.foods.length === 0) {
      return { carbs: 0, protein: 0, fat: 0 };
    }
    
    // Mock calculation - in real app, this would come from API
    const totalCarbs = Math.round(mealData.totalKcal * 0.5 / 4); // 50% carbs
    const totalProtein = Math.round(mealData.totalKcal * 0.2 / 4); // 20% protein  
    const totalFat = Math.round(mealData.totalKcal * 0.3 / 9); // 30% fat
    
    return {
      carbs: totalCarbs,
      protein: totalProtein,
      fat: totalFat
    };
  };

  const nutrients = calculateNutrients();
  const carbsPercentage = mealData ? (nutrients.carbs * 4 / mealData.totalKcal) * 100 : 0;
  const proteinPercentage = mealData ? (nutrients.protein * 4 / mealData.totalKcal) * 100 : 0;
  const fatPercentage = mealData ? (nutrients.fat * 9 / mealData.totalKcal) * 100 : 0;

  const getMealTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      breakfast: '아침',
      lunch: '점심', 
      dinner: '저녁',
      snack: '간식'
    };
    return labels[type] || type;
  };

  const getMealIcon = (type: string) => {
    const icons: { [key: string]: any } = {
      breakfast: Sun,
      lunch: Mountain,
      dinner: Moon,
      snack: Apple
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
      <div className="bg-background border-b px-4 py-4">
        <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/meal-record?tab=myDay')}
              className="p-2"
            >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex items-center gap-2">
            <div className="text-primary">
              {getMealIcon(mealType || 'lunch')}
            </div>
            <h1 className="text-lg font-semibold text-foreground">
              {getMealTypeLabel(mealType || 'lunch')}
            </h1>
          </div>
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
                        <h3 className="font-medium text-foreground mb-1">
                          {food.foodName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {food.intakeAmount}g
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-bold text-lg text-foreground">
                            {food.intakeKcal}kcal
                          </div>
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

      {/* Fixed bottom section - 25-30% from bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 space-y-4" style={{ height: '30vh' }}>
        {/* Total Calories Summary with Macronutrients */}
        {mealData && mealData.foods.length > 0 && (
          <div className="bg-muted p-4 rounded-lg">
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-foreground">
                총 {mealData.totalKcal}kcal
              </div>
            </div>
            
            {/* Macronutrient Bar */}
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-3 flex">
              <div 
                className="bg-orange-400 h-full"
                style={{ width: `${carbsPercentage}%` }}
              ></div>
              <div 
                className="bg-blue-500 h-full"
                style={{ width: `${proteinPercentage}%` }}
              ></div>
              <div 
                className="bg-green-500 h-full"
                style={{ width: `${fatPercentage}%` }}
              ></div>
            </div>
            
            {/* Macronutrient Details */}
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
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            className="flex-1 py-3"
            onClick={handleAddFood}
          >
            <Plus size={20} className="mr-2" />
            음식 추가하기
          </Button>
          
          <Button 
            variant="outline"
            className="flex-1 py-3"
            onClick={handleComplete}
          >
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