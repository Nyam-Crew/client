import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Zap
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
  nickname: z.string().min(2, '닉네임은 2글자 이상이어야 합니다'),
  gender: z.enum(['male', 'female']),
  weight: z.string().min(1, '몸무게를 입력해주세요'),
  height: z.string().min(1, '키를 입력해주세요'),
  age: z.string().min(1, '나이를 입력해주세요'),
});

type MemberInfoForm = z.infer<typeof memberInfoSchema>;

const MyPage = () => {
  const [profileImage, setProfileImage] = useState<string>('/public/placeholder.svg');
  const { toast } = useToast();

  const form = useForm<MemberInfoForm>({
    resolver: zodResolver(memberInfoSchema),
    defaultValues: {
      nickname: '김건강',
      gender: 'male',
      weight: '70',
      height: '175',
      age: '28',
    },
  });

  const onSubmit = (data: MemberInfoForm) => {
    console.log('멤버 정보 수정:', data);
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

  // 뱃지 목록 데이터
  const badges = [
    { id: 1, name: '첫 시작', icon: Star, description: '첫 식단을 기록했어요', earned: true, earnedDate: '2024-01-15' },
    { id: 2, name: '일주일 연속', icon: Trophy, description: '7일 연속 기록 달성', earned: true, earnedDate: '2024-01-22' },
    { id: 3, name: '한달 마스터', icon: Crown, description: '30일 연속 기록 달성', earned: false },
    { id: 4, name: '팀플레이어', icon: Heart, description: '팀 챌린지 참여', earned: true, earnedDate: '2024-01-20' },
    { id: 5, name: '목표 달성', icon: Target, description: '첫 번째 목표 달성', earned: true, earnedDate: '2024-01-18' },
    { id: 6, name: '번개같이', icon: Zap, description: '빠른 기록 달성', earned: false },
  ];

  // 북마크 게시글 데이터
  const bookmarkedPosts = [
    {
      id: 1,
      title: '건강한 아침 식단 레시피 모음',
      author: '김영양',
      category: '레시피',
      likes: 124,
      bookmarkedDate: '2024-01-23',
      thumbnail: '/public/placeholder.svg'
    },
    {
      id: 2,
      title: '다이어트 중에도 맛있게! 저칼로리 간식',
      author: '이헬시',
      category: '다이어트',
      likes: 89,
      bookmarkedDate: '2024-01-22',
      thumbnail: '/public/placeholder.svg'
    },
    {
      id: 3,
      title: '운동 후 단백질 보충 꿀팁',
      author: '박건강',
      category: '운동',
      likes: 156,
      bookmarkedDate: '2024-01-21',
      thumbnail: '/public/placeholder.svg'
    },
  ];

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
              <span className="hidden sm:inline">프로필 수정</span>
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

          {/* 프로필 수정 탭 */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings size={20} />
                  프로필 정보 수정
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
                    <label htmlFor="profile-image" className="absolute bottom-0 right-0 p-1 bg-primary rounded-full cursor-pointer hover:bg-primary/80 transition-colors">
                      <Camera size={16} className="text-primary-foreground" />
                    </label>
                    <input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">프로필 사진을 변경하려면 클릭하세요</p>
                </div>

                {/* 정보 입력 폼 */}
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="nickname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>닉네임</FormLabel>
                          <FormControl>
                            <Input placeholder="닉네임을 입력하세요" {...field} />
                          </FormControl>
                          <FormMessage />
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
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="weight" className="text-sm font-medium text-foreground">
                              몸무게 (kg)
                            </FormLabel>
                            <FormControl>
                              <Input 
                                id="weight"
                                type="number" 
                                placeholder="예: 70" 
                                aria-describedby="weight-description"
                                className="mt-1 focus:ring-2 focus:ring-primary/20"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage id="weight-description" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="height" className="text-sm font-medium text-foreground">
                              키 (cm)
                            </FormLabel>
                            <FormControl>
                              <Input 
                                id="height"
                                type="number" 
                                placeholder="예: 175" 
                                aria-describedby="height-description"
                                className="mt-1 focus:ring-2 focus:ring-primary/20"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage id="height-description" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="age" className="text-sm font-medium text-foreground">
                              나이
                            </FormLabel>
                            <FormControl>
                              <Input 
                                id="age"
                                type="number" 
                                placeholder="예: 28" 
                                aria-describedby="age-description"
                                className="mt-1 focus:ring-2 focus:ring-primary/20"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage id="age-description" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      정보 수정하기
                    </Button>
                  </form>
                </Form>
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
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {badges.map((badge) => {
                    const IconComponent = badge.icon;
                    return (
                      <Card 
                        key={badge.id} 
                        className={`relative ${badge.earned ? 'bg-gradient-to-br from-brand-light/50 to-brand-cream/50' : 'bg-muted/30 opacity-60'}`}
                      >
                        <CardContent className="p-4 text-center">
                          <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                            badge.earned ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
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
              <CardContent>
                <div className="space-y-4">
                  {bookmarkedPosts.map((post) => (
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
                              <span>좋아요 {post.likes}개</span>
                              <span>{post.bookmarkedDate} 저장</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyPage;