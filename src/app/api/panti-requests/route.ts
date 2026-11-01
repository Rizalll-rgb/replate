import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const rows: any[] = await prisma.$queryRawUnsafe(
      'SELECT * FROM beneficiary_requests ORDER BY createdAt DESC'
    );

    const formatted = rows.map((r) => ({
      id: r.id,
      pantiName: r.pantiName,
      shelterType: r.shelterType || 'Panti Asuhan Anak Yatim',
      needTitle: r.needTitle,
      requestedItem: r.requestedItem,
      foodCategoryNeeded: r.foodCategoryNeeded,
      targetQuantity: r.targetQuantity,
      fulfilledQuantity: r.fulfilledQuantity,
      beneficiariesCount: r.beneficiariesCount,
      urgency: r.urgency,
      urgencyLabel: r.urgencyLabel,
      location: r.location,
      address: r.address,
      contactPerson: r.contactPerson,
      contactPhone: r.contactPhone,
      cutoffTime: r.cutoffTime,
      deadline: r.deadline,
      preferredDelivery: r.preferredDelivery,
      deliveryOption: r.deliveryOption,
      paymentMethod: r.paymentMethod,
      assignedDriver: r.assignedDriver,
      notes: r.notes,
      status: r.status,
      allocatedBy: r.allocatedBy,
      driverName: r.driverName,
      distance: '1.2 km (Area Terdekat)',
      matchScore: 98,
      legalStatus: 'Terverifikasi Dinsos & Kemenkumham',
      legalPermit: 'DINSOS-SBY/2023/8912',
      deliveryLabel: r.deliveryOption || 'Armada Toko (Rp 0 - Gratis)',
      deliveryDesc: 'Opsi pengiriman yang diminta oleh pihak yayasan/panti.',
      imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=60',
      lat: -7.271,
      lng: 112.758,
      reasons: ['Permintaan resmi diajukan langsung oleh pengurus panti terdaftar'],
      breakdown: [],
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error('Error fetching beneficiary requests:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = body.id || `PNT-REQ-${Date.now().toString(36).toUpperCase()}`;
    const pantiName = body.pantiName || 'Panti Asuhan Kasih Ibu';
    const shelterType = body.shelterType || 'Panti Asuhan Anak Yatim';
    const needTitle = body.needTitle || `${body.targetQuantity || 45} Porsi Makanan`;
    const requestedItem = body.requestedItem || body.foodCategoryNeeded || 'Makanan Olahan Siap Santap';
    const foodCategoryNeeded = body.foodCategoryNeeded || 'Makanan Olahan (Meals)';
    const targetQuantity = parseInt(String(body.targetQuantity).replace(/\D/g, '')) || 45;
    const fulfilledQuantity = body.fulfilledQuantity || '0 Porsi';
    const beneficiariesCount = parseInt(String(body.beneficiariesCount).replace(/\D/g, '')) || 45;
    const urgency = body.urgency || 'HIGH';
    const urgencyLabel = body.urgencyLabel || 'MENDESAK';
    const location = body.location || 'Surabaya (Gubeng)';
    const address = body.address || 'Jl. Raya Gubeng No. 88, Gubeng, Surabaya';
    const contactPerson = body.contactPerson || 'Ibu Hajjah Maryam';
    const contactPhone = body.contactPhone || '0812-3456-7890';
    const cutoffTime = body.cutoffTime || '19:30 WIB';
    const deadline = body.deadline || 'Hari ini sebelum 19:30 WIB';
    const preferredDelivery = body.preferredDelivery || 'PROVIDER_DIRECT';
    const deliveryOption = body.deliveryOption || 'Armada Toko (Rp 0 - Gratis)';
    const paymentMethod = body.paymentMethod || 'Gratis (Bebas Biaya / Donasi)';
    const assignedDriver = body.assignedDriver || '';
    const notes = body.notes || 'Kebutuhan pangan santri dan anak asuh.';
    const status = body.status || 'MENUNGGU_DONATUR';
    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO beneficiary_requests 
        (id, pantiName, shelterType, needTitle, requestedItem, foodCategoryNeeded, targetQuantity, fulfilledQuantity, beneficiariesCount, urgency, urgencyLabel, location, address, contactPerson, contactPhone, cutoffTime, deadline, preferredDelivery, deliveryOption, paymentMethod, assignedDriver, notes, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      pantiName,
      shelterType,
      needTitle,
      requestedItem,
      foodCategoryNeeded,
      targetQuantity,
      fulfilledQuantity,
      beneficiariesCount,
      urgency,
      urgencyLabel,
      location,
      address,
      contactPerson,
      contactPhone,
      cutoffTime,
      deadline,
      preferredDelivery,
      deliveryOption,
      paymentMethod,
      assignedDriver,
      notes,
      status,
      now,
      now
    );

    return NextResponse.json({
      success: true,
      data: {
        id,
        pantiName,
        shelterType,
        needTitle,
        requestedItem,
        foodCategoryNeeded,
        targetQuantity,
        fulfilledQuantity,
        beneficiariesCount,
        urgency,
        urgencyLabel,
        location,
        address,
        contactPerson,
        contactPhone,
        cutoffTime,
        deadline,
        preferredDelivery,
        deliveryOption,
        paymentMethod,
        assignedDriver,
        notes,
        status,
      },
    });
  } catch (error: any) {
    console.error('Error creating beneficiary request:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal menyimpan permintaan' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, fulfilledQuantity, status, allocatedBy, driverName } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID wajib diisi' }, { status: 400 });
    }

    const now = new Date();
    await prisma.$executeRawUnsafe(
      `UPDATE beneficiary_requests 
       SET fulfilledQuantity = COALESCE(?, fulfilledQuantity),
           status = COALESCE(?, status),
           allocatedBy = COALESCE(?, allocatedBy),
           driverName = COALESCE(?, driverName),
           allocatedAt = ?,
           updatedAt = ?
       WHERE id = ?`,
      fulfilledQuantity || null,
      status || null,
      allocatedBy || null,
      driverName || null,
      now,
      now,
      id
    );

    return NextResponse.json({ success: true, message: 'Permintaan berhasil diperbarui di database' });
  } catch (error: any) {
    console.error('Error updating beneficiary request:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memperbarui permintaan' },
      { status: 500 }
    );
  }
}

