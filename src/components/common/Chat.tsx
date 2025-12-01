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
    const listRef = useRef<HTMLDivElement | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    // 메시지 추가될 때 자동 스크롤
    useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const doScroll = () => {
        try {
            const max = el.scrollHeight - el.clientHeight;
            el.scrollTop = max >= 0 ? max : 0;
            el.scrollTo?.({ top: el.scrollHeight, behavior: "auto" });
            try {
                const dev = (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV;
                if (dev) {
                console.debug("chat scroll", {
                scrollHeight: el.scrollHeight,
                clientHeight: el.clientHeight,
                max,
                bottomExists: !!bottomRef.current,
                });
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
        }, 50);
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
                void send();
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
