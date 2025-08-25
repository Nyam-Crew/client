import axios from 'axios';

// 팀 관련 API를 위한 axios 인스턴스
const apiClient = axios.create({
    baseURL: '/api/teams', // 팀 컨트롤러의 기본 경로
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true, // Spring Security의 @AuthenticationPrincipal 사용을 위해 필수
});

// 백엔드 Enum 타입에 맞춰 프론트엔드 타입 선언
export type ParticipationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'; // 실제 Enum 값에 맞춰 수정 필요
export type TeamRole = 'LEADER' | 'SUB_LEADER' | 'MEMBER';

// 백엔드의 TeamDetailDto.java 와 필드를 1:1로 매핑하는 인터페이스
export interface TeamDetailDto {
    teamId: number;
    teamTitle: string;
    teamDescription: string;
    teamImage: string | null; // null일 수 있으므로 | null 추가
    maxMembers: number;
    currentMemberCount: number;
    createdDate: string;
    status: ParticipationStatus;
    teamRole: TeamRole;
    leaderNickname: string;
    subLeaderNickname: string | null; // null일 수 있으므로 | null 추가
}

/**
 * 그룹 상세 정보를 조회하는 API 함수
 * GET /api/teams/{teamId}
 * @param teamId 조회할 팀의 ID
 * @returns 팀 상세 정보 Promise
 */
export const getTeamDetails = async (teamId: number): Promise<TeamDetailDto> => {
    // GET 요청을 /api/teams/{teamId} 로 보냅니다.
    const { data } = await apiClient.get<TeamDetailDto>(`/${teamId}`);
    return data;
};