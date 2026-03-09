import { getServerSession } from "next-auth/next"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  if (!session.user.departmentId) {
    return NextResponse.json(
      { message: "User is not assigned to a department" },
      { status: 403 },
    )
  }

  try {
    let whereClause: Prisma.TransactionWhereInput = {}

    if (session.user.role === "superuser") {
      if (!session.user.assignedTransactionId) {
        return NextResponse.json(
          { message: "User has no assigned transaction" },
          { status: 403 },
        )
      }

      whereClause = {
        id: session.user.assignedTransactionId,
      }
    } else if (session.user.role === "admin") {
      whereClause = {
        departmentId: session.user.departmentId,
      }
    } else {
      return NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 },
      )
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        department: true,
        supervisor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            nameExtension: true,
            email: true,
            position: true,
          },
        },
        serviceTypes: {
          select: {
            id: true,
            name: true,
          },
          orderBy: {
            name: "asc",
          },
        },
      },
      orderBy: {
        dateCreated: "desc",
      },
    })

    return NextResponse.json(transactions)
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 })
  }
}
