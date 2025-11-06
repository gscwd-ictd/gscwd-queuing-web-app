import { Transaction } from "@/lib/types/prisma/transaction";

export function getTransactionIdsExceptPaymentId(transactions: Transaction[]) {
  return (
    transactions
      ?.filter(
        (transaction: Transaction) =>
          transaction.name === "New Service Application" ||
          transaction.name === "Customer Welfare"
      )
      ?.map((transaction) => transaction.id) || []
  );
}

export function getPaymentTransactionId(transactions: Transaction[]) {
  return (
    transactions
      ?.filter((transaction: Transaction) => transaction.name === "Payment")
      ?.map((transaction: Transaction) => transaction.id) || []
  );
}
