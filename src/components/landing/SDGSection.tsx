import React from 'react';
import { Card, CardBody } from '../ui/Card';

export const SDGSection: React.FC = () => {
  const sdgs = [
    {
      num: 'SDG 11',
      title: 'Kota Berkelanjutan',
      desc: 'Mengurangi food waste di perkotaan dan mendukung ekosistem pangan kota Surabaya yang tangguh.',
      color: 'bg-amber-600',
    },
    {
      num: 'SDG 13',
      title: 'Perubahan Iklim',
      desc: 'Setiap 1 kg makanan yang diselamatkan mengurangi 2.5 kg emisi gas rumah kaca dari pembusukan sampah.',
      color: 'bg-green-700',
    },
    {
      num: 'SDG 9',
      title: 'Inovasi & Infrastruktur',
      desc: 'Smart matching algorithm sebagai inovasi infrastruktur digital distribusi pangan berlebih.',
      color: 'bg-orange-600',
    },
    {
      num: 'SDG 4',
      title: 'Pendidikan Pangan',
      desc: 'Edukasi food waste awareness, standar keamanan pangan BPOM, dan budaya berbagi.',
      color: 'bg-red-700',
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold text-[#D4A843] uppercase tracking-widest">
            Alignment Pembangunan Berkelanjutan
          </span>
          <h2 className="text-3xl font-black text-[#1B3A5C] mt-1">Dukungan FoodBridge untuk UN SDGs</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sdgs.map((sdg, idx) => (
            <Card key={idx} className="border-[#DEE2E6] hover:shadow-md transition-all">
              <CardBody className="p-6 space-y-3">
                <span className={`inline-block px-3 py-1 text-xs font-bold text-white rounded-lg ${sdg.color}`}>
                  {sdg.num}
                </span>
                <h3 className="text-base font-extrabold text-[#1B3A5C]">{sdg.title}</h3>
                <p className="text-xs text-[#6C757D] leading-relaxed">{sdg.desc}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
