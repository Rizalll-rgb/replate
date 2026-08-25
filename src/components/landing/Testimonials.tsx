'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Toast } from '../ui/Toast';

interface TestimonialItem {
  name: string;
  role: string;
  text: string;
  rating?: number;
  date?: string;
}

export const Testimonials: React.FC = () => {
  const defaultItems: TestimonialItem[] = [
    {
      name: 'Pak Kumis',
      role: 'Owner Warung Bakso Pak Kumis Surabaya',
      text: 'Replate membantu restoran kami memanfaatkan sisa porsi harian menjadi nilai tambah dan membantu panti asuhan di sekitar Gubeng.',
      rating: 5,
      date: '2 hari lalu',
    },
    {
      name: 'Ibu Margareth',
      role: 'Pengurus Panti Asuhan Kasih Ibu Wonokromo',
      text: 'Bantuan makanan steril berkualitas dari Food Rescue sangat membantu kebutuhan nutrisi 45 anak asuh di tempat kami secara teratur.',
      rating: 5,
      date: 'Kemarin',
    },
    {
      name: 'Budi Santoso',
      role: 'Mahasiswa UNESA Surabaya',
      text: 'Fitur Rescue Sale sangat hemat untuk anak kos, dapat makanan lezat berkualitas tinggi dengan harga sangat terjangkau.',
      rating: 5,
      date: 'Hari ini',
    },
  ];

  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(defaultItems);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: 'Food Consumer (Pembeli Surplus)',
    text: '',
    rating: 5,
  });

  const [toastState, setToastState] = useState({
    isOpen: false,
    message: '',
    type: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('replate_community_testimonials');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTestimonials([...parsed, ...defaultItems]);
        }
      }
    } catch (_) {}
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.text.trim()) {
      setToastState({
        isOpen: true,
        message: 'Mohon lengkapi nama dan cerita dampak Anda.',
        type: 'error',
      });
      return;
    }

    const newItem: TestimonialItem = {
      name: formData.name.trim(),
      role: formData.role,
      text: formData.text.trim(),
      rating: formData.rating,
      date: 'Baru saja',
    };

    try {
      const saved = JSON.parse(localStorage.getItem('replate_community_testimonials') || '[]');
      const updated = [newItem, ...saved];
      localStorage.setItem('replate_community_testimonials', JSON.stringify(updated));
      setTestimonials([newItem, ...testimonials]);

      setToastState({
        isOpen: true,
        message: '🎉 Terima kasih! Cerita dampak Anda berhasil dibagikan.',
        type: 'success',
      });

      setIsModalOpen(false);
      setFormData({
        name: '',
        role: 'Food Consumer (Pembeli Surplus)',
        text: '',
        rating: 5,
      });
    } catch (_) {}
  };

  return (
    <section className="py-16 bg-[#F8F9FA] border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="space-y-1">
            <span className="text-xs font-black text-[#D4A843] uppercase tracking-widest block">
              Kisah Komunitas Nyata
            </span>
            <h2 className="text-3xl font-black text-[#1B3A5C]">Apa Kata Pengguna Replate?</h2>
            <p className="text-xs text-slate-500 font-medium max-w-xl">
              Cerita nyata dari mitra restoran, pengurus panti asuhan, relawan penyelamat pangan, dan pembeli surplus Surabaya.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 bg-[#1B3A5C] hover:bg-[#2C5A8F] text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span>✍️ Tulis Cerita Dampak Anda ➔</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, idx) => (
            <Card key={idx} className="border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition-all rounded-3xl flex flex-col justify-between">
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400 text-xs">
                    {'★'.repeat(item.rating || 5)}
                  </div>
                  {item.date && (
                    <span className="text-[10px] text-slate-400 font-medium">{item.date}</span>
                  )}
                </div>

                <p className="text-xs text-slate-700 italic leading-relaxed font-medium">
                  &quot;{item.text}&quot;
                </p>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <Avatar name={item.name} size="md" className="border-2 border-[#1B3A5C]/20" />
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-[#1B3A5C] truncate">{item.name}</h4>
                    <p className="text-[10px] font-bold text-amber-700 truncate">{item.role}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Modal Tulis Cerita Dampak */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="✍️ Bagikan Pengalaman & Cerita Dampak Anda"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-700">
          <p className="text-slate-500 font-medium">
            Cerita Anda akan langsung ditampilkan di galeri Kisah Komunitas Replate untuk menginspirasi warga Surabaya lainnya.
          </p>

          <div className="space-y-1.5">
            <label className="font-extrabold text-slate-900 block">Nama Lengkap / Instansi:</label>
            <input
              type="text"
              placeholder="Contoh: Budi Santoso / Resto Padang Jaya"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-[#1B3A5C]"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-extrabold text-slate-900 block">Peran / Kategori Pengguna:</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-[#1B3A5C]"
            >
              <option value="Food Consumer (Pembeli Surplus)">Food Consumer (Pembeli Surplus)</option>
              <option value="Food Provider (Mitra Restoran/Bakery)">Food Provider (Mitra Restoran/Bakery)</option>
              <option value="Food Beneficiary (Pengurus Panti Asuhan)">Food Beneficiary (Pengurus Panti Asuhan)</option>
              <option value="Rescue Volunteer (Kurir Relawan Pangan)">Rescue Volunteer (Kurir Relawan Pangan)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-extrabold text-slate-900 block">Cerita Penyelamatan Makanan Anda:</label>
            <textarea
              rows={4}
              placeholder="Bagikan pengalaman bagaimana Replate membantu Anda menyelamatkan makanan surplus, menghemat anggaran, atau membantu sesama..."
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              className="w-full p-3 bg-white border border-slate-300 rounded-xl font-medium text-xs text-slate-900 focus:outline-none focus:border-[#1B3A5C]"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="gold" size="sm" type="submit" className="font-black text-slate-950">
              Kirim Cerita Dampak ➔
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
    </section>
  );
};
