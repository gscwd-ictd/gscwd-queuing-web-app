import { LucideIcon, HandCoins, Heart } from "lucide-react";

type CounterDisplay = {
  name: string;
  link: string;
  icon: LucideIcon;
};

export const counterDisplays: CounterDisplay[] = [
  {
    name: "Customer Welfare | New Service Application",
    link: "/display/cw-nsa",
    icon: Heart,
  },
  {
    name: "Payment",
    link: "/display/payment",
    icon: HandCoins,
  },
];
