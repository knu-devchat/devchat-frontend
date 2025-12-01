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
import { Input } from "@/components/ui/input";

import { CreateRoom } from "@/components/create-room";
import { JoinRoom } from "@/components/join-room";

import Logo from "@/assets/logo.svg";
import { useRoom } from "@/hooks/useRoom";
import { getRoomDetails } from "@/services/chatService";

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
}

export function AppSidebar({ userRooms, currentUser, ...props }: AppSidebarProps) {
  const [activeItem, setActiveItem] = React.useState(data.navMain[0]);
  const createRoomRef = React.useRef<{ open: () => void; } | null>(null);
  const joinRoomRef = React.useRef<{ open: () => void; } | null>(null);
  const { setSelectedRoom } = useRoom();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [rooms, setRooms] = React.useState<any[]>([]);

  // 방 목록 업데이트
  React.useEffect(() => {
    if (userRooms && userRooms.length > 0) {
      setRooms(userRooms);
    }
  }, [userRooms]);

  // 방 검색
  const filteredRooms = React.useMemo(() => {
    if (!searchQuery.trim()) return rooms;
    const query = searchQuery.toLowerCase();
    return rooms.filter(
      (room) =>
        room.room_name?.toLowerCase().includes(query) ||
        room.subject.toLowerCase().includes(query)
    );
  }, [rooms, searchQuery]);

  const handleRoomCreated = (newRoom: { roomName: string; subject: string; date: string; }) => {
    setRooms([newRoom, ...rooms]);
  };

  const handleRoomClick = async (room: any) => {
    try {
      const roomData = await getRoomDetails(room.room_uuid); // ✅ 새 함수명 사용
      setSelectedRoom(roomData);
    } catch (error) {
      console.error("방 정보 조회 실패:", error);
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
          <Input
            placeholder="방 이름 또는 내용 검색..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="h-8 w-full"
          />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent>
              {filteredRooms.map((room) => (
                <a
                  href="#"
                  key={room.room_uuid}
                  onClick={(e) => {
                    e.preventDefault();
                    handleRoomClick(room);
                  }}
                  className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0 cursor-pointer"
                >
                  <div className="flex w-full items-center gap-2">
                    <span>{room.room_name}</span>{" "}
                    <span className="ml-auto text-xs">{room.created_at}</span>
                  </div>
                  <span className="font-medium">{room.subject || "마지막 메시지"}</span>
                </a>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  );
}
