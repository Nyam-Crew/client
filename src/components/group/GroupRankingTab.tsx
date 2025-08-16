import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface GroupRanking {
  rank: number;
  teamId: string;
  name: string;
  weeklyPoints: number;
  memberCount: number;
  previousRank?: number;
  change: 'up' | 'down' | 'same';
  changeValue: number;
}

const mockRankings: GroupRanking[] = [
  {
    rank: 1,
    teamId: '1',
    name: '매일 운동하기',
    weeklyPoints: 2450,
    memberCount: 12,
    previousRank: 3,
    change: 'up',
    changeValue: 2
  },
  {
    rank: 2,
    teamId: '2',
    name: '아침 조깅 클럽',
    weeklyPoints: 2380,
    memberCount: 20,
    previousRank: 1,
    change: 'down',
    changeValue: 1
  },
  {
    rank: 3,
    teamId: '3',
    name: '다이어트 성공기',
    weeklyPoints: 2200,
    memberCount: 18,
    previousRank: 2,
    change: 'down',
    changeValue: 1
  },
  {
    rank: 4,
    teamId: '4',
    name: '헬스장 러버들',
    weeklyPoints: 1980,
    memberCount: 15,
    previousRank: 4,
    change: 'same',
    changeValue: 0
  },
  {
    rank: 5,
    teamId: '5',
    name: '홈트레이닝',
    weeklyPoints: 1850,
    memberCount: 22,
    previousRank: 6,
    change: 'up',
    changeValue: 1
  }
];

const GroupRankingTab = () => {
  const navigate = useNavigate();
  const [rankings, setRankings] = useState<GroupRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 목업 데이터 로딩 시뮬레이션
    setTimeout(() => {
      setRankings(mockRankings);
      setLoading(false);
    }, 800);
  }, []);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Badge className="bg-[#ffd700] text-[#8b6914] hover:bg-[#ffd700]/80">🥇 1위</Badge>;
      case 2:
        return <Badge className="bg-[#c0c0c0] text-[#4a4a4a] hover:bg-[#c0c0c0]/80">🥈 2위</Badge>;
      case 3:
        return <Badge className="bg-[#cd7f32] text-white hover:bg-[#cd7f32]/80">🥉 3위</Badge>;
      default:
        return <Badge variant="outline">{rank}위</Badge>;
    }
  };

  const getChangeIcon = (change: GroupRanking['change'], changeValue: number) => {
    if (change === 'up') {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (change === 'down') {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    } else {
      return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getChangeText = (change: GroupRanking['change'], changeValue: number) => {
    if (change === 'up') {
      return `▲${changeValue}`;
    } else if (change === 'down') {
      return `▼${changeValue}`;
    } else {
      return '-';
    }
  };

  const handleGroupClick = (teamId: string) => {
    navigate(`/api/teams/${teamId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-8 w-12" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[#c2d595]" />
            주간 그룹 랭킹
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            이번 주 포인트 기준 그룹 순위입니다
          </p>
        </CardHeader>
        <CardContent>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">순위</TableHead>
                  <TableHead>그룹명</TableHead>
                  <TableHead className="text-right">주간 포인트</TableHead>
                  <TableHead className="text-right">멤버 수</TableHead>
                  <TableHead className="text-right">변동</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankings.map((group) => (
                  <TableRow 
                    key={group.teamId}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleGroupClick(group.teamId)}
                  >
                    <TableCell>
                      {getRankBadge(group.rank)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {group.name}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {group.weeklyPoints.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Users className="h-4 w-4" />
                        {group.memberCount}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {getChangeIcon(group.change, group.changeValue)}
                        <span className={`text-sm ${
                          group.change === 'up' ? 'text-green-600' : 
                          group.change === 'down' ? 'text-red-600' : 'text-gray-400'
                        }`}>
                          {getChangeText(group.change, group.changeValue)}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* 모바일 카드 레이아웃 */}
          <div className="md:hidden space-y-4">
            {rankings.map((group) => (
              <Card 
                key={group.teamId}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleGroupClick(group.teamId)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    {getRankBadge(group.rank)}
                    <div className="flex items-center gap-1">
                      {getChangeIcon(group.change, group.changeValue)}
                      <span className={`text-sm ${
                        group.change === 'up' ? 'text-green-600' : 
                        group.change === 'down' ? 'text-red-600' : 'text-gray-400'
                      }`}>
                        {getChangeText(group.change, group.changeValue)}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2">{group.name}</h3>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{group.memberCount}명</span>
                    </div>
                    <div className="font-mono font-medium">
                      {group.weeklyPoints.toLocaleString()}P
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {rankings.length === 0 && !loading && (
        <div className="text-center py-12">
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">랭킹 데이터가 없습니다</p>
          <p className="text-sm text-muted-foreground mt-1">아직 활동이 없는 것 같습니다</p>
        </div>
      )}
    </div>
  );
};

export default GroupRankingTab;