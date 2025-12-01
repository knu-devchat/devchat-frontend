import React, { useImperativeHandle, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createRoom } from "@/services/chatService";

export const CreateRoom = forwardRef<{ open: () => void; }, { onRoomCreated: (room: any) => void; }>(({ onRoomCreated }, ref) => {
  const [roomName, setRoomName] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
  }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

    e.preventDefault();

    if (!roomName.trim()) {
      alert("방 이름을 입력해주세요.");
      return;
    }

    try {
      const response = await createRoom(roomName);
      console.log("API 생성 방", response);

      const newRoom = {
        room_uuid: response.room_uuid || response.id,
        room_name: response.room_name || roomName,
        subject: response.subject || "새로운 방",
        created_at: new Date().toISOString(),
      };

      onRoomCreated(newRoom);
      setRoomName("");
      closeButtonRef.current?.click();
    } catch (error) {
      console.error("방 생성 실패:", error);
      alert("방 생성에 실패했습니다. 다시 시도해주세요.");
      return;
    }


  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>방 생성</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">방 이름</Label>
              <Input
                id="name-1"
                name="name"
                placeholder="방 이름을 입력하세요."
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button ref={closeButtonRef} variant="outline">취소</Button>
            </DialogClose>
            <Button type="submit">생성</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});
