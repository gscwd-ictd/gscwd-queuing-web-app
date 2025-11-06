import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id, userId } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: id },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.id !== userId) {
      return NextResponse.json(
        { error: "Supervisor is not assigned to this transaction" },
        { status: 400 }
      );
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: id, supervisorId: userId },
      data: { supervisorId: null },
      include: {
        supervisor: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            nameExtension: true,
            email: true,
            position: true,
          },
        },
      },
    });

    return NextResponse.json(updatedTransaction, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
