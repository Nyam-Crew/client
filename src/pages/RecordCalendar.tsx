import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';

interface DayData {
  calories: number;
  weight?: number;
  water?: number;
  missionsCompleted: boolean;
}

const RecordCalendar = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // URL에서 선택된 날짜 파라미터 읽기
  useEffect(() => {
    const dateParam = searchParams.get('d');
    if (dateParam) {
      const parsedDate = new Date(dateParam);
      if (!isNaN(parsedDate.getTime())) {
        setSelectedDate(parsedDate);
        setCurrentMonth(parsedDate);
      }
    }
  }, [searchParams]);

  // 샘플 데이터 - 각 날짜별 기록 (2025년으로 업데이트)
  const sampleData: Record<string, DayData> = {
    '2025-01-15': { calories: 1120, weight: 65.5, water: 1200, missionsCompleted: true },
    '2025-01-16': { calories: 890, water: 800, missionsCompleted: false },
    '2025-01-17': { calories: 1340, weight: 65.2, water: 1500, missionsCompleted: true },
    '2025-01-18': { calories: 644, water: 1200, missionsCompleted: false },
    '2025-01-19': { calories: 0, missionsCompleted: false },
    '2025-01-20': { calories: 1200, weight: 64.8, water: 1800, missionsCompleted: true },
  };

  const formatDateKey = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getDayData = (date: Date): DayData | null => {
    return sampleData[formatDateKey(date)] || null;
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  const handleBack = () => {
    // 브라우저 히스토리가 있으면 뒤로가기, 없으면 기록 메인으로 이동
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      const dateParam = formatDateKey(selectedDate);
      navigate(`/record?d=${dateParam}&tab=myday`);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light">
      {/* 헤더 */}
      <div className="bg-white border-b border-border px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="p-2"
            >
              <ArrowLeft size={20} className="text-foreground" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">기록 캘린더</h1>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="text-sm"
          >
            오늘
          </Button>
        </div>
      </div>

      {/* 캘린더 영역 */}
      <div className="px-4 pt-6">
        <Card className="shadow-lg border-0 bg-white">
          <CardContent className="p-6">
            {/* 월 네비게이션 */}
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevMonth}
                className="p-2 hover:bg-brand-green/10"
              >
                <ChevronLeft size={20} />
              </Button>
              
              <h2 className="text-xl font-semibold text-foreground">
                {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
              </h2>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextMonth}
                className="p-2 hover:bg-brand-green/10"
              >
                <ChevronRight size={20} />
              </Button>
            </div>

            {/* 캘린더 */}
            <div className="calendar-container">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                className="w-full"
                components={{
                  DayContent: ({ date }) => {
                    const dayData = getDayData(date);
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                    
                    return (
                      <div className="relative w-full h-full flex flex-col justify-start p-2 min-h-[110px]">
                        {/* 좌상단: 날짜 숫자 */}
                        <div className={`text-sm font-medium mb-2 self-start ${
                          isSelected ? 'text-white' : 
                          isToday ? 'text-brand-green font-bold' : 
                          'text-gray-700'
                        }`}>
                          {date.getDate()}
                        </div>
                        
                        {/* 우상단: 데일리 미션 배지 */}
                        {dayData?.missionsCompleted && (
                          <div className="absolute top-2 right-2">
                            <Badge className="rounded-full px-2 py-0.5 bg-green-100 text-green-700 text-[11px] font-medium border-0">
                              ✓ 도장
                            </Badge>
                          </div>
                        )}
                        
                        {/* 날짜 아래 3줄 요약 */}
                        <div className={`text-xs space-y-1 w-full tabular-nums ${
                          isSelected ? 'text-white/90' : 'text-gray-600'
                        }`}>
                          <div className="font-medium">
                            {dayData ? `${dayData.calories}kcal` : '0kcal'}
                          </div>
                          <div>
                            {dayData?.weight ? `${dayData.weight}kg` : '-'}
                          </div>
                          <div>
                            {dayData?.water ? `${dayData.water}ml` : '-'}
                          </div>
                        </div>
                      </div>
                    );
                  }
                }}
                classNames={{
                  caption_label: "hidden", // 영문 월 표기 숨김
                  day: "min-h-[110px] w-full p-0 text-sm relative hover:shadow-sm transition-all rounded-md border border-gray-100",
                  day_today: "ring-1 ring-brand-green bg-brand-green/5",
                  day_selected: "bg-brand-green text-white hover:bg-brand-green/90",
                  day_outside: "opacity-50",
                  head_cell: "text-muted-foreground font-medium text-sm w-full text-center py-2",
                  cell: "p-1 w-full",
                  table: "w-full border-collapse",
                  head_row: "flex w-full",
                  row: "flex w-full mt-1"
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 선택된 날짜 상세 정보 */}
      {selectedDate && (
        <div className="px-4 py-6">
          <Card className="bg-white shadow-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {selectedDate.toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'short'
                })}
              </h3>
              
              {getDayData(selectedDate) ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">총 섭취 칼로리</span>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {getDayData(selectedDate)!.calories}kcal
                    </Badge>
                  </div>
                  
                  {getDayData(selectedDate)!.weight && (
                    <div className="flex justify-between items-center">
                      <span className="text-foreground">몸무게</span>
                      <Badge variant="outline" className="bg-secondary/10 text-foreground border-secondary/20">
                        {getDayData(selectedDate)!.weight}kg
                      </Badge>
                    </div>
                  )}
                  
                  {getDayData(selectedDate)!.water && (
                    <div className="flex justify-between items-center">
                      <span className="text-foreground">물 섭취량</span>
                      <Badge variant="outline" className="bg-accent/10 text-foreground border-accent/20">
                        {getDayData(selectedDate)!.water}ml
                      </Badge>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">데일리 미션</span>
                    <Badge variant={getDayData(selectedDate)!.missionsCompleted ? "default" : "secondary"}>
                      {getDayData(selectedDate)!.missionsCompleted ? '완료' : '미완료'}
                    </Badge>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  이 날에 대한 기록이 없습니다.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RecordCalendar;