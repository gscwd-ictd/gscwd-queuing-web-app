"use client";

import { columns } from "./regular-lane-queuing-tickets-columns";
import { RegularLaneQueuingTicketsDataTable } from "./regular-lane-queuing-tickets-data-table";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useQueuingTicketStore } from "@/lib/store/dashboard/useQueuingTicketStore";
import { QueuingTicket } from "@/lib/types/prisma/queuingTicket";
import { useCallNextTicket } from "@/hooks/dashboard/queuing/useCallNextTicket";
import { QueuingStatus } from "@prisma/client";
import axios from "axios";
import { Counter } from "@/lib/types/prisma/counter";
import { ButtonWithShortcutKey } from "@/components/custom/features/button-with-shortcut-key";
import { useSession } from "next-auth/react";

export function RegularLaneQueuingTicketsComponent() {
  const session = useSession();
  const { nowServingTicket } = useQueuingTicketStore();
  const callNextTicket = useCallNextTicket();

  const nextTicketHotkey = session.data?.user.nextTicketHotkey || null;
  const nextLapsedTicketHotkey =
    session.data?.user.nextLapsedTicketHotkey || null;

  const { data: regularQueuingTickets, isLoading } = useQuery<
    (QueuingTicket & { counter: Counter })[]
  >({
    queryKey: ["get-all-regular-queuing-tickets"],
    queryFn: async () => {
      try {
        const response = await axios.get<
          (QueuingTicket & { counter: Counter })[]
        >(
          `${process.env.NEXT_PUBLIC_HOST}/api/queuing-tickets/get-all-regular-queuing-tickets`
        );
        return response.data;
      } catch (error) {
        toast.error("Error fetching regular queuing tickets", {
          description: `${error}`,
        });
        return [];
      }
    },
  });

  const handleNextPendingRegularTicket = () => {
    callNextTicket.mutate({
      route: `${process.env.NEXT_PUBLIC_HOST}/api/queuing-tickets/call-next-pending-regular-ticket`,
    });
  };

  const handleNextLapsedRegularTicket = () => {
    callNextTicket.mutate({
      route: `${process.env.NEXT_PUBLIC_HOST}/api/queuing-tickets/call-next-lapsed-regular-ticket`,
    });
  };

  const hasAvailablePendingTickets = regularQueuingTickets?.some(
    (ticket) => ticket.queuingStatus === QueuingStatus.PENDING
  );

  const hasAvailableLapsedTickets = regularQueuingTickets?.some(
    (ticket) => ticket.queuingStatus === QueuingStatus.LAPSED
  );

  const isNextLapsedButtonDisabled =
    callNextTicket.isPending ||
    isLoading ||
    !hasAvailableLapsedTickets ||
    nowServingTicket !== null;

  const isNextPendingButtonDisabled =
    callNextTicket.isPending ||
    isLoading ||
    !hasAvailablePendingTickets ||
    nowServingTicket !== null;

  return (
    <>
      <div className="border border-gray-200 p-2 h-full">
        <h2 className="text-2xl font-semibold">Regular</h2>
        <div className="flex flex-row gap-2 w-full h-full">
          <div className="w-[80%]">
            <RegularLaneQueuingTicketsDataTable
              columns={columns}
              data={regularQueuingTickets ?? []}
              loading={isLoading}
            />
          </div>
          <div className="flex flex-col gap-4 w-[20%]">
            <ButtonWithShortcutKey
              size={"lg"}
              className={`w-full select-none ${
                isNextLapsedButtonDisabled ? "bg-gray-500 text-white" : ""
              }`}
              onClick={handleNextLapsedRegularTicket}
              disabled={isNextLapsedButtonDisabled}
              shortcutKey={nextLapsedTicketHotkey}
            >
              <ArrowRight />
              Lapsed
            </ButtonWithShortcutKey>
            <ButtonWithShortcutKey
              size={"lg"}
              className={`w-full select-none ${
                isNextPendingButtonDisabled ? "bg-gray-500 text-white" : ""
              }`}
              onClick={handleNextPendingRegularTicket}
              disabled={isNextPendingButtonDisabled}
              shortcutKey={nextTicketHotkey}
            >
              <ArrowRight />
              Next
            </ButtonWithShortcutKey>
          </div>
        </div>
      </div>
    </>
  );
}
