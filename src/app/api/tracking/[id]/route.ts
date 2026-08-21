import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID wajib diisi' }, { status: 400 });
    }

    const trackingLogs = await prisma.foodTracking.findMany({
      where: {
        OR: [
          { referenceId: id },
          { claim: { claimCode: id } },
          { rescue: { rescueCode: id } },
        ],
      },
      include: {
        updatedBy: { select: { name: true, role: true } },
        claim: { include: { food: true } },
        rescue: { include: { food: true } },
      },
      orderBy: { timestamp: 'asc' },
    });

    if (trackingLogs.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          referenceId: id,
          foodName: 'Food Rescue Item',
          steps: [],
        },
      });
    }

    const firstLog = trackingLogs[0];
    const foodName = firstLog.claim?.food?.foodName || firstLog.rescue?.food?.foodName || 'Makanan Surplus';

    const steps = trackingLogs.map((log: any, idx: number) => ({
      status: log.status,
      title: `${idx + 1}. Status: ${log.status}`,
      description: log.description,
      timestamp: log.timestamp.toISOString(),
      actor: log.updatedBy?.name || 'Sistem FoodBridge',
      completed: true,
      current: idx === trackingLogs.length - 1,
    }));

    return NextResponse.json({
      success: true,
      data: {
        referenceId: id,
        foodName,
        steps,
      },
    });
  } catch (error) {
    console.error('Tracking endpoint error:', error);
    return NextResponse.json({ success: false, error: 'Gagal memuat tracking data' }, { status: 500 });
  }
}
