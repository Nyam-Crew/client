import axios from 'axios';

// API 요청을 위한 기본 axios 인스턴스 설정
const apiClient = axios.create({
    baseURL: '/api/teams/notices',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});

export type TeamNoticeType = 'FIXED' | 'NORMAL';

// 백엔드 DTO와 프론트엔드 모델 간의 필드명 차이를 매핑합니다.
export interface Notice {
  id: number;
  teamId: number;
  memberId: number;
  title: string;
  content: string;
  type: TeamNoticeType;
  createdAt: string;
  modifiedAt: string;
}



export interface TeamNoticeDto {
  teamNoticeId: number;
  teamId: number;
  memberId: number;
  title: string;
  content: string;
  teamNoticeType: TeamNoticeType;
  createdDate: string;
  modifiedDate: string;
}

const toNotice = (dto: TeamNoticeDto): Notice => ({
  id: dto.teamNoticeId,
  teamId: dto.teamId,
  memberId: dto.memberId,
  title: dto.title,
  content: dto.content,
  type: dto.teamNoticeType,
  createdAt: dto.createdDate,
  modifiedAt: dto.modifiedDate,
});

// === API ===
// GET /api/teams/notices/{teamId}
export const getNoticesByTeam = async (teamId: number): Promise<Notice[]> => {
    const { data } = await apiClient.get<TeamNoticeDto[]>(`/${teamId}`);
    return data.map(toNotice);
};

// POST /api/teams/notices/{teamId}
export const createNotice = async (
    teamId: number,
    noticeData: { title: string; content: string; teamNoticeType: TeamNoticeType }
): Promise<Notice> => {
    const { data } = await apiClient.post<TeamNoticeDto>(`/${teamId}`, noticeData);
    return toNotice(data);
};

// PATCH /api/teams/notices/{teamId}/{noticeId}
export const updateNotice = async (
    teamId: number,
    noticeId: number,
    noticeData: { title?: string; content?: string }
): Promise<Notice> => {
    const { data } = await apiClient.patch<TeamNoticeDto>(`/${teamId}/${noticeId}`, noticeData);
    return toNotice(data);
};

// DELETE /api/teams/notices/{teamId}/{noticeId}
export const deleteNotice = async (teamId: number, noticeId: number): Promise<void> => {
    await apiClient.delete(`/${teamId}/${noticeId}`);
};
