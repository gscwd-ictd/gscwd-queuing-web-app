// app/api/counters/availability/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const transactionId = searchParams.get('transactionId');

  if (!transactionId) {
    return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
  }

  try {
    // Get all counters for this transaction
    const counters = await prisma.counter.findMany({
      where: { transactionId },
      select: {
        id: true,
        name: true,
        code: true,
        userSession: {
          select: {
            userId: true,
            expiresAt: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    // Check availability for each counter
    const now = new Date();
    const availabilityMap: Record<string, { isAvailable: boolean; currentSession: any | null }> = {};

    for (const counter of counters) {
      const hasActiveSession =
        counter.userSession && counter.userSession.expiresAt && counter.userSession.expiresAt > now;

      availabilityMap[counter.id] = {
        isAvailable: !hasActiveSession,
        currentSession: hasActiveSession ? counter.userSession : null,
      };
    }

    return NextResponse.json(availabilityMap);
  } catch (error) {
    console.error('Error fetching counter availability:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
