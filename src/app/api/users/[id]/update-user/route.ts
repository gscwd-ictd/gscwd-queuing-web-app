import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "superadmin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const userId = id;
    const body = await request.json();
    const {
      firstName,
      middleName,
      lastName,
      nameExtension,
      email,
      role,
      departmentId,
      position,
    } = body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !role ||
      !departmentId ||
      !position
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        middleName: middleName || null,
        lastName,
        nameExtension: nameExtension || null,
        email: email.toLowerCase(),
        role: role as Role,
        departmentId: departmentId || null,
        position,
      },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        nameExtension: true,
        email: true,
        role: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        position: true,
      },
    });

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
