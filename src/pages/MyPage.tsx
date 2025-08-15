import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { 
  User, 
  Settings, 
  Award, 
  Bookmark, 
  Camera,
  Trophy,
  Star,
  Heart,
  Target,
  Crown,
  Zap,
  Eye,
  MessageCircle,
  Edit,
  Check
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

// 멤버 정보 스키마
const memberInfoSchema = z.object({
  nickname: z.string()
    .min(2, '닉네임은 2글자 이상이어야 합니다')
    .regex(/^[가-힣a-zA-Z0-9]+$/, '한글, 영문, 숫자만 사용 가능합니다'),
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  gender: z.enum(['male', 'female', 'none']),
  weight: z.string().regex(/^\d+$/, '숫자만 입력 가능합니다').min(1, '몸무게를 입력해주세요'),
  height: z.string().regex(/^\d+$/, '숫자만 입력 가능합니다').min(1, '키를 입력해주세요'),
  age: z.string().regex(/^\d+$/, '숫자만 입력 가능합니다').min(1, '나이를 입력해주세요'),
  activityLevel: z.enum(['SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE']),
  targetWeight: z.string().regex(/^\d+$/, '숫자만 입력 가능합니다').min(1, '목표체중을 입력해주세요'),
});

type MemberInfoForm = z.infer<typeof memberInfoSchema>;

// 활동레벨 매핑
const activityLevelMap = {
  SEDENTARY: '비활동적 (주로 앉아서 생활)',
  LIGHT: '가벼운 활동 (주 1~2회 가벼운 운동)',
  MODERATE: '보통 활동 (주 3~5회 보통 강도 운동)',
  ACTIVE: '활발한 활동 (주 6~7회 규칙적인 운동)',
  VERY_ACTIVE: '매우 활발한 활동 (매일 고강도 운동 또는 육체노동)'
};

const MyPage = () => {
  const [profileImage, setProfileImage] = useState<string>('/public/placeholder.svg');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [currentBadgePage, setCurrentBadgePage] = useState(1);
  const [currentBookmarkPage, setCurrentBookmarkPage] = useState(1);
  const { toast } = useToast();

  const form = useForm<MemberInfoForm>({
    resolver: zodResolver(memberInfoSchema),
    defaultValues: {
      nickname: '김건강',
      email: 'kimhealth@example.com',
      gender: 'male',
      weight: '70',
      height: '175',
      age: '28',
      activityLevel: 'MODERATE',
      targetWeight: '65',
    },
  });

  const currentNickname = form.watch('nickname');

  const onSubmit = (data: MemberInfoForm) => {
    if (!isNicknameChecked) {
      toast({
        title: "닉네임 중복체크가 필요합니다",
        description: "닉네임 중복체크를 먼저 진행해주세요.",
        variant: "destructive"
      });
      return;
    }
    
    console.log('멤버 정보 수정:', data);
    setIsEditMode(false);
    setIsNicknameChecked(false);
    toast({
      title: "프로필이 수정되었습니다",
      description: "정보가 성공적으로 업데이트되었습니다.",
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const checkNicknameDuplicate = async () => {
    // 실제로는 API 호출
    const isAvailable = true; // 임시로 성공으로 설정
    
    if (isAvailable) {
      setIsNicknameChecked(true);
      toast({
        title: "사용 가능한 닉네임입니다",
        description: "해당 닉네임을 사용하실 수 있습니다.",
      });
    } else {
      setIsNicknameChecked(false);
      toast({
        title: "이미 사용 중인 닉네임입니다",
        description: "다른 닉네임을 입력해주세요.",
        variant: "destructive"
      });
    }
  };

  // 닉네임이 변경되면 중복체크 상태 초기화
  const handleNicknameChange = (value: string) => {
    setIsNicknameChecked(false);
    form.setValue('nickname', value);
  };

  // 뱃지 목록 데이터 (더 많은 뱃지 추가)
  const badges = [
    { id: 1, name: '첫 시작', icon: Star, description: '첫 식단을 기록했어요', earned: true, earnedDate: '2024-01-15' },
    { id: 2, name: '일주일 연속', icon: Trophy, description: '7일 연속 기록 달성', earned: true, earnedDate: '2024-01-22' },
    { id: 3, name: '한달 마스터', icon: Crown, description: '30일 연속 기록 달성', earned: false },
    { id: 4, name: '팀플레이어', icon: Heart, description: '팀 챌린지 참여', earned: true, earnedDate: '2024-01-20' },
    { id: 5, name: '목표 달성', icon: Target, description: '첫 번째 목표 달성', earned: true, earnedDate: '2024-01-18' },
    { id: 6, name: '번개같이', icon: Zap, description: '빠른 기록 달성', earned: false },
    { id: 7, name: '물 마시기', icon: Star, description: '물 마시기 목표 달성', earned: true, earnedDate: '2024-01-10' },
    { id: 8, name: '운동왕', icon: Trophy, description: '운동 목표 달성', earned: false },
    { id: 9, name: '영양사', icon: Heart, description: '영양 균형 달성', earned: true, earnedDate: '2024-01-12' },
    { id: 10, name: '규칙적', icon: Target, description: '규칙적인 식사', earned: false },
    { id: 11, name: '건강지킴이', icon: Crown, description: '건강 목표 달성', earned: true, earnedDate: '2024-01-25' },
    { id: 12, name: '마라톤', icon: Zap, description: '장기간 목표 달성', earned: false },
  ];

  // 뱃지 페이징 (한 페이지에 6개, 한 줄에 2개)
  const badgesPerPage = 6;
  const totalBadgePages = Math.ceil(badges.length / badgesPerPage);
  const startBadgeIndex = (currentBadgePage - 1) * badgesPerPage;
  const currentBadges = badges.slice(startBadgeIndex, startBadgeIndex + badgesPerPage);

  // 북마크 게시글 데이터 (더 많은 게시글 추가)
  const bookmarkedPosts = [
    {
      id: 1,
      title: '건강한 아침 식단 레시피 모음',
      author: '김영양',
      category: '레시피',
      likes: 124,
      views: 1234,
      comments: 56,
      bookmarkedDate: '2024-01-23',
      thumbnail: '/public/placeholder.svg'
    },
    {
      id: 2,
      title: '다이어트 중에도 맛있게! 저칼로리 간식',
      author: '이헬시',
      category: '다이어트',
      likes: 89,
      views: 890,
      comments: 32,
      bookmarkedDate: '2024-01-22',
      thumbnail: '/public/placeholder.svg'
    },
    {
      id: 3,
      title: '운동 후 단백질 보충 꿀팁',
      author: '박건강',
      category: '운동',
      likes: 156,
      views: 2100,
      comments: 78,
      bookmarkedDate: '2024-01-21',
      thumbnail: '/public/placeholder.svg'
    },
    {
      id: 4,
      title: '간단한 홈트레이닝 루틴',
      author: '운동맨',
      category: '운동',
      likes: 234,
      views: 1800,
      comments: 45,
      bookmarkedDate: '2024-01-20',
      thumbnail: '/public/placeholder.svg'
    },
    {
      id: 5,
      title: '체중감량을 위한 식단 계획',
      author: '다이어터',
      category: '다이어트',
      likes: 178,
      views: 1567,
      comments: 67,
      bookmarkedDate: '2024-01-19',
      thumbnail: '/public/placeholder.svg'
    },
    {
      id: 6,
      title: '건강한 간식 만들기',
      author: '요리왕',
      category: '레시피',
      likes: 145,
      views: 1234,
      comments: 34,
      bookmarkedDate: '2024-01-18',
      thumbnail: '/public/placeholder.svg'
    },
    {
      id: 7,
      title: '물 많이 마시는 방법',
      author: '수분왕',
      category: '건강',
      likes: 92,
      views: 876,
      comments: 23,
      bookmarkedDate: '2024-01-17',
      thumbnail: '/public/placeholder.svg'
    },
    {
      id: 8,
      title: '영양소 균형 맞추기',
      author: '영양사',
      category: '영양',
      likes: 198,
      views: 1654,
      comments: 89,
      bookmarkedDate: '2024-01-16',
      thumbnail: '/public/placeholder.svg'
    },
    {
      id: 9,
      title: '스트레스 관리와 식단',
      author: '멘탈케어',
      category: '건강',
      likes: 167,
      views: 1345,
      comments: 56,
      bookmarkedDate: '2024-01-15',
      thumbnail: '/public/placeholder.svg'
    },
    {
      id: 10,
      title: '근력운동 기초 가이드',
      author: '트레이너',
      category: '운동',
      likes: 267,
      views: 2345,
      comments: 123,
      bookmarkedDate: '2024-01-14',
      thumbnail: '/public/placeholder.svg'
    },
    {
      id: 11,
      title: '건강한 수면과 다이어트',
      author: '수면전문가',
      category: '건강',
      likes: 134,
      views: 1098,
      comments: 45,
      bookmarkedDate: '2024-01-13',
      thumbnail: '/public/placeholder.svg'
    },
    {
      id: 12,
      title: '계절별 제철 음식 활용법',
      author: '제철요리사',
      category: '레시피',
      likes: 189,
      views: 1567,
      comments: 67,
      bookmarkedDate: '2024-01-12',
      thumbnail: '/public/placeholder.svg'
    }
  ];

  // 북마크 페이징
  const bookmarksPerPage = 10;
  const totalBookmarkPages = Math.ceil(bookmarkedPosts.length / bookmarksPerPage);
  const startBookmarkIndex = (currentBookmarkPage - 1) * bookmarksPerPage;
  const currentBookmarks = bookmarkedPosts.slice(startBookmarkIndex, startBookmarkIndex + bookmarksPerPage);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">마이페이지</h1>
          <p className="text-muted-foreground">내 정보를 관리하고 활동을 확인해보세요</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User size={16} />
              <span className="hidden sm:inline">프로필</span>
              <span className="sm:hidden">프로필</span>
            </TabsTrigger>
            <TabsTrigger value="badges" className="flex items-center gap-2">
              <Award size={16} />
              <span className="hidden sm:inline">나의 뱃지</span>
              <span className="sm:hidden">뱃지</span>
            </TabsTrigger>
            <TabsTrigger value="bookmarks" className="flex items-center gap-2">
              <Bookmark size={16} />
              <span className="hidden sm:inline">북마크</span>
              <span className="sm:hidden">북마크</span>
            </TabsTrigger>
          </TabsList>

          {/* 프로필 탭 */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isEditMode ? <Edit size={20} /> : <User size={20} />}
                  {isEditMode ? '프로필 정보 수정' : '프로필 정보'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 프로필 사진 */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={profileImage} alt="프로필 사진" />
                      <AvatarFallback>김건강</AvatarFallback>
                    </Avatar>
                    {isEditMode && (
                      <label htmlFor="profile-image" className="absolute bottom-0 right-0 p-1 bg-primary rounded-full cursor-pointer hover:bg-primary/80 transition-colors">
                        <Camera size={16} className="text-primary-foreground" />
                      </label>
                    )}
                    <input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                  
                  {/* 닉네임을 프로필 사진 바로 아래 중앙에 표시 */}
                  {!isEditMode && (
                    <div className="text-center">
                      <h2 className="text-xl font-semibold text-foreground">
                        {form.getValues('nickname')}
                      </h2>
                    </div>
                  )}
                  
                  {isEditMode && <p className="text-sm text-muted-foreground">프로필 사진을 변경하려면 클릭하세요</p>}
                </div>

                {isEditMode ? (
                  /* 수정 모드 */
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="nickname"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>닉네임</FormLabel>
                            <div className="flex gap-2">
                              <FormControl className="flex-1">
                                <Input 
                                  placeholder="닉네임을 입력하세요" 
                                  {...field}
                                  onChange={(e) => handleNicknameChange(e.target.value)}
                                />
                              </FormControl>
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={checkNicknameDuplicate}
                                disabled={!currentNickname || currentNickname.length < 2}
                              >
                                중복체크
                              </Button>
                            </div>
                            <FormMessage />
                            {isNicknameChecked && (
                              <p className="text-sm text-green-600 flex items-center gap-1">
                                <Check size={14} />
                                사용 가능한 닉네임입니다
                              </p>
                            )}
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>이메일</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="이메일" 
                                {...field} 
                                disabled
                                className="bg-muted"
                              />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">이메일은 수정할 수 없습니다</p>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>성별</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="flex gap-6"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="male" id="male" />
                                  <Label htmlFor="male">남성</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="female" id="female" />
                                  <Label htmlFor="female">여성</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="none" id="none" />
                                  <Label htmlFor="none">없음</Label>
                                </div>
                               </RadioGroup>
                             </FormControl>
                             <FormMessage />
                           </FormItem>
                         )}
                       />

                      <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>키 (cm)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="175" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>몸무게 (kg)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="70" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>나이</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="28" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="targetWeight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>목표체중 (kg)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="65" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="activityLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>활동레벨</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-background">
                                  <SelectValue placeholder="활동레벨을 선택하세요" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-background border-border z-50">
                                {Object.entries(activityLevelMap).map(([key, value]) => (
                                  <SelectItem key={key} value={key}>
                                    {value}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-2 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setIsEditMode(false);
                            setIsNicknameChecked(false);
                          }}
                          className="flex-1"
                        >
                          취소
                        </Button>
                        <Button 
                          type="submit" 
                          className="flex-1"
                          disabled={!isNicknameChecked}
                        >
                          수정 완료
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  /* 조회 모드 */
                  <div className="space-y-4">
                    <div className="space-y-4">
                      
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">이메일</Label>
                        <div className="mt-1 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed">
                          {form.getValues('email')}
                        </div>
                      </div>
                      
                       <div>
                         <Label className="text-sm font-medium text-muted-foreground">성별</Label>
                         <div className="mt-2">
                           <RadioGroup
                             value={form.getValues('gender')}
                             disabled
                             className="flex gap-6"
                           >
                             <div className="flex items-center space-x-2">
                               <RadioGroupItem value="male" id="male-read" disabled />
                               <Label htmlFor="male-read" className="text-muted-foreground">남성</Label>
                             </div>
                             <div className="flex items-center space-x-2">
                               <RadioGroupItem value="female" id="female-read" disabled />
                               <Label htmlFor="female-read" className="text-muted-foreground">여성</Label>
                             </div>
                             <div className="flex items-center space-x-2">
                               <RadioGroupItem value="none" id="none-read" disabled />
                               <Label htmlFor="none-read" className="text-muted-foreground">없음</Label>
                             </div>
                           </RadioGroup>
                         </div>
                       </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">나이</Label>
                        <div className="mt-1 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed">
                          {form.getValues('age')}세
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">활동레벨</Label>
                        <div className="mt-1 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed">
                          {activityLevelMap[form.getValues('activityLevel') as keyof typeof activityLevelMap]}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">키</Label>
                        <div className="mt-1 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed">
                          {form.getValues('height')}cm
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">현재 몸무게</Label>
                        <div className="mt-1 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed">
                          {form.getValues('weight')}kg
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">목표 몸무게</Label>
                        <div className="mt-1 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed">
                          {form.getValues('targetWeight')}kg
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={() => setIsEditMode(true)}
                      className="w-full mt-6"
                    >
                      정보수정하기
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 뱃지 탭 */}
          <TabsContent value="badges">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award size={20} />
                  나의 뱃지 컬렉션
                </CardTitle>
                <p className="text-muted-foreground">
                  획득한 뱃지: {badges.filter(badge => badge.earned).length}/{badges.length}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentBadges.map((badge) => {
                    const IconComponent = badge.icon;
                    return (
                      <Card 
                        key={badge.id} 
                        className={`relative transition-all hover:scale-105 hover:shadow-lg ${
                          badge.earned 
                            ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20' 
                            : 'bg-muted/30 opacity-60'
                        }`}
                      >
                        <CardContent className="p-4 text-center">
                          <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center transition-all ${
                            badge.earned 
                              ? 'bg-primary text-primary-foreground shadow-lg' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            <IconComponent size={24} />
                          </div>
                          <h3 className="font-semibold mb-1">{badge.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{badge.description}</p>
                          {badge.earned ? (
                            <Badge variant="default" className="text-xs">
                              {badge.earnedDate} 획득
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              미획득
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* 뱃지 페이징 */}
                {totalBadgePages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentBadgePage(Math.max(1, currentBadgePage - 1))}
                          className={currentBadgePage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalBadgePages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentBadgePage(page)}
                            isActive={page === currentBadgePage}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentBadgePage(Math.min(totalBadgePages, currentBadgePage + 1))}
                          className={currentBadgePage === totalBadgePages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 북마크 탭 */}
          <TabsContent value="bookmarks">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bookmark size={20} />
                  북마크한 게시글
                </CardTitle>
                <p className="text-muted-foreground">
                  총 {bookmarkedPosts.length}개의 게시글을 북마크했어요
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {currentBookmarks.map((post) => (
                    <Card key={post.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0">
                            <img 
                              src={post.thumbnail} 
                              alt={post.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-medium line-clamp-1">{post.title}</h3>
                              <Bookmark className="text-primary flex-shrink-0 ml-2" size={16} />
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                              <span>{post.author}</span>
                              <span>•</span>
                              <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Heart size={12} className="text-red-500" />
                                  {post.likes.toLocaleString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Eye size={12} className="text-blue-500" />
                                  {post.views.toLocaleString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle size={12} className="text-green-500" />
                                  {post.comments}
                                </span>
                              </div>
                              <span>{post.bookmarkedDate} 저장</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* 북마크 페이징 */}
                {totalBookmarkPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentBookmarkPage(Math.max(1, currentBookmarkPage - 1))}
                          className={currentBookmarkPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalBookmarkPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentBookmarkPage(page)}
                            isActive={page === currentBookmarkPage}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentBookmarkPage(Math.min(totalBookmarkPages, currentBookmarkPage + 1))}
                          className={currentBookmarkPage === totalBookmarkPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyPage;