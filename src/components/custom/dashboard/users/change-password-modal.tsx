"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

type ChangePasswordModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export function ChangePasswordModal({
  open,
  setOpen,
}: ChangePasswordModalProps) {
  const [isOldPassToggleVisible, setIsOldPassToggleVisible] = useState(false);
  const [isNewPassToggleVisible, setIsNewPassToggleVisible] = useState(false);
  const [isConfirmPassToggleVisible, setIsConfirmPassToggleVisible] =
    useState(false);

  const id = useId();

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (values: z.infer<typeof passwordSchema>) => {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_HOST}/api/users/change-password`,
        values
      );
      return data;
    },
    onSuccess: () => {
      setOpen(false);
      form.reset();

      toast.success("Success", {
        description: "Password has been changed successfully",
      });
    },
    onError: (error: AxiosError) => {
      toast.error("Error", {
        description: error.message || "Failed to change password",
      });
    },
  });

  function onSubmit(values: z.infer<typeof passwordSchema>) {
    changePasswordMutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>Change your password</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="oldPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Old Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        id={`${id}-old`}
                        type={isOldPassToggleVisible ? "text" : "password"}
                        placeholder="Enter old password"
                        className={cn(
                          "pr-9",
                          form.formState.errors.oldPassword
                            ? "border-red-500 focus:ring-red-500"
                            : ""
                        )}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setIsOldPassToggleVisible((prevState) => !prevState)
                        }
                        className="text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent"
                      >
                        {isOldPassToggleVisible ? <EyeOffIcon /> : <EyeIcon />}
                        <span className="sr-only">
                          {isOldPassToggleVisible
                            ? "Hide password"
                            : "Show password"}
                        </span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        id={`${id}-new`}
                        type={isNewPassToggleVisible ? "text" : "password"}
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
                        onClick={() =>
                          setIsNewPassToggleVisible((prevState) => !prevState)
                        }
                        className="text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent"
                      >
                        {isNewPassToggleVisible ? <EyeOffIcon /> : <EyeIcon />}
                        <span className="sr-only">
                          {isNewPassToggleVisible
                            ? "Hide password"
                            : "Show password"}
                        </span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        id={`${id}-confirm`}
                        type={isConfirmPassToggleVisible ? "text" : "password"}
                        placeholder="Enter new password"
                        className={cn(
                          "pr-9",
                          form.formState.errors.confirmPassword
                            ? "border-red-500 focus:ring-red-500"
                            : ""
                        )}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setIsConfirmPassToggleVisible(
                            (prevState) => !prevState
                          )
                        }
                        className="text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent"
                      >
                        {isConfirmPassToggleVisible ? (
                          <EyeOffIcon />
                        ) : (
                          <EyeIcon />
                        )}
                        <span className="sr-only">
                          {isConfirmPassToggleVisible
                            ? "Hide password"
                            : "Show password"}
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
              <Button type="submit" disabled={changePasswordMutation.isPending}>
                {changePasswordMutation.isPending && (
                  <Loader2 className="animate-spin h-4 w-4" />
                )}
                Change Password
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
