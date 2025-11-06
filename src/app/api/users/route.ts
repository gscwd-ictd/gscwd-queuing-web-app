import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AccountStatus, Role } from "@prisma/client";
import bcrypt from "bcrypt";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "superadmin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      where: {
        role: {
          not: "superadmin",
        },
      },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        nameExtension: true,
        email: true,
        imageUrl: true,
        role: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        position: true,
        dateCreated: true,
        lastLogin: true,
        accountStatus: true,
        allowedRoutes: true,
      },
      orderBy: {
        dateCreated: "desc",
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      firstName,
      middleName,
      lastName,
      nameExtension,
      email,
      password,
      role,
      department,
      position,
    } = body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !role ||
      !department ||
      !position
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstName,
        middleName: middleName || null,
        lastName,
        nameExtension: nameExtension || null,
        email: email.toLowerCase(),
        password: hashedPassword,
        position: position,
        role: role as Role,
        departmentId: department,
        imageUrl: "",
        accountStatus: AccountStatus.active,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        nameExtension: true,
        email: true,
        role: true,
        department: true,
      },
    });

    return NextResponse.json(
      { message: "User created successfully", user },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
