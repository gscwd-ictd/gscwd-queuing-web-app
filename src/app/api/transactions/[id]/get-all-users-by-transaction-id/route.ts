import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
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
        { error: "No transaction ID provided" },
        { status: 400 }
      );
    }

    const users = await prisma.user.findMany({
      where: {
        assignedTransactionId: id,
      },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        nameExtension: true,
        position: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
