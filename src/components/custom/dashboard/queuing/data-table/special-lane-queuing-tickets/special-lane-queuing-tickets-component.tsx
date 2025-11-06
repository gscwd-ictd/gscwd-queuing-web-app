"use client";

import { ArrowRight } from "lucide-react";
import { columns } from "./special-lane-queuing-tickets-columns";
import { SpecialLaneQueuingTicketsDataTable } from "./special-lane-queuing-tickets-data-table";
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

export function SpecialLaneQueuingTicketsComponent() {
  const session = useSession();
  const { nowServingTicket } = useQueuingTicketStore();
  const callNextTicket = useCallNextTicket();

  const nextSpecialTicketHotkey =
    session.data?.user.nextSpecialTicketHotkey || null;
  const nextLapsedSpecialTicketHotkey =
    session.data?.user.nextLapsedSpecialTicketHotkey || null;

  const { data: specialQueuingTickets, isLoading } = useQuery<
    (QueuingTicket & { counter: Counter })[]
  >({
    queryKey: ["get-all-special-lane-queuing-tickets"],
    queryFn: async () => {
      try {
        const response = await axios.get<
          (QueuingTicket & { counter: Counter })[]
        >(
          `${process.env.NEXT_PUBLIC_HOST}/api/queuing-tickets/get-all-special-lane-queuing-tickets`
        );
        return response.data;
      } catch (error) {
        toast.error("Error fetching special lane queuing tickets", {
          description: `${error}`,
        });
        return [];
      }
    },
  });

  const handleNextPendingSpecialTicket = () => {
    callNextTicket.mutate({
      route: `${process.env.NEXT_PUBLIC_HOST}/api/queuing-tickets/call-next-pending-special-ticket`,
    });
  };

  const handleNextLapsedSpecialTicket = () => {
    callNextTicket.mutate({
      route: `${process.env.NEXT_PUBLIC_HOST}/api/queuing-tickets/call-next-lapsed-special-ticket`,
    });
  };

  const hasAvailablePendingTickets = specialQueuingTickets?.some(
    (ticket) => ticket.queuingStatus === QueuingStatus.PENDING
  );

  const hasAvailableLapsedTickets = specialQueuingTickets?.some(
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
        <h2 className="text-2xl font-semibold">Special Lane</h2>
        <div className="flex flex-row gap-2 w-full h-full">
          <div className="w-[80%]">
            <SpecialLaneQueuingTicketsDataTable
              columns={columns}
              data={specialQueuingTickets ?? []}
              loading={isLoading}
            />
          </div>
          <div className="flex flex-col gap-4 w-[20%]">
            <ButtonWithShortcutKey
              size={"lg"}
              className={`w-full select-none ${
                isNextLapsedButtonDisabled ? "bg-gray-500 text-white" : ""
              }`}
              onClick={handleNextLapsedSpecialTicket}
              disabled={isNextLapsedButtonDisabled}
              shortcutKey={nextLapsedSpecialTicketHotkey}
            >
              <ArrowRight />
              Lapsed
            </ButtonWithShortcutKey>
            <ButtonWithShortcutKey
              size={"lg"}
              className={`w-full select-none ${
                isNextPendingButtonDisabled ? "bg-gray-500 text-white" : ""
              }`}
              onClick={handleNextPendingSpecialTicket}
              disabled={isNextPendingButtonDisabled}
              shortcutKey={nextSpecialTicketHotkey}
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
