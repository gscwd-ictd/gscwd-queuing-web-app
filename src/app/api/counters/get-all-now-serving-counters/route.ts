import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getPhilippineDayRange } from "@/lib/functions/getPhilippineDayRange";
import { QueuingStatus } from "@prisma/client";

export async function GET() {
  try {
    const { startOfDay, endOfDay } = getPhilippineDayRange();

    const transactions = await prisma.transaction.findMany({
      where: {
        name: {
          in: ["Customer Welfare", "New Service Application", "Payment"],
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const transactionMap = transactions.reduce((acc, transaction) => {
      const key = transaction.name.replace(/\s+/g, "").toLowerCase();
      acc[key] = transaction.id;
      return acc;
    }, {} as Record<string, string>);

    const counters = await prisma.counter.findMany({
      where: {
        transactionId: {
          in: Object.values(transactionMap),
        },
        // code: { not: "CW-4" },
      },
      include: {
        queuingTickets: {
          where: {
            queuingStatus: {
              in: [QueuingStatus.CALLED, QueuingStatus.NOW_SERVING],
            },
            dateUpdated: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          orderBy: {
            dateUpdated: "desc",
          },
          take: 1,
          select: {
            id: true,
            number: true,
            queuingStatus: true,
          },
        },
      },
      orderBy: {
        code: "asc",
      },
    });

    const data = {
      customerWelfare: counters
        .filter(
          (counter) => counter.transactionId === transactionMap.customerwelfare
        )
        .map((counter) => ({
          code: counter.code,
          name: counter.name,
          queuingTicket: counter.queuingTickets[0]
            ? {
                id: counter.queuingTickets[0].id,
                number: counter.queuingTickets[0].number,
                queuingStatus: counter.queuingTickets[0].queuingStatus,
              }
            : null,
        })),
      newServiceApplication: counters
        .filter(
          (counter) =>
            counter.transactionId === transactionMap.newserviceapplication
        )
        .map((counter) => ({
          code: counter.code,
          name: counter.name,
          queuingTicket: counter.queuingTickets[0]
            ? {
                id: counter.queuingTickets[0].id,
                number: counter.queuingTickets[0].number,
                queuingStatus: counter.queuingTickets[0].queuingStatus,
              }
            : null,
        })),
      payment: counters
        .filter((counter) => counter.transactionId === transactionMap.payment)
        .map((counter) => ({
          code: counter.code,
          name: counter.name,
          queuingTicket: counter.queuingTickets[0]
            ? {
                id: counter.queuingTickets[0].id,
                number: counter.queuingTickets[0].number,
                queuingStatus: counter.queuingTickets[0].queuingStatus,
              }
            : null,
        })),
    };

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
