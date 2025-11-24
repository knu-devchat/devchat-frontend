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

export default function Dashboard() {
  const { selectedRoom } = useRoom();

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
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
          <AIChat className={"ml-auto"} />
        </header>
        <div className="flex flex-col p-4 h-[calc(100vh-64px)]">
          <div className="flex-1 min-h-0">
            <Chat />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
