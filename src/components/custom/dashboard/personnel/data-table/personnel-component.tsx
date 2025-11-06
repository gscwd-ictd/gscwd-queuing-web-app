"use client";

import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { User } from "@/lib/types/prisma/user";
import { personnelColumns } from "./personnel-columns";
import { PersonnelDataTable } from "./personnel-data-table";

type Personnel = Pick<
  User,
  | "id"
  | "firstName"
  | "middleName"
  | "lastName"
  | "nameExtension"
  | "email"
  | "position"
>;

export function PersonnelComponent() {
  const { data: personnel, isLoading } = useQuery<Personnel[]>({
    queryKey: ["get-all-personnel"],
    queryFn: async () => {
      try {
        const response = await axios.get<Personnel[]>(
          `${process.env.NEXT_PUBLIC_HOST}/api/users/get-all-users-by-supervisor`
        );
        if (response.data.length === 0) {
          toast.info("Info", { description: "No personnel found" });
        } else {
          toast.success("Success", {
            description: "Personnel fetched successfully",
          });
        }
        return response.data;
      } catch (error) {
        toast.error("Error fetching personnel", { description: `${error}` });
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
          <PersonnelDataTable
            columns={personnelColumns}
            data={personnel ?? []}
            loading={isLoading}
          />
        </div>
      </Suspense>
    </>
  );
}
