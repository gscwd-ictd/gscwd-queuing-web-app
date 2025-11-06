import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const departmentId = session.user.departmentId;

    if (!departmentId) {
      return NextResponse.json(
        {
          error: "Department ID not found",
        },
        { status: 400 }
      );
    }

    const counter = await prisma.counter.findUnique({
      select: {
        id: true,
        code: true,
        name: true,
        departmentId: true,
      },
      where: { id: id },
    });

    if (!counter) {
      return NextResponse.json({ error: "Counter not found" }, { status: 404 });
    }

    if (departmentId !== counter.departmentId) {
      return NextResponse.json(
        { error: "You can only delete counters in your own department" },
        { status: 403 }
      );
    }

    const queuingTicketsCount = await prisma.queuingTicket.count({
      where: { id },
    });

    if (queuingTicketsCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete counter with associated queuing tickets" },
        { status: 400 }
      );
    }

    await prisma.counter.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Counter deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: `Internal server error: ${error}` },
      { status: 500 }
    );
  }
}
