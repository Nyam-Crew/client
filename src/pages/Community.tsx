import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  MessageCircle, 
  Share2,
  Search,
  TrendingUp,
  Users,
  Plus,
  Star,
  Eye,
  ThumbsUp,
  Clock
} from 'lucide-react';

const Community = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: '전체', count: 1245 },
    { id: 'recipe', label: '레시피', count: 324 },
    { id: 'tips', label: '팁&노하우', count: 189 },
    { id: 'question', label: '질문&답변', count: 267 },
    { id: 'review', label: '식단후기', count: 465 },
  ];

  const posts = [
    {
      id: 1,
      author: {
        name: '김건강',
        avatar: '',
        level: '건강왕',
        verified: true
      },
      category: 'recipe',
      title: '다이어트 도시락 만들기 꿀팁! (칼로리 계산 포함)',
      content: '직장인 다이어터를 위한 간단하고 맛있는 도시락 레시피 공유해요. 준비 시간 10분으로 일주일치 준비 가능!',
      image: '/api/placeholder/400/200',
      likes: 156,
      comments: 23,
      views: 892,
      timeAgo: '2시간 전',
      tags: ['다이어트', '도시락', '레시피', '직장인'],
      isPinned: true
    },
    {
      id: 2,
      author: {
        name: '이영양',
        avatar: '',
        level: '영양사',
        verified: true
      },
      category: 'tips',
      title: '단백질 섭취량 늘리는 간단한 방법 5가지',
      content: '근육량 늘리고 싶은데 단백질 섭취가 어려우신 분들을 위한 실용적인 팁들입니다.',
      likes: 89,
      comments: 15,
      views: 543,
      timeAgo: '4시간 전',
      tags: ['단백질', '근육', '영양'],
      isPinned: false
    },
    {
      id: 3,
      author: {
        name: '박다이어트',
        avatar: '',
        level: '실버',
        verified: false
      },
      category: 'review',
      title: '30일 챌린지 완주 후기 (사진 인증)',
      content: '드디어 30일 식단 기록 챌린지를 완주했어요! 전후 사진과 함께 솔직한 후기 남겨요.',
      image: '/api/placeholder/400/300',
      likes: 234,
      comments: 67,
      views: 1205,
      timeAgo: '6시간 전',
      tags: ['후기', '챌린지', '다이어트', '인증'],
      isPinned: false
    },
    {
      id: 4,
      author: {
        name: '최영양',
        avatar: '',
        level: '골드',
        verified: false
      },
      category: 'question',
      title: '운동 전후 식사 타이밍이 궁금해요',
      content: '헬스장에서 운동하는데 언제 뭘 먹어야 할지 모르겠어요. 경험 많으신 분들 조언 부탁드려요!',
      likes: 45,
      comments: 31,
      views: 289,
      timeAgo: '8시간 전',
      tags: ['질문', '운동', '식사타이밍'],
      isPinned: false
    }
  ];

  const popularTags = [
    '다이어트', '레시피', '단백질', '운동', '챌린지', '헬시푸드', '도시락', '영양', '후기', '질문'
  ];

  const topContributors = [
    { name: '김건강', posts: 45, likes: 2890 },
    { name: '이영양', posts: 38, likes: 2156 },
    { name: '박단백', posts: 29, likes: 1678 },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">커뮤니티</h1>
            <p className="text-muted-foreground">함께 나누는 건강한 이야기</p>
          </div>
          <Button className="gap-2">
            <Plus size={16} />
            글쓰기
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-3 space-y-6">
            {/* 검색 및 필터 */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* 검색바 */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                    <Input 
                      placeholder="궁금한 내용을 검색해보세요"
                      className="pl-10"
                    />
                  </div>

                  {/* 카테고리 */}
                  <div className="flex gap-2 flex-wrap">
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        {category.label}
                        <Badge variant="secondary" className="ml-2">
                          {category.count}
                        </Badge>
                      </Button>
                    ))}
                  </div>

                  {/* 인기 태그 */}
                  <div>
                    <p className="text-sm font-medium mb-2">인기 태그</p>
                    <div className="flex gap-2 flex-wrap">
                      {popularTags.slice(0, 6).map((tag) => (
                        <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-accent">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 게시글 목록 */}
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className={post.isPinned ? 'border-primary bg-primary/5' : ''}>
                  <CardContent className="p-6">
                    {/* 작성자 정보 */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{post.author.name}</p>
                            {post.author.verified && (
                              <Star className="text-warning" size={14} />
                            )}
                            <Badge variant="outline">
                              {post.author.level}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock size={12} />
                            <span>{post.timeAgo}</span>
                            <span>•</span>
                            <Eye size={12} />
                            <span>{post.views}</span>
                          </div>
                        </div>
                      </div>
                      {post.isPinned && (
                        <Badge variant="secondary" className="bg-warning/20 text-warning">
                          📌 고정글
                        </Badge>
                      )}
                    </div>

                    {/* 게시글 내용 */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold cursor-pointer hover:text-primary">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground">{post.content}</p>
                      
                      {post.image && (
                        <div className="bg-muted rounded-lg h-48 flex items-center justify-center">
                          <span className="text-muted-foreground">📸 이미지</span>
                        </div>
                      )}

                      {/* 태그 */}
                      <div className="flex gap-2 flex-wrap">
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex items-center justify-between pt-4 mt-4 border-t">
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Heart size={16} />
                          <span>{post.likes}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <MessageCircle size={16} />
                          <span>{post.comments}</span>
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 size={16} />
                        </Button>
                      </div>
                      <Badge variant="outline">
                        {post.category === 'recipe' && '레시피'}
                        {post.category === 'tips' && '팁&노하우'}
                        {post.category === 'question' && '질문&답변'}
                        {post.category === 'review' && '식단후기'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 더보기 버튼 */}
            <div className="text-center">
              <Button variant="outline" size="lg">
                더 많은 게시글 보기
              </Button>
            </div>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 이번 주 인기글 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp size={20} />
                  이번 주 인기글
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {posts.slice(0, 3).map((post, index) => (
                  <div key={post.id} className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-1">
                        {index + 1}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-2 cursor-pointer hover:text-primary">
                          {post.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <ThumbsUp size={12} />
                          <span>{post.likes}</span>
                          <span>•</span>
                          <MessageCircle size={12} />
                          <span>{post.comments}</span>
                        </div>
                      </div>
                    </div>
                    {index < 2 && <div className="border-b" />}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 활발한 사용자 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users size={20} />
                  이번 주 활발한 사용자
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topContributors.map((user, index) => (
                  <div key={user.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{index + 1}</Badge>
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.posts}개 글</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{user.likes}</p>
                      <p className="text-xs text-muted-foreground">좋아요</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 커뮤니티 규칙 */}
            <Card className="bg-brand-light">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">🌱 커뮤니티 규칙</h3>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• 서로 존중하고 배려하는 마음</li>
                  <li>• 건설적이고 도움이 되는 댓글</li>
                  <li>• 개인정보 보호 준수</li>
                  <li>• 광고성 게시글 금지</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;