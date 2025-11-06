import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(departments, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
