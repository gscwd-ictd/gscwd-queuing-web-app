import { NextResponse } from "next/server";
import { QueuingStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { getIO } from "@/lib/socket.io";
import { getPhilippineDayRange } from "@/lib/functions/getPhilippineDayRange";

export async function PUT() {
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

    const updatedTicket = await prisma.$transaction(async (tx) => {
      const nextTicket = await tx.queuingTicket.findFirst({
        where: {
          transactionId: counter.transactionId,
          queuingStatus: QueuingStatus.PENDING,
          counterId: null,
          isPrioritized: false,
          dateCreated: { gte: startOfDay, lte: endOfDay },
        },
        orderBy: { dateCreated: "asc" },
      });

      if (!nextTicket) return null;

      const updatedTicket = await tx.queuingTicket.update({
        where: { id: nextTicket.id },
        data: {
          queuingStatus: QueuingStatus.CALLED,
          counterId: session.user.counterId,
          userId: session.user.id,
          dateUpdated: new Date(),
          departmentId: session.user.departmentId,
        },
        include: {
          transaction: true,
          counter: true,
        },
      });

      // TODO: Retain logic?
      await tx.queuingTicket.updateMany({
        where: {
          transactionId: counter.transactionId,
          queuingStatus: QueuingStatus.LAPSED,
          isPrioritized: false,
          dateCreated: { gte: startOfDay, lte: endOfDay },
          position: {
            lt: updatedTicket.position - 4,
          },
        },
        data: {
          queuingStatus: QueuingStatus.CANCELLED,
          dateUpdated: new Date(),
        },
      });

      return updatedTicket;
    });

    if (!updatedTicket) {
      return NextResponse.json(
        { error: "No available tickets to call" },
        { status: 404 }
      );
    }

    const io = getIO();
    if (io) {
      io.emit("ticket-called", {
        id: updatedTicket.id,
        number: updatedTicket.number,
        isPrioritized: updatedTicket.isPrioritized,
        counter: {
          id: updatedTicket.counter?.id,
          name: updatedTicket.counter?.name,
          code: updatedTicket.counter?.code,
        },
        transaction: {
          transaction: updatedTicket.transaction?.name,
        },
      });
    }

    return NextResponse.json(updatedTicket, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
