import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { useSocket } from "@/components/providers/socket-provider";
import { useQueuingTicketStore } from "@/lib/store/dashboard/useQueuingTicketStore";
import { TicketWithCounter } from "@/lib/types/prisma/queuingTicket";
import { useEffect, useMemo } from "react";

export function useCallNextTicket() {
  const queryClient = useQueryClient();
  const { setNowServingTicket, setSelectedIncomingQueuingTicketId } =
    useQueuingTicketStore();
  const { socket } = useSocket();

  const queriesToInvalidate = useMemo(
    () => [
      "get-all-regular-queuing-tickets",
      "get-all-special-lane-queuing-tickets",
      "get-all-lapsed-queuing-tickets",
      "get-all-incoming-queuing-tickets",
      "get-all-transferred-queuing-tickets",
      "get-current-ticket-called",
      "current-ticket",
      "get-cw-nsa-counters",
      "get-payment-counters",
    ],
    []
  );

  const callNextTicket = useMutation({
    mutationFn: async ({
      route,
      ticketId,
    }: {
      route: string;
      ticketId?: string;
    }) => {
      const { data } = await axios.put(route, { ticketId });
      return data;
    },
    onSuccess: (updatedTicket: TicketWithCounter) => {
      toast.success("Success", {
        description: `Called ticket ${updatedTicket.number}`,
      });
      setNowServingTicket(updatedTicket);
      setSelectedIncomingQueuingTicketId("");
      queriesToInvalidate.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] })
      );

      if (socket && updatedTicket) {
        socket.emit("call-ticket", {
          id: updatedTicket.id,
          number: updatedTicket.number,
          isPrioritized: updatedTicket.isPrioritized,
          counter: {
            id: updatedTicket.counter?.id,
            name: updatedTicket.counter?.name,
            code: updatedTicket.counter?.code,
          },
          transaction: {
            transaction: updatedTicket.transaction?.name,
          },
        });
      }
    },
    // onError: (error) => {
    //   toast.error("Failed to call next ticket", {
    //     description: `${error}`,
    //   });
    // },
    onError: (error: AxiosError) => {
      console.error("Call Next Ticket Error:", error);
      toast.error("Failed to call next incoming ticket", {
        description: error.message || "Unexpected server error",
      });
    },
  });

  useEffect(() => {
    if (!socket) return;

    const handleDataChange = () => {
      queriesToInvalidate.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] })
      );
    };

    const socketEvents = [
      "ticket-created",
      "ticket-called",
      "ticket-marked-as-lapsed",
      "ticket-cancelled",
      "ticket-transferred",
      "transaction-completed",
    ];

    socketEvents.forEach((e) => socket.on(e, handleDataChange));
    return () => socketEvents.forEach((e) => socket.off(e, handleDataChange));
  }, [socket, queryClient, queriesToInvalidate]);

  return callNextTicket;
}
