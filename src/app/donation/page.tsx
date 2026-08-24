'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Footer } from '@/components/layout/Footer';

interface Organization {
  id: number;
  name: string;
  type: string;
  distance: number;
  needs: string | string[];
  progress: number;
  capacity: number;
}

const demoOrganizations: Organization[] = [
  {
    id: 1,
    name: "Panti Asuhan Kasih Ibu",
    type: "🏠 Panti",
    distance: 2.3,
    needs: ["Nasi Box", "Susu", "Roti"],
    progress: 45,
    capacity: 50
  },
  {
    id: 2,
    name: "Yayasan Peduli Anak",
    type: "🏢 Yayasan",
    distance: 4.1,
    needs: ["Sayuran Segar", "Lauk Pauk"],
    progress: 20,
    capacity: 100
  },
  {
    id: 3,
    name: "Komunitas Berbagi Rezeki",
    type: "🤝 Komunitas",
    distance: 1.5,
    needs: ["Makanan Ringan", "Air Mineral"],
    progress: 80,
    capacity: 30
  }
];

export default function DonationPage() {
  const { data: session } = useSession();
  const [organizations, setOrganizations] = useState<Organization[]>(demoOrganizations);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [alertMsg, setAlertMsg] = useState("");

  const handleRequestClick = (e: React.MouseEvent) => {
    if (!session?.user) {
      e.preventDefault();
      setAlertMsg("🔒 Anda harus masuk terlebih dahulu sebagai Yayasan/Panti Asuhan.");
      return;
    }
    if (session.user.role !== 'YAYASAN' && session.user.role !== 'RESCUE_PARTNER') {
      e.preventDefault();
      setAlertMsg("⚠️ Hanya akun Yayasan atau Panti Asuhan yang dapat mengajukan kebutuhan donasi.");
      return;
    }
  };

  const filteredOrgs = organizations.filter(org => {
    if (activeCategory === "Semua") return true;
    if (activeCategory === "🏠 Panti" && org.type.includes("Panti")) return true;
    if (activeCategory === "🏢 Yayasan" && org.type.includes("Yayasan")) return true;
    if (activeCategory === "🤝 Komunitas" && org.type.includes("Komunitas")) return true;
    if (activeCategory === "🛖 Shelter" && org.type.includes("Shelter")) return true;
    return false;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] font-sans">
      <Navbar user={session?.user} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-[#1B3A5C]">Peluang Donasi</h1>
            <p className="text-slate-500 mt-2">Bantu makanan sampai kepada mereka yang membutuhkan.</p>
          </div>
          <Link href="/dashboard/yayasan/claims" onClick={handleRequestClick}>
            <Button className="bg-[#D4A843] hover:bg-[#b88f35] text-[#1B3A5C] font-extrabold shadow-sm rounded-xl px-6 py-3">
              🤝 Saya Butuh Donasi
            </Button>
          </Link>
        </div>

        {alertMsg && (
          <div className="bg-[#FFF9E6] border-l-4 border-[#D4A843] p-4 text-[#8C6D1F] rounded-lg mb-6 flex justify-between items-center text-sm font-bold shadow-sm">
            <span>{alertMsg}</span>
            <button onClick={() => setAlertMsg("")} className="text-[#8C6D1F] hover:text-[#5e4915] text-lg font-bold p-1">
              ×
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mb-8">
          {["Semua", "🏠 Panti", "🏢 Yayasan", "🤝 Komunitas", "🛖 Shelter"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                activeCategory === cat
                  ? 'bg-[#1B3A5C] text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredOrgs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <p className="text-slate-500 font-medium">Tidak ada lembaga sosial yang cocok dengan kategori ini.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {filteredOrgs.map((o) => (
                <div key={o.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:bg-slate-50 transition-colors">
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex items-center gap-3">
                      <b className="text-lg font-extrabold text-slate-800">{o.name}</b>
                      <span className="text-[10px] font-extrabold bg-[#F0F4F8] text-[#1B3A5C] px-3 py-1 rounded-full border border-slate-200">
                        {o.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      📍 {o.distance.toFixed(1)} km
                    </p>
                    <p className="text-sm text-slate-600">
                      Membutuhkan: <span className="font-semibold">{Array.isArray(o.needs) ? o.needs.join(", ") : o.needs}</span>
                    </p>
                    <div className="pt-2 max-w-sm">
                      <div className="w-full bg-slate-100 rounded-full h-2.5 mb-1.5 overflow-hidden">
                        <div className="bg-[#D4A843] h-2.5 rounded-full" style={{ width: `${o.progress}%` }}></div>
                      </div>
                      <small className="text-xs font-semibold text-slate-500">
                        Kebutuhan terpenuhi {o.progress}%
                      </small>
                    </div>
                  </div>
                  
                  <div className="shrink-0">
                    <Link href={`/dashboard/provider/add-surplus?partner=${o.id}`}>
                      <Button variant="outline" className="border-[#1B3A5C] text-[#1B3A5C] hover:bg-[#1B3A5C] hover:text-white font-bold rounded-xl">
                        Donasikan
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
