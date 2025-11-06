"use client";

import { DisplayPageHeader } from "@/components/custom/display/display-page-header";
import { useSocket } from "@/components/providers/socket-provider";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePlayBell } from "@/hooks/display/usePlayBell";
import { CounterWithTicket } from "@/lib/types/prisma/counter";
import { NowServingTicket } from "@/lib/types/prisma/queuingTicket";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function PaymentCounterDisplay() {
  const { socket } = useSocket();
  const [blinkingCounters, setBlinkingCounters] = useState<Set<string>>(
    new Set()
  );
  const blinkIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const { playBell } = usePlayBell();

  const { data: countersData, refetch } = useQuery<{
    payment: CounterWithTicket[];
  }>({
    queryKey: ["get-payment-counters"],
    queryFn: async () => {
      try {
        const response = await axios.get<{ payment: CounterWithTicket[] }>(
          `${process.env.NEXT_PUBLIC_HOST}/api/counters/get-all-now-serving-counters`
        );

        if (response.data.payment.length === 0) {
          toast.info("Info", {
            description: "No payment counters found",
          });
        }

        return response.data;
      } catch (error) {
        toast.error("Error fetching counters", { description: `${error}` });
        return { payment: [] };
      }
    },
    refetchIntervalInBackground: true,
    refetchOnMount: true,
    refetchInterval: 10000,
  });

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

    const handleTicketCalled = (data: NowServingTicket) => {
      const isPaymentCounter = countersData?.payment.some(
        (counter) => counter.code === data.counter.code
      );

      if (data.number && data.counter.code && isPaymentCounter) {
        playBell();
        triggerBlink(data.counter.code);
      }

      refetch();
    };

    const handleDataChange = () => {
      refetch();
    };

    socket.on("ticket-called", handleTicketCalled);
    socket.on("ticket-transferred", handleDataChange);
    socket.on("ticket-marked-as-lapsed", handleDataChange);
    socket.on("ticket-cancelled", handleDataChange);
    socket.on("transaction-completed", handleDataChange);

    return () => {
      socket.off("ticket-called", handleTicketCalled);
      socket.off("ticket-transferred", handleDataChange);
      socket.off("ticket-marked-as-lapsed", handleDataChange);
      socket.off("ticket-cancelled", handleDataChange);
      socket.off("transaction-completed", handleDataChange);
    };
  }, [socket, refetch, countersData?.payment, playBell, triggerBlink]);

  return (
    <>
      <div className="flex flex-col min-h-screen w-full overflow-hidden dark:bg-black/10 relative select-none">
        <Image
          src="/assets/images/background-image.png"
          alt="GSCWD Background Image"
          fill
          className="object-cover -z-10 opacity-20"
          priority
          quality={100}
          sizes="100vw"
        />
        <DisplayPageHeader />
        <div className="flex-1 flex flex-col p-4">
          <div className="flex-1 overflow-auto">
            <Table className="h-full bg-white rounded-md drop-shadow-md border-2 border-gray-800">
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead
                    colSpan={2}
                    className="text-center text-[100px] font-bold p-3 bg-primary text-white leading-none"
                  >
                    PAYMENT
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {countersData?.payment.map((counter) => (
                  <TableRow
                    key={counter.code}
                    className="text-[200px] leading-none border-b-2 border-gray-800"
                  >
                    <TableCell className="text-left font-semibold p-6 leading-none">
                      {counter.code}
                    </TableCell>
                    <TableCell
                      className={`text-right font-bold py-25 leading-none ${
                        blinkingCounters.has(counter.code ?? "")
                          ? "text-red-500 animate-pulse"
                          : "text-black"
                      }`}
                    >
                      {counter.queuingTicket?.number ?? (
                        <span className="text-gray-300">---</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="place-self-start m-5">
          <Button onClick={playBell} size="sm">
            Test Bell Ring
          </Button>
        </div>
      </div>
    </>
  );
}
