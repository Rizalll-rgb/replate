import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { claimSchema } from '@/lib/validators';
import { generateClaimCode, calculateCO2Saved } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

// GET - List claims
export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const role = session.user.role;
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '10');

        const where: Record<string, unknown> = {};

        if (role === 'CONSUMER') {
            where.consumerId = session.user.id;
        } else if (role === 'PROVIDER') {
            where.food = { providerId: session.user.id };
        }

        if (status) where.status = status;

        const [items, total] = await Promise.all([
            prisma.foodClaim.findMany({
                where: where as any,
                include: {
                    food: {
                        include: {
                            provider: {
                                select: { id: true, name: true, organizationName: true, address: true, phone: true },
                            },
                        },
                    },
                    consumer: {
                        select: { id: true, name: true, phone: true, email: true },
                    },
                    qrCode: true,
                },
                orderBy: { claimedAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.foodClaim.count({ where: where as any }),
        ]);

        return NextResponse.json({
            success: true,
            data: { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
        });
    } catch (error) {
        console.error('Get claims error:', error);
        return NextResponse.json({ success: false, error: 'Gagal memuat data klaim' }, { status: 500 });
    }
}

// POST - Create a new claim (Consumer claims a Rescue Meal)
export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        if (session.user.role !== 'CONSUMER') {
            return NextResponse.json({ success: false, error: 'Hanya konsumen yang dapat mengklaim' }, { status: 403 });
        }

        const body = await request.json();
        const validation = claimSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ success: false, error: validation.error.issues[0].message }, { status: 400 });
        }

        const { foodId, quantity, notes } = validation.data;

        // Check food availability
        const food = await prisma.surplusFood.findUnique({ where: { id: foodId } });
        if (!food) {
            return NextResponse.json({ success: false, error: 'Makanan tidak ditemukan' }, { status: 404 });
        }

        if (food.status === 'FULLY_CLAIMED' || food.status === 'EXPIRED') {
            return NextResponse.json({ success: false, error: 'Makanan sudah tidak tersedia' }, { status: 400 });
        }

        if (quantity > food.remainingQuantity) {
            return NextResponse.json({
                success: false,
                error: `Sisa tersedia hanya ${food.remainingQuantity} ${food.quantityUnit}`,
            }, { status: 400 });
        }

        // Check pickup deadline
        if (new Date(food.pickupDeadline) < new Date()) {
            return NextResponse.json({ success: false, error: 'Batas waktu pickup sudah lewat' }, { status: 400 });
        }

        // Generate claim code and QR data
        const claimCode = generateClaimCode();
        const qrData = JSON.stringify({
            type: 'CLAIM',
            claimCode,
            foodId,
            consumerId: session.user.id,
            quantity,
            timestamp: Date.now(),
        });

        // Determine payment status
        const paymentStatus = food.distributionType === 'FREE' || (food.price || 0) === 0
            ? 'NOT_REQUIRED'
            : 'PENDING';

        // Create claim + QR code + update remaining in a transaction
        const claim = await prisma.$transaction(async (tx: any) => {
            const newClaim = await tx.foodClaim.create({
                data: {
                    claimCode,
                    foodId,
                    consumerId: session.user.id,
                    quantity,
                    status: 'CONFIRMED',
                    paymentStatus: paymentStatus as any,
                    qrCodeData: qrData,
                    notes,
                },
                include: {
                    food: {
                        include: {
                            provider: { select: { id: true, name: true, organizationName: true, address: true } },
                        },
                    },
                },
            });

            // Create QR code record
            await tx.qRCode.create({
                data: {
                    data: qrData,
                    type: 'CLAIM',
                    claimId: newClaim.id,
                    expiresAt: food.pickupDeadline,
                },
            });

            // Update remaining quantity
            const newRemaining = food.remainingQuantity - quantity;
            await tx.surplusFood.update({
                where: { id: foodId },
                data: {
                    remainingQuantity: newRemaining,
                    status: newRemaining <= 0 ? 'FULLY_CLAIMED' : 'PARTIALLY_CLAIMED',
                },
            });

            // Create tracking entry
            await tx.foodTracking.create({
                data: {
                    referenceId: newClaim.claimCode,
                    referenceType: 'CLAIM',
                    status: 'CLAIMED',
                    description: `Diklaim oleh konsumen. Kode klaim: ${claimCode}`,
                    updatedById: session.user.id,
                    claimId: newClaim.id,
                },
            });

            return newClaim;
        });

        // Notify provider
        await prisma.notification.create({
            data: {
                userId: food.providerId,
                title: 'Makanan Diklaim! 🎉',
                message: `${food.foodName} telah diklaim (${quantity} ${food.quantityUnit}). Kode klaim: ${claimCode}`,
                type: 'CLAIM',
                actionUrl: '/dashboard/provider/claims',
            },
        });

        return NextResponse.json({
            success: true,
            data: claim,
            message: `Berhasil mengklaim ${quantity} ${food.quantityUnit} ${food.foodName}!`,
        }, { status: 201 });
    } catch (error) {
        console.error('Create claim error:', error);
        return NextResponse.json({ success: false, error: 'Gagal membuat klaim' }, { status: 500 });
    }
}
