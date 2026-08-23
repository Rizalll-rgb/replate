'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';

export default function OnboardingDocumentsPage() {
  const router = useRouter();

  const [nibDoc, setNibDoc] = useState<string>(
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=60'
  );
  const [ktpDoc, setKtpDoc] = useState<string>(
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60'
  );
  const [storePhoto, setStorePhoto] = useState<string>(
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=60'
  );
  const [qrisPhoto, setQrisPhoto] = useState<string>(
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60'
  );

  const handleSubmitDocuments = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const docData = {
        nibDoc,
        ktpDoc,
        storePhoto,
        qrisPhoto,
        submittedAt: new Date().toISOString(),
        status: 'DOCS_SUBMITTED_PENDING_REVIEW',
      };
      localStorage.setItem('replate_onboarding_docs', JSON.stringify(docData));
    } catch (_) {}
    router.push('/onboarding/pending-review');
  };

  return (
    <div className="min-h-screen bg-[#0F1923] text-white flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="w-full max-w-xl space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Logo variant="light" size="lg" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D4A843] text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-md">
            <span>LANGKAH 3 DARI 4 — UPLOAD DOKUMEN LEGALITAS (ALA GRAB/GOJEK DRIVER)</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Unggah Berkas Administrasi Usaha / Yayasan
          </h1>
          <p className="text-xs text-slate-300">
            Tim Admin Replate Surabaya akan memverifikasi keabsahan dokumen untuk menjamin integritas mitra.
          </p>
        </div>

        <Card className="bg-slate-900/90 border-slate-700 text-slate-100 shadow-xl">
          <CardHeader className="border-b border-slate-800 pb-3">
            <CardTitle className="text-sm font-extrabold text-[#D4A843] flex items-center gap-2">
              <span>📄 Verifikasi Dokumen Asli Mitra</span>
            </CardTitle>
          </CardHeader>
          <CardBody className="p-6 space-y-5">
            <form onSubmit={handleSubmitDocuments} className="space-y-4 text-xs">
              {/* Document 1: NIB / Izin Usaha / Akta Yayasan */}
              <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white">1. NIB / Surat Izin Usaha / Akta Pendirian Yayasan:</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                    WAJIB
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-14 bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shrink-0">
                    <img src={nibDoc} alt="Preview NIB" className="w-full h-full object-cover" />
                  </div>
                  <label className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl cursor-pointer text-xs transition-colors">
                    <span>📷 Upload NIB / Surat Izin</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) setNibDoc(URL.createObjectURL(e.target.files[0]));
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Document 2: KTP Penanggung Jawab */}
              <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white">2. KTP Penanggung Jawab Operasional:</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                    WAJIB
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-14 bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shrink-0">
                    <img src={ktpDoc} alt="Preview KTP" className="w-full h-full object-cover" />
                  </div>
                  <label className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl cursor-pointer text-xs transition-colors">
                    <span>📷 Upload Foto KTP Asli</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) setKtpDoc(URL.createObjectURL(e.target.files[0]));
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Document 3: Foto Lokasi Outlet / Bangunan Yayasan */}
              <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white">3. Foto Plang Bangunan Toko / Outlet / Yayasan:</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                    WAJIB
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-14 bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shrink-0">
                    <img src={storePhoto} alt="Preview Outlet" className="w-full h-full object-cover" />
                  </div>
                  <label className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl cursor-pointer text-xs transition-colors">
                    <span>📷 Upload Foto Bangunan</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) setStorePhoto(URL.createObjectURL(e.target.files[0]));
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <Button variant="gold" size="md" type="submit" className="font-black text-xs">
                  <span>Kirim Berkas Ke Tim Admin Replate ➔</span>
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
