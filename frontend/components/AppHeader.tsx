import AppBreadcrumb from "./AppBreadcrumb";
import { Separator } from "./ui/separator";
import { SidebarTrigger } from "./ui/sidebar";

export default function AppHeader() {
  return (
    <header className="border-b-gray-150 border-b-1 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="cursor-pointer -ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <AppBreadcrumb />
      </div>
    </header>
  );
}
