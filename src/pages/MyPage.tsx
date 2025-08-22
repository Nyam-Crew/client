import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
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
  Check,
  FileText,
  MessageSquare,
  LogOut,
  UserX
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
import { defaultFetch } from '@/api/defaultFetch';

// TypeScript interfaces for API responses
interface MemberResponse {
  memberId: number;
  nickname: string;
  email: string;
  memberImg: string | null;
  gender: string;
  height: number;
  weight: number;
  age: number;
  bmi: number;
  bmr: number;
  tdee: number;
  targetWeight: number;
  recommendedCalories: number;
  activityLevel: string;
  memberStatus: string;
  createdDate: string;
  modifiedDate: string;
}

interface MemberUpdateRequest {
  memberId?: number;
  nickname: string;
  email: string;
  memberImg?: string;
  gender: string;
  height: number;
  weight: number;
  targetWeight: number;
  age: number;
  activityLevel: string;
}

interface NicknameCheckResponse {
  isDuplicate: boolean;
}

// Badge API response interfaces
interface BadgeOwnershipDto {
  id: number;
  name: string;
  description: string;
  badgeImage: string;
  isOwned: boolean;
  createdDate: string;
  acquiredAt: string | null;
}

interface CustomPageResponseDto<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  isLast: boolean;
}

// Bookmark API response interfaces
interface MyBookmarkListResponseDto {
  boardId: number;
  bookmarkId: number;
  boardTitle: string;
  boardContent: string;
  boardAuthorNickname: string;
  likeCount: number;
  viewCount: number;
  commentCount: number;
  boardType: string;
  bookmarkedAt: string;
}

// My Boards API response interfaces
interface MyBoardsResponseDto {
  boardId: number;
  boardTitle: string;
  boardContent: string;
  boardAuthorNickname: string;
  likeCount: number;
  viewCount: number;
  commentCount: number;
  boardType: string;
  createdDate: string;
}

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
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<string>('/public/placeholder.svg');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [currentBadgePage, setCurrentBadgePage] = useState(1);
  const [badgesData, setBadgesData] = useState<CustomPageResponseDto<BadgeOwnershipDto> | null>(null);
  const [badgesLoading, setBadgesLoading] = useState(false);
  const [currentBookmarkPage, setCurrentBookmarkPage] = useState(1);
  const [bookmarksData, setBookmarksData] = useState<CustomPageResponseDto<MyBookmarkListResponseDto> | null>(null);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);
  const [currentPostPage, setCurrentPostPage] = useState(1);
  const [postsData, setPostsData] = useState<CustomPageResponseDto<MyBoardsResponseDto> | null>(null);
  const [postsLoading, setPostsLoading] = useState(false);
  const [currentCommentPage, setCurrentCommentPage] = useState(1);

  // API integration state
  const [memberData, setMemberData] = useState<MemberResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nicknameValidation, setNicknameValidation] = useState<{
    isChecking: boolean;
    isValid: boolean | null;
    message: string;
  }>({
    isChecking: false,
    isValid: null,
    message: ''
  });

  const { toast } = useToast();

  // Initialize form first to avoid "Cannot access 'form' before initialization" error
  const form = useForm<MemberInfoForm>({
    resolver: zodResolver(memberInfoSchema),
    defaultValues: {
      nickname: '',
      email: '',
      gender: 'male',
      weight: '',
      height: '',
      age: '',
      activityLevel: 'MODERATE',
      targetWeight: '',
    },
  });

  // API functions
  const fetchMemberData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await defaultFetch('/api/member/me');
      setMemberData(data);

      // Update form with fetched data
      if (data) {
        form.reset({
          nickname: data.nickname,
          email: data.email,
          gender: data.gender === 'M' ? 'male' : data.gender === 'F' ? 'female' : 'none',
          weight: data.weight.toString(),
          height: data.height.toString(),
          age: data.age.toString(),
          activityLevel: data.activityLevel,
          targetWeight: data.targetWeight.toString(),
        });

        if (data.memberImg) {
          setProfileImage(data.memberImg);
        }
      }
    } catch (error) {
      console.error('Failed to fetch member data:', error);
      toast({
        title: "데이터 로딩 실패",
        description: "회원 정보를 불러오는데 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [form, toast]);

  const checkNicknameDuplication = useCallback(async (nickname: string) => {
    if (!nickname || nickname.length < 2) {
      setNicknameValidation({
        isChecking: false,
        isValid: null,
        message: ''
      });
      return;
    }

    try {
      setNicknameValidation(prev => ({ ...prev, isChecking: true }));
      const response: NicknameCheckResponse = await defaultFetch(`/api/member/check-nickname/${encodeURIComponent(nickname)}`);

      const isValid = !response.isDuplicate;
      setNicknameValidation({
        isChecking: false,
        isValid,
        message: isValid ? '사용 가능한 닉네임입니다.' : '이미 사용 중인 닉네임입니다.'
      });

      setIsNicknameChecked(isValid);
    } catch (error) {
      console.error('Failed to check nickname:', error);
      setNicknameValidation({
        isChecking: false,
        isValid: null,
        message: '닉네임 확인 중 오류가 발생했습니다.'
      });
    }
  }, []);

  // 로그아웃 및 회원 탈퇴 핸들러
  const handleLogout = async () => {
    try {
      await defaultFetch('/api/auth/logout', {
        method: 'POST'
      });

      // Remove tokens from localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      toast({
        title: "로그아웃 완료",
        description: "성공적으로 로그아웃되었습니다.",
      });

      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: "로그아웃 실패",
        description: "로그아웃 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAccount = () => {
    // 실제로는 API 호출하여 회원 탈퇴 처리
    console.log('회원 탈퇴 처리');
    toast({
      title: "회원 탈퇴 완료",
      description: "계정이 성공적으로 삭제되었습니다.",
      variant: "destructive"
    });
  };

  const currentNickname = form.watch('nickname');

  // Load member data on mount
  useEffect(() => {
    fetchMemberData();
  }, [fetchMemberData]);

  // Debounced nickname validation
  useEffect(() => {
    if (!currentNickname || currentNickname === memberData?.nickname) {
      setNicknameValidation({
        isChecking: false,
        isValid: null,
        message: ''
      });
      setIsNicknameChecked(true); // Original nickname is valid
      return;
    }

    const timeoutId = setTimeout(() => {
      checkNicknameDuplication(currentNickname);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [currentNickname, memberData?.nickname, checkNicknameDuplication]);

  const onSubmit = async (data: MemberInfoForm) => {
    if (!memberData) {
      toast({
        title: "오류",
        description: "회원 정보를 불러오지 못했습니다.",
        variant: "destructive"
      });
      return;
    }

    if (currentNickname !== memberData.nickname && !isNicknameChecked) {
      toast({
        title: "닉네임 중복체크가 필요합니다",
        description: "닉네임 중복체크를 먼저 진행해주세요.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const updateRequest: MemberUpdateRequest = {
        memberId: memberData.memberId,
        nickname: data.nickname,
        email: data.email,
        memberImg: memberData.memberImg, // Include memberImg from GET /api/member/me response
        gender: data.gender === 'male' ? 'M' : data.gender === 'female' ? 'F' : 'U',
        height: parseFloat(data.height),
        weight: parseFloat(data.weight),
        targetWeight: parseFloat(data.targetWeight),
        age: parseInt(data.age),
        activityLevel: data.activityLevel,
      };

      // Create FormData for multipart request
      const formData = new FormData();
      
      // Create a Blob with the correct content type for the JSON part
      const requestBlob = new Blob([JSON.stringify(updateRequest)], {
        type: 'application/json'
      });
      formData.append('request', requestBlob);

      // If there's a profile image file, add it
      if (selectedFile) {
        formData.append('file', selectedFile);
        console.log('[DEBUG_LOG] Adding file to FormData:', selectedFile.name, selectedFile.type, selectedFile.size);
      }

      const updatedMember = await defaultFetch('/api/member', {
        method: 'PUT',
        body: formData,
        headers: {}
      });

      setMemberData(updatedMember);
      setIsEditMode(false);
      setIsNicknameChecked(false);
      setSelectedFile(null); // Clear selected file after successful update

      toast({
        title: "프로필이 수정되었습니다",
        description: "정보가 성공적으로 업데이트되었습니다.",
      });
    } catch (error) {
      console.error('Failed to update member:', error);
      toast({
        title: "수정 실패",
        description: "프로필 수정 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Store the actual File object for upload
      setSelectedFile(file);
      
      // Create preview image
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fetch badges data from API
  const fetchBadges = useCallback(async (page: number = 0) => {
    setBadgesLoading(true);
    try {
      console.log(`[DEBUG_LOG] Fetching badges for page: ${page}`);
      const data: CustomPageResponseDto<BadgeOwnershipDto> = await defaultFetch(`/api/member/my-badges?page=${page}&size=6&sort=createdDate,desc`);
      console.log('[DEBUG_LOG] Badges API response:', data);
      setBadgesData(data);
    } catch (error) {
      console.error('[DEBUG_LOG] Error fetching badges:', error);
      toast({
        title: "오류",
        description: "뱃지 정보를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setBadgesLoading(false);
    }
  }, [toast]);

  // Fetch badges when component mounts or page changes
  useEffect(() => {
    fetchBadges(currentBadgePage - 1); // Convert to 0-based page number
  }, [fetchBadges, currentBadgePage]);

  // Fetch bookmarks data from API
  const fetchBookmarks = useCallback(async (page: number = 0) => {
    setBookmarksLoading(true);
    try {
      console.log(`[DEBUG_LOG] Fetching bookmarks for page: ${page}`);
      const data: CustomPageResponseDto<MyBookmarkListResponseDto> = await defaultFetch(`/api/bookmark/my-bookmarks?page=${page}&size=10&sort=createdDate,desc`);
      console.log('[DEBUG_LOG] Bookmarks API response:', data);
      setBookmarksData(data);
    } catch (error) {
      console.error('[DEBUG_LOG] Error fetching bookmarks:', error);
      toast({
        title: "오류",
        description: "북마크 정보를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setBookmarksLoading(false);
    }
  }, [toast]);

  // Fetch bookmarks when component mounts or page changes
  useEffect(() => {
    fetchBookmarks(currentBookmarkPage - 1); // Convert to 0-based page number
  }, [fetchBookmarks, currentBookmarkPage]);

  // Fetch my boards data from API
  const fetchMyBoards = useCallback(async (page: number = 0) => {
    setPostsLoading(true);
    try {
      console.log(`[DEBUG_LOG] Fetching my boards for page: ${page}`);
      const data: CustomPageResponseDto<MyBoardsResponseDto> = await defaultFetch(`/api/member/my-boards?page=${page}&size=10&sort=createdDate,desc`);
      console.log('[DEBUG_LOG] My boards API response:', data);
      setPostsData(data);
    } catch (error) {
      console.error('[DEBUG_LOG] Error fetching my boards:', error);
      toast({
        title: "오류",
        description: "내 게시글 정보를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setPostsLoading(false);
    }
  }, [toast]);

  // Fetch my boards when component mounts or page changes
  useEffect(() => {
    fetchMyBoards(currentPostPage - 1); // Convert to 0-based page number
  }, [fetchMyBoards, currentPostPage]);

  // Helper function to get icon component for badge
  const getBadgeIcon = (badgeName: string) => {
    // Map badge names to icons - you can customize this mapping based on your badge types
    const iconMap: { [key: string]: any } = {
      '첫 시작': Star,
      '일주일 연속': Trophy,
      '한달 마스터': Crown,
      '팀플레이어': Heart,
      '목표 달성': Target,
      '번개같이': Zap,
      '물 마시기': Star,
      '운동왕': Trophy,
      '영양사': Heart,
      '규칙적': Target,
      '건강지킴이': Crown,
      '마라톤': Zap,
    };
    return iconMap[badgeName] || Award; // Default to Award icon
  };


  // 북마크 페이징 - API 데이터 사용
  const totalBookmarkPages = bookmarksData?.totalPages || 0;
  const currentBookmarks = bookmarksData?.content || [];

  // 내 게시글 페이징 - API 데이터 사용
  const totalPostPages = postsData?.totalPages || 0;
  const currentPosts = postsData?.content || [];

  // 내가 작성한 게시글 데이터
  const userPosts = [
    {
      id: 1,
      title: '다이어트 성공 후기 - 3개월만에 10kg 감량!',
      content: '안녕하세요! 3개월 동안 꾸준히 식단 관리하고 운동한 결과 목표 체중을 달성했어요...',
      category: '다이어트',
      likes: 245,
      views: 1890,
      comments: 89,
      createdDate: '2024-01-20',
      thumbnail: '/public/placeholder.svg'
    },
    {
      id: 2,
      title: '집에서 할 수 있는 간단한 홈트레이닝 루틴',
      content: '헬스장 가기 힘든 분들을 위해 집에서 할 수 있는 운동법을 공유해요...',
      category: '운동',
      likes: 167,
      views: 1234,
      comments: 56,
      createdDate: '2024-01-18',
      thumbnail: null
    },
    {
      id: 3,
      title: '건강한 아침 식단 레시피 모음',
      content: '바쁜 아침에도 쉽게 만들 수 있는 건강한 아침 식사 레시피들을 정리했어요...',
      category: '레시피',
      likes: 198,
      views: 1567,
      comments: 73,
      createdDate: '2024-01-15',
      thumbnail: '/public/placeholder.svg'
    },
    {
      id: 4,
      title: '물 마시기 습관 만들기 - 나만의 비법',
      content: '하루 2L 물 마시기가 어려웠는데 이 방법으로 습관을 만들었어요...',
      category: '건강',
      likes: 134,
      views: 987,
      comments: 42,
      createdDate: '2024-01-12',
      thumbnail: null
    },
    {
      id: 5,
      title: '직장인 도시락 준비 꿀팁',
      content: '매일 점심을 사먹기엔 부담스럽고, 건강도 챙기고 싶어서 시작한 도시락...',
      category: '레시피',
      likes: 289,
      views: 2134,
      comments: 95,
      createdDate: '2024-01-10',
      thumbnail: '/public/placeholder.svg'
    },
    {
      id: 6,
      title: '스트레스 먹기 극복하기',
      content: '스트레스 받으면 자꾸 야식을 찾게 되는데, 이걸 극복한 제 경험을 공유해요...',
      category: '다이어트',
      likes: 156,
      views: 1345,
      comments: 67,
      createdDate: '2024-01-08',
      thumbnail: null
    },
    {
      id: 7,
      title: '겨울철 면역력 강화 음식들',
      content: '요즘 감기가 유행인데, 면역력 강화에 도움되는 음식들을 소개해드려요...',
      category: '건강',
      likes: 178,
      views: 1456,
      comments: 52,
      createdDate: '2024-01-05',
      thumbnail: '/public/placeholder.svg'
    },
    {
      id: 8,
      title: '새해 건강 목표 세우기',
      content: '새해를 맞아 건강한 한 해를 위한 목표를 세워보았어요...',
      category: '건강',
      likes: 203,
      views: 1687,
      comments: 78,
      createdDate: '2024-01-01',
      thumbnail: null
    }
  ];

  // 내가 작성한 댓글 데이터
  const userComments = [
    {
      id: 1,
      postTitle: '다이어트 중 치팅데이 괜찮을까요?',
      comment: '저도 비슷한 고민이 있었는데, 일주일에 한 번 정도는 괜찮다고 생각해요. 다만 과도하지 않게 조절하는 게 중요한 것 같아요!',
      postAuthor: '다이어터123',
      likes: 23,
      createdDate: '2024-01-22',
      postCategory: '다이어트'
    },
    {
      id: 2,
      postTitle: '운동 후 단백질 섭취 타이밍',
      comment: '운동 후 30분 이내에 단백질을 섭취하는 게 가장 효과적이라고 들었어요. 저는 보통 운동 직후 단백질 쉐이크를 마셔요.',
      postAuthor: '헬스마니아',
      likes: 45,
      createdDate: '2024-01-21',
      postCategory: '운동'
    },
    {
      id: 3,
      postTitle: '아침 공복 운동 효과',
      comment: '공복 운동이 지방 연소에 더 효과적이긴 하지만, 체력이 부족하면 무리하지 마세요. 저는 바나나 반 개 정도만 먹고 운동해요.',
      postAuthor: '모닝러너',
      likes: 34,
      createdDate: '2024-01-20',
      postCategory: '운동'
    },
    {
      id: 4,
      postTitle: '건강한 간식 추천해주세요',
      comment: '견과류나 그릭요거트 추천드려요! 포만감도 좋고 영양가도 높아서 다이어트할 때 정말 도움됐어요.',
      postAuthor: '간식러버',
      likes: 18,
      createdDate: '2024-01-19',
      postCategory: '레시피'
    },
    {
      id: 5,
      postTitle: '물 마시기가 어려워요',
      comment: '저도 그랬는데 레몬이나 오이를 넣어서 마시면 훨씬 수월해져요. 향이 있으니까 물이 더 맛있게 느껴져요!',
      postAuthor: '수분부족',
      likes: 67,
      createdDate: '2024-01-18',
      postCategory: '건강'
    },
    {
      id: 6,
      postTitle: '야식 끊는 방법',
      comment: '저는 양치질을 일찍 해버리는 방법을 써요. 양치 후에는 뭔가 먹기 싫어지더라고요. 그리고 따뜻한 차를 마시는 것도 도움돼요.',
      postAuthor: '야식왕',
      likes: 89,
      createdDate: '2024-01-17',
      postCategory: '다이어트'
    },
    {
      id: 7,
      postTitle: '스쿼트 자세 교정',
      comment: '무릎이 발끝을 넘어가지 않게 주의하세요! 그리고 거울을 보면서 자세를 체크하는 게 도움돼요. 처음엔 천천히 하시는 걸 추천해요.',
      postAuthor: '스쿼트초보',
      likes: 52,
      createdDate: '2024-01-16',
      postCategory: '운동'
    },
    {
      id: 8,
      postTitle: '겨울철 비타민D 부족',
      comment: '겨울에는 햇빛을 많이 못 받아서 비타민D가 부족해지기 쉬워요. 영양제로 보충하거나 비타민D가 풍부한 음식을 드세요.',
      postAuthor: '영양사맘',
      likes: 41,
      createdDate: '2024-01-15',
      postCategory: '건강'
    },
    {
      id: 9,
      postTitle: '살찔 때 vs 뺄 때 운동법',
      comment: '근육량을 늘릴 때는 웨이트 트레이닝 위주로, 체중을 줄일 때는 유산소와 웨이트를 병행하는 게 좋다고 생각해요!',
      postAuthor: '운동고수',
      likes: 76,
      createdDate: '2024-01-14',
      postCategory: '운동'
    },
    {
      id: 10,
      postTitle: '식단 일기 쓰는 방법',
      comment: '저는 사진으로 찍어서 기록해요. 나중에 돌아보기도 쉽고, 칼로리 계산할 때도 편해요. 앱 사용하시는 것도 좋을 것 같아요!',
      postAuthor: '식단왕',
      likes: 35,
      createdDate: '2024-01-13',
      postCategory: '다이어트'
    }
  ];


  // 댓글 페이징
  const commentsPerPage = 10;
  const totalCommentPages = Math.ceil(userComments.length / commentsPerPage);
  const startCommentIndex = (currentCommentPage - 1) * commentsPerPage;
  const currentComments = userComments.slice(startCommentIndex, startCommentIndex + commentsPerPage);

  // Show loading state while fetching member data
  if (isLoading) {
    return (
        <div className="min-h-screen bg-background">
          <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">마이페이지</h1>
              <p className="text-muted-foreground">내 정보를 관리하고 활동을 확인해보세요</p>
            </div>
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">회원 정보를 불러오는 중...</p>
              </div>
            </div>
          </div>
        </div>
    );
  }

  // Show error state if member data failed to load
  if (!memberData) {
    return (
        <div className="min-h-screen bg-background">
          <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">마이페이지</h1>
              <p className="text-muted-foreground">내 정보를 관리하고 활동을 확인해보세요</p>
            </div>
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">회원 정보를 불러올 수 없습니다.</p>
                <Button onClick={fetchMemberData}>다시 시도</Button>
              </div>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">마이페이지</h1>
            <p className="text-muted-foreground">내 정보를 관리하고 활동을 확인해보세요</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
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
              <TabsTrigger value="posts" className="flex items-center gap-2">
                <FileText size={16} />
                <span className="hidden sm:inline">내 게시글</span>
                <span className="sm:hidden">게시글</span>
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
                        <AvatarFallback>-</AvatarFallback>
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
                                    <FormControl>
                                      <Input
                                          placeholder="닉네임을 입력하세요"
                                          {...field}
                                          disabled={isLoading}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                    {nicknameValidation.isChecking && (
                                        <p className="text-sm text-muted-foreground">
                                          닉네임 확인 중...
                                        </p>
                                    )}
                                    {nicknameValidation.isValid === true && (
                                        <p className="text-sm text-green-600 flex items-center gap-1">
                                          <Check size={14} />
                                          {nicknameValidation.message}
                                        </p>
                                    )}
                                    {nicknameValidation.isValid === false && (
                                        <p className="text-sm text-red-600">
                                          {nicknameValidation.message}
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
                                  setSelectedFile(null); // Clear selected file when cancelling
                                }}
                                className="flex-1"
                            >
                              취소
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={isSubmitting || (currentNickname !== memberData?.nickname && !isNicknameChecked)}
                            >
                              {isSubmitting ? '수정 중...' : '수정 완료'}
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

                        <div className="space-y-3 mt-6">
                          <Button
                              onClick={() => {
                                setIsEditMode(true);
                                setSelectedFile(null); // Clear selected file when entering edit mode
                              }}
                              className="w-full"
                          >
                            정보수정하기
                          </Button>

                          {/* 로그아웃 및 회원 탈퇴 버튼 */}
                          <div className="flex gap-3">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" className="flex-1 flex items-center gap-2">
                                  <LogOut size={16} />
                                  로그아웃
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>로그아웃 확인</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    정말로 로그아웃하시겠습니까?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>취소</AlertDialogCancel>
                                  <AlertDialogAction onClick={handleLogout}>확인</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="secondary" className="flex-1 flex items-center gap-2">
                                  <UserX size={16} />
                                  회원 탈퇴
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>회원 탈퇴 확인</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    정말로 회원 탈퇴를 진행하시겠습니까?<br />
                                    탈퇴 후에는 모든 데이터가 삭제되며 복구할 수 없습니다.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>취소</AlertDialogCancel>
                                  <AlertDialogAction
                                      onClick={handleDeleteAccount}
                                      className="bg-destructive hover:bg-destructive/90"
                                  >
                                    탈퇴하기
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
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
                    {badgesData ? (
                        `획득한 뱃지: ${badgesData.content.filter(badge => badge.isOwned).length}/${badgesData.totalElements}`
                    ) : (
                        '뱃지 정보를 불러오는 중...'
                    )}
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {badgesLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="text-muted-foreground">뱃지 정보를 불러오는 중...</div>
                      </div>
                  ) : badgesData && badgesData.content.length > 0 ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {badgesData.content.map((badge) => {
                            const IconComponent = getBadgeIcon(badge.name);
                            const acquiredDate = badge.acquiredAt ? new Date(badge.acquiredAt).toLocaleDateString('ko-KR') : null;

                            return (
                                <Card
                                    key={badge.id}
                                    className={`relative transition-all hover:scale-105 hover:shadow-lg ${
                                        badge.isOwned
                                            ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20'
                                            : 'bg-muted/30 opacity-60'
                                    }`}
                                >
                                  <CardContent className="p-4 text-center">
                                    <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center transition-all ${
                                        badge.isOwned
                                            ? 'bg-primary text-primary-foreground shadow-lg'
                                            : 'bg-muted text-muted-foreground'
                                    }`}>
                                      {badge.badgeImage ? (
                                          <img
                                              src={badge.badgeImage}
                                              alt={badge.name}
                                              className="w-8 h-8 object-contain"
                                          />
                                      ) : (
                                          <IconComponent size={24} />
                                      )}
                                    </div>
                                    <h3 className="font-semibold mb-1">{badge.name}</h3>
                                    <p className="text-sm text-muted-foreground mb-2">{badge.description}</p>
                                    {badge.isOwned ? (
                                        <Badge variant="default" className="text-xs">
                                          {acquiredDate} 획득
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
                        {badgesData.totalPages > 0 && (
                            <Pagination>
                              <PaginationContent>
                                <PaginationItem>
                                  <PaginationPrevious
                                      onClick={() => setCurrentBadgePage(Math.max(1, currentBadgePage - 1))}
                                      className={currentBadgePage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                  />
                                </PaginationItem>
                                {Array.from({ length: badgesData.totalPages }, (_, i) => i + 1).map((page) => (
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
                                      onClick={() => setCurrentBadgePage(Math.min(badgesData.totalPages, currentBadgePage + 1))}
                                      className={currentBadgePage === badgesData.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                  />
                                </PaginationItem>
                              </PaginationContent>
                            </Pagination>
                        )}
                      </>
                  ) : (
                      <div className="flex justify-center items-center py-8">
                        <div className="text-muted-foreground">뱃지가 없습니다.</div>
                      </div>
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
                    총 {bookmarksData?.totalElements || 0}개의 게시글을 북마크했어요
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {bookmarksLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="text-muted-foreground">북마크를 불러오는 중...</div>
                      </div>
                  ) : currentBookmarks.length > 0 ? (
                      <>
                        <div className="space-y-4">
                          {currentBookmarks.map((post) => (
                              <Card key={post.bookmarkId} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/community')}>
                                <CardContent className="p-4">
                                  <div className="flex gap-4">
                                    <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0">
                                      <img
                                          src="/public/placeholder.svg"
                                          alt={post.boardTitle}
                                          className="w-full h-full object-cover rounded-lg"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-medium line-clamp-1">{post.boardTitle}</h3>
                                        <Badge variant="secondary" className="text-xs">{post.boardType}</Badge>
                                      </div>
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                        <span>{post.boardAuthorNickname}</span>
                                      </div>
                                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                      <Heart size={12} className="text-red-500" />
                                      {post.likeCount.toLocaleString()}
                                    </span>
                                          <span className="flex items-center gap-1">
                                      <Eye size={12} className="text-blue-500" />
                                            {post.viewCount.toLocaleString()}
                                    </span>
                                          <span className="flex items-center gap-1">
                                      <MessageCircle size={12} className="text-green-500" />
                                            {post.commentCount}
                                    </span>
                                        </div>
                                        <span>{new Date(post.bookmarkedAt).toLocaleDateString()} 저장</span>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                          ))}
                        </div>

                        {/* 북마크 페이징 */}
                        {totalBookmarkPages > 0 && (
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
                      </>
                  ) : (
                      <div className="flex justify-center items-center py-8">
                        <div className="text-muted-foreground">북마크한 게시글이 없습니다.</div>
                      </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 내가 작성한 게시글 탭 */}
            <TabsContent value="posts">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText size={20} />
                    내가 작성한 게시글
                  </CardTitle>
                  <p className="text-muted-foreground">
                    총 {postsData?.totalElements || 0}개의 게시글을 작성했어요
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {postsLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="text-muted-foreground">게시글을 불러오는 중...</div>
                      </div>
                  ) : currentPosts.length > 0 ? (
                      <div className="space-y-4">
                        {currentPosts.map((post) => (
                            <Card key={post.boardId} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/community')}>
                              <CardContent className="p-4">
                                <div className="flex gap-4">
                                  <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                                    <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
                                      <FileText size={20} className="text-muted-foreground" />
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-2">
                                      <h3 className="font-medium line-clamp-1 text-foreground">{post.boardTitle}</h3>
                                      <Badge variant="secondary" className="text-xs ml-2 flex-shrink-0">{post.boardType}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.boardContent}</p>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                      <div className="flex items-center gap-4">
                                  <span className="flex items-center gap-1">
                                    <Heart size={12} className="text-red-500" />
                                    {post.likeCount.toLocaleString()}
                                  </span>
                                        <span className="flex items-center gap-1">
                                    <Eye size={12} className="text-blue-500" />
                                          {post.viewCount.toLocaleString()}
                                  </span>
                                        <span className="flex items-center gap-1">
                                    <MessageCircle size={12} className="text-green-500" />
                                          {post.commentCount}
                                  </span>
                                      </div>
                                      <span>{new Date(post.createdDate).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                        ))}
                      </div>
                  ) : (
                      <div className="text-center py-12">
                        <FileText size={48} className="mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium text-foreground mb-2">작성한 게시글이 없습니다</h3>
                        <p className="text-muted-foreground">커뮤니티에서 첫 게시글을 작성해보세요!</p>
                      </div>
                  )}

                  {/* 게시글 페이징 */}
                  {totalPostPages > 0 && (
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                                onClick={() => setCurrentPostPage(Math.max(1, currentPostPage - 1))}
                                className={currentPostPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                          {Array.from({ length: totalPostPages }, (_, i) => i + 1).map((page) => (
                              <PaginationItem key={page}>
                                <PaginationLink
                                    onClick={() => setCurrentPostPage(page)}
                                    isActive={page === currentPostPage}
                                    className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                                onClick={() => setCurrentPostPage(Math.min(totalPostPages, currentPostPage + 1))}
                                className={currentPostPage === totalPostPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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