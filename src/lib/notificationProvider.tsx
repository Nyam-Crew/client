import {toast} from "sonner";
import dayjs from "dayjs";

export interface NotifyDto {
  content: string;
  createdAt: string;
  type?: "BROADCAST" | "TEAM" | "CHALLENGE_CLEAR"
}

export const onNotify = (msg: NotifyDto) => {
  const parsedTime = dayjs(msg.createdAt).format("YYYY-MM-DD HH:mm");

  console.log(`알림 출력 대기. 메세지는 "${msg.content}"`);

  const id = `${msg.type ?? "GENERAL"}:${msg.createdAt}:${msg.content}`;

  toast(
      <div>
        <div style={{ fontWeight: 600 }}>{msg.content}</div>
        <div style={{ fontSize: "0.8em", opacity: 0.7 }}>{parsedTime}</div>
      </div>,
      { id, duration: 5000 }
  );
  console.log(`알림 출력 완료.`);
};

// 상황별 프리셋
export const notifySuccess = (text: string) => toast.success(text);
export const notifyError = (text: string) => toast.error(text);
export const notifyInfo = (text: string) => toast.message(text);