import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { defaultFetch } from '@/api/defaultFetch';

// API 응답 데이터 인터페이스
interface TeamRankingDto {
  teamId: number;
  teamName: string;
  averageScore: number;
  rank: number;
  rankDelta: number | null;
}

// 컴포넌트에서 사용할 데이터 인터페이스
interface GroupRanking {
  rank: number;
  teamId: string;
  name: string;
  weeklyPoints: number;
  change: 'up' | 'down' | 'same';
  changeValue: number;
}

const GroupRankingTab = () => {
  const navigate = useNavigate();
  const [rankings, setRankings] = useState<GroupRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true);
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const data: TeamRankingDto[] = await defaultFetch(`/api/ranking/teams/top?limit=5&year=${year}&month=${month}`);
        
        const transformedData = data.map((item): GroupRanking => {
          let change: 'up' | 'down' | 'same' = 'same';
          let changeValue = 0;

          if (item.rankDelta !== null && item.rankDelta !== 0) {
            if (item.rankDelta > 0) {
              change = 'up';
              changeValue = item.rankDelta;
            } else { // rankDelta < 0
              change = 'down';
              changeValue = Math.abs(item.rankDelta);
            }
          }

          return {
            rank: item.rank,
            teamId: item.teamId.toString(),
            name: item.teamName,
            weeklyPoints: item.averageScore,
            change,
            changeValue,
          };
        });

        setRankings(transformedData);
      } catch (error) {
        console.error("Failed to fetch team rankings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, []);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Badge className="bg-[#ffd700] text-[#8b6914] hover:bg-[#ffd700]/80">🥇1위</Badge>;
      case 2:
        return <Badge className="bg-[#c0c0c0] text-[#4a4a4a] hover:bg-[#c0c0c0]/80">🥈2위</Badge>;
      case 3:
        return <Badge className="bg-[#cd7f32] text-white hover:bg-[#cd7f32]/80">🥉3위</Badge>;
      default:
        return <Badge variant="outline">{rank}위</Badge>;
    }
  };

  const getChangeIcon = (change: GroupRanking['change']) => {
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
    navigate(`/teams/${teamId}`);
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
                <div key={i} className="flex items-center space-x-4 p-2">
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
                      {Math.round(group.weeklyPoints).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {getChangeIcon(group.change)}
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
                      {getChangeIcon(group.change)}
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
                    <div className="font-mono font-medium">
                      {Math.round(group.weeklyPoints).toLocaleString()}P
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