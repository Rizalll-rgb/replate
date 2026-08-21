'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { QRGenerator } from '@/components/qr/QRGenerator';

export default function MyClaimsPage() {
  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h2 className="text-xl font-extrabold text-[#1B3A5C]">Klaim Aktif Saya</h2>
        <p className="text-xs text-[#6C757D]">Tunjukkan QR Code di bawah kepada Provider saat penjemputan.</p>
      </div>

      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-sm">Klaim #1: Bakso Sapi Komplit</CardTitle>
          <p className="text-xs text-[#6C757D]">Warung Bakso Pak Kumis — Genteng, Surabaya</p>
        </CardHeader>
        <CardBody>
          <QRGenerator
            value="FB-SBY-8821"
            codeTitle="QR Code Verifikasi Klaim"
            codeSubtitle="Scan oleh Provider untuk memverifikasi penjemputan"
          />
        </CardBody>
      </Card>
    </div>
  );
}
