import { LucideIcon, Monitor, Settings, User } from "lucide-react";

type Module = {
  name: string;
  link: string;
  icon: LucideIcon;
};

export const modules: Module[] = [
  {
    name: "Kiosk",
    link: "kiosk",
    icon: Settings,
  },
  {
    name: "Display",
    link: "display",
    icon: Monitor,
  },
  {
    name: "Dashboard",
    link: "login",
    icon: User,
  },
];
