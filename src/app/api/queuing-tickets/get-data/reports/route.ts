import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma, QueuingStatus, Role } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const serviceTypeId = searchParams.get("serviceTypeId");

    if (!startDateParam || !endDateParam) {
      return NextResponse.json(
        { error: "Both start date and end date are required" },
        { status: 400 }
      );
    }

    const startDate = new Date(startDateParam);
    const endDate = new Date(endDateParam);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format provided" },
        { status: 400 }
      );
    }

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    if (startDate > endDate) {
      return NextResponse.json(
        { error: "Start date must be after end date" },
        { status: 400 }
      );
    }

    if (endDate < startDate) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    const whereClause: Prisma.QueuingTicketWhereInput = {
      queuingStatus: QueuingStatus.COMPLETED,
      AND: [
        {
          dateTransactionStarted: {
            gte: startDate,
          },
        },
        {
          dateTransactionEnded: {
            lte: endDate,
          },
        },
      ],
    };

    switch (session.user.role) {
      case Role.user:
        whereClause.userId = session.user.id;
        break;

      case Role.superuser:
        if (userId && userId !== "all") {
          whereClause.userId = userId;
        }
        whereClause.transactionId = session.user.assignedTransactionId;
        break;

      default:
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (serviceTypeId && serviceTypeId !== "") {
      whereClause.serviceTypeId = serviceTypeId;
    }

    const tickets = await prisma.queuingTicket.findMany({
      where: whereClause,
      include: {
        counter: true,
        transaction: true,
        serviceType: true,
        user: {
          select: {
            firstName: true,
            middleName: true,
            lastName: true,
            nameExtension: true,
            // email: true,
          },
        },
      },
      orderBy: {
        dateCreated: "asc",
      },
    });

    const generatedBy = {
      firstName: session.user.firstName,
      middleName: session.user.middleName,
      lastName: session.user.lastName,
      nameExtension: session.user.nameExtension,
      position: session.user.position,
    };

    const notedBy = await prisma.transaction.findUnique({
      where: {
        id: session.user.assignedTransactionId,
      },
      select: {
        supervisor: {
          select: {
            firstName: true,
            middleName: true,
            lastName: true,
            nameExtension: true,
            position: true,
          },
        },
      },
    });

    const approvedBy = await prisma.department.findUnique({
      where: { id: session.user.departmentId },
      select: {
        manager: {
          select: {
            firstName: true,
            middleName: true,
            lastName: true,
            nameExtension: true,
            position: true,
          },
        },
      },
    });

    return NextResponse.json(
      { tickets, generatedBy, notedBy, approvedBy },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
