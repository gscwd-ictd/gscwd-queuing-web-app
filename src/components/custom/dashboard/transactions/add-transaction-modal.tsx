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
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Loader2, Plus, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Transaction name is required"),
  code: z.string().min(1, "Transaction code is required"),
});

export function AddTransactionModal() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
    },
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_HOST}/api/transactions`,
        values
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-all-assigned-transactions"],
      });
      setOpen(false);
      form.reset();

      toast.success("Transaction created", {
        description: "Transaction has been successfully created.",
      });
    },
    onError: (error: AxiosError) => {
      toast.error("Error", {
        description: error.message || "Failed to create transaction",
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createTransactionMutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="px-2">
        <DialogTrigger asChild>
          <Button size="sm">
            <Plus />
            Add Transaction
          </Button>
        </DialogTrigger>
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
          <DialogDescription>
            Create a new transaction for your department. The transaction will
            be automatically associated with your department.
          </DialogDescription>
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
                    <Input {...field} />
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
                disabled={createTransactionMutation.isPending}
              >
                {createTransactionMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating
                  </>
                ) : (
                  <>
                    <Plus /> Create Transaction
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
