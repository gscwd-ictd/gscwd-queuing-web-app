"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { DepartmentSelect } from "../department-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, Pencil, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  editUserAccountSchema,
  userAccountRoles,
} from "@/lib/schemas/dashboard/userAccountFormSchema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { User } from "@/lib/types/prisma/user";
import { Department } from "@/lib/types/prisma/department";
import { AccountStatus } from "@/lib/enums/AccountStatus";

type ViewUserDetailsModalProps = {
  user: User & { fullName: string } & { department: Department };
  open: boolean;
  setOpen: (open: boolean) => void;
};

export function ViewUserDetailsModal({
  user,
  open,
  setOpen,
}: ViewUserDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof editUserAccountSchema>>({
    resolver: zodResolver(editUserAccountSchema),
    defaultValues: {
      firstName: user.firstName ?? "",
      middleName: user.middleName ?? "",
      lastName: user.lastName ?? "",
      nameExtension: user.nameExtension ?? "",
      email: user.email ?? "",
      role: user.role === "superadmin" ? "user" : user.role,
      accountStatus: user.accountStatus,
      departmentId: user.department?.id ?? "",
      position: user.position ?? "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof editUserAccountSchema>) => {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_HOST}/api/users/${user.id}/update-user`,
        values
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Success", {
        description: "User details updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["get-all-users"] });
      setIsEditing(false);
      setOpen(false);
    },
    onError: (error) => {
      toast.error("Error", { description: `${error}` });
    },
  });

  function onSubmit(data: z.infer<typeof editUserAccountSchema>) {
    mutate(data);
  }

  function handleCancelEdit() {
    form.reset();
    setIsEditing(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(e) => {
        setOpen(e);
        if (!e) setIsEditing(false);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>View User Details for {user.fullName}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            className="flex flex-col gap-4 p-2 mt-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="flex flex-row items-center gap-2">
              {/* First Name */}
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input readOnly={!isEditing} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Middle Name */}
              <FormField
                control={form.control}
                name="middleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Middle Name</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly={!isEditing} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-row items-center gap-2">
              {/* Last Name */}
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly={!isEditing} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Name Extension */}
              <FormField
                control={form.control}
                name="nameExtension"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name Extension</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly={!isEditing} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" readOnly={!isEditing} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  {isEditing ? (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {userAccountRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      readOnly
                      value={
                        field.value.charAt(0).toUpperCase() +
                        field.value.slice(1)
                      }
                    />
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Department */}
            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  {isEditing ? (
                    <DepartmentSelect
                      className="w-full"
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select department"
                    />
                  ) : (
                    <Input readOnly value={user.department?.name || "—"} />
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Position */}
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly={!isEditing} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Account Status */}
            <FormField
              control={form.control}
              name="accountStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Status</FormLabel>
                  {isEditing ? (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(AccountStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      readOnly
                      value={
                        field.value
                          ? field.value.charAt(0).toUpperCase() +
                            field.value.slice(1)
                          : ""
                      }
                    />
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  type="button"
                >
                  <X className="mr-2 h-4 w-4" /> Cancel Edit
                </Button>
              )}
              {isEditing && (
                <Button
                  type="submit"
                  className="w-fit"
                  disabled={isPending}
                  size="sm"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
