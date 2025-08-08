import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Search, 
  Star,
  Plus,
  Minus,
  ShoppingBasket,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FoodItem {
  id: string;
  name: string;
  defaultServing: string;
  kcalPer100g: number;
  defaultKcal: number;
  carbs?: number;
  protein?: number;
  fat?: number;
}

interface BasketItem extends FoodItem {
  quantity: number;
  selectedUnit: 'serving' | 'gram';
  totalKcal: number;
}

const FoodSearch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const defaultMealType = searchParams.get('mealType') || 'breakfast';
  const [selectedMealType, setSelectedMealType] = useState(defaultMealType);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState<'serving' | 'gram'>('serving');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for search results
  const mockFoodData: FoodItem[] = [
    {
      id: '1',
      name: '당근라페 샌드위치',
      defaultServing: '1인분 (283g)',
      kcalPer100g: 176,
      defaultKcal: 499,
      carbs: 59,
      protein: 21,
      fat: 23
    },
    {
      id: '2',
      name: '닭가슴살 샐러드',
      defaultServing: '1인분 (200g)',
      kcalPer100g: 165,
      defaultKcal: 330,
      carbs: 12,
      protein: 35,
      fat: 8
    },
    {
      id: '3',
      name: '현미밥',
      defaultServing: '1공기 (150g)',
      kcalPer100g: 350,
      defaultKcal: 525,
      carbs: 73,
      protein: 8,
      fat: 3
    }
  ];

  const mealTypes = [
    { id: 'breakfast', label: '아침' },
    { id: 'lunch', label: '점심' },
    { id: 'dinner', label: '저녁' },
    { id: 'snack', label: '간식' }
  ];

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
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
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
    setQuantity(1);
    setSelectedUnit('serving');
    setDetailDialogOpen(true);
  };

  const calculateKcal = () => {
    if (!selectedFood) return 0;
    if (selectedUnit === 'serving') {
      return selectedFood.defaultKcal * quantity;
    } else {
      return Math.round((selectedFood.kcalPer100g * quantity) / 100);
    }
  };

  const addToBasket = () => {
    if (!selectedFood) return;
    
    const basketItem: BasketItem = {
      ...selectedFood,
      quantity,
      selectedUnit,
      totalKcal: calculateKcal()
    };
    
    setBasket(prev => [...prev, basketItem]);
    setDetailDialogOpen(false);
    
    toast({
      title: "담기 완료",
      description: `${selectedFood.name}이(가) 바구니에 추가되었습니다.`
    });
  };

  const removeFromBasket = (index: number) => {
    setBasket(prev => prev.filter((_, i) => i !== index));
  };

  const getTotalKcal = () => {
    return basket.reduce((sum, item) => sum + item.totalKcal, 0);
  };

  const handleRecord = async () => {
    if (basket.length === 0) return;
    
    try {
      // Mock API calls for each item
      for (const item of basket) {
        console.log('Recording:', {
          memberId: 'user123',
          foodId: item.id,
          intakeAmount: item.quantity,
          mealType: selectedMealType.toUpperCase(),
          date: new Date().toISOString().split('T')[0]
        });
      }
      
      toast({
        title: "기록되었습니다",
        description: `${basket.length}개 음식이 성공적으로 기록되었습니다.`
      });
      
      navigate('/meal-record');
    } catch (error) {
      toast({
        title: "기록 실패",
        description: "기록 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="bg-white border-b px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/meal-record')}
              className="p-2"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-lg font-semibold">음식 추가</h1>
          </div>
          <Button variant="outline" size="sm">
            세트 저장
          </Button>
        </div>
      </div>

      {/* 식사 시간대 선택 */}
      <div className="px-4 py-4 bg-gray-50">
        <div className="flex gap-2">
          {mealTypes.map((meal) => (
            <Button
              key={meal.id}
              variant={selectedMealType === meal.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedMealType(meal.id)}
              className="flex-1"
            >
              {meal.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 검색 탭 */}
      <div className="flex-1 px-4">
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="search">음식 검색</TabsTrigger>
            <TabsTrigger value="ai">AI 검색</TabsTrigger>
            <TabsTrigger value="favorites">즐겨찾기</TabsTrigger>
            <TabsTrigger value="manual">직접 등록</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            {/* 검색 입력 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="무슨 음식을 드셨나요?"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 검색 결과 */}
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">검색 중...</div>
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
                          <h3 className="font-medium text-gray-800">{food.name}</h3>
                          <p className="text-sm text-gray-600">{food.defaultServing}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{food.defaultKcal}kcal</div>
                          <div className="text-xs text-gray-500">기본 1인분</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : searchKeyword.length >= 2 ? (
                <div className="text-center py-8 text-gray-500">검색 결과가 없습니다.</div>
              ) : (
                <div className="text-center py-8 text-gray-400">2글자 이상 입력해주세요.</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <div className="text-center py-12 text-gray-500">
              <Sparkles size={48} className="mx-auto mb-4 text-gray-300" />
              <p>AI 검색 기능은 준비 중입니다.</p>
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4">
            <div className="text-center py-12 text-gray-500">
              <Star size={48} className="mx-auto mb-4 text-gray-300" />
              <p>즐겨찾기한 음식이 없습니다.</p>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="text-center py-12 text-gray-500">
              <Plus size={48} className="mx-auto mb-4 text-gray-300" />
              <p>직접 등록 기능은 준비 중입니다.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* 선택 바구니 (하단 고정) */}
      {basket.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
          <div className="px-4 py-4">
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBasket size={16} className="text-blue-600" />
                <span className="font-medium text-gray-800">선택한 음식 ({basket.length}개)</span>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {basket.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="flex-1">{item.name}</span>
                    <span className="text-gray-600 mx-2">
                      {item.quantity}{item.selectedUnit === 'serving' ? '인분' : 'g'}
                    </span>
                    <span className="font-bold">{item.totalKcal}kcal</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 ml-2"
                      onClick={() => removeFromBasket(index)}
                    >
                      <Minus size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-lg">총 {getTotalKcal()}kcal</span>
              <Button 
                className="bg-black hover:bg-gray-800 text-white px-8"
                onClick={handleRecord}
              >
                기록하기
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 음식 상세 다이얼로그 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="w-[90%] max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedFood?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedFood && (
            <div className="space-y-4">
              {/* 단위 선택 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">단위 선택</label>
                <div className="flex gap-2">
                  <Button
                    variant={selectedUnit === 'serving' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedUnit('serving')}
                    className="flex-1"
                  >
                    1인분
                  </Button>
                  <Button
                    variant={selectedUnit === 'gram' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedUnit('gram')}
                    className="flex-1"
                  >
                    그램(g)
                  </Button>
                </div>
              </div>

              {/* 수량 선택 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">수량</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus size={16} />
                  </Button>
                  <span className="w-16 text-center font-medium">
                    {quantity}{selectedUnit === 'serving' ? '인분' : 'g'}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </div>

              {/* 영양 정보 */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-center mb-2">
                  <span className="text-2xl font-bold">{calculateKcal()}kcal</span>
                </div>
                {selectedFood.carbs && (
                  <div className="text-xs text-gray-600 text-center">
                    탄수화물 {Math.round((selectedFood.carbs * quantity) / (selectedUnit === 'serving' ? 1 : 100))}g • 
                    단백질 {Math.round((selectedFood.protein! * quantity) / (selectedUnit === 'serving' ? 1 : 100))}g • 
                    지방 {Math.round((selectedFood.fat! * quantity) / (selectedUnit === 'serving' ? 1 : 100))}g
                  </div>
                )}
              </div>

              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={addToBasket}
              >
                담기
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 바구니 여백 */}
      {basket.length > 0 && <div className="h-40"></div>}
    </div>
  );
};

export default FoodSearch;