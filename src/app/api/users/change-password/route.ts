import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hash, compare } from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { oldPassword, newPassword } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const valid = await compare(oldPassword, user.password);

    if (!valid)
      return NextResponse.json({ error: "Invalid password" }, { status: 400 });

    const hashedPassword = await hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: "Password changed successfully" });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
