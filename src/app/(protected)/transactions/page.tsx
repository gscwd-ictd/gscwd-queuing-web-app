import { AddTransactionModal } from "@/components/custom/dashboard/transactions/add-transaction-modal";
import { TransactionsComponent } from "@/components/custom/dashboard/transactions/data-table/transactions-component";

export default function Transactions() {
  return (
    <>
      <h1 className="text-xl font-semibold">Transactions</h1>
      <div className="mt-6">
        <AddTransactionModal />
        <TransactionsComponent />
      </div>
    </>
  );
}
