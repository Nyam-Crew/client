
import axios, { AxiosRequestConfig } from 'axios';
/**
 * 백엔드 API 요청을 보낼 때 사용하는 기본 fetch 함수입니다.
 *
 * @param url 요청할 경로 (ex: "/api/chat")
 * @param options fetch 옵션 (headers, method 등)
 * @returns JSON 응답 객체
 * @throws Error 요청 실패 시 예외 발생
 */
export const defaultFetch = async (url: string, options: RequestInit = {}) => {
  console.log("[defaultFetch] : 패치 실행 (axios 기반)");

  const baseURL = "http://" + import.meta.env.VITE_BACKEND_ADDRESS;
  console.log("요청하는 URL = " + baseURL);

  // fetch 스타일 옵션을 axios에 맞게 매핑
  const {
    method = 'GET',
    headers: reqHeaders = {},
    body,
    signal,
    // 나머지 옵션은 무시(필요 시 확장)
    ...rest
  } = options as RequestInit & Record<string, any>;

  // Content-Type 기본값 + 사용자 지정 헤더 병합
  const headers = {
    "Content-Type": "application/json",
    ...reqHeaders as Record<string, string>
  };

  console.log("[defaultFetch] : 헤더 설정 완료 (axios)");

  const axiosConfig: AxiosRequestConfig = {
    baseURL,
    url,
    method: method as AxiosRequestConfig['method'],
    headers,
    // fetch의 body를 axios의 data로 전달 (이미 JSON.stringify 되어 있으면 그대로 사용)
    data: typeof body === 'string' ? body : body ? JSON.stringify(body) : undefined,
    withCredentials: true, // 쿠키 포함
    // 이전 구현과 동일하게 200/204만 성공으로 간주
    validateStatus: (status) => status === 200 || status === 204,
    signal: signal as AbortSignal | undefined,
    ...rest
  };

  try {
    const response = await axios.request(axiosConfig);
    console.log("[defaultFetch] : 요청 완료 (axios)");

    // 204는 NO_CONTENT
    if (response.status === 204) {
      return;
    }

    // 200인 경우 data 반환 (JSON)
    return response.data;
  } catch (err: any) {
    // 이전 구현과 동일한 에러 메시지 유지
    const status = err?.response?.status;
    const statusText = err?.response?.statusText;
    console.error(`[Default Fetch] : 에러 발생 ${status ?? 'unknown'}: ${statusText ?? err?.message}`);
    throw new Error("요청 실패");
  }
};