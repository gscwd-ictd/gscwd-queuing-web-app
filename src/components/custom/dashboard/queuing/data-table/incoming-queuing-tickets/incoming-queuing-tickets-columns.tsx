"use client";

import { Counter } from "@/lib/types/prisma/counter";
import { QueuingTicket } from "@/lib/types/prisma/queuingTicket";
import { User } from "@/lib/types/prisma/user";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<
  QueuingTicket & { counter: Counter } & { transferredByUser: User } & {
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
    cell: ({ row }) => {
      const number = row.original.number;
      const timesTicketLapsed = row.original.timesTicketLapsed;
      return (
        <span>
          {number} {timesTicketLapsed > 0 ? `[${timesTicketLapsed}]` : null}
        </span>
      );
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
    id: "counter",
    header: "Counter",
    cell: ({ row }) => {
      const ticket = row.original;
      return ticket.counter ? ticket.counter.name : "-";
    },
  },
];
