import {Client} from "@stomp/stompjs";
import {onNotify} from "./notificationProvider.tsx";
import {defaultFetch} from "@/api/defaultFetch.ts";

export const stompClient = new Client({
  webSocketFactory: () =>
      new WebSocket("ws://" + import.meta.env.VITE_BACKEND_ADDRESS + "/ws"), // 순수 WebSocket 사용
  debug: (str) => console.log(str),
  reconnectDelay: 1000000,
  onConnect: () => {
    console.log("웹소켓 연결 완료!");
  },
});

export const activateStompClient = () => {
  return new Promise<void>((resolve, reject) => {

    stompClient.configure({

      onConnect: () => {
        console.log("웹소켓 연결 완료!");
        resolve();
      },

      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
        reject(new Error(frame.headers["message"]));
      },
    });

    if (!stompClient.active) {
      stompClient.activate();
    }
  });
};

// 채팅방 구독하기
export const subscribeToChatRoom = (teamId: string, onMessageReceived: (message: any) => void) => {
  return stompClient.subscribe(`/topic/chat/${teamId}`, (message) =>
  {
    console.log('Broadcast 채널로 메세지 수신 : ', message.body);
    onMessageReceived(JSON.parse(message.body));
  });
};


// 처음 연결되며 함께 수행됩니다. 기본 채널을 구독하고, 팀 채널에도 구독을 날림
export const subscribeNotification = async () => {
  // '/user/queue/notification' 경로를 구독합니다.
  // 이 경로는 보통 특정 사용자에게만 보내는 알림을 위해 사용됩니다.
  stompClient.subscribe(`/user/queue/notification`, (message) => {
    // 알림 메시지를 받으면 콘솔에 로그를 남깁니다.
    console.log('개인 채널로 알림 수신 : ', message.body);

    // 수신된 메시지를 사용하여 토스트 알림을 띄웁니다.
    // message.body에 실제 알림 내용이 담겨 있습니다.
    onNotify(JSON.parse(message.body));
  });

  console.log("기본 알림채널 구독 완료")

  stompClient.subscribe(`/topic/notification`, (message) => {
    onNotify(JSON.parse(message.body));
  })
  console.log("전체 알람 구독 완료")
  // 브로드캐스트 알림 채널을 구독합니다.

  const response = await defaultFetch("/api/teams/getlist");

  // 팀의 토픽에 해당되는 채널들을 구독합니다
  for (const team of response.teamList) {
    stompClient.subscribe(`/topic/team/` + team, (message) => {
      console.log('팀 채널로 알림 수신 : ', message.body);
      onNotify(JSON.parse(message.body));
    })
    console.log(team + "번 팀 메세지 구독 완료")
  }
}