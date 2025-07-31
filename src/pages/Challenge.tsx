import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Users, 
  Target,
  Crown,
  TrendingUp,
  Calendar,
  Star,
  Award,
  Timer
} from 'lucide-react';

const Challenge = () => {
  const personalChallenges = [
    {
      id: 1,
      title: '30일 식단 기록 챌린지',
      description: '매일 3끼 식사를 빠짐없이 기록해보세요',
      progress: 23,
      total: 30,
      reward: '1000포인트 + 뱃지',
      difficulty: '쉬움',
      participants: 1245,
      status: 'active'
    },
    {
      id: 2,
      title: '단백질 목표 달성',
      description: '일주일 동안 매일 단백질 목표량 달성하기',
      progress: 5,
      total: 7,
      reward: '500포인트 + 뱃지',
      difficulty: '보통',
      participants: 892,
      status: 'active'
    },
    {
      id: 3,
      title: '물 마시기 마스터',
      description: '하루 8잔 이상 물 마시기를 2주간 지속',
      progress: 14,
      total: 14,
      reward: '완료',
      difficulty: '쉬움',
      participants: 2341,
      status: 'completed'
    }
  ];

  const teamChallenges = [
    {
      id: 1,
      title: '헬시팀 vs 피트팀',
      description: '팀원들과 함께 식단 점수 경쟁',
      myTeam: '헬시팀',
      myTeamScore: 2840,
      opponentTeam: '피트팀',
      opponentScore: 3120,
      rank: 2,
      totalTeams: 8,
      daysLeft: 12,
      status: 'active'
    },
    {
      id: 2,
      title: '30일 그룹 챌린지',
      description: '우리 팀이 가장 꾸준할 수 있을까?',
      myTeam: '건강한친구들',
      myTeamScore: 1890,
      rank: 1,
      totalTeams: 15,
      daysLeft: 8,
      status: 'active'
    }
  ];

  const availableChallenges = [
    {
      id: 1,
      title: '주말 홈쿠킹 챌린지',
      description: '주말마다 직접 요리한 식사 인증하기',
      duration: '4주',
      reward: '2000포인트',
      difficulty: '보통',
      participants: 156,
      startDate: '2024.02.10'
    },
    {
      id: 2,
      title: '금요일 치팅데이 금지',
      description: '금요일에도 건강한 식단 유지하기',
      duration: '8주',
      reward: '1500포인트 + 특별 뱃지',
      difficulty: '어려움',
      participants: 89,
      startDate: '2024.02.15'
    }
  ];

  const rankings = [
    { rank: 1, name: '김건강', score: 4890, badge: '👑' },
    { rank: 2, name: '이영양', score: 4567, badge: '🥈' },
    { rank: 3, name: '박단백', score: 4234, badge: '🥉' },
    { rank: 4, name: '최비타민', score: 3892, badge: '' },
    { rank: 5, name: '정미네랄', score: 3654, badge: '' },
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
                <Award className="text-warning" />
                내 챌린지 현황
              </h2>
              <Badge variant="secondary" className="bg-white/20">
                총 3개 참여중
              </Badge>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold">23</p>
                <p className="text-sm text-muted-foreground">완료한 챌린지</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-warning">2</p>
                <p className="text-sm text-muted-foreground">진행중</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-success">8,450</p>
                <p className="text-sm text-muted-foreground">누적 포인트</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">개인 챌린지</TabsTrigger>
            <TabsTrigger value="team">팀 배틀</TabsTrigger>
            <TabsTrigger value="available">새 챌린지</TabsTrigger>
            <TabsTrigger value="ranking">랭킹</TabsTrigger>
          </TabsList>

          {/* 개인 챌린지 */}
          <TabsContent value="personal" className="space-y-4">
            {personalChallenges.map((challenge) => (
              <Card key={challenge.id} className={challenge.status === 'completed' ? 'bg-success/10' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{challenge.title}</h3>
                        {challenge.status === 'completed' && <Crown className="text-warning" size={20} />}
                      </div>
                      <p className="text-muted-foreground mb-3">{challenge.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <Badge variant="outline">{challenge.difficulty}</Badge>
                        <span className="flex items-center gap-1">
                          <Users size={14} />
                          {challenge.participants.toLocaleString()}명 참여
                        </span>
                        <span className="text-primary font-medium">{challenge.reward}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>진행률</span>
                      <span>{challenge.progress}/{challenge.total}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${challenge.status === 'completed' ? 'bg-success' : 'bg-primary'}`}
                        style={{width: `${(challenge.progress / challenge.total) * 100}%`}}
                      ></div>
                    </div>
                  </div>

                  {challenge.status === 'active' && (
                    <Button className="w-full mt-4">
                      계속하기
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* 팀 배틀 */}
          <TabsContent value="team" className="space-y-4">
            {teamChallenges.map((challenge) => (
              <Card key={challenge.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{challenge.title}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant={challenge.rank === 1 ? "default" : "secondary"}>
                        {challenge.rank}위
                      </Badge>
                      <Badge variant="outline">
                        <Timer size={12} className="mr-1" />
                        {challenge.daysLeft}일 남음
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">{challenge.description}</p>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-primary/10 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{challenge.myTeam} (우리팀)</span>
                        {challenge.rank === 1 && <Crown className="text-warning" size={16} />}
                      </div>
                      <p className="text-2xl font-bold text-primary">{challenge.myTeamScore.toLocaleString()}점</p>
                    </div>
                    
                    {challenge.opponentTeam && (
                      <div className="bg-muted p-4 rounded-lg">
                        <span className="font-medium block mb-2">{challenge.opponentTeam}</span>
                        <p className="text-2xl font-bold">{challenge.opponentScore.toLocaleString()}점</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      전체 {challenge.totalTeams}팀 중 {challenge.rank}위
                    </span>
                    <Button size="sm">
                      팀 채팅
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* 새 챌린지 */}
          <TabsContent value="available" className="space-y-4">
            {availableChallenges.map((challenge) => (
              <Card key={challenge.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{challenge.title}</h3>
                      <p className="text-muted-foreground mb-3">{challenge.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <Badge variant="outline">{challenge.difficulty}</Badge>
                        <span>{challenge.duration}</span>
                        <span className="flex items-center gap-1">
                          <Users size={14} />
                          {challenge.participants}명 대기중
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">시작일</p>
                      <p className="font-medium">{challenge.startDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">보상</p>
                      <p className="font-medium text-primary">{challenge.reward}</p>
                    </div>
                    <Button>
                      참여하기
                    </Button>
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
                  <TrendingUp size={20} />
                  이번 주 랭킹
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rankings.map((user) => (
                    <div key={user.rank} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-full text-primary-foreground font-bold">
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
                  <Trophy className="mx-auto mb-4 text-warning" size={48} />
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