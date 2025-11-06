import { cn } from "@/lib/utils";
import { LoaderIcon } from "lucide-react";

type LoadingIndicatorProps = {
  className?: string;
};

export function LoadingIndicator({ className }: LoadingIndicatorProps) {
  return (
    <div
      className={cn(
        "flex flex-row justify-center items-center gap-2 w-full h-full",
        className
      )}
    >
      <p className="text-sm font-semibold">Loading...</p>
      <LoaderIcon className="h-9 animate-spin" />
    </div>
  );
}
