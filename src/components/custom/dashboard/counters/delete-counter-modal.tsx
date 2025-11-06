"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Counter } from "@/lib/types/prisma/counter";

type DeleteCounterModalProps = {
  counter: Counter;
};

export function DeleteCounterModal({ counter }: DeleteCounterModalProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteCounterMutation = useMutation({
    mutationFn: async () => {
      const { data } = await axios.delete(
        `${process.env.NEXT_PUBLIC_HOST}/api/counters/${counter.id}/delete-counter`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counters"] });
      setOpen(false);

      toast.success("Counter deleted", {
        description: `${counter.name} has been successfully deleted.`,
      });
    },
    onError: (error: AxiosError) => {
      toast.error("Error", {
        description: error.message || "Failed to delete counter",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="flex items-center gap-2"
        >
          <Trash2 />
          Delete Counter
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Delete Counter
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete ${counter.name}? This action cannot
            be undone.
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
            onClick={() => deleteCounterMutation.mutate()}
            disabled={deleteCounterMutation.isPending}
          >
            {deleteCounterMutation.isPending ? "Deleting..." : "Delete Counter"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
