"use client";

import { useSocket } from "@/components/providers/socket-provider";
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
  const { data: session, status } = useSession();

  const { playBell } = usePlayBell();

  const { data: counter } = useQuery({
    queryKey: ["get-current-counter-by-counter-id", session?.user?.counterId],
    queryFn: async () => {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/counters/${session?.user?.counterId}`,
      );
      return data;
    },
    enabled: status === "authenticated" && !!session?.user?.counterId,
    refetchInterval: false,
    refetchIntervalInBackground: false,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: 10000,
  });

  const { data: currentTicket, refetch } = useQuery({
    queryKey: ["current-ticket"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_HOST}/api/queuing-tickets/get-current-called-ticket`,
        );
        return response.data;
      } catch (error) {
        toast.error("Error fetching current ticket", {
          description: `${error}`,
        });
        return null;
      }
    },
    enabled: true,
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
    [],
  );

  useEffect(() => {
    if (!socket) return;

    if (session?.user?.counterId) {
      socket.emit("join-counter-room", session.user.counterId);
    }
  }, [socket, session?.user?.counterId]);

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
      <div className="bg-primary w-full">
        {counter ? (
          <h2 className="text-[275px] font-bold text-center text-white dark:text-black uppercase leading-none">
            {counter?.code}
          </h2>
        ) : nowServingTicket ? (
          <h2 className="text-[275px] font-bold text-center text-white dark:text-black uppercase leading-none">
            {nowServingTicket?.counter.code}
          </h2>
        ) : (
          <h2 className="text-[275px] font-bold text-center text-white dark:text-black uppercase leading-none">
            &nbsp;
          </h2>
        )}
      </div>
      {nowServingTicket?.number ? (
        <h3
          className={`text-[310px] leading-none font-bold ${
            isTicketNumberBlinking ? "text-red-500 animate-pulse" : "text-black"
          }`}
        >
          {nowServingTicket.number}
        </h3>
      ) : (
        <h3 className="text-[310px] leading-none font-bold text-gray-200">
          ---
        </h3>
      )}

      <h2 className="text-[120px] uppercase text-green-500 font-bold">
        Now Serving
      </h2>
    </div>
  );
}
