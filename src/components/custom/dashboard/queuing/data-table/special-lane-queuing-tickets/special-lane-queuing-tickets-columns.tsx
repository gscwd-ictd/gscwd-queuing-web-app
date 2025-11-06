"use client";

import { Counter } from "@/lib/types/prisma/counter";
import { QueuingTicket } from "@/lib/types/prisma/queuingTicket";
import { QueuingStatus } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<QueuingTicket & { counter: Counter }>[] = [
  {
    id: "index",
    header: () => <div className="w-[25px]">#</div>,
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
    id: "counter",
    header: "Counter",
    cell: ({ row }) => {
      const ticket = row.original;
      return ticket.queuingStatus !== QueuingStatus.LAPSED && ticket.counter?.id
        ? ticket.counter.name
        : "-";
    },
  },
];
