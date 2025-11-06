import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Supervisor ID is required" },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: id },
      include: {
        department: true,
        supervisor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            nameExtension: true,
            position: true,
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    if (transaction.supervisor?.id) {
      return NextResponse.json(
        { error: "Transaction already has a supervisor assigned" },
        { status: 400 }
      );
    }

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    const supervisor = await prisma.user.findUnique({
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        nameExtension: true,
        email: true,
        position: true,
      },
      where: {
        id: userId,
        role: Role.superuser,
        departmentId: session.user.departmentId,
      },
    });

    if (!supervisor) {
      return NextResponse.json(
        { error: "Supervisor not found or invalid" },
        { status: 404 }
      );
    }

    const existingAssignment = await prisma.transaction.findFirst({
      where: {
        supervisorId: userId,
        id: { not: id },
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: "Supervisor is already assigned to another transaction" },
        { status: 400 }
      );
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: id },
      data: { supervisorId: userId },
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
