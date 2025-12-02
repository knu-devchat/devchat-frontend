"use client";

import * as React from "react";
import {
  MessageCirclePlus
} from "lucide-react";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { CreateRoom } from "@/components/create-room";
import { JoinRoom } from "@/components/join-room";

import Logo from "@/assets/logo.svg";
import { useRoom } from "@/hooks/useRoom";
import { selectRoom, getCurrentRoom } from "@/services/chatService";

import { DoorOpen } from 'lucide-react';

const data = {
  navMain: [
    {
      title: "방 생성",
      url: "#",
      icon: MessageCirclePlus,
      isActive: false,
    },
    {
      title: "방 입장",
      url: "#",
      icon: MessageCirclePlus,
      isActive: false,
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userRooms?: any[];
  currentUser?: any;
  roomLastMessages?: { [roomUuid: string]: any; };
}

export function AppSidebar({ userRooms, currentUser, roomLastMessages, ...props }: AppSidebarProps) {
  const [activeItem, setActiveItem] = React.useState({ title: "방 목록" });
  const createRoomRef = React.useRef<{ open: () => void; } | null>(null);
  const joinRoomRef = React.useRef<{ open: () => void; } | null>(null);
  const { setSelectedRoom } = useRoom();
  const [rooms, setRooms] = React.useState<any[]>([]);

  // 방 목록 업데이트
  React.useEffect(() => {
    if (userRooms && userRooms.length > 0) {
      setRooms(userRooms);
    }
  }, [userRooms]);

  // 🔥 시간 포맷팅 함수
  const formatTime = (timestamp: string) => {
    if (!timestamp) return "";

    try {
      const now = new Date();
      const messageTime = new Date(timestamp);

      if (isNaN(messageTime.getTime())) {
        return "";
      }

      const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));

      if (diffInMinutes < 1) {
        return "방금 전";
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes}분 전`;
      } else if (diffInMinutes < 1440) {
        const diffInHours = Math.floor(diffInMinutes / 60);
        return `${diffInHours}시간 전`;
      } else {
        const diffInDays = Math.floor(diffInMinutes / 1440);
        if (diffInDays < 7) {
          return `${diffInDays}일 전`;
        } else {
          return messageTime.toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric'
          });
        }
      }
    } catch (error) {
      console.error("시간 포맷팅 오류:", error);
      return "";
    }
  };

  // 🔥 마지막 메시지 텍스트 포맷팅 함수 (실시간 메시지 우선)
  const formatLastMessage = (room: any) => {
    console.log("🔥 formatLastMessage 호출됨, room:", room);

    // 실시간 마지막 메시지 정보 우선 사용
    const realtimeLastMessage = roomLastMessages?.[room.room_uuid];
    if (realtimeLastMessage && realtimeLastMessage.from !== "system") {
      const messageText = realtimeLastMessage.text || "";
      console.log("🔥 실시간 마지막 메시지 사용:", messageText);

      if (messageText.length > 30) {
        return messageText.substring(0, 30) + "...";
      }
      return messageText;
    }

    // 기존 로직으로 폴백
    let lastMessage = room.last_message;
    let messageText = "";

    if (lastMessage) {
      messageText = lastMessage.content ||
        lastMessage.message ||
        lastMessage.text ||
        lastMessage.body || "";
    }

    if (!messageText) {
      messageText = room.last_content ||
        room.last_message_content ||
        room.latest_message ||
        room.subject || "";
    }

    console.log("🔥 추출된 메시지:", messageText);

    if (!messageText || messageText.trim() === "") {
      return "메시지가 없습니다";
    }

    const maxLength = 30;
    if (messageText.length > maxLength) {
      return messageText.substring(0, maxLength) + "...";
    }

    return messageText;
  };

  // 🔥 마지막 메시지 시간 가져오기 함수 (실시간 메시지 우선)
  const getLastMessageTime = (room: any) => {
    // 실시간 마지막 메시지 시간 우선 사용
    const realtimeLastMessage = roomLastMessages?.[room.room_uuid];
    if (realtimeLastMessage && realtimeLastMessage.from !== "system") {
      return realtimeLastMessage.timestamp;
    }

    // 기존 로직으로 폴백
    return room.last_message?.timestamp ||
      room.last_message?.created_at ||
      room.updated_at ||
      room.created_at;
  };

  // 🔥 발송자 이름 가져오기 함수 (실시간 메시지 우선)
  const getSenderName = (room: any) => {
    // 실시간 마지막 메시지 발송자 우선 사용
    const realtimeLastMessage = roomLastMessages?.[room.room_uuid];
    if (realtimeLastMessage && realtimeLastMessage.from !== "system") {
      return realtimeLastMessage.username;
    }

    // 기존 로직으로 폴백
    return room.last_message?.sender_name;
  };

  const handleRoomCreated = (newRoom: any) => {
    console.log("새로 생성된 방:", newRoom);

    const formattedRoom = {
      room_uuid: newRoom.room_uuid,
      room_name: newRoom.room_name,
      created_at: newRoom.created_at || new Date().toISOString(),
      subject: "새로 생성된 방"
    };

    setRooms([formattedRoom, ...rooms]);
    setActiveItem({ title: "방 목록" });
  };

  const handleRoomClick = async (room: any) => {
    try {
      await selectRoom(room.room_uuid);
      const res = await getCurrentRoom();
      if (res && res.room) {
        setSelectedRoom(res.room);
      } else {
        setSelectedRoom(room);
      }
    } catch (error) {
      console.error("방 정보 조회/선택 실패:", error);
    }
  };

  return (
    // 🔥 단일 사이드바로 변경, 반응형 제거
    <Sidebar className="w-80 border-r" {...props}>
      {/* 🔥 로고 섹션 */}
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-10 items-center justify-center rounded-lg">
            <svg
              className="size-6"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 12H12M12 12H16M12 12V8M12 12V16M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 8L16 16M16 8L8 16"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg cursor-pointer hover:text-primary transition-colors"
              onClick={() => window.location.reload()}>
              DevChat
            </span>
            <span className="text-xs text-muted-foreground">개발자 채팅</span>
          </div>
        </div>
      </SidebarHeader>

      {/* 🔥 메뉴 섹션 */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="px-4 py-2">
            <SidebarMenu className="space-y-1">
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.title === "방 생성" ? (
                    <div>
                      <SidebarMenuButton
                        onClick={() => {
                          createRoomRef.current?.open();
                          setActiveItem(item);
                        }}
                        isActive={activeItem?.title === item.title}
                        className="w-full justify-start"
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="ml-2">{item.title}</span>
                      </SidebarMenuButton>
                      <CreateRoom ref={createRoomRef} onRoomCreated={handleRoomCreated} />
                    </div>
                  ) : item.title === "방 입장" ? (
                    <div>
                      <SidebarMenuButton
                        onClick={() => {
                          joinRoomRef.current?.open();
                          setActiveItem(item);
                        }}
                        isActive={activeItem?.title === item.title}
                        className="w-full justify-start"
                      >
                        <DoorOpen className="h-4 w-4" />
                        <span className="ml-2">{item.title}</span>
                      </SidebarMenuButton>
                      <JoinRoom ref={joinRoomRef} />
                    </div>
                  ) : (
                    <SidebarMenuButton
                      onClick={() => setActiveItem(item)}
                      isActive={activeItem?.title === item.title}
                      className="w-full justify-start"
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="ml-2">{item.title}</span>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* 🔥 방 목록 섹션 */}
        <SidebarGroup>
          <div className="px-4 py-2 border-t">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              {activeItem?.title}
            </div>
            <div className="space-y-1">
              {rooms.length > 0 ? (
                rooms.map((room) => (
                  <div
                    key={room.room_uuid}
                    onClick={() => handleRoomClick(room)}
                    className="p-3 rounded-md hover:bg-sidebar-accent cursor-pointer border border-transparent hover:border-sidebar-border transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm truncate flex-1">
                        {room.room_name}
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {formatTime(getLastMessageTime(room))}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {getSenderName(room) && (
                        <span className="font-medium">{getSenderName(room)}: </span>
                      )}
                      {formatLastMessage(room)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  참여한 방이 없습니다<br />
                  새 방을 만들거나 방에 참여해보세요
                </div>
              )}
            </div>
          </div>
        </SidebarGroup>
      </SidebarContent>

      {/* 🔥 사용자 정보 섹션 */}
      <SidebarFooter className="border-t p-4">
        <NavUser user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  );
}