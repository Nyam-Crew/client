import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  PlusCircle, 
  Trophy, 
  Users, 
  TrendingUp, 
  Calendar,
  Award,
  Target,
  MessageCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
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
              <Badge variant="secondary" className="mb-2">
                7일 연속 기록 🔥
              </Badge>
              <p className="text-sm text-muted-foreground">
                목표 달성률 85%
              </p>
            </div>
          </div>

          {/* 오늘의 할 일 */}
          <Card className="bg-white/50 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <Target size={16} />
                오늘의 미션
              </h2>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <span className="text-sm">아침 식사 기록하기</span>
                  <Badge variant="secondary" className="ml-auto">대기중</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-sm">물 8잔 마시기</span>
                  <Badge variant="default" className="ml-auto">완료</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-muted rounded-full"></div>
                  <span className="text-sm">운동 30분</span>
                  <Badge variant="outline" className="ml-auto">예정</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* 빠른 액션 버튼들 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/meal">
            <Button className="w-full h-20 flex-col gap-2 bg-brand-light hover:bg-brand-green text-foreground hover:text-white transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md">
              <PlusCircle size={24} />
              <span>식단 기록</span>
            </Button>
          </Link>
          <Link to="/challenge">
            <Button className="w-full h-20 flex-col gap-2 bg-brand-light hover:bg-brand-green text-foreground hover:text-white transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md">
              <Trophy size={24} />
              <span>챌린지</span>
            </Button>
          </Link>
          <Link to="/community">
            <Button className="w-full h-20 flex-col gap-2 bg-brand-light hover:bg-brand-green text-foreground hover:text-white transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md">
              <Users size={24} />
              <span>커뮤니티</span>
            </Button>
          </Link>
          <Link to="/chat">
            <Button className="w-full h-20 flex-col gap-2 bg-brand-light hover:bg-brand-green text-foreground hover:text-white transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md">
              <MessageCircle size={24} />
              <span>채팅</span>
            </Button>
          </Link>
        </div>

        {/* 진행중인 챌린지 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Trophy className="text-warning" size={20} />
                진행중인 챌린지
              </h2>
              <Link to="/challenge">
                <Button variant="ghost" size="sm">
                  전체보기
                </Button>
              </Link>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-gradient-to-r from-brand-light to-brand-cream">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">30일 식단 기록 챌린지</h3>
                    <Badge variant="default">진행중</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    매일 3끼 식사를 기록해보세요
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>진행률</span>
                      <span>7/30일</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{width: '23%'}}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-success/10 to-success/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">팀 배틀: 헬시팀</h3>
                    <Badge variant="outline">2위</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    우리 팀이 1위로 올라갈 수 있을까요?
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>팀 점수</span>
                      <span>2,840점</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp size={16} className="text-success" />
                      <span className="text-sm text-success">+120점 (어제)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* 최근 활동 */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar size={20} />
              최근 활동
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-accent/30 rounded-lg">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Award className="text-primary-foreground" size={16} />
                </div>
                <div className="flex-1">
                  <p className="font-medium">새로운 뱃지 획득!</p>
                  <p className="text-sm text-muted-foreground">'일주일 연속 기록' 뱃지를 받았어요</p>
                </div>
                <span className="text-xs text-muted-foreground">방금</span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg">
                <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
                  <Users className="text-white" size={16} />
                </div>
                <div className="flex-1">
                  <p className="font-medium">커뮤니티 댓글</p>
                  <p className="text-sm text-muted-foreground">김영양님이 내 식단에 댓글을 달았어요</p>
                </div>
                <span className="text-xs text-muted-foreground">10분 전</span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg">
                <div className="w-10 h-10 bg-warning rounded-full flex items-center justify-center">
                  <MessageCircle className="text-white" size={16} />
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