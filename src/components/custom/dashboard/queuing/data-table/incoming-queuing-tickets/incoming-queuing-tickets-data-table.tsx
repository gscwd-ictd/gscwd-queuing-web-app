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
import { QueuingTicket } from "@/lib/types/prisma/queuingTicket";
import { QueuingStatus } from "@prisma/client";

interface IncomingQueuingTicketsDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  selectedTicketId?: string;
  onRowClick?: (ticket: QueuingTicket) => void;
}

export function IncomingQueuingTicketsDataTable<TData, TValue>({
  columns,
  data,
  loading,
  selectedTicketId,
  onRowClick,
}: IncomingQueuingTicketsDataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (originalRow) => {
      const ticket = originalRow as QueuingTicket;
      return ticket.id;
    },
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
              const isSelected = selectedTicketId === ticket.id;
              const lapsedTicket =
                ticket.queuingStatus === QueuingStatus.LAPSED;
              const shouldHighlight = lapsedTicket && !isSelected;
              return (
                <TableRow
                  key={row.id}
                  className={cn(
                    isSelected && "bg-blue-300 text-black",
                    onRowClick && "cursor-pointer hover:bg-gray-200",
                    shouldHighlight &&
                      "bg-red-500 text-white hover:bg-red-800 hover:text-white"
                  )}
                  onClick={() => onRowClick?.(ticket)}
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
                className="h-24 text-center"
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
