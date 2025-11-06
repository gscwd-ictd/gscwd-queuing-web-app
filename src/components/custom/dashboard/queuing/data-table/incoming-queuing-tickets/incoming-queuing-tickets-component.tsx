"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { IncomingQueuingTicketsDataTable } from "./incoming-queuing-tickets-data-table";
import { columns } from "./incoming-queuing-tickets-columns";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useQueuingTicketStore } from "@/lib/store/dashboard/useQueuingTicketStore";
import { QueuingTicket } from "@/lib/types/prisma/queuingTicket";
import { QueuingStatus } from "@prisma/client";
import { Counter } from "@/lib/types/prisma/counter";
import { User } from "@/lib/types/prisma/user";
import { useCallNextTicket } from "@/hooks/dashboard/queuing/useCallNextTicket";
import axios from "axios";

export function IncomingQueuingTicketsComponent() {
  const {
    nowServingTicket,
    selectedIncomingQueuingTicketId,
    setSelectedIncomingQueuingTicketId,
  } = useQueuingTicketStore();
  const callNextTicket = useCallNextTicket();

  const { data: incomingQueuingTickets, isLoading } = useQuery<
    (QueuingTicket & { counter: Counter } & { transferredByUser: User } & {
      transferredToUser: User;
    })[]
  >({
    queryKey: ["get-all-incoming-queuing-tickets"],
    queryFn: async () => {
      try {
        const response = await axios.get<
          (QueuingTicket & { counter: Counter } & {
            transferredByUser: User;
          } & {
            transferredToUser: User;
          })[]
        >(
          `${process.env.NEXT_PUBLIC_HOST}/api/queuing-tickets/get-all-incoming-queuing-tickets`
        );
        return response.data;
      } catch (error) {
        toast.error("Error fetching incoming queuing tickets", {
          description: `${error}`,
        });
        return [];
      }
    },
  });

  const handleRowClick = (ticket: QueuingTicket) => {
    if (
      ticket.queuingStatus === QueuingStatus.TRANSFERRED ||
      ticket.queuingStatus === QueuingStatus.LAPSED
    ) {
      setSelectedIncomingQueuingTicketId(ticket.id);
    }
  };

  const handleNextIncomingTicket = () => {
    callNextTicket.mutate({
      route: `${process.env.NEXT_PUBLIC_HOST}/api/queuing-tickets/call-next-incoming-queuing-ticket`,
      ticketId: selectedIncomingQueuingTicketId,
    });
  };

  const hasAvailableIncomingTickets = incomingQueuingTickets?.some(
    (ticket) =>
      ticket.queuingStatus === QueuingStatus.TRANSFERRED ||
      ticket.queuingStatus === QueuingStatus.LAPSED
  );

  const isNextButtonDisabled =
    callNextTicket.isPending ||
    isLoading ||
    !hasAvailableIncomingTickets ||
    nowServingTicket !== null ||
    !selectedIncomingQueuingTicketId;

  return (
    <>
      <div className="border border-gray-200 p-2 h-full">
        <h2 className="text-2xl font-semibold">Incoming</h2>
        <div className="flex flex-row gap-2 w-full max-h-full">
          <div className="w-[80%]">
            <IncomingQueuingTicketsDataTable
              columns={columns}
              data={incomingQueuingTickets ?? []}
              loading={isLoading}
              selectedTicketId={selectedIncomingQueuingTicketId || undefined}
              onRowClick={handleRowClick}
            />
          </div>
          <div className="w-[20%]">
            <Button
              size={"lg"}
              className={`w-full select-none ${
                isNextButtonDisabled ? "bg-gray-500 text-white" : ""
              }`}
              onClick={handleNextIncomingTicket}
              disabled={isNextButtonDisabled}
            >
              <ArrowRight />
              Next
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
