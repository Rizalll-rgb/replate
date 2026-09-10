import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ success: false, message: 'Query is required' }, { status: 400 });
    }

    const cleanQuery = query.trim();

    // Query User model by email, phone, or id
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: cleanQuery } },
          { phone: { equals: cleanQuery } },
          { id: { equals: cleanQuery } },
        ],
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        address: true,
        organizationName: true,
        organizationType: true,
        createdAt: true,
      }
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Tracker API Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
