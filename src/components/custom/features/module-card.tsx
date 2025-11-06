import { LucideIcon } from "lucide-react";
import Link from "next/link";

type ModuleCardProps = {
  name: string;
  link: string;
  icon: LucideIcon;
};

export function ModuleCard({ name, link, icon: Icon }: ModuleCardProps) {
  return (
    <Link href={link}>
      <div className="text-gray-800 hover:text-white bg-white hover:bg-blue-800 hover:transition-all p-3 flex flex-col gap-2 items-center rounded-md w-36 drop-shadow-md">
        <Icon className="w-6 h-6" />
        <p className="font-semibold">{name}</p>
      </div>
    </Link>
  );
}
