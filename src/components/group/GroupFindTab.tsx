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

const mockGroups: Group[] = [
  {
    id: '1',
    name: '매일 운동하기',
    description: '매일 30분 이상 운동하는 것이 목표인 그룹입니다. 함께 꾸준히 운동해요!',
    shortDescription: '매일 30분 운동 챌린지',
    currentMembers: 12,
    maxMembers: 20,
    leader: '김운동',
    subLeader: '박헬스',
    status: 'available'
  },
  {
    id: '2',
    name: '다이어트 성공기',
    description: '건강한 다이어트를 통해 목표 체중을 달성하는 그룹입니다.',
    shortDescription: '건강한 다이어트 함께해요',
    currentMembers: 18,
    maxMembers: 20,
    leader: '이다이어트',
    status: 'available'
  },
  {
    id: '3',
    name: '아침 조깅 클럽',
    description: '매일 아침 6시에 조깅하는 클럽입니다. 상쾌한 아침을 함께 시작해요!',
    shortDescription: '아침 6시 조깅',
    currentMembers: 20,
    maxMembers: 20,
    leader: '최조깅',
    status: 'full'
  }
];

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

  useEffect(() => {
    // 목업 데이터 로딩 시뮬레이션
    setTimeout(() => {
      setGroups(mockGroups);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAvailable = showAvailableOnly ? group.status === 'available' : true;
    return matchesSearch && matchesAvailable;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 실제 구현에서는 API 호출
    console.log('Searching for:', searchQuery);
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      // 실제 구현에서는 API 호출
      console.log('Joining group:', groupId);
      
      // 상태 업데이트
      setGroups(prev => prev.map(group => 
        group.id === groupId 
          ? { ...group, status: 'pending' as const }
          : group
      ));
      
      toast({
        title: "참가 신청 완료",
        description: "참가 신청이 접수되었습니다."
      });
      
      setDetailModalOpen(false);
    } catch (error) {
      toast({
        title: "오류",
        description: "참가 신청 중 오류가 발생했습니다.",
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
        return '신청 중';
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
          <form onSubmit={handleSearch} className="space-y-2">
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
          onClick={() => navigate('/api/teams/create')}
          className="bg-[#c2d595] hover:bg-[#a8c373] text-[#2d3d0f] border-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          내 그룹 만들기
        </Button>
      </div>

      {/* 그룹 카드 리스트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <Card 
            key={group.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => {
              setSelectedGroup(group);
              setDetailModalOpen(true);
            }}
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
                  <p className="text-sm text-muted-foreground mt-1">{group.shortDescription}</p>
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
                disabled={group.status === 'pending' || group.status === 'joined' || group.status === 'full'}
                variant={group.status === 'available' ? 'default' : 'secondary'}
                onClick={(e) => {
                  e.stopPropagation();
                  if (group.status === 'available') {
                    handleJoinGroup(group.id);
                  }
                }}
              >
                {getJoinButtonText(group.status)}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredGroups.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">검색 결과가 없습니다</p>
          <p className="text-sm text-muted-foreground mt-1">다른 검색어를 시도해보세요</p>
        </div>
      )}

      {/* 그룹 상세 모달 */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          {selectedGroup && (
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
                    <p className="text-sm text-muted-foreground">{selectedGroup.rules}</p>
                  </div>
                )}
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    className="flex-1"
                    disabled={selectedGroup.status === 'pending' || selectedGroup.status === 'joined' || selectedGroup.status === 'full'}
                    onClick={() => handleJoinGroup(selectedGroup.id)}
                  >
                    {getJoinButtonText(selectedGroup.status)}
                  </Button>
                  <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
                    닫기
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