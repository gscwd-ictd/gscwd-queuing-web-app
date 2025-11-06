"use client";

import { Suspense } from "react";
import { TransactionsDataTable } from "./transactions-data-table";
import { transactionColumns } from "./transactions-columns";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { Transaction } from "@/lib/types/prisma/transaction";
import { User } from "@/lib/types/prisma/user";
import { ServiceType } from "@/lib/types/prisma/serviceType";

export function TransactionsComponent() {
  const { data: transactions, isLoading } = useQuery<
    (Transaction & { supervisor: User } & {
      serviceTypes: ServiceType[];
    })[]
  >({
    queryKey: ["get-all-assigned-transactions"],
    queryFn: async () => {
      try {
        const response = await axios.get<
          (Transaction & { supervisor: User } & {
            serviceTypes: ServiceType[];
          })[]
        >(
          `${process.env.NEXT_PUBLIC_HOST}/api/transactions/get-all-transactions-by-department`
        );
        if (response.data.length === 0) {
          toast.info("Info", { description: "No transactions found" });
        } else {
          toast.success("Success", {
            description: "Transactions fetched successfully",
          });
        }
        return response.data;
      } catch (error) {
        toast.error("Error fetching transactions", { description: `${error}` });
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
          <TransactionsDataTable
            columns={transactionColumns}
            data={transactions ?? []}
            loading={isLoading}
          />
        </div>
      </Suspense>
    </>
  );
}
