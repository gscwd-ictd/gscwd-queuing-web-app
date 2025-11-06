import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json(
        { error: "No service type ID found" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const existingServiceType = await prisma.serviceType.findUnique({
      where: { id: id },
      select: {
        name: true,
      },
    });

    if (!existingServiceType) {
      return NextResponse.json(
        { error: "Service type not found" },
        { status: 404 }
      );
    }

    const duplicateServiceType = await prisma.serviceType.findFirst({
      where: {
        name: name,
        id: { not: id },
        NOT: [{ name: "Others" }],
      },
    });

    if (duplicateServiceType) {
      return NextResponse.json(
        { error: "Service type name must be unique" },
        { status: 409 }
      );
    }

    const updatedServiceType = await prisma.serviceType.update({
      where: { id: id },
      data: {
        name,
      },
    });

    return NextResponse.json(updatedServiceType, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
