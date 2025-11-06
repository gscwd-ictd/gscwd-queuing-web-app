"use client";

import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { BellRing, Check, PictureInPicture2, Play, X } from "lucide-react";
import { toast } from "sonner";
import { CompleteTransactionModal } from "../complete-transaction-modal";
import { useQueuingTicketStore } from "@/lib/store/dashboard/useQueuingTicketStore";
import { useEffect, useRef, useState } from "react";
import {
  differenceInSeconds,
  format,
  intervalToDuration,
  startOfDay,
} from "date-fns";
import { useSession } from "next-auth/react";
import { TransferTicketModal } from "../transfer-ticket-modal";
import { useSocket } from "@/components/providers/socket-provider";
import { ButtonWithShortcutKey } from "@/components/custom/features/button-with-shortcut-key";
import {
  getPaymentTransactionId,
  getTransactionIdsExceptPaymentId,
} from "@/lib/functions/dashboard/queuing/getTransactionIds";
import { QueuingStatus } from "@prisma/client";
import { ServiceType } from "@/lib/types/prisma/serviceType";
import { QueuingTicket } from "@/lib/types/prisma/queuingTicket";

export function NowServingCustomerComponent() {
  const session = useSession();
  const queryClient = useQueryClient();
  const {
    nowServingTicket,
    setNowServingTicket,
    clearNowServingTicket,
    elapsedTime,
    setElapsedTime,
    isTimerPaused,
    totalPausedDuration,
    dateTransactionEnded,
    resetTimerState,
    dateTransactionStarted,
  } = useQueuingTicketStore();
  const timerRef = useRef<number | null>(null);
  const displayWindowRef = useRef<Window | null>(null);
  const { socket } = useSocket();

  const [open, setOpen] = useState(false);

  const startTransactionHotkey =
    session.data?.user.startTransactionHotkey || null;
  const ringHotkey = session.data?.user.ringHotkey || null;
  const markAsLapsedHotkey = session.data?.user.markAsLapsedHotkey || null;
  const completeTransactionHotkey =
    session.data?.user.completeTransactionHotkey || null;

  const { data: currentTicket, refetch } = useQuery({
    queryKey: ["get-current-ticket-called"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_HOST}/api/queuing-tickets/get-current-called-ticket`
        );
        if (
          response.data &&
          response.data.queuingStatus !== QueuingStatus.COMPLETED
        ) {
          setNowServingTicket(response.data);
          return response.data;
        }
        setNowServingTicket(null);
        return null;
      } catch (error) {
        toast.error("Error fetching current ticket", {
          description: `${error}`,
        });
        return null;
      }
    },
  });

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (displayWindowRef.current && !displayWindowRef.current.closed) {
        displayWindowRef.current.close();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (displayWindowRef.current && !displayWindowRef.current.closed) {
        displayWindowRef.current.close();
      }
    };
  }, []);

  const { data: transactions } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/transactions`
      );
      return data;
    },
  });

  const { data: serviceTypes } = useQuery<ServiceType[]>({
    queryKey: ["get-all-service-types"],
    queryFn: async () => {
      const response = await axios.get<ServiceType[]>(
        `${process.env.NEXT_PUBLIC_HOST}/api/service-types`
      );
      return response.data;
    },
  });

  const hasAccessToTransferFeature =
    session.data?.user?.assignedTransactionId &&
    getPaymentTransactionId(transactions).includes(
      session.data.user.assignedTransactionId
    );

  const hasAccessToNowServingWindow =
    session.data?.user.assignedTransactionId &&
    getTransactionIdsExceptPaymentId(transactions).includes(
      session.data.user.assignedTransactionId
    );

  const hasAccessToRingButton =
    session.data?.user.assignedTransactionId &&
    getTransactionIdsExceptPaymentId(transactions).includes(
      session.data.user.assignedTransactionId
    );

  const hasAccessToTimer =
    session.data?.user.assignedTransactionId &&
    getTransactionIdsExceptPaymentId(transactions).includes(
      session.data.user.assignedTransactionId
    );

  const hasAccessToCompleteTransactionModal =
    session.data?.user.assignedTransactionId &&
    getTransactionIdsExceptPaymentId(transactions).includes(
      session.data.user.assignedTransactionId
    );

  useEffect(() => {
    if (nowServingTicket?.dateTransactionStarted) {
      const startTime = new Date(nowServingTicket.dateTransactionStarted);

      const updateTimer = () => {
        const now = new Date();

        const adjustedNow = new Date(now.getTime() - totalPausedDuration);

        const duration = intervalToDuration({
          start: startTime,
          end: adjustedNow,
        });

        const formattedTime = format(
          new Date(
            startOfDay(new Date()).setHours(
              duration.hours || 0,
              duration.minutes || 0,
              duration.seconds || 0
            )
          ),
          "HH:mm:ss"
        );

        setElapsedTime(formattedTime);
      };

      updateTimer();

      if (!isTimerPaused) {
        timerRef.current = window.setInterval(updateTimer, 1000);
      }

      return () => {
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
        }
      };
    } else {
      setElapsedTime("00:00:00");
      resetTimerState();
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    }
  }, [
    nowServingTicket?.dateTransactionStarted,
    setElapsedTime,
    totalPausedDuration,
    isTimerPaused,
    resetTimerState,
  ]);

  /**
   * ? Opens the complete transaction modal if elapsedTime reaches 300s, checks in a minute after it's closed.
   * ? There might be better implementation for this.
   */

  useEffect(() => {
    if (
      !hasAccessToCompleteTransactionModal ||
      !nowServingTicket ||
      !nowServingTicket?.dateTransactionStarted
    )
      return;

    const startTime = new Date(nowServingTicket.dateTransactionStarted);

    const interval = setInterval(() => {
      const now = new Date();

      const elapsedSeconds =
        differenceInSeconds(now, startTime) -
        Math.floor(totalPausedDuration / 1000);

      if (elapsedSeconds >= 300) {
        setOpen((prev) => prev || true);
        clearInterval(interval);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [
    hasAccessToCompleteTransactionModal,
    nowServingTicket,
    nowServingTicket?.dateTransactionStarted,
    totalPausedDuration,
  ]);

  useEffect(() => {
    if (currentTicket) {
      setNowServingTicket(currentTicket);
    }
  }, [currentTicket, setNowServingTicket]);

  const handleRingBell = () => {
    if (!socket) return;

    if (nowServingTicket && session.data?.user.counterId) {
      socket.emit("ring-bell", {
        counterId: session.data.user.counterId,
        counterCode: nowServingTicket.counter.code,
        ticketData: {
          id: nowServingTicket.id,
          number: nowServingTicket.number,
          counterId: nowServingTicket.counterId,
        },
      });
    }

    toast.success("Bell rang", {
      description: "Customer has been notified",
    });
  };

  const handleOpenDisplayWindow = () => {
    displayWindowRef.current = window.open(
      "/display/now-serving-customer",
      "_blank",
      "noopener,noreferrer,width=1200,height=800"
    );
  };

  const startTransaction = useMutation({
    mutationFn: async (ticketId: string) => {
      const transactionStartDate = dateTransactionStarted || new Date();

      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_HOST}/api/queuing-tickets/update-queuing-ticket/start-transaction`,
        {
          ticketId,
          dateTransactionStarted: transactionStartDate,
        }
      );
      return data;
    },
    onSuccess: (updatedTicket) => {
      toast.success("Transaction started", {
        description: "Customer is now being served",
      });
      setNowServingTicket(updatedTicket);
      const queriesToInvalidate = [
        ["get-all-regular-queuing-tickets"],
        ["get-all-special-lane-queuing-tickets"],
        ["get-all-lapsed-queuing-tickets"],
        ["get-all-incoming-queuing-tickets"],
        ["get-all-transferred-queuing-tickets"],
        ["get-current-ticket-called"],
        ["current-ticket"],
        ["get-cw-nsa-counters"],

        ["get-payment-counters"],
      ];
      queriesToInvalidate.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });

      if (!socket) return;

      if (updatedTicket) {
        socket.emit("start-transaction", {
          id: updatedTicket.id,
          number: updatedTicket.number,
          counterId: updatedTicket.counterId || "",
        });
      }
    },
    onError: (error) => {
      toast.error("Error", {
        description: `${error}`,
      });
    },
  });

  const markAsLapsed = useMutation({
    mutationFn: async (ticketId: string) => {
      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_HOST}/api/queuing-tickets/update-queuing-ticket/mark-as-lapsed`,
        {
          ticketId,
        }
      );
      return data;
    },
    onSuccess: (lapsedTicket: Partial<QueuingTicket>) => {
      if (
        lapsedTicket.timesTicketLapsed &&
        lapsedTicket.timesTicketLapsed >= 5
      ) {
        toast.error("Ticket has been cancelled", {
          description: `${lapsedTicket.number} has been cancelled after it lapsed 5 times`,
        });
      } else {
        toast.info("Ticket marked as lapsed", {
          description: `${lapsedTicket.number} has been marked as lapsed`,
        });
      }
      setNowServingTicket(null);

      const queriesToInvalidate = [
        ["get-all-regular-queuing-tickets"],
        ["get-all-special-lane-queuing-tickets"],
        ["get-all-lapsed-queuing-tickets"],
        ["get-all-incoming-queuing-tickets"],
        ["get-all-transferred-queuing-tickets"],
        ["get-current-ticket-called"],
        ["current-ticket"],
        ["get-cw-nsa-counters"],

        ["get-payment-counters"],
      ];
      queriesToInvalidate.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });

      if (!socket) return;
      const timesLapsed = lapsedTicket.timesTicketLapsed ?? 0;

      if (timesLapsed >= 5) {
        socket.emit("cancel-ticket", {
          id: lapsedTicket.id,
          number: lapsedTicket.number,
          counterId: "",
        });
      } else {
        socket.emit("mark-ticket-as-lapsed", {
          id: lapsedTicket.id,
          number: lapsedTicket.number,
          counterId: "",
        });
      }
    },
    onError: (error) => {
      toast.error("Error marking ticket as lapsed", {
        description: `${error}`,
      });
    },
  });

  const completePaymentTransaction = useMutation({
    mutationFn: async () => {
      if (!serviceTypes || serviceTypes.length === 0) {
        throw new Error("No service types available");
      }

      const serviceTypeId = serviceTypes[0].id;

      const transactionEndDate =
        dateTransactionEnded || new Date().toISOString();

      if (!nowServingTicket?.id) {
        throw new Error("No ticket selected");
      }
      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_HOST}/api/queuing-tickets/update-queuing-ticket/complete-transaction`,
        {
          ticketId: nowServingTicket.id,
          serviceTypeId: serviceTypeId,
          remarks: "",
          dateTransactionEnded: transactionEndDate,
        }
      );
      return data;
    },
    onSuccess: (completedTicket) => {
      toast.success("Transaction completed", {
        description: "Customer has been served successfully",
      });
      clearNowServingTicket();
      const queriesToInvalidate = [
        ["get-user-stats"],
        ["get-all-regular-queuing-tickets"],
        ["get-all-special-lane-queuing-tickets"],
        ["get-all-lapsed-queuing-tickets"],
        ["get-all-incoming-queuing-tickets"],
        ["get-all-transferred-queuing-tickets"],
        ["get-current-ticket-called"],
        ["current-ticket"],
        ["get-cw-nsa-counters"],

        ["get-payment-counters"],
      ];
      queriesToInvalidate.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });

      if (!socket) return;

      if (completedTicket) {
        socket.emit("complete-transaction", {
          id: completedTicket.id,
          name: completedTicket.name,
          counterId: completedTicket.counterId,
        });
      }
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message,
      });
      return;
    },
  });

  const handleStartTransaction = () => {
    if (!nowServingTicket?.id) return;
    startTransaction.mutate(nowServingTicket.id);
  };

  const handleMarkAsLapsed = () => {
    if (!nowServingTicket?.id) return;
    markAsLapsed.mutate(nowServingTicket.id);
  };

  const handleCompletePaymentTransaction = () => {
    if (!nowServingTicket?.id) return;
    completePaymentTransaction.mutate();
  };

  useEffect(() => {
    if (!socket) return;

    const handleDataChange = () => {
      refetch();
    };

    socket.on("transaction-started", handleDataChange);
    socket.on("ticket-marked-as-lapsed", handleDataChange);
    socket.on("ticket-transferred", handleDataChange);
    socket.on("ticket-cancelled", handleDataChange);
    socket.on("transaction-completed", handleDataChange);

    return () => {
      socket.off("transaction-started", handleDataChange);
      socket.off("ticket-marked-as-lapsed", handleDataChange);
      socket.off("ticket-cancelled", handleDataChange);
      socket.off("ticket-transferred", handleDataChange);
      socket.off("transaction-completed", handleDataChange);
    };
  }, [socket, refetch]);

  return (
    <div className="flex flex-col justify-start gap-10 border border-gray-200 p-2 h-full w-full overflow-auto">
      <div className="relative flex flex-col items-center gap-6 ">
        {hasAccessToNowServingWindow && (
          <Button
            className={`absolute top-0 right-0 select-none`}
            size={"icon"}
            onClick={handleOpenDisplayWindow}
          >
            <PictureInPicture2 />
          </Button>
        )}

        <h2 className="text-4xl font-bold">NOW SERVING</h2>
        <span
          className={`text-[3vw] max-w-full truncate h-full ${
            nowServingTicket?.number
              ? "text-green-700"
              : "text-gray-500 dark:text-white"
          } `}
          title={nowServingTicket?.number || "---"}
        >
          {nowServingTicket?.number || "---"}
        </span>

        {hasAccessToTimer && (
          <div className="text-2xl font-mono bg-gray-100 px-4 py-2 w-40 flex flex-col items-center dark:text-black">
            <span>{elapsedTime}</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <ButtonWithShortcutKey
          shortcutKey={startTransactionHotkey}
          size={"lg"}
          onClick={handleStartTransaction}
          className={`select-none ${
            !nowServingTicket ||
            nowServingTicket.queuingStatus === QueuingStatus.NOW_SERVING ||
            nowServingTicket.queuingStatus === QueuingStatus.COMPLETED
              ? "bg-gray-500 text-white"
              : ""
          }`}
          disabled={
            !nowServingTicket ||
            nowServingTicket.queuingStatus === QueuingStatus.NOW_SERVING ||
            nowServingTicket.queuingStatus === QueuingStatus.COMPLETED
          }
        >
          <Play />
          Start
        </ButtonWithShortcutKey>
        {hasAccessToCompleteTransactionModal ? (
          <CompleteTransactionModal open={open} setOpen={setOpen} />
        ) : (
          <ButtonWithShortcutKey
            shortcutKey={completeTransactionHotkey}
            onClick={handleCompletePaymentTransaction}
            size={"lg"}
            variant={"default"}
            className={`select-none
             ${
               !nowServingTicket ||
               nowServingTicket.queuingStatus !== QueuingStatus.NOW_SERVING
                 ? "bg-gray-500 text-white"
                 : ""
             }
            `}
            disabled={
              !nowServingTicket ||
              nowServingTicket.queuingStatus !== QueuingStatus.NOW_SERVING
            }
          >
            <Check />
            Complete
          </ButtonWithShortcutKey>
        )}
        {hasAccessToTransferFeature && <TransferTicketModal />}
        {hasAccessToRingButton && (
          <ButtonWithShortcutKey
            shortcutKey={ringHotkey}
            size={"lg"}
            onClick={handleRingBell}
            variant={"outline"}
            className={`select-none ${
              !nowServingTicket ||
              nowServingTicket.queuingStatus === QueuingStatus.NOW_SERVING
                ? "bg-gray-500 text-white"
                : "text-black"
            }`}
            disabled={
              !nowServingTicket ||
              nowServingTicket.queuingStatus === QueuingStatus.NOW_SERVING
            }
          >
            <BellRing />
            Ring
          </ButtonWithShortcutKey>
        )}
        <ButtonWithShortcutKey
          shortcutKey={markAsLapsedHotkey}
          size={"lg"}
          variant={"destructive"}
          onClick={handleMarkAsLapsed}
          className={`select-none ${
            !nowServingTicket ||
            nowServingTicket.queuingStatus === QueuingStatus.NOW_SERVING ||
            nowServingTicket.queuingStatus === QueuingStatus.COMPLETED
              ? "bg-gray-500 text-white"
              : ""
          }`}
          disabled={
            !nowServingTicket ||
            nowServingTicket.queuingStatus === QueuingStatus.NOW_SERVING ||
            nowServingTicket.queuingStatus === QueuingStatus.COMPLETED
          }
        >
          <X />
          Mark As Lapsed
        </ButtonWithShortcutKey>
      </div>
    </div>
  );
}
