"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Tags,
  TagsContent,
  TagsEmpty,
  TagsGroup,
  TagsInput,
  TagsItem,
  TagsList,
  TagsTrigger,
  TagsValue,
} from "@/components/ui/shadcn-io/tags";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Route } from "@/lib/types/prisma/route";
import { User } from "@/lib/types/prisma/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { z } from "zod";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckIcon, PlusIcon } from "lucide-react";

const routeSchema = z.object({
  userId: z.uuid(),
  allowedRoutes: z
    .array(z.string().min(1, "Path cannot be empty"))
    .nonempty("At least one route must be selected"),
});

type RouteFormValues = z.infer<typeof routeSchema>;

type AddRoutesToUserModalProps = {
  user: User;
  open: boolean;
  setOpen: (open: boolean) => void;
};

export function AddRoutesToUserModal({
  user,
  open,
  setOpen,
}: AddRoutesToUserModalProps) {
  const [newTag, setNewTag] = useState<string>("");
  const queryClient = useQueryClient();

  const form = useForm<RouteFormValues>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      userId: user.id,
      allowedRoutes: user.allowedRoutes ?? [],
    },
  });
  const { watch, setValue, reset } = form;
  const selected = watch("allowedRoutes");

  useEffect(() => {
    reset({
      userId: user.id,
      allowedRoutes: user.allowedRoutes ?? [],
    });
  }, [user.id, user.allowedRoutes, reset]);

  const { data: allRoutes = [] } = useQuery<Route[]>({
    queryKey: ["get-all-user-routes"],
    queryFn: async () => {
      try {
        const response = await axios.get<Route[]>(
          `${process.env.NEXT_PUBLIC_HOST}/api/routes`
        );
        if (response.data.length === 0) {
          toast.info("Info", {
            description: "No routes found",
          });
        } else {
          toast.success("Success", {
            description: "Routes fetched successfully",
          });
        }
        return response.data;
      } catch (error) {
        toast.error("Error fetching routes", {
          description: `${error}`,
        });
        return [];
      }
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const availableRoutes = allRoutes.filter((r) => !selected.includes(r.path));

  const toggleRoute = (path: string) => {
    if (selected.includes(path)) {
      setValue(
        "allowedRoutes",
        selected.filter((p) => p !== path)
      );
    } else {
      setValue("allowedRoutes", [...selected, path]);
    }
  };

  const handleCreateTag = () => {
    if (!newTag.trim()) return;
    setValue("allowedRoutes", [...selected, newTag]);
    setNewTag("");
  };

  const assignRoutesToUserMutation = useMutation({
    mutationFn: async (values: z.infer<typeof routeSchema>) => {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_HOST}/api/users/assign-routes-to-user`,
        values
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-all-users"] });
      queryClient.invalidateQueries({ queryKey: ["get-all-user-routes"] });
      setOpen(false);
      form.reset();

      toast.success("Success", {
        description: "Routes has been successfully assigned to user.",
      });
    },
    onError: (error: AxiosError) => {
      toast.error("Error", {
        description: error.message || "Failed to assign routes to user",
      });
    },
  });

  function onSubmit(values: z.infer<typeof routeSchema>) {
    assignRoutesToUserMutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Add Routes to User</DialogTitle>
              <DialogDescription>
                Add routes to be accessed by {user.firstName} {user.lastName}
              </DialogDescription>
            </DialogHeader>
            <FormField
              control={form.control}
              name="allowedRoutes"
              render={() => (
                <FormItem>
                  <FormLabel>Allowed Routes</FormLabel>
                  <FormControl>
                    <Tags className="w-full">
                      <TagsTrigger>
                        {selected.map((path) => (
                          <TagsValue
                            key={path}
                            onRemove={() => toggleRoute(path)}
                          >
                            {path}
                          </TagsValue>
                        ))}
                      </TagsTrigger>
                      <TagsContent>
                        <TagsInput
                          onValueChange={setNewTag}
                          placeholder="Search or create route..."
                          value={newTag}
                        />
                        <TagsList>
                          <TagsEmpty>
                            <button
                              type="button"
                              onClick={handleCreateTag}
                              className="mx-auto flex cursor-pointer items-center gap-2"
                            >
                              <PlusIcon
                                className="text-muted-foreground"
                                size={14}
                              />
                              Create new route: {newTag}
                            </button>
                          </TagsEmpty>
                          <TagsGroup>
                            {availableRoutes.map((route) => (
                              <TagsItem
                                key={route.id}
                                onSelect={() => toggleRoute(route.path)}
                                value={route.path}
                              >
                                {route.path}
                                {selected.includes(route.path) && (
                                  <CheckIcon
                                    className="ml-1 text-muted-foreground"
                                    size={14}
                                  />
                                )}
                              </TagsItem>
                            ))}
                          </TagsGroup>
                        </TagsList>
                      </TagsContent>
                    </Tags>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
