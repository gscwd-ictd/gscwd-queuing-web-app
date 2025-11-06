import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { QueuingStatus } from "@prisma/client";
import { getIO } from "@/lib/socket.io";
import { getPhilippineDayRange } from "@/lib/functions/getPhilippineDayRange";

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!session.user.counterId || !session.user.departmentId) {
    return NextResponse.json(
      { error: "Missing counter or department assignment" },
      { status: 400 }
    );
  }

  try {
    const { startOfDay, endOfDay } = getPhilippineDayRange();

    const { ticketId } = await request.json();

    if (!ticketId) {
      return NextResponse.json(
        { error: "Ticket ID is required" },
        { status: 400 }
      );
    }

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

    const activeTicket = await prisma.queuingTicket.findFirst({
      where: {
        transactionId: counter.transactionId,
        counterId: session.user.counterId,
        userId: session.user.id,
        queuingStatus: {
          in: [QueuingStatus.CALLED, QueuingStatus.NOW_SERVING],
        },
        dateCreated: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (activeTicket) {
      return NextResponse.json(
        {
          error: "Finish ticket first before getting next ticket",
          activeTicketId: activeTicket.id,
        },
        { status: 400 }
      );
    }

    const ticket = await prisma.queuingTicket.findUnique({
      where: { id: ticketId },
      include: {
        transaction: true,
        counter: true,
        serviceType: true,
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    if (
      ticket.queuingStatus !== QueuingStatus.TRANSFERRED &&
      ticket.queuingStatus !== QueuingStatus.LAPSED
    ) {
      return NextResponse.json(
        { error: "Ticket cannot be called" },
        { status: 400 }
      );
    }

    const updatedTicket = await prisma.queuingTicket.update({
      where: { id: ticketId },
      data: {
        queuingStatus: QueuingStatus.CALLED,
        counterId: session.user.counterId,
        userId: session.user.id,
        dateUpdated: new Date(),
        dateTransactionStarted: null,
        departmentId: session.user.departmentId,
      },
      include: {
        transaction: true,
        counter: true,
        serviceType: true,
      },
    });

    const io = getIO();
    if (io) {
      io.emit("ticket-called", {
        id: updatedTicket.id,
        number: updatedTicket.number,
        counterId: updatedTicket.counter?.id,
        counterName: updatedTicket.counter?.name,
        code: updatedTicket.counter?.code,
        transactionType: updatedTicket.transaction?.name,
      });
    }

    return NextResponse.json(updatedTicket, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
