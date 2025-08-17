import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Plus, Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FoodItem {
  id: string;
  name: string;
  amount: string;
  kcal: number;
  carbs?: number;
  protein?: number;
  fat?: number;
}

interface MealCardProps {
  mealType: string;
  title: string;
  icon: React.ComponentType<any>;
  totalKcal: number;
  foods: FoodItem[];
  isCompleted: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onAddFood: (mealType: string) => void;
  onEditFood: (foodId: string) => void;
  onDeleteFood: (foodId: string) => void;
}

const MealCard = ({
  mealType,
  title,
  icon: Icon,
  totalKcal,
  foods,
  isCompleted,
  isExpanded,
  onToggleExpand,
  onAddFood,
  onEditFood,
  onDeleteFood
}: MealCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      <Card 
        className="border-none cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-lg" 
        style={{ backgroundColor: '#fef1c1' }}
        onClick={onToggleExpand}
      >
        <CardContent className="p-6 text-center">
          <div className="flex justify-between items-start mb-4">
            <div className="text-amber-600">
              <Icon size={32} />
            </div>
            {isCompleted ? (
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Check size={16} className="text-white" />
              </div>
            ) : (
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                <Plus size={16} className="text-gray-600" />
              </div>
            )}
          </div>
          
          <div className="text-gray-800 mb-3 font-semibold text-lg">{title}</div>
          
          {isCompleted ? (
            <div className="text-gray-700 font-bold text-lg">{totalKcal}kcal</div>
          ) : (
            <div className="text-sm text-gray-500">+ 추가하기</div>
          )}

          <div className="mt-2 flex justify-center">
            {isExpanded ? (
              <ChevronUp size={16} className="text-gray-600" />
            ) : (
              <ChevronDown size={16} className="text-gray-600" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* 펼쳐진 음식 리스트 */}
      {isExpanded && (
        <div className="mt-4 bg-white rounded-lg shadow-md overflow-hidden">
          {foods.length > 0 ? (
            <>
              <div className="px-4 py-3 space-y-3">
                {foods.map((food, index) => (
                  <div key={food.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{food.name}</div>
                      <div className="text-sm text-gray-600">{food.amount}</div>
                      {food.carbs !== undefined && (
                        <div className="text-xs text-gray-500 mt-1">
                          탄 {food.carbs}g • 단 {food.protein}g • 지 {food.fat}g
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg">{food.kcal}kcal</span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 text-gray-500 hover:text-blue-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditFood(food.id);
                          }}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 text-gray-500 hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteFood(food.id);
                          }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* 카드 하단 고정 바 */}
              <div className="bg-gray-50 p-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  총 <span className="font-bold">{totalKcal}kcal</span>
                </div>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddFood(mealType);
                  }}
                >
                  음식 등록
                </Button>
              </div>
            </>
          ) : (
            /* 빈 상태 */
            <div className="px-4 py-8 text-center">
              <div className="text-gray-500 mb-4">
                <span className="text-2xl mb-2 block">🍽️</span>
                아직 기록이 없어요
              </div>
              <div className="flex gap-2 justify-center">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddFood(mealType);
                  }}
                >
                  음식 등록
                </Button>
                <Button 
                  variant="outline"
                  className="border-gray-300 text-gray-600 hover:bg-gray-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Handle skip meal
                    console.log('Skipped meal:', mealType);
                  }}
                >
                  안먹었어요
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MealCard;