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
        transactionId: counter.transactionId,
        queuingStatus: QueuingStatus.TRANSFERRED,
      },
      include: {
        transaction: true,
        counter: true,
        transferredByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
          },
        },
        transferredToUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
          },
        },
      },
      orderBy: { dateCreated: "asc" },
      // take: 5,
    });

    return NextResponse.json(tickets);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
