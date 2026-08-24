'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/layout/Navbar';
import { FoodCard } from '@/components/food/FoodCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Footer } from '@/components/layout/Footer';

const demoFoods = [
  {
    id: 'food-1',
    foodName: 'Nasi Box Ayam',
    providerName: 'Catering ABC',
    rating: 4.8,
    price: 10000,
    originalPrice: 25000,
    distance: 1.2,
    time: '17:00-19:00',
    badge: 'Pickup hari ini',
    category: 'MAKANAN_BERAT',
  },
  {
    id: 'food-2',
    foodName: 'Roti Croissant',
    providerName: 'Bakery House',
    rating: 4.7,
    price: 8000,
    originalPrice: 16000,
    distance: 1.5,
    time: '17:00-20:00',
    badge: 'Pickup hari ini',
    category: 'BAKERY',
  },
  {
    id: 'food-3',
    foodName: 'Sayur Mix',
    providerName: 'Tani Segar',
    rating: 4.6,
    price: 5000,
    originalPrice: 12000,
    distance: 2.1,
    time: '16:00-19:00',
    badge: 'Pickup hari ini',
    category: 'SAYUR',
  },
  {
    id: 'food-4',
    foodName: 'Minuman Jus',
    providerName: 'Juice Corner',
    rating: 4.6,
    price: 6000,
    originalPrice: 12000,
    distance: 2.4,
    time: '17:00-20:00',
    badge: 'Pickup hari ini',
    category: 'MINUMAN',
  }
];

export default function ExplorePage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedDistance, setSelectedDistance] = useState('all');
  const [sortBy, setSortBy] = useState('Terdekat');
  const [filteredFoods, setFilteredFoods] = useState(demoFoods);

  useEffect(() => {
    let result = demoFoods;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(f => 
        f.foodName.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.providerName.toLowerCase().includes(q)
      );
    }

    if (selectedPrice !== 'all') {
      if (selectedPrice === 'free') {
        result = result.filter(f => f.price === 0);
      } else if (selectedPrice === 'under-10') {
        result = result.filter(f => (f.price || 0) > 0 && (f.price || 0) < 10000);
      } else if (selectedPrice === '10-25') {
        result = result.filter(f => (f.price || 0) >= 10000 && (f.price || 0) <= 25000);
      } else if (selectedPrice === 'over-25') {
        result = result.filter(f => (f.price || 0) > 25000);
      }
    }

    if (selectedDistance !== 'all') {
      const maxDist = parseFloat(selectedDistance);
      result = result.filter(f => f.distance <= maxDist);
    }

    const sorted = [...result];
    if (sortBy === 'Terdekat') {
      sorted.sort((a, b) => a.distance - b.distance);
    } else if (sortBy === 'Harga terendah') {
      sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    }

    setFilteredFoods(sorted);
  }, [searchQuery, selectedPrice, selectedDistance, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedPrice('all');
    setSelectedDistance('all');
    setSortBy('Terdekat');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] font-sans">
      <Navbar user={session?.user} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#1B3A5C]">Jelajahi Makanan</h1>
          <p className="text-slate-500 mt-2">Makanan surplus di sekitar Surabaya yang dapat Anda selamatkan.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64 shrink-0 space-y-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-fit">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="font-extrabold text-[#1B3A5C]">Filter</h3>
              <button 
                onClick={clearFilters} 
                className="text-xs font-bold text-[#D4A843] hover:text-[#b88f35]"
              >
                Reset
              </button>
            </div>

            <div className="space-y-3">
              <b className="text-sm text-slate-800">Harga</b>
              <div className="space-y-2">
                {[
                  { id: 'all', label: 'Semua' },
                  { id: 'free', label: 'Gratis' },
                  { id: 'under-10', label: '< Rp10.000' },
                  { id: '10-25', label: 'Rp10.000–25.000' },
                  { id: 'over-25', label: '> Rp25.000' },
                ].map((opt) => (
                  <label key={opt.id} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-[#1B3A5C]">
                    <input 
                      type="radio" 
                      name="price" 
                      checked={selectedPrice === opt.id} 
                      onChange={() => setSelectedPrice(opt.id)} 
                      className="accent-[#1B3A5C]"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100">
              <b className="text-sm text-slate-800">Jarak Maksimal</b>
              <div className="space-y-2">
                {[
                  { id: 'all', label: 'Semua Jarak' },
                  { id: '1.5', label: '< 1.5 km' },
                  { id: '3.0', label: '< 3 km' },
                  { id: '5.0', label: '< 5 km' },
                ].map((opt) => (
                  <label key={opt.id} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-[#1B3A5C]">
                    <input 
                      type="radio" 
                      name="distance" 
                      checked={selectedDistance === opt.id} 
                      onChange={() => setSelectedDistance(opt.id)} 
                      className="accent-[#1B3A5C]"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Search Result Listing Grid */}
          <section className="flex-1 space-y-6 min-w-0">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Cari makanan, provider, kategori..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border-slate-200"
                />
              </div>
              <select 
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#D4A843]"
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="Terdekat">Terdekat</option>
                <option value="Harga terendah">Harga terendah</option>
              </select>
            </div>

            {filteredFoods.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                <span className="text-5xl block mb-4">🔍</span>
                <h3 className="text-xl font-bold text-[#1B3A5C]">Makanan Tidak Ditemukan</h3>
                <p className="text-slate-500 mt-2">Coba cari dengan kata kunci lain atau reset filter Anda.</p>
                <Button onClick={clearFilters} variant="outline" className="mt-6 border-[#1B3A5C] text-[#1B3A5C]">
                  Reset Semua Pencarian
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6">
                {filteredFoods.map((item) => (
                  <div key={item.id} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
                    {/* Image Placeholder */}
                    <div className="w-full aspect-[4/3] bg-[#F1F5F9] rounded-2xl flex flex-col items-center justify-center relative mb-4">
                      <span className="absolute top-3 left-3 bg-[#FFF9E6] text-[#D4A843] text-[10px] font-extrabold px-3 py-1 rounded-full border border-[#D4A843]/20">
                        {item.badge}
                      </span>
                      <span className="text-slate-400 font-black tracking-widest uppercase text-sm">
                        FOOD
                      </span>
                    </div>
                    
                    {/* Details */}
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-slate-800 text-lg">{item.foodName}</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {item.providerName} • <span className="text-[#D4A843]">★</span> {item.rating}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`font-black text-xl ${item.price === 0 ? 'text-[#1B3A5C]' : 'text-[#1B3A5C]'}`}>
                          {item.price === 0 ? 'Gratis' : `Rp${item.price.toLocaleString('id-ID')}`}
                        </span>
                        <span className="text-xs text-slate-400 line-through font-medium">
                          Rp{item.originalPrice.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold mt-3 pt-3 border-t border-slate-100">
                        <span className="text-red-400">📍</span> {item.distance} km • ⏰ {item.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
