"use client";

import { ColumnDef } from "@tanstack/react-table";
import { EditServiceTypeModal } from "../edit-service-type-modal";
import { DeleteServiceTypeModal } from "../delete-service-type-modal";
import { ServiceType } from "@/lib/types/prisma/serviceType";

export const serviceTypesColumns: ColumnDef<ServiceType>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const serviceType = row.original;
      return (
        <div className="flex space-x-2">
          <EditServiceTypeModal serviceType={serviceType} />
          <DeleteServiceTypeModal serviceType={serviceType} />
        </div>
      );
    },
  },
];
