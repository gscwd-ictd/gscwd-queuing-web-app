"use client";

import { Suspense } from "react";
import { UsersDataTable } from "./users-data-table";
import { usersColumns } from "./users-columns";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { User } from "@/lib/types/prisma/user";
import { Department } from "@/lib/types/prisma/department";

export function UsersComponent() {
  const { data: users, isLoading } = useQuery<
    (User & { fullName: string } & { department: Department })[]
  >({
    queryKey: ["get-all-users"],
    queryFn: async () => {
      try {
        const response = await axios.get<
          (User & { fullName: string } & { department: Department })[]
        >(`${process.env.NEXT_PUBLIC_HOST}/api/users`);
        if (response.data.length === 0) {
          toast.info("Info", { description: "No users found" });
        } else {
          toast.success("Success", {
            description: "Users fetched successfully",
          });
        }
        return response.data.map((user) => ({
          ...user,
          fullName: `${user.firstName} ${user.lastName}`,
        }));
      } catch (error) {
        toast.error("Error fetching users", { description: `${error}` });
        return [];
      }
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return (
    <>
      <Suspense fallback={<p>Loading...</p>}>
        <div className="p-2 h-full">
          <UsersDataTable
            columns={usersColumns}
            loading={isLoading}
            data={users ?? []}
          />
        </div>
      </Suspense>
    </>
  );
}
