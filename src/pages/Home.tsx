import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {PlusCircle, Target, TrendingUp, Trophy, Users} from 'lucide-react';
import {Link} from 'react-router-dom';
import {useEffect, useState} from 'react';
import {getTodayMissions, Mission} from '@/api/missions';
import {defaultFetch} from "@/api/defaultFetch.ts";
import {ChallengeResponse} from "@/pages/Challenge.tsx";

/** ---------------- 타입 ---------------- */
interface RankingInfo {
    memberId: number;
    nickname: string;
    totalScore: number;   // 백엔드 Double → number
    rank: number;
    rankDelta: number | null;
}

/** ---------------- 컴포넌트 ---------------- */
const Home = () => {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [challengeList, setChallengeList] = useState<ChallengeResponse[]>([]);
    const [rankerInfo, setRankerInfo] = useState<RankingInfo[]>([]);
    const [myRank, setMyRank] = useState<RankingInfo | null>(null);


    useEffect(() => {
        // 오늘의 일일 미션 가져오기
        const fetchMissions = async () => {
            try {
                const todayMissions = await getTodayMissions();
                setMissions(todayMissions);
            } catch {
                /* noop */
            }
        };

        // 현재 진행중인 챌린지 목록 가져오기
        const fetchProgressingChallenge = async () => {
            try {
                const res = await defaultFetch<ChallengeResponse[]>("/api/challenge/progressing");
                setChallengeList(res ?? []);
            } catch {
                setChallengeList([]);
            }
        };

        // 주간 랭킹 목록 가져오기
        const fetchRankings = async () => {
            // 이번 달 랭킹을 가져온다.
            const today = new Date()
            const year = today.getFullYear()
            const month = today.getMonth() + 1

            const res = await defaultFetch<RankingInfo[]>("/api/ranking/members?limit=5&year=" + year + "&month=" + month);

            setRankerInfo(res);
        };

        // 내 주간 랭킹
        const fetchMyWeeklyRank = async () => {
            // 이번 달 랭킹을 가져온다.
            const today = new Date()
            const year = today.getFullYear()
            const month = today.getMonth() + 1

            const res = await defaultFetch<RankingInfo>("/api/ranking/members/me?year=" + year + "&month=" + month);
            setMyRank(res);
        };

        fetchProgressingChallenge();
        fetchMissions();
        fetchRankings();
        fetchMyWeeklyRank();
    }, []);

    /** ---------------- 렌더 유틸 ---------------- */
    const renderRankBadge = (rank: number) => {
        if (rank === 1) return "👑";
        if (rank === 2) return "🥈";
        if (rank === 3) return "🥉";
        return rank;
    };

    const renderRankDelta = (delta: number | null | undefined) => {
        if (delta === null || delta === undefined) return null;
        if (delta > 0) return <span className="text-green-600 text-sm ml-2">▲ {delta}</span>;
        if (delta < 0) return <span className="text-red-600 text-sm ml-2">▼ {Math.abs(delta)}</span>;
        return <span className="text-gray-400 text-sm ml-2">-</span>;
    };

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
                        <div className="text-right"></div>
                    </div>

                    {/* 오늘의 미션 */}
                    <Card className="bg-white/50 backdrop-blur-sm border-white/20">
                        <CardContent className="p-4">
                            <h2 className="font-semibold mb-3 flex items-center gap-2">
                                <Target size={16}/>
                                오늘의 미션
                            </h2>
                            <div className="space-y-2">
                                {missions.length > 0 ? (
                                    missions.map((mission) => (
                                        <div key={mission.dailyMissionId} className="flex items-center gap-3">
                                            <div
                                                className={`w-2 h-2 ${mission.completed ? 'bg-success' : 'bg-warning'} rounded-full`}/>
                                            <span className="text-sm">{mission.title}</span>
                                            <Badge variant={mission.completed ? 'default' : 'secondary'}
                                                   className="ml-auto">
                                                {mission.completed ? '완료' : '미완료'}
                                            </Badge>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">오늘의 미션이 없습니다.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* 빠른 액션 버튼들 */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <Link to="/meal">
                        <Button
                            className="w-full h-20 flex-col gap-2 bg-brand-light hover:bg-brand-green text-foreground hover:text-white transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md">
                            <PlusCircle size={24}/>
                            <span>식단 기록</span>
                        </Button>
                    </Link>
                    <Link to="/challenge">
                        <Button
                            className="w-full h-20 flex-col gap-2 bg-brand-light hover:bg-brand-green text-foreground hover:text-white transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md">
                            <Trophy size={24}/>
                            <span>챌린지</span>
                        </Button>
                    </Link>
                    <Link to="/community">
                        <Button
                            className="w-full h-20 flex-col gap-2 bg-brand-light hover:bg-brand-green text-foreground hover:text-white transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md">
                            <Users size={24}/>
                            <span>커뮤니티</span>
                        </Button>
                    </Link>
                </div>

                {/* 진행중인 챌린지 */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Trophy className="text-warning" size={20}/>
                                진행중인 챌린지
                            </h2>
                            <Link to="/challenge">
                                <Button variant="ghost" size="sm">
                                    전체보기
                                </Button>
                            </Link>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {challengeList.length === 0 ? (
                                <div className="col-span-2 flex items-center justify-center">
                                    <p>현재 진행중인 챌린지가 없습니다.</p>
                                </div>
                            ) : (
                                challengeList.map((c, i) => {
                                    const pct = c.targetCount > 0
                                        ? Math.min(100, Math.round((c.progressCount / c.targetCount) * 100))
                                        : 0;

                                    return (
                                        <Card key={i} className="bg-gradient-to-r from-brand-light to-brand-cream">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="font-medium">{c.title}</h3>
                                                    <Badge variant={c.cleared ? "secondary" : "default"}>
                                                        {c.cleared ? "완료" : "진행중"}
                                                    </Badge>
                                                </div>

                                                <p className="text-sm text-muted-foreground mb-3">
                                                    {c.description}
                                                </p>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span>진행률</span>
                                                        <span>
                              {c.progressCount}/{c.targetCount}
                            </span>
                                                    </div>

                                                    <div className="w-full bg-muted rounded-full h-2">
                                                        <div
                                                            className="bg-primary h-2 rounded-full"
                                                            style={{width: `${pct}%`}}
                                                            aria-valuenow={pct}
                                                            aria-valuemin={0}
                                                            aria-valuemax={100}
                                                        />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 랭킹 목록 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp size={20}/>
                            이번 달 랭킹
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {rankerInfo.length === 0 ? (
                            <div className="text-sm text-muted-foreground">랭킹 정보가 없습니다.</div>
                        ) : (
                            <div className="space-y-3">
                                {rankerInfo.map((user) => (
                                    <div
                                        key={user.memberId}
                                        className="flex items-center justify-between p-3 bg-accent/30 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="flex items-center justify-center w-8 h-8 bg-primary rounded-full text-primary-foreground font-bold">
                                                {renderRankBadge(user.rank)}
                                            </div>
                                            <div>
                                                <p className="font-medium flex items-center gap-1">
                                                    {user.nickname}
                                                    {renderRankDelta(user.rankDelta)}
                                                </p>
                                                <p className="text-sm text-muted-foreground">{user.rank}위</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg">{Math.round(user.totalScore).toLocaleString()}</p>
                                            <p className="text-xs text-muted-foreground">포인트</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 이번 주 내 순위 */}
                <Card className="bg-gradient-to-r from-brand-light to-brand-cream">
                    <CardContent className="p-6">
                        <div className="text-center">
                            <Trophy className="mx-auto mb-4 text-warning" size={48}/>
                            <h3 className="text-xl font-bold mb-2">이번 주 내 순위</h3>

                            {/* 순위 + 변동치 */}
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <p className="text-3xl font-bold text-primary">
                                    {typeof myRank?.rank === 'number' ? `${myRank.rank}위` : '-'}
                                </p>
                                {renderRankDelta(myRank?.rankDelta)}
                            </div>

                            {/* 점수 */}
                            <p className="text-muted-foreground">
                                {typeof myRank?.totalScore === 'number'
                                    ? `${Math.round(myRank.totalScore).toLocaleString()}점`
                                    : '0점'}
                            </p>
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
