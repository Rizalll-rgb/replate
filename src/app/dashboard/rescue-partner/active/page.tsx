'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { QRScanner } from '@/components/qr/QRScanner';
import { Badge } from '@/components/ui/Badge';

export default function PartnerActivePickupsPage() {
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [safetyChecklist, setSafetyChecklist] = useState({
    packagingIntact: true,
    storageTempProper: true,
    noVisualSpoilage: true,
    quantityMatches: true,
    freshnessValid: true,
  });
  const [notes, setNotes] = useState('');

  const handleVerifySOP = async () => {
    try {
      const res = await fetch('/api/qr/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrData: 'FR-SBY-DEMO-RESCUE',
          safetyChecklist,
          notes,
        }),
      });
      const result = await res.json();
      if (result.success) {
        alert(`✅ ${result.message}`);
        setShowVerificationForm(false);
      } else {
        alert(`❌ ${result.error}`);
      }
    } catch {
      alert('Terjadi kesalahan koneksi.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-[#1B3A5C]">Penjemputan Aktif & Verifikasi SOP</h2>
        <p className="text-xs text-[#6C757D]">Lakukan inspeksi keamanan pangan di lokasi provider sebelum distribusi.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <Badge variant="gold">IN PROGRESS</Badge>
            <CardTitle className="text-base font-bold text-[#1B3A5C] mt-2">
              Nasi Goreng Buffet + Ayam Bakar (30 Porsi)
            </CardTitle>
            <p className="text-xs text-[#6C757D]">Hotel Majapahit Surabaya — Jl. Tunjungan No. 65</p>
          </div>
          <Button variant="gold" size="sm" onClick={() => setShowVerificationForm(!showVerificationForm)}>
            📷 Scan QR & SOP Verification
          </Button>
        </CardHeader>

        {showVerificationForm && (
          <CardBody className="border-t pt-4 space-y-4">
            <h4 className="text-sm font-bold text-[#1B3A5C]">📋 Rescue Partner Food Safety Verification Form (SOP)</h4>

            <div className="space-y-2 text-xs bg-[#F8F9FA] p-4 rounded-xl border">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={safetyChecklist.packagingIntact}
                  onChange={(e) => setSafetyChecklist({ ...safetyChecklist, packagingIntact: e.target.checked })}
                />
                <span>Kemasan masih utuh & bersih tanpa kebocoran?</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={safetyChecklist.storageTempProper}
                  onChange={(e) => setSafetyChecklist({ ...safetyChecklist, storageTempProper: e.target.checked })}
                />
                <span>Suhu penyimpanan sesuai kriteria (dingin/beku/ruangan)?</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={safetyChecklist.noVisualSpoilage}
                  onChange={(e) => setSafetyChecklist({ ...safetyChecklist, noVisualSpoilage: e.target.checked })}
                />
                <span>Bebas dari bau aneh, perubahan warna, atau jamur?</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={safetyChecklist.quantityMatches}
                  onChange={(e) => setSafetyChecklist({ ...safetyChecklist, quantityMatches: e.target.checked })}
                />
                <span>Jumlah fisik makanan sesuai dengan data aplikasi?</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={safetyChecklist.freshnessValid}
                  onChange={(e) => setSafetyChecklist({ ...safetyChecklist, freshnessValid: e.target.checked })}
                />
                <span>Masih dalam masa layak konsumsi secara fisik & organoleptik?</span>
              </label>
            </div>

            <textarea
              rows={2}
              className="w-full text-xs p-3 border rounded-lg focus:outline-none"
              placeholder="Catatan inspeksi fisik saat penjemputan..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <Button variant="gold" size="md" onClick={handleVerifySOP}>
                ✔️ Verifikasi Lulus & Selesaikan Pickup
              </Button>
            </div>
          </CardBody>
        )}
      </Card>
    </div>
  );
}
