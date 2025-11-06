import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      select: {
        id: true,
        name: true,
        counters: {
          select: {
            id: true,
            name: true,
          },
          where: {
            OR: [
              { userSession: { is: null } },
              { userSession: { expiresAt: { lt: new Date() } } },
            ],
          },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const departmentId = session.user.departmentId;
    const transactionId = session.user.assignedTransactionId;

    if (!departmentId || !transactionId) {
      return NextResponse.json(
        {
          error: "User missing required department or transaction ID",
        },
        { status: 400 }
      );
    }

    const { name, code } = await request.json();

    if (!name?.trim() || !code?.trim()) {
      return NextResponse.json(
        { error: "Name and code are required" },
        { status: 400 }
      );
    }

    const existingCounter = await prisma.counter.findUnique({
      where: { code: code.trim() },
    });

    if (existingCounter) {
      return NextResponse.json(
        { error: "Counter with code already exists" },
        { status: 409 }
      );
    }

    const counter = await prisma.counter.create({
      data: {
        name: name.trim(),
        code: code.trim(),
        departmentId,
        transactionId,
      },
    });

    return NextResponse.json(counter, { status: 201 });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2002":
          return NextResponse.json(
            { error: "Counter code already exists in this department" },
            { status: 409 }
          );
        case "P2003":
          return NextResponse.json(
            { error: "Invalid department or transaction ID" },
            { status: 400 }
          );
      }
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
