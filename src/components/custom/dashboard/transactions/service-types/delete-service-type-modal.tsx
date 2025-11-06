"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ServiceType } from "@/lib/types/prisma/serviceType";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Loader2, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type DeleteServiceTypeModalProps = {
  serviceType: ServiceType;
};

export function DeleteServiceTypeModal({
  serviceType,
}: DeleteServiceTypeModalProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const { data } = await axios.delete(
        `${process.env.NEXT_PUBLIC_HOST}/api/service-types/${serviceType.id}/delete-service-type`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-all-assigned-transactions"],
      });
      setOpen(false);
      toast.success("Success", {
        description: "Service type deleted successfully",
      });
    },
    onError: (error: AxiosError<{ error: string }>) => {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to delete service type";
      toast.error("Error", {
        description: errorMessage,
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"destructive"} size={"icon"}>
          <Trash2 />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Service Type</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{serviceType.name}</strong>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            size="sm"
            type="button"
            variant={"outline"}
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            <X /> Cancel
          </Button>
          <Button
            size="sm"
            type="button"
            variant={"destructive"}
            onClick={() => mutate()}
            disabled={isPending}
          >
            {isPending ? (
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
