"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AppLogoHeader } from "./app-logo-header";

export function LoadingSplashScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    handleStart();
    const timer = setTimeout(handleComplete, 4000);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 bg-white dark:bg-black backdrop-blur-3xl flex items-center justify-center z-50">
      <AppLogoHeader className="scale-150 animate-bounce fade-out-10" />
    </div>
  );
}
