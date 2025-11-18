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

  const wsUrl = (import.meta as unknown as { env?: { VITE_WS_URL?: string; }; }).env?.VITE_WS_URL || "ws://localhost:4000";

  useEffect(() => {
    let mounted = true;
    function connect() {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.addEventListener("open", () => {
        if (!mounted) return;
        setMessages((m) => [...m, { id: Date.now(), text: "서버에 연결되었습니다.", from: "system" }]);
      });

      ws.addEventListener("message", (ev) => {
        if (!mounted) return;
        try {
          const data = JSON.parse(ev.data);
          const text = typeof data === "string" ? data : data.text ?? JSON.stringify(data);
          setMessages((m) => [...m, { id: Date.now(), text, from: "remote" }]);
        } catch (err) {
          void err;
          setMessages((m) => [...m, { id: Date.now(), text: ev.data, from: "remote" }]);
        }
      });

      ws.addEventListener("close", () => {
        if (!mounted) return;
        setMessages((m) => [...m, { id: Date.now(), text: "연결이 닫혔습니다.", from: "system" }]);
        // 간단한 재접속 시도
        setTimeout(() => connect(), 2000);
      });

      ws.addEventListener("error", () => {
        if (!mounted) return;
        setMessages((m) => [...m, { id: Date.now(), text: "웹소켓 에러가 발생했습니다.", from: "system" }]);
      });
    }

    connect();

    return () => {
      mounted = false;
      try {
        wsRef.current?.close();
      } catch (err) {
        console.warn("ws close error", err);
      }
    };
  }, [wsUrl]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const doScroll = () => {
      try {
        const max = el.scrollHeight - el.clientHeight;
        el.scrollTop = max >= 0 ? max : 0;
        el.scrollTo?.({ top: el.scrollHeight, behavior: "auto" });
        try {
          const dev = (import.meta as unknown as { env?: { DEV?: boolean; }; }).env?.DEV;
          if (dev) {
            console.debug("chat scroll", { scrollHeight: el.scrollHeight, clientHeight: el.clientHeight, max, bottomExists: !!bottomRef.current });
          }
        } catch {
          void 0;
        }
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

  const send = () => {
    if (!text.trim()) return;
    const payload = { type: "message", text: text.trim(), user: "me" };
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
      setMessages((m) => [...m, { id: Date.now(), text: text.trim(), from: "me" }]);
      setText("");
    } else {
      setMessages((m) => [...m, { id: Date.now(), text: "서버에 연결되어 있지 않습니다.", from: "system" }]);
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
            className={`max-w-[80%] wrap-break-word px-3 py-2 rounded-lg ${m.from === "me" ? "ml-auto bg-primary/10" : m.from === "remote" ? "mr-auto bg-muted/20" : "text-sm text-muted text-center"
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
