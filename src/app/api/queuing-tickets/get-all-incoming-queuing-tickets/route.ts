import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { QueuingStatus } from "@prisma/client";
import { getPhilippineDayRange } from "@/lib/functions/getPhilippineDayRange";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { startOfDay, endOfDay } = getPhilippineDayRange();

    const counter = await prisma.counter.findUnique({
      where: {
        id: session.user.counterId,
      },
      select: {
        transactionId: true,
        code: true,
      },
    });

    if (!counter) {
      return NextResponse.json(
        { message: "Counter not found" },
        { status: 404 }
      );
    }

    const tickets = await prisma.queuingTicket.findMany({
      where: {
        transferredToUser: {
          assignedTransactionId: counter.transactionId,
        },
        dateCreated: {
          gte: startOfDay,
          lte: endOfDay,
        },
        queuingStatus: {
          in: [
            QueuingStatus.TRANSFERRED,
            QueuingStatus.LAPSED,
            QueuingStatus.CALLED,
            QueuingStatus.NOW_SERVING,
          ],
        },
      },
      orderBy: [{ dateCreated: "asc" }],
      select: {
        id: true,
        number: true,
        timesTicketLapsed: true,
        queuingStatus: true,
        isPrioritized: true,
        transactionId: true,
        counter: {
          select: {
            id: true,
            name: true,
            code: true,
            transactionId: true,
          },
        },
        transferredByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        transferredToUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      // take: 5,
    });
    return NextResponse.json(tickets, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
