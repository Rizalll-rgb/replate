'use client';

import React, { useState } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { useSession } from 'next-auth/react';

export default function ProviderSettingsPage() {
  const { data: session } = useSession();

  const [orgName, setOrgName] = useState(session?.user?.name || 'Warung Bakso Pak Kumis');
  const [phone, setPhone] = useState((session?.user as any)?.phone || '081234567891');
  const [email, setEmail] = useState(session?.user?.email || 'mitra@replate.id');
  const [address, setAddress] = useState((session?.user as any)?.address || 'Jl. Genteng Kali No. 45, Genteng, Surabaya');
  const [district, setDistrict] = useState('Surabaya Pusat');
  const [nib, setNib] = useState('NIB-9120481023912');
  const [businessCategory, setBusinessCategory] = useState('Restoran / Warung Kuliner');
  const [pickupHours, setPickupHours] = useState('19:00 - 22:00 WIB');
  const [halalCertNo, setHalalCertNo] = useState('ID35110001298450123');
  const [defaultPackaging, setDefaultPackaging] = useState('Kemasan Boks Biodegradable (Steril)');
  const [autoMatchPanti, setAutoMatchPanti] = useState(true);
  const [waAlerts, setWaAlerts] = useState(true);
  const [autoExpireAlert, setAutoExpireAlert] = useState(true);

  // GPS Map Coordinates State (Poin 3)
  const [lat, setLat] = useState<number>(-7.2575);
  const [lng, setLng] = useState<number>(112.7521);
  const [uploadedNibDoc, setUploadedNibDoc] = useState<string | null>('Dokumen_NIB_PakKumis_Verified.pdf');

  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  const handleDetectGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(Math.round(pos.coords.latitude * 10000) / 10000);
          setLng(Math.round(pos.coords.longitude * 10000) / 10000);
          setToastState({
            isOpen: true,
            message: 'Koordinat GPS akurat lokasi toko Anda berhasil terdeteksi!',
            type: 'success',
          });
        },
        () => {
          // Default Surabaya Center fallback
          setLat(-7.2575);
          setLng(112.7521);
          setToastState({
            isOpen: true,
            message: 'Koordinat GPS ditetapkan ke Surabaya Pusat (Default)',
            type: 'success',
          });
        }
      );
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setToastState({
      isOpen: true,
      message: 'Seluruh pengaturan outlet, koordinat GPS, & profil usaha berhasil disimpan!',
      type: 'success',
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-[#1B3A5C] rounded-2xl p-6 text-white shadow-lg border border-[#2C5A8F] space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-[#D4A843] text-slate-900 text-[10px] font-black uppercase tracking-wider rounded-md shadow-xs">
            Pengaturan Akun Provider
          </span>
          <span className="text-xs text-slate-200 font-semibold">100% Terverifikasi SOP BPOM RI</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Pengaturan Outlet & Profil Usaha</h1>
        <p className="text-xs text-slate-100 leading-relaxed max-w-3xl font-medium">
          Pusat kendali operasional mitra restoran: kelola kredensial legalitas NIB, penentuan pin lokasi GPS peta Surabaya, jam pickup surplus, kriteria higienitas BPOM, dan preferensi notifikasi klaim real-time.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: Profil Organisasi & Identitas Usaha */}
        <Card className="border-slate-200 shadow-xs">
          <CardBody className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-extrabold text-[#1B3A5C] flex items-center gap-2">
                <svg className="w-5 h-5 text-[#D4A843]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h6m-6 0V10m0 0h6m-6 0H7" />
                </svg>
                <span>1. Identitas Usaha & Legalitas Bisnis</span>
              </h3>
              <Badge variant="success">VERIFIED PRO GRADE A</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <Input
                label="Nama Restoran / Toko Pangan"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#343A40]">Kategori Usaha Kuliner</label>
                <select
                  className="w-full rounded-xl border border-slate-300 text-xs px-3.5 py-2.5 bg-white font-bold text-[#1B3A5C] focus:border-[#1B3A5C] focus:outline-none"
                  value={businessCategory}
                  onChange={(e) => setBusinessCategory(e.target.value)}
                >
                  <option value="Restoran / Warung Kuliner">Restoran / Warung Kuliner</option>
                  <option value="Hotel & Catering Buffet">Hotel & Catering Buffet</option>
                  <option value="Toko Roti & Bakery">Toko Roti & Bakery</option>
                  <option value="Supermarket / Toko Sembako">Supermarket / Toko Sembako</option>
                </select>
              </div>

              <Input
                label="Nomor NIB / Izin Usaha Resmi (OSS BPOM Verified)"
                value={nib}
                onChange={(e) => setNib(e.target.value)}
                required
              />

              <Input
                label="Email Resmi Operasional Outlet"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Upload Dokumen NIB Verification (Poin 1) */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="font-extrabold text-[#1B3A5C] block">Dokumen Legalitas NIB / Izin Usaha:</span>
                <span className="text-slate-500 font-medium">{uploadedNibDoc || 'Belum diunggah'}</span>
              </div>
              <label className="px-3.5 py-2 bg-[#1B3A5C] text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-[#2C5A8F] transition-colors shrink-0 text-center">
                Upload Berkas NIB (PDF/JPG)
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setUploadedNibDoc(e.target.files[0].name);
                      setToastState({
                        isOpen: true,
                        message: `File ${e.target.files[0].name} berhasil diunggah untuk verifikasi Admin!`,
                        type: 'success',
                      });
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </CardBody>
        </Card>

        {/* Section 2: Lokasi Geofencing & Interactive Map Location Picker (Poin 2 & Poin 3) */}
        <Card className="border-slate-200 shadow-xs">
          <CardBody className="p-6 space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-extrabold text-[#1B3A5C] flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>2. Geofencing Lokasi Surabaya & Penitik Peta GPS</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Wilayah Surabaya Dropdown (Poin 2 - Plain Surabaya Regions) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#343A40]">Wilayah Operasional Surabaya</label>
                <select
                  className="w-full rounded-xl border border-slate-300 text-xs px-3.5 py-2.5 bg-white font-bold text-[#1B3A5C] focus:border-[#1B3A5C] focus:outline-none"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                >
                  <option value="Surabaya Pusat">Surabaya Pusat</option>
                  <option value="Surabaya Barat">Surabaya Barat</option>
                  <option value="Surabaya Timur">Surabaya Timur</option>
                  <option value="Surabaya Selatan">Surabaya Selatan</option>
                  <option value="Surabaya Utara">Surabaya Utara</option>
                </select>
              </div>

              <Input
                label="No. WhatsApp / Telepon PIC Penjemputan"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />

              <div className="md:col-span-2">
                <Input
                  label="Alamat Lengkap Penjemputan Makanan Surplus"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Interactive GPS Pin Point Map Section (Poin 3) */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-extrabold text-xs text-[#1B3A5C]">Penitikan Lokasi Presisi (Koordinat GPS Peta)</h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Pastikan titik koordinat akurat agar penerima donasi & kurir komunitas dapat menemukan lokasi toko Anda.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="gold"
                  size="sm"
                  onClick={handleDetectGPS}
                  className="font-extrabold text-xs shrink-0 flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span>Detect GPS Otomatis</span>
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <Input
                  label="Latitude (Garis Lintang)"
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value) || -7.2575)}
                />
                <Input
                  label="Longitude (Garis Bujur)"
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value) || 112.7521)}
                />
              </div>

              {/* Interactive Visual Map Card Preview */}
              <div className="relative w-full h-44 rounded-xl border border-slate-300 overflow-hidden bg-slate-200 flex items-center justify-center shadow-xs">
                <iframe
                  title="Google Maps Location Preview"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
                  className="w-full h-full filter saturate-150"
                />
                <div className="absolute top-3 left-3 bg-[#1B3A5C] text-white px-3 py-1 rounded-lg text-[10px] font-black shadow-md uppercase tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Titik Penjemputan Toko: {lat}, {lng}</span>
                </div>
              </div>
            </div>

            <Input
              label="Jendela Jam Operasional Pickup Surplus"
              value={pickupHours}
              onChange={(e) => setPickupHours(e.target.value)}
              placeholder="19:00 - 22:00 WIB"
              required
            />
          </CardBody>
        </Card>

        {/* Section 3: Standar Kredensial Keamanan Pangan & BPOM */}
        <Card className="border-slate-200 shadow-xs">
          <CardBody className="p-6 space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-extrabold text-[#1B3A5C] flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>3. Standar Kredensial Higienitas & Halal BPOM</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <Input
                label="Nomor Sertifikasi Halal (BPJPH / MUI)"
                value={halalCertNo}
                onChange={(e) => setHalalCertNo(e.target.value)}
              />

              <Input
                label="Standar Kemasan Default Toko"
                value={defaultPackaging}
                onChange={(e) => setDefaultPackaging(e.target.value)}
              />
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs space-y-1">
              <span className="font-extrabold block">Status Audit SOP BPOM RI:</span>
              <p className="text-emerald-800 leading-relaxed font-medium">
                Outlet Anda telah lulus verifikasi audit 8-Checklist Higienitas Replate & berhak menerbitkan Sertifikat Penyelamat Pangan resmi untuk laporan CSR perusahaan.
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Section 4: Preferensi Otomatisasi & Notifikasi */}
        <Card className="border-slate-200 shadow-xs">
          <CardBody className="p-6 space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-extrabold text-[#1B3A5C] flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span>4. Preferensi Smart Matching & Notifikasi WhatsApp</span>
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <div>
                  <span className="font-extrabold text-[#1B3A5C] block">Otomatiskan Match Panti Asuhan Surabaya</span>
                  <span className="text-slate-500 block text-[11px]">Ijinkan Smart Matching Engine langsung menyalurkan donasi surplus porsi besar ke panti terverifikasi.</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoMatchPanti}
                  onChange={(e) => setAutoMatchPanti(e.target.checked)}
                  className="w-5 h-5 text-[#1B3A5C] rounded border-slate-300 focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <div>
                  <span className="font-extrabold text-[#1B3A5C] block">Notifikasi WhatsApp Real-Time</span>
                  <span className="text-slate-500 block text-[11px]">Kirimkan notifikasi WhatsApp instan setiap ada klaim baru atau verifikasi Kode QR.</span>
                </div>
                <input
                  type="checkbox"
                  checked={waAlerts}
                  onChange={(e) => setWaAlerts(e.target.checked)}
                  className="w-5 h-5 text-[#1B3A5C] rounded border-slate-300 focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <div>
                  <span className="font-extrabold text-[#1B3A5C] block">Peringatan Otomatis 30 Menit Sebelum Pickup Expire</span>
                  <span className="text-slate-500 block text-[11px]">Sistem akan mengirim peringatan jika ada listing yang mendekati batas waktu penjemputan.</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoExpireAlert}
                  onChange={(e) => setAutoExpireAlert(e.target.checked)}
                  className="w-5 h-5 text-[#1B3A5C] rounded border-slate-300 focus:ring-0 cursor-pointer"
                />
              </label>
            </div>
          </CardBody>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" variant="gold" size="lg" className="font-extrabold shadow-md">
            Simpan Seluruh Pengaturan Outlet ➔
          </Button>
        </div>
      </form>

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
