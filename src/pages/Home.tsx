import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {
  Award,
  Calendar,
  MessageCircle,
  PlusCircle,
  Target,
  TrendingUp,
  Trophy,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getTodayMissions, Mission } from '@/api/missions';
import {defaultFetch} from "@/api/defaultFetch.ts";
import {ChallengeResponse} from "@/pages/Challenge.tsx";


const Home = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [challengeList, setChallengeList] = useState<ChallengeResponse[]>([]);

  useEffect(() => {
    // 일일 미션 가져오기
    const fetchMissions = async () => {
      const todayMissions = await getTodayMissions();
      setMissions(todayMissions);
    };

    // 진행중인 챌린지 정보 가져오기
    const fetchProgressingChallenge = async () => {
      const res = await defaultFetch<ChallengeResponse[]>("/api/challenge/progressing");

      setChallengeList(res);
    }

    fetchProgressingChallenge();
    fetchMissions();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 섹션 */}
      <div className="bg-gradient-to-r from-brand-green to-brand-cream p-6 rounded-b-3xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                안녕하세요, 김건강님! 👋
              </h1>
              <p className="text-muted-foreground">
                오늘도 건강한 하루 시작해볼까요?
              </p>
            </div>
            <div className="text-right">
            </div>
          </div>

          {/* 오늘의 미션 */}
          <Card className="bg-white/50 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <Target size={16} />
                오늘의 미션
              </h2>
              <div className="space-y-2">
                {missions.length > 0 ? (
                  missions.map((mission) => (
                    <div key={mission.dailyMissionId} className="flex items-center gap-3">
                      <div className={`w-2 h-2 ${mission.completed ? 'bg-success' : 'bg-warning'} rounded-full`}></div>
                      <span className="text-sm">{mission.title}</span>
                      <Badge variant={mission.completed ? 'default' : 'secondary'} className="ml-auto">
                        {mission.completed ? '완료' : '미완료'}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">오늘의 미션이 없습니다.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* 빠른 액션 버튼들 */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Link to="/meal">
              <Button
                  className="w-full h-20 flex-col gap-2 bg-brand-light hover:bg-brand-green text-foreground hover:text-white transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md">
                <PlusCircle size={24}/>
                <span>식단 기록</span>
              </Button>
            </Link>
            <Link to="/challenge">
              <Button
                  className="w-full h-20 flex-col gap-2 bg-brand-light hover:bg-brand-green text-foreground hover:text-white transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md">
                <Trophy size={24}/>
                <span>챌린지</span>
              </Button>
            </Link>
            <Link to="/community">
              <Button
                  className="w-full h-20 flex-col gap-2 bg-brand-light hover:bg-brand-green text-foreground hover:text-white transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md">
                <Users size={24}/>
                <span>커뮤니티</span>
              </Button>
            </Link>
          </div>

          {/* 진행중인 챌린지 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Trophy className="text-warning" size={20}/>
                  진행중인 챌린지
                </h2>
                <Link to="/challenge">
                  <Button variant="ghost" size="sm">
                    전체보기
                  </Button>
                </Link>
              </div>


              <div className="grid md:grid-cols-2 gap-4">
                {challengeList.length === 0 ? (
                    <div className="col-span-2 flex items-center justify-center">
                      <p>현재 진행중인 챌린지가 없습니다.</p>
                    </div>
                ) : (
                    challengeList.map((c, i) => {
                      const pct = c.targetCount > 0
                          ? Math.min(100, Math.round((c.progressCount / c.targetCount) * 100))
                          : 0;

                      return (
                          <Card key={i} className="bg-gradient-to-r from-brand-light to-brand-cream">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-medium">{c.title}</h3>
                                <Badge variant={c.cleared ? "secondary" : "default"}>
                                  {c.cleared ? "완료" : "진행중"}
                                </Badge>
                              </div>

                              <p className="text-sm text-muted-foreground mb-3">
                                {c.description}
                              </p>

                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>진행률</span>
                                  <span>
                  {c.progressCount}/{c.targetCount}
                </span>
                                </div>

                                <div className="w-full bg-muted rounded-full h-2">
                                  <div
                                      className="bg-primary h-2 rounded-full"
                                      style={{ width: `${pct}%` }}
                                      aria-valuenow={pct}
                                      aria-valuemin={0}
                                      aria-valuemax={100}
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                      );
                    })
                )}
              </div>
            </CardContent>
          </Card>

          {/* 최근 활동 */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar size={20}/>
                최근 활동
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-accent/30 rounded-lg">
                  <div
                      className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <Award className="text-primary-foreground" size={16}/>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">새로운 뱃지 획득!</p>
                    <p className="text-sm text-muted-foreground">'일주일 연속 기록' 뱃지를 받았어요</p>
                  </div>
                  <span className="text-xs text-muted-foreground">방금</span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg">
                  <div
                      className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
                    <Users className="text-white" size={16}/>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">커뮤니티 댓글</p>
                    <p className="text-sm text-muted-foreground">김영양님이 내 식단에 댓글을 달았어요</p>
                  </div>
                  <span className="text-xs text-muted-foreground">10분 전</span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg">
                  <div
                      className="w-10 h-10 bg-warning rounded-full flex items-center justify-center">
                    <MessageCircle className="text-white" size={16}/>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">팀 채팅</p>
                    <p className="text-sm text-muted-foreground">"헬시팀"에 새 메시지가 있어요</p>
                  </div>
                  <span className="text-xs text-muted-foreground">1시간 전</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 모바일 네비게이션 여백 */}
          <div className="h-20 md:hidden"></div>
        </div>
      </div>
  );
};

export default Home;