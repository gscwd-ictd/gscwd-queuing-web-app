import { LucideIcon } from "lucide-react";
import Link from "next/link";

type CounterDisplayCardProps = {
  name: string;
  link: string;
  icon: LucideIcon;
};

export function CounterDisplayCard({
  name,
  link,
  icon: Icon,
}: CounterDisplayCardProps) {
  return (
    <Link href={link}>
      <div className="text-gray-800 hover:text-white bg-white hover:bg-blue-800 hover:transition-all p-3 flex flex-col gap-1 items-center rounded-md w-full drop-shadow-md">
        <Icon className="w-12 h-12" />
        <p className="font-semibold text-2xl">{name}</p>
      </div>
    </Link>
  );
}
