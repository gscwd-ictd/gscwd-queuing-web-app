"use client";

import { useState, useId } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, EyeIcon, EyeOffIcon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { User } from "@/lib/types/prisma/user";
import { cn } from "@/lib/utils";

const passwordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters long"),
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

type ResetPasswordModalProps = {
  user: User;
  open: boolean;
  setOpen: (open: boolean) => void;
};

export function ResetPasswordModal({
  user,
  open,
  setOpen,
}: ResetPasswordModalProps) {
  const queryClient = useQueryClient();
  const [isVisible, setIsVisible] = useState(false);
  const id = useId();

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: "",
    },
  });

  const resetUserPasswordMutation = useMutation({
    mutationFn: async (values: z.infer<typeof passwordSchema>) => {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_HOST}/api/users/${user.id}/reset-password`,
        values
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-all-users"] });
      setOpen(false);
      form.reset();

      toast.success("Success", {
        description: "Password has been reset successfully",
      });
    },
    onError: (error: AxiosError) => {
      toast.error("Error", {
        description: error.message || "Failed to reset user password",
      });
    },
  });

  function onSubmit(values: z.infer<typeof passwordSchema>) {
    resetUserPasswordMutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset User Password</DialogTitle>
          <DialogDescription>
            Reset password for {user.firstName} {user.lastName}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        id={id}
                        type={isVisible ? "text" : "password"}
                        placeholder="Enter new password"
                        className={cn(
                          "pr-9",
                          form.formState.errors.newPassword
                            ? "border-red-500 focus:ring-red-500"
                            : ""
                        )}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsVisible((prevState) => !prevState)}
                        className="text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent"
                      >
                        {isVisible ? <EyeOffIcon /> : <EyeIcon />}
                        <span className="sr-only">
                          {isVisible ? "Hide password" : "Show password"}
                        </span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={resetUserPasswordMutation.isPending}
              >
                {resetUserPasswordMutation.isPending && (
                  <Loader2 className="animate-spin h-4 w-4" />
                )}
                Reset Password
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
