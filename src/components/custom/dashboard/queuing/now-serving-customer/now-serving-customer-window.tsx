"use client";

import { useSocket } from "@/components/providers/socket-provider";
import { Button } from "@/components/ui/button";
import { usePlayBell } from "@/hooks/display/usePlayBell";
import { useQueuingTicketStore } from "@/lib/store/dashboard/useQueuingTicketStore";
import { QueuingStatus } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";

export function NowServingCustomerWindow() {
  const {
    nowServingTicket,
    setNowServingTicket,
    previousTicket,
    setPreviousTicket,
    isTicketNumberBlinking,
    setIsTicketNumberBlinking,
  } = useQueuingTicketStore();
  const { socket } = useSocket();
  const session = useSession();

  const { playBell } = usePlayBell();

  const { data: currentTicket, refetch } = useQuery({
    queryKey: ["current-ticket"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_HOST}/api/queuing-tickets/get-current-called-ticket`
        );
        return response.data;
      } catch (error) {
        toast.error("Error fetching current ticket", {
          description: `${error}`,
        });
        return null;
      }
    },
    refetchIntervalInBackground: true,
    refetchOnMount: true,
    refetchInterval: 10000,
  });

  const triggerBlink = useCallback(
    (setIsTicketNumberBlinking: (value: boolean) => void) => {
      setIsTicketNumberBlinking(true);

      let isBlinking = true;
      const blinkInterval = setInterval(() => {
        isBlinking = !isBlinking;
        setIsTicketNumberBlinking(isBlinking);
      }, 500);

      setTimeout(() => {
        clearInterval(blinkInterval);
        setIsTicketNumberBlinking(false);
      }, 2000);
    },
    []
  );

  useEffect(() => {
    if (!socket) return;

    if (session.data?.user?.counterId) {
      socket.emit("join-counter-room", session.data.user.counterId);
    }
  }, [socket, session.data?.user?.counterId]);

  useEffect(() => {
    if (!socket) return;

    const handleBellRang = () => {
      playBell();
      triggerBlink(setIsTicketNumberBlinking);
    };

    const handleDataChange = () => {
      refetch();
    };

    const handleTransactionCompleted = () => {
      refetch();
    };

    socket.on("bell-rang", handleBellRang);
    socket.on("ticket-called", handleDataChange);
    socket.on("ticket-marked-as-lapsed", handleDataChange);
    socket.on("ticket-cancelled", handleDataChange);
    socket.on("ticket-transferred", handleDataChange);
    socket.on("transaction-completed", handleTransactionCompleted);

    return () => {
      socket.off("bell-rang", handleBellRang);
      socket.off("ticket-called", handleDataChange);
      socket.off("ticket-marked-as-lapsed", handleDataChange);
      socket.off("ticket-cancelled", handleDataChange);
      socket.off("ticket-transferred", handleDataChange);
      socket.off("transaction-completed", handleTransactionCompleted);
    };
  }, [playBell, refetch, setIsTicketNumberBlinking, socket, triggerBlink]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "bellRingEvent" && event.newValue) {
        try {
          const eventData = JSON.parse(event.newValue);
          if (eventData.type === "RING_BELL") {
            playBell();
          }
        } catch (error) {
          toast.error("Error", {
            description: `${error}`,
          });
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    const bellEvent = localStorage.getItem("bellRingEvent");
    if (bellEvent) {
      try {
        const eventData = JSON.parse(bellEvent);
        if (eventData.type === "RING_BELL") {
          localStorage.removeItem("bellRingEvent");
        }
      } catch (error) {
        toast.error("Error", {
          description: `${error}`,
        });
      }
    }

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [playBell]);

  useEffect(() => {
    if (
      currentTicket &&
      currentTicket.queuingStatus !== QueuingStatus.COMPLETED
    ) {
      setNowServingTicket(currentTicket);
    } else if (!currentTicket) {
      setNowServingTicket(null);
    }
  }, [currentTicket, setNowServingTicket]);

  useEffect(() => {
    if (
      nowServingTicket?.number &&
      nowServingTicket?.counter?.name &&
      (!previousTicket ||
        previousTicket.number !== nowServingTicket.number ||
        previousTicket.counter?.name !== nowServingTicket.counter?.name)
    ) {
      setPreviousTicket(nowServingTicket);
    }
  }, [nowServingTicket, previousTicket, setPreviousTicket]);

  return (
    <div className="flex flex-col gap-10 items-center justify-between min-h-screen">
      <div className="bg-primary w-full p-4">
        <h2 className="text-8xl font-semibold text-center text-white dark:text-black">
          {nowServingTicket?.counter?.name || "Counter"}
        </h2>
      </div>
      {nowServingTicket?.number ? (
        <h3
          className={`text-[256px] font-bold ${
            isTicketNumberBlinking ? "text-red-500 animate-pulse" : "text-black"
          }`}
        >
          {nowServingTicket.number}
        </h3>
      ) : (
        <h3 className="text-[144px] font-bold text-gray-200">---</h3>
      )}

      <h2 className="text-7xl">Now Serving</h2>

      <div className="place-self-start m-5">
        <Button onClick={playBell} size="sm">
          Test Bell Ring
        </Button>
      </div>
    </div>
  );
}
