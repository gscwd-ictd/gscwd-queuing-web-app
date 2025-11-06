"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios, { AxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, PencilLine, X } from "lucide-react";
import { Counter } from "@/lib/types/prisma/counter";
import { toast } from "sonner";

type EditCounterModalProps = {
  counter: Counter;
};

const formSchema = z.object({
  name: z.string().min(1, "Counter name is required"),
  code: z.string().min(1, "Counter code is required"),
});

export function EditCounterModal({ counter }: EditCounterModalProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: counter.name,
      code: counter.code,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: counter.name,
        code: counter.code,
      });
    }
  }, [open, counter, form]);

  const { mutate: editCounter, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const { data } = await axios.patch(
        `${process.env.NEXT_PUBLIC_HOST}/api/counters/${counter.id}/update-counter`,
        values
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counters"] });
      setOpen(false);
      toast.success("Success", {
        description: "Counter edited successfully",
      });
    },
    onError: (error: AxiosError) => {
      toast.error("Error", {
        description: error.message || "Failed to edit counter",
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    editCounter(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <PencilLine className="h-4 w-4" />
          Edit Counter
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Counter - {counter.name}</DialogTitle>
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
                    <Input placeholder="Enter counter name" {...field} />
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
                    <Input placeholder="Enter counter code" {...field} />
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
              <Button size="sm" type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving
                  </>
                ) : (
                  <>
                    <PencilLine /> Save Changes
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
