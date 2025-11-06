import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { QueuingStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.counterId) {
      return NextResponse.json(
        { error: "No counter assigned to this user" },
        { status: 400 }
      );
    }

    const { ticketId, dateTransactionStarted } = await request.json();

    const ticket = await prisma.queuingTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    if (ticket.queuingStatus !== QueuingStatus.CALLED) {
      return NextResponse.json(
        { error: "Ticket is not in CALLED status" },
        { status: 400 }
      );
    }

    const transactionStartDate = dateTransactionStarted
      ? new Date(dateTransactionStarted)
      : new Date();

    const updatedTicket = await prisma.queuingTicket.update({
      where: {
        id: ticketId,
        counterId: session.user.counterId,
        userId: session.user.id,
      },
      data: {
        queuingStatus: QueuingStatus.NOW_SERVING,
        dateTransactionStarted: transactionStartDate,
      },
      include: {
        counter: true,
      },
    });

    return NextResponse.json(updatedTicket, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
