import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Search, Plus, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { defaultFetch } from '@/api/defaultFetch';

type ApiFood = {
  id: string;
  foodName: string;
  manufacturer?: string;
  unitKcal: number;   // 100g당 kcal (unitGram이 100이면)
  unitGram: number;   // 보통 100
  foodSize?: number;
};

interface FoodItem {
  id: string;
  name: string;
  kcalPer100g: number;
  unitGram: number;
  manufacturer?: string;
}

const PAGE_SIZE = 10;

const FoodSearch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const mealType = (searchParams.get('mealType') || 'breakfast').toLowerCase();
  const selectedDate = useMemo(() => {
    const d = searchParams.get('d');
    if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
    ).padStart(2, '0')}`;
  }, [searchParams]);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [gramsAmount, setGramsAmount] = useState(100);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const mealTypeLabels: Record<string, string> = {
    breakfast: '아침',
    lunch: '점심',
    dinner: '저녁',
    snack: '간식',
  };

  // ----- 자동완성 -----
  useEffect(() => {
    const kw = searchKeyword.trim();
    if (!kw) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await defaultFetch(
            `/api/food/search/suggest?prefix=${encodeURIComponent(kw)}&size=10`,
            { method: 'GET', signal: ctrl.signal }
        );
        const list = (res?.suggestions as string[]) || [];
        setSuggestions(list);
        setShowSuggestions(list.length > 0);
      } catch {
        // 자동완성 실패는 조용히 무시
      }
    }, 200); // 디바운스
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [searchKeyword]);

  // ----- 검색(fetch) -----
  const fetchSearchPage = async (kw: string, nextPage: number) => {
    if (!kw || kw.length < 1) {
      setSearchResults([]);
      setHasNext(false);
      return;
    }
    setIsLoading(true);
    try {
      const url = `/api/food/search?q=${encodeURIComponent(kw)}&page=${nextPage}&size=${PAGE_SIZE}&sort=score,desc`;
      const data = await defaultFetch(url, { method: 'GET' });
      const content = (data?.content as ApiFood[]) || [];
      const mapped: FoodItem[] = content.map((f) => ({
        id: f.id,
        name: f.foodName,
        kcalPer100g: f.unitGram ? Math.round((f.unitKcal / f.unitGram) * 100) : f.unitKcal,
        unitGram: f.unitGram || 100,
        manufacturer: f.manufacturer,
      }));
      setSearchResults((prev) => (nextPage === 0 ? mapped : [...prev, ...mapped]));
      const totalPages = Number(data?.totalPages ?? 0);
      setHasNext(nextPage < totalPages - 1);
    } catch (e) {
      toast({
        title: '검색 오류',
        description: '식품 검색에 실패했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 키워드가 바뀌면 page를 0으로 리셋하고 새 검색
  useEffect(() => {
    setPage(0);
    if (searchKeyword.trim().length >= 1) {
      fetchSearchPage(searchKeyword.trim(), 0);
    } else {
      setSearchResults([]);
      setHasNext(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKeyword]);

  // 무한 스크롤 옵저버
  useEffect(() => {
    if (!loadMoreRef.current) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
        (entries) => {
          const first = entries[0];
          if (first.isIntersecting && !isLoading && hasNext) {
            const next = page + 1;
            setPage(next);
            fetchSearchPage(searchKeyword.trim(), next);
          }
        },
        { root: null, rootMargin: '200px', threshold: 0 }
    );

    observerRef.current.observe(loadMoreRef.current);
    return () => observerRef.current?.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadMoreRef.current, isLoading, hasNext, page, searchKeyword]);

  // 결과 카드 클릭 → 상세 다이얼로그
  const handleFoodClick = (food: FoodItem) => {
    setSelectedFood(food);
    setGramsAmount(100);
    setDetailDialogOpen(true);
  };

  // kcal/영양소 미리보기
  const calculateKcal = () => {
    if (!selectedFood) return 0;
    return Math.round((selectedFood.kcalPer100g * gramsAmount) / 100);
  };
  const calculateNutrients = () => {
    // 실제 영양성분은 API에 없으므로 임시계산(비율 가정) — 필요 시 백엔드 스펙에 맞게 교체
    const kcal = calculateKcal();
    return {
      carbohydrates: Math.round((kcal * 0.5) / 4 * 10) / 10,
      protein: Math.round((kcal * 0.2) / 4 * 10) / 10,
      fat: Math.round((kcal * 0.3) / 9 * 10) / 10,
    };
  };

  const handleAdd = async () => {
    if (!selectedFood) return;

    try {
      // 미리 계산
      const intakeKcal = calculateKcal();           // 예상 칼로리
      const n = calculateNutrients();               // { carbohydrates, protein, fat }

      const body = {
        foodId: Number(selectedFood.id),            // ✅ 문자열 id → 숫자
        mealLogDate: selectedDate,                  // "YYYY-MM-DD"
        intakeAmount: gramsAmount,                  // g
        intakeKcal,                                 // kcal
        mealType: mealType.toUpperCase(),           // BREAKFAST/LUNCH/DINNER/SNACK
        protein: n.protein,                         // 단백질(g)
        carbohydrate: n.carbohydrates,              // 탄수화물(g)
        fat: n.fat,                                 // 지방(g)
      };

      await defaultFetch('/api/meal/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      toast({
        title: '추가되었습니다',
        description: `${selectedFood.name} ${gramsAmount}g이 기록되었습니다.`,
      });

      setDetailDialogOpen(false);
      navigate(`/meal-detail/${mealType}?d=${selectedDate}`);
    } catch (error) {
      toast({
        title: '기록 실패',
        description: '등록 중 오류가 발생했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
    }
  };

  const adjustGrams = (increment: number) => {
    setGramsAmount((prev) => Math.max(1, Math.min(2000, prev + increment)));
  };

  return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-background border-b px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/meal-detail/${mealType}?d=${selectedDate}`)}
                className="p-2"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">
              {mealTypeLabels[mealType] || mealType} / 음식 등록
            </h1>
          </div>
        </div>

        {/* Search Section */}
        <div className="flex-1 px-4 py-6">
          {/* Search Input */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
                placeholder="무슨 음식을 드셨나요?"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onFocus={() => setShowSuggestions(suggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="pl-10 h-12"
            />

            {/* 자동완성 드롭다운 */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-md shadow-lg z-10 mt-1 max-h-60 overflow-auto">
                  {suggestions.map((s, idx) => (
                      <button
                          key={`${s}-${idx}`}
                          className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-foreground"
                          onClick={() => {
                            setSearchKeyword(s);
                            setShowSuggestions(false);
                          }}
                      >
                        {s}
                      </button>
                  ))}
                </div>
            )}
          </div>

          {/* Search Results */}
          <div className="space-y-3">
            {isLoading && searchResults.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">검색 중...</div>
            ) : searchResults.length > 0 ? (
                <>
                  {searchResults.map((food) => (
                      <Card
                          key={food.id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleFoodClick(food)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-medium text-foreground">{food.name}</h3>
                              {food.manufacturer && (
                                  <p className="text-xs text-muted-foreground mt-0.5">{food.manufacturer}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg text-foreground">{food.kcalPer100g}kcal</div>
                              <div className="text-xs text-muted-foreground">100g 당</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                  ))}
                  {/* 무한 스크롤 센티넬 */}
                  <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
                    {isLoading && hasNext && <span className="text-xs text-muted-foreground">불러오는 중...</span>}
                    {!hasNext && searchResults.length > 0 && (
                        <span className="text-xs text-muted-foreground">마지막 결과입니다</span>
                    )}
                  </div>
                </>
            ) : searchKeyword.trim().length >= 1 ? (
                <div className="text-center py-12 text-muted-foreground">검색 결과가 없습니다.</div>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="mb-4">🔍</div>
                  <p>검색어를 입력해 주세요</p>
                  <p className="text-sm mt-1">1글자 이상 입력하면 검색합니다</p>
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
                  {/* Food Info */}
                  <div className="text-center space-y-3">
                    <p className="text-sm text-muted-foreground">
                      100g 당 {selectedFood.kcalPer100g}kcal
                    </p>
                    {selectedFood.manufacturer && (
                        <p className="text-xs text-muted-foreground">{selectedFood.manufacturer}</p>
                    )}
                  </div>

                  {/* Gram Input */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">수량 (g)</label>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="sm" onClick={() => adjustGrams(-10)} disabled={gramsAmount <= 10}>
                        <Minus size={16} />
                      </Button>
                      <div className="flex-1 text-center">
                        <Input
                            type="number"
                            value={gramsAmount}
                            onChange={(e) =>
                                setGramsAmount(Math.max(1, Math.min(2000, parseInt(e.target.value) || 1)))
                            }
                            className="text-center text-lg font-medium"
                            min="1"
                            max="2000"
                        />
                      </div>
                      <Button variant="outline" size="sm" onClick={() => adjustGrams(10)} disabled={gramsAmount >= 2000}>
                        <Plus size={16} />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      {[50, 100, 200].map((g) => (
                          <Button key={g} variant="outline" size="sm" onClick={() => setGramsAmount(g)} className="flex-1">
                            {g}g
                          </Button>
                      ))}
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold text-foreground mb-1">{calculateKcal()}kcal</div>
                      <div className="text-sm text-muted-foreground">예상 칼로리</div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs text-center">
                      <div className="bg-red-50 dark:bg-red-950/20 p-2 rounded">
                        <div className="text-red-600 dark:text-red-400 font-medium">탄수화물</div>
                        <div className="text-foreground font-bold">{calculateNutrients().carbohydrates}g</div>
                      </div>
                      <div className="bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded">
                        <div className="text-yellow-600 dark:text-yellow-400 font-medium">단백질</div>
                        <div className="text-foreground font-bold">{calculateNutrients().protein}g</div>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded">
                        <div className="text-blue-600 dark:text-blue-400 font-medium">지방</div>
                        <div className="text-foreground font-bold">{calculateNutrients().fat}g</div>
                      </div>
                    </div>
                  </div>

                  {/* Add Button */}
                  <Button className="w-full" onClick={handleAdd} disabled={gramsAmount < 1}>
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