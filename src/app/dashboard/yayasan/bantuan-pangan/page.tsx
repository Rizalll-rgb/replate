'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

function BantuanPanganContent() {
  const searchParams = useSearchParams();
  const codeParam = searchParams.get('code') || 'RPL-YYS-2026-9921';

  const [claimData, setClaimData] = useState<any>({
    code: codeParam,
    pantiName: 'Panti Asuhan Kasih Ibu',
    address: 'Jl. Raya Gubeng No. 88, Gubeng, Surabaya',
    pic: 'Ibu Hajjah Maryam',
    provider: 'Warung Bakso Pak Kumis',
    method: 'Diantar oleh Kurir Relawan Replate',
    date: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
    items: [
      { id: 1, name: 'Nasi Kotak Ayam Bakar Spesial (Higienis)', qty: '40 Porsi', estValue: '1.000.000 (Rp 0)' },
      { id: 2, name: 'Paket Sembako & Beras (Donasi Titipan)', qty: '5 Paket', estValue: '500.000 (Rp 0)' },
    ],
  });

  useEffect(() => {
    try {
      const claimsStr = localStorage.getItem('replate_beneficiary_claims');
      if (claimsStr) {
        const claims = JSON.parse(claimsStr);
        const matched = claims.find((c: any) => c.code === codeParam || c.id === codeParam);
        if (matched) {
          setClaimData({
            code: matched.code || matched.id,
            pantiName: matched.pantiName || 'Panti Asuhan Kasih Ibu',
            address: matched.destinationAddress || 'Jl. Raya Gubeng No. 88, Gubeng, Surabaya',
            pic: matched.pic || 'Ibu Hajjah Maryam',
            provider: matched.provider || matched.providerName || 'Warung Bakso Pak Kumis',
            method: matched.methodLabel || 'Diantar oleh Kurir Relawan Replate',
            date: matched.claimedAt || new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
            items: [
              {
                id: 1,
                name: matched.foodName || 'Paket Bantuan Pangan Siap Santap',
                qty: matched.quantity || '40 Porsi',
                estValue: '1.000.000 (Rp 0)',
              },
            ],
          });
        }
      }
    } catch (_) {}
  }, [codeParam]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto pb-12 text-slate-800 px-2 sm:px-4">
      {/* Action Bar - Hidden on print */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 print:hidden mb-2 sm:mb-4">
        <Link href="/dashboard/yayasan/claims">
          <Button variant="outline" size="sm" className="font-extrabold text-xs cursor-pointer w-full sm:w-auto">
            ← Kembali ke Modul Klaim
          </Button>
        </Link>
        <Button
          variant="gold"
          size="sm"
          onClick={handlePrint}
          className="font-black text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer text-slate-950 w-full sm:w-auto py-2.5 px-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          <span>Cetak Bukti Bantuan Pangan Resmi</span>
        </Button>
      </div>

      {/* Printable Document */}
      <Card className="print-container border-slate-200 shadow-md sm:shadow-lg rounded-2xl overflow-hidden bg-white print:shadow-none print:border-none print:m-0 print:p-0">
        <CardBody className="p-4 sm:p-8 md:p-12 print:p-6 space-y-6 sm:space-y-8 print:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-slate-800 pb-5 sm:pb-6 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-[#1B3A5C] text-white text-[9px] font-black uppercase tracking-wider rounded">
                  Dokumen Resmi Penyaluran
                </span>
                <span className="text-[10px] text-emerald-700 font-bold">Lolos Audit Dinsos RI</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#1B3A5C] tracking-tight uppercase">
                BUKTI BANTUAN PANGAN
              </h1>
              <p className="text-xs sm:text-sm font-bold text-slate-600 tracking-wider mt-0.5 uppercase">
                Replate - Food Beneficiary Module
              </p>
            </div>
            <div className="w-full sm:w-auto text-left sm:text-right bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200">
              <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">No. Ref Bantuan</p>
              <p className="text-lg sm:text-2xl font-black text-[#1B3A5C] font-mono tracking-tight break-all">
                {claimData.code}
              </p>
            </div>
          </div>

          {/* Info Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <span className="text-[11px] sm:text-xs font-black uppercase text-[#D4A843] tracking-wider block">
                PENERIMA (BENEFICIARY)
              </span>
              <div className="p-3.5 sm:p-4 bg-blue-50/70 rounded-xl border border-blue-200 space-y-1">
                <h3 className="font-black text-[#1B3A5C] text-base sm:text-lg">{claimData.pantiName}</h3>
                <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
                  {claimData.address}
                  <br />
                  Ketua Pengurus: <strong>{claimData.pic}</strong>
                  <br />
                  Tipe Penerima: Yayasan / Anak Yatim Piatu Terdaftar
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] sm:text-xs font-black uppercase text-emerald-600 tracking-wider block">
                DETAIL PENYALURAN
              </span>
              <div className="p-3.5 sm:p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <h3 className="font-black text-slate-800 text-xs sm:text-sm">
                  Status Penyaluran: <span className="text-emerald-700 font-extrabold">SELESAI (COMPLETED)</span>
                </h3>
                <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
                  Tanggal: <strong>{claimData.date}</strong>
                  <br />
                  Donatur: <strong>{claimData.provider}</strong>
                  <br />
                  Metode: <strong>{claimData.method}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Table Section (Responsive with horizontal scrolling on tiny screens) */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-black uppercase text-slate-800 tracking-wider">
              RINCIAN ITEM BANTUAN PANGAN
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs sm:text-sm min-w-[480px]">
                <thead className="bg-[#1B3A5C] text-white">
                  <tr>
                    <th className="p-3 sm:p-4 font-black w-12 text-center">NO</th>
                    <th className="p-3 sm:p-4 font-black">NAMA PRODUK / BANTUAN</th>
                    <th className="p-3 sm:p-4 font-black w-28 text-center">JUMLAH</th>
                    <th className="p-3 sm:p-4 font-black w-36">NILAI EST (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {claimData.items.map((it: any, idx: number) => (
                    <tr key={it.id || idx}>
                      <td className="p-3 sm:p-4 text-center font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-3 sm:p-4 font-extrabold text-[#1B3A5C]">{it.name}</td>
                      <td className="p-3 sm:p-4 text-center font-black text-emerald-700 bg-emerald-50/50">
                        {it.qty}
                      </td>
                      <td className="p-3 sm:p-4 text-xs font-medium text-slate-600">{it.estValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-4 pt-8 sm:pt-12 print:pt-6 text-center text-xs sm:text-sm">
            <div className="space-y-12 sm:space-y-16 print:space-y-10">
              <p className="font-extrabold text-slate-600 uppercase text-[11px] sm:text-xs tracking-wider">
                Ketua / Pengurus Panti (Penerima)
              </p>
              <div className="border-b border-slate-400 w-3/4 sm:w-2/4 mx-auto"></div>
              <p className="font-bold text-[#1B3A5C]">( {claimData.pic} )</p>
            </div>
            <div className="space-y-12 sm:space-y-16 print:space-y-10">
              <p className="font-extrabold text-slate-600 uppercase text-[11px] sm:text-xs tracking-wider">
                Kurir Penyalur / Donatur
              </p>
              <div className="border-b border-slate-400 w-3/4 sm:w-2/4 mx-auto"></div>
              <p className="font-bold text-[#1B3A5C]">( Relawan Replate / Armada Donatur )</p>
            </div>
          </div>

          <div className="pt-6 sm:pt-8 border-t border-dashed border-slate-300 text-center text-[10px] sm:text-xs text-slate-500 space-y-1">
            <p>Dokumen ini merupakan bukti sah penerimaan bantuan pangan yang diverifikasi melalui sistem Replate.</p>
            <p className="font-mono">
              Dicetak pada:{' '}
              {new Date().toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Print Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          nav, header, footer, .bottom-nav {
            display: none !important;
          }
          .print-container {
            zoom: 0.9;
          }
        }
      `,
        }}
      />
    </div>
  );
}

export default function BantuanPanganDetail() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto p-12 text-center text-slate-500 font-bold">
          Memuat Dokumen Bukti Bantuan Pangan...
        </div>
      }
    >
      <BantuanPanganContent />
    </Suspense>
  );
}

