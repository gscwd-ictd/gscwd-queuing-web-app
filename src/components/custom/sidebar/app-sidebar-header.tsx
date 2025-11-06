import { SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { Droplet } from "lucide-react";
import { AppLogoHeader } from "../features/app-logo-header";

export function AppSidebarHeader() {
  const { state } = useSidebar();

  return (
    <div className="select-none">
      {state === "expanded" ? (
        <SidebarHeader>
          <AppLogoHeader />
        </SidebarHeader>
      ) : (
        <SidebarHeader className="text-primary">
          <Droplet size={32} />
        </SidebarHeader>
      )}
    </div>
  );
}
