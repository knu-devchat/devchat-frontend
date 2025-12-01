import { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { sendChatMessage, fetchChatMessages } from "@/services/chatService";
import { useRoom } from "@/hooks/useRoom";

type ChatMessage = {
  id: number;
  text: string;
  from: "me" | "remote" | "system";
  sender?: string;
  created_at?: string;
};

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { selectedRoom } = useRoom();
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // 메시지 로드 함수
  const loadMessages = async () => {
    if (!selectedRoom?.room_uuid) {
      setMessages([{ id: Date.now(), text: "선택된 방이 없습니다.", from: "system" }]);
      return;
    }

    try {
      const res = await fetchChatMessages(selectedRoom.room_uuid, 1);
      if (res.messages && Array.isArray(res.messages)) {
        const loaded = res.messages.map((msg: any) => ({
          id: msg.id,
          text: msg.content,
          from: msg.sender === "me" ? "me" : "remote",
          sender: msg.sender,
          created_at: msg.created_at,
        }));
        setMessages(loaded);
      }
    } catch (err) {
      console.error("메시지 로드 실패:", err);
      setMessages([{ id: Date.now(), text: "메시지를 불러올 수 없습니다.", from: "system" }]);
    }
  };

  // 초기 로드 및 폴링
  useEffect(() => {
    loadMessages();

    // 2초마다 메시지 갱신
    pollingRef.current = setInterval(() => {
      loadMessages();
    }, 2000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [selectedRoom?.room_uuid]);

  // 스크롤 처리
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const doScroll = () => {
      try {
        const max = el.scrollHeight - el.clientHeight;
        el.scrollTop = max >= 0 ? max : 0;
        el.scrollTo?.({ top: el.scrollHeight, behavior: "auto" });
      } catch (err) {
        void err;
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

  // 메시지 전송 함수
  const send = async () => {
    if (!text.trim()) return;
    if (!selectedRoom?.room_uuid) {
      setError("선택된 방이 없습니다.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await sendChatMessage(selectedRoom.room_uuid, text.trim());
      console.log("메시지 전송 완료:", res);

      // 즉시 메시지 리스트 갱신
      await loadMessages();
      setText("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setMessages((m) => [...m, { id: Date.now(), text: `전송 실패: ${msg}`, from: "system" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 relative">
      <div
        ref={listRef}
        className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2 bg-surface rounded-md"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[80%] wrap-break-word px-3 py-2 rounded-lg ${
              m.from === "me"
                ? "ml-auto bg-primary/10"
                : m.from === "remote"
                  ? "mr-auto bg-muted/20"
                  : "text-sm text-muted text-center"
            }`}
          >
            <div>{m.text}</div>
            {m.created_at && (
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(m.created_at).toLocaleTimeString()}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex-shrink-0 bg-background/80 backdrop-blur-sm border-t p-4">
        {error && (
          <div className="text-sm text-destructive mb-2">{error}</div>
        )}
        <div className="flex gap-2 items-end">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            disabled={loading}
            placeholder="메시지를 입력하세요 (Enter: 전송, Shift+Enter: 줄바꿈)"
            className="h-20 flex-1 resize-none"
          />
          <button
            onClick={send}
            disabled={loading || !text.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50 h-20 flex items-center justify-center"
          >
            {loading ? "전송중..." : "전송"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;