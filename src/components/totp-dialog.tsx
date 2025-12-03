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
// Label import removed; InputOTPControlled used as dialog body
import { getTOTP } from "@/services/totpService";

interface TotpDialogProps {
  roomUuid: string;
}

export const TotpDialog = React.forwardRef<
  { open: () => void; },
  TotpDialogProps
>(function TotpDialog({ roomUuid }, ref) {

  const [open, setOpen] = React.useState(false);
  const [code, setCode] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
  }));

  React.useEffect(() => {
    if (!open) return;
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await getTOTP(roomUuid);
        if (!mounted) return;
        setCode(res.totp ?? null);
      } catch (err: unknown) {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [open, roomUuid]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>TOTP</DialogTitle>
        </DialogHeader>

        {/* 서버에서 생성된 TOTP 코드를 텍스트로 표시합니다. */}
        <div className="py-4 text-center">
          {loading ? (
            <div className="text-sm">로딩 중...</div>
          ) : error ? (
            <div className="text-sm text-destructive">에러: {error}</div>
          ) : code ? (
            <div className="flex flex-col items-center gap-2">
              <div className="text-xs text-muted-foreground">SERVER TOTP</div>
              <div className="text-3xl font-mono tracking-widest">{code}</div>
            </div>
          ) : (
            <div className="text-sm">코드가 없습니다.</div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button ref={closeButtonRef} variant="outline">닫기</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
