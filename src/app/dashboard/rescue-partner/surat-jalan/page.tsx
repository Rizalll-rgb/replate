'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function SuratJalanPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 text-slate-800">
      {/* Action Bar - Hidden on print */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden mb-6">
        <Link href="/dashboard/rescue-partner">
          <Button variant="outline" size="sm" className="font-extrabold text-xs">
            ⬅ Kembali ke Dashboard
          </Button>
        </Link>
        <Button variant="gold" size="sm" onClick={handlePrint} className="font-black text-xs shadow-md">
          🖨️ Cetak Surat Jalan
        </Button>
      </div>

      {/* Surat Jalan Document */}
      <Card className="print-container border-slate-200 shadow-lg rounded-xl overflow-hidden bg-white print:shadow-none print:border-none print:m-0 print:p-0">
        <CardBody className="p-8 sm:p-12 print:p-6 space-y-8 print:space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-slate-800 pb-6 gap-4">
            <div>
              <h1 className="text-3xl font-black text-[#1B3A5C] tracking-tight uppercase">
                SURAT JALAN DIGITAL
              </h1>
              <p className="text-sm font-bold text-slate-600 tracking-widest mt-1 uppercase">
                Replate - Food Rescue Operation
              </p>
            </div>
            <div className="text-right bg-slate-100 p-4 rounded-xl border border-slate-200">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No. Resi</p>
              <p className="text-2xl font-black text-[#1B3A5C] font-mono tracking-tight">FB-DON-88192</p>
            </div>
          </div>

          {/* Info Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase text-[#D4A843] tracking-wider block">
                INFO PENJEMPUTAN (PROVIDER)
              </span>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <h3 className="font-black text-[#1B3A5C] text-lg">Hotel Majapahit Surabaya</h3>
                <p className="text-sm font-medium text-slate-600 leading-relaxed">
                  Jl. Tunjungan No. 65, Genteng, Surabaya<br />
                  Kontak: Bpk. Agus (0812-3456-7890)
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black uppercase text-emerald-600 tracking-wider block">
                TUJUAN PENGANTARAN (PENERIMA)
              </span>
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-1">
                <h3 className="font-black text-emerald-900 text-lg">Panti Asuhan Kasih Ibu Wonokromo</h3>
                <p className="text-sm font-medium text-emerald-800 leading-relaxed">
                  Jl. Raya Gubeng No. 88, Gubeng, Surabaya<br />
                  Kontak: Ibu Siti (0819-8765-4321)
                </p>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase text-slate-800 tracking-wider">
              RINCIAN ITEM DONASI PANGAN
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#1B3A5C] text-white">
                  <tr>
                    <th className="p-4 font-black w-16 text-center">NO</th>
                    <th className="p-4 font-black">NAMA PRODUK</th>
                    <th className="p-4 font-black w-32 text-center">JUMLAH</th>
                    <th className="p-4 font-black">KETERANGAN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  <tr>
                    <td className="p-4 text-center font-bold text-slate-500">1</td>
                    <td className="p-4 font-extrabold text-[#1B3A5C]">Nasi Goreng Buffet</td>
                    <td className="p-4 text-center font-black text-emerald-700 bg-emerald-50">30 Porsi</td>
                    <td className="p-4 text-xs font-medium text-slate-600">Lauk Ayam Bakar & Sayur</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-center font-bold text-slate-500">2</td>
                    <td className="p-4 font-extrabold text-[#1B3A5C]">Snack Box / Kue Basah</td>
                    <td className="p-4 text-center font-black text-emerald-700 bg-emerald-50">15 Box</td>
                    <td className="p-4 text-xs font-medium text-slate-600">Sisa Event Meeting Pagi</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-4 pt-12 print:pt-6 text-center text-sm">
            <div className="space-y-16 print:space-y-10">
              <p className="font-extrabold text-slate-600 uppercase text-xs tracking-wider">Provider / Pengirim</p>
              <div className="border-b border-slate-400 w-3/4 mx-auto"></div>
              <p className="font-bold text-[#1B3A5C]">( Hotel Majapahit )</p>
            </div>
            <div className="space-y-16 print:space-y-10">
              <p className="font-extrabold text-slate-600 uppercase text-xs tracking-wider">Kurir / Food Rescue</p>
              <div className="border-b border-slate-400 w-3/4 mx-auto"></div>
              <p className="font-bold text-[#1B3A5C]">( Relawan Replate )</p>
            </div>
            <div className="space-y-16 print:space-y-10">
              <p className="font-extrabold text-slate-600 uppercase text-xs tracking-wider">Penerima (Panti)</p>
              <div className="border-b border-slate-400 w-3/4 mx-auto"></div>
              <p className="font-bold text-[#1B3A5C]">( ................................ )</p>
            </div>
          </div>
          
          <div className="pt-8 border-t border-dashed border-slate-300 text-center text-xs text-slate-500">
            <p>Dokumen ini dihasilkan secara otomatis oleh sistem Replate dan sah sebagai bukti serah terima donasi pangan.</p>
            <p className="font-mono mt-1">Dicetak pada: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>

        </CardBody>
      </Card>
      
      {/* A bit of CSS to ensure it prints well on a single page */}
      <style dangerouslySetInnerHTML={{__html: `
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
          /* Hide standard next.js layouts or main padding if necessary */
          nav, header, footer, .bottom-nav {
            display: none !important;
          }
          /* Force scale to fit if necessary */
          .print-container {
            zoom: 0.9;
          }
        }
      `}} />
    </div>
  );
}
