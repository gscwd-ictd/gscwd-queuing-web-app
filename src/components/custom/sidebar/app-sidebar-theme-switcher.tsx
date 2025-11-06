"use client";

import { ComputerIcon, LoaderIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs";
import { useEffect, useState } from "react";

export const AppSidebarThemeSwitcher = () => {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted)
    return (
      <div className="flex flex-row justify-end items-center gap-2 p-4 w-full h-full">
        <p className="text-sm font-semibold">Loading...</p>
        <LoaderIcon className="h-9 animate-spin" />
      </div>
    );

  return (
    <Tabs value={theme} onValueChange={setTheme}>
      <TabsList className="flex gap-0 rounded-full border bg-inherit p-0.5">
        <TabsTrigger value="system" className="h-full rounded-full">
          <ComputerIcon className="size-3" />
        </TabsTrigger>
        <TabsTrigger value="light" className="h-full rounded-full">
          <SunIcon className="size-3" />
        </TabsTrigger>
        <TabsTrigger value="dark" className="h-full rounded-full">
          <MoonIcon className="size-3" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
