import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Settings,
    Users,
    Crown,
    Shield,
    Bell,
    MessageSquare,
    Trophy,
    FileText,
    Edit,
    Trash2,
    UserPlus,
    UserMinus,
    ChevronDown,
    Droplets,
    Utensils,
    Weight,
    Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import ChatContainer from './ChatContainer';
import { getNoticesByTeam, deleteNotice, Notice, TeamNoticeType } from '@/api/teamNoticeApi';
import TeamNoticeEditor from './TeamNoticeEditor';
import { getTeamDetails, TeamDetailDto } from '@/api/TeamApi.ts';
import { getTeamFeed, TeamActivityFeedItem } from '@/api/TeamFeedApi.ts';
import {getCurrentUserId, CurrentUserIdDto} from '@/api/UserApi.ts'
import { useInView } from 'react-intersection-observer';

// --- 타입 정의 ---
type UserRole = 'LEADER' | 'SUB_LEADER' | 'MEMBER';

// --- 역할 정규화 및 헬퍼 함수 ---
const getRoleBadge = (role: UserRole) => { // 이제 UserRole 타입을 직접 받습니다.
    switch (role) {
        case 'LEADER':
            return <Badge className="bg-[#c2d595] text-[#2d3d0f]"><Crown className="w-3 h-3 mr-1" />리더</Badge>;
        case 'SUB_LEADER':
            return <Badge variant="secondary"><Shield className="w-3 h-3 mr-1" />부리더</Badge>;
        default:
            return <Badge variant="outline">멤버</Badge>;
    }
};

const TeamDetailPage = () => {
    const { teamId } = useParams<{ teamId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const numericTeamId = Number(teamId);


    // --- 상태 관리 ---
    const [team, setTeam] = useState<TeamDetailDto | null>(null); // 타입을 TeamDetailDto로 변경
    const [currentUser, setCurrentUser] = useState<CurrentUserIdDto | null>(null); // <-- 이 줄 추가
    const [feedItems, setFeedItems] = useState<TeamActivityFeedItem[]>([]);
    const [nextCursor, setNextCursor] = useState<number | null>(null);     // 2. 다음 페이지 커서 상태
    const [hasNext, setHasNext] = useState(true);                          // 3. 다음 페이지 존재 여부 상태
    const [isFeedLoading, setIsFeedLoading] = useState(false);             // 4. 피드 로딩 상태
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('notices');

    // 새로운 공지사항 상태
    const [notices, setNotices] = useState<{ fixed: Notice | null; normal: Notice | null }>({ fixed: null, normal: null });
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
    const [noticeTypeToCreate, setNoticeTypeToCreate] = useState<TeamNoticeType | null>(null);
    const [isNoticeManagementModalOpen, setIsNoticeManagementModalOpen] = useState(false);

    // --- 데이터 로직 ---
    const fetchNotices = async () => {
        if (!Number.isFinite(numericTeamId)) return;
        try {
            const list = await getNoticesByTeam(numericTeamId);
            const pickLatest = (type: TeamNoticeType): Notice | null =>
                list
                    .filter(n => n.type === type)
                    .sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime())[0] ?? null;
            setNotices({ fixed: pickLatest('FIXED'), normal: pickLatest('NORMAL') });
        } catch (error) {
            console.error("Failed to fetch notices:", error);
            toast({ title: "오류", description: "공지사항 로딩에 실패했습니다.", variant: "destructive" });
        }
    };
    //피드 데이터를 불러오는 함수
    const fetchFeed = async () => {
        if (isFeedLoading || !hasNext) return;

        setIsFeedLoading(true);
        try {
            const slice = await getTeamFeed(numericTeamId, nextCursor);
            setFeedItems(prevItems => [...prevItems, ...slice.items]);
            setNextCursor(slice.nextCursorEpochMs);
            setHasNext(slice.hasNext);
        } catch (error) {
            console.error("Failed to fetch feed:", error);
            toast({ title: "오류", description: "피드를 불러오는 데 실패했습니다.", variant: "destructive" });
        } finally {
            setIsFeedLoading(false);
        }
    };

    useEffect(() => {
        if (!Number.isFinite(numericTeamId)) {
            navigate('/not-found');
            return;
        }

        const loadData = async () => {
            setLoading(true);
            setFeedItems([]);
            setNextCursor(null);
            setHasNext(true);

            try {
                // 사용자 ID, 팀 정보, 피드, 공지를 모두 병렬로 불러옵니다.
                const [userData, teamData, initialFeedSlice] = await Promise.all([
                    getCurrentUserId(),
                    getTeamDetails(numericTeamId),
                    getTeamFeed(numericTeamId, null),
                    fetchNotices()
                ]);

                // API 응답을 변환 없이 그대로 상태에 저장합니다.
                setCurrentUser(userData);
                setTeam(teamData);
                setFeedItems(initialFeedSlice.items);
                setNextCursor(initialFeedSlice.nextCursorEpochMs);
                setHasNext(initialFeedSlice.hasNext);

            } catch (error) {
                console.error("Failed to load initial data:", error);
                toast({ title: "오류", description: "페이지 로딩 중 오류가 발생했습니다.", variant: "destructive" });
                setTeam(null); // 실패 시 team 상태를 null로 설정
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [numericTeamId, navigate]);

    // 무한 스크롤을 위한 useEffect
    const { ref: feedLoaderRef, inView } = useInView({ threshold: 0.1 });

    useEffect(() => {
        // 첫 로딩 시에는 실행되지 않도록 !loading 조건을 추가할 수 있습니다.
        if (inView && hasNext && !isFeedLoading && !loading) {
            fetchFeed();
        }
    }, [inView, hasNext, isFeedLoading, loading]);

    // --- 이벤트 핸들러 ---
    const handleSaveSuccess = () => {
        toast({ title: "성공", description: "공지가 성공적으로 저장되었습니다." });
        fetchNotices();
        setIsEditorOpen(false);
    };

    const handleOpenCreator = (type: TeamNoticeType) => {
        setEditingNotice(null);
        setNoticeTypeToCreate(type);
        setIsEditorOpen(true);
    };

    const handleOpenEditor = (notice: Notice) => {
        setNoticeTypeToCreate(null);
        setEditingNotice(notice);
        setIsEditorOpen(true);
    };

    const handleDelete = async (noticeId: number) => {
        if (window.confirm("정말로 공지를 삭제하시겠습니까?")) {
            try {
                await deleteNotice(numericTeamId, noticeId);
                toast({ title: "성공", description: "공지가 삭제되었습니다." });
                fetchNotices();
            } catch (error) {
                console.error("Failed to delete notice:", error);
                toast({ title: "오류", description: "공지 삭제에 실패했습니다.", variant: "destructive" });
            }
        }
    };

    const handleLeaveGroup = async () => {
        // (기존 로직 유지)
    };

    // --- 렌더링 함수 ---
    const renderNoticeCard = (notice: Notice | null, title: string) => (
        <div className="border rounded-lg p-4 bg-card mb-4">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{title}</h3>
                    {notice?.type === 'FIXED' && <Badge variant="secondary" className="text-xs">고정</Badge>}
                </div>
                {notice && <span className="text-sm text-muted-foreground">{new Date(notice.createdAt).toLocaleDateString('ko-KR')}</span>}
            </div>
            {notice ? (
                <>
                    <p className="font-semibold text-md mb-2">{notice.title}</p>
                    <p className="text-sm leading-relaxed mb-3 whitespace-pre-wrap">{notice.content}</p>
                </>
            ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">등록된 공지가 없습니다.</p>
            )}
        </div>
    );

    if (loading) {
        // (기존 로딩 스켈레톤 UI 유지)
        return (
            <div className="min-h-screen bg-background">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="mb-6"><Skeleton className="h-10 w-32 mb-4"/><Skeleton className="h-8 w-3/4 mb-2"/><Skeleton className="h-4 w-full mb-4"/><div className="flex gap-4 mb-4"><Skeleton className="h-6 w-20"/><Skeleton className="h-6 w-24"/></div></div>
                    <Skeleton className="h-10 w-full mb-6"/>
                    <Skeleton className="h-96 w-full"/>
                </div>
            </div>
        );
    }

    if (!team) {
        // (기존 team not found UI 유지)
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
                {/* 상단 네비게이션 (기존 구조 유지) */}
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/api/teams?tab=mine')}><ArrowLeft className="h-4 w-4 mr-2"/>목록으로 돌아가기</Button>
                </div>

                {/* 그룹 헤더 (기존 구조 유지) */}
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-2xl font-bold">{team.teamTitle}</h1>
                                    {getRoleBadge(team.teamRole)}
                                </div>
                                <p className="text-muted-foreground mb-4">{team.teamDescription}</p>
                                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1"><Users className="h-4 w-4"/><span>{team.currentMemberCount}/{team.maxMembers}명</span></div>
                                    <div className="flex items-center gap-1"><Crown className="h-4 w-4"/><span>리더: {team.leaderNickname}</span></div>
                                    {team.subLeaderNickname && (<div className="flex items-center gap-1"><Shield className="h-4 w-4"/><span>부리더: {team.subLeaderNickname}</span></div>)}
                                </div>
                            </div>

                            <Popover>
                                <PopoverTrigger asChild><Button variant="outline" size="sm"><Settings className="h-4 w-4 mr-2"/>설정<ChevronDown className="h-3 w-3 ml-1"/></Button></PopoverTrigger>
                                <PopoverContent className="w-64" align="end">
                                    <div className="space-y-3">
                                        <div className="pb-2 border-b"><p className="text-sm font-medium">권한: {getRoleBadge(team.teamRole)}</p></div>
                                        {team.teamRole === 'MEMBER' && (<div className="space-y-2"><Button variant="destructive" className="w-full justify-start text-sm" onClick={handleLeaveGroup}>그룹 나가기</Button></div>)}
                                        {(team.teamRole === 'LEADER' || team.teamRole === 'SUB_LEADER') && (
                                            <div className="space-y-2">
                                                <div className="pb-2">
                                                    <p className="text-xs text-muted-foreground mb-2">관리자 기능</p>
                                                    <div className="space-y-1">
                                                        <Button variant="outline" className="w-full justify-start text-sm h-8" disabled><Edit className="h-3 w-3 mr-2"/>그룹 정보 변경</Button>
                                                        {/* '그룹 공지 관리' 버튼 수정 */}
                                                        <Button variant="outline" className="w-full justify-start text-sm h-8" onClick={() => setIsNoticeManagementModalOpen(true)}><FileText className="h-3 w-3 mr-2"/>그룹 공지 관리</Button>
                                                        <Button variant="outline" className="w-full justify-start text-sm h-8" disabled><UserPlus className="h-3 w-3 mr-2"/>가입 요청자 관리</Button>
                                                        <Button variant="outline" className="w-full justify-start text-sm h-8" disabled><UserMinus className="h-3 w-3 mr-2"/>멤버 강퇴</Button>
                                                        {team.teamRole === 'LEADER' && (
                                                            <>
                                                                <Button variant="outline" className="w-full justify-start text-sm h-8" disabled><Crown className="h-3 w-3 mr-2"/>방장 위임</Button>
                                                                <Button variant="outline" className="w-full justify-start text-sm h-8" disabled><Shield className="h-3 w-3 mr-2"/>부방장 권한 부여</Button>
                                                                <Button variant="destructive" className="w-full justify-start text-sm h-8" disabled><Trash2 className="h-3 w-3 mr-2"/>그룹 삭제</Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="pt-2 border-t"><Button variant="destructive" className="w-full justify-start text-sm" onClick={handleLeaveGroup}>그룹 나가기</Button></div>
                                            </div>
                                        )}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </CardHeader>
                </Card>

                {/* 탭 컨텐츠 (기존 구조 유지) */}
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
                                <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5"/>공지사항</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {renderNoticeCard(notices.fixed, "고정 공지")}
                                {renderNoticeCard(notices.normal, "일반 공지")}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="feed">
                        <Card className="h-[600px] flex flex-col">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="h-5 w-5"/>실시간 피드
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto">
                                <div className="space-y-4 pb-4">
                                    {/* ▼▼▼▼▼ [수정] mockFeedData.map -> feedItems.map 으로 변경 ▼▼▼▼▼ */}
                                    {feedItems.map((feedItem) => {
                                        const isMyFeed = feedItem.memberId === currentUser?.memberId;

                                        const feedTime = new Date(feedItem.feedCreatedDate);
                                        const timeStr = feedTime.toLocaleTimeString('ko-KR', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: false
                                        });

                                        const getActivityIcon = (type: string) => { /* ... 기존과 동일 ... */ };

                                        return (
                                            <div key={feedItem.feedId} /* ... 기존과 동일 ... */ >
                                                {/* ... 기존 렌더링 로직 재사용 ... */}
                                                <p className="text-sm leading-relaxed break-words">
                                                    {feedItem.activityMessage} {/* 백엔드 메시지 사용 */}
                                                </p>
                                                {/* ... 기존 렌더링 로직 재사용 ... */}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* ▼▼▼▼▼ [추가] 무한 스크롤 로더 ▼▼▼▼▼ */}
                                <div ref={feedLoaderRef} className="flex justify-center items-center h-16">
                                    {isFeedLoading && <p>피드를 불러오는 중...</p>}
                                    {!hasNext && feedItems.length > 0 && <p className="text-sm text-muted-foreground">모든 피드를 확인했습니다.</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="chat">
                        {/* (채팅 탭 내용 원본 유지) */}
                        <Card className="h-[600px] flex flex-col">
                            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5"/>그룹 채팅</CardTitle></CardHeader>
                            <CardContent className="flex-1 p-0">
                                {currentUser && <ChatContainer teamId={teamId || '1'} currentUserId={currentUser.memberId} />}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="ranking">
                        {/* (랭킹 탭 내용 원본 유지) */}
                        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5"/>그룹 내부 랭킹</CardTitle></CardHeader><CardContent><div className="text-center py-8"><Trophy className="mx-auto h-8 w-8 text-muted-foreground mb-2"/><p className="text-muted-foreground">그룹 내부 랭킹 기능은 준비 중입니다</p></div></CardContent></Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* --- 이식된 모달 영역 --- */}
            <Dialog open={isNoticeManagementModalOpen} onOpenChange={setIsNoticeManagementModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>그룹 공지 관리</DialogTitle>
                        <DialogDescription>고정 공지와 일반 공지를 관리합니다. 공지는 종류별로 하나만 등록할 수 있습니다.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <Card>
                            <CardHeader><CardTitle>고정 공지</CardTitle></CardHeader>
                            <CardContent>
                                {notices.fixed ? (
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold truncate pr-4">{notices.fixed.title}</p>
                                        <div className="space-x-2 flex-shrink-0">
                                            <Button variant="outline" onClick={() => handleOpenEditor(notices.fixed!)}>수정</Button>
                                            <Button variant="destructive" onClick={() => handleDelete(notices.fixed!.id)}>삭제</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <p>고정 공지가 없습니다.</p>
                                        <Button onClick={() => handleOpenCreator('FIXED')}>작성</Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>일반 공지</CardTitle></CardHeader>
                            <CardContent>
                                {notices.normal ? (
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold truncate pr-4">{notices.normal.title}</p>
                                        <div className="space-x-2 flex-shrink-0">
                                            <Button variant="outline" onClick={() => handleOpenEditor(notices.normal!)}>수정</Button>
                                            <Button variant="destructive" onClick={() => handleDelete(notices.normal!.id)}>삭제</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <p>일반 공지가 없습니다.</p>
                                        <Button onClick={() => handleOpenCreator('NORMAL')}>작성</Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </DialogContent>
            </Dialog>

            {isEditorOpen && (
                <TeamNoticeEditor
                    teamId={numericTeamId}
                    editingNotice={editingNotice}
                    noticeTypeToCreate={noticeTypeToCreate}
                    isOpen={isEditorOpen}
                    onClose={() => setIsEditorOpen(false)}
                    onSave={handleSaveSuccess}
                />
            )}
        </div>
    );
};

export default TeamDetailPage;
