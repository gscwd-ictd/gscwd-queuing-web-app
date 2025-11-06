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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Transaction } from "@/lib/types/prisma/transaction";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Loader2, Plus, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type AddServiceTypeModalProps = {
  transaction: Transaction;
};

const formSchema = z.object({
  name: z.string().min(1, "Service type name is required"),
});

export function AddServiceTypeModal({ transaction }: AddServiceTypeModalProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const transactionId = transaction.id

  const createServiceTypeMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_HOST}/api/service-types`,
        { ...values, transactionId }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-all-assigned-transactions"],
      });
      setOpen(false);
      form.reset();

      toast.success("Service type created", {
        description: "Service type has been successfully created.",
      });
    },
    onError: (error: AxiosError) => {
      toast.error("Error", {
        description: error.message || "Failed to create transaction",
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createServiceTypeMutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="px-2">
        <DialogTrigger asChild>
          <Button variant="default" size="sm">
            <Plus />
            Add Service Type
          </Button>
        </DialogTrigger>
      </div>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Add Service Type
          </DialogTitle>
          <DialogDescription>
            Add new service type for {transaction.name}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Type Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button
                size="sm"
                type="button"
                variant="destructive"
                onClick={() => setOpen(false)}
              >
                <X /> Cancel
              </Button>
              <Button
                size="sm"
                type="submit"
                disabled={createServiceTypeMutation.isPending}
              >
                {createServiceTypeMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating
                  </>
                ) : (
                  <>
                    <Plus /> Create Service Type
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
