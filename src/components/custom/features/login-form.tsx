"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { accountLoginFormSchema } from "@/lib/schemas/dashboard/accountLoginFormSchema";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TransactionCounterSelect } from "./transaction-counter-select";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect } from "react";

export function LoginForm() {
  const router = useRouter();

  const form = useForm<z.infer<typeof accountLoginFormSchema>>({
    resolver: zodResolver(accountLoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      counterId: "",
    },
  });

  const email = form.watch("email");

  const { data } = useQuery({
    queryKey: ["check-user-by-email", email],
    queryFn: async () => {
      if (!email || !email.includes("@gscwd.com")) return null;
      const response = await axios.get(
        `${
          process.env.NEXT_PUBLIC_HOST
        }/api/users/check-user?email=${encodeURIComponent(email)}`
      );
      return response.data;
    },
    enabled: !!email && !!email.includes("@gscwd.com"),
    retry: false,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const shouldShowCounterSelect =
    data?.user?.allowedRoutes?.includes("/queuing");

  type LoginFormValues = z.infer<typeof accountLoginFormSchema>;

  async function onSubmit(values: LoginFormValues) {
    const res = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
      counterId: values.counterId,
    });
    if (!res?.error) {
      router.push(`${process.env.NEXT_PUBLIC_HOST}/home`);
      toast.success("Success", { description: "Login successful" });
    } else {
      toast.error("Error", { description: `${res.error}` });
    }
  }

  useEffect(() => {
    if (email && (!data || data.user?.role !== "user")) {
      form.setValue("counterId", "");
    }
  }, [email, data, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-10"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your details below to login to your account
          </p>
        </div>
        <div className="grid gap-6">
          <div className="grid gap-3">
            <FormField
              control={form.control}
              name={"email"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="email">Email</FormLabel>
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
          </div>
          <div className="grid gap-3">
            <FormField
              control={form.control}
              name={"password"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <FormControl>
                    <Input id="password" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {shouldShowCounterSelect && (
            <div className="grid gap-3">
              <FormField
                control={form.control}
                name={"counterId"}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <TransactionCounterSelect field={field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <Button type="submit" className="w-full" size="sm">
            Login
          </Button>
        </div>
      </form>
    </Form>
  );
}
