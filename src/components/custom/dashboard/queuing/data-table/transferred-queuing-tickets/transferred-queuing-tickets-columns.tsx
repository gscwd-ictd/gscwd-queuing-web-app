"use client";

import { QueuingTicket } from "@/lib/types/prisma/queuingTicket";
import { Transaction } from "@/lib/types/prisma/transaction";
import { User } from "@/lib/types/prisma/user";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<
  QueuingTicket & { transaction: Transaction } & { transferredByUser: User } & {
    transferredToUser: User;
  }
>[] = [
  {
    id: "index",
    header: () => <div className="w-[5px]">#</div>,
    cell: ({ row }) => {
      return row.index + 1;
    },
  },
  {
    accessorKey: "number",
    header: "Number",
  },
  {
    id: "transferredByUser",
    header: "Transferred By",
    cell: ({ row }) => {
      const ticket = row.original;
      const fullName = `${ticket.transferredByUser.firstName} ${ticket.transferredByUser.lastName}`;
      return fullName;
    },
  },
  {
    id: "transferredToUser",
    header: "Transferred To",
    cell: ({ row }) => {
      const ticket = row.original;
      const fullName = `${ticket.transferredToUser.firstName} ${ticket.transferredToUser.lastName}`;
      return fullName;
    },
  },
];
