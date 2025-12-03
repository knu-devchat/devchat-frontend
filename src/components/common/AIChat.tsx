import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BotMessageSquare, Send, Loader2 } from 'lucide-react';
import { useRoom } from "@/hooks/useRoom";

interface AIChatProps {
  className?: string;
}

type AIMessage = {
  id: number | string;
  text: string;
  from: "me" | "ai" | "system";
  username?: string;
  timestamp?: string;
};

export function AIChat({ className }: AIChatProps) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [text, setText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const { selectedRoom } = useRoom();

  // AI 세션 목록 조회 및 기존 세션 찾기
  const findExistingSession = useCallback(async () => {
    if (!selectedRoom?.room_uuid) {
      console.warn("⚠️ 선택된 방이 없어 세션을 찾을 수 없음");
      return null;
    }

    try {
      console.log(`[AI_DEBUG] 기존 AI 세션 조회 시도: ${selectedRoom.room_uuid}`);

      const response = await fetch(`http://localhost:8000/api/llm/sessions/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();
      console.log('[AI_DEBUG] AI 세션 목록 응답:', data);

      if (data.result === 'success' && data.sessions) {
        // 현재 방의 AI 세션 찾기
        const existingSession = data.sessions.find((session: any) =>
          session.room_uuid === selectedRoom.room_uuid
        );

        if (existingSession) {
          console.log(`[AI_SUCCESS] 기존 AI 세션 발견: ${existingSession.session_id}`);
          return existingSession.session_id;
        } else {
          console.log('[AI_DEBUG] 기존 AI 세션이 없음');
          return null;
        }
      }

      return null;
    } catch (error) {
      console.error('[AI_ERROR] AI 세션 조회 중 오류:', error);
      return null;
    }
  }, [selectedRoom?.room_uuid]);

  // AI 세션 생성
  const createAISession = useCallback(async () => {
    if (!selectedRoom?.room_uuid) {
      console.warn("⚠️ 선택된 방이 없어 AI 세션을 생성할 수 없음");
      return;
    }

    try {
      setIsCreatingSession(true);
      console.log(`[AI_DEBUG] AI 세션 생성 시도: ${selectedRoom.room_uuid}`);

      const response = await fetch(`http://localhost:8000/api/llm/start_session/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          room_uuid: selectedRoom.room_uuid
        }),
      });

      const data = await response.json();
      console.log('[AI_DEBUG] AI 세션 생성 응답:', data);

      if (data.result === 'success') {
        setSessionId(data.session_id);
        console.log(`[AI_SUCCESS] AI 세션 생성 완료: ${data.session_id}`);
      } else {
        console.error('[AI_ERROR] AI 세션 생성 실패:', data.message);
        setMessages([{
          id: `error-${Date.now()}`,
          text: data.message || "AI 세션 생성에 실패했습니다.",
          from: "system"
        }]);
      }
    } catch (error) {
      console.error('[AI_ERROR] AI 세션 생성 중 오류:', error);
      setMessages([{
        id: `error-${Date.now()}`,
        text: "AI 세션 생성 중 오류가 발생했습니다.",
        from: "system"
      }]);
    } finally {
      setIsCreatingSession(false);
    }
  }, [selectedRoom?.room_uuid]);

  // WebSocket 연결
  const connectAIWebSocket = useCallback(() => {
    if (!sessionId) {
      console.warn("⚠️ 세션 ID가 없어서 WebSocket 연결 안함");
      return;
    }

    console.log(`[AI_DEBUG] AI WebSocket 연결 시작: ${sessionId}`);

    // 기존 연결 정리
    if (wsRef.current) {
      console.log("[AI_DEBUG] 기존 WebSocket 연결 정리");
      wsRef.current.close();
      wsRef.current = null;
    }

    const wsUrl = `ws://localhost:8000/ws/llm/${sessionId}/`;
    console.log("[AI_DEBUG] WebSocket URL:", wsUrl);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`[AI_SUCCESS] AI WebSocket 연결 성공: ${sessionId}`);
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("[AI_DEBUG] WebSocket 메시지 수신:", data);

        if (data.type === 'chat_message') {
          const newMessage: AIMessage = {
            id: data.message_id || `${Date.now()}-${Math.random()}`,
            text: data.message,
            from: data.is_ai ? "ai" : "me",
            username: data.username,
            timestamp: data.timestamp,
          };

          console.log("[AI_DEBUG] 새 메시지 추가:", newMessage);

          setMessages((prev) => {
            const existingMessage = prev.find(msg => msg.id === newMessage.id);
            if (existingMessage) {
              console.log("[AI_DEBUG] 중복 메시지 무시:", newMessage.id);
              return prev;
            }
            return [...prev, newMessage];
          });

          // AI 응답 완료 시 thinking 상태 해제
          if (data.is_ai) {
            setIsAIThinking(false);
          }

        } else if (data.type === 'ai_joined') {
          // 🔥 AI 입장 메시지 처리
          const joinMessage: AIMessage = {
            id: `ai-join-${Date.now()}`,
            text: data.message,
            from: "system",
            timestamp: data.timestamp
          };
          console.log("[AI_DEBUG] AI 입장 메시지:", joinMessage);
          setMessages((prev) => [...prev, joinMessage]);

        } else if (data.type === 'ai_thinking') {
          console.log("[AI_DEBUG] AI 응답 생성 중...");
          setIsAIThinking(true);

        } else if (data.type === 'ai_error') {
          console.log("[AI_ERROR] AI 오류:", data.message);
          setIsAIThinking(false);
          const errorMessage: AIMessage = {
            id: `ai-error-${Date.now()}`,
            text: data.message,
            from: "system"
          };
          setMessages((prev) => [...prev, errorMessage]);

        } else if (data.type === 'error') {
          // 🔥 백엔드 에러 메시지 처리
          console.log("[AI_ERROR] 백엔드 에러:", data.message);
          setIsAIThinking(false);
          const errorMessage: AIMessage = {
            id: `backend-error-${Date.now()}`,
            text: data.message,
            from: "system"
          };
          setMessages((prev) => [...prev, errorMessage]);
        }
      } catch (error) {
        console.error("[AI_ERROR] WebSocket 메시지 파싱 오류:", error);
      }
    };

    ws.onclose = (event) => {
      console.log(`[AI_DEBUG] AI WebSocket 연결 종료: ${sessionId}`, {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      });
      setIsConnected(false);
      setIsAIThinking(false);

      if (wsRef.current === ws) {
        wsRef.current = null;
      }
    };

    ws.onerror = (error) => {
      console.error(`[AI_ERROR] AI WebSocket 오류: ${sessionId}`, error);
      setIsConnected(false);
      setIsAIThinking(false);
    };

    return ws;
  }, [sessionId]);

  // 세션 ID가 생성되면 WebSocket 연결
  useEffect(() => {
    if (sessionId && isOpen) {
      console.log("[AI_DEBUG] 세션 생성 완료, WebSocket 연결");
      connectAIWebSocket();
    }

    return () => {
      if (wsRef.current) {
        console.log("[AI_DEBUG] useEffect cleanup - WebSocket 정리");
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [sessionId, isOpen, connectAIWebSocket]);

  // 드롭다운 열릴 때 기존 세션 확인 또는 새 세션 생성
  useEffect(() => {
    if (isOpen && !sessionId && !isCreatingSession) {
      console.log("[AI_DEBUG] 드롭다운 열림, 기존 세션 확인 시작");

      const initializeSession = async () => {
        // 1. 먼저 기존 세션 찾기
        const existingSessionId = await findExistingSession();

        if (existingSessionId) {
          console.log("[AI_DEBUG] 기존 세션 사용:", existingSessionId);
          setSessionId(existingSessionId);
        } else {
          console.log("[AI_DEBUG] 기존 세션 없음, 새 세션 생성");
          await createAISession();
        }
      };

      initializeSession();
    }
  }, [isOpen, sessionId, isCreatingSession, findExistingSession, createAISession]);

  // 메시지 추가될 때 자동 스크롤
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const doScroll = () => {
      try {
        const max = el.scrollHeight - el.clientHeight;
        el.scrollTop = max >= 0 ? max : 0;
      } catch (err) {
        console.error("AI 채팅 스크롤 오류:", err);
      }
    };

    requestAnimationFrame(() => {
      doScroll();
      setTimeout(doScroll, 50);
    });
  }, [messages, isAIThinking]);

  // 메시지 전송
  const sendMessage = async () => {
    // IME 조합 중이면 전송하지 않음
    if (isComposing) {
      console.log("[AI_DEBUG] IME 조합 중 - 전송 차단");
      return;
    }

    if (!text.trim()) {
      console.warn("[AI_DEBUG] 빈 메시지는 전송할 수 없음");
      return;
    }

    if (!isConnected || !wsRef.current) {
      console.warn("[AI_DEBUG] WebSocket 연결되지 않음");
      return;
    }

    const userText = text.trim();
    console.log("[AI_DEBUG] AI 메시지 전송 시도:", userText);

    try {
      wsRef.current.send(JSON.stringify({
        type: 'chat_message',
        message: userText,
      }));
      console.log("[AI_DEBUG] AI 메시지 전송 완료");
      setText(""); // 전송 후 입력창 초기화
    } catch (error) {
      console.error("[AI_ERROR] AI 메시지 전송 오류:", error);
      setMessages((prev) => [...prev, {
        id: `error-${Date.now()}`,
        text: "메시지 전송 중 오류가 발생했습니다.",
        from: "system",
      }]);
    }
  };

  // 드롭다운 닫힐 때 정리
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      console.log("[AI_DEBUG] 드롭다운 닫힘, WebSocket 연결만 정리");
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setIsConnected(false);
      setIsAIThinking(false);
      // 🔥 세션과 메시지는 초기화 (새로운 대화로 시작)
      setSessionId(null);
      setMessages([]);
    }
  };

  return (
    <div className={className}>
      <DropdownMenu onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <BotMessageSquare />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-300 h-220" align="start">
          <div className="flex flex-col h-full">
            {/* 헤더 */}
            <div className="px-4 py-2 text-sm text-muted-foreground border-b">
              AI Assistant • {isConnected ? "🟢 연결됨" : "🔴 연결 안됨"}
              {isCreatingSession && " • ⏳ 세션 생성 중..."}
            </div>

            {/* 메시지 목록 */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto p-4 space-y-2 bg-muted/10"
            >
              {isCreatingSession ? (
                <div className="text-center text-muted-foreground py-8">
                  <Loader2 className="animate-spin mx-auto mb-2" />
                  AI 세션을 생성하는 중...
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  AI Assistant와 대화를 시작해보세요!<br />
                  개발 관련 질문을 자유롭게 해주세요.
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m.id}>
                    {m.from === "system" ? (
                      <div className="text-sm text-muted-foreground text-center py-2">
                        {m.text}
                      </div>
                    ) : (
                      <div
                        className={`max-w-[90%] wrap-break-word px-3 py-2 rounded-lg ${m.from === "me"
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "mr-auto bg-muted"
                          }`}
                      >
                        {m.from === "ai" && (
                          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <BotMessageSquare className="w-3 h-3" />
                            AI Assistant
                          </div>
                        )}
                        <div className="whitespace-pre-wrap">{m.text}</div>
                        {m.timestamp && (
                          <div className="text-xs opacity-70 mt-1">
                            {new Date(m.timestamp).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* AI 응답 생성 중 표시 */}
              {isAIThinking && (
                <div className="mr-auto bg-muted max-w-[90%] px-3 py-2 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <BotMessageSquare className="w-3 h-3" />
                    AI Assistant
                  </div>
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-muted-foreground">응답을 생성하고 있습니다...</span>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* 입력창 */}
            <div className="border-t p-3">
              <div className="flex gap-2">
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onCompositionStart={() => setIsComposing(true)}
                  onCompositionEnd={() => setIsComposing(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !isComposing) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={
                    isConnected
                      ? "AI에게 질문하기... (Enter: 전송, Shift+Enter: 줄바꿈)"
                      : "연결 중..."
                  }
                  className="min-h-[60px] resize-none"
                  disabled={!isConnected || isCreatingSession || isAIThinking}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!isConnected || !text.trim() || isCreatingSession || isAIThinking}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {selectedRoom ? `${selectedRoom.room_name}에서 AI 채팅` : "방을 선택해주세요"}
              </div>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}