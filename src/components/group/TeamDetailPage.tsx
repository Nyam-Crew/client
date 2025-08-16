import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Settings, Users, Crown, Shield, Bell, MessageSquare, Trophy, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

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

const mockNotices: Notice[] = [
  {
    id: '1',
    title: '그룹 운영 방침 안내',
    content: '안녕하세요! 매일 운동하기 그룹의 운영 방침을 안내드립니다...',
    author: '김운동',
    createdAt: '2024-01-20',
    pinned: true
  },
  {
    id: '2',
    title: '이번 주 목표 달성 현황',
    content: '이번 주 목표 달성률이 80%를 넘었습니다! 모두 수고하셨어요.',
    author: '박헬스',
    createdAt: '2024-01-19',
    pinned: false
  }
];

const TeamDetailPage = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notices');
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    // 목업 데이터 로딩 시뮬레이션
    setTimeout(() => {
      setTeam(mockTeam);
      setNotices(mockNotices);
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
            내 그룹으로 돌아가기
          </Button>
        </div>

        {/* 그룹 헤더 */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">{team.name}</h1>
                  {getRoleBadge(team.userRole)}
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
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                설정
              </Button>
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
                      공지 작성
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notices.map((notice) => (
                    <div key={notice.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{notice.title}</h3>
                          {notice.pinned && (
                            <Badge variant="secondary" className="text-xs">고정</Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{notice.content}</p>
                      <div className="text-xs text-muted-foreground">작성자: {notice.author}</div>
                    </div>
                  ))}
                  
                  {notices.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">등록된 공지사항이 없습니다</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feed">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  실시간 피드
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Bell className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">실시간 피드 기능은 준비 중입니다</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  그룹 채팅
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">채팅 기능은 준비 중입니다</p>
                </div>
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

        {/* 설정 모달 */}
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>그룹 설정</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">일반 기능</h4>
                <Button 
                  variant="destructive" 
                  className="w-full justify-start"
                  onClick={handleLeaveGroup}
                >
                  그룹 나가기
                </Button>
              </div>
              
              {canManageGroup && (
                <div className="space-y-2">
                  <h4 className="font-medium">관리자 기능</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" disabled>
                      그룹 정보 변경
                    </Button>
                    <Button variant="outline" className="w-full justify-start" disabled>
                      가입 요청자 관리
                    </Button>
                    <Button variant="outline" className="w-full justify-start" disabled>
                      멤버 관리
                    </Button>
                    {team.userRole === 'leader' && (
                      <>
                        <Button variant="outline" className="w-full justify-start" disabled>
                          방장 위임
                        </Button>
                        <Button variant="outline" className="w-full justify-start" disabled>
                          부방장 권한 부여
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TeamDetailPage;