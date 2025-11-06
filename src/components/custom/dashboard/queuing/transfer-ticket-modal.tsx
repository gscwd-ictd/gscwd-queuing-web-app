"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQueuingTicketStore } from "@/lib/store/dashboard/useQueuingTicketStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Loader2, Redo2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { useSocket } from "@/components/providers/socket-provider";
import { ButtonWithShortcutKey } from "../../features/button-with-shortcut-key";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Transaction } from "@/lib/types/prisma/transaction";
import { QueuingStatus } from "@prisma/client";
import { User } from "@/lib/types/prisma/user";

export function TransferTicketModal() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const {
    nowServingTicket,
    clearNowServingTicket,
    resetTransferForm,
    selectedTransactionId,
    setSelectedTransactionId,
    selectedUserId,
    setSelectedUserId,
  } = useQueuingTicketStore();
  const { socket } = useSocket();

  const transferHotkey = session?.user.transferHotkey || null;

  const { data: transactions } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/transactions`
      );
      return data;
    },
  });

  const { data: usersByTransaction, isLoading } = useQuery({
    queryKey: ["get-users-by-transaction", selectedTransactionId],
    enabled: !!selectedTransactionId,
    queryFn: async () => {
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_HOST}/api/transactions/${selectedTransactionId}/get-all-users-by-transaction-id`
        );
        return data;
      } catch (error) {
        toast.error("Error", { description: `${error}` });
        return [];
      }
    },
  });

  const filteredTransactions = useMemo(() => {
    return (
      transactions?.filter((transaction: Transaction) => {
        return transaction.id !== session?.user.assignedTransactionId;
      }) || []
    );
  }, [transactions, session?.user.assignedTransactionId]);

  const selectedTransaction = useMemo(() => {
    return filteredTransactions.find(
      (transaction: Transaction) => transaction.id === selectedTransactionId
    );
  }, [filteredTransactions, selectedTransactionId]);

  const transferTicket = useMutation({
    mutationFn: async () => {
      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_HOST}/api/queuing-tickets/update-queuing-ticket/transfer-ticket`,
        {
          ticketId: nowServingTicket?.id,
          transferredTo: selectedUserId,
        }
      );
      return data;
    },
    onSuccess: (transferredTicket) => {
      toast.success("Ticket transferred successfully", {
        description: `Customer has been transferred to ${selectedTransaction?.name}`,
      });
      setOpen(false);
      clearNowServingTicket();
      resetTransferForm();
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

      if (transferredTicket) {
        socket.emit("transfer-ticket", {
          id: transferredTicket.id,
          name: transferredTicket.name,
          counterId: transferredTicket.counterId,
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

  useEffect(() => {
    if (!socket) return;

    const handleDataChange = () => {
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
    };

    socket.on("ticket-transferred", handleDataChange);

    return () => {
      socket.off("ticket-transferred", handleDataChange);
    };
  }, [queryClient, socket]);

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen && transferTicket.isPending) return;
          setOpen(isOpen);
          setSelectedTransactionId("");
        }}
      >
        <DialogTrigger asChild>
          <ButtonWithShortcutKey
            shortcutKey={transferHotkey}
            onClick={() => setOpen(true)}
            size={"lg"}
            variant={"outline"}
            className={`select-none
             ${
               !nowServingTicket ||
               nowServingTicket.queuingStatus !== QueuingStatus.NOW_SERVING
                 ? "bg-gray-500 text-white"
                 : "text-black"
             }
            `}
            disabled={
              !nowServingTicket ||
              nowServingTicket.queuingStatus !== QueuingStatus.NOW_SERVING
            }
          >
            <Redo2 />
            Transfer
          </ButtonWithShortcutKey>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Ticket</DialogTitle>
            <div className="flex flex-col gap-6 p-1">
              <DialogDescription className="text-gray-800">
                Are you sure you want to transfer this ticket from your counter?
              </DialogDescription>
              <div className="flex flex-col gap-2">
                <Label htmlFor="transaction-select">Select Transaction</Label>
                <Select
                  value={selectedTransactionId}
                  onValueChange={setSelectedTransactionId}
                >
                  <SelectTrigger id="transaction-select" className="w-full">
                    <SelectValue placeholder="Select a transaction" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredTransactions.map((transaction: Transaction) => (
                      <SelectItem key={transaction.id} value={transaction.id}>
                        {transaction.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="user-select">Select User</Label>
                <Select
                  value={selectedUserId}
                  onValueChange={setSelectedUserId}
                >
                  <SelectTrigger id="user-select" className="w-full">
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoading ? (
                      <div className="flex items-center justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : usersByTransaction?.length > 0 ? (
                      usersByTransaction.map((user: User) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.firstName} {user.lastName}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="py-2 text-center text-sm text-muted-foreground">
                        No available users found
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => transferTicket.mutate()}
                disabled={transferTicket.isPending || !selectedTransactionId}
                className={`select-none w-full ${
                  transferTicket.isPending ? "bg-gray-500 text-white" : ""
                }`}
              >
                {`${transferTicket.isPending ? "Transferring" : "Confirm"}`}
              </Button>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
