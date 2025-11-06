"use client";

import { useState, type FunctionComponent } from "react";
import { Bell, EllipsisVertical, KeyRound, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { AppSidebarThemeSwitcher } from "./app-sidebar-theme-switcher";

import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ChangePasswordModal } from "../dashboard/users/change-password-modal";

export const AppSidebarFooter: FunctionComponent = () => {
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const { isMobile } = useSidebar();
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({
      callbackUrl: `${process.env.NEXT_PUBLIC_HOST}/login`,
      redirect: true,
    });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={`${process.env.NEXT_PUBLIC_EMPLOYEE_AVATARS}/${
                    session?.user?.imageUrl ?? ""
                  }`}
                />
                <AvatarFallback className="rounded-lg">
                  {session?.user?.firstName?.[0]}
                  {session?.user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {session?.user?.firstName} {session?.user?.lastName}
                </span>
                <span className="truncate text-xs">{session?.user?.email}</span>
              </div>
              <EllipsisVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "top"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={session?.user?.imageUrl ?? ""} alt={""} />
                  <AvatarFallback className="rounded-lg">
                    {session?.user?.firstName?.[0]}
                    {session?.user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {session?.user?.firstName} {session?.user?.lastName}
                  </span>
                  <span className="truncate text-xs">
                    {session?.user?.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => {
                  router.push("/notifications");
                }}
              >
                <Bell />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setIsChangePasswordModalOpen(true);
                }}
              >
                <KeyRound />
                Reset password
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <ChangePasswordModal
              open={isChangePasswordModalOpen}
              setOpen={setIsChangePasswordModalOpen}
            />
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <div className="flex items-center justify-between gap-2 px-2">
                <span className="text-sm dark:text-gray-400">Theme</span>
                <AppSidebarThemeSwitcher />
              </div>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
