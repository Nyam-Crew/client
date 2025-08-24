// client/src/pages/RecordCalendar.tsx
import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { getCalendarForMonth, type CalendarMonthResponse } from '@/api/mealApi';

type DayData = {
  calories: number;
  weight?: number;
  water?: number;
  missionsCompleted: boolean;
};

const MAX_MONTH_FETCH_RETRY = 1;

const RecordCalendar = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarMonthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const headerRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const onResize = () => {};
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // URL 파라미터(d=YYYY-MM-DD)로 초기 선택/월 설정
  useEffect(() => {
    const dateParam = searchParams.get('d');
    if (dateParam) {
      const parsed = new Date(dateParam);
      if (!Number.isNaN(parsed.getTime())) {
        setSelectedDate(parsed);
        setCurrentMonth(parsed);
      }
    }
  }, [searchParams]);

  // 월 변경 시 데이터 로드
  useEffect(() => {
    let aborted = false;
    const load = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const y = currentMonth.getFullYear();
        const m = currentMonth.getMonth() + 1;

        let data: CalendarMonthResponse | null = null;
        let tries = 0;

        while (tries <= MAX_MONTH_FETCH_RETRY) {
          try {
            data = await getCalendarForMonth(y, m);
            break;
          } catch (e) {
            if (tries === MAX_MONTH_FETCH_RETRY) throw e;
            tries += 1;
          }
        }

        if (!aborted) setCalendarData(data!);
      } catch (err) {
        if (!aborted) {
          console.error('[RecordCalendar] fetch error:', err);
          setCalendarData(null);
          setFetchError('달력 데이터를 불러오지 못했습니다.');
        }
      } finally {
        if (!aborted) setLoading(false);
      }
    };
    load();
    return () => {
      aborted = true;
    };
  }, [currentMonth]);

  const formatDateKey = (date: Date): string =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
          date.getDate()
      ).padStart(2, '0')}`;

  const getDayData = (date: Date): DayData | null => {
    if (!calendarData) return null;
    const key = formatDateKey(date);
    const item = calendarData.items.find((i) => i.date === key);
    if (!item) return null;
    return {
      calories: item.kcal || 0,
      weight: item.weight ?? undefined,
      water: item.water ?? undefined,
      missionsCompleted: item.achieved,
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

              {/* 에러/로딩 상태 */}
              {fetchError && (
                  <div className="mb-3 text-sm text-red-600" role="alert">
                    {fetchError}
                  </div>
              )}

              <div className="calendar-container w-full">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    month={currentMonth}
                    onMonthChange={(newMonth) => setCurrentMonth(newMonth)}
                    /* 이번 달만 표시 */
                    showOutsideDays={false}
                    className="w-full"
                    components={{
                      DayContent: ({ date }) => {
                        const dayData = getDayData(date);
                        const isSelected =
                            !!selectedDate && date.toDateString() === selectedDate.toDateString();
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
                                    <span className="text-[18px]" aria-label="미션 달성">
                              ✅
                            </span>
                                )}
                              </div>

                              {/* 오늘 테두리 */}
                              {isToday && (
                                  <div className="absolute inset-0 rounded-md pointer-events-none ring-1 ring-gray-300" />
                              )}

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
                      /* 꽉 찬 달력, outside days 미표시 */
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
                      day_outside: 'hidden',
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