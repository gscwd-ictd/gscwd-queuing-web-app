"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type ServedCustomerStatsProps = {
  stats: {
    monthly: number;
    today: number;
    averageTime: string;
  };
  loading: boolean;
  error: Error | null;
};

export function ServedCustomerStats({
  stats,
  loading,
  error,
}: ServedCustomerStatsProps) {
  if (loading) {
    return (
      <div className="border border-gray-200 p-2 h-full">
        <Table className="border border-gray-200">
          <TableHeader>
            <TableRow>
              <TableHead
                colSpan={2}
                className="text-xl font-bold flex flex-row gap-2 items-center text-primary"
              >
                <Info />
                USER STATISTICS
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((row) => (
              <TableRow key={row}>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-10" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-gray-200 p-2 h-full">
        <Table className="border border-gray-200">
          <TableHeader>
            <TableRow>
              <TableHead
                colSpan={2}
                className="text-xl font-bold flex flex-row gap-2 items-center text-primary"
              >
                <Info />
                USER STATISTICS
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Monthly</TableCell>
              <TableCell>
                <span className="text-red-500">No data found</span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Today</TableCell>
              <TableCell>
                <span className="text-red-500">No data found</span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Average Time (today)</TableCell>
              <TableCell>
                <span className="text-red-500">No data found</span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 p-2 h-full">
      <Table className="border border-gray-200">
        <TableHeader>
          <TableRow>
            <TableHead
              colSpan={2}
              className="text-xl font-bold flex flex-row gap-2 items-center text-primary"
            >
              <Info />
              USER STATISTICS
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Monthly</TableCell>
            <TableCell>{stats.monthly || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Today</TableCell>
            <TableCell>{stats.today || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Average Time (today)</TableCell>
            <TableCell>{stats.averageTime || "00:00:00"}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
