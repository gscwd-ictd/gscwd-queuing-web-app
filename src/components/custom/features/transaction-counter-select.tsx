"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import axios from "axios";
import { ControllerRenderProps } from "react-hook-form";
import { accountLoginFormSchema } from "@/lib/schemas/dashboard/accountLoginFormSchema";
import { z } from "zod";
import { Transaction } from "@/lib/types/prisma/transaction";
import { Counter } from "@prisma/client";
import { toast } from "sonner";

type LoginFormValues = z.infer<typeof accountLoginFormSchema>;

type TransactionCounterSelectProps = {
  field?: ControllerRenderProps<LoginFormValues, "counterId">;
  onTransactionChange?: (transactionId: string) => void;
  onCounterChange?: (counterId: string) => void;
  selectedTransactionId?: string;
};

type TransactionWithCounters = Pick<Transaction, "id" | "name"> & {
  counters: Pick<Counter, "id" | "name">[];
};

export function TransactionCounterSelect({
  field,
  onTransactionChange,
  onCounterChange,
  selectedTransactionId,
}: TransactionCounterSelectProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<string>(
    selectedTransactionId || ""
  );

  const { data: transactions } = useQuery<TransactionWithCounters[]>({
    queryKey: ["get-all-unassigned-counters"],
    queryFn: async () => {
      try {
        const response = await axios.get<TransactionWithCounters[]>(
          `${process.env.NEXT_PUBLIC_HOST}/api/counters`
        );
        return response.data;
      } catch (error) {
        toast.error("Error fetching counters", { description: `${error}` });
        return [];
      }
    },
  });

  const handleTransactionChange = (value: string) => {
    field?.onChange("");
    setSelectedTransaction(value);
    onTransactionChange?.(value);
    onCounterChange?.("");
  };

  const handleCounterChange = (value: string) => {
    field?.onChange(value);
    onCounterChange?.(value);
  };

  const selectedTransactionData = transactions?.find(
    (transaction: TransactionWithCounters) =>
      transaction.id === selectedTransaction
  );
  const counters = selectedTransactionData?.counters || [];

  return (
    <div className="grid gap-6">
      <div className="grid gap-3">
        <Label htmlFor="transaction">Select Transaction</Label>
        <Select
          value={selectedTransactionId}
          onValueChange={handleTransactionChange}
        >
          <SelectTrigger id="transaction" className="w-full">
            <SelectValue placeholder="Choose a transaction" />
          </SelectTrigger>
          <SelectContent>
            {transactions && transactions.length > 0 ? (
              transactions.map((transaction) => (
                <SelectItem key={transaction.id} value={transaction.id}>
                  {transaction.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-transactions" disabled>
                No transactions available
              </SelectItem>
            )}
            <SelectItem value="not-applicable">Not Applicable</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3">
        <Label htmlFor="counter">Select Counter</Label>
        <Select
          value={field?.value || ""}
          onValueChange={handleCounterChange}
          disabled={!selectedTransaction}
        >
          <SelectTrigger id="counter" className="w-full">
            <SelectValue placeholder="Choose a counter" />
          </SelectTrigger>
          <SelectContent>
            {counters.length > 0 ? (
              counters.map((counter) => (
                <SelectItem key={counter.id} value={counter.id}>
                  {counter.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-counters" disabled>
                No counters available for this transaction
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
