import React, { forwardRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LeaveRoomDialogProps {
  roomUuid?: string;
}

export const LeaveRoomDialog = forwardRef<
  { open: () => void },
  LeaveRoomDialogProps
>(({ roomUuid }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false);

  React.useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
  }));

  const handleLeaveRoom = async () => {
    if (!roomUuid) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/chat/leave-room/`,
        {
          method: "POST",
          //uuid를 body에 포함
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ room_uuid: roomUuid }),
          credentials: "include",
        }
      );

      if (response.ok) {
        setIsOpen(false);
        // 페이지 새로고침 또는 라우팅 처리
        window.location.reload();
      }
    } catch (err) {
      console.error("방을 나가지 못했습니다.", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>방 나가기</DialogTitle>
          <DialogDescription>
            이 방을 나가시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            취소
          </Button>
          <Button variant="destructive" onClick={handleLeaveRoom}>
            나가기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

LeaveRoomDialog.displayName = "LeaveRoomDialog";