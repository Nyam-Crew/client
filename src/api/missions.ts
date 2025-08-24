import { defaultFetch } from "./defaultFetch";

// 미션 데이터 타입을 정의합니다.
export interface Mission {
  dailyMissionId: number;
  missionId: number;
  category: string;
  title: string;
  type: string;
  missionDate: string;
  completed: boolean;
  completedBy: string;
}

/**
 * 오늘의 미션 리스트를 가져오는 API 함수
 * @returns 오늘의 미션 리스트
 */
export const getTodayMissions = async (): Promise<Mission[]> => {
  try {
    const missions = await defaultFetch<Mission[]>("/api/missions/today");
    return missions || []; // 데이터가 없는 경우 빈 배열 반환
  } catch (error) {
    console.error("Error fetching today missions:", error);
    return []; // 에러 발생 시 빈 배열 반환
  }
};

/**
 * 특정 데일리 미션을 완료 처리합니다.
 * @param dailyMissionId - 완료할 미션의 ID
 */
export const completeMission = (dailyMissionId: number): Promise<void> => {
  return defaultFetch(`/api/missions/${dailyMissionId}/complete`, {
    method: 'POST',
    body: { complete: true }, // API 명세에 따라 body 내용 조정 필요
  });
};
