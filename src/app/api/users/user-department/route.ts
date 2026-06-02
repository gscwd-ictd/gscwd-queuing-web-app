// app/api/users/user-department/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        departmentId: true,
        assignedTransactionId: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      departmentId: user.departmentId,
      departmentName: user.department?.name || null,
      assignedTransactionId: user.assignedTransactionId,
      userId: user.id,
    });
  } catch (error) {
    console.error('Error fetching user department:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
