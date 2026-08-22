'use client';

import React, { useState } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { useSession } from 'next-auth/react';

export default function DonationsPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role || 'PROVIDER';

  const [requests, setRequests] = useState([
    {
      id: 'REQ-DON-001',
      shelterName: 'Panti Asuhan Kasih Ibu',
      shelterType: 'Panti Asuhan Anak',
      beneficiariesCount: 45,
      foodCategoryNeeded: 'Makanan Olahan (Meals)',
      urgency: 'HIGH',
      deadline: 'Hari ini 19:00 WIB',
      location: 'Surabaya Timur',
      notes: 'Membutuhkan 40-50 porsi nasi lauk pauk bergizi untuk makan malam anak-anak panti.',
      status: 'OPEN',
      contactPhone: '081298765432',
    },
    {
      id: 'REQ-DON-002',
      shelterName: 'Panti Werdha Lansia Sejahtera',
      shelterType: 'Panti Werdha (Lansia)',
      beneficiariesCount: 30,
      foodCategoryNeeded: 'Roti, Buah & Susu (Bakery & Dairy)',
      urgency: 'MEDIUM',
      deadline: 'Besok Pagi 08:00 WIB',
      location: 'Surabaya Selatan',
      notes: 'Membutuhkan roti tekstur lembut, buah potong segar, atau susu UHT untuk lansia.',
      status: 'OPEN',
      contactPhone: '081345678901',
    },
    {
      id: 'REQ-DON-003',
      shelterName: 'Rumah Singgah Anak Jalanan',
      shelterType: 'Yayasan Sosmas',
      beneficiariesCount: 25,
      foodCategoryNeeded: 'Makanan Olahan & Camilan',
      urgency: 'HIGH',
      deadline: 'Hari ini 20:30 WIB',
      location: 'Surabaya Pusat',
      notes: 'Membutuhkan porsi makanan surplus siap santap untuk pembagian malam relawan.',
      status: 'OPEN',
      contactPhone: '081567890123',
    },
  ]);

  // Add Request Modal State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [newShelterName, setNewShelterName] = useState('');
  const [newCount, setNewCount] = useState<number>(30);
  const [newCategory, setNewCategory] = useState('Makanan Olahan (Meals)');
  const [newNotes, setNewNotes] = useState('');
  const [newLocation, setNewLocation] = useState('Surabaya Pusat');

  // Interactive Fulfill Donation Modal State (Alur Pemenuhan Realistis)
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [selectedFoodItem, setSelectedFoodItem] = useState('Nasi Ayam Bakar Pak Kumis (Stok: 50 Porsi)');
  const [portionedQuantity, setPortionedQuantity] = useState<number>(45);
  const [deliveryMethod, setDeliveryMethod] = useState('RESCUE_COURIER');
  const [readyTime, setReadyTime] = useState('18:30 WIB');
  const [hygieneChecked, setHygieneChecked] = useState(true);

  // Success QR Ticket Receipt State
  const [completedTicket, setCompletedTicket] = useState<any | null>(null);

  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  const handleOpenFulfillModal = (req: any) => {
    setSelectedRequest(req);
    setPortionedQuantity(req.beneficiariesCount || 30);
  };

  const handleConfirmFulfillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    if (!hygieneChecked) {
      alert('Anda wajib menyetujui verifikasi SOP Higienitas Pangan BPOM!');
      return;
    }

    const ticketCode = `QR-DON-${Math.floor(100000 + Math.random() * 900000)}`;

    // Update Request status in list to MATCHED
    setRequests((prev) =>
      prev.map((item) =>
        item.id === selectedRequest.id
          ? { ...item, status: 'MATCHED & PROCESSED' }
          : item
      )
    );

    setCompletedTicket({
      ticketCode,
      shelterName: selectedRequest.shelterName,
      foodName: selectedFoodItem,
      quantity: portionedQuantity,
      deliveryMethod,
      readyTime,
      contactPhone: selectedRequest.contactPhone,
    });

    setSelectedRequest(null);

    setToastState({
      isOpen: true,
      message: `Berhasil! Alokasi ${portionedQuantity} porsi donasi untuk ${selectedRequest.shelterName} telah berhasil diproses!`,
      type: 'success',
    });
  };

  const handleAddRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShelterName || !newNotes) {
      alert('Mohon isi nama yayasan/panti dan deskripsi kebutuhan donasi!');
      return;
    }

    const newReq = {
      id: `REQ-DON-${Date.now()}`,
      shelterName: newShelterName,
      shelterType: 'Yayasan Terverifikasi',
      beneficiariesCount: newCount,
      foodCategoryNeeded: newCategory,
      urgency: 'HIGH',
      deadline: 'Hari ini 20:00 WIB',
      location: newLocation,
      notes: newNotes,
      status: 'OPEN',
      contactPhone: '081234567890',
    };

    setRequests([newReq, ...requests]);
    setIsRequestModalOpen(false);
    setToastState({
      isOpen: true,
      message: 'Permintaan bantuan donasi baru berhasil dipublikasikan!',
      type: 'success',
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-[#1B3A5C] rounded-2xl p-6 text-white shadow-lg border border-[#2C5A8F] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#D4A843] text-slate-900 text-[10px] font-black uppercase tracking-wider rounded-md shadow-xs">
              Modul Pemenuhan Donasi Realistis
            </span>
            <span className="text-xs text-slate-200 font-semibold">Proaktif Tanpa Antrean</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Hub Donasi & Kebutuhan Shelter Panti</h1>
          <p className="text-xs text-slate-100 leading-relaxed font-medium">
            Panti Asuhan & Shelter mengajukan kebutuhan pangan. Provider restoran dapat mengalokasikan porsi surplus, menentukan jam pickup, dan menerbitkan Kode QR Serah Terima resmi.
          </p>
        </div>

        <Button
          variant="gold"
          size="md"
          className="font-extrabold shrink-0 flex items-center gap-2 shadow-md"
          onClick={() => setIsRequestModalOpen(true)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Ajukan Permintaan Donasi Panti</span>
        </Button>
      </div>

      {/* Grid List Permintaan Donasi Shelter */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-[#1B3A5C] flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h6m-6 0V10m0 0h6m-6 0H7" />
            </svg>
            <span>Daftar Permintaan Donasi Aktif ({requests.length} Shelter)</span>
          </h3>
          <span className="text-xs text-slate-500 font-semibold">Wilayah Kota Surabaya</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {requests.map((req) => (
            <Card key={req.id} className="border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <CardBody className="p-5 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={req.status === 'MATCHED & PROCESSED' ? 'success' : req.urgency === 'HIGH' ? 'danger' : 'warning'} size="sm">
                      {req.status === 'MATCHED & PROCESSED' ? '✓ MATCHED & PROCESSED' : req.urgency === 'HIGH' ? 'URGENT (SEGERA)' : 'MEMBUTUHKAN'}
                    </Badge>
                    <span className="text-[11px] font-bold text-slate-500 font-mono">{req.location}</span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">{req.shelterType}</span>
                    <h4 className="text-base font-extrabold text-[#1B3A5C] mt-0.5">{req.shelterName}</h4>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between text-slate-700">
                      <span className="font-semibold">Penerima Manfaat:</span>
                      <span className="font-extrabold text-[#1B3A5C]">{req.beneficiariesCount} Jiwa</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span className="font-semibold">Kebutuhan Pangan:</span>
                      <span className="font-bold text-emerald-700">{req.foodCategoryNeeded}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    &quot;{req.notes}&quot;
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Batas Waktu:</span>
                    <span className="font-bold text-amber-700">{req.deadline}</span>
                  </div>

                  {req.status === 'MATCHED & PROCESSED' ? (
                    <div className="w-full py-2 bg-emerald-50 text-emerald-800 text-center font-extrabold text-xs rounded-xl border border-emerald-200">
                      ✓ Donasi Ter-Match & Diproses
                    </div>
                  ) : (
                    <Button
                      variant="gold"
                      size="sm"
                      className="w-full font-extrabold text-xs shadow-xs"
                      onClick={() => handleOpenFulfillModal(req)}
                    >
                      Penuhi Permintaan Donasi Ini ➔
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Modal Interactive Fulfill Donation Flow (Alur Bisnis Pemenuhan Realistis) */}
      <Modal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        title={`Alur Pemenuhan Donasi: ${selectedRequest?.shelterName}`}
        size="lg"
      >
        {selectedRequest && (
          <form onSubmit={handleConfirmFulfillSubmit} className="space-y-4 text-xs">
            {/* Target Summary Card */}
            <div className="p-4 bg-[#1B3A5C] text-white rounded-xl space-y-1">
              <span className="text-[10px] font-black uppercase text-[#D4A843] tracking-wider">Target Penerima Bantuan Pangan</span>
              <h4 className="text-base font-extrabold">{selectedRequest.shelterName} ({selectedRequest.beneficiariesCount} Anak/Lansia)</h4>
              <p className="text-xs text-slate-200">
                Lokasi: {selectedRequest.location} • Kebutuhan: {selectedRequest.foodCategoryNeeded}
              </p>
            </div>

            {/* Select Food Surplus Stock from Provider */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#1B3A5C]">1. Pilih Stok Makanan Surplus Toko Anda</label>
              <select
                className="w-full rounded-xl border border-slate-300 text-xs px-3.5 py-2.5 bg-white font-bold text-[#1B3A5C] focus:border-[#1B3A5C] focus:outline-none"
                value={selectedFoodItem}
                onChange={(e) => setSelectedFoodItem(e.target.value)}
              >
                <option value="Nasi Ayam Bakar Pak Kumis (Stok: 50 Porsi)">Nasi Ayam Bakar Pak Kumis (Stok: 50 Porsi)</option>
                <option value="Paket Bakery & Roti Manis Steril (Stok: 40 Paket)">Paket Bakery & Roti Manis Steril (Stok: 40 Paket)</option>
                <option value="Susu UHT & Buah Potong Segar (Stok: 35 Porsi)">Susu UHT & Buah Potong Segar (Stok: 35 Porsi)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="2. Jumlah Porsi Yang Dialokasikan (Porsi)"
                type="number"
                value={portionedQuantity}
                onChange={(e) => setPortionedQuantity(Number(e.target.value))}
                required
              />

              <Input
                label="3. Jam Siap Penjemputan / Serah Terima"
                value={readyTime}
                onChange={(e) => setReadyTime(e.target.value)}
                placeholder="19:00 WIB"
                required
              />
            </div>

            {/* Select Delivery & Rescue Method */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#1B3A5C]">4. Metode Pengiriman & Penyelamatan</label>
              <select
                className="w-full rounded-xl border border-slate-300 text-xs px-3.5 py-2.5 bg-white font-bold text-[#1B3A5C] focus:border-[#1B3A5C] focus:outline-none"
                value={deliveryMethod}
                onChange={(e) => setDeliveryMethod(e.target.value)}
              >
                <option value="RESCUE_COURIER">Disalurkan via Kurir Relawan Komunitas Replate</option>
                <option value="PROVIDER_DIRECT">Diantar Langsung oleh Armada Toko / Restoran</option>
                <option value="SHELTER_PICKUP">Diambil Mandiri oleh Pengurus Panti Asuhan</option>
              </select>
            </div>

            {/* Hygiene & Food Safety Checkbox Confirmation */}
            <label className="flex items-start gap-2.5 p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 cursor-pointer text-emerald-900">
              <input
                type="checkbox"
                checked={hygieneChecked}
                onChange={(e) => setHygieneChecked(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-emerald-600 rounded border-emerald-300 focus:ring-0 cursor-pointer"
              />
              <div className="space-y-0.5">
                <span className="font-extrabold block text-xs">Konfirmasi SOP Keamanan Pangan BPOM RI</span>
                <span className="text-[11px] block text-emerald-800 leading-relaxed font-medium">
                  Saya mengonfirmasi bahwa porsi makanan surplus yang dihibahkan dalam kondisi segar, siap santap < 4 jam, dikemas steril, dan lulus 8-Checklist Higienitas Replate.
                </span>
              </div>
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedRequest(null)}>
                Batal
              </Button>
              <Button type="submit" variant="gold" size="sm" className="font-extrabold shadow-md">
                Proses & Terbitkan QR Resi Donasi ➔
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal Tiket Receipt Kode QR Serah Terima Donasi */}
      <Modal
        isOpen={!!completedTicket}
        onClose={() => setCompletedTicket(null)}
        title="Resi Kode QR Serah Terima Donasi Resmi"
        size="md"
      >
        {completedTicket && (
          <div className="space-y-5 text-xs text-center">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 space-y-1">
              <span className="font-black text-sm uppercase tracking-wider block">✓ Donasi Berhasil Dialokasikan</span>
              <p className="text-xs text-emerald-800 font-medium">
                Notifikasi WhatsApp otomatis telah dikirim ke WhatsApp pengurus <strong>{completedTicket.shelterName}</strong>.
              </p>
            </div>

            {/* QR Code Graphic Box */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-900 text-white rounded-2xl space-y-3 shadow-md border border-slate-700">
              <div className="w-40 h-40 bg-white p-3 rounded-xl shadow-inner flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${completedTicket.ticketCode}`}
                  alt="Kode QR Donasi"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono block">ID TIKET DONASI RESMI:</span>
                <span className="font-mono text-lg font-black tracking-widest text-[#D4A843]">{completedTicket.ticketCode}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 font-medium block">Penerima Bantuan:</span>
                <span className="font-bold text-[#1B3A5C]">{completedTicket.shelterName}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Jumlah Dialokasikan:</span>
                <span className="font-bold text-emerald-700">{completedTicket.quantity} Porsi</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Jenis Makanan:</span>
                <span className="font-bold text-slate-800">{completedTicket.foodName}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Jam Penjemputan:</span>
                <span className="font-bold text-amber-700">{completedTicket.readyTime}</span>
              </div>
            </div>

            <Button
              variant="gold"
              size="md"
              className="w-full font-extrabold"
              onClick={() => setCompletedTicket(null)}
            >
              Selesai & Tutup Resi ➔
            </Button>
          </div>
        )}
      </Modal>

      {/* Modal Ajukan Request Baru oleh Shelter */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Ajukan Permintaan Bantuan Donasi Makanan Panti"
        size="md"
      >
        <form onSubmit={handleAddRequestSubmit} className="space-y-4 text-xs">
          <Input
            label="Nama Yayasan / Panti Asuhan / Shelter"
            placeholder="Contoh: Panti Asuhan Kasih Ibu"
            value={newShelterName}
            onChange={(e) => setNewShelterName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Jumlah Penerima Manfaat (Jiwa)"
              type="number"
              value={newCount}
              onChange={(e) => setNewCount(Number(e.target.value))}
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#343A40]">Wilayah Surabaya</label>
              <select
                className="w-full rounded-xl border border-slate-300 text-xs px-3.5 py-2 bg-white font-bold text-[#1B3A5C]"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
              >
                <option value="Surabaya Pusat">Surabaya Pusat</option>
                <option value="Surabaya Timur">Surabaya Timur</option>
                <option value="Surabaya Selatan">Surabaya Selatan</option>
                <option value="Surabaya Barat">Surabaya Barat</option>
                <option value="Surabaya Utara">Surabaya Utara</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#343A40]">Kategori Pangan Utama Yang Dibutuhkan</label>
            <select
              className="w-full rounded-xl border border-slate-300 text-xs px-3.5 py-2 bg-white font-bold text-[#1B3A5C]"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            >
              <option value="Makanan Olahan (Meals)">Makanan Olahan Siap Santap (Meals)</option>
              <option value="Roti, Buah & Susu (Bakery & Dairy)">Roti, Buah & Susu (Bakery & Dairy)</option>
              <option value="Bahan Pokok (Produce)">Bahan Sembako & Sayur (Produce)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#343A40]">Deskripsi Rincian Kebutuhan Panti</label>
            <textarea
              className="w-full rounded-xl border border-slate-300 text-xs p-3 focus:outline-none focus:border-[#1B3A5C]"
              rows={3}
              placeholder="Jelaskan porsi, batas waktu, dan kebutuhan gizi anak-anak panti..."
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsRequestModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="gold" size="sm" className="font-extrabold">
              Publikasikan Permintaan Donasi ➔
            </Button>
          </div>
        </form>
      </Modal>

      {/* Toast Alert */}
      <Toast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
