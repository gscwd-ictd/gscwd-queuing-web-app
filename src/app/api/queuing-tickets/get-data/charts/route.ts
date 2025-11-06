import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { startOfMonth, endOfMonth, format, eachDayOfInterval } from "date-fns";
import { QueuingStatus } from "@prisma/client";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const monthlyServiceTypes = await prisma.queuingTicket.groupBy({
      by: ["serviceTypeId"],
      where: {
        userId,
        queuingStatus: QueuingStatus.COMPLETED,
        dateCreated: { gte: monthStart, lte: monthEnd },
      },
      _count: { serviceTypeId: true },
    });

    const serviceTypeIds = monthlyServiceTypes
      .map((s) => s.serviceTypeId)
      .filter((id): id is string => !!id);

    const serviceTypes = await prisma.serviceType.findMany({
      where: {
        id: { in: serviceTypeIds },
      },
      select: { id: true, name: true },
    });

    const monthlyServiceTypesData = monthlyServiceTypes.map((item) => {
      const serviceTypeName =
        serviceTypes.find((s) => s.id === item.serviceTypeId)?.name ||
        "Unknown";
      return {
        serviceType: serviceTypeName,
        total: item._count.serviceTypeId,
      };
    });

    const tickets = await prisma.queuingTicket.findMany({
      where: {
        userId,
        queuingStatus: QueuingStatus.COMPLETED,
        dateCreated: { gte: monthStart, lte: monthEnd },
      },
      select: {
        dateCreated: true,
        isPrioritized: true,
      },
    });

    const dailyMap: Record<
      string,
      { regularLane: number; specialLane: number }
    > = {};

    tickets.forEach((t) => {
      const dateKey = format(t.dateCreated, "yyyy-MM-dd");
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { regularLane: 0, specialLane: 0 };
      }

      if (t.isPrioritized) {
        dailyMap[dateKey].specialLane++;
      } else {
        dailyMap[dateKey].regularLane++;
      }
    });

    const allDates = eachDayOfInterval({ start: monthStart, end: now });
    allDates.forEach((date) => {
      const dateKey = format(date, "yyyy-MM-dd");
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { regularLane: 0, specialLane: 0 };
      }
    });

    const monthlyQueuingTickets = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, counts]) => ({
        date,
        ...counts,
      }));

    return NextResponse.json({
      monthlyServiceTypes: monthlyServiceTypesData,
      monthlyQueuingTickets,
    });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
