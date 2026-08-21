import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - List rescue requests for partner or provider
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role;
    const where: Record<string, unknown> = {};

    if (role === 'RESCUE_PARTNER') {
      where.partnerId = session.user.id;
    } else if (role === 'PROVIDER') {
      where.food = { providerId: session.user.id };
    }

    const items = await prisma.rescueRequest.findMany({
      where: where as any,
      include: {
        food: {
          include: {
            provider: {
              select: { id: true, name: true, organizationName: true, address: true, phone: true },
            },
          },
        },
        partner: {
          select: { id: true, name: true, organizationName: true, phone: true },
        },
        qrCode: true,
      },
      orderBy: { requestedAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('Get rescue error:', error);
    return NextResponse.json({ success: false, error: 'Gagal memuat permintaan rescue' }, { status: 500 });
  }
}

// POST - Partner accepts or creates a rescue request
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'RESCUE_PARTNER') {
      return NextResponse.json({ success: false, error: 'Hanya Rescue Partner yang dapat menerima tugas ini' }, { status: 403 });
    }

    const body = await request.json();
    const { foodId, quantity = 5, action = 'ACCEPT' } = body;

    if (!foodId) {
      return NextResponse.json({ success: false, error: 'foodId wajib diisi' }, { status: 400 });
    }

    const food = await prisma.surplusFood.findUnique({ where: { id: foodId } });
    if (!food) {
      return NextResponse.json({ success: false, error: 'Makanan tidak ditemukan' }, { status: 404 });
    }

    const rescueCode = `FR-SBY-${Date.now().toString(36).toUpperCase()}`;
    const qrData = JSON.stringify({
      type: 'RESCUE',
      rescueCode,
      foodId,
      partnerId: session.user.id,
      timestamp: Date.now(),
    });

    const rescue = await prisma.$transaction(async (tx: any) => {
      const req = await tx.rescueRequest.create({
        data: {
          rescueCode,
          foodId,
          partnerId: session.user.id,
          quantity: quantity || food.remainingQuantity,
          status: 'ACCEPTED',
          qrCodeData: qrData,
        },
      });

      await tx.qRCode.create({
        data: {
          data: qrData,
          type: 'RESCUE',
          rescueId: req.id,
          expiresAt: food.pickupDeadline,
        },
      });

      await tx.foodTracking.create({
        data: {
          referenceId: rescueCode,
          referenceType: 'RESCUE',
          status: 'CLAIMED',
          description: `Tugas rescue diterima oleh partner. Kode: ${rescueCode}`,
          updatedById: session.user.id,
          rescueId: req.id,
        },
      });

      return req;
    });

    return NextResponse.json({
      success: true,
      data: rescue,
      message: 'Tugas rescue berhasil diterima!',
    });
  } catch (error) {
    console.error('Create rescue error:', error);
    return NextResponse.json({ success: false, error: 'Gagal membuat tugas rescue' }, { status: 500 });
  }
}
