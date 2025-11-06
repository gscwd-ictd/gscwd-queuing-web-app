import { Droplet } from "lucide-react";
import { cn } from "@/lib/utils";

type AppLogoHeaderProps = {
  className?: string;
};

export function AppLogoHeader({ className }: AppLogoHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-row gap-1 items-center m-2 text-primary",
        className
      )}
    >
      <Droplet size={32} />
      <div className="flex flex-col">
        <h1 className="font-bold leading-none text-lg">GSCWD</h1>
        <span className="text-xs leading-none text-nowrap">Queuing App</span>
      </div>
    </div>
  );
}
