import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CounterWithTicket } from "@/lib/types/prisma/counter";

type CounterDisplayTableProps = {
  counters: CounterWithTicket[];
  blinkingCounters: Set<string>;
  tableName: string;
};

export function CounterDisplayTable({
  counters,
  blinkingCounters,
  tableName,
}: CounterDisplayTableProps) {
  return (
    <>
      <Table className="h-full bg-white rounded-md drop-shadow-md border-2 border-gray-400">
        <TableHeader className="sticky top-0 bg-white z-10">
          <TableRow>
            <TableHead
              colSpan={2}
              className="text-center text-[90px] font-bold p-3 bg-primary text-white leading-none"
            >
              {tableName.toLocaleUpperCase()}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {counters.map((counter) => (
            <TableRow
              key={counter.code}
              className="text-[180px] leading-none border-b-2 border-gray-400"
            >
              <TableCell className="text-left font-semibold p-5">
                {counter.code}
              </TableCell>
              <TableCell
                className={`text-right font-bold p-5 ${
                  blinkingCounters.has(counter.code!)
                    ? "text-red-500 animate-pulse"
                    : "text-black"
                }`}
              >
                {counter.queuingTicket?.number ?? (
                  <span className="text-gray-200">---</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
