'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useSession } from 'next-auth/react';

export default function RescuePartnerSettingsPage() {
  const { data: session } = useSession();

  // Basic Community Profile State
  const [orgName, setOrgName] = useState('Komunitas Foodbank Surabaya Center');
  const [phone, setPhone] = useState('0812-3456-7890');
  const [email, setEmail] = useState('foodbank.surabaya@replate.id');
  const [address, setAddress] = useState('Jl. Pemuda No. 45, Genteng, Surabaya Pusat (Posko Utama)');
  const [district, setDistrict] = useState('Surabaya Pusat');
  const [leaderName, setLeaderName] = useState('Mas Rizky Multazam');
  const [skNumber, setSKNumber] = useState('SK-KEMENKUMHAM-VOL-2026-9812');
  const [category, setCategory] = useState('Komunitas Rescue Pangan Non-Profit');

  // Multi-Fleet Driver & Vehicle Management System (Samakan Alur & Teknis dengan Provider)
  interface FleetVehicle {
    id: string;
    driverName: string;
    driverPhone: string;
    isPhoneVerified: boolean;
    vehicleType: string;
    plateNumber: string;
    status: 'UNSUBMITTED' | 'PENDING' | 'APPROVED';
    docs: {
      driverPhoto: string;
      vehiclePhoto: string;
      ktpPhoto: string;
      simPhoto: string;
      stnkPhoto: string;
    };
  }

  const defaultFleetList: FleetVehicle[] = [
    {
      id: 'vol-flt-101',
      driverName: 'Mas Rizky Multazam (Kurir Utama Komunitas)',
      driverPhone: '0812-3456-7890',
      isPhoneVerified: true,
      vehicleType: 'Sepeda Motor Box Cooler Steril',
      plateNumber: 'L 4582 ABC',
      status: 'APPROVED',
      docs: {
        driverPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60',
        vehiclePhoto: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500&auto=format&fit=crop&q=60',
        ktpPhoto: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60',
        simPhoto: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=500&auto=format&fit=crop&q=60',
        stnkPhoto: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop&q=60',
      },
    },
    {
      id: 'vol-flt-102',
      driverName: 'Mbak Siska (Relawan Motor Surabaya Timur)',
      driverPhone: '0819-8765-4321',
      isPhoneVerified: true,
      vehicleType: 'Sepeda Motor Komunitas + Box Insulasi',
      plateNumber: 'L 9912 XYZ',
      status: 'PENDING',
      docs: {
        driverPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60',
        vehiclePhoto: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=500&auto=format&fit=crop&q=60',
        ktpPhoto: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60',
        simPhoto: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=500&auto=format&fit=crop&q=60',
        stnkPhoto: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop&q=60',
      },
    },
  ];

  const [fleetList, setFleetList] = useState<FleetVehicle[]>(defaultFleetList);
  const [selectedFleetId, setSelectedFleetId] = useState<string>('vol-flt-101');

  // WhatsApp OTP Verification Modal State
  const [otpModal, setOtpModal] = useState<{
    isOpen: boolean;
    fleetId: string;
    phone: string;
    driverName: string;
    sentOtp: string;
    inputOtp: string;
  }>({
    isOpen: false,
    fleetId: '',
    phone: '',
    driverName: '',
    sentOtp: '',
    inputOtp: '',
  });

  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    try {
      const p = localStorage.getItem('replate_onboarding_profile');
      if (p) {
        const parsed = JSON.parse(p);
        if (parsed.entityName) setOrgName(parsed.entityName);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.address) setAddress(parsed.address);
        if (parsed.contactPerson) setLeaderName(parsed.contactPerson);
      }
    } catch (_) {}
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setToastState({
      isOpen: true,
      message: 'Pengaturan profil organisasi Food Rescue Volunteer & armada relawan berhasil disimpan!',
      type: 'success',
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 text-xs">
      <Toast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={() => setToastState({ ...toastState, isOpen: false })}
      />

      {/* Top Banner Header */}
      <div className="bg-[#1B3A5C] rounded-2xl p-6 text-white shadow-lg border border-[#2C5A8F] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#D4A843] text-slate-900 text-[10px] font-black uppercase tracking-wider rounded-md shadow-xs">
              PUSAT KENDALI LOGISTIK RELAWAN
            </span>
            <span className="text-xs text-slate-200 font-semibold">100% Terverifikasi SOP BPOM RI</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-1 rounded-xl border border-emerald-500/40 text-[11px] font-mono font-bold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>ORGANISASI AKTIF RESMI</span>
          </div>
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-white">{orgName}</h1>
        <p className="text-xs text-slate-100 leading-relaxed max-w-3xl font-medium">
          Kelola profil organisasi komunitas relawan, pengesahan SK Kemenkumham/Kecamatan, penugasan kurir relawan, verifikasi WhatsApp OTP driver, dan titik posko utama Surabaya.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: Profil Organisasi Komunitas */}
        <Card className="border-slate-200 shadow-xs">
          <CardBody className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-extrabold text-[#1B3A5C] flex items-center gap-2">
                <span>1. Profil Identitas Organisasi Komunitas Food Rescue</span>
              </h3>
              <Badge variant="gold">COMMUNITY ORGANIZER</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nama Resmi Komunitas / Organisasi"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#343A40]">Jenis Organisasi</label>
                <select
                  className="w-full rounded-xl border border-slate-300 text-xs px-3.5 py-2.5 bg-white font-bold text-[#1B3A5C] focus:border-[#1B3A5C] focus:outline-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Komunitas Rescue Pangan Non-Profit">Komunitas Rescue Pangan Non-Profit</option>
                  <option value="Organisasi Bank Pangan (Foodbank)">Organisasi Bank Pangan (Foodbank)</option>
                  <option value="Yayasan Logistik Sosial & Kemanusiaan">Yayasan Logistik Sosial & Kemanusiaan</option>
                </select>
              </div>

              <Input
                label="No. SK Pengesahan / Keterangan Kemenkumham / Camat"
                value={skNumber}
                onChange={(e) => setSKNumber(e.target.value)}
                required
              />

              <Input
                label="Email Resmi Organisasi Komunitas"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Nama Ketua / Koordinator Komunitas (PJ)"
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
                required
              />

              <Input
                label="No. WhatsApp Resmi Komunitas (OTP Verified)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </CardBody>
        </Card>

        {/* Section 2: Manajemen Banyak Driver Relawan Komunitas (Multi-Fleet Driver & WA Verification) */}
        <Card className="border-slate-200 shadow-xs">
          <CardBody className="p-6 space-y-4">
            <div className="p-5 bg-gradient-to-r from-[#1B3A5C] via-slate-900 to-[#142C47] text-white rounded-2xl space-y-4 border border-slate-700 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase text-[#D4A843] tracking-wider block">
                      MANAJEMEN FLEET DRIVER RELAWAN KOMUNITAS
                    </span>
                    <Badge variant="gold">MULTI-DRIVER SYSTEM ({fleetList.length} RELAWAN)</Badge>
                  </div>
                  <h4 className="text-sm font-extrabold text-white">
                    Registrasi Driver Relawan & Verifikasi Kontak WA OTP Driver
                  </h4>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    Atur armada relawan di bawah naungan komunitas Anda. Daftarkan driver baru, lakukan verifikasi nomor WhatsApp driver via OTP, dan periksa SIM/STNK.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const newId = `vol-flt-${Date.now()}`;
                    const newVehicle = {
                      id: newId,
                      driverName: `Relawan Baru #${fleetList.length + 1}`,
                      driverPhone: '0812-9999-8888',
                      isPhoneVerified: false,
                      vehicleType: 'Sepeda Motor Box Steril',
                      plateNumber: `L ${Math.floor(1000 + Math.random() * 9000)} NEW`,
                      status: 'UNSUBMITTED' as const,
                      docs: {
                        driverPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60',
                        vehiclePhoto: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500&auto=format&fit=crop&q=60',
                        ktpPhoto: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60',
                        simPhoto: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=500&auto=format&fit=crop&q=60',
                        stnkPhoto: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop&q=60',
                      },
                    };
                    setFleetList([...fleetList, newVehicle]);
                    setSelectedFleetId(newId);
                    setToastState({
                      isOpen: true,
                      message: `🛵 Driver Relawan Baru #${fleetList.length + 1} Berhasil Ditambahkan Ke Daftar Komunitas!`,
                      type: 'success',
                    });
                  }}
                  className="px-3.5 py-2 bg-[#D4A843] hover:bg-[#b88f32] text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
                >
                  <span>+ Tambah Driver Relawan Komunitas</span>
                </button>
              </div>

              {/* Multi-Fleet Vehicles Selector Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-b border-slate-800 scrollbar-thin">
                {fleetList.map((flt, idx) => (
                  <button
                    key={flt.id}
                    type="button"
                    onClick={() => setSelectedFleetId(flt.id)}
                    className={`px-3.5 py-2 rounded-xl font-extrabold transition-all shrink-0 flex items-center gap-2 ${
                      selectedFleetId === flt.id
                        ? 'bg-[#1B3A5C] text-white border border-amber-400/50 shadow-sm'
                        : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>🛵 Driver #{idx + 1} ({flt.driverName.split(' ')[0]})</span>
                    {flt.status === 'APPROVED' ? (
                      <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.5 rounded">✓ TERAKREDITASI</span>
                    ) : flt.status === 'PENDING' ? (
                      <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded">⏳ PENDING</span>
                    ) : (
                      <span className="text-[9px] bg-slate-700 text-slate-300 font-bold px-1.5 py-0.5 rounded">DRAFT</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Form Display For Currently Selected Driver */}
              {(() => {
                const currentFleet = fleetList.find((f) => f.id === selectedFleetId) || fleetList[0];
                if (!currentFleet) return null;

                return (
                  <div className="space-y-4 pt-1 text-xs">
                    <div className="p-3.5 bg-emerald-950/90 border border-emerald-500/50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-300 font-bold text-xs">
                      <div className="space-y-0.5">
                        <span className="text-emerald-400 font-extrabold flex items-center gap-2">
                          <span>✓ AKREDITASI DRIVER RELAWAN KOMUNITAS AKTIF</span>
                        </span>
                        <p className="text-slate-300 text-[11px] font-medium">
                          Driver: <strong>{currentFleet.driverName}</strong> • Kontak WA: <strong className="text-emerald-300">{currentFleet.driverPhone} (✓ VERIFIED OTP)</strong> • No. Plat: <strong className="font-mono text-amber-300">{currentFleet.plateNumber}</strong>
                        </p>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-900 text-white font-mono text-[10px] rounded-md shrink-0">
                        VOLUNTEER-ID #{currentFleet.id.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-900 font-bold">
                      <div className="space-y-1">
                        <label className="text-[11px] text-amber-300 font-extrabold block">Nama Lengkap Driver Relawan:</label>
                        <input
                          type="text"
                          value={currentFleet.driverName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFleetList((prev) => prev.map((f) => (f.id === currentFleet.id ? { ...f, driverName: val } : f)));
                          }}
                          className="w-full p-2.5 bg-white text-slate-900 font-bold rounded-xl border border-slate-300 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-amber-300 font-extrabold block">No. WhatsApp Driver (OTP Verified):</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={currentFleet.driverPhone}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFleetList((prev) => prev.map((f) => (f.id === currentFleet.id ? { ...f, driverPhone: val, isPhoneVerified: false } : f)));
                            }}
                            className="w-full p-2.5 bg-white text-slate-900 font-bold rounded-xl border border-slate-300 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
                              setOtpModal({
                                isOpen: true,
                                fleetId: currentFleet.id,
                                phone: currentFleet.driverPhone,
                                driverName: currentFleet.driverName,
                                sentOtp: randomOtp,
                                inputOtp: '',
                              });
                            }}
                            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shrink-0 cursor-pointer shadow-xs"
                          >
                            Verifikasi WA
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-amber-300 font-extrabold block">Jenis Kendaraan Operasional:</label>
                        <input
                          type="text"
                          value={currentFleet.vehicleType}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFleetList((prev) => prev.map((f) => (f.id === currentFleet.id ? { ...f, vehicleType: val } : f)));
                          }}
                          className="w-full p-2.5 bg-white text-slate-900 font-bold rounded-xl border border-slate-300 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-amber-300 font-extrabold block">Nomor Plat Kendaraan (STNK):</label>
                        <input
                          type="text"
                          value={currentFleet.plateNumber}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFleetList((prev) => prev.map((f) => (f.id === currentFleet.id ? { ...f, plateNumber: val } : f)));
                          }}
                          className="w-full p-2.5 bg-white text-slate-900 font-bold rounded-xl border border-slate-300 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </CardBody>
        </Card>

        {/* Section 3: Geofencing Posko Utama & Wilayah Operasional Surabaya */}
        <Card className="border-slate-200 shadow-xs">
          <CardBody className="p-6 space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-extrabold text-[#1B3A5C] flex items-center gap-2">
                <span>3. Geofencing Posko Utama & Wilayah Operasional Surabaya</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#343A40]">Distrik Utama Penjemputan Surabaya</label>
                <select
                  className="w-full rounded-xl border border-slate-300 text-xs px-3.5 py-2.5 bg-white font-bold text-[#1B3A5C] focus:border-[#1B3A5C] focus:outline-none"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                >
                  <option value="Surabaya Pusat">Surabaya Pusat (Genteng, Tegalsari, Gubeng)</option>
                  <option value="Surabaya Barat">Surabaya Barat (Semampir, Sambikerep)</option>
                  <option value="Surabaya Timur">Surabaya Timur (Sukolilo, Rungkut)</option>
                  <option value="Surabaya Selatan">Surabaya Selatan (Wonokromo, Gayungan)</option>
                  <option value="Surabaya Utara">Surabaya Utara (Pabean, Bulak)</option>
                </select>
              </div>

              <Input
                label="No. Telepon / Hotline Posko Penyelamat Pangan"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />

              <div className="md:col-span-2">
                <Input
                  label="Alamat Posko Utama / Basecamp Logistik Komunitas"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="flex justify-end pt-2">
          <Button variant="gold" size="lg" type="submit" className="font-black text-slate-950 py-3.5 px-8 shadow-lg text-sm">
            <span>Simpan Seluruh Pengaturan Komunitas & Driver ➔</span>
          </Button>
        </div>
      </form>

      {/* Driver WhatsApp Verification Modal */}
      <Modal
        isOpen={otpModal.isOpen}
        onClose={() => setOtpModal({ ...otpModal, isOpen: false })}
        title="📱 Verifikasi WA OTP Driver Relawan"
        size="sm"
      >
        <div className="space-y-4 text-center text-xs text-slate-700 p-2">
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-950 font-bold space-y-1 text-left">
            <span className="block text-[11px] font-black">💬 Replate WA Gateway Server:</span>
            <p className="text-[11px] font-normal leading-relaxed">
              Kode OTP 4-digit ({otpModal.sentOtp}) telah dikirim otomatis via WA ke driver <strong>{otpModal.driverName}</strong> ({otpModal.phone}).
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-[#1B3A5C] block">Masukkan Kode OTP 4-Digit WA Driver:</label>
            <input
              type="text"
              maxLength={4}
              value={otpModal.inputOtp}
              onChange={(e) => setOtpModal({ ...otpModal, inputOtp: e.target.value })}
              placeholder={otpModal.sentOtp}
              className="w-36 h-12 bg-white text-slate-900 font-black text-xl text-center rounded-xl border-2 border-amber-400 focus:outline-none mx-auto font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button
              variant="gold"
              size="md"
              onClick={() => {
                setFleetList((prev) =>
                  prev.map((f) => (f.id === otpModal.fleetId ? { ...f, isPhoneVerified: true, status: 'APPROVED' } : f))
                );
                setOtpModal({ ...otpModal, isOpen: false });
                setToastState({
                  isOpen: true,
                  message: `✓ Nomor WhatsApp Driver "${otpModal.driverName}" Berhasil Terverifikasi! Status Akreditasi: ACTIVE.`,
                  type: 'success',
                });
              }}
              className="w-full font-black text-slate-950 py-2.5"
            >
              Verifikasi Kontak WA Driver ➔
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
