import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Award, Crown, TrendingUp, Trophy,} from 'lucide-react';
import {useEffect, useState} from "react";
import {defaultFetch} from "@/api/defaultFetch.ts";

export interface ChallengeResponse {
  title: string,
  description: string,
  cleared: boolean,
  targetCount: number,
  progressCount: number,
  startDate?: string,
  endDate?: string,
}

const Challenge = () => {
  const [regularChallenges, setRegularChallenges] = useState<ChallengeResponse[]>([]);
  const [eventChallenges, setEventChallenges] = useState<ChallengeResponse[]>([]);

  useEffect(() => {
    // 상시 챌린지, 이벤트 챌린지 리스트 받기
    const getChallengeList = async () => {
      const regularChallenges = await defaultFetch<ChallengeResponse[]>("/api/challenge/regular")
      setRegularChallenges(regularChallenges);

      const eventChallenges = await defaultFetch<ChallengeResponse[]>("/api/challenge/event")
      setEventChallenges(eventChallenges);
    }

    getChallengeList();
  }, []);

  const completedCount = regularChallenges.filter((c) => c.cleared).length + eventChallenges.filter((c) => c.cleared).length;
  const activeCount = regularChallenges.filter((c) => !c.cleared && c.progressCount !== 0 && c.progressCount < c.targetCount).length + eventChallenges.filter((c) => !c.cleared && c.progressCount !== 0 &&  c.progressCount > 0).length;

  const rankings = [
    {rank: 1, name: '김건강', score: 4890, badge: '👑'},
    {rank: 2, name: '이영양', score: 4567, badge: '🥈'},
    {rank: 3, name: '박단백', score: 4234, badge: '🥉'},
    {rank: 4, name: '최비타민', score: 3892, badge: ''},
    {rank: 5, name: '정미네랄', score: 3654, badge: ''},
  ];

  return (
      <div className="min-h-screen bg-background pb-20 md:pb-6">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* 헤더 */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">챌린지</h1>
            <p className="text-muted-foreground">함께하면 더 재미있는 건강 습관 만들기</p>
          </div>

          {/* 내 챌린지 현황 */}
          <Card className="bg-gradient-to-r from-brand-green to-brand-cream">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Award className="text-warning"/>
                  내 챌린지 현황
                </h2>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                {/* 상시: 검정(다크 모드에서는 흰색) */}
                <div className="text-center">
                  <p className="text-3xl font-bold text-black dark:text-white">{regularChallenges.length}</p>
                  <p className="text-sm text-black/70 dark:text-white/80">상시 챌린지</p>
                </div>
                {/* 이벤트: 파랑 */}
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{eventChallenges.length}</p>
                  <p className="text-sm text-blue-700/80 dark:text-blue-300/80">이벤트 챌린지</p>
                </div>
                {/* 진행중: 노랑 */}
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{activeCount}</p>
                  <p className="text-sm text-yellow-700/80 dark:text-yellow-300/80">진행중</p>
                </div>
                {/* 완료: 초록 */}
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{completedCount}</p>
                  <p className="text-sm text-green-700/80 dark:text-green-300/80">완료한 챌린지</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">상시 챌린지</TabsTrigger>
              <TabsTrigger value="event">이벤트 챌린지</TabsTrigger>
              <TabsTrigger value="ranking">랭킹</TabsTrigger>
            </TabsList>

            {/* 개인 챌린지 */}
            <TabsContent value="personal" className="space-y-4">
              {regularChallenges.map((challenge, idx) => (
                  <Card key={idx} className={challenge.cleared ? 'bg-success/10' : ''}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{challenge.title}</h3>
                            {challenge.cleared && <Crown className="text-warning" size={20}/>}
                          </div>
                          <p className="text-muted-foreground mb-3">{challenge.description}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>진행률</span>
                          <span>{challenge.progressCount}/{challenge.targetCount}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3">
                          <div
                              className={`h-3 rounded-full ${challenge.cleared ? 'bg-success' : 'bg-primary'}`}
                              style={{width: `${(challenge.progressCount / challenge.targetCount) * 100}%`}}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
              ))}
            </TabsContent>


            {/* 이벤트 챌린지 */}
            <TabsContent value="event" className="space-y-4">
              {eventChallenges.map((challenge) => (
                  <Card key={challenge.title}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">{challenge.title}</h3>
                          <p className="text-muted-foreground mb-3">{challenge.description}</p>
                          <div className="text-sm text-foreground/80">
                            {challenge.startDate && challenge.endDate ? (
                                <span>기간: {challenge.startDate} ~ {challenge.endDate}</span>
                            ) : challenge.startDate ? (
                                <span>시작일: {challenge.startDate}</span>
                            ) : null}
                          </div>
                        </div>
                        {challenge.cleared && <Crown className="text-warning" size={20}/>}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>진행률</span>
                          <span>{challenge.progressCount}/{challenge.targetCount}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3">
                          <div
                              className={`h-3 rounded-full ${challenge.cleared ? 'bg-success' : 'bg-primary'}`}
                              style={{width: `${(challenge.progressCount / challenge.targetCount) * 100}%`}}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
              ))}
            </TabsContent>

            {/* 랭킹 */}
            <TabsContent value="ranking" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp size={20}/>
                    이번 주 랭킹
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {rankings.map((user) => (
                        <div key={user.rank}
                             className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div
                                className="flex items-center justify-center w-8 h-8 bg-primary rounded-full text-primary-foreground font-bold">
                              {user.badge || user.rank}
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.rank}위</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{user.score.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">포인트</p>
                          </div>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-brand-light to-brand-cream">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Trophy className="mx-auto mb-4 text-warning" size={48}/>
                    <h3 className="text-xl font-bold mb-2">이번 주 내 순위</h3>
                    <p className="text-3xl font-bold text-primary mb-2">47위</p>
                    <p className="text-muted-foreground">2,890점 | 상위 15%</p>
                    <Button className="mt-4" size="sm">
                      더 열심히 도전하기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
  );
};

export default Challenge;