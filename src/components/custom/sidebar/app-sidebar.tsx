"use client";

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
import { sidebarItems } from "@/lib/constants/dashboard/sidebarItems";
import { usePathname } from "next/navigation";
import { AppSidebarHeader } from "./app-sidebar-header";
import { AppSidebarFooter } from "./app-sidebar-footer";
import Link from "next/link";
import { useSession } from "next-auth/react";

export function AppSidebar() {
  const pathname = usePathname() || "";
  const { data: session } = useSession();

  const userSidebarItems = {
    application: sidebarItems.application.filter((item) =>
      session?.user?.allowedRoutes?.some((route) => item.url.startsWith(route))
    ),
    management: sidebarItems.management.filter((item) =>
      session?.user?.allowedRoutes?.some((route) => item.url.startsWith(route))
    ),
    settings: sidebarItems.settings.filter((item) =>
      session?.user?.allowedRoutes?.some((route) => item.url.startsWith(route))
    ),
  };

  return (
    <Sidebar collapsible="icon">
      <AppSidebarHeader />
      <SidebarContent>
        {userSidebarItems.application.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="select-none">
              Application
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {userSidebarItems.application.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        pathname === item.url ||
                        (item.url !== "/" && pathname.startsWith(item.url))
                      }
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {userSidebarItems.management.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="select-none">
              Management
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {userSidebarItems.management.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        pathname === item.url ||
                        (item.url !== "/" && pathname.startsWith(item.url))
                      }
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {userSidebarItems.settings.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="select-none">
              Settings
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {userSidebarItems.settings.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        pathname === item.url ||
                        (item.url !== "/" && pathname.startsWith(item.url))
                      }
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="p-2">
        <AppSidebarFooter />
      </SidebarFooter>
    </Sidebar>
  );
}
