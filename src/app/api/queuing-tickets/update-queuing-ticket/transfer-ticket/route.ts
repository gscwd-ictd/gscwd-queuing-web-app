import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getIO } from "@/lib/socket.io";
import { QueuingStatus } from "@prisma/client";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.counterId) {
      return NextResponse.json(
        { error: "No counter assigned to this user" },
        { status: 400 }
      );
    }

    const { ticketId, transferredTo } = await request.json();

    const ticket = await prisma.queuingTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    if (ticket.queuingStatus !== QueuingStatus.NOW_SERVING) {
      return NextResponse.json(
        { error: "Ticket is not in NOW_SERVING status" },
        { status: 400 }
      );
    }

    const transferredToUser = await prisma.user.findUnique({
      where: { id: transferredTo },
    });

    if (!transferredToUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const updatedTicket = await prisma.queuingTicket.update({
      where: {
        id: ticketId,
      },
      data: {
        queuingStatus: QueuingStatus.TRANSFERRED,
        dateUpdated: new Date(),
        dateTransactionStarted: null,
        transferredBy: userId,
        transferredTo: transferredTo,
        counterId: null,
      },
      include: {
        transaction: true,
        counter: true,
        serviceType: true,
        department: true,
      },
    });

    const io = getIO();
    if (io) {
      io.emit("ticket-transferred", {
        // id: updatedTicket.id,
        // number: updatedTicket.number,
        // counterId: updatedTicket.counterId,
        id: updatedTicket.id,
        number: updatedTicket.number,
        counterId: updatedTicket.counterId,
        counterName: updatedTicket.counter?.name,
        code: updatedTicket.counter?.code,
        transactionType: updatedTicket.transaction?.name,
        timesLapsed: updatedTicket.timesTicketLapsed,
        isPrioritized: updatedTicket.isPrioritized,
      });
    }

    return NextResponse.json(updatedTicket, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
