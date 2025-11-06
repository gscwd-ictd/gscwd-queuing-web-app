import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      select: {
        id: true,
        code: true,
        name: true,
      },
    });
    return NextResponse.json(transactions, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const departmentId = session?.user.departmentId;

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, code } = await request.json();

    if (!name || !code) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const existingTransaction = await prisma.transaction.findUnique({
      where: { name, code },
    });

    if (existingTransaction) {
      return NextResponse.json(
        { error: "Transaction already exists" },
        { status: 409 }
      );
    }

    if (!departmentId) {
      return NextResponse.json(
        { message: "User is not assigned to a department" },
        { status: 403 }
      );
    }

    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        name,
        code,
        departmentId,
      },
    });

    return NextResponse.json(transaction, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
