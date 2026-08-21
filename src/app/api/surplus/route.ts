import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { surplusFormSchema } from '@/lib/validators';
import { findConsumerMatches, findPartnerMatches, saveMatchResults } from '@/lib/matching';
import { generateClaimCode } from '@/lib/utils';

// GET - List surplus foods (with filters)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '12');
        const category = searchParams.get('category');
        const status = searchParams.get('status') || 'AVAILABLE';
        const distributionType = searchParams.get('distributionType');
        const providerId = searchParams.get('providerId');
        const lat = searchParams.get('lat');
        const lng = searchParams.get('lng');
        const maxDistance = parseFloat(searchParams.get('maxDistance') || '15');
        const sortBy = searchParams.get('sortBy') || 'createdAt';

        // Build where clause
        const where: Record<string, unknown> = {};

        if (status) where.status = status;
        if (category) where.foodCategory = category;
        if (distributionType) where.distributionType = distributionType;
        if (providerId) where.providerId = providerId;

        // Only show non-expired
        where.pickupDeadline = { gte: new Date() };

        const [items, total] = await Promise.all([
            prisma.surplusFood.findMany({
                where: where as any,
                include: {
                    provider: {
                        select: {
                            id: true,
                            name: true,
                            organizationName: true,
                            profileImage: true,
                            city: true,
                        },
                    },
                    _count: {
                        select: {
                            foodClaims: { where: { status: { in: ['PENDING', 'CONFIRMED'] } } },
                        },
                    },
                },
                orderBy: sortBy === 'deadline'
                    ? { pickupDeadline: 'asc' }
                    : sortBy === 'price'
                        ? { price: 'asc' }
                        : { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.surplusFood.count({ where: where as any }),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                items,
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            },
        });
    } catch (error) {
        console.error('Get surplus error:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal memuat data makanan' },
            { status: 500 }
        );
    }
}

// POST - Create new surplus food
export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (session.user.role !== 'PROVIDER') {
            return NextResponse.json(
                { success: false, error: 'Hanya Food Provider yang dapat menambah surplus' },
                { status: 403 }
            );
        }

        if (session.user.status !== 'APPROVED') {
            return NextResponse.json(
                { success: false, error: 'Akun Anda belum disetujui oleh admin' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validation = surplusFormSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const data = validation.data;

        // Create the surplus food entry
        const surplus = await prisma.surplusFood.create({
            data: {
                providerId: session.user.id,
                foodName: data.foodName,
                description: data.description,
                foodCategory: data.foodCategory,
                quantity: data.quantity,
                quantityUnit: data.quantityUnit,
                productionDate: data.productionDate ? new Date(data.productionDate) : null,
                expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
                pickupDeadline: new Date(data.pickupDeadline),
                storageCondition: data.storageCondition,
                packagingType: data.packagingType,
                photos: body.photos || [],
                latitude: data.latitude,
                longitude: data.longitude,
                address: data.address,
                distributionType: data.distributionType,
                price: data.price || 0,
                remainingQuantity: data.quantity,
                weightPerUnitKg: data.weightPerUnitKg,
                notes: data.notes,
                rescueReadiness: body.rescueReadiness || null,
            },
            include: {
                provider: {
                    select: { id: true, name: true, organizationName: true },
                },
            },
        });

        // Run smart matching in background
        try {
            const [consumerMatches, partnerMatches] = await Promise.all([
                findConsumerMatches(surplus),
                findPartnerMatches(surplus),
            ]);

            const allMatches = [...consumerMatches, ...partnerMatches];
            if (allMatches.length > 0) {
                await saveMatchResults(surplus.id, allMatches);
            }

            // Notify top rescue partners for Food Rescue path
            for (const match of partnerMatches.slice(0, 3)) {
                await prisma.notification.create({
                    data: {
                        userId: match.user.id,
                        title: 'Makanan Baru Cocok untuk Rescue!',
                        message: `${surplus.foodName} (${surplus.quantity} ${surplus.quantityUnit}) dari ${surplus.provider.organizationName || surplus.provider.name}. Skor kecocokan: ${(match.score * 100).toFixed(0)}%`,
                        type: 'MATCH',
                        actionUrl: '/dashboard/rescue-partner/requests',
                    },
                });
            }
        } catch (matchError) {
            // Don't fail the request if matching fails
            console.error('Matching error:', matchError);
        }

        // Create initial tracking entry
        await prisma.foodTracking.create({
            data: {
                referenceId: surplus.id,
                referenceType: 'CLAIM',
                status: 'LISTED',
                description: `${surplus.foodName} ditambahkan oleh ${surplus.provider.organizationName || surplus.provider.name}`,
                updatedById: session.user.id,
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: surplus,
                message: 'Surplus makanan berhasil ditambahkan!',
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create surplus error:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal menambahkan surplus makanan' },
            { status: 500 }
        );
    }
}

// PATCH - Update surplus food status or details
export async function PATCH(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, status, remainingQuantity, foodName, pickupDeadline } = body;

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID Surplus wajib diisi' }, { status: 400 });
        }

        const existing = await prisma.surplusFood.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ success: false, error: 'Data surplus tidak ditemukan' }, { status: 404 });
        }

        // Only provider owner or admin can update
        if (existing.providerId !== session.user.id && session.user.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Akses ditolak' }, { status: 403 });
        }

        const updateData: Record<string, unknown> = {};
        if (status) updateData.status = status;
        if (typeof remainingQuantity === 'number') updateData.remainingQuantity = remainingQuantity;
        if (foodName) updateData.foodName = foodName;
        if (pickupDeadline) updateData.pickupDeadline = new Date(pickupDeadline);

        const updated = await prisma.surplusFood.update({
            where: { id },
            data: updateData as any,
        });

        return NextResponse.json({
            success: true,
            data: updated,
            message: 'Surplus makanan berhasil diperbarui!',
        });
    } catch (error) {
        console.error('Update surplus error:', error);
        return NextResponse.json({ success: false, error: 'Gagal memperbarui surplus makanan' }, { status: 500 });
    }
}

// DELETE - Delete or cancel surplus food entry
export async function DELETE(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID Surplus wajib diisi' }, { status: 400 });
        }

        const existing = await prisma.surplusFood.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ success: false, error: 'Data surplus tidak ditemukan' }, { status: 404 });
        }

        if (existing.providerId !== session.user.id && session.user.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Akses ditolak' }, { status: 403 });
        }

        await prisma.surplusFood.delete({ where: { id } });

        return NextResponse.json({
            success: true,
            message: 'Surplus makanan berhasil dihapus!',
        });
    } catch (error) {
        console.error('Delete surplus error:', error);
        return NextResponse.json({ success: false, error: 'Gagal menghapus surplus makanan' }, { status: 500 });
    }
}
