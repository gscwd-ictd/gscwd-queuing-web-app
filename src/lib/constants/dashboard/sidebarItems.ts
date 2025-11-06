import {
  FileText,
  Home,
  Images,
  ListOrdered,
  LucideIcon,
  Monitor,
  Settings,
  UserRound,
  UsersRound,
  Wrench,
} from "lucide-react";

type SidebarItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

export const sidebarItems = {
  application: [
    {
      title: "Home",
      url: "/home",
      icon: Home,
    },
    {
      title: "Queuing",
      url: "/queuing",
      icon: ListOrdered,
    },
    {
      title: "Reports",
      url: "/reports",
      icon: FileText,
    },
  ] as SidebarItem[],
  management: [
    {
      title: "Transactions",
      url: "/transactions",
      icon: Wrench,
    },
    {
      title: "Counters",
      url: "/counters",
      icon: Monitor,
    },
    {
      title: "Personnel",
      url: "/personnel",
      icon: UsersRound,
    },
    {
      title: "Screensavers",
      url: "/screensavers",
      icon: Images,
    },
  ] as SidebarItem[],
  settings: [
    {
      title: "Users",
      url: "/users",
      icon: UserRound,
    },
    {
      title: "System Logs",
      url: "/system-logs",
      icon: Settings,
    },
  ],
};
