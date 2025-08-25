import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Users, Crown, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

import axios from 'axios';

interface Group {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  image?: string;
  currentMembers: number;
  maxMembers: number;
  leader: string;
  subLeader?: string;
  status: 'available' | 'pending' | 'joined' | 'full';
  rules?: string;
}

const GroupFindTab = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/teams', {
          params: {
            keyword: searchQuery,
            sortBy: sortBy,
            availableOnly: showAvailableOnly,
          },
        });
        const fetchedGroups = response.data.content.map((team: any) => {

          // status를 결정하는 헬퍼 로직
          const determineStatus = () => {
            // 1. 백엔드가 보내준 사용자의 참여 상태를 먼저 확인합니다.
            if (team.userParticipationStatus === 'APPROVED') {
              return 'joined';
            }
            if (team.userParticipationStatus === 'PENDING') {
              return 'pending';
            }
            // 2. 사용자가 특별한 상태가 아닐 경우, 그룹의 정원 상태를 확인합니다.
            if (team.teamCurrentMembers < team.teamMaxMembers) {
              return 'available';
            }
            // 3. 자리가 없으면 'full'입니다.
            return 'full';
          };

          return {
            id: team.teamId,
            name: team.teamTitle,
            description: team.teamDescription,
            currentMembers: team.teamCurrentMembers,
            maxMembers: team.teamMaxMembers,
            leader: team.ownerNickname,
            status: determineStatus(), // 헬퍼 로직을 통해 최종 status 결정
            image: team.teamImg,
            subLeader: undefined,
            rules: undefined,
          };
        });
        setGroups(fetchedGroups);
      } catch (error) {
        console.error("Failed to fetch groups:", error);
        toast({
          title: "오류",
          description: "그룹 목록을 불러오는 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [searchQuery, sortBy, showAvailableOnly]);

  const handleCardClick = async (groupId: string) => {
    setDetailModalOpen(true);
    setDetailLoading(true);
    setSelectedGroup(null);
    try {
      const response = await axios.get(`/api/teams/${groupId}`);
      const team = response.data;

      const determineStatus = () => {
        // 1. 먼저 team.status 값이 존재하는지 (null이 아닌지) 확인합니다.
        if (team.status) {
          const userParticipationStatus = team.status.toLowerCase();
          if (userParticipationStatus === 'approved') {
            return 'joined';
          }
          if (userParticipationStatus === 'pending') {
            return 'pending';
          }
        }

        // 2. team.status가 null이거나 위 경우에 해당하지 않을 때, 그룹의 정원 상태를 확인합니다.
        if (team.currentMemberCount < team.maxMembers) {
          return 'available';
        }

        // 3. 자리가 없으면 'full'입니다.
        return 'full';
      };

      const detailedGroup: Group = {
        id: team.teamId,
        name: team.teamTitle,
        description: team.teamDescription,
        shortDescription: team.teamDescription.substring(0, 30) + (team.teamDescription.length > 30 ? '...' : ''),
        currentMembers: team.currentMemberCount,
        maxMembers: team.maxMembers,
        leader: team.leaderNickname,
        subLeader: team.subLeaderNickname,
        status: determineStatus(),
        rules: team.rules,
        image: team.teamImg, // 이미지는 필요 시 추가
      };
      setSelectedGroup(detailedGroup);
    } catch (error) {
      console.error("Failed to fetch group details:", error);
      toast({
        title: "오류",
        description: "그룹 상세 정보를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      setDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      await axios.post(`/api/teams/${groupId}/join`);

      setGroups(prev => prev.map(group =>
        group.id === groupId
          ? { ...group, status: 'pending' as const }
          : group
      ));

      toast({
        title: "참가 신청 완료",
        description: "참가 신청이 정상적으로 접수되었습니다."
      });

      setDetailModalOpen(false);
    } catch (error) {
      console.error("Failed to join group:", error);
      toast({
        title: "오류",
        description: "참가 신청 중 오류가 발생했습니다. 그룹 상태를 확인해주세요.",
        variant: "destructive"
      });
    }
  };

  const handleCancelJoinRequest = async (groupId: string) => {
    try {
      // 1. 백엔드에 DELETE 요청을 보냅니다.
      await axios.delete(`/api/teams/${groupId}/join`);

      // 2. 요청 성공 시, 목록에 있는 그룹의 상태를 'pending' -> 'available'로 되돌립니다.
      setGroups(prev => prev.map(group =>
          group.id === groupId
              ? { ...group, status: 'available' as const }
              : group
      ));

      toast({
        title: "신청 취소 완료",
        description: "참가 신청이 정상적으로 취소되었습니다."
      });

      // 3. 모달을 닫습니다.
      setDetailModalOpen(false);
    } catch (error) {
      console.error("Failed to cancel join request:", error);
      toast({
        title: "오류",
        description: "신청 취소 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: Group['status']) => {
    switch (status) {
      case 'available':
        return <Badge variant="secondary" className="bg-[#c2d595]/20 text-[#6b7b3a] border-[#c2d595]">참가 가능</Badge>;
      case 'pending':
        return <Badge variant="outline">신청 중</Badge>;
      case 'joined':
        return <Badge variant="default">참가 중</Badge>;
      case 'full':
        return <Badge variant="destructive">정원 마감</Badge>;
    }
  };

  const getJoinButtonText = (status: Group['status']) => {
    switch (status) {
      case 'available':
        return '참가 신청';
      case 'pending':
        return '신청 취소'; // 상태에 따라 텍스트 변경 가능
      case 'joined':
        return '참가 중';
      case 'full':
        return '정원 마감';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-end justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full max-w-md" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 검색 및 액션 영역 */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-end justify-between">
        <div className="flex-1 max-w-md space-y-4">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
            <Label htmlFor="group-search">그룹 이름 검색</Label>
            <div className="flex gap-2">
              <Input
                id="group-search"
                type="text"
                placeholder="그룹 이름으로 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon" aria-label="검색">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="space-y-2">
              <Label htmlFor="sort-select">정렬</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort-select" className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">최신순</SelectItem>
                  <SelectItem value="members">인원순</SelectItem>
                  <SelectItem value="name">이름순</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-7">
              <Switch
                id="available-only"
                checked={showAvailableOnly}
                onCheckedChange={setShowAvailableOnly}
              />
              <Label htmlFor="available-only">참가 가능만 보기</Label>
            </div>
          </div>
        </div>

        <Button
          onClick={() => navigate('/teams/create')}
          className="bg-[#c2d595] hover:bg-[#a8c373] text-[#2d3d0f] border-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          내 그룹 만들기
        </Button>
      </div>

      {/* 그룹 카드 리스트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <Card
            key={group.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleCardClick(group.id)}
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
                </div>
                {getStatusBadge(group.status)}
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{group.currentMembers}/{group.maxMembers}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Crown className="h-4 w-4" />
                  <span>{group.leader}</span>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                variant={'outline'}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick(group.id);
                }}
              >
                상세 보기
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {groups.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">검색 결과가 없습니다</p>
          <p className="text-sm text-muted-foreground mt-1">다른 검색어를 시도해보세요</p>
        </div>
      )}

      {/* 그룹 상세 모달 */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          {detailLoading ? (
            <div className="space-y-4 p-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-4 pt-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-20" />
              </div>
            </div>
          ) : selectedGroup && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedGroup.name}</DialogTitle>
                <DialogDescription className="text-base">
                  {selectedGroup.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>현재 멤버: {selectedGroup.currentMembers}/{selectedGroup.maxMembers}명</span>
                  </div>
                  {getStatusBadge(selectedGroup.status)}
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    <span>리더: {selectedGroup.leader}</span>
                  </div>
                  {selectedGroup.subLeader && (
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>부리더: {selectedGroup.subLeader}</span>
                    </div>
                  )}
                </div>

                {selectedGroup.rules && (
                  <div>
                    <h4 className="font-medium mb-2">그룹 규칙</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedGroup.rules}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                      className="flex-1"
                      // 'pending' 상태일 때도 클릭이 가능해야 하므로 disabled 조건에서 제외합니다.
                      disabled={selectedGroup.status === 'joined' || selectedGroup.status === 'full'}
                      onClick={() => {
                        // 그룹 상태에 따라 다른 함수를 호출합니다.
                        if (selectedGroup.status === 'available') {
                          handleJoinGroup(selectedGroup.id);
                        } else if (selectedGroup.status === 'pending') {
                          handleCancelJoinRequest(selectedGroup.id);
                        }
                      }}
                  >
                    {getJoinButtonText(selectedGroup.status)}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroupFindTab;