import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getIO } from "@/lib/socket.io";
import { QueuingStatus } from "@prisma/client";

const MAX_LAPSES_ALLOWED = 5;

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { ticketId } = await request.json();

    if (!ticketId) {
      return NextResponse.json(
        { error: "Ticket ID is required" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const currentTicket = await tx.queuingTicket.findUnique({
        where: { id: ticketId },
      });

      if (!currentTicket) {
        throw new Error("Ticket not found");
      }

      const newLapseCount = (currentTicket.timesTicketLapsed || 0) + 1;

      if (newLapseCount >= MAX_LAPSES_ALLOWED) {
        const cancelledTicket = await tx.queuingTicket.update({
          where: { id: ticketId },
          data: {
            queuingStatus: QueuingStatus.CANCELLED,
            timesTicketLapsed: newLapseCount,
            dateUpdated: new Date(),
            counterId: null,
            userId: null,
            departmentId: null,
          },
        });
        return { ticket: cancelledTicket, wasCancelled: true };
      }

      const updatedTicket = await tx.queuingTicket.update({
        where: { id: ticketId },
        data: {
          queuingStatus: QueuingStatus.LAPSED,
          timesTicketLapsed: newLapseCount,
          dateUpdated: new Date(),
          userId: null,
          departmentId: null,
        },
      });
      return { ticket: updatedTicket, wasCancelled: false };
    });

    const io = getIO();
    if (io) {
      if (result.wasCancelled) {
        io.emit("ticket-cancelled", {
          id: result.ticket.id,
          number: result.ticket.number,
          timesLapsed: result.ticket.timesTicketLapsed,
        });
      } else {
        io.emit("ticket-marked-as-lapsed", {
          id: result.ticket.id,
          number: result.ticket.number,
          timesLapsed: result.ticket.timesTicketLapsed,
        });
      }
    }

    return NextResponse.json(result.ticket, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
