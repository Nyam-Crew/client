import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Target } from 'lucide-react';

interface Mission {
  dailyMissionId: number;
  title: string;
  completed: boolean;
}

interface DailyMissionsTabProps {
  dailyMissions: Mission[];
  missionsLoading: boolean;
  handleMissionComplete: (dailyMissionId: number) => void;
}

const DailyMissionsTab = ({
  dailyMissions,
  missionsLoading,
  handleMissionComplete,
}: DailyMissionsTabProps) => {
  return (
    <div className="px-4 pt-6 pb-8 space-y-4" style={{ backgroundColor: '#fffff5' }}>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-foreground mb-2">오늘의 미션</h2>
        <p className="text-sm text-muted-foreground">
          완료한 미션: {dailyMissions.filter(m => m.completed).length} / {dailyMissions.length}
        </p>
      </div>

      {missionsLoading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map((i) => (
                <Card key={i} className="animate-pulse border border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-muted"></div>
                        <div className="h-4 bg-muted rounded w-32"></div>
                      </div>
                      <div className="h-8 bg-muted rounded w-16"></div>
                    </div>
                  </CardContent>
                </Card>
            ))}
          </div>
      ) : (
          <div className="space-y-3">
            {dailyMissions.map((mission) => (
                <Card key={mission.dailyMissionId} className="border border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            mission.completed
                                ? 'bg-green-500 text-white'
                                : 'border-2 border-gray-300'
                        }`}>
                          {mission.completed && <Check size={16} />}
                        </div>
                        <span className={`font-medium ${
                            mission.completed
                                ? 'text-green-600 line-through'
                                : 'text-foreground'
                        }`}>
                    {mission.title}
                  </span>
                      </div>
                      <Button
                          variant={mission.completed ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleMissionComplete(mission.dailyMissionId)}
                          disabled={mission.completed}
                          className={mission.completed ? "text-green-600 border-green-200" : ""}
                      >
                        {mission.completed ? '완료됨' : '완료'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
            ))}
          </div>
      )}

      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6 text-center">
          <Target className="mx-auto mb-3 text-green-600" size={32} />
          <h3 className="font-semibold text-lg mb-2">
            {dailyMissions.filter(m => m.completed).length === dailyMissions.length
                ? '🎉 모든 미션 완료!'
                : '오늘도 화이팅!'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {dailyMissions.filter(m => m.completed).length === dailyMissions.length
                ? '모든 미션을 완료했습니다. 정말 대단해요!'
                : `${dailyMissions.length - dailyMissions.filter(m => m.completed).length}개의 미션이 남았어요.`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyMissionsTab;