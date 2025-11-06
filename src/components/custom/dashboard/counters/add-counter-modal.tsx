"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(1, "Counter name is required"),
  code: z.string().min(1, "Counter code is required"),
});

export function AddCounterModal() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
    },
  });

  const createCounterMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!session?.user.assignedTransactionId || !session.user.departmentId) {
        throw new Error("User is not assigned to a transaction or department");
      }

      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_HOST}/api/counters`,
        {
          ...values,
          transactionId: session.user.assignedTransactionId,
          departmentId: session.user.departmentId,
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counters"] });
      setOpen(false);
      form.reset();

      toast.success("Counter created", {
        description: "The counter has been successfully created.",
      });
    },
    onError: (error: AxiosError) => {
      toast.error("Error", {
        description: error.message || "Failed to create counter",
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createCounterMutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="px-2">
        <DialogTrigger asChild>
          <Button size="sm">
            <Plus />
            Add Counter
          </Button>
        </DialogTrigger>
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Counter</DialogTitle>
          <DialogDescription>
            Create a new counter for your department. The counter will be
            automatically associated with your assigned transaction and
            department.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Counter Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Counter 1, Window 5" {...field} />
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
                  <FormLabel>Counter Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., C1, W5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createCounterMutation.isPending}
                size="sm"
              >
                {createCounterMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                Create Counter
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
