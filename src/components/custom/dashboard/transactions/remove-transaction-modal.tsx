"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Transaction } from "@/lib/types/prisma/transaction";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Loader2, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type RemoveTransactionModalProps = {
  transaction: Transaction;
};

export function RemoveTransactionModal({ transaction }: RemoveTransactionModalProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteTransactionMutation = useMutation({
    mutationFn: async () => {
      const { data } = await axios.delete(
        `${process.env.NEXT_PUBLIC_HOST}/api/transactions/${transaction.id}/delete-transaction`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-all-assigned-transactions"],
      });
      setOpen(false);
      toast.success("Success", {
        description: "Transaction deleted successfully",
      });
    },
    onError: (error: AxiosError<{ error: string }>) => {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to delete transaction";
      toast.error("Error", {
        description: errorMessage,
      });
    },
  });

  function handleDelete() {
    deleteTransactionMutation.mutate();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="flex items-center gap-2"
        >
          <Trash2 />
          Delete Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Delete {transaction.name}?
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the transaction &quot;
            <strong>{transaction.name}</strong>&quot;? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-end space-x-2 pt-4">
          <Button
            size="sm"
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={deleteTransactionMutation.isPending}
          >
            <X /> Cancel
          </Button>
          <Button
            size="sm"
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteTransactionMutation.isPending}
          >
            {deleteTransactionMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Deleting
              </>
            ) : (
              <>
                <Trash2 /> Delete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
