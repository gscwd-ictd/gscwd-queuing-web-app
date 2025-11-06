"use client";

import { CounterDisplayTable } from "@/components/custom/display/counter-display-table";
import { useSocket } from "@/components/providers/socket-provider";
import { handleCallTicketTTS } from "@/lib/functions/dashboard/queuing/handleCallTicketTTS";
import { Counter } from "@/lib/types/prisma/counter";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import Image from "next/image";
import {
  NowServingTicket,
  QueuingTicket,
} from "@/lib/types/prisma/queuingTicket";
import { usePlayBell } from "@/hooks/display/usePlayBell";
import { DisplayPageHeader } from "@/components/custom/display/display-page-header";

export default function CustomerWelfareCounterDisplay() {
  const { socket } = useSocket();
  const [blinkingCounters, setBlinkingCounters] = useState<Set<string>>(
    new Set()
  );
  const blinkIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const { playBell } = usePlayBell();

  const { data: countersData, refetch } = useQuery({
    queryKey: ["get-cw-nsa-counters"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_HOST}/api/counters/get-all-now-serving-counters`
        );

        if (response.data.customerWelfare.length === 0) {
          toast.info("Info", {
            description: "No customer welfare counters found",
          });
        }

        if (response.data.newServiceApplication.length === 0) {
          toast.info("Info", {
            description: "No new service application counters found",
          });
        }

        return response.data;
      } catch (error) {
        toast.error("Error fetching counters", { description: `${error}` });
        return { customerWelfare: [], newServiceApplication: [] };
      }
    },
    refetchIntervalInBackground: true,
    refetchOnMount: true,
    refetchInterval: 10000,
  });

  // * Trigger blink for ticket number that has been rang by the counter
  const triggerBlink = useCallback((counterCode: string) => {
    const existingInterval = blinkIntervalsRef.current.get(counterCode);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    const blinkInterval = setInterval(() => {
      setBlinkingCounters((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(counterCode)) {
          newSet.delete(counterCode);
        } else {
          newSet.add(counterCode);
        }
        return newSet;
      });
    }, 500);

    blinkIntervalsRef.current.set(counterCode, blinkInterval);

    setTimeout(() => {
      const interval = blinkIntervalsRef.current.get(counterCode);
      if (interval) {
        clearInterval(interval);
        blinkIntervalsRef.current.delete(counterCode);
      }
      setBlinkingCounters((prev) => {
        const newSet = new Set(prev);
        newSet.delete(counterCode);
        return newSet;
      });
    }, 2000);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleBellRang = (
      data: Partial<QueuingTicket> & { counterCode: string }
    ) => {
      if (!data.counterCode) return;
      playBell();
      triggerBlink(data.counterCode);
    };

    const handleTicketCalled = (data: NowServingTicket) => {
      const isCustomerWelfareCounter = countersData?.customerWelfare.some(
        (counter: Counter) => counter.code === data.counter.code
      );

      const isNewServiceApplicationCounter =
        countersData?.newServiceApplication.some(
          (counter: Counter) => counter.code === data.counter.code
        );

      if (
        data.number &&
        data.counter.code &&
        (isCustomerWelfareCounter || isNewServiceApplicationCounter)
      ) {
        handleCallTicketTTS({ ticket: data });
        triggerBlink(data.counter.code);
      }

      refetch();
    };

    const handleDataChange = () => {
      refetch();
    };

    socket.on("bell-rang", handleBellRang);
    socket.on("ticket-called", handleTicketCalled);
    socket.on("ticket-transferred", handleDataChange);
    socket.on("ticket-marked-as-lapsed", handleDataChange);
    socket.on("ticket-cancelled", handleDataChange);
    socket.on("transaction-completed", handleDataChange);

    return () => {
      socket.off("bell-rang", handleBellRang);
      socket.off("ticket-called", handleTicketCalled);
      socket.off("ticket-transferred", handleDataChange);
      socket.off("ticket-marked-as-lapsed", handleDataChange);
      socket.off("ticket-cancelled", handleDataChange);
      socket.off("transaction-completed", handleDataChange);
    };
  }, [
    socket,
    refetch,
    countersData?.customerWelfare,
    countersData?.newServiceApplication,
    playBell,
    triggerBlink,
  ]);

  return (
    <>
      <div className="flex flex-col min-h-screen w-full overflow-hidden dark:bg-black/10 relative select-none">
        <Image
          src="/assets/images/background-image.png"
          alt="GSCWD Background Image"
          fill
          className="object-cover -z-10 opacity-15"
          priority
          quality={100}
          sizes="100vw"
        />
        <DisplayPageHeader />
        <div className="flex-1 flex flex-col p-4">
          {countersData && (
            <div className="flex flex-col overflow-auto gap-2">
              <CounterDisplayTable
                counters={countersData.customerWelfare.filter(
                  (counter: Counter) => counter.code !== "CW-4"
                )}
                blinkingCounters={blinkingCounters}
                tableName={"Customer Welfare"}
              />
              <CounterDisplayTable
                counters={countersData.newServiceApplication}
                blinkingCounters={blinkingCounters}
                tableName={"New Service Application"}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
