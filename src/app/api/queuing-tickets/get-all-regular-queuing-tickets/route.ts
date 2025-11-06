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
        dateCreated: {
          gte: startOfDay,
          lte: endOfDay,
        },
        timesTicketLapsed: { lt: 5 },
        transactionId: counter.transactionId,
        isPrioritized: false,
        queuingStatus: {
          in: [
            QueuingStatus.PENDING,
            QueuingStatus.CALLED,
            QueuingStatus.NOW_SERVING,
            QueuingStatus.LAPSED,
          ],
        },
        transferredBy: null,
        transferredTo: null,
      },
      select: {
        id: true,
        number: true,
        timesTicketLapsed: true,
        position: true,
        queuingStatus: true,
        isPrioritized: true,
        dateCreated: true,
        transaction: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        counter: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: [{ position: "asc" }, { dateCreated: "asc" }],
      // take: 5,
    });
    
    return NextResponse.json(tickets, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
