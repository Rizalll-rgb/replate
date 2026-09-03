import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { registerSchema } from '@/lib/validators';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate input
        const validation = registerSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const { name, email, password, role, phone, address, city, organizationType, organizationName } = validation.data;

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { success: false, error: 'Email sudah terdaftar' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Auto-approve consumers, pending for others
        const status = role === 'CONSUMER' ? 'APPROVED' : 'PENDING';

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role as 'PROVIDER' | 'CONSUMER' | 'RESCUE_PARTNER',
                status,
                phone,
                address,
                city,
                organizationType,
                organizationName,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
            },
        });

        // Notify admins for approval if not consumer
        if (status === 'PENDING') {
            const admins = await prisma.user.findMany({
                where: { role: 'ADMIN' },
                select: { id: true },
            });

            if (admins.length > 0) {
                await prisma.notification.createMany({
                    data: admins.map((admin: { id: string }) => ({
                        userId: admin.id,
                        title: 'Pendaftaran Baru Menunggu Persetujuan',
                        message: `${name} mendaftar sebagai ${role === 'PROVIDER' ? 'Food Provider' : 'Rescue Partner'} dan membutuhkan persetujuan.`,
                        type: 'APPROVAL' as const,
                        actionUrl: '/dashboard/admin/approvals',
                    })),
                });
            }
        }

        // Welcome notification for the user
        await prisma.notification.create({
            data: {
                userId: user.id,
                title: 'Selamat Datang di Replate! ',
                message: status === 'APPROVED'
                    ? 'Akun Anda sudah aktif. Mulai jelajahi makanan yang tersedia!'
                    : 'Akun Anda sedang menunggu persetujuan admin. Kami akan mengirim notifikasi setelah disetujui.',
                type: 'SYSTEM',
                actionUrl: '/dashboard',
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: user,
                message: status === 'APPROVED'
                    ? 'Pendaftaran berhasil! Silakan login.'
                    : 'Pendaftaran berhasil! Akun Anda menunggu persetujuan admin.',
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { success: false, error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
