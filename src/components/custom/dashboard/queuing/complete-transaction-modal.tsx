"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Check } from "lucide-react";
import { SelectServiceTypeCommand } from "./select-service-type-command";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQueuingTicketStore } from "@/lib/store/dashboard/useQueuingTicketStore";
import { useSession } from "next-auth/react";
import { useSocket } from "@/components/providers/socket-provider";
import { ButtonWithShortcutKey } from "../../features/button-with-shortcut-key";
import { QueuingStatus } from "@prisma/client";

type CompleteTransactionModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export function CompleteTransactionModal({
  open,
  setOpen,
}: CompleteTransactionModalProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const {
    nowServingTicket,
    selectedServiceTypeId,
    otherServiceType,
    setOtherServiceType,
    setSelectedServiceTypeId,
    remarks,
    setRemarks,
    clearNowServingTicket,
    resetServiceTypeRemarksForm,
    pauseTimer,
    resumeTimer,
    dateTransactionEnded,
    resetTimerState,
  } = useQueuingTicketStore();
  const { socket } = useSocket();

  const completeTransactionHotkey =
    session?.user.completeTransactionHotkey || null;

  const completeTransaction = useMutation({
    mutationFn: async () => {
      if (!nowServingTicket?.id || !selectedServiceTypeId) {
        throw new Error("Please select a service type");
      }
      
      const transactionEndDate = dateTransactionEnded || new Date();

      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_HOST}/api/queuing-tickets/update-queuing-ticket/complete-transaction`,
        {
          ticketId: nowServingTicket.id,
          serviceTypeId: selectedServiceTypeId,
          remarks: remarks,
          otherServiceType: otherServiceType,
          dateTransactionEnded: transactionEndDate,
        }
      );
      return data;
    },
    onSuccess: (completedTicket) => {
      toast.success("Transaction completed", {
        description: "Customer has been served successfully",
      });
      setOpen(false);
      clearNowServingTicket();
      resetServiceTypeRemarksForm();
      resetTimerState();
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

  useEffect(() => {
    if (open) {
      pauseTimer();
    } else if (!completeTransaction.isPending) {
      resumeTimer();
    }
  }, [open, pauseTimer, resumeTimer, completeTransaction.isPending]);

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

    socket.on("transaction-completed", handleDataChange);

    return () => {
      socket.off("transaction-completed", handleDataChange);
    };
  }, [queryClient, socket]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && completeTransaction.isPending) return;
    setOpen(isOpen);

    if (!isOpen && !completeTransaction.isPending) {
      setRemarks("");
      setSelectedServiceTypeId("");
      setOtherServiceType("");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <ButtonWithShortcutKey
            shortcutKey={completeTransactionHotkey}
            onClick={() => setOpen(true)}
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
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Transaction</DialogTitle>
            <div className="flex flex-col gap-6 p-4">
              <SelectServiceTypeCommand />
              <div className="flex flex-col gap-2">
                <Label htmlFor="remarks" className="text-md">
                  Remarks
                </Label>
                <Textarea
                  placeholder="Add remarks here"
                  id="remarks"
                  className="resize-none"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>
              <Button
                onClick={() => completeTransaction.mutate()}
                disabled={
                  !selectedServiceTypeId || completeTransaction.isPending
                }
                className={`select-none ${
                  !selectedServiceTypeId || completeTransaction.isPending
                    ? "bg-gray-500 text-white"
                    : ""
                }`}
              >
                {`${completeTransaction.isPending ? "Submitting" : "Confirm"}`}
              </Button>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
