import { AppSidebar } from "@/components/custom/sidebar/app-sidebar";
import { CustomSidebarTrigger } from "@/components/custom/sidebar/custom-sidebar-trigger";
import { DashboardHeader } from "@/components/custom/dashboard/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { LoadingSplashScreen } from "@/components/custom/features/loading-splash-screen";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex-1 overflow-y-auto flex flex-col min-h-screen">
          <LoadingSplashScreen />
          <div className="flex flex-row justify-between m-2">
            <CustomSidebarTrigger />
            <DashboardHeader />
          </div>
          <div className="flex flex-col flex-1 min-h-0 m-2">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
