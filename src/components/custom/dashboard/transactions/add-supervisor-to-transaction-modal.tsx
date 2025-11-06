"use state";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Transaction } from "@/lib/types/prisma/transaction";
import { User as Personnel } from "@/lib/types/prisma/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  userId: z.string().min(1, "Please select a user"),
});

type AddSupervisorToTransactionModalProps = {
  transaction: Transaction;
};

export function AddSupervisorToTransactionModal({
  transaction,
}: AddSupervisorToTransactionModalProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "",
    },
  });

  const { data: unAssignedSupervisors, isLoading } = useQuery({
    queryKey: ["unassigned-supervisors"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/transactions/get-all-unassigned-supervisors`
      );
      return data;
    },
    enabled: open,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await axios.patch(
        `${process.env.NEXT_PUBLIC_HOST}/api/transactions/${transaction.id}/assign-supervisor-to-transaction`,
        {
          userId,
        }
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
      form.reset();

      toast.success("Success", {
        description: "Supervisor assigned to transaction successfully",
      });
    },
    onError: (error: AxiosError) => {
      toast.error("Error", {
        description:
          error.message || "Failed to assign supervisor to transaction",
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutate(values.userId);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={"outline"}>
          <Plus />
          Add Supervisor
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Supervisor To Transaction</DialogTitle>
          <DialogDescription>
            Add an unassigned supervisor for this transaction.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select User</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a user" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoading ? (
                        <div className="flex items-center justify-center py-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : unAssignedSupervisors?.length > 0 ? (
                        unAssignedSupervisors.map((user: Personnel) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.firstName} {user.lastName} ({user.email})
                          </SelectItem>
                        ))
                      ) : (
                        <div className="py-2 text-center text-sm text-muted-foreground">
                          No available users found
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                type="submit"
                disabled={
                  isPending || unAssignedSupervisors?.length === 0 || isLoading
                }
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Assign User
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
