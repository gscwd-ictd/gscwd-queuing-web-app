import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const counters = await prisma.counter.findMany({
      where: {
        transaction: {
          supervisorId: session.user.id,
        },
      },
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: {
        dateCreated: "desc",
      },
    });

    return NextResponse.json(counters, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
