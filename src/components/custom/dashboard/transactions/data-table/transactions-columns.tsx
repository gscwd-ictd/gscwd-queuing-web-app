"use client";

import { ColumnDef } from "@tanstack/react-table";
import { EditTransactionModal } from "../edit-transaction-modal";
import { RemoveTransactionModal } from "../remove-transaction-modal";
import { ViewServiceTypeModal } from "../service-types/view-service-types-modal";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
import { ViewTransactionSupervisorModal } from "../view-transaction-supervisor-modal";
import { Transaction } from "@/lib/types/prisma/transaction";
import { User } from "@/lib/types/prisma/user";
import { ServiceType } from "@/lib/types/prisma/serviceType";

const TransactionColumnsActions = ({
  transaction,
}: {
  transaction: Transaction & { supervisor: User } & {
    serviceTypes: ServiceType[];
  };
}) => {
  const session = useSession();

  return (
    <div className="flex space-x-2">
      <ViewServiceTypeModal transaction={transaction} />
      {session && session.data?.user.role === Role.admin ? (
        <>
          <ViewTransactionSupervisorModal transaction={transaction} />
          <EditTransactionModal transaction={transaction} />
          <RemoveTransactionModal transaction={transaction} />
        </>
      ) : null}
    </div>
  );
};
export const transactionColumns: ColumnDef<
  Transaction & { supervisor: User } & {
    serviceTypes: ServiceType[];
  }
>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "code",
    header: "Code",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const transaction = row.original;
      return <TransactionColumnsActions transaction={transaction} />;
    },
  },
];
