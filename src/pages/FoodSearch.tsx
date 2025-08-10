import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Search, Plus, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FoodItem {
  id: string;
  name: string;
  kcalPer100g: number;
  category?: string;
  carbohydratesPer100g: number;
  proteinPer100g: number;
  fatPer100g: number;
}

const FoodSearch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const mealType = searchParams.get('mealType') || 'breakfast';
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [gramsAmount, setGramsAmount] = useState(100);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for search results
  const mockFoodData: FoodItem[] = [
    {
      id: '1',
      name: '당근라페 샌드위치',
      kcalPer100g: 176,
      category: '샌드위치',
      carbohydratesPer100g: 22,
      proteinPer100g: 8,
      fatPer100g: 7
    },
    {
      id: '2',
      name: '닭가슴살 샐러드',
      kcalPer100g: 165,
      category: '샐러드',
      carbohydratesPer100g: 12,
      proteinPer100g: 25,
      fatPer100g: 4
    },
    {
      id: '3',
      name: '현미밥',
      kcalPer100g: 350,
      category: '밥류',
      carbohydratesPer100g: 72,
      proteinPer100g: 7,
      fatPer100g: 3
    },
    {
      id: '4',
      name: '사과',
      kcalPer100g: 52,
      category: '과일',
      carbohydratesPer100g: 14,
      proteinPer100g: 0.3,
      fatPer100g: 0.2
    },
    {
      id: '5',
      name: '바나나',
      kcalPer100g: 89,
      category: '과일',
      carbohydratesPer100g: 23,
      proteinPer100g: 1.1,
      fatPer100g: 0.3
    },
    {
      id: '6',
      name: '파스타',
      kcalPer100g: 371,
      category: '면류',
      carbohydratesPer100g: 75,
      proteinPer100g: 13,
      fatPer100g: 1.1
    },
    {
      id: '7',
      name: '토마토 파스타',
      kcalPer100g: 180,
      category: '면류',
      carbohydratesPer100g: 26,
      proteinPer100g: 6,
      fatPer100g: 6
    },
    {
      id: '8',
      name: '크림 파스타',
      kcalPer100g: 220,
      category: '면류',
      carbohydratesPer100g: 28,
      proteinPer100g: 8,
      fatPer100g: 9
    }
  ];

  const mealTypeLabels = {
    breakfast: '아침',
    lunch: '점심',
    dinner: '저녁',
    snack: '간식'
  };

  useEffect(() => {
    if (searchKeyword.length >= 2) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchKeyword]);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      // Mock API call: GET /api/food/search?keyword={kw}
      await new Promise(resolve => setTimeout(resolve, 300));
      const filtered = mockFoodData.filter(food => 
        food.name.toLowerCase().includes(searchKeyword.toLowerCase())
      );
      setSearchResults(filtered);
    } catch (error) {
      toast({
        title: "검색 오류",
        description: "네트워크 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFoodClick = (food: FoodItem) => {
    setSelectedFood(food);
    setGramsAmount(100);
    setDetailDialogOpen(true);
  };

  const calculateKcal = () => {
    if (!selectedFood) return 0;
    return Math.round((selectedFood.kcalPer100g * gramsAmount) / 100);
  };

  const calculateNutrients = () => {
    if (!selectedFood) return { carbohydrates: 0, protein: 0, fat: 0 };
    return {
      carbohydrates: Math.round((selectedFood.carbohydratesPer100g * gramsAmount) / 100 * 10) / 10,
      protein: Math.round((selectedFood.proteinPer100g * gramsAmount) / 100 * 10) / 10,
      fat: Math.round((selectedFood.fatPer100g * gramsAmount) / 100 * 10) / 10
    };
  };

  const handleAdd = async () => {
    if (!selectedFood) return;
    
    try {
      // Mock API call: POST /api/meal/log
      const requestBody = {
        memberId: "user123", // Should come from auth context
        foodId: selectedFood.id,
        mealType: mealType.toUpperCase(),
        intakeAmountUnit: "GRAM",
        intakeAmount: gramsAmount,
        date: new Date().toISOString().split('T')[0]
      };
      
      console.log('Recording meal:', requestBody);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "추가되었습니다",
        description: `${selectedFood.name} ${gramsAmount}g이 기록되었습니다.`
      });
      
      setDetailDialogOpen(false);
      navigate('/meal-record');
    } catch (error) {
      toast({
        title: "기록 실패",
        description: "네트워크 오류, 다시 시도해주세요",
        variant: "destructive"
      });
    }
  };

  const adjustGrams = (increment: number) => {
    setGramsAmount(prev => Math.max(1, Math.min(2000, prev + increment)));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b px-4 py-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/meal-record')}
            className="p-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">
            {mealTypeLabels[mealType as keyof typeof mealTypeLabels]} / 음식 등록
          </h1>
        </div>
      </div>

      {/* Search Section */}
      <div className="flex-1 px-4 py-6">
        {/* Search Input */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder="무슨 음식을 드셨나요?"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        {/* Search Results */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">검색 중...</div>
          ) : searchResults.length > 0 ? (
            searchResults.map((food) => (
              <Card 
                key={food.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleFoodClick(food)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{food.name}</h3>
                      {food.category && (
                        <p className="text-sm text-muted-foreground">{food.category}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-foreground">{food.kcalPer100g}kcal</div>
                      <div className="text-xs text-muted-foreground">100g 당</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : searchKeyword.length >= 2 ? (
            <div className="text-center py-12 text-muted-foreground">검색 결과가 없습니다.</div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <div className="mb-4">🔍</div>
              <p>검색어를 입력해 주세요</p>
              <p className="text-sm mt-1">2글자 이상 입력해주세요</p>
            </div>
          )}
        </div>
      </div>

      {/* Food Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="w-[90%] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">{selectedFood?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedFood && (
            <div className="space-y-6">
              {/* Food Info with Nutrition */}
              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  100g 당 {selectedFood.kcalPer100g}kcal
                </p>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="bg-red-50 dark:bg-red-950/20 p-2 rounded">
                    <div className="text-red-600 dark:text-red-400 font-medium">탄수화물</div>
                    <div className="text-foreground">{selectedFood.carbohydratesPer100g}g</div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded">
                    <div className="text-yellow-600 dark:text-yellow-400 font-medium">단백질</div>
                    <div className="text-foreground">{selectedFood.proteinPer100g}g</div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded">
                    <div className="text-blue-600 dark:text-blue-400 font-medium">지방</div>
                    <div className="text-foreground">{selectedFood.fatPer100g}g</div>
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
                    <div className="text-foreground font-bold">{calculateNutrients().carbohydrates}g</div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded text-center">
                    <div className="text-yellow-600 dark:text-yellow-400 font-medium">단백질</div>
                    <div className="text-foreground font-bold">{calculateNutrients().protein}g</div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded text-center">
                    <div className="text-blue-600 dark:text-blue-400 font-medium">지방</div>
                    <div className="text-foreground font-bold">{calculateNutrients().fat}g</div>
                  </div>
                </div>
              </div>

              {/* Add Button */}
              <Button 
                className="w-full"
                onClick={handleAdd}
                disabled={gramsAmount < 1}
              >
                추가하기
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FoodSearch;