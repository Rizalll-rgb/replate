import React from 'react';
import { Card, CardBody } from '../ui/Card';
import { Avatar } from '../ui/Avatar';

export const Testimonials: React.FC = () => {
  const items = [
    {
      name: 'Pak Kumis',
      role: 'Owner Warung Bakso Pak Kumis',
      text: 'FoodBridge membantu restoran kami memanfaatkan sisa porsi harian menjadi nilai tambah dan membantu sesama di Surabaya.',
    },
    {
      name: 'Ibu Margareth',
      role: 'Pengurus Panti Asuhan Kasih Ibu',
      text: 'Bantuan makanan berkualitas dari Food Rescue sangat membantu gizi 45 anak yatim di tempat kami secara teratur.',
    },
    {
      name: 'Budi Santoso',
      role: 'Mahasiswa Surabaya',
      text: 'Layanan Rescue Sale sangat hemat untuk mahasiswa, dapat makanan lezat berkualitas tinggi dengan harga ramah kantong.',
    },
  ];

  return (
    <section className="py-16 bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold text-[#D4A843] uppercase tracking-widest">
            Kisah Komunitas
          </span>
          <h2 className="text-3xl font-black text-[#1B3A5C] mt-1">Apa Kata Pengguna FoodBridge?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item, idx) => (
            <Card key={idx} className="border-[#DEE2E6] bg-white p-6">
              <CardBody className="space-y-4">
                <p className="text-xs text-[#495057] italic leading-relaxed">"{item.text}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-[#F1F3F5]">
                  <Avatar name={item.name} size="md" />
                  <div>
                    <h4 className="text-xs font-bold text-[#1B3A5C]">{item.name}</h4>
                    <p className="text-[10px] text-[#6C757D]">{item.role}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
