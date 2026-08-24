'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { Modal } from '@/components/ui/Modal';

export default function OnboardingDocumentsPage() {
  const router = useRouter();

  const [role, setRole] = useState<string>('FOOD_PROVIDER');
  const [nibDoc, setNibDoc] = useState<string>('');
  const [ktpDoc, setKtpDoc] = useState<string>('');
  const [storePhoto, setStorePhoto] = useState<string>('');
  const [qrisPhoto, setQrisPhoto] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');

  // Lightbox / Document Preview & Sample Example Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    imageSrc: string;
    isSample: boolean;
    hintText: string;
  }>({
    isOpen: false,
    title: '',
    imageSrc: '',
    isSample: false,
    hintText: '',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const queryRole = new URLSearchParams(window.location.search).get('role');
      if (queryRole) setRole(queryRole);

      try {
        const p = localStorage.getItem('replate_onboarding_profile');
        if (p) {
          const parsed = JSON.parse(p);
          if (parsed.role) setRole(parsed.role);
        }
      } catch (_) {}
    }
  }, []);

  const handleSubmitDocuments = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Strict Validation Rule
    if (!nibDoc || !ktpDoc || !storePhoto) {
      setValidationError('⚠️ ANDA WAJIB MENGUNGGAH SELURUH BERKAS LEGALITAS YANG DITANDAI [WAJIB] SEBELUM DAPAT MELANJUTKAN!');
      return;
    }

    try {
      const docData = {
        nibDoc,
        ktpDoc,
        storePhoto,
        qrisPhoto,
        role,
        submittedAt: new Date().toISOString(),
        status: 'DOCS_SUBMITTED_PENDING_REVIEW',
      };
      localStorage.setItem('replate_onboarding_docs', JSON.stringify(docData));
    } catch (_) {}

    router.push('/onboarding/pending-review');
  };

  const isBeneficiary = role === 'FOOD_BENEFICIARY' || role === 'RESCUE_PARTNER';
  const isVolunteer = role === 'RESCUE_VOLUNTEER' || role === 'VOLUNTEER';

  const sampleNibImage = 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800&auto=format&fit=crop&q=80';
  const sampleKtpImage = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80';
  const sampleStoreImage = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80';

  return (
    <div className="min-h-screen bg-[#0F1923] text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      <div className="w-full max-w-3xl space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Logo variant="light" size="lg" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#D4A843] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md">
            <span>LANGKAH 3 DARI 4 — UPLOAD DOKUMEN LEGALITAS REPLATE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Unggah Berkas Legalitas {isBeneficiary ? 'Yayasan / Panti' : isVolunteer ? 'Komunitas / Organisasi Food Rescue' : 'Outlet Provider'}
          </h1>
          <p className="text-xs text-slate-300 font-medium max-w-md mx-auto">
            Tim Admin Replate Surabaya akan memverifikasi keabsahan dokumen untuk menjamin integritas mitra.
          </p>
        </div>

        {/* High Contrast Container Card */}
        <div className="bg-[#1B3A5C] border-2 border-[#2C5A8F] text-white rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-[#2C5A8F] pb-3 flex items-center justify-between">
            <h3 className="text-base font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <span>📄 Verifikasi 3 Berkas Asli Wajib</span>
            </h3>
            <span className="text-xs bg-red-500/20 text-red-300 border border-red-500/40 font-black px-2.5 py-1 rounded-lg">
              REQUIRED AUDIT
            </span>
          </div>

          {validationError && (
            <div className="p-4 bg-red-900/90 border-2 border-red-400 text-white font-black text-xs rounded-xl shadow-lg animate-bounce">
              {validationError}
            </div>
          )}

          <form onSubmit={handleSubmitDocuments} className="space-y-5 text-xs">
            {/* Berkas 1 */}
            <div className="p-4 bg-[#142C47] rounded-xl border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-amber-300 text-xs">
                  1. {isBeneficiary ? 'Akta Pendirian Yayasan / Surat Keterangan Panti:' : isVolunteer ? 'Akta Pendirian Komunitas / SK Pengesahan / Surat Keterangan Komunitas:' : 'NIB / Surat Izin Usaha Resmi OSS (BPOM Verified):'}
                </span>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded border ${nibDoc ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500' : 'bg-red-500/20 text-red-300 border-red-500'}`}>
                  {nibDoc ? '✓ TERUNGGAH' : 'WAJIB'}
                </span>
              </div>

              <p className="text-[11px] text-slate-300 font-medium italic bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                💡 <strong>Ketentuan:</strong> {isVolunteer ? 'Surat Keterangan Komunitas / SK Pengesahan Organisasi dari Kemenkumham / Camat setempat.' : 'Pastikan nomor NIB 13-digit dan QR Code sertifikat OSS terlihat utuh tanpa terpotong.'}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-3">
                  <div className="w-24 h-16 bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shrink-0 flex items-center justify-center">
                    {nibDoc ? (
                      <img src={nibDoc} alt="Preview Berkas 1" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-slate-500 italic">Belum diunggah</span>
                    )}
                  </div>
                  <label className="px-4 py-2.5 bg-[#D4A843] hover:bg-[#b88f32] text-slate-950 font-black rounded-xl cursor-pointer text-xs transition-all shadow-md">
                    <span>📷 Select File & Upload ➔</span>
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

                <div className="flex items-center gap-2">
                  {nibDoc && (
                    <button
                      type="button"
                      onClick={() =>
                        setModalState({
                          isOpen: true,
                          title: 'Preview Berkas 1 Yang Anda Unggah',
                          imageSrc: nibDoc,
                          isSample: false,
                          hintText: 'Berkas ini telah tersimpan dan siap diaudit oleh Admin Replate.',
                        })
                      }
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      👁️ Lihat Preview Berkas
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setModalState({
                        isOpen: true,
                        title: isVolunteer ? 'Contoh SK Pengesahan Komunitas' : 'Contoh Berkas Valid (Standard NIB OSS)',
                        imageSrc: sampleNibImage,
                        isSample: true,
                        hintText: isVolunteer ? 'Contoh Surat Keterangan Komunitas / Organisasi Relawan.' : 'Contoh NIB OSS resmi dengan QR Code dan stempel digital BPOM yang jelas.',
                      })
                    }
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-extrabold text-xs rounded-xl border border-amber-400/40 transition-all cursor-pointer"
                  >
                    📜 Lihat Contoh Valid
                  </button>
                </div>
              </div>
            </div>

            {/* Berkas 2 */}
            <div className="p-4 bg-[#142C47] rounded-xl border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-amber-300 text-xs">
                  2. {isVolunteer ? 'Foto KTP Ketua / Koordinator Komunitas Relawan:' : 'Foto KTP Penanggung Jawab (PJ) Operasional:'}
                </span>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded border ${ktpDoc ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500' : 'bg-red-500/20 text-red-300 border-red-500'}`}>
                  {ktpDoc ? '✓ TERUNGGAH' : 'WAJIB'}
                </span>
              </div>

              <p className="text-[11px] text-slate-300 font-medium italic bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                💡 <strong>Ketentuan:</strong> Foto KTP Ketua / Koordinator asli (Bukan fotokopi). NIK 16-digit dan foto wajib terbaca tajam.
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-3">
                  <div className="w-24 h-16 bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shrink-0 flex items-center justify-center">
                    {ktpDoc ? (
                      <img src={ktpDoc} alt="Preview Berkas 2" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-slate-500 italic">Belum diunggah</span>
                    )}
                  </div>
                  <label className="px-4 py-2.5 bg-[#D4A843] hover:bg-[#b88f32] text-slate-950 font-black rounded-xl cursor-pointer text-xs transition-all shadow-md">
                    <span>📷 Select File & Upload ➔</span>
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

                <div className="flex items-center gap-2">
                  {ktpDoc && (
                    <button
                      type="button"
                      onClick={() =>
                        setModalState({
                          isOpen: true,
                          title: 'Preview KTP Yang Anda Unggah',
                          imageSrc: ktpDoc,
                          isSample: false,
                          hintText: 'KTP Ketua / Koordinator komunitas telah diunggah.',
                        })
                      }
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      👁️ Lihat Preview Berkas
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setModalState({
                        isOpen: true,
                        title: 'Contoh Berkas KTP Valid',
                        imageSrc: sampleKtpImage,
                        isSample: true,
                        hintText: 'Contoh KTP asli tanpa pantulan cahaya dan NIK terbaca tajam.',
                      })
                    }
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-extrabold text-xs rounded-xl border border-amber-400/40 transition-all cursor-pointer"
                  >
                    📜 Lihat Contoh Valid
                  </button>
                </div>
              </div>
            </div>

            {/* Berkas 3 */}
            <div className="p-4 bg-[#142C47] rounded-xl border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-amber-300 text-xs">
                  3. {isBeneficiary ? 'Foto Plang Bangunan Panti Asuhan & Anak Asuh:' : isVolunteer ? 'Foto Posko Utama / Basecamp Logistik Komunitas Surabaya:' : 'Foto Etalase / Plang Bangunan Outlet Fisik:'}
                </span>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded border ${storePhoto ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500' : 'bg-red-500/20 text-red-300 border-red-500'}`}>
                  {storePhoto ? '✓ TERUNGGAH' : 'WAJIB'}
                </span>
              </div>

              <p className="text-[11px] text-slate-300 font-medium italic bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                💡 <strong>Ketentuan:</strong> {isVolunteer ? 'Foto tampak depan posko utama / sekretariat komunitas relawan yang menampilkan spanduk/logo komunitas.' : 'Foto tampak depan bangunan fisik / etalase toko yang menampilkan nama usaha secara jelas.'}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-3">
                  <div className="w-24 h-16 bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shrink-0 flex items-center justify-center">
                    {storePhoto ? (
                      <img src={storePhoto} alt="Preview Berkas 3" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-slate-500 italic">Belum diunggah</span>
                    )}
                  </div>
                  <label className="px-4 py-2.5 bg-[#D4A843] hover:bg-[#b88f32] text-slate-950 font-black rounded-xl cursor-pointer text-xs transition-all shadow-md">
                    <span>📷 Select File & Upload ➔</span>
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

                <div className="flex items-center gap-2">
                  {storePhoto && (
                    <button
                      type="button"
                      onClick={() =>
                        setModalState({
                          isOpen: true,
                          title: 'Preview Foto Outlet Yang Anda Unggah',
                          imageSrc: storePhoto,
                          isSample: false,
                          hintText: 'Foto etalase/plang bangunan fisik usaha Anda.',
                        })
                      }
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      👁️ Lihat Preview Berkas
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setModalState({
                        isOpen: true,
                        title: 'Contoh Foto Etalase/Plang Valid',
                        imageSrc: sampleStoreImage,
                        isSample: true,
                        hintText: 'Foto tampak depan toko fisik yang memperlihatkan merek usaha.',
                      })
                    }
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-extrabold text-xs rounded-xl border border-amber-400/40 transition-all cursor-pointer"
                  >
                    📜 Lihat Contoh Valid
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#2C5A8F] flex justify-end">
              <Button variant="gold" size="md" type="submit" className="font-black text-xs py-3 px-6 shadow-md">
                <span>Kirim Berkas Ke Tim Admin Replate ➔</span>
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Document Preview & Sample Lightbox Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        title={modalState.title}
        size="md"
      >
        <div className="space-y-4 text-center text-xs text-slate-800 p-2">
          <div className="p-3 bg-slate-100 rounded-xl border border-slate-300 font-medium leading-relaxed">
            <p className="text-xs text-slate-700">{modalState.hintText}</p>
          </div>

          <div className="w-full max-h-80 overflow-hidden rounded-2xl border-2 border-slate-300 bg-slate-900 flex items-center justify-center shadow-lg">
            <img src={modalState.imageSrc} alt="Preview Document" className="w-full h-full object-contain" />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalState({ ...modalState, isOpen: false })}
              className="font-bold text-xs"
            >
              Tutup Preview
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
