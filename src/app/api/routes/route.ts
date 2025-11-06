import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const routes = await prisma.route.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(routes, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
