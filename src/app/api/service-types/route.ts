import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { departmentId, assignedTransactionId } = session.user;

    if (!departmentId || !assignedTransactionId) {
      return NextResponse.json(
        { error: "User department or transaction not assigned" },
        { status: 400 }
      );
    }

    const serviceTypes = await prisma.serviceType.findMany({
      where: {
        departmentId,
        transactionId: assignedTransactionId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(serviceTypes, { status: 200 });
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

    const { name, transactionId } = await request.json();

    if (!name || !transactionId) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const existingServiceType = await prisma.serviceType.findFirst({
      where: { name, transactionId },
    });

    if (existingServiceType) {
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

    const serviceType = await prisma.serviceType.create({
      data: {
        name,
        transactionId,
        departmentId,
      },
    });

    return NextResponse.json(serviceType);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
