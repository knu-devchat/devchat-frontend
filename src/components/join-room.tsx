import React, { useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputOTPControlled } from "@/components/common/InputTOTP";
import { joinRoomWithOTP } from "@/services/chatService";
import { useRoom } from "@/hooks/useRoom";

export const JoinRoom = React.forwardRef<{ open: () => void; }>(
  function JoinRoom(_props, ref) {
    const [open, setOpen] = React.useState(false);
    const [totp, setTotp] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const closeButtonRef = React.useRef<HTMLButtonElement>(null);
    const { setSelectedRoom } = useRoom();

    useImperativeHandle(ref, () => ({ open: () => setOpen(true) }));

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (totp.length < 6) {
        setError("6자리 OTP를 입력하세요.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await joinRoomWithOTP(totp);
        console.log("join result", res);

        // 백엔드 응답 구조에 맞게 수정
        if (res.result === "success") {
          setSelectedRoom({
            room_uuid: res.room_uuid,
            room_name: res.room_name,
            participant_count: res.participant_count,
            admin: res.admin,
            created_at: new Date().toISOString() // 백엔드에서 안보내주면 현재시간
          } as any);
          setTotp("");
          closeButtonRef.current?.click();
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>방 입장 (OTP)</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="py-4 flex flex-col items-center">
              <InputOTPControlled value={totp} onChange={setTotp} />
              {error && (
                <div className="text-sm text-destructive mt-2 text-center">{error}</div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button ref={closeButtonRef} variant="outline">
                  취소
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading}>
                {loading ? "입장중..." : "입장"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
);
