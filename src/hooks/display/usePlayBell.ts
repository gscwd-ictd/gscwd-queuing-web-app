"use client";

import { useCallback, useRef } from "react";
import { toast } from "sonner";

export const usePlayBell = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playBell = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio("/assets/audios/bell.mp3");
        audioRef.current.preload = "auto";
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } catch (error) {
      toast.error("Play bell error", { description: `${error}` });
    }
  }, []);

  return { playBell };
};
