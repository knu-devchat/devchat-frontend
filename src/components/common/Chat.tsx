import { useEffect, useRef, useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useRoom } from "@/hooks/useRoom";
import { getCurrentRoom, fetchChatMessages } from "@/services/chatService";

type ChatMessage = {
  id: number | string;
  text: string;
  from: "me" | "remote" | "system";
  username?: string;
  timestamp?: string;
};

interface ChatProps {
  // 🔥 마지막 메시지 정보를 상위로 전달하는 콜백 추가
  onLastMessageChange?: (roomUuid: string, lastMessage: ChatMessage | null) => void;
}

export function Chat({ onLastMessageChange }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [animatingMessages, setAnimatingMessages] = useState<Set<string | number>>(new Set());
  const listRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const { selectedRoom, setSelectedRoom } = useRoom();

  // 🎨 새 메시지 애니메이션 트리거
  const triggerMessageAnimation = useCallback((messageId: string | number) => {
    setAnimatingMessages(prev => new Set(prev).add(messageId));

    // 애니메이션 완료 후 상태 정리 (테일윈드 애니메이션 시간에 맞춰 조정)
    setTimeout(() => {
      setAnimatingMessages(prev => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    }, 300); // 테일윈드 duration-300에 맞춤
  }, []);

  // 🔥 마지막 메시지 정보를 상위로 전달하는 함수
  const updateLastMessage = useCallback((newMessages: ChatMessage[]) => {
    if (!selectedRoom?.room_uuid || !onLastMessageChange) return;

    // system 메시지를 제외한 실제 채팅 메시지 중 가장 최근 것 찾기
    const chatMessages = newMessages.filter(msg => msg.from !== "system");
    const lastMessage = chatMessages.length > 0 ? chatMessages[chatMessages.length - 1] : null;

    console.log("🔥 마지막 메시지 업데이트:", {
      roomUuid: selectedRoom.room_uuid,
      lastMessage: lastMessage
    });

    onLastMessageChange(selectedRoom.room_uuid, lastMessage);
  }, [selectedRoom?.room_uuid, onLastMessageChange]);

  // 🔥 messages 상태가 변경될 때마다 마지막 메시지 정보 업데이트
  useEffect(() => {
    if (messages.length > 0) {
      updateLastMessage(messages);
    }
  }, [messages, updateLastMessage]);

  // 디버깅 로그 추가
  console.log("=== Chat 컴포넌트 렌더링 ===");
  console.log("🏠 selectedRoom:", selectedRoom?.room_name);
  console.log("🆔 room_uuid:", selectedRoom?.room_uuid);

  // 채팅 메시지 히스토리 로딩
  const loadChatMessages = useCallback(async (roomUuid: string) => {
    try {
      setIsLoadingMessages(true);
      console.log(`📚 채팅 메시지 히스토리 로딩 시작: ${roomUuid}`);

      const messageData = await fetchChatMessages(roomUuid);

      if (messageData.result === 'success' && messageData.messages) {
        // 백엔드 메시지를 프론트엔드 형식으로 변환
        const formattedMessages: ChatMessage[] = messageData.messages.map((msg: any) => ({
          id: msg.id,
          text: msg.content,
          from: msg.is_self ? "me" : "remote",
          username: msg.sender_username,
          timestamp: msg.created_at,
        }));

        console.log(`✅ 채팅 메시지 ${formattedMessages.length}개 로딩 완료`);
        setMessages(formattedMessages);
        // 🎨 히스토리 로드 시 애니메이션 상태 초기화
        setAnimatingMessages(new Set());

        // 🔥 여기서 updateLastMessage 호출 제거 (useEffect에서 처리)
      } else {
        console.log("ℹ️ 로딩할 메시지가 없음");
        setMessages([]);
        // 🔥 빈 배열일 때도 updateLastMessage 호출 제거 (useEffect에서 처리)
      }
    } catch (error) {
      console.error("❌ 채팅 메시지 로딩 실패:", error);
      setMessages([]);
      // 🔥 에러 시에도 updateLastMessage 호출 제거 (useEffect에서 처리)
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    const fetchCurrentRoom = async () => {
      try {
        console.log("🔍 현재 방 정보 조회 시작...");
        const currentRoomData = await getCurrentRoom();
        console.log("📋 현재 방 응답:", currentRoomData);

        if (currentRoomData.result === 'success' && currentRoomData.room) {
          console.log("✅ 방 정보 설정:", currentRoomData.room);
          setSelectedRoom(currentRoomData.room);

          // 방 정보 설정 후 채팅 메시지 로딩
          await loadChatMessages(currentRoomData.room.room_uuid);
        } else {
          console.log("ℹ️ 선택된 방 없음");
        }
      } catch (error) {
        console.log("ℹ️ 현재 방 조회 실패 (선택된 방 없음):", error);
      }
    };

    // selectedRoom이 없을 때만 서버에서 가져오기
    if (!selectedRoom) {
      fetchCurrentRoom();
    }
  }, [selectedRoom, setSelectedRoom, loadChatMessages]);

  // 방 변경 시 채팅 메시지 로딩
  useEffect(() => {
    if (selectedRoom?.room_uuid) {
      console.log("🔄 방 변경으로 인한 메시지 로딩:", selectedRoom.room_name);
      loadChatMessages(selectedRoom.room_uuid);
    }
  }, [selectedRoom?.room_uuid, loadChatMessages]);


  // WebSocket 연결 설정 - dependency 최소화
  const connectWebSocket = useCallback(() => {
    const roomUuid = selectedRoom?.room_uuid;

    if (!roomUuid) {
      console.warn("⚠️ room_uuid가 없어서 WebSocket 연결 안함");
      return;
    }

    console.log(`🔌 WebSocket 연결 시작: ${roomUuid}`);

    // 기존 연결 완전히 정리
    if (wsRef.current) {
      console.log("🧹 기존 WebSocket 연결 정리");
      wsRef.current.close();
      wsRef.current = null;
    }

    const wsUrl = `ws://localhost:8000/ws/chat/${roomUuid}/`;
    console.log("🔗 WebSocket URL:", wsUrl);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`✅ WebSocket 연결 성공: ${roomUuid}`);
      setIsConnected(true);
    };

    // WebSocket onmessage 부분
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📨 WebSocket 메시지 수신:", data);

        if (data.type === 'chat_message') {
          const newMessage: ChatMessage = {
            id: data.message_id || `${Date.now()}-${Math.random()}`,
            text: data.message,
            from: data.is_self ? "me" : "remote",
            username: data.username,
            timestamp: data.timestamp,
          };

          console.log("📝 새 메시지 생성:", newMessage);

          setMessages((prev) => {
            console.log("🔄 setMessages 호출 - 이전 메시지 수:", prev.length);

            // 중복 메시지 체크 (같은 ID가 이미 있는지 확인)
            const existingMessage = prev.find(msg => msg.id === newMessage.id);
            if (existingMessage) {
              console.log("⚠️ 중복 메시지 무시:", {
                newId: newMessage.id,
                existingMessage: existingMessage
              });
              return prev;
            }

            const updatedMessages = [...prev, newMessage];
            console.log("✅ 메시지 추가 완료 - 새 메시지 수:", updatedMessages.length);

            // 🎨 새 메시지 애니메이션 트리거
            triggerMessageAnimation(newMessage.id);

            // 🔥 여기서 updateLastMessage 호출 제거 (useEffect에서 처리)

            return updatedMessages;
          });

        } else if (data.type === 'message_history') {
          // WebSocket으로 메시지 히스토리 수신 (백엔드에서 자동 전송하는 경우)
          console.log("📚 WebSocket으로 메시지 히스토리 수신:", data);

          if (data.messages && Array.isArray(data.messages)) {
            const formattedMessages: ChatMessage[] = data.messages.map((msg: any) => ({
              id: msg.id || msg.message_id,
              text: msg.content || msg.message,
              from: msg.is_self ? "me" : "remote",
              username: msg.sender_username || msg.username,
              timestamp: msg.created_at || msg.timestamp,
            }));

            console.log(`📚 WebSocket 히스토리 메시지 ${formattedMessages.length}개 설정`);
            setMessages(formattedMessages);

            // 🔥 여기서 updateLastMessage 호출 제거 (useEffect에서 처리)
          }

        } else if (data.type === 'user_joined') {
          const joinMessage: ChatMessage = {
            id: `join-${Date.now()}-${Math.random()}`,
            text: `${data.username}님이 입장했습니다.`,
            from: "system",
          };

          console.log("👋 사용자 입장:", joinMessage);
          setMessages((prev) => {
            const updatedMessages = [...prev, joinMessage];
            // 🎨 입장 메시지 애니메이션 트리거
            triggerMessageAnimation(joinMessage.id);
            // 🔥 system 메시지는 마지막 메시지로 카운트하지 않음 (useEffect에서 자동 필터링)
            return updatedMessages;
          });

        } else if (data.type === 'user_left') {
          const leaveMessage: ChatMessage = {
            id: `leave-${Date.now()}-${Math.random()}`,
            text: `${data.username}님이 퇴장했습니다.`,
            from: "system",
          };

          console.log("👋 사용자 퇴장:", leaveMessage);
          setMessages((prev) => {
            const updatedMessages = [...prev, leaveMessage];
            // 🎨 퇴장 메시지 애니메이션 트리거
            triggerMessageAnimation(leaveMessage.id);
            // 🔥 system 메시지는 마지막 메시지로 카운트하지 않음 (useEffect에서 자동 필터링)
            return updatedMessages;
          });
        }
      } catch (error) {
        console.error("❌ WebSocket 메시지 파싱 오류:", error);
      }
    };

    ws.onclose = (event) => {
      console.log(`🔌 WebSocket 연결 종료: ${roomUuid}`, {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      });
      setIsConnected(false);

      // 참조 정리
      if (wsRef.current === ws) {
        wsRef.current = null;
      }
    };

    ws.onerror = (error) => {
      console.error(`❌ WebSocket 오류: ${roomUuid}`, error);
      setIsConnected(false);
    };

    return ws;
  }, [selectedRoom?.room_uuid]);

  // 방 변경 시 WebSocket 재연결
  useEffect(() => {
    console.log("🔄 방 변경 감지 - WebSocket");

    if (selectedRoom?.room_uuid) {
      console.log("📞 WebSocket 연결 함수 호출");
      connectWebSocket();
      setMessages([]); // 새 방 입장 시 메시지 초기화
      setAnimatingMessages(new Set()); // 🎨 애니메이션 상태도 초기화
    } else {
      console.log("⏳ room_uuid 없음, WebSocket 연결 안함");
      // WebSocket 정리
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setIsConnected(false);
    }

    return () => {
      console.log("🧹 useEffect cleanup - WebSocket 정리");
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [selectedRoom?.room_uuid, connectWebSocket]);

  // 메시지 추가될 때 자동 스크롤
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const doScroll = () => {
      try {
        const max = el.scrollHeight - el.clientHeight;
        el.scrollTop = max >= 0 ? max : 0;
        el.scrollTo?.({ top: el.scrollHeight, behavior: "auto" });
      } catch (err) {
        console.error("스크롤 오류:", err);
      }
    };

    requestAnimationFrame(() => {
      doScroll();
      try {
        bottomRef.current?.scrollIntoView({ block: "end", behavior: "auto" });
      } catch {
        void 0;
      }
      setTimeout(() => {
        doScroll();
        try {
          bottomRef.current?.scrollIntoView({ block: "end", behavior: "auto" });
        } catch {
          void 0;
        }
      }, 50);
    });
  }, [messages]);

  const send = async () => {
    // IME 조합 중이면 전송하지 않음
    if (isComposing) {
      console.log("⏸️ IME 조합 중 - 전송 차단");
      return;
    }

    if (!text.trim()) {
      console.warn("⚠️ 빈 메시지는 전송할 수 없음");
      return;
    }

    if (!isConnected || !wsRef.current) {
      console.warn("⚠️ WebSocket 연결되지 않음");
      return;
    }

    const userText = text.trim();
    console.log("💬 메시지 전송 시도:", userText);

    try {
      // WebSocket으로 메시지 전송
      wsRef.current.send(JSON.stringify({
        type: 'chat_message',
        message: userText,
      }));
      console.log("📤 메시지 전송 완료");
      setText(""); // 전송 후 입력창 초기화
    } catch (error) {
      console.error("❌ 메시지 전송 오류:", error);

      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        text: "메시지 전송 중 오류가 발생했습니다.",
        from: "system",
      };

      setMessages((m) => [...m, errorMessage]);
    }
  };

  // 방이 선택되지 않은 경우
  if (!selectedRoom) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <div>채팅할 방을 선택해주세요</div>
          <div className="text-sm mt-2">서버에서 방 정보를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 relative">
      {/* 연결 상태 표시 */}
      <div className="px-4 py-2 text-sm text-muted-foreground border-b">
        {selectedRoom.room_name} • {isConnected ? "🟢 연결됨" : "🔴 연결 안됨"}
        {isLoadingMessages && " • 📚 메시지 로딩 중..."}
        <div className="text-xs">UUID: {selectedRoom.room_uuid}</div>
      </div>

      <div
        ref={listRef}
        className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2 bg-surface rounded-md pb-28"
      >
        {isLoadingMessages ? (
          <div className="text-center text-muted-foreground py-8">
            <div>📚 채팅 메시지를 불러오는 중...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            {selectedRoom.room_name}에 오신 것을 환영합니다!<br />
            첫 메시지를 보내보세요.
          </div>
        ) : (
          /* ✅ 여기서 messages.map()으로 메시지들을 렌더링 */
          messages.map((message) => {
            const isAnimating = animatingMessages.has(message.id);
            return (
              <div
                key={message.id}
                className={`message-item transition-all duration-300 ease-out ${isAnimating ? 'animate-in slide-in-from-bottom-4 fade-in' : ''
                  }`}
              >
                {message.from === "system" ? (
                  <div className="text-sm text-muted-foreground text-center py-2">
                    {message.text}
                  </div>
                ) : (
                  <div
                    className={`max-w-[80%] wrap-break-word px-3 py-2 rounded-lg ${message.from === "me"
                      ? "ml-auto bg-primary/10"
                      : "mr-auto bg-muted/20"
                      }`}
                  >
                    {message.from === "remote" && message.username && (
                      <div className="text-xs text-muted-foreground mb-1">
                        {message.username}
                      </div>
                    )}
                    <div>{message.text}</div>
                    {message.timestamp && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* 메시지 입력창 - IME 이벤트 핸들러 추가 */}
      <div className="sticky bottom-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm py-2">
        <div className="mt-2 flex gap-2 items-end px-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onCompositionStart={() => {
              console.log("🔤 IME 조합 시작");
              setIsComposing(true);
            }}
            onCompositionEnd={() => {
              console.log("✅ IME 조합 완료");
              setIsComposing(false);
            }}
            onKeyDown={(e) => {
              console.log("⌨️ 키 입력:", {
                key: e.key,
                isComposing: isComposing,
                shiftKey: e.shiftKey
              });

              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();

                // IME 조합이 완료된 상태에서만 전송
                if (!isComposing) {
                  console.log("📤 Enter로 메시지 전송");
                  void send();
                } else {
                  console.log("⏸️ IME 조합 중 - Enter 무시");
                }
              }
            }}
            placeholder={
              isConnected
                ? "메시지를 입력하세요"
                : "연결 중..."
            }
            className="h-24"
            disabled={!isConnected || isLoadingMessages}
          />
        </div>
      </div>
    </div>
  );
}

export default Chat;