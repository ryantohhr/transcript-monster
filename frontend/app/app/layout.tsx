import { cookies } from "next/headers";
import AppHeader from "@/components/AppHeader";
import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const sidebarState = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={sidebarState}>
      <AppSidebar />
      <div className="flex flex-col w-full">
        <AppHeader />
        <main className="w-full h-full">{children}</main>
      </div>
    </SidebarProvider>
  );
}
