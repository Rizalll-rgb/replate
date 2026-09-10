'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  ShieldCheck,
  FileText,
  Lock,
  Truck,
  HeartHandshake,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  Scale,
  Sparkles,
} from 'lucide-react';

export interface TOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabKey = 'umum' | 'bpom' | 'skema' | 'logistik' | 'privasi' | 'integritas' | 'kontak';

export const TOSModal: React.FC<TOSModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('umum');

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'umum', label: '1. Ketentuan Umum', icon: <FileText className="w-3.5 h-3.5" /> },
    { key: 'bpom', label: '2. Standar BPOM', icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> },
    { key: 'skema', label: '3. Skema Pangan', icon: <HeartHandshake className="w-3.5 h-3.5 text-amber-400" /> },
    { key: 'logistik', label: '4. Logistik & QR', icon: <Truck className="w-3.5 h-3.5 text-sky-400" /> },
    { key: 'privasi', label: '5. Kebijakan Privasi', icon: <Lock className="w-3.5 h-3.5 text-purple-400" /> },
    { key: 'integritas', label: '6. Pakta Integritas', icon: <Scale className="w-3.5 h-3.5 text-rose-400" /> },
    { key: 'kontak', label: '7. Bantuan & Hukum', icon: <HelpCircle className="w-3.5 h-3.5 text-slate-400" /> },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Syarat, Ketentuan & Kebijakan Privasi Replate"
      size="xl"
    >
      <div className="space-y-4 text-xs text-slate-700">
        {/* Header Branding Banner */}
        <div className="p-4 bg-gradient-to-r from-[#1B3A5C] via-[#142C47] to-[#0D1E32] text-white rounded-2xl space-y-1.5 shadow-md border border-[#2C5A8F]/60">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="font-black text-[#D4A843] text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Standard Operasional Platform Zero-Waste Indonesia
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/40">
              Sesuai UU PDP No. 27/2022 & Panduan BPOM RI
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            Dokumen hukum dan operasional resmi yang mengikat seluruh pihak dalam ekosistem Replate: Food Provider (Mitra Usaha), Food Beneficiary (Panti/Yayasan Sosial), Food Consumer (Konsumen Umum), dan Food Rescue Volunteer (Relawan Logistik).
          </p>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 scrollbar-thin">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#1B3A5C] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Tab Contents */}
        <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-3.5">
          {/* TAB 1: KETENTUAN UMUM */}
          {activeTab === 'umum' && (
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-black text-[#1B3A5C] text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#D4A843]" />
                  <span>1.1. Hakikat dan Misi Ekosistem Replate</span>
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  Replate adalah platform teknologi agregator redistribusi pangan cerdas dan berkelanjutan (<em>smart surplus food redistribution platform</em>) yang bertujuan memangkas limbah pangan (<em>food waste</em>) dan mendukung pencapaian 5 Pilar SDGs (2, 9, 11, 12, 13).
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Dengan mendaftarkan akun, mengakses platform, atau melakukan transaksi di Replate, Anda menyatakan telah berusia minimal 17 tahun atau memiliki izin resmi bertindak atas nama badan hukum/usaha/instansi terkait.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-black text-[#1B3A5C] text-sm">1.2. Klasifikasi & Hak Akses 5 Peran Pengguna</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-slate-700">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="font-extrabold text-[#1B3A5C] block">1. Food Provider</span>
                    <p className="text-[11px] text-slate-600">Restoran, toko roti, hotel, supermarket, katering, dan produsen pangan penyedia surplus makanan berkualitas layak konsumsi.</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="font-extrabold text-[#1B3A5C] block">2. Food Beneficiary</span>
                    <p className="text-[11px] text-slate-600">Panti asuhan, yayasan sosial, shelter, panti jompo, dan lembaga nirlaba penerima donasi makanan gratis (Rp 0) terverifikasi Dinsos.</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="font-extrabold text-[#1B3A5C] block">3. Food Consumer</span>
                    <p className="text-[11px] text-slate-600">Masyarakat umum, pekerja, atau mahasiswa pembeli porsi makanan berlebih dengan diskon hemat (Rescue Sale) sekaligus penyalur infaq panti.</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="font-extrabold text-[#1B3A5C] block">4. Rescue Volunteer</span>
                    <p className="text-[11px] text-slate-600">Komunitas relawan dan kurir armada pangan yang bertanggung jawab atas penjemputan, penanganan termal, dan pengantaran pangan aman.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STANDAR BPOM RI */}
          {activeTab === 'bpom' && (
            <div className="space-y-3">
              <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-2">
                <h4 className="font-black text-emerald-950 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>2.1. Standar Keamanan Pangan & 8 Checklist SOP BPOM RI</span>
                </h4>
                <p className="text-emerald-900 leading-relaxed font-medium">
                  Seluruh makanan yang didistribusikan melalui Replate wajib mematuhi panduan BPOM RI tentang penyelamatan makanan aman. Sebelum listing diterbitkan, Food Provider wajib mencentang dan menjamin 8 kriteria kelayakan:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {[
                    'Bukan sisa piring / kontak langsung konsumen',
                    'Waktu simpan aman di bawah batas dekomposisi suhu',
                    'Pengemasan higienis, bersih, rapat, dan steril',
                    'Uji organoleptik visual (warna, tekstur wajar)',
                    'Uji aroma (tidak berbau asam, tengik, atau basi)',
                    'Tidak mengandung bahan berbahaya atau kedaluwarsa',
                    'Tersedia label waktu batas konsumsi (Best Before Pickup)',
                    'Suhu penyimpanan terjaga (>60°C panas atau <5°C dingin)',
                  ].map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-white/90 p-2.5 rounded-xl border border-emerald-100 text-[11px] font-semibold text-emerald-900">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-black text-[#1B3A5C] text-sm">2.2. Thermal Decay Engine & Batas Kadaluwarsa Penjemputan</h4>
                <p className="text-slate-600 leading-relaxed">
                  Setiap listing makanan memiliki durasi waktu penjemputan (<em>Pickup Window Countdown</em>). Jika makanan tidak dijemput hingga batas waktu kedaluwarsa sistem berakhir, status listing otomatis dibatalkan (*auto-void*) demi mencegah degradasi bakteri dan menjaga keselamatan penerima manfaat.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: SKEMA DUAL-CHANNEL */}
          {activeTab === 'skema' && (
            <div className="space-y-3">
              <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-2">
                <h4 className="font-black text-amber-950 text-sm flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-amber-600" />
                  <span>3.1. Skema Donasi Gratis (Food Rescue Rp 0)</span>
                </h4>
                <p className="text-amber-900 leading-relaxed font-medium">
                  Makanan surplus yang ditujukan untuk <strong>Food Beneficiary</strong> (panti asuhan, yayasan, dhuafa) disalurkan <strong>100% Gratis tanpa dipungut biaya apapun (Rp 0)</strong>.
                </p>
                <p className="text-amber-900/90 leading-relaxed text-[11px]">
                  Pihak panti asuhan penerima dilarang keras memperjualbelikan kembali porsi makanan donasi yang diterima kepada pihak ketiga dalam bentuk dan dalih apapun.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-black text-[#1B3A5C] text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D4A843]" />
                  <span>3.2. Skema Rescue Sale (Diskon Terjangkau & Infaq Panti 5%)</span>
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  Makanan surplus yang dipasarkan kepada <strong>Food Consumer</strong> dijual dengan potongan harga diskon minimal 50% hingga 70% dari harga normal gerai.
                </p>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="font-extrabold text-[#1B3A5C] block">Mekanisme Infaq Otomatis 5%:</span>
                  <p className="text-[11px] text-slate-600">
                    Dari setiap transaksi pembayaran Rescue Sale, sebesar 5% dialokasikan secara transparan ke kas operasional logistik panti asuhan binaan Replate.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LOGISTIK & QR */}
          {activeTab === 'logistik' && (
            <div className="space-y-3">
              <div className="p-4 bg-sky-50/80 rounded-2xl border border-sky-200 space-y-2">
                <h4 className="font-black text-sky-950 text-sm flex items-center gap-2">
                  <Truck className="w-4 h-4 text-sky-600" />
                  <span>4.1. Verifikasi Kode QR & Validasi Surat Jalan Digital</span>
                </h4>
                <p className="text-sky-900 leading-relaxed font-medium">
                  Setiap proses serah terima makanan (antara Restoran dan Relawan, atau Relawan dan Yayasan) wajib diverifikasi menggunakan <strong>Kode QR Dinamis Unik</strong> atau <strong>Surat Jalan Digital Terenkripsi</strong>.
                </p>
                <ul className="list-disc list-inside space-y-1 text-sky-950 text-[11px] pt-1">
                  <li>Pengambilan tidak sah tanpa pemindaian QR scanner resmi di aplikasi Replate.</li>
                  <li>Bukti serah terima mencakup stempel waktu digital, data GPS mitra, dan tanda tangan digital penanggung jawab.</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-black text-[#1B3A5C] text-sm">4.2. Toleransi Keterlambatan & Pembatalan Klaim</h4>
                <p className="text-slate-600 leading-relaxed">
                  Pihak pengambil (Konsumen maupun Relawan) diberikan toleransi keterlambatan maksimal 30 menit dari jam pickup yang disepakati. Jika tidak hadir, mitra penyedia berhak membatalkan klaim untuk dialihkan ke penerima darurat terdekat.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: KEBIJAKAN PRIVASI */}
          {activeTab === 'privasi' && (
            <div className="space-y-3">
              <div className="p-4 bg-purple-50/80 rounded-2xl border border-purple-200 space-y-2">
                <h4 className="font-black text-purple-950 text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-600" />
                  <span>5.1. Kepatuhan Undang-Undang Perlindungan Data Pribadi (UU PDP No. 27/2022)</span>
                </h4>
                <p className="text-purple-900 leading-relaxed font-medium">
                  Replate berkomitmen melindungi data pribadi pengguna. Kami hanya mengumpulkan data yang relevan untuk verifikasi legalitas, keamanan pangan, dan kelancaran redistribusi:
                </p>
                <ul className="list-disc list-inside space-y-1 text-purple-950 text-[11px] pt-1">
                  <li><strong>Data Profil:</strong> Nama lengkap, alamat email, dan nomor WhatsApp (terverifikasi OTP).</li>
                  <li><strong>Data Usaha/Yayasan:</strong> Nomor Induk Berusaha (NIB), KTP penanggung jawab, dan izin Dinsos RI.</li>
                  <li><strong>Data Geografis:</strong> Koordinat lokasi GPS outlet/panti untuk routing optimasi penjemputan terdekat.</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-black text-[#1B3A5C] text-sm">5.2. Enkripsi dan Kerahasiaan Dokumen</h4>
                <p className="text-slate-600 leading-relaxed">
                  Seluruh berkas legalitas disimpan di server berstandar enkripsi tinggi dan hanya dapat diakses oleh Auditor Tim Governance Replate untuk verifikasi 1x24 jam kerja. Dokumen tidak akan pernah diperjualbelikan atau disebarluaskan ke pihak ketiga tanpa persetujuan tertulis Anda.
                </p>
              </div>
            </div>
          )}

          {/* TAB 6: PAKTA INTEGRITAS */}
          {activeTab === 'integritas' && (
            <div className="space-y-3">
              <div className="p-4 bg-rose-50/80 rounded-2xl border border-rose-200 space-y-2">
                <h4 className="font-black text-rose-950 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>6.1. Larangan Mutlak dan Penegakan Sanksi Blacklist</span>
                </h4>
                <p className="text-rose-900 leading-relaxed font-medium">
                  Demi menjaga integritas sosial dan kemanusiaan, hal-hal berikut merupakan pelanggaran berat:
                </p>
                <div className="space-y-1.5 pt-1 text-rose-900 text-[11px]">
                  <p className="flex items-start gap-1.5">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>Menjual kembali makanan hasil donasi Food Rescue Rp 0.</span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>Mengunggah makanan busuk, beracun, atau tidak layak makan secara sengaja.</span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>Membuat akun palsu, memalsukan dokumen NIB/Dinsos, atau merekayasa klaim porsi.</span>
                  </p>
                </div>
                <div className="p-2.5 bg-rose-100/90 rounded-xl border border-rose-300 text-rose-950 text-[10px] font-bold">
                  Sanksi: Pembekuan akun permanen, pencabutan sertifikat kemitraan, publikasi ke blacklist jaringan Dinsos, dan tuntutan hukum perundang-undangan RI yang berlaku.
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: BANTUAN & HUKUM */}
          {activeTab === 'kontak' && (
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-black text-[#1B3A5C] text-sm flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#D4A843]" />
                  <span>7.1. Hukum yang Berlaku & Penyelesaian Sengketa</span>
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  Syarat dan Ketentuan ini diatur dan ditafsirkan sesuai dengan hukum Negara Kesatuan Republik Indonesia. Setiap perselisihan yang timbul akan diupayakan diselesaikan secara musyawarah mufakat melalui Tim Governance Replate sebelum menempuh jalur hukum di yurisdiksi Pengadilan Negeri setempat.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-black text-[#1B3A5C] text-sm flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#1B3A5C]" />
                  <span>7.2. Pusat Bantuan & Layanan Pengaduan</span>
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  Jika Anda memiliki pertanyaan, laporan penyalahgunaan makanan, atau kendala hak akses data pribadi, silakan hubungi saluran resmi kami:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 text-[11px] font-semibold pt-1">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Email Governance & Hukum:</span>
                    <span className="text-[#1B3A5C] font-bold">legal@replate.id</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Hotline WhatsApp Replate:</span>
                    <span className="text-[#1B3A5C] font-bold">0812-3456-7890 (24 Jam)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
          <p className="text-[11px] text-slate-500 font-medium">
            Terakhir diperbarui: <strong>Maret 2026 (Versi 2.0 PWA)</strong>
          </p>
          <Button
            variant="gold"
            size="md"
            className="w-full sm:w-auto font-black text-xs px-6 py-2.5 cursor-pointer shadow-sm"
            onClick={onClose}
          >
            Saya Memahami & Menyetujui Syarat dan Ketentuan
          </Button>
        </div>
      </div>
    </Modal>
  );
};
