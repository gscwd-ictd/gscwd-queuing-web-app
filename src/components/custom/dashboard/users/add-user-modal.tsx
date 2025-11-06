"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import {
  newUserAccountSchema,
  userAccountRoles,
} from "@/lib/schemas/dashboard/userAccountFormSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Role } from "@prisma/client";
import { Loader2, PlusCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DepartmentSelect } from "../department-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

export function AddUserModal() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof newUserAccountSchema>>({
    resolver: zodResolver(newUserAccountSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      nameExtension: "",
      email: "",
      password: "",
      role: Role.user,
      department: "",
      position: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (userData: z.infer<typeof newUserAccountSchema>) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_HOST}/api/users`,
        userData
      );
      return response.data;
    },
    onSuccess: () => {
      form.reset();
      setOpen(false);
      toast.success("Success", {
        description: "User created successfully",
      });
      queryClient.invalidateQueries({
        queryKey: ["get-all-users"],
      });
    },
    onError: (error) => {
      toast.error("Error", { description: `${error}` });
    },
  });

  function onSubmit(data: z.infer<typeof newUserAccountSchema>) {
    mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="px-2">
        <DialogTrigger asChild>
          <Button size="sm">
            <PlusCircle /> Add User
          </Button>
        </DialogTrigger>
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
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
                name={"firstName"}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="firstName">First Name</FormLabel>
                    <FormControl>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Juan"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Middle Name */}
              <FormField
                control={form.control}
                name={"middleName"}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="middleName">Middle Name</FormLabel>
                    <FormControl>
                      <Input
                        id="middleName"
                        type="text"
                        placeholder="(optional)"
                        {...field}
                      />
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
                name={"lastName"}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="lastName">Last Name</FormLabel>
                    <FormControl>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Dela Cruz"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Name Extension */}
              <FormField
                control={form.control}
                name={"nameExtension"}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="nameExtension">
                      Name Extension
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="nameExtension"
                        type="text"
                        placeholder="LPT, MBA"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Email Address */}
            <FormField
              control={form.control}
              name={"email"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="email">Email Address</FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@gscwd.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name={"password"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <FormControl>
                    <Input id="password" type="password" {...field} required />
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
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Department */}
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <DepartmentSelect
                      className="w-full"
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select department"
                    />
                  </FormControl>
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
                    <Input id="position" type="text" {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex justify-end space-x-2 pt-4">
              <Button
                type="submit"
                className="w-fit"
                disabled={isPending}
                size="sm"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating User...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create User
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
