import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getPhilippineDayRange } from "@/lib/functions/getPhilippineDayRange";
import { QueuingStatus } from "@prisma/client";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();

    const { startOfDay, endOfDay } = getPhilippineDayRange();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const completedTickets = await prisma.queuingTicket.findMany({
      where: {
        userId: userId,
        queuingStatus: QueuingStatus.COMPLETED,
        dateTransactionStarted: { not: null },
        dateTransactionEnded: { not: null },
      },
      select: {
        dateTransactionStarted: true,
        dateTransactionEnded: true,
        dateCreated: true,
      },
    });

    const todayTickets = completedTickets.filter(
      (ticket) =>
        ticket.dateTransactionEnded &&
        ticket.dateTransactionEnded >= startOfDay &&
        ticket.dateTransactionEnded <= endOfDay
    );

    const monthlyTickets = completedTickets.filter(
      (ticket) =>
        ticket.dateTransactionEnded &&
        ticket.dateTransactionEnded >= startOfMonth
    );

    let totalMilliseconds = 0;
    let validTodayTickets = 0;

    todayTickets.forEach((ticket) => {
      if (ticket.dateTransactionStarted && ticket.dateTransactionEnded) {
        const duration =
          ticket.dateTransactionEnded.getTime() -
          ticket.dateTransactionStarted.getTime();
        totalMilliseconds += duration;
        validTodayTickets++;
      }
    });

    const averageTimeInMs =
      validTodayTickets > 0 ? totalMilliseconds / validTodayTickets : 0;

    const formatTime = (milliseconds: number) => {
      const totalSeconds = Math.floor(milliseconds / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    const stats = {
      monthly: monthlyTickets.length,
      today: todayTickets.length,
      averageTime: formatTime(averageTimeInMs),
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
