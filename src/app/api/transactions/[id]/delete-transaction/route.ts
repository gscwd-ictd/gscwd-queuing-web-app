import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
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

    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: id },
      include: {
        serviceTypes: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            serviceTypes: true,
            counters: true,
            queuingTickets: true,
            users: true,
          },
        },
      },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    if (existingTransaction._count.serviceTypes > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete transaction with service types",
          details: `This transaction has ${existingTransaction._count.serviceTypes} service type(s) associated with it. Please remove all service types before deleting.`,
        },
        { status: 409 }
      );
    }

    if (existingTransaction._count.queuingTickets > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete transaction with queuing tickets",
          details: `This transaction has ${existingTransaction._count.queuingTickets} queuing ticket(s) associated with it. Please remove all queuing tickets before deleting.`,
        },
        { status: 409 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      if (existingTransaction.supervisorId) {
        await tx.transaction.update({
          where: { id: id },
          data: { supervisorId: null },
        });
      }

      await tx.transaction.update({
        where: { id: id },
        data: {
          users: {
            set: [],
          },
        },
      });

      const deletedTransaction = await tx.transaction.delete({
        where: { id: id },
      });

      return deletedTransaction;
    });

    return NextResponse.json(
      {
        message: "Transaction deleted successfully",
        deletedTransaction: result,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("foreign key constraint")) {
        return NextResponse.json(
          {
            error:
              "Cannot delete transaction due to existing references. Please remove all associated service types first.",
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
