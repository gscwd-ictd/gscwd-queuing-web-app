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

    const departmentId = session.user.departmentId;

    const users = await prisma.user.findMany({
      where: {
        departmentId: departmentId,
      },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
        position: true,
      },
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
