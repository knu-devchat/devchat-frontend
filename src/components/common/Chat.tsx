import { useEffect, useRef, useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useRoom } from "@/hooks/useRoom";
import { getCurrentRoom } from "@/services/chatService";

type ChatMessage = {
  id: number | string;
  text: string;
  from: "me" | "remote" | "system";
  username?: string;
  timestamp?: string;
};

type ChatProps = {
  roomUuid?: string; // 방 UUID
};

export function Chat({ roomUuid }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isComposing, setIsComposing] = useState(false); // IME 조합 상태 추가
  const listRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const { selectedRoom, setSelectedRoom } = useRoom();

  // 디버깅 로그 추가
  console.log("=== Chat 컴포넌트 렌더링 ===");
  console.log("🏠 selectedRoom:", selectedRoom?.room_name);
  console.log("🆔 room_uuid:", selectedRoom?.room_uuid);

  useEffect(() => {
    const fetchCurrentRoom = async () => {
      try {
        console.log("🔍 현재 방 정보 조회 시작...");
        const currentRoomData = await getCurrentRoom();
        console.log("📋 현재 방 응답:", currentRoomData);

        if (currentRoomData.result === 'success' && currentRoomData.room) {
          console.log("✅ 방 정보 설정:", currentRoomData.room);
          setSelectedRoom(currentRoomData.room);
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
  }, [selectedRoom, setSelectedRoom]);

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

    // WebSocket onmessage 부분만 수정
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📨 WebSocket 메시지 수신:", data);
        console.log("🔍 is_self 값:", data.is_self);
        console.log("🔍 message_id:", data.message_id);

        if (data.type === 'chat_message') {
          const newMessage: ChatMessage = {
            id: data.message_id || `${Date.now()}-${Math.random()}`,
            text: data.message,
            from: data.is_self ? "me" : "remote",
            username: data.username,
            timestamp: data.timestamp,
          };

          console.log("📝 새 메시지 생성:", newMessage);
          console.log("📋 현재 메시지 목록 길이:", messages.length);

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
            return updatedMessages;
          });

        } else if (data.type === 'user_joined') {
          const joinMessage: ChatMessage = {
            id: `join-${Date.now()}-${Math.random()}`,
            text: `${data.username}님이 입장했습니다.`,
            from: "system",
          };

          console.log("👋 사용자 입장:", joinMessage);
          setMessages((prev) => [...prev, joinMessage]);

        } else if (data.type === 'user_left') {
          const leaveMessage: ChatMessage = {
            id: `leave-${Date.now()}-${Math.random()}`,
            text: `${data.username}님이 퇴장했습니다.`,
            from: "system",
          };

          console.log("👋 사용자 퇴장:", leaveMessage);
          setMessages((prev) => [...prev, leaveMessage]);
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
  }, [selectedRoom?.room_uuid]); // dependency를 room_uuid로만 제한

  // 방 변경 시 WebSocket 재연결
  useEffect(() => {
    console.log("🔄 방 변경 감지");

    if (selectedRoom?.room_uuid) {
      console.log("📞 WebSocket 연결 함수 호출");
      connectWebSocket();
      setMessages([]); // 새 방 입장 시 메시지 초기화
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
  }, [selectedRoom?.room_uuid]); // connectWebSocket 제거

  // 1) WebSocket 연결 관리
  useEffect(() => {
    // 방 정보가 없으면 연결 안 함
    if (!roomUuid) {
      setMessages([
        {
          id: Date.now(),
          text: "방이 선택되지 않았습니다.",
          from: "system",
        },
      ]);
      return;
    }

    let mounted = true;

    const wsUrl = `ws://localhost:8000/ws/chat/${roomUuid}/`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.addEventListener("open", () => {
      if (!mounted) return;
      setMessages((m) => [
        ...m,
        { id: Date.now(), text: "서버에 연결되었습니다.", from: "system" },
      ]);
    });

    ws.addEventListener("message", (ev) => {
      if (!mounted) return;
      try {
        const data = JSON.parse(ev.data);
        const text =
          typeof data === "string" ? data : data.text ?? JSON.stringify(data);
        setMessages((m) => [
          ...m,
          { id: Date.now(), text, from: "remote" },
        ]);
      } catch {
        setMessages((m) => [
          ...m,
          { id: Date.now(), text: ev.data, from: "remote" },
        ]);
      }
    });

    ws.addEventListener("close", () => {
      if (!mounted) return;
      setMessages((m) => [
        ...m,
        { id: Date.now(), text: "연결이 닫혔습니다.", from: "system" },
      ]);
    });

    ws.addEventListener("error", () => {
      if (!mounted) return;
      setMessages((m) => [
        ...m,
        {
          id: Date.now(),
          text: "웹소켓 에러가 발생했습니다.",
          from: "system",
        },
      ]);
    });

    return () => {
      mounted = false;
      try {
        ws.close();
      } catch {
        /* ignore */
      }
    };
  }, [roomUuid]);

  // 2) 자동 스크롤
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
      setTimeout(() => {
        doScroll();
        try {
          bottomRef.current?.scrollIntoView({ block: "end", behavior: "auto" });
        } catch {
          void 0;
        }
      }, 200);
    });
  }, [messages]);

  const send = async () => {
    if (!text.trim()) return;

    const userText = text.trim();

    // 내 메시지는 바로 UI에 반영
    setMessages((m) => [
      ...m,
      { id: Date.now(), text: userText, from: "me" },
    ]);
    setText("");

    // 여기부터는 서버 통신 (예시: /api/chat)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userText }),
      });

      if (!res.ok) {
        throw new Error("server error");
      }

      const data = await res.json();
      const replyText =
        typeof data === "string"
          ? data
          : data.text ?? JSON.stringify(data);

      setMessages((m) => [
        ...m,
        { id: Date.now(), text: replyText, from: "remote" },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((m) => [
        ...m,
        {
          id: Date.now(),
          text: "서버와 통신 중 오류가 발생했습니다.",
          from: "system",
        },
      ]);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 relative">
      {/* 연결 상태 표시 */}
      <div className="px-4 py-2 text-sm text-muted-foreground border-b">
        {selectedRoom.room_name} • {isConnected ? "🟢 연결됨" : "🔴 연결 안됨"}
        <div className="text-xs">UUID: {selectedRoom.room_uuid}</div>
      </div>

      {/* 메시지 목록 */}
      <div
        ref={listRef}
        className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2 bg-surface rounded-md pb-28"
      >
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            {selectedRoom.room_name}에 오신 것을 환영합니다!<br />
            첫 메시지를 보내보세요.
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id}>
            {m.from === "system" ? (
              <div className="text-sm text-muted-foreground text-center py-2">
                {m.text}
              </div>
            ) : (
              <div
                className={`max-w-[80%] wrap-break-word px-3 py-2 rounded-lg ${m.from === "me"
                  ? "ml-auto bg-primary/10"
                  : "mr-auto bg-muted/20"
                  }`}
              >
                {m.from === "remote" && m.username && (
                  <div className="text-xs text-muted-foreground mb-1">
                    {m.username}
                  </div>
                )}
                <div>{m.text}</div>
                {m.timestamp && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(m.timestamp).toLocaleTimeString()}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
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
                void send();
              }
            }}
            placeholder={
              isConnected
                ? "메시지를 입력하세요 (Enter: 전송, Shift+Enter: 줄바꿈)"
                : "연결 중..."
            }
            className="h-24"
            disabled={!isConnected}
          />
        </div>
      </div>
    </div>
  );
}

export default Chat;