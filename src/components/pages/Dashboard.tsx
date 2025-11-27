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
import { Chat } from "@/components/common/Chat";
import { useRoom } from "@/hooks/useRoom";
import { TotpDialog } from "../totp-dialog";
import { Button } from "@/components/ui/button";

import { UserRoundPlus } from 'lucide-react';
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
        setLoading(false); // 로딩 완료
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
                <BreadcrumbPage>{selectedRoom?.roomName || "방 선택"}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Button variant="ghost" className="mr-2" onClick={() => totpRef.current?.open()}>
            <UserRoundPlus />
          </Button>
          <TotpDialog ref={totpRef} />
          <AIChat className={"ml-auto"} />
        </header>
        <div className="flex flex-col p-4 h-[calc(100vh-64px)]">
          {/* <div className="flex-1 min-h-0">
            <Chat />
          </div> */}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
