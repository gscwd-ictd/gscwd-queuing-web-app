import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { QueuingStatus } from "@prisma/client";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existingServiceType = await prisma.serviceType.findUnique({
      where: { id: id },
      include: {
        queuingTickets: {
          where: {
            OR: [
              { queuingStatus: QueuingStatus.TRANSFERRED },
              { queuingStatus: QueuingStatus.COMPLETED },
            ],
          },
        },
      },
    });

    if (!existingServiceType) {
      return NextResponse.json(
        { error: "Service type not found" },
        { status: 404 }
      );
    }

    if (existingServiceType.queuingTickets.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete service type. There are queuing tickets associated with this service type.",
          queuingTicketsCount: existingServiceType.queuingTickets.length,
        },
        { status: 409 }
      );
    }

    const deletedServiceType = await prisma.serviceType.delete({
      where: { id: id },
    });

    return NextResponse.json(deletedServiceType, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
