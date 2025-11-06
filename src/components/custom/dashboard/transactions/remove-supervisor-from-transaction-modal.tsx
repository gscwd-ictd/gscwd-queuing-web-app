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
import { Transaction } from "@/lib/types/prisma/transaction";
import { User } from "@/lib/types/prisma/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type RemoveSupervisorFromTransactionModalProps = {
  transaction: Transaction & { supervisor: User };
};

export function RemoveSupervisorFromTransactionModal({
  transaction,
}: RemoveSupervisorFromTransactionModalProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const { data } = await axios.delete(
        `${process.env.NEXT_PUBLIC_HOST}/api/transactions/${transaction.id}/unassign-supervisor-to-transaction/${transaction.supervisor.id}`
      );
      return data;
    },
    onSuccess: () => {
      const queriesToInvalidate = [
        ["get-all-assigned-transactions"],
        ["unassigned-supervisors"],
      ];
      queriesToInvalidate.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });
      setOpen(false);

      toast.success("Supervisor removed", {
        description: `${transaction.supervisor.firstName} ${transaction.supervisor.lastName} has been removed from ${transaction.name}`,
      });
    },
    onError: (error: AxiosError) => {
      toast("Error", {
        description: error.message || "Failed to remove supervisor",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant={"destructive"}>
          <Trash2 />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Supervisor - {transaction.name}</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove{" "}
            <strong>
              {transaction.supervisor.firstName}{" "}
              {transaction.supervisor.lastName}
            </strong>{" "}
            as assigned supervisor from this transaction? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end space-x-2">
          <Button
            size="sm"
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            type="button"
            variant="destructive"
            onClick={() => mutate()}
            disabled={isPending}
          >
            {isPending ? "Removing..." : "Remove"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
