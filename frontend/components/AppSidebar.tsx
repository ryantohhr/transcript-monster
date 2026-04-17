import { Bot, Home, ScrollText } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const pages = [
  {
    title: "Home",
    url: "/app",
    icon: Home,
  },
  {
    title: "Transcribe",
    url: "/app/transcribe",
    icon: ScrollText,
  },
  {
    title: "Chat",
    url: "/app/chat",
    icon: Bot,
  },
];

export default function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>App</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {pages.map((page) => (
                <SidebarMenuItem key={page.title}>
                  <SidebarMenuButton asChild>
                    <a href={page.url}>
                      <page.icon />
                      <span className="font-semibold">{page.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
