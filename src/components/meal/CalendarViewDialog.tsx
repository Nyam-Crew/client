import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { X, Utensils, Scale, Droplets, Target } from 'lucide-react';

interface CalendarViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ViewMode = 'all' | 'meals' | 'weight' | 'water' | 'missions';

const CalendarViewDialog = ({ open, onOpenChange }: CalendarViewDialogProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('all');

  // 샘플 데이터
  const sampleData = {
    '2025-08-14': { meals: 3, weight: 65.5, water: 1200, missions: 2 },
    '2025-08-15': { meals: 2, weight: 65.3, water: 800, missions: 1 },
  };

  const viewButtons = [
    { id: 'meals' as ViewMode, label: '먹었어요', icon: Utensils, color: 'bg-orange-500' },
    { id: 'weight' as ViewMode, label: '몸무게', icon: Scale, color: 'bg-blue-500' },
    { id: 'water' as ViewMode, label: '물 섭취', icon: Droplets, color: 'bg-cyan-500' },
    { id: 'missions' as ViewMode, label: '데일리 미션', icon: Target, color: 'bg-green-500' },
  ];

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getDayData = (date: Date) => {
    const key = formatDateKey(date);
    return sampleData[key as keyof typeof sampleData];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95%] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
          <DialogTitle className="text-lg font-semibold">캘린더 뷰</DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="p-2"
          >
            <X size={20} />
          </Button>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 뷰 모드 선택 버튼들 */}
          <div className="flex flex-wrap gap-2 justify-center">
            {viewButtons.map((button) => {
              const Icon = button.icon;
              const isActive = viewMode === button.id;
              
              return (
                <Button
                  key={button.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode(button.id)}
                  className={`gap-2 ${isActive ? button.color + ' text-white' : ''}`}
                >
                  <Icon size={16} />
                  {button.label}
                </Button>
              );
            })}
          </div>

          {/* 캘린더 */}
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                hasData: (date) => !!getDayData(date)
              }}
              modifiersStyles={{
                hasData: { 
                  backgroundColor: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                  fontWeight: 'bold'
                }
              }}
            />
          </div>

          {/* 선택된 날짜 정보 */}
          {selectedDate && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">
                {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
              </h3>

              {(() => {
                const dayData = getDayData(selectedDate);
                
                if (!dayData) {
                  return (
                    <div className="text-center text-muted-foreground py-8">
                      이 날짜에는 기록된 데이터가 없습니다.
                    </div>
                  );
                }

                if (viewMode === 'all') {
                  return (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-orange-50 p-4 rounded-lg text-center">
                        <Utensils className="mx-auto mb-2 text-orange-500" size={24} />
                        <div className="font-semibold">식사</div>
                        <div className="text-sm text-muted-foreground">{dayData.meals}끼</div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <Scale className="mx-auto mb-2 text-blue-500" size={24} />
                        <div className="font-semibold">체중</div>
                        <div className="text-sm text-muted-foreground">{dayData.weight}kg</div>
                      </div>
                      <div className="bg-cyan-50 p-4 rounded-lg text-center">
                        <Droplets className="mx-auto mb-2 text-cyan-500" size={24} />
                        <div className="font-semibold">물 섭취</div>
                        <div className="text-sm text-muted-foreground">{dayData.water}ml</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <Target className="mx-auto mb-2 text-green-500" size={24} />
                        <div className="font-semibold">미션 완료</div>
                        <div className="text-sm text-muted-foreground">{dayData.missions}회</div>
                      </div>
                    </div>
                  );
                }

                // 개별 뷰 모드별 상세 정보
                switch (viewMode) {
                  case 'meals':
                    return (
                      <div className="bg-orange-50 p-6 rounded-lg">
                        <div className="flex items-center gap-2 mb-4">
                          <Utensils className="text-orange-500" size={24} />
                          <h4 className="font-semibold text-lg">식사 기록</h4>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-orange-600 mb-2">{dayData.meals}끼</div>
                          <div className="text-sm text-gray-600">기록된 식사</div>
                        </div>
                      </div>
                    );
                    
                  case 'weight':
                    return (
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <div className="flex items-center gap-2 mb-4">
                          <Scale className="text-blue-500" size={24} />
                          <h4 className="font-semibold text-lg">체중 기록</h4>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600 mb-2">{dayData.weight}kg</div>
                          <div className="text-sm text-gray-600">기록된 체중</div>
                        </div>
                      </div>
                    );
                    
                  case 'water':
                    return (
                      <div className="bg-cyan-50 p-6 rounded-lg">
                        <div className="flex items-center gap-2 mb-4">
                          <Droplets className="text-cyan-500" size={24} />
                          <h4 className="font-semibold text-lg">물 섭취 기록</h4>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-cyan-600 mb-2">{dayData.water}ml</div>
                          <div className="text-sm text-gray-600">마신 물의 양</div>
                          <div className="mt-4">
                            <div className="w-full bg-cyan-200 rounded-full h-2">
                              <div 
                                className="bg-cyan-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(100, (dayData.water / 1000) * 100)}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-cyan-600 mt-1">
                              목표: 1000ml
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                    
                  case 'missions':
                    return (
                      <div className="bg-green-50 p-6 rounded-lg">
                        <div className="flex items-center gap-2 mb-4">
                          <Target className="text-green-500" size={24} />
                          <h4 className="font-semibold text-lg">데일리 미션</h4>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600 mb-2">{dayData.missions}회</div>
                          <div className="text-sm text-gray-600">완료한 미션</div>
                        </div>
                      </div>
                    );
                    
                  default:
                    return null;
                }
              })()}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarViewDialog;