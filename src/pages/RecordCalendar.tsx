import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import {ChevronLeft, ChevronRight, ArrowLeft, Check, Stamp} from 'lucide-react';
import { defaultFetch } from "@/api/defaultFetch.ts";


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

  // ✅ defaultFetch로 교체 + 절대 경로 보장
  const fetchCalendarData = async (year: number, month: number) => {
    setLoading(true);
    try {
      const data = await defaultFetch(`/api/calendar/month?year=${year}&month=${month}`, {
        method: 'GET',
        // 필요 시: headers: { Accept: 'application/json' },
      });

      // 혹시 서버가 200 HTML을 준 경우 방어
      if (!data || typeof data !== 'object' || !('items' in data)) {
        console.error('[RecordCalendar] JSON이 아님 또는 형태 불일치. preview=', String(data).slice(0, 200));
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
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

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

  const formatWaterDisplay = (waterMl: number | null | undefined): string =>
      !waterMl ? '-' : `${(waterMl / 1000).toFixed(1)}L`;

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
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#fffff5' }}>
        {/* 헤더(고정) */}
        <div
            ref={headerRef}
            className="bg-white border-b border-border px-4 py-4 sticky top-0 z-10"
        >
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

        {/* ✅ 캘린더 영역: 헤더 제외 높이를 전부 사용 */}
        <div className="px-4 pt-6 pb-6">
          <Card className="shadow-lg border-0 bg-white h-full">
            {/* ✅ min-h-0로 내부 스크롤 허용 */}
            <CardContent className="p-6 flex flex-col overflow-visible">
              {/* 월 네비게이션 (가운데 월 타이틀 표시) */}
              <div className="flex items-center justify-between mb-4 shrink-0">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-muted"
                    disabled={loading}
                >
                  <ChevronLeft size={20} />
                </Button>

                <div className="text-base font-semibold tabular-nums">
                  {currentMonth.getFullYear()}년{' '}
                  {String(currentMonth.getMonth() + 1).padStart(2, '0')}월
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-muted"
                    disabled={loading}
                >
                  <ChevronRight size={20} />
                </Button>
              </div>

              {/* ✅ 캘린더 컨테이너: 카드 내부 남은 공간 100% + 스크롤 */}
              <div className="calendar-container w-full">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    month={currentMonth}
                    onMonthChange={(newMonth) => setCurrentMonth(newMonth)}
                    className="w-full"
                    components={{
                      DayContent: ({ date }) => {
                        const dayData = getDayData(date);
                        const isSelected =
                            selectedDate && date.toDateString() === selectedDate.toDateString();
                        const isToday = date.toDateString() === new Date().toDateString();
                        const isWeekend = [0, 6].includes(date.getDay());

                        return (
                            <div
                                className={[
                                  'relative w-full h-full flex flex-col p-2 rounded-md transition-all',
                                  'bg-white',
                                  isSelected ? 'ring-2 ring-blue-500' : 'hover:shadow-sm',
                                ].join(' ')}
                            >
                              {/* 날짜 숫자 + 도장 배지 */}
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

                                {/* 도장 (achieved=true) */}

                                {dayData?.missionsCompleted && (
                                    <span className="absolute top-1.5 right-1.5 text-xl ">
                                        ✅
                                    </span>
                                )}

                                {/*{dayData?.missionsCompleted && (*/}
                                {/*    <div*/}
                                {/*        className="absolute top-1.5 right-1.5 grid place-items-center*/}
                                {/*       w-9 h-9 rounded-full bg-red-100/80 text-red-700*/}
                                {/*       ring-2 ring-red-700/80*/}
                                {/*       rotate-[-12deg] opacity-90*/}
                                {/*       shadow-[0_0_0_4px_rgba(185,28,28,0.15),0_6px_14px_rgba(185,28,28,0.22)]*/}
                                {/*       mix-blend-multiply"*/}
                                {/*                            >*/}
                                {/*      <Stamp size={16} strokeWidth={2.5} />*/}
                                {/*    </div>*/}
                                {/*)}*/}
                              </div>

                              {/* 오늘 테두리 */}
                              {isToday && (
                                  <div className="absolute inset-0 rounded-md pointer-events-none ring-1 ring-gray-300"></div>
                              )}

                              {/* 요약 (kcal / kg / 물) */}
                              <div className="mt-2 space-y-1 text-[11px] leading-4 text-gray-700">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">kcal</span>
                                  <span className="font-medium tabular-nums">
                              {dayData ? dayData.calories.toLocaleString() : 0}
                            </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">kg</span>
                                  <span className="tabular-nums">
                              {dayData?.weight != null ? dayData.weight : '-'}
                            </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">물</span>
                                  <span className="tabular-nums">
                              {dayData?.water ? `${(dayData.water / 1000).toFixed(1)}L` : '-'}
                            </span>
                                </div>
                              </div>
                            </div>
                        );
                      },
                    }}
                    classNames={{
                      // ✅ DayPicker 내부까지 높이 전파 (꽉 채우기)
                      months: 'h-full flex-1',
                      month: 'h-full flex-1 flex flex-col',
                      table: 'w-full border-collapse border-spacing-0 h-full',
                      tbody: 'h-full flex-1 flex flex-col',
                      head_row: 'flex w-full',
                      head_cell:
                          'text-muted-foreground font-medium text-xs w-full text-center py-2',
                      row: 'flex w-full flex-1',
                      cell: 'p-1 w-full h-full',
                      day: 'w-full h-full p-0', // 내부에서 카드 스타일 적용
                      day_today: '', // 오늘 스타일은 DayContent에서 처리
                      day_selected: '', // 선택 스타일도 DayContent에서 처리
                      day_outside: 'opacity-50',
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