import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Crown, Shield, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

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

const MyGroupsTab = () => {
  const navigate = useNavigate();
  const [myGroups, setMyGroups] = useState<MyGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 목업 데이터 로딩 시뮬레이션
    setTimeout(() => {
      setMyGroups(mockMyGroups);
      setLoading(false);
    }, 800);
  }, []);

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

  if (myGroups.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium text-muted-foreground">참가 중인 그룹이 없습니다</p>
        <p className="text-sm text-muted-foreground mt-1">그룹찾기에서 관심있는 그룹에 참가해보세요</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">내 그룹</h2>
          <p className="text-sm text-muted-foreground">총 {myGroups.length}개 그룹에 참가 중</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {myGroups.map((group) => (
          <Card 
            key={group.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleGroupClick(group.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{group.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                </div>
                {getRoleBadge(group.role)}
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
                    <span>참가일: {formatDate(group.joinedAt)}</span>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  마지막 활동: {formatDate(group.lastActivity)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyGroupsTab;