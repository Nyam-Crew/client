import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { defaultFetch } from '@/api/defaultFetch.ts';

const RecordCalendar = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarMonthResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const headerRef = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    const onResize = () => {};
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // 데이터 로드
  const fetchCalendarData = async (year: number, month: number) => {
    setLoading(true);
    try {
      const data = await defaultFetch(`/api/calendar/month?year=${year}&month=${month}`, {
        method: 'GET',
      });
      if (!data || typeof data !== 'object' || !('items' in data)) {
        console.error('[RecordCalendar] JSON 형식 불일치', data);
        throw new Error('달력 응답 형식이 올바르지 않습니다.');
      }
      setCalendarData(data as CalendarMonthResponse);
    } catch (error) {
      console.error('Failed to fetch calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    const controller = new AbortController();
    fetchCalendarData(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
    return () => controller.abort();
  }, [currentMonth]);

  const formatDateKey = (date: Date): string =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
          date.getDate()
      ).padStart(2, '0')}`;

  const getDayData = (date: Date): DayData | null => {
    if (!calendarData) return null;
    const dateKey = formatDateKey(date);
    const dayItem = calendarData.items.find((item) => item.date === dateKey);
    if (!dayItem) return null;
    return {
      calories: dayItem.kcal || 0,
      weight: dayItem.weight || undefined,
      water: dayItem.water || undefined,
      missionsCompleted: dayItem.achieved,
    };
  };

  const handlePrevMonth = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() - 1);
    setCurrentMonth(d);
  };
  const handleNextMonth = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + 1);
    setCurrentMonth(d);
  };
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };
  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate(`/record?d=${formatDateKey(selectedDate)}&tab=myday`);
  };

  return (
      <div className="min-h-screen flex flex-col bg-[#fffff5]">
        {/* 헤더 */}
        <div ref={headerRef} className="bg-white border-b px-4 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleBack} className="p-2">
                <ArrowLeft size={20} className="text-foreground" />
              </Button>
              <h1 className="text-lg font-semibold text-foreground">기록 캘린더</h1>
            </div>
            <Button variant="outline" size="sm" onClick={goToToday} className="text-sm">
              오늘
            </Button>
          </div>
        </div>

        {/* 캘린더 */}
        <div className="px-4 pt-6 pb-6">
          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="p-4 sm:p-6">
              {/* 월 네비게이션 */}
              <div className="flex items-center justify-between mb-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-muted"
                    disabled={loading}
                    aria-label="이전 달"
                >
                  <ChevronLeft size={20} />
                </Button>

                <div className="text-base font-semibold tabular-nums">
                  {currentMonth.getFullYear()}년 {String(currentMonth.getMonth() + 1).padStart(2, '0')}월
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-muted"
                    disabled={loading}
                    aria-label="다음 달"
                >
                  <ChevronRight size={20} />
                </Button>
              </div>

              <div className="calendar-container w-full">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    month={currentMonth}
                    onMonthChange={(newMonth) => setCurrentMonth(newMonth)}
                    /* ✅ 이번 달만 표시 */
                    showOutsideDays={false}
                    className="w-full"
                    components={{
                      DayContent: ({ date }) => {
                        const dayData = getDayData(date);
                        const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                        const isToday = date.toDateString() === new Date().toDateString();
                        const isWeekend = [0, 6].includes(date.getDay());

                        return (
                            <div
                                className={[
                                  'relative w-full h-full flex flex-col p-2 rounded-md transition-all',
                                  'bg-white ring-1 ring-transparent',
                                  isSelected ? 'ring-2 ring-blue-500 shadow-sm' : 'hover:shadow-sm',
                                ].join(' ')}
                            >
                              {/* 날짜 + 스탬프 */}
                              <div className="flex items-center justify-between">
                          <span
                              className={[
                                'text-sm font-semibold',
                                isWeekend ? 'text-rose-600' : 'text-gray-900',
                                isSelected ? 'text-blue-600' : '',
                              ].join(' ')}
                          >
                            {date.getDate()}
                          </span>

                                {dayData?.missionsCompleted && (
                                    <span className="text-[18px]" aria-label="미션 달성">✅</span>
                                )}
                              </div>

                              {/* 오늘 테두리 */}
                              {isToday && (
                                  <div className="absolute inset-0 rounded-md pointer-events-none ring-1 ring-gray-300" />
                              )}

                              {/* 요약 */}
                              {/* 요약 */}
                              <div className="mt-2 space-y-1 text-[11px] leading-4 text-gray-700">
                                {dayData?.calories ? (
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">🍔</span>
                                      <span className="font-medium tabular-nums">
                                        {dayData.calories.toLocaleString()}kcal
                                      </span>
                                    </div>
                                ) : null}

                                {dayData?.weight != null ? (
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">⚖️</span>
                                      <span className="tabular-nums">{dayData.weight}kg</span>
                                    </div>
                                ) : null}

                                {dayData?.water ? (
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">💧</span>
                                      <span className="tabular-nums">
                                        {(dayData.water / 1000).toFixed(1)}L
                                      </span>
                                    </div>
                                ) : null}
                              </div>


                            </div>
                        );
                      },
                    }}
                    classNames={{
                      /* 레이아웃: 꽉 찬 달력, outside days 미표시(위 prop로 이미 숨김) */
                      months: 'h-full flex-1',
                      month: 'h-full flex-1 flex flex-col',
                      table: 'w-full border-collapse border-spacing-0 h-full',
                      tbody: 'h-full flex-1 flex flex-col',
                      head_row: 'flex w-full',
                      head_cell: 'text-muted-foreground font-medium text-xs w-full text-center py-2',
                      row: 'flex w-full flex-1',
                      cell: 'p-1 w-full h-full',
                      day: 'w-full h-24 sm:h-28 md:h-32 p-0',
                      day_today: '',
                      day_selected: '',
                      day_outside: 'hidden', // 안전빵(혹시 prop이 무시되더라도 숨김)
                      caption_label: 'hidden',
                      caption: 'hidden',
                      nav: 'hidden',
                    }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
};

export default RecordCalendar;