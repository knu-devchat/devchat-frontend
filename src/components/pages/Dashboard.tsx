import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { AIChat } from "../common/AIChat";
import Chat from "@/components/common/Chat";
import { useRoom } from "@/hooks/useRoom";
import { TotpDialog } from "../totp-dialog";
import { LeaveRoomDialog } from "../LeaveRoomDialog";
import { Button } from "@/components/ui/button";

import { UserRoundPlus, ArrowLeftToLine, MessageCircle } from 'lucide-react';

import React, { useEffect, useState } from "react";

const getCurrentUser = async () => {
  const response = await fetch('http://localhost:8000/api/user/me/', {
    credentials: 'include'
  });
  return response.json();
};

export default function Dashboard() {
  const { selectedRoom } = useRoom();
  const totpRef = React.useRef<{ open: () => void; } | null>(null);
  const leaveRoomRef = React.useRef<{ open: () => void; } | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRooms, setUserRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setCurrentUser(userData);
        setUserRooms(userData.rooms || []);
        console.log("현재 사용자:", userData);

      } catch (err) {
        console.error("유저 정보를 가져오지 못했습니다.", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">로딩 중...</div>;
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px",
        } as React.CSSProperties
      }
    >
      <AppSidebar userRooms={userRooms} currentUser={currentUser} />

      {/* 🔥 채팅방이 선택되었을 때만 메인 컨텐츠 표시 */}
      {selectedRoom ? (
        <SidebarInset>
          <header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>{(selectedRoom as any)?.room_name || "방 선택"}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <Button variant="ghost" className="mr-2" onClick={() => totpRef.current?.open()}>
              <UserRoundPlus />
            </Button>
            <TotpDialog ref={totpRef} roomUuid={(selectedRoom as any)?.room_uuid} />
            <AIChat className={"ml-auto"} />
            <Button variant="ghost" className="mr-2" onClick={() => leaveRoomRef.current?.open()}>
              <ArrowLeftToLine />
            </Button>
            <LeaveRoomDialog ref={leaveRoomRef} roomUuid={(selectedRoom as any)?.room_uuid} />
          </header>
          <div className="flex flex-col p-4 h-[calc(100vh-64px)]">
            <div className="flex-1 min-h-0">
              <Chat />
            </div>
          </div>
        </SidebarInset>
      ) : (
        /* 🔥 채팅방이 선택되지 않았을 때 표시할 영역 */
        <div className="flex flex-1 items-center justify-center bg-muted/10">
          <div className="text-center space-y-4">
            <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground" />
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-muted-foreground">
                채팅방을 선택해주세요
              </h2>
              <p className="text-sm text-muted-foreground max-w-md">
                왼쪽 사이드바에서 참여할 채팅방을 선택하거나<br />
                새로운 방을 만들어 대화를 시작해보세요.
              </p>
            </div>
          </div>
        </div>
      )}
    </SidebarProvider>
  );
}