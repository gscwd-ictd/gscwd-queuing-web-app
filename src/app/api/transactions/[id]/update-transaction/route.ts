import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

    if (!id) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, code } = body;

    if (!name || !code) {
      return NextResponse.json(
        { error: "Name and code are required" },
        { status: 400 }
      );
    }

    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: id },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    const existingCodeTransaction = await prisma.transaction.findFirst({
      where: {
        code: code,
        id: { not: id },
      },
    });

    if (existingCodeTransaction) {
      return NextResponse.json(
        { error: "Transaction code already exists" },
        { status: 409 }
      );
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: id },
      data: {
        name,
        code,
      },
    });

    return NextResponse.json(updatedTransaction, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
