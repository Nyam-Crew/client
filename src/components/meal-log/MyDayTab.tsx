import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { User, Activity, Zap, Flame, Droplets, Weight, CheckCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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
    color: string;
}

interface MyDayTabProps {
  userInfo: UserInfo;
  bmi: number;
  bmiCategory: BMICategory;
  bmr: number;
  tdee: number;
  todayStats: TodayStats;
}

const MyDayTab = ({
  userInfo,
  bmi,
  bmiCategory,
  bmr,
  tdee,
  todayStats,
}: MyDayTabProps) => {

  const calorieData = [
    { name: '섭취', value: todayStats.calories.current },
    { name: '잔여', value: Math.max(0, todayStats.calories.remaining) },
  ];

  const nutrientData = [
    { name: '탄수화물', value: todayStats.carbs.percentage, color: '#FFC107' },
    { name: '단백질', value: todayStats.protein.percentage, color: '#F44336' },
    { name: '지방', value: todayStats.fat.percentage, color: '#2196F3' },
  ];

  const COLORS = ['#4CAF50', '#E0E0E0'];

  return (
    <div className="px-4 pt-6 pb-24 bg-gray-50/50" style={{ backgroundColor: '#fffff5' }}>
      <div className="space-y-6">
        {/* 인사말 */}
        <div className="text-left">
          <h1 className="text-2xl font-bold text-gray-800">안녕하세요, {userInfo.name}님!</h1>
          <p className="text-gray-500">오늘도 건강한 하루를 만들고 계신가요? 💪</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 칼로리 현황 */}
          <Card className="shadow-md border-0 bg-white overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="w-40 h-40 sm:w-48 sm:h-48 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={calorieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        startAngle={90}
                        endAngle={450}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {calorieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-green-600">{todayStats.calories.current}</span>
                    <span className="text-sm text-gray-500">/ {todayStats.calories.target} kcal</span>
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">오늘의 칼로리</h3>
                  {todayStats.calories.remaining >= 0 ? (
                    <p className="text-gray-600">
                      목표까지 <span className="font-bold text-green-600">{todayStats.calories.remaining}kcal</span> 남았어요. 잘하고 있어요!
                    </p>
                  ) : (
                    <p className="text-gray-600">
                      목표보다 <span className="font-bold text-red-500">{Math.abs(todayStats.calories.remaining)}kcal</span> 초과했어요.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 영양소 현황 */}
          <Card className="shadow-md border-0 bg-white">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">영양소 분석</h3>
              <div className="space-y-4">
                {nutrientData.map((nutrient) => (
                  <div key={nutrient.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{nutrient.name}</span>
                      <span className="text-sm text-gray-500">{nutrient.value.toFixed(0)}%</span>
                    </div>
                    <Progress value={nutrient.value} className="h-2" style={{ backgroundColor: nutrient.color + '33'}} indicatorClassName={`bg-[${nutrient.color}]`} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 건강 정보 */}
        <Card className="shadow-md border-0 bg-white">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">나의 건강 지표</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">BMI</div>
                <div className="text-xl font-bold text-gray-800">{bmi.toFixed(1)}</div>
                <div className={`text-xs font-medium ${bmiCategory.color}`}>{bmiCategory.text}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">기초대사량</div>
                <div className="text-xl font-bold text-gray-800">{Math.round(bmr)}</div>
                <div className="text-xs text-gray-500">kcal</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">활동대사량</div>
                <div className="text-xl font-bold text-gray-800">{Math.round(tdee)}</div>
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
