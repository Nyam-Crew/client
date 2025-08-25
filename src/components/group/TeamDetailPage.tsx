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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ChatContainer from './ChatContainer';
import { getNoticesByTeam, deleteNotice, Notice, TeamNoticeType } from '@/api/teamNoticeApi';
import TeamNoticeEditor from './TeamNoticeEditor';
import { getTeamDetails, TeamDetailDto } from '@/api/teamApi';

// --- 타입 정의 ---
type UserRole = 'LEADER' | 'SUBLEADER' | 'MEMBER';

interface TeamDetail {
    id: string;
    name: string;
    description: string;
    image?: string;
    currentMembers: number;
    maxMembers: number;
    leader: string;
    subLeader?: string;
    userRole: UserRole; // 정규화된 타입 사용
    joinedAt: string;
}

interface TeamActivityFeedItem {
    feedId: string;
    memberId: number;
    nickname: string;
    profileImageUrl: string;
    activityType: 'WATER' | 'MEAL' | 'WEIGHT' | 'CHALLENGE';
    activityMessage: string;
    feedCreatedDate: string;
}

const mockFeedData: TeamActivityFeedItem[] = [
    // (피드 데이터는 변경 없음)
    { feedId: '1', memberId: 1, nickname: '김운동', profileImageUrl: '/api/placeholder/40/40', activityType: 'WATER', activityMessage: '물 800ml를 마셨어요! 💧', feedCreatedDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { feedId: '2', memberId: 2, nickname: '나', profileImageUrl: '/api/placeholder/40/40', activityType: 'MEAL', activityMessage: '점심식사를 기록했어요! 🍽️ 닭가슴살 샐러드 - 320kcal', feedCreatedDate: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString() },
    { feedId: '3', memberId: 3, nickname: '박헬스', profileImageUrl: '/api/placeholder/40/40', activityType: 'WEIGHT', activityMessage: '체중을 기록했어요! 📊 72.5kg (-0.3kg)', feedCreatedDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
    { feedId: '4', memberId: 4, nickname: '이건강', profileImageUrl: '/api/placeholder/40/40', activityType: 'CHALLENGE', activityMessage: '오늘의 운동 목표를 달성했어요! 🎯 30분 러닝 완료', feedCreatedDate: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
    { feedId: '5', memberId: 2, nickname: '나', profileImageUrl: '/api/placeholder/40/40', activityType: 'WATER', activityMessage: '물 500ml 추가! 💦 오늘 목표까지 200ml 남았어요', feedCreatedDate: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
    { feedId: '6', memberId: 5, nickname: '최다이어트', profileImageUrl: '/api/placeholder/40/40', activityType: 'MEAL', activityMessage: '저녁식사 기록! 🌙 연어구이와 현미밥 - 450kcal', feedCreatedDate: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
    { feedId: '7', memberId: 6, nickname: '정운동맨', profileImageUrl: '/api/placeholder/40/40', activityType: 'CHALLENGE', activityMessage: '주간 운동 목표 3회 달성! 🏆 이번 주도 화이팅!', feedCreatedDate: new Date(Date.now() - 5 * 60 * 1000).toISOString() }
];

const currentUserId = 2;

// --- 역할 정규화 및 헬퍼 함수 ---
const getRoleBadge = (role: UserRole) => { // 이제 UserRole 타입을 직접 받습니다.
    switch (role) {
        case 'LEADER':
            return <Badge className="bg-[#c2d595] text-[#2d3d0f]"><Crown className="w-3 h-3 mr-1" />리더</Badge>;
        case 'SUBLEADER':
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
    const [team, setTeam] = useState<TeamDetail | null>(null);
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

    useEffect(() => {
        if (!Number.isFinite(numericTeamId)) {
            navigate('/not-found');
            return;
        }

        const loadData = async () => {
            setLoading(true);
            try {
                // Promise.all을 사용해 팀 정보와 공지사항 정보를 병렬로 동시에 불러옵니다. (더 효율적)
                const [teamData] = await Promise.all([
                    getTeamDetails(numericTeamId), // 1. 팀 상세 정보 API 호출
                    fetchNotices()                 // 2. 공지사항 API 호출
                ]);

                // API 응답(TeamDetailDto)을 컴포넌트의 상태(TeamDetail) 형식에 맞게 매핑합니다.
                setTeam({
                    id: teamData.teamId.toString(),
                    name: teamData.teamTitle,
                    description: teamData.teamDescription,
                    image: teamData.teamImage || undefined,
                    currentMembers: teamData.currentMemberCount,
                    maxMembers: teamData.maxMembers,
                    leader: teamData.leaderNickname,
                    subLeader: teamData.subLeaderNickname || undefined,
                    userRole: teamData.teamRole, // DTO의 teamRole을 그대로 사용
                    joinedAt: teamData.createdDate, // 필드명에 맞게 매핑
                });

            } catch (error) {
                console.error("Failed to load team data:", error);
                toast({
                    title: "오류",
                    description: "그룹 정보를 불러오는 데 실패했습니다.",
                    variant: "destructive"
                });
                // 데이터를 불러오지 못했으므로 team 상태를 null로 유지하거나 에러 페이지로 이동할 수 있습니다.
                setTeam(null);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [numericTeamId, navigate]);

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
                                    <h1 className="text-2xl font-bold">{team.name}</h1>
                                    {getRoleBadge(team.userRole)}
                                </div>
                                <p className="text-muted-foreground mb-4">{team.description}</p>
                                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1"><Users className="h-4 w-4"/><span>{team.currentMembers}/{team.maxMembers}명</span></div>
                                    <div className="flex items-center gap-1"><Crown className="h-4 w-4"/><span>리더: {team.leader}</span></div>
                                    {team.subLeader && (<div className="flex items-center gap-1"><Shield className="h-4 w-4"/><span>부리더: {team.subLeader}</span></div>)}
                                </div>
                            </div>

                            <Popover>
                                <PopoverTrigger asChild><Button variant="outline" size="sm"><Settings className="h-4 w-4 mr-2"/>설정<ChevronDown className="h-3 w-3 ml-1"/></Button></PopoverTrigger>
                                <PopoverContent className="w-64" align="end">
                                    <div className="space-y-3">
                                        <div className="pb-2 border-b"><p className="text-sm font-medium">권한: {getRoleBadge(team.userRole)}</p></div>
                                        {team.userRole === 'MEMBER' && (<div className="space-y-2"><Button variant="destructive" className="w-full justify-start text-sm" onClick={handleLeaveGroup}>그룹 나가기</Button></div>)}
                                        {(team.userRole === 'LEADER' || team.userRole === 'SUBLEADER') && (
                                            <div className="space-y-2">
                                                <div className="pb-2">
                                                    <p className="text-xs text-muted-foreground mb-2">관리자 기능</p>
                                                    <div className="space-y-1">
                                                        <Button variant="outline" className="w-full justify-start text-sm h-8" disabled><Edit className="h-3 w-3 mr-2"/>그룹 정보 변경</Button>
                                                        {/* '그룹 공지 관리' 버튼 수정 */}
                                                        <Button variant="outline" className="w-full justify-start text-sm h-8" onClick={() => setIsNoticeManagementModalOpen(true)}><FileText className="h-3 w-3 mr-2"/>그룹 공지 관리</Button>
                                                        <Button variant="outline" className="w-full justify-start text-sm h-8" disabled><UserPlus className="h-3 w-3 mr-2"/>가입 요청자 관리</Button>
                                                        <Button variant="outline" className="w-full justify-start text-sm h-8" disabled><UserMinus className="h-3 w-3 mr-2"/>멤버 강퇴</Button>
                                                        {team.userRole === 'LEADER' && (
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
                        {/* (피드 탭 내용 원본 유지) */}
                        <Card className="h-[600px] flex flex-col"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5"/>실시간 피드</CardTitle></CardHeader><CardContent className="flex-1 overflow-y-auto"><div className="space-y-4 pb-4">{mockFeedData.map((feedItem) => { const isMyFeed = feedItem.memberId === currentUserId; const feedTime = new Date(feedItem.feedCreatedDate); const timeStr = feedTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }); const getActivityIcon = (type: string) => { switch (type) { case 'WATER': return <Droplets className="w-4 h-4"/>; case 'MEAL': return <Utensils className="w-4 h-4"/>; case 'WEIGHT': return <Weight className="w-4 h-4"/>; case 'CHALLENGE': return <Target className="w-4 h-4"/>; default: return <Bell className="w-4 h-4"/>; } }; return (<div key={feedItem.feedId} className={`flex w-full ${isMyFeed ? 'justify-end' : 'justify-start'}`}><div className={`flex max-w-[80%] ${isMyFeed ? 'flex-row-reverse' : 'flex-row'} gap-2`}>{!isMyFeed && (<Avatar className="w-8 h-8 mt-1"><AvatarImage src={feedItem.profileImageUrl} alt={feedItem.nickname}/><AvatarFallback className="text-xs bg-muted">{feedItem.nickname.slice(0, 2)}</AvatarFallback></Avatar>)}<div className={`flex flex-col ${isMyFeed ? 'items-end' : 'items-start'}`}>{!isMyFeed && (<div className="text-xs text-muted-foreground mb-1 px-1">{feedItem.nickname}</div>)}<div className={`relative px-3 py-2 rounded-2xl shadow-sm ${isMyFeed ? 'bg-[#c2d595] text-[#2d3d0f] rounded-br-md' : 'bg-[#ffffe1] text-foreground rounded-bl-md border border-border/50'}`}><div className="flex items-start gap-2"><div className="flex-shrink-0 mt-0.5">{getActivityIcon(feedItem.activityType)}</div><div className="min-w-0"><p className="text-sm leading-relaxed break-words">{feedItem.activityMessage}</p></div></div></div><div className={`text-xs text-muted-foreground mt-1 px-1 ${isMyFeed ? 'text-right' : 'text-left'}`}>{timeStr}</div></div></div></div>); })}</div></CardContent></Card>
                    </TabsContent>

                    <TabsContent value="chat">
                        {/* (채팅 탭 내용 원본 유지) */}
                        <Card className="h-[600px] flex flex-col"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5"/>그룹 채팅</CardTitle></CardHeader><CardContent className="flex-1 p-0"><ChatContainer teamId={teamId || '1'} currentUserId={currentUserId} /></CardContent></Card>
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
