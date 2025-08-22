
/**
 * 백엔드 API 요청을 보낼 때 사용하는 기본 fetch 함수입니다.
 *
 * @param url 요청할 경로 (ex: "/api/chat")
 * @param options fetch 옵션 (headers, method 등)
 * @returns JSON 응답 객체
 * @throws Error 요청 실패 시 예외 발생
 */
export const defaultFetch = async (url: string, options: RequestInit = {}) => {
  console.log("[defaultFetch] : 패치 실행")

  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };

  console.log("[defaultFetch] : 헤더 설정 완료")

  const response = await fetch("http://" + import.meta.env.BACKEND_ADDRESS + url, {
    // 쿠키 포함
    credentials: 'include',
    ...options,
    headers
  });

  console.log("[defaultFetch] : 요청 완료");

  // 200이나 204코드 응답이 아니라면, 에러 반환
  if (response.status !== 200 && response.status !== 204) {
    // 에러 핸들링 예: 401 Unauthorized
    console.error(`[Default Fetch] : 에러 발생 ${response.status}: ${response.statusText}`);
    throw new Error("요청 실패");
  }


  // 204는 NO_CONTENT 이므로 return하지 않음
  if (response.status !== 204)
    return response.json();
};