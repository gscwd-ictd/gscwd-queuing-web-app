import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "superadmin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const userSession = await prisma.userSession.findMany({
      orderBy: { expiresAt: "asc" },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        counter: {
          select: {
            code: true,
            name: true,
          },
        },
      },
    })
    return NextResponse.json(userSession, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 })
  }
}
