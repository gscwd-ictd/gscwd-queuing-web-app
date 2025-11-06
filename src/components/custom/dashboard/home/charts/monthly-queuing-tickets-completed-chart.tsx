"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, Legend, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export const description =
  "An area chart showing the tickets completed this month";

const chartConfig = {
  regularLane: {
    label: "Total Regular Lane Tickets",
    color: "var(--chart-1)",
  },
  specialLane: {
    label: "Total Special Lane Tickets",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

type MonthlyQueuingTicketsCompletedChartProps = {
  chartsData: {
    date: string;
    regularLane: number;
    specialLane: number;
  }[];
};

export function MonthlyQueuingTicketsCompletedChart({
  chartsData,
}: MonthlyQueuingTicketsCompletedChartProps) {
  return (
    <Card className="flex flex-col w-full h-[600px] overflow-hidden">
      <CardHeader className="border-b shrink-0">
        <CardTitle>Monthly Queuing Tickets Completed</CardTitle>
        <CardDescription>
          As of {format(new Date(), "MMMM yyyy")}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 p-2">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <AreaChart data={chartsData}>
            <defs>
              <linearGradient
                id="fillTotalSpecialLaneTickets"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--chart-2)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-2)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient
                id="fillTotalRegularLaneTickets"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="square"
              formatter={(value) => {
                const item = chartConfig[value as keyof typeof chartConfig];
                return item?.label || value;
              }}
            />

            <Area
              dataKey="regularLane"
              type="natural"
              fill="url(#fillTotalRegularLaneTickets)"
              stroke="var(--chart-1)"
              stackId="a"
            />
            <Area
              dataKey="specialLane"
              type="natural"
              fill="url(#fillTotalSpecialLaneTickets)"
              stroke="var(--chart-2)"
              stackId="b"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
