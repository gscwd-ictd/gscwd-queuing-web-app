import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "superadmin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const userSession = await prisma.userSession.findUnique({
      where: { id },
    })

    if (!userSession) {
      return NextResponse.json(
        { error: "User session not found" },
        { status: 404 },
      )
    }

    await prisma.userSession.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: "User session deleted successfully" },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json(
      { error: `Internal server error: ${error}` },
      { status: 500 },
    )
  }
}
