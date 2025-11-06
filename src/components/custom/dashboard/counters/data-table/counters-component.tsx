"use client";

import { Suspense } from "react";
import { CountersDataTable } from "./counters-data-table";
import { countersColumns } from "./counters-columns";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { Counter } from "@/lib/types/prisma/counter";

export function CountersComponent() {
  const { data: counters } = useQuery<Counter[]>({
    queryKey: ["counters"],
    queryFn: async () => {
      try {
        const response = await axios.get<Counter[]>(
          `${process.env.NEXT_PUBLIC_HOST}/api/counters/get-all-counters-by-transaction`
        );

        if (response.data.length === 0) {
          toast.info("Info", {
            description: "No counters found",
          });
        }

        return response.data;
      } catch (error) {
        toast.error("Error fetching counters", { description: `${error}` });
        return [];
      }
    },
  });
  return (
    <>
      <Suspense fallback={<p>Loading...</p>}>
        <div className="p-2 h-full">
          <CountersDataTable columns={countersColumns} data={counters ?? []} />
        </div>
      </Suspense>
    </>
  );
}
