import { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";

type ChatMessage = {
  id: number;
  text: string;
  from: "me" | "remote" | "system";
};

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // 서버에서 알려준 WebSocket 주소 형식에 맞춰서 사용
  const wsUrl =
    (import.meta as unknown as { env?: { VITE_WS_URL?: string } }).env
      ?.VITE_WS_URL || "ws://localhost:8000/ws/chat/";

  // 1) WebSocket 연결 관리
  useEffect(() => {
    let mounted = true;
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
      ws.close();
    };
  }, [wsUrl]);

  // 2) 자동 스크롤 (이건 너 코드 그대로)
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
    });
  }, [messages]);

  // 3) 메시지 전송 – 이제 fetch가 아니라 ws.send
  const send = () => {
    if (!text.trim()) return;
    const userText = text.trim();

    // 화면에 내 메시지 먼저 추가
    setMessages((m) => [
      ...m,
      { id: Date.now(), text: userText, from: "me" },
    ]);
    setText("");

    const payload = {
      type: "message",
      text: userText,
      // roomUuid, user 정보 등 필요하면 여기 추가해서 서버랑 합의
    };

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    } else {
      setMessages((m) => [
        ...m,
        {
          id: Date.now(),
          text: "서버에 연결되어 있지 않습니다.",
          from: "system",
        },
      ]);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 relative">
      <div
        ref={listRef}
        className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2 bg-surface rounded-md pb-28"
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
            {m.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="sticky bottom-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm py-2">
        <div className="mt-2 flex gap-2 items-end px-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="메시지를 입력하세요 (Enter: 전송, Shift+Enter: 줄바꿈)"
            className="h-24"
          />
        </div>
      </div>
    </div>
  );
}

export default Chat;
