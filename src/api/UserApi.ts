import axios from 'axios';

// MemberController의 기본 경로가 /api/member 이므로 baseURL을 설정합니다.
const apiClient = axios.create({
    baseURL: '/api/member',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});

// 백엔드의 MemberIdResponseDto와 필드를 맞춘 인터페이스입니다.
export interface CurrentUserIdDto {
    memberId: number;
}

/**
 * 현재 로그인한 사용자의 ID를 조회하는 API 함수
 * GET /api/member/me/id
 * @returns 현재 사용자 ID 정보가 담긴 Promise
 */
export const getCurrentUserId = async (): Promise<CurrentUserIdDto> => {
    const { data } = await apiClient.get<CurrentUserIdDto>('/me/id');
    return data;
};