import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';

interface CalendarMonthResponse {
  year: number;
  month: number;
  days: number;
  items: CalendarDayItem[];
}

interface CalendarDayItem {
  date: string;
  kcal: number | null;
  weight: number | null;
  water: number | null;
  achieved: boolean;
}

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
  const [calendarData, setCalendarData] = useState<CalendarMonthResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // API에서 월별 캘린더 데이터 가져오기
  const fetchCalendarData = async (year: number, month: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/calendar/month?year=${year}&month=${month}`);
      if (response.ok) {
        const data = await response.json();
        setCalendarData(data);
      }
    } catch (error) {
      console.error('Failed to fetch calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  // 현재 월이 변경될 때마다 API 호출
  useEffect(() => {
    fetchCalendarData(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
  }, [currentMonth]);

  // 샘플 데이터 - 각 날짜별 기록 (2025년으로 업데이트)
  const sampleData: Record<string, DayData> = {
    '2025-01-15': { calories: 1120, weight: 65.5, water: 1200, missionsCompleted: true },
    '2025-01-16': { calories: 890, water: 800, missionsCompleted: false },
    '2025-01-17': { calories: 1340, weight: 65.2, water: 1500, missionsCompleted: true },
    '2025-01-18': { calories: 644, water: 1200, missionsCompleted: false },
    '2025-01-19': { calories: 0, missionsCompleted: false },
    '2025-01-20': { calories: 1200, weight: 64.8, water: 1800, missionsCompleted: true },
    '2025-01-21': { calories: 1450, weight: 64.5, water: 2000, missionsCompleted: true },
    '2025-01-22': { calories: 980, water: 1300, missionsCompleted: false },
    '2025-01-23': { calories: 1600, weight: 64.3, water: 1600, missionsCompleted: true },
    '2025-01-24': { calories: 750, water: 900, missionsCompleted: false },
    '2025-01-25': { calories: 1380, weight: 64.0, water: 1700, missionsCompleted: true },
    '2025-01-26': { calories: 1100, water: 1400, missionsCompleted: true },
    '2025-01-27': { calories: 1250, weight: 63.8, water: 1900, missionsCompleted: false },
  };

  const formatDateKey = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getDayData = (date: Date): DayData | null => {
    if (!calendarData) return null;
    
    const dateKey = formatDateKey(date);
    const dayItem = calendarData.items.find(item => item.date === dateKey);
    
    if (!dayItem) return null;
    
    return {
      calories: dayItem.kcal || 0,
      weight: dayItem.weight || undefined,
      water: dayItem.water || undefined,
      missionsCompleted: dayItem.achieved
    };
  };

  const formatWaterDisplay = (waterMl: number | null | undefined): string => {
    if (!waterMl) return '-';
    return `${(waterMl / 1000).toFixed(1)}L`;
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
    <div className="min-h-screen" style={{ backgroundColor: '#fffff5' }}>
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
      <div className="px-4 pt-6 pb-6 flex-1">
        <Card className="shadow-lg border-0 bg-white h-full">
          <CardContent className="p-6 h-full flex flex-col">
            {/* 월 네비게이션 */}
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevMonth}
                className="p-2 hover:bg-brand-green/10"
                disabled={loading}
              >
                <ChevronLeft size={20} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextMonth}
                className="p-2 hover:bg-brand-green/10"
                disabled={loading}
              >
                <ChevronRight size={20} />
              </Button>
            </div>

            {/* 캘린더 */}
            <div className="calendar-container w-full">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                month={currentMonth}
                onMonthChange={(newMonth) => {
                  setCurrentMonth(newMonth);
                }}
                className="w-full h-full"
                components={{
                  DayContent: ({ date }) => {
                    const dayData = getDayData(date);
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                    
                    return (
                      <div className="relative w-full h-full flex flex-col justify-start p-2 min-h-[110px]">
                        {/* 좌상단: 날짜 숫자 */}
                        <div className={`text-sm font-medium mb-2 self-start ${
                          isSelected ? 'text-white' : 'text-gray-700'
                        }`}>
                          {date.getDate()}
                        </div>
                        
                        {/* 우상단: 데일리 미션 배지 */}
                        {dayData?.missionsCompleted && (
                          <div className="absolute top-2 right-2">
                            <span className="text-green-600 font-bold">✅</span>
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
                            {dayData?.water ? formatWaterDisplay(dayData.water) : '-'}
                          </div>
                        </div>
                      </div>
                    );
                  }
                }}
                classNames={{
                  caption_label: "hidden",
                  caption: "hidden",
                  nav: "hidden",
                  day: "min-h-[140px] w-full p-0 text-sm relative hover:shadow-sm transition-all rounded-md border border-gray-200",
                  day_today: "border-2 border-gray-400",
                  day_selected: "bg-blue-500 text-white hover:bg-blue-600",
                  day_outside: "opacity-50",
                  head_cell: "text-muted-foreground font-medium text-sm w-full text-center py-3",
                  cell: "p-1 w-full",
                  table: "w-full border-collapse border-spacing-0",
                  head_row: "flex w-full",
                  row: "flex w-full mt-2"
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
                        {formatWaterDisplay(getDayData(selectedDate)!.water)}
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