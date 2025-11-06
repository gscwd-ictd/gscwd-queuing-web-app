import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { newPassword } = await request.json();

    const hashedPassword = await hash(newPassword, 10);

    await prisma.user.update({
      where: { id: id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      message: "Password has been reset successfully",
    });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
