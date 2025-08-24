import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Settings, Users, Crown, Shield, Bell, MessageSquare, Trophy, FileText, Edit, Trash2, UserPlus, UserMinus, ChevronDown, Droplets, Utensils, Weight, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ChatContainer from './ChatContainer';

interface TeamDetail {
  id: string;
  name: string;
  description: string;
  image?: string;
  currentMembers: number;
  maxMembers: number;
  leader: string;
  subLeader?: string;
  userRole: 'member' | 'sub_leader' | 'leader';
  joinedAt: string;
}

interface Notice {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  pinned: boolean;
}

interface TeamActivityFeedItem {
  feedId: string;
  memberId: number;
  nickname: string;
  profileImageUrl: string;
  activityType: 'WATER' | 'MEAL' | 'WEIGHT' | 'CHALLENGE';
  activityMessage: string;
  feedCreatedDate: string; // new Date().toISOString() 형식
}

const mockTeam: TeamDetail = {
  id: '1',
  name: '매일 운동하기',
  description: '매일 30분 이상 운동하는 것이 목표인 그룹입니다. 함께 꾸준히 운동해서 건강한 생활을 만들어가요!',
  currentMembers: 12,
  maxMembers: 20,
  leader: '김운동',
  subLeader: '박헬스',
  userRole: 'member',
  joinedAt: '2024-01-15'
};

// 그룹당 하나의 공지사항만 허용
const mockNotice: Notice | null = {
  id: '1',
  title: '그룹 운영 방침 안내',
  content: '안녕하세요! 매일 운동하기 그룹의 운영 방침을 안내드립니다. 매일 30분 이상 운동을 목표로 하며, 서로 격려하고 응원하는 분위기를 만들어가겠습니다. 무리한 운동보다는 꾸준한 운동을 지향하며, 부상 예방에 항상 주의해주세요.',
  author: '김운동',
  createdAt: '2024-01-20',
  pinned: true
};

// 목업 피드 데이터
const mockFeedData: TeamActivityFeedItem[] = [
  {
    feedId: '1',
    memberId: 1,
    nickname: '김운동',
    profileImageUrl: '/api/placeholder/40/40',
    activityType: 'WATER',
    activityMessage: '물 800ml를 마셨어요! 💧',
    feedCreatedDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    feedId: '2',
    memberId: 2, // 현재 사용자
    nickname: '나',
    profileImageUrl: '/api/placeholder/40/40',
    activityType: 'MEAL',
    activityMessage: '점심식사를 기록했어요! 🍽️ 닭가슴살 샐러드 - 320kcal',
    feedCreatedDate: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString()
  },
  {
    feedId: '3',
    memberId: 3,
    nickname: '박헬스',
    profileImageUrl: '/api/placeholder/40/40',
    activityType: 'WEIGHT',
    activityMessage: '체중을 기록했어요! 📊 72.5kg (-0.3kg)',
    feedCreatedDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  },
  {
    feedId: '4',
    memberId: 4,
    nickname: '이건강',
    profileImageUrl: '/api/placeholder/40/40',
    activityType: 'CHALLENGE',
    activityMessage: '오늘의 운동 목표를 달성했어요! 🎯 30분 러닝 완료',
    feedCreatedDate: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  },
  {
    feedId: '5',
    memberId: 2, // 현재 사용자
    nickname: '나',
    profileImageUrl: '/api/placeholder/40/40',
    activityType: 'WATER',
    activityMessage: '물 500ml 추가! 💦 오늘 목표까지 200ml 남았어요',
    feedCreatedDate: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    feedId: '6',
    memberId: 5,
    nickname: '최다이어트',
    profileImageUrl: '/api/placeholder/40/40',
    activityType: 'MEAL',
    activityMessage: '저녁식사 기록! 🌙 연어구이와 현미밥 - 450kcal',
    feedCreatedDate: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    feedId: '7',
    memberId: 6,
    nickname: '정운동맨',
    profileImageUrl: '/api/placeholder/40/40',
    activityType: 'CHALLENGE',
    activityMessage: '주간 운동 목표 3회 달성! 🏆 이번 주도 화이팅!',
    feedCreatedDate: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  }
];

const currentUserId = 2; // 현재 사용자 ID

const TeamDetailPage = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notices');
  const [settingsOpen, setSettingsOpen] = useState(false);
  // 목업용 역할 설정 (실제 API 연동 시 서버에서 받아옴)
  const [currentUserRole] = useState<'member' | 'sub_leader' | 'leader'>('leader'); // 테스트용으로 leader로 설정

  useEffect(() => {
    // 목업 데이터 로딩 시뮬레이션
    setTimeout(() => {
      setTeam(mockTeam);
      setNotice(mockNotice);
      setLoading(false);
    }, 800);
  }, [teamId]);

  const handleLeaveGroup = async () => {
    try {
      // 실제 구현에서는 API 호출
      console.log('Leaving group:', teamId);

      toast({
        title: "그룹 탈퇴 완료",
        description: "그룹에서 탈퇴했습니다."
      });

      navigate('/api/teams?tab=mine');
    } catch (error) {
      toast({
        title: "오류",
        description: "그룹 탈퇴 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'leader':
        return <Badge className="bg-[#c2d595] text-[#2d3d0f]"><Crown className="w-3 h-3 mr-1" />리더</Badge>;
      case 'sub_leader':
        return <Badge variant="secondary"><Shield className="w-3 h-3 mr-1" />부리더</Badge>;
      default:
        return <Badge variant="outline">멤버</Badge>;
    }
  };

  const canManageGroup = team?.userRole === 'leader' || team?.userRole === 'sub_leader';

  if (loading) {
    return (
        <div className="min-h-screen bg-background">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="mb-6">
              <Skeleton className="h-10 w-32 mb-4" />
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <div className="flex gap-4 mb-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
            <Skeleton className="h-10 w-full mb-6" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
    );
  }

  if (!team) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">그룹을 찾을 수 없습니다</h2>
            <p className="text-muted-foreground mb-4">요청하신 그룹이 존재하지 않거나 접근 권한이 없습니다.</p>
            <Button onClick={() => navigate('/api/teams')}>그룹 목록으로 돌아가기</Button>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* 상단 네비게이션 */}
          <div className="flex items-center gap-4 mb-6">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/api/teams?tab=mine')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              목록으로 돌아가기
            </Button>
          </div>

          {/* 그룹 헤더 */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold">{team.name}</h1>
                    {getRoleBadge(currentUserRole)}
                  </div>
                  <p className="text-muted-foreground mb-4">{team.description}</p>

                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{team.currentMembers}/{team.maxMembers}명</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Crown className="h-4 w-4" />
                      <span>리더: {team.leader}</span>
                    </div>
                    {team.subLeader && (
                        <div className="flex items-center gap-1">
                          <Shield className="h-4 w-4" />
                          <span>부리더: {team.subLeader}</span>
                        </div>
                    )}
                  </div>
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      설정
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64" align="end">
                    <div className="space-y-3">
                      <div className="pb-2 border-b">
                        <p className="text-sm font-medium">권한: {getRoleBadge(currentUserRole)}</p>
                      </div>

                      {/* 일반 멤버: 그룹 나가기만 표시 */}
                      {currentUserRole === 'member' && (
                          <div className="space-y-2">
                            <Button
                                variant="destructive"
                                className="w-full justify-start text-sm"
                                onClick={handleLeaveGroup}
                            >
                              그룹 나가기
                            </Button>
                          </div>
                      )}

                      {/* Leader/SubLeader: 모든 관리 기능 표시 */}
                      {(currentUserRole === 'leader' || currentUserRole === 'sub_leader') && (
                          <div className="space-y-2">
                            <div className="pb-2">
                              <p className="text-xs text-muted-foreground mb-2">관리자 기능</p>
                              <div className="space-y-1">
                                <Button variant="outline" className="w-full justify-start text-sm h-8" disabled>
                                  <Edit className="h-3 w-3 mr-2" />
                                  그룹 정보 변경
                                </Button>
                                <Button variant="outline" className="w-full justify-start text-sm h-8" disabled>
                                  <FileText className="h-3 w-3 mr-2" />
                                  그룹 공지 작성/수정/삭제
                                </Button>
                                <Button variant="outline" className="w-full justify-start text-sm h-8" disabled>
                                  <UserPlus className="h-3 w-3 mr-2" />
                                  가입 요청자 관리
                                </Button>
                                <Button variant="outline" className="w-full justify-start text-sm h-8" disabled>
                                  <UserMinus className="h-3 w-3 mr-2" />
                                  멤버 강퇴
                                </Button>
                                {currentUserRole === 'leader' && (
                                    <>
                                      <Button variant="outline" className="w-full justify-start text-sm h-8" disabled>
                                        <Crown className="h-3 w-3 mr-2" />
                                        방장 위임
                                      </Button>
                                      <Button variant="outline" className="w-full justify-start text-sm h-8" disabled>
                                        <Shield className="h-3 w-3 mr-2" />
                                        부방장 권한 부여
                                      </Button>
                                      <Button variant="destructive" className="w-full justify-start text-sm h-8" disabled>
                                        <Trash2 className="h-3 w-3 mr-2" />
                                        그룹 삭제
                                      </Button>
                                    </>
                                )}
                              </div>
                            </div>

                            <div className="pt-2 border-t">
                              <Button
                                  variant="destructive"
                                  className="w-full justify-start text-sm"
                                  onClick={handleLeaveGroup}
                              >
                                그룹 나가기
                              </Button>
                            </div>
                          </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </CardHeader>
          </Card>

          {/* 탭 컨텐츠 */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="notices">공지사항</TabsTrigger>
              <TabsTrigger value="feed">실시간 피드</TabsTrigger>
              <TabsTrigger value="chat">채팅</TabsTrigger>
              <TabsTrigger value="ranking">그룹 내부 랭킹</TabsTrigger>
            </TabsList>

            <TabsContent value="notices">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      공지사항
                    </CardTitle>
                    {canManageGroup && (
                        <Button size="sm" disabled>
                          {notice ? '공지 수정' : '공지 작성'}
                        </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {notice ? (
                      <div className="space-y-4">
                        <div className="border rounded-lg p-4 bg-card">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{notice.title}</h3>
                              {notice.pinned && (
                                  <Badge variant="secondary" className="text-xs">고정</Badge>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">
                          {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                          </div>
                          <p className="text-sm leading-relaxed mb-3 whitespace-pre-wrap">{notice.content}</p>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-muted-foreground">작성자: {notice.author}</div>
                            {canManageGroup && (
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" disabled>
                                    수정
                                  </Button>
                                  <Button size="sm" variant="destructive" disabled>
                                    삭제
                                  </Button>
                                </div>
                            )}
                          </div>
                        </div>
                      </div>
                  ) : (
                      <div className="text-center py-8">
                        <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">등록된 공지사항이 없습니다</p>
                        {canManageGroup && (
                            <p className="text-sm text-muted-foreground mt-1">공지사항을 작성해보세요</p>
                        )}
                      </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="feed">
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    실시간 피드
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto">
                  <div className="space-y-4 pb-4">
                    {mockFeedData.map((feedItem) => {
                      const isMyFeed = feedItem.memberId === currentUserId;
                      const feedTime = new Date(feedItem.feedCreatedDate);
                      const timeStr = feedTime.toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      });

                      const getActivityIcon = (type: string) => {
                        switch (type) {
                          case 'WATER': return <Droplets className="w-4 h-4" />;
                          case 'MEAL': return <Utensils className="w-4 h-4" />;
                          case 'WEIGHT': return <Weight className="w-4 h-4" />;
                          case 'CHALLENGE': return <Target className="w-4 h-4" />;
                          default: return <Bell className="w-4 h-4" />;
                        }
                      };

                      return (
                          <div
                              key={feedItem.feedId}
                              className={`flex w-full ${isMyFeed ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`flex max-w-[80%] ${isMyFeed ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
                              {/* 프로필 이미지 (내 피드가 아닐 때만 표시) */}
                              {!isMyFeed && (
                                  <Avatar className="w-8 h-8 mt-1">
                                    <AvatarImage src={feedItem.profileImageUrl} alt={feedItem.nickname} />
                                    <AvatarFallback className="text-xs bg-muted">
                                      {feedItem.nickname.slice(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                              )}

                              {/* 메시지 영역 */}
                              <div className={`flex flex-col ${isMyFeed ? 'items-end' : 'items-start'}`}>
                                {/* 닉네임 (내 피드가 아닐 때만 표시) */}
                                {!isMyFeed && (
                                    <div className="text-xs text-muted-foreground mb-1 px-1">
                                      {feedItem.nickname}
                                    </div>
                                )}

                                {/* 말풍선 */}
                                <div
                                    className={`relative px-3 py-2 rounded-2xl shadow-sm ${
                                        isMyFeed
                                            ? 'bg-[#c2d595] text-[#2d3d0f] rounded-br-md'
                                            : 'bg-[#ffffe1] text-foreground rounded-bl-md border border-border/50'
                                    }`}
                                >
                                  <div className="flex items-start gap-2">
                                    <div className="flex-shrink-0 mt-0.5">
                                      {getActivityIcon(feedItem.activityType)}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm leading-relaxed break-words">
                                        {feedItem.activityMessage}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* 시간 */}
                                <div className={`text-xs text-muted-foreground mt-1 px-1 ${isMyFeed ? 'text-right' : 'text-left'}`}>
                                  {timeStr}
                                </div>
                              </div>
                            </div>
                          </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chat">
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    그룹 채팅
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0">
                  <ChatContainer
                      teamId={teamId || '1'}
                      currentUserId={currentUserId}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ranking">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    그룹 내부 랭킹
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Trophy className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">그룹 내부 랭킹 기능은 준비 중입니다</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </div>
      </div>
  );
};

export default TeamDetailPage;