import { NextResponse, NextRequest } from "next/server";
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

    const counter = await prisma.counter.findUnique({
      where: { id: id },
      select: {
        name: true,
        code: true,
      },
    });

    if (!counter) {
      return NextResponse.json({ error: "Counter not found" }, { status: 404 });
    }

    return NextResponse.json(counter);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
