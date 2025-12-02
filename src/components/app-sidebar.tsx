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
  roomLastMessages?: { [roomUuid: string]: any; }; // 🔥 마지막 메시지 정보 추가
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

      // 유효한 날짜인지 확인
      if (isNaN(messageTime.getTime())) {
        return "";
      }

      const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));

      if (diffInMinutes < 1) {
        return "방금 전";
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes}분 전`;
      } else if (diffInMinutes < 1440) { // 24시간
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

    // 백엔드 응답 구조에 맞게 방 추가
    const formattedRoom = {
      room_uuid: newRoom.room_uuid,
      room_name: newRoom.room_name,
      created_at: newRoom.created_at || new Date().toISOString(),
      subject: "새로 생성된 방"
    };

    setRooms([formattedRoom, ...rooms]); // 새 방을 맨 위에 추가
    setActiveItem({ title: "방 목록" }); // 방 생성 후 방 목록으로 돌아가기
  };

  const handleRoomClick = async (room: any) => {
    try {
      // 서버 세션에 선택된 방 저장
      await selectRoom(room.room_uuid);
      // 선택된 방의 상세 정보를 받아와 로컬 상태를 갱신
      const res = await getCurrentRoom();
      if (res && res.room) {
        setSelectedRoom(res.room);
      } else {
        // fallback: set minimal room info
        setSelectedRoom(room);
      }
    } catch (error) {
      console.error("방 정보 조회/선택 실패:", error);
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      {/* This is the first sidebar */}
      {/* We disable collapsible and adjust width to icon. */}
      {/* This will make the sidebar appear as icons. */}
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <a href="#">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <img src={Logo} className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">DevChat</span>
                    <span className="truncate text-xs">개발자 채팅</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {data.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {/* 💡 "방 생성"과 "방 입장" 항목만 Dialog로 감쌉니다. */}
                    {item.title === "방 생성" ? (
                      <div>
                        <SidebarMenuButton
                          tooltip={{
                            children: item.title,
                            hidden: false,
                          }}
                          onClick={() => {
                            createRoomRef.current?.open();
                            setActiveItem(item);
                          }}
                          isActive={activeItem?.title === item.title}
                          className="px-2.5 md:px-2"
                        >
                          <item.icon />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                        <CreateRoom ref={createRoomRef} onRoomCreated={handleRoomCreated} />
                      </div>
                    ) : item.title === "방 입장" ? (
                      <div>
                        <SidebarMenuButton
                          tooltip={{
                            children: item.title,
                            hidden: false,
                          }}
                          onClick={() => {
                            joinRoomRef.current?.open();
                            setActiveItem(item);
                          }}
                          isActive={activeItem?.title === item.title}
                          className="px-2.5 md:px-2"
                        >
                          <DoorOpen />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                        <JoinRoom ref={joinRoomRef} />
                      </div>
                    ) : (
                      <SidebarMenuButton
                        tooltip={{
                          children: item.title,
                          hidden: false,
                        }}
                        // 일반 항목은 onClick을 유지하거나 라우팅 처리
                        onClick={() => setActiveItem(item)}
                        isActive={activeItem?.title === item.title}
                        className="px-2.5 md:px-2"
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    )}

                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={currentUser} />
        </SidebarFooter>
      </Sidebar>

      {/* This is the second sidebar */}
      {/* We disable collapsible and let it fill remaining space */}
      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-foreground text-base font-medium">
              {activeItem?.title}
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent>
              {rooms.length > 0 ? (
                rooms.map((room) => (
                  <a
                    href="#"
                    key={room.room_uuid}
                    onClick={(e) => {
                      e.preventDefault();
                      handleRoomClick(room);
                    }}
                    className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight last:border-b-0 cursor-pointer"
                  >
                    <div className="flex w-full items-center gap-2">
                      <span className="font-medium truncate">
                        {/* 🔥 방 이름 표시 */}
                        {room.room_name}
                      </span>
                      <span className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
                        {/* 🔥 마지막 메시지 시간 표시 (실시간 우선) */}
                        {formatTime(getLastMessageTime(room))}
                      </span>
                    </div>
                    <div className="w-full text-xs text-muted-foreground truncate">
                      {/* 🔥 발송자 이름 표시 (실시간 메시지 우선, 있는 경우만) */}
                      {getSenderName(room) && (
                        <span className="font-medium">{getSenderName(room)}: </span>
                      )}
                      {/* 🔥 마지막 메시지 내용 표시 (실시간 우선) */}
                      {formatLastMessage(room)}
                    </div>
                  </a>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  참여한 방이 없습니다<br />
                  새 방을 만들거나 방에 참여해보세요
                </div>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  );
}