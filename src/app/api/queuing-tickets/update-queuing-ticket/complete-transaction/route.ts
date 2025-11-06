import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getIO } from "@/lib/socket.io";
import { QueuingStatus } from "@prisma/client";

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

    const {
      ticketId,
      serviceTypeId,
      remarks,
      otherServiceType,
      dateTransactionEnded,
    } = await request.json();

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

    const updatedTicket = await prisma.queuingTicket.update({
      where: {
        id: ticketId,
        counterId: session.user.counterId,
      },
      data: {
        queuingStatus: QueuingStatus.COMPLETED,
        dateTransactionEnded: dateTransactionEnded,
        serviceTypeId: serviceTypeId,
        otherServiceType: otherServiceType || null,
        remarks: remarks || null,
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
      io.emit("transaction-completed", {
        id: updatedTicket.id,
        number: updatedTicket.number,
        counterId: updatedTicket.counterId,
      });
    }

    return NextResponse.json(updatedTicket, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
