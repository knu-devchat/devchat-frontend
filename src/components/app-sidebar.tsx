"use client";

import * as React from "react";
import {
  MessageCirclePlus,
  Command,
  Contact,
  MessageCircleCode,
} from "lucide-react";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { CreateRoom } from "@/components/createRoom";

import Logo from "@/assets/logo.svg";
import { useRoom } from "@/hooks/useRoom";
import { enterChatRoom } from "@/services/chatService";

// This is sample data
const data = {
  user: {
    name: "개발자",
    email: "developer@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "채팅",
      url: "#",
      icon: MessageCircleCode,
      isActive: true,
    },
    {
      title: "방 생성",
      url: "#",
      icon: MessageCirclePlus,
      isActive: false,
    },
  ],
  rooms: [
    {
      roomName: "자바 팀프로젝트",
      subject: "프폰트엔드 개발 70% 완료함",
      date: "21:23 AM",
    },
    {
      roomName: "사이드 플젝",
      subject: "빨리 백엔드 코드 짜줘",
      date: "17:55 AM",
    },
    {
      roomName: "개인 플젝",
      subject: "메인페이지 디자인 수정 필요",
      date: "05:34 AM",
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Note: I'm using state to show active item.
  // IRL you should use the url/router.
  const [activeItem, setActiveItem] = React.useState(data.navMain[0]);
  const [rooms, setRooms] = React.useState(data.rooms);
  const createRoomRef = React.useRef<{ open: () => void }>(null);
  const { setSelectedRoom } = useRoom();

  const handleRoomCreated = (newRoom: { roomName: string; subject: string; date: string }) => {
    setRooms([newRoom, ...rooms]);
  };

  const handleRoomClick = async (room: { roomName: string; subject: string; date: string }) => {
    // Context에 선택된 방 저장
    setSelectedRoom(room);
    
    // 서버에 채팅방 입장 요청 (테스트 중)
    try {
      const result = await enterChatRoom(room.roomName);
      console.log('[입장 완료]', result);
    } catch (error) {
      console.error('[입장 실패]', error);
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
                    <span className="truncate font-medium">Acme Inc</span>
                    <span className="truncate text-xs">Enterprise</span>
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
                    {/* 💡 "방 생성" 항목만 Dialog로 감쌉니다. */}
                    {item.title === "방 생성" ? (
                      <div>
                        <SidebarMenuButton
                          tooltip={{
                            children: item.title,
                            hidden: false,
                          }}
                          onClick={() => {
                            createRoomRef.current?.open();
                          }}
                          isActive={activeItem?.title === item.title}
                          className="px-2.5 md:px-2"
                        >
                          <item.icon />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                        <CreateRoom ref={createRoomRef} onRoomCreated={handleRoomCreated} />
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
          <NavUser user={data.user} />
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
          <SidebarInput placeholder="Type to search..." />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent>
              {rooms.map((room) => (
                <a
                  href="#"
                  key={room.roomName}
                  onClick={(e) => {
                    e.preventDefault();
                    handleRoomClick(room);
                  }}
                  className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0 cursor-pointer"
                >
                  <div className="flex w-full items-center gap-2">
                    <span>{room.roomName}</span>{" "}
                    <span className="ml-auto text-xs">{room.date}</span>
                  </div>
                  <span className="font-medium">{room.subject}</span>
                </a>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  );
}
