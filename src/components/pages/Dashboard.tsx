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

import React, { useEffect, useState, useCallback } from "react";
import { fetchChatMessages } from "@/services/chatService"; // 🔥 추가

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

  const [roomLastMessages, setRoomLastMessages] = useState<{ [roomUuid: string]: any; }>({});

  // 🔥 Chat 컴포넌트에서 마지막 메시지 정보 수신하는 콜백
  const handleLastMessageChange = useCallback((roomUuid: string, lastMessage: any) => {
    console.log("🔥 마지막 메시지 업데이트:", { roomUuid, lastMessage });
    setRoomLastMessages(prev => ({
      ...prev,
      [roomUuid]: lastMessage
    }));
  }, []);

  // 🔥 각 방의 마지막 메시지 미리 로드하는 함수
  const preloadRoomLastMessages = useCallback(async (rooms: any[]) => {
    console.log("🔥 방들의 마지막 메시지 미리 로드 시작:", rooms.length);

    const lastMessagesPromises = rooms.map(async (room) => {
      try {
        const messageData = await fetchChatMessages(room.room_uuid);

        if (messageData.result === 'success' && messageData.messages && messageData.messages.length > 0) {
          // 시스템 메시지를 제외한 마지막 메시지 찾기
          const chatMessages = messageData.messages.filter((msg: any) => !msg.is_system);

          if (chatMessages.length > 0) {
            const lastMessage = chatMessages[chatMessages.length - 1];

            // Chat 컴포넌트의 형식과 일치하도록 변환
            const formattedLastMessage = {
              id: lastMessage.id,
              text: lastMessage.content,
              from: lastMessage.is_self ? "me" : "remote",
              username: lastMessage.sender_username,
              timestamp: lastMessage.created_at,
            };

            console.log(`🔥 ${room.room_name} 마지막 메시지:`, formattedLastMessage);

            return {
              roomUuid: room.room_uuid,
              lastMessage: formattedLastMessage
            };
          }
        }

        return {
          roomUuid: room.room_uuid,
          lastMessage: null
        };
      } catch (error) {
        console.error(`❌ ${room.room_name} 마지막 메시지 로드 실패:`, error);
        return {
          roomUuid: room.room_uuid,
          lastMessage: null
        };
      }
    });

    try {
      const results = await Promise.all(lastMessagesPromises);

      // 결과를 roomLastMessages 형태로 변환
      const lastMessagesMap = results.reduce((acc, { roomUuid, lastMessage }) => {
        acc[roomUuid] = lastMessage;
        return acc;
      }, {} as { [roomUuid: string]: any; });

      console.log("🔥 모든 방의 마지막 메시지 로드 완료:", lastMessagesMap);
      setRoomLastMessages(lastMessagesMap);

    } catch (error) {
      console.error("❌ 방들의 마지막 메시지 로드 중 오류:", error);
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setCurrentUser(userData);
        setUserRooms(userData.rooms || []);
        console.log("현재 사용자:", userData);

        // 🔥 사용자 정보 로드 후 각 방의 마지막 메시지 미리 로드
        if (userData.rooms && userData.rooms.length > 0) {
          await preloadRoomLastMessages(userData.rooms);
        }

      } catch (err) {
        console.error("유저 정보를 가져오지 못했습니다.", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [preloadRoomLastMessages]);

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
      defaultOpen={true}
      open={true}
      onOpenChange={() => { }}
    >
      <AppSidebar userRooms={userRooms} currentUser={currentUser} roomLastMessages={roomLastMessages} />

      {/* 🔥 채팅방이 선택되었을 때만 메인 컨텐츠 표시 */}
      {selectedRoom ? (
        <SidebarInset>
          <header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4">
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
              <Chat onLastMessageChange={handleLastMessageChange} />
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