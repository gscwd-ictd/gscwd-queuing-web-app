// app/api/transactions/by-department/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const departmentId = searchParams.get('departmentId');

  if (!departmentId) {
    return NextResponse.json({ error: 'Department ID is required' }, { status: 400 });
  }

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        departmentId: departmentId,
      },
      select: {
        id: true,
        name: true,
        code: true,
        counters: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions by department:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
