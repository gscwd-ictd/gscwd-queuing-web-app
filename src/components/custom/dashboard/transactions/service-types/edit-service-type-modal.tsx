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
import { ServiceType } from "@/lib/types/prisma/serviceType";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Loader2, Pencil, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

type EditServiceTypeModalProps = {
  serviceType: ServiceType;
};

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export function EditServiceTypeModal({
  serviceType,
}: EditServiceTypeModalProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: serviceType.name,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: serviceType.name,
      });
    }
  }, [open, serviceType, form]);

  const editServiceTypeMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const { data } = await axios.patch(
        `${process.env.NEXT_PUBLIC_HOST}/api/service-types/${serviceType.id}/update-service-type`,
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
        description: "Service type edited successfully",
      });
    },
    onError: (error: AxiosError) => {
      toast.error("Error", {
        description: error.message || "Failed to edit service type",
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    editServiceTypeMutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={"icon"}>
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Service Type - {serviceType.name}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Type Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter service type name" {...field} />
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
                disabled={editServiceTypeMutation.isPending}
              >
                {editServiceTypeMutation.isPending ? (
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
