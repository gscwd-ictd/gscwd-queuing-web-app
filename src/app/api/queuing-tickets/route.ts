import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getIO } from "@/lib/socket.io";
import { getPhilippineDayRange } from "@/lib/functions/getPhilippineDayRange";
import { QueuingStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.transaction?.id) {
      return NextResponse.json(
        { error: "Transaction is required" },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: body.transaction.id },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    const { startOfDay, endOfDay } = getPhilippineDayRange();
    const isPrioritized = body.isPrioritized ?? false;

    // * ticketPrefix from last ticket is used instead of matching transaction ID from body to prevent ticket number duplication, e.g. when ticket from payment is transferred to customer welfare / new service application
    const ticketPrefix = transaction.code.startsWith("CW")
      ? "CW"
      : transaction.code.startsWith("A")
      ? "A"
      : "P";

    const lastTicket = await prisma.queuingTicket.findFirst({
      where: {
        number: {
          startsWith: ticketPrefix,
        },
        isPrioritized,
        dateCreated: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        position: "desc",
      },
    });

    const nextPosition = (lastTicket?.position ?? 0) + 1;

    const formattedNumber = `${ticketPrefix}${nextPosition
      .toString()
      .padStart(4, "0")}${isPrioritized ? "S" : ""}`;

    const newTicket = await prisma.queuingTicket.create({
      data: {
        position: nextPosition,
        number: formattedNumber,
        isPrioritized,
        transactionId: body.transaction.id,
        queuingStatus: QueuingStatus.PENDING,
      },
      select: {
        id: true,
        number: true,
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
      },
    });

    const io = getIO();
    if (io) {
      io.emit("ticket-created", newTicket);
    }

    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
