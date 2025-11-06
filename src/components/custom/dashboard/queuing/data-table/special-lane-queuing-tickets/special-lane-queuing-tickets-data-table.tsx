"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingIndicator } from "@/components/custom/features/loading-indicator";
import { cn } from "@/lib/utils";
import { QueuingStatus } from "@prisma/client";
import { QueuingTicket } from "@/lib/types/prisma/queuingTicket";

interface SpecialLaneQueuingTicketsDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
}

export function SpecialLaneQueuingTicketsDataTable<TData, TValue>({
  columns,
  data,
  loading,
}: SpecialLaneQueuingTicketsDataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border overflow-y-auto h-[227px]">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length} rowSpan={5}>
                <LoadingIndicator className="p-4" />
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const ticket = row.original as QueuingTicket;
              const lapsedTicket =
                ticket.queuingStatus === QueuingStatus.LAPSED;
              const shouldHighlight = lapsedTicket;
              return (
                <TableRow
                  key={row.id}
                  className={cn(
                    shouldHighlight
                      ? "bg-red-500 text-white hover:bg-red-800 hover:text-white"
                      : ""
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                rowSpan={5}
                className="h-46 text-center"
              >
                No tickets in queue
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
