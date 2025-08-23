import {useEffect, useRef, useState} from 'react';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {Send} from 'lucide-react';
import {subscribeToChatRoom} from "@/lib/websocket.ts";
import {defaultFetch} from '@/api/defaultFetch.ts';
import {StompSubscription} from "@stomp/stompjs";

interface ChatMessage {
  messageId: number;
  senderId: number;
  sender: string;
  content: string;
  timestamp?: string;
}

interface ChatContainerProps {
  teamId: string;
  currentUserId: number;
}

interface sendMessage {
  content: string;
}

const ChatContainer = ({ teamId, currentUserId }: ChatContainerProps) => {
  const [displayedMessages, setDisplayedMessages] = useState<ChatMessage[]>([]);
  const [showAllButton, setShowAllButton] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // 구독 처리를 위한 Ref
  const subscriptionRef = useRef<StompSubscription | null>(null);

  // 최근 20개 불러오기,
  const fetchRecent20 = async (teamId: string) => {
    const history : ChatMessage[] = await defaultFetch(`/api/chat/history/${teamId}`)

    return history;
  };

  const fetchAll = async (teamId: string) => {
    const allMessages : ChatMessage[] = await defaultFetch(`/api/chat/history/${teamId}/all`)

    return allMessages;
  };

  // 초기 로딩
  useEffect(() => {
    const init = async () => {
      // 과거 메세지 가져오기
      const history = await fetchRecent20(teamId);
      setDisplayedMessages(history);

      // 과거 메세지가 20개라면, 전체 보기 버튼 표시
      if (Array.isArray(history) && history.length === 20) {
        setShowAllButton(true);
      }

      // 구독과 동시에 구독 정보 Ref에 저장
      subscriptionRef.current = subscribeToChatRoom(teamId, (msg) => {
        setDisplayedMessages((prev) => [...prev, msg]);
        console.log("새로운 메세지 수신");
      });
    }

    init()

    // 채팅 컨테이너 사라질 때는 Ref기반으로 구독 해제 처리하기
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    }
  }, []);

  // 스크롤을 하단으로
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    scrollToBottom();
  }, [displayedMessages]);

  // 전체 메시지 로딩
  const handleShowAll = async () => {
    const all = await fetchAll(teamId);
    setDisplayedMessages(all);
    setShowAllButton(false);
  };

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!inputText.trim() || !teamId) return;

    const text = inputText.trim();

    const message : sendMessage = {
      content: text,
    }

    await defaultFetch(`/api/chat/${teamId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    setInputText('');
  };

  // 키보드 이벤트 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 메시지 그룹핑 로직 (2분 이내 동일 사용자)
  const shouldShowSender = (message: ChatMessage, index: number): boolean => {
    if (index === 0) return true;
    
    const prevMessage = displayedMessages[index - 1];
    if (prevMessage.senderId !== message.senderId) return true;
    
    const timeDiff = new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime();
    return timeDiff > 2 * 60 * 1000; // 2분
  };

  // 시간 포맷팅
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const isMyMessage = (senderId: number) => senderId === currentUserId;

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      {/* 메시지 영역 */}
      <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {/* 전체 채팅 보기 버튼 */}
        {showAllButton && (
          <div className="flex justify-center mb-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleShowAll}
              className="text-xs text-muted-foreground"
            >
              전체 채팅 보기
            </Button>
          </div>
        )}

        {/* 메시지 목록 */}
        {displayedMessages.map((message, index) => {
          const isMine = isMyMessage(message.senderId);
          const showSender = shouldShowSender(message, index);

          return (
            <div key={message.messageId} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                {/* 발신자 이름 (그룹 첫 메시지에만) */}
                {!isMine && showSender && (
                  <div className="text-xs text-muted-foreground mb-1 px-1">
                    {message.sender}
                  </div>
                )}
                
                {/* 말풍선과 시간 */}
                <div className={`flex items-end gap-1 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* 말풍선 */}
                  <div className={`
                    rounded-2xl px-3 py-2 max-w-full word-wrap break-words
                    ${isMine 
                      ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' 
                      : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                  
                  {/* 시간 */}
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="border-t bg-background p-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              placeholder="메시지를 입력하세요..."
              className="min-h-[44px] max-h-[132px] resize-none"
              rows={1}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            size="sm"
            className="h-[44px] px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Enter: 전송 | Shift + Enter: 줄바꿈
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;