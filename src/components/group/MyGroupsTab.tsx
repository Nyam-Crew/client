import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Crown, Shield, Calendar, Clock, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MyGroup {
  id: string;
  name: string;
  description: string;
  image?: string;
  currentMembers: number;
  maxMembers: number;
  leader: string;
  subLeader?: string;
  role: 'member' | 'sub_leader' | 'leader';
  joinedAt: string;
  lastActivity: string;
}

interface AppliedGroup {
  id: string;
  name: string;
  description: string;
  image?: string;
  currentMembers: number;
  maxMembers: number;
  leader: string;
  status: 'pending' | 'rejected';
  appliedAt: string;
}

// Unified type for both joined and applied groups
type GroupItem = (MyGroup & { type: 'joined' }) | (AppliedGroup & { type: 'applied' });

type ActiveTab = 'joined' | 'applied';

const mockMyGroups: MyGroup[] = [
  {
    id: '1',
    name: '매일 운동하기',
    description: '매일 30분 이상 운동하는 것이 목표인 그룹입니다.',
    currentMembers: 12,
    maxMembers: 20,
    leader: '김운동',
    subLeader: '박헬스',
    role: 'member',
    joinedAt: '2024-01-15',
    lastActivity: '2024-01-20'
  },
  {
    id: '2',
    name: '아침 조깅 클럽',
    description: '매일 아침 6시에 조깅하는 클럽입니다.',
    currentMembers: 20,
    maxMembers: 20,
    leader: '최조깅',
    role: 'leader',
    joinedAt: '2023-12-01',
    lastActivity: '2024-01-20'
  }
];

const mockAppliedGroups: AppliedGroup[] = [
  {
    id: '3',
    name: '수영 동호회',
    description: '주 3회 수영 모임입니다.',
    currentMembers: 8,
    maxMembers: 15,
    leader: '김수영',
    status: 'pending',
    appliedAt: '2024-01-18'
  },
  {
    id: '4',
    name: '등산 클럽',
    description: '주말 등산 모임',
    currentMembers: 12,
    maxMembers: 12,
    leader: '박등산',
    status: 'rejected',
    appliedAt: '2024-01-10'
  }
];

const MyGroupsTab = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('joined');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 목업 데이터 로딩 시뮬레이션 - activeTab에 따라 다른 API 호출
    setLoading(true);
    
    setTimeout(() => {
      if (activeTab === 'joined') {
        // API call: GET /api/teams/my/joined
        const joinedGroups: GroupItem[] = mockMyGroups.map(group => ({ ...group, type: 'joined' as const }));
        setGroups(joinedGroups);
      } else if (activeTab === 'applied') {
        // API call: GET /api/teams/my/applied
        const appliedGroups: GroupItem[] = mockAppliedGroups.map(group => ({ ...group, type: 'applied' as const }));
        setGroups(appliedGroups);
      }
      setLoading(false);
    }, 800);
  }, [activeTab]);

  const getBadge = (group: GroupItem) => {
    if (group.type === 'joined') {
      return getRoleBadge((group as MyGroup).role);
    } else {
      return getStatusBadge((group as AppliedGroup).status);
    }
  };

  const getDateInfo = (group: GroupItem) => {
    if (group.type === 'joined') {
      const joinedGroup = group as MyGroup;
      return {
        label: '참가일',
        date: joinedGroup.joinedAt,
        lastActivity: joinedGroup.lastActivity
      };
    } else {
      const appliedGroup = group as AppliedGroup;
      return {
        label: '신청일',
        date: appliedGroup.appliedAt
      };
    }
  };

  const getRoleBadge = (role: MyGroup['role']) => {
    switch (role) {
      case 'leader':
        return <Badge className="bg-[#c2d595] text-[#2d3d0f] hover:bg-[#a8c373]"><Crown className="w-3 h-3 mr-1" />리더</Badge>;
      case 'sub_leader':
        return <Badge variant="secondary"><Shield className="w-3 h-3 mr-1" />부리더</Badge>;
      case 'member':
        return <Badge variant="outline">멤버</Badge>;
    }
  };

  const getStatusBadge = (status: AppliedGroup['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />대기 중</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />거절됨</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleGroupClick = (groupId: string) => {
    navigate(`/api/teams/${groupId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (groups.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium text-muted-foreground">
          {activeTab === 'joined' ? '참가 중인 그룹이 없습니다' : '신청한 그룹이 없습니다'}
        </p>
        <p className="text-sm text-muted-foreground mt-1">그룹찾기에서 관심있는 그룹에 참가해보세요</p>
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ActiveTab)} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="joined">가입된 그룹</TabsTrigger>
        <TabsTrigger value="applied">신청한 그룹</TabsTrigger>
      </TabsList>
      
      <TabsContent value="joined" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">가입된 그룹</h2>
            <p className="text-sm text-muted-foreground">총 {groups.length}개 그룹에 참가 중</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.map((group) => {
            const dateInfo = getDateInfo(group);
            return (
              <Card 
                key={group.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleGroupClick(group.id)}
              >
                <CardHeader>
                  {group.image ? (
                    <div className="aspect-video w-full mb-3 rounded-lg overflow-hidden">
                      <img 
                        src={group.image} 
                        alt={`${group.name} 그룹 이미지`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full mb-3 rounded-lg bg-muted flex items-center justify-center">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{group.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                    </div>
                    {getBadge(group)}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{group.currentMembers}/{group.maxMembers}명</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Crown className="h-4 w-4" />
                        <span>{group.leader}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{dateInfo.label}: {formatDate(dateInfo.date)}</span>
                      </div>
                    </div>
                    
                    {dateInfo.lastActivity && (
                      <div className="text-xs text-muted-foreground">
                        마지막 활동: {formatDate(dateInfo.lastActivity)}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </TabsContent>

      <TabsContent value="applied" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">신청한 그룹</h2>
            <p className="text-sm text-muted-foreground">총 {groups.length}개 그룹에 신청</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.map((group) => {
            const dateInfo = getDateInfo(group);
            return (
              <Card 
                key={group.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleGroupClick(group.id)}
              >
                <CardHeader>
                  {group.image ? (
                    <div className="aspect-video w-full mb-3 rounded-lg overflow-hidden">
                      <img 
                        src={group.image} 
                        alt={`${group.name} 그룹 이미지`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full mb-3 rounded-lg bg-muted flex items-center justify-center">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{group.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                    </div>
                    {getBadge(group)}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{group.currentMembers}/{group.maxMembers}명</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Crown className="h-4 w-4" />
                        <span>{group.leader}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{dateInfo.label}: {formatDate(dateInfo.date)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default MyGroupsTab;