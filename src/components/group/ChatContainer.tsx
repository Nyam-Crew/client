import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface Message {
  messageId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

interface ChatContainerProps {
  roomId: string;
  currentUserId: string;
}

// 더미 데이터 생성 (50개 메시지)
const generateDummyMessages = (): Message[] => {
  const users = [
    { id: 'user1', name: '김운동' },
    { id: 'user2', name: '박헬스' },
    { id: 'user3', name: '이요가' },
    { id: 'current', name: '나' }
  ];

  const messages: Message[] = [];
  const now = new Date();

  for (let i = 0; i < 50; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const messageTime = new Date(now.getTime() - (50 - i) * 5 * 60 * 1000); // 5분 간격
    
    const contents = [
      '오늘 운동 완료했습니다!',
      '내일 아침 조깅 같이 하실 분?',
      '벌써 일주일째 꾸준히 하고 있어요 💪',
      '힘들지만 재미있네요',
      '운동 후 기분이 정말 좋아요',
      '오늘은 30분 걸었습니다',
      '헬스장에서 만나요',
      '스트레칭도 중요해요',
      '물 많이 드세요!',
      '오늘도 화이팅!'
    ];

    messages.push({
      messageId: `msg${i + 1}`,
      senderId: user.id,
      senderName: user.name,
      content: contents[Math.floor(Math.random() * contents.length)],
      createdAt: messageTime.toISOString()
    });
  }

  return messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
};

const ChatContainer = ({ roomId, currentUserId }: ChatContainerProps) => {
  const [allMessages] = useState<Message[]>(generateDummyMessages());
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
  const [showAllButton, setShowAllButton] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 더미 API 함수들
  const fetchRecent20 = async (roomId: string): Promise<Message[]> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const recent = allMessages.slice(-20);
        resolve(recent);
      }, 300);
    });
  };

  const fetchAll = async (roomId: string): Promise<Message[]> => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(allMessages);
      }, 500);
    });
  };

  const sendMessage = async (roomId: string, text: string): Promise<Message> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const newMessage: Message = {
          messageId: `msg${Date.now()}`,
          senderId: currentUserId,
          senderName: '나',
          content: text,
          createdAt: new Date().toISOString()
        };
        resolve(newMessage);
      }, 200);
    });
  };

  // 초기 로딩
  useEffect(() => {
    const loadInitialMessages = async () => {
      const recent = await fetchRecent20(roomId);
      setDisplayedMessages(recent);
      setShowAllButton(allMessages.length > 20);
    };
    
    loadInitialMessages();
  }, [roomId, allMessages.length]);

  // 스크롤을 하단으로
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [displayedMessages]);

  // 전체 메시지 로딩
  const handleShowAll = async () => {
    const all = await fetchAll(roomId);
    setDisplayedMessages(all);
    setShowAllButton(false);
  };

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const text = inputText.trim();
    setInputText('');

    const newMessage = await sendMessage(roomId, text);
    setDisplayedMessages(prev => [...prev, newMessage]);
  };

  // 키보드 이벤트 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 메시지 그룹핑 로직 (2분 이내 동일 사용자)
  const shouldShowSender = (message: Message, index: number): boolean => {
    if (index === 0) return true;
    
    const prevMessage = displayedMessages[index - 1];
    if (prevMessage.senderId !== message.senderId) return true;
    
    const timeDiff = new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime();
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

  const isMyMessage = (senderId: string) => senderId === currentUserId;

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
                    {message.senderName}
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
                    {formatTime(message.createdAt)}
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