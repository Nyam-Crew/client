import axios from 'axios';

// 피드 API를 위한 axios 인스턴스
const apiClient = axios.create({
    baseURL: '/api/teams/activity-feed', // TeamActivityFeedController의 기본 경로
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});

// --- 타입 정의 (Java DTO를 TypeScript로 변환) ---
export type ActivityType = 'WATER' | 'MEAL' | 'WEIGHT' | 'CHALLENGE' | 'NOTICE';
export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'; // 실제 Enum 값에 맞춰주세요

export interface TeamActivityFeedItem {
    feedId: string;
    teamId: number;
    memberId: number;
    nickname: string;
    profileImageUrl: string;
    activityType: ActivityType;
    activityMessage: string; // 백엔드에서 완성된 메시지
    feedCreatedDate: string; // LocalDateTime -> string
    isModified: boolean;
    // 타입별 확장 필드 (필요 시 상세 보기에서 사용 가능)
    amountMl?: number;
    mealPeriod?: MealType;
    kcal?: number;
    thumbnailUrl?: string;
    weightKg?: number;
    deltaKg?: number;
    challengeName?: string;
}

export interface FeedSlice {
    items: TeamActivityFeedItem[];
    nextCursorEpochMs: number | null;
    hasNext: boolean;
}

/**
 * 팀 활동 피드를 커서 기반으로 조회하는 API 함수
 * GET /api/teams/activity-feed/{teamId}/before
 * @param teamId 조회할 팀의 ID
 * @param cursor 다음 페이지를 위한 커서 (첫 페이지는 null)
 * @param size 한 번에 가져올 개수
 * @returns FeedSlice Promise
 */
export const getTeamFeed = async (
    teamId: number,
    cursor: number | null,
    size: number = 20 // 기본 20개씩 로드
): Promise<FeedSlice> => {
    // GET 요청을 /api/teams/activity-feed/{teamId}/before 로 보냅니다.
    // cursor가 null이나 undefined가 아닐 경우에만 쿼리 파라미터로 추가합니다.
    const params = new URLSearchParams({ size: String(size) });
    if (cursor) {
        params.append('cursor', String(cursor));
    }

    const { data } = await apiClient.get<FeedSlice>(`/${teamId}/before`, { params });
    return data;
};