import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Crown, Shield, Calendar, Clock, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

interface MyGroup {
  id: string;
  name: string;
  description: string;
  image?: string;
  currentMembers: number;
  maxMembers: number;
  leader: string;
  role: 'MEMBER' | 'SUB_LEADER' | 'LEADER';
  joinedAt: string;
}

interface AppliedGroup {
  id: string;
  name: string;
  description: string;
  image?: string;
  currentMembers: number;
  maxMembers: number;
  leader: string;
  status: 'PENDING' | 'REJECTED';
  appliedAt: string;
}

type ActiveTab = 'joined' | 'applied';

const MyGroupsTab = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [myGroups, setMyGroups] = useState<MyGroup[]>([]);
  const [appliedGroups, setAppliedGroups] = useState<AppliedGroup[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('joined');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyTeamData = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/teams/me/my-list');
        const allGroups = response.data;

        const approved: MyGroup[] = allGroups
          .filter((item: any) => item.status === 'APPROVED')
          .map((item: any) => ({
            id: item.teamId,
            name: item.teamTitle,
            description: item.teamDescription,
            image: item.teamImage, // New mapping
            currentMembers: item.currentMemberCount,
            maxMembers: item.maxMembers, // Assuming this is correct
            leader: item.leaderNickname,
            role: item.teamRole,
            joinedAt: item.createdDate,
          }));

        const applied: AppliedGroup[] = allGroups
          .filter((item: any) => item.status === 'PENDING' || item.status === 'REJECTED')
          .map((item: any) => ({
            id: item.teamId,
            name: item.teamTitle,
            description: item.teamDescription,
            image: item.teamImage, // New mapping
            currentMembers: item.currentMemberCount,
            maxMembers: item.maxMembers, // Assuming this is correct
            leader: item.leaderNickname,
            status: item.status,
            appliedAt: item.createdDate,
          }));

        setMyGroups(approved);
        setAppliedGroups(applied);

      } catch (error) {
        console.error("Failed to fetch user's groups:", error);
        toast({
          title: "오류",
          description: "내 그룹 정보를 불러오는 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMyTeamData();
  }, []);

  const getRoleBadge = (role: MyGroup['role']) => {
    switch (role) {
      case 'LEADER':
        return <Badge className="bg-[#c2d595] text-[#2d3d0f] hover:bg-[#a8c373]"><Crown className="w-3 h-3 mr-1" />리더</Badge>;
      case 'SUB_LEADER':
        return <Badge variant="secondary"><Shield className="w-3 h-3 mr-1" />부리더</Badge>;
      case 'MEMBER':
        return <Badge variant="outline">멤버</Badge>;
    }
  };

  const getStatusBadge = (status: AppliedGroup['status']) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />대기 중</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />거절됨</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleGroupClick = (groupId: string) => {
    navigate(`/teams/${groupId}`);
  };

  const renderMyGroups = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {myGroups.map((group) => (
        <Card
            key={group.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleGroupClick(group.id)}
        >
          <CardHeader>
            {group.image ? (
                <div className="aspect-video w-full mb-3 rounded-lg overflow-hidden">
                  <img src={group.image} alt={`${group.name} 그룹 이미지`} className="w-full h-full object-cover" />
                </div>
            ) : (
                <div className="aspect-video w-full mb-3 rounded-lg bg-muted flex items-center justify-center">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
            )}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{group.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 truncate">{group.description}</p>
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
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>참가일: {formatDate(group.joinedAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderAppliedGroups = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {appliedGroups.map((group) => (
        <Card
            key={group.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleGroupClick(group.id)}
        >
          <CardHeader>
            {group.image ? (
                <div className="aspect-video w-full mb-3 rounded-lg overflow-hidden">
                  <img src={group.image} alt={`${group.name} 그룹 이미지`} className="w-full h-full object-cover" />
                </div>
            ) : (
                <div className="aspect-video w-full mb-3 rounded-lg bg-muted flex items-center justify-center">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
            )}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{group.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 truncate">{group.description}</p>
              </div>
              {getStatusBadge(group.status)}
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
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>신청일: {formatDate(group.appliedAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-lg font-medium text-muted-foreground">
        {activeTab === 'joined' ? '참가 중인 그룹이 없습니다' : '신청한 그룹이 없습니다'}
      </p>
      <p className="text-sm text-muted-foreground mt-1">그룹찾기에서 관심있는 그룹에 참가해보세요</p>
    </div>
  );

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

  return (
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ActiveTab)} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="joined">가입된 그룹</TabsTrigger>
          <TabsTrigger value="applied">신청한 그룹</TabsTrigger>
        </TabsList>

        <TabsContent value="joined" className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">가입된 그룹</h2>
              <p className="text-sm text-muted-foreground">총 {myGroups.length}개 그룹에 참가 중</p>
            </div>
          </div>
          {myGroups.length > 0 ? renderMyGroups() : renderEmptyState()}
        </TabsContent>

        <TabsContent value="applied" className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">신청한 그룹</h2>
              <p className="text-sm text-muted-foreground">총 {appliedGroups.length}개 그룹에 신청</p>
            </div>
          </div>
          {appliedGroups.length > 0 ? renderAppliedGroups() : renderEmptyState()}
        </TabsContent>
      </Tabs>
  );
};

export default MyGroupsTab;