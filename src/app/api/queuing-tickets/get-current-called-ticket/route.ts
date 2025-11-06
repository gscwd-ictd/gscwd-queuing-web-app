import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { QueuingStatus } from "@prisma/client";
import { getPhilippineDayRange } from "@/lib/functions/getPhilippineDayRange";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const counterId = session.user?.counterId;

    if (!counterId) {
      return NextResponse.json(
        { error: "Counter ID not found in session" },
        { status: 400 }
      );
    }

    const { startOfDay, endOfDay } = getPhilippineDayRange();

    const currentTicket = await prisma.queuingTicket.findFirst({
      where: {
        counterId: counterId,
        queuingStatus: {
          in: [QueuingStatus.CALLED, QueuingStatus.NOW_SERVING],
        },
        dateTransactionEnded: null,
        dateCreated: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        counter: true,
        transaction: true,
      },
    });

    return NextResponse.json(currentTicket, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
