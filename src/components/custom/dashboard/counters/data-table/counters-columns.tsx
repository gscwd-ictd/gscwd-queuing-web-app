"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DeleteCounterModal } from "../delete-counter-modal";
import { EditCounterModal } from "../edit-counter-modal";
import { Counter } from "@/lib/types/prisma/counter";

export const countersColumns: ColumnDef<Counter>[] = [
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
      const counter = row.original;
      return (
        <div className="flex space-x-2">
          <EditCounterModal counter={counter} />
          <DeleteCounterModal counter={counter} />
        </div>
      );
    },
  },
];
