import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const unassignedSupervisors = await prisma.user.findMany({
      where: {
        departmentId: session.user.departmentId,
        transactions: {
          is: null,
        },
      },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        nameExtension: true,
        email: true,
        position: true,
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });

    return NextResponse.json(unassignedSupervisors, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
