"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { Loader2, Pencil, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
});

type EditTransactionModalProps = {
  transaction: Transaction;
};

export function EditTransactionModal({
  transaction,
}: EditTransactionModalProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: transaction.name,
      code: transaction.code,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: transaction.name,
        code: transaction.code,
      });
    }
  }, [open, transaction, form]);

  const editTransactionMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const { data } = await axios.patch(
        `${process.env.NEXT_PUBLIC_HOST}/api/transactions/${transaction.id}/update-transaction`,
        values
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-all-assigned-transactions"],
      });
      setOpen(false);
      toast.success("Success", {
        description: "Transaction edited successfully",
      });
    },
    onError: (error: AxiosError) => {
      toast.error("Error", {
        description: error.message || "Failed to edit transaction",
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    editTransactionMutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Pencil />
          Edit Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Edit {transaction.name}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter transaction name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter transaction code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
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
                disabled={editTransactionMutation.isPending}
              >
                {editTransactionMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Updating
                  </>
                ) : (
                  <>
                    <Pencil /> Update
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
