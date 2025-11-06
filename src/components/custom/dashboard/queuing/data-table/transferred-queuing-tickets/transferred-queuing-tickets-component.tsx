"use client";

import { TransferredQueuingTicketsDataTable } from "./transferred-queuing-tickets-data-table";
import { columns } from "./transferred-queuing-tickets-columns";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { useSocket } from "@/components/providers/socket-provider";
import { useEffect } from "react";
import { QueuingTicket } from "@/lib/types/prisma/queuingTicket";
import { Transaction } from "@/lib/types/prisma/transaction";
import { User } from "@/lib/types/prisma/user";

export function TransferredQueuingTicketsComponent() {
  const { socket } = useSocket();

  const {
    data: transferredQueuingTickets,
    isLoading,
    refetch,
  } = useQuery<
    (QueuingTicket & { transaction: Transaction } & {
      transferredByUser: User;
    } & {
      transferredToUser: User;
    })[]
  >({
    queryKey: ["get-all-transferred-queuing-tickets"],
    queryFn: async () => {
      try {
        const response = await axios.get<
          (QueuingTicket & { transaction: Transaction } & {
            transferredByUser: User;
          } & {
            transferredToUser: User;
          })[]
        >(
          `${process.env.NEXT_PUBLIC_HOST}/api/queuing-tickets/get-all-transferred-queuing-tickets`
        );
        return response.data;
      } catch (error) {
        toast.error("Error fetching transferred queuing tickets", {
          description: `${error}`,
        });
        return [];
      }
    },
  });

  useEffect(() => {
    if (!socket) return;

    const handleDataChange = () => {
      refetch();
    };

    socket.on("ticket-transferred", handleDataChange);

    return () => {
      socket.off("ticket-transferred", handleDataChange);
    };
  }, [socket, refetch]);

  return (
    <>
      <div className="border border-gray-200 p-2 h-full">
        <h2 className="text-2xl font-semibold">Transferred</h2>
        <div className="flex flex-row gap-2 w-full max-h-full">
          <div className="w-full">
            <TransferredQueuingTicketsDataTable
              columns={columns}
              data={transferredQueuingTickets ?? []}
              loading={isLoading}
            />
          </div>
        </div>
      </div>
    </>
  );
}
