"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { FileX2 } from "lucide-react";

export const description =
  "A pie chart showing top five service types this month";

const chartConfig = {
  total: { label: "Total" },
} satisfies ChartConfig;

type MonthlyServiceTypesChartProps = {
  chartsData: {
    serviceType: string;
    total: number;
  }[];
};

export function MonthlyServiceTypesChart({
  chartsData,
}: MonthlyServiceTypesChartProps) {
  return (
    <Card className="flex flex-col w-full h-[305px]">
      <CardHeader className="border-b">
        <CardTitle>Monthly Service Types Served</CardTitle>
        <CardDescription>
          As of {format(new Date(), "MMMM yyyy")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-2">
        <ChartContainer config={chartConfig} className="h-full w-full">
          {chartsData && chartsData.length > 0 ? (
            <BarChart
              accessibilityLayer
              data={chartsData}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />

              <XAxis
                dataKey="serviceType"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={0}
                tick={({ x, y, payload }) => {
                  const text =
                    payload.value.length > 8
                      ? payload.value.slice(0, 8) + "…"
                      : payload.value;
                  return (
                    <text x={x} y={y + 15} textAnchor="middle" fontSize={11}>
                      <title>{payload.value}</title>
                      {text}
                    </text>
                  );
                }}
              />

              <ChartTooltip
                content={
                  <ChartTooltipContent className="w-[180px]" nameKey="total" />
                }
              />

              <Bar
                dataKey="total"
                fill="var(--primary)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              <div className="flex flex-col gap-3 items-center text-gray-400">
                <FileX2 size={50} />
                <p className="text-lg font-medium">No data available</p>
              </div>
            </div>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
