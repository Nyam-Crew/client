import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { HelpCircle, Droplets, Scale, Flame } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface UserInfo {
  name: string;
}

interface TodayStats {
  calories: { current: number; target: number; remaining: number };
  carbs: { percentage: number; current: number; target: number };
  protein: { percentage: number; current: number; target: number };
  fat: { percentage: number; current: number; target: number };
}

interface BMICategory {
  text: string;
  color: string; // tailwind text color class e.g. 'text-green-600'
}

interface MyDayTabProps {
  userInfo: UserInfo;
  bmi: number | null;
  bmiCategory: BMICategory;
  bmr: number | null;
  tdee: number | null;
  todayStats: TodayStats;

  /** ⬇️ 추가: 있으면 표시, 없으면 숨김 */
  waterMl?: number | null;        // 하루 물 섭취량 (ml) — insights.totalWater 등
  waterGoalMl?: number | null;    // 물 목표 (ml)
  weightKg?: number | null;       // 오늘 체중
  proteinGoalG?: number | null;   // 단백질 목표 (g)
}

const MyDayTab = ({
                    userInfo,
                    bmi,
                    bmiCategory,
                    bmr,
                    tdee,
                    todayStats,
                    waterMl,
                    waterGoalMl,
                    weightKg,
                    proteinGoalG,
                  }: MyDayTabProps) => {
  // 칼로리 도넛
  const calorieData = [
    { name: '섭취', value: todayStats.calories.current },
    { name: '잔여', value: Math.max(0, todayStats.calories.remaining) },
  ];
  const COLORS = ['#4CAF50', '#E0E0E0'];

  // 영양소 퍼센트 (부모에서 계산해 준 값 사용)
  const nutrientData = [
    { name: '탄수화물', value: todayStats.carbs.percentage, color: '#FFC107' },
    { name: '단백질', value: todayStats.protein.percentage, color: '#F44336' },
    { name: '지방', value: todayStats.fat.percentage, color: '#2196F3' },
  ];

  const hasCalorieTarget = todayStats.calories.target > 0;
  const showCalorieText = hasCalorieTarget && todayStats.calories.remaining !== 0;

  const bmiText  = bmi  !== null ? bmi.toFixed(1) : '-';
  const bmrText  = bmr  !== null ? Math.round(bmr) : '-';
  const tdeeText = tdee !== null ? Math.round(tdee) : '-';

  const showWater = typeof waterMl === 'number' && waterMl >= 0;
  const showWeight = typeof weightKg === 'number' && weightKg > 0;

  const showWaterGoalBadge =
      showWater && typeof waterGoalMl === 'number' && waterGoalMl! > 0;

  const showProteinGoalBadge =
      typeof todayStats.protein.current === 'number' &&
      todayStats.protein.current > 0 &&
      typeof proteinGoalG === 'number' &&
      proteinGoalG! > 0;

  const ACTIVITY_LABELS: Record<string, { label: string; factor: number }> = {
    SEDENTARY:   { label: '비활동적 (주로 앉아서 생활)',              factor: 1.2   },
    LIGHT:       { label: '가벼운 활동 (주 1~2회 가벼운 운동)',        factor: 1.375 },
    MODERATE:    { label: '보통 활동 (주 3~5회 보통 강도 운동)',        factor: 1.55  },
    ACTIVE:      { label: '활발한 활동 (주 6~7회 규칙적인 운동)',        factor: 1.725 },
    VERY_ACTIVE: { label: '매우 활발한 활동 (매일 고강도 운동 또는 육체노동)', factor: 1.9   },
  };

  return (
      <div className="px-4 pt-6 pb-24 bg-gray-50/50" style={{ backgroundColor: '#fffff5' }}>
        <div className="space-y-6">
          {/* 인사말 */}
          <div className="text-left">
            <h1 className="text-2xl font-bold text-gray-800">
              안녕하세요, {userInfo.name || '사용자'}님!
            </h1>
            <p className="text-gray-500">오늘도 건강한 하루를 만들고 계신가요? 💪</p>
          </div>

          {/* ✅ 상단 KPI 미니카드 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 섭취/목표 kcal */}
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Flame size={18} className="text-orange-500" />
                  <span className="text-xs text-gray-500">칼로리</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 leading-tight">
                  {todayStats.calories.current}
                  <span className="text-sm text-gray-500 ml-1">/ {hasCalorieTarget ? todayStats.calories.target : '-'}</span>
                  <span className="text-sm text-gray-500 ml-1">kcal</span>
                </div>
              </CardContent>
            </Card>

            {/* 물 섭취량 */}
            {showWater && (
                <Card className="border-0 shadow-sm bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Droplets size={18} className="text-sky-500" />
                      <span className="text-xs text-gray-500">물 섭취</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 leading-tight">
                      {Math.round(waterMl!)}
                      <span className="text-sm text-gray-500 ml-1">ml</span>
                    </div>

                    {/* 물 목표 배지 (있을 때만) */}
                    {showWaterGoalBadge && (
                        <div className="mt-2 inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[11px] text-sky-700">
                          목표 {waterGoalMl}ml 대비 {Math.round((waterMl! / waterGoalMl!) * 100)}%
                        </div>
                    )}
                  </CardContent>
                </Card>
            )}

            {/* 체중 */}
            {showWeight && (
                <Card className="border-0 shadow-sm bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Scale size={18} className="text-emerald-500" />
                      <span className="text-xs text-gray-500">체중</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 leading-tight">
                      {Number(weightKg).toFixed(1)}
                      <span className="text-sm text-gray-500 ml-1">kg</span>
                    </div>
                  </CardContent>
                </Card>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 칼로리 도넛 */}
            <Card className="shadow-md border-0 bg-white overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="w-40 h-40 sm:w-48 sm:h-48 relative">

                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        {/* 1) 배경 트랙 */}
                        <Pie
                            data={[{ value: 100 }]}
                            cx="50%" cy="50%"
                            innerRadius={60} outerRadius={80}
                            startAngle={90} endAngle={450}
                            dataKey="value"
                            stroke="none"
                            fill="#E6EDE6"
                        />

                        {/* 2) 진행(섭취) */}
                        {(() => {
                          const target = todayStats.calories.target || 0;
                          const current = todayStats.calories.current || 0;

                          // 진행 퍼센트 (0~100로 클램프)
                          const rawPct = target > 0 ? (current / target) * 100 : 0;
                          const progressPct = Math.max(0, Math.min(100, rawPct));
                          const restPct = 100 - progressPct;

                          return (
                              <Pie
                                  data={[
                                    { name: 'progress', value: progressPct },
                                    { name: 'rest', value: restPct },
                                  ]}
                                  cx="50%" cy="50%"
                                  innerRadius={60} outerRadius={80}
                                  startAngle={90} endAngle={450}
                                  paddingAngle={0}
                                  stroke="none"
                                  cornerRadius={8}
                                  dataKey="value"
                              >
                                <Cell fill="#4CAF50" />      {/* 진행 */}
                                <Cell fill="transparent" />  {/* 나머지 */}
                              </Pie>
                          );
                        })()}
                      </PieChart>
                    </ResponsiveContainer>

                    {/* ✅ 중앙 텍스트 가독성 강화 */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-green-600 leading-none">
                      {todayStats.calories.current}
                    </span>
                      <span className="text-[11px] text-gray-500 mt-1">
                      / {hasCalorieTarget ? todayStats.calories.target : '-'} kcal
                    </span>
                    </div>
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">오늘의 칼로리</h3>
                    {showCalorieText ? (
                        todayStats.calories.remaining > 0 ? (
                            <p className="text-gray-600">
                              목표까지 <span className="font-bold text-green-600">
                        {todayStats.calories.remaining}kcal
                      </span>{' '}
                              남았어요. 잘하고 있어요!
                            </p>
                        ) : (
                            <p className="text-gray-600">
                              목표보다{' '}
                              <span className="font-bold text-red-500">
                          {Math.abs(todayStats.calories.remaining)}kcal
                        </span>{' '}
                              초과했어요.
                            </p>
                        )
                    ) : (
                        <p className="text-gray-400 text-sm">목표 칼로리 정보가 없어요.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 영양소 분석 */}
            <Card className="shadow-md border-0 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">영양소 분석</h3>

                  <TooltipProvider delayDuration={150}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                            aria-label="영양소 퍼센트 계산 방법"
                            className="inline-flex items-center justify-center w-5 h-5 rounded-full hover:bg-gray-100 text-gray-500"
                        >
                          <HelpCircle size={16} />
                        </button>
                      </TooltipTrigger>

                      <TooltipContent side="top" className="max-w-[280px] text-xs leading-relaxed">
                        <p className="font-medium mb-1">퍼센트 계산 방법</p>
                        <p>
                          오늘 섭취한 총 칼로리(<b>{todayStats.calories.current}</b>kcal) 중
                          각 영양소가 차지하는 비율입니다:
                        </p>
                        <ul className="list-disc pl-4 mt-1">
                          <li>탄수화물: (탄수화물 g × 4) ÷ 총섭취kcal × 100</li>
                          <li>단백질: (단백질 g × 4) ÷ 총섭취kcal × 100</li>
                          <li>지방: (지방 g × 9) ÷ 총섭취kcal × 100</li>
                        </ul>

                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* 단백질 목표 배지 (있을 때만) */}
                {showProteinGoalBadge && (
                    <div className="mb-2 inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[11px] text-rose-700">
                      단백질 {Math.round(todayStats.protein.current)}g / {proteinGoalG}g
                    </div>
                )}

                <div className="space-y-4">
                  {nutrientData.map((nutrient) => (
                      <div key={nutrient.name}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">{nutrient.name}</span>
                          <span className="text-sm text-gray-500">{nutrient.value.toFixed(0)}%</span>
                        </div>
                        <Progress
                            value={nutrient.value}
                            className="h-2"
                            style={{ backgroundColor: `${nutrient.color}33` }}
                            // @ts-ignore: 내부 구현상 data-[state] 속성 사용
                            indicatorstyle={{ backgroundColor: nutrient.color }}
                        />
                      </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 건강 정보 */}
          <Card className="shadow-md border-0 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-800">나의 건강 지표</h3>

                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                          aria-label="BMI/BMR/TDEE 계산 방법"
                          className="inline-flex items-center justify-center w-5 h-5 rounded-full hover:bg-gray-100 text-gray-500"
                      >
                        <HelpCircle size={16} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="w-[320px] text-xs leading-relaxed p-4 rounded-lg shadow-md bg-white">
                      <p className="font-semibold text-gray-800 mb-2">계산 방법</p>

                      <div className="space-y-2 text-gray-700">
                        <div>
                          <span className="font-bold">📏 BMI</span>
                          <div className="text-gray-600 ml-5">= 체중(kg) ÷ (키(m))²</div>
                        </div>

                        <div>
                          <span className="font-bold">⚡ 기초대사량 (BMR)</span>
                          <div className="text-gray-600 ml-5">해리스 베네딕트 공식</div>
                          <ul className="ml-6 list-disc">
                            <li>남성: 88.362 + 13.397×체중 + 4.799×키 − 5.677×나이</li>
                            <li>여성: 447.593 + 9.247×체중 + 3.098×키 − 4.330×나이</li>
                          </ul>
                        </div>

                        <div>
                          <span className="font-bold">🏃 총에너지소비량 (TDEE)</span>
                          <div className="text-gray-600 ml-5">= BMR × 활동계수</div>
                          <ul className="mt-2 ml-5 space-y-1 text-[11px] text-gray-600">
                            {Object.entries(ACTIVITY_LABELS).map(([key, v]) => (
                                <li key={key} className="list-disc">
                                  {v.label} : {v.factor}
                                </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <hr className="my-2" />

                      <div className="text-[12px] space-x-2">
                        <span className="text-green-600 font-medium">BMI {bmiText}</span>
                        <span className="text-blue-600 font-medium">BMR {bmrText} kcal</span>
                        <span className="text-orange-600 font-medium">TDEE {tdeeText} kcal</span>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">BMI</div>
                  <div className="text-xl font-bold text-gray-800">{bmiText}</div>
                  {!!bmi && bmiCategory?.text ? (
                      <div className={`text-xs font-medium ${bmiCategory.color}`}>{bmiCategory.text}</div>
                  ) : (
                      <div className="text-xs text-gray-400">-</div>
                  )}
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">기초대사량</div>
                  <div className="text-xl font-bold text-gray-800">{bmrText}</div>
                  <div className="text-xs text-gray-500">kcal</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">활동대사량</div>
                  <div className="text-xl font-bold text-gray-800">{tdeeText}</div>
                  <div className="text-xs text-gray-500">kcal</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
};

export default MyDayTab;