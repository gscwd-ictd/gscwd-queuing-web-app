"use client";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function CustomSidebarTrigger() {
  const { toggleSidebar, state } = useSidebar();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative">
      <Button
        size="sm"
        onClick={toggleSidebar}
        className="rounded-full m-2 transition-all duration-300 ease-in-out"
        variant={"default"}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center gap-2">
          {state === "expanded" ? <ArrowLeft /> : <ArrowRight />}
          <AnimatePresence>
            {isHovered && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap overflow-hidden"
              >
                {state === "expanded" ? "Collapse Sidebar" : "Expand Sidebar"}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </Button>
    </div>
  );
}
